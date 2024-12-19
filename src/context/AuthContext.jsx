import { createContext, useState, useContext, useEffect } from 'react';
import authService from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            setLoading(false);
            return;
        }

        try {
            const userData = await authService.getCurrentUser();
            setUser(userData);
            setIsAuthenticated(true);
        } catch (error) {
            localStorage.removeItem('token');
            localStorage.removeItem('refreshToken');
        } finally {
            setLoading(false);
        }
    };

    const login = async (credentials) => {
        const response = await authService.login(credentials);
        setUser(response.user);
        setIsAuthenticated(true);
        return response;
    };

    const register = async (userData) => {
        const response = await authService.register(userData);
        setUser(response.user);
        setIsAuthenticated(true);
        return response;
    };

    const logout = async () => {
        try {
            await authService.logout();
        } finally {
            setUser(null);
            setIsAuthenticated(false);
        }
    };

    const updateProfile = async (userData) => {
        const updatedUser = await authService.updateProfile(userData);
        setUser(updatedUser);
        return updatedUser;
    };

    const changePassword = async (passwordData) => {
        return await authService.changePassword(passwordData);
    };

    const deleteAccount = async (password) => {
        await authService.deleteAccount(password);
        setUser(null);
        setIsAuthenticated(false);
    };

    const verifyEmail = async (token) => {
        const response = await authService.verifyEmail(token);
        if (response.user) {
            setUser(response.user);
            setIsAuthenticated(true);
        }
        return response;
    };

    const value = {
        user,
        loading,
        isAuthenticated,
        login,
        logout,
        register,
        updateProfile,
        changePassword,
        deleteAccount,
        checkAuth,
        verifyEmail
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export default AuthContext;