import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

const useStore = create(
    persist(
        (set, get) => ({
            // --- State ---
            expenses: [],
            expenseHistory: [],
            categories: [
                { category_id: 1, name: '생활비', type: 'EXPENSE', sort_order: 1 },
                { category_id: 2, name: '통신비', type: 'EXPENSE', sort_order: 2 },
                { category_id: 3, name: '주거비', type: 'EXPENSE', sort_order: 3 },
            ],
            paymentMethods: [
                { payment_method_id: 1, name: '신용카드', type: 'CARD', color: '#6366f1' },
                { payment_method_id: 2, name: '체크카드', type: 'CARD', color: '#10b981' },
                { payment_method_id: 3, name: '현금', type: 'CASH', color: '#f59e0b' },
            ],
            userProfile: {
                user_id: 1,
                nickname: '사용자',
                email: '',
                theme: 'dark',
                notification_enabled: true,
            },

            // --- Expense Actions ---
            addExpense: (expense) => set((state) => ({
                expenses: [...state.expenses, { ...expense, expense_id: Date.now() }]
            })),
            updateExpense: (id, updatedExpense) => set((state) => ({
                expenses: state.expenses.map((exp) =>
                    exp.expense_id === id ? { ...exp, ...updatedExpense } : exp
                )
            })),
            deleteExpense: (id) => set((state) => ({
                expenses: state.expenses.filter((exp) => exp.expense_id !== id),
                expenseHistory: state.expenseHistory.filter((h) => h.expense_id !== id)
            })),

            // --- History Actions (Toggle Paid Status) ---
            togglePaymentStatus: (expense_id, yearMonth, is_paid) => {
                const { expenses, expenseHistory } = get();
                const expense = expenses.find(e => e.expense_id === expense_id);
                if (!expense) return;

                const existingIndex = expenseHistory.findIndex(
                    h => h.expense_id === expense_id && h.year_month === yearMonth
                );

                const newHistory = [...expenseHistory];
                if (existingIndex > -1) {
                    newHistory[existingIndex] = {
                        ...newHistory[existingIndex],
                        is_paid: is_paid ? 1 : 0,
                        paid_date: is_paid ? new Date().toISOString() : null
                    };
                } else {
                    newHistory.push({
                        history_id: Date.now(),
                        expense_id,
                        year_month: yearMonth,
                        is_paid: is_paid ? 1 : 0,
                        paid_date: is_paid ? new Date().toISOString() : null,
                        amount: expense.amount
                    });
                }
                set({ expenseHistory: newHistory });
            },

            // --- Category Actions ---
            addCategory: (category) => set((state) => ({
                categories: [...state.categories, { ...category, category_id: Date.now() }]
            })),
            updateCategory: (id, updatedCategory) => set((state) => ({
                categories: state.categories.map((cat) =>
                    cat.category_id === id ? { ...cat, ...updatedCategory } : cat
                )
            })),
            deleteCategory: (id) => set((state) => ({
                categories: state.categories.filter((cat) => cat.category_id !== id)
            })),
            setCategories: (categories) => set({ categories }),

            // --- Payment Method Actions ---
            addPaymentMethod: (method) => set((state) => ({
                paymentMethods: [...state.paymentMethods, { ...method, payment_method_id: Date.now() }]
            })),
            deletePaymentMethod: (id) => set((state) => ({
                paymentMethods: state.paymentMethods.filter((pm) => pm.payment_method_id !== id)
            })),

            // --- Profile Actions ---
            updateProfile: (updates) => set((state) => ({
                userProfile: { ...state.userProfile, ...updates }
            })),

            // --- Selectors / Derived Data ---
            getDashboardSummary: (year, month) => {
                const { expenses, expenseHistory } = get();
                const yearMonth = `${year}-${String(month).padStart(2, '0')}`;

                let total_amount = 0;
                let paid_amount = 0;

                expenses.forEach(exp => {
                    total_amount += Number(exp.amount);
                    const history = expenseHistory.find(h => h.expense_id === exp.expense_id && h.year_month === yearMonth);
                    if (history && history.is_paid) {
                        paid_amount += Number(exp.amount);
                    }
                });

                return {
                    total_amount,
                    paid_amount,
                    remaining_amount: total_amount - paid_amount
                };
            },

            getPaymentStats: (year, month) => {
                const { expenses, paymentMethods } = get();
                // Group by payment method
                const statsMap = {};
                expenses.forEach(exp => {
                    const methodId = exp.payment_method_id;
                    const method = paymentMethods.find(pm => pm.payment_method_id === Number(methodId));
                    const methodName = method ? method.name : 'Unknown';
                    const methodColor = method ? method.color : '#ccc';

                    if (!statsMap[methodId]) {
                        statsMap[methodId] = {
                            payment_method_name: methodName,
                            payment_method_color: methodColor,
                            total_amount: 0
                        };
                    }
                    statsMap[methodId].total_amount += Number(exp.amount);
                });

                return Object.values(statsMap);
            },

            getExpenseList: (year, month) => {
                const { expenses, expenseHistory, paymentMethods } = get();
                const yearMonth = `${year}-${String(month).padStart(2, '0')}`;

                return expenses.map(exp => {
                    const history = expenseHistory.find(h => h.expense_id === exp.expense_id && h.year_month === yearMonth);
                    const method = paymentMethods.find(pm => pm.payment_method_id === Number(exp.payment_method_id));

                    return {
                        ...exp,
                        is_paid: history ? history.is_paid : 0,
                        paid_date: history ? history.paid_date : null,
                        payment_method_name: method ? method.name : '미지정',
                        payment_method_color: method ? method.color : '#ccc'
                    };
                }).sort((a, b) => {
                    const dayA = a.payment_day === '유동' ? 99 : Number(a.payment_day);
                    const dayB = b.payment_day === '유동' ? 99 : Number(b.payment_day);
                    return dayA - dayB;
                });
            },

            getExpenseById: (id) => {
                const { expenses } = get();
                return expenses.find(exp => exp.expense_id === Number(id));
            }
        }),
        {
            name: 'daldale-storage', // name of the item in the storage (must be unique)
            storage: createJSONStorage(() => localStorage), // (optional) by default, 'localStorage' is used
        }
    )
);

export default useStore;
