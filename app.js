import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const STATE_PREFIX = "diet-battle-state-v10:";
const today = new Date();

let supabase = null;
let authUser = null;
let authConfig = null;
let state = defaultState();
const AUTH_CONFIG_PATHS = ["/supabase-config.json", "/api/supabase/config", "/config"];

const els = {
  authScreen: document.querySelector("#auth-screen"),
  appShell: document.querySelector("#app-shell"),
  authMessage: document.querySelector("#auth-message"),
  loginKakao: document.querySelector("#login-kakao"),
  loginGoogle: document.querySelector("#login-google"),
  logout: document.querySelector("#logout"),
  resetProfile: document.querySelector("#reset-profile"),
  brandHome: document.querySelector("#brand-home"),
  userPill: document.querySelector("#user-pill"),
  monthNav: document.querySelector("#month-nav"),
  monthLabel: document.querySelector("#month-label"),
  prevMonth: document.querySelector("#prev-month"),
  nextMonth: document.querySelector("#next-month"),
  onboardingView: document.querySelector("#onboarding-view"),
  onboardingForm: document.querySelector("#onboarding-form"),
  onbAge: document.querySelector("#onb-age"),
  onbHeight: document.querySelector("#onb-height"),
  onbWeight: document.querySelector("#onb-weight"),
  onbLoss: document.querySelector("#onb-loss"),
  onbCycle: document.querySelector("#onb-cycle"),
  onbLastPeriod: document.querySelector("#onb-last-period"),
  genderPair: document.querySelector("#gender-pair"),
  cycleBox: document.querySelector("#cycle-box"),
  activityPair: document.querySelector("#activity-pair"),
  conditionsList: document.querySelector("#conditions-list"),
  weeklyView: document.querySelector("#weekly-view"),
  dailyView: document.querySelector("#daily-view"),
  calendarGrid: document.querySelector("#calendar-grid"),
  appliedGoalBody: document.querySelector("#applied-goal-body"),
  weeklyTable: document.querySelector("#weekly-table"),
  coachMessage: document.querySelector("#coach-message"),
  resetWeek: document.querySelector("#reset-week"),
  backToWeek: document.querySelector("#back-to-week"),
  selectedDate: document.querySelector("#selected-date"),
  miniWeek: document.querySelector("#mini-week-strip"),
  netCalValue: document.querySelector("#net-cal-value"),
  netCalIntake: document.querySelector("#net-cal-intake"),
  netCalBurn: document.querySelector("#net-cal-burn"),
  netCalResult: document.querySelector("#net-cal-result"),
  netCalBadge: document.querySelector("#net-cal-badge"),
  calorieTotal: document.querySelector("#calorie-total"),
  calorieStatus: document.querySelector("#calorie-status"),
  waterTotal: document.querySelector("#water-total"),
  waterStatus: document.querySelector("#water-status"),
  waterMinus: document.querySelector("#water-minus"),
  waterPlus: document.querySelector("#water-plus"),
  exerciseDayTotal: document.querySelector("#exercise-day-total"),
  exerciseDetail: document.querySelector("#exercise-detail"),
  exerciseSteppers: document.querySelector("#exercise-steppers"),
  mealList: document.querySelector("#meal-list"),
  mealCount: document.querySelector("#meal-count"),
  macrosBody: document.querySelector("#macros-body"),
  nutrientsGrid: document.querySelector("#nutrients-grid"),
  nutrientsSub: document.querySelector("#nutrients-sub"),
  byfoodList: document.querySelector("#byfood-list"),
  diseaseContainer: document.querySelector("#disease-container"),
  mealEntryPanel: document.querySelector("#meal-entry-panel"),
  mealEntryForm: document.querySelector("#meal-entry-form"),
  mealEntryLog: document.querySelector("#meal-entry-log"),
  mealInput: document.querySelector("#meal-entry-input"),
  saveRecordButton: document.querySelector("#save-record-button"),
  saveRecordHint: document.querySelector("#save-record-hint"),
  myFoodsOpen: document.querySelector("#my-foods-open"),
  myFoodsModal: document.querySelector("#my-foods-modal"),
  myFoodsClose: document.querySelector("#my-foods-close"),
  myFoodsList: document.querySelector("#my-foods-list"),
  ocrOpen: document.querySelector("#ocr-open"),
  ocrCameraInput: document.querySelector("#ocr-camera-input"),
  ocrModal: document.querySelector("#ocr-modal"),
  ocrClose: document.querySelector("#ocr-close"),
  ocrHint: document.querySelector("#ocr-hint"),
  ocrForm: document.querySelector("#ocr-form"),
  ocrName: document.querySelector("#ocr-name"),
  ocrServing: document.querySelector("#ocr-serving"),
  ocrKcal: document.querySelector("#ocr-kcal"),
  ocrProtein: document.querySelector("#ocr-protein"),
  ocrCarbs: document.querySelector("#ocr-carbs"),
  ocrFat: document.querySelector("#ocr-fat"),
  ocrSugar: document.querySelector("#ocr-sugar"),
  ocrSodium: document.querySelector("#ocr-sodium"),
  ocrChol: document.querySelector("#ocr-chol"),
  ocrSatfat: document.querySelector("#ocr-satfat"),
  ocrCancel: document.querySelector("#ocr-cancel"),
  ocrAddMeal: document.querySelector("#ocr-add-meal"),
  ocrSaveFavorite: document.querySelector("#ocr-save-favorite"),
};

const exerciseTypes = {
  walk: { label: "걷기", met: 3.5, icon: "ti-walk", color: "green" },
  run: { label: "달리기", met: 8.3, icon: "ti-run", color: "coral" },
  strength: { label: "웨이트", met: 5.0, icon: "ti-barbell", color: "purple" },
  swim: { label: "수영", met: 7.0, icon: "ti-swimming", color: "teal" },
  dance: { label: "댄스", met: 5.0, icon: "ti-music", color: "pink" },
  hike: { label: "등산", met: 6.5, icon: "ti-mountain", color: "amber" },
  bike: { label: "자전거", met: 6.5, icon: "ti-bike", color: "blue" },
  yoga: { label: "필라테스/요가", met: 3.0, icon: "ti-yoga", color: "lavender" },
};

const ACTIVITY_LEVELS = {
  1: { label: "아주 적음", multiplier: 1.2 },
  2: { label: "적음", multiplier: 1.375 },
  3: { label: "보통", multiplier: 1.55 },
  4: { label: "많음", multiplier: 1.725 },
  5: { label: "아주 많음", multiplier: 1.9 },
};

const CONDITION_KEYS = ["diabetes", "hyperlipidemia", "hypertension", "fattyLiver"];
const CONDITION_LABELS = {
  diabetes: "당뇨",
  hyperlipidemia: "고지혈증",
  hypertension: "고혈압",
  fattyLiver: "지방간",
};


async function initAuth() {
  try {
    authConfig = await loadAuthConfig();
  } catch {
    showAuth("Supabase 설정을 불러오지 못했습니다. 서버를 다시 실행해 주세요.");
    return;
  }

  if (!authConfig.enabled) {
    showAuth("api/supabase/config 파일에 Supabase URL과 anon key를 설정한 뒤 다시 배포해 주세요.");
    return;
  }

  supabase = createClient(authConfig.url, authConfig.anonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: false,
    },
  });

  const redirectError = authRedirectError();
  if (redirectError) {
    history.replaceState(null, "", "/");
    showAuth(redirectError);
    return;
  }

  try {
    await handleOAuthRedirectIfPresent();
  } catch (error) {
    history.replaceState(null, "", "/");
    showAuth(`로그인 처리 실패: ${error.message || error}`);
    return;
  }

  const { data, error } = await supabase.auth.getSession();
  if (error) {
    showAuth(error.message);
    return;
  }

  if (data.session?.user) {
    enterDashboard(data.session.user);
  } else {
    showAuth();
  }

  supabase.auth.onAuthStateChange((event, session) => {
    if (event === "SIGNED_IN" && session?.user) enterDashboard(session.user);
    if (event === "SIGNED_OUT") showAuth();
  });
}

