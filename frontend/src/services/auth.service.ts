import api from './api';

export const register = async (userData: any) => {
    const res = await api.post('/auth/register', userData);
    return res.data;
};

export const login = async (credentials: any) => {
    const res = await api.post('/auth/login', credentials);
    if (res.data.success && res.data.accessToken) {
        localStorage.setItem('accessToken', res.data.accessToken);
        localStorage.setItem('refreshToken', res.data.refreshToken);
    }
    return res.data;
};

export const logout = async () => {
    await api.post('/auth/logout');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
};

export const getProfile = async () => {
    const res = await api.get('/auth/profile');
    return res.data;
};

export const updateProfile = async (userData: any) => {
    const res = await api.put('/auth/profile', userData);
    return res.data;
};
