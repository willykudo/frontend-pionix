// src/services/authService.js
import axios from 'axios';

const API_URL = `${process.env.REACT_APP_API_URL}/api/auth`;

const register = async (userData) => {
    return await axios.post(`${API_URL}/register`, userData);
};

const login = async (userData) => {
    return await axios.post(`${API_URL}/login`, userData);
};

const getAllUsers = async (token) => {
    return await axios.get(`${API_URL}/users`, {
        headers: { Authorization: `Bearer ${token}` }
    });
};

const getUserById = async (id, token) => {
    return await axios.get(`${API_URL}/users/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
    });
};

const updateUser = async (id, userData) => {
    return await axios.put(`${API_URL}/users/${id}`, userData);
};

const deleteUser = async (id) => {
    return await axios.delete(`${API_URL}/users/${id}`);
};

const getProfile = async (token) => {
    return await axios.get(`${API_URL}/profile`, {
        headers: { Authorization: `Bearer ${token}` }
    });
};

const resetPassword = async (username, newPassword) => {
    return await axios.post(`${API_URL}/reset-password`, { username, newPassword });
}

const authService = {
    register,
    login,
    getAllUsers,
    getProfile,
    getUserById,
    updateUser,
    deleteUser,
    resetPassword
};

export default authService;
