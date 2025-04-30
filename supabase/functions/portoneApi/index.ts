import "jsr:@supabase/functions-js/edge-runtime.d.ts";

// 요청 본문 타입 정의
interface PortoneRequest {
  identityVerificationId: string;
  customer: SendIdentityVerificationBodyCustomer;
  storeId: string;
  operator?: any;
  method?: string;
}

interface SendIdentityVerificationBodyCustomer {
  id?: string;               // 식별 아이디 (선택)
  name: string;              // 이름 (필수)
  phoneNumber: string;       // 전화번호 (필수, 숫자만)
  identityNumber?: string;   // 주민등록번호 앞 7자리 (SMS 방식 필수)
  ipAddress: string;         // IP 주소 (필수)
}


// 포트원 응답 타입 정의
interface PortoneResponse {
  status: string;
  verification_id?: string;
  error?: string;
}

Deno.serve(async (req) => {
  try {
    // 1. 환경변수 로드
    const portoneUrl = Deno.env.get("portone_api_url");
    const channelKey = Deno.env.get("portone_channel_key");

    // 2. 환경변수 검증
    if (!portoneUrl || !channelKey) {
      throw new Error("PORTONE_API_URL and PORTONE_CHANNEL_KEY must be set in environment variables");
    }

    // 3. 요청 본문 파싱 및 검증
    const request: PortoneRequest = await req.json();
    if (!request.identityVerificationId) {
      throw new Error("identityVerificationId is required");
    }

    // 4. 포트원 API 호출 설정
    const apiUrl = `${portoneUrl}/${request.identityVerificationId}/send`;
    const options = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${channelKey}` // 채널 키 사용
      },
      body: JSON.stringify({
        customer: request.customer || null,
        operator: request.operator || null,
        method: request.method || null
      })
    };

    // 5. 포트원 API 호출
    const response = await fetch(apiUrl, options);
    
    // 6. 응답 처리
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "PortOne API Error");
    }

    // 7. 성공 응답
    const result: PortoneResponse = {
      status: "success",
      verification_id: request.identityVerificationId
    };

    return new Response(
      JSON.stringify(result),
      { 
        headers: { "Content-Type": "application/json" },
        status: 200
      }
    );

  } catch (error) {
    // 8. 에러 처리
    const errorResponse: PortoneResponse = {
      status: "error",
      error: error.message
    };

    return new Response(
      JSON.stringify(errorResponse),
      { 
        headers: { "Content-Type": "application/json" },
        status: error instanceof Error ? 400 : 500
      }
    );
  }
});

