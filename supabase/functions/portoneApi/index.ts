import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { parse } from "jsr:@std/toml";

interface PortOneRequest {
	channelkey : string; //채널키
	storeId : string; //상점ID
	customer : customerJson; //고객정보
	operator : operatorValues; //통신사
	method : methodValues; //인증방식
}

interface customerJson { 
	uuid : string; //고객식별자
	name : string; //고객이름
	phoneNumber : string; //고객휴대폰번호
	idCard : string; //주민등록번호
	ipAddress : string; //고객의IP주소
	customerData : string; //사용자 정의 데이터
	bypass? : Record<string,any>; //PG사별 추가 파라미터
}

type OperatorValue = 
	| "SKT"
	| "KT"
	| "LGU"
	| "SKT_MVNO"
	| "KT_MVNO" 
	| "LGU_MVNO";


type Method  = "SMS" | "APP";

//응답
interface Response {
	[key: string]: any;
}

//API REQUEST
async function requestApi (
	verficationId : string, 
	requestData : PortOneRequest
): Promise<Response | undefined> {
	const endpoint = 'https://api.portone.io/identity/verifications/${verifications}/send';
	
	try {
		const Response = await fetch(endpoint, {
			method : "POST",
			headers: {"Content-Type" : "application/json"},
			body : JSON.stringify(requestData)
		})
		return await response.json();
	}catch(error){
		console.error(
			error instanceof Error ? error.message : error
		);
		return undefined;
	}
	
// ===================== Example Usage =====================

// 1. 본인인증 아이디를 지정 (실제 값으로 교체 필요)
const verificationId = "your-identity-verification-id";

// 2. API 요청 바디 준비 (실제 고객 정보와 채널 키 입력)
const requestData: VerificationRequest = {
  channelKey: "channel-key-53bf02ec-e2e6-4fdd-a2a8-2aea11bcf835", // 실제 채널 키 입력
  customer: {
    name: "문서정",             // 고객 이름
    phoneNumber: "01093734546",   // 고객 휴대폰 번호(숫자만)
    ipAddress: "127.0.0.1",       // 고객 IP 주소
    // id, identityNumber, customData, bypass 등 필요시 추가
  },
  operator: "SKT",                // (Optional) 통신사
  method: "SMS",                  // (Optional) 인증 방식
  storeId: "A010002002",    // (Optional) 상점 아이디 필요시 추가
};

// 3. 비동기 함수로 API 요청 실행 및 결과 처리
(async () => {
  // 본인인증 요청 함수 호출, 결과를 response에 할당
  const response = await requestIdentityVerification(verificationId, requestData);

  // 응답이 있으면 콘솔에 출력, 없으면 실패 메시지 출력
  if (response) {
    console.log("Verification Response:", response);
  } else {
    console.log("No response received or request failed.");
  }
})();