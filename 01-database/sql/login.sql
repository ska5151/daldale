-- 02-backend/screen/00. login.md 참고
-- 03-frontend/screen/00. login.md 참고
-- 사용자(회원) 정보를 저장하는 테이블 생성
CREATE TABLE users (
    user_id VARCHAR(50) NOT NULL COMMENT '아이디',
    password VARCHAR(255) NOT NULL COMMENT '패스워드',
    email VARCHAR(100) NOT NULL COMMENT '이메일',
    nickname VARCHAR(50) COMMENT '닉네임',
    profile_image VARCHAR(255) COMMENT '프로필 이미지 URL',
    theme VARCHAR(20) DEFAULT 'system' COMMENT '테마 (system, light, dark)',
    notification_enabled BOOLEAN DEFAULT TRUE COMMENT '알림 활성화 여부',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '가입일시',
    PRIMARY KEY (user_id)
) COMMENT '사용자 정보';