async function loadAuthConfig() {
  let lastError = null;

  for (const path of AUTH_CONFIG_PATHS) {
    try {
      const response = await fetch(`${path}?v=${Date.now()}`, { cache: "no-store" });
      if (!response.ok) throw new Error(`${path} returned ${response.status}`);

      const config = await response.json();
      return {
        enabled: config.enabled,
        url: config.url || config.supabaseUrl,
        anonKey: config.anonKey || config.supabaseAnonKey,
        redirectTo: config.redirectTo,
      };
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError || new Error("Supabase config not found");
}

function authRedirectError() {
  const query = new URLSearchParams(window.location.search);
  const hash = new URLSearchParams(window.location.hash.replace(/^#/, ""));
  return (
    query.get("error_description") ||
    hash.get("error_description") ||
    query.get("error") ||
    hash.get("error") ||
    ""
  );
}

async function handleOAuthRedirectIfPresent() {
  const hash = new URLSearchParams(window.location.hash.replace(/^#/, ""));
  const accessToken = hash.get("access_token");
  const refreshToken = hash.get("refresh_token");

  if (accessToken && refreshToken) {
    const { error } = await supabase.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken,
    });
    if (error) throw error;
    history.replaceState(null, "", "/dashboard");
    return;
  }

  await exchangeOAuthCodeIfPresent();
}

async function exchangeOAuthCodeIfPresent() {
  const query = new URLSearchParams(window.location.search);
  const code = query.get("code");
  if (!code) return;
  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) throw error;
  history.replaceState(null, "", "/dashboard");
}

async function signInWithProvider(provider) {
  if (!supabase || !authConfig?.enabled) {
    showAuth("api/supabase/config 파일에 Supabase URL과 anon key를 먼저 설정해 주세요.");
    return;
  }

  const { error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: dashboardRedirectUrl(),
    },
  });
  if (error) showAuth(error.message);
}

function dashboardRedirectUrl() {
  return `${window.location.origin}/dashboard`;
}

async function signOut() {
  saveState();
  if (supabase) await supabase.auth.signOut();
  authUser = null;
  state = defaultState();
  history.replaceState(null, "", "/");
  showAuth();
}

async function enterDashboard(user) {
  authUser = user;
  state = await loadState();
  showApp();
  if (location.pathname !== "/dashboard") history.replaceState(null, "", "/dashboard");
  render();
}

function showAuth(message = "") {
  authUser = null;
  els.authScreen.classList.remove("is-hidden");
  els.appShell.classList.add("is-hidden");
  els.authMessage.textContent = message;
}

function showApp() {
  els.authScreen.classList.add("is-hidden");
  els.appShell.classList.remove("is-hidden");
  els.userPill.textContent = `${displayName(authUser)} 님`;
}

function displayName(user) {
  return (
    user?.user_metadata?.full_name ||
    user?.user_metadata?.name ||
    user?.user_metadata?.nickname ||
    user?.email ||
    "Diet Player"
  );
}

function stateKey() {
  return `${STATE_PREFIX}${authUser.id}`;
}

function defaultState() {
  const isoToday = toISO(today);
  return {
    view: "onboarding",
    selectedDate: isoToday,
    visibleMonth: isoToday.slice(0, 7),
    days: {},
    weeklyFeedback: {},
    profile: {
      onboarded: false,
      age: "",
      gender: "",
      cyclePattern: "",
      lastPeriodDate: "",
      activityLevel: 3,
      height: "",
      weight: "",
      loss: "",
      conditions: {
        diabetes: { checked: false, values: {} },
        hyperlipidemia: { checked: false, values: {} },
        hypertension: { checked: false, values: {} },
        fattyLiver: { checked: false, values: {} },
      },
      targets: null,
      pendingRecommendation: null,
      appliedPlan: null,
      activeWeekStart: null,
    },
  };
}

function defaultProfile() {
  return defaultState().profile;
}

// 저장된 state 객체를 정규화·머지해서 사용 가능한 state로 변환
function mergeSavedState(saved) {
  const base = defaultState();
  if (!saved) return base;
  const baseProf = base.profile;
  const savedProf = saved.profile || {};
  const mergedConditions = { ...baseProf.conditions };
  if (savedProf.conditions) {
    for (const key of CONDITION_KEYS) {
      if (savedProf.conditions[key]) {
        mergedConditions[key] = {
          checked: Boolean(savedProf.conditions[key].checked),
          values: { ...(savedProf.conditions[key].values || {}) },
        };
      }
    }
  }
  const profile = { ...baseProf, ...savedProf, conditions: mergedConditions };
  if (!profile.onboarded && profile.targets) profile.onboarded = true;
  const view = profile.onboarded ? saved.view || "weekly" : "onboarding";
  return {
    ...base,
    ...saved,
    view,
    profile,
    weeklyFeedback: saved.weeklyFeedback || {},
  };
}

// 두 state를 안전하게 머지 — days는 합집합, 충돌 시 풍부한 쪽 우선
function smartMergeState(localSaved, remoteSaved) {
  if (!localSaved && !remoteSaved) return null;
  if (!localSaved) return remoteSaved;
  if (!remoteSaved) return localSaved;

  const localTime = new Date(localSaved._updated_at || 0).getTime();
  const remoteTime = new Date(remoteSaved._updated_at || 0).getTime();
  const newer = remoteTime >= localTime ? remoteSaved : localSaved;
  const older = remoteTime >= localTime ? localSaved : remoteSaved;

  // days: 합집합 — 어느 쪽에든 존재하면 절대 버리지 않음
  // 같은 날짜 충돌 시: meals 개수 많은 쪽 우선 (실제 기록일 가능성 높음)
  const mergedDays = { ...(older.days || {}) };
  for (const date in newer.days || {}) {
    const n = newer.days[date];
    const o = older.days?.[date];
    if (!o) {
      mergedDays[date] = n;
    } else {
      const nMeals = n.meals?.length || 0;
      const oMeals = o.meals?.length || 0;
      const nWater = n.water || 0;
      const oWater = o.water || 0;
      const nExSum = Object.values(n.exercise || {}).reduce((a, b) => a + (b || 0), 0);
      const oExSum = Object.values(o.exercise || {}).reduce((a, b) => a + (b || 0), 0);
      const nScore = nMeals * 10 + (nWater > 0 ? 1 : 0) + (nExSum > 0 ? 1 : 0);
      const oScore = oMeals * 10 + (oWater > 0 ? 1 : 0) + (oExSum > 0 ? 1 : 0);
      mergedDays[date] = nScore >= oScore ? n : o;
    }
  }

  // weeklyFeedback도 합집합 (둘 다 있으면 newer 우선)
  const mergedFeedback = { ...(older.weeklyFeedback || {}), ...(newer.weeklyFeedback || {}) };

  return {
    ...newer,
    days: mergedDays,
    weeklyFeedback: mergedFeedback,
  };
}

async function loadState() {
  // 1. localStorage 로드
  const localRaw = localStorage.getItem(stateKey());
  const localSaved = localRaw ? JSON.parse(localRaw) : null;

  // 2. Supabase user_data 로드 시도
  let remoteSaved = null;
  if (supabase && authUser) {
    try {
      const { data, error } = await supabase
        .from("user_data")
        .select("state, updated_at")
        .eq("user_id", authUser.id)
        .maybeSingle();
      if (!error && data && data.state) {
        remoteSaved = { ...data.state, _updated_at: data.updated_at };
      }
    } catch (err) {
      console.warn("user_data 원격 로드 실패:", err);
    }
  }

  // 3. 안전 머지 (한쪽 통째로 버리지 않고 days 합집합)
  const saved = smartMergeState(localSaved, remoteSaved);

  return mergeSavedState(saved);
}

// Supabase 동기화 debounce — 연속 변경 시 마지막 1초 후 한 번만 저장
let syncStateTimeout = null;
async function syncStateToSupabase() {
  if (!supabase || !authUser) return;
  if (syncStateTimeout) clearTimeout(syncStateTimeout);
  syncStateTimeout = setTimeout(async () => {
    try {
      const { error } = await supabase
        .from("user_data")
        .upsert({ user_id: authUser.id, state }, { onConflict: "user_id" });
      if (error) console.warn("user_data 동기화 오류:", error);
    } catch (err) {
      console.warn("user_data 동기화 실패:", err);
    }
  }, 1000);
}

function saveState() {
  if (!authUser) return;
  // updated_at 기록 (충돌 처리용)
  state._updated_at = new Date().toISOString();
  // 1. localStorage 즉시 저장
  localStorage.setItem(stateKey(), JSON.stringify(state));
  // 2. Supabase 비동기 동기화 (debounce)
  syncStateToSupabase();
}

function toISO(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function fromISO(iso) {
  const [year, month, day] = iso.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function dayLabel(iso) {
  return fromISO(iso).toLocaleDateString("ko-KR", {
    month: "long",
    day: "numeric",
    weekday: "long",
  });
}

function emptyDay() {
  // exerciseTypes에 정의된 모든 운동을 0으로 초기화
  const exercise = Object.fromEntries(Object.keys(exerciseTypes).map((k) => [k, 0]));
  return { meals: [], water: 0, exercise };
}

function getDay(iso = state.selectedDate) {
  if (!state.days[iso]) state.days[iso] = emptyDay();
  const exDefault = emptyDay().exercise;
  if (!state.days[iso].exercise) state.days[iso].exercise = { ...exDefault };
  else state.days[iso].exercise = { ...exDefault, ...state.days[iso].exercise };
  return state.days[iso];
}

function totalsFor(iso = state.selectedDate) {
  const day = getDay(iso);
  return day.meals.reduce(
    (acc, meal) => ({
      kcal: acc.kcal + (meal.kcal || 0),
      protein: acc.protein + (meal.protein || 0),
      carbs: acc.carbs + (meal.carbs || 0),
      fat: acc.fat + (meal.fat || 0),
      sugar: acc.sugar + (meal.sugar || 0),
      sodium: acc.sodium + (meal.sodium || 0),
      cholesterol: acc.cholesterol + (meal.cholesterol || 0),
      saturatedFat: acc.saturatedFat + (meal.saturatedFat || 0),
      water: day.water,
    }),
    { kcal: 0, protein: 0, carbs: 0, fat: 0, sugar: 0, sodium: 0, cholesterol: 0, saturatedFat: 0, water: day.water },
  );
}

function currentWeight() {
  return Number(state.profile.weight || 70);
}

function hasTargets() {
  return Boolean(state.profile.targets);
}

function targetFor(key) {
  return Number(state.profile.targets?.[key] || 0);
}

function monthDate() {
  const [year, month] = state.visibleMonth.split("-").map(Number);
  return new Date(year, month - 1, 1);
}

function startOfWeek(date) {
  const copy = new Date(date);
  const day = (copy.getDay() + 6) % 7;
  copy.setDate(copy.getDate() - day);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

function weekKeyFor(iso = state.selectedDate) {
  return toISO(startOfWeek(fromISO(iso)));
}

function previousWeekKey() {
  const date = startOfWeek(fromISO(state.selectedDate));
  date.setDate(date.getDate() - 7);
  return toISO(date);
}

function getWeekDates(iso = state.selectedDate) {
  const start = startOfWeek(fromISO(iso));
  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(start);
    date.setDate(start.getDate() + index);
    return toISO(date);
  });
}

function render() {
  if (!authUser) return;
  const view = state.profile.onboarded ? state.view : "onboarding";
  showView(view);
  if (view === "onboarding") {
    renderOnboarding();
  } else if (view === "daily") {
    renderDay();
  } else {
    renderApplied();
    renderMonthCalendar();
    renderWeekly();
  }
  saveState();
}

let lastShownView = null;
function showView(view) {
  els.onboardingView.classList.toggle("is-hidden", view !== "onboarding");
  els.weeklyView.classList.toggle("is-hidden", view !== "weekly");
  els.dailyView.classList.toggle("is-hidden", view !== "daily");
  els.monthNav.classList.toggle("is-hidden", view !== "weekly");
  els.brandHome.classList.toggle("is-hidden", view === "onboarding");
  els.resetProfile.classList.toggle("is-hidden", view === "onboarding" || !state.profile.onboarded);
  if (lastShownView !== view && typeof window !== "undefined" && window.scrollTo) {
    window.scrollTo({ top: 0, behavior: "instant" in window ? "instant" : "auto" });
  }
  lastShownView = view;
}

// ───── ONBOARDING ────────────────────────────────────────
function renderOnboarding() {
  const p = state.profile;
  if (els.onbAge) els.onbAge.value = p.age || "";
  if (els.onbHeight) els.onbHeight.value = p.height || "";
  if (els.onbWeight) els.onbWeight.value = p.weight || "";
  if (els.onbLoss) els.onbLoss.value = p.loss || "";
  if (els.onbCycle) els.onbCycle.value = p.cyclePattern || "";
  if (els.onbLastPeriod) els.onbLastPeriod.value = p.lastPeriodDate || "";

  els.genderPair.querySelectorAll(".toggle-option").forEach((btn) => {
    btn.classList.toggle("is-active", btn.dataset.value === p.gender);
  });
  els.cycleBox.classList.toggle("is-hidden", p.gender !== "female");

  els.activityPair.querySelectorAll(".activity-option").forEach((btn) => {
    btn.classList.toggle("is-active", Number(btn.dataset.value) === Number(p.activityLevel));
  });

  renderConditionsList();
}

function renderConditionsList() {
  const valuesByKey = {
    diabetes: [
      { name: "fastingGlucose", label: "공복혈당 (mg/dL)", placeholder: "예: 110 또는 모름" },
      { name: "hba1c", label: "HbA1c (%)", placeholder: "예: 6.2 또는 모름" },
    ],
    hyperlipidemia: [
      { name: "ldl", label: "LDL 콜레스테롤 (mg/dL)", placeholder: "예: 145 또는 모름" },
    ],
    hypertension: [
      { name: "systolic", label: "수축기 (mmHg)", placeholder: "예: 135" },
      { name: "diastolic", label: "이완기 (mmHg)", placeholder: "예: 88" },
    ],
    fattyLiver: [
      { name: "ast", label: "AST (U/L)", placeholder: "예: 45 또는 모름" },
      { name: "alt", label: "ALT (U/L)", placeholder: "예: 55 또는 모름" },
    ],
  };

  els.conditionsList.innerHTML = CONDITION_KEYS.map((key) => {
    const cond = state.profile.conditions[key];
    const fields = valuesByKey[key] || [];
    const valuesHTML =
      cond.checked && fields.length
        ? `<div class="condition-values ${fields.length > 1 ? "two-col" : ""}">
            ${fields
              .map(
                (f) => `
                <label>${f.label}
                  <input type="text" data-cond="${key}" data-field="${f.name}" placeholder="${f.placeholder}" value="${escapeHTML(cond.values[f.name] || "")}" />
                </label>`,
              )
              .join("")}
          </div>`
        : "";
    return `
      <div class="condition-item ${cond.checked ? "is-checked" : ""}">
        <label class="checkbox-row">
          <input type="checkbox" data-condition="${key}" ${cond.checked ? "checked" : ""} />
          <span>${CONDITION_LABELS[key]}</span>
        </label>
        ${valuesHTML}
      </div>
    `;
  }).join("");

  els.conditionsList.querySelectorAll("input[data-condition]").forEach((checkbox) => {
    checkbox.addEventListener("change", () => {
      const key = checkbox.dataset.condition;
      state.profile.conditions[key].checked = checkbox.checked;
      renderConditionsList();
    });
  });
  els.conditionsList.querySelectorAll("input[data-cond]").forEach((input) => {
    input.addEventListener("input", () => {
      const key = input.dataset.cond;
      const field = input.dataset.field;
      state.profile.conditions[key].values[field] = input.value;
    });
  });
}

function submitOnboarding(event) {
  event.preventDefault();
  const p = state.profile;
  p.age = els.onbAge.value.trim();
  p.height = els.onbHeight.value.trim();
  p.weight = els.onbWeight.value.trim();
  p.loss = els.onbLoss.value.trim();
  p.cyclePattern = els.onbCycle.value;
  p.lastPeriodDate = els.onbLastPeriod.value.trim();

  const recommendation = buildRecommendation();
  if (!recommendation) {
    alert("나이·키·체중·감량 목표를 모두 입력해 주세요.");
    return;
  }
  p.targets = recommendation.targets;
  p.appliedPlan = recommendation;
  p.activeWeekStart = weekKeyFor();
  p.onboarded = true;
  state.view = "weekly";
  render();
}

// ───── APPLIED GOAL ──────────────────────────────────────
function renderApplied() {
  if (!hasTargets()) {
    els.appliedGoalBody.innerHTML = `<div class="applied-empty">개인 목표가 아직 설정되지 않았습니다. 상단의 <strong>목표 재설정</strong>으로 시작하세요.</div>`;
    return;
  }
  const t = state.profile.targets;
  const conditions = state.profile.conditions || {};
  const activeConditions = CONDITION_KEYS.filter((k) => conditions[k]?.checked);
  const modeHTML = activeConditions.length
    ? `<p class="applied-mode"><strong>${activeConditions.map((k) => CONDITION_LABELS[k]).join("·")} 관리 모드</strong> — 단탄지 비율과 영양소 한도가 자동 조정됩니다.</p>`
    : "";
  els.appliedGoalBody.innerHTML = `
    <div class="applied-goal-body">
      <div class="applied-stat">
        <p>일일 칼로리</p>
        <strong>${t.calories} kcal</strong>
      </div>
      <div class="applied-stat">
        <p>단백질 / 탄수화물 / 지방</p>
        <strong>${t.protein} / ${t.carbs} / ${t.fat} g</strong>
      </div>
      <div class="applied-stat">
        <p>물 / 운동 소모</p>
        <strong>${(t.water / 1000).toFixed(1)}L / ${Math.round(t.exerciseCalories)} kcal</strong>
      </div>
    </div>
    ${modeHTML}
    <p class="applied-cta">달성 → 파란 원 / 미달성 → 빨간 원 / 오늘 → 테두리. 날짜를 누르면 상세 입력 화면.</p>
  `;
}

// ───── MONTH CALENDAR ────────────────────────────────────
function renderMonthCalendar() {
  const [year, month] = state.visibleMonth.split("-").map(Number);
  const firstDay = new Date(year, month - 1, 1);
  const lastDay = new Date(year, month, 0);
  const daysInMonth = lastDay.getDate();
  const firstWeekday = (firstDay.getDay() + 6) % 7; // Mon=0 ... Sun=6
  const todayIso = toISO(today);
  els.monthLabel.textContent = `${year}년 ${month}월`;
  els.calendarGrid.innerHTML = "";

  for (let i = 0; i < firstWeekday; i++) {
    const empty = document.createElement("div");
    empty.className = "cal-day empty";
    els.calendarGrid.appendChild(empty);
  }
  for (let d = 1; d <= daysInMonth; d++) {
    const iso = `${String(year).padStart(4, "0")}-${String(month).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    const status = calendarDayStatus(iso, todayIso);
    const button = document.createElement("button");
    button.type = "button";
    button.className = ["cal-day", status].filter(Boolean).join(" ");
    button.textContent = d;
    button.setAttribute("aria-label", `${month}월 ${d}일 상세보기`);
    if (status !== "future") {
      button.addEventListener("click", () => {
        state.selectedDate = iso;
        state.visibleMonth = iso.slice(0, 7);
        state.view = "daily";
        render();
      });
    }
    els.calendarGrid.appendChild(button);
  }
}

function navigateMonth(delta) {
  const [year, month] = state.visibleMonth.split("-").map(Number);
  const date = new Date(year, month - 1 + delta, 1);
  state.visibleMonth = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
  render();
}

function calendarDayStatus(iso, todayIso) {
  const date = fromISO(iso);
  const todayDate = fromISO(todayIso);
  const isToday = iso === todayIso;

  if (date > todayDate) return "future";
  if (isToday) return "today";

  if (!hasTargets()) return "";
  const day = getDay(iso);
  const hasData =
    day.meals.length > 0 ||
    day.water > 0 ||
    Object.values(day.exercise || {}).some((v) => Number(v) > 0);
  if (!hasData) return "";

  const checks = weeklyChecks(totalsFor(iso), day);
  return checks.every((c) => c.ok) ? "met" : "miss";
}

function renderMiniWeek() {
  if (!els.miniWeek) return;
  els.miniWeek.innerHTML = "";
  const week = getWeekDates(state.selectedDate);
  const todayIso = toISO(today);
  const dowLabels = ["월", "화", "수", "목", "금", "토", "일"];

  week.forEach((iso, idx) => {
    const date = fromISO(iso);
    const status = calendarDayStatus(iso, todayIso);
    const isSelected = iso === state.selectedDate;
    const classes = ["mini-day"];
    if (status) classes.push(status);
    if (isSelected) classes.push("selected");

    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = classes.join(" ");
    btn.innerHTML = `<span class="mw-dow">${dowLabels[idx]}</span><span class="mw-date">${date.getDate()}</span>`;
    btn.setAttribute("aria-label", `${date.getMonth() + 1}월 ${date.getDate()}일 ${dowLabels[idx]}요일`);

    if (status === "future") {
      btn.disabled = true;
    } else {
      btn.addEventListener("click", () => {
        if (state.selectedDate === iso) return;
        state.selectedDate = iso;
        state.visibleMonth = iso.slice(0, 7);
        render();
      });
    }

    els.miniWeek.appendChild(btn);
  });
}

function renderDay() {
  const day = getDay();
  const totals = totalsFor();
  const exercise = exerciseTotals(currentWeight(), day.exercise);
  const netCalories = totals.kcal - exercise.kcal;

  renderMiniWeek();
  els.selectedDate.textContent = dayLabel(state.selectedDate);
  els.calorieTotal.innerHTML = `${Math.round(totals.kcal)}<span class="unit"> kcal</span>`;
  els.waterTotal.innerHTML = `${(day.water / 1000).toFixed(2)}<span class="unit"> L</span>`;
  els.exerciseDayTotal.textContent = `${exercise.minutes}분`;
  els.exerciseDetail.textContent = `−${Math.round(exercise.kcal)} kcal`;
  els.mealCount.textContent = `${day.meals.length}개`;
  renderExerciseSteppers(day);
  renderNetCalories(totals, exercise, netCalories);

  if (!hasTargets()) {
    els.calorieStatus.textContent = "목표 추천을 적용해 주세요";
    els.calorieStatus.className = "";
    els.waterStatus.textContent = "+/- 버튼으로 100ml 단위 조절";
    els.waterStatus.className = "";
  } else {
    const calTarget = targetFor("calories");
    const calDelta = Math.round(totals.kcal - calTarget);
    const calOver = totals.kcal > calTarget;
    els.calorieStatus.textContent = calOver ? `목표 +${calDelta} kcal 초과` : `목표 ${Math.abs(calDelta)} kcal 남음`;
    els.calorieStatus.className = calOver ? "warn" : "good";
    const waterTarget = targetFor("water");
    const waterOk = day.water >= waterTarget * 0.9;
    els.waterStatus.textContent = waterOk ? "목표 도달" : `목표 ${((waterTarget - day.water) / 1000).toFixed(1)}L 부족`;
    els.waterStatus.className = waterOk ? "good" : "";
  }

  renderMeals(day);
  renderMacros(totals);
  renderNutrients(totals);
  renderByfood(day);
  renderDisease(totals, day);
}

function renderNetCalories(totals, exercise, netCalories) {
  const intake = Math.round(totals.kcal);
  const burn = Math.round(exercise.kcal);
  const net = Math.round(netCalories);
  els.netCalValue.textContent = net;
  els.netCalIntake.textContent = intake;
  els.netCalBurn.textContent = burn;
  els.netCalResult.textContent = net;
  if (!hasTargets()) {
    els.netCalBadge.textContent = "";
    els.netCalBadge.className = "net-cal-badge";
    return;
  }
  const target = targetFor("calories");
  const over = net > target * 1.02;
  els.netCalBadge.textContent = over ? `↑ 목표 ${target} 초과` : `↓ 목표 ${target} 이내`;
  els.netCalBadge.className = `net-cal-badge ${over ? "over" : "good"}`;
}

function renderExerciseSteppers(day) {
  els.exerciseSteppers.innerHTML = Object.entries(exerciseTypes)
    .map(([key, value]) => {
      const count = Number(day.exercise[key] || 0);
      const minutes = count * 10;
      const kcal = exerciseKcal(currentWeight(), value.met, minutes);
      return `
        <div class="exercise-cell color-${value.color}">
          <div class="ex-row">
            <div class="ex-label-block"><i class="ti ${value.icon}" aria-hidden="true"></i><span>${value.label}</span></div>
            <span class="ex-minutes">${minutes}분</span>
          </div>
          <div class="ex-row">
            <span class="ex-kcal">−${Math.round(kcal)} kcal</span>
            <div class="ex-steppers">
              <button class="ex-stepper" type="button" data-exercise="${key}" data-delta="-1" aria-label="${value.label} 30분 줄이기">−</button>
              <button class="ex-stepper plus" type="button" data-exercise="${key}" data-delta="1" aria-label="${value.label} 30분 추가">+</button>
            </div>
          </div>
        </div>
      `;
    })
    .join("");
}

function macroTargetGrams(t, totalKcal) {
  if (!t) return null;
  return {
    protein: { current: totalKcal.protein, target: t.protein, color: "protein" },
    carbs: { current: totalKcal.carbs, target: t.carbs, color: "carbs" },
    fat: { current: totalKcal.fat, target: t.fat, color: "fat" },
  };
}

function renderMacros(totals) {
  if (!hasTargets()) {
    els.macrosBody.innerHTML = `<p class="section-hint">개인 목표 설정 후 단탄지 비율이 표시됩니다.</p>`;
    return;
  }
  const t = state.profile.targets;
  const rows = [
    { key: "protein", label: "단백질", icon: "ti-meat", current: totals.protein, target: t.protein },
    { key: "carbs", label: "탄수화물", icon: "ti-bread", current: totals.carbs, target: t.carbs },
    { key: "fat", label: "지방", icon: "ti-droplet", current: totals.fat, target: t.fat },
  ];
  els.macrosBody.innerHTML = rows
    .map((row) => {
      const cur = Math.round(row.current);
      const tgt = Math.max(1, Math.round(row.target));
      const fill = Math.min(cur / tgt, 1.5) * 100;
      const fillClamped = Math.min(fill, 100);
      const targetPos = Math.min((tgt / Math.max(cur, tgt * 1.5)) * 100, 100);
      const over = cur > tgt;
      const overPct = over ? Math.round(((cur - tgt) / tgt) * 100) : 0;
      return `
        <div class="macros-row ${row.key}">
          <div class="macros-row-top">
            <span class="macros-row-label"><i class="ti ${row.icon}" aria-hidden="true"></i>${row.label}</span>
            <span class="macros-row-stats"><strong class="${over ? "over" : ""}">${cur}g</strong> / ${tgt}g</span>
          </div>
          <div class="macros-bar-track">
            <div class="macros-bar-fill" style="width:${fillClamped}%"></div>
            ${cur > tgt ? `<div class="macros-target-line" style="left:${targetPos}%"></div>` : ""}
          </div>
          ${over ? `<p class="macros-row-hint">⚠ 목표 ${overPct}% 초과 — 감량 시 ${row.label} 줄이기</p>` : ""}
        </div>
      `;
    })
    .join("");
}

function nutrientLimits() {
  const conditions = state.profile.conditions || {};
  let sugar = 50; // 권장 25g, 일반 50g
  let sodium = 2000;
  let cholesterol = 300;
  let saturatedFat = 22;
  if (conditions.diabetes?.checked) { sugar = 25; }
  if (conditions.hypertension?.checked) { sodium = 1500; }
  if (conditions.hyperlipidemia?.checked) { cholesterol = 200; saturatedFat = 14; }
  if (conditions.fattyLiver?.checked) { sugar = Math.min(sugar, 30); saturatedFat = Math.min(saturatedFat, 18); }
  return { sugar, sodium, cholesterol, saturatedFat };
}

function nutrientStatus(value, limit) {
  if (value > limit) return { class: "over", label: "초과" };
  if (value > limit * 0.8) return { class: "warn", label: "주의" };
  return { class: "ok", label: "OK" };
}

function renderNutrients(totals) {
  const limits = nutrientLimits();
  const conds = state.profile.conditions || {};
  const activeConds = CONDITION_KEYS.filter((k) => conds[k]?.checked);
  els.nutrientsSub.textContent = activeConds.length
    ? `${activeConds.map((k) => CONDITION_LABELS[k]).join("·")} 관리 기준 적용`
    : "권장 한도 기준 (일반 성인)";

  const cells = [
    { key: "sugar", label: "당", icon: "ti-candy", value: totals.sugar || 0, limit: limits.sugar, unit: "g" },
    { key: "sodium", label: "나트륨", icon: "ti-salt", value: totals.sodium || 0, limit: limits.sodium, unit: "mg" },
    { key: "cholesterol", label: "콜레스테롤", icon: "ti-heartbeat", value: totals.cholesterol || 0, limit: limits.cholesterol, unit: "mg" },
    { key: "satfat", label: "포화지방", icon: "ti-droplet-half-filled", value: totals.saturatedFat || 0, limit: limits.saturatedFat, unit: "g" },
  ];
  els.nutrientsGrid.innerHTML = cells
    .map((c) => {
      const val = Math.round(c.value);
      const status = nutrientStatus(val, c.limit);
      const pct = Math.min((val / c.limit) * 100, 100);
      return `
        <div class="nutrient-cell ${c.key}">
          <div class="nutrient-top">
            <i class="ti ${c.icon}" aria-hidden="true"></i>
            <span class="label">${c.label}</span>
            <span class="nutrient-status ${status.class}">${status.label}</span>
          </div>
          <span class="nutrient-value">${val}<span class="unit">${c.unit}</span></span>
          <div class="nutrient-bar"><div class="nutrient-bar-fill" style="width:${pct}%"></div></div>
          <span class="nutrient-cap">한도 ${c.limit}${c.unit}</span>
        </div>
      `;
    })
    .join("");
}

function renderByfood(day) {
  if (!day.meals.length) {
    els.byfoodList.innerHTML = `<div class="meal-empty">식단을 기록하면 음식별 영양 기여도가 분석됩니다.</div>`;
    return;
  }
  const hasUnsaved = state._hasUnsavedEdits === true;
  els.byfoodList.innerHTML = day.meals
    .map((meal) => {
      const sugar = Math.round(meal.sugar || 0);
      const sodium = Math.round(meal.sodium || 0);
      const satfat = Math.round(meal.saturatedFat || 0);
      const sugarAlert = sugar >= 15;
      const sodiumAlert = sodium >= 500;
      const satfatAlert = satfat >= 5;
      const anyAlert = sugarAlert || sodiumAlert || satfatAlert;
      const ne = (field, value, suffix = "") => `<span class="editable-number" data-meal-id="${meal.id}" data-field="${field}" data-suffix="${suffix}" tabindex="0">${value}${suffix}</span>`;
      return `
        <div class="byfood-item ${anyAlert ? "warn" : ""}" data-meal-id="${meal.id}">
          <div class="byfood-top">
            <span class="byfood-name">${anyAlert ? "⚠ " : ""}${escapeHTML(meal.title)}</span>
            <span class="byfood-kcal">${ne("kcal", Math.round(meal.kcal), " kcal")}</span>
          </div>
          <div class="byfood-chips">
            <span class="byfood-chip protein">P ${ne("protein", Math.round(meal.protein), "g")}</span>
            <span class="byfood-chip carbs">C ${ne("carbs", Math.round(meal.carbs), "g")}</span>
            <span class="byfood-chip fat">F ${ne("fat", Math.round(meal.fat), "g")}</span>
            <span class="byfood-chip ${sugarAlert ? "sugar-alert" : "sugar-neutral"}">당 ${ne("sugar", sugar, "g")}</span>
            <span class="byfood-chip ${sodiumAlert ? "sodium-alert" : "sodium-neutral"}">나트륨 ${ne("sodium", sodium, "mg")}</span>
            <span class="byfood-chip ${satfatAlert ? "satfat-alert" : "satfat-neutral"}">포화지방 ${ne("saturatedFat", satfat, "g")}</span>
          </div>
        </div>
      `;
    })
    .join("");

  // 변경사항 있으면 저장 바 표시
  if (hasUnsaved) {
    const saveBar = document.createElement("div");
    saveBar.className = "byfood-save-bar";
    saveBar.innerHTML = `
      <span class="byfood-save-hint">⚠ 영양정보 수정됨 — 칼로리 변경 시 다른 영양소도 비례 조정됩니다</span>
      <div class="byfood-save-actions">
        <button class="byfood-cancel" type="button">취소</button>
        <button class="byfood-save" type="button">변경사항 저장</button>
      </div>
    `;
    els.byfoodList.appendChild(saveBar);
    saveBar.querySelector(".byfood-save").addEventListener("click", commitMealEdits);
    saveBar.querySelector(".byfood-cancel").addEventListener("click", cancelMealEdits);
  }

  // 숫자 클릭 → 인라인 편집
  els.byfoodList.querySelectorAll(".editable-number").forEach((span) => {
    span.addEventListener("click", () => startInlineEdit(span));
    span.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        startInlineEdit(span);
      }
    });
  });
}

// 인라인 편집 시작 — span을 input으로 교체
function startInlineEdit(span) {
  const mealId = span.dataset.mealId;
  const field = span.dataset.field;
  const suffix = span.dataset.suffix || "";
  const day = getDay();
  const meal = day.meals.find((m) => m.id === mealId);
  if (!meal) return;

  const currentValue = field === "kcal" ? Math.round(meal[field] || 0) : Math.round(meal[field] || 0);
  const input = document.createElement("input");
  input.type = "number";
  input.className = "editable-number-input";
  input.value = currentValue;
  input.min = "0";
  input.max = field === "sodium" ? "10000" : (field === "kcal" ? "5000" : "500");
  input.step = "1";

  span.replaceWith(input);
  input.focus();
  input.select();

  const commit = () => {
    const raw = input.value.trim();
    let newVal = Number(raw);
    if (!isFinite(newVal) || newVal < 0) newVal = 0;
    // 안전 캡
    const max = Number(input.max);
    if (newVal > max) newVal = max;
    // 변경 없으면 그냥 닫기
    const oldDisplayed = Math.round(meal[field] || 0);
    if (newVal === oldDisplayed) {
      render();
      return;
    }
    // backup 원본 (취소용)
    if (!state._mealBackup) state._mealBackup = {};
    if (!state._mealBackup[mealId]) state._mealBackup[mealId] = { ...meal };

    // ── 핵심: 칼로리 수정 시 모든 영양소 비례 조정 ──
    if (field === "kcal" && meal.kcal > 0) {
      const ratio = newVal / meal.kcal;
      meal.kcal = newVal;
      ["protein", "carbs", "fat", "sugar", "sodium", "cholesterol", "saturatedFat"].forEach((k) => {
        if (typeof meal[k] === "number") {
          meal[k] = Math.round(meal[k] * ratio * 10) / 10; // 소수점 1자리 유지
        }
      });
    } else {
      // 개별 영양소 수정 — 그 값만 변경
      meal[field] = newVal;
    }
    state._hasUnsavedEdits = true;
    render();
  };

  let committed = false;
  input.addEventListener("blur", () => {
    if (committed) return;
    committed = true;
    commit();
  });
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      input.blur();
    } else if (e.key === "Escape") {
      committed = true;
      render(); // 원래값으로 복귀
    }
  });
}

// 변경사항 최종 저장 (모든 탭 반영 + 동기화)
function commitMealEdits() {
  delete state._hasUnsavedEdits;
  delete state._mealBackup;
  saveState();
  render();
}

// 변경사항 취소 — 백업에서 복구
function cancelMealEdits() {
  const backup = state._mealBackup || {};
  const day = getDay();
  for (const mealId in backup) {
    const idx = day.meals.findIndex((m) => m.id === mealId);
    if (idx >= 0) day.meals[idx] = backup[mealId];
  }
  delete state._hasUnsavedEdits;
  delete state._mealBackup;
  render();
}

function buildDiseaseCard(key, totals, day, limits) {
  const label = CONDITION_LABELS[key];
  let badge, badgeClass, metricsHtml, messageHtml;

  if (key === "diabetes") {
    const sugar = Math.round(totals.sugar || 0);
    const carbs = Math.round(totals.carbs || 0);
    const carbsTarget = state.profile.targets ? state.profile.targets.carbs : 200;
    const sugarOver = sugar > limits.sugar;
    const carbsOver = carbs > carbsTarget;
    const isWarn = sugarOver || carbsOver;
    badge = isWarn ? "주의" : "양호";
    badgeClass = isWarn ? "warn" : "ok";
    metricsHtml = `
      <div class="row"><span class="label">오늘 당 섭취</span><strong class="${sugarOver ? "bad" : "good"}">${sugar}g / ${limits.sugar}g 한도</strong></div>
      <div class="row"><span class="label">탄수화물</span><strong class="${carbsOver ? "warn" : "good"}">${carbs}g / 목표 ${carbsTarget}g</strong></div>
      <div class="row"><span class="label">식단 횟수</span><strong>${day.meals.length}회</strong></div>
    `;
    messageHtml = sugarOver
      ? `<strong>오늘 당 섭취가 한도를 넘었어요.</strong> 다음 식사에서 단순당(설탕·과자·음료)을 줄이고, 통곡물·식이섬유·단백질 위주로 구성해 보세요. 식사 후 가벼운 산책도 혈당 안정에 도움이 됩니다.`
      : `<strong>오늘 당 섭취는 한도 내</strong>입니다. 다음 식사도 통곡물·식이섬유 중심으로 가시면 좋아요.`;
  } else if (key === "hypertension") {
    const sodium = Math.round(totals.sodium || 0);
    const sodiumOver = sodium > limits.sodium;
    badge = sodiumOver ? "주의" : "양호";
    badgeClass = sodiumOver ? "warn" : "ok";
    metricsHtml = `
      <div class="row"><span class="label">오늘 나트륨</span><strong class="${sodiumOver ? "bad" : "good"}">${sodium}mg / ${limits.sodium}mg 한도</strong></div>
      <div class="row"><span class="label">물 섭취</span><strong>${(day.water / 1000).toFixed(1)}L</strong></div>
    `;
    messageHtml = sodiumOver
      ? `<strong>나트륨 섭취가 한도를 넘었습니다.</strong> 국·찌개·라면류를 줄이고, 김치·젓갈류는 소량만. 칼륨이 풍부한 채소(시금치·바나나·아보카도)는 나트륨 배출에 도움이 됩니다.`
      : `<strong>나트륨 섭취 양호.</strong> 이대로 유지하시면 혈압 관리에 도움이 됩니다.`;
  } else if (key === "hyperlipidemia") {
    const satfat = Math.round(totals.saturatedFat || 0);
    const chol = Math.round(totals.cholesterol || 0);
    const satOver = satfat > limits.saturatedFat;
    const cholOver = chol > limits.cholesterol;
    const anyOver = satOver || cholOver;
    badge = anyOver ? "주의" : "양호";
    badgeClass = anyOver ? "warn" : "ok";
    metricsHtml = `
      <div class="row"><span class="label">포화지방</span><strong class="${satOver ? "bad" : "good"}">${satfat}g / ${limits.saturatedFat}g</strong></div>
      <div class="row"><span class="label">콜레스테롤</span><strong class="${cholOver ? "bad" : "good"}">${chol}mg / ${limits.cholesterol}mg</strong></div>
    `;
    messageHtml = anyOver
      ? `<strong>포화지방/콜레스테롤이 한도를 넘었습니다.</strong> 동물성 지방(삼겹살·갈비·치즈)을 줄이고 등푸른 생선·견과류·올리브유 등 불포화지방을 늘리세요.`
      : `<strong>혈중 지질 관리 양호.</strong> 등푸른 생선·식이섬유 위주 식단을 유지하세요.`;
  } else {
    // fattyLiver
    const sugar = Math.round(totals.sugar || 0);
    const satfat = Math.round(totals.saturatedFat || 0);
    const sugarOver = sugar > limits.sugar;
    const satOver = satfat > limits.saturatedFat;
    const anyOver = sugarOver || satOver;
    badge = anyOver ? "주의" : "양호";
    badgeClass = anyOver ? "warn" : "ok";
    metricsHtml = `
      <div class="row"><span class="label">당 섭취</span><strong class="${sugarOver ? "bad" : "good"}">${sugar}g / ${limits.sugar}g</strong></div>
      <div class="row"><span class="label">포화지방</span><strong class="${satOver ? "bad" : "good"}">${satfat}g / ${limits.saturatedFat}g</strong></div>
    `;
    messageHtml = anyOver
      ? `<strong>오늘 당/포화지방 섭취가 한도를 넘었어요.</strong> 과당(탄산음료·과자) 줄이기, 알코올 제한, 유산소 운동 30분 이상이 지방간 개선에 핵심입니다.`
      : `<strong>오늘 식단 양호.</strong> 알코올 제한 + 주 3회 이상 유산소 운동을 함께 유지하세요.`;
  }

  return `
    <section class="disease-card" data-condition="${key}">
      <div class="disease-header">
        <i class="ti ti-stethoscope" aria-hidden="true"></i>
        <span>Disease check</span>
      </div>
      <div class="panel-header-row">
        <h2>${label} 관리 평가</h2>
        <span class="disease-badge ${badgeClass}">${badge}</span>
      </div>
      <div class="disease-metrics">${metricsHtml}</div>
      <p class="disease-message">${messageHtml}</p>
    </section>
  `;
}

function renderDisease(totals, day) {
  const conds = state.profile.conditions || {};
  const activeKeys = CONDITION_KEYS.filter((k) => conds[k]?.checked);
  if (!activeKeys.length) {
    els.diseaseContainer.classList.add("is-hidden");
    els.diseaseContainer.innerHTML = "";
    return;
  }
  els.diseaseContainer.classList.remove("is-hidden");
  const limits = nutrientLimits();
  els.diseaseContainer.innerHTML = activeKeys
    .map((key) => buildDiseaseCard(key, totals, day, limits))
    .join("");
}

function renderMeals(day) {
  if (!day.meals.length) {
    els.mealList.innerHTML = `<div class="meal-empty">칼로리 카드의 + 음식 버튼을 눌러 식단을 분석하세요.</div>`;
    return;
  }

  els.mealList.innerHTML = day.meals
    .map((meal) => {
      const sugar = Math.round(meal.sugar || 0);
      const sodium = Math.round(meal.sodium || 0);
      const warn = sugar >= 15 || sodium >= 500;
      return `
        <div class="meal-row ${warn ? "warn" : ""}">
          <span class="meal-name">${warn ? "⚠ " : ""}${escapeHTML(meal.title)}</span>
          <span class="meal-kcal">${Math.round(meal.kcal)} kcal</span>
          <button class="meal-star" type="button" data-save-favorite="${meal.id}" aria-label="내 음식으로 저장" title="내 음식으로 저장">★</button>
          <button class="meal-remove" type="button" data-delete="${meal.id}" aria-label="식단 삭제">×</button>
        </div>
      `;
    })
    .join("");

  els.mealList.querySelectorAll("[data-delete]").forEach((button) => {
    button.addEventListener("click", () => {
      day.meals = day.meals.filter((meal) => meal.id !== button.getAttribute("data-delete"));
      render();
    });
  });

  els.mealList.querySelectorAll("[data-save-favorite]").forEach((button) => {
    button.addEventListener("click", async () => {
      const id = button.getAttribute("data-save-favorite");
      const meal = day.meals.find((m) => m.id === id);
      if (!meal) return;
      button.disabled = true;
      const ok = await saveMealToMyFoods(meal);
      button.disabled = false;
      if (ok) {
        button.classList.add("is-saved");
        button.textContent = "★";
        button.title = "내 음식에 저장됨";
      }
    });
  });
}

function dayStatus(totals, day) {
  if (!hasTargets() || !totals.kcal) return { dot: "" };
  const exercise = exerciseTotals(currentWeight(), day.exercise);
  const netCalories = totals.kcal - exercise.kcal;
  const calorieRatio = (netCalories - targetFor("calories")) / targetFor("calories");
  if (calorieRatio > 0.05) return { dot: "over" };
  if (calorieRatio < -0.18) return { dot: "under" };
  if (day.water >= targetFor("water") * 0.9 && exercise.kcal >= targetFor("exerciseCalories")) return { dot: "good" };
  return { dot: "under" };
}

function renderWeekly() {
  const week = getWeekDates();
  const weekKey = week[0];
  const start = fromISO(week[0]);
  const end = fromISO(week[6]);
  els.weekLabel.textContent = `${start.getMonth() + 1}.${start.getDate()} - ${end.getMonth() + 1}.${end.getDate()}`;
  els.weeklyTable.innerHTML = "";

  const header = document.createElement("div");
  header.className = "week-row";
  header.innerHTML = `<span class="day-name">요일</span>${["칼", "물", "운", "단", "탄", "지"].map((label) => `<span>${label}</span>`).join("")}`;
  els.weeklyTable.appendChild(header);

  let passDays = 0;
  week.forEach((iso) => {
    const day = getDay(iso);
    const checks = weeklyChecks(totalsFor(iso), day);
    if (checks.every((check) => check.ok)) passDays += 1;
    const row = document.createElement("div");
    row.className = "week-row";
    row.innerHTML = `
      <span class="day-name">${fromISO(iso).toLocaleDateString("ko-KR", { weekday: "short" })}</span>
      ${checks.map((check) => `<span class="${check.className}">${check.mark}</span>`).join("")}
    `;
    els.weeklyTable.appendChild(row);
  });

  const feedback = buildWeeklyFeedback(passDays);
  state.weeklyFeedback[weekKey] = feedback;
  els.coachMessage.innerHTML = `<strong>GPT 주간 피드백: ${feedback.title}</strong>${feedback.message}`;
}

function weeklyChecks(totals, day) {
  if (!hasTargets()) {
    return Array.from({ length: 6 }, () => ({ ok: false, mark: "-", className: "neutral" }));
  }

  const exercise = exerciseTotals(currentWeight(), day.exercise);
  const netCalories = totals.kcal - exercise.kcal;
  return [
    rangeCheck(netCalories, targetFor("calories"), 0.82, 1.05),
    minimumCheck(day.water, targetFor("water") * 0.9),
    minimumCheck(exercise.kcal, targetFor("exerciseCalories")),
    rangeCheck(totals.protein, targetFor("protein"), 0.8, 1.4),
    rangeCheck(totals.carbs, targetFor("carbs"), 0.65, 1.25),
    rangeCheck(totals.fat, targetFor("fat"), 0.65, 1.3),
  ];
}

function rangeCheck(value, target, low, high) {
  if (!value) return { ok: false, mark: "-", className: "neutral" };
  const ratio = value / Math.max(Number(target || 0), 1);
  const ok = ratio >= low && ratio <= high;
  return { ok, mark: ok ? "+" : "-", className: ok ? "pass" : "fail" };
}

function minimumCheck(value, target) {
  if (!value) return { ok: false, mark: "-", className: "neutral" };
  const ok = value >= target;
  return { ok, mark: ok ? "+" : "-", className: ok ? "pass" : "fail" };
}

function buildWeeklyFeedback(passDays) {
  if (!hasTargets()) {
    return {
      passDays,
      title: "목표 대기 중",
      message: "목표 추천을 적용하면 칼로리, 물, 운동, 매크로 기준으로 주간 평가가 시작됩니다.",
    };
  }

  if (passDays >= 5) {
    return {
      passDays,
      title: `${passDays}/7일 성공`,
      message: "좋습니다. 다음 주 목표 추천은 현재 몸무게를 다시 넣고, 이번 주 활동량을 기준으로 조금 더 정교하게 조절해 보세요.",
    };
  }

  if (passDays >= 3) {
    return {
      passDays,
      title: `${passDays}/7일 보통`,
      message: "기록 흐름은 살아 있습니다. 다음 주에는 물과 운동 목표를 먼저 고정하고, 단백질 부족만 줄이는 방향이 좋습니다.",
    };
  }

  return {
    passDays,
    title: `${passDays}/7일 실패`,
    message: "이번 주는 기준에 못 미쳤습니다. 다음 추천에서는 칼로리를 무리하게 낮추기보다 걷기 30분과 물 목표부터 다시 붙이는 편이 안전합니다.",
  };
}

function buildRecommendation() {
  const p = state.profile;
  const height = Number(p.height || 0);
  const weight = Number(p.weight || 0);
  const loss = Number(p.loss || 0);
  const age = Number(p.age || 30);
  const gender = p.gender || "male";
  const activityLevel = Number(p.activityLevel || 3);
  const conditions = p.conditions || {};

  if (!height || !weight || !loss) return null;

  const weekKey = weekKeyFor();
  const previous = state.weeklyFeedback[previousWeekKey()];
  const priorPassDays = hasTargets() && previous ? previous.passDays : 3;
  const weeklyLoss = Math.min(loss, clamp(weight * 0.006 + (priorPassDays >= 5 ? 0.05 : priorPassDays <= 2 ? -0.08 : 0), 0.25, 0.7));
  const exercisePlan = exercisePlanFor(priorPassDays, !hasTargets());
  const plannedExerciseKcal = exerciseKcal(weight, 4.6, exercisePlan.exerciseMinutes);

  // Mifflin-St Jeor BMR
  const bmr = gender === "female"
    ? 10 * weight + 6.25 * height - 5 * age - 161
    : 10 * weight + 6.25 * height - 5 * age + 5;
  const activityMult = (ACTIVITY_LEVELS[activityLevel] || ACTIVITY_LEVELS[3]).multiplier;
  const tdee = bmr * activityMult + plannedExerciseKcal;
  const calories = roundTo(Math.max(1200, tdee - (weeklyLoss * 7700) / 7), 50);

  // Macro split — condition-aware
  let proteinRatio = 0.25;
  let fatRatio = 0.25;
  let carbsRatio = 0.50;
  if (conditions.diabetes?.checked) {
    proteinRatio = 0.30; carbsRatio = 0.40; fatRatio = 0.30;
  } else if (conditions.hyperlipidemia?.checked) {
    proteinRatio = 0.28; carbsRatio = 0.52; fatRatio = 0.20;
  }
  const protein = Math.round((calories * proteinRatio) / 4);
  const fat = Math.round((calories * fatRatio) / 9);
  const carbs = Math.max(80, Math.round((calories - protein * 4 - fat * 9) / 4));
  const water = roundTo(weight * 35 + exercisePlan.exerciseMinutes * 8, 100);

  return {
    weekStart: weekKey,
    createdAt: new Date().toISOString(),
    inputs: { height, weight, loss, age, gender, activityLevel },
    targets: {
      calories,
      protein,
      carbs,
      fat,
      water,
      exerciseMinutes: exercisePlan.exerciseMinutes,
      exerciseCalories: Math.round(plannedExerciseKcal),
    },
    weeklyLoss,
    note: `${gender === "female" ? "여성" : "남성"} ${age}세, 활동량 ${activityLevel} 기준으로 하루 ${calories}kcal, 단탄지 ${protein}/${carbs}/${fat}g, 물 ${(water / 1000).toFixed(1)}L를 설정했습니다.`,
    exerciseNote: `운동 추천: 걷기 ${exercisePlan.walk}회, 달리기 ${exercisePlan.run}회, 웨이트 ${exercisePlan.strength}회. ${exercisePlan.reason}`,
  };
}

function exercisePlanFor(passDays, isFirstPlan) {
  if (isFirstPlan) {
    return { walk: 3, run: 1, strength: 2, exerciseMinutes: 30, reason: "첫 주는 하루 30분 기준으로 부담 없이 시작합니다." };
  }
  if (passDays >= 5) {
    return { walk: 2, run: 1, strength: 2, exerciseMinutes: 35, reason: "성공 주간이므로 강도보다 유지력을 우선합니다." };
  }
  if (passDays >= 3) {
    return { walk: 4, run: 1, strength: 2, exerciseMinutes: 30, reason: "보통 주간은 운동 빈도를 살짝 올립니다." };
  }
  return { walk: 5, run: 0, strength: 1, exerciseMinutes: 30, reason: "실패 주간은 러닝보다 걷기로 다시 붙는 편이 안전합니다." };
}

function adjustWater(delta) {
  const day = getDay();
  day.water = clamp(day.water + delta, 0, 10000);
  render();
}

function adjustExercise(key, delta) {
  const day = getDay();
  day.exercise[key] = Math.max(0, Number(day.exercise[key] || 0) + delta);
  render();
}

function exerciseTotals(weight, exercise) {
  return Object.keys(exerciseTypes).reduce(
    (acc, key) => {
      const count = Number(exercise[key] || 0);
      return {
        kcal: acc.kcal + exerciseKcal(weight, exerciseTypes[key].met, count * 10),
        minutes: acc.minutes + count * 10,
      };
    },
    { kcal: 0, minutes: 0 },
  );
}

function exerciseKcal(weight, met, minutes) {
  return ((met * 3.5 * weight) / 200) * minutes;
}

// ============================================================
// 식약처 DB 검색 (Supabase RPC) — Phase 1 인프라
// ============================================================
// 유저가 입력하는 통상 단어를 식약처 DB 명명에 맞게 변환

function smartTitle(raw) {
  const compact = raw.replace(/\s+/g, " ").trim();
  return compact.length > 26 ? `${compact.slice(0, 26)}...` : compact || "식단";
}

function makeId() {
  if (crypto.randomUUID) return crypto.randomUUID();
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function roundOne(value) {
  return Math.round(value * 10) / 10;
}

function roundTo(value, unit) {
  return Math.round(value / unit) * unit;
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function resetMealEntry() {
  els.mealEntryForm.classList.remove("is-hidden");
  els.mealEntryLog.innerHTML = "";
  els.mealInput.value = "";
}

async function submitMeal(event) {
  event.preventDefault();
  const raw = els.mealInput.value.trim();
  if (!raw) return;

  // OCR 결과 모달 재사용 — 로딩 상태로 열기
  els.ocrModal.classList.remove("is-hidden");
  els.ocrForm.classList.add("is-hidden");
  if (els.ocrHint) els.ocrHint.textContent = "Gemini가 영양정보를 분석 중입니다...";

  // 기존 로딩/오류 정리
  const oldEl = els.ocrModal.querySelector(".ocr-loading, .ocr-error");
  if (oldEl) oldEl.remove();

  const loading = document.createElement("div");
  loading.className = "ocr-loading";
  loading.textContent = "분석 중...";
  els.ocrForm.parentElement.insertBefore(loading, els.ocrForm);

  try {
    const res = await fetch("/.netlify/functions/analyze-food", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: raw }),
    });
    loading.remove();

    if (!res.ok) {
      let detail = "";
      try {
        const errData = await res.json();
        detail = errData.error || JSON.stringify(errData);
        if (errData.detail) detail += ` — ${errData.detail}`;
      } catch {
        try { detail = (await res.text()).slice(0, 300); } catch {}
      }
      showOcrError(`HTTP ${res.status} — ${detail || "응답 없음"}`);
      return;
    }
    const data = await res.json();
    populateOcrForm(data);
    if (els.ocrHint) els.ocrHint.textContent = "값을 확인하고 식단에 추가하거나 내 음식으로 저장하세요.";
    els.ocrForm.classList.remove("is-hidden");
    // 입력창 비우기
    els.mealInput.value = "";
  } catch (err) {
    loading.remove();
    showOcrError(err.message || "분석 실패");
  }
}

function escapeHTML(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

els.prevMonth.addEventListener("click", () => navigateMonth(-1));
els.nextMonth.addEventListener("click", () => navigateMonth(1));

els.backToWeek.addEventListener("click", () => {
  state.view = "weekly";
  render();
});

els.brandHome.addEventListener("click", (event) => {
  event.preventDefault();
  state.view = "weekly";
  render();
});

els.resetProfile.addEventListener("click", () => {
  if (!confirm("개인 목표를 다시 설정하시겠습니까? 기존 입력값은 유지되지만 새로 추천을 받게 됩니다.")) return;
  state.profile.onboarded = false;
  state.view = "onboarding";
  render();
});

els.waterPlus.addEventListener("click", () => adjustWater(100));
els.waterMinus.addEventListener("click", () => adjustWater(-100));
els.mealEntryForm.addEventListener("submit", submitMeal);
els.exerciseSteppers.addEventListener("click", (event) => {
  const button = event.target.closest("[data-exercise]");
  if (!button) return;
  adjustExercise(button.getAttribute("data-exercise"), Number(button.getAttribute("data-delta")));
});

els.onboardingForm.addEventListener("submit", submitOnboarding);

els.genderPair.addEventListener("click", (event) => {
  const btn = event.target.closest(".toggle-option");
  if (!btn) return;
  state.profile.gender = btn.dataset.value;
  els.genderPair.querySelectorAll(".toggle-option").forEach((b) => {
    b.classList.toggle("is-active", b === btn);
  });
  els.cycleBox.classList.toggle("is-hidden", state.profile.gender !== "female");
});

els.activityPair.addEventListener("click", (event) => {
  const btn = event.target.closest(".activity-option");
  if (!btn) return;
  state.profile.activityLevel = Number(btn.dataset.value);
  els.activityPair.querySelectorAll(".activity-option").forEach((b) => {
    b.classList.toggle("is-active", b === btn);
  });
});

els.resetWeek.addEventListener("click", () => {
  getWeekDates().forEach((iso) => {
    state.days[iso] = emptyDay();
  });
  render();
});

els.loginKakao.addEventListener("click", () => signInWithProvider("kakao"));
els.loginGoogle.addEventListener("click", () => signInWithProvider("google"));
els.logout.addEventListener("click", signOut);

// 기록 저장 — debounce 우회하고 즉시 Supabase에 강제 동기화
async function saveRecordNow() {
  if (!authUser) return;
  const btn = els.saveRecordButton;
  const hint = els.saveRecordHint;
  if (!btn) return;

  // debounce 타이머 취소 후 즉시 실행
  if (typeof syncStateTimeout !== "undefined" && syncStateTimeout) {
    clearTimeout(syncStateTimeout);
    syncStateTimeout = null;
  }

  // 1. updated_at 갱신 + localStorage 즉시 저장
  state._updated_at = new Date().toISOString();
  localStorage.setItem(stateKey(), JSON.stringify(state));

  // 2. 버튼 UI: 저장 중
  btn.disabled = true;
  btn.classList.add("is-loading");
  if (hint) hint.textContent = "다른 기기에 동기화 중...";

  try {
    if (!supabase) throw new Error("Supabase 미연결");
    const { error } = await supabase
      .from("user_data")
      .upsert({ user_id: authUser.id, state }, { onConflict: "user_id" });
    if (error) throw error;

    btn.classList.remove("is-loading");
    btn.classList.add("is-success");
    if (hint) hint.textContent = `저장 완료 — ${new Date().toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" })}`;
    setTimeout(() => {
      btn.classList.remove("is-success");
      btn.disabled = false;
      if (hint) hint.textContent = "탭하면 오늘 입력한 모든 정보가 다른 기기에도 즉시 반영됩니다.";
    }, 2500);
  } catch (err) {
    console.warn("기록 저장 실패:", err);
    btn.classList.remove("is-loading");
    btn.classList.add("is-error");
    if (hint) hint.textContent = "저장 실패 — 잠시 후 다시 시도해주세요.";
    setTimeout(() => {
      btn.classList.remove("is-error");
      btn.disabled = false;
      if (hint) hint.textContent = "탭하면 오늘 입력한 모든 정보가 다른 기기에도 즉시 반영됩니다.";
    }, 3000);
  }
}

if (els.saveRecordButton) {
  els.saveRecordButton.addEventListener("click", saveRecordNow);
}

// ============================================================
// My Foods — 자주 먹는 음식 저장/관리
// ============================================================
const MY_FOODS_LIMIT = 30;
let myFoodsCache = null;

async function loadMyFoods() {
  if (!supabase || !authUser) return [];
  try {
    const { data, error } = await supabase
      .from("my_foods")
      .select("*")
      .eq("user_id", authUser.id)
      .order("last_used_at", { ascending: false })
      .limit(MY_FOODS_LIMIT);
    if (error) throw error;
    myFoodsCache = data || [];
    return myFoodsCache;
  } catch (err) {
    console.warn("내 음식 로드 실패:", err);
    return [];
  }
}

function renderMyFoodsModal(foods) {
  if (!els.myFoodsList) return;
  if (!foods || foods.length === 0) {
    els.myFoodsList.innerHTML = `
      <p class="my-foods-empty">
        저장한 음식이 없습니다.<br>
        식단 기록 옆 <i class="ti ti-star"></i> 별 버튼을 눌러 추가하세요.
      </p>
    `;
    return;
  }
  els.myFoodsList.innerHTML = foods
    .map(
      (f) => `
      <div class="my-food-item" data-food-id="${f.id}" data-food-name="${escapeAttr(f.name)}">
        <div class="my-food-info">
          <div class="my-food-name">${escapeHtml(f.name)}</div>
          <div class="my-food-stats">${Math.round(f.kcal || 0)} kcal · 단백 ${roundOne(f.protein || 0)}g · 탄 ${roundOne(f.carbs || 0)}g · 지 ${roundOne(f.fat || 0)}g</div>
        </div>
        <button class="my-food-delete" type="button" data-delete-id="${f.id}" aria-label="삭제">×</button>
      </div>
    `
    )
    .join("");
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}
function escapeAttr(s) { return escapeHtml(s); }

async function openMyFoodsModal() {
  els.myFoodsModal.classList.remove("is-hidden");
  // 로딩 중 상태
  els.myFoodsList.innerHTML = `<p class="my-foods-empty">불러오는 중...</p>`;
  const foods = await loadMyFoods();
  renderMyFoodsModal(foods);
}

function closeMyFoodsModal() {
  els.myFoodsModal.classList.add("is-hidden");
}

if (els.myFoodsOpen) {
  els.myFoodsOpen.addEventListener("click", openMyFoodsModal);
}
if (els.myFoodsClose) {
  els.myFoodsClose.addEventListener("click", closeMyFoodsModal);
}
if (els.myFoodsModal) {
  // 배경 탭으로 닫기
  els.myFoodsModal.addEventListener("click", (e) => {
    if (e.target === els.myFoodsModal) closeMyFoodsModal();
  });
}

if (els.myFoodsList) {
  els.myFoodsList.addEventListener("click", async (event) => {
    const deleteBtn = event.target.closest("[data-delete-id]");
    if (deleteBtn) {
      event.stopPropagation();
      const id = deleteBtn.dataset.deleteId;
      if (!confirm("이 음식을 삭제할까요?")) return;
      try {
        await supabase.from("my_foods").delete().eq("id", id);
        const foods = await loadMyFoods();
        renderMyFoodsModal(foods);
      } catch (err) {
        console.warn("삭제 실패:", err);
      }
      return;
    }
    const item = event.target.closest(".my-food-item");
    if (item) {
      const name = item.dataset.foodName;
      // 입력창에 추가 (기존 값이 있으면 콤마로 연결)
      const current = els.mealInput.value.trim();
      els.mealInput.value = current ? `${current}, ${name}` : name;
      // last_used_at 갱신
      const id = item.dataset.foodId;
      try {
        await supabase.from("my_foods").update({ last_used_at: new Date().toISOString() }).eq("id", id);
      } catch {}
      closeMyFoodsModal();
      els.mealInput.focus();
    }
  });
}

// 음식 기록 카드에서 ★ 누르면 my_foods에 저장
async function saveMealToMyFoods(meal) {
  if (!supabase || !authUser) {
    alert("로그인이 필요합니다.");
    return false;
  }
  // 30개 한도 체크
  const foods = myFoodsCache || (await loadMyFoods());
  if (foods.length >= MY_FOODS_LIMIT) {
    alert(`내 음식은 최대 ${MY_FOODS_LIMIT}개까지 저장 가능합니다. 사용하지 않는 음식을 삭제해 주세요.`);
    return false;
  }
  try {
    const { error } = await supabase.from("my_foods").upsert(
      {
        user_id: authUser.id,
        name: meal.title,
        kcal: meal.kcal,
        protein: meal.protein,
        carbs: meal.carbs,
        fat: meal.fat,
        sugar: meal.sugar,
        sodium: meal.sodium,
        cholesterol: meal.cholesterol,
        saturated_fat: meal.saturatedFat,
        last_used_at: new Date().toISOString(),
      },
      { onConflict: "user_id,name" }
    );
    if (error) throw error;
    myFoodsCache = null; // 다음 로드 시 갱신
    return true;
  } catch (err) {
    console.warn("내 음식 저장 실패:", err);
    alert("저장에 실패했습니다.");
    return false;
  }
}

// ============================================================
// 사진 OCR — 영양표 자동 인식 (Claude Vision API)
// ============================================================

// 카메라 버튼 클릭 → 카메라/갤러리 열기
if (els.ocrOpen) {
  els.ocrOpen.addEventListener("click", () => {
    if (els.ocrCameraInput) els.ocrCameraInput.click();
  });
}

// 사진 선택 시 자동 업로드 & 분석
if (els.ocrCameraInput) {
  els.ocrCameraInput.addEventListener("change", async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    // 같은 파일 두 번 연속 선택 가능하게 초기화
    event.target.value = "";
    await runOcrOnImage(file);
  });
}

async function runOcrOnImage(file) {
  // 모달 열고 로딩 상태
  els.ocrModal.classList.remove("is-hidden");
  els.ocrForm.classList.add("is-hidden");
  els.ocrHint.textContent = "AI가 영양표를 분석 중입니다...";

  // 기존 에러/로딩 정리
  const oldLoading = els.ocrModal.querySelector(".ocr-loading, .ocr-error");
  if (oldLoading) oldLoading.remove();

  const loading = document.createElement("div");
  loading.className = "ocr-loading";
  loading.textContent = "사진 분석 중...";
  els.ocrForm.parentElement.insertBefore(loading, els.ocrForm);

  // 이미지 압축 (4MB 이상이면 리사이즈)
  try {
    const base64 = await imageFileToBase64(file, 1280);
    const res = await fetch("/.netlify/functions/ocr-nutrition", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ image: base64 }),
    });
    loading.remove();

    if (!res.ok) {
      // 실제 응답 내용 시도해서 보여주기 (JSON 또는 텍스트)
      let detail = "";
      try {
        const errData = await res.json();
        detail = errData.error || JSON.stringify(errData);
        if (errData.detail) detail += ` — ${errData.detail}`;
      } catch {
        try { detail = (await res.text()).slice(0, 300); } catch {}
      }
      showOcrError(`HTTP ${res.status} — ${detail || "응답 없음"}`);
      return;
    }
    let data;
    try {
      data = await res.json();
    } catch (err) {
      showOcrError(`응답 파싱 실패: ${err.message}`);
      return;
    }
    populateOcrForm(data);
    els.ocrHint.textContent = "값을 확인 후 식단에 추가하거나 내 음식으로 저장하세요.";
    els.ocrForm.classList.remove("is-hidden");
  } catch (err) {
    loading.remove();
    showOcrError(err.message || "분석 실패");
  }
}

