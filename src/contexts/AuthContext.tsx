import { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import { hashPassword } from '../services/passwordService';

interface AuthUser {
  id: string;
  phone_number: string;
  name: string;
  profile_image?: string;
}

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  signInPhone: (phoneNumber: string, password: string) => Promise<{ error: any; profileCompleted?: boolean }>;
  signUpPhone: (phoneNumber: string, password: string, userData: {
    name: string;
    age?: number;
    gender?: string;
    location?: string;
    school?: string;
    job?: string;
    bio?: string;
  }) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  // 초기 로드 시 localStorage에서 사용자 정보 확인
  useEffect(() => {
    const storedUser = localStorage.getItem('auth_user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (err) {
        console.error('Failed to parse stored user:', err);
      }
    }
    setLoading(false);
  }, []);

  const signInPhone = async (phoneNumber: string, password: string) => {
    try {
      // 전화번호에서 '-' 제거
      const cleanPhoneNumber = phoneNumber.replace(/-/g, '');
      
      // 전화번호로 사용자 조회
      const { data: users, error: queryError } = await supabase
        .from('users')
        .select('*')
        .eq('phone_number', cleanPhoneNumber)
        .single();

      if (queryError || !users) {
        return { error: { message: '사용자를 찾을 수 없습니다.' } };
      }

      // 비밀번호 확인
      const hashedPassword = await hashPassword(password);
      if (users.password_hash !== hashedPassword) {
        return { error: { message: '비밀번호가 일치하지 않습니다.' } };
      }

      // 마지막 로그인 시간 업데이트
      await supabase
        .from('users')
        .update({ last_login: new Date().toISOString() })
        .eq('id', users.id);

      const authUser: AuthUser = {
        id: users.id,
        phone_number: users.phone_number,
        name: users.name,
        profile_image: users.profile_image,
      };

      setUser(authUser);
      localStorage.setItem('auth_user', JSON.stringify(authUser));

      // profile_completed 상태 반환
      return { error: null, profileCompleted: users.profile_completed || false };
    } catch (error: any) {
      return { error: { message: error.message } };
    }
  };

  const signUpPhone = async (
    phoneNumber: string,
    password: string,
    userData: {
      name: string;
      age?: number;
      gender?: string;
      location?: string;
      school?: string;
      job?: string;
      bio?: string;
    }
  ) => {
    try {
      // 전화번호에서 '-' 제거
      const cleanPhoneNumber = phoneNumber.replace(/-/g, '');
      
      // 중복 확인
      const { data: existingUser } = await supabase
        .from('users')
        .select('id')
        .eq('phone_number', cleanPhoneNumber)
        .single();

      if (existingUser) {
        return { error: { message: '이미 가입된 전화번호입니다.' } };
      }

      // 새 사용자 생성
      const hashedPassword = await hashPassword(password);
      const { data: newUser, error: insertError } = await supabase
        .from('users')
        .insert({
          phone_number: cleanPhoneNumber,
          password_hash: hashedPassword,
          name: userData.name,
          age: userData.age || null,
          gender: userData.gender || 'male',
          location: userData.location || null,
          school: userData.school || null,
          job: userData.job || null,
          bio: userData.bio || null,
        })
        .select()
        .single();

      if (insertError || !newUser) {
        return { error: insertError || { message: '가입에 실패했습니다.' } };
      }

      const authUser: AuthUser = {
        id: newUser.id,
        phone_number: newUser.phone_number,
        name: newUser.name,
        profile_image: newUser.profile_image,
      };

      setUser(authUser);
      localStorage.setItem('auth_user', JSON.stringify(authUser));

      return { error: null };
    } catch (error: any) {
      return { error: { message: error.message } };
    }
  };

  const signOut = async () => {
    setUser(null);
    localStorage.removeItem('auth_user');
  };

  const value: AuthContextType = {
    user,
    loading,
    signInPhone,
    signUpPhone,
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
