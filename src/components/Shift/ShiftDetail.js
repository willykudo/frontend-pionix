import React, { useState, useEffect } from 'react';
import shiftService from '../../services/shiftService';
import ShiftForm from './ShiftForm';
import { format, parseISO } from 'date-fns';
import authService from '../../services/authService';

const ShiftDetail = ({ closeDetail, fetchShifts }) => {
    const [shifts, setShifts] = useState([]);
    const [message, setMessage] = useState('');
    const [isFormVisible, setIsFormVisible] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [selectedShift, setSelectedShift] = useState(null);
    const [user, setUser] = useState(null);
    const [employeeFilter, setEmployeeFilter] = useState('');

    const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
    const [shiftToDelete, setShiftToDelete] = useState(null);

    const selectedShiftType = localStorage.getItem('selectedShiftType');
    const selectedShiftDate = localStorage.getItem('selectedShiftDate');
    const selectedShiftEndDate = localStorage.getItem('selectedShiftEndDate');

    useEffect(() => {
        const fetchShifts = async () => {
            const token = localStorage.getItem('token');
            if (token) {
                try {
                    const response = await authService.getProfile(token);
                    setUser(response.data);
                    const fetchedShifts = await shiftService.getShifts(token);

                    const filteredShifts = fetchedShifts.filter(
                        (shift) =>
                            shift.shiftType === selectedShiftType &&
                            shift.startDate === selectedShiftDate &&
                            shift.endDate === selectedShiftEndDate
                    );
                    fetchShifts()
                    setShifts(filteredShifts);
                } catch (error) {
                    setMessage('Error fetching shifts: ' + (error.response?.data?.message || error.message));
                }
            }
        };

        fetchShifts();
    }, [selectedShiftType, selectedShiftDate, selectedShiftEndDate]);

    // Filter shifts by employee name
    const filteredShifts = shifts.filter((shift) =>
        shift.employeeIds.some(emp => emp.name.toLowerCase().includes(employeeFilter.toLowerCase()))
    );

    const handleEditShift = (shift) => {
        setSelectedShift(shift);
        setIsFormVisible(true);
        setIsEditMode(true);
    };

    const handleDeleteShift = (shiftId) => {
        setMessage("Apakah Anda yakin ingin menghapus jadwal shift ini?");
        setIsDeleteModalVisible(true);
        setShiftToDelete(shiftId);
    };

    const confirmDeleteShift = async () => {
        if (shiftToDelete) {
            try {
                await shiftService.deleteShift(shiftToDelete);
                setShifts(shifts.filter((shift) => shift._id !== shiftToDelete));
                fetchShifts();
            } catch (error) {
                setMessage(error.response?.data?.message || error.message);
            } finally {
                setIsDeleteModalVisible(false); // Hide delete modal
                setShiftToDelete(null); // Clear shift ID
            }
        }
    };

    const cancelDeleteShift = () => {
        setIsDeleteModalVisible(false); // Sembunyikan modal
        setShiftToDelete(null); // Hapus ID shift
        setMessage(''); // Reset pesan
    };
    const closeForm = () => {
        setIsFormVisible(false);
        setIsEditMode(false);
        setSelectedShift(null);
    };

    // Pagination logic
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 6; // Adjust number of items per page

    const paginate = (shifts) => {
        const indexOfLastShift = currentPage * itemsPerPage;
        const indexOfFirstShift = indexOfLastShift - itemsPerPage;
        return shifts.slice(indexOfFirstShift, indexOfLastShift);
    };

    const totalPages = Math.ceil(filteredShifts.length / itemsPerPage);

    return (
        <div className="container mx-auto p-6 space-y-6">
            <h2 className="text-3xl font-semibold text-gray-800">
                Shift {selectedShiftType === 'Morning' ? 'Pagi' : 'Siang'} tanggal {format(parseISO(selectedShiftDate), 'dd-MM-yyyy')}
            </h2>

            {/* Employee filter input */}
            <div className="flex justify-between items-center mb-6">
                {/* Back Button */}
                <button
                    onClick={closeDetail}
                    className="px-6 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition"
                >
                    Kembali
                </button>

                {/* Employee Filter */}
                <div className="flex items-center space-x-2">
                    <label htmlFor="employeeFilter" className="text-gray-700"></label>
                    <input
                        id="employeeFilter"
                        type="text"
                        placeholder="Cari nama karyawan..."
                        className="px-4 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={employeeFilter}
                        onChange={(e) => setEmployeeFilter(e.target.value)}
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 gap-6 mt-8 md:grid-cols-2 lg:grid-cols-3">
                {filteredShifts.length > 0 ? (
                    paginate(filteredShifts).map((shift) => (
                        <div
                            key={shift._id}
                            className="bg-white p-6 rounded-lg shadow-lg hover:shadow-2xl transition duration-300 ease-in-out transform hover:scale-105"
                        >
                            <div className="flex justify-between items-center">
                                <p className="text-xl font-semibold">{shift.shiftType === 'Morning' ? 'Pagi' : 'Siang'}</p>
                                <p className="text-sm text-gray-500">
                                    {format(parseISO(shift.startDate), 'dd-MM-yyyy')}
                                </p>
                            </div>
                            <p className="mt-2 text-gray-700"><strong>Nama Karyawan:</strong> {shift.employeeIds.map(emp => emp.name).join(', ')}</p>
                            <p className="mt-1 text-gray-700"><strong>Waktu mulai shift:</strong> {shift.shiftStart}</p>
                            <p className="mt-1 text-gray-700"><strong>Waktu selesai shift:</strong> {shift.shiftEnd}</p>
                            <p className="mt-2 text-sm text-gray-500">{shift.notes || 'Tidak ada catatan'}</p>

                            {user?.role === 'admin' && (
                                <div className="mt-4 flex space-x-4">
                                    <button
                                        onClick={() => handleEditShift(shift)}
                                        className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition"
                                    >
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => handleDeleteShift(shift._id)}
                                        className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition"
                                    >
                                        Hapus
                                    </button>
                                </div>
                            )}
                        </div>
                    ))
                ) : (
                    <p className="text-gray-500 text-center col-span-full">Tidak ada shift yang tersedia</p>
                )}
            </div>

            {/* Pagination Controls */}
            <div className="flex justify-center items-center mt-4 space-x-4">
                <button
                    onClick={() => setCurrentPage(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 disabled:opacity-50"
                >
                    Sebelumnya
                </button>
                <span className="text-sm text-gray-600">
                    Halaman {currentPage} dari {totalPages}
                </span>
                <button
                    onClick={() => setCurrentPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 disabled:opacity-50"
                >
                    Selanjutnya
                </button>
            </div>

            {isFormVisible && (
                <ShiftForm
                    fetchShifts={fetchShifts}
                    isEditMode={isEditMode}
                    selectedShift={selectedShift}
                    closeForm={closeForm}
                    onSave={(shift) => {
                        setShifts(shifts.map(s => s._id === shift._id ? shift : s));
                    }}
                />
            )}

            {/* Delete Confirmation Modal */}
            {isDeleteModalVisible && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg w-96">
                        <h2 className="text-xl font-semibold text-gray-800">Konfirmasi Hapus</h2>
                        <p className="mt-4 text-gray-600">{message}</p>
                        <div className="mt-6 flex justify-end space-x-4">
                            <button
                                onClick={confirmDeleteShift}
                                className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition"
                            >
                                Hapus
                            </button>
                            <button
                                onClick={cancelDeleteShift}
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

export default ShiftDetail;
