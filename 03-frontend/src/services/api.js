const API_BASE_URL = 'http://127.0.0.1:5000/api';

// Create a generic function to handle potential errors
async function fetchAPI(endpoint, options = {}) {
    const token = localStorage.getItem('token');

    // Merge headers properly
    const config = {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...(options.headers || {}),
            'Authorization': token ? `Bearer ${token}` : '',
        },
    };

    let response;
    try {
        response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    } catch (networkError) {
        // Handle network errors (e.g. server down, CORS)
        throw new Error('Network Error: ' + networkError.message);
    }

    if (!response.ok) {
        let errorMessage = 'Something went wrong';
        try {
            // Try to parse JSON error message from server
            const errorData = await response.json();
            errorMessage = errorData.message || errorMessage;
        } catch (e) {
            // Fallback if response is not JSON (e.g. 404 HTML page)
            errorMessage = `Request failed (${response.status}): ${response.statusText}`;
        }
        throw new Error(errorMessage);
    }

    // For 204 No Content
    if (response.status === 204) return null;

    try {
        // Parse JSON response
        const text = await response.text();
        return text ? JSON.parse(text) : {};
    } catch (e) {
        console.warn('Response OK but not JSON');
        return {};
    }
}

export const DashboardAPI = {
    getSummary: (userId, year, month) => fetchAPI(`/dashboard/summary?user_id=${userId}&year=${year}&month=${month}`),
    getStats: (userId, year, month) => fetchAPI(`/dashboard/stats?user_id=${userId}&year=${year}&month=${month}`),
    getList: (userId, year, month) => fetchAPI(`/dashboard/list?user_id=${userId}&year=${year}&month=${month}`),
    toggleStatus: (expenseId, yearMonth, isPaid) => fetchAPI('/dashboard/status', {
        method: 'POST',
        body: JSON.stringify({ expense_id: expenseId, year_month: yearMonth, is_paid: isPaid }),
    }),
};

export const ExpensesAPI = {
    create: (data) => fetchAPI('/expenses', {
        method: 'POST',
        body: JSON.stringify(data),
    }),
    update: (id, data) => fetchAPI(`/expenses/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
    }),
    delete: (id) => fetchAPI(`/expenses/${id}`, {
        method: 'DELETE',
    }),
    getById: (id) => fetchAPI(`/expenses/${id}`),
    getAll: (userId) => fetchAPI(`/expenses?user_id=${userId}`),
};

export const SettingsAPI = {
    getCategories: (userId) => fetchAPI(`/categories?user_id=${userId}`),
    createCategory: (data) => fetchAPI('/categories', {
        method: 'POST', // Ensure method is POST
        body: JSON.stringify(data),
    }),
    updateCategory: (id, data) => fetchAPI(`/categories/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
    }),
    deleteCategory: (id) => fetchAPI(`/categories/${id}`, {
        method: 'DELETE',
    }),
    updateCategoryOrder: (categories) => fetchAPI('/categories/reorder', {
        method: 'PUT',
        body: JSON.stringify({ categories }),
    }),

    getPaymentMethods: (userId) => fetchAPI(`/payment-methods?user_id=${userId}`),
    createPaymentMethod: (data) => fetchAPI('/payment-methods', {
        method: 'POST',
        body: JSON.stringify(data),
    }),
    deletePaymentMethod: (id) => fetchAPI(`/payment-methods/${id}`, {
        method: 'DELETE',
    }),

    getUserProfile: (userId) => fetchAPI(`/user/profile?user_id=${userId}`),
    updateUserSettings: (userId, settings) => fetchAPI('/user/settings', {
        method: 'PUT',
        body: JSON.stringify({ user_id: userId, ...settings }),
    }),
};
