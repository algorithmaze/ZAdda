"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, signOut, createUserWithEmailAndPassword, signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup, User as FirebaseUser, updateProfile } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import type { User } from '@/types';

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

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const createUserDocument = async (firebaseUser: FirebaseUser, name?: string) => {
    const userRef = doc(db, 'users', firebaseUser.uid);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      const { uid, email, photoURL } = firebaseUser;
      const displayName = name || firebaseUser.displayName || 'New User';
      
      try {
        await setDoc(userRef, {
          id: uid,
          name: displayName,
          email,
          avatar: photoURL || `https://placehold.co/100x100.png`,
          online: false,
        });
        
        // Also update the auth profile if a new name was provided during signup
        if (name) {
          await updateProfile(firebaseUser, { displayName: name });
        }

      } catch (error) {
        console.error("Error creating user document: ", error);
      }
    }
  };

  const login = (email: string, pass: string) => {
    return signInWithEmailAndPassword(auth, email, pass);
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
    return signOut(auth);
  };

  const value = {
    user,
    loading,
    login,
    signup,
    logout,
    loginWithGoogle,
  };

  return <AuthContext.Provider value={value}>{!loading && children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
