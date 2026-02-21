import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './AuthPage.css';

const AuthPage = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        if (localStorage.getItem('token')) {
            navigate('/dashboard');
        }
    }, [navigate]);
    const [formData, setFormData] = useState({
        user_id: '',
        password: '',
        confirmPassword: '',
        email: ''
    });
    const [error, setError] = useState('');
    const [rememberId, setRememberId] = useState(false);

    useEffect(() => {
        const savedId = localStorage.getItem('savedId');
        if (savedId) {
            setFormData(prev => ({ ...prev, user_id: savedId }));
            setRememberId(true);
        }
    }, []);



    const toggleMode = () => {
        setIsLogin(!isLogin);
        setError('');
        setFormData({
            user_id: '',
            password: '',
            confirmPassword: '',
            email: ''
        });
        // Don't reset rememberId or savedId, keeps user convenience
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        // Validation
        if (!formData.user_id || !formData.password) {
            setError('아이디와 비밀번호를 입력해주세요.');
            setLoading(false);
            return;
        }

        if (!isLogin) {
            if (formData.password !== formData.confirmPassword) {
                setError('비밀번호가 일치하지 않습니다.');
                setLoading(false);
                return;
            }
            if (!formData.email) {
                setError('이메일을 입력해주세요.');
                setLoading(false);
                return;
            }
        }

        // Mock authentication for local-only mode
        try {
            if (isLogin) {
                // For simplicity, allow any login in local mode
                const mockUser = {
                    user_id: formData.user_id,
                    nickname: formData.user_id,
                    email: formData.email || '',
                };
                localStorage.setItem('token', 'mock-token-' + Date.now());
                localStorage.setItem('user', JSON.stringify(mockUser));

                if (rememberId) {
                    localStorage.setItem('savedId', formData.user_id);
                } else {
                    localStorage.removeItem('savedId');
                }

                alert('로그인 성공! (로컬 모드)');
                navigate('/dashboard');
            } else {
                // Register: In local mode, we just store the "user" but actually the store handles the rest
                alert('회원가입 성공! 로그인해주세요.');
                toggleMode();
            }
        } catch (err) {
            console.error('Auth Error:', err);
            setError('인증 중 오류가 발생했습니다.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <h2 className="auth-title">{isLogin ? 'Welcome Back' : 'Create Account'}</h2>

                <form className="auth-form" onSubmit={handleSubmit}>
                    {error && <div className="error-message">{error}</div>}

                    <div className="form-group">
                        <label className="form-label">아이디</label>
                        <input
                            type="text"
                            name="user_id"
                            className="form-input"
                            placeholder="아이디를 입력하세요"
                            value={formData.user_id}
                            onChange={handleChange}
                            autoComplete="username"
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">비밀번호</label>
                        <input
                            type="password"
                            name="password"
                            className="form-input"
                            placeholder="비밀번호를 입력하세요"
                            value={formData.password}
                            onChange={handleChange}
                            autoComplete={isLogin ? "current-password" : "new-password"}
                        />
                    </div>

                    {isLogin && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '-10px', marginBottom: '5px' }}>
                            <input
                                type="checkbox"
                                id="rememberId"
                                checked={rememberId}
                                onChange={(e) => setRememberId(e.target.checked)}
                                style={{ cursor: 'pointer', width: '16px', height: '16px' }}
                            />
                            <label htmlFor="rememberId" style={{ color: 'var(--text-muted)', fontSize: '0.9rem', cursor: 'pointer' }}>
                                아이디 저장
                            </label>
                        </div>
                    )}

                    {!isLogin && (
                        <>
                            <div className="form-group">
                                <label className="form-label">비밀번호 확인</label>
                                <input
                                    type="password"
                                    name="confirmPassword"
                                    className="form-input"
                                    placeholder="비밀번호를 다시 입력하세요"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    autoComplete="new-password"
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">이메일</label>
                                <input
                                    type="email"
                                    name="email"
                                    className="form-input"
                                    placeholder="example@email.com"
                                    value={formData.email}
                                    onChange={handleChange}
                                    autoComplete="email"
                                />
                            </div>
                        </>
                    )}

                    <button type="submit" className="btn-primary" disabled={loading}>
                        {loading ? '처리중...' : (isLogin ? '로그인' : '회원가입')}
                    </button>
                </form>

                <div className="toggle-text">
                    {isLogin ? '계정이 없으신가요?' : '이미 계정이 있으신가요?'}
                    <span className="toggle-link" onClick={toggleMode}>
                        {isLogin ? '회원가입' : '로그인'}
                    </span>
                </div>
            </div>
        </div>
    );
};

export default AuthPage;
