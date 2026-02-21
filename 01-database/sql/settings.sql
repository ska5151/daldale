-- 03-frontend/screen/03.settings.md 참고

-- 카테고리 테이블 (수입/지출 카테고리 관리)
CREATE TABLE IF NOT EXISTS categories (
    category_id INT AUTO_INCREMENT PRIMARY KEY COMMENT '카테고리 ID',
    user_id VARCHAR(50) NOT NULL COMMENT '사용자 ID (FK)',
    name VARCHAR(50) NOT NULL COMMENT '카테고리명 (예: 식비, 월세)',
    type ENUM('INCOME', 'EXPENSE') NOT NULL COMMENT '유형 (수입/지출)',
    sort_order INT DEFAULT 0 COMMENT '정렬 순서',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
) COMMENT '수입/지출 카테고리';

-- 결제 수단 테이블 (자산 설정)
CREATE TABLE IF NOT EXISTS payment_methods (
    payment_method_id INT AUTO_INCREMENT PRIMARY KEY COMMENT '결제 수단 ID',
    user_id VARCHAR(50) NOT NULL COMMENT '사용자 ID (FK)',
    name VARCHAR(50) NOT NULL COMMENT '결제 수단명 (예: 삼성카드, 우리은행)',
    type VARCHAR(20) COMMENT '유형 (CARD, BANK, CASH 등)',
    color VARCHAR(7) COMMENT '색상 코드 (예: #123456) - 대시보드 차트용',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
) COMMENT '결제 수단 관리';
