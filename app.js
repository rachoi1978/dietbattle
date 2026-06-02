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
  goalsModal: document.querySelector("#goals-modal"),
  goalsLoading: document.querySelector("#goals-loading"),
  goalsResult: document.querySelector("#goals-result"),
  goalsError: document.querySelector("#goals-error"),
  goalsErrorMsg: document.querySelector("#goals-error-msg"),
  goalsReasoning: document.querySelector("#goals-reasoning"),
  goalCalories: document.querySelector("#goal-calories"),
  goalProtein: document.querySelector("#goal-protein"),
  goalCarbs: document.querySelector("#goal-carbs"),
  goalFat: document.querySelector("#goal-fat"),
  goalWater: document.querySelector("#goal-water"),
  goalExercise: document.querySelector("#goal-exercise"),
  goalsApplyBtn: document.querySelector("#goals-apply-btn"),
  goalsBackBtn: document.querySelector("#goals-back-btn"),
  goalsErrorBack: document.querySelector("#goals-error-back"),
  goalsModalClose: document.querySelector("#goals-modal-close"),
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
  // 최근/자주 먹는 음식
  recentMealsOpen: document.querySelector("#recent-meals-open"),
  recentMealsModal: document.querySelector("#recent-meals-modal"),
  recentMealsClose: document.querySelector("#recent-meals-close"),
  recentMealsList: document.querySelector("#recent-meals-list"),
  frequentMealsOpen: document.querySelector("#frequent-meals-open"),
  frequentMealsModal: document.querySelector("#frequent-meals-modal"),
  frequentMealsClose: document.querySelector("#frequent-meals-close"),
  frequentMealsList: document.querySelector("#frequent-meals-list"),
  // 공유
  shareApp: document.querySelector("#share-app"),
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
  // 배틀 모드
  battleMode: document.querySelector("#battle-mode"),
  battleModal: document.querySelector("#battle-modal"),
  battleClose: document.querySelector("#battle-close"),
  battleRanking: document.querySelector("#battle-ranking"),
  battleInviteBtn: document.querySelector("#battle-invite-btn"),
  battleSearch: document.querySelector("#battle-search"),
  battleSearchResults: document.querySelector("#battle-search-results"),
  battleAddHint: document.querySelector("#battle-add-hint"),
  battleFriends: document.querySelector("#battle-friends"),
  battleCommentInput: document.querySelector("#battle-comment-input"),
  battleCommentSend: document.querySelector("#battle-comment-send"),
  battleComments: document.querySelector("#battle-comments"),
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
  // ⭐ OAuth 리디렉션으로 URL이 정리되기 전에 invite 파라미터 먼저 저장
  try {
    const inviteParam = new URLSearchParams(window.location.search).get("invite");
    if (inviteParam) {
      localStorage.setItem("pending-invite", inviteParam);
    }
  } catch {}

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
  // 배틀 모드용: 본인 streak 백그라운드 업로드 + 대기 중인 초대 처리
  setTimeout(async () => {
    await uploadMyStreak().catch(() => {});
    await processPendingInvite().catch(() => {});
  }, 800);
}

// 초대 링크로 들어온 경우 양방향 친구 자동 등록
async function processPendingInvite() {
  const inviterId = localStorage.getItem("pending-invite");
  if (!inviterId || !supabase || !authUser) return;
  // 처리 시도 — 성공/실패 무관하게 일단 제거 (무한 재시도 방지)
  localStorage.removeItem("pending-invite");

  if (inviterId === authUser.id) return; // 자기 자신

  try {
    const { data, error } = await supabase.rpc("create_mutual_friendship", { inviter_id: inviterId });
    if (error) throw error;
    if (data === "ok") {
      // 초대자 이름 조회해서 환영 메시지
      let friendName = "친구";
      try {
        const { data: rows } = await supabase
          .from("user_streaks")
          .select("display_name")
          .eq("user_id", inviterId)
          .limit(1);
        if (rows && rows[0]?.display_name) friendName = rows[0].display_name;
      } catch {}
      showToast(`${friendName}님과 배틀이 시작됐어요! ⚔`, 3500);
      // 배틀 모달 자동으로 열어서 확인시켜주기
      setTimeout(() => { if (typeof openBattleModal === "function") openBattleModal(); }, 1200);
    }
  } catch (err) {
    console.warn("초대 처리 실패:", err);
  }
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

  if (!p.age || !p.height || !p.weight || !p.loss) {
    alert("나이·키·체중·감량 목표를 모두 입력해 주세요.");
    return;
  }

  const recommendation = buildRecommendation();
  if (!recommendation) {
    alert("입력값을 확인해 주세요.");
    return;
  }

  // 결과 모달 즉시 표시 (AI 호출 없음, 100% 로컬 계산)
  els.goalsModal.classList.remove("is-hidden");
  els.goalsLoading.classList.add("is-hidden");
  els.goalsError.classList.add("is-hidden");

  const t = recommendation.targets;
  els.goalCalories.value = t.calories;
  els.goalProtein.value = t.protein;
  els.goalCarbs.value = t.carbs;
  els.goalFat.value = t.fat;
  els.goalWater.value = (t.water / 1000).toFixed(1);
  els.goalExercise.value = t.exerciseMinutes;
  els.goalsReasoning.textContent = recommendation.reasoning;
  // 위험 경고가 있으면 reasoning 위에 빨간 박스로 노출
  let warnEl = document.querySelector("#goals-warning");
  if (!warnEl) {
    warnEl = document.createElement("div");
    warnEl.id = "goals-warning";
    warnEl.className = "goals-warning";
    els.goalsReasoning.parentElement.insertBefore(warnEl, els.goalsReasoning);
  }
  if (recommendation.warning) {
    warnEl.textContent = "⚠️ " + recommendation.warning;
    warnEl.style.display = "block";
  } else {
    warnEl.style.display = "none";
  }

  // 경고 배지 표시 (감량 속도 너무 빠를 때)
  const existingWarning = document.querySelector(".goals-warning");
  if (existingWarning) existingWarning.remove();
  if (recommendation.warning) {
    const warningEl = document.createElement("div");
    warningEl.className = "goals-warning";
    warningEl.innerHTML = `<strong>⚠ 안전 권장</strong> · ${escapeHtml(recommendation.warning)}`;
    els.goalsReasoning.insertAdjacentElement("afterend", warningEl);
  }

  // applyGoals에서 사용
  state._pendingRecommendation = recommendation;
  els.goalsResult.classList.remove("is-hidden");
}