function showOcrError(message) {
  els.ocrForm.classList.add("is-hidden");
  const err = document.createElement("div");
  err.className = "ocr-error";
  err.textContent = `⚠ ${message}`;
  els.ocrForm.parentElement.insertBefore(err, els.ocrForm);
}

// 이미지 파일 → base64 data URL (최대 maxSize 픽셀로 리사이즈 + JPEG 압축)
function imageFileToBase64(file, maxSize) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let { width, height } = img;
        if (width > maxSize || height > maxSize) {
          const ratio = Math.min(maxSize / width, maxSize / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg", 0.85));
      };
      img.onerror = () => reject(new Error("이미지 로드 실패"));
      img.src = e.target.result;
    };
    reader.onerror = () => reject(new Error("파일 읽기 실패"));
    reader.readAsDataURL(file);
  });
}

function populateOcrForm(data) {
  els.ocrName.value = data.name || "";
  els.ocrServing.value = data.serving_grams || 100;
  els.ocrKcal.value = data.kcal || 0;
  els.ocrProtein.value = data.protein || 0;
  els.ocrCarbs.value = data.carbs || 0;
  els.ocrFat.value = data.fat || 0;
  els.ocrSugar.value = data.sugar || 0;
  els.ocrSodium.value = data.sodium || 0;
  els.ocrChol.value = data.cholesterol || 0;
  els.ocrSatfat.value = data.saturated_fat || 0;
}

