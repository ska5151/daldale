-- 03-frontend/screen/02. add.md 참고
-- 고정지출 항목 테이블 정의
-- 이 테이블은 사용자가 등록한 매월 고정지출 항목을 저장합니다.

CREATE TABLE IF NOT EXISTS fixed_expenses (
    expense_id INT AUTO_INCREMENT PRIMARY KEY COMMENT '고정지출 ID',
    user_id VARCHAR(50) NOT NULL COMMENT '사용자 ID (FK)',
    name VARCHAR(100) NOT NULL COMMENT '지출 항목명 (예: 넷플릭스, 월세)',
    amount DECIMAL(15, 2) NOT NULL COMMENT '금액',
    payment_day INT NOT NULL COMMENT '결제일 (1~31)',
    category_id INT COMMENT '카테고리 ID (FK)',
    payment_method_id INT COMMENT '결제 수단 ID (FK)',
    memo TEXT COMMENT '메모',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES categories(category_id) ON DELETE SET NULL,
    FOREIGN KEY (payment_method_id) REFERENCES payment_methods(payment_method_id) ON DELETE SET NULL
) COMMENT '매월 발생하는 고정지출 항목';