// 목표 적용 확정
function applyGoals() {
  const calories = Number(els.goalCalories.value) || 1800;
  const protein = Number(els.goalProtein.value) || 120;
  const carbs = Number(els.goalCarbs.value) || 180;
  const fat = Number(els.goalFat.value) || 60;
  const water = Math.round((Number(els.goalWater.value) || 2.0) * 1000);
  const exerciseMinutes = Number(els.goalExercise.value) || 30;
  const weight = Number(state.profile.weight) || 70;
  // 운동 소모 칼로리: MET 5.0 × 체중 × 0.0175 × 분
  const exerciseCalories = Math.round(weight * 5.0 * 0.0175 * exerciseMinutes);

  state.profile.targets = { calories, protein, carbs, fat, water, exerciseMinutes, exerciseCalories };
  state.profile.appliedPlan = state._pendingRecommendation || null;
  state.profile.onboarded = true;
  state.profile.activeWeekStart = weekKeyFor();
  state.view = "weekly";
  els.goalsModal.classList.add("is-hidden");
  delete state._pendingRecommendation;
  render();
}

// 목표 모달 버튼 핸들러
if (els.goalsApplyBtn) els.goalsApplyBtn.addEventListener("click", applyGoals);
if (els.goalsBackBtn) els.goalsBackBtn.addEventListener("click", () => els.goalsModal.classList.add("is-hidden"));
if (els.goalsErrorBack) els.goalsErrorBack.addEventListener("click", () => els.goalsModal.classList.add("is-hidden"));
if (els.goalsModalClose) els.goalsModalClose.addEventListener("click", () => els.goalsModal.classList.add("is-hidden"));

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
            <button class="byfood-remove" type="button" data-remove-meal="${meal.id}" aria-label="이 음식 삭제" title="삭제">−</button>
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

  // 삭제(−) 버튼 → 그날 식단에서 이 음식 제거
  els.byfoodList.querySelectorAll(".byfood-remove").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const mealId = btn.getAttribute("data-remove-meal");
      removeMealFromDay(mealId);
    });
  });
}

