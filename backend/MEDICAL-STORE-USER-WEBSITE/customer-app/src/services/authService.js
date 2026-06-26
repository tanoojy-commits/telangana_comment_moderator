import { isFirebaseConfigured, auth, db } from './firebase';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut as fbSignOut, 
  sendPasswordResetEmail, 
  updatePassword,
  sendEmailVerification
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';

const MOCK_USERS_KEY = 'medstore_mock_users';
const CURRENT_USER_KEY = 'medstore_mock_current_user';

// Mock subscribers list for onAuthStateChanged
let mockAuthSubscribers = [];
const triggerMockAuthChange = (user) => {
  mockAuthSubscribers.forEach(cb => cb(user));
};

const delay = (ms = 600) => new Promise(resolve => setTimeout(resolve, ms));

export const authService = {
  // Subscribe to auth state changes
  onAuthStateChange: (callback) => {
    if (isFirebaseConfigured) {
      return auth.onAuthStateChanged(async (user) => {
        if (user) {
          // Fetch additional profile fields from Firestore
          try {
            const userDoc = await getDoc(doc(db, 'users', user.uid));
            if (userDoc.exists()) {
              callback({ ...user, ...userDoc.data() });
            } else {
              callback(user);
            }
          } catch (err) {
            console.error('Error fetching user profile:', err);
            callback(user);
          }
        } else {
          callback(null);
        }
      });
    } else {
      mockAuthSubscribers.push(callback);
      // Immediately call with current mock user
      const currentUser = JSON.parse(localStorage.getItem(CURRENT_USER_KEY) || 'null');
      callback(currentUser);
      return () => {
        mockAuthSubscribers = mockAuthSubscribers.filter(cb => cb !== callback);
      };
    }
  },

  signUp: async (email, password, name, phone) => {
    await delay(800);
    if (isFirebaseConfigured) {
      // 1. Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Send verification email
      try {
        await sendEmailVerification(user);
      } catch (err) {
        console.warn('Could not send email verification', err);
      }

      // 2. Save additional fields to users collection in Firestore
      const userProfile = {
        uid: user.uid,
        name,
        phone,
        email,
        createdAt: new Date().toISOString(),
      };
      await setDoc(doc(db, 'users', user.uid), userProfile);
      return { ...user, ...userProfile };
    } else {
      // Mock SignUp
      const users = JSON.parse(localStorage.getItem(MOCK_USERS_KEY) || '[]');
      if (users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
        throw new Error('Email already exists');
      }

      const newMockUser = {
        uid: 'mock_uid_' + Math.random().toString(36).substring(2, 9),
        name,
        phone,
        email,
        emailVerified: true, // Auto-verified for mockup convenience
        createdAt: new Date().toISOString(),
      };
      
      users.push({ ...newMockUser, password }); // In mock, store password in plain text for login check
      localStorage.setItem(MOCK_USERS_KEY, JSON.stringify(users));
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(newMockUser));
      triggerMockAuthChange(newMockUser);
      return newMockUser;
    }
  },

  signIn: async (email, password, rememberMe = false) => {
    await delay(600);
    if (isFirebaseConfigured) {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Fetch Firestore profile
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      const profile = userDoc.exists() ? userDoc.data() : {};
      
      return { ...user, ...profile };
    } else {
      const users = JSON.parse(localStorage.getItem(MOCK_USERS_KEY) || '[]');
      const user = users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
      if (!user) {
        throw new Error('Invalid email or password');
      }
      
      const { password: _, ...userWithoutPassword } = user;
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(userWithoutPassword));
      triggerMockAuthChange(userWithoutPassword);
      return userWithoutPassword;
    }
  },

  signOut: async () => {
    await delay(400);
    if (isFirebaseConfigured) {
      await fbSignOut(auth);
    } else {
      localStorage.removeItem(CURRENT_USER_KEY);
      triggerMockAuthChange(null);
    }
  },

  resetPassword: async (email) => {
    await delay(500);
    if (isFirebaseConfigured) {
      await sendPasswordResetEmail(auth, email);
    } else {
      const users = JSON.parse(localStorage.getItem(MOCK_USERS_KEY) || '[]');
      const exists = users.some(u => u.email.toLowerCase() === email.toLowerCase());
      if (!exists) {
        throw new Error('No account found with this email address');
      }
      // Mock successful reset trigger
      return true;
    }
  },

  updateProfile: async (uid, name, phone) => {
    await delay(600);
    if (isFirebaseConfigured) {
      const userRef = doc(db, 'users', uid);
      await updateDoc(userRef, { name, phone });
      return { name, phone };
    } else {
      // Mock Update
      const users = JSON.parse(localStorage.getItem(MOCK_USERS_KEY) || '[]');
      const updatedUsers = users.map(u => {
        if (u.uid === uid) {
          return { ...u, name, phone };
        }
        return u;
      });
      localStorage.setItem(MOCK_USERS_KEY, JSON.stringify(updatedUsers));
      
      const currentUser = JSON.parse(localStorage.getItem(CURRENT_USER_KEY) || 'null');
      if (currentUser && currentUser.uid === uid) {
        const updatedCurrentUser = { ...currentUser, name, phone };
        localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(updatedCurrentUser));
        triggerMockAuthChange(updatedCurrentUser);
      }
      return { name, phone };
    }
  },

  changePassword: async (newPassword) => {
    await delay(600);
    if (isFirebaseConfigured) {
      const currentUser = auth.currentUser;
      if (!currentUser) throw new Error('No authenticated user found');
      await updatePassword(currentUser, newPassword);
    } else {
      // Mock Password Change
      const currentUser = JSON.parse(localStorage.getItem(CURRENT_USER_KEY) || 'null');
      if (!currentUser) throw new Error('No authenticated user found');
      
      const users = JSON.parse(localStorage.getItem(MOCK_USERS_KEY) || '[]');
      const updatedUsers = users.map(u => {
        if (u.uid === currentUser.uid) {
          return { ...u, password: newPassword };
        }
        return u;
      });
      localStorage.setItem(MOCK_USERS_KEY, JSON.stringify(updatedUsers));
    }
    return true;
  }
};
