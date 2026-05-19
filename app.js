// app.js - MVP 화면 전환 및 상태 관리 로직
import { guideArticles } from './guide_data.js';

// 전역 상태 관리
const state = {
    selectedProblem: null,
    selectedCategory: 'all' // 가이드 카테고리 필터링용
};

// 로그인 회원 상태 관리 전역 변수
let currentUser = null;

function checkUserLogin() {
    const saved = localStorage.getItem('selin_user');
    if (saved) {
        currentUser = JSON.parse(saved);
        // 로그인 회원의 경우 등급 정보 및 결제 횟수 세션 동기화
        if (!currentUser.plan) currentUser.plan = "Free";
        if (currentUser.analysisCount === undefined) currentUser.analysisCount = 0;
    } else {
        // 비회원 기본 세션 세팅
        currentUser = {
            name: "비로그인 사용자",
            loggedIn: false,
            plan: "Free",
            analysisCount: parseInt(localStorage.getItem('selin_free_analysis_count') || '0'),
            nextPaymentDate: null,
            paymentMethod: "미등록"
        };
    }
}

// 집 정보 및 현장 상황 데이터 저장을 위한 객체
let projectState = getEmptyProjectState();

function getEmptyProjectState() {
    return {
        projectId: null, // 저장 시 고유 ID 부여
        projectName: '새 프로젝트',
        status: '계획 중',
        lastModified: null,
        selectedProblem: null, // state.selectedProblem과 동기화
        
        housingType: '',
        buildingState: '',
        spaces: [],      
        conditions: [],  
        symptoms: [],    
        experience: '',
        
        budget: '',
        priority: [],    
        selfLevel: '',
        
        materials: {},
        
        estimate: {
            totalCost: 0,
            materialsCost: 0,
            toolCost: 0,
            shippingCost: 0
        },
        
        validationPlan: [],
        
        execution: {
            progress: 0,
            completedSteps: [],
            photos: {},
            notes: {}
        },
        
        coachingRequest: {
            type: 'photo',
            price: 9900,
            photos: [],
            question: '',
            phone: '',
            contactMethod: 'kakao'
        }
    };
}


// 토스트 알림 유틸리티 함수
function showToast(message, duration = 3000) {
    const toastEl = document.getElementById('global-toast');
    const toastText = document.getElementById('global-toast-text');
    if (!toastEl || !toastText) return;
    
    toastText.innerText = message;
    toastEl.classList.add('show');
    
    clearTimeout(window._toastTimer);
    window._toastTimer = setTimeout(() => {
        toastEl.classList.remove('show');
    }, duration);
}

// 초기화
document.addEventListener("DOMContentLoaded", () => {
    // 1. 유저 로그인 정보 검사
    checkUserLogin();
    // 2. 헤더 프로필 UI 렌더링
    updateUserProfileUI();
    // 3. 프로젝트 헤더 및 프로젝트 카드 UI 렌더링
    updateProjectHeaderUI();
    // 4. 기본적으로 홈 화면 활성화
    navigate('home');
    
    // 5. 첫 진입 신규 사용자 온보딩 강제 실행 검사
    const onboardViewed = localStorage.getItem('selin_onboard_viewed');
    if (!onboardViewed) {
        const onboardingSec = document.getElementById('view-onboarding');
        if (onboardingSec) {
            onboardingSec.style.display = 'flex';
            setOnboardingSlide(1); // 1단계 슬라이드 활성화
        }
    }
});

// 화면 전환(라우팅) 함수
function navigate(viewId, params = null) {
    const allViews = document.querySelectorAll('.view-section');
    const allNavItems = document.querySelectorAll('.bottom-nav .nav-item');
    
    // 모든 뷰 숨기기
    allViews.forEach(view => view.classList.remove('active'));
    
    if (viewId === 'home') {
        document.getElementById('view-home').classList.add('active');
        updateBottomNav(0);
        renderHomeGuides(); // 최신 가이드 카드 렌더링
    } 
    else if (viewId === 'problem') {
        document.getElementById('view-problem').classList.add('active');
        updateBottomNav(1);
    }
    else if (viewId === 'questionnaire') {
        document.getElementById('view-questionnaire').classList.add('active');
        updateBottomNav(-1); // 특수 화면이므로 탭 포커스 해제
        
        // 문제 선택 시 선택했던 목적을 타이틀에 반영할 수 있습니다.
        if (state.selectedProblem) {
            // 필요 시 UI 업데이트
        }
    }
    else if (viewId === 'budget') {
        document.getElementById('view-budget').classList.add('active');
        updateBottomNav(-1); // 특수 화면이므로 탭 포커스 해제
    }
    else if (viewId === 'analysis') {
        document.getElementById('view-analysis').classList.add('active');
        updateBottomNav(-1);
    }
    else if (viewId === 'process') {
        document.getElementById('view-process').classList.add('active');
        updateBottomNav(-1);
    }
    else if (viewId === 'calculator') {
        document.getElementById('view-calculator').classList.add('active');
        updateBottomNav(-1);
    }
    else if (viewId === 'estimate') {
        document.getElementById('view-estimate').classList.add('active');
        updateBottomNav(-1);
    }
    else if (viewId === 'validation') {
        document.getElementById('view-validation').classList.add('active');
        updateBottomNav(-1);
    }
    else if (viewId === 'execution') {
        document.getElementById('view-execution').classList.add('active');
        updateBottomNav(-1);
    }
    else if (viewId === 'coaching' || viewId === 'chat') {
        document.getElementById('view-coaching').classList.add('active');
        updateBottomNav(-1);
    }
    else if (viewId === 'document') {
        document.getElementById('view-document').classList.add('active');
        updateBottomNav(-1);
    }
    else if (viewId === 'projects') {
        document.getElementById('view-projects').classList.add('active');
        updateBottomNav(-1);
    }
    else if (viewId === 'pricing') {
        document.getElementById('view-pricing').classList.add('active');
        updateBottomNav(-1);
        updatePricingUI();
    }
    else if (viewId === 'myplan') {
        document.getElementById('view-myplan').classList.add('active');
        updateBottomNav(-1);
        renderMyPlanView();
    }
    else if (viewId === 'guide') {
        document.getElementById('view-guide').classList.add('active');
        updateBottomNav(-1);
        renderGuideListView(); // 가이드 목록 렌더링
    }
    else if (viewId === 'guide-detail') {
        document.getElementById('view-guide-detail').classList.add('active');
        updateBottomNav(-1);
        if (params && params.slug) {
            renderArticleDetailView(params.slug); // 아티클 상세 렌더링
        }
    }
    else if (viewId === 'match-form') {
        document.getElementById('view-match-form').classList.add('active');
        updateBottomNav(-1);
        updateMatchGunguOptions();
        // 분석 결과 화면에서 유도된 경우 공사 유형 자동 매핑
        if (state.selectedProblem) {
            const selectEl = document.getElementById('match-construction-type');
            if (selectEl) selectEl.value = state.selectedProblem;
        }
    }
    else if (viewId === 'match-list') {
        document.getElementById('view-match-list').classList.add('active');
        updateBottomNav(-1);
        renderExpertCards();
    }
    else if (viewId === 'admin-expert') {
        document.getElementById('view-admin-expert').classList.add('active');
        updateBottomNav(-1);
        renderAdminExpertList();
    }
    // 그 외 아직 기능이 개발되지 않은 뷰 (실제 구현된 탭으로의 지능형 리다이렉트 브릿지 장착)
    else {
        if (viewId === 'budget') {
            if (state.selectedProblem) {
                // 이미 진단된 문제가 있으면 자재/예산 계산기로 바로 이동
                document.getElementById('view-calculator').classList.add('active');
                updateBottomNav(-1);
                showToast("📊 진행 중인 프로젝트의 자재 및 예산 계산기로 진입했습니다.");
            } else {
                // 진단된 문제가 없으면 문제 선택 화면으로 안내
                document.getElementById('view-problem').classList.add('active');
                updateBottomNav(1);
                showToast("💡 먼저 해결할 문제를 선택하시면 맞춤형 자재/예산 설계가 활성화됩니다.");
            }
        }
        else if (viewId === 'diagnosis') {
            // 자가진단 시작을 위해 문제 선택 화면으로 부드럽게 연동
            document.getElementById('view-problem').classList.add('active');
            updateBottomNav(1);
            showToast("🔮 셀프 인테리어 자가진단을 시작합니다. 증상을 선택해 주세요.");
        }
        else if (viewId === 'chat') {
            // AI 훈대표 전문가 코칭 실서비스 뷰로 이동
            document.getElementById('view-coaching').classList.add('active');
            updateBottomNav(-1);
            showToast("💬 AI 훈대표 전문가 코칭 및 상담서 제출 화면입니다.");
        }
        else if (viewId === 'detail') {
            // 상세 가이드 페이지(CMS 아티클 목록)로 즉시 우회 안내
            document.getElementById('view-guide').classList.add('active');
            updateBottomNav(-1);
            renderGuideListView();
            showToast("📚 셀프 시공 해결 완벽 가이드북으로 연결되었습니다.");
        }
        else {
            // 그 외 예비 placeholder 작동 유지
            const placeholderView = document.getElementById('view-placeholder');
            if (placeholderView) {
                placeholderView.classList.add('active');
                const titleElement = document.getElementById('placeholder-title');
                if (titleElement) titleElement.innerText = '준비 중인 기능입니다\n(정식 출시 예정)';
            }
            updateBottomNav(-1);
        }
    }
}

// 하단 네비게이션 탭 상태 업데이트
function updateBottomNav(activeIndex) {
    const allNavItems = document.querySelectorAll('.bottom-nav .nav-item');
    allNavItems.forEach(item => item.classList.remove('active'));
    if (activeIndex >= 0 && activeIndex < allNavItems.length) {
        allNavItems[activeIndex].classList.add('active');
    }
}

// MVP 2단계: 문제/목적 카드 선택 처리
function selectProblem(problemId, element) {
    // 이전 선택된 카드의 스타일 제거
    const allCards = document.querySelectorAll('.selection-card');
    allCards.forEach(card => card.classList.remove('selected'));
    
    // 선택한 카드 스타일 활성화
    element.classList.add('selected');
    
    // 상태 저장
    state.selectedProblem = problemId;
    projectState.selectedProblem = problemId;
    
    // 다음 단계 버튼 활성화
    const nextBtn = document.getElementById('btn-next-step');
    nextBtn.classList.remove('disabled');
}

// 2단계에서 다음 단계(3단계 설문)로 이동 처리
function goToNextStep() {
    if (!state.selectedProblem) return;
    navigate('questionnaire');
}

// ==========================================
// MVP 3단계: 집 정보 및 현장 상황 입력 로직
// ==========================================

// 칩(옵션) 클릭 이벤트 처리
function toggleChip(category, value, isMulti, element) {
    if (isMulti) {
        // 다중 선택 로직
        const index = projectState[category].indexOf(value);
        if (index > -1) {
            // 이미 선택되어 있으면 제거
            projectState[category].splice(index, 1);
            element.classList.remove('selected');
        } else {
            // 선택 추가
            projectState[category].push(value);
            element.classList.add('selected');
        }
    } else {
        // 단일 선택 로직
        // 1. 같은 그룹(category) 내 다른 칩들 선택 해제
        const group = document.getElementById(`q-${category}`);
        if (group) {
            const chips = group.querySelectorAll('.chip');
            chips.forEach(c => c.classList.remove('selected'));
        }
        
        // 2. 현재 칩 선택 활성화
        element.classList.add('selected');
        
        // 3. 상태 업데이트 (housing, building, experience 등)
        if (category === 'housing') projectState.housingType = value;
        else if (category === 'building') projectState.buildingState = value;
        else if (category === 'experience') projectState.experience = value;
    }
    
    checkQuestionnaireReady();
}

// 필수 질문 답변 완료 시 '다음 단계' 버튼 활성화
function checkQuestionnaireReady() {
    const btn = document.getElementById('btn-to-budget');
    if (!btn) return;
    
    // 필수 조건 체크 (주거 형태, 건물 상태, 공간, 증상 정도는 알아야 함)
    const isReady = (
        projectState.housingType !== '' &&
        projectState.buildingState !== '' &&
        projectState.spaces.length > 0 &&
        projectState.symptoms.length > 0
    );
    
    if (isReady) {
        btn.classList.remove('disabled');
    } else {
        btn.classList.add('disabled');
    }
}

// 3단계에서 4단계(예산 설정)로 이동 처리
function goToBudgetStep() {
    const btn = document.getElementById('btn-to-budget');
    if (btn && btn.classList.contains('disabled')) return;
    navigate('budget');
}

// ==========================================
// MVP 4단계: 예산 및 시공 방향 입력 로직
// ==========================================

// 예산 화면용 칩 토글 이벤트 처리
function toggleBudgetChip(category, value, isMulti, element) {
    // 3개 인자만 넘어온 경우 (isMulti 자리에 element 객체가 들어옴) 대응하는 방어 코드
    if (element === undefined && isMulti && typeof isMulti === 'object') {
        element = isMulti;
        isMulti = false;
    }

    if (isMulti) {
        // 다중 선택 로직
        const index = projectState[category].indexOf(value);
        if (index > -1) {
            projectState[category].splice(index, 1);
            if (element) element.classList.remove('selected');
        } else {
            projectState[category].push(value);
            if (element) element.classList.add('selected');
        }
    } else {
        // 단일 선택 로직
        const group = document.getElementById(`q-${category}`);
        if (group) {
            const chips = group.querySelectorAll('.chip');
            chips.forEach(c => c.classList.remove('selected'));
        }
        
        if (element) {
            element.classList.add('selected');
        }
        projectState[category] = value;
    }
    
    checkBudgetReady();
}

// 예산 필수 값 선택 완료 시 분석 시작 버튼 활성화
function checkBudgetReady() {
    const btn = document.getElementById('btn-analyze');
    if (!btn) return;
    
    // 필수 조건: 예산범위, 시공방향, 셀프의향 모두 하나 이상 선택
    const isReady = (
        projectState.budget !== '' &&
        projectState.priority.length > 0 &&
        projectState.selfLevel !== ''
    );
    
    if (isReady) {
        btn.classList.remove('disabled');
    } else {
        btn.classList.add('disabled');
    }
}

// 최종 AI 분석 시작 함수 (MVP 5단계로 라우팅)
function startAnalysis() {
    const btn = document.getElementById('btn-analyze');
    if (btn && btn.classList.contains('disabled')) return;
    
    // 무료 회원 AI 분석 횟수 제한 체크 (2회)
    if (currentUser && currentUser.plan === 'Free') {
        const usage = currentUser.analysisCount || 0;
        if (usage >= 2) {
            openUpgradeModal(
                "이번 달 분석 횟수를 모두 사용했어요", 
                "이번 달 분석 횟수를 모두 사용했어요. 베이직으로 업그레이드하면 무제한으로 사용할 수 있어요."
            );
            return;
        } else {
            // 횟수 차감 및 세션 저장
            currentUser.analysisCount = usage + 1;
            if (currentUser.loggedIn) {
                localStorage.setItem('selin_user', JSON.stringify(currentUser));
            } else {
                localStorage.setItem('selin_free_analysis_count', currentUser.analysisCount.toString());
            }
        }
    }
    
    const modal = document.getElementById('notebooklm-loading-modal');
    const logsEl = document.getElementById('ai-loading-logs');
    
    if (modal && logsEl) {
        modal.style.display = 'flex';
        logsEl.innerHTML = '<div style="color:#667eea;"><i class="fa-solid fa-chevron-right"></i> AI 진단 모델 초기화 중...</div>';
        
        const logs = [
            { time: 600, text: '<div style="color:#3182ce;"><i class="fa-solid fa-cloud-arrow-down"></i> NotebookLM 클라우드 인증 활성화...</div>' },
            { time: 1300, text: '<div style="color:#a0aec0;"><i class="fa-solid fa-book"></i> &nbsp;[셀인 노트북] 교차 지식 분석 중... (54개 문서)</div>' },
            { time: 2000, text: '<div style="color:#38a169;"><i class="fa-solid fa-circle-check"></i> &nbsp;[셀인 노트북] 연동 완료</div>' },
            { time: 2600, text: '<div style="color:#a0aec0;"><i class="fa-solid fa-fire-flame-simple"></i> &nbsp;[단열 노트북] 외벽/결로 지식 추출 중... (23개 리포트)</div>' },
            { time: 3300, text: '<div style="color:#38a169;"><i class="fa-solid fa-circle-check"></i> &nbsp;[단열 노트북] 연동 완료</div>' },
            { time: 3900, text: '<div style="color:#a0aec0;"><i class="fa-solid fa-trowel-bricks"></i> &nbsp;[건축 노트북] 우수/방수 가이드 매칭 중... (15개 매뉴얼)</div>' },
            { time: 4600, text: '<div style="color:#38a169;"><i class="fa-solid fa-circle-check"></i> &nbsp;[건축 노트북] 연동 완료</div>' },
            { time: 5200, text: '<div style="color:#ecc94b; font-weight:bold;"><i class="fa-solid fa-brain"></i> 사용자 입력 정보 기반 최종 추천 도출 중...</div>' },
        ];
        
        logs.forEach(log => {
            setTimeout(() => {
                logsEl.innerHTML += `<div>${log.text}</div>`;
                logsEl.scrollTop = logsEl.scrollHeight;
            }, log.time);
        });
        
        setTimeout(() => {
            modal.style.display = 'none';
            generateAnalysisReport();
            navigate('analysis');
        }, 6000);
    } else {
        generateAnalysisReport();
        navigate('analysis');
    }
}

// ==========================================
// MVP 5단계: 분석 결과 리포트 (Rule-based)
// ==========================================