// 그날 식단에서 음식 1개 제거
function removeMealFromDay(mealId) {
  const day = getDay();
  const meal = (day.meals || []).find((m) => m.id === mealId);
  if (!meal) return;
  if (!confirm(`'${meal.title}'을(를) 오늘 기록에서 뺄까요?`)) return;
  day.meals = day.meals.filter((m) => m.id !== mealId);
  saveState();
  render();
  showToast("기록에서 뺐어요");
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
  const lossInput = Number(p.loss || 0);
  const age = Number(p.age || 30);
  const gender = p.gender || "female";
  const activityLevel = Number(p.activityLevel || 2);
  const conditions = p.conditions || {};

  if (!height || !weight || !lossInput) return null;

  // ⭐ 의학 권장: 주당 최대 1kg (그 이상은 근손실·요요·건강 위험)
  const lossCapped = Math.min(lossInput, 1.0);
  const loss = lossCapped;
  const lossWasCapped = lossInput > 1.0;

  // 1) BMI 계산 (한국 기준: <18.5 저체중, 18.5~22.9 정상, 23~24.9 과체중, 25~29.9 비만1, 30+ 비만2)
  const bmi = weight / Math.pow(height / 100, 2);

  // 2) Mifflin-St Jeor BMR (Harris-Benedict보다 ±10% 더 정확)
  const bmr = gender === "female"
    ? 10 * weight + 6.25 * height - 5 * age - 161
    : 10 * weight + 6.25 * height - 5 * age + 5;

  // 3) 활동계수 (한국인 기준 약간 보수적)
  const activityMult = { 1: 1.2, 2: 1.35, 3: 1.5, 4: 1.65, 5: 1.85 }[activityLevel] || 1.5;
  const tdeeBase = bmr * activityMult;

  // 4) 운동 권장 분량 (활동량 + 감량 목표 + 첫 주 보정)
  const firstWeek = !hasTargets();
  let exerciseBase = { 1: 25, 2: 30, 3: 40, 4: 50, 5: 60 }[activityLevel] || 35;
  if (loss > 0.5) exerciseBase += 10;
  if (firstWeek) exerciseBase = Math.min(exerciseBase, 40); // 첫 주는 무리하지 않기
  if (bmi >= 30 && exerciseBase > 45) exerciseBase = 45; // 비만 2단계는 관절 부담 고려
  const exerciseMinutes = Math.min(exerciseBase, 75);

  // 5) 운동 소모 칼로리 — 평균 MET 5.0 (걷기·달리기·웨이트 평균)
  // 공식: 체중 × MET × 0.0175 × 분
  const plannedExerciseKcal = Math.round(weight * 5.0 * 0.0175 * exerciseMinutes);
  const tdee = tdeeBase + plannedExerciseKcal;

  // 6) 칼로리 적자 계산 (1kg 지방 = 7700kcal)
  const dailyDeficit = (loss * 7700) / 7;
  const minCalories = gender === "female" ? 1200 : 1400;

  // 저체중인데 감량 목표면 권장 안 함 → 유지 칼로리
  let calories;
  if (bmi < 18.5) {
    calories = roundTo(tdeeBase, 50); // 운동 칼로리 미반영, 유지
  } else {
    calories = Math.max(minCalories, roundTo(tdee - dailyDeficit, 50));
  }

  // 7) 단백질: 체중 × g/kg (활동량 + BMI 반영, 비율 X)
  let proteinPerKg = 1.6;
  if (activityLevel >= 4) proteinPerKg = 1.8;
  if (activityLevel >= 5) proteinPerKg = 2.0;
  if (bmi >= 30) proteinPerKg = Math.max(proteinPerKg, 1.8); // 비만 → 근손실 방지
  if (age >= 60) proteinPerKg = Math.max(proteinPerKg, 1.5); // 노년 → 근감소증 예방
  let protein = Math.round(weight * proteinPerKg);

  // 8) 지방: 칼로리 25~30% (건강 상태별 조정)
  let fatRatio = 0.27;
  if (conditions.hyperlipidemia?.checked) fatRatio = 0.20; // 고지혈증: 저지방
  if (conditions.diabetes?.checked) fatRatio = 0.32;       // 당뇨: 저탄·고지방 약간 허용
  const fat = Math.round((calories * fatRatio) / 9);

  // 9) 당뇨면 단백질 비율 30%로 강제 (혈당 안정화)
  if (conditions.diabetes?.checked) {
    protein = Math.round((calories * 0.30) / 4);
  }

  // 10) 탄수화물: 나머지 (최소 80g, 저혈당·뇌기능 유지)
  const carbs = Math.max(80, Math.round((calories - protein * 4 - fat * 9) / 4));

  // 11) 물 목표: 체중 × 30ml + 운동 분당 +10ml, 최대 2500ml
  const water = Math.min(roundTo(weight * 30 + exerciseMinutes * 10, 100), 2500);

  // 12) BMI별 메시지
  const bmiLabel =
    bmi < 18.5 ? "저체중" :
    bmi < 23 ? "정상" :
    bmi < 25 ? "과체중" :
    bmi < 30 ? "비만 1단계" : "비만 2단계 이상";

  const bmiAdvice =
    bmi < 18.5 ? "감량 대신 균형 잡힌 영양 섭취를 권장합니다." :
    bmi < 23 ? "현재 컨디션 유지가 우선입니다." :
    bmi < 25 ? "가벼운 식이·운동으로 충분합니다." :
    bmi < 30 ? "꾸준한 감량과 단백질 섭취가 핵심입니다." :
    "단백질 비율을 높이고 무리하지 않는 운동을 권장합니다.";

  // 13) 건강 상태 코멘트
  const condNotes = [];
  if (conditions.diabetes?.checked) condNotes.push("당뇨 관리 모드: 저탄·고단백");
  if (conditions.hyperlipidemia?.checked) condNotes.push("고지혈증 관리 모드: 저지방");

  const reasoning =
    `BMI ${bmi.toFixed(1)} (${bmiLabel}) · ${bmiAdvice} ` +
    `기초대사량 ${Math.round(bmr)}kcal, 활동·운동 포함 소모 ${Math.round(tdee)}kcal. ` +
    `주당 ${loss}kg 감량을 위해 일 ${Math.round(dailyDeficit)}kcal 적자.` +
    (condNotes.length ? ` ${condNotes.join(", ")}.` : "");

  const warning = lossWasCapped
    ? `입력하신 주당 ${lossInput}kg 감량은 의학적으로 위험합니다 (근손실·요요·호르몬 불균형). 안전 권장치인 주당 1kg로 조정했습니다.`
    : (loss > 0.7
        ? "주당 0.7kg 이상은 빠른 감량입니다. 가능하면 0.5kg 내외를 권장합니다."
        : null);

  return {
    weekStart: weekKeyFor(),
    createdAt: new Date().toISOString(),
    inputs: { height, weight, loss, age, gender, activityLevel, bmi },
    targets: {
      calories,
      protein,
      carbs,
      fat,
      water,
      exerciseMinutes,
      exerciseCalories: plannedExerciseKcal,
    },
    weeklyLoss: loss,
    reasoning,
    warning,
    bmi,
    bmiLabel,
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
  const ocrTitleEl = document.querySelector("#ocr-title");
  if (ocrTitleEl) ocrTitleEl.textContent = "AI 분석 결과";
  if (els.ocrHint) els.ocrHint.textContent = "AI가 영양정보를 분석 중입니다...";

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
        if (errData.finishReason) detail += ` [finish: ${errData.finishReason}]`;
        if (errData.raw) detail += ` RAW: ${errData.raw.slice(0, 150)}`;
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
      <div class="my-food-item"
        data-food-id="${f.id}"
        data-food-name="${escapeAttr(f.name)}"
        data-kcal="${Math.round(f.kcal || 0)}"
        data-protein="${roundOne(f.protein || 0)}"
        data-carbs="${roundOne(f.carbs || 0)}"
        data-fat="${roundOne(f.fat || 0)}"
        data-sugar="${roundOne(f.sugar || 0)}"
        data-sodium="${Math.round(f.sodium || 0)}"
        data-cholesterol="${Math.round(f.cholesterol || 0)}"
        data-saturated-fat="${roundOne(f.saturated_fat || 0)}">
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

// 토스트 메시지 (하단 잠깐 표시)
function showToast(msg, duration = 2000) {
  let el = document.getElementById("toast-msg");
  if (!el) {
    el = document.createElement("div");
    el.id = "toast-msg";
    document.body.appendChild(el);
  }
  el.textContent = msg;
  el.classList.add("toast-visible");
  clearTimeout(el._timer);
  el._timer = setTimeout(() => el.classList.remove("toast-visible"), duration);
}

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
      // ⭐ 저장된 영양정보로 즉시 식단 추가 (AI 재분석 없음)
      const d = item.dataset;
      const meal = {
        id: makeId(),
        title: d.foodName,
        raw: d.foodName,
        kcal: Number(d.kcal) || 0,
        protein: Number(d.protein) || 0,
        carbs: Number(d.carbs) || 0,
        fat: Number(d.fat) || 0,
        sugar: Number(d.sugar) || 0,
        sodium: Number(d.sodium) || 0,
        cholesterol: Number(d.cholesterol) || 0,
        saturatedFat: Number(d.saturatedFat) || 0,
      };

      // 1) 모달 즉시 닫기
      closeMyFoodsModal();
      // 2) 오늘 식단에 추가
      const day = getDay();
      day.meals.push(meal);
      saveState();
      render();
      // 3) 토스트로 확인 메시지
      showToast(`${d.foodName} 추가됨 ✓`);
      // 4) last_used_at 갱신 (백그라운드)
      if (supabase && authUser) {
        supabase.from("my_foods").update({ last_used_at: new Date().toISOString() }).eq("id", d.foodId).then(() => {});
      }
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
  const ocrTitle = document.querySelector("#ocr-title");
  if (ocrTitle) ocrTitle.textContent = "영양정보 스캔 결과";
  els.ocrHint.textContent = "영양표를 읽는 중입니다...";

  // 기존 에러/로딩 정리
  const oldLoading = els.ocrModal.querySelector(".ocr-loading, .ocr-error");
  if (oldLoading) oldLoading.remove();

  const loading = document.createElement("div");
  loading.className = "ocr-loading";
  loading.textContent = "영양표 스캔 중...";
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
        if (errData.finishReason) detail += ` [finish: ${errData.finishReason}]`;
        if (errData.raw) detail += ` RAW: ${errData.raw.slice(0, 150)}`;
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
    // 1) 데이터 추출
    const meal = readOcrFormAsMeal();
    const servingValue = Number(els.ocrServing.value) || 100;
    // 2) ⭐ 즉시 모달 닫기 (사용자 피드백 우선)
    closeOcrModal();
    // 3) 식단에 추가 + 화면 갱신
    const day = getDay();
    day.meals.push(meal);
    saveState();
    render();
    // 4) 백그라운드 캐시 저장 (실패해도 무시)
    saveAiCache(
      {
        name: meal.title,
        serving_grams: servingValue,
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
  });
}

if (els.ocrSaveFavorite) {
  els.ocrSaveFavorite.addEventListener("click", () => {
    // 1) 데이터 추출
    const meal = readOcrFormAsMeal();
    const servingValue = Number(els.ocrServing.value) || 100;
    // 2) ⭐ 즉시 모달 닫기
    closeOcrModal();
    // 3) 식단에 추가 + 화면 갱신
    const day = getDay();
    day.meals.push(meal);
    saveState();
    render();
    // 4) 백그라운드: My Foods + 캐시 (둘 다 실패해도 모달은 이미 닫혔으니 무시)
    saveMealToMyFoods(meal).catch(() => {});
    saveAiCache(
      {
        name: meal.title,
        serving_grams: servingValue,
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
  });
}

// ============================================================
// 배틀 모드 — 친구 + 연속 성공 일수 랭킹
// ============================================================

// 본인의 연속 성공 일수 계산 — 칼로리 목표 이내 + 식단 기록 있는 날 연속
function calculateMyStreak() {
  const days = state.days || {};
  const targetKcal = state.profile?.targetCalories || 2000;
  const today = new Date();
  let streak = 0;

  for (let i = 0; i < 365; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const iso = date.toISOString().slice(0, 10);
    const day = days[iso];

    // 데이터 없으면 — 오늘은 봐주고, 그 외엔 streak 끊김
    if (!day || !day.meals || day.meals.length === 0) {
      if (i === 0) continue;
      break;
    }

    // net 칼로리: 섭취 - 운동
    const totalKcal = day.meals.reduce((sum, m) => sum + (m.kcal || 0), 0);
    const weight = day.weight || state.profile?.weight || 70;
    const exerciseKcal = Object.entries(day.exercise || {}).reduce((sum, [type, count]) => {
      const met = exerciseTypes[type]?.met || 4;
      const minutes = (count || 0) * 10;
      return sum + ((met * weight * minutes) / 60);
    }, 0);
    const netKcal = totalKcal - exerciseKcal;

    if (netKcal <= targetKcal) {
      streak++;
    } else {
      if (i === 0) continue;
      break;
    }
  }
  return streak;
}

// 본인 streak를 Supabase에 업로드 (배틀 모드용 공개 데이터)
async function uploadMyStreak() {
  if (!supabase || !authUser) return;
  try {
    const streakDays = calculateMyStreak();
    const today = new Date().toISOString().slice(0, 10);
    const email = authUser.email || "";
    const displayName = state.profile?.name || authUser.user_metadata?.name || email.split("@")[0] || "유저";
    const avatarUrl = authUser.user_metadata?.avatar_url || authUser.user_metadata?.picture || null;

    await supabase.from("user_streaks").upsert(
      {
        user_id: authUser.id,
        email,
        display_name: displayName,
        avatar_url: avatarUrl,
        streak_days: streakDays,
        last_active_date: today,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id" }
    );
  } catch (err) {
    console.warn("streak 업로드 실패:", err);
  }
}

// 내 친구 목록 조회
async function loadFriends() {
  if (!supabase || !authUser) return [];
  try {
    const { data, error } = await supabase
      .from("friends")
      .select("*")
      .eq("user_id", authUser.id)
      .order("created_at", { ascending: true });
    if (error) throw error;
    return data || [];
  } catch (err) {
    console.warn("친구 목록 로드 실패:", err);
    return [];
  }
}

// 친구의 user_streaks 조회 (랭킹용)
async function loadRanking() {
  if (!supabase || !authUser) return [];
  try {
    const friends = await loadFriends();
    const friendUserIds = friends.map((f) => f.friend_user_id).filter(Boolean);
    const userIds = [authUser.id, ...friendUserIds];
    if (userIds.length === 0) return [];

    const { data, error } = await supabase
      .from("user_streaks")
      .select("*")
      .in("user_id", userIds);
    if (error) throw error;
    return (data || []).sort((a, b) => (b.streak_days || 0) - (a.streak_days || 0));
  } catch (err) {
    console.warn("랭킹 로드 실패:", err);
    return [];
  }
}

// 이메일로 친구 찾기 + 추가
async function addFriendByEmail(email) {
  const cleanEmail = email.trim().toLowerCase();
  if (!cleanEmail) return { ok: false, msg: "이메일을 입력하세요." };
  if (cleanEmail === (authUser.email || "").toLowerCase()) {
    return { ok: false, msg: "본인은 추가할 수 없습니다." };
  }

  try {
    // 1) Supabase에 그 이메일로 가입한 사람 찾기
    const { data: found, error: findError } = await supabase.rpc("find_user_by_email", { target_email: cleanEmail });
    if (findError) throw findError;
    if (!found || found.length === 0) {
      return { ok: false, msg: "Diet Battle 가입자가 아닙니다. 친구에게 가입을 요청하세요." };
    }
    const friend = found[0];

    // 2) friends 테이블에 추가
    const { error: insertError } = await supabase.from("friends").insert({
      user_id: authUser.id,
      friend_email: cleanEmail,
      friend_user_id: friend.user_id,
      display_name: friend.display_name || cleanEmail.split("@")[0],
    });
    if (insertError) {
      if (insertError.code === "23505") {
        return { ok: false, msg: "이미 추가한 친구입니다." };
      }
      throw insertError;
    }
    return { ok: true, msg: `${friend.display_name || cleanEmail} 추가 완료!` };
  } catch (err) {
    console.warn("친구 추가 실패:", err);
    return { ok: false, msg: `오류: ${err.message || err}` };
  }
}

async function removeFriend(friendId, displayName) {
  if (!confirm(`${displayName}을(를) 친구 목록에서 제거할까요?`)) return false;
  try {
    await supabase.from("friends").delete().eq("id", friendId);
    return true;
  } catch (err) {
    console.warn("친구 제거 실패:", err);
    return false;
  }
}

// 아바타 HTML — 사진 있으면 이미지, 없으면 이니셜 + 색 배경
function avatarHtml(name, avatarUrl, size = 56) {
  const initial = (name || "?").trim().charAt(0).toUpperCase();
  // 이름 해시로 일관된 색상
  let hash = 0;
  for (let i = 0; i < (name || "").length; i++) hash = (name.charCodeAt(i) + ((hash << 5) - hash)) | 0;
  const hue = Math.abs(hash) % 360;
  const bg = `hsl(${hue}, 55%, 60%)`;
  if (avatarUrl) {
    return `<div class="bvs-avatar" style="width:${size}px;height:${size}px;">
      <img src="${escapeAttr(avatarUrl)}" alt="${escapeAttr(name)}" onerror="this.style.display='none';this.parentElement.style.background='${bg}';this.parentElement.textContent='${initial}';" />
    </div>`;
  }
  return `<div class="bvs-avatar bvs-avatar-initial" style="width:${size}px;height:${size}px;background:${bg};">${initial}</div>`;
}

// 메달 표시 — 성공일수만큼 🏅, 최대 12개 + 나머지 카운트
function medalsHtml(days) {
  if (days <= 0) return `<span class="bvs-medals-empty">기록 시작 전</span>`;
  const show = Math.min(days, 12);
  let html = "🏅".repeat(show);
  if (days > 12) html += `<span class="bvs-medal-more">+${days - 12}</span>`;
  return `<span class="bvs-medals">${html}</span>`;
}

// VS 카드 렌더 — 나 VS 각 친구
function renderRanking(ranking) {
  if (!ranking || ranking.length === 0) {
    els.battleRanking.innerHTML = `<p class="battle-empty">친구를 초대해서 배틀을 시작하세요.</p>`;
    return;
  }

  const me = ranking.find((r) => r.user_id === authUser.id) || {
    user_id: authUser.id,
    display_name: state.profile?.name || "나",
    streak_days: 0,
    avatar_url: authUser.user_metadata?.avatar_url || authUser.user_metadata?.picture || null,
  };
  const friends = ranking.filter((r) => r.user_id !== authUser.id);

  if (friends.length === 0) {
    els.battleRanking.innerHTML = `<p class="battle-empty">친구를 초대해서 배틀을 시작하세요.</p>`;
    return;
  }

  const myName = me.display_name || "나";
  const myDays = me.streak_days || 0;

  els.battleRanking.innerHTML = friends
    .map((fr) => {
      const frName = fr.display_name || fr.email?.split("@")[0] || "친구";
      const frDays = fr.streak_days || 0;
      const meWins = myDays > frDays;
      const frWins = frDays > myDays;
      const tie = myDays === frDays && myDays > 0;

      return `
        <div class="bvs-card">
          <div class="bvs-side ${meWins ? "is-winning" : ""}">
            <div class="bvs-trophy">${meWins || tie ? "🏆" : ""}</div>
            ${avatarHtml(myName, me.avatar_url)}
            <div class="bvs-name">${escapeHtml(myName)} <span class="bvs-me-tag">나</span></div>
            <div class="bvs-days">${myDays === 0 ? "시작 전" : `${myDays}일째!`}</div>
            ${medalsHtml(myDays)}
          </div>
          <div class="bvs-divider">VS</div>
          <div class="bvs-side ${frWins ? "is-winning" : ""}">
            <div class="bvs-trophy">${frWins || tie ? "🏆" : ""}</div>
            ${avatarHtml(frName, fr.avatar_url)}
            <div class="bvs-name">${escapeHtml(frName)}</div>
            <div class="bvs-days">${frDays === 0 ? "시작 전" : `${frDays}일째!`}</div>
            ${medalsHtml(frDays)}
          </div>
        </div>
      `;
    })
    .join("");
}

function renderFriendsList(friends) {
  if (!friends || friends.length === 0) {
    els.battleFriends.innerHTML = `<p class="battle-empty">아직 추가한 친구가 없습니다.</p>`;
    return;
  }
  els.battleFriends.innerHTML = friends
    .map(
      (f) => `
      <div class="battle-friend-item" data-friend-id="${f.id}" data-friend-name="${escapeAttr(f.display_name || f.friend_email)}">
        <div class="battle-friend-info">
          <span class="battle-friend-name">${escapeHtml(f.display_name || f.friend_email.split("@")[0])}</span>
          <span class="battle-friend-email">${escapeHtml(f.friend_email)}</span>
        </div>
        <span class="battle-friend-remove">×</span>
      </div>
    `
    )
    .join("");
}

// 이메일/닉네임으로 사용자 검색 (자동완성)
async function searchUsersByQuery(query) {
  const q = (query || "").trim();
  if (q.length < 1) return [];
  try {
    const { data, error } = await supabase.rpc("search_users", { search_query: q });
    if (error) throw error;
    // 본인 + 이미 친구 제외
    const friends = await loadFriends();
    const friendIds = new Set(friends.map((f) => f.friend_user_id));
    return (data || []).filter((u) => u.user_id !== authUser.id && !friendIds.has(u.user_id));
  } catch (err) {
    console.warn("사용자 검색 실패:", err);
    return [];
  }
}

// 검색 결과에서 친구 추가 (이메일 기반 친구 추가 로직 재사용)
async function addFriendByUser(user) {
  try {
    const { error: insertError } = await supabase.from("friends").insert({
      user_id: authUser.id,
      friend_email: user.email,
      friend_user_id: user.user_id,
      display_name: user.display_name || user.email.split("@")[0],
    });
    if (insertError) {
      if (insertError.code === "23505") {
        return { ok: false, msg: "이미 추가한 친구입니다." };
      }
      throw insertError;
    }
    return { ok: true, msg: `${user.display_name || user.email} 추가 완료!` };
  } catch (err) {
    console.warn("친구 추가 실패:", err);
    return { ok: false, msg: `오류: ${err.message || err}` };
  }
}

function renderSearchResults(results, query) {
  if (!els.battleSearchResults) return;
  if (!query || query.trim().length < 1) {
    els.battleSearchResults.innerHTML = "";
    return;
  }
  if (results.length === 0) {
    els.battleSearchResults.innerHTML = `<div class="battle-search-empty">"${escapeHtml(query)}" 검색 결과 없음 — 친구가 Diet Battle에 가입했는지 확인하세요.</div>`;
    return;
  }
  els.battleSearchResults.innerHTML = results
    .map((u) => {
      const name = escapeHtml(u.display_name || u.email.split("@")[0]);
      const email = escapeHtml(u.email);
      const days = u.streak_days || 0;
      return `
        <div class="battle-search-result" data-user-id="${u.user_id}">
          <div class="battle-search-info">
            <div class="battle-search-name">${name}</div>
            <div class="battle-search-meta">${email} · ${days}일째 성공</div>
          </div>
          <button class="battle-search-add-btn" type="button" data-add-user="${u.user_id}" aria-label="추가">+</button>
        </div>
      `;
    })
    .join("");
}

// ─── 응원 코멘트 (공용 보드) ──────────────────────────
async function loadComments() {
  if (!supabase || !authUser) return [];
  try {
    const { data, error } = await supabase
      .from("battle_comments")
      .select("*")
      .order("created_at", { ascending: true })
      .limit(200);
    if (error) throw error;
    return data || [];
  } catch (err) {
    console.warn("코멘트 로드 실패:", err);
    return [];
  }
}

async function postComment(message) {
  if (!supabase || !authUser) return false;
  const text = (message || "").trim();
  if (!text) return false;
  const myName = state.profile?.name || authUser.user_metadata?.name || authUser.email?.split("@")[0] || "나";
  const myAvatar = authUser.user_metadata?.avatar_url || authUser.user_metadata?.picture || null;
  try {
    const { error } = await supabase.from("battle_comments").insert({
      from_user_id: authUser.id,
      from_name: myName,
      from_avatar: myAvatar,
      message: text,
    });
    if (error) throw error;
    return true;
  } catch (err) {
    console.warn("코멘트 작성 실패:", err);
    return false;
  }
}

function renderComments(comments) {
  if (!els.battleComments) return;
  if (!comments || comments.length === 0) {
    els.battleComments.innerHTML = `<p class="battle-empty">아직 응원 메시지가 없어요. 먼저 한마디 남겨보세요!</p>`;
    return;
  }
  els.battleComments.innerHTML = comments
    .map((c) => {
      const mine = c.from_user_id === authUser.id;
      const name = escapeHtml(c.from_name || "친구");
      const msg = escapeHtml(c.message || "");
      const time = c.created_at ? new Date(c.created_at).toLocaleString("ko-KR", { month: "numeric", day: "numeric", hour: "2-digit", minute: "2-digit" }) : "";
      const actions = mine
        ? `<div class="bchat-actions">
             <button class="bchat-edit" data-edit-id="${c.id}" data-msg="${escapeAttr(c.message || "")}">수정</button>
             <button class="bchat-delete" data-delete-id="${c.id}">삭제</button>
           </div>`
        : "";
      return `
        <div class="bchat-row ${mine ? "is-mine" : ""}">
          ${mine ? "" : avatarHtml(c.from_name, c.from_avatar, 32)}
          <div class="bchat-bubble-wrap">
            ${mine ? "" : `<div class="bchat-name">${name}</div>`}
            <div class="bchat-bubble">${msg}</div>
            <div class="bchat-meta">
              <span class="bchat-time">${time}</span>
              ${actions}
            </div>
          </div>
        </div>
      `;
    })
    .join("");
  // 최신 메시지로 스크롤
  els.battleComments.scrollTop = els.battleComments.scrollHeight;
}

// 코멘트 삭제
async function deleteComment(id) {
  if (!confirm("이 메시지를 삭제할까요?")) return;
  try {
    const { error } = await supabase.from("battle_comments").delete().eq("id", id);
    if (error) throw error;
    showToast("삭제됐어요");
    await refreshComments();
  } catch (err) {
    console.warn("삭제 실패:", err);
    showToast("삭제 실패");
  }
}

// 코멘트 수정
async function editComment(id, oldMsg) {
  const newMsg = prompt("메시지 수정:", oldMsg);
  if (newMsg === null) return; // 취소
  const trimmed = newMsg.trim();
  if (!trimmed) return;
  if (trimmed === oldMsg) return; // 변경 없음
  try {
    const { error } = await supabase.from("battle_comments").update({ message: trimmed }).eq("id", id);
    if (error) throw error;
    showToast("수정됐어요");
    await refreshComments();
  } catch (err) {
    console.warn("수정 실패:", err);
    showToast("수정 실패");
  }
}

async function refreshComments() {
  const comments = await loadComments();
  renderComments(comments);
}

async function openBattleModal() {
  els.battleModal.classList.remove("is-hidden");
  if (els.battleSearch) els.battleSearch.value = "";
  if (els.battleSearchResults) els.battleSearchResults.innerHTML = "";
  if (els.battleComments) els.battleComments.innerHTML = `<p class="battle-empty">불러오는 중...</p>`;

  // 본인 streak 먼저 업데이트
  await uploadMyStreak();

  const [ranking, friends, comments] = await Promise.all([loadRanking(), loadFriends(), loadComments()]);
  renderRanking(ranking);
  renderFriendsList(friends);
  renderComments(comments);
}

function closeBattleModal() {
  els.battleModal.classList.add("is-hidden");
  if (els.battleSearch) els.battleSearch.value = "";
  if (els.battleSearchResults) els.battleSearchResults.innerHTML = "";
}

// 코멘트 전송
if (els.battleCommentSend) {
  els.battleCommentSend.addEventListener("click", async () => {
    const text = els.battleCommentInput.value;
    if (!text.trim()) return;
    els.battleCommentSend.disabled = true;
    const ok = await postComment(text);
    els.battleCommentSend.disabled = false;
    if (ok) {
      els.battleCommentInput.value = "";
      await refreshComments();
    } else {
      showToast("전송 실패. 다시 시도해주세요.");
    }
  });
}
if (els.battleCommentInput) {
  els.battleCommentInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      els.battleCommentSend?.click();
    }
  });
}

// 코멘트 수정/삭제 버튼 (이벤트 위임)
if (els.battleComments) {
  els.battleComments.addEventListener("click", (e) => {
    const delBtn = e.target.closest("[data-delete-id]");
    if (delBtn) {
      deleteComment(delBtn.getAttribute("data-delete-id"));
      return;
    }
    const editBtn = e.target.closest("[data-edit-id]");
    if (editBtn) {
      editComment(editBtn.getAttribute("data-edit-id"), editBtn.getAttribute("data-msg") || "");
    }
  });
}

if (els.battleMode) {
  els.battleMode.addEventListener("click", openBattleModal);
}
if (els.battleClose) {
  els.battleClose.addEventListener("click", closeBattleModal);
}
if (els.battleModal) {
  els.battleModal.addEventListener("click", (e) => {
    if (e.target === els.battleModal) closeBattleModal();
  });
}

// 자동완성 검색 — debounce 300ms
let battleSearchTimer = null;
let battleSearchCache = [];
if (els.battleSearch) {
  els.battleSearch.addEventListener("input", () => {
    clearTimeout(battleSearchTimer);
    const query = els.battleSearch.value;
    if (query.trim().length < 1) {
      els.battleSearchResults.innerHTML = "";
      return;
    }
    battleSearchTimer = setTimeout(async () => {
      battleSearchCache = await searchUsersByQuery(query);
      renderSearchResults(battleSearchCache, query);
    }, 300);
  });
}

// 검색 결과의 + 버튼 클릭 → 친구 추가
if (els.battleSearchResults) {
  els.battleSearchResults.addEventListener("click", async (event) => {
    const btn = event.target.closest("[data-add-user]");
    if (!btn) return;
    const userId = btn.dataset.addUser;
    const user = battleSearchCache.find((u) => u.user_id === userId);
    if (!user) return;

    btn.disabled = true;
    els.battleAddHint.textContent = "추가 중...";
    els.battleAddHint.className = "battle-add-hint";

    const result = await addFriendByUser(user);
    els.battleAddHint.textContent = result.msg;
    els.battleAddHint.className = `battle-add-hint ${result.ok ? "success" : "error"}`;

    if (result.ok) {
      // 검색 결과 + 친구 목록 + 랭킹 갱신
      els.battleSearch.value = "";
      els.battleSearchResults.innerHTML = "";
      const [ranking, friends] = await Promise.all([loadRanking(), loadFriends()]);
      renderRanking(ranking);
      renderFriendsList(friends);
    } else {
      btn.disabled = false;
    }
  });
}

if (els.battleFriends) {
  els.battleFriends.addEventListener("click", async (event) => {
    const item = event.target.closest(".battle-friend-item");
    if (!item) return;
    const id = item.dataset.friendId;
    const name = item.dataset.friendName;
    const removed = await removeFriend(id, name);
    if (removed) {
      const [ranking, friends] = await Promise.all([loadRanking(), loadFriends()]);
      renderRanking(ranking);
      renderFriendsList(friends);
    }
  });
}

// ============================================================
// 최근에 먹은 음식 — state.days에서 자동 추출 (API 호출 X)
// ============================================================

function getRecentMeals() {
  const meals = [];
  const seenTitles = new Set();
  const sortedDates = Object.keys(state.days || {}).sort().reverse();

  for (const date of sortedDates) {
    const dayMeals = (state.days[date]?.meals || []).slice().reverse();
    for (const meal of dayMeals) {
      if (!meal.title || seenTitles.has(meal.title)) continue;
      seenTitles.add(meal.title);
      meals.push(meal);
      if (meals.length >= 30) return meals;
    }
  }
  return meals;
}

// 자주 먹는 음식 — 빈도 계산 TOP 20
function getFrequentMeals() {
  const counter = {};
  const mealData = {};

  for (const day of Object.values(state.days || {})) {
    for (const meal of day?.meals || []) {
      if (!meal.title) continue;
      counter[meal.title] = (counter[meal.title] || 0) + 1;
      mealData[meal.title] = meal; // 최신 영양정보 유지
    }
  }

  return Object.entries(counter)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 20)
    .map(([title, count]) => ({ ...mealData[title], count }));
}

