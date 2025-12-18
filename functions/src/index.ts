/**
 * Import function triggers from their respective submodules:
 *
 * import {onCall} from "firebase-functions/v2/https";
 * import {onDocumentWritten} from "firebase-functions/v2/firestore";
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

// 환경 변수 로드 (로컬 개발 및 빌드 시)
// eslint-disable-next-line @typescript-eslint/no-require-imports
require("dotenv").config();

import {setGlobalOptions} from "firebase-functions";
import {onCall, HttpsError} from "firebase-functions/v2/https";
import {defineString} from "firebase-functions/params";
import * as logger from "firebase-functions/logger";
import axios from "axios";
import {initializeApp, getApps} from "firebase-admin/app";
import {getFirestore, FieldValue} from "firebase-admin/firestore";

// Firebase Admin 초기화 (이미 초기화되지 않은 경우에만)
if (getApps().length === 0) {
  initializeApp();
}
const db = getFirestore();

// For cost control, you can set the maximum number of containers that can be
// running at the same time. This helps mitigate the impact of unexpected
// traffic spikes by instead downgrading performance. This limit is a
// per-function limit. You can override the limit for each function using the
// `maxInstances` option in the function's options, e.g.
// `onRequest({ maxInstances: 5 }, (req, res) => { ... })`.
setGlobalOptions({ maxInstances: 10 });

// 쏘다 SMS API 설정
const API_BASE_URL = 'https://apis.ssodaa.com';

// Firebase Functions v2 환경 변수 정의
// defineString을 사용하면 Google Cloud Console에서 설정한 환경 변수를 자동으로 읽습니다
const ssodaaApiKey = defineString('SSODAA_API_KEY');
const ssodaaTokenKey = defineString('SSODAA_TOKEN_KEY');
const ssodaaSender = defineString('SSODAA_SENDER');
const tossSecretKey = defineString('TOSS_SECRET_KEY');

interface SendSMSRequest {
  phoneNumber: string;
}

interface VerifyCodeRequest {
  phoneNumber: string;
  code: string;
}

// 인증번호 임시 저장 (실제 운영에서는 Redis나 Firestore 사용 권장)
const verificationCodes: Map<string, { code: string; expiresAt: number }> = new Map();

/**
 * 전화번호 정규화 및 검증
 */
const normalizePhoneNumber = (phone: string): string => {
  // 숫자만 추출
  let cleaned = phone.replace(/[^\d]/g, '');
  
  // +82로 시작하면 0으로 변환
  if (cleaned.startsWith('82')) {
    cleaned = '0' + cleaned.substring(2);
  }
  
  // 0으로 시작하지 않으면 0 추가
  if (!cleaned.startsWith('0')) {
    cleaned = '0' + cleaned;
  }
  
  return cleaned;
};

/**
 * 전화번호 유효성 검증
 */
const validatePhoneNumber = (phone: string): boolean => {
  // 한국 휴대폰 번호 형식 검증 (010, 011, 016, 017, 018, 019)
  const phoneRegex = /^0(10|11|16|17|18|19)\d{7,8}$/;
  return phoneRegex.test(phone);
};

/**
 * SMS 인증번호 발송
 */
