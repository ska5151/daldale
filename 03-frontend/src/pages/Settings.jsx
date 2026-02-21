import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import useStore from '../store/useStore';

const Settings = () => {
    const navigate = useNavigate();
    const {
        categories,
        paymentMethods,
        addCategory,
        deleteCategory,
        setCategories,
        addPaymentMethod,
        deletePaymentMethod,
    } = useStore();

    const [newCategory, setNewCategory] = useState('');
    const [newPaymentMethod, setNewPaymentMethod] = useState('');
    const [newPaymentMethodColor, setNewPaymentMethodColor] = useState('#6366f1');

    const handleAddCategory = () => {
        if (!newCategory.trim()) return;
        addCategory({
            name: newCategory,
            type: 'EXPENSE',
            sort_order: categories.length + 1
        });
        setNewCategory('');
    };

    const handleDeleteCategory = (id) => {
        if (!window.confirm('정말로 이 카테고리를 삭제하시겠습니까?')) return;
        deleteCategory(id);
    };


    const handleAddPaymentMethod = () => {
        if (!newPaymentMethod.trim()) return;
        addPaymentMethod({
            name: newPaymentMethod,
            type: 'CARD', // Default for now
            color: newPaymentMethodColor
        });
        setNewPaymentMethod('');
    };

    const handleDeletePaymentMethod = (id) => {
        if (!window.confirm('정말로 이 결제수단을 삭제하시겠습니까?')) return;
        deletePaymentMethod(id);
    };


    const dragItem = useRef();
    const dragOverItem = useRef();

    const handleDragStart = (e, position) => {
        dragItem.current = position;
        e.target.style.opacity = '0.4';
    };

    const handleDragEnter = (e, position) => {
        dragOverItem.current = position;
        const newCategories = [...categories];
        const dragItemContent = newCategories[dragItem.current];
        newCategories.splice(dragItem.current, 1);
        newCategories.splice(dragOverItem.current, 0, dragItemContent);
        dragItem.current = position;
        dragOverItem.current = null;
        setCategories(newCategories);
    };

    const handleDragEnd = (e) => {
        e.target.style.opacity = '1';
        dragItem.current = null;
        dragOverItem.current = null;

        // Save backend order (local store update already handled in dragEnter)
        const updatedWithOrder = categories.map((cat, idx) => ({
            ...cat,
            sort_order: idx
        }));
        setCategories(updatedWithOrder);
    };

    return (
        <div>
            <h1 style={{ marginBottom: '1.5rem', color: 'var(--text-light)' }}>설정</h1>



            {/* Category Management Section */}
            <div className="card">
                <h2 className="card-title">카테고리 관리</h2>

                <div className="settings-input-group">
                    <input
                        type="text"
                        className="form-input"
                        placeholder="새 카테고리 입력..."
                        value={newCategory}
                        onChange={(e) => setNewCategory(e.target.value)}
                        style={{ flex: 1 }}
                        onKeyPress={(e) => e.key === 'Enter' && handleAddCategory()}
                    />
                    <button className="btn btn-primary" onClick={handleAddCategory}>추가</button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                    {categories.map((cat, index) => (
                        <div
                            key={cat.category_id}
                            draggable
                            onDragStart={(e) => handleDragStart(e, index)}
                            onDragEnter={(e) => handleDragEnter(e, index)}
                            onDragEnd={handleDragEnd}
                            onDragOver={(e) => e.preventDefault()}
                            className="settings-list-item"
                            style={{ cursor: 'grab' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                {/* Drag Handle */}
                                <div style={{ cursor: 'grab', color: 'var(--text-dim)', fontSize: '1.2rem', paddingRight: '0.5rem' }}>
                                    ☰
                                </div>
                                <span style={{ color: 'var(--text-light)', fontWeight: '500' }}>{cat.name}</span>
                            </div>

                            <button
                                onClick={() => handleDeleteCategory(cat.category_id)}
                                style={{ border: 'none', background: 'transparent', color: '#ef4444', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.9rem', padding: '0.5rem' }}
                            >
                                삭제
                            </button>
                        </div>
                    ))}
                    {categories.length === 0 && (
                        <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-dim)', border: '1px dashed rgba(255,255,255,0.1)', borderRadius: '12px' }}>
                            카테고리가 없습니다. 위에 추가해보세요!
                        </div>
                    )}
                </div>
            </div>

            {/* Payment Method Management Section */}
            <div className="card">
                <h2 className="card-title">결제 수단 관리</h2>

                <div className="settings-input-group">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(255,255,255,0.05)', padding: '0.5rem', borderRadius: '8px', minWidth: '50px', justifyContent: 'center' }}>
                        <input
                            type="color"
                            value={newPaymentMethodColor}
                            onChange={(e) => setNewPaymentMethodColor(e.target.value)}
                            style={{ border: 'none', width: '30px', height: '30px', background: 'transparent', cursor: 'pointer', padding: 0 }}
                            title="색상 선택"
                        />
                    </div>
                    <input
                        type="text"
                        className="form-input"
                        placeholder="새 결제수단 (예: 신한카드)..."
                        value={newPaymentMethod}
                        onChange={(e) => setNewPaymentMethod(e.target.value)}
                        style={{ flex: 1 }}
                        onKeyPress={(e) => e.key === 'Enter' && handleAddPaymentMethod()}
                    />
                    <button className="btn btn-primary" onClick={handleAddPaymentMethod}>추가</button>
                </div>

                <div className="dashboard-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
                    {paymentMethods.map(method => (
                        <div key={method.payment_method_id} className="settings-list-item" style={{
                            borderLeft: `4px solid ${method.color}`,
                            marginBottom: 0 /* Reset since grid handles gap */
                        }}>
                            <span style={{ color: 'var(--text-light)', fontWeight: '500' }}>{method.name}</span>
                            <button
                                onClick={() => handleDeletePaymentMethod(method.payment_method_id)}
                                style={{ border: 'none', background: 'transparent', color: '#ef4444', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.9rem', padding: '0.5rem' }}
                            >
                                삭제
                            </button>
                        </div>
                    ))}
                    {paymentMethods.length === 0 && (
                        <div style={{ gridColumn: '1 / -1', padding: '2rem', textAlign: 'center', color: 'var(--text-dim)', border: '1px dashed rgba(255,255,255,0.1)', borderRadius: '12px' }}>
                            결제 수단이 없습니다.
                        </div>
                    )}
                </div>
            </div>


        </div>
    );
};

export default Settings;