function quickFoodHTML(meal, showRank, rank) {
  const kcal = Math.round(meal.kcal || 0);
  const p = roundOne(meal.protein || 0);
  const c = roundOne(meal.carbs || 0);
  const f = roundOne(meal.fat || 0);
  const rankStr = showRank
    ? `<span class="quick-food-rank">${rank <= 3 ? ["🥇","🥈","🥉"][rank - 1] : rank}</span>`
    : "";
  return `
    <div class="quick-food-item"
      data-title="${escapeAttr(meal.title)}"
      data-kcal="${kcal}"
      data-protein="${p}"
      data-carbs="${c}"
      data-fat="${f}"
      data-sugar="${roundOne(meal.sugar || 0)}"
      data-sodium="${Math.round(meal.sodium || 0)}"
      data-cholesterol="${Math.round(meal.cholesterol || 0)}"
      data-saturated-fat="${roundOne(meal.saturatedFat || 0)}">
      ${rankStr}
      <div class="quick-food-info">
        <div class="quick-food-name">${escapeHtml(meal.title)}</div>
        <div class="quick-food-meta">${kcal} kcal · 단 ${p}g · 탄 ${c}g · 지 ${f}g${showRank ? ` · ${meal.count}회` : ""}</div>
      </div>
      <button class="quick-food-add-btn" type="button" aria-label="추가">+</button>
    </div>`;
}

