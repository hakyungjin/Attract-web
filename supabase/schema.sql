-- =============================================
-- Attract 소개팅 앱 - Supabase 데이터베이스 스키마
-- 최종 업데이트: 2024-12-07
-- =============================================
-- 이 파일은 프로젝트의 전체 데이터베이스 스키마를 관리합니다.
-- 스키마 변경 시 이 파일을 업데이트해주세요.
-- =============================================

-- =============================================
-- 1. USERS (사용자)
-- =============================================
CREATE TABLE public.users (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  phone_number text NOT NULL UNIQUE,
  name text NOT NULL,
  profile_image text,
  avatar_url text,
  bio text,
  age integer,
  gender text CHECK (gender = ANY (ARRAY['male'::text, 'female'::text, 'other'::text])),
  location text,
  school text,
  job text,
  coins integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  body_type text,
  style text,
  religion text,
  smoking text,
  drinking text,
  height text,
  mbti text,
  interests text[],
  password_hash text,
  last_login timestamp with time zone,
  profile_completed boolean,
  fcm_token text,
  is_ghost boolean DEFAULT false,
  photos text[],
  CONSTRAINT users_pkey PRIMARY KEY (id)
);

-- =============================================
-- 2. MATCHING_REQUESTS (매칭 요청)
-- =============================================
CREATE TABLE public.matching_requests (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  from_user_id text NOT NULL,
  to_user_id text NOT NULL,
  status text DEFAULT 'pending'::text CHECK (status = ANY (ARRAY['pending'::text, 'accepted'::text, 'rejected'::text])),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT matching_requests_pkey PRIMARY KEY (id)
);

-- =============================================
-- 3. CHAT_ROOMS (채팅방)
-- =============================================
CREATE TABLE public.chat_rooms (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user1_id text NOT NULL,
  user2_id text NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  last_message text,
  last_message_at timestamp with time zone,
  last_message_sender_id text,
  is_active boolean DEFAULT true,
  matching_request_id uuid,
  left_by text,  -- 나간 사용자 ID
  CONSTRAINT chat_rooms_pkey PRIMARY KEY (id),
  CONSTRAINT chat_rooms_matching_request_id_fkey FOREIGN KEY (matching_request_id) REFERENCES public.matching_requests(id)
);

-- =============================================
-- 4. MESSAGES (메시지)
-- =============================================
CREATE TABLE public.messages (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  room_id uuid,
  sender_id text NOT NULL,  -- 'system' for system messages
  recipient_id text,
  content text NOT NULL,
  is_read boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  -- 레거시 필드 (사용 안함)
  match_id uuid,
  read boolean DEFAULT false,
  CONSTRAINT messages_pkey PRIMARY KEY (id)
);

-- =============================================
-- 5. MATCHES (구 매칭 - 레거시)
-- =============================================
CREATE TABLE public.matches (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id_1 uuid,
  user_id_2 uuid,
  status text DEFAULT 'pending'::text CHECK (status = ANY (ARRAY['pending'::text, 'accepted'::text, 'rejected'::text])),
  coins_spent integer DEFAULT 1,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT matches_pkey PRIMARY KEY (id),
  CONSTRAINT matches_user_id_1_fkey FOREIGN KEY (user_id_1) REFERENCES public.users(id),
  CONSTRAINT matches_user_id_2_fkey FOREIGN KEY (user_id_2) REFERENCES public.users(id)
);

-- =============================================
-- 6. NOTIFICATIONS (알림)
-- =============================================
CREATE TABLE public.notifications (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid,
  type text NOT NULL,
  title text NOT NULL,
  content text,
  link text,
  read boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT notifications_pkey PRIMARY KEY (id),
  CONSTRAINT notifications_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
);

-- =============================================
-- 7. COIN_PACKAGES (코인 패키지)
-- =============================================
CREATE TABLE public.coin_packages (
  id text NOT NULL,
  coins integer NOT NULL,
  price integer NOT NULL,
  bonus integer DEFAULT 0,
  popular boolean DEFAULT false,
  active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT coin_packages_pkey PRIMARY KEY (id)
);

