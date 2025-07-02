
import React, { createContext, useContext, useEffect, useState } from 'react';
import { apiClient } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
}

interface AuthContextType {
  user: User | null;
  session: any | null;
  signUp: (email: string, password: string, firstName?: string, lastName?: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  loading: boolean;
  subscriptionStatus: {
    subscribed: boolean;
    subscription_tier: string | null;
    subscription_end: string | null;
  } | null;
  checkSubscription: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [subscriptionStatus, setSubscriptionStatus] = useState<{
    subscribed: boolean;
    subscription_tier: string | null;
    subscription_end: string | null;
  } | null>(null);
  const { toast } = useToast();

  const checkSubscription = async () => {
    if (!user) return;
    
    try {
      const data = await apiClient.checkSubscription();
      setSubscriptionStatus(data);
    } catch (error) {
      console.error('Error checking subscription:', error);
    }
  };

  useEffect(() => {
    const checkCurrentUser = async () => {
      try {
        const userData = await apiClient.getCurrentUser();
        if (userData) {
          setUser(userData);
          setSession({ user: userData });
          await checkSubscription();
        }
      } catch (error) {
        console.error('Error checking current user:', error);
      } finally {
        setLoading(false);
      }
    };

    checkCurrentUser();
  }, []);

  const signUp = async (email: string, password: string, firstName?: string, lastName?: string) => {
    try {
      await apiClient.signUp(email, password, firstName, lastName);
      
      toast({
        title: "Account created successfully!",
        description: "Please check your email to verify your account.",
      });
      
      return { error: null };
    } catch (error: any) {
      return { error: { message: error.message } };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const data = await apiClient.signIn(email, password);
      setUser(data.user);
      setSession({ user: data.user });
      
      toast({
        title: "Welcome back!",
        description: "You have successfully signed in.",
      });
      
      await checkSubscription();
      return { error: null };
    } catch (error: any) {
      return { error: { message: error.message } };
    }
  };

  const signOut = async () => {
    try {
      await apiClient.signOut();
      setUser(null);
      setSession(null);
      setSubscriptionStatus(null);
      
      toast({
        title: "Signed out successfully",
        description: "You have been signed out of your account.",
      });
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      session,
      signUp,
      signIn,
      signOut,
      loading,
      subscriptionStatus,
      checkSubscription
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
