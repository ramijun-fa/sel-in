// admin.js - MVP 14단계: 관리자 코칭 및 문의 관리 스크립트

// ==========================================
// MVP 관리자 접근 제한 (추후 Firebase Auth로 교체 예정)
// ==========================================
const ADMIN_PASSWORD = 'selin2026!'; // TODO: 실서비스 시 서버 인증으로 교체
const SESSION_KEY = 'selin_admin_session';

function checkAdminAuth() {
    const session = sessionStorage.getItem(SESSION_KEY);
    if (session === 'authenticated') return true;

    const input = prompt('관리자 비밀번호를 입력하세요:');
    if (input === ADMIN_PASSWORD) {
        sessionStorage.setItem(SESSION_KEY, 'authenticated');
        return true;
    }

    document.body.innerHTML = `
        <div style="display:flex; align-items:center; justify-content:center; height:100vh; font-family:sans-serif; flex-direction:column; gap:16px;">
            <h2 style="color:#c53030;">⛔ 접근 권한이 없습니다</h2>
            <p style="color:#666;">관리자 전용 페이지입니다.</p>
            <button onclick="location.reload()" style="padding:10px 20px; background:#2b6cb0; color:white; border:none; border-radius:6px; cursor:pointer;">다시 시도</button>
        </div>`;
    return false;
}

let requestsData = [];
let currentReqId = null;

document.addEventListener("DOMContentLoaded", () => {
    if (!checkAdminAuth()) return; // 인증 실패 시 이후 코드 실행 안 함
    loadRequests();
    renderList();
});

function loadRequests() {
    const raw = localStorage.getItem('selin_coaching_requests');
    if (raw) {
        requestsData = JSON.parse(raw);
        // 최신순 정렬
        requestsData.sort((a, b) => new Date(b.date) - new Date(a.date));
    } else {
        requestsData = [];
    }
}

function saveRequests() {
    localStorage.setItem('selin_coaching_requests', JSON.stringify(requestsData));
}

function renderList() {
    const listEl = document.getElementById('admin-req-list');
    listEl.innerHTML = '';
    
    if (requestsData.length === 0) {
        listEl.innerHTML = '<div style="padding:20px; text-align:center; color:#999;">접수된 코칭 신청이 없습니다.</div>';
        return;
    }
    
    requestsData.forEach(req => {
        const d = new Date(req.date);
        const dateStr = `${d.getMonth()+1}/${d.getDate()} ${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`;
        
        let sClass = 'status-접수';
        if(req.status.includes('확인')) sClass = 'status-확인';
        else if(req.status.includes('답변')) sClass = 'status-답변';
        else if(req.status.includes('예약')) sClass = 'status-예약';
        else if(req.status.includes('종료')) sClass = 'status-종료';
        
        const typeStr = req.projectData?.coachingRequest?.type === 'video' ? '화상 코칭' : 
                        (req.projectData?.coachingRequest?.type === 'report' ? '리포트' : '사진 검토');
        
        const div = document.createElement('div');
        div.className = `admin-list-item ${currentReqId === req.id ? 'active' : ''}`;
        div.onclick = () => selectRequest(req.id);
        
        div.innerHTML = `
            <div style="display:flex; justify-content:space-between; margin-bottom:5px;">
                <strong style="color:#2c3e50;">${req.projectData?.coachingRequest?.phone || '연락처 미상'}</strong>
                <span class="status-badge ${sClass}">${req.status}</span>
            </div>
            <div style="font-size:0.85rem; color:#666;">
                유형: ${typeStr}<br>
                접수일: ${dateStr}
            </div>
        `;
        listEl.appendChild(div);
    });
}

function selectRequest(id) {
    currentReqId = id;
    renderList(); // 활성 상태 업데이트
    
    const req = requestsData.find(r => r.id === id);
    if(!req) return;
    
    renderDetail(req);
}

