import axios from 'axios';

const API_URL = '/api/rentals'; // Ganti dengan URL backend yang sesuai

// Fungsi untuk mengambil semua penyewaan
export const fetchRentals = async (token) => {
    const response = await axios.get(API_URL, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
};

// Fungsi untuk menambah penyewaan baru
export const createRental = async (rentalData) => {
    try {
        console.log('Sending data to API:', rentalData); // Debug data sebelum request
        const response = await axios.post(API_URL, rentalData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        console.log('Response from API:', response.data); // Debug respons dari API
        return response.data;
    } catch (error) {
        console.error('Error in createRental:', error.response || error.message);
        throw error; // Lempar error ke komponen yang memanggil
    }
};


// Fungsi untuk memperbarui penyewaan berdasarkan ID
export const updateRental = async (rentalId, rentalData) => {
    const response = await axios.put(`${API_URL}/${rentalId}`, rentalData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    return response.data;
};

// Fungsi untuk menghapus penyewaan berdasarkan ID
export const deleteRental = async (rentalId) => {
    await axios.delete(`${API_URL}/${rentalId}`);
};

export default {
    fetchRentals,
    createRental,
    updateRental,
    deleteRental,
};
