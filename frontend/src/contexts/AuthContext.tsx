import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';

// This is the correct, complete definition of our User
interface User {
  _id: string;
  mallId: string;
  token: string;
  imageUrl?: string;
  mallName?: string;
  brandName?: string;
  location?: string;
  email?: string;
  mobileNumber?: string;
}

interface AuthContextType {
  user: User | null;
  login: (userData: User) => void;
  logout: () => void;
  isLoading: boolean; // The 'patient guard' needs this
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true); // Start as true

  // --- THIS IS THE FINAL, GUARANTEED FIX ---
  // This useEffect hook runs ONCE when the app first starts.
  // This is the "clock-in machine" that checks your ID from localStorage.
  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('smartcartUser');
      if (storedUser) {
        // If we find a user, set them as the logged-in user
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error("Failed to parse user from localStorage", error);
      // If storage is corrupt, clear it
      localStorage.removeItem('smartcartUser');
    } finally {
      // CRITICAL: We only set isLoading to false AFTER we have
      // finished checking localStorage.
      setIsLoading(false);
    }
  }, []); // The empty array [] means "run this only once on startup"
  // --- END OF THE FIX ---

  const login = (userData: User) => {
    setUser(userData);
    localStorage.setItem('smartcartUser', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('smartcartUser');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook for easy access to the context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};