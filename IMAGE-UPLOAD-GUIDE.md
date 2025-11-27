# 이미지 사용 가이드

## 📁 프로젝트 내 이미지 위치

### 1. public/ 폴더 (정적 파일)

**용도:** 로고, 파비콘, 기본 이미지 등

```
public/
├── logo.png              # 앱 로고
├── favicon.ico           # 파비콘
└── images/
    ├── default-avatar.png  # 기본 프로필 사진
    ├── coin-icon.png       # 자석 아이콘
    ├── hero-banner.jpg     # 히어로 배너
    └── empty-state.svg     # 빈 상태 이미지
```

**사용법:**
```tsx
// public 폴더의 이미지는 절대 경로로 참조
<img src="/logo.png" alt="로고" />
<img src="/images/default-avatar.png" alt="기본 프로필" />
```

### 2. src/assets/ 폴더 (번들링될 파일)

**용도:** 컴포넌트에서 import하여 사용할 이미지

```
src/assets/
└── images/
    ├── icon.svg
    └── pattern.png
```

**사용법:**
```tsx
// import 필요
import iconImage from './assets/images/icon.svg'

<img src={iconImage} alt="아이콘" />
```

---

## 🌟 Supabase Storage (추천)

### 1. Supabase Storage 버킷 생성

**Supabase 대시보드에서:**
1. Storage 메뉴 클릭
2. "New Bucket" 클릭
3. 버킷 생성:
   - `avatars` - 프로필 사진
   - `posts` - 게시글 이미지
   - `chat` - 채팅 이미지

**Public 설정:**
- Public 버킷: 모든 사람이 볼 수 있음 (프로필 사진, 게시글 등)
- Private 버킷: 인증된 사용자만 볼 수 있음

### 2. Storage 정책 설정 (SQL)

```sql
-- avatars 버킷 정책
-- 누구나 조회 가능
CREATE POLICY "Anyone can view avatars" ON storage.objects
  FOR SELECT USING (bucket_id = 'avatars');

-- 인증된 사용자만 업로드 가능
CREATE POLICY "Authenticated users can upload avatars" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'avatars' AND
    auth.role() = 'authenticated'
  );

-- 자신의 이미지만 삭제 가능
CREATE POLICY "Users can delete own avatars" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'avatars' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );
```

### 3. 컴포넌트에서 사용

**프로필 편집 페이지 예시:**

```tsx
import ImageUploader from '../components/ImageUploader';

function ProfileEditPage() {
  const [profileImageUrl, setProfileImageUrl] = useState('');

  const handleUploadSuccess = (url: string) => {
    console.log('업로드 성공:', url);
    setProfileImageUrl(url);

    // Supabase users 테이블 업데이트
    // await supabase
    //   .from('users')
    //   .update({ profile_image: url })
    //   .eq('id', userId);
  };

  const handleUploadError = (error: string) => {
    console.error('업로드 실패:', error);
  };

  return (
    <div>
      <h2>프로필 사진 변경</h2>
      <ImageUploader
        bucket="avatars"
        folder="profiles"
        currentImageUrl={profileImageUrl}
        onUploadSuccess={handleUploadSuccess}
        onUploadError={handleUploadError}
        maxSize={5}
      />
    </div>
  );
}
```

---

## 🎨 아이콘 사용 (lucide-react)

이미지 대신 아이콘을 사용하면 더 가볍고 확장 가능합니다!

```tsx
import {
  Heart,
  MessageCircle,
  User,
  Settings,
  Search,
  Home,
  Bell,
  Star
} from 'lucide-react';

// 사용 예시
<Heart className="w-6 h-6 text-red-500" />
<MessageCircle className="w-5 h-5 text-blue-500" />
<User className="w-8 h-8 text-gray-700" />

// 클릭 가능한 아이콘
<button onClick={handleLike}>
  <Heart className="w-6 h-6 hover:text-red-500 transition-colors" />
</button>
```

**아이콘 찾기:** https://lucide.dev/icons/

---

## 📊 이미지 최적화 팁

