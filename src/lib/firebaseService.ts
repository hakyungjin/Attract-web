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
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  Timestamp,
  addDoc,
  serverTimestamp,
  increment,
  arrayUnion,
  arrayRemove,
  type DocumentData,
  type QueryConstraint,
  type WhereFilterOp,
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
  password?: string;
  coins?: number;
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
  content: string;
  images?: string[];
  likes?: number;
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

// ==================== Users ====================

export const userService = {
  /**
   * 전화번호로 사용자 찾기
   */
  async findUserByPhoneNumber(phoneNumber: string): Promise<{ user: User | null; error: any }> {
    try {
      logger.info('전화번호로 사용자 찾기:', phoneNumber);

      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('phone_number', '==', phoneNumber), limit(1));
      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        return { user: null, error: null };
      }

      const doc = snapshot.docs[0];
      const user = { id: doc.id, ...doc.data() } as User;

      logger.info('사용자 찾기 성공:', user.id);
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
      logger.info('Firebase UID로 사용자 찾기:', firebaseUid);

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
   * 사용자 생성
   */
  async createUser(userData: Omit<User, 'id'>): Promise<{ user: User | null; error: any }> {
    try {
      logger.info('사용자 생성:', userData.phone_number);

      const usersRef = collection(db, 'users');
      const docRef = await addDoc(usersRef, {
        ...userData,
        coins: userData.coins || 0,
        created_at: serverTimestamp(),
        updated_at: serverTimestamp(),
      });

      const user = { id: docRef.id, ...userData } as User;

      logger.info('사용자 생성 성공:', user.id);
      return { user, error: null };
    } catch (error: any) {
      logger.error('사용자 생성 실패:', error);
      return { user: null, error };
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

      logger.info('사용자 업데이트 성공:', userId);
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

      logger.info('사용자 삭제 성공:', userId);
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

      logger.info('매칭 요청 생성 성공:', request.id);
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
  async getReceivedRequests(userId: string): Promise<{ requests: MatchingRequest[]; error: any }> {
    try {
      const requestsRef = collection(db, 'matching_requests');
      const q = query(
        requestsRef,
        where('to_user_id', '==', userId),
        where('status', '==', 'pending'),
        orderBy('created_at', 'desc')
      );

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
  async getSentRequests(userId: string): Promise<{ requests: MatchingRequest[]; error: any }> {
    try {
      const requestsRef = collection(db, 'matching_requests');
      const q = query(
        requestsRef,
        where('from_user_id', '==', userId),
        orderBy('created_at', 'desc')
      );

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

      logger.info('매칭 요청 삭제 성공:', requestId);
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

      logger.info('채팅방 생성 성공:', chatRoom.id);
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

      logger.info('메시지 전송 성공:', docRef.id);
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
};

// ==================== Posts ====================

export const postService = {
  /**
   * 게시글 생성
   */
  async createPost(userId: string, content: string, images?: string[]): Promise<{ post: Post | null; error: any }> {
    try {
      const postsRef = collection(db, 'posts');
      const docRef = await addDoc(postsRef, {
        user_id: userId,
        content,
        images: images || [],
        likes: 0,
        comments_count: 0,
        created_at: serverTimestamp(),
      });

      const post = {
        id: docRef.id,
        user_id: userId,
        content,
        images,
        likes: 0,
        comments_count: 0,
      } as Post;

      logger.info('게시글 생성 성공:', post.id);
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
   * 게시글 좋아요
   */
  async likePost(postId: string): Promise<{ error: any }> {
    try {
      const postRef = doc(db, 'posts', postId);
      await updateDoc(postRef, {
        likes: increment(1),
      });

      logger.info('게시글 좋아요 성공:', postId);
      return { error: null };
    } catch (error: any) {
      logger.error('게시글 좋아요 실패:', error);
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
  notifications: notificationService,
};

export default firebase;
