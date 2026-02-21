const pool = require('../config/db');

// Create new expense
exports.createExpense = async (req, res) => {
    try {
        const { user_id, name, amount, payment_day, category_id, payment_method_id, memo } = req.body;

        // Basic validation
        if (!user_id || !name || !amount || !payment_day) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        const query = `
            INSERT INTO fixed_expenses 
            (user_id, name, amount, payment_day, category_id, payment_method_id, memo) 
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `;

        const [result] = await pool.execute(query, [user_id, name, amount, payment_day, category_id, payment_method_id, memo]);

        res.status(201).json({
            message: 'Expense created successfully',
            expenseId: result.insertId
        });
    } catch (error) {
        console.error('Error creating expense:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Update expense
exports.updateExpense = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, amount, payment_day, category_id, payment_method_id, memo } = req.body;

        const query = `
            UPDATE fixed_expenses 
            SET name = ?, amount = ?, payment_day = ?, category_id = ?, payment_method_id = ?, memo = ?
            WHERE expense_id = ?
        `;

        const [result] = await pool.execute(query, [name, amount, payment_day, category_id, payment_method_id, memo, id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Expense not found' });
        }

        res.status(200).json({ message: 'Expense updated successfully' });
    } catch (error) {
        console.error('Error updating expense:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Delete expense
exports.deleteExpense = async (req, res) => {
    try {
        const { id } = req.params;

        const query = 'DELETE FROM fixed_expenses WHERE expense_id = ?';
        const [result] = await pool.execute(query, [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Expense not found' });
        }

        res.status(200).json({ message: 'Expense deleted successfully' });
    } catch (error) {
        console.error('Error deleting expense:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get single expense (for editing)
exports.getExpenseById = async (req, res) => {
    try {
        const { id } = req.params;
        const query = 'SELECT * FROM fixed_expenses WHERE expense_id = ?';
        const [rows] = await pool.execute(query, [id]);

        if (rows.length === 0) {
            return res.status(404).json({ message: 'Expense not found' });
        }

        res.status(200).json(rows[0]);
    } catch (error) {
        console.error('Error fetching expense:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get all expenses for a user (optional utility)
exports.getExpensesByUser = async (req, res) => {
    try {
        const { user_id } = req.query; // Or get from auth middleware
        if (!user_id) return res.status(400).json({ message: 'User ID required' });

        const query = 'SELECT * FROM fixed_expenses WHERE user_id = ? ORDER BY payment_day ASC';
        const [rows] = await pool.execute(query, [user_id]);

        res.status(200).json(rows);
    } catch (error) {
        console.error('Error fetching expenses:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
