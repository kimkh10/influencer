프로젝트 설정 상태를 점검하고 누락된 부분을 안내합니다.

다음 항목을 순서대로 확인하세요:

1. **Vercel CLI**: `vercel --version` 실행하여 설치 여부 확인. 없으면 `npm i -g vercel && vercel login` 안내.
2. **index.html 존재 여부**: 파일이 있는지 확인.
3. **vercel.json 설정**: `buildCommand`가 `""`이고 `outputDirectory`가 `"."`인지 확인.
4. **배포 상태**: `vercel inspect` 실행하여 마지막 배포 상태 확인. 배포된 적 없으면 `vercel --yes --prod` 실행 제안.

점검 결과를 요약해서 사용자에게 알려주세요. 문제가 있으면 해결 방법을 안내하세요.
