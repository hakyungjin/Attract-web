/**
 * Supabase 데이터베이스 스키마 적용 스크립트
 *
 * 사용법:
 * node apply-schema.js
 *
 * 환경 변수 필요:
 * - SUPABASE_DB_PASSWORD: Supabase 데이터베이스 비밀번호
 */

import { readFileSync } from 'fs';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://ytffobltrwkgxiedorsd.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl0ZmZvYmx0cndrZ3hpZWRvcnNkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQyNTAxODcsImV4cCI6MjA3OTgyNjE4N30.LT6RINgyyjIriwdBV4DGP3GeXl2AVRetT1rStFFXpn8';

// Supabase 클라이언트 생성
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

console.log('🔧 Supabase 스키마 적용 도구\n');
console.log('=' .repeat(50));
console.log(`📍 프로젝트 URL: ${SUPABASE_URL}`);
console.log('=' .repeat(50));
console.log('');

// 스키마 파일 읽기
let schemaSQL;
try {
    schemaSQL = readFileSync('./supabase-schema.sql', 'utf-8');
    console.log('✅ 스키마 파일 로드 완료 (supabase-schema.sql)');
} catch (error) {
    console.error('❌ 스키마 파일을 찾을 수 없습니다:', error.message);
    console.log('\n💡 supabase-schema.sql 파일이 프로젝트 루트에 있는지 확인하세요.');
    process.exit(1);
}

console.log('\n⚠️  주의사항:');
console.log('=' .repeat(50));
console.log('이 스크립트는 Supabase Anon Key로는 스키마를 직접 적용할 수 없습니다.');
console.log('스키마 적용은 다음 방법 중 하나를 사용하세요:\n');
console.log('1️⃣  Supabase Dashboard SQL Editor (권장)');
console.log('   - https://supabase.com/dashboard');
console.log('   - 프로젝트 선택 > SQL Editor > New query');
console.log('   - supabase-schema.sql 내용 붙여넣기 > Run\n');
console.log('2️⃣  Supabase CLI');
console.log('   - npx supabase login');
console.log('   - npx supabase link --project-ref agtivhggfqwjitzsqmkv');
console.log('   - npx supabase db push\n');
console.log('3️⃣  psql 직접 연결');
console.log('   - psql "postgresql://postgres:[비밀번호]@db.agtivhggfqwjitzsqmkv.supabase.co:5432/postgres"');
console.log('   - \\i supabase-schema.sql\n');
console.log('=' .repeat(50));

// 연결 테스트만 수행
console.log('\n🔍 연결 테스트 중...\n');

async function testConnection() {
    try {
        // 기본 연결 테스트
        const { error } = await supabase
            .from('users')
            .select('count', { count: 'exact', head: true });

        if (error && error.code !== 'PGRST116') {
            throw error;
        }

        console.log('✅ Supabase 연결 성공!');

        // 테이블 존재 여부 확인
        console.log('\n📊 테이블 확인 중...\n');

        const tables = [
            'users',
            'payments',
            'coin_packages',
            'matches',
            'messages',
            'posts',
            'community_posts',
            'post_comments',
            'comments',
            'likes',
            'notifications'
        ];

        let existingTables = [];
        let missingTables = [];

        for (const table of tables) {
            const { error } = await supabase
                .from(table)
                .select('count', { count: 'exact', head: true });

            if (error) {
                missingTables.push(table);
                console.log(`   ❌ ${table} - 없음`);
            } else {
                existingTables.push(table);
                console.log(`   ✅ ${table} - 존재`);
            }
        }

        console.log('\n' + '='.repeat(50));
        console.log(`📈 결과: ${existingTables.length}/${tables.length} 테이블 존재`);
        console.log('='.repeat(50));

        if (missingTables.length > 0) {
            console.log('\n⚠️  스키마가 아직 적용되지 않았습니다.');
            console.log('\n📝 다음 단계:');
            console.log('1. SUPABASE_SETUP.md 파일을 열어 지침을 확인하세요');
            console.log('2. Supabase Dashboard에서 SQL Editor를 사용하여 스키마를 적용하세요');
            console.log('3. test-supabase-connection.html을 브라우저에서 열어 확인하세요\n');
        } else {
            console.log('\n🎉 모든 테이블이 정상적으로 설정되었습니다!');
            console.log('\n✨ 다음 단계:');
            console.log('1. npm run dev - 개발 서버 실행');
            console.log('2. 회원가입/로그인 기능 테스트');
            console.log('3. 데이터 CRUD 작업 테스트\n');
        }

    } catch (error) {
        console.error('❌ 연결 실패:', error.message);
        console.log('\n💡 해결 방법:');
        console.log('1. .env 파일의 SUPABASE_URL과 SUPABASE_ANON_KEY 확인');
        console.log('2. Supabase 프로젝트가 활성 상태인지 확인');
        console.log('3. 네트워크 연결 확인\n');
    }
}

testConnection();
