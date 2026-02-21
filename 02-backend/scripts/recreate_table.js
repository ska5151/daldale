
const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const dbConfig = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
};

(async () => {
    let connection;
    try {
        connection = await mysql.createConnection(dbConfig);
        console.log('Connected.');

        console.log('Dropping table fixed_expense_history...');
        await connection.execute('DROP TABLE IF EXISTS `fixed_expense_history`');

        console.log('Creating table fixed_expense_history...');
        // Using backticks for all identifiers to be safe
        const sql = `
            CREATE TABLE \`fixed_expense_history\` (
                \`history_id\` INT AUTO_INCREMENT PRIMARY KEY COMMENT 'History ID',
                \`expense_id\` INT NOT NULL COMMENT 'Fixed Expense ID (FK)',
                \`year_month\` CHAR(7) NOT NULL COMMENT 'Target Month (YYYY-MM)',
                \`is_paid\` TINYINT(1) DEFAULT 0 COMMENT 'Payment Status',
                \`paid_date\` DATETIME COMMENT 'Payment Date',
                \`amount\` DECIMAL(15, 2) COMMENT 'Actual Paid Amount',
                \`created_at\` DATETIME DEFAULT CURRENT_TIMESTAMP,
                \`updated_at\` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (\`expense_id\`) REFERENCES \`fixed_expenses\`(\`expense_id\`) ON DELETE CASCADE,
                UNIQUE KEY \`unique_history\` (\`expense_id\`, \`year_month\`)
            ) COMMENT 'Monthly Fixed Expense Payment History';
        `;

        await connection.execute(sql);
        console.log('Table fixed_expense_history recreated successfully.');

    } catch (err) {
        console.error('Error:', err);
    } finally {
        if (connection) await connection.end();
    }
})();
