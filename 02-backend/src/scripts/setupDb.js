const pool = require('../config/db');

async function setupDatabase() {
    try {
        console.log('Starting database setup...');
        // Use pool.execute for better preparation/safety or pool.query

        // 0. Drop existing tables (Reverse order)
        console.log('Dropping existing tables to ensure schema consistency...');
        await pool.query('DROP VIEW IF EXISTS dashboard_summary_view');
        await pool.query('DROP VIEW IF EXISTS dashboard_payment_stats_view');
        await pool.query('DROP TABLE IF EXISTS fixed_expenses');
        await pool.query('DROP TABLE IF EXISTS categories');
        await pool.query('DROP TABLE IF EXISTS payment_methods');
        await pool.query('DROP TABLE IF EXISTS users');

        // 1. Users Table
        console.log('Creating Users table...');
        await pool.query(`
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
        `);

        // 1.5 Insert Test User
        console.log('Seeding Test User...');
        await pool.query(`
            INSERT INTO users (user_id, password, email, nickname, theme, notification_enabled)
            VALUES ('test_user', 'password123', 'test@daldale.com', '테스트유저', 'dark', true);
        `);

        // 2. Categories Table
        console.log('Creating Categories table...');
        await pool.query(`
            CREATE TABLE categories (
                category_id INT AUTO_INCREMENT PRIMARY KEY COMMENT '카테고리 ID',
                user_id VARCHAR(50) NOT NULL COMMENT '사용자 ID (FK)',
                name VARCHAR(50) NOT NULL COMMENT '카테고리명 (예: 식비, 월세)',
                type ENUM('INCOME', 'EXPENSE') NOT NULL COMMENT '유형 (수입/지출)',
                sort_order INT DEFAULT 0 COMMENT '정렬 순서',
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
            ) COMMENT '수입/지출 카테고리';
        `);

        // Seed Categories
        console.log('Seeding Categories...');
        const defaultCats = ['식비', '교통비', '통신비', '주거비', '구독료'];
        for (let i = 0; i < defaultCats.length; i++) {
            await pool.query('INSERT INTO categories (user_id, name, type, sort_order) VALUES (?, ?, ?, ?)',
                ['test_user', defaultCats[i], 'EXPENSE', i]);
        }

        // 3. Payment Methods Table
        console.log('Creating Payment Methods table...');
        await pool.query(`
            CREATE TABLE payment_methods (
                payment_method_id INT AUTO_INCREMENT PRIMARY KEY COMMENT '결제 수단 ID',
                user_id VARCHAR(50) NOT NULL COMMENT '사용자 ID (FK)',
                name VARCHAR(50) NOT NULL COMMENT '결제 수단명 (예: 삼성카드, 우리은행)',
                type VARCHAR(20) COMMENT '유형 (CARD, BANK, CASH 등)',
                color VARCHAR(7) COMMENT '색상 코드 (예: #123456) - 대시보드 차트용',
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
            ) COMMENT '결제 수단 관리';
        `);

        // Seed Payment Methods
        console.log('Seeding Payment Methods...');
        const defaultMethods = [
            { name: '신한카드', type: 'CARD', color: '#3b82f6' },
            { name: '토스뱅크', type: 'BANK', color: '#10b981' },
            { name: '현금', type: 'CASH', color: '#f59e0b' }
        ];
        for (const method of defaultMethods) {
            await pool.query('INSERT INTO payment_methods (user_id, name, type, color) VALUES (?, ?, ?, ?)',
                ['test_user', method.name, method.type, method.color]);
        }

        // 4. Fixed Expenses Table
        console.log('Creating Fixed Expenses table...');
        await pool.query(`
            CREATE TABLE fixed_expenses (
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
        `);

        // 5. Views
        console.log('Creating Views...');
        await pool.query(`
            CREATE OR REPLACE VIEW dashboard_summary_view AS
            SELECT 
                e.user_id,
                SUM(e.amount) as total_amount,
                SUM(CASE WHEN e.payment_day <= DAY(CURRENT_DATE()) THEN e.amount ELSE 0 END) as paid_amount,
                SUM(CASE WHEN e.payment_day > DAY(CURRENT_DATE()) THEN e.amount ELSE 0 END) as remaining_amount
            FROM fixed_expenses e
            GROUP BY e.user_id;
        `);

        await pool.query(`
            CREATE OR REPLACE VIEW dashboard_payment_stats_view AS
            SELECT 
                fe.user_id,
                pm.name as payment_method_name, 
                pm.color as payment_method_color,
                SUM(fe.amount) as total_amount
            FROM fixed_expenses fe
            LEFT JOIN payment_methods pm ON fe.payment_method_id = pm.payment_method_id
            GROUP BY fe.user_id, pm.name, pm.color;
        `);

        console.log('Database setup complete!');
        process.exit(0);
    } catch (error) {
        console.error('Database setup failed:', error);
        process.exit(1);
    }
}

setupDatabase();
