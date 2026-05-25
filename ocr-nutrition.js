// Netlify Function: 영양표 사진 → 구조화된 JSON
// Claude Haiku Vision API 호출 (API 키는 환경변수 ANTHROPIC_API_KEY)
//
// POST /.netlify/functions/ocr-nutrition
// Body: { image: "data:image/jpeg;base64,..." }
// Response: { name, serving_grams, kcal, protein, carbs, fat, sugar, sodium, cholesterol, saturated_fat, trans_fat }

const PROMPT = `이 사진은 한국 식품의 영양정보표 또는 음식 사진입니다.
다음 JSON 형식으로만 응답하세요. 설명 없이 JSON만 출력.

{
  "name": "제품명 (사진에 있으면, 없으면 음식 종류 추정)",
  "serving_grams": 1회분량 그램 또는 ml (숫자만, 없으면 100),
  "kcal": 칼로리,
  "protein": 단백질 g,
  "carbs": 탄수화물 g,
  "fat": 지방 g,
  "sugar": 당류 g,
  "sodium": 나트륨 mg,
  "cholesterol": 콜레스테롤 mg,
  "saturated_fat": 포화지방 g,
  "trans_fat": 트랜스지방 g
}

규칙:
- 영양표 사진이면: 표의 1회분량 기준 수치 그대로 사용
- 음식 사진이면: 일반적인 1인분 기준 추정값 입력 + name에 "(추정)" 표시
- 값이 명시 안 됐거나 0이면 0
- 비숫자 필드(name)는 한국어로
- JSON 외 어떤 텍스트도 포함하지 말 것`;

exports.handler = async (event) => {
  const cors = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
  };

  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 204, headers: cors, body: "" };
  }
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, headers: cors, body: JSON.stringify({ error: "POST only" }) };
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return {
      statusCode: 500,
      headers: cors,
      body: JSON.stringify({ error: "ANTHROPIC_API_KEY 환경변수가 설정되지 않았습니다" }),
    };
  }

  let body;
  try {
    body = JSON.parse(event.body || "{}");
  } catch {
    return { statusCode: 400, headers: cors, body: JSON.stringify({ error: "Invalid JSON" }) };
  }

  if (!body.image) {
    return { statusCode: 400, headers: cors, body: JSON.stringify({ error: "image 필드 필요" }) };
  }

  // data:image/jpeg;base64,XXXX 형식이면 헤더 제거
  let imageData = body.image;
  let mediaType = "image/jpeg";
  const dataUrlMatch = imageData.match(/^data:(image\/\w+);base64,(.+)$/);
  if (dataUrlMatch) {
    mediaType = dataUrlMatch[1];
    imageData = dataUrlMatch[2];
  }

  try {
    const apiRes = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 500,
        messages: [
          {
            role: "user",
            content: [
              { type: "image", source: { type: "base64", media_type: mediaType, data: imageData } },
              { type: "text", text: PROMPT },
            ],
          },
        ],
      }),
    });

    if (!apiRes.ok) {
      const errText = await apiRes.text();
      console.error("Anthropic API 오류:", apiRes.status, errText);
      return {
        statusCode: 502,
        headers: cors,
        body: JSON.stringify({ error: `API 호출 실패 (${apiRes.status})`, detail: errText.slice(0, 200) }),
      };
    }

    const data = await apiRes.json();
    const text = data?.content?.[0]?.text || "";

    // JSON 추출 (혹시 백틱이나 텍스트 섞여있으면 처리)
    let parsed;
    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      parsed = JSON.parse(jsonMatch ? jsonMatch[0] : text);
    } catch (err) {
      return {
        statusCode: 500,
        headers: cors,
        body: JSON.stringify({ error: "응답 파싱 실패", raw: text.slice(0, 300) }),
      };
    }

    // 안전 가공 — null 또는 비정상 값 처리
    const safe = (v, fallback = 0) => (typeof v === "number" && isFinite(v) && v >= 0 ? v : fallback);
    const result = {
      name: typeof parsed.name === "string" ? parsed.name.trim() : "이름 미확인",
      serving_grams: safe(parsed.serving_grams, 100),
      kcal: safe(parsed.kcal),
      protein: safe(parsed.protein),
      carbs: safe(parsed.carbs),
      fat: safe(parsed.fat),
      sugar: safe(parsed.sugar),
      sodium: safe(parsed.sodium),
      cholesterol: safe(parsed.cholesterol),
      saturated_fat: safe(parsed.saturated_fat),
      trans_fat: safe(parsed.trans_fat),
    };

    return {
      statusCode: 200,
      headers: { ...cors, "Content-Type": "application/json" },
      body: JSON.stringify(result),
    };
  } catch (err) {
    console.error("OCR 함수 오류:", err);
    return {
      statusCode: 500,
      headers: cors,
      body: JSON.stringify({ error: String(err.message || err) }),
    };
  }
};
