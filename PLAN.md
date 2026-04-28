# 인스타그램 공동구매 캘린더 프로젝트 플랜

## 목표
Google Spreadsheet에서 공동구매 데이터를 실시간으로 읽어와, 인스타그램에 올릴 수 있는 월간 캘린더 이미지(1080x1350, 4:5비율)를 생성하는 정적 웹페이지를 만들고 Vercel에 배포한다.

---

## 1. 사전 준비

### 1-1. Google Cloud 설정
- Google Cloud Console(console.cloud.google.com)에서 프로젝트 사용 (기존: `friendly-pharmacist`)
- Google Sheets API 활성화
- API 키 생성 (API 제한사항: Google Sheets API만 허용)
- API 키: `AIzaSyBnnMJtyktYEip_16MTi0bzXnDSrdeZw4Q`

### 1-2. 스프레드시트 설정
- 스프레드시트 ID: `1UA0pfXDs81mqnUuptdoFBe5yVAvCcz2oEPpRKinG90k`
- 시트 GID: `1120187522` (시트 이름: "Result 1")
- **공유 설정**: "링크가 있는 모든 사용자 - 뷰어"로 설정 (API 키로 읽기 위해 필수)

### 1-3. 스프레드시트 컬럼 구조 (A~H)
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

### 1-4. Vercel 설정
- Vercel CLI 설치: `npm i -g vercel`
- Vercel 로그인: `vercel login`
- 프로젝트 이름: `influencer`
- 배포 URL: `https://influencer-amber.vercel.app`

---

## 2. 프로젝트 구조

```
influencer/
├── index.html      ← 단일 HTML 파일 (전체 앱)
└── vercel.json      ← Vercel 정적 배포 설정
```

### vercel.json
```json
{
  "buildCommand": "",
  "outputDirectory": "."
}
```

**핵심**: React/Next.js/Vite 없이 순수 HTML + CSS + JavaScript 단일 파일로 구성. Vercel은 S3+CDN 용도의 정적 호스팅으로만 사용.

---

## 3. index.html 구현 명세

### 3-1. 외부 의존성 (CDN)
- **Google Fonts**: `Noto Sans KR` (본문), `Cormorant Garamond` (월 표시, italic serif)
- **html2canvas** v1.4.1: 캘린더를 PNG 이미지로 저장

### 3-2. 디자인 스펙

**캘린더 컨테이너**
- 크기: 1080px × 1350px (인스타그램 4:5)
- 배경: `#FFF9F7` (따뜻한 크림톤)
- 상단 장식: `linear-gradient(170deg, #F8CDC4 → #FFF9F7)` 320px 높이
- 우측 상단 원형 장식: `radial-gradient` 300px

**헤더 영역 (255px)**
- 월 숫자("04"): Cormorant Garamond, 260px, `rgba(232,150,140,0.16)`, 좌측 절대 배치
- 월 이름("April"): Cormorant Garamond italic, 82px, `#3A3A3A`
- 타이틀: Noto Sans KR 900, 44px, 로즈골드 그라데이션 텍스트
- 핸들: 18px, `#b5a8a4`

**요일 헤더**
- SUN~SAT, 12px, 700, `#b5a8a4`, letter-spacing 3px
- 하단 구분선: 양쪽 페이드 그라데이션 (핑크)

**주간 행**
- 날짜: 18px, `#c8bfbb`
- 공구 시작일: 22px, 800, `#E8968C` + 원형 배경(42px, 2px 테두리)
- 배지(HOT/품절대란템): 그라데이션 배경 알약형, 11px 흰색 텍스트
- 주간 구분선: 양쪽 페이드 `#EDDFDB`

**제품 카드**
- CSS Grid, 시작 요일 컬럼부터 다음 제품까지 span
- 썸네일: 88×88px, border-radius 12px, box-shadow
- 제품명: 19px, 800, `#2D2D2D`
- 설명: 13px, `#9a8e8a`, line-height 1.65

### 3-3. 인터랙션 기능

**인라인 편집 (contenteditable)**
편집 가능 요소:
- 월 숫자, 월 이름
- 캘린더 타이틀, 핸들
- 날짜 옆 배지 (HOT 등)
- 제품명, 제품 설명

