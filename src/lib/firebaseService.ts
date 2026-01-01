/**
 * Firebase Firestore 서비스
 *
 * Supabase에서 Firebase로 마이그레이션
 * 모든 데이터베이스 작업을 처리합니다.
 */

import {
  collection,
  doc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  addDoc,
  serverTimestamp,
  increment,
  type QueryConstraint,
} from 'firebase/firestore';
import { db } from './firebase';
import { logger } from '../utils/logger';

// ==================== 타입 정의 ====================

export interface User {
  id: string;
  firebase_uid: string;
  phone_number: string;
  name: string;
  age?: number;
  gender?: string;
  location?: string;
  bio?: string;
  mbti?: string;
  school?: string;
  height?: string;
  body_type?: string;
  style?: string;
  religion?: string;
  smoking?: string;
  drinking?: string;
  interests?: string[];
  photos?: string[];
  profile_image?: string;
  avatar_url?: string;
  password?: string;
  password_hash?: string;
  coins?: number;
  fcm_token?: string;
  job?: string;
  character?: string;
  nickname?: string;
  is_ghost?: boolean;
  is_admin?: boolean;
  profile_completed?: boolean;
  last_login?: any;
  created_at?: any;
  updated_at?: any;
}

export interface MatchingRequest {
  id: string;
  from_user_id: string;
  to_user_id: string;
  status: 'pending' | 'accepted' | 'rejected' | 'expired';
  created_at: any;
  updated_at?: any;
}

export interface ChatRoom {
  id: string;
  user1_id: string;
  user2_id: string;
  last_message?: string;
  last_message_at?: any;
  created_at: any;
}

export interface ChatMessage {
  id: string;
  room_id: string;
  sender_id: string;
  message: string;
  read: boolean;
  created_at: any;
}

export interface Post {
  id: string;
  user_id: string;
  author_name?: string;
  avatar_url?: string;
  title?: string;
  content: string;
  images?: string[];
  image_url?: string;
  likes?: number;
  views?: number;
  category?: string;
  age?: number;
  location?: string;
  job?: string;
  comments_count?: number;
  created_at: any;
  updated_at?: any;
}

export interface CoinPackage {
  id: string;
  name: string;
  coins: number;
  price: number;
  bonus_coins?: number;
  is_popular?: boolean;
  display_order?: number;
}

export interface PaymentRequest {
  id: string;
  user_id: string;
  user_name: string;
  phone_number: string;
  package_id: string;
  coins: number;
  price: number;
  status: 'pending' | 'completed' | 'cancelled';
  created_at: any;
  updated_at?: any;
}

// ==================== Users ====================