export const sendVerificationSMS = onCall(async (request) => {
  const { phoneNumber } = request.data as SendSMSRequest;

  // 전화번호 필수 검증
  if (!phoneNumber || typeof phoneNumber !== 'string') {
    logger.error('전화번호가 제공되지 않았습니다.', { phoneNumber });
    throw new HttpsError('invalid-argument', '전화번호가 필요합니다.');
  }

  // 전화번호 정규화
  const normalizedPhone = normalizePhoneNumber(phoneNumber);
  
  // 전화번호 유효성 검증
  if (!validatePhoneNumber(normalizedPhone)) {
    logger.error('유효하지 않은 전화번호 형식', { 
      original: phoneNumber, 
      normalized: normalizedPhone 
    });
    throw new HttpsError(
      'invalid-argument', 
      '올바른 휴대폰 번호 형식이 아닙니다. (예: 010-1234-5678)'
    );
  }

  // Firebase Functions v2 환경 변수 사용
  // defineString으로 정의한 환경 변수는 .value()로 접근합니다
  const API_KEY = ssodaaApiKey.value();
  const TOKEN_KEY = ssodaaTokenKey.value();
  const SENDER = ssodaaSender.value();

  // 환경 변수 검증
  if (!API_KEY || !TOKEN_KEY || !SENDER) {
    logger.error('쏘다 SMS API 설정이 누락되었습니다.', {
      hasApiKey: !!API_KEY,
      hasTokenKey: !!TOKEN_KEY,
      hasSender: !!SENDER,
    });
    throw new HttpsError('internal', 'SMS 서비스 설정이 완료되지 않았습니다.');
  }

  // 발신번호 정규화 (하이픈 제거)
  const normalizedSender = SENDER.replace(/[^\d]/g, '');
  
  // 발신번호 디버깅 로그
  logger.info('발신번호 확인', {
    originalSender: SENDER,
    normalizedSender: normalizedSender,
    senderLength: normalizedSender.length,
  });

  try {
    // 6자리 인증번호 생성
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 3 * 60 * 1000; // 3분 후 만료

    // 인증번호 저장 (정규화된 전화번호 사용)
    verificationCodes.set(normalizedPhone, { code, expiresAt });

    // SMS 발송
    const message = `[Attract] 인증번호는 ${code}입니다. 3분 내에 입력해주세요.`;

    logger.info('SMS 발송 시도', {
      destPhone: normalizedPhone,
      sender: SENDER,
      messageLength: message.length,
    });

    const response = await axios.post(
      `${API_BASE_URL}/sms/send/sms`,
      {
        token_key: TOKEN_KEY,
        msg_type: 'sms',
        dest_phone: normalizedPhone,
        send_phone: normalizedSender, // 정규화된 발신번호 사용
        msg_body: message,
        msg_ad: 'N',
      },
      {
        headers: {
          'x-api-key': API_KEY,
          'Content-Type': 'application/json; charset=utf-8',
        },
      }
    );

    logger.info('SMS API 응답', {
      status: response.status,
      data: response.data,
    });

    // 쏘다 API 응답 코드 확인 (문자열 '200' 또는 숫자 200)
    const responseCode = response.data?.code;
    const errorMessage = response.data?.error || response.data?.message || '';
    
    if (responseCode !== '200' && responseCode !== 200) {
      logger.error('SMS 발송 실패:', {
        responseData: response.data,
        responseCode: responseCode,
        errorMessage: errorMessage,
      });
      
      // 회신번호 차단 오류에 대한 명확한 안내
      if (errorMessage.includes('회신번호 차단') || errorMessage.includes('개인')) {
        throw new HttpsError(
          'failed-precondition',
          '발신번호가 개인 번호로 등록되어 있습니다. 쏘다 대시보드에서 발신번호를 사업자 번호로 등록하거나, 승인된 발신번호를 사용해주세요.'
        );
      }
      
      throw new HttpsError(
        'internal', 
        errorMessage || 'SMS 발송에 실패했습니다.'
      );
    }

    logger.info('SMS 인증번호 발송 성공', { 
      phoneNumber: normalizedPhone,
      codeLength: code.length,
    });
    
    return { 
      success: true, 
      message: '인증번호가 발송되었습니다.' 
    };
  } catch (error: any) {
    logger.error('SMS 발송 오류:', {
      error: error.message,
      stack: error.stack,
      response: error.response?.data,
      phoneNumber: normalizedPhone,
    });

    if (error instanceof HttpsError) {
      throw error;
    }

    // axios 에러 처리
    if (error.response) {
      logger.error('SMS API 응답 오류:', {
        status: error.response.status,
        data: error.response.data,
      });
      throw new HttpsError(
        'internal',
        error.response.data?.error || error.response.data?.message || 'SMS 발송에 실패했습니다.'
      );
    }

    throw new HttpsError(
      'internal', 
      `SMS 발송 실패: ${error.message || '알 수 없는 오류'}`
    );
  }
});

/**
 * 인증번호 확인
 */
