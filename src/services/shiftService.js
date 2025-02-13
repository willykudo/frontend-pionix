import axios from 'axios';

const API_URL = '/api/shifts';  // Sesuaikan dengan URL backend Anda

// Mengambil semua shift
const getShifts = async (token) => {
    try {
        const response = await axios.get(API_URL, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    } catch (error) {
        console.error("Error fetching shifts:", error);
        throw error;
    }
};

// Mengambil shift berdasarkan ID
const getShiftById = async (id) => {
    try {
        const response = await axios.get(`${API_URL}/${id}`);
        return response.data;
    } catch (error) {
        console.error(`Error fetching shift with id ${id}:`, error);
        throw error;
    }
};

// Membuat shift (untuk banyak user atau satu user dalam beberapa hari)
const createShift = async (shiftData) => {
    try {
        console.log("Sending shift data:", shiftData);  // Debugging log
        const response = await axios.post(API_URL, shiftData);
        console.log("Shift created:", response.data);  // Debugging log
        return response.data;
    } catch (error) {
        console.error("Error creating shift:", error);  // Log error in console
        if (error.response && error.response.status === 400) {
            alert("Duplikasi shift terdeteksi untuk user yang sama pada hari yang sama!");
        }
        throw error;
    }
};

// Mengupdate shift (untuk satu atau lebih user)
const updateShift = async (id, shiftData) => {
    try {
        console.log("Updating shift data:", shiftData);  // Debugging log
        const response = await axios.put(`${API_URL}/${id}`, shiftData);
        console.log("Shift updated:", response.data);  // Debugging log
        return response.data;
    } catch (error) {
        console.error("Error updating shift:", error);  // Log error in console
        if (error.response && error.response.status === 400) {
            alert("Duplikasi shift terdeteksi atau data tidak valid.");
        }
        throw error;
    }
};

// Menghapus shift
const deleteShift = async (id) => {
    try {
        const response = await axios.delete(`${API_URL}/${id}`);
        return response.data;
    } catch (error) {
        console.error("Error deleting shift:", error);  // Log error in console
        throw error;
    }
};



export default {
    getShifts,
    getShiftById,
    createShift,
    updateShift,
    deleteShift,
};
