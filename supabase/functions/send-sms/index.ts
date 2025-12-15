// Supabase Edge Function - 쏘다(Ssodaa) SMS 발송
// 배포: supabase functions deploy send-sms --no-verify-jwt

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Max-Age': '86400',
}

// 인증번호 저장 (메모리 - Edge Function 인스턴스별로 독립)
const verificationCodes = new Map<string, { code: string; expiresAt: number }>()

serve(async (req) => {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { 
      status: 200,
      headers: corsHeaders 
    })
  }

  try {
    const body = await req.json()
    const { phone, action, code: inputCode } = body

    // 환경변수에서 쏘다 API 정보 가져오기
    const API_KEY = Deno.env.get('SSODAA_API_KEY')
    const TOKEN_KEY = Deno.env.get('SSODAA_TOKEN_KEY')
    const SENDER = Deno.env.get('SSODAA_SENDER')

    if (!API_KEY || !TOKEN_KEY || !SENDER) {
      console.error('SMS 환경변수 누락:', { API_KEY: !!API_KEY, TOKEN_KEY: !!TOKEN_KEY, SENDER: !!SENDER })
      return new Response(
        JSON.stringify({ success: false, error: 'SMS 설정이 완료되지 않았습니다.' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const cleanPhone = phone.replace(/-/g, '').replace(/^\+82/, '0')

    // 인증번호 발송
    if (action === 'send') {
      // 인증번호 생성
      const code = Math.floor(100000 + Math.random() * 900000).toString()
      const message = `[Attract] 인증번호는 [${code}]입니다. 3분 내에 입력해주세요.`

      // 쏘다 API 호출
      const response = await fetch('https://apis.ssodaa.com/sms/send/sms', {
        method: 'POST',
        headers: {
          'x-api-key': API_KEY,
          'Content-Type': 'application/json; charset=utf-8',
        },
        body: JSON.stringify({
          token_key: TOKEN_KEY,
          msg_type: 'sms',
          dest_phone: cleanPhone,
          send_phone: SENDER,
          msg_body: message,
        }),
      })

      const result = await response.json()
      console.log('쏘다 API 응답:', result)

      if (result.code !== '200') {
        console.error('SMS 발송 실패:', result)
        return new Response(
          JSON.stringify({ success: false, error: result.error || 'SMS 발송 실패' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      // 인증번호 저장 (3분 유효)
      verificationCodes.set(cleanPhone, {
        code,
        expiresAt: Date.now() + 3 * 60 * 1000,
      })

      console.log('인증번호 발송 성공:', cleanPhone)
      return new Response(
        JSON.stringify({ success: true, message: '인증번호가 발송되었습니다.' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // 인증번호 확인
    if (action === 'verify') {
      const stored = verificationCodes.get(cleanPhone)

      if (!stored) {
        return new Response(
          JSON.stringify({ success: false, message: '인증번호를 먼저 요청해주세요.' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      if (Date.now() > stored.expiresAt) {
        verificationCodes.delete(cleanPhone)
        return new Response(
          JSON.stringify({ success: false, message: '인증번호가 만료되었습니다.' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      if (stored.code === inputCode) {
        verificationCodes.delete(cleanPhone)
        console.log('인증 성공:', cleanPhone)
        return new Response(
          JSON.stringify({ success: true, message: '인증 성공!' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      return new Response(
        JSON.stringify({ success: false, message: '인증번호가 일치하지 않습니다.' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({ success: false, error: '잘못된 요청입니다. action: send 또는 verify' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ success: false, error: '서버 오류가 발생했습니다.' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
