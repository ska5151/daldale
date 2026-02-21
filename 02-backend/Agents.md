# 참고

- `02-backend` 폴더는 백엔드 개발 및 관련 에이전트 구현에 필요한 환경 설정과 소스 코드를 포함하고 있습니다.
- http://localhost:5000 에서 실행된다.

## 프로젝트 구조 (Node.js + Express)

- `src/index.js`: 메인 엔트리 포인트
- `src/config/db.js`: 데이터베이스 연결 설정 (MySQL2)
- `src/routes/`: API 라우트 정의 (예: authRoutes.js)
- `src/controllers/`: 비즈니스 로직 처리 (예: authController.js)
- `.env`: 환경 변수 설정 (DB 접속 정보 등)

## 실행 방법

1. 의존성 설치: `npm install`
2. 개발 서버 실행: `npm run dev` (nodemon 사용)
3. 프로덕션 실행: `npm start`

## 주요 API Endpoint

- `POST /api/auth/login`: 로그인
- `POST /api/auth/register`: 회원가입