export const userService = {
  /**
   * 전화번호로 사용자 찾기
   */
  async findUserByPhoneNumber(phoneNumber: string): Promise<{ user: User | null; error: any }> {
    try {
      logger.info('전화번호로 사용자 찾기:', { phoneNumber });

      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('phone_number', '==', phoneNumber), limit(1));
      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        return { user: null, error: null };
      }

      const doc = snapshot.docs[0];
      const user = { id: doc.id, ...doc.data() } as User;

      logger.info('사용자 찾기 성공:', { userId: user.id });
      return { user, error: null };
    } catch (error: any) {
      logger.error('사용자 찾기 실패:', error);
      return { user: null, error };
    }
  },

  /**
   * Firebase UID로 사용자 찾기
   */
  async findUserByFirebaseUid(firebaseUid: string): Promise<{ user: User | null; error: any }> {
    try {
      logger.info('Firebase UID로 사용자 찾기:', { firebaseUid });

      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('firebase_uid', '==', firebaseUid), limit(1));
      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        return { user: null, error: null };
      }

      const doc = snapshot.docs[0];
      const user = { id: doc.id, ...doc.data() } as User;

      return { user, error: null };
    } catch (error: any) {
      logger.error('Firebase UID로 사용자 찾기 실패:', error);
      return { user: null, error };
    }
  },

  /**
   * ID로 사용자 찾기
   */
  async getUserById(userId: string): Promise<{ user: User | null; error: any }> {
    try {
      const userRef = doc(db, 'users', userId);
      const snapshot = await getDoc(userRef);

      if (!snapshot.exists()) {
        return { user: null, error: null };
      }

      const user = { id: snapshot.id, ...snapshot.data() } as User;
      return { user, error: null };
    } catch (error: any) {
      logger.error('사용자 ID 조회 실패:', error);
      return { user: null, error };
    }
  },

  /**
   * 사용자 생성 (Firebase SDK 사용 - POST 요청과 동일한 효과)
   * @param userData - 생성할 사용자 데이터
   * @returns 생성된 사용자 정보 또는 에러
   */
  async createUser(userData: Omit<User, 'id'>): Promise<{ user: User | null; error: any }> {
    try {
      logger.info('사용자 생성 (Firebase SDK):', { phoneNumber: userData.phone_number });

      // Firestore에 직접 문서 추가 (POST 요청과 동일한 효과)
      logger.info('Firestore 컬렉션 참조 생성 중...');
      const usersRef = collection(db, 'users');
      
      logger.info('사용자 데이터 준비 중...', { 
        hasName: !!userData.name,
        hasPhone: !!userData.phone_number,
        dataKeys: Object.keys(userData)
      });

      // undefined 값 제거 (Firestore는 undefined 값을 저장할 수 없음)
      const cleanedData = Object.fromEntries(
        Object.entries(userData).filter(([, value]) => value !== undefined)
      );

      logger.info('Firestore에 문서 추가 시도 중...');
      const docRef = await addDoc(usersRef, {
        ...cleanedData,
        coins: cleanedData.coins || 0,
        created_at: serverTimestamp(),
        updated_at: serverTimestamp(),
      });

      logger.info('문서 추가 완료, 문서 ID:', { documentId: docRef.id });

      const user = { id: docRef.id, ...userData } as User;

      logger.info('사용자 생성 성공 (Firebase SDK):', { userId: user.id });
      return { user, error: null };
    } catch (error: any) {
      logger.error('사용자 생성 실패 (Firebase SDK):', { 
        error: error.message,
        code: error.code,
        stack: error.stack
      });
      return { user: null, error: { message: error.message || '회원가입 중 오류가 발생했습니다.', code: error.code } };
    }
  },

  /**
   * 사용자 업데이트
   */
  async updateUser(userId: string, updates: Partial<User>): Promise<{ error: any }> {
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        ...updates,
        updated_at: serverTimestamp(),
      });

      logger.info('사용자 업데이트 성공:', { userId });
      return { error: null };
    } catch (error: any) {
      logger.error('사용자 업데이트 실패:', error);
      return { error };
    }
  },

  /**
   * 사용자 삭제
   */
  async deleteUser(userId: string): Promise<{ error: any }> {
    try {
      const userRef = doc(db, 'users', userId);
      await deleteDoc(userRef);

      logger.info('사용자 삭제 성공:', { userId });
      return { error: null };
    } catch (error: any) {
      logger.error('사용자 삭제 실패:', error);
      return { error };
    }
  },

  /**
   * 코인 증가
   */
  async incrementCoins(userId: string, amount: number): Promise<{ error: any }> {
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        coins: increment(amount),
        updated_at: serverTimestamp(),
      });

      logger.info('코인 증가 성공:', { userId, amount });
      return { error: null };
    } catch (error: any) {
      logger.error('코인 증가 실패:', error);
      return { error };
    }
  },

  /**
   * 코인 감소
   */
  async decrementCoins(userId: string, amount: number): Promise<{ error: any }> {
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        coins: increment(-amount),
        updated_at: serverTimestamp(),
      });

      logger.info('코인 감소 성공:', { userId, amount });
      return { error: null };
    } catch (error: any) {
      logger.error('코인 감소 실패:', error);
      return { error };
    }
  },

  /**
   * 모든 사용자 조회 (페이지네이션)
   */
  async getAllUsers(limitCount = 20, lastDoc?: any): Promise<{ users: User[]; error: any; lastDoc?: any }> {
    try {
      const usersRef = collection(db, 'users');
      let q = query(usersRef, orderBy('created_at', 'desc'), limit(limitCount));

      if (lastDoc) {
        q = query(usersRef, orderBy('created_at', 'desc'), startAfter(lastDoc), limit(limitCount));
      }

      const snapshot = await getDocs(q);
      const users = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as User));
      const newLastDoc = snapshot.docs[snapshot.docs.length - 1];

      return { users, error: null, lastDoc: newLastDoc };
    } catch (error: any) {
      logger.error('사용자 목록 조회 실패:', error);
      return { users: [], error };
    }
  },

  /**
   * 성별로 사용자 조회 (페이지네이션, 특정 사용자 제외)
   */
  async getUsersByGender(
    gender: string,
    excludeUserId?: string,
    limitCount = 20,
    lastDoc?: any
  ): Promise<{ users: User[]; error: any; lastDoc?: any; totalCount: number }> {
    try {
      const usersRef = collection(db, 'users');
      const constraints: QueryConstraint[] = [
        where('gender', '==', gender),
        orderBy('created_at', 'desc'),
        limit(limitCount)
      ];

      if (lastDoc) {
        constraints.push(startAfter(lastDoc));
      }

      const q = query(usersRef, ...constraints);
      const snapshot = await getDocs(q);

      let users = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as User));

      // 특정 사용자 제외
      if (excludeUserId) {
        users = users.filter(user => user.id !== excludeUserId);
      }

      const newLastDoc = snapshot.docs[snapshot.docs.length - 1];

      // 전체 개수는 반환된 사용자 수로 근사 (정확한 count는 Firestore에서 비용이 많이 듦)
      const totalCount = users.length;

      return { users, error: null, lastDoc: newLastDoc, totalCount };
    } catch (error: any) {
      logger.error('성별별 사용자 목록 조회 실패:', error);
      return { users: [], error, totalCount: 0 };
    }
  },
};

