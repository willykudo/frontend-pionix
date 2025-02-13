import axios from 'axios';
import moment from 'moment-timezone'; // Ensure moment-timezone is installed

// Base URL for the API
const API_URL = '/api/attendance';

// Function to add check-in data
const addCheckIn = async (checkInData, checkInImage) => {
    const formData = new FormData();
    formData.append('checkInImage', checkInImage);
    formData.append('employeeId', checkInData.employeeId);
    formData.append('employeeName', checkInData.employeeName);

    // Convert time to UTC for sending to the backend
    const shiftStartTime = moment(checkInData.shiftStartTime).tz('Asia/Jakarta').toISOString();
    const shiftEndTime = moment(checkInData.shiftEndTime).tz('Asia/Jakarta').toISOString();

    formData.append('shiftStartTime', shiftStartTime);
    formData.append('shiftEndTime', shiftEndTime);

    try {
        const response = await axios.post(`${API_URL}/checkin`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });

        // Store the newly added attendance ID in localStorage
        localStorage.setItem('currentAttendanceId', response.data._id);
        return response.data;
    } catch (error) {
        console.error('Error details:', error.response); // Log error details
        throw new Error(error.response.data.message || 'An error occurred while adding check-in data');
    }
};

// Function to add check-out data
const addCheckOut = async (checkOutImage) => {
    const currentAttendanceId = localStorage.getItem('currentAttendanceId');

    if (!currentAttendanceId) {
        throw new Error('Attendance ID is not available, please check in first');
    }

    const formData = new FormData();
    formData.append('checkOutImage', checkOutImage);

    try {
        const response = await axios.post(`${API_URL}/checkout/${currentAttendanceId}`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });

        // Remove attendance ID from localStorage after check-out
        localStorage.removeItem('currentAttendanceId');
        return response.data;
    } catch (error) {
        console.error('Error details:', error.response); // Log error details
        throw new Error(error.response.data.message || 'An error occurred while adding check-out data');
    }
};

// Function to get all attendance records
const getAllAttendance = async (token) => {
    try {
        const response = await axios.get(API_URL, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    } catch (error) {
        console.error('Error details:', error.response); // Log error details
        throw new Error(error.response.data.message || 'An error occurred while retrieving attendance records');
    }
};

// Function to get attendance details by ID
const getAttendanceById = async (attendanceId) => {
    try {
        const response = await axios.get(`${API_URL}/${attendanceId}`);
        return response.data;
    } catch (error) {
        console.error('Error details:', error.response); // Log error details
        throw new Error(error.response.data.message || 'An error occurred while retrieving attendance details');
    }
};

// Function to update attendance data
const updateAttendance = async (id, attendanceData, checkInImage, checkOutImage) => {
    const formData = new FormData();
    formData.append('employeeName', attendanceData.employeeName);
    formData.append('checkInTime', attendanceData.checkInTime);
    formData.append('checkOutTime', attendanceData.checkOutTime);
    formData.append('shiftStartTime', attendanceData.shiftStartTime);
    formData.append('shiftEndTime', attendanceData.shiftEndTime);
    formData.append('status', attendanceData.status);

    if (checkInImage) {
        formData.append('checkInImage', checkInImage);
    }
    if (checkOutImage) {
        formData.append('checkOutImage', checkOutImage);
    }

    try {
        const response = await axios.put(`/api/attendance/${id}`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    } catch (error) {
        // Log the error response for more details
        console.error('Error updating attendance:', error.response);
        throw new Error(error.response.data.message || 'Failed to update attendance');
    }
};

// Function to delete attendance data
const deleteAttendance = async (attendanceId) => {
    try {
        await axios.delete(`${API_URL}/${attendanceId}`);
    } catch (error) {
        console.error('Error details:', error.response); // Log error details
        throw new Error(error.response.data.message || 'An error occurred while deleting attendance data');
    }
};

// Export service
export default {
    addCheckIn,
    addCheckOut,
    getAllAttendance,
    getAttendanceById,
    updateAttendance,
    deleteAttendance,
};
