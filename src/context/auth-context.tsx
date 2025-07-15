
"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  onAuthStateChanged, 
  signOut, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  GoogleAuthProvider, 
  signInWithPopup, 
  User as FirebaseUser, 
  updateProfile,
  setPersistence,
  browserSessionPersistence
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp, updateDoc } from 'firebase/firestore';
import { auth, db, rtdb } from '@/lib/firebase';
import { ref, set, onValue, serverTimestamp as rtdbServerTimestamp, onDisconnect } from 'firebase/database';
import { useRouter } from 'next/navigation';

interface AuthContextType {
  user: FirebaseUser | null;
  loading: boolean;
  login: (email: string, pass: string) => Promise<any>;
  signup: (email: string, pass: string, name: string) => Promise<any>;
  logout: () => Promise<void>;
  loginWithGoogle: () => Promise<any>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // We want auth state to persist across sessions.
    // If you want to log out on browser close, use browserSessionPersistence.
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      if (user) {
        setupPresence(user.uid);
      }
      setLoading(false);
    });
    
    return () => unsubscribe();
  }, []);

  const setupPresence = (uid: string) => {
    const userStatusDatabaseRef = ref(rtdb, '/status/' + uid);
    const userStatusFirestoreRef = doc(db, '/users/' + uid);

    const isOfflineForRTDB = {
        state: 'offline',
        last_changed: rtdbServerTimestamp(),
    };

    const isOnlineForRTDB = {
        state: 'online',
        last_changed: rtdbServerTimestamp(),
    };
    
    const isOfflineForFirestore = {
        online: false,
        lastSeen: serverTimestamp(),
    };

    const isOnlineForFirestore = {
        online: true,
        lastSeen: serverTimestamp(),
    };

    const connectedRef = ref(rtdb, '.info/connected');
    onValue(connectedRef, (snap) => {
        if (snap.val() === true) {
            const disconnectRef = onDisconnect(userStatusDatabaseRef);
            disconnectRef.set(isOfflineForRTDB).then(() => {
                 updateDoc(userStatusFirestoreRef, isOfflineForFirestore).catch(() => {});
            });
            
            set(userStatusDatabaseRef, isOnlineForRTDB);
            updateDoc(userStatusFirestoreRef, isOnlineForFirestore);
        }
    });
  }


  const createUserDocument = async (firebaseUser: FirebaseUser, name?: string) => {
    const userRef = doc(db, 'users', firebaseUser.uid);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      const { uid, email, photoURL } = firebaseUser;
      const displayName = name || firebaseUser.displayName || 'New User';
      
      try {
        if (name && firebaseUser.displayName !== name) {
          await updateProfile(firebaseUser, { displayName: name });
        }
        
        await setDoc(userRef, {
          id: uid,
          name: displayName,
          email,
          avatar: photoURL || `https://placehold.co/100x100.png`,
          online: true,
          lastSeen: serverTimestamp(),
        });
        
        // This is a new user, so reload the user object to get the new profile info
        await firebaseUser.reload();
        setUser(auth.currentUser);

      } catch (error) {
        console.error("Error creating user document: ", error);
        throw error;
      }
    } else {
        // If user document exists, just update their online status
        await updateDoc(userRef, { online: true, lastSeen: serverTimestamp() });
    }
    return userRef;
  };

  const login = (email: string, pass: string) => {
    return signInWithEmailAndPassword(auth, email, pass).then(async (userCredential) => {
        if (userCredential.user) {
            await createUserDocument(userCredential.user);
        }
        return userCredential;
    });
  };

  const signup = async (email: string, pass: string, name: string) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
    if(userCredential.user) {
        await createUserDocument(userCredential.user, name);
    }
    return userCredential;
  };

  const loginWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    if(result.user) {
        await createUserDocument(result.user);
    }
    return result;
  };

  const logout = () => {
     if(user) {
        const userStatusFirestoreRef = doc(db, '/users/' + user.uid);
        updateDoc(userStatusFirestoreRef, { online: false, lastSeen: serverTimestamp() });
        const userStatusDatabaseRef = ref(rtdb, '/status/' + user.uid);
        set(userStatusDatabaseRef, { state: 'offline', last_changed: rtdbServerTimestamp() });
     }
    return signOut(auth).then(() => {
        router.push('/');
    });
  };

  const value = {
    user,
    loading,
    login,
    signup,
    logout,
    loginWithGoogle,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