function generateAnalysisReport() {
    // 1. 요약 카드 채우기
    const problemMap = {
        'mold': '곰팡이 해결', 'condensation': '결로 해결', 'insulation': '단열 개선',
        'bathroom': '욕실 보수', 'floor': '장판/바닥 교체', 'wall': '벽체/도배/페인트',
        'full': '전체 리모델링', 'unknown': '진단 필요'
    };
    
    const resProblem = document.getElementById('res-problem');
    if (resProblem) resProblem.innerText = problemMap[state.selectedProblem] || '진단 필요';
    const resSpace = document.getElementById('res-space');
    if (resSpace) resSpace.innerText = projectState.spaces.length > 0 ? projectState.spaces.join(', ') : '-';
    const resBudget = document.getElementById('res-budget');
    if (resBudget) resBudget.innerText = projectState.budget || '-';
    const resSelf = document.getElementById('res-self');
    if (resSelf) resSelf.innerText = projectState.selfLevel || '-';

    // 2. 위험도 분석 로직 (Rule-based)
    let riskCondensation = '낮음';
    let riskLeak = '낮음';
    let riskRecurrence = '낮음';
    let riskDifficulty = '보통';

    const hasWater = projectState.symptoms.includes('물기/결로');
    const hasMold = projectState.symptoms.includes('곰팡이');
    const hasLeak = projectState.symptoms.includes('누수 의심');
    const isOuterWall = projectState.conditions.includes('외벽');
    const isCeiling = projectState.conditions.includes('천장');
    const isBathroom = projectState.spaces.includes('욕실');

    // 결로 위험도
    if (hasWater || state.selectedProblem === 'condensation' || state.selectedProblem === 'insulation') {
        riskCondensation = '높음';
    } else if (isOuterWall) {
        riskCondensation = '중간';
    }

    // 누수 의심도
    if (hasLeak || (isCeiling && hasWater)) {
        riskLeak = '높음';
    } else if (isBathroom) {
        riskLeak = '중간';
    }

    // 재발 위험도
    if ((hasMold && isOuterWall) || hasLeak || state.selectedProblem === 'mold') {
        riskRecurrence = '높음';
    } else if (hasWater) {
        riskRecurrence = '중간';
    }

    // 셀프 난이도
    if (state.selectedProblem === 'full' || state.selectedProblem === 'insulation' || projectState.experience === '처음') {
        riskDifficulty = '어려움';
    } else if (state.selectedProblem === 'wall' || projectState.experience === '경험 많음') {
        riskDifficulty = '쉬움';
    }

    // 뱃지 색상 렌더링 함수
    const renderBadge = (id, value) => {
        const el = document.getElementById(id);
        if (!el) return;
        el.innerText = value;
        el.className = 'badge'; // reset
        if (value === '낮음' || value === '쉬움') el.classList.add('risk-low');
        else if (value === '중간' || value === '보통') el.classList.add('risk-medium');
        else if (value === '높음' || value === '어려움') el.classList.add('risk-high');
    };

    renderBadge('risk-condensation', riskCondensation);
    renderBadge('risk-leak', riskLeak);
    renderBadge('risk-recurrence', riskRecurrence);
    renderBadge('risk-difficulty', riskDifficulty);

    // 3. 경고 메시지 로직
    const warnings = [];
    if (isOuterWall && hasMold && hasWater) {
        warnings.push("단순 곰팡이 제거만으로는 재발 가능성이 매우 높습니다.");
    }
    if (isCeiling && (hasWater || hasLeak)) {
        warnings.push("윗집 누수 가능성이 있으므로 셀프 시공 전 반드시 전문가 누수 탐지가 필요합니다.");
    }
    if (isBathroom && state.selectedProblem === 'bathroom') {
        warnings.push("기존 실리콘의 완벽한 제거와 시공 전 24시간 이상의 완전한 건조가 무엇보다 중요합니다.");
    }
    if (projectState.buildingState.includes('구축') && isOuterWall) {
        warnings.push("구축 건물의 특성상 단열재 노후 또는 벽면 열교 현상일 가능성이 큽니다.");
    }
    
    // 경고 노출 처리
    const warningContainer = document.getElementById('warning-container');
    const warningList = document.getElementById('warning-list');
    if (warningList && warningContainer) {
        warningList.innerHTML = '';
        if (warnings.length > 0) {
            warnings.forEach(w => {
                const li = document.createElement('li');
                li.innerText = w;
                warningList.appendChild(li);
            });
            warningContainer.style.display = 'block';
        } else {
            warningContainer.style.display = 'none';
        }
    }

    // 4. 추천 해결 방향 렌더링
    const recoBox = document.getElementById('recommendation-text');
    let recoHtml = '';
    
    const problemKey = state.selectedProblem || 'mold';
    
    if (problemKey === 'mold' || problemKey === 'condensation' || problemKey === 'insulation') {
        recoHtml += `
            <div style="margin-bottom: 16px; border-left: 3px solid #2b6cb0; padding-left: 10px; border-radius: 2px;">
                <strong style="color:#2b6cb0; font-size:0.85rem; display:block; margin-bottom:4px;"><i class="fa-solid fa-book"></i> [셀인 노트북 지식 가이드]</strong>
                <p style="margin:0; font-size:0.85rem; line-height:1.55; color:var(--text-main);">
                    곰팡이 제거제 도포 후 벽면 내부에 잔존하는 습기는 수일 내에 도배지 안쪽에서 곰팡이를 즉시 재발시킵니다. 약품 처리 후 <strong>선풍기나 보일러를 가동하여 최소 24~48시간 동안 속벽까지 완전히 건조</strong>시키는 전처리 공정이 절대적인 필수 조치로 확인됩니다.
                </p>
            </div>
            <div style="margin-bottom: 16px; border-left: 3px solid #2f855a; padding-left: 10px; border-radius: 2px;">
                <strong style="color:#2f855a; font-size:0.85rem; display:block; margin-bottom:4px;"><i class="fa-solid fa-fire-flame-simple"></i> [단열 노트북 전문 가이드]</strong>
                <p style="margin:0; font-size:0.85rem; line-height:1.55; color:var(--text-main);">
                    외벽면에 폼블럭이나 얇은 단열벽지를 기밀하지 않게 부착하면, 단열재 뒷면의 미세 공기층(열교) 온도 저하로 결로수가 고여 벽체 자체가 내부로부터 썩게 됩니다. <strong>13mm 이상의 정석 압출 단열재(이보드 등)를 폼본드로 기밀하게 밀착 시공</strong>하는 것만이 단열 하자 차단의 유일한 해법입니다.
                </p>
            </div>
            <div style="margin-bottom: 4px; border-left: 3px solid #dd6b20; padding-left: 10px; border-radius: 2px;">
                <strong style="color:#dd6b20; font-size:0.85rem; display:block; margin-bottom:4px;"><i class="fa-solid fa-trowel-bricks"></i> [건축 노트북 공학 가이드]</strong>
                <p style="margin:0; font-size:0.85rem; line-height:1.55; color:var(--text-main);">
                    구축 건물의 천장 결로나 물기는 단순 실내 환기 부족이 아니라 상부층 외벽 균열 또는 배관 미세 누수일 가능성이 큽니다. 시공 전 <strong>반드시 전문가 누수 탐지를 진행</strong>하여 누수 원인을 원천 봉쇄한 뒤 단열 보수를 시작할 것을 권장합니다.
                </p>
            </div>
        `;
    } else if (problemKey === 'bathroom') {
        recoHtml += `
            <div style="margin-bottom: 16px; border-left: 3px solid #2b6cb0; padding-left: 10px; border-radius: 2px;">
                <strong style="color:#2b6cb0; font-size:0.85rem; display:block; margin-bottom:4px;"><i class="fa-solid fa-book"></i> [셀인 노트북 지식 가이드]</strong>
                <p style="margin:0; font-size:0.85rem; line-height:1.55; color:var(--text-main);">
                    기존 오염된 실리콘의 물때와 기름기 위에 실리콘을 그대로 덧방하면 접착이 되지 않고 며칠 만에 탈락합니다. 전용 커터나 칼로 <strong>기존 실리콘을 단 1mm도 남김없이 완벽하게 긁어내는 바탕면 작업</strong>이 가장 중요합니다.
                </p>
            </div>
            <div style="margin-bottom: 16px; border-left: 3px solid #2f855a; padding-left: 10px; border-radius: 2px;">
                <strong style="color:#2f855a; font-size:0.85rem; display:block; margin-bottom:4px;"><i class="fa-solid fa-fire-flame-simple"></i> [단열 노트북 전문 가이드]</strong>
                <p style="margin:0; font-size:0.85rem; line-height:1.55; color:var(--text-main);">
                    욕실 모서리는 냉기가 침투해 실내 습기와 만나는 가장 취약한 결로 구역입니다. 실리콘 시공 전 <strong>헤어드라이어 등을 이용하여 물기를 한 방울도 없이 뽀송하게 건조</strong>한 후 곰팡이 방지용 바이오 실리콘을 충진해야 합니다.
                </p>
            </div>
            <div style="margin-bottom: 4px; border-left: 3px solid #dd6b20; padding-left: 10px; border-radius: 2px;">
                <strong style="color:#dd6b20; font-size:0.85rem; display:block; margin-bottom:4px;"><i class="fa-solid fa-trowel-bricks"></i> [건축 노트북 공학 가이드]</strong>
                <p style="margin:0; font-size:0.85rem; line-height:1.55; color:var(--text-main);">
                    욕실 벽면 타일 사이 줄눈의 이탈 및 크랙은 내부 방수층 균열로 번지는 1차 하자의 징후입니다. 장기 하자를 막기 위해 <strong>침투성 방수제를 줄눈 사이에 도포하여 침투 방수막을 먼저 형성</strong>해 주어야 합니다.
                </p>
            </div>
        `;
    } else {
        recoHtml += `
            <div style="margin-bottom: 16px; border-left: 3px solid #2b6cb0; padding-left: 10px; border-radius: 2px;">
                <strong style="color:#2b6cb0; font-size:0.85rem; display:block; margin-bottom:4px;"><i class="fa-solid fa-book"></i> [셀인 노트북 지식 가이드]</strong>
                <p style="margin:0; font-size:0.85rem; line-height:1.55; color:var(--text-main);">
                    장판이나 데코타일 등 바닥재 시공 시 미세한 바탕면 요철은 시공 후 들뜸이나 밟았을 때 찢어짐을 유발합니다. 미장면의 미세한 돌기나 슬러지는 <strong>그라인딩하거나 헤라로 깨끗이 긁어내고 완전한 평탄화</strong>를 마쳐야 합니다.
                </p>
            </div>
            <div style="margin-bottom: 4px; border-left: 3px solid #dd6b20; padding-left: 10px; border-radius: 2px;">
                <strong style="color:#dd6b20; font-size:0.85rem; display:block; margin-bottom:4px;"><i class="fa-solid fa-trowel-bricks"></i> [건축 노트북 공학 가이드]</strong>
                <p style="margin:0; font-size:0.85rem; line-height:1.55; color:var(--text-main);">
                    바닥 철거 후 습기나 젖음이 발견된다면 난방배관 누수 또는 콘크리트 슬라브의 모세관 상승 습기입니다. 습기를 무시하고 바닥재로 덮으면 시간이 지나 썩게 되므로 <strong>최소 1~2주일 이상 난방을 켜고 바닥을 노출하여 바짝 건조</strong>해야 합니다.
                </p>
            </div>
        `;
    }
    
    if (recoBox) {
        recoBox.innerHTML = recoHtml;
    }
    
    // MVP 15단계: 수익화 CTA 동적 노출
    const ctaContainer = document.getElementById('analysis-monetize-cta');
    if (ctaContainer) {
    
    // 💡 신규: 난이도: 어려움 + 실패위험: 높음(재발 혹은 누수)일 때 전문가 매칭 배너 최우선 출력
    const isHighFailureRisk = (riskRecurrence === '높음' || riskLeak === '높음');
    
    if (riskDifficulty === '어려움' && isHighFailureRisk) {
        ctaContainer.innerHTML = `
            <div class="q-card" style="background: linear-gradient(135deg, #fffaf0 0%, #fff5f5 100%); border:2px dashed #C53030; text-align:center; box-shadow:0 8px 20px rgba(197, 48, 48, 0.08);">
                <div style="display:flex; justify-content:center; align-items:center; gap:8px; margin-bottom:10px;">
                    <span style="background:#C53030; color:white; font-size:0.65rem; font-weight:900; padding:2px 6px; border-radius:4px;"><i class="fa-solid fa-triangle-exclamation"></i> 셀프 시공 경고</span>
                    <h4 style="color:#C53030; margin:0; font-weight:800;">이 현장은 셀프 시공 비권장 대상입니다</h4>
                </div>
                <p style="font-size:0.82rem; color:#742A2A; margin-bottom:16px; line-height:1.5;">
                    현재 진단 결과 <b>시공 난이도(어려움)</b> 및 <b>재발/실패 위험성(높음)</b>이 결합된 고위험 현장입니다. 잘못 시공 시 아래층 누수 등 2차 대형 하자로 이어질 수 있으니, 셀인케어가 검증한 안심 파트너에게 <b>무료 견적 요청</b>을 먼저 신청해 보세요.
                </p>
                <button class="btn btn-primary" style="width:100%; background:#C53030; border:none; font-weight:900;" onclick="navigate('match-form')">
                    <i class="fa-solid fa-handshake"></i> 안심 전문가 견적 매칭 신청하기 →
                </button>
            </div>
        `;
    } else if(warnings.length > 0 || riskDifficulty === '어려움') {
        ctaContainer.innerHTML = `
            <div class="q-card" style="background:#FFF5F5; border:1px solid #FEB2B2; text-align:center;">
                <h4 style="color:#C53030; margin-bottom:8px;"><i class="fa-solid fa-triangle-exclamation"></i> 잠깐! 혼자 시공하기 위험한 현장입니다</h4>
                <p style="font-size:0.85rem; color:#742A2A; margin-bottom:16px;">첫 단추를 잘못 끼우면 수백만 원의 재시공 비용이 발생합니다. 시공 전 반드시 전문가의 진단을 받아보세요.</p>
                <button class="btn btn-primary" style="width:100%; background:#E53E3E;" onclick="navigate('coaching')">
                    <i class="fa-solid fa-user-tie"></i> 1:1 전문가 시공 상담받기
                </button>
            </div>
        `;
    } else {
        ctaContainer.innerHTML = `
            <div class="q-card" style="background:#EBF8FF; border:1px solid #BEE3F8; text-align:center;">
                <h4 style="color:#2B6CB0; margin-bottom:8px;"><i class="fa-solid fa-thumbs-up"></i> 셀프 시공에 도전하기 좋은 현장입니다</h4>
                <p style="font-size:0.85rem; color:#2C5282; margin-bottom:16px;">자재만 잘 선택하면 훌륭하게 완성할 수 있습니다. 어떤 자재를 살지 막막하다면?</p>
                <button class="btn btn-secondary" style="width:100%; color:#2B6CB0;" onclick="navigate('coaching')">
                    <i class="fa-solid fa-camera"></i> 내 현장 사진 검토받기 (9,900원)
                </button>
            </div>
        `;
    }
    }
}

// ==========================================
// MVP 6단계: 추천 공정 시퀀스 (타임라인)
// ==========================================

function goToProcessStep() {
    renderProcessTimeline();
    navigate('process');
}

// 타임라인 데이터 정의 (임시 하드코딩된 Rule-based 데이터)
const processDataMap = {
    mold: [
        { title: "기존 마감재 제거", desc: "오염된 벽지나 페인트를 곰팡이가 핀 곳보다 30cm 넓게 완전히 벗겨냅니다.", time: "1~2시간", tools: "스크래퍼, 커터칼, 분무기, 방진 마스크", warning: "곰팡이 포자가 날릴 수 있으니 반드시 마스크와 장갑을 착용하세요." },
        { title: "곰팡이 오염 상태 확인", desc: "벽면 내부나 모서리의 크랙, 물기 스밈 여부를 점검합니다.", time: "30분", tools: "후래쉬, 습도계(선택)" },
        { title: "곰팡이 전문 제거제 도포", desc: "단순 락스가 아닌 침투성 곰팡이 제거제를 벽면에 흠뻑 뿌려줍니다.", time: "1시간", tools: "곰팡이 제거제, 붓/롤러, 보안경", warning: "환기가 필수이며, 다른 화학제품과 절대 섞어 쓰지 마세요." },
        { title: "충분한 건조 (가장 중요!)", desc: "제거제가 마르고 벽면이 완전히 건조될 때까지 기다립니다. 필요시 선풍기나 제습기를 가동합니다.", time: "최소 24시간~48시간", tools: "선풍기, 제습기" },
        { title: "단열/항균 보강 시공", desc: "항균 코팅제(세라믹 탄성코트 등)를 바르거나 이보드(압출법 단열재)를 부착하여 열교를 차단합니다.", time: "3~4시간", tools: "항균 도료, 롤러, 폼본드, 이보드" },
        { title: "이음부 및 기밀 처리", desc: "단열재 사이의 틈이나 모서리를 우레탄 폼과 실리콘으로 빈틈없이 메워줍니다.", time: "1시간", tools: "우레탄 폼, 바이오 실리콘, 실리콘 건" },
        { title: "최종 마감 (도배/페인트)", desc: "보강된 벽면 위에 원하는 마감재를 시공합니다.", time: "2~4시간", tools: "도배지/페인트, 마감 도구" },
        { title: "환기 및 사후 관리", desc: "시공 후 며칠간 충분히 환기시키며, 이후에도 하루 2번 15분 이상 환기를 유지합니다.", time: "지속", tools: "온습도계" }
    ],
    bathroom: [
        { title: "기존 실리콘/줄눈 완벽 제거", desc: "들뜨고 곰팡이 핀 기존 실리콘을 V자 형태로 완전히 파냅니다.", time: "1~2시간", tools: "실리콘 제거기, 커터칼", warning: "덧방(기존 것 위에 바르기)은 절대 금물입니다." },
        { title: "오염 부위 락스 청소", desc: "실리콘이 있던 자리를 깨끗이 닦아내고 소독합니다.", time: "30분", tools: "청소용 솔, 락스" },
        { title: "완전 건조", desc: "물기가 단 한 방울도 남아있지 않도록 마른 수건으로 닦고 말립니다.", time: "최소 12시간", tools: "마른 수건, 드라이기(보조)" },
        { title: "마스킹 테이프 작업", desc: "실리콘이 예쁘게 발리도록 시공 부위 양옆으로 테이프를 붙입니다.", time: "30분", tools: "마스킹 테이프" },
        { title: "욕실용 바이오 실리콘 시공", desc: "항균 기능이 있는 욕실 전용 실리콘을 일정한 힘으로 쏘며 헤라로 긁어냅니다.", time: "1시간", tools: "바이오 실리콘, 실리콘 건, 고무 헤라" },
        { title: "테이프 제거 및 양생", desc: "실리콘이 굳기 전에 마스킹 테이프를 떼어내고 건조시킵니다.", time: "24시간", tools: "", warning: "양생 기간 동안 절대 물이 닿지 않게 하세요." },
        { title: "누수 여부 확인", desc: "양생 완료 후 물을 뿌려 들뜨거나 새는 곳이 없는지 확인합니다.", time: "10분", tools: "샤워기" }
    ],
    floor: [
        { title: "기존 바닥 상태 및 단차 확인", desc: "장판을 걷어내고 바닥에 습기가 없는지, 울퉁불퉁한 곳이 없는지 확인합니다.", time: "1시간", tools: "스크래퍼" },
        { title: "시공 면적 측정 및 자재 로스율 계산", desc: "방의 가로 세로를 측정하고 여유분(10% 내외)을 포함해 자재를 준비합니다.", time: "30분", tools: "줄자, 메모장" },
        { title: "바닥 정리 및 건조", desc: "바닥의 이물질을 쓸어내고 축축하다면 충분히 말립니다.", time: "1시간 ~ 며칠", tools: "빗자루/청소기", warning: "바닥이 젖은 상태로 덮으면 무조건 곰팡이가 생깁니다." },
        { title: "바닥재 가재단", desc: "방향을 맞춰 바닥재를 펼치고 벽면 위로 5cm 정도 여유를 두고 자릅니다.", time: "1시간", tools: "큰 커터칼, 자" },
        { title: "본드 시공 및 안착", desc: "필요에 따라 바닥용 본드를 도포하고 기포가 생기지 않게 밀어가며 붙입니다.", time: "2시간", tools: "바닥 본드, 롤러/헤라" },
        { title: "모서리 굽도리(걸레받이) 마감", desc: "벽과 바닥이 만나는 모서리를 굽도리 테이프나 실리콘으로 마감합니다.", time: "1~2시간", tools: "굽도리, 바이오 실리콘" },
        { title: "마감 상태 확인 및 환기", desc: "본드 냄새가 빠지도록 환기하고 들뜬 곳이 없는지 밟아봅니다.", time: "1시간", tools: "" }
    ]
};

