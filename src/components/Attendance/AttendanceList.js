import React, { useEffect, useState } from 'react';
import attendanceService from '../../services/attendanceService';
import CheckInForm from './CheckInForm';
import CheckOutForm from './CheckOutForm';
import AttendanceDetail from './AttendanceDetail';

const AttendanceList = () => {
    const [attendances, setAttendances] = useState([]);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);
    const [showCheckInForm, setShowCheckInForm] = useState(false);
    const [showCheckOutForm, setShowCheckOutForm] = useState(false);
    const [selectedAttendanceId, setSelectedAttendanceId] = useState(null);
    const [selectedAttendance, setSelectedAttendance] = useState(null);

    // State for filters
    const [searchQuery, setSearchQuery] = useState('');
    const [statusQuery, setStatusQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;



    const fetchAttendances = async () => {
        const token = localStorage.getItem('token');
        if (token) {
            setLoading(true);
            try {
                const data = await attendanceService.getAllAttendance(token);
                setAttendances(data);
            } catch (error) {
                setError(error.message);
            } finally {
                setLoading(false);
            }
        }
    };

    useEffect(() => {
        fetchAttendances();
    }, []);

    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    const handleCheckInClick = () => {
        setShowCheckInForm(true);
        setShowCheckOutForm(false);
        setSelectedAttendanceId(null);
        setSelectedAttendance(null);
    };

    const handleCheckOutClick = (attendanceId) => {
        setSelectedAttendanceId(attendanceId);
        setShowCheckOutForm(true);
        setShowCheckInForm(false);
    };

    const handleRowClick = async (attendance) => {
        try {
            const attendanceDetails = await attendanceService.getAttendanceById(attendance._id);
            setSelectedAttendance(attendanceDetails);
        } catch (error) {
            console.error('Error fetching attendance details:', error.message);
            setError('Failed to fetch attendance details.');
        }
    };

    const handleCancelClick = () => {
        setShowCheckInForm(false);
        setShowCheckOutForm(false);
        setSelectedAttendanceId(null);
        setSelectedAttendance(null);
    };

    const handleClose = () => {
        setShowCheckInForm(false);
        setShowCheckOutForm(false);
        setSelectedAttendance(null);
    };

    const filteredAttendances = attendances.filter((attendance) => {
        const searchLower = searchQuery.toLowerCase();
        const nameMatch = attendance.employeeName.toLowerCase().includes(searchLower);
        const statusMatch = attendance.status.toLowerCase().includes(searchLower);

        return nameMatch || statusMatch; // Cek apakah salah satu cocok
    });

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredAttendances.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredAttendances.length / itemsPerPage);

    return (
        <div className="p-6 bg-gradient-to-b from-blue-100 via-gray-100 to-gray-50 min-h-screen items-center">
            <h1 className="text-3xl font-semibold text-gray-800 text-center mb-8">Daftar Presensi</h1>
            {loading ? (
                <div className="flex justify-center items-center h-40">
                    <p className="text-lg text-gray-600">Loading attendance records...</p>
                </div>
            ) : (
                <>
                    {error && <p className="text-red-500 text-center mb-4">{error}</p>}

                    <div className="flex justify-between items-center mb-6">
                        <input
                            type="text"
                            placeholder="Cari nama atau status..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="px-4 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <button
                            onClick={handleCheckInClick}
                            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
                        >
                            Tambah Check-In
                        </button>
                    </div>

                    <div className="overflow-x-auto bg-white shadow-md rounded-lg border border-gray-200">
                        <table className="min-w-full table-auto">
                            <thead className="bg-blue-50">
                                <tr>
                                    <th className="py-3 px-6 text-sm font-medium text-gray-700">Nama Karyawan</th>
                                    <th className="py-3 px-6 text-sm font-medium text-gray-700">Waktu Check In</th>
                                    <th className="py-3 px-6 text-sm font-medium text-gray-700">Waktu Check Out</th>
                                    <th className="py-3 px-6 text-sm font-medium text-gray-700">Status</th>
                                    <th className="py-3 px-6 text-sm font-medium text-gray-700">Shift Mulai</th>
                                    <th className="py-3 px-6 text-sm font-medium text-gray-700">Shift Selesai</th>
                                    <th className="py-3 px-6 text-sm font-medium text-gray-700">Gambar Check In</th>
                                    <th className="py-3 px-6 text-sm font-medium text-gray-700">Gambar Check Out</th>
                                    <th className="py-3 px-6 text-sm font-medium text-gray-700 text-center">Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                {currentItems.length > 0 ? (
                                    currentItems.map((attendance) => (
                                        <tr
                                            key={attendance._id}
                                            className="hover:bg-gray-50 cursor-pointer border-b"
                                            onClick={() => handleRowClick(attendance)}
                                        >
                                            <td className="py-3 px-6 text-sm text-gray-700">{attendance.employeeName}</td>
                                            <td className="py-3 px-6 text-sm text-gray-500">
                                                {attendance.checkInTime
                                                    ? new Date(attendance.checkInTime).toLocaleString()
                                                    : 'Belum Check In'}
                                            </td>
                                            <td className="py-3 px-6 text-sm text-gray-500">
                                                {attendance.checkOutTime
                                                    ? new Date(attendance.checkOutTime).toLocaleString()
                                                    : 'Belum Check Out'}
                                            </td>
                                            <td className="py-3 px-6 text-sm text-gray-500">{attendance.status}</td>
                                            <td className="py-3 px-6 text-sm text-gray-500">
                                                {attendance.shiftStartTime
                                                    ? new Date(attendance.shiftStartTime).toLocaleString()
                                                    : 'Tidak Tersedia'}
                                            </td>
                                            <td className="py-3 px-6 text-sm text-gray-500">
                                                {attendance.shiftEndTime
                                                    ? new Date(attendance.shiftEndTime).toLocaleString()
                                                    : 'Tidak Tersedia'}
                                            </td>
                                            <td className="py-3 px-6 text-sm">
                                                {attendance.checkInImage ? (
                                                    <img
                                                        src={`https://backend-pionix.onrender.com/uploads/${attendance.checkInImage}`}
                                                        alt="Check In"
                                                        className="w-12 h-12 object-cover rounded-lg border border-gray-300"
                                                    />
                                                ) : (
                                                    <span className="text-gray-400">Tidak Ada Gambar</span>
                                                )}
                                            </td>
                                            <td className="py-3 px-6 text-sm">
                                                {attendance.checkOutImage ? (
                                                    <img
                                                        src={`https://backend-pionix.onrender.com/uploads/${attendance.checkOutImage}`}
                                                        alt="Check Out"
                                                        className="w-12 h-12 object-cover rounded-lg border border-gray-300"
                                                    />
                                                ) : (
                                                    <span className="text-gray-400">Tidak Ada Gambar</span>
                                                )}
                                            </td>
                                            <td className="py-3 px-6 text-sm text-center">
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleCheckOutClick(attendance._id);
                                                    }}
                                                    className="px-3 py-1 bg-blue-500 text-white text-sm rounded-md hover:bg-blue-600 transition-all"
                                                >
                                                    Tambah Check Out
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="9" className="py-6 text-center text-gray-500">
                                            Tidak ada data presensi.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination Controls */}
                    <div className="flex justify-center items-center mt-4 space-x-4">
                        <button
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                            className={`px-4 py-2 bg-gray-300 rounded-md hover:bg-gray-400 transition-all ${currentPage === 1 && 'cursor-not-allowed opacity-50'
                                }`}
                        >
                            Sebelumnya
                        </button>
                        <span className="text-sm text-gray-600">
                            Halaman {currentPage} dari {totalPages}
                        </span>
                        <button
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={currentPage === totalPages}
                            className={`px-4 py-2 bg-gray-300 rounded-md hover:bg-gray-400 transition-all ${currentPage === totalPages && 'cursor-not-allowed opacity-50'
                                }`}
                        >
                            Selanjutnya
                        </button>
                    </div>
                </>
            )}

            {/* Check-In Form Modal */}
            {showCheckInForm && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                    <CheckInForm
                        fetchAttendances={fetchAttendances}
                        attendanceId={selectedAttendanceId}
                        onCancel={handleCancelClick}
                        onClose={handleClose}
                    />
                </div>
            )}

            {/* Check-Out Form Modal */}
            {showCheckOutForm && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                    <CheckOutForm
                        fetchAttendances={fetchAttendances}
                        attendanceId={selectedAttendanceId}
                        onCancel={handleCancelClick}
                        onClose={handleClose}
                    />
                </div>
            )}

            {/* Attendance Details Modal */}
            {selectedAttendance && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg w-96">
                        <AttendanceDetail
                            fetchAttendances={fetchAttendances}
                            attendance={selectedAttendance}
                            onClose={handleClose}
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

export default AttendanceList;
