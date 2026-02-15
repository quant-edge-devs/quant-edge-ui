import { createContext, useContext, useEffect, useState } from 'react';
import {
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged,
} from 'firebase/auth';
import type { User, UserCredential } from 'firebase/auth';
import { auth } from '../firebase';

type AuthContextType = {
  currentUser: User | null;
  signup: (email: string, password: string) => Promise<UserCredential>;
  login: (email: string, password: string) => Promise<UserCredential>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  loginWithGoogle: () => Promise<UserCredential>;
  signOut: () => Promise<void>; // Add signOut to context
};
const initialState: AuthContextType = {
  currentUser: null,
  signup: async () => {
    throw new Error('signup function not initialized');
  },
  login: async () => {
    throw new Error('login function not initialized');
  },
  logout: async () => {
    throw new Error('logout function not initialized');
  },
  resetPassword: async () => {
    throw new Error('resetPassword function not initialized');
  },
  loginWithGoogle: async () => {
    throw new Error('loginWithGoogle function not initialized');
  },
  signOut: async () => {
    throw new Error('signOut function not initialized');
  },
};

const AuthContext = createContext(initialState);

export const useAuth = () => useContext(AuthContext);

type AuthProviderProps = {
  children: React.ReactNode;
};

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const signup = (email: string, password: string) =>
    createUserWithEmailAndPassword(auth, email, password);

  const login = (email: string, password: string) =>
    signInWithEmailAndPassword(auth, email, password);

  const logout = () => signOut(auth);
  const signOutFunc = logout; // Alias for signOut

  const resetPassword = (email: string) => sendPasswordResetEmail(auth, email);

  const loginWithGoogle = () => {
    const provider = new GoogleAuthProvider();
    return signInWithPopup(auth, provider);
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setLoading(false);
      setCurrentUser(user);
    });
    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    signup,
    login,
    logout,
    resetPassword,
    loginWithGoogle,
    signOut: signOutFunc, // Add signOut to context value
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
