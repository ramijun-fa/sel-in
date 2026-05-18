# 셀인케어 (Sel-In Care)
> 셀프 인테리어 실행 플랫폼 — AI 기반 문제 진단부터 공정 관리, 전문가 코칭까지

---

## 🛠 프로젝트 소개

혼자 집을 고치다가 실수하는 분들을 위한 **셀프 인테리어 가이드 플랫폼**입니다.  
문제를 선택하면 AI가 위험도를 분석하고, 맞춤 공정 순서와 자재 수량, 예상 비용까지 자동으로 계산해 드립니다.

### ✅ 구현된 주요 기능 (15단계 MVP)

| 단계 | 기능 |
|------|------|
| 1~4 | 현장 문제 선택 → 진단 설문 → 예산/목표 설정 |
| 5 | 위험도 분석 리포트 (Rule-based AI) |
| 6 | 맞춤 시공 공정 타임라인 |
| 7 | 자재 수량 자동 계산기 |
| 8 | 예상 비용 계산기 |
| 9 | 공정 위험도 검증 시스템 |
| 10 | 현장 실행 모드 체크리스트 |
| 11 | 전문가 코칭 신청 |
| 12 | 필요 서류 생성 및 인쇄/PDF |
| 13 | 프로젝트 저장 및 목록 관리 (localStorage) |
| 14 | 관리자 코칭 신청 대시보드 (`/admin.html`) |
| 15 | 수익화 CTA 연결 구조 |

---

## 🚀 로컬 실행 방법

### 1. 저장소 클론
```bash
git clone <your-repo-url>
cd sel-in
```

### 2. 의존성 설치
```bash
npm install
```

### 3. 개발 서버 실행
```bash
npm run dev
```
브라우저에서 `http://localhost:5173` 접속

- 메인 앱: `http://localhost:5173/`
- 관리자 대시보드: `http://localhost:5173/admin.html`

---

## 📦 배포용 빌드

```bash
npm run build
```

`dist/` 폴더에 배포용 파일이 생성됩니다.

### 빌드 결과 확인 (로컬 미리보기)
```bash
npm run preview
```

---

## 🌐 배포 방법

### GitHub Pages
```bash
# dist 폴더를 gh-pages 브랜치로 배포
npm install -D gh-pages
npx gh-pages -d dist
```

### Firebase Hosting
```bash
npm install -g firebase-tools
firebase login
firebase init hosting   # public directory: dist
npm run build
firebase deploy
```

### Netlify
- [Netlify](https://www.netlify.com) 접속 → `dist` 폴더 드래그 & 드롭 배포
- 또는 GitHub 연동 후 자동 배포 설정:
  - Build command: `npm run build`
  - Publish directory: `dist`

---

## 📁 프로젝트 구조

```
sel-in/
├── index.html        # 메인 앱 (사용자 화면)
├── admin.html        # 관리자 대시보드
├── app.js            # 메인 앱 로직 (라우팅, 상태 관리, 모든 기능)
├── admin.js          # 관리자 대시보드 로직
├── style.css         # 전체 공통 스타일
├── vite.config.js    # Vite 빌드 설정
└── package.json      # 프로젝트 설정 및 스크립트
```

---

## 💾 데이터 저장 구조 (localStorage)

| 키 | 내용 |
|----|------|
| `selin_projects` | 저장된 프로젝트 목록 배열 |
| `selin_coaching_requests` | 코칭 신청 내역 (관리자 확인용) |

> ⚠️ 현재는 `localStorage` 기반 MVP입니다. 추후 Firebase / Supabase로 교체 가능한 구조로 설계되어 있습니다.

---

## 🔮 향후 개선 계획

- [ ] Firebase 인증 및 Firestore DB 연동
- [ ] 토스페이먼츠 결제 모듈 연동
- [ ] GPT Vision API 연동 (사진 자동 분석)
- [ ] 카카오 알림톡 발송 연동
- [ ] 관리자 로그인 권한 처리
