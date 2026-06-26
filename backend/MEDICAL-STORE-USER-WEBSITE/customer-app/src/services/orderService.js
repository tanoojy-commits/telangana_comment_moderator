import { isFirebaseConfigured, db } from './firebase';
import { 
  collection, doc, getDoc, getDocs, setDoc, updateDoc, deleteDoc, query, where, addDoc 
} from 'firebase/firestore';

const MOCK_ORDERS_KEY = 'medstore_mock_orders';
const MOCK_ADDRESSES_KEY = 'medstore_mock_addresses';

const delay = (ms = 500) => new Promise(resolve => setTimeout(resolve, ms));

// Status sequence for simulation:
// placed -> processing -> packed -> shipped -> out_for_delivery -> delivered
const STATUSES = ['placed', 'processing', 'packed', 'shipped', 'out_for_delivery', 'delivered'];

// Update mock order statuses based on the time elapsed since placement (e.g. 30 seconds per stage for demonstration)
const updateMockOrderStatuses = (orders) => {
  const now = new Date().getTime();
  return orders.map(order => {
    if (order.status === 'delivered') return order;
    
    const placedTime = new Date(order.createdAt).getTime();
    const elapsedSeconds = Math.floor((now - placedTime) / 1000);
    const stageIndex = Math.min(Math.floor(elapsedSeconds / 30), STATUSES.length - 1); // 30s per stage
    const currentStatus = STATUSES[stageIndex];
    
    if (order.status !== currentStatus) {
      return { ...order, status: currentStatus };
    }
    return order;
  });
};

