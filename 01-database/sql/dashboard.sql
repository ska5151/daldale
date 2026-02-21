-- 03-frontend/screen/01. dashboard.md 참고

-- 대시보드 화면은 주로 조회용 쿼리나 뷰를 사용합니다.
-- 필요한 데이터:
-- 1. 월별 고정지출 총액 (Total Expenses)
-- 2. 지출 완료 금액 (Paid Amount) - 현재 날짜 기준 결제일 지남 여부 판단 필요
-- 3. 남은 지출 금액 (Remaining Amount)
-- 4. 결제 수단별 지출 비중 (Payment Method Stats)


-- 월별 고정지출 납부 이력 테이블 (실제 지출 여부 체크)
CREATE TABLE IF NOT EXISTS fixed_expense_history (
    history_id INT AUTO_INCREMENT PRIMARY KEY COMMENT '이력 ID',
    expense_id INT NOT NULL COMMENT '고정지출 ID (FK)',
    `year_month` CHAR(7) NOT NULL COMMENT '대상 월 (YYYY-MM)',
    is_paid BOOLEAN DEFAULT FALSE COMMENT '지출 완료 여부',
    paid_date DATETIME COMMENT '지출 일시',
    amount DECIMAL(15, 2) COMMENT '실제 지출 금액',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (expense_id) REFERENCES fixed_expenses(expense_id) ON DELETE CASCADE,
    UNIQUE KEY unique_history (expense_id, `year_month`)
) COMMENT '월별 고정지출 납부 내역관리';

-- 월별 지출 요약 뷰
-- 월별 지출 요약 뷰 (현재 월 기준)
CREATE OR REPLACE VIEW dashboard_summary_view AS
SELECT 
    e.user_id,
    COALESCE(SUM(e.amount), 0) as total_amount,
    COALESCE(SUM(CASE WHEN h.is_paid = 1 THEN e.amount ELSE 0 END), 0) as paid_amount,
    COALESCE(SUM(e.amount) - SUM(CASE WHEN h.is_paid = 1 THEN e.amount ELSE 0 END), 0) as remaining_amount
FROM fixed_expenses e
LEFT JOIN fixed_expense_history h 
    ON e.expense_id = h.expense_id 
    AND h.year_month = DATE_FORMAT(NOW(), '%Y-%m')
GROUP BY e.user_id;

-- 결제 수단별 통계 뷰
CREATE OR REPLACE VIEW dashboard_payment_stats_view AS
SELECT 
    fe.user_id,
    pm.name as payment_method_name, 
    pm.color as payment_method_color,
    SUM(fe.amount) as total_amount
FROM fixed_expenses fe
LEFT JOIN payment_methods pm ON fe.payment_method_id = pm.payment_method_id
GROUP BY fe.user_id, pm.name, pm.color;