export const verifyCode = onCall(async (request) => {
  const { phoneNumber, code } = request.data as VerifyCodeRequest;

  if (!phoneNumber || !code) {
    throw new HttpsError('invalid-argument', '전화번호와 인증번호가 필요합니다.');
  }

  const stored = verificationCodes.get(phoneNumber);

  if (!stored) {
    throw new HttpsError('not-found', '인증번호가 발송되지 않았습니다.');
  }

  if (Date.now() > stored.expiresAt) {
    verificationCodes.delete(phoneNumber);
    throw new HttpsError('deadline-exceeded', '인증번호가 만료되었습니다.');
  }

  if (stored.code !== code) {
    throw new HttpsError('permission-denied', '인증번호가 일치하지 않습니다.');
  }

  // 인증 성공 - 인증번호 삭제
  verificationCodes.delete(phoneNumber);
  logger.info('인증번호 확인 성공', { phoneNumber });

  return { success: true, message: '인증이 완료되었습니다.' };
});

/**
 * 결제 승인 요청 인터페이스
 */
interface PaymentConfirmRequest {
  orderId: string;
  paymentKey: string;
  amount: number;
  userId: string;
  coins: number;
  bonusCoins?: number;
  packageId?: string;
  packageName?: string;
}

/**
 * 토스페이먼츠 결제 승인
 * Toss Payments 결제를 승인하고 사용자 코인을 충전합니다.
 */
