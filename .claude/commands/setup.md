# 프로젝트 초기 설정 가이드

사용자에게 프로젝트를 처음 설정하는 방법을 안내합니다.

## 안내 순서

### 1. Google Cloud 설정
1. [Google Cloud Console](https://console.cloud.google.com) 접속
2. 프로젝트 생성 (또는 기존 프로젝트 선택)
3. **API 및 서비스 → 라이브러리** → "Google Sheets API" 검색 → **사용** 클릭
4. **API 및 서비스 → 사용자 인증 정보** → **사용자 인증 정보 만들기 → API 키**
5. (권장) API 키 제한: Google Sheets API만 허용

### 2. 스프레드시트 설정
1. Google 스프레드시트에 공구 데이터 입력 (A~H 컬럼)
2. **공유 → 링크가 있는 모든 사용자 → 뷰어**로 설정

### 3. 실행
```bash
# 로컬 실행
open index.html
# 또는
npx serve .
```

### 4. Vercel 배포 (선택)
```bash
npm i -g vercel
vercel login
vercel --yes --prod
```

### 5. 사용
1. 페이지 상단에 API 키와 스프레드시트 URL 입력
2. **적용** 클릭
3. 캘린더 텍스트 편집 후 **이미지 저장**