### 1. 적절한 형식 선택
- **JPEG**: 사진 (배경, 프로필 사진)
- **PNG**: 투명 배경, 로고
- **SVG**: 아이콘, 로고 (확대해도 깨지지 않음)
- **WebP**: 모든 용도 (최신 형식, 가장 작은 용량)

### 2. 이미지 압축
**온라인 도구:**
- https://tinypng.com/ (PNG, JPEG 압축)
- https://squoosh.app/ (Google, 다양한 형식)
- https://imagecompressor.com/

### 3. 적절한 크기
- 프로필 사진: 500x500px
- 게시글 이미지: 1200x800px
- 썸네일: 200x200px
- 배너: 1920x600px

---

## 🔧 이미지 서비스 비교

| 방법 | 장점 | 단점 | 추천 용도 |
|------|------|------|-----------|
| **public/** | 빠른 로딩, 간단 | 많으면 느려짐 | 로고, 파비콘 |
| **src/assets/** | 번들 최적화 | 빌드 크기 증가 | 아이콘, 작은 이미지 |
| **Supabase Storage** | 무제한, CDN | 설정 필요 | 프로필, 게시글 이미지 |
| **외부 CDN** | 빠름 | 외부 의존 | 대용량 미디어 |

---

## 📝 실전 예시

### 예시 1: 기본 프로필 사진 표시

```tsx
function UserAvatar({ imageUrl, userName }: { imageUrl?: string; userName: string }) {
  return (
    <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-200">
      {imageUrl ? (
        <img
          src={imageUrl}
          alt={userName}
          className="w-full h-full object-cover"
        />
      ) : (
        // 기본 이미지 (public 폴더)
        <img
          src="/images/default-avatar.png"
          alt="기본 프로필"
          className="w-full h-full object-cover"
        />
      )}
    </div>
  );
}
```

### 예시 2: 게시글 이미지 업로드

```tsx
function CreatePost() {
  const [images, setImages] = useState<string[]>([]);

  const handleImageUpload = async (file: File) => {
    const url = await uploadImage(file, 'posts', 'user-posts');
    setImages([...images, url]);
  };

  return (
    <div>
      <input
        type="file"
        multiple
        onChange={(e) => {
          Array.from(e.target.files || []).forEach(handleImageUpload);
        }}
      />

      {/* 이미지 미리보기 */}
      <div className="grid grid-cols-3 gap-2">
        {images.map((url, i) => (
          <img key={i} src={url} alt={`이미지 ${i + 1}`} />
        ))}
      </div>
    </div>
  );
}
```

### 예시 3: 로딩 상태 처리

```tsx
function ImageWithLoading({ src, alt }: { src: string; alt: string }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  return (
    <div className="relative">
      {loading && (
        <div className="absolute inset-0 bg-gray-100 animate-pulse" />
      )}

      {error ? (
        <img src="/images/default-avatar.png" alt="기본 이미지" />
      ) : (
        <img
          src={src}
          alt={alt}
          onLoad={() => setLoading(false)}
          onError={() => {
            setLoading(false);
            setError(true);
          }}
          className={loading ? 'opacity-0' : 'opacity-100 transition-opacity'}
        />
      )}
    </div>
  );
}
```

---

## ✅ 체크리스트

프로젝트에 이미지 추가 전:

- [ ] 이미지 용도 확인 (정적 vs 동적)
- [ ] 적절한 형식 선택 (JPEG, PNG, SVG, WebP)
- [ ] 이미지 압축 (TinyPNG 등)
- [ ] 적절한 크기로 리사이징
- [ ] Supabase Storage 버킷 생성 (동적 이미지)
- [ ] 로딩 및 에러 처리 구현
- [ ] 모바일 반응형 고려

---

## 🚀 다음 단계

1. **Supabase Storage 설정**
   - Supabase 대시보드에서 버킷 생성
   - Storage 정책 설정

2. **이미지 업로드 테스트**
   - ImageUploader 컴포넌트 사용
   - 프로필 편집 페이지에 적용

3. **정적 이미지 추가**
   - public/images/ 폴더에 로고, 기본 이미지 추가

**도움이 필요하면 언제든지 물어보세요!** 😊