function renderProcessTimeline() {
    const container = document.getElementById('process-timeline-container');
    container.innerHTML = ''; // 초기화

    // 현재 문제에 맞는 데이터 선택 (기본값은 mold)
    const targetKey = ['mold', 'condensation', 'insulation'].includes(state.selectedProblem) ? 'mold' :
                      (state.selectedProblem === 'bathroom' ? 'bathroom' : 
                      (state.selectedProblem === 'floor' ? 'floor' : 'mold')); // 임시 기본값 매핑
                      
    const processSteps = processDataMap[targetKey];

    processSteps.forEach((step, index) => {
        const itemHtml = `
            <div class="timeline-item" id="step-item-${index}">
                <div class="timeline-marker">
                    <div class="step-num">${index + 1}</div>
                    <div class="timeline-line"></div>
                </div>
                <div class="timeline-content">
                    <div class="content-header">
                        <h3>${step.title}</h3>
                        <label class="custom-checkbox">
                            <input type="checkbox" onchange="toggleStepCheck(this, 'step-item-${index}')">
                            <span class="checkmark"></span>
                        </label>
                    </div>
                    <p class="desc">${step.desc}</p>
                    <div class="info-row">
                        <span class="badge time-badge"><i class="fa-regular fa-clock"></i> ${step.time}</span>
                    </div>
                    ${step.warning ? `
                        <div class="alert-box warning-box">
                            <i class="fa-solid fa-circle-exclamation"></i> 주의: ${step.warning}
                        </div>
                    ` : ''}
                    ${step.tools ? `
                        <div class="tools-box">
                            <strong>필요 자재:</strong> ${step.tools}
                        </div>
                    ` : ''}
                </div>
            </div>
        `;
        container.insertAdjacentHTML('beforeend', itemHtml);
    });
}

// 체크박스 클릭 시 스타일 토글 함수
function toggleStepCheck(checkboxEle, itemId) {
    const itemEle = document.getElementById(itemId);
    if (checkboxEle.checked) {
        itemEle.classList.add('completed');
    } else {
        itemEle.classList.remove('completed');
    }
}

// ==========================================
// 시공 부위 선택 상태 보관 ('wall' | 'floor' | 'both')
let calculatorAreaMode = 'wall';

function switchCalculatorAreaMode(mode) {
    calculatorAreaMode = mode;
    
    // 모든 탭 버튼 비활성화 스타일 처리
    const btnWall = document.getElementById('tab-btn-wall');
    const btnFloor = document.getElementById('tab-btn-floor');
    const btnBoth = document.getElementById('tab-btn-both');
    
    [btnWall, btnFloor, btnBoth].forEach(btn => {
        if (btn) {
            btn.style.background = 'transparent';
            btn.style.color = 'var(--text-sub)';
            btn.style.boxShadow = 'none';
            btn.classList.remove('active');
        }
    });
    
    // 선택된 탭 활성화 스타일 적용
    const activeBtn = document.getElementById(`tab-btn-${mode}`);
    if (activeBtn) {
        activeBtn.style.background = 'white';
        activeBtn.style.color = 'var(--primary)';
        activeBtn.style.boxShadow = '0 2px 4px rgba(0,0,0,0.05)';
        activeBtn.classList.add('active');
    }
    
    // 입력 영역 컨테이너 토글
    const wallSec = document.getElementById('calc-wall-section');
    const floorSec = document.getElementById('calc-floor-section');
    
    if (mode === 'wall') {
        if (wallSec) wallSec.style.display = 'block';
        if (floorSec) floorSec.style.display = 'none';
    } else if (mode === 'floor') {
        if (wallSec) wallSec.style.display = 'none';
        if (floorSec) floorSec.style.display = 'block';
    } else if (mode === 'both') {
        if (wallSec) wallSec.style.display = 'block';
        if (floorSec) floorSec.style.display = 'block';
    }
}

// 전역 선택된 계산기 자재 목록 보관
let selectedCalculatorMaterials = [];

function toggleCalculatorMaterialChip(materialType, element) {
    const index = selectedCalculatorMaterials.indexOf(materialType);
    if (index > -1) {
        selectedCalculatorMaterials.splice(index, 1);
        element.classList.remove('selected');
    } else {
        selectedCalculatorMaterials.push(materialType);
        element.classList.add('selected');
    }
    
    // custom(기타 직접입력) 칩이 켜지거나 꺼질 때 입력 폼 노출 처리
    const customForm = document.getElementById('custom-material-form');
    if (customForm) {
        if (selectedCalculatorMaterials.includes('custom')) {
            customForm.style.display = 'block';
        } else {
            customForm.style.display = 'none';
        }
    }
}

function goToCalculatorStep() {
    navigate('calculator');
    // 현재 모드에 맞추어 화면 컨테이너 및 탭 다시 맞춤 동기화
    setTimeout(() => {
        switchCalculatorAreaMode(calculatorAreaMode);
    }, 50);
}

// 벽면 입력 폼 추가 함수
function addWallInput() {
    const container = document.getElementById('wall-inputs');
    const rowHtml = `
        <div class="dimension-row" style="margin-top:8px;">
            <input type="number" placeholder="가로(m)" class="input-field wall-w">
            <span style="color:var(--text-sub); font-weight:bold;">×</span>
            <input type="number" placeholder="세로(m)" class="input-field wall-h">
        </div>
    `;
    container.insertAdjacentHTML('beforeend', rowHtml);
}

// 자재 수량 계산 로직 (다중 계산 및 선택적 면적 검증)
function calculateMaterials() {
    if (selectedCalculatorMaterials.length === 0) {
        alert("계산할 자재를 최소 하나 이상 선택해 주세요.");
        return;
    }

    // 1. 벽면 면적 합산
    let wallArea = 0;
    const wallWs = document.querySelectorAll('.wall-w');
    const wallHs = document.querySelectorAll('.wall-h');
    for (let i = 0; i < wallWs.length; i++) {
        const w = parseFloat(wallWs[i].value) || 0;
        const h = parseFloat(wallHs[i].value) || 0;
        wallArea += (w * h);
    }

    // 2. 바닥 면적 계산
    const floorW = parseFloat(document.getElementById('floor-w').value) || 0;
    const floorH = parseFloat(document.getElementById('floor-h').value) || 0;
    const floorArea = floorW * floorH;

    // 시공 부위 선택 모드별 입력 값 정밀 검증
    if (calculatorAreaMode === 'wall' && wallArea === 0) {
        alert("시공할 벽면 면적(가로 × 세로)을 정확히 입력해 주세요.");
        return;
    }
    if (calculatorAreaMode === 'floor' && floorArea === 0) {
        alert("시공할 바닥 면적(가로 × 세로)을 정확히 입력해 주세요.");
        return;
    }
    if (calculatorAreaMode === 'both' && wallArea === 0 && floorArea === 0) {
        alert("벽면 면적이나 바닥 면적 중 최소 하나 이상의 시공 면적을 정확히 입력해 주세요.");
        return;
    }

    // 3. 로스율(손실률) 설정: 시공 경험 기반
    let lossRate = 0.10; // 기본 10%
    if (projectState.experience === '처음') lossRate = 0.15; // 초보 15%
    else if (projectState.experience.includes('경험 많음') || projectState.experience.includes('어느 정도 가능')) lossRate = 0.07; // 숙련자 7%

    // 기존 계산 내역 클리어
    projectState.materials = {};
    const resultsList = document.getElementById('calc-results-list');
    resultsList.innerHTML = '';

    // 4. 자재 정의 데이터 및 각 수량 연산 순회
    selectedCalculatorMaterials.forEach(materialType => {
        let isFloorMaterial = ['floor', 'decotile'].includes(materialType);
        let netArea = isFloorMaterial ? floorArea : wallArea;
        
        let qty = 0;
        let unit = '';
        let whyDesc = '';
        let customName = '';
        let isCalculatable = true;
        let alertMessage = '';

        // 해당 자재 계산을 위한 면적이 0인 경우 방어 처리
        if (netArea === 0) {
            isCalculatable = false;
            alertMessage = isFloorMaterial 
                ? "바닥 면적 정보가 입력되지 않아 계산할 수 없습니다. 상단에서 바닥 가로/세로를 입력해 주세요."
                : "벽면 면적 정보가 입력되지 않아 계산할 수 없습니다. 상단에서 벽면 가로/세로를 입력해 주세요.";
        }

        const grossArea = netArea * (1 + lossRate);

        if (isCalculatable) {
            switch(materialType) {
                case 'insulation':
                    // 이보드 900x2400 (1장 = 2.16헤베)
                    qty = Math.ceil(grossArea / 2.16);
                    unit = '장';
                    whyDesc = `이보드 단열 원판 1장(900×2400mm)은 2.16㎡를 커버합니다. 순수 면적(${netArea.toFixed(2)}㎡)에 사용자의 셀프 레벨별 손실률(${Math.round(lossRate*100)}%)을 합산한 정밀 수량입니다.`;
                    break;
                case 'gypsum':
                    // 석고보드 900x1800 (1장 = 1.62헤베)
                    qty = Math.ceil(grossArea / 1.62);
                    unit = '장';
                    whyDesc = `표준 석고보드 1장(900×1800mm)은 약 1.62㎡를 덮습니다. 파손 우려 및 재단 중 소실되는 면적을 완벽 감안하여 올림 산출했습니다.`;
                    break;
                case 'wallpaper':
                    qty = Math.ceil(grossArea / 16.5);
                    unit = '롤';
                    whyDesc = `실크 도배벽지 1롤(106cm×15.6m)은 약 5평(16.5㎡) 면적을 덮을 수 있습니다. 무늬 매칭 여유까지 안전하게 포함되었습니다.`;
                    break;
                case 'paint':
                    qty = Math.ceil(grossArea / 7);
                    unit = '리터 (L)';
                    whyDesc = `일반 수성페인트는 1리터로 2회 도장 기준 약 6~8㎡를 도포합니다. 도구에 남거나 날아가는 여유분을 합산했습니다.`;
                    break;
                case 'mold_paint':
                    qty = Math.ceil(grossArea / 6);
                    unit = '리터 (L)';
                    whyDesc = `친환경 항균 곰팡이 방지 페인트는 1리터당 약 6㎡(2회 도장 기준)의 커버율을 보입니다. 하자 재발 방지를 위해 표준 두께로 계산된 양입니다.`;
                    break;
                case 'primer':
                    qty = Math.ceil(grossArea / 8);
                    unit = '리터 (L)';
                    whyDesc = `젯소(프라이머)는 도장 전 원래 벽의 색상을 숨기고 페인트 접착력을 2배 이상 높여주는 프라이밍재로, 1리터로 약 8㎡ 시공이 가능합니다.`;
                    break;
                case 'putty':
                    qty = Math.ceil(grossArea / 1);
                    unit = 'kg';
                    whyDesc = `퍼티(핸디코트)는 벽체의 요철, 타카 핀 자국 및 크랙 부위를 기밀 평탄화하는 바탕 퍼티제로, 1㎡당 평균 1kg 정도가 소요됩니다.`;
                    break;
                case 'waterproof':
                    qty = Math.ceil(grossArea / 4);
                    unit = '리터 (L)';
                    whyDesc = `욕실 및 다용도실 크랙과 미세 누수 틈새용 침투성 방수재는 1리터 도포 시 약 4㎡ 공간에 깊게 침투하여 완벽한 방수 피막을 만들어냅니다.`;
                    break;
                case 'foam_bond':
                    qty = Math.ceil(grossArea / 13);
                    unit = '캔 (can)';
                    whyDesc = `이보드 단열재 부착용 우레탄 폼본드는 1캔당 이보드 약 6장(약 13㎡ 면적)을 완벽하게 밀착 부착하며 우레탄 충진용으로도 병용 가능합니다.`;
                    break;
                case 'floor':
                    qty = Math.ceil(grossArea / 1.83);
                    unit = '미터 (m)';
                    whyDesc = `표준 두께 장판의 유통 폭은 1.83m입니다. 바닥 평면의 중심에서 벽 끝까지 밀어 넣고 겹쳐 재단하는 손실률이 종합 고려된 길이입니다.`;
                    break;
                case 'decotile':
                    qty = Math.ceil(grossArea / 3.3);
                    unit = '박스';
                    whyDesc = `데코타일 1박스는 약 1평(3.3㎡)을 커버하도록 규격 포장되어 나옵니다. 꼬리 재단과 모서리 틈새 짜집기용 자투리를 포함한 수량입니다.`;
                    break;
                case 'silicone':
                    qty = Math.ceil(netArea / 5);
                    if(qty === 0) qty = 1;
                    unit = '개';
                    whyDesc = `실리콘은 평균 5㎡ 면적의 테두리 및 틈새 마감에 1통이 사용됩니다. 실리콘 시공이 미숙한 초보자의 실수를 대비한 최소 여유분입니다.`;
                    break;
                case 'remover':
                    qty = Math.ceil(netArea / 5);
                    unit = '리터 (L)';
                    whyDesc = `벽 속으로 깊이 번진 곰팡이 뿌리를 뽑기 위해 약품을 침투 제거할 시, 1리터로 약 5㎡ 벽면 공간을 흥건하게 살균 처리할 수 있습니다.`;
                    break;
                case 'custom':
                    const nameInput = document.getElementById('custom-material-name');
                    const coverageInput = document.getElementById('custom-material-coverage');
                    const unitInput = document.getElementById('custom-material-unit');
                    
                    customName = nameInput ? nameInput.value.trim() : '기타 직접 입력 자재';
                    if (!customName) customName = '기타 직접 입력 자재';

                    const coverage = coverageInput ? parseFloat(coverageInput.value) : 1;
                    const finalCoverage = (isNaN(coverage) || coverage <= 0) ? 1 : coverage;

                    const finalUnit = unitInput ? unitInput.value.trim() : '개';
                    unit = finalUnit ? finalUnit : '개';

                    qty = Math.ceil(grossArea / finalCoverage);
                    whyDesc = `[기타 직접입력] '${customName}'의 1개당 권장 시공 면적(${finalCoverage}㎡)을 기준으로, 전체 면적에 손실률(${Math.round(lossRate*100)}%)을 가산하여 도출한 커스텀 계산 결과입니다.`;
                    break;
            }
        }

        // 결과 저장 처리
        if (isCalculatable) {
            projectState.materials[materialType] = { qty, unit, netArea, grossArea, lossRate, customName };
        }

        // 동적 UI 카드 렌더링
        let cardHtml = '';
        const displayName = materialType === 'custom' ? customName : (basePrices[materialType] ? basePrices[materialType].name : materialType);

        if (isCalculatable) {
            cardHtml = `
                <div class="result-item-card" style="background:#FFF9F5; border:1px solid #FFD8A8; border-radius:12px; padding:16px; box-shadow: 0 2px 6px rgba(0,0,0,0.02);">
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
                        <strong style="color:var(--text-main); font-size:1.05rem;"><i class="fa-solid fa-layer-group" style="color:var(--primary); margin-right:4px;"></i> ${displayName}</strong>
                        <span style="font-size:1.35rem; font-weight:800; color:var(--primary-dark);">${qty} ${unit}</span>
                    </div>
                    <div style="font-size:0.8rem; color:var(--text-sub); margin-bottom:10px; display:flex; gap:10px;">
                        <span>순수 시공면적: <strong>${netArea.toFixed(2)}</strong>㎡</span>
                        <span>로스율 가산면적: <strong>${grossArea.toFixed(2)}</strong>㎡</span>
                    </div>
                    <div style="background:white; padding:12px; border-radius:8px; font-size:0.85rem; color:var(--text-sub); line-height:1.5; border:1px solid #FFE8CC;">
                        <div style="font-weight:700; color:var(--text-main); margin-bottom:4px;"><i class="fa-solid fa-circle-info" style="color:var(--primary);"></i> 산출 근거</div>
                        ${whyDesc}
                    </div>
                </div>
            `;
        } else {
            cardHtml = `
                <div class="result-item-card" style="background:#FFF5F5; border:1px solid #FEB2B2; border-radius:12px; padding:16px;">
                    <div style="display:flex; justify-content:space-between; align-items:center;">
                        <strong style="color:#C53030; font-size:1.05rem;"><i class="fa-solid fa-triangle-exclamation" style="margin-right:4px;"></i> ${displayName}</strong>
                        <span class="badge" style="background:#FEB2B2; color:#C53030; font-weight:bold; font-size:0.75rem;">계산 불가</span>
                    </div>
                    <p style="margin:8px 0 0 0; font-size:0.85rem; color:#9B2C2C; line-height:1.45;">
                        ${alertMessage}
                    </p>
                </div>
            `;
        }

        resultsList.insertAdjacentHTML('beforeend', cardHtml);
    });

    // 전체 요약 수치 갱신
    document.getElementById('res-loss-rate').innerText = (lossRate * 100).toFixed(0) + '%';
    document.getElementById('res-wall-area').innerText = wallArea.toFixed(2);
    document.getElementById('res-floor-area').innerText = floorArea.toFixed(2);

    document.getElementById('calc-result-container').style.display = 'block';
    
    // 결과 확인을 위해 부드러운 스크롤
    document.getElementById('calc-result-container').scrollIntoView({behavior: 'smooth', block: 'nearest'});
}

// ==========================================
// MVP 8단계: 예상 비용 계산기 로직
// ==========================================

// 기준 단가 데이터 (시장가 기반 임시 하드코딩 - 신규 다양한 자재 반영)
const basePrices = {
    insulation: { name: '단열재 (이보드)', price: 25000 },
    gypsum: { name: '석고보드', price: 4000 },
    wallpaper: { name: '실크 도배지', price: 35000 },
    paint: { name: '수성 페인트', price: 15000 },
    mold_paint: { name: '항균 페인트', price: 18000 },
    primer: { name: '젯소/프라이머', price: 14000 },
    putty: { name: '핸디코트/퍼티', price: 8000 },
    waterproof: { name: '침투성 방수제', price: 22000 },
    foam_bond: { name: '우레탄 폼본드', price: 8000 },
    floor: { name: '장판', price: 12000 }, // 미터당
    decotile: { name: '데코타일', price: 45000 },
    silicone: { name: '바이오 실리콘', price: 3000 },
    remover: { name: '곰팡이 제거제', price: 10000 },
    custom: { name: '직접 입력 자재', price: 0 }
};

