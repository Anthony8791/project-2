import { useState, useEffect } from 'react';
import { User, onAuthStateChanged, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebase';

interface AuthUser extends User {
  role?: string;
  isAdmin?: boolean;
  isSuperAdmin?: boolean;
}

// Add your Firebase UID here to get admin access
const ADMIN_UIDS = [
  'VCntHsLFKCYpIOxPThnTwYYiwDB3', // Replace with your actual Firebase UID
  // Add more admin UIDs as needed
];

export const useAuth = () => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          // Check if user is admin by UID
          const isAdminByUID = ADMIN_UIDS.includes(firebaseUser.uid);
          const isSuperAdmin = firebaseUser.uid === ADMIN_UIDS[0]; // First UID is super admin
          
          // Get user role from Firestore
          let userData = null;
          try {
            const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
            userData = userDoc.data();
          } catch (firestoreError) {
            console.log('Firestore access failed, using UID-based auth');
          }
          
          const authUser: AuthUser = {
            ...firebaseUser,
            role: userData?.role || (isAdminByUID ? 'admin' : 'user'),
            isAdmin: userData?.role === 'admin' || isAdminByUID,
            isSuperAdmin: userData?.role === 'super_admin' || isSuperAdmin
          };
          
          setUser(authUser);
        } catch (error) {
          console.error('Error fetching user data:', error);
          // Fallback: check if user is admin by UID even if Firestore fails
          const isAdminByUID = ADMIN_UIDS.includes(firebaseUser.uid);
          const isSuperAdmin = firebaseUser.uid === ADMIN_UIDS[0];
          
          setUser({
            ...firebaseUser,
            role: isAdminByUID ? 'admin' : 'user',
            isAdmin: isAdminByUID,
            isSuperAdmin: isSuperAdmin
          } as AuthUser);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const login = async (email: string, password: string) => {
    return signInWithEmailAndPassword(auth, email, password);
  };

  const logout = async () => {
    return signOut(auth);
  };

  return {
    user,
    loading,
    login,
    logout
  };
};
