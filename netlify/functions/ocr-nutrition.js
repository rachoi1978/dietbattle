// Netlify Function: 영양표/음식 사진 → 구조화된 JSON (Gemini Vision)
// POST /.netlify/functions/ocr-nutrition

const MODEL = "gemini-2.5-flash-lite";
const PROMPT = `이 사진은 한국 식품의 영양정보표 또는 음식 사진입니다.
다음 JSON 형식으로만 응답하세요. (키 순서는 한국 영양성분표 표기 순서와 동일합니다)

{
  "name": "제품명 또는 음식 이름 (한국어)",
  "serving_grams": 1회 분량 g 또는 ml,
  "kcal": 칼로리,
  "sodium": 나트륨 mg,
  "carbs": 탄수화물 g,
  "sugar": 당류 g,
  "fat": 지방 g,
  "trans_fat": 트랜스지방 g,
  "saturated_fat": 포화지방 g,
  "cholesterol": 콜레스테롤 mg,
  "protein": 단백질 g
}

⚠️ 매우 중요 — 단백질 누락 주의:
한국 영양성분표는 [나트륨→탄수화물→당류→지방→트랜스지방→포화지방→콜레스테롤→단백질] 순서로 표기되며, "단백질"은 표 가장 아래쪽에 있습니다. 표를 끝까지 읽어서 반드시 단백질 값을 g 단위로 기입하세요. 거의 모든 식품에 단백질이 표기되어 있으므로 0으로 두지 마세요.

규칙:
- 영양표 사진: 표의 1회분량 기준 그대로
- 음식 사진: 일반 1인분 기준 추정 + name에 "(추정)"
- 영양표에 명시 안 된 값만 0
- 검증: 단백질 4kcal + 탄수 4kcal + 지방 9kcal ≈ 총 kcal (단백질이 0이면 이 검증이 안 맞으니 다시 확인)`;

exports.handler = async (event) => {
  const cors = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
  };

  if (event.httpMethod === "OPTIONS") return { statusCode: 204, headers: cors, body: "" };
  if (event.httpMethod !== "POST") return { statusCode: 405, headers: cors, body: JSON.stringify({ error: "POST only" }) };

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return { statusCode: 500, headers: cors, body: JSON.stringify({ error: "GEMINI_API_KEY 환경변수가 설정되지 않았습니다" }) };
  }

  let body;
  try { body = JSON.parse(event.body || "{}"); }
  catch { return { statusCode: 400, headers: cors, body: JSON.stringify({ error: "Invalid JSON" }) }; }

  if (!body.image) return { statusCode: 400, headers: cors, body: JSON.stringify({ error: "image 필드 필요" }) };

  let imageData = body.image;
  let mediaType = "image/jpeg";
  const dataUrlMatch = imageData.match(/^data:(image\/\w+);base64,(.+)$/);
  if (dataUrlMatch) {
    mediaType = dataUrlMatch[1];
    imageData = dataUrlMatch[2];
  }

  try {
    const apiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{
            parts: [
              { inline_data: { mime_type: mediaType, data: imageData } },
              { text: PROMPT },
            ],
          }],
          generationConfig: {
            maxOutputTokens: 1024,
            responseMimeType: "application/json",
            temperature: 0.2,
          },
        }),
      }
    );

    if (!apiRes.ok) {
      const errText = await apiRes.text();
      console.error("Gemini API 오류:", apiRes.status, errText);
      return {
        statusCode: 502,
        headers: cors,
        body: JSON.stringify({ error: `API 호출 실패 (${apiRes.status})`, detail: errText.slice(0, 200) }),
      };
    }

    const data = await apiRes.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";

    let parsed;
    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      parsed = JSON.parse(jsonMatch ? jsonMatch[0] : text);
    } catch {
      return { statusCode: 500, headers: cors, body: JSON.stringify({ error: "응답 파싱 실패", raw: text.slice(0, 500), finishReason: data?.candidates?.[0]?.finishReason || "unknown", promptFeedback: data?.promptFeedback || null, tokenCount: data?.usageMetadata || null }) };
    }

    const safe = (v, fb = 0) => (typeof v === "number" && isFinite(v) && v >= 0 ? v : fb);
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

    return { statusCode: 200, headers: { ...cors, "Content-Type": "application/json" }, body: JSON.stringify(result) };
  } catch (err) {
    console.error("OCR 함수 오류:", err);
    return { statusCode: 500, headers: cors, body: JSON.stringify({ error: String(err.message || err) }) };
  }
};
