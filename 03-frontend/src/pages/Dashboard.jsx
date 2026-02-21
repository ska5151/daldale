import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import useStore from '../store/useStore';

const Dashboard = () => {
    const navigate = useNavigate();
    const {
        expenses,
        expenseHistory,
        getDashboardSummary,
        getPaymentStats,
        getExpenseList,
        togglePaymentStatus,
        deleteExpense
    } = useStore();

    // Date State
    const [year, setYear] = useState(new Date().getFullYear());
    const [month, setMonth] = useState(new Date().getMonth() + 1);

    // Derived Data using useMemo for performance
    const summary = useMemo(() => getDashboardSummary(year, month), [year, month, expenses, expenseHistory, getDashboardSummary]);
    const stats = useMemo(() => getPaymentStats(year, month), [year, month, expenses, getPaymentStats]);
    const expenseList = useMemo(() => getExpenseList(year, month), [year, month, expenses, expenseHistory, getExpenseList]);

    const handlePrevMonth = () => {
        let newMonth = month - 1;
        let newYear = year;
        if (newMonth < 1) {
            newMonth = 12;
            newYear -= 1;
        }
        setYear(newYear);
        setMonth(newMonth);
    };

    const handleNextMonth = () => {
        let newMonth = month + 1;
        let newYear = year;
        if (newMonth > 12) {
            newMonth = 1;
            newYear += 1;
        }
        setYear(newYear);
        setMonth(newMonth);
    };

    const handleToggleStatus = (expense) => {
        const yearMonth = `${year}-${String(month).padStart(2, '0')}`;
        togglePaymentStatus(expense.expense_id, yearMonth, !expense.is_paid);
    };

    const handleDelete = (expenseId) => {
        if (!window.confirm('정말로 이 고정지출 항목을 삭제하시겠습니까?')) return;
        deleteExpense(expenseId);
    };

    // summary, stats, expenseList are always derived from store

    const total = Number(summary.total_amount);
    const paid = Number(summary.paid_amount);
    const remaining = Number(summary.remaining_amount);

    // Calculate percentage for progress bar
    const progressPercent = total > 0 ? Math.min(Math.round((paid / total) * 100), 100) : 0;

    return (

        <div style={{ paddingBottom: '80px', maxWidth: '1200px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                <h1 style={{ color: 'var(--text-light)', margin: 0, fontSize: '1.8rem' }}>대시보드</h1>

                {/* Month Selector */}
                <div style={{ display: 'flex', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '12px', padding: '0.4rem 0.6rem' }}>
                    <button onClick={handlePrevMonth} style={{ background: 'none', border: 'none', color: 'var(--text-light)', cursor: 'pointer', padding: '0.6rem', fontSize: '1.2rem' }}>&lt;</button>
                    <span style={{ margin: '0 1rem', fontWeight: 'bold', color: 'var(--text-light)', fontSize: '1.1rem', minWidth: '100px', textAlign: 'center' }}>{year}. {String(month).padStart(2, '0')}</span>
                    <button onClick={handleNextMonth} style={{ background: 'none', border: 'none', color: 'var(--text-light)', cursor: 'pointer', padding: '0.6rem', fontSize: '1.2rem' }}>&gt;</button>
                </div>
            </div>

            <div className="dashboard-grid">
                {/* Summary Card */}
                <div className="card">
                    <h2 className="card-title">월별 현황</h2>
                    <div style={{ marginBottom: '1rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.8rem', alignItems: 'baseline' }}>
                            <span style={{ color: 'var(--text-dim)' }}>총 고정지출</span>
                            <span style={{ fontWeight: 'bold', fontSize: '1.8rem', color: 'var(--primary)' }}>₩{total.toLocaleString()}</span>
                        </div>

                        {/* Progress Bar */}
                        <div style={{ width: '100%', height: '14px', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: '7px', overflow: 'hidden', position: 'relative' }}>
                            <div style={{
                                width: `${progressPercent}%`,
                                height: '100%',
                                background: 'linear-gradient(90deg, #10b981, #34d399)',
                                transition: 'width 1s cubic-bezier(0.4, 0, 0.2, 1)',
                                borderRadius: '7px'
                            }}></div>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1.2rem', fontSize: '1rem' }}>
                            <div style={{ textAlign: 'left' }}>
                                <div style={{ color: 'var(--text-dim)', fontSize: '0.9rem', marginBottom: '0.2rem' }}>지출 완료</div>
                                <div style={{ color: '#34d399', fontWeight: '700', fontSize: '1.1rem' }}>₩{paid.toLocaleString()}</div>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <div style={{ color: 'var(--text-dim)', fontSize: '0.9rem', marginBottom: '0.2rem' }}>남은 금액</div>
                                <div style={{ color: '#f87171', fontWeight: '700', fontSize: '1.1rem' }}>₩{remaining.toLocaleString()}</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Payment Stats Card */}
                <div className="card">
                    <h2 className="card-title">결제 수단</h2>
                    {stats.length === 0 ? (
                        <p style={{ color: 'var(--text-dim)', textAlign: 'center', padding: '2rem' }}>결제 데이터가 없습니다.</p>
                    ) : (
                        <div style={{ maxHeight: '300px', overflowY: 'auto', paddingRight: '0.5rem' }}>
                            {stats.map((stat, index) => (
                                <div key={index} style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    marginBottom: '0.8rem',
                                    padding: '0.8rem',
                                    backgroundColor: 'rgba(255,255,255,0.02)',
                                    borderRadius: '10px'
                                }}>
                                    <div style={{
                                        width: '40px',
                                        height: '40px',
                                        borderRadius: '10px',
                                        backgroundColor: stat.payment_method_color || '#ccc',
                                        marginRight: '12px',
                                        boxShadow: `0 4px 10px ${stat.payment_method_color}40`,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: '1rem',
                                        color: '#fff',
                                        fontWeight: 'bold',
                                        flexShrink: 0
                                    }}>
                                        {stat.payment_method_name ? stat.payment_method_name.charAt(0) : '?'}
                                    </div>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{ color: 'var(--text-light)', fontWeight: '600', marginBottom: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{stat.payment_method_name || '기타'}</div>
                                        <div style={{ fontSize: '0.85rem', color: 'var(--text-dim)' }}>{((stat.total_amount / total) * 100).toFixed(1)}%</div>
                                    </div>
                                    <span style={{ fontWeight: '700', color: 'var(--text-light)', marginLeft: '0.5rem' }}>₩{Number(stat.total_amount).toLocaleString()}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Fixed Expense List */}
            <div style={{ marginTop: '2.5rem' }}>
                <h2 style={{ color: 'var(--text-light)', marginBottom: '1.2rem', fontSize: '1.4rem' }}>고정지출 목록 <span style={{ fontSize: '1rem', color: 'var(--text-dim)', fontWeight: 'normal' }}>({expenseList.length})</span></h2>

                {expenseList.length === 0 ? (
                    <div className="card" style={{ textAlign: 'center', color: 'var(--text-dim)', padding: '3rem' }}>
                        등록된 고정지출이 없습니다.
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                        {expenseList.map(expense => (
                            <div key={expense.expense_id} className="expense-item" style={{
                                opacity: expense.is_paid ? 0.6 : 1,
                                backgroundColor: expense.is_paid ? 'rgba(30, 41, 59, 0.5)' : 'var(--bg-card)', /* Dim background if paid */
                            }}>
                                <div className="expense-info">
                                    <div className="expense-icon" style={{
                                        backgroundColor: expense.is_paid ? '#10b981' : 'rgba(255,255,255,0.1)',
                                    }}>
                                        {expense.is_paid ? '✓' : expense.payment_day}
                                    </div>
                                    <div className="expense-details">
                                        <div className="expense-name" style={{
                                            textDecoration: expense.is_paid ? 'line-through' : 'none'
                                        }}>
                                            {expense.name}
                                        </div>
                                        <div className="expense-sub">
                                            {expense.payment_method_name || '미지정'} | {expense.payment_day === '유동' ? '유동' : `${expense.payment_day}일`}
                                        </div>
                                    </div>
                                </div>

                                <div className="expense-actions">
                                    <div className="expense-amount" style={{
                                        color: expense.is_paid ? 'var(--text-dim)' : 'var(--text-light)'
                                    }}>
                                        ₩{Number(expense.amount).toLocaleString()}
                                    </div>

                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                        <button
                                            onClick={() => handleToggleStatus(expense)}
                                            className="btn-action"
                                            style={{
                                                padding: '0.6rem 1rem',
                                                borderRadius: '8px',
                                                border: 'none',
                                                backgroundColor: expense.is_paid ? 'rgba(255,255,255,0.1)' : 'var(--primary)',
                                                color: '#fff',
                                                fontWeight: '600',
                                                transition: 'all 0.2s',
                                                minWidth: '60px'
                                            }}
                                        >
                                            {expense.is_paid ? '취소' : '완료'}
                                        </button>

                                        <button
                                            onClick={() => navigate(`/edit/${expense.expense_id}`)}
                                            className="btn-action"
                                            style={{
                                                padding: '0.6rem',
                                                borderRadius: '8px',
                                                border: 'none',
                                                backgroundColor: 'rgba(59, 130, 246, 0.15)',
                                                color: '#60a5fa',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                minWidth: '36px'
                                            }}
                                            title="수정"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                                            </svg>
                                        </button>

                                        <button
                                            onClick={() => handleDelete(expense.expense_id)}
                                            className="btn-action"
                                            style={{
                                                padding: '0.6rem',
                                                borderRadius: '8px',
                                                border: 'none',
                                                backgroundColor: 'rgba(239, 68, 68, 0.15)',
                                                color: '#f87171',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                minWidth: '36px'
                                            }}
                                            title="삭제"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <polyline points="3 6 5 6 21 6"></polyline>
                                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Adding the floating ADD button for Mobile? User didn't ask but it's good for mobile UX. 
               The current Add button is in the Footer/Layout probably. */}
        </div>
    );
};

export default Dashboard;
