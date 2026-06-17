// Netlify Function: 영양표/음식 사진 → 구조화된 JSON (Gemini Vision)
// POST /.netlify/functions/ocr-nutrition

const MODEL = "gemini-2.5-flash-lite";
// 과부하(503) 시 순서대로 폴백할 모델 체인
const MODEL_CHAIN = ["gemini-2.5-flash-lite", "gemini-2.0-flash", "gemini-2.5-flash"];
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// Gemini 호출 — 일시 오류(429/500/502/503)면 재시도 + 모델 폴백
async function callGeminiWithFallback(apiKey, requestBody) {
  let lastErr = { status: 0, text: "" };
  for (const model of MODEL_CHAIN) {
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const res = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
          { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(requestBody) }
        );
        if (res.ok) return { ok: true, res };
        const errText = await res.text();
        lastErr = { status: res.status, text: errText };
        const transient = [429, 500, 502, 503].includes(res.status);
        if (!transient) return { ok: false, ...lastErr };
        if (attempt === 0) await sleep(1000);
      } catch (e) {
        lastErr = { status: 0, text: String(e.message || e) };
        await sleep(800);
      }
    }
  }
  return { ok: false, ...lastErr };
}
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

// ─── 인증: 로그인한 사용자만 호출 가능 ──────────────────
// Supabase 토큰 검증. 설정은 환경변수 우선, 없으면 사이트의 공개 config 폴백.
let _sbConfig = null;
async function getSupabaseConfig() {
  if (_sbConfig) return _sbConfig;
  let url = process.env.SUPABASE_URL;
  let anonKey = process.env.SUPABASE_ANON_KEY;
  if (!url || !anonKey) {
    try {
      const siteUrl = process.env.URL || "https://strong-tulumba-c3bff6.netlify.app";
      const res = await fetch(`${siteUrl}/supabase-config.json`);
      if (res.ok) {
        const cfg = await res.json();
        url = url || cfg.url || cfg.supabaseUrl;
        anonKey = anonKey || cfg.anonKey || cfg.supabaseAnonKey;
      }
    } catch {}
  }
  if (url && anonKey) _sbConfig = { url, anonKey };
  return _sbConfig;
}

async function verifyUser(event) {
  const authHeader = event.headers.authorization || event.headers.Authorization || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
  if (!token) return null;
  const cfg = await getSupabaseConfig();
  if (!cfg) return null;
  try {
    const res = await fetch(`${cfg.url}/auth/v1/user`, {
      headers: { Authorization: `Bearer ${token}`, apikey: cfg.anonKey },
    });
    if (!res.ok) return null;
    const user = await res.json();
    return user && user.id ? user : null;
  } catch {
    return null;
  }
}

exports.handler = async (event) => {
  const cors = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
  };

  if (event.httpMethod === "OPTIONS") return { statusCode: 204, headers: cors, body: "" };
  if (event.httpMethod !== "POST") return { statusCode: 405, headers: cors, body: JSON.stringify({ error: "POST only" }) };

  // 로그인한 사용자만 영양정보 스캔 사용 가능 (비용 도용 방지)
  const user = await verifyUser(event);
  if (!user) {
    return { statusCode: 401, headers: cors, body: JSON.stringify({ error: "로그인이 필요합니다" }) };
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return { statusCode: 500, headers: cors, body: JSON.stringify({ error: "GEMINI_API_KEY 환경변수가 설정되지 않았습니다" }) };
  }

  let body;
  try { body = JSON.parse(event.body || "{}"); }
  catch { return { statusCode: 400, headers: cors, body: JSON.stringify({ error: "Invalid JSON" }) }; }

  if (!body.image) return { statusCode: 400, headers: cors, body: JSON.stringify({ error: "image 필드 필요" }) };
  // 이미지 크기 제한 (base64 약 8MB ≈ 원본 6MB) — 과대 요청 차단
  if (body.image.length > 8 * 1024 * 1024) {
    return { statusCode: 413, headers: cors, body: JSON.stringify({ error: "이미지가 너무 큽니다" }) };
  }

  let imageData = body.image;
  let mediaType = "image/jpeg";
  const dataUrlMatch = imageData.match(/^data:(image\/\w+);base64,(.+)$/);
  if (dataUrlMatch) {
    mediaType = dataUrlMatch[1];
    imageData = dataUrlMatch[2];
  }

  try {
    const requestBody = {
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
    };
    const { ok, res: apiRes, status, text: errText } = await callGeminiWithFallback(apiKey, requestBody);

    if (!ok) {
      console.error("Gemini API 오류(폴백 모두 실패):", status, errText);
      const overloaded = [429, 500, 502, 503].includes(status);
      return {
        statusCode: overloaded ? 503 : 502,
        headers: cors,
        body: JSON.stringify({
          error: overloaded
            ? "AI가 잠시 바빠요. 30초 후 다시 시도해 주세요."
            : `스캔에 실패했어요 (${status}). 잠시 후 다시 시도해 주세요.`,
          retryable: overloaded,
        }),
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
