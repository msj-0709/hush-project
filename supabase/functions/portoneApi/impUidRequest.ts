import "jsr:@supabase/functions-js/edge-runtime.d.ts";

Deno.serve(async (req) => {
  try {
    // 1. 포트원(아임포트) Access Token 발급
    const tokenRes = await fetch("https://api.iamport.kr/users/getToken", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        imp_key: "3651123322130810",
        imp_secret: "9nQYXnnbznBJSzFUR4SdjBb7ofTwaYh5XgTaNHFYZaUltm0EXz7OQ2S3yjvQSq7AKESz6k8vYKa1Mjj9"
      })
    });
    const tokenData = await tokenRes.json();
    const accessToken = tokenData.response.access_token;

    // 2. 요청 파싱 및 필수값 검증
    const request = await req.json();
    const { imp_uid, otp } = request;
    if (!imp_uid) throw new Error("imp_uid is required");
    if (!otp) throw new Error("otp is required");

    // 3. 본인인증 완료(OTP 인증번호 확인) API 호출
    const apiUrl = `https://api.iamport.kr/certifications/otp/confirm/${imp_uid}`;
    const options = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": accessToken
      },
      body: JSON.stringify({ otp })
    };

    const response = await fetch(apiUrl, options);
    const resData = await response.json();

    if (!response.ok || resData.code !== 0) {
      throw new Error(resData.message || "PortOne 본인인증 완료 API Error");
    }

    // 4. 성공 응답
    const result = {
      status: "success",
      imp_uid: resData.response?.imp_uid || imp_uid,
      portone_response: resData
    };
    return new Response(JSON.stringify(result), {
      headers: { "Content-Type": "application/json" },
      status: 200
    });

  } catch (error) {
    // 5. 에러 처리
    const errorResponse = {
      status: "error",
      error: error.message
    };
    return new Response(JSON.stringify(errorResponse), {
      headers: { "Content-Type": "application/json" },
      status: error instanceof Error ? 400 : 500
    });
  }
});
