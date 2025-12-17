import { supabase } from '../lib/supabase';

export interface ChatRoom {
  id: string;
  user1_id: string;
  user2_id: string;
  last_message?: string;
  last_message_at?: string;
  is_active: boolean;
  created_at: string;
}

export interface Message {
  id: string;
  room_id: string;
  sender_id: string;
  recipient_id: string;
  content: string;
  is_read: boolean;
  created_at: string;
}

/**
 * 모든 채팅방 조회
 */
export const getAllChatRooms = async (orderBy: { column: string; ascending: boolean; nullsFirst?: boolean } = {
  column: 'last_message_at',
  ascending: false,
  nullsFirst: false
}) => {
  try {
    const { data, error } = await supabase
      .from('chat_rooms')
      .select('*')
      .order(orderBy.column, {
        ascending: orderBy.ascending,
        nullsFirst: orderBy.nullsFirst
      });

    if (error) throw error;

    return { success: true, chatRooms: data || [] };
  } catch (error: any) {
    console.error('채팅방 목록 조회 실패:', error);
    return { success: false, error: error.message, chatRooms: [] };
  }
};

/**
 * 채팅방 개수 조회
 */
export const getChatRoomsCount = async () => {
  try {
    const { count, error } = await supabase
      .from('chat_rooms')
      .select('*', { count: 'exact', head: true });

    if (error) throw error;

    return { success: true, count: count || 0 };
  } catch (error: any) {
    console.error('채팅방 개수 조회 실패:', error);
    return { success: false, error: error.message, count: 0 };
  }
};

/**
 * 채팅방의 메시지 조회
 */
export const getMessagesByRoomId = async (roomId: string, orderBy: { column: string; ascending: boolean } = {
  column: 'created_at',
  ascending: true
}) => {
  try {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('room_id', roomId)
      .order(orderBy.column, { ascending: orderBy.ascending });

    if (error) throw error;

    return { success: true, messages: data || [] };
  } catch (error: any) {
    console.error('메시지 조회 실패:', error);
    return { success: false, error: error.message, messages: [] };
  }
};

/**
 * 채팅방의 메시지 개수 조회
 */
export const getMessageCount = async (roomId: string) => {
  try {
    const { count, error } = await supabase
      .from('messages')
      .select('*', { count: 'exact', head: true })
      .eq('room_id', roomId);

    if (error) throw error;

    return { success: true, count: count || 0 };
  } catch (error: any) {
    console.error('메시지 개수 조회 실패:', error);
    return { success: false, error: error.message, count: 0 };
  }
};

/**
 * 전체 메시지 개수 조회
 */
export const getTotalMessagesCount = async () => {
  try {
    const { count, error } = await supabase
      .from('messages')
      .select('*', { count: 'exact', head: true });

    if (error) throw error;

    return { success: true, count: count || 0 };
  } catch (error: any) {
    console.error('전체 메시지 개수 조회 실패:', error);
    return { success: false, error: error.message, count: 0 };
  }
};

/**
 * 채팅방 ID로 채팅방 정보 조회
 */
export const getChatRoomById = async (roomId: string) => {
  try {
    const { data, error } = await supabase
      .from('chat_rooms')
      .select('*')
      .eq('id', roomId)
      .single();

    if (error) throw error;

    return { success: true, chatRoom: data };
  } catch (error: any) {
    console.error('채팅방 정보 조회 실패:', error);
    return { success: false, error: error.message, chatRoom: null };
  }
};

/**
 * 사용자의 채팅방 조회
 */
export const getChatRoomsByUserId = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('chat_rooms')
      .select('*')
      .or(`user1_id.eq.${userId},user2_id.eq.${userId}`)
      .order('last_message_at', { ascending: false, nullsFirst: false });

    if (error) throw error;

    return { success: true, chatRooms: data || [] };
  } catch (error: any) {
    console.error('사용자 채팅방 조회 실패:', error);
    return { success: false, error: error.message, chatRooms: [] };
  }
};