// ==================== Matching Requests ====================

export const matchingService = {
  /**
   * 매칭 요청 생성
   */
  async createMatchingRequest(fromUserId: string, toUserId: string): Promise<{ request: MatchingRequest | null; error: any }> {
    try {
      const requestsRef = collection(db, 'matching_requests');
      const docRef = await addDoc(requestsRef, {
        from_user_id: fromUserId,
        to_user_id: toUserId,
        status: 'pending',
        created_at: serverTimestamp(),
      });

      const request = {
        id: docRef.id,
        from_user_id: fromUserId,
        to_user_id: toUserId,
        status: 'pending',
      } as MatchingRequest;

      logger.info('매칭 요청 생성 성공:', { requestId: request.id });
      return { request, error: null };
    } catch (error: any) {
      logger.error('매칭 요청 생성 실패:', error);
      return { request: null, error };
    }
  },

  /**
   * 매칭 요청 상태 업데이트
   */
  async updateMatchingRequestStatus(requestId: string, status: 'accepted' | 'rejected' | 'expired'): Promise<{ error: any }> {
    try {
      const requestRef = doc(db, 'matching_requests', requestId);
      await updateDoc(requestRef, {
        status,
        updated_at: serverTimestamp(),
      });

      logger.info('매칭 요청 상태 업데이트 성공:', { requestId, status });
      return { error: null };
    } catch (error: any) {
      logger.error('매칭 요청 상태 업데이트 실패:', error);
      return { error };
    }
  },

  /**
   * 사용자의 받은 매칭 요청 조회
   */
  async getReceivedRequests(userId: string, status?: string): Promise<{ requests: MatchingRequest[]; error: any }> {
    try {
      const requestsRef = collection(db, 'matching_requests');
      let q;
      if (status) {
        q = query(
          requestsRef,
          where('to_user_id', '==', userId),
          where('status', '==', status),
          orderBy('created_at', 'desc')
        );
      } else {
        q = query(
          requestsRef,
          where('to_user_id', '==', userId),
          orderBy('created_at', 'desc')
        );
      }

      const snapshot = await getDocs(q);
      const requests = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as MatchingRequest));

      return { requests, error: null };
    } catch (error: any) {
      logger.error('받은 매칭 요청 조회 실패:', error);
      return { requests: [], error };
    }
  },

  /**
   * 사용자의 보낸 매칭 요청 조회
   */
  async getSentRequests(userId: string, status?: string): Promise<{ requests: MatchingRequest[]; error: any }> {
    try {
      const requestsRef = collection(db, 'matching_requests');
      let q;
      if (status) {
        q = query(
          requestsRef,
          where('from_user_id', '==', userId),
          where('status', '==', status),
          orderBy('created_at', 'desc')
        );
      } else {
        q = query(
          requestsRef,
          where('from_user_id', '==', userId),
          orderBy('created_at', 'desc')
        );
      }

      const snapshot = await getDocs(q);
      const requests = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as MatchingRequest));

      return { requests, error: null };
    } catch (error: any) {
      logger.error('보낸 매칭 요청 조회 실패:', error);
      return { requests: [], error };
    }
  },

  /**
   * 매칭 요청 삭제
   */
  async deleteMatchingRequest(requestId: string): Promise<{ error: any }> {
    try {
      const requestRef = doc(db, 'matching_requests', requestId);
      await deleteDoc(requestRef);

      logger.info('매칭 요청 삭제 성공:', { requestId });
      return { error: null };
    } catch (error: any) {
      logger.error('매칭 요청 삭제 실패:', error);
      return { error };
    }
  },
};