function addQuickMeal(item) {
  const d = item.dataset;
  const meal = {
    id: makeId(),
    title: d.title,
    raw: d.title,
    kcal: Number(d.kcal) || 0,
    protein: Number(d.protein) || 0,
    carbs: Number(d.carbs) || 0,
    fat: Number(d.fat) || 0,
    sugar: Number(d.sugar) || 0,
    sodium: Number(d.sodium) || 0,
    cholesterol: Number(d.cholesterol) || 0,
    saturatedFat: Number(d.saturatedFat) || 0,
  };
  const day = getDay();
  day.meals.push(meal);
  saveState();
  render();
  showToast(`${d.title} 추가됨 ✓`);
}

// 최근 먹은 음식 모달
function openRecentMealsModal() {
  els.recentMealsModal.classList.remove("is-hidden");
  const meals = getRecentMeals();
  if (!meals.length) {
    els.recentMealsList.innerHTML = `<p class="my-foods-empty">아직 기록된 음식이 없습니다.</p>`;
    return;
  }
  els.recentMealsList.innerHTML = meals.map((m) => quickFoodHTML(m, false, 0)).join("");
}

if (els.recentMealsOpen) els.recentMealsOpen.addEventListener("click", openRecentMealsModal);
if (els.recentMealsClose) els.recentMealsClose.addEventListener("click", () => els.recentMealsModal.classList.add("is-hidden"));
if (els.recentMealsModal) {
  els.recentMealsModal.addEventListener("click", (e) => { if (e.target === els.recentMealsModal) els.recentMealsModal.classList.add("is-hidden"); });
}
if (els.recentMealsList) {
  els.recentMealsList.addEventListener("click", (e) => {
    const btn = e.target.closest(".quick-food-add-btn");
    if (!btn) return;
    const item = btn.closest(".quick-food-item");
    if (!item) return;
    els.recentMealsModal.classList.add("is-hidden");
    addQuickMeal(item);
  });
}

