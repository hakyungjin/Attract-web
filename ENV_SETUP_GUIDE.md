# 🔐 환경 변수 설정 가이드

**중요**: 환경 변수에는 민감한 정보(API 키, 비밀번호 등)가 포함되므로 절대 Git에 커밋하지 마세요!

---

## 📋 필요한 환경 변수 전체 목록

### 1. Firebase 설정 (필수)
```bash
VITE_FIREBASE_API_KEY=AIzaSy...
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abc123
```

**발급 방법**:
1. [Firebase Console](https://console.firebase.google.com/) 접속
2. 프로젝트 선택
3. 톱니바퀴 아이콘 > 프로젝트 설정
4. "웹 앱"에서 설정 정보 확인

### 2. Supabase 설정 (커뮤니티용)
```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**발급 방법**:
1. [Supabase Dashboard](https://app.supabase.com/) 접속
2. 프로젝트 선택
3. Settings > API
4. URL과 anon public 키 복사

### 3. 쏘다 SMS API (필수)
```bash
VITE_SSODAA_API_KEY=your_api_key
VITE_SSODAA_TOKEN_KEY=your_token_key
VITE_SSODAA_SENDER=01012345678
```

**발급 방법**:
1. [쏘다 웹사이트](https://ssodaa.com) 가입/로그인
2. [API 토큰 관리] 메뉴에서 API_KEY와 TOKEN_KEY 발급
3. [발신번호 관리]에서 발신번호 등록 및 인증
4. SENDER에는 인증된 발신번호 입력

### 4. 카카오 애드핏 (선택)
```bash
VITE_KAKAO_AD_UNIT_1=DAN-xxxxx
VITE_KAKAO_AD_UNIT_2=DAN-xxxxx
```

---

## 🚀 플랫폼별 환경 변수 설정 방법

### 1. Firebase Hosting

#### 방법 A: `.env.production` 파일 사용 (빌드 시)
```bash
# 프로젝트 루트에 .env.production 파일 생성
cat > .env.production << 'EOF'
VITE_FIREBASE_API_KEY=AIzaSy...
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
# ... 나머지 환경 변수
EOF

# 빌드 (환경 변수가 번들에 포함됨)
npm run build

# Firebase에 배포
firebase deploy --only hosting
```

#### 방법 B: GitHub Actions 사용 (자동 배포)
```yaml
# .github/workflows/deploy.yml
name: Deploy to Firebase

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install dependencies
        run: npm install

      - name: Build with env vars
        env:
          VITE_FIREBASE_API_KEY: ${{ secrets.VITE_FIREBASE_API_KEY }}
          VITE_FIREBASE_AUTH_DOMAIN: ${{ secrets.VITE_FIREBASE_AUTH_DOMAIN }}
          # ... 나머지 환경 변수
        run: npm run build

      - name: Deploy to Firebase
        uses: FirebaseExtended/action-hosting-deploy@v0
        with:
          repoToken: ${{ secrets.GITHUB_TOKEN }}
          firebaseServiceAccount: ${{ secrets.FIREBASE_SERVICE_ACCOUNT }}
          channelId: live
          projectId: your-project-id
```

**GitHub Secrets 설정**:
1. GitHub 저장소 > Settings > Secrets and variables > Actions
2. "New repository secret" 클릭
3. 각 환경 변수를 Secret으로 추가

---

### 2. Vercel

#### Web UI로 설정
1. [Vercel Dashboard](https://vercel.com/dashboard) 접속
2. 프로젝트 선택
3. Settings > Environment Variables
4. 변수 추가:
   - Name: `VITE_FIREBASE_API_KEY`
   - Value: `AIzaSy...`
   - Environment: Production, Preview, Development 선택
5. "Save" 클릭

#### CLI로 설정
```bash
# Vercel CLI 설치
npm i -g vercel

# 로그인
vercel login

# 환경 변수 설정
vercel env add VITE_FIREBASE_API_KEY production
# 값 입력 프롬프트에서 입력

# 또는 .env 파일로 일괄 설정
vercel env pull .env.local

# 배포
vercel --prod
```

---

### 3. Netlify

#### Web UI로 설정
1. [Netlify Dashboard](https://app.netlify.com/) 접속
2. 사이트 선택
3. Site settings > Environment variables
4. "Add a variable" 클릭
5. Key와 Value 입력
6. "Deploy" 섹션에서 "Trigger deploy" 클릭

#### `netlify.toml` 파일 사용 (권장하지 않음 - 파일에 시크릿 노출)
```toml
# netlify.toml
[build]
  command = "npm run build"
  publish = "dist"

# 환경 변수는 UI에서 설정하세요!
```

#### CLI로 설정
```bash
# Netlify CLI 설치
npm i -g netlify-cli

# 로그인
netlify login

# 환경 변수 설정
netlify env:set VITE_FIREBASE_API_KEY "AIzaSy..."

# 배포
netlify deploy --prod
```

---

### 4. Docker (자체 호스팅)

#### Dockerfile
```dockerfile
FROM node:18-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci

COPY . .

# 빌드 시 환경 변수 주입
ARG VITE_FIREBASE_API_KEY
ARG VITE_FIREBASE_AUTH_DOMAIN
# ... 나머지 환경 변수

ENV VITE_FIREBASE_API_KEY=$VITE_FIREBASE_API_KEY
ENV VITE_FIREBASE_AUTH_DOMAIN=$VITE_FIREBASE_AUTH_DOMAIN

RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

#### docker-compose.yml
```yaml
version: '3.8'

services:
  web:
    build:
      context: .
      args:
        VITE_FIREBASE_API_KEY: ${VITE_FIREBASE_API_KEY}
        VITE_FIREBASE_AUTH_DOMAIN: ${VITE_FIREBASE_AUTH_DOMAIN}
        # ... 나머지 환경 변수
    ports:
      - "80:80"
    env_file:
      - .env.production
```

#### 빌드 및 실행
```bash
# .env.production 파일 생성
cat > .env.production << 'EOF'
VITE_FIREBASE_API_KEY=AIzaSy...
# ... 나머지
EOF

# 빌드
docker-compose build

# 실행
docker-compose up -d
```

---

## 🔒 보안 주의사항

### ❌ 절대 하면 안 되는 것

1. **환경 변수 파일을 Git에 커밋**
   ```bash
   # .gitignore에 반드시 추가
   .env
   .env.local
   .env.production
   .env.*.local
   ```

2. **클라이언트 측에 백엔드 시크릿 노출**
   ```bash
   # ❌ 잘못된 예
   VITE_FIREBASE_PRIVATE_KEY=...  # Private Key는 서버에서만!
   VITE_DATABASE_PASSWORD=...     # DB 비밀번호는 서버에서만!
   ```

3. **코드에 직접 하드코딩**
   ```typescript
   // ❌ 절대 금지
   const apiKey = "AIzaSy...";

   // ✅ 올바른 방법
   const apiKey = import.meta.env.VITE_FIREBASE_API_KEY;
   ```

### ✅ 권장 사항

1. **환경별 파일 분리**
   ```
   .env                 # 기본값 (Git 제외)
   .env.local           # 로컬 개발 (Git 제외)
   .env.production      # 프로덕션 (Git 제외)
   .env.example         # 예시 파일 (Git 포함, 값은 비움)
   ```

2. **환경 변수 검증**
   ```typescript
   // src/config/env.ts
   const requiredEnvVars = [
     'VITE_FIREBASE_API_KEY',
     'VITE_FIREBASE_PROJECT_ID',
     'VITE_SSODAA_API_KEY',
   ];

   for (const varName of requiredEnvVars) {
     if (!import.meta.env[varName]) {
       throw new Error(`Missing required environment variable: ${varName}`);
     }
   }
   ```

3. **클라이언트 vs 서버 환경 변수 구분**
   - `VITE_*` 접두사: 클라이언트에 노출됨 (Vite 빌드 시 번들에 포함)
   - 접두사 없음: 서버에서만 사용 (클라이언트에 노출 안 됨)

---

## 📝 .env.example 템플릿

프로젝트에 다음 파일을 생성하고 Git에 커밋하세요:

```bash
# .env.example
# 이 파일을 복사하여 .env 파일을 만들고 실제 값을 입력하세요
# cp .env.example .env

# Firebase 설정 (필수)
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=

# Supabase 설정 (커뮤니티 기능용)
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=

# SMS API (Ssodaa)
VITE_SSODAA_API_KEY=
VITE_SSODAA_TOKEN_KEY=
VITE_SSODAA_SENDER=

# 광고 (선택)
VITE_KAKAO_AD_UNIT_1=
VITE_KAKAO_AD_UNIT_2=
```

---

## 🧪 환경 변수 테스트

### 로컬에서 확인
```typescript
// src/App.tsx 또는 콘솔에서
console.log('Firebase API Key:', import.meta.env.VITE_FIREBASE_API_KEY ? '설정됨' : '미설정');
console.log('Ssodaa API Key:', import.meta.env.VITE_SSODAA_API_KEY ? '설정됨' : '미설정');
```

### 빌드 후 확인
```bash
# 프로덕션 빌드
npm run build

# dist 폴더의 index.html에서 환경 변수가 포함되었는지 확인
grep -r "VITE_" dist/

# ⚠️ 주의: VITE_ 접두사가 있는 환경 변수는 빌드 결과물에 포함됩니다!
# 민감한 정보는 절대 VITE_ 접두사를 사용하지 마세요!
```

---

## 🆘 문제 해결

### 환경 변수가 undefined로 표시될 때

1. **환경 변수 이름 확인**
   ```bash
   # Vite에서는 VITE_ 접두사 필수
   ✅ VITE_FIREBASE_API_KEY
   ❌ FIREBASE_API_KEY  # 작동 안 함
   ```

2. **개발 서버 재시작**
   ```bash
   # .env 파일 수정 후 반드시 재시작
   npm run dev
   ```

3. **빌드 시 환경 변수 전달**
   ```bash
   # 직접 전달
   VITE_FIREBASE_API_KEY=xxx npm run build

   # 또는 .env.production 파일 사용
   npm run build  # 자동으로 .env.production 로드
   ```

### Firebase 초기화 실패 시

```typescript
// src/lib/firebase.ts에서 확인
if (!import.meta.env.VITE_FIREBASE_API_KEY) {
  console.error('Firebase API Key가 설정되지 않았습니다!');
}
```

---

## 📚 참고 자료

- [Vite 환경 변수 문서](https://vitejs.dev/guide/env-and-mode.html)
- [Firebase 설정 가이드](https://firebase.google.com/docs/web/setup)
- [Vercel 환경 변수](https://vercel.com/docs/concepts/projects/environment-variables)
- [Netlify 환경 변수](https://docs.netlify.com/environment-variables/overview/)

---

**마지막 업데이트**: 2025-12-17