function goToEstimateStep() {
    if (Object.keys(projectState.materials).length === 0) {
        alert("계산된 자재가 없습니다. 자재 수량 계산기에서 먼저 수량을 계산해주세요.");
        return;
    }
    
    renderEstimateList();
    calculateEstimateTotal();
    navigate('estimate');
}

function renderEstimateList() {
    const listContainer = document.getElementById('estimate-list');
    listContainer.innerHTML = '';

    for (const [key, data] of Object.entries(projectState.materials)) {
        const baseItem = basePrices[key];
        if (!baseItem) continue;

        const displayName = key === 'custom' ? data.customName : baseItem.name;

        const rowHtml = `
            <div class="estimate-row">
                <div class="est-info">
                    <strong>${displayName}</strong>
                    <span class="est-qty">필요: ${data.qty} ${data.unit}</span>
                </div>
                <div class="est-price">
                    <input type="number" id="est-price-${key}" class="input-field calc-item-price" 
                           data-qty="${data.qty}" value="${baseItem.price}" oninput="calculateEstimateTotal()">
                    <span>원</span>
                </div>
            </div>
        `;
        listContainer.insertAdjacentHTML('beforeend', rowHtml);
    }
}

// 최대 예산 수치 변환기
function parseBudgetMax(budgetStr) {
    if (budgetStr === '10만원 이하') return 100000;
    if (budgetStr === '10~30만원') return 300000;
    if (budgetStr === '30~50만원') return 500000;
    if (budgetStr === '50~100만원') return 1000000;
    if (budgetStr === '100~300만원') return 3000000;
    if (budgetStr === '300만원 이상') return 5000000; 
    return 0; // 아직 모르겠음
}

function calculateEstimateTotal() {
    let materialsTotal = 0;
    
    // 자재 비용 합산 (수량 * 단가)
    const priceInputs = document.querySelectorAll('.calc-item-price');
    priceInputs.forEach(input => {
        const qty = parseFloat(input.getAttribute('data-qty')) || 0;
        const price = parseFloat(input.value) || 0;
        materialsTotal += (qty * price);
    });

    // 공구비, 기타비용
    const toolCost = parseFloat(document.getElementById('est-tool-cost').value) || 0;
    const shippingCost = parseFloat(document.getElementById('est-shipping-cost').value) || 0;

    const grandTotal = materialsTotal + toolCost + shippingCost;

    // 상태 저장
    projectState.estimate.materialsCost = materialsTotal;
    projectState.estimate.toolCost = toolCost;
    projectState.estimate.shippingCost = shippingCost;
    projectState.estimate.totalCost = grandTotal;

    // UI 업데이트
    document.getElementById('est-total-cost').innerText = grandTotal.toLocaleString() + ' 원';
    
    // 예산 비교 로직
    const budgetMsgEle = document.getElementById('est-budget-msg');
    const myBudgetEle = document.getElementById('est-my-budget');
    
    if (projectState.budget && projectState.budget !== '아직 모르겠음') {
        myBudgetEle.innerText = projectState.budget;
        const maxBudget = parseBudgetMax(projectState.budget);
        
        if (grandTotal <= maxBudget) {
            budgetMsgEle.innerText = "👍 예산 안에서 충분히 가능합니다!";
            budgetMsgEle.style.color = "#38A169"; // 녹색
        } else if (grandTotal <= maxBudget * 1.2) {
            budgetMsgEle.innerText = "⚠️ 예산을 약간 초과합니다. 단가를 조정해 보세요.";
            budgetMsgEle.style.color = "#DD6B20"; // 주황색
        } else {
            budgetMsgEle.innerText = "🚨 예산 초과! 공정 축소나 예산 재조정이 필요합니다.";
            budgetMsgEle.style.color = "#E53E3E"; // 빨간색
        }
    } else {
        myBudgetEle.innerText = "미설정";
        budgetMsgEle.innerText = "예산이 설정되지 않았습니다. (4단계)";
        budgetMsgEle.style.color = "var(--text-sub)";
    }
}

// ==========================================
// MVP 9단계: 공정 검증 시스템 로직
// ==========================================

function goToValidationStep() {
    navigate('validation');
}

function toggleValidationChip(planItem, element) {
    const index = projectState.validationPlan.indexOf(planItem);
    if (index > -1) {
        projectState.validationPlan.splice(index, 1);
        element.classList.remove('selected');
    } else {
        projectState.validationPlan.push(planItem);
        element.classList.add('selected');
    }
}

function runValidation() {
    const plan = projectState.validationPlan;
    if (plan.length === 0) {
        alert("계획하고 계신 시공 방법을 하나 이상 선택해 주세요.");
        return;
    }

    const conditions = projectState.conditions || [];
    const symptoms = projectState.symptoms || [];
    const spaces = projectState.spaces || [];
    const buildingState = projectState.buildingState || '';

    let warnings = [];
    let dangerLevel = '안전'; // 안전, 주의, 전문가 확인 권장, 위험
    let recoText = "현재 계획하신 공정은 큰 무리가 없어 보입니다. 이대로 진행하셔도 좋습니다.";

    // 1. 외벽 + 얇은 단열재 -> 위험
    if (conditions.includes('외벽') && plan.includes('단열벽지/폼블럭 등 얇은 단열재 부착')) {
        warnings.push("외벽에 폼블럭 등 얇은 단열재를 시공하면 단열재 안쪽(벽면)에서 결로가 생겨 곰팡이가 썩으면서 더 크게 번집니다.");
        dangerLevel = '위험';
        recoText = "폼블럭 대신 반드시 밀착 시공이 가능한 '이보드' 등 두꺼운 압출법 단열재를 폼본드로 기밀하게 시공해야 합니다.";
    }

    // 2. 곰팡이 + 건조 누락 -> 주의/위험
    if (symptoms.includes('곰팡이') && !plan.includes('완전 건조 (하루 이상)')) {
        warnings.push("곰팡이 약품 처리 후 벽면을 완벽히 말리지 않으면 도배나 단열재 안쪽에서 곰팡이가 즉시 재발합니다.");
        if (dangerLevel !== '위험') dangerLevel = '위험';
    }

    // 3. 욕실 + 기존 실리콘 덧방 -> 위험
    if (spaces.includes('욕실') && plan.includes('기존 실리콘 위에 그대로 덧방')) {
        warnings.push("물때와 곰팡이가 핀 기존 실리콘 위에 새 실리콘을 덧바르면 접착이 되지 않고 며칠 만에 다 떨어집니다.");
        dangerLevel = '위험';
        recoText = "기존 실리콘을 전용 커터로 '완벽하게' 파내고, 락스 청소 후 하루 이상 바싹 말린 뒤 바이오 실리콘을 시공해야 합니다.";
    }

    // 4. 천장 + 물기/누수 의심 -> 전문가 확인 권장
    if (conditions.includes('천장') && (symptoms.includes('물기/결로') || symptoms.includes('누수 의심'))) {
        warnings.push("천장의 물기는 단순 결로가 아니라 윗집의 배관/방수층 누수일 확률이 매우 높습니다.");
        if (dangerLevel === '안전' || dangerLevel === '주의') dangerLevel = '전문가 확인 권장';
        recoText = "셀프 시공을 시작하기 전, 반드시 전문가의 '누수 탐지'를 받아 원인을 먼저 해결하세요. 그렇지 않으면 시공한 모든 것이 헛수고가 됩니다.";
    }

    // 5. 곰팡이 제거 후 바로 마감 -> 위험
    if (plan.includes('곰팡이 약품 제거만 진행') && plan.includes('제거 후 바로 도배/장판 마감')) {
        warnings.push("곰팡이가 발생한 근본 원인(단열 부족/결로)을 해결하지 않고 마감재만 덮으면 첫 겨울에 100% 재발합니다.");
        dangerLevel = '위험';
        recoText = "단열재 보강(이보드 등) 또는 항균 단열 페인트(세라믹 탄성코트) 공정을 반드시 추가해야 합니다.";
    }

    // DOM 업데이트
    const resultContainer = document.getElementById('validation-result-container');
    const warningList = document.getElementById('val-warning-list');
    const badge = document.getElementById('val-badge');
    const recoBox = document.getElementById('val-reco-text');
    const wrapper = document.getElementById('val-card-wrapper');

    warningList.innerHTML = '';
    
    // 경고가 없으면 안전 메시지
    if (warnings.length === 0) {
        warningList.innerHTML = '<li style="color:var(--text-main); font-weight:400;">입력하신 조건과 계획에서 특별한 위험 요소가 발견되지 않았습니다.</li>';
    } else {
        warnings.forEach(w => {
            const li = document.createElement('li');
            li.innerText = w;
            warningList.appendChild(li);
        });
    }

    recoBox.innerText = recoText;
    badge.innerText = dangerLevel;
    
    // 배지 및 테두리 색상 처리
    badge.className = 'badge'; // 초기화
    wrapper.style.borderColor = 'var(--border-color)';
    
    if (dangerLevel === '안전') {
        badge.classList.add('risk-low');
    } else if (dangerLevel === '주의') {
        badge.classList.add('risk-medium');
        wrapper.style.borderColor = '#DD6B20';
    } else if (dangerLevel === '전문가 확인 권장') {
        badge.style.backgroundColor = '#805AD5'; // 보라색
        badge.style.color = 'white';
        wrapper.style.borderColor = '#805AD5';
    } else if (dangerLevel === '위험') {
        badge.classList.add('risk-high');
        wrapper.style.borderColor = '#E53E3E';
    }
    
    // MVP 15단계: 검증 결과에 따른 CTA 변경
    const coachBtn = document.querySelector('#view-validation .btn-secondary');
    if(coachBtn) {
        if(dangerLevel === '위험' || dangerLevel === '전문가 확인 권장') {
            coachBtn.className = 'btn btn-primary btn-large';
            coachBtn.style.backgroundColor = '#E53E3E';
            coachBtn.innerHTML = '<i class="fa-solid fa-triangle-exclamation"></i> 위험 공정! 반드시 전문가 검토받기';
        } else {
            coachBtn.className = 'btn btn-secondary btn-large';
            coachBtn.style.backgroundColor = '';
            coachBtn.innerHTML = '<i class="fa-solid fa-user-tie"></i> 이 공정, 전문가에게 한 번 검토받기';
        }
    }

    resultContainer.style.display = 'block';
    resultContainer.scrollIntoView({behavior: 'smooth', block: 'nearest'});
}

// ==========================================
// MVP 10단계: 실행 모드 로직
// ==========================================

function goToExecutionStep() {
    renderExecutionList();
    updateExecutionProgress();
    navigate('execution');
}

function renderExecutionList() {
    const listContainer = document.getElementById('exec-list-container');
    listContainer.innerHTML = '';

    const rawProblemKey = projectState.selectedProblem || state.selectedProblem || 'mold';
    const problemKey = ['mold', 'condensation', 'insulation'].includes(rawProblemKey) ? 'mold' :
                       (rawProblemKey === 'bathroom' ? 'bathroom' : 
                       (rawProblemKey === 'floor' ? 'floor' : 'mold'));
    const steps = processDataMap[problemKey] || processDataMap['mold'];
    
    // 실행 데이터 배열 길이 맞추기
    if (projectState.execution.completedSteps.length !== steps.length) {
        projectState.execution.completedSteps = new Array(steps.length).fill(false);
    }

    steps.forEach((step, index) => {
        const isCompleted = projectState.execution.completedSteps[index];
        const cardClass = isCompleted ? 'exec-step-card completed' : 'exec-step-card';
        const checkedAttr = isCompleted ? 'checked' : '';

        // 사진 파일 인풋용 고유 ID
        const photoInputId = `exec-photo-${index}`;
        
        const html = `
            <div class="${cardClass}" id="exec-card-${index}">
                <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:12px;">
                    <div>
                        <span style="font-size:0.8rem; font-weight:800; color:var(--primary); margin-bottom:4px; display:block;">STEP ${index + 1}</span>
                        <h3 style="font-size:1.1rem; font-weight:700; margin:0;">${step.title}</h3>
                    </div>
                    <label class="custom-checkbox">
                        <input type="checkbox" ${checkedAttr} onchange="toggleExecutionCheck(${index}, this)">
                        <span class="checkmark"></span>
                    </label>
                </div>
                
                <p style="font-size:0.9rem; color:var(--text-main); margin-bottom:12px;">${step.desc}</p>
                
                ${step.warning ? `
                <div style="background-color:#FFF5F5; color:#C53030; font-size:0.85rem; padding:10px; border-radius:6px; margin-bottom:12px;">
                    <i class="fa-solid fa-triangle-exclamation"></i> ${step.warning}
                </div>
                ` : ''}
                
                <!-- 사진 첨부 영역 -->
                <div class="exec-photo-area" onclick="document.getElementById('${photoInputId}').click()">
                    <i class="fa-solid fa-camera"></i> 이 단계의 작업 사진 촬영 / 업로드
                    <input type="file" id="${photoInputId}" accept="image/*" style="display:none;" onchange="handleExecPhotoUpload(${index}, this)">
                    <div id="exec-photo-preview-${index}" style="margin-top:8px; font-size:0.8rem; color:var(--primary);"></div>
                </div>
                
                <!-- 메모 입력 영역 -->
                <textarea class="exec-memo-input" placeholder="이 단계에서 느낀 점, 특이사항, 질문할 점을 메모하세요." 
                          onchange="projectState.execution.notes[${index}] = this.value">${projectState.execution.notes[index] || ''}</textarea>
                          
                <!-- 검증 및 전문가 요청 -->
                <button class="btn btn-secondary btn-small" style="width:100%; margin-top:12px;" onclick="navigate('chat')">
                    <i class="fa-solid fa-user-shield"></i> 이 단계 사진/메모 전문가에게 검증받기
                </button>
            </div>
        `;
        listContainer.insertAdjacentHTML('beforeend', html);
    });
}

function toggleExecutionCheck(index, checkboxEle) {
    projectState.execution.completedSteps[index] = checkboxEle.checked;
    
    const card = document.getElementById(`exec-card-${index}`);
    if (checkboxEle.checked) {
        card.classList.add('completed');
    } else {
        card.classList.remove('completed');
    }
    
    updateExecutionProgress();
}

function updateExecutionProgress() {
    const steps = projectState.execution.completedSteps;
    const total = steps.length;
    if(total === 0) return;
    
    const completedCount = steps.filter(v => v).length;
    const percent = Math.round((completedCount / total) * 100);
    
    projectState.execution.progress = percent;
    
    document.getElementById('exec-progress-text').innerText = percent + '%';
    document.getElementById('exec-progress-fill').style.width = percent + '%';
    
    // 오늘 할 일 찾기 (첫 번째로 완료되지 않은 단계)
    const problemKey = projectState.selectedProblem || 'mold';
    const processData = processDataMap[problemKey] || processDataMap['mold'];
    
    const nextIndex = steps.findIndex(v => v === false);
    const todayTaskEle = document.getElementById('exec-today-task');
    
    if (nextIndex === -1) {
        todayTaskEle.innerText = "🎉 모든 공정 완료! 고생하셨습니다.";
    } else {
        todayTaskEle.innerText = `${nextIndex + 1}. ${processData[nextIndex].title}`;
    }
}

function handleExecPhotoUpload(index, inputEle) {
    if (inputEle.files && inputEle.files[0]) {
        const fileName = inputEle.files[0].name;
        document.getElementById(`exec-photo-preview-${index}`).innerText = `📸 첨부 완료: ${fileName}`;
        projectState.execution.photos[index] = fileName; // MVP에서는 이름만 저장
    }
}

// ==========================================
// MVP 11단계: 전문가 코칭 신청 로직
// ==========================================

function updateCoachingPrice(price) {
    document.getElementById('coach-total-price').innerText = price.toLocaleString() + ' 원';
    projectState.coachingRequest.price = price;
    
    const typeRadios = document.getElementsByName('coach_type');
    for(let r of typeRadios) {
        if(r.checked) {
            projectState.coachingRequest.type = r.value;
            break;
        }
    }
}

function handleCoachPhotoUpload(inputEle) {
    if (inputEle.files && inputEle.files.length > 0) {
        let fileNames = [];
        for(let i=0; i<inputEle.files.length; i++){
            fileNames.push(inputEle.files[i].name);
        }
        document.getElementById('coach-photo-preview').innerText = `📸 총 ${fileNames.length}장 첨부됨`;
        projectState.coachingRequest.photos = fileNames;
    }
}

function submitCoachingRequest() {
    const question = document.getElementById('coach-question').value;
    const phone = document.getElementById('coach-phone').value;
    const method = document.getElementById('coach-contact-method').value;
    
    if(!phone) {
        alert("전문가가 연락드릴 휴대폰 번호를 입력해주세요.");
        return;
    }
    
    projectState.coachingRequest.question = question;
    projectState.coachingRequest.phone = phone;
    projectState.coachingRequest.contactMethod = method;
    
    // MVP 14단계: 관리자 확인용 코칭 신청 데이터 저장 (localStorage)
    let requests = JSON.parse(localStorage.getItem('selin_coaching_requests') || '[]');
    const newRequest = {
        id: 'req_' + Date.now() + Math.floor(Math.random()*1000),
        date: new Date().toISOString(),
        status: '접수', // 접수, 확인 중, 답변 완료, 상담 예약, 종료
        adminMemo: '',
        // 현재까지 작성된 전체 프로젝트 상태 스냅샷 복사
        projectData: JSON.parse(JSON.stringify(projectState)) 
    };
    requests.push(newRequest);
    localStorage.setItem('selin_coaching_requests', JSON.stringify(requests));
    
    alert(`전문가 코칭 신청이 완료되었습니다!\n(MVP 버전: 실제 결제나 전송은 이뤄지지 않으나, 관리자 화면에 접수되었습니다.)\n\n- 신청 상품: ${projectState.coachingRequest.type}\n- 결제 예정액: ${projectState.coachingRequest.price}원`);
    
    // 신청 후 메인으로 돌아가거나 마이페이지로 이동
    navigate('home');
}

// ==========================================
// MVP 12단계: 서류/PDF 제공 기능
// ==========================================

function goToDocumentStep() {
    // 미리보기 초기화
    document.getElementById('doc-preview-wrapper').style.display = 'none';
    document.getElementById('print-area').innerHTML = '';
    navigate('document');
}

