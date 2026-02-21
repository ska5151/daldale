const pool = require('../config/db');

// Helper to format date as YYYY-MM
const getYearMonth = (year, month) => {
    const y = year || new Date().getFullYear();
    const m = month || (new Date().getMonth() + 1);
    return `${y}-${String(m).padStart(2, '0')}`;
};

// Get Dashboard Summary (Total, Paid, Remaining)
exports.getDashboardSummary = async (req, res) => {
    try {
        const { user_id, year, month } = req.query;
        if (!user_id) return res.status(400).json({ message: 'User ID required' });

        const yearMonth = getYearMonth(year, month);

        // Calculate summary based on fixed_expenses and history for specific month
        const query = `
            SELECT 
                COALESCE(SUM(fe.amount), 0) as total_amount,
                COALESCE(SUM(CASE WHEN h.is_paid = 1 THEN fe.amount ELSE 0 END), 0) as paid_amount
            FROM fixed_expenses fe
            LEFT JOIN fixed_expense_history h 
                ON fe.expense_id = h.expense_id AND h.year_month = ?
            WHERE fe.user_id = ?
        `;

        const [rows] = await pool.execute(query, [yearMonth, user_id]);
        const data = rows[0];

        const summary = {
            total_amount: Number(data.total_amount),
            paid_amount: Number(data.paid_amount),
            remaining_amount: Number(data.total_amount) - Number(data.paid_amount)
        };

        res.status(200).json(summary);
    } catch (error) {
        console.error('Error fetching dashboard summary:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get Payment Method Statistics (for charts)
exports.getPaymentStats = async (req, res) => {
    try {
        const { user_id, year, month } = req.query;
        if (!user_id) return res.status(400).json({ message: 'User ID required' });

        // Currently stats are just based on fixed_expenses definition, 
        // but arguably it should be based on paid/unpaid context if needed.
        // For now, let's keep it based on the defined expenses to show projected distribution.

        // Using the view created in SQL
        const query = 'SELECT * FROM dashboard_payment_stats_view WHERE user_id = ?';
        const [rows] = await pool.execute(query, [user_id]);

        res.status(200).json(rows);
    } catch (error) {
        console.error('Error fetching payment stats:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get Fixed Expense List with Status for specific Month
exports.getFixedExpenseList = async (req, res) => {
    try {
        const { user_id, year, month } = req.query;
        if (!user_id) return res.status(400).json({ message: 'User ID required' });

        const yearMonth = getYearMonth(year, month);

        const query = `
            SELECT 
                fe.*,
                COALESCE(h.is_paid, 0) as is_paid,
                h.paid_date,
                pm.name as payment_method_name,
                pm.color as payment_method_color
            FROM fixed_expenses fe
            LEFT JOIN fixed_expense_history h 
                ON fe.expense_id = h.expense_id AND h.year_month = ?
            LEFT JOIN payment_methods pm
                ON fe.payment_method_id = pm.payment_method_id
            WHERE fe.user_id = ?
            ORDER BY fe.payment_day ASC
        `;

        const [rows] = await pool.execute(query, [yearMonth, user_id]);
        res.status(200).json(rows);
    } catch (error) {
        console.error('Error fetching expense list:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Toggle Payment Status
exports.togglePaymentStatus = async (req, res) => {
    try {
        const { expense_id, year_month, is_paid } = req.body;

        if (!expense_id || !year_month) {
            return res.status(400).json({ message: 'Expense ID and YearMonth required' });
        }

        // Check if history exists
        // Use ON DUPLICATE KEY UPDATE to handle both insert and update
        // We need to fetch the amount from fixed_expenses to record it in history

        // Fetch expense first
        const [expense] = await pool.execute(
            'SELECT amount FROM fixed_expenses WHERE expense_id = ?',
            [expense_id]
        );

        if (expense.length === 0) {
            return res.status(404).json({ message: 'Expense not found' });
        }

        const amount = expense[0].amount;
        const isPaidVal = is_paid ? 1 : 0;

        // Use simple INSERT ... ON DUPLICATE KEY UPDATE
        // Escaping column names with backticks to be safe
        const query = `
            INSERT INTO \`fixed_expense_history\`
            (\`expense_id\`, \`year_month\`, \`is_paid\`, \`paid_date\`, \`amount\`)
            VALUES (?, ?, ?, NOW(), ?)
            ON DUPLICATE KEY UPDATE 
                \`is_paid\` = ?,
                \`paid_date\` = NOW(),
                \`amount\` = ?
        `;

        console.log('togglePaymentStatus Params:', { expense_id, year_month, isPaidVal, amount });

        await pool.execute(query, [
            expense_id, year_month, isPaidVal, amount,
            isPaidVal, amount
        ]);

        res.status(200).json({ message: 'Status updated' });

    } catch (error) {
        console.error('Error updating payment status:', error);
        res.status(500).json({ message: 'Server error: ' + error.message });
    }
};
