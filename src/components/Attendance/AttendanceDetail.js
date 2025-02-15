import React, { useEffect, useState } from 'react';
import attendanceService from '../../services/attendanceService';
import moment from 'moment-timezone';
import authService from '../../services/authService';

const AttendanceDetail = ({ attendance, onClose, fetchAttendances }) => {
    const [editableAttendance, setEditableAttendance] = useState({
        employeeName: '',
        checkInTime: '',
        checkInImage: null,
        checkOutTime: '',
        checkOutImage: null,
        status: '',
        shiftStartTime: '',
        shiftEndTime: ''
    });
    const [previewCheckInImage, setPreviewCheckInImage] = useState(null);
    const [previewCheckOutImage, setPreviewCheckOutImage] = useState(null);
    const [error, setError] = useState('');
    const [user, setUser] = useState(null);

    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [showConfirmDeleteModal, setShowConfirmDeleteModal] = useState(false);
    const [modalMessage, setModalMessage] = useState('');

    const determineStatus = (checkInTime, checkOutTime, shiftStartTime, shiftEndTime) => {
        const shiftStartDateTime = new Date(shiftStartTime);
        const shiftEndDateTime = new Date(shiftEndTime);
        const checkInDateTime = new Date(checkInTime);
        const checkOutDateTime = checkOutTime ? new Date(checkOutTime) : null;

        // Status Check-in
        let checkInStatus;
        if (checkInDateTime > shiftStartDateTime) {
            checkInStatus = 'Late'; // Terlambat check-in
        } else {
            checkInStatus = 'On Time'; // Tepat waktu check-in atau lebih awal
        }

        // Status Check-out
        let checkOutStatus;
        if (!checkOutTime) {
            checkOutStatus = 'Pending'; // Check-out belum dilakukan
        } else if (checkOutDateTime < shiftEndDateTime) {
            checkOutStatus = 'Underworked'; // Pulang lebih awal
        } else if (checkOutDateTime > shiftEndDateTime) {
            checkOutStatus = 'Overworked'; // Pulang lebih lama
        } else {
            checkOutStatus = 'On Time'; // Tepat waktu check-out
        }

        // Gabungkan status
        return `${checkInStatus}, ${checkOutStatus}`;
    };

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const token = localStorage.getItem('token'); // Ambil token dari localStorage
                const response = await authService.getProfile(token); // Panggil API untuk dapatkan user
                setUser(response.data); // Simpan user ke state
            } catch (error) {
                console.error('Error fetching user profile:', error.message);
                setError('Failed to fetch user profile.');
            }
        };

        fetchUser();

        if (attendance) {
        const API_URL = `${process.env.REACT_APP_API_URL}`
            
            setEditableAttendance({
                employeeName: attendance.employeeName || '',
                checkInTime: attendance.checkInTime ? moment(attendance.checkInTime).tz('Asia/Jakarta').format('YYYY-MM-DDTHH:mm') : '',
                checkInImage: attendance.checkInImage,
                checkOutTime: attendance.checkOutTime ? moment(attendance.checkOutTime).tz('Asia/Jakarta').format('YYYY-MM-DDTHH:mm') : '',
                checkOutImage: attendance.checkOutImage,
                status: attendance.status || '',
                shiftStartTime: attendance.shiftStartTime ? moment(attendance.shiftStartTime).tz('Asia/Jakarta').format('YYYY-MM-DDTHH:mm') : '',
                shiftEndTime: attendance.shiftEndTime ? moment(attendance.shiftEndTime).tz('Asia/Jakarta').format('YYYY-MM-DDTHH:mm') : ''
            });
            setPreviewCheckInImage(`${API_URL}/${attendance.checkInImage}`);
            setPreviewCheckOutImage(`${API_URL}/${attendance.checkOutImage}`);
        }
    }, [attendance]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setEditableAttendance((prevData) => ({
            ...prevData,
            [name]: value,
            status: determineStatus(
                moment(prevData.checkInTime).toISOString(),
                moment(prevData.checkOutTime).toISOString(),
                moment(prevData.shiftStartTime).toISOString(),
                moment(prevData.shiftEndTime).toISOString()
            )
        }));
    };

    const handleImageChange = (e, field) => {
        const file = e.target.files[0];
        if (file) {
            setEditableAttendance((prevData) => ({
                ...prevData,
                [field]: file // Store the image file in the state
            }));
            // Set image preview
            if (field === 'checkInImage') {
                setPreviewCheckInImage(URL.createObjectURL(file));
            } else if (field === 'checkOutImage') {
                setPreviewCheckOutImage(URL.createObjectURL(file));
            }
        }
    };

    const handleSave = async () => {
        try {
            const updatedAttendance = {
                ...editableAttendance,
                checkInTime: moment(editableAttendance.checkInTime).tz('Asia/Jakarta').toISOString(),
                checkOutTime: moment(editableAttendance.checkOutTime).tz('Asia/Jakarta').toISOString(),
                shiftStartTime: moment(editableAttendance.shiftStartTime).tz('Asia/Jakarta').toISOString(),
                shiftEndTime: moment(editableAttendance.shiftEndTime).tz('Asia/Jakarta').toISOString(),
            };

            await attendanceService.updateAttendance(
                attendance._id,
                updatedAttendance,
                editableAttendance.checkInImage || null,
                editableAttendance.checkOutImage || null
            );

            setModalMessage('Data presensi berhasil diperbarui.');
            setShowSuccessModal(true); // Tampilkan modal sukses
            fetchAttendances();
        } catch (error) {
            console.error('Error updating attendance:', error.message);
            setError(error.message || 'An error occurred while updating attendance.');
        }
    };


    const handleDelete = () => {
        setModalMessage('Apakah Anda yakin ingin menghapus data presensi ini?');
        setShowConfirmDeleteModal(true);
    };

    const confirmDelete = async () => {
        try {
            await attendanceService.deleteAttendance(attendance._id);
            setModalMessage('Data presensi berhasil dihapus.');
            setShowSuccessModal(true);
            fetchAttendances();
        } catch (error) {
            setError(error.response ? error.response.data.message : error.message);
        }
        setShowConfirmDeleteModal(false);
    };

    const handleCancel = () => {
        setEditableAttendance({
            employeeName: attendance.employeeName || '',
            checkInTime: attendance.checkInTime ? moment(attendance.checkInTime).tz('Asia/Jakarta').format('YYYY-MM-DDTHH:mm') : '',
            checkInImage: attendance.checkInImage,
            checkOutTime: attendance.checkOutTime ? moment(attendance.checkOutTime).tz('Asia/Jakarta').format('YYYY-MM-DDTHH:mm') : '',
            checkOutImage: attendance.checkOutImage,
            status: attendance.status || '',
            shiftStartTime: attendance.shiftStartTime ? moment(attendance.shiftStartTime).tz('Asia/Jakarta').format('YYYY-MM-DDTHH:mm') : '',
            shiftEndTime: attendance.shiftEndTime ? moment(attendance.shiftEndTime).tz('Asia/Jakarta').format('YYYY-MM-DDTHH:mm') : ''
        });
        onClose();
    };

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div className="bg-white rounded-lg shadow-lg p-8 w-11/12 md:w-2/3 max-h-[80vh] overflow-auto transform transition-all">
                {error && <p className="text-red-500 mb-4">{error}</p>}
                {attendance ? (
                    <div>
                        <h2 className="text-2xl font-semibold mb-6 text-gray-800">Edit Data Presensi</h2>

                        {/* Employee Name */}
                        <label className="block mb-4">
                            <strong className="text-gray-600">Employee Name:</strong>
                            <input
                                type="text"
                                name="employeeName"
                                value={editableAttendance.employeeName}
                                onChange={handleChange}
                                className="w-full px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg text-gray-700"
                            />
                        </label>

                        {/* Check In Time */}
                        <label className="block mb-4">
                            <strong className="text-gray-600">Check In Time:</strong>
                            <input
                                type="datetime-local"
                                name="checkInTime"
                                value={editableAttendance.checkInTime}
                                onChange={handleChange}
                                className="w-full px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg text-gray-700"
                            />
                        </label>

                        {/* Check In Image */}
                        <label className="block mb-4">
                            <strong className="text-gray-600">Check In Image:</strong>
                            <div className="mt-2">
                                {previewCheckInImage ? (
                                    <img
                                        src={previewCheckInImage}
                                        alt="Check-in"
                                        className="w-24 h-24 object-cover my-2 rounded-lg shadow-md transform transition-transform hover:scale-105"
                                    />
                                ) : (
                                    <p className="text-gray-500">No image available</p>
                                )}
                                <input
                                    type="file"
                                    name="checkInImage"
                                    accept="image/*"
                                    onChange={(e) => handleImageChange(e, 'checkInImage')}
                                    className="w-full px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg text-gray-700"
                                />
                            </div>
                        </label>

                        {/* Check Out Time */}
                        <label className="block mb-4">
                            <strong className="text-gray-600">Check Out Time:</strong>
                            <input
                                type="datetime-local"
                                name="checkOutTime"
                                value={editableAttendance.checkOutTime}
                                onChange={handleChange}
                                className="w-full px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg text-gray-700"
                            />
                        </label>

                        {/* Check Out Image */}
                        <label className="block mb-4">
                            <strong className="text-gray-600">Check Out Image:</strong>
                            <div className="mt-2">
                                {previewCheckOutImage ? (
                                    <img
                                        src={previewCheckOutImage}
                                        alt="Check-out"
                                        className="w-24 h-24 object-cover my-2 rounded-lg shadow-md transform transition-transform hover:scale-105"
                                    />
                                ) : (
                                    <p className="text-gray-500">No image available</p>
                                )}
                                <input
                                    type="file"
                                    name="checkOutImage"
                                    accept="image/*"
                                    onChange={(e) => handleImageChange(e, 'checkOutImage')}
                                    className="w-full px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg text-gray-700"
                                />
                            </div>
                        </label>

                        {/* Status */}
                        <label className="block mb-4">
                            <strong className="text-gray-600">Status:</strong>
                            <input
                                type="text"
                                name="status"
                                value={editableAttendance.status}
                                readOnly
                                className="w-full px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg text-gray-700"
                            />
                        </label>

                        {/* Shift Start Time */}
                        <label className="block mb-4">
                            <strong className="text-gray-600">Shift Start Time:</strong>
                            <input
                                type="datetime-local"
                                name="shiftStartTime"
                                value={editableAttendance.shiftStartTime}
                                onChange={handleChange}
                                className="w-full px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg text-gray-700"
                            />
                        </label>

                        {/* Shift End Time */}
                        <label className="block mb-6">
                            <strong className="text-gray-600">Shift End Time:</strong>
                            <input
                                type="datetime-local"
                                name="shiftEndTime"
                                value={editableAttendance.shiftEndTime}
                                onChange={handleChange}
                                className="w-full px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg text-gray-700"
                            />
                        </label>

                        {/* Action Buttons */}
                        <div className="flex space-x-4 mt-6">
                            {user?.role === 'admin' && (
                                <button
                                    onClick={handleSave}
                                    className="px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition"
                                >
                                    Save
                                </button>
                            )}
                            {user?.role === 'admin' && (
                                <button
                                    onClick={handleDelete}
                                    className="px-6 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition"
                                >
                                    Delete
                                </button>
                            )}
                            <button
                                onClick={handleCancel}
                                className="px-6 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                ) : (
                    <p>Loading...</p>
                )}
            </div>

            {showSuccessModal && (
                <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg w-96">
                        <h2 className="text-xl font-semibold text-gray-800">Berhasil</h2>
                        <p className="mt-4 text-gray-600">{modalMessage}</p>
                        <div className="mt-6 flex justify-end">
                            <button
                                onClick={() => {
                                    setShowSuccessModal(false);
                                    onClose(); // Tutup form setelah modal sukses
                                }}
                                className="px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition"
                            >
                                OK
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {showConfirmDeleteModal && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg w-96">
                        <h2 className="text-xl font-semibold text-gray-800">Konfirmasi Hapus</h2>
                        <p className="mt-4 text-gray-600">{modalMessage}</p>
                        <div className="mt-6 flex justify-end space-x-4">
                            <button
                                onClick={confirmDelete}
                                className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition"
                            >
                                Hapus
                            </button>
                            <button
                                onClick={() => setShowConfirmDeleteModal(false)}
                                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition"
                            >
                                Batal
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AttendanceDetail;