function renderDetail(req) {
    const detailEl = document.getElementById('admin-detail-view');
    const p = req.projectData;
    const c = p.coachingRequest || {};
    
    const typeStr = c.type === 'video' ? '화상 코칭' : (c.type === 'report' ? '공정 검토 리포트' : '사진 검토 코칭');
    const methodStr = c.contactMethod === 'kakao' ? '카카오톡' : '전화';
    
    const problemMap = {
        'mold': '곰팡이 해결', 'condensation': '결로 해결', 'insulation': '단열 개선',
        'bathroom': '욕실 보수', 'floor': '장판/바닥 교체', 'wall': '벽체/도배/페인트',
        'full': '전체 리모델링', 'unknown': '미정'
    };
    const problemStr = problemMap[p.selectedProblem] || '미정';
    
    const spaces = p.spaces && p.spaces.length > 0 ? p.spaces.join(', ') : '-';
    const symptoms = p.symptoms && p.symptoms.length > 0 ? p.symptoms.join(', ') : '-';
    const conditions = p.conditions && p.conditions.length > 0 ? p.conditions.join(', ') : '-';
    const plan = p.validationPlan && p.validationPlan.length > 0 ? p.validationPlan.join(', ') : '-';
    
    // 첨부 사진 렌더링
    let photoHtml = '<div class="photo-grid">';
    if (c.photos && c.photos.length > 0) {
        c.photos.forEach(file => {
            photoHtml += `<div class="photo-item"><i class="fa-solid fa-image"></i><br>${file}</div>`;
        });
    } else {
        photoHtml += '<div style="color:#999; font-size:0.9rem;">첨부된 사진이 없습니다.</div>';
    }
    photoHtml += '</div>';

    detailEl.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px; padding-bottom:20px; border-bottom:2px solid #2b6cb0;">
            <h2 style="margin:0;"><i class="fa-solid fa-file-invoice"></i> 신청 상세 정보</h2>
            <div style="display:flex; gap:10px; align-items:center;">
                <label style="font-weight:bold;">상태 변경:</label>
                <select class="admin-select" id="status-select" onchange="updateStatus('${req.id}', this.value)">
                    <option value="접수" ${req.status==='접수'?'selected':''}>접수</option>
                    <option value="확인 중" ${req.status==='확인 중'?'selected':''}>확인 중</option>
                    <option value="답변 완료" ${req.status==='답변 완료'?'selected':''}>답변 완료</option>
                    <option value="상담 예약" ${req.status==='상담 예약'?'selected':''}>상담 예약</option>
                    <option value="종료" ${req.status==='종료'?'selected':''}>종료</option>
                </select>
            </div>
        </div>

        <div class="detail-section">
            <h3>1. 신청자 및 요구사항</h3>
            <div class="detail-grid">
                <div class="detail-label">신청 상품</div><div>${typeStr} (결제예정: ${c.price?.toLocaleString()}원)</div>
                <div class="detail-label">연락처</div><div>${c.phone || '-'} (희망방식: ${methodStr})</div>
                <div class="detail-label">접수일시</div><div>${new Date(req.date).toLocaleString('ko-KR')}</div>
            </div>
            <div style="margin-top:12px;">
                <div class="detail-label" style="margin-bottom:8px;">고객 질문 사항:</div>
                <div style="background:#f7fafc; padding:15px; border-radius:8px; border:1px solid #e2e8f0; line-height:1.5;">
                    ${c.question ? c.question.replace(/\n/g, '<br>') : '<span style="color:#999;">입력된 질문이 없습니다.</span>'}
                </div>
            </div>
        </div>

        <div class="detail-section">
            <h3>2. 첨부 사진</h3>
            ${photoHtml}
        </div>

        <div class="detail-section">
            <h3>3. 현장 기본 정보</h3>
            <div class="detail-grid">
                <div class="detail-label">시공 목적</div><div>${problemStr}</div>
                <div class="detail-label">예산 범위</div><div>${p.budget || '-'}</div>
                <div class="detail-label">건물 상태</div><div>${p.housingType || '-'} / ${p.buildingState || '-'}</div>
                <div class="detail-label">시공 공간</div><div>${spaces}</div>
                <div class="detail-label">현재 증상</div><div>${symptoms}</div>
                <div class="detail-label">현장 조건</div><div>${conditions}</div>
                <div class="detail-label">시공 경험</div><div>${p.experience || '-'}</div>
            </div>
        </div>

        <div class="detail-section">
            <h3>4. 고객 계획 및 진행 상황</h3>
            <div class="detail-grid">
                <div class="detail-label">계획한 공정</div><div>${plan}</div>
                <div class="detail-label">실행률</div><div>${p.execution?.progress || 0}% 완료됨</div>
                <div class="detail-label">예상 총비용</div><div>${(p.estimate?.totalCost || 0).toLocaleString()}원 산출됨</div>
            </div>
        </div>

        <div class="detail-section" style="border-bottom:none;">
            <h3><i class="fa-solid fa-pen-to-square"></i> 관리자 메모</h3>
            <p style="font-size:0.85rem; color:#666; margin:0 0 8px 0;">이 고객의 상담 진행 상황이나 특이사항을 기록하세요. (자동 저장됨)</p>
            <textarea class="admin-textarea" id="admin-memo" placeholder="메모를 입력하세요..." 
                      oninput="debounceSaveMemo('${req.id}', this.value)">${req.adminMemo || ''}</textarea>
        </div>
    `;
}

function updateStatus(id, newStatus) {
    const req = requestsData.find(r => r.id === id);
    if(req) {
        req.status = newStatus;
        saveRequests();
        renderList();
        
        // alert 띄워서 관리자에게 피드백
        const toast = document.createElement('div');
        toast.innerText = '상태가 업데이트되었습니다.';
        toast.style.cssText = 'position:fixed; bottom:20px; right:20px; background:#2f855a; color:white; padding:10px 20px; border-radius:8px; z-index:9999; font-weight:bold;';
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 2000);
    }
}

let memoTimer;
function debounceSaveMemo(id, text) {
    clearTimeout(memoTimer);
    memoTimer = setTimeout(() => {
        const req = requestsData.find(r => r.id === id);
        if(req) {
            req.adminMemo = text;
            saveRequests();
        }
    }, 500); // 0.5초 디바운스
}

// type="module" 환경 대응: window에 전역 함수 바인딩
Object.assign(window, {
    selectRequest,
    updateStatus,
    debounceSaveMemo,
});
