import api from './api';

export const getTasks = async (params: any) => {
    const res = await api.get('/tasks', { params });
    return res.data;
};

export const createTask = async (data: any) => {
    const res = await api.post('/tasks', data);
    return res.data;
};

export const updateTask = async (id: string, data: any) => {
    const res = await api.patch(`/tasks/${id}`, data);
    return res.data;
};

export const toggleTask = async (id: string) => {
    const res = await api.patch(`/tasks/${id}/toggle`);
    return res.data;
};

export const deleteTask = async (id: string) => {
    const res = await api.delete(`/tasks/${id}`);
    return res.data;
};