-- =============================================
-- 8. PAYMENTS (결제 내역)
-- =============================================
CREATE TABLE public.payments (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid,
  order_id text NOT NULL UNIQUE,
  payment_key text,
  amount integer NOT NULL,
  coins integer NOT NULL,
  payment_method text,
  status text DEFAULT 'pending'::text CHECK (status = ANY (ARRAY['pending'::text, 'completed'::text, 'failed'::text, 'cancelled'::text])),
  approved_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT payments_pkey PRIMARY KEY (id),
  CONSTRAINT payments_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
);

-- =============================================
-- 9. COMMUNITY_POSTS (커뮤니티 게시글)
-- =============================================
CREATE TABLE public.community_posts (
  id bigint NOT NULL GENERATED BY DEFAULT AS IDENTITY,
  user_id uuid,
  author_name text NOT NULL,
  avatar_url text,
  title text NOT NULL,
  content text NOT NULL,
  image_url text,
  likes integer DEFAULT 0,
  views integer DEFAULT 0,
  category text DEFAULT 'dating'::text CHECK (category = ANY (ARRAY['dating'::text, 'chat'::text])),
  age integer,
  location text,
  job text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT community_posts_pkey PRIMARY KEY (id),
  CONSTRAINT community_posts_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
);

-- =============================================
-- 10. COMMUNITY_POST_LIKES (게시글 좋아요)
-- =============================================
CREATE TABLE public.community_post_likes (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  user_id uuid NOT NULL,
  post_id bigint,
  CONSTRAINT community_post_likes_pkey PRIMARY KEY (id),
  CONSTRAINT community_post_likes_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id),
  CONSTRAINT community_post_likes_post_id_fkey FOREIGN KEY (post_id) REFERENCES public.community_posts(id)
);

-- =============================================
-- 11. POST_COMMENTS (게시글 댓글)
-- =============================================
CREATE TABLE public.post_comments (
  id bigint NOT NULL GENERATED BY DEFAULT AS IDENTITY,
  post_id bigint,
  user_id uuid,
  author_name text NOT NULL,
  avatar_url text,
  content text NOT NULL,
  likes integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT post_comments_pkey PRIMARY KEY (id),
  CONSTRAINT post_comments_post_id_fkey FOREIGN KEY (post_id) REFERENCES public.community_posts(id),
  CONSTRAINT post_comments_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
);

-- =============================================
-- 12. POSTS (레거시 게시글)
-- =============================================
CREATE TABLE public.posts (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid,
  title text NOT NULL,
  content text NOT NULL,
  images text[],
  likes_count integer DEFAULT 0,
  comments_count integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT posts_pkey PRIMARY KEY (id),
  CONSTRAINT posts_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
);

-- =============================================
-- 13. LIKES (레거시 좋아요)
-- =============================================
CREATE TABLE public.likes (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  post_id uuid,
  user_id uuid,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT likes_pkey PRIMARY KEY (id),
  CONSTRAINT likes_post_id_fkey FOREIGN KEY (post_id) REFERENCES public.posts(id),
  CONSTRAINT likes_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
);

-- =============================================
-- 14. COMMENTS (레거시 댓글)
-- =============================================
CREATE TABLE public.comments (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  post_id uuid,
  user_id uuid,
  content text NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT comments_pkey PRIMARY KEY (id),
  CONSTRAINT comments_post_id_fkey FOREIGN KEY (post_id) REFERENCES public.posts(id),
  CONSTRAINT comments_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
);

-- =============================================
-- RLS (Row Level Security) 정책
-- =============================================
-- 필요에 따라 RLS 정책을 여기에 추가

-- =============================================
-- 인덱스
-- =============================================
-- 성능 최적화를 위한 인덱스

CREATE INDEX IF NOT EXISTS idx_users_phone_number ON public.users(phone_number);
CREATE INDEX IF NOT EXISTS idx_chat_rooms_users ON public.chat_rooms(user1_id, user2_id);
CREATE INDEX IF NOT EXISTS idx_messages_room_id ON public.messages(room_id);
CREATE INDEX IF NOT EXISTS idx_matching_requests_users ON public.matching_requests(from_user_id, to_user_id);
CREATE INDEX IF NOT EXISTS idx_community_posts_category ON public.community_posts(category);

-- =============================================
-- Realtime 활성화
-- =============================================
-- Supabase 대시보드에서 활성화 필요:
-- - messages 테이블
-- - chat_rooms 테이블
-- - notifications 테이블