function renderDocumentPreview(type) {
    const printArea = document.getElementById('print-area');
    const wrapper = document.getElementById('doc-preview-wrapper');
    wrapper.style.display = 'block';
    
    let html = '';
    const dateStr = new Date().toLocaleDateString('ko-KR');
    const titleObj = {
        'plan': '셀프 시공 종합 계획서',
        'materials': '자재 구매 리스트',
        'estimate': '예상 견적서',
        'checklist': '공정 및 하자 예방 체크리스트',
        'expert': '전문가 검토 요청서'
    };
    
    const s = projectState;
    const problemName = getProblemName(s.selectedProblem);
    const spaces = s.spaces && s.spaces.length > 0 ? s.spaces.join(', ') : '미입력';
    const symptoms = s.symptoms && s.symptoms.length > 0 ? s.symptoms.join(', ') : '해당없음';
    const conditions = s.conditions && s.conditions.length > 0 ? s.conditions.join(', ') : '미입력';
    const totalCost = s.estimate && s.estimate.totalCost ? s.estimate.totalCost : 0;
    
    // 1. 공통 헤더
    html += `
        <div style="text-align:center; margin-bottom: 30px; border-bottom: 3px solid #333; padding-bottom: 20px;">
            <h1 style="font-size:1.8rem; font-weight:900; color:#333; margin-bottom:10px;">${titleObj[type]}</h1>
            <p style="color:#666;">작성일자: ${dateStr}</p>
        </div>
        
        <div style="margin-bottom:20px; background:#f9f9f9; padding:15px; border-radius:8px; border: 1px solid #ddd;">
            <strong style="display:block; margin-bottom: 8px;">[프로젝트 개요]</strong>
            - <strong>목적:</strong> ${problemName}<br>
            - <strong>공간:</strong> ${spaces}<br>
            - <strong>예산:</strong> ${s.budget || '미입력'}
        </div>
    `;

    // 2. 개별 내용 구성
    if (type === 'plan') {
        const steps = processDataMap[s.selectedProblem] || processDataMap['mold'];
        let processHtml = '<ul style="padding-left:20px;">';
        steps.forEach((st, i) => {
            processHtml += `<li style="margin-bottom:12px;"><strong>${i+1}단계: ${st.title}</strong><br><span style="color:#555; font-size:0.9rem;">${st.desc}</span></li>`;
        });
        processHtml += '</ul>';

        html += `
            <h3 style="margin-top:24px;">1. 현장 상태 요약</h3>
            <p>- <strong>주거형태/건물:</strong> ${s.housing || '-'} / ${s.buildingState || '-'}</p>
            <p>- <strong>현재증상:</strong> ${symptoms}</p>
            
            <h3 style="margin-top:24px;">2. AI 진단 추천 공정</h3>
            ${processHtml}
        `;
    } 
    else if (type === 'materials') {
        html += `<h3 style="margin-top:24px;">자재 및 수량 산출 내역</h3>`;
        if(s.materials && Object.keys(s.materials).length > 0) {
            html += `<table style="width:100%; border-collapse:collapse; text-align:left; margin-top:10px;">
                        <tr style="border-bottom:2px solid #333; background-color:#eee;"><th style="padding:10px;">자재명</th><th style="padding:10px;">필요 수량 (로스 포함)</th><th style="padding:10px;">손실율</th></tr>`;
            for(let key in s.materials) {
                const mat = s.materials[key];
                html += `<tr style="border-bottom:1px solid #ccc;">
                            <td style="padding:10px;">${basePrices[key] ? basePrices[key].name : key}</td>
                            <td style="padding:10px; font-weight:bold;">${mat.qty} ${mat.unit}</td>
                            <td style="padding:10px; color:#666;">${Math.round(mat.lossRate*100)}%</td>
                         </tr>`;
            }
            html += `</table>`;
            html += `<p style="margin-top:10px; font-size:0.85rem; color:#666;">※ 본 수량은 사용자의 시공 숙련도(${s.experience})에 따른 손실율이 반영된 수치입니다.</p>`;
        } else {
            html += `<p>계산된 자재 내역이 없습니다. (자재 수량 계산기를 먼저 이용해주세요)</p>`;
        }
    }
    else if (type === 'estimate') {
        html += `<h3 style="margin-top:24px;">예상 견적 내역</h3>`;
        if(s.estimate && s.estimate.totalCost > 0 && Object.keys(s.materials).length > 0) {
            html += `<table style="width:100%; border-collapse:collapse; text-align:left; margin-top:10px;">
                        <tr style="border-bottom:2px solid #333; background-color:#eee;">
                            <th style="padding:10px;">항목명</th><th style="padding:10px;">수량</th><th style="padding:10px;">예상 단가</th><th style="padding:10px;">합계</th>
                        </tr>`;
            
            // 자재 리스트 출력
            for(let key in s.materials) {
                const mat = s.materials[key];
                const base = basePrices[key];
                const price = base ? base.price : 0;
                const name = base ? base.name : key;
                html += `<tr style="border-bottom:1px solid #eee;">
                            <td style="padding:10px;">${name}</td>
                            <td style="padding:10px;">${mat.qty} ${mat.unit}</td>
                            <td style="padding:10px;">${price.toLocaleString()}원</td>
                            <td style="padding:10px;">${(mat.qty * price).toLocaleString()}원</td>
                        </tr>`;
            }
            
            // 공구비/기타비용 출력
            html += `<tr style="border-bottom:1px solid #eee;">
                        <td style="padding:10px;">기본 공구비</td>
                        <td style="padding:10px;">1 식</td>
                        <td style="padding:10px;">${(s.estimate.toolCost||0).toLocaleString()}원</td>
                        <td style="padding:10px;">${(s.estimate.toolCost||0).toLocaleString()}원</td>
                    </tr>`;
            html += `<tr style="border-bottom:1px solid #333;">
                        <td style="padding:10px;">배송비/기타비용</td>
                        <td style="padding:10px;">1 식</td>
                        <td style="padding:10px;">${(s.estimate.shippingCost||0).toLocaleString()}원</td>
                        <td style="padding:10px;">${(s.estimate.shippingCost||0).toLocaleString()}원</td>
                    </tr>`;
                    
            html += `</table>`;
            html += `<div style="text-align:right; margin-top:20px; font-size:1.5rem; font-weight:900; color:#e53e3e;">총 예상 비용: ${totalCost.toLocaleString()} 원</div>`;
            html += `<div style="text-align:right; font-size:0.9rem; color:#666; margin-top:4px;">(나의 설정 예산: ${s.budget})</div>`;
        } else {
            html += `<p>산출된 견적 내역이 없습니다.</p>`;
        }
    }
    else if (type === 'checklist') {
        const steps = processDataMap[s.selectedProblem] || processDataMap['mold'];
        html += `<h3 style="margin-top:24px;">현장 체크리스트</h3>`;
        steps.forEach((st, i) => {
            html += `
            <div style="margin-bottom:16px; border:1px solid #ccc; padding:16px; border-radius:4px; page-break-inside: avoid;">
                <div style="font-weight:bold; font-size:1.1rem; margin-bottom:8px;">
                    <span style="display:inline-block; width:24px; height:24px; border:2px solid #333; margin-right:8px; vertical-align:middle;"></span>
                    ${i+1}. ${st.title}
                </div>
                <div style="margin-left: 36px;">
                    <p style="margin:0 0 8px 0; color:#555; font-size:0.95rem;">${st.desc}</p>
                    ${st.warning ? `<div style="background-color:#fff5f5; color:#c53030; padding:8px; border-radius:4px; font-size:0.9rem; border:1px solid #fed7d7;"><b>⚠️ 주의:</b> ${st.warning}</div>` : ''}
                </div>
            </div>`;
        });
    }
    else if (type === 'expert') {
        html += `
            <h3 style="margin-top:24px;">전문가님, 아래 현장 검토를 요청합니다.</h3>
            <table style="width:100%; border-collapse:collapse; text-align:left; border-top:2px solid #333; border-bottom:2px solid #333;">
                <tr style="border-bottom:1px solid #ccc;"><td style="padding:12px; width:120px; font-weight:bold; background:#f5f5f5;">건물 상태</td><td style="padding:12px;">${s.housing || '-'} / ${s.buildingState || '-'}</td></tr>
                <tr style="border-bottom:1px solid #ccc;"><td style="padding:12px; font-weight:bold; background:#f5f5f5;">현장 조건</td><td style="padding:12px;">${conditions}</td></tr>
                <tr style="border-bottom:1px solid #ccc;"><td style="padding:12px; font-weight:bold; background:#f5f5f5;">발생 증상</td><td style="padding:12px;">${symptoms}</td></tr>
                <tr style="border-bottom:1px solid #ccc;"><td style="padding:12px; font-weight:bold; background:#f5f5f5;">나의 경험</td><td style="padding:12px;">${s.experience || '-'}</td></tr>
                <tr><td style="padding:12px; font-weight:bold; background:#f5f5f5;">내 시공계획</td><td style="padding:12px;">${s.validationPlan && s.validationPlan.length > 0 ? s.validationPlan.join(', ') : '미입력'}</td></tr>
            </table>
            
            <h4 style="margin-top:24px;">현장 메모 및 특이사항</h4>
            <div style="margin-top:10px; padding:20px; border:1px dashed #999; height:200px; color:#aaa;">
                (인쇄 후 펜으로 기입하시거나, 사진을 부착해 주세요)
            </div>
        `;
    }

    printArea.innerHTML = html;
    
    // 화면 하단으로 스크롤 이동
    setTimeout(() => {
        wrapper.scrollIntoView({behavior: 'smooth', block: 'start'});
    }, 50);
}

function getProblemName(key) {
    const names = {
        'mold': '곰팡이 해결',
        'condensation': '결로 해결',
        'insulation': '단열 개선',
        'bathroom': '욕실 보수',
        'floor': '장판/바닥 교체',
        'wall': '벽체/도배/페인트',
        'full': '전체 리모델링',
        'unknown': '미정'
    };
    return names[key] || '미정';
}

// ==========================================
// MVP 13단계: 프로젝트 저장 및 목록 관리 (localStorage)
// ==========================================

function updateProjectHeaderUI() {
    const nameEl = document.getElementById('current-project-name');
    const statusEl = document.getElementById('current-project-status');
    
    if(nameEl && statusEl) {
        nameEl.innerText = projectState.projectId ? projectState.projectName : '새 프로젝트 (작성 중)';
        statusEl.innerText = '상태: ' + (projectState.projectId ? projectState.status : '미저장');
    }
}

function startNewProject() {
    if(!projectState.projectId && (projectState.housingType !== '' || projectState.budget !== '')) {
        if(!confirm("작성 중인 프로젝트가 저장되지 않았습니다. 무시하고 새로 시작하시겠습니까?")) return;
    }
    
    projectState = getEmptyProjectState();
    state.selectedProblem = null;
    
    // UI 초기화 로직 (체크박스 해제 등 폼 리셋은 향후 보완)
    const chips = document.querySelectorAll('.chip');
    chips.forEach(c => c.classList.remove('selected'));
    document.querySelectorAll('.input-field').forEach(el => el.value = '');
    
    updateProjectHeaderUI();
    navigate('home');
}

function goToProjectsList() {
    renderProjectList();
    navigate('projects');
}

function renderProjectList() {
    const container = document.getElementById('project-list-container');
    container.innerHTML = '';
    
    const projects = JSON.parse(localStorage.getItem('selin_projects') || '[]');
    
    if(projects.length === 0) {
        container.innerHTML = '<p style="text-align:center; padding:20px; color:#888;">저장된 프로젝트가 없습니다.</p>';
        return;
    }
    
    // 최신 순 정렬
    projects.sort((a,b) => b.lastModified - a.lastModified);
    
    projects.forEach(p => {
        const dateStr = new Date(p.lastModified).toLocaleString('ko-KR');
        const progress = p.execution ? p.execution.progress : 0;
        
        let statusBadgeClass = 'risk-low';
        if(p.status === '계획 중') statusBadgeClass = 'risk-low';
        else if(p.status === '진행 중') statusBadgeClass = 'risk-medium';
        else if(p.status === '검증 필요') statusBadgeClass = 'risk-high';
        else if(p.status === '완료') statusBadgeClass = 'risk-low';
        
        const html = `
            <div class="card" style="border:1px solid #ddd; position:relative;">
                <div style="display:flex; justify-content:space-between; margin-bottom:8px;">
                    <h3 style="margin:0; font-size:1.1rem; color:#2c3e50;">${p.projectName}</h3>
                    <span class="badge ${statusBadgeClass}">${p.status}</span>
                </div>
                <p style="font-size:0.85rem; color:#666; margin:0 0 10px 0;">
                    목적: ${getProblemName(p.selectedProblem)} | 예산: ${p.budget || '미정'}<br>
                    최종 수정: ${dateStr}
                </p>
                
                <div class="progress-bar-container" style="height:6px; margin-bottom:12px;">
                    <div class="progress-fill" style="width:${progress}%;"></div>
                </div>
                
                <div style="display:flex; gap:10px;">
                    <button class="btn btn-primary btn-small" style="flex:1;" onclick="loadProject('${p.projectId}')">불러오기</button>
                    <button class="btn btn-secondary btn-small" style="flex:1; color:#c53030;" onclick="deleteProject('${p.projectId}')">삭제</button>
                </div>
            </div>
        `;
        container.insertAdjacentHTML('beforeend', html);
    });
}

function openSaveModal() {
    document.getElementById('project-name-input').value = projectState.projectName === '새 프로젝트' ? '' : projectState.projectName;
    document.getElementById('project-status-input').value = projectState.status;
    document.getElementById('save-project-modal').style.display = 'flex';
}

function closeSaveModal() {
    document.getElementById('save-project-modal').style.display = 'none';
}

function confirmSaveProject() {
    const nameInput = document.getElementById('project-name-input').value.trim();
    const statusInput = document.getElementById('project-status-input').value;
    
    if(!nameInput) {
        alert("프로젝트 이름을 입력해주세요.");
        return;
    }
    
    // LocalStorage 저장 처리
    let projects = JSON.parse(localStorage.getItem('selin_projects') || '[]');
    const isNew = !projectState.projectId || !projects.some(p => p.projectId === projectState.projectId);
    
    // 구독 플랜에 따른 프로젝트 개수 제한 체크
    if (isNew && currentUser) {
        const currentCount = projects.length;
        if (currentUser.plan === 'Free' && currentCount >= 1) {
            closeSaveModal();
            openUpgradeModal(
                "프로젝트 저장 한도에 도달했습니다",
                "무료 플랜은 동시에 1개의 프로젝트만 저장할 수 있습니다. 베이직으로 업그레이드하여 최대 5개까지 안전하게 프로젝트를 관리해보세요!"
            );
            return;
        } else if (currentUser.plan === 'Basic' && currentCount >= 5) {
            closeSaveModal();
            openUpgradeModal(
                "프로젝트 저장 한도에 도달했습니다",
                "베이직 플랜은 최대 5개의 프로젝트만 보관할 수 있습니다. 프로 플랜으로 업그레이드하고 개수 한도 없이 무제한으로 관리해보세요!"
            );
            return;
        }
    }
    
    // 현재 작성중인 데이터에 저장 상태 반영
    projectState.projectName = nameInput;
    projectState.status = statusInput;
    projectState.lastModified = Date.now();
    projectState.selectedProblem = state.selectedProblem; // 동기화
    
    if(!projectState.projectId) {
        projectState.projectId = 'proj_' + Date.now() + Math.floor(Math.random()*1000);
    }
    
    const existingIndex = projects.findIndex(p => p.projectId === projectState.projectId);
    
    if(existingIndex >= 0) {
        projects[existingIndex] = projectState;
    } else {
        projects.push(projectState);
    }
    
    localStorage.setItem('selin_projects', JSON.stringify(projects));
    
    closeSaveModal();
    updateProjectHeaderUI();
    alert(`[${projectState.projectName}] 프로젝트가 안전하게 저장되었습니다.`);
    
    // 현재 목록 화면이었다면 다시 렌더링
    if(document.getElementById('view-projects').classList.contains('active')) {
        renderProjectList();
    }
}

function loadProject(id) {
    const projects = JSON.parse(localStorage.getItem('selin_projects') || '[]');
    const found = projects.find(p => p.projectId === id);
    if(found) {
        projectState = found;
        state.selectedProblem = projectState.selectedProblem;
        updateProjectHeaderUI();
        navigate('home');
        alert("프로젝트 정보를 불러왔습니다.");
    }
}

function deleteProject(id) {
    if(confirm("이 프로젝트를 정말 삭제하시겠습니까? (이 작업은 되돌릴 수 없습니다)")) {
        let projects = JSON.parse(localStorage.getItem('selin_projects') || '[]');
        projects = projects.filter(p => p.projectId !== id);
        localStorage.setItem('selin_projects', JSON.stringify(projects));
        
        if(projectState.projectId === id) {
            projectState = getEmptyProjectState();
            state.selectedProblem = null;
            updateProjectHeaderUI();
        }
        
        renderProjectList();
    }
}


// ==========================================
// type="module" 환경 대응: window에 전역 함수 바인딩
// HTML의 onclick 속성에서 호출 가능하게 만듭니다.
// ==========================================
Object.assign(window, {
    // 라우팅
    navigate,

    // 진단 흐름 (1~4단계)
    selectProblem,
    goToNextStep,
    goToBudgetStep,
    toggleChip,
    toggleBudgetChip,
    addWallInput,

    // 분석 (5단계)
    startAnalysis,

    // 공정 (6단계)
    goToProcessStep,
    toggleStepCheck,

    // 자재 계산기 (7단계)
    goToCalculatorStep,
    calculateMaterials,
    toggleCalculatorMaterialChip,
    switchCalculatorAreaMode,

    // 비용 계산기 (8단계)
    goToEstimateStep,
    calculateEstimateTotal,

    // 검증 (9단계)
    goToValidationStep,
    toggleValidationChip,
    runValidation,

    // 실행 모드 (10단계)
    goToExecutionStep,
    toggleExecutionCheck,
    handleExecPhotoUpload,

    // 코칭 (11단계)
    updateCoachingPrice,
    handleCoachPhotoUpload,
    submitCoachingRequest,

    // 서류 (12단계)
    goToDocumentStep,
    renderDocumentPreview,

    // 프로젝트 관리 (13단계)
    openSaveModal,
    closeSaveModal,
    confirmSaveProject,
    goToProjectsList,
    loadProject,
    deleteProject,
    startNewProject,

    // 온보딩 & 소셜 로그인 추가 바인딩
    openKakaoLogin,
    closeKakaoLogin,
    confirmKakaoLogin,
    logout,
    saveReportAsPDF,
    updateHomePreviewBlur,
    handleCartAllClick,

    // 요금제 & 멤버십 관리
    toggleBillingCycle,
    selectPricingPlan,
    confirmTossPayment,
    closeUpgradeModal,
    goToPricingFromModal,
    handleSubscriptionCancelClick,

    // SEO 가이드 바인딩
    filterGuideArticles,
    renderGuideListView,
    renderArticleDetailView,
    renderHomeGuides,

    // 전문가 매칭 바인딩
    updateMatchGunguOptions,
    handleMatchPhotoSelect,
    submitMatchRequest,
    renderExpertCards,
    registerExpertPartner,
    renderAdminExpertList,
    selectExpertOffer,
    confirmMatchExecutionCompleted,

    // 온보딩 제어 바인딩
    setOnboardingSlide,
    nextOnboardingSlide,
    skipOnboarding,

    // 이미지 폴백 시스템
    getFallbackImage,

    // 토스트 알림
    showToast
});

// ==========================================
// 첫 진입 3단계 온보딩 슬라이드 제어 시스템
// ==========================================

let currentOnboardSlide = 1;

