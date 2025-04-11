import axios from 'axios';

const API_URL = 'http://localhost:5000';

export const authService = {
    // Check if user is authenticated
    async checkAuth() {
        try {
            const response = await axios.get(`${API_URL}/auth/session`, {
                withCredentials: true
            });
            return response.data;
        } catch (error) {
            console.error('Auth check failed:', error);
            return { isAuthenticated: false };
        }
    },

    // Initiate login process
    login() {
        window.location.href = `${API_URL}/auth/login`;
    },

    // Logout
    async logout() {
        try {
            await axios.get(`${API_URL}/auth/logout`, {
                withCredentials: true
            });
            return true;
        } catch (error) {
            console.error('Logout failed:', error);
            return false;
        }
    }
}; 