// ==================== Chat Rooms ====================

export const chatService = {
  /**
   * 채팅방 생성
   */
  async createChatRoom(user1Id: string, user2Id: string): Promise<{ chatRoom: ChatRoom | null; error: any }> {
    try {
      const chatRoomsRef = collection(db, 'chat_rooms');
      const docRef = await addDoc(chatRoomsRef, {
        user1_id: user1Id,
        user2_id: user2Id,
        created_at: serverTimestamp(),
      });

      const chatRoom = {
        id: docRef.id,
        user1_id: user1Id,
        user2_id: user2Id,
      } as ChatRoom;

      logger.info('채팅방 생성 성공:', { chatRoomId: chatRoom.id });
      return { chatRoom, error: null };
    } catch (error: any) {
      logger.error('채팅방 생성 실패:', error);
      return { chatRoom: null, error };
    }
  },

  /**
   * 사용자의 채팅방 목록 조회
   */
  async getUserChatRooms(userId: string): Promise<{ chatRooms: ChatRoom[]; error: any }> {
    try {
      const chatRoomsRef = collection(db, 'chat_rooms');

      // user1_id 또는 user2_id가 userId인 채팅방 조회
      const q1 = query(chatRoomsRef, where('user1_id', '==', userId));
      const q2 = query(chatRoomsRef, where('user2_id', '==', userId));

      const [snapshot1, snapshot2] = await Promise.all([getDocs(q1), getDocs(q2)]);

      const chatRooms = [
        ...snapshot1.docs.map(doc => ({ id: doc.id, ...doc.data() } as ChatRoom)),
        ...snapshot2.docs.map(doc => ({ id: doc.id, ...doc.data() } as ChatRoom)),
      ];

      return { chatRooms, error: null };
    } catch (error: any) {
      logger.error('채팅방 목록 조회 실패:', error);
      return { chatRooms: [], error };
    }
  },

  /**
   * 채팅 메시지 보내기
   */
  async sendMessage(roomId: string, senderId: string, message: string): Promise<{ messageId: string | null; error: any }> {
    try {
      const messagesRef = collection(db, 'chat_rooms', roomId, 'messages');
      const docRef = await addDoc(messagesRef, {
        sender_id: senderId,
        message,
        read: false,
        created_at: serverTimestamp(),
      });

      // 채팅방의 last_message 업데이트
      const roomRef = doc(db, 'chat_rooms', roomId);
      await updateDoc(roomRef, {
        last_message: message,
        last_message_at: serverTimestamp(),
      });

      logger.info('메시지 전송 성공:', { messageId: docRef.id });
      return { messageId: docRef.id, error: null };
    } catch (error: any) {
      logger.error('메시지 전송 실패:', error);
      return { messageId: null, error };
    }
  },

  /**
   * 채팅 메시지 조회
   */
  async getMessages(roomId: string, limitCount = 50): Promise<{ messages: ChatMessage[]; error: any }> {
    try {
      const messagesRef = collection(db, 'chat_rooms', roomId, 'messages');
      const q = query(messagesRef, orderBy('created_at', 'asc'), limit(limitCount));

      const snapshot = await getDocs(q);
      const messages = snapshot.docs.map(doc => ({ id: doc.id, room_id: roomId, ...doc.data() } as ChatMessage));

      return { messages, error: null };
    } catch (error: any) {
      logger.error('메시지 조회 실패:', error);
      return { messages: [], error };
    }
  },

  /**
   * 모든 채팅방 조회 (관리자용)
   */
  async getAllChatRooms(limitCount = 100): Promise<{ chatRooms: ChatRoom[]; error: any }> {
    try {
      const chatRoomsRef = collection(db, 'chat_rooms');
      const q = query(chatRoomsRef, orderBy('created_at', 'desc'), limit(limitCount));
      const snapshot = await getDocs(q);
      const chatRooms = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ChatRoom));
      return { chatRooms, error: null };
    } catch (error: any) {
      logger.error('모든 채팅방 조회 실패:', error);
      return { chatRooms: [], error };
    }
  },

  /**
   * 채팅방 삭제 (관리자용)
   */
  async deleteChatRoom(roomId: string): Promise<{ error: any }> {
    try {
      const roomRef = doc(db, 'chat_rooms', roomId);
      await deleteDoc(roomRef);
      return { error: null };
    } catch (error: any) {
      logger.error('채팅방 삭제 실패:', error);
      return { error };
    }
  },
};