function readOcrFormAsMeal() {
  const name = (els.ocrName.value || "").trim() || "사진 분석 음식";
  return {
    id: makeId(),
    title: name,
    raw: name,
    kcal: Number(els.ocrKcal.value) || 0,
    protein: Number(els.ocrProtein.value) || 0,
    carbs: Number(els.ocrCarbs.value) || 0,
    fat: Number(els.ocrFat.value) || 0,
    sugar: Number(els.ocrSugar.value) || 0,
    sodium: Number(els.ocrSodium.value) || 0,
    cholesterol: Number(els.ocrChol.value) || 0,
    saturatedFat: Number(els.ocrSatfat.value) || 0,
    found: [`${name} (사진 분석)`],
    createdAt: new Date().toISOString(),
  };
}

function closeOcrModal() {
  els.ocrModal.classList.add("is-hidden");
  // 정리
  const oldLoading = els.ocrModal.querySelector(".ocr-loading, .ocr-error");
  if (oldLoading) oldLoading.remove();
  els.ocrForm.classList.remove("is-hidden");
}

if (els.ocrClose) els.ocrClose.addEventListener("click", closeOcrModal);
if (els.ocrCancel) els.ocrCancel.addEventListener("click", closeOcrModal);
if (els.ocrModal) {
  els.ocrModal.addEventListener("click", (e) => {
    if (e.target === els.ocrModal) closeOcrModal();
  });
}

