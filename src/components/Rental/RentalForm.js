import React, { useState, useEffect } from 'react';
import { createRental, updateRental } from '../../services/rentalService'; // Import layanan
import { v4 as uuidv4 } from 'uuid';  // Import uuid

const RentalForm = ({ onSubmitSuccess, currentRental }) => {
    const [rental, setRental] = useState({
        rentalId: uuidv4(),
        equipmentName: '',
        rentalStatus: 'Available',
        customerName: '',
        rentalDuration: 0,
        rentalPrice: 0,
        equipmentCondition: 'New',
        description: '',
        rentalImage: null,
        rentalDate: '',
        returnDate: '',
    });
    const [previewImage, setPreviewImage] = useState(null);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [modalMessage, setModalMessage] = useState('');

    // Populasi form jika ada data penyewaan yang diupdate
    useEffect(() => {
        if (currentRental) {
            const isStatusReset = currentRental.rentalStatus === 'Available' || currentRental.rentalStatus === 'Maintenance';

            setRental({
                ...currentRental,
                rentalPrice: currentRental.rentalPrice || 0,
                rentalDate: isStatusReset ? '' : currentRental.rentalDate?.split('T')[0] || '',
                returnDate: isStatusReset ? '' : currentRental.returnDate?.split('T')[0] || '',
                rentalDuration: isStatusReset ? 0 : currentRental.rentalDuration || 0,
                customerName: isStatusReset ? '' : currentRental.customerName || '',
            });

            setPreviewImage(currentRental.rentalImage ? `https://backend-pionix.onrender.com/${currentRental.rentalImage}` : null);
        }
    }, [currentRental]);


    // Effect untuk mengatur nilai berdasarkan status
    useEffect(() => {
        if (rental.rentalStatus === 'Available' || rental.rentalStatus === 'Maintenance') {
            setRental((prevRental) => ({
                ...prevRental,
                rentalDate: '',
                returnDate: '',
                customerName: '',
                rentalDuration: 0,
            }));
        }
    }, [rental.rentalStatus]); // Menjalankan ketika rentalStatus berubah

    // Hitung durasi penyewaan secara otomatis
    useEffect(() => {
        if (rental.rentalDate && rental.returnDate) {
            const rentalStart = new Date(rental.rentalDate);
            const rentalEnd = new Date(rental.returnDate);

            // Perhitungan jumlah hari
            const duration = Math.max(
                Math.ceil((rentalEnd - rentalStart) / (1000 * 60 * 60 * 24) + 1),
                0 // Minimal 0 jika tanggal returnDate lebih awal
            );
            setRental((prevRental) => ({
                ...prevRental,
                rentalDuration: duration,
            }));
        }
    }, [rental.rentalDate, rental.returnDate]); // Menjalankan ulang jika salah satu berubah

    // Fungsi untuk menangani perubahan input
    const handleChange = (e) => {
        const { name, value, type } = e.target;
        setRental({
            ...rental,
            [name]: type === 'number' ? Number(value) : value,
        });
    };

    // Format harga (rentalPrice) menjadi format ribuan
    const handlePriceChange = (e) => {
        const formattedPrice = e.target.value.replace(/\D/g, ''); // Menghapus karakter non-angka
        setRental({
            ...rental,
            rentalPrice: formattedPrice,
        });
    };

    const formatPrice = (price) => {
        return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.'); // Tambah titik setiap 3 angka
    };

    // Handle file selection and preview
    const handleImageChange = (e) => {
        const file = e.target.files[0];
        setRental({ ...rental, rentalImage: file });
        setPreviewImage(URL.createObjectURL(file)); // Tampilkan gambar preview
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Log rental data before making the request
        console.log('Form Data being submitted:', rental);

        const formData = new FormData();
        formData.append('rentalId', rental.rentalId);
        formData.append('equipmentName', rental.equipmentName);
        formData.append('rentalStatus', rental.rentalStatus);
        formData.append('customerName', rental.customerName);
        formData.append('rentalDuration', rental.rentalDuration);
        formData.append('rentalPrice', rental.rentalPrice.toString().replace(/\./g, '')); // Hapus titik agar tersimpan sebagai angka
        formData.append('equipmentCondition', rental.equipmentCondition);
        formData.append('description', rental.description);
        formData.append('rentalDate', rental.rentalDate); // Tanggal sewa
        formData.append('returnDate', rental.returnDate); // Tanggal pengembalian

        // Append file gambar hanya jika ada gambar baru yang diupload
        if (rental.rentalImage) {
            formData.append('rentalImage', rental.rentalImage);
        }

        try {
            if (currentRental) {
                await updateRental(currentRental._id, formData); // Update penyewaan
                setModalMessage('Data rental berhasil diperbarui')
            } else {
                await createRental(formData); // Tambah penyewaan baru
                setModalMessage('Data rental berhasil ditambahkan')
            }

            setShowSuccessModal(true); // Tampilkan modal sukses
        } catch (error) {
            console.error('Error during submit:', error);
        }
    };

    return (
        <form onSubmit={handleSubmit} encType="multipart/form-data" className="max-w-2xl mx-auto p-6 bg-white shadow-md rounded-lg">
            <h2 className="text-2xl font-semibold mb-6 text-center">
                {currentRental ? 'Update Rental' : 'Add Rental'}
            </h2>

            <div className="grid grid-cols-1 gap-4">
                <div className="flex flex-col">
                    <label className="text-gray-700">Rental Id</label>
                    <input
                        type="text"
                        name="rentalId"
                        value={rental.rentalId}
                        onChange={handleChange}
                        className="w-full px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg text-gray-700"
                        disabled
                    />
                </div>

                <div className="flex flex-col">
                    <label className="text-gray-700">Nama Alat</label>
                    <input
                        type="text"
                        name="equipmentName"
                        value={rental.equipmentName}
                        onChange={handleChange}
                        className="w-full px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg text-gray-700"
                        required
                    />
                </div>

                <div className="flex flex-col">
                    <label className="text-gray-700">Harga Penyewaan/Hari</label>
                    <input
                        type="text"
                        name="rentalPrice"
                        value={formatPrice(rental.rentalPrice)} // Format harga dengan titik
                        onChange={handlePriceChange} // Handle perubahan harga
                        className="w-full px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg text-gray-700"
                        required
                    />
                </div>

                <div className="flex flex-col">
                    <label className="text-gray-700">Tanggal Sewa</label>
                    <input
                        type="date"
                        name="rentalDate"
                        value={rental.rentalDate}
                        onChange={handleChange}
                        className="w-full px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg text-gray-700"
                    />
                </div>

                <div className="flex flex-col">
                    <label className="text-gray-700">Tanggal Pengembalian</label>
                    <input
                        type="date"
                        name="returnDate"
                        value={rental.returnDate}
                        onChange={handleChange}
                        className="w-full px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg text-gray-700"
                    />
                </div>

                <div className="flex flex-col">
                    <label className="text-gray-700">Gambar Alat</label>
                    {previewImage && (
                        <img src={previewImage} alt="Preview" className="w-full h-48 object-cover mt-2 mb-3 rounded-md" />
                    )}
                    <input
                        type="file"
                        name="rentalImage"
                        onChange={handleImageChange}
                        className="w-full px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg text-gray-700"
                        accept="image/*"
                    />
                </div>

                <div className="flex flex-col">
                    <label className="text-gray-700">Durasi Penyewaan (Hari)</label>
                    <input
                        type="number"
                        name="rentalDuration"
                        value={rental.rentalDuration}
                        onChange={handleChange}
                        className="w-full px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg text-gray-700"
                        disabled
                    />
                </div>

                <div className="flex flex-col">
                    <label className="text-gray-700">Status Penyewaan</label>
                    <select
                        name="rentalStatus"
                        value={rental.rentalStatus}
                        onChange={handleChange}
                        className="w-full px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg text-gray-700"
                    >
                        <option value="Available">Available</option>
                        <option value="Rented">Rented</option>
                        <option value="Maintenance">Maintenance</option>
                    </select>
                </div>

                <div className="flex flex-col">
                    <label className="text-gray-700">Nama Penyewa</label>
                    <input
                        type="text"
                        name="customerName"
                        value={rental.customerName}
                        onChange={handleChange}
                        className="w-full px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg text-gray-700"
                    />
                </div>

                <div className="flex flex-col">
                    <label className="text-gray-700">Kondisi Alat</label>
                    <select
                        name="equipmentCondition"
                        value={rental.equipmentCondition}
                        onChange={handleChange}
                        className="w-full px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg text-gray-700"
                    >
                        <option value="New">Baru</option>
                        <option value="Good">Baik</option>
                        <option value="Fair">Cukup</option>
                        <option value="Poor">Kurang</option>
                    </select>
                </div>

                <div className="flex flex-col">
                    <label className="text-gray-700">Deskripsi</label>
                    <textarea
                        name="description"
                        value={rental.description}
                        onChange={handleChange}
                        className="w-full px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg text-gray-700"
                        rows="3"
                    />
                </div>

                <div className="flex justify-center mt-6 space-x-4">
                    <button type="submit" className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                        {currentRental ? 'Edit' : 'Tambah'}
                    </button>
                    <button
                        type="button"
                        onClick={() => onSubmitSuccess()} // Handle the cancel logic (redirect, clear form, etc.)
                        className="px-6 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition"
                    >
                        Batal
                    </button>
                </div>
            </div>

            {/* Modal Sukses */}
            {showSuccessModal && (
                <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg w-96">
                        <h2 className="text-xl font-semibold text-gray-800">Berhasil</h2>
                        <p className="mt-4 text-gray-600">{modalMessage}</p>
                        <div className="mt-6 flex justify-end">
                            <button
                                onClick={() => {
                                    setShowSuccessModal(false);
                                    onSubmitSuccess(); // Refresh data di parent component
                                }}
                                className="px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition"
                            >
                                OK
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </form>


    );
};

export default RentalForm;
