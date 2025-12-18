/**
 * Firestore 시드 데이터 생성 스크립트
 * 
 * 사용법:
 * npx tsx scripts/seedFirestore.ts
 */

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// 환경 변수 로드 (.env 파일에서 읽기)
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
// scripts 디렉토리에서 실행 시 프로젝트 루트의 .env 파일 경로
const envPath = join(__dirname, '..', '.env');
dotenv.config({ path: envPath });

// Firebase 설정
const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY || '',
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN || '',
  projectId: process.env.VITE_FIREBASE_PROJECT_ID || '',
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: process.env.VITE_FIREBASE_APP_ID || '',
};

if (!firebaseConfig.projectId) {
  console.error('❌ 환경 변수가 설정되지 않았습니다.');
  console.error('📝 .env 파일에 VITE_FIREBASE_PROJECT_ID를 설정해주세요.');
  process.exit(1);
}

// Firebase 초기화
const app = initializeApp(firebaseConfig);
const databaseName = process.env.VITE_FIREBASE_DATABASE_NAME || 'attract';
const db = getFirestore(app, databaseName);

console.log('🔥 Firebase 초기화 완료');
console.log(`📊 데이터베이스: ${databaseName}`);
console.log(`📁 프로젝트: ${firebaseConfig.projectId}`);

/**
 * 샘플 사용자 데이터 생성
 */
async function seedUsers() {
  console.log('\n👤 사용자 데이터 생성 중...');

  const sampleUsers = [
    {
      phone_number: '01012345678',
      name: '홍길동',
      age: 25,
      gender: 'male',
      location: '서울 강남구',
      bio: '안녕하세요!',
      mbti: 'ENFP',
      school: '서울대학교',
      height: '175~180',
      body_type: '보통',
      style: '캐주얼',
      religion: '무교',
      smoking: '비흡연',
      drinking: '가끔',
      interests: ['영화', '음악', '여행'],
      coins: 100,
      is_ghost: false,
      profile_completed: true,
      created_at: serverTimestamp(),
      updated_at: serverTimestamp(),
    },
    {
      phone_number: '01087654321',
      name: '김영희',
      age: 23,
      gender: 'female',
      location: '서울 서초구',
      bio: '반갑습니다!',
      mbti: 'ISFJ',
      school: '연세대학교',
      height: '160~165',
      body_type: '마른',
      style: '페미닌',
      religion: '기독교',
      smoking: '비흡연',
      drinking: '안 마심',
      interests: ['독서', '요리', '산책'],
      coins: 100,
      is_ghost: false,
      profile_completed: true,
      created_at: serverTimestamp(),
      updated_at: serverTimestamp(),
    },
  ];

  try {
    const usersRef = collection(db, 'users');
    for (const user of sampleUsers) {
      const docRef = await addDoc(usersRef, user);
      console.log(`✅ 사용자 생성: ${user.name} (${docRef.id})`);
    }
    console.log(`\n✅ 총 ${sampleUsers.length}명의 사용자 생성 완료`);
  } catch (error: any) {
    console.error('❌ 사용자 생성 실패:', error.message);
  }
}

/**
 * 샘플 코인 패키지 데이터 생성
 */
async function seedCoinPackages() {
  console.log('\n💰 코인 패키지 데이터 생성 중...');

  const packages = [
    {
      name: '기본 패키지',
      coins: 100,
      price: 1000,
      bonus_coins: 0,
      is_popular: false,
      display_order: 1,
    },
    {
      name: '인기 패키지',
      coins: 500,
      price: 4500,
      bonus_coins: 50,
      is_popular: true,
      display_order: 2,
    },
    {
      name: '프리미엄 패키지',
      coins: 1000,
      price: 8000,
      bonus_coins: 200,
      is_popular: false,
      display_order: 3,
    },
  ];

  try {
    const packagesRef = collection(db, 'coin_packages');
    for (const pkg of packages) {
      const docRef = await addDoc(packagesRef, pkg);
      console.log(`✅ 패키지 생성: ${pkg.name} (${docRef.id})`);
    }
    console.log(`\n✅ 총 ${packages.length}개의 패키지 생성 완료`);
  } catch (error: any) {
    console.error('❌ 패키지 생성 실패:', error.message);
  }
}

/**
 * 메인 실행 함수
 */
async function main() {
  try {
    console.log('🚀 Firestore 시드 데이터 생성 시작\n');

    // 사용자 데이터 생성
    await seedUsers();

    // 코인 패키지 데이터 생성
    await seedCoinPackages();

    console.log('\n✨ 모든 시드 데이터 생성 완료!');
    process.exit(0);
  } catch (error: any) {
    console.error('\n❌ 오류 발생:', error.message);
    process.exit(1);
  }
}

// 스크립트 실행
main();