// ==================== Posts ====================

export const postService = {
  /**
   * 게시글 생성
   */
  async createPost(userId: string, postData: Partial<Post>): Promise<{ post: Post | null; error: any }> {
    try {
      const postsRef = collection(db, 'posts');
      const docRef = await addDoc(postsRef, {
        user_id: userId,
        ...postData,
        likes: postData.likes || 0,
        comments_count: postData.comments_count || 0,
        created_at: serverTimestamp(),
        updated_at: serverTimestamp(),
      });

      const post = {
        id: docRef.id,
        user_id: userId,
        ...postData,
      } as Post;

      logger.info('게시글 생성 성공:', { postId: post.id });
      return { post, error: null };
    } catch (error: any) {
      logger.error('게시글 생성 실패:', error);
      return { post: null, error };
    }
  },

  /**
   * 게시글 목록 조회
   */
  async getPosts(limitCount = 20, lastDoc?: any): Promise<{ posts: Post[]; error: any; lastDoc?: any }> {
    try {
      const postsRef = collection(db, 'posts');
      let q = query(postsRef, orderBy('created_at', 'desc'), limit(limitCount));

      if (lastDoc) {
        q = query(postsRef, orderBy('created_at', 'desc'), startAfter(lastDoc), limit(limitCount));
      }

      const snapshot = await getDocs(q);
      const posts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Post));
      const newLastDoc = snapshot.docs[snapshot.docs.length - 1];

      return { posts, error: null, lastDoc: newLastDoc };
    } catch (error: any) {
      logger.error('게시글 목록 조회 실패:', error);
      return { posts: [], error };
    }
  },

  /**
   * 댓글 생성
   */
  async createComment(postId: string, userId: string, content: string, authorData: any): Promise<{ comment: any; error: any }> {
    try {
      const commentsRef = collection(db, 'posts', postId, 'comments');
      const docRef = await addDoc(commentsRef, {
        user_id: userId,
        author_name: authorData.name || '익명',
        avatar_url: authorData.profile_image || authorData.avatar_url || '',
        content,
        likes: 0,
        created_at: serverTimestamp(),
      });

      // 게시글의 댓글 수 증가
      const postRef = doc(db, 'posts', postId);
      await updateDoc(postRef, {
        comments_count: increment(1),
      });

      const comment = {
        id: docRef.id,
        user_id: userId,
        author_name: authorData.name || '익명',
        avatar_url: authorData.profile_image || authorData.avatar_url || '',
        content,
        likes: 0,
      };

      return { comment, error: null };
    } catch (error: any) {
      logger.error('댓글 생성 실패:', error);
      return { comment: null, error };
    }
  },

  /**
   * 댓글 목록 조회
   */
  async getComments(postId: string): Promise<{ comments: any[]; error: any }> {
    try {
      const commentsRef = collection(db, 'posts', postId, 'comments');
      const q = query(commentsRef, orderBy('created_at', 'asc'));
      const snapshot = await getDocs(q);
      const comments = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      return { comments, error: null };
    } catch (error: any) {
      logger.error('댓글 조회 실패:', error);
      return { comments: [], error };
    }
  },

  /**
   * 게시글 좋아요
   */
  async likePost(postId: string): Promise<{ error: any }> {
    try {
      const postRef = doc(db, 'posts', postId);
      await updateDoc(postRef, {
        likes: increment(1),
      });

      logger.info('게시글 좋아요 성공:', { postId });
      return { error: null };
    } catch (error: any) {
      logger.error('게시글 좋아요 실패:', error);
      return { error };
    }
  },

  /**
   * 게시글 좋아요 취소
   */
  async unlikePost(postId: string): Promise<{ error: any }> {
    try {
      const postRef = doc(db, 'posts', postId);
      await updateDoc(postRef, {
        likes: increment(-1),
      });

      logger.info('게시글 좋아요 취소 성공:', { postId });
      return { error: null };
    } catch (error: any) {
      logger.error('게시글 좋아요 취소 실패:', error);
      return { error };
    }
  },

  /**
   * 게시글 조회수 증가
   */
  async incrementViews(postId: string): Promise<{ error: any }> {
    try {
      const postRef = doc(db, 'posts', postId);
      await updateDoc(postRef, {
        views: increment(1),
      });

      logger.info('게시글 조회수 증가 성공:', { postId });
      return { error: null };
    } catch (error: any) {
      logger.error('게시글 조회수 증가 실패:', error);
      return { error };
    }
  },

  /**
   * 게시글 삭제
   */
  async deletePost(postId: string): Promise<{ error: any }> {
    try {
      const postRef = doc(db, 'posts', postId);
      await deleteDoc(postRef);

      logger.info('게시글 삭제 성공:', { postId });
      return { error: null };
    } catch (error: any) {
      logger.error('게시글 삭제 실패:', error);
      return { error };
    }
  },

  /**
   * 댓글 삭제
   */
  async deleteComment(postId: string, commentId: string): Promise<{ error: any }> {
    try {
      const commentRef = doc(db, 'posts', postId, 'comments', commentId);
      await deleteDoc(commentRef);

      // 게시글의 댓글 수 감소
      const postRef = doc(db, 'posts', postId);
      await updateDoc(postRef, {
        comments_count: increment(-1),
      });

      logger.info('댓글 삭제 성공:', { postId, commentId });
      return { error: null };
    } catch (error: any) {
      logger.error('댓글 삭제 실패:', error);
      return { error };
    }
  },

  /**
   * 댓글 좋아요
   */
  async likeComment(postId: string, commentId: string): Promise<{ error: any }> {
    try {
      const commentRef = doc(db, 'posts', postId, 'comments', commentId);
      await updateDoc(commentRef, {
        likes: increment(1),
      });

      logger.info('댓글 좋아요 성공:', { postId, commentId });
      return { error: null };
    } catch (error: any) {
      logger.error('댓글 좋아요 실패:', error);
      return { error };
    }
  },

  /**
   * 댓글 좋아요 취소
   */
  async unlikeComment(postId: string, commentId: string): Promise<{ error: any }> {
    try {
      const commentRef = doc(db, 'posts', postId, 'comments', commentId);
      await updateDoc(commentRef, {
        likes: increment(-1),
      });

      logger.info('댓글 좋아요 취소 성공:', { postId, commentId });
      return { error: null };
    } catch (error: any) {
      logger.error('댓글 좋아요 취소 실패:', error);
      return { error };
    }
  },
};