if (els.ocrAddMeal) {
  els.ocrAddMeal.addEventListener("click", () => {
    const meal = readOcrFormAsMeal();
    const day = getDay();
    day.meals.push(meal);
    saveState();
    render();
    // OCR 결과도 ai_food_cache에 저장 (모든 유저 공유)
    saveAiCache(
      {
        name: meal.title,
        serving_grams: Number(els.ocrServing.value) || 100,
        kcal: meal.kcal,
        protein: meal.protein,
        carbs: meal.carbs,
        fat: meal.fat,
        sugar: meal.sugar,
        sodium: meal.sodium,
        cholesterol: meal.cholesterol,
        saturated_fat: meal.saturatedFat,
      },
      "ocr"
    ).catch(() => {});
    closeOcrModal();
  });
}

if (els.ocrSaveFavorite) {
  els.ocrSaveFavorite.addEventListener("click", async () => {
    const meal = readOcrFormAsMeal();
    const day = getDay();
    day.meals.push(meal);
    saveState();
    render();
    // My Foods + ai_food_cache 양쪽에 저장
    await saveMealToMyFoods(meal);
    saveAiCache(
      {
        name: meal.title,
        serving_grams: Number(els.ocrServing.value) || 100,
        kcal: meal.kcal,
        protein: meal.protein,
        carbs: meal.carbs,
        fat: meal.fat,
        sugar: meal.sugar,
        sodium: meal.sodium,
        cholesterol: meal.cholesterol,
        saturated_fat: meal.saturatedFat,
      },
      "ocr"
    ).catch(() => {});
    closeOcrModal();
  });
}

initAuth();