function setOnboardingSlide(slideNum) {
    currentOnboardSlide = slideNum;
    
    // 모든 슬라이드 숨기고 해당 슬라이드만 활성화
    const slides = document.querySelectorAll('.onboarding-slide');
    slides.forEach((slide, idx) => {
        if (idx === slideNum - 1) {
            slide.classList.add('active');
        } else {
            slide.classList.remove('active');
        }
    });
    
    // 하단 도트(점) 인디케이터 활성화
    const dots = document.querySelectorAll('.onboarding-dot');
    dots.forEach((dot, idx) => {
        if (idx === slideNum - 1) {
            dot.classList.add('active');
        } else {
            dot.classList.remove('active');
        }
    });
    
    // 슬라이드 3(마지막 슬라이드)인지 여부에 따라 다음 버튼 텍스트 변경
    const nextBtn = document.getElementById('btn-onboard-next');
    if (nextBtn) {
        if (slideNum === 3) {
            nextBtn.innerHTML = `시작하기 <i class="fa-solid fa-rocket"></i>`;
        } else {
            nextBtn.innerHTML = `다음 <i class="fa-solid fa-arrow-right"></i>`;
        }
    }
}

function nextOnboardingSlide() {
    if (currentOnboardSlide < 3) {
        setOnboardingSlide(currentOnboardSlide + 1);
    } else {
        skipOnboarding();
    }
}

function skipOnboarding() {
    const onboardingSec = document.getElementById('view-onboarding');
    if (onboardingSec) {
        onboardingSec.style.display = 'none';
    }
    // 온보딩 완료 여부 로컬 스토리지 보존
    localStorage.setItem('selin_onboard_viewed', 'true');
    showToast("🏠 셀인케어 홈에 오신 것을 환영합니다!");
}

// ==========================================
// 소셜 로그인 & 프로필 UI 삼총사
// ==========================================

function openKakaoLogin() {
    const modal = document.getElementById('kakao-login-modal');
    if (modal) modal.style.display = 'flex';
}

function closeKakaoLogin() {
    const modal = document.getElementById('kakao-login-modal');
    if (modal) modal.style.display = 'none';
}

function confirmKakaoLogin() {
    const nicknameInput = document.getElementById('kakao-user-name').value.trim();
    if (!nicknameInput) {
        alert("닉네임을 입력해 주세요.");
        return;
    }
    
    currentUser = {
        name: nicknameInput,
        provider: 'kakao',
        loggedIn: true,
        plan: "Free",
        analysisCount: 0,
        nextPaymentDate: null,
        paymentMethod: "미등록"
    };
    
    localStorage.setItem('selin_user', JSON.stringify(currentUser));
    skipOnboarding(); // 온보딩 닫기
    closeKakaoLogin();
    
    // UI 전면 업데이트
    updateUserProfileUI();
    updateProjectHeaderUI();
    
    showToast(`🎉 ${nicknameInput}님, 환영해요! 클라우드 동기화가 활성화되었습니다.`);
}

function logout() {
    if (confirm("로그아웃하시겠습니까? (로그아웃 시 계획은 오프라인 임시 저장소에만 보존됩니다)")) {
        localStorage.removeItem('selin_user');
        
        // 로그아웃 시 비회원 기본 세션 세팅
        currentUser = {
            name: "비로그인 사용자",
            loggedIn: false,
            plan: "Free",
            analysisCount: parseInt(localStorage.getItem('selin_free_analysis_count') || '0'),
            nextPaymentDate: null,
            paymentMethod: "미등록"
        };
        
        updateUserProfileUI();
        updateProjectHeaderUI();
        
        showToast("로그아웃되었습니다. 로컬 임시 저장으로 전환합니다.");
    }
}

function updateUserProfileUI() {
    const profileArea = document.getElementById('user-profile-area');
    if (!profileArea) return;
    
    if (currentUser && currentUser.loggedIn) {
        const initial = currentUser.name.trim().charAt(0);
        let planBadgeHtml = '';
        if (currentUser.plan === 'Basic') {
            planBadgeHtml = `<span style="font-size:0.6rem; background:#ebf8ff; color:#2b6cb0; border:1px solid #bee3f8; padding:1px 4px; border-radius:4px; font-weight:800; margin-left:4px;">Basic</span>`;
        } else if (currentUser.plan === 'Pro') {
            planBadgeHtml = `<span style="font-size:0.6rem; background:#faf5ff; color:#6b46c1; border:1px solid #e9d8fd; padding:1px 4px; border-radius:4px; font-weight:800; margin-left:4px;">Pro</span>`;
        } else {
            planBadgeHtml = `<span style="font-size:0.6rem; background:#f7fafc; color:#4a5568; border:1px solid #e2e8f0; padding:1px 4px; border-radius:4px; font-weight:800; margin-left:4px;">Free</span>`;
        }
        
        profileArea.innerHTML = `
            <div style="display:flex; align-items:center; gap:6px;">
                <div class="user-avatar" title="${currentUser.name}님 - 마이 플랜 관리하기" onclick="navigate('myplan')" style="cursor:pointer; width:28px; height:28px; font-size:0.8rem; background:linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
                    ${initial}
                </div>
                <div style="display:flex; flex-direction:column; text-align:left; cursor:pointer;" onclick="navigate('myplan')">
                    <span style="font-size:0.7rem; font-weight:800; color:var(--text-main); line-height:1.2;">${currentUser.name}님</span>
                    ${planBadgeHtml}
                </div>
            </div>
        `;
    } else {
        profileArea.innerHTML = `
            <button class="btn btn-secondary btn-small" onclick="openKakaoLogin()" style="padding: 6px 12px; font-size: 0.75rem; font-weight: 700; border-radius: 8px; margin: 0; border-color: var(--secondary-dark);">로그인</button>
            <button class="btn btn-primary btn-small" onclick="navigate('pricing')" style="padding: 6px 10px; font-size: 0.75rem; font-weight: 700; border-radius: 8px; margin: 0 0 0 4px; background: linear-gradient(135deg, #FF7043 0%, #FFB74D 100%); border:none; color:white;">요금제</button>
        `;
    }
}

// ==========================================
// 자재 & PDF 등 프리미엄 유틸 삼총사
// ==========================================

function saveReportAsPDF() {
    if (currentUser && currentUser.plan === 'Free') {
        openUpgradeModal(
            "PDF 다운로드는 베이직 전용 혜택입니다",
            "무료 플랜은 PDF 리포트 저장을 지원하지 않습니다. 베이직으로 업그레이드하시면 고해상도 PDF 가이드를 즉시 소장하고 출력하실 수 있습니다!"
        );
        return;
    }
    showToast("📄 [성공] 셀프 인테리어 AI 정밀 분석 리포트가 고해상도 PDF로 성공적으로 변환 및 저장되었습니다.");
}

function updateHomePreviewBlur() {
    const overlay = document.getElementById('preview-blur-overlay');
    if (!overlay) return;
    
    const isLoggedIn = currentUser && currentUser.loggedIn;
    if (isLoggedIn) {
        overlay.style.display = 'none';
    } else {
        overlay.style.display = 'flex';
    }
}

function handleCartAllClick(link) {
    showToast("🛒 최저가 제휴 자재를 일괄 검색 중입니다. 자체 장바구니 담기는 곧 연동됩니다!");
    setTimeout(() => {
        window.open(link, '_blank');
    }, 1200);
}

// ==========================================
// 프리미엄 멤버십 & 요금제 비즈니스 로직
// ==========================================

let isYearlyBilling = false;
let tempSelectedPlan = null; // 결제 시뮬레이션 임시 타겟 플랜

// 1. 월간 / 연간 결제 스위치 토글
function toggleBillingCycle() {
    const toggle = document.getElementById('pricing-billing-toggle');
    isYearlyBilling = toggle ? toggle.checked : false;
    
    const labelMonthly = document.getElementById('label-billing-monthly');
    const labelYearly = document.getElementById('label-billing-yearly');
    
    if (isYearlyBilling) {
        if (labelMonthly) labelMonthly.style.color = 'var(--text-sub)';
        if (labelYearly) labelYearly.style.color = 'var(--text-main)';
    } else {
        if (labelMonthly) labelMonthly.style.color = 'var(--text-main)';
        if (labelYearly) labelYearly.style.color = 'var(--text-sub)';
    }
    
    updatePricingPrices();
}

// 2. 주기에 따른 요금제 금액 텍스트 업데이트 (연 결제 시 16% 할인 및 2개월 무료 혜택 적용)
function updatePricingPrices() {
    const basicPrice = document.getElementById('price-text-Basic');
    const basicPeriod = document.getElementById('period-text-Basic');
    const basicDiscount = document.getElementById('discount-badge-Basic');
    
    const proPrice = document.getElementById('price-text-Pro');
    const proPeriod = document.getElementById('period-text-Pro');
    const proDiscount = document.getElementById('discount-badge-Pro');
    
    if (isYearlyBilling) {
        if (basicPrice) basicPrice.innerText = "8,250 원";
        if (basicPeriod) basicPeriod.innerText = " / 월 (연 99,000원 일시불)";
        if (basicDiscount) basicDiscount.style.display = 'inline-block';
        
        if (proPrice) proPrice.innerText = "16,500 원";
        if (proPeriod) proPeriod.innerText = " / 월 (연 198,000원 일시불)";
        if (proDiscount) proDiscount.style.display = 'inline-block';
    } else {
        if (basicPrice) basicPrice.innerText = "9,900 원";
        if (basicPeriod) basicPeriod.innerText = " / 월";
        if (basicDiscount) basicDiscount.style.display = 'none';
        
        if (proPrice) proPrice.innerText = "19,900 원";
        if (proPeriod) proPeriod.innerText = " / 월";
        if (proDiscount) proDiscount.style.display = 'none';
    }
}

// 3. 요금제 UI 하이라이트 갱신
function updatePricingUI() {
    updatePricingPrices();
    
    const plans = ['Free', 'Basic', 'Pro'];
    const currentPlan = (currentUser && currentUser.plan) ? currentUser.plan : 'Free';
    
    plans.forEach(plan => {
        const card = document.getElementById(`plan-card-${plan}`);
        const btn = document.getElementById(`btn-pricing-${plan}`);
        
        if (card) {
            if (plan === currentPlan) {
                card.style.borderColor = (plan === 'Basic') ? '#667eea' : ((plan === 'Pro') ? '#7c3aed' : 'var(--primary)');
                card.style.background = '#fcfdff';
            } else {
                card.style.borderColor = 'var(--border-color)';
                card.style.background = 'white';
            }
        }
        
        if (btn) {
            if (plan === currentPlan) {
                btn.innerText = "현재 이용 중";
                btn.className = "btn btn-secondary";
                btn.disabled = true;
                btn.style.opacity = '0.7';
            } else {
                btn.disabled = false;
                btn.style.opacity = '1';
                if (plan === 'Free') {
                    btn.innerText = "무료로 시작하기";
                    btn.className = "btn btn-secondary";
                } else if (plan === 'Basic') {
                    btn.innerText = "베이직 구독 시작";
                    btn.className = "btn btn-primary";
                    btn.style.background = "linear-gradient(135deg, #667eea 0%, #764ba2 100%)";
                } else if (plan === 'Pro') {
                    btn.innerText = "프로 구독 시작";
                    btn.className = "btn btn-primary";
                    btn.style.background = "linear-gradient(135deg, #7c3aed 0%, #5b21b6 100%)";
                }
            }
        }
    });
}

// 4. 플랜 선택 핸들러
function selectPricingPlan(planCode) {
    if (!currentUser || !currentUser.loggedIn) {
        alert("구독 결제를 진행하려면 먼저 카카오 로그인이 필요합니다.");
        openKakaoLogin();
        return;
    }
    
    if (currentUser.plan === planCode) {
        showToast("이미 이용 중이신 요금제입니다.");
        return;
    }
    
    if (planCode === 'Free') {
        if (confirm("정말로 무료 요금제로 변경하시겠습니까? 무제한 AI 분석 및 PDF 다운로드 혜택이 즉시 비활성화됩니다.")) {
            currentUser.plan = 'Free';
            currentUser.nextPaymentDate = null;
            currentUser.paymentMethod = "미등록";
            localStorage.setItem('selin_user', JSON.stringify(currentUser));
            
            updateUserProfileUI();
            updatePricingUI();
            showToast("무료 요금제로 강등 변경되었습니다.");
        }
        return;
    }
    
    tempSelectedPlan = planCode;
    openTossPaymentModal(planCode);
}

// 5. 토스페이먼츠 가상 결제창 열기
function openTossPaymentModal(planCode) {
    const modal = document.getElementById('toss-payment-modal');
    if (!modal) return;
    
    const title = document.getElementById('toss-pay-title');
    const priceText = document.getElementById('toss-pay-price');
    const nextDate = document.getElementById('toss-pay-next-date');
    
    const formattedDate = new Date();
    formattedDate.setMonth(formattedDate.getMonth() + 1);
    const dateString = `${formattedDate.getFullYear()}. ${String(formattedDate.getMonth() + 1).padStart(2, '0')}. ${String(formattedDate.getDate()).padStart(2, '0')}`;
    
    if (title) title.innerText = planCode === 'Basic' ? '베이직 멤버십 정기구독' : '프로 멤버십 정기구독';
    
    let priceVal = planCode === 'Basic' ? '9,900' : '19,900';
    if (isYearlyBilling) {
        priceVal = planCode === 'Basic' ? '99,000 (연간 일시불)' : '198,000 (연간 일시불)';
    }
    
    if (priceText) priceText.innerText = `최초 결제액: ${priceVal} 원`;
    if (nextDate) nextDate.innerText = `다음 자동청구: ${dateString}`;
    
    modal.style.display = 'flex';
}

function closeTossPaymentModal() {
    const modal = document.getElementById('toss-payment-modal');
    if (modal) modal.style.display = 'none';
    tempSelectedPlan = null;
}

// 6. 가상 토스 간편결제 최종 승인 처리 및 등급 승격!
function confirmTossPayment() {
    if (!tempSelectedPlan) return;
    
    const cardSelect = document.getElementById('toss-card-select');
    const selectedCardName = cardSelect ? cardSelect.options[cardSelect.selectedIndex].text : "신한카드 정기결제";
    
    currentUser.plan = tempSelectedPlan;
    
    const nextDate = new Date();
    nextDate.setMonth(nextDate.getMonth() + 1);
    currentUser.nextPaymentDate = `${nextDate.getFullYear()}-${String(nextDate.getMonth() + 1).padStart(2, '0')}-${String(nextDate.getDate()).padStart(2, '0')}`;
    currentUser.paymentMethod = selectedCardName;
    
    localStorage.setItem('selin_user', JSON.stringify(currentUser));
    
    closeTossPaymentModal();
    updateUserProfileUI();
    updatePricingUI();
    
    showToast(`👑 축하합니다! ${tempSelectedPlan} 플랜으로 승격이 완료되어 프리미엄 혜택이 적용되었습니다!`);
    
    navigate('myplan');
}

// 7. 업그레이드 유도 제한 모달 컨트롤러
function openUpgradeModal(title, message) {
    const modal = document.getElementById('upgrade-suggest-modal');
    const titleEl = document.getElementById('upgrade-modal-title');
    const msgEl = document.getElementById('upgrade-modal-message');
    
    if (titleEl) titleEl.innerText = title;
    if (msgEl) msgEl.innerText = message;
    
    if (modal) modal.style.display = 'flex';
}

function closeUpgradeModal() {
    const modal = document.getElementById('upgrade-suggest-modal');
    if (modal) modal.style.display = 'none';
}

function goToPricingFromModal() {
    closeUpgradeModal();
    navigate('pricing');
}

// 8. 구독 관리 마이페이지 렌더러
function renderMyPlanView() {
    if (!currentUser) return;
    
    const myplanName = document.getElementById('myplan-name');
    const myplanPrice = document.getElementById('myplan-price');
    const myplanNextDate = document.getElementById('myplan-next-date');
    const myplanPayment = document.getElementById('myplan-payment');
    const myplanUsage = document.getElementById('myplan-analysis-usage');
    const adBanner = document.getElementById('myplan-upgrade-banner');
    
    let planTitle = "무료 회원 (Free)";
    let priceText = "0원";
    let nextDateText = "해당 없음";
    let paymentText = "등록된 결제수단 없음";
    let usageText = `${currentUser.analysisCount || 0} / 2 회`;
    
    if (currentUser.plan === 'Basic') {
        planTitle = "베이직 멤버십 (Basic)";
        priceText = "월 9,900원";
        nextDateText = currentUser.nextPaymentDate || "2026-06-19";
        paymentText = currentUser.paymentMethod || "신한카드 정기결제";
        usageText = "무제한 사용 가능 (제한 없음)";
        if (adBanner) adBanner.style.display = 'none';
    } else if (currentUser.plan === 'Pro') {
        planTitle = "프로 멤버십 (Pro)";
        priceText = "월 19,900원";
        nextDateText = currentUser.nextPaymentDate || "2026-06-19";
        paymentText = currentUser.paymentMethod || "신한카드 정기결제";
        usageText = "무제한 사용 가능 (제한 없음 + 매월 코칭 1회 포함)";
        if (adBanner) adBanner.style.display = 'none';
    } else {
        if (adBanner) adBanner.style.display = 'flex';
    }
    
    if (myplanName) myplanName.innerText = planTitle;
    if (myplanPrice) myplanPrice.innerText = priceText;
    if (myplanNextDate) myplanNextDate.innerText = nextDateText;
    if (myplanPayment) myplanPayment.innerText = paymentText;
    if (myplanUsage) myplanUsage.innerText = usageText;
    
    // 🛠️ 매칭 상태 렌더러 연계 호출
    renderMatchingStatus();
}

// 9. 구독 해지 핸들러
function handleSubscriptionCancelClick() {
    if (!currentUser || currentUser.plan === 'Free') {
        showToast("현재 구독 중이 아니거나 무료 요금제 사용 중입니다.");
        return;
    }
    
    if (confirm("정말로 프리미엄 멤버십 정기구독을 해지하시겠습니까?\n해지 시 즉시 무제한 AI 설계 혜택과 PDF 저장 혜택이 중단됩니다.")) {
        currentUser.plan = 'Free';
        currentUser.nextPaymentDate = null;
        currentUser.paymentMethod = "미등록";
        localStorage.setItem('selin_user', JSON.stringify(currentUser));
        
        updateUserProfileUI();
        renderMyPlanView();
        showToast("정기구독 해지가 정상 처리되었습니다. 그동안 이용해주셔서 감사드립니다.");
        navigate('home');
    }
}

// ==========================================
// 🚀 SEO 콘텐츠 & 가이드 비즈니스 로직
// ==========================================

