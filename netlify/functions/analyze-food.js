// Netlify Function: 음식 텍스트 → 영양정보 JSON (Gemini)
// POST /.netlify/functions/analyze-food
// Body: { name: "닭가슴살 150g, 밥 반 공기, 김치 100g" }

const MODEL = "gemini-2.5-flash-lite";

const PROMPT = (name) => `다음 한국 음식(또는 식사 내역)의 영양정보를 분석하세요.

입력: ${name}

여러 음식이 콤마로 구분돼 있으면 **합산**해서 식사 전체의 영양정보를 반환.
수량/단위(150g, 1개, 반 공기, 한 잔 등)가 명시돼 있으면 정확히 반영.
한국 일반적 식품/식사 기준값 사용.

JSON 형식으로만 응답:

{
  "name": "정규화된 식사 이름 (입력 그대로 또는 간결한 요약)",
  "serving_grams": 총 그램 합계 (예: 닭가슴살150g + 밥 반공기 100g = 250),
  "kcal": 총 칼로리,
  "protein": 총 단백질 g,
  "carbs": 총 탄수화물 g,
  "fat": 총 지방 g,
  "sugar": 총 당류 g,
  "sodium": 총 나트륨 mg,
  "cholesterol": 총 콜레스테롤 mg,
  "saturated_fat": 총 포화지방 g,
  "trans_fat": 총 트랜스지방 g
}

검증: 단백질 4kcal + 탄수 4kcal + 지방 9kcal ≈ 총 kcal 일치하도록.`;

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

  const name = (body.name || "").trim();
  if (!name) return { statusCode: 400, headers: cors, body: JSON.stringify({ error: "name 필드 필요" }) };

  try {
    const apiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: PROMPT(name) }] }],
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
      name: typeof parsed.name === "string" ? parsed.name.trim() : name,
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
    console.error("analyze-food 오류:", err);
    return { statusCode: 500, headers: cors, body: JSON.stringify({ error: String(err.message || err) }) };
  }
};
