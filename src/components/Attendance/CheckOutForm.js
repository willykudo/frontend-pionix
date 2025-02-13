import React, { useState } from 'react';
import attendanceService from '../../services/attendanceService';

const CheckOutForm = ({ onCancel, fetchAttendances, onClose }) => {
    const [checkOutImage, setCheckOutImage] = useState(null);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [showSuccessModal, setShowSuccessModal] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccessMessage('');

        try {
            // Get attendance ID from localStorage
            const currentAttendanceId = localStorage.getItem('currentAttendanceId');

            // Ensure attendance ID is available
            if (!currentAttendanceId) {
                throw new Error('ID presensi tidak tersedia, silakan lakukan check-in terlebih dahulu');
            }

            // Call service to add check-out
            await attendanceService.addCheckOut(checkOutImage);
            setSuccessMessage('Data check out berhasil ditambahkan.');

            // Reset form after success
            setCheckOutImage(null);
            fetchAttendances();

            setShowSuccessModal(true); // Tampilkan modal sukses
        } catch (error) {
            setError(error.message);
        }
    };

    return (
        <div className="max-w-md mx-auto p-8 bg-white rounded-lg shadow-xl space-y-6">
            <h2 className="text-2xl font-semibold text-center text-gray-800">Check Out</h2>

            {error && <p className="text-red-500 text-sm text-center">{error}</p>}

            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label htmlFor="checkOutImage" className="block text-gray-700 font-medium mb-2">
                        Gambar Check-Out
                    </label>
                    <input
                        type="file"
                        id="checkOutImage"
                        onChange={(e) => setCheckOutImage(e.target.files[0])}
                        accept="image/*"
                        required
                        className="w-full px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg text-gray-700"
                    />
                </div>

                <div className="flex justify-between space-x-4">
                    <button
                        type="submit"
                        className="w-full py-3 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 transition focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        Check Out
                    </button>
                    <button
                        type="button"
                        onClick={onCancel}
                        className="w-full py-3 bg-gray-300 text-gray-700 font-semibold rounded-md hover:bg-gray-400 transition focus:outline-none focus:ring-2 focus:ring-gray-500"
                    >
                        Batal
                    </button>
                </div>
            </form>

            {/* Success Modal */}
            {showSuccessModal && (
                <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg w-96">
                        <h2 className="text-xl font-semibold text-gray-800">Berhasil</h2>
                        <p className="mt-4 text-gray-600">{successMessage}</p>
                        <div className="mt-6 flex justify-end">
                            <button
                                onClick={() => {
                                    setShowSuccessModal(false);
                                    onClose(); // Baru tutup form setelah modal sukses ditampilkan
                                }}
                                className="px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition"
                            >
                                OK
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CheckOutForm;