// ==================== Coin Packages ====================

export const coinService = {
  /**
   * 코인 패키지 목록 조회
   */
  async getCoinPackages(): Promise<{ packages: CoinPackage[]; error: any }> {
    try {
      const packagesRef = collection(db, 'coin_packages');
      const q = query(packagesRef, orderBy('display_order', 'asc'));

      const snapshot = await getDocs(q);
      const packages = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as CoinPackage));

      return { packages, error: null };
    } catch (error: any) {
      logger.error('코인 패키지 조회 실패:', error);
      return { packages: [], error };
    }
  },

  /**
   * 코인 증가
   */
  async incrementCoins(userId: string, amount: number): Promise<{ error: any }> {
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        coins: increment(amount),
        updated_at: serverTimestamp(),
      });

      logger.info('코인 증가 성공:', { userId, amount });
      return { error: null };
    } catch (error: any) {
      logger.error('코인 증가 실패:', error);
      return { error };
    }
  },

  /**
   * 코인 감소
   */
  async decrementCoins(userId: string, amount: number): Promise<{ error: any }> {
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        coins: increment(-amount),
        updated_at: serverTimestamp(),
      });

      logger.info('코인 감소 성공:', { userId, amount });
      return { error: null };
    } catch (error: any) {
      logger.error('코인 감소 실패:', error);
      return { error };
    }
  },
};