// 자주 먹는 음식 모달
function openFrequentMealsModal() {
  els.frequentMealsModal.classList.remove("is-hidden");
  const meals = getFrequentMeals();
  if (!meals.length) {
    els.frequentMealsList.innerHTML = `<p class="my-foods-empty">아직 기록된 음식이 없습니다.</p>`;
    return;
  }
  els.frequentMealsList.innerHTML = meals.map((m, i) => quickFoodHTML(m, true, i + 1)).join("");
}

if (els.frequentMealsOpen) els.frequentMealsOpen.addEventListener("click", openFrequentMealsModal);
if (els.frequentMealsClose) els.frequentMealsClose.addEventListener("click", () => els.frequentMealsModal.classList.add("is-hidden"));
if (els.frequentMealsModal) {
  els.frequentMealsModal.addEventListener("click", (e) => { if (e.target === els.frequentMealsModal) els.frequentMealsModal.classList.add("is-hidden"); });
}
if (els.frequentMealsList) {
  els.frequentMealsList.addEventListener("click", (e) => {
    const btn = e.target.closest(".quick-food-add-btn");
    if (!btn) return;
    const item = btn.closest(".quick-food-item");
    if (!item) return;
    els.frequentMealsModal.classList.add("is-hidden");
    addQuickMeal(item);
  });
}

