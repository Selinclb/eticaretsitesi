import axiosInstance from './axiosConfig';

const authService = {
    register: async (userData) => {
        const response = await axiosInstance.post('/auth/register/', userData);
        if (response.data.token && response.data.refresh) {
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('refreshToken', response.data.refresh);
            axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
        }
        return response.data;
    },

    login: async (credentials) => {
        const response = await axiosInstance.post('/auth/login/', credentials);
        if (response.data.token && response.data.refresh) {
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('refreshToken', response.data.refresh);
            axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
        }
        return response.data;
    },

    logout: async () => {
        try {
            const refreshToken = localStorage.getItem('refreshToken');
            if (refreshToken) {
                await axiosInstance.post('/auth/logout/', { refresh_token: refreshToken });
            }
        } finally {
            localStorage.removeItem('token');
            localStorage.removeItem('refreshToken');
            delete axiosInstance.defaults.headers.common['Authorization'];
        }
    },

    getCurrentUser: async () => {
        const response = await axiosInstance.get('/auth/profile/');
        return response.data;
    },

    updateProfile: async (userData) => {
        const response = await axiosInstance.patch('/auth/profile/', userData);
        return response.data;
    },

    changePassword: async (passwordData) => {
        const response = await axiosInstance.post('/auth/change-password/', passwordData);
        if (response.data.token && response.data.refresh) {
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('refreshToken', response.data.refresh);
            axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
        }
        return response.data;
    },

    deleteAccount: async (password) => {
        try {
            const response = await axiosInstance.post('/auth/delete-account/', { password });
            localStorage.removeItem('token');
            localStorage.removeItem('refreshToken');
            delete axiosInstance.defaults.headers.common['Authorization'];
            return response.data;
        } catch (error) {
            if (error.response?.status === 400) {
                throw new Error(error.response.data.error || 'Geçersiz şifre');
            }
            throw error;
        }
    },

    requestPasswordReset: async (email) => {
        const response = await axiosInstance.post('/auth/password-reset/', { email });
        return response.data;
    },

    resetPassword: async (token, newPassword) => {
        const response = await axiosInstance.post('/auth/password-reset/confirm/', {
            token,
            new_password: newPassword
        });
        return response.data;
    },

    verifyEmail: async (token) => {
        const response = await axiosInstance.post('/auth/verify-email/', { token });
        if (response.data.token && response.data.refresh) {
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('refreshToken', response.data.refresh);
            axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
        }
        return response.data;
    },

    enable2FA: async () => {
        const response = await axiosInstance.post('/auth/2fa/enable/');
        return response.data;
    },

    disable2FA: async () => {
        const response = await axiosInstance.post('/auth/2fa/disable/');
        return response.data;
    },

    verify2FA: async (email, code) => {
        const response = await axiosInstance.post('/auth/2fa/verify/', { email, code });
        if (response.data.token && response.data.refresh) {
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('refreshToken', response.data.refresh);
            axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
        }
        return response.data;
    },

    resendVerificationEmail: async (email) => {
        const response = await axiosInstance.post('/auth/resend-verification/', { email });
        return response.data;
    }
};

export default authService;