export const confirmPayment = onCall(async (request) => {
  const {
    orderId,
    paymentKey,
    amount,
    userId,
    coins,
    bonusCoins = 0,
    packageId,
    packageName,
  } = request.data as PaymentConfirmRequest;

  // 필수 필드 검증
  if (!orderId || !paymentKey || !amount || !userId || !coins) {
    throw new HttpsError('invalid-argument', '필수 필드가 누락되었습니다.');
  }

  // 환경 변수 확인
  // Firebase Functions v2 환경 변수 사용
  const TOSS_SECRET_KEY = tossSecretKey.value();

  if (!TOSS_SECRET_KEY) {
    logger.error('환경 변수가 설정되지 않았습니다.', {
      hasTossKey: !!TOSS_SECRET_KEY,
    });
    throw new HttpsError(
      'internal',
      '결제 시스템 설정이 완료되지 않았습니다. TOSS_SECRET_KEY를 설정해주세요.'
    );
  }

  try {

    // 토스페이먼츠 API로 결제 승인 요청
    const tossResponse = await axios.post(
      'https://api.tosspayments.com/v1/payments/confirm',
      {
        paymentKey,
        orderId,
        amount,
      },
      {
        headers: {
          Authorization: `Basic ${Buffer.from(TOSS_SECRET_KEY + ':').toString('base64')}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (tossResponse.status !== 200) {
      logger.error('토스페이먼츠 결제 승인 실패', tossResponse.data);
      throw new HttpsError(
        'internal',
        tossResponse.data?.message || '결제 승인에 실패했습니다.'
      );
    }

    const tossData = tossResponse.data;

    // 총 코인 계산
    const totalCoins = coins + bonusCoins;

    // 결제 승인 시간
    const approvedAtDate = tossData.approvedAt
      ? new Date(tossData.approvedAt)
      : new Date();

    // Firestore 트랜잭션으로 결제 처리
    const paymentRef = db.collection('payments').doc();
    const paymentId = paymentRef.id;

    await db.runTransaction(async (transaction) => {
      // 1. 중복 결제 확인 (트랜잭션 내에서 쿼리 실행)
      const paymentsRef = db.collection('payments');
      const existingPaymentSnapshot = await transaction.get(
        paymentsRef.where('order_id', '==', orderId).limit(1)
      );

      if (!existingPaymentSnapshot.empty) {
        logger.warn('중복 결제 시도 감지', {orderId, userId});
        throw new HttpsError('already-exists', '이미 처리된 결제입니다.');
      }

      // 2. 사용자 조회 및 코인 확인
      const userRef = db.collection('users').doc(userId);
      const userDoc = await transaction.get(userRef);

      if (!userDoc.exists) {
        logger.error('사용자를 찾을 수 없습니다', {userId});
        throw new HttpsError('not-found', '사용자를 찾을 수 없습니다.');
      }

      const userData = userDoc.data();
      const currentCoins = userData?.coins || 0;
      const newCoins = currentCoins + totalCoins;

      // 3. 결제 기록 생성
      const paymentData = {
        user_id: userId,
        order_id: orderId,
        payment_key: paymentKey,
        amount: amount,
        status: 'completed',
        coins: coins,
        bonus_coins: bonusCoins,
        total_coins: totalCoins,
        package_id: packageId || null,
        package_name: packageName || null,
        toss_order_id: tossData.orderId,
        toss_payment_key: tossData.paymentKey,
        toss_method: tossData.method,
        toss_approved_at: approvedAtDate,
        metadata: {
          toss_response: tossData,
        },
        created_at: FieldValue.serverTimestamp(),
        updated_at: FieldValue.serverTimestamp(),
      };

      transaction.set(paymentRef, paymentData);

      // 4. 사용자 코인 업데이트
      transaction.update(userRef, {
        coins: newCoins,
        updated_at: FieldValue.serverTimestamp(),
      });
    });

    // 트랜잭션 완료 후 결제 데이터 및 사용자 데이터 조회
    const [paymentDoc, userDoc] = await Promise.all([
      db.collection('payments').doc(paymentId).get(),
      db.collection('users').doc(userId).get(),
    ]);

    const payment = paymentDoc.data();
    const userData = userDoc.data();

    if (!payment) {
      throw new HttpsError('internal', '결제 기록을 찾을 수 없습니다.');
    }

    const newCoins = userData?.coins || 0;

    logger.info('결제 승인 성공', {
      orderId,
      userId,
      amount,
      coins: totalCoins,
      newCoins,
    });

    // 성공 응답
    const paymentApprovedAt = payment.toss_approved_at
      ? (payment.toss_approved_at as any).toDate
        ? (payment.toss_approved_at as any).toDate()
        : new Date(payment.toss_approved_at as string)
      : approvedAtDate;

    return {
      success: true,
      data: {
        orderId: payment.order_id,
        amount: payment.amount,
        coins: payment.total_coins,
        currentCoins: newCoins,
        approvedAt: paymentApprovedAt instanceof Date
          ? paymentApprovedAt.toISOString()
          : new Date().toISOString(),
      },
    };
  } catch (error: any) {
    logger.error('결제 승인 오류', {
      error: error.message,
      stack: error.stack,
      orderId,
      userId,
    });

    if (error instanceof HttpsError) {
      throw error;
    }

    throw new HttpsError(
      'internal',
      error.message || '결제 승인에 실패했습니다.'
    );
  }
});

/**
 * 개인정보 삭제 요청 처리
 * 사용자의 모든 개인정보를 영구적으로 삭제합니다.
 * userId 또는 phoneNumber로 사용자를 찾을 수 있습니다.
 */
export const deleteUserData = onCall(async (request) => {
  const { userId, phoneNumber, password } = request.data as {
    userId?: string;
    phoneNumber?: string;
    password?: string;
  };

  let userRef: FirebaseFirestore.DocumentReference;
  let userIdToDelete: string = '';

  try {
    // userId 또는 phoneNumber로 사용자 찾기
    if (userId) {
      // userId로 직접 찾기
      userRef = db.collection('users').doc(userId);
      const userDoc = await userRef.get();
      
      if (!userDoc.exists) {
        logger.error('사용자를 찾을 수 없습니다.', { userId });
        throw new HttpsError('not-found', '사용자를 찾을 수 없습니다.');
      }
      
      userIdToDelete = userId;
    } else if (phoneNumber) {
      // 전화번호로 사용자 찾기
      const cleanPhoneNumber = phoneNumber.replace(/[^\d]/g, '').replace(/^\+82/, '0');
      
      const usersQuery = db
        .collection('users')
        .where('phone_number', '==', cleanPhoneNumber)
        .limit(1);
      
      const usersSnapshot = await usersQuery.get();
      
      if (usersSnapshot.empty) {
        logger.error('전화번호로 사용자를 찾을 수 없습니다.', { phoneNumber: cleanPhoneNumber });
        throw new HttpsError('not-found', '전화번호로 등록된 사용자를 찾을 수 없습니다.');
      }
      
      const userDoc = usersSnapshot.docs[0];
      userRef = userDoc.ref;
      userIdToDelete = userDoc.id;
    } else {
      logger.error('사용자 ID 또는 전화번호가 제공되지 않았습니다.');
      throw new HttpsError('invalid-argument', '사용자 ID 또는 전화번호가 필요합니다.');
    }

    // 사용자 정보 조회
    const userDoc = await userRef.get();
    const userData = userDoc.data();

    if (!userData) {
      logger.error('사용자 데이터를 찾을 수 없습니다.', { userId: userIdToDelete });
      throw new HttpsError('not-found', '사용자 데이터를 찾을 수 없습니다.');
    }

    // 비밀번호 확인 (제공된 경우)
    if (password && userData?.password_hash) {
      // 비밀번호 해시 확인 (실제 구현 필요 - bcrypt 등)
      // 여기서는 간단히 로그만 남김
      logger.info('비밀번호 확인 요청', { userId: userIdToDelete });
      // TODO: 실제 비밀번호 검증 로직 추가 필요
    }

    // 트랜잭션으로 모든 관련 데이터 삭제
    await db.runTransaction(async (transaction) => {
      // 1. 매칭 요청 삭제 (from_user_id 또는 to_user_id가 해당 사용자인 것)
      const matchingRequestsQuery = db
        .collection('matching_requests')
        .where('from_user_id', '==', userIdToDelete);
      const matchingRequestsSnapshot = await matchingRequestsQuery.get();
      
      matchingRequestsSnapshot.forEach((doc) => {
        transaction.delete(doc.ref);
      });

      const matchingRequestsToQuery = db
        .collection('matching_requests')
        .where('to_user_id', '==', userIdToDelete);
      const matchingRequestsToSnapshot = await matchingRequestsToQuery.get();
      
      matchingRequestsToSnapshot.forEach((doc) => {
        transaction.delete(doc.ref);
      });

      // 2. 커뮤니티 게시글 삭제
      const postsQuery = db
        .collection('community_posts')
        .where('user_id', '==', userIdToDelete);
      const postsSnapshot = await postsQuery.get();
      
      postsSnapshot.forEach((doc) => {
        transaction.delete(doc.ref);
      });

      // 3. 채팅방 삭제 (user1_id 또는 user2_id가 해당 사용자인 것)
      const chatRoomsQuery1 = db
        .collection('chat_rooms')
        .where('user1_id', '==', userIdToDelete);
      const chatRoomsSnapshot1 = await chatRoomsQuery1.get();
      
      chatRoomsSnapshot1.forEach((doc) => {
        transaction.delete(doc.ref);
      });

      const chatRoomsQuery2 = db
        .collection('chat_rooms')
        .where('user2_id', '==', userIdToDelete);
      const chatRoomsSnapshot2 = await chatRoomsQuery2.get();
      
      chatRoomsSnapshot2.forEach((doc) => {
        transaction.delete(doc.ref);
      });

      // 4. 알림 삭제
      const notificationsQuery = db
        .collection('notifications')
        .where('user_id', '==', userIdToDelete);
      const notificationsSnapshot = await notificationsQuery.get();
      
      notificationsSnapshot.forEach((doc) => {
        transaction.delete(doc.ref);
      });

      // 5. 사용자 데이터 삭제 (마지막에)
      transaction.delete(userRef);

      logger.info('개인정보 삭제 트랜잭션 시작', {
        userId: userIdToDelete,
        matchingRequests: matchingRequestsSnapshot.size + matchingRequestsToSnapshot.size,
        posts: postsSnapshot.size,
        chatRooms: chatRoomsSnapshot1.size + chatRoomsSnapshot2.size,
        notifications: notificationsSnapshot.size,
      });
    });

    logger.info('개인정보 삭제 완료', { userId: userIdToDelete });

    return {
      success: true,
      message: '개인정보가 성공적으로 삭제되었습니다.',
    };
  } catch (error: any) {
    logger.error('개인정보 삭제 실패', {
      userId: userIdToDelete || 'unknown',
      phoneNumber: phoneNumber || 'unknown',
      error: error.message,
      stack: error.stack,
    });

    if (error instanceof HttpsError) {
      throw error;
    }

    throw new HttpsError(
      'internal',
      error.message || '개인정보 삭제에 실패했습니다.'
    );
  }
});
