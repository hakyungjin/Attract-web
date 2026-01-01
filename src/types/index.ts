/**
 * 공통 타입 정의
 */

// ===== 사용자 관련 타입 =====

export interface User {
  id: string;
  phone_number: string;
  name: string;
  age?: number;
  gender: 'male' | 'female' | string;
  location?: string;
  school?: string;
  job?: string;
  bio?: string;
  profile_image?: string;
  mbti?: string;
  coins?: number;
  profile_completed?: boolean;
  last_login?: string;
  created_at?: string;
}

export interface Profile extends User {
  character?: string;
  photos?: string[];
  interests?: string[];
  height?: string;
  bodyType?: string;
  style?: string;
  religion?: string;
  smoking?: string;
  drinking?: string;
  hasLikedMe?: boolean;
  isMatched?: boolean;
}

// ===== 매칭 관련 타입 =====

export type MatchRequestStatus = 'pending' | 'accepted' | 'rejected' | 'expired';

export interface MatchRequest {
  id: string;
  from_user_id: string;
  to_user_id: string;
  status: MatchRequestStatus;
  created_at: string;
}

export interface MatchRequestWithUser extends MatchRequest {
  userId: string;
  name: string;
  age: number;
  gender: string;
  location: string;
  school: string;
  mbti?: string;
  bio: string;
  avatar: string;
  timestamp: string;
  createdAt: Date;
}

// ===== 채팅 관련 타입 =====

export interface ChatRoom {
  id: string;
  user1_id: string;
  user2_id: string;
  created_at: string;
  last_message?: string;
  last_message_at?: string;
}

export interface Message {
  id: string;
  chat_room_id: string;
  sender_id: string;
  message: string;
  created_at: string;
  read: boolean;
}

// ===== 알림 관련 타입 =====

export type NotificationType =
  | 'match_request'
  | 'match_success'
  | 'message'
  | 'refund'
  | 'system';

export interface Notification {
  id: string;
  user_id: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: Record<string, any>;
  read: boolean;
  created_at: string;
}

// ===== 게시글 관련 타입 =====

export interface Post {
  id: string;
  author_id: string;
  content: string;
  images?: string[];
  likes_count?: number;
  comments_count?: number;
  created_at: string;
  updated_at?: string;
}

export interface Comment {
  id: string;
  post_id: string;
  author_id: string;
  content: string;
  created_at: string;
}

// ===== API 응답 타입 =====

export interface ApiResponse<T> {
  data: T | null;
  error: ApiError | null;
}

export interface ApiError {
  message: string;
  code?: string;
  details?: any;
}

// ===== 폼 데이터 타입 =====

export interface SignupFormData {
  phone_number: string;
  password: string;
  name: string;
  age?: number;
  gender?: string;
  location?: string;
  school?: string;
  job?: string;
  bio?: string;
}

export interface LoginFormData {
  phone_number: string;
  password: string;
}

// ===== API 결과 타입 =====

export interface ApiResult<T> {
  data: T | null;
  error: {
    message: string;
    code?: string;
  } | null;
}