// ==================== Payments ====================

export const paymentService = {
  /**
   * 결제 요청 생성 (무통장 입금)
   */
  async createPaymentRequest(paymentData: Omit<PaymentRequest, 'id' | 'status' | 'created_at'>): Promise<{ paymentRequest: PaymentRequest | null; error: any }> {
    try {
      const paymentsRef = collection(db, 'payments');
      const docRef = await addDoc(paymentsRef, {
        ...paymentData,
        status: 'pending',
        created_at: serverTimestamp(),
        updated_at: serverTimestamp(),
      });

      const paymentRequest = {
        id: docRef.id,
        ...paymentData,
        status: 'pending',
      } as PaymentRequest;

      logger.info('결제 요청 생성 성공:', { paymentId: docRef.id });
      return { paymentRequest, error: null };
    } catch (error: any) {
      logger.error('결제 요청 생성 실패:', error);
      return { paymentRequest: null, error };
    }
  },

  /**
   * 사용자의 결제 내역 조회
   */
  async getUserPayments(userId: string): Promise<{ payments: PaymentRequest[]; error: any }> {
    try {
      const paymentsRef = collection(db, 'payments');
      const q = query(
        paymentsRef,
        where('user_id', '==', userId),
        orderBy('created_at', 'desc'),
        limit(50)
      );

      const snapshot = await getDocs(q);
      const payments = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as PaymentRequest));

      return { payments, error: null };
    } catch (error: any) {
      logger.error('결제 내역 조회 실패:', error);
      return { payments: [], error };
    }
  },

  /**
   * 모든 결제 내역 조회 (관리자용)
   */
  async getAllPayments(): Promise<{ payments: PaymentRequest[]; error: any }> {
    try {
      const paymentsRef = collection(db, 'payments');
      const q = query(
        paymentsRef,
        orderBy('created_at', 'desc'),
        limit(500)
      );

      const snapshot = await getDocs(q);
      const payments = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as PaymentRequest));

      return { payments, error: null };
    } catch (error: any) {
      logger.error('전체 결제 내역 조회 실패:', error);
      return { payments: [], error };
    }
  },
};

// ==================== Notifications ====================

export const notificationService = {
  /**
   * 알림 생성
   */
  async createNotification(userId: string, notification: {
    type: string;
    title: string;
    message: string;
    data?: any;
  }): Promise<{ error: any }> {
    try {
      const notificationsRef = collection(db, 'notifications');
      await addDoc(notificationsRef, {
        user_id: userId,
        ...notification,
        read: false,
        created_at: serverTimestamp(),
      });

      logger.info('알림 생성 성공');
      return { error: null };
    } catch (error: any) {
      logger.error('알림 생성 실패:', error);
      return { error };
    }
  },

  /**
   * 사용자 알림 조회
   */
  async getUserNotifications(userId: string): Promise<{ notifications: any[]; error: any }> {
    try {
      const notificationsRef = collection(db, 'notifications');
      const q = query(
        notificationsRef,
        where('user_id', '==', userId),
        orderBy('created_at', 'desc'),
        limit(50)
      );

      const snapshot = await getDocs(q);
      const notifications = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      return { notifications, error: null };
    } catch (error: any) {
      logger.error('알림 조회 실패:', error);
      return { notifications: [], error };
    }
  },
};

// Export 통합
export const firebase = {
  users: userService,
  matching: matchingService,
  chat: chatService,
  posts: postService,
  coins: coinService,
  payments: paymentService,
  notifications: notificationService,
};

export default firebase;
