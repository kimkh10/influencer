# 인스타그램 공동구매 캘린더 & AI 스터디 플랫폼

## 목표
Google Spreadsheet 기반 공동구매 캘린더 이미지 생성기와 AI 그룹 스터디 운영 플랫폼을 Cloudflare Pages에 정적 배포한다.

---

## 1. 사전 준비

### 1-1. Google Cloud 설정
- Google Cloud Console에서 프로젝트 사용 (기존: `friendly-pharmacist`)
- Google Sheets API 활성화
- API 키 생성 (API 제한사항: Google Sheets API만 허용)

### 1-2. 스프레드시트 설정 (공동구매 캘린더)
- 스프레드시트 ID: `1UA0pfXDs81mqnUuptdoFBe5yVAvCcz2oEPpRKinG90k`
- 시트 GID: `1120187522` (시트 이름: "Result 1")
- **공유 설정**: "링크가 있는 모든 사용자 - 뷰어"

### 1-3. 스프레드시트 설정 (스터디 신청)
- 스프레드시트 ID: `1AIYdoyZ3gv1XhaXZweMWdeWwK99qDkSra2mHRVDXrZY`
- Google Apps Script로 폼 데이터 저장

### 1-4. 스프레드시트 컬럼 구조 (A~H, 공동구매)
| 컬럼 | 내용 |
|------|------|
| A | 공구번호 |
| B | 공구타이틀 |
| C | 상품명 |
| D | 공구시작일시 (예: 2026-04-06 00:00:00.000000 +09:00) |
| E | 공구종료 일시 |
| F | 판매링크 (네이버/자사몰 URL) |
| G | 공구 상태코드 (Y0=진행중, Y8=종료, T8=예정) |
| H | 썸네일이미지 URL |

### 1-5. Cloudflare Pages 설정
- Wrangler CLI 설치: `npm i -g wrangler`
- 프로젝트명: `influencer`
- 프로덕션 URL: https://influencer-p68.pages.dev

---

## 2. 프로젝트 구조

```
influencer/
├── index.html              ← 공동구매 캘린더 (메인 앱)
├── study.html              ← AI 스터디 신청 폼
├── study-admin.html        ← 스터디 관리자 대시보드
├── study-curriculum.html   ← 스터디 커리큘럼 안내 페이지
├── CLAUDE.md               ← Claude Code 설정
├── PLAN.md                 ← 이 파일
└── README.md               ← 프로젝트 소개
```

**핵심**: 프레임워크/빌드 도구 없이 순수 HTML + CSS + JavaScript 단일 파일로 구성. Cloudflare Pages는 정적 호스팅으로만 사용.

---

## 3. 페이지별 구현 명세

### 3-1. index.html (공동구매 캘린더)

**외부 의존성 (CDN)**
- Google Fonts: `Noto Sans KR` (본문), `Cormorant Garamond` (월 표시, italic serif)
- html2canvas v1.4.1: 캘린더를 PNG 이미지로 저장

**디자인 스펙**
- 캘린더: 1080px × 1350px (인스타그램 4:5)
- 배경: `#FFF9F7` (따뜻한 크림톤)
- 상단 장식: `linear-gradient(170deg, #F8CDC4 → #FFF9F7)` 320px 높이
- 테마 색상은 CSS 변수 `--accent`, `--accent-hex`로 관리

**인터랙션**
- contenteditable로 제품명/설명/배지/타이틀 인라인 편집
- 제품 클릭 → 판매 링크 이동 (`data-link` 속성)
- html2canvas scale: 2 (2160×2700 고화질) PNG 다운로드

**데이터 처리**
- Google Sheets API v4로 데이터 조회
- 공구번호 기준 중복 제거
- 시작일 기준 캘린더 그리드 배치

### 3-2. study.html (스터디 신청 폼)
- AI 그룹 스터디 참가 신청서
- Google Apps Script `doPost`로 스프레드시트에 데이터 저장
- `mode: 'no-cors'` fetch로 크로스 오리진 POST
- Apps Script URL은 localStorage(`study_script_url`)에 저장

### 3-3. study-admin.html (관리자 대시보드)
- Google Sheets API로 신청자 목록 조회
- Apps Script 코드 템플릿 제공 (SHEET_ID, SHEET_NAME 설정)
- 설정 탭에서 API 키, 스프레드시트 URL, Apps Script URL 관리

### 3-4. study-curriculum.html (커리큘럼 페이지)
- 4주 AI 스터디 커리큘럼 안내
- 운영 구조: 호스트 3명 + 게스트 6명 (최대 9명)
- 방식: 오프라인 1시간 미팅 (Q&A + 과제 플래닝) + 과제 수행
- Week 1: 환경 세팅 + 프로젝트 다운로드/실행/배포
- Week 2: AI 이미지 생성 & 콘텐츠 제작
- Week 3: 공동구매 캘린더 & 데이터 시각화
- Week 4: 최종 발표 & 네트워킹
- 하단 CTA → study.html 신청 폼 연결

---

## 4. 배포

```bash
# Cloudflare Pages
CLOUDFLARE_API_TOKEN=<토큰> wrangler pages deploy . --project-name=influencer --commit-dirty=true
```

- 빌드 없음 (정적 HTML)
- 프로덕션 URL: https://influencer-p68.pages.dev

---

## 5. 운영 플로우

### 공동구매 캘린더
1. 스프레드시트에 새 달 공구 데이터 추가
2. https://influencer-p68.pages.dev 접속
3. 자동으로 최신 데이터 로드 → 캘린더 렌더링
4. 제품명/설명/배지/타이틀 등 인라인 편집
5. "이미지 저장" 클릭 → PNG 다운로드
6. 인스타그램에 업로드

### AI 스터디
1. https://influencer-p68.pages.dev/study-curriculum 에서 커리큘럼 확인
2. https://influencer-p68.pages.dev/study 에서 신청
3. https://influencer-p68.pages.dev/study-admin 에서 관리자가 신청자 관리

---

## 6. 주의사항

- 스프레드시트는 반드시 **"링크가 있는 모든 사용자"** 공유 상태여야 함
- API 키가 HTML에 노출되므로, Google Cloud에서 API 키 제한사항 설정 권장
- html2canvas는 외부 이미지 CORS 이슈 → canvas/fetch/corsproxy.io 3단계 변환으로 대응
- `contenteditable` 요소에는 반드시 `spellcheck="false"` 포함
- html2canvas `createPattern` 0크기 에러 방지를 위해 monkey-patch 적용
