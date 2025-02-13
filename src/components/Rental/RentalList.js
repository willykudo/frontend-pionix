import React, { useEffect, useState } from 'react';
import RentalForm from './RentalForm';
import { fetchRentals, deleteRental, updateRental } from '../../services/rentalService';
import authService from '../../services/authService';

const RentalList = () => {
    const [rentals, setRentals] = useState([]);
    const [filteredRentals, setFilteredRentals] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [currentRental, setCurrentRental] = useState(null);
    const [refresh, setRefresh] = useState(false);
    const [user, setUser] = useState(null);
    const [currentPage, setCurrentPage] = useState(1); // Current page state
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [rentalToDelete, setRentalToDelete] = useState(null);
    const [modalMessage, setModalMessage] = useState('');
    const itemsPerPage = 3; // Number of rentals per page

    const fetchRentalData = async () => {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const response = await authService.getProfile(token);
                const userData = response.data;
                setUser(userData); // Simpan data user, termasuk role
                localStorage.setItem('user', JSON.stringify(userData));

                const rentalData = await fetchRentals(token);
                setRentals(rentalData);
                setFilteredRentals(rentalData); // Initialize filtered rentals
            } catch (error) {
                console.error('Error fetching rental data:', error);
            }
        }
    };

    useEffect(() => {
        fetchRentalData();
    }, [refresh]);

    useEffect(() => {
        // Filter rentals based on the search term
        const filtered = rentals.filter(rental =>
            rental.equipmentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            rental.rentalStatus.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setFilteredRentals(filtered);
    }, [searchTerm, rentals]);

    const confirmDelete = (rentalId) => {
        setModalMessage('Apakah Anda yakin ingin menghapus data presensi ini?');
        setRentalToDelete(rentalId);
        setShowConfirmModal(true);
    };

    const handleDelete = async () => {
        if (user?.role === 'admin' && rentalToDelete) {
            await deleteRental(rentalToDelete);
            setModalMessage('Data presensi berhasil dihapus.');
            setShowSuccessModal(true)
            setRefresh(!refresh);
        }
        setShowConfirmModal(false);
    };

    const handleAddRental = () => {
        setCurrentRental(null);
        setShowForm(true);
    };

    const handleEditRental = (rental) => {
        setCurrentRental(rental);
        setShowForm(true);
    };

    const handleFormSuccess = () => {
        setShowForm(false);
        setRefresh(!refresh);
    };

    const formatPrice = (price) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(price);
    };

    const formatDate = (date) => {
        if (!date) return 'Tidak Ada'; // Jika tanggal tidak tersedia, tampilkan "Tidak Ada"
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(date).toLocaleDateString('id-ID', options);
    };

    const isOverdue = (returnDate) => {
        if (!returnDate) return false; // Jika tanggal tidak ada, tidak perlu dianggap terlambat
        const today = new Date();
        return new Date(returnDate) < today;
    };

    const getStatusClass = (status) => {
        switch (status) {
            case 'Available':
                return 'bg-blue-200 text-blue-800';
            case 'Rented':
                return 'bg-yellow-200 text-yellow-800';
            case 'Maintenance':
                return 'bg-green-200 text-green-800';
            default:
                return 'bg-gray-200 text-gray-800';
        }
    };

    const calculateDuration = (rentalDate, returnDate) => {
        if (!rentalDate || !returnDate) return 'Tidak Ada'; // Jika salah satu tanggal tidak ada
        const startDate = new Date(rentalDate);
        const endDate = new Date(returnDate);
        const differenceInTime = endDate - startDate;

        if (differenceInTime < 0) return 'Tanggal tidak valid'; // Return date lebih awal dari rental date

        // Konversi selisih waktu menjadi hari
        return Math.ceil(differenceInTime / (1000 * 60 * 60 * 24)); // 1 hari = 1000ms * 60s * 60m * 24h
    };


    // Calculate the rentals to be displayed on the current page
    const indexOfLastRental = currentPage * itemsPerPage;
    const indexOfFirstRental = indexOfLastRental - itemsPerPage;
    const currentRentals = filteredRentals.slice(indexOfFirstRental, indexOfLastRental);

    // Change page
    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    // Total pages
    const totalPages = Math.ceil(filteredRentals.length / itemsPerPage);

    return (
        <div className="p-6 bg-gradient-to-b from-blue-100 via-gray-100 to-gray-50 min-h-screen items-center">
            <h1 className="text-3xl font-semibold text-gray-800 text-center mb-8">Daftar Penyewaan</h1>
            <div className="flex justify-between items-center mb-6">
                <input
                    type="text"
                    placeholder="Cari alat atau status..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="px-4 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                    onClick={handleAddRental}
                    className="px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition"
                >
                    Tambah Penyewaan
                </button>
            </div>

            {showForm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg z-100 max-w-md w-full overflow-auto max-h-[80vh]">
                        <RentalForm
                            onSubmitSuccess={handleFormSuccess}
                            currentRental={currentRental}
                            updateRental={updateRental}
                        />
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {currentRentals.map((rental) => (
                    <div
                        key={rental._id}
                        className={`bg-white rounded-lg shadow-md overflow-hidden ${getStatusClass(rental.rentalStatus)}`}
                    >
                        <img
                            src={`http://localhost:3000/${rental.rentalImage}`}
                            alt={rental.equipmentName}
                            className="w-full h-48 object-cover"
                        />
                        <div className="p-4">
                            <h2 className="text-xl font-semibold">{rental.equipmentName}</h2>
                            <p className="text-gray-600">ID Penyewaan: {rental.rentalId}</p>
                            <p className="text-gray-600">Status: {rental.rentalStatus}</p>
                            <p className="text-gray-600">Nama Pelanggan: {rental.customerName || 'Tidak Ada'}</p>
                            <p className="text-gray-600"> Durasi: {calculateDuration(rental.rentalDate, rental.returnDate)}</p>
                            <p className="text-gray-600">Tanggal Rental: {formatDate(rental.rentalDate)}</p>
                            <p className={`text-gray-600 ${isOverdue(rental.returnDate) ? 'text-red-600 font-bold' : ''}`}>
                                Tanggal Kembali: {formatDate(rental.returnDate)} {isOverdue(rental.returnDate) && '(Terlambat)'}
                            </p>
                            <p className="text-gray-600">Harga/Hari: {formatPrice(rental.rentalPrice)}</p>
                            <p className="text-gray-600">Kondisi: {rental.equipmentCondition}</p>
                            <p className="text-gray-600">Deskripsi: {rental.description}</p>
                            <div className='flex space-x-4 mt-4'>
                                <button
                                    onClick={() => handleEditRental(rental)}
                                    className="px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition"
                                >
                                    Edit Penyewaan
                                </button>
                                {user?.role === 'admin' && (
                                    <button
                                        onClick={() => confirmDelete(rental._id)}
                                        className="px-6 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition"
                                    >
                                        Hapus Penyewaan
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Pagination */}
            <div className="flex justify-center items-center mt-4 space-x-4">
                <button
                    onClick={() => paginate(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-4 py-2 bg-gray-500 text-white rounded-md mr-2 disabled:opacity-50"
                >
                    Sebelumnya
                </button>
                <span className="text-sm text-gray-600">
                    Page {currentPage} of {totalPages}
                </span>
                <button
                    onClick={() => paginate(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 bg-gray-500 text-white rounded-md ml-2 disabled:opacity-50"
                >
                    Selanjutnya
                </button>
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
                                }}
                                className="px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition"
                            >
                                OK
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {showConfirmModal && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg w-96">
                        <h2 className="text-xl font-semibold text-gray-800">Konfirmasi Hapus</h2>
                        <p className="mt-4 text-gray-600">{modalMessage}</p>
                        <div className="mt-6 flex justify-end space-x-4">
                            <button
                                onClick={handleDelete}
                                className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition"
                            >
                                Hapus
                            </button>
                            <button
                                onClick={() => setShowConfirmModal(false)}
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

export default RentalList;