export const orderService = {
  // --- ORDERS API ---
  placeOrder: async (userId, items, amount, paymentMethod, shippingAddress) => {
    await delay(800);
    const orderData = {
      userId,
      items,
      amount,
      paymentMethod,
      shippingAddress,
      status: 'placed',
      createdAt: new Date().toISOString(),
    };

    if (isFirebaseConfigured) {
      const orderRef = doc(collection(db, 'orders'));
      const orderId = orderRef.id;
      const fullOrder = { orderId, ...orderData };
      await setDoc(orderRef, fullOrder);
      return fullOrder;
    } else {
      const orders = JSON.parse(localStorage.getItem(MOCK_ORDERS_KEY) || '[]');
      const orderId = 'ord_' + Math.random().toString(36).substring(2, 9);
      const fullOrder = { orderId, ...orderData };
      orders.push(fullOrder);
      localStorage.setItem(MOCK_ORDERS_KEY, JSON.stringify(orders));
      return fullOrder;
    }
  },

  getOrdersByUser: async (userId) => {
    await delay(500);
    if (isFirebaseConfigured) {
      try {
        const q = query(collection(db, 'orders'), where('userId', '==', userId));
        const querySnapshot = await getDocs(q);
        const ordersList = [];
        querySnapshot.forEach((doc) => {
          ordersList.push({ orderId: doc.id, ...doc.data() });
        });
        // Sort newest first
        return ordersList.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      } catch (err) {
        console.error('Error fetching Firestore orders:', err);
        return [];
      }
    } else {
      let orders = JSON.parse(localStorage.getItem(MOCK_ORDERS_KEY) || '[]');
      orders = orders.filter(o => o.userId === userId);
      // Simulate progress updates for mock orders
      const updatedOrders = updateMockOrderStatuses(orders);
      localStorage.setItem(MOCK_ORDERS_KEY, JSON.stringify(
        JSON.parse(localStorage.getItem(MOCK_ORDERS_KEY) || '[]').map(o => {
          const matched = updatedOrders.find(uo => uo.orderId === o.orderId);
          return matched || o;
        })
      ));
      return updatedOrders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }
  },

  getOrderById: async (orderId) => {
    await delay(400);
    if (isFirebaseConfigured) {
      const docRef = doc(db, 'orders', orderId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return { orderId: docSnap.id, ...docSnap.data() };
      }
      throw new Error('Order not found');
    } else {
      let orders = JSON.parse(localStorage.getItem(MOCK_ORDERS_KEY) || '[]');
      const updated = updateMockOrderStatuses(orders);
      localStorage.setItem(MOCK_ORDERS_KEY, JSON.stringify(updated));
      const found = updated.find(o => o.orderId === orderId);
      if (!found) throw new Error('Order not found');
      return found;
    }
  },

  // --- ADDRESSES API ---
  getAddressesByUser: async (userId) => {
    await delay(400);
    if (isFirebaseConfigured) {
      try {
        const q = query(collection(db, 'addresses'), where('userId', '==', userId));
        const querySnapshot = await getDocs(q);
        const addressesList = [];
        querySnapshot.forEach((doc) => {
          addressesList.push({ addressId: doc.id, ...doc.data() });
        });
        return addressesList;
      } catch (err) {
        console.error('Error fetching Firestore addresses:', err);
        return [];
      }
    } else {
      const addresses = JSON.parse(localStorage.getItem(MOCK_ADDRESSES_KEY) || '[]');
      return addresses.filter(a => a.userId === userId);
    }
  },

  addAddress: async (userId, addressData) => {
    await delay(500);
    const newAddress = {
      userId,
      ...addressData,
      isDefault: addressData.isDefault || false
    };

    if (isFirebaseConfigured) {
      const addressRef = doc(collection(db, 'addresses'));
      const addressId = addressRef.id;
      const fullAddress = { addressId, ...newAddress };
      
      // If we are marking this as default, reset other addresses first
      if (newAddress.isDefault) {
        await orderService.clearDefaults(userId);
      }
      await setDoc(addressRef, fullAddress);
      return fullAddress;
    } else {
      const addresses = JSON.parse(localStorage.getItem(MOCK_ADDRESSES_KEY) || '[]');
      const addressId = 'addr_' + Math.random().toString(36).substring(2, 9);
      const fullAddress = { addressId, ...newAddress };

      if (newAddress.isDefault) {
        addresses.forEach(a => {
          if (a.userId === userId) a.isDefault = false;
        });
      }
      addresses.push(fullAddress);
      localStorage.setItem(MOCK_ADDRESSES_KEY, JSON.stringify(addresses));
      return fullAddress;
    }
  },

  updateAddress: async (userId, addressId, addressData) => {
    await delay(500);
    if (isFirebaseConfigured) {
      if (addressData.isDefault) {
        await orderService.clearDefaults(userId);
      }
      const addressRef = doc(db, 'addresses', addressId);
      await updateDoc(addressRef, addressData);
      return { addressId, ...addressData };
    } else {
      const addresses = JSON.parse(localStorage.getItem(MOCK_ADDRESSES_KEY) || '[]');
      if (addressData.isDefault) {
        addresses.forEach(a => {
          if (a.userId === userId) a.isDefault = false;
        });
      }
      const updated = addresses.map(a => {
        if (a.addressId === addressId) {
          return { ...a, ...addressData };
        }
        return a;
      });
      localStorage.setItem(MOCK_ADDRESSES_KEY, JSON.stringify(updated));
      return { addressId, ...addressData };
    }
  },

  deleteAddress: async (addressId) => {
    await delay(400);
    if (isFirebaseConfigured) {
      const addressRef = doc(db, 'addresses', addressId);
      await deleteDoc(addressRef);
      return true;
    } else {
      const addresses = JSON.parse(localStorage.getItem(MOCK_ADDRESSES_KEY) || '[]');
      const filtered = addresses.filter(a => a.addressId !== addressId);
      localStorage.setItem(MOCK_ADDRESSES_KEY, JSON.stringify(filtered));
      return true;
    }
  },

  setDefaultAddress: async (userId, addressId) => {
    await delay(400);
    if (isFirebaseConfigured) {
      await orderService.clearDefaults(userId);
      const addressRef = doc(db, 'addresses', addressId);
      await updateDoc(addressRef, { isDefault: true });
      return true;
    } else {
      const addresses = JSON.parse(localStorage.getItem(MOCK_ADDRESSES_KEY) || '[]');
      addresses.forEach(a => {
        if (a.userId === userId) {
          a.isDefault = (a.addressId === addressId);
        }
      });
      localStorage.setItem(MOCK_ADDRESSES_KEY, JSON.stringify(addresses));
      return true;
    }
  },

  // Helper function to reset isDefault flag on all addresses for a user
  clearDefaults: async (userId) => {
    if (isFirebaseConfigured) {
      const q = query(collection(db, 'addresses'), where('userId', '==', userId), where('isDefault', '==', true));
      const querySnapshot = await getDocs(q);
      const promises = [];
      querySnapshot.forEach((docSnap) => {
        promises.push(updateDoc(doc(db, 'addresses', docSnap.id), { isDefault: false }));
      });
      await Promise.all(promises);
    }
  }
};
