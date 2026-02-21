const pool = require('../config/db');

// --- Categories ---

exports.getCategories = async (req, res) => {
    try {
        const { user_id } = req.query; // Assume user_id is passed
        if (!user_id) return res.status(400).json({ message: 'User ID required' });

        const query = 'SELECT * FROM categories WHERE user_id = ? ORDER BY sort_order ASC, name ASC';
        const [rows] = await pool.execute(query, [user_id]);
        res.status(200).json(rows);
    } catch (error) {
        console.error('Error fetching categories:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.createCategory = async (req, res) => {
    try {
        const { user_id, name, type, sort_order } = req.body;
        console.log('Creating Category:', req.body); // Debug log

        if (!user_id || !name) {
            console.error('Missing user_id or name');
            return res.status(400).json({ message: 'User ID and Name are required' });
        }

        const query = 'INSERT INTO categories (user_id, name, type, sort_order) VALUES (?, ?, ?, ?)';
        const [result] = await pool.execute(query, [user_id, name, type || 'EXPENSE', sort_order || 0]);
        res.status(201).json({ id: result.insertId, message: 'Category created' });
    } catch (error) {
        console.error('Error creating category:', error); // detailed log
        res.status(500).json({ message: 'Server error: ' + error.message });
    }
};

exports.updateCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, type, sort_order } = req.body;
        const query = 'UPDATE categories SET name = ?, type = ?, sort_order = ? WHERE category_id = ?';
        const [result] = await pool.execute(query, [name, type, sort_order, id]);
        if (result.affectedRows === 0) return res.status(404).json({ message: 'Category not found' });
        res.status(200).json({ message: 'Category updated' });
    } catch (error) {
        console.error('Error updating category:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.deleteCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const query = 'DELETE FROM categories WHERE category_id = ?';
        const [result] = await pool.execute(query, [id]);
        if (result.affectedRows === 0) return res.status(404).json({ message: 'Category not found' });
        res.status(200).json({ message: 'Category deleted' });
    } catch (error) {
        console.error('Error deleting category:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.updateCategoryOrder = async (req, res) => {
    const connection = await pool.getConnection();
    try {
        const { categories } = req.body; // Array of { category_id, sort_order }

        await connection.beginTransaction();

        for (const cat of categories) {
            await connection.execute(
                'UPDATE categories SET sort_order = ? WHERE category_id = ?',
                [cat.sort_order, cat.category_id]
            );
        }

        await connection.commit();
        res.status(200).json({ message: 'Category order updated' });
    } catch (error) {
        await connection.rollback();
        console.error('Error updating category order:', error);
        res.status(500).json({ message: 'Server error' });
    } finally {
        connection.release();
    }
};

// --- Payment Methods ---

exports.getPaymentMethods = async (req, res) => {
    try {
        const { user_id } = req.query;
        if (!user_id) return res.status(400).json({ message: 'User ID required' });

        const query = 'SELECT * FROM payment_methods WHERE user_id = ?';
        const [rows] = await pool.execute(query, [user_id]);
        res.status(200).json(rows);
    } catch (error) {
        console.error('Error fetching payment methods:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.createPaymentMethod = async (req, res) => {
    try {
        const { user_id, name, type, color } = req.body;
        const query = 'INSERT INTO payment_methods (user_id, name, type, color) VALUES (?, ?, ?, ?)';
        const [result] = await pool.execute(query, [user_id, name, type, color]);
        res.status(201).json({ id: result.insertId, message: 'Payment method created' });
    } catch (error) {
        console.error('Error creating payment method:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.deletePaymentMethod = async (req, res) => {
    try {
        const { id } = req.params;
        const query = 'DELETE FROM payment_methods WHERE payment_method_id = ?';
        const [result] = await pool.execute(query, [id]);
        if (result.affectedRows === 0) return res.status(404).json({ message: 'Payment method not found' });
        res.status(200).json({ message: 'Payment method deleted' });
    } catch (error) {
        console.error('Error deleting payment method:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// --- User Profile & Settings ---

exports.getUserProfile = async (req, res) => {
    try {
        const { user_id } = req.query; // Should come from auth middleware usually
        if (!user_id) return res.status(400).json({ message: 'User ID required' });

        const query = 'SELECT user_id, email, nickname, profile_image, theme, notification_enabled FROM users WHERE user_id = ?';
        const [rows] = await pool.execute(query, [user_id]);

        if (rows.length === 0) return res.status(404).json({ message: 'User not found' });
        res.status(200).json(rows[0]);
    } catch (error) {
        console.error('Error fetching profile:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.updateUserSettings = async (req, res) => {
    try {
        const { user_id, theme, notification_enabled } = req.body;
        // Construct query dynamically based on what's provided, or update all
        const query = 'UPDATE users SET theme = ?, notification_enabled = ? WHERE user_id = ?';
        const [result] = await pool.execute(query, [theme, notification_enabled, user_id]);

        if (result.affectedRows === 0) return res.status(404).json({ message: 'User not found' });
        res.status(200).json({ message: 'Settings updated' });
    } catch (error) {
        console.error('Error updating settings:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
