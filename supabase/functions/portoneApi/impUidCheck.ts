async function confirmCertification({
  impUid,
  otp,
  accessToken
}: {
  impUid: string;
  otp: string;
  accessToken: string;
}) {
  const apiUrl = `https://api.iamport.kr/certifications/otp/confirm/${impUid}`;
  const response = await fetch(apiUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": accessToken
    },
    body: JSON.stringify({
      otp: otp
    })
  });
  const data = await response.json();
  if (!response.ok || data.code !== 0) {
    throw new Error(data.message || "본인인증 완료 API 호출 실패");
  }
  return data.response;
}
