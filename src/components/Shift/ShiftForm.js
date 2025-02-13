import React, { useState, useEffect } from 'react';
import shiftService from '../../services/shiftService';
import authService from '../../services/authService';

const ShiftForm = ({ isEditMode, selectedShift, closeForm, selectedDate, fetchShifts }) => {
    const [shift, setShift] = useState({
        employeeNames: [], // Array untuk banyak pengguna
        employeeIds: [],   // Array untuk menyimpan ID pengguna
        shiftType: 'Morning',
        startDate: '',
        endDate: '',
        shiftStart: '08:00',
        shiftEnd: '16:00',
        notes: '',
    });
    const [users, setUsers] = useState([]); // State for users
    const [message, setMessage] = useState('');
    const [user, setUser] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false); // State untuk modal notifikasi

    // Fetch users and populate shift data if in edit mode
    useEffect(() => {
        const fetchUsers = async () => {
            const token = localStorage.getItem('token'); // Ambil token dari localStorage
            if (token) {
                try {
                    const res = await authService.getProfile(token);
                    setUser(res.data);
                    localStorage.setItem('user', JSON.stringify(res.data));
                    const response = await authService.getAllUsers(token); // Menggunakan authService
                    const allUsers = response.data; // Simpan data user sementara

                    if (res.data.role === 'karyawan') {
                        // Jika role adalah karyawan, filter hanya nama mereka sendiri
                        const currentUser = allUsers.filter((u) => u._id === res.data._id);
                        setUsers(currentUser); // Set hanya data karyawan sendiri
                    } else {
                        // Jika admin, set semua pengguna
                        setUsers(allUsers);
                    }

                    console.log("Authorized User List:", response.data); // Log data userList ke konsol
                } catch (error) {
                    console.error("Error fetching user list:", error); // Log error jika terjadi
                    if (error.response?.status === 401) {
                        setMessage('Unauthorized: Please log in again.');
                    } else {
                        setMessage('Error fetching user list.');
                    }
                }
            }
        };

        fetchUsers();

        if (isEditMode && selectedShift) {
            setShift({
                ...selectedShift,
                employeeNames: selectedShift.employeeIds.map(user => user.name),
                employeeIds: selectedShift.employeeIds.map(user => user._id),
            });
        }

        if (selectedDate) {
            setShift((prevState) => ({
                ...prevState,
                startDate: new Date(selectedDate).toLocaleDateString('en-CA'),
                endDate: new Date(selectedDate).toLocaleDateString('en-CA'),
            }));
        }
    }, [isEditMode, selectedShift, selectedDate]);

    const handleShiftTypeChange = (e) => {
        const selectedType = e.target.value;
        const times = selectedType === 'Morning'
            ? { shiftStart: '08:00', shiftEnd: '16:00' }
            : { shiftStart: '12:00', shiftEnd: '20:00' };

        setShift({ ...shift, shiftType: selectedType, ...times });
    };

    const handleEmployeeChange = (e) => {
        const selectedEmployeeIds = Array.from(e.target.selectedOptions, option => option.value);
        const selectedEmployeeNames = Array.from(e.target.selectedOptions, option => option.text);

        setShift({ ...shift, employeeIds: selectedEmployeeIds, employeeNames: selectedEmployeeNames });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!shift.startDate || !shift.endDate || !shift.shiftStart || !shift.shiftEnd || !shift.employeeIds.length) {
            setMessage('Please fill in all required fields.');
            return;
        }

        const shiftData = {
            ...shift,
            employeeIds: shift.employeeIds, // Simpan hanya ID karyawan
        };

        try {
            if (isEditMode) {
                await shiftService.updateShift(selectedShift._id, shiftData);
                setMessage('Shift berhasil diperbarui');
                fetchShifts();
            } else {
                await shiftService.createShift(shiftData);
                setMessage('Shift berhasil ditambahkan');
                fetchShifts();
            }

            // Show the success message modal after form submission
            setIsModalOpen(true);
        } catch (error) {
            console.error('Error submitting shift:', error);
        }
    };

    const closeModal = () => {

    };

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50">
            <div className="bg-white p-6 rounded-lg shadow-lg w-1/3">
                <h2 className="text-2xl font-bold text-gray-800">{isEditMode ? 'Edit Shift' : 'Buat Shift'}</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block mb-2 text-sm font-semibold text-gray-600">Nama Karyawan</label>
                        <select
                            multiple
                            value={shift.employeeIds}
                            onChange={handleEmployeeChange}
                            className="w-full px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg text-gray-700"
                        >
                            {users.map((user) => (
                                <option key={user._id} value={user._id}>
                                    {user.name}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block mb-2 text-sm font-semibold text-gray-600">Tipe Shift</label>
                        <select
                            value={shift.shiftType}
                            onChange={handleShiftTypeChange}
                            className="w-full px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg text-gray-700"
                        >
                            <option value="Morning">Morning</option>
                            <option value="Afternoon">Afternoon</option>
                        </select>
                    </div>
                    <div>
                        <label className="block mb-2 text-sm font-semibold text-gray-600">Hari Mulai Shift</label>
                        <input
                            type="date"
                            value={shift.startDate}
                            onChange={(e) => setShift({ ...shift, startDate: e.target.value })}
                            className="w-full px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg text-gray-700"
                        />
                    </div>
                    <div>
                        <label className="block mb-2 text-sm font-semibold text-gray-600">Hari Terakhir Shift</label>
                        <input
                            type="date"
                            value={shift.endDate}
                            onChange={(e) => setShift({ ...shift, endDate: e.target.value })}
                            className="w-full px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg text-gray-700"
                        />
                    </div>
                    <div>
                        <label className="block mb-2 text-sm font-semibold text-gray-600">Waktu Shift Dimulai</label>
                        <input
                            type="time"
                            value={shift.shiftStart}
                            onChange={(e) => setShift({ ...shift, shiftStart: e.target.value })}
                            className="w-full px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg text-gray-700"
                        />
                    </div>
                    <div>
                        <label className="block mb-2 text-sm font-semibold text-gray-600">Waktu Shift Berakhir</label>
                        <input
                            type="time"
                            value={shift.shiftEnd}
                            onChange={(e) => setShift({ ...shift, shiftEnd: e.target.value })}
                            className="w-full px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg text-gray-700"
                        />
                    </div>
                    <div>
                        <label className="block mb-2 text-sm font-semibold text-gray-600">Catatan</label>
                        <textarea
                            value={shift.notes}
                            onChange={(e) => setShift({ ...shift, notes: e.target.value })}
                            className="w-full px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg text-gray-700"
                        />
                    </div>
                    <div className="flex justify-between mt-6">
                        <button
                            type="submit"
                            className="px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition"
                        >
                            {isEditMode ? 'Edit Shift' : 'Buat Shift'}
                        </button>
                        <button
                            type="button"
                            onClick={closeForm}
                            className="px-6 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition"
                        >
                            Batal
                        </button>
                    </div>
                </form>
            </div>

            {/* Modal notifikasi */}
            {isModalOpen && (
                <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg w-96">
                        <h2 className="text-xl font-semibold text-gray-800">Berhasil</h2>
                        <p className="mt-4 text-gray-600">{message}</p>
                        <div className="mt-6 flex justify-end">
                            <button
                                onClick={() => {
                                    setIsModalOpen(false);
                                    closeForm();
                                }}
                                className="px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition"
                            >
                                Ok
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ShiftForm;
