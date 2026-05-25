// Netlify Function: 음식 이름 텍스트 → Claude → 구조화된 영양정보 JSON
// POST /.netlify/functions/analyze-food
// Body: { name: "마라탕 1인분" }

const PROMPT_TEMPLATE = (name) => `다음 한국 음식의 1인분 기준 영양정보를 추정하세요.
JSON 형식으로만 응답. 설명·머리말·꼬리말 없이 JSON만.

음식: ${name}

{
  "name": "정규화된 음식명 (수량 단위 제외, 순수 음식 이름만)",
  "serving_grams": 1인분 기준 그램(또는 ml) 숫자,
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
- 한국에서 일반적으로 섭취하는 1인분 기준 (식약처 또는 일반 음식점 기준)
- 값이 거의 0이면 0으로 입력
- 단백질/탄수화물/지방 합산이 kcal과 대략 맞게 (단백 4kcal + 탄 4kcal + 지방 9kcal)
- 추측이 어려운 모호한 입력이면 모든 값 0으로 응답`;

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
  try { body = JSON.parse(event.body || "{}"); }
  catch { return { statusCode: 400, headers: cors, body: JSON.stringify({ error: "Invalid JSON" }) }; }

  const name = (body.name || "").trim();
  if (!name) {
    return { statusCode: 400, headers: cors, body: JSON.stringify({ error: "name 필드 필요" }) };
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
        max_tokens: 400,
        messages: [{ role: "user", content: PROMPT_TEMPLATE(name) }],
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

    let parsed;
    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      parsed = JSON.parse(jsonMatch ? jsonMatch[0] : text);
    } catch {
      return {
        statusCode: 500,
        headers: cors,
        body: JSON.stringify({ error: "응답 파싱 실패", raw: text.slice(0, 300) }),
      };
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

    return {
      statusCode: 200,
      headers: { ...cors, "Content-Type": "application/json" },
      body: JSON.stringify(result),
    };
  } catch (err) {
    console.error("analyze-food 오류:", err);
    return {
      statusCode: 500,
      headers: cors,
      body: JSON.stringify({ error: String(err.message || err) }),
    };
  }
};
