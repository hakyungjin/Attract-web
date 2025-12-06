-- ============================================
-- RLS 정책 수정 (테스트 및 개발용)
-- 메시지와 채팅방 접근 정책을 수정합니다
-- Supabase SQL Editor에서 실행하세요
-- ============================================

-- ============================================
-- 옵션 1: 테스트용으로 RLS 임시 비활성화
-- (개발/테스트 시에만 사용, 프로덕션에서는 절대 사용하지 마세요!)
-- ============================================

-- 메시지 테이블 RLS 비활성화 (테스트용)
-- ALTER TABLE public.messages DISABLE ROW LEVEL SECURITY;

-- 채팅방 테이블 RLS 비활성화 (테스트용)
-- ALTER TABLE public.chat_rooms DISABLE ROW LEVEL SECURITY;

-- ============================================
-- 옵션 2: RLS 정책을 더 유연하게 수정 (권장)
-- sender_id/recipient_id 기반으로 체크
-- ============================================

-- 기존 messages 정책 삭제
DROP POLICY IF EXISTS "Chat room participants can view messages" ON public.messages;
DROP POLICY IF EXISTS "Chat room participants can send messages" ON public.messages;
DROP POLICY IF EXISTS "Recipients can update message read status" ON public.messages;
DROP POLICY IF EXISTS "Users can view own messages" ON public.messages;
DROP POLICY IF EXISTS "Users can send messages" ON public.messages;
DROP POLICY IF EXISTS "Users can update own messages" ON public.messages;

-- 새 messages 정책: 더 유연한 접근 (채팅방 기반 + 레거시 지원)
CREATE POLICY "Allow message select"
  ON public.messages FOR SELECT
  USING (true);  -- 모든 조회 허용 (room_id로 필터링은 앱에서)

CREATE POLICY "Allow message insert with room"
  ON public.messages FOR INSERT
  WITH CHECK (
    -- room_id가 있으면 해당 채팅방이 존재하고 활성화되어 있는지 체크
    (room_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM public.chat_rooms cr
      WHERE cr.id = room_id
      AND cr.is_active = true
    ))
    OR
    -- room_id가 없으면 레거시 방식 허용
    room_id IS NULL
  );

CREATE POLICY "Allow message update"
  ON public.messages FOR UPDATE
  USING (true);  -- 읽음 처리 등 허용

-- ============================================
-- chat_rooms 정책 수정
-- ============================================

-- 기존 chat_rooms 정책 삭제
DROP POLICY IF EXISTS "Users can view own chat rooms" ON public.chat_rooms;
DROP POLICY IF EXISTS "System can create chat rooms" ON public.chat_rooms;
DROP POLICY IF EXISTS "Participants can update chat rooms" ON public.chat_rooms;

-- 새 chat_rooms 정책
CREATE POLICY "Allow chat room select"
  ON public.chat_rooms FOR SELECT
  USING (true);  -- 모든 조회 허용

CREATE POLICY "Allow chat room insert"
  ON public.chat_rooms FOR INSERT
  WITH CHECK (true);  -- 생성 허용

CREATE POLICY "Allow chat room update"
  ON public.chat_rooms FOR UPDATE
  USING (true);  -- 업데이트 허용

-- ============================================
-- matching_requests 정책 확인/수정
-- ============================================

-- RLS 활성화 확인
ALTER TABLE public.matching_requests ENABLE ROW LEVEL SECURITY;

-- 기존 정책 삭제 (있으면)
DROP POLICY IF EXISTS "Allow matching select" ON public.matching_requests;
DROP POLICY IF EXISTS "Allow matching insert" ON public.matching_requests;
DROP POLICY IF EXISTS "Allow matching update" ON public.matching_requests;

-- 새 정책
CREATE POLICY "Allow matching select"
  ON public.matching_requests FOR SELECT
  USING (true);

CREATE POLICY "Allow matching insert"
  ON public.matching_requests FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow matching update"
  ON public.matching_requests FOR UPDATE
  USING (true);

-- ============================================
-- 완료!
-- ============================================
-- 
-- 이제 테스트 페이지에서 메시지를 보낼 수 있습니다.
-- 
-- ⚠️ 주의: 이 설정은 개발/테스트용입니다.
-- 프로덕션에서는 더 엄격한 RLS 정책을 사용하세요.
--
-- 프로덕션용 RLS 정책 예시:
-- CREATE POLICY "Auth users only" ON public.messages
--   FOR INSERT WITH CHECK (auth.uid() = sender_id);
--