// 0. 가이드 이미지 로딩 실패 시 호출할 그라데이션 SVG 대체 이미지 생성기
function getFallbackImage(category) {
    let color1 = '#667eea', color2 = '#764ba2', icon = '🛠️';
    if (category === '결로/곰팡이') {
        color1 = '#3182ce'; color2 = '#319795'; icon = '💧';
    } else if (category === '단열') {
        color1 = '#dd6b20'; color2 = '#e53e3e'; icon = '🔥';
    } else if (category === '욕실') {
        color1 = '#00b5d8'; color2 = '#2b6cb0'; icon = '🛁';
    } else if (category === '바닥/장판') {
        color1 = '#805ad5'; color2 = '#b7791f'; icon = '🪵';
    } else if (category === '벽체/도배') {
        color1 = '#38a169'; color2 = '#319795'; icon = '🎨';
    }
    
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200">
        <defs>
            <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style="stop-color:${color1};stop-opacity:1" />
                <stop offset="100%" style="stop-color:${color2};stop-opacity:1" />
            </linearGradient>
        </defs>
        <rect width="200" height="200" fill="url(#grad)" />
        <text x="50%" y="55%" dominant-baseline="middle" text-anchor="middle" font-size="54" font-family="system-ui">${icon}</text>
    </svg>`;
    
    return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

// 1. 동적 SEO 메타 태그 갱신 (유기적 크롤링 및 소셜 공유 최적화)
function updateSEOMeta(title, description, ogImage) {
    // 타이틀 변경
    document.title = `${title} | 셀인케어 AI`;
    
    // 메타 설명(Description) 변경
    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
        metaDesc = document.createElement('meta');
        metaDesc.setAttribute('name', 'description');
        document.head.appendChild(metaDesc);
    }
    metaDesc.setAttribute('content', description);
    
    // 오픈그래프 타이틀
    let ogTitle = document.querySelector('meta[property="og:title"]');
    if (!ogTitle) {
        ogTitle = document.createElement('meta');
        ogTitle.setAttribute('property', 'og:title');
        document.head.appendChild(ogTitle);
    }
    ogTitle.setAttribute('content', `${title} | 셀인케어 AI`);
    
    // 오픈그래프 설명
    let ogDesc = document.querySelector('meta[property="og:description"]');
    if (!ogDesc) {
        ogDesc = document.createElement('meta');
        ogDesc.setAttribute('property', 'og:description');
        document.head.appendChild(ogDesc);
    }
    ogDesc.setAttribute('content', description);

    // 오픈그래프 이미지
    let ogImg = document.querySelector('meta[property="og:image"]');
    if (!ogImg) {
        ogImg = document.createElement('meta');
        ogImg.setAttribute('property', 'og:image');
        document.head.appendChild(ogImg);
    }
    ogImg.setAttribute('content', ogImage || 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=800&q=80');
}

// 2. 홈 화면 "최신 가이드" 섹션 렌더링 (2~3개 카드 노출)
function renderHomeGuides() {
    const container = document.getElementById('home-guide-container');
    if (!container) return;
    
    // 최근 등록된 3개 아티클 추출
    const latestArticles = guideArticles.slice(0, 3);
    
    container.innerHTML = latestArticles.map(article => `
        <div class="card" onclick="navigate('guide-detail', { slug: '${article.slug}' })" style="display:flex; gap:12px; padding:12px; cursor:pointer; align-items:center; border-color:var(--border-color); background:white; transition:transform 0.2s ease, box-shadow 0.2s ease;">
            <img src="${article.thumbnail}" alt="${article.title}" onerror="this.onerror=null; this.src=getFallbackImage('${article.category}')" style="width:70px; height:70px; border-radius:10px; object-fit:cover; border:1px solid #edf2f7;">
            <div style="flex:1; text-align:left;">
                <span style="font-size:0.65rem; font-weight:800; color:var(--primary); background:var(--primary-light); padding:2px 6px; border-radius:4px; margin-bottom:4px; display:inline-block;">${article.category}</span>
                <h4 style="margin:0 0 4px 0; font-size:0.85rem; font-weight:800; color:var(--text-main); line-height:1.3; overflow:hidden; text-overflow:ellipsis; display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical;">${article.title}</h4>
                <div style="font-size:0.7rem; color:var(--text-sub); display:flex; align-items:center; gap:8px;">
                    <span><i class="fa-regular fa-clock"></i> ${article.readTime}</span>
                    <span>•</span>
                    <span style="color:#3182ce; font-weight:700;"><i class="fa-solid fa-sparkles"></i> 타겟 키워드: ${article.keyword}</span>
                </div>
            </div>
            <i class="fa-solid fa-chevron-right" style="color:var(--text-sub); font-size:0.8rem; margin-left:4px;"></i>
        </div>
    `).join('');
}

// 3. 가이드 목록 뷰 렌더링 (카테고리 필터 연동)
function renderGuideListView() {
    const container = document.getElementById('guide-list-container');
    if (!container) return;
    
    const filter = state.selectedCategory || 'all';
    const filtered = filter === 'all' 
        ? guideArticles 
        : guideArticles.filter(art => art.category === filter);
        
    if (filtered.length === 0) {
        container.innerHTML = `
            <div style="padding:40px 20px; text-align:center; color:var(--text-sub);">
                <i class="fa-solid fa-folder-open" style="font-size:2.5rem; margin-bottom:12px; opacity:0.5;"></i>
                <p style="margin:0; font-size:0.85rem;">해당 카테고리의 가이드가 준비 중입니다.</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = filtered.map(article => `
        <div class="card" onclick="navigate('guide-detail', { slug: '${article.slug}' })" style="display:flex; flex-direction:column; padding:0; overflow:hidden; cursor:pointer; border-color:var(--border-color); background:white; transition:transform 0.2s ease, box-shadow 0.2s ease; text-align:left;">
            <img src="${article.thumbnail}" alt="${article.title}" onerror="this.onerror=null; this.src=getFallbackImage('${article.category}')" style="width:100%; height:140px; object-fit:cover; border-bottom:1px solid #edf2f7;">
            <div style="padding:16px;">
                <span style="font-size:0.65rem; font-weight:800; color:white; background:var(--primary); padding:3px 6px; border-radius:4px; margin-bottom:8px; display:inline-block;">${article.category}</span>
                <h3 style="margin:0 0 6px 0; font-size:1rem; font-weight:800; color:var(--text-main); line-height:1.4;">${article.title}</h3>
                <p style="margin:0 0 12px 0; font-size:0.75rem; color:var(--text-sub); line-height:1.45; overflow:hidden; text-overflow:ellipsis; display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical;">${article.description}</p>
                <div style="display:flex; justify-content:space-between; align-items:center; font-size:0.7rem; color:var(--text-sub); border-top:1px solid #f7fafc; padding-top:10px;">
                    <span><i class="fa-regular fa-clock" style="margin-right:4px;"></i> 읽는 시간: ${article.readTime}</span>
                    <span style="color:var(--primary); font-weight:700; display:flex; align-items:center; gap:2px;">가이드 보기 <i class="fa-solid fa-arrow-right"></i></span>
                </div>
            </div>
        </div>
    `).join('');
}

// 4. 가이드 카테고리 필터링 제어
function filterGuideArticles(category) {
    state.selectedCategory = category;
    
    // 모든 칩에서 selected 클래스 제거
    const chips = document.querySelectorAll('.category-filter-container .chip');
    chips.forEach(chip => chip.classList.remove('selected'));
    
    // 해당 칩에 selected 클래스 추가
    const chipMap = {
        'all': 'filter-chip-all',
        '결로/곰팡이': 'filter-chip-결로',
        '단열': 'filter-chip-단열',
        '욕실': 'filter-chip-욕실',
        '바닥/장판': 'filter-chip-바닥',
        '벽체/도배': 'filter-chip-벽체'
    };
    
    const targetId = chipMap[category];
    const targetChip = document.getElementById(targetId);
    if (targetChip) {
        targetChip.classList.add('selected');
    }
    
    renderGuideListView();
}

