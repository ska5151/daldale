const pool = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.register = async (req, res) => {
    const { user_id, password, email } = req.body;

    try {
        // Check if user already exists
        const [existingUsers] = await pool.query('SELECT * FROM users WHERE user_id = ?', [user_id]);
        if (existingUsers.length > 0) {
            return res.status(400).json({ code: 400, message: '이미 존재하는 아이디입니다.' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Insert new user
        await pool.query('INSERT INTO users (user_id, password, email) VALUES (?, ?, ?)', [user_id, hashedPassword, email]);

        res.status(201).json({ code: 201, message: '회원가입 성공' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ code: 500, message: '서버 오류가 발생했습니다.' });
    }
};

exports.login = async (req, res) => {
    const { user_id, password } = req.body;

    try {
        // Find user by ID
        const [users] = await pool.query('SELECT * FROM users WHERE user_id = ?', [user_id]);

        if (users.length === 0) {
            return res.status(401).json({ code: 401, message: '아이디 또는 패스워드가 올바르지 않습니다.' });
        }

        const user = users[0];

        // Check password
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(401).json({ code: 401, message: '아이디 또는 패스워드가 올바르지 않습니다.' });
        }

        // Generate JWT Token
        const token = jwt.sign(
            { user_id: user.user_id },
            process.env.JWT_SECRET || 'secret',
            { expiresIn: '1h' }
        );

        res.status(200).json({
            code: 200,
            message: '로그인 성공',
            data: {
                token,
                user: {
                    user_id: user.user_id,
                    email: user.email
                }
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ code: 500, message: '서버 오류가 발생했습니다.' });
    }
};