편집 UX:
- hover: `box-shadow 0 0 0 2px rgba(232,150,140,0.25)`
- focus: `box-shadow 0 0 0 2px rgba(232,150,140,0.6)`
- 빈 설명: "설명 입력" placeholder (포커스 시 제거, 블러 시 복원)
- 빈 배지: `display: none`

**제품 클릭 → 판매 링크 이동**
- `data-link` 속성에 판매 URL 저장
- 클릭 시 `window.open(link, '_blank')` (텍스트 선택 중이면 무시)

**이미지 저장 (html2canvas)**
- "이미지 저장" 버튼 클릭
- 저장 전: blur, placeholder 제거, 빈 배지 숨김
- html2canvas scale: 2 (2160×2700 고화질)
- 저장 후: placeholder/배지 복원
- 다운로드 파일명: `공구캘린더.png`

### 3-4. 데이터 처리 로직

**Google Sheets API 호출 흐름**
1. `GET /v4/spreadsheets/{id}?key={apiKey}` → 시트 이름 확인 (GID 매칭)
2. `GET /v4/spreadsheets/{id}/values/{시트명}!A2:H1000?key={apiKey}` → 데이터 조회

**데이터 가공**
- 공구번호 기준 중복 제거 (같은 공구번호의 첫 번째 행만 사용)
- 시작일에서 일(day) 추출 → 캘린더 배치에 사용
- 첫 번째 제품의 시작일로 년/월 결정 → 해당 월 캘린더 생성

**캘린더 그리드 계산**
- `new Date(year, month, 1).getDay()` → 1일의 요일
- `new Date(year, month+1, 0).getDate()` → 해당 월 일수
- 주 단위로 7칸 배열 생성, 토요일(dow=6)이거나 월말이면 새 주

**제품명 매핑 (커스텀 짧은 이름)**
스프레드시트 타이틀 → 표시 이름:
- 프로바이오틱스 → 분홍이
- 비타민D → 제가 만든 비타민D
- 마그샷 → 마그샷 마그에이드
- 베르베린 → 베르베린 (엄선한 원료사)
- 오메가3 → 오메안비러유
- 디오스민 → 디오스민
- 칼마디 → 칼마디

**설명 매핑 (커스텀 태그라인)**
- 프로바이오틱스 → 인기템 깜짝공구 / 단 3일!
- 비타민D → 샤인머스캣 맛
- 마그샷 → 제가 배합 참여 / 레모나 맛 / 100% 유기산 마그네슘 액상!
- 베르베린 → 혈당과 체중 관리
- 오메가3 → 고품질 / 안비린 오메가 3
- 디오스민 → 먹는 압박스타킹! / 혈관 꽉 잡아주는 / 유명한 그 제품!
- 칼마디 → 부담없는 가격, / 속편한 칼마디

**배지 매핑**
- 프로바이오틱스 → HOT
- 비타민D → 품절대란템
- 오메가3 → HOT
- 나머지 → 없음 (편집 가능)

---

## 4. 배포

```bash
# 프로젝트 디렉토리에서
vercel --yes --prod
```

- 빌드 없음 (정적 HTML)
- vercel.json에서 `buildCommand: ""`, `outputDirectory: "."`로 설정
- 배포 완료 시 `https://influencer-amber.vercel.app` 에서 접근 가능

---

## 5. 운영 플로우

1. 스프레드시트에 새 달 공구 데이터 추가
2. `https://influencer-amber.vercel.app` 접속
3. 자동으로 최신 데이터 로드 → 캘린더 렌더링
4. 제품명/설명/배지/타이틀 등 인라인 편집
5. "이미지 저장" 클릭 → PNG 다운로드
6. 인스타그램에 업로드

---

## 6. 주의사항

- 스프레드시트는 반드시 **"링크가 있는 모든 사용자"** 공유 상태여야 함
- API 키가 HTML에 노출되므로, Google Cloud에서 API 키 제한사항을 설정 (Google Sheets API만, 특정 리퍼러만 허용 권장)
- 제품명/설명 매핑은 하드코딩되어 있으므로, 새로운 제품이 추가되면 코드 내 매핑 업데이트 필요
- html2canvas는 외부 이미지(썸네일) CORS 이슈가 있을 수 있음 → `crossorigin="anonymous"` 속성으로 대응
