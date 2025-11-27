import { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { auth } from '../lib/supabase';
import type { User } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string, name: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const loading = false; // 로딩 화면 제거 - 즉시 렌더링

  useEffect(() => {
    let isMounted = true;

    // 백그라운드에서 세션 확인 (로딩 화면 없이)
    auth.getSession()
      .then(({ data, error }) => {
        if (!isMounted) return;

        if (error) {
          console.error('Session error:', error);
        }
        setUser(data.session?.user ?? null);
      })
      .catch((err) => {
        if (!isMounted) return;
        console.error('Session check failed:', err);
      });

    // 인증 상태 변경 구독
    const { data: { subscription } } = auth.onAuthStateChange((_event, session) => {
      if (!isMounted) return;
      setUser(session?.user ?? null);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    const { data, error } = await auth.signInWithEmail(email, password);
    if (data.user) {
      setUser(data.user);
    }
    return { error };
  };

  const signUp = async (email: string, password: string, name: string) => {
    const { data, error } = await auth.signUp(email, password, name);
    if (data.user) {
      setUser(data.user);
    }
    return { error };
  };

  const signOut = async () => {
    await auth.signOut();
    setUser(null);
  };

  const value = {
    user,
    loading,
    signIn,
    signUp,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