// 5. 초소형 마크다운 파서 및 CTA 삽입 엔진
function parseMarkdown(text) {
    if (!text) return "";
    
    // H1 파싱 (# 제목)
    let html = text.replace(/^#\s+(.+)$/gm, '<h1 style="font-size:1.35rem; font-weight:900; color:var(--text-main); margin:20px 0 12px 0; border-bottom:2px solid #edf2f7; padding-bottom:8px;">$1</h1>');
    
    // H2 파싱 (## 제목)
    html = html.replace(/^##\s+(.+)$/gm, '<h2 class="article-h2-heading" id="heading-$1" style="font-size:1.1rem; font-weight:800; color:var(--text-main); margin:28px 0 12px 0; display:flex; align-items:center; gap:6px;"><i class="fa-solid fa-hashtag" style="color:var(--primary); font-size:0.9rem;"></i> $1</h2>');
    
    // H3 파싱 (### 제목)
    html = html.replace(/^###\s+(.+)$/gm, '<h3 style="font-size:0.95rem; font-weight:800; color:var(--text-main); margin:18px 0 8px 0; border-left:3px solid var(--primary-light); padding-left:8px;">$1</h3>');
    
    // 강한 강조 파싱 (**텍스트**)
    html = html.replace(/\*\*(.+?)\*\*/g, '<strong style="color:var(--primary); font-weight:800;">$1</strong>');
    
    // 리스트 항목 파싱 (* 항목)
    html = html.replace(/^\*\s+(.+)$/gm, '<li style="margin-left:14px; margin-bottom:6px; list-style-type:disc;">$1</li>');
    
    // 문단 개행 파싱
    html = html.replace(/\n\n/g, '</p><p style="margin-bottom:14px; line-height:1.7;">');
    
    // 래핑
    html = `<p style="margin-bottom:14px; line-height:1.7;">${html}</p>`;
    
    // 조인트 수평선 파싱
    html = html.replace(/<p>---<\/p>/g, '<hr style="border:none; border-top:1px solid #edf2f7; margin:24px 0;">');

    // 본문 중간에 리드 전환 CTA 삽입 (두 번째 H2 헤더가 나타나는 부분 바로 앞이나 수평선 부근에 결합)
    const ctaHtml = `
        <div class="banner-ad" style="background: linear-gradient(135deg, #FF7043 0%, #FFB74D 100%); color:white; padding:18px; border-radius:16px; margin:24px 0; display:flex; flex-direction:column; gap:10px; box-shadow:0 8px 20px rgba(255, 112, 67, 0.2); text-align:left; cursor:pointer;" onclick="navigate('problem')">
            <div style="display:flex; justify-content:space-between; align-items:center;">
                <div>
                    <h4 style="margin:0; font-size:1.05rem; font-weight:800;"><i class="fa-solid fa-sparkles"></i> AI로 내 공정 자동 분석하기</h4>
                    <p style="margin:4px 0 0 0; font-size:0.8rem; opacity:0.95;">이 셀프 공정이 내 현장 상황에 맞는지 인공지능이 10초 만에 진단해 드립니다.</p>
                </div>
                <i class="fa-solid fa-chevron-right" style="font-size:1.1rem; color:white;"></i>
            </div>
        </div>
    `;
    
    // 본문의 절반 위치 혹은 2번째 H2 헤더 위치에 CTA를 삽입
    const headings = html.split('<h2 class="article-h2-heading"');
    if (headings.length > 2) {
        // 2번째 헤더 바로 앞에 CTA 삽입
        headings[1] = headings[1] + ctaHtml;
        html = headings.join('<h2 class="article-h2-heading"');
    } else {
        // 단락이 적은 경우 본문 맨 뒤에 덧붙임
        html += ctaHtml;
    }

    return html;
}

// 6. 아티클 상세 뷰 렌더링 & H2 목차 자동 생성
function renderArticleDetailView(slug) {
    const article = guideArticles.find(art => art.slug === slug);
    if (!article) {
        showToast("존재하지 않는 아티클입니다.");
        navigate('guide');
        return;
    }
    
    // 1. SEO 메타 실시간 최적화
    updateSEOMeta(article.title, article.description, article.ogImage);
    
    // 2. 카테고리 뱃지 업데이트
    const badge = document.getElementById('detail-category-badge');
    if (badge) {
        badge.innerText = article.category;
        badge.style.background = article.category === '결로/곰팡이' ? '#e53e3e' : 
                                 (article.category === '단열' ? '#3182ce' : 
                                 (article.category === '욕실' ? '#319795' : '#805ad5'));
    }
    
    // 3. 목차 생성 (H2 기반 추출)
    const tocList = document.getElementById('article-toc-list');
    const tocBox = document.getElementById('article-toc-box');
    
    // H2 헤더 추출 매칭
    const h2Regex = /^##\s+(.+)$/gm;
    const matches = [...article.content.matchAll(h2Regex)];
    
    if (matches.length > 0 && tocList && tocBox) {
        tocBox.style.display = 'block';
        tocList.innerHTML = matches.map(match => {
            const headingText = match[1];
            return `
                <li style="margin-bottom:6px;">
                    <a href="#heading-${headingText}" onclick="event.preventDefault(); document.getElementById('heading-${headingText}').scrollIntoView({ behavior: 'smooth' });" style="color:#4a5568; font-weight:700; text-decoration:none; cursor:pointer;">
                        ${headingText}
                    </a>
                </li>
            `;
        }).join('');
    } else {
        if (tocBox) tocBox.style.display = 'none';
    }
    
    // 4. 본문 파싱 및 렌더링
    const bodyArea = document.getElementById('article-body-area');
    if (bodyArea) {
        bodyArea.innerHTML = parseMarkdown(article.content);
    }
    
    // 5. 하단 관련 아티클 3개 추천
    const recommendList = document.getElementById('article-recommend-list');
    if (recommendList) {
        // 현재 아티클을 제외한 동일 카테고리 또는 다른 아티클 3개
        const related = guideArticles
            .filter(art => art.slug !== slug)
            .sort(() => 0.5 - Math.random()) // 랜덤 셔플로 순환 유도
            .slice(0, 3);
            
        recommendList.innerHTML = related.map(rel => `
            <div class="card" onclick="navigate('guide-detail', { slug: '${rel.slug}' })" style="display:flex; gap:10px; padding:10px; cursor:pointer; align-items:center; border-color:var(--border-color); background:#fcfdff; transition:all 0.2s ease;">
                <img src="${rel.thumbnail}" alt="${rel.title}" onerror="this.onerror=null; this.src=getFallbackImage('${rel.category}')" style="width:50px; height:50px; border-radius:8px; object-fit:cover;">
                <div style="flex:1; text-align:left;">
                    <span style="font-size:0.6rem; color:#718096; background:#e2e8f0; padding:1px 4px; border-radius:3px; font-weight:800; display:inline-block; margin-bottom:2px;">${rel.category}</span>
                    <h4 style="margin:0; font-size:0.78rem; font-weight:800; color:var(--text-main); line-height:1.2; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; max-width:220px;">${rel.title}</h4>
                </div>
                <i class="fa-solid fa-chevron-right" style="color:var(--text-sub); font-size:0.75rem;"></i>
            </div>
        `).join('');
    }
    
    // 상단으로 부드럽게 스크롤링
    const wrapper = document.querySelector('.app-wrapper');
    if (wrapper) wrapper.scrollTop = 0;
}

// ==========================================
// 🤝 안심 전문가 매칭 비즈니스 로직 및 엔진
// ==========================================

// 1. 전문가 데이터베이스 (기본 검증 전문가 3인)
const expertPartners = [
    {
        id: "expert-1",
        name: "탑 클래스 결로방수 테크",
        ceo: "김진수 마스터",
        specialty: "결로/곰팡이",
        license: "105-82-99000",
        region: "서울특별시 전체",
        rating: 4.9,
        reviews: 142,
        projectsCount: 380,
        badge: true,
        desc: "독일제 친환경 약품과 특허받은 고기밀 단열 이보드 시공 전문입니다. 하자가 발생할 경우 3년간 무상 보증을 지원합니다."
    },
    {
        id: "expert-2",
        name: "명성 기밀 단열 엔지니어링",
        ceo: "최태호 대표",
        specialty: "단열 시공",
        license: "212-14-88400",
        region: "경기도 경기남부",
        rating: 4.8,
        reviews: 98,
        projectsCount: 210,
        badge: true,
        desc: "외벽 크랙 보수부터 내벽 우레탄 기밀 폼 시공까지, 빈틈없는 정석 열교 차단을 고집합니다."
    },
    {
        id: "expert-3",
        name: "안심 바닥 미장 디자인",
        ceo: "박건우 소장",
        specialty: "바닥/장판",
        region: "인천광역시 전체",
        rating: 4.7,
        reviews: 74,
        projectsCount: 155,
        badge: false,
        desc: "미장 수평 샌딩과 수성 친환경 친화 장판 시공 전문입니다. 들뜸 없는 바탕 정석 작업에 자부심을 가집니다."
    }
];

// 2. 가상의 견적 제안 데이터
const mockExpertOffers = {
    "expert-1": {
        price: 1850000,
        schedule: "1주일 내 시공 가능",
        message: "현장 분석 결과 단열 노후가 큽니다. 이보드 13T 및 기밀 폼 시공 포함한 3년 무상보증 견적입니다. 친절히 모시겠습니다."
    },
    "expert-2": {
        price: 1950000,
        schedule: "10일 내 시공 가능",
        message: "독일식 친환경 열교 단열 처리를 통해 원천 차단해 드립니다. 시공 전 누수 검침 서비스는 무료로 제공됩니다."
    }
};

// 3. 사용자 매칭 신청 내역 전역 로드 및 상태
let userMatchingRequests = JSON.parse(localStorage.getItem('selin_matching_requests') || '[]');

// 4. 시/도별 군/구 딕셔너리
const regionalGungus = {
    seoul: ["강남구", "마포구", "서초구", "송파구", "강동구", "영등포구", "용산구"],
    gyeonggi: ["성남시 분당구", "수원시 영통구", "고양시 일산동구", "용인시 수지구", "안양시 동안구"],
    incheon: ["송도국제도시", "부평구", "남동구", "서구 청라"]
};

// 5. 시/도 선택에 따른 군/구 셀렉트 옵션 업데이트
function updateMatchGunguOptions() {
    const regionSido = document.getElementById('match-region-sido');
    const regionGungu = document.getElementById('match-region-gungu');
    if (!regionSido || !regionGungu) return;
    
    const selectedSido = regionSido.value;
    const gungus = regionalGungus[selectedSido] || [];
    
    regionGungu.innerHTML = gungus.map(g => `<option value="${g}">${g}</option>`).join('');
}

// 6. 가상 사진 업로드 미리보기 등록
let matchUploadedPhotos = [];
function handleMatchPhotoSelect() {
    const input = document.getElementById('match-photo-input');
    const list = document.getElementById('match-photo-preview-list');
    if (!input || !input.files || !list) return;
    
    const file = input.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            matchUploadedPhotos.push(e.target.result);
            list.innerHTML += `
                <div style="position:relative; width:60px; height:60px; border-radius:8px; overflow:hidden; border:1px solid #edf2f7;">
                    <img src="${e.target.result}" style="width:100%; height:100%; object-fit:cover;">
                </div>
            `;
        };
        reader.readAsDataURL(file);
    }
}

// 7. 안심 매칭 신청서 제출 및 가상 리스너 엔진 구동 (10초 뒤 견적 도착)
function submitMatchRequest() {
    const constType = document.getElementById('match-construction-type').value;
    const regionSido = document.getElementById('match-region-sido');
    const regionSidoText = regionSido ? regionSido.options[regionSido.selectedIndex].text : "서울특별시";
    const regionGungu = document.getElementById('match-region-gungu').value;
    const schedule = document.getElementById('match-schedule');
    const scheduleText = schedule ? schedule.options[schedule.selectedIndex].text : "최대한 빨리";
    const budget = document.getElementById('match-budget-limit');
    const budgetText = budget ? budget.options[budget.selectedIndex].text : "협의 필요";
    const details = document.getElementById('match-details').value.trim();
    
    const typeLabelMap = {
        'mold': '결로/곰팡이 하자 보수',
        'insulation': '정밀 단열 시공',
        'bathroom': '욕실 방수 및 타일',
        'floor': '바닥/장판 교체',
        'wall': '벽체 목공/도배/페인트',
        'full': '원인 분석 및 종합 시공'
    };
    
    const newRequest = {
        id: `req-${Date.now()}`,
        type: constType,
        typeLabel: typeLabelMap[constType] || "하자 원인 시공",
        region: `${regionSidoText} ${regionGungu}`,
        schedule: scheduleText,
        budget: budgetText,
        details: details || "하자 정밀 복구 및 안심 보수 요청",
        photos: [...matchUploadedPhotos],
        status: "접수중", // 접수중 -> 견적 도착 -> 전문가 선택 완료 -> 시공 완료
        createdAt: new Date().toLocaleDateString(),
        offers: [],
        selectedExpert: null,
        contractPrice: 0
    };
    
    userMatchingRequests.unshift(newRequest);
    localStorage.setItem('selin_matching_requests', JSON.stringify(userMatchingRequests));
    
    // 모달 초기화
    matchUploadedPhotos = [];
    const list = document.getElementById('match-photo-preview-list');
    if (list) list.innerHTML = '';
    const form = document.getElementById('expert-match-form');
    if (form) form.reset();
    
    showToast("안심 매칭 신청이 정상 완료되었습니다! 24시간 내 최적의 전문가 견적이 도착합니다.");
    navigate('myplan');
    
    // 💡 시각 효과 체감 시뮬레이터: 10초 뒤 자동으로 견적 2개 도착 처리!
    setTimeout(() => {
        const req = userMatchingRequests.find(r => r.id === newRequest.id);
        if (req && req.status === "접수중") {
            req.status = "견적 도착";
            req.offers = [
                {
                    expertId: "expert-1",
                    expertName: "탑 클래스 결로방수 테크",
                    price: mockExpertOffers["expert-1"].price,
                    schedule: mockExpertOffers["expert-1"].schedule,
                    message: mockExpertOffers["expert-1"].message,
                    rating: 4.9
                },
                {
                    expertId: "expert-2",
                    expertName: "명성 기밀 단열 엔지니어링",
                    price: mockExpertOffers["expert-2"].price,
                    schedule: mockExpertOffers["expert-2"].schedule,
                    message: mockExpertOffers["expert-2"].message,
                    rating: 4.8
                }
            ];
            
            localStorage.setItem('selin_matching_requests', JSON.stringify(userMatchingRequests));
            showToast("🔔 띵동! 신청하신 안심 전문가 견적이 2건 도착했습니다. 마이페이지에서 확인해보세요!");
            
            // 만약 현재 마이페이지가 열려있다면 즉시 갱신
            const myplanView = document.getElementById('view-myplan');
            if (myplanView && myplanView.classList.contains('active')) {
                renderMatchingStatus();
            }
        }
    }, 10000);
}

// 8. 마이페이지 전문가 매칭 현황 4단계 시각화 렌더러
function renderMatchingStatus() {
    const container = document.getElementById('matching-status-container');
    if (!container) return;
    
    if (userMatchingRequests.length === 0) {
        container.innerHTML = `
            <div style="padding:30px 10px; text-align:center; color:var(--text-sub);">
                <i class="fa-solid fa-clipboard-list" style="font-size:2rem; margin-bottom:8px; opacity:0.4;"></i>
                <p style="margin:0; font-size:0.8rem; font-weight:700;">신청하신 전문가 매칭 견적서가 없습니다.</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = userMatchingRequests.map(req => {
        // 프로그레스 바 상태 매핑
        const steps = ["접수중", "견적 도착", "전문가 선택 완료", "시공 완료"];
        const currentIndex = steps.indexOf(req.status);
        
        let progressHtml = `
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px; position:relative; padding:0 8px;">
                <div style="position:absolute; left:20px; right:20px; height:3px; background:#e2e8f0; top:12px; z-index:1;"></div>
                <div style="position:absolute; left:20px; width:${(currentIndex / 3) * 100}%; height:3px; background:var(--primary); top:12px; z-index:1; transition:width 0.4s ease;"></div>
        `;
        
        steps.forEach((step, idx) => {
            const isActive = idx <= currentIndex;
            const isCurrent = idx === currentIndex;
            
            progressHtml += `
                <div style="display:flex; flex-direction:column; align-items:center; z-index:2; position:relative;">
                    <div style="width:24px; height:24px; border-radius:50%; background:${isCurrent ? 'var(--primary)' : (isActive ? 'var(--primary-light)' : '#cbd5e0')}; color:white; display:flex; justify-content:center; align-items:center; font-size:0.65rem; font-weight:900; box-shadow: ${isCurrent ? '0 0 10px rgba(255,112,67,0.4)' : 'none'};">
                        ${idx + 1}
                    </div>
                    <span style="font-size:0.68rem; font-weight:${isActive ? '800' : '500'}; color:${isActive ? 'var(--text-main)' : 'var(--text-sub)'}; margin-top:6px;">${step}</span>
                </div>
            `;
        });
        progressHtml += `</div>`;
        
        // 상태별 추가 액션 또는 견적 카드 노출
        let actionAreaHtml = "";
        
        if (req.status === "접수중") {
            actionAreaHtml = `
                <div style="background:#f8fafc; border-radius:10px; padding:12px; text-align:center; font-size:0.78rem; color:#718096; border:1px solid #edf2f7; display:flex; align-items:center; justify-content:center; gap:8px;">
                    <span style="display:inline-block; width:8px; height:8px; background:#ecc94b; border-radius:50%; animation:pulse 1.2s infinite;"></span>
                    셀인케어 소속 파트너들이 견적을 산출 중입니다. 조금만 기다려주세요! (약 10초)
                </div>
            `;
        } 
        else if (req.status === "견적 도착") {
            actionAreaHtml = `
                <div style="margin-top:10px;">
                    <h5 style="margin:0 0 8px 0; font-size:0.8rem; font-weight:800; color:#2c3e50;"><i class="fa-solid fa-bell" style="color:#ecc94b;"></i> 맞춤 파트너 견적서 도착 (${req.offers.length}건)</h5>
                    <div style="display:flex; flex-direction:column; gap:10px;">
                        ${req.offers.map(offer => `
                            <div style="background:#ffffff; border:1px solid #e2e8f0; border-radius:12px; padding:16px; text-align:left; box-shadow:var(--shadow-sm);">
                                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
                                    <strong style="font-size:0.85rem; color:var(--text-main);"><i class="fa-solid fa-medal" style="color:#ffb74d;"></i> ${offer.expertName}</strong>
                                    <span style="font-size:0.75rem; color:#d69e2e; font-weight:800;"><i class="fa-solid fa-star"></i> ${offer.rating}</span>
                                </div>
                                <p style="margin:0 0 10px 0; font-size:0.78rem; color:#4a5568; line-height:1.4;">${offer.message}</p>
                                <div style="display:flex; justify-content:space-between; align-items:center; border-top:1px solid #edf2f7; padding-top:10px;">
                                    <div>
                                        <span style="font-size:0.7rem; color:var(--text-sub); display:block;">희망 견적가</span>
                                        <strong style="font-size:1.05rem; color:#e53e3e; font-weight:900;">${offer.price.toLocaleString()} 원</strong>
                                    </div>
                                    <button class="btn btn-primary btn-small" onclick="selectExpertOffer('${req.id}', '${offer.expertName}', ${offer.price})" style="background:#319795; padding:6px 12px; border-radius:6px; font-size:0.75rem;">
                                        이 파트너 선택하기
                                    </button>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        }
        else if (req.status === "전문가 선택 완료") {
            actionAreaHtml = `
                <div style="background:#ebf8ff; border:1px solid #bee3f8; border-radius:12px; padding:16px; text-align:left; box-shadow:var(--shadow-sm);">
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
                        <span style="font-size:0.7rem; font-weight:800; color:#2b6cb0; background:#bee3f8; padding:2px 6px; border-radius:4px;">매칭 계약 체결</span>
                        <strong style="font-size:0.9rem; color:#2b6cb0;">${req.selectedExpert}</strong>
                    </div>
                    <div style="display:flex; justify-content:space-between; font-size:0.78rem; color:#4a5568; margin-bottom:12px;">
                        <span>최종 조율된 계약 금액</span>
                        <strong style="color:var(--text-main); font-weight:800;">${req.contractPrice.toLocaleString()} 원</strong>
                    </div>
                    
                    <button class="btn btn-primary" onclick="confirmMatchExecutionCompleted('${req.id}')" style="width:100%; justify-content:center; background:#319795; border:none; padding:10px; font-weight:800; font-size:0.8rem; border-radius:8px;">
                        <i class="fa-solid fa-circle-check"></i> 공사완료 확정하기 (계약 성사 확인)
                    </button>
                </div>
            `;
        }
        else if (req.status === "시공 완료") {
            const fee = Math.floor(req.contractPrice * 0.08); // 매칭 수수료 8% 정책
            actionAreaHtml = `
                <div style="background:#f0fff4; border:1px solid #c6f6d5; border-radius:12px; padding:16px; text-align:left;">
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px; border-bottom:1px solid #c6f6d5; padding-bottom:8px;">
                        <span style="font-size:0.7rem; font-weight:800; color:#22543d; background:#c6f6d5; padding:2px 6px; border-radius:4px;"><i class="fa-solid fa-circle-check"></i> 안심 시공 보수 완료</span>
                        <span style="font-size:0.72rem; color:#4a5568; font-weight:700;">완료일: ${req.createdAt}</span>
                    </div>
                    <p style="margin:0 0 10px 0; font-size:0.78rem; color:#276749; line-height:1.45;">
                        🎉 시공이 하자 없이 성공적으로 마무리되었습니다! 탑 파트너 <b>${req.selectedExpert}</b>에 의해 안전하게 하자가 잡혔습니다.
                    </p>
                    
                    <!-- 매칭 성사 수수료 영수증 부서 -->
                    <div style="background:white; border-radius:8px; padding:12px; border:1px solid #e2e8f0; font-size:0.72rem;">
                        <div style="display:flex; justify-content:space-between; color:#4a5568; margin-bottom:4px;">
                            <span>시공 계약 원금</span>
                            <span>${req.contractPrice.toLocaleString()}원</span>
                        </div>
                        <div style="display:flex; justify-content:space-between; color:#4a5568; margin-bottom:4px;">
                            <span>플랫폼 매칭 수수료율</span>
                            <span style="font-weight:700; color:#319795;">8%</span>
                        </div>
                        <div style="display:flex; justify-content:space-between; color:#2d3748; font-weight:900; border-top:1px dashed #edf2f7; padding-top:6px; margin-top:6px; font-size:0.78rem;">
                            <span>수수료 부과 예정액 (파트너 청구)</span>
                            <span style="color:#e53e3e;">${fee.toLocaleString()}원</span>
                        </div>
                    </div>
                </div>
            `;
        }
        
        return `
            <div class="card" style="padding:16px; margin-bottom:16px; border-color:#e2e8f0; text-align:left; background:#ffffff;">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
                    <div>
                        <span style="font-size:0.65rem; font-weight:800; color:white; background:var(--primary); padding:2px 6px; border-radius:4px; margin-right:4px;">${req.typeLabel}</span>
                        <span style="font-size:0.7rem; color:#718096;"><i class="fa-solid fa-location-dot"></i> ${req.region}</span>
                    </div>
                    <span style="font-size:0.7rem; color:#a0aec0;">${req.createdAt}</span>
                </div>
                
                <!-- 4단계 진행 바 -->
                ${progressHtml}
                
                <!-- 세부 디테일 액션 -->
                ${actionAreaHtml}
            </div>
        `;
    }).join('');
}

// 9. 견적 도착한 파트너 중 최종 전문가 수락
function selectExpertOffer(requestId, expertName, price) {
    const req = userMatchingRequests.find(r => r.id === requestId);
    if (!req) return;
    
    req.status = "전문가 선택 완료";
    req.selectedExpert = expertName;
    req.contractPrice = price;
    
    localStorage.setItem('selin_matching_requests', JSON.stringify(userMatchingRequests));
    showToast(`🎉 ${expertName} 파트너를 최종 낙찰 및 계약 체결하였습니다!`);
    
    renderMatchingStatus();
}

// 10. 시공 완료 수동 확정 및 수수료 정책 고지
function confirmMatchExecutionCompleted(requestId) {
    const req = userMatchingRequests.find(r => r.id === requestId);
    if (!req) return;
    
    if (confirm("정말로 시공 보수가 하자가 없이 완료되었습니까?\n확정 시 최종 계약 금액에 의거해 수수료 청구서가 발부됩니다.")) {
        req.status = "시공 완료";
        
        localStorage.setItem('selin_matching_requests', JSON.stringify(userMatchingRequests));
        showToast("👍 축하합니다! 시공 완료 승인이 무사히 마무리되었습니다.");
        
        renderMatchingStatus();
    }
}

// 11. 안심 검증 전문가 목록 렌더러 (view-match-list)
function renderExpertCards() {
    const container = document.getElementById('expert-cards-container');
    if (!container) return;
    
    container.innerHTML = expertPartners.map(exp => `
        <div class="card" style="padding:20px; text-align:left; background:white; border-color:var(--border-color); display:flex; gap:16px; flex-direction:column; position:relative;">
            
            <!-- 골드 검증 뱃지 -->
            ${exp.badge ? `
                <div style="position:absolute; top:20px; right:20px; background:#ecc94b; color:#1a202c; font-size:0.62rem; font-weight:900; padding:4px 8px; border-radius:6px; display:flex; align-items:center; gap:4px; box-shadow:0 4px 10px rgba(236,201,75,0.25);">
                    <i class="fa-solid fa-award"></i> 셀인케어 인증 전문가
                </div>
            ` : ''}

            <div style="display:flex; gap:14px; align-items:center;">
                <div style="width:50px; height:50px; border-radius:50%; background:#f7fafc; display:flex; justify-content:center; align-items:center; border:1px solid #e2e8f0; font-size:1.4rem; color:var(--primary);">
                    <i class="fa-solid fa-user-tie"></i>
                </div>
                <div>
                    <h3 style="margin:0 0 4px 0; font-size:0.95rem; font-weight:800; color:var(--text-main);">${exp.name}</h3>
                    <div style="display:flex; align-items:center; gap:6px; font-size:0.75rem; color:var(--text-sub);">
                        <span>${exp.ceo}</span>
                        <span>•</span>
                        <span style="color:#d69e2e; font-weight:800;"><i class="fa-solid fa-star"></i> ${exp.rating} (${exp.reviews}리뷰)</span>
                    </div>
                </div>
            </div>
            
            <p style="margin:0; font-size:0.78rem; color:#4a5568; line-height:1.45;">${exp.desc}</p>
            
            <div style="display:flex; flex-wrap:wrap; gap:6px; font-size:0.7rem;">
                <span style="background:#ebf8ff; color:#2b6cb0; padding:2px 6px; border-radius:4px; font-weight:700;"><i class="fa-solid fa-wrench"></i> ${exp.specialty} 전문</span>
                <span style="background:#f7fafc; color:#4a5568; padding:2px 6px; border-radius:4px; font-weight:700;"><i class="fa-solid fa-location-dot"></i> 시공지역: ${exp.region}</span>
                <span style="background:#e6fffa; color:#234e52; padding:2px 6px; border-radius:4px; font-weight:700;"><i class="fa-solid fa-clipboard-check"></i> 누적 시공 ${exp.projectsCount}건</span>
            </div>

            <button class="btn btn-primary" onclick="navigate('match-form')" style="width:100%; justify-content:center; padding:10px; font-size:0.8rem; border-radius:8px; font-weight:800; background:#319795; border:none;">
                이 전문가에게 직접 견적 요청하기 →
            </button>
        </div>
    `).join('');
}

// 12. 파트너 신청 등록 및 관리 (view-admin-expert)
function registerExpertPartner() {
    const name = document.getElementById('reg-expert-name').value.trim();
    const ceo = document.getElementById('reg-expert-ceo').value.trim();
    const license = document.getElementById('reg-expert-license').value.trim();
    const specialty = document.getElementById('reg-expert-specialty').value;
    const region = document.getElementById('reg-expert-region').value;
    
    if (!name || !ceo || !license) {
        alert("모든 빈칸을 채워주세요.");
        return;
    }
    
    const newExpert = {
        id: `expert-${Date.now()}`,
        name: name,
        ceo: ceo,
        specialty: specialty,
        license: license,
        region: region,
        rating: 5.0,
        reviews: 0,
        projectsCount: 0,
        badge: true, // 즉시 승인이므로 인증 뱃지 활성
        desc: `셀인케어의 실시간 3단계 인증 심사를 즉시 패스한 검증된 파트너입니다. 대표 ${ceo}의 직영 책임 시공을 약속합니다.`
    };
    
    expertPartners.unshift(newExpert);
    
    const form = document.getElementById('expert-register-form');
    if (form) form.reset();
    
    showToast(`🏢 [파트너 가입 완료] '${name}' 전문가 브랜드가 즉시 승인 및 골드 등급으로 등록되었습니다!`);
    
    renderAdminExpertList();
    renderExpertCards();
}

// 13. 관리자 대시보드 리스트 렌더러
function renderAdminExpertList() {
    const container = document.getElementById('admin-expert-list-container');
    if (!container) return;
    
    container.innerHTML = expertPartners.map(exp => `
        <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:10px; padding:12px; font-size:0.75rem; text-align:left; display:flex; justify-content:space-between; align-items:center;">
            <div>
                <strong style="font-size:0.8rem; color:var(--text-main); display:block;">
                    ${exp.name} ${exp.badge ? '<span style="color:#ecc94b; font-size:0.6rem;">★ 골드 인증</span>' : ''}
                </strong>
                <span style="color:var(--text-sub);">대표: ${exp.ceo} | 분야: ${exp.specialty} | ${exp.region}</span>
            </div>
            <div style="text-align:right;">
                <span style="background:#e2e8f0; color:#4a5568; padding:2px 6px; border-radius:4px; font-size:0.65rem; font-weight:800; display:block; margin-bottom:4px;">매칭 수수료: 8%</span>
                <span style="color:#38a169; font-weight:700;">정상 승인 완료</span>
            </div>
        </div>
    `).join('');
}

