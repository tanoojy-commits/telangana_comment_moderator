import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { orderService } from '../services/orderService';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { MapPin, Phone, Edit3, Trash2, Plus, X, Check, ShieldAlert } from 'lucide-react';

export const Addresses = () => {
  const { currentUser } = useAuth();
  
  // Data States
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal States
  const [modalOpen, setModalOpen] = useState(false);
  const [editAddressId, setEditAddressId] = useState(null); // null = adding, string = editing

  // Form Fields
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [stateName, setStateName] = useState('');
  const [pincode, setPincode] = useState('');
  const [isDefault, setIsDefault] = useState(false);
  
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState('');

  // Load addresses on mount
  useEffect(() => {
    loadAddresses();
  }, [currentUser]);

  const loadAddresses = async () => {
    if (!currentUser) return;
    setLoading(true);
    try {
      const list = await orderService.getAddressesByUser(currentUser.uid);
      setAddresses(list);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const openAddModal = () => {
    setEditAddressId(null);
    setName('');
    setPhone('');
    setAddress('');
    setCity('');
    setStateName('');
    setPincode('');
    setIsDefault(false);
    setFormError('');
    setModalOpen(true);
  };

  const openEditModal = (addr) => {
    setEditAddressId(addr.addressId);
    setName(addr.name);
    setPhone(addr.phone);
    setAddress(addr.address);
    setCity(addr.city);
    setStateName(addr.state);
    setPincode(addr.pincode);
    setIsDefault(addr.isDefault);
    setFormError('');
    setModalOpen(true);
  };

  const handleDelete = async (addressId) => {
    if (window.confirm('Are you sure you want to delete this address?')) {
      try {
        await orderService.deleteAddress(addressId);
        setAddresses(prev => prev.filter(a => a.addressId !== addressId));
      } catch (err) {
        console.error(err);
        alert('Could not delete address.');
      }
    }
  };

  const handleSetDefault = async (addressId) => {
    try {
      await orderService.setDefaultAddress(currentUser.uid, addressId);
      setAddresses(prev => prev.map(a => ({
        ...a,
        isDefault: a.addressId === addressId
      })));
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!name || !phone || !address || !city || !stateName || !pincode) {
      setFormError('Please fill in all fields.');
      return;
    }

    if (!/^\d{10}$/.test(phone)) {
      setFormError('Mobile number must be exactly 10 digits.');
      return;
    }

    if (!/^\d{6}$/.test(pincode)) {
      setFormError('Pincode must be exactly 6 digits.');
      return;
    }

    setFormLoading(true);
    try {
      const addressData = {
        name,
        phone,
        address,
        city,
        state: stateName,
        pincode,
        isDefault
      };

      if (editAddressId) {
        // Edit Mode
        const updated = await orderService.updateAddress(currentUser.uid, editAddressId, addressData);
        setAddresses(prev => prev.map(a => {
          if (a.addressId === editAddressId) {
            return updated;
          }
          // If we set this one to default, toggle off other default flags locally
          if (isDefault) {
            return { ...a, isDefault: false };
          }
          return a;
        }));
      } else {
        // Add Mode
        const added = await orderService.addAddress(currentUser.uid, addressData);
        setAddresses(prev => {
          // If we set this one to default, toggle off other default flags locally
          if (isDefault) {
            return [...prev.map(a => ({ ...a, isDefault: false })), added];
          }
          return [...prev, added];
        });
      }

      setModalOpen(false);
    } catch (err) {
      setFormError('Error saving address details.');
    } finally {
      setFormLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-8 page-fade-in">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-5">
        <div>
          <h2 className="text-2xl font-black text-slate-805 dark:text-white">Delivery Addresses</h2>
          <p className="text-xs text-slate-400 dark:text-slate-500 font-semibold mt-1">Manage shipping targets and set default markers</p>
        </div>
        <button
          onClick={openAddModal}
          className="flex items-center justify-center gap-1.5 py-2.5 px-5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white text-xs font-bold transition-all shadow shadow-primary-500/10 self-start sm:self-auto hover:scale-102"
        >
          <Plus size={16} />
          Add New Address
        </button>
      </div>

      {/* Cards list */}
      {addresses.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {addresses.map(addr => (
            <div 
              key={addr.addressId}
              className={`bg-white dark:bg-slate-800 border rounded-3xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between relative ${
                addr.isDefault 
                  ? 'border-primary-650 ring-2 ring-primary-100 dark:ring-primary-950/20 border-primary-600' 
                  : 'border-slate-150 dark:border-slate-700/60'
              }`}
            >
              <div className="text-xs space-y-2">
                <div className="flex items-center justify-between gap-4">
                  <span className="font-extrabold text-slate-800 dark:text-slate-100 text-sm truncate">{addr.name}</span>
                  {addr.isDefault ? (
                    <span className="bg-primary-100 text-primary-700 dark:bg-primary-950 dark:text-primary-400 text-[9px] font-bold px-2 py-0.5 rounded-full flex items-center gap-0.5">
                      <Check size={10} className="stroke-[3]" /> Default
                    </span>
                  ) : (
                    <button
                      onClick={() => handleSetDefault(addr.addressId)}
                      className="text-[9px] text-slate-400 hover:text-primary-600 font-bold border border-slate-200 dark:border-slate-700 px-2 py-0.5 rounded-full hover:bg-slate-50 transition-colors"
                    >
                      Set Default
                    </button>
                  )}
                </div>

                <p className="text-slate-600 dark:text-slate-350 leading-relaxed pr-8">{addr.address}</p>
                <p className="text-slate-600 dark:text-slate-350">{addr.city}, {addr.state} - <strong className="font-extrabold">{addr.pincode}</strong></p>
                
                <div className="flex items-center gap-1.5 text-slate-400 font-semibold pt-1 border-t border-slate-50 dark:border-slate-700/50 mt-3">
                  <Phone size={13} />
                  <span>{addr.phone}</span>
                </div>
              </div>

              {/* Editing and deleting operations */}
              <div className="flex gap-2.5 pt-4 mt-4 border-t border-slate-50 dark:border-slate-700/50 justify-end">
                <button
                  onClick={() => openEditModal(addr)}
                  className="flex items-center gap-1 text-slate-400 hover:text-primary-600 text-xs font-bold transition-colors py-1 px-2.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-900"
                >
                  <Edit3 size={13} />
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(addr.addressId)}
                  className="flex items-center gap-1 text-slate-400 hover:text-red-505 text-red-550 text-xs font-bold transition-colors py-1 px-2.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/20"
                >
                  <Trash2 size={13} />
                  Delete
                </button>
              </div>

            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700/60 p-12 text-center text-slate-450 space-y-4">
          <span className="text-4xl">📍</span>
          <h3 className="font-bold text-slate-800 dark:text-slate-205 text-base">No shipping addresses saved</h3>
          <p className="text-xs text-slate-400 dark:text-slate-500 max-w-sm mx-auto">Please add a shipping address. This will allow fast checkout checkout processes for later purchases.</p>
          <button 
            onClick={openAddModal}
            className="mt-2 bg-primary-600 hover:bg-primary-700 text-white font-bold text-xs px-5 py-2.5 rounded-full shadow"
          >
            Create First Address
          </button>
        </div>
      )}

      {/* CREATE / EDIT DIALOG FORM MODAL */}
      {modalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 dark:bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white dark:bg-slate-850 border border-slate-100 dark:border-slate-700 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-5">
            
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-3">
              <h3 className="text-lg font-black text-slate-900 dark:text-white">
                {editAddressId ? 'Edit Delivery Address' : 'Create Shipping Profile'}
              </h3>
              <button 
                onClick={() => setModalOpen(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-650"
              >
                <X size={18} />
              </button>
            </div>

            {formError && (
              <div className="bg-red-50 dark:bg-red-950/20 text-red-650 text-xs p-2.5 rounded-xl border border-red-200 font-medium flex items-center gap-1.5">
                <ShieldAlert size={14} className="shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Recipient Name</label>
                  <input
                    type="text"
                    required
                    placeholder="John Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-1 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Contact Phone</label>
                  <input
                    type="tel"
                    required
                    placeholder="10 digit mobile"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-1 focus:ring-primary-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Street Address</label>
                <input
                  type="text"
                  required
                  placeholder="Apartment, House number, Lane address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-1 focus:ring-primary-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">City</label>
                  <input
                    type="text"
                    required
                    placeholder="City"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-1 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">State</label>
                  <input
                    type="text"
                    required
                    placeholder="State"
                    value={stateName}
                    onChange={(e) => setStateName(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-1 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Pincode</label>
                  <input
                    type="text"
                    required
                    placeholder="6 digit"
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-1 focus:ring-primary-500"
                  />
                </div>
              </div>

              <label className="flex items-center gap-2 pt-1 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={isDefault}
                  onChange={(e) => setIsDefault(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500 bg-slate-50 dark:bg-slate-900"
                />
                <span className="font-semibold text-slate-500 dark:text-slate-450">Set as default delivery address</span>
              </label>

              <div className="flex gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-750">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-650 text-slate-700 dark:text-slate-250 font-bold transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formLoading}
                  className="flex-1 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-750 text-white font-bold transition-all shadow"
                >
                  {formLoading ? 'Saving...' : 'Save Address'}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
};

export default Addresses;
