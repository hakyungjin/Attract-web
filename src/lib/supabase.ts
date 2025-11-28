import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

console.log('🔍 Supabase Configuration Debug:');
console.log('URL:', supabaseUrl ? `✅ ${supabaseUrl.substring(0, 30)}...` : '❌ MISSING');
console.log('ANON_KEY:', supabaseAnonKey ? `✅ ${supabaseAnonKey.substring(0, 30)}...` : '❌ MISSING');

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Supabase configuration is missing! Check your .env file.');
  console.error('Expected variables: VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// 인증 헬퍼 함수들
export const auth = {
  // 이메일 로그인
  signInWithEmail: async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { data, error };
  },

  // 회원가입
  signUp: async (email: string, password: string, name: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
        },
      },
    });
    return { data, error };
  },

  // 로그아웃
  signOut: async () => {
    const { error } = await supabase.auth.signOut();
    return { error };
  },

  // 현재 세션 가져오기
  getSession: async () => {
    const { data, error } = await supabase.auth.getSession();
    return { data, error };
  },

  // 현재 사용자 가져오기
  getCurrentUser: async () => {
    const { data: { user }, error } = await supabase.auth.getUser();
    return { user, error };
  },

  // 인증 상태 변경 구독
  onAuthStateChange: (callback: (event: string, session: any) => void) => {
    return supabase.auth.onAuthStateChange(callback);
  },
};

// 사용자 관련 함수들
export const userService = {
  // 전화번호로 사용자 찾기 (로그인용)
  findUserByPhoneNumber: async (phoneNumber: string) => {
    try {
      console.log('🔍 전화번호 검색 시작:', phoneNumber);
      
      const { data: users, error } = await supabase
        .from('users')
        .select('*')
        .eq('phone_number', phoneNumber);

      const user = users && users.length > 0 ? users[0] : null;

      console.log('🔍 Supabase 응답:', {
        hasUser: !!user,
        errorMessage: error?.message,
        errorCode: error?.code
      });

      if (error) {
        throw error;
      }

      return { user, error: null };
    } catch (error: any) {
      console.error('❌ 전화번호 검색 실패:', error);
      return { user: null, error };
    }
  },

  // Firebase UID로 사용자 찾기 (회원가입 확인용)
  findUserByFirebaseUid: async (firebaseUid: string) => {
    try {
      console.log('🔍 Firebase UID 검색 시작:', firebaseUid);
      
      const { data: users, error } = await supabase
        .from('users')
        .select('*')
        .eq('firebase_uid', firebaseUid);

      const user = users && users.length > 0 ? users[0] : null;

      if (error) {
        throw error;
      }

      return { user, error: null };
    } catch (error: any) {
      console.error('❌ Firebase UID 검색 실패:', error);
      return { user: null, error };
    }
  },

  // 사용자 프로필 생성
  createUserProfile: async (userData: {
    firebase_uid: string;
    phone_number: string;
    name: string;
    age?: number;
    gender?: string;
    location?: string;
    bio?: string;
  }) => {
    try {
      console.log('🔍 사용자 프로필 생성 시작:', userData.phone_number);
      
      const { data: createdUsers, error } = await supabase
        .from('users')
        .insert([userData])
        .select();

      const data = createdUsers && createdUsers.length > 0 ? createdUsers[0] : null;

      if (error) throw error;

      console.log('✅ 사용자 프로필 생성 성공:', data);
      return { data, error: null };
    } catch (error: any) {
      console.error('❌ 사용자 프로필 생성 실패:', error);
      return { data: null, error };
    }
  },

  // 사용자 프로필 업데이트
  updateUserProfile: async (userId: string, updates: any) => {
    try {
      const { data: updatedUsers, error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', userId)
        .select();

      const data = updatedUsers && updatedUsers.length > 0 ? updatedUsers[0] : null;

      if (error) throw error;

      return { data, error: null };
    } catch (error: any) {
      console.error('사용자 정보 업데이트 실패:', error);
      return { data: null, error };
    }
  },
};
