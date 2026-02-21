import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import useStore from '../store/useStore';

const AddExpense = () => {
    const navigate = useNavigate();
    const { id } = useParams(); // Get ID from URL if editing
    const {
        categories,
        paymentMethods,
        addExpense,
        updateExpense,
        getExpenseById
    } = useStore();

    const [formData, setFormData] = useState({
        name: '',
        amount: '',
        payment_day: 1,
        category_id: '',
        payment_method_id: '',
        memo: ''
    });

    const [loading, setLoading] = useState(false);
    const [isEditing, setIsEditing] = useState(false);

    useEffect(() => {
        // If ID exists, load expense data
        if (id) {
            setIsEditing(true);
            const expense = getExpenseById(id);
            if (expense) {
                setFormData({
                    name: expense.name || '',
                    amount: expense.amount || '',
                    payment_day: expense.payment_day || 1,
                    category_id: expense.category_id || '',
                    payment_method_id: expense.payment_method_id || '',
                    memo: expense.memo || ''
                });
            } else {
                console.error('Expense not found');
            }
        }
    }, [id, getExpenseById]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (isEditing) {
                updateExpense(Number(id), {
                    ...formData
                });
                alert('고정지출이 수정되었습니다!');
            } else {
                addExpense({
                    ...formData
                });
                alert('고정지출이 성공적으로 등록되었습니다!');
            }
            navigate('/dashboard');
        } catch (error) {
            alert((isEditing ? '수정' : '등록') + ' 실패: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ maxWidth: '700px', margin: '0 auto' }}>
            <h1 style={{ marginBottom: '1.5rem', color: 'var(--text-light)' }}>{isEditing ? '고정지출 수정' : '고정지출 등록'}</h1>

            <form onSubmit={handleSubmit} className="card">
                {/* ... form fields ... */}
                <div className="form-group">
                    <label className="form-label">지출 항목명</label>
                    <input
                        type="text"
                        name="name"
                        className="form-input"
                        placeholder="예: 넷플릭스 구독"
                        value={formData.name}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="form-group">
                    <label className="form-label">금액 (원)</label>
                    <div style={{ position: 'relative' }}>
                        <span style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-dim)' }}>₩</span>
                        <input
                            type="number"
                            name="amount"
                            className="form-input"
                            style={{ paddingLeft: '35px' }}
                            placeholder="0"
                            value={formData.amount}
                            onChange={handleChange}
                            required
                        />
                    </div>
                </div>

                <div className="form-grid">
                    <div className="form-group">
                        <label className="form-label">카테고리</label>
                        <select
                            name="category_id"
                            className="form-select"
                            value={formData.category_id}
                            onChange={handleChange}
                        >
                            <option value="">카테고리 선택</option>
                            {categories.map(cat => (
                                <option key={cat.category_id} value={cat.category_id}>{cat.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="form-group">
                        <label className="form-label">결제일</label>
                        <select
                            name="payment_day"
                            className="form-select"
                            value={formData.payment_day}
                            onChange={handleChange}
                        >
                            <option value="유동">유동</option>
                            {[...Array(31)].map((_, i) => (
                                <option key={i + 1} value={i + 1}>매월 {i + 1}일</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="form-group">
                    <label className="form-label">결제 수단</label>
                    <select
                        name="payment_method_id"
                        className="form-select"
                        value={formData.payment_method_id}
                        onChange={handleChange}
                    >
                        <option value="">결제 수단 선택</option>
                        {paymentMethods.map(pm => (
                            <option key={pm.payment_method_id} value={pm.payment_method_id}>{pm.name}</option>
                        ))}
                    </select>
                </div>

                <div className="form-group">
                    <label className="form-label">메모 (선택사항)</label>
                    <textarea
                        name="memo"
                        className="form-textarea"
                        rows="3"
                        placeholder="예: 가족 공유 프리미엄 요금제"
                        value={formData.memo}
                        onChange={handleChange}
                    ></textarea>
                </div>

                <div style={{ marginTop: '2rem' }}>
                    <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
                        {loading ? '저장 중...' : (isEditing ? '수정하기' : '저장하기')}
                    </button>
                    <button
                        type="button"
                        className="btn"
                        style={{ width: '100%', marginTop: '0.8rem', background: 'transparent', color: 'var(--text-dim)' }}
                        onClick={() => navigate('/dashboard')}
                    >
                        취소
                    </button>
                </div>
            </form>
        </div>
    );
};

export default AddExpense;