// 초대 링크 생성 (내 user_id 포함 → 받는 사람이 자동 친구 등록)
function buildInviteUrl() {
  const base = "https://strong-tulumba-c3bff6.netlify.app";
  if (authUser?.id) return `${base}/?invite=${authUser.id}`;
  return base;
}

// 공유 실행 (초대 링크 포함)
async function shareInvite() {
  // 공유 전에 본인 streak 업로드 (받는 사람이 내 이름 볼 수 있도록)
  uploadMyStreak().catch(() => {});

  const inviteUrl = buildInviteUrl();
  const shareData = {
    title: "Diet Battle 🏆",
    text: "같이 다이어트 배틀 해요! 이 링크로 들어오면 자동으로 배틀 친구가 돼요. 칼로리 목표 달성 연속일수로 경쟁하는 무료 앱이에요.",
    url: inviteUrl,
  };
  if (navigator.share) {
    try {
      await navigator.share(shareData);
    } catch (err) {
      if (err.name !== "AbortError") console.warn("공유 실패:", err);
    }
  } else {
    try {
      await navigator.clipboard.writeText(inviteUrl);
      showToast("초대 링크가 복사되었습니다 📋");
    } catch {
      showToast(`초대 링크: ${inviteUrl}`);
    }
  }
}

// 앱 공유 (Web Share API → 카카오톡 포함)
if (els.shareApp) {
  els.shareApp.addEventListener("click", shareInvite);
}

// 배틀 모달 안의 "친구 초대" 버튼
if (els.battleInviteBtn) {
  els.battleInviteBtn.addEventListener("click", shareInvite);
}

initAuth();
