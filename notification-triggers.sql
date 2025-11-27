-- 알림 자동 생성 트리거
-- 이 SQL을 Supabase SQL Editor에서 실행하세요

-- 0. community_posts 좋아요 테이블 생성 (likes 테이블은 posts용이므로 별도 생성)
CREATE TABLE IF NOT EXISTS community_post_likes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    post_id BIGINT REFERENCES community_posts(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(post_id, user_id)
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_community_post_likes_post_id ON community_post_likes(post_id);
CREATE INDEX IF NOT EXISTS idx_community_post_likes_user_id ON community_post_likes(user_id);

-- RLS 활성화
ALTER TABLE community_post_likes ENABLE ROW LEVEL SECURITY;

-- RLS 정책
CREATE POLICY "Anyone can view community post likes" ON community_post_likes
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can add community post likes" ON community_post_likes
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove own community post likes" ON community_post_likes
    FOR DELETE USING (auth.uid() = user_id);

-- 1. 게시글 좋아요 시 알림 생성
CREATE OR REPLACE FUNCTION notify_post_like()
RETURNS TRIGGER AS $$
DECLARE
    post_author_id UUID;
    post_title TEXT;
BEGIN
    -- 게시글 작성자 ID와 제목 가져오기
    SELECT user_id, title INTO post_author_id, post_title
    FROM community_posts
    WHERE id = NEW.post_id;

    -- 자기 자신의 게시글에 좋아요를 누른 경우 알림 생성 안 함
    IF post_author_id != NEW.user_id THEN
        INSERT INTO notifications (user_id, type, title, content, link, created_at)
        VALUES (
            post_author_id,
            'like',
            '새로운 좋아요',
            '누군가 회원님의 게시글을 좋아합니다.',
            '/post/' || NEW.post_id,
            NOW()
        );
    END IF;

    RETURN NEW;
END;
$$ language 'plpgsql' SECURITY DEFINER;

-- 2. 댓글 작성 시 알림 생성
CREATE OR REPLACE FUNCTION notify_new_comment()
RETURNS TRIGGER AS $$
DECLARE
    post_author_id UUID;
    post_title TEXT;
    commenter_name TEXT;
BEGIN
    -- 게시글 작성자 ID와 제목 가져오기
    SELECT user_id, title INTO post_author_id, post_title
    FROM community_posts
    WHERE id = NEW.post_id;

    -- 댓글 작성자 이름 가져오기
    SELECT name INTO commenter_name
    FROM users
    WHERE id = NEW.user_id;

    -- 자기 자신의 게시글에 댓글을 단 경우 알림 생성 안 함
    IF post_author_id != NEW.user_id THEN
        INSERT INTO notifications (user_id, type, title, content, link, created_at)
        VALUES (
            post_author_id,
            'comment',
            '새로운 댓글',
            COALESCE(commenter_name, '누군가') || '님이 회원님의 게시글에 댓글을 남겼습니다.',
            '/post/' || NEW.post_id,
            NOW()
        );
    END IF;

    RETURN NEW;
END;
$$ language 'plpgsql' SECURITY DEFINER;

-- 3. 매칭 수락 시 알림 생성
CREATE OR REPLACE FUNCTION notify_match_accepted()
RETURNS TRIGGER AS $$
DECLARE
    other_user_id UUID;
    accepter_name TEXT;
BEGIN
    -- 매칭 상태가 accepted로 변경되었을 때만
    IF NEW.status = 'accepted' AND OLD.status != 'accepted' THEN
        -- 상대방 user_id 찾기
        IF auth.uid() = NEW.user_id_1 THEN
            other_user_id := NEW.user_id_2;
        ELSE
            other_user_id := NEW.user_id_1;
        END IF;

        -- 수락한 사람의 이름 가져오기
        SELECT name INTO accepter_name
        FROM users
        WHERE id = auth.uid();

        -- 상대방에게 알림 전송
        INSERT INTO notifications (user_id, type, title, content, link, created_at)
        VALUES (
            other_user_id,
            'match',
            '매칭 성공!',
            COALESCE(accepter_name, '누군가') || '님과 매칭되었습니다!',
            '/chat',
            NOW()
        );
    END IF;

    RETURN NEW;
END;
$$ language 'plpgsql' SECURITY DEFINER;

-- 4. 새 메시지 수신 시 알림 생성
CREATE OR REPLACE FUNCTION notify_new_message()
RETURNS TRIGGER AS $$
DECLARE
    recipient_id UUID;
    sender_name TEXT;
    match_user_1 UUID;
    match_user_2 UUID;
BEGIN
    -- 매칭 정보 가져오기
    SELECT user_id_1, user_id_2 INTO match_user_1, match_user_2
    FROM matches
    WHERE id = NEW.match_id;

    -- 수신자 찾기 (발신자가 아닌 사람)
    IF NEW.sender_id = match_user_1 THEN
        recipient_id := match_user_2;
    ELSE
        recipient_id := match_user_1;
    END IF;

    -- 발신자 이름 가져오기
    SELECT name INTO sender_name
    FROM users
    WHERE id = NEW.sender_id;

    -- 수신자에게 알림 전송
    INSERT INTO notifications (user_id, type, title, content, link, created_at)
    VALUES (
        recipient_id,
        'message',
        '새 메시지',
        COALESCE(sender_name, '누군가') || '님이 메시지를 보냈습니다.',
        '/chat/' || NEW.match_id,
        NOW()
    );

    RETURN NEW;
END;
$$ language 'plpgsql' SECURITY DEFINER;

-- 트리거 삭제 (기존 트리거가 있다면)
DROP TRIGGER IF EXISTS on_post_like_notify ON community_post_likes;
DROP TRIGGER IF EXISTS on_comment_notify ON post_comments;
DROP TRIGGER IF EXISTS on_match_accepted_notify ON matches;
DROP TRIGGER IF EXISTS on_new_message_notify ON messages;

-- 트리거 생성
CREATE TRIGGER on_post_like_notify
    AFTER INSERT ON community_post_likes
    FOR EACH ROW
    EXECUTE FUNCTION notify_post_like();

CREATE TRIGGER on_comment_notify
    AFTER INSERT ON post_comments
    FOR EACH ROW
    EXECUTE FUNCTION notify_new_comment();

CREATE TRIGGER on_match_accepted_notify
    AFTER UPDATE ON matches
    FOR EACH ROW
    EXECUTE FUNCTION notify_match_accepted();

CREATE TRIGGER on_new_message_notify
    AFTER INSERT ON messages
    FOR EACH ROW
    EXECUTE FUNCTION notify_new_message();
