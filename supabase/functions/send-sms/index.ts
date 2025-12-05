// Supabase Edge Function - 알리고 SMS 발송
// 배포: supabase functions deploy send-sms

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// 인증번호 저장 (메모리 - 실제 운영에서는 Redis/DB 사용)
const verificationCodes = new Map<string, { code: string; expiresAt: number }>()

serve(async (req) => {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { phone, action } = await req.json()

    // 환경변수에서 알리고 API 정보 가져오기
    const API_KEY = Deno.env.get('ALIGO_API_KEY')
    const USER_ID = Deno.env.get('ALIGO_USER_ID')
    const SENDER = Deno.env.get('ALIGO_SENDER')

    if (!API_KEY || !USER_ID || !SENDER) {
      return new Response(
        JSON.stringify({ error: 'SMS 설정이 완료되지 않았습니다.' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const cleanPhone = phone.replace(/-/g, '')

    if (action === 'send') {
      // 인증번호 생성
      const code = Math.floor(100000 + Math.random() * 900000).toString()
      const message = `[Attract] 인증번호는 [${code}]입니다. 3분 내에 입력해주세요.`

      // 알리고 API 호출
      const formData = new FormData()
      formData.append('key', API_KEY)
      formData.append('user_id', USER_ID)
      formData.append('sender', SENDER)
      formData.append('receiver', cleanPhone)
      formData.append('msg', message)

      const response = await fetch('https://apis.aligo.in/send/', {
        method: 'POST',
        body: formData,
      })

      const result = await response.json()

      if (result.result_code !== '1') {
        console.error('SMS 발송 실패:', result)
        return new Response(
          JSON.stringify({ error: result.message || 'SMS 발송 실패' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      // 인증번호 저장 (3분 유효)
      verificationCodes.set(cleanPhone, {
        code,
        expiresAt: Date.now() + 3 * 60 * 1000,
      })

      return new Response(
        JSON.stringify({ success: true, message: '인증번호가 발송되었습니다.' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (action === 'verify') {
      const { code: inputCode } = await req.json()
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
      JSON.stringify({ error: '잘못된 요청입니다.' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: '서버 오류가 발생했습니다.' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

