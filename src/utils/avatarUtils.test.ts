/**
 * avatarUtils 테스트
 */

import { describe, it, expect } from 'vitest';
import { getDefaultAvatar, getProfilePhotos, optimizeImageUrl } from './avatarUtils';

describe('avatarUtils', () => {
  describe('getDefaultAvatar', () => {
    it('남성 프로필 이미지를 반환해야 함', () => {
      const avatar = getDefaultAvatar('male');
      expect(avatar).toContain('male-default-avatar');
    });

    it('한글 "남자"로도 남성 이미지를 반환해야 함', () => {
      const avatar = getDefaultAvatar('남자');
      expect(avatar).toContain('male-default-avatar');
    });

    it('여성 프로필 이미지를 반환해야 함', () => {
      const avatar = getDefaultAvatar('female');
      expect(avatar).toContain('female-default-avatar');
    });

    it('한글 "여자"로도 여성 이미지를 반환해야 함', () => {
      const avatar = getDefaultAvatar('여자');
      expect(avatar).toContain('female-default-avatar');
    });

    it('알 수 없는 성별은 기본값(여성)을 반환해야 함', () => {
      const avatar = getDefaultAvatar('unknown');
      expect(avatar).toContain('female-default-avatar');
    });
  });

  describe('getProfilePhotos', () => {
    it('사진이 있으면 그대로 반환해야 함', () => {
      const photos = ['photo1.jpg', 'photo2.jpg'];
      const result = getProfilePhotos(photos, 'male');
      expect(result).toEqual(photos);
    });

    it('사진이 없으면 기본 아바타를 반환해야 함', () => {
      const result = getProfilePhotos(null, 'male');
      expect(result).toHaveLength(1);
      expect(result[0]).toContain('male-default-avatar');
    });

    it('빈 배열이면 기본 아바타를 반환해야 함', () => {
      const result = getProfilePhotos([], 'female');
      expect(result).toHaveLength(1);
      expect(result[0]).toContain('female-default-avatar');
    });
  });

  describe('optimizeImageUrl', () => {
    it('URL을 그대로 반환해야 함 (현재 최적화 로직 비활성화)', () => {
      const url = 'https://example.com/image.jpg';
      const optimized = optimizeImageUrl(url);
      expect(optimized).toBe(url);
    });
  });
});
