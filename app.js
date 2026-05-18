// app.js - MVP 화면 전환 및 상태 관리 로직

// 전역 상태 관리
const state = {
    selectedProblem: null
};

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


// 초기화
document.addEventListener("DOMContentLoaded", () => {
    // 저장된 현재 프로젝트가 메모리에 없다면 초기화
    updateProjectHeaderUI();
    // 기본적으로 홈 화면 활성화
    navigate('home');
});

// 화면 전환(라우팅) 함수
function navigate(viewId) {
    const allViews = document.querySelectorAll('.view-section');
    const allNavItems = document.querySelectorAll('.bottom-nav .nav-item');
    
    // 모든 뷰 숨기기
    allViews.forEach(view => view.classList.remove('active'));
    
    if (viewId === 'home') {
        document.getElementById('view-home').classList.add('active');
        updateBottomNav(0);
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
    // 그 외 아직 기능이 개발되지 않은 뷰
    else {
        const placeholderView = document.getElementById('view-placeholder');
        placeholderView.classList.add('active');
        
        const titleElement = document.getElementById('placeholder-title');
        let titleText = '준비 중인 기능입니다';
        
        switch(viewId) {
            case 'budget':
                titleText = '예산 기반 맞춤 계획 기능';
                updateBottomNav(2);
                break;
            case 'diagnosis':
                titleText = '셀프 인테리어 자가진단 기능';
                updateBottomNav(-1);
                break;
            case 'chat':
                titleText = '전문가 코칭 (AI 훈대표)';
                updateBottomNav(3);
                break;
            case 'detail':
                titleText = '상세 정보 제공 기능';
                updateBottomNav(-1);
                break;
        }
        
        titleElement.innerText = titleText + '\n(준비 중)';
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
    
    document.getElementById('res-problem').innerText = problemMap[state.selectedProblem] || '진단 필요';
    document.getElementById('res-space').innerText = projectState.spaces.length > 0 ? projectState.spaces.join(', ') : '-';
    document.getElementById('res-budget').innerText = projectState.budget || '-';
    document.getElementById('res-self').innerText = projectState.selfLevel || '-';

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
    
    recoBox.innerHTML = recoHtml;
    
    // MVP 15단계: 수익화 CTA 동적 노출
    const ctaContainer = document.getElementById('analysis-monetize-cta');
    if(warnings.length > 0 || riskDifficulty === '어려움') {
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
    
    // 현재 작성중인 데이터에 저장 상태 반영
    projectState.projectName = nameInput;
    projectState.status = statusInput;
    projectState.lastModified = Date.now();
    projectState.selectedProblem = state.selectedProblem; // 동기화
    
    if(!projectState.projectId) {
        projectState.projectId = 'proj_' + Date.now() + Math.floor(Math.random()*1000);
    }
    
    // LocalStorage 저장 처리
    let projects = JSON.parse(localStorage.getItem('selin_projects') || '[]');
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
});
