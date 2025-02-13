import React, { useEffect, useState } from "react";
import productService from '../../services/productService';
import ProductForm from './ProductForm';
import authService from "../../services/authService";

const ProductList = () => {
    const [products, setProducts] = useState([]);
    const [currentProduct, setCurrentProduct] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [productsPerPage] = useState(5);
    const [filterName, setFilterName] = useState("");
    const [filterCategory, setFilterCategory] = useState("");
    const [user, setUser] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false); // State for confirmation modal
    const [productToDelete, setProductToDelete] = useState(null); // Store product to delete
    const [message, setMessage] = useState(""); // State for success message modal

    const fetchProducts = async () => {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const response = await authService.getProfile(token);
                setUser(response.data);
                localStorage.setItem('user', JSON.stringify(response.data));
                const data = await productService.getProducts(token);
                setProducts(data);
            } catch (error) {

            }
        }
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    const handleProductSubmit = async (productData) => {
        try {
            if (currentProduct) {
                await productService.updateProduct(currentProduct._id, productData);
                setMessage("Produk berhasil diperbarui");
            } else {
                await productService.createProduct(productData);
                setMessage("Produk berhasil ditambahkan");
            }
            setCurrentProduct(null);
            fetchProducts();
        } catch (error) {
            setMessage(error)
        }
    };

    const handleDeleteConfirmation = (productId) => {
        setProductToDelete(productId);
        setIsDeleting(true); // Show confirmation modal
    };

    const cancelDelete = () => {
        setIsDeleting(false);
        setProductToDelete(null);
    };

    const confirmDelete = async () => {
        if (user && user.role === 'admin' && productToDelete) {
            try {
                await productService.deleteProduct(productToDelete);
                fetchProducts();
            } catch (error) {
                setMessage(error)
            }
        }
        setIsDeleting(false);
        setProductToDelete(null);
    };

    const formatPrice = (value) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(value);
    };

    const closeSuccessModal = () => {
        setMessage("");
    };

    const filteredProducts = products.filter(product => {
        const matchesName = product.name.toLowerCase().includes(filterName.toLowerCase());
        const matchesCategory = filterCategory ? product.category === filterCategory : true;
        return matchesName && matchesCategory;
    });

    const indexOfLastProduct = currentPage * productsPerPage;
    const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
    const currentProducts = filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    return (
        <div className="p-6 bg-gradient-to-b from-blue-100 via-gray-100 to-gray-50 min-h-screen items-center">
            <h1 className="text-3xl font-semibold text-gray-800 text-center mb-8">Manajemen Stok Produk</h1>

            {/* Form Section */}
            <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-6">
                <div className="bg-white shadow-lg rounded-lg p-6 w-full md:w-1/3">
                    <h2 className="text-xl font-semibold mb-4 text-gray-700">Form Produk</h2>
                    <ProductForm onSubmit={handleProductSubmit} existingProduct={currentProduct} />
                </div>

                {/* Product List Section */}
                <div className="bg-white shadow-lg rounded-lg p-6 w-full md:w-2/3">
                    <h2 className="text-xl font-semibold mb-4 text-gray-700">Daftar Produk</h2>
                    <div className="flex justify-between items-center mb-6">
                        <input
                            type="text"
                            placeholder="Cari nama produk..."
                            value={filterName}
                            onChange={(e) => setFilterName(e.target.value)}
                            className="px-4 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <select
                            value={filterCategory}
                            onChange={(e) => setFilterCategory(e.target.value)}
                            className="px-4 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">Pilih kategori produk</option>
                            <option value="Material Konstruksi">Material Konstruksi</option>
                            <option value="Peralatan Listrik">Peralatan Listrik</option>
                            <option value="Cat dan Pelapis">Cat dan Pelapis</option>
                            <option value="Pipa dan Plumbing">Pipa dan Plumbing</option>
                            <option value="Peralatan Tangan">Peralatan Tangan</option>
                            <option value="Peralatan Mesin">Peralatan Mesin</option>
                            <option value="Kunci dan Keamanan">Kunci dan Keamanan</option>
                            <option value="Atap dan Genteng">Atap dan Genteng</option>
                            <option value="Lantai dan Keramik">Lantai dan Keramik</option>
                            <option value="Besi dan Baja">Besi dan Baja</option>
                            <option value="Kayu dan Triplek">Kayu dan Triplek</option>
                            <option value="Alat Pengukur">Alat Pengukur</option>
                        </select>
                    </div>

                    {currentProducts.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="min-w-full table-auto bg-white border border-gray-300 rounded-lg shadow-md">
                                <thead className="bg-gray-100">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-gray-600">Nama Produk</th>
                                        <th className="px-6 py-3 text-left text-gray-600">Kategori</th>
                                        <th className="px-6 py-3 text-left text-gray-600">Harga</th>
                                        <th className="px-6 py-3 text-left text-gray-600">Jumlah</th>
                                        <th className="px-6 py-3 text-left text-gray-600">Min. Stok</th>
                                        <th className="px-6 py-3 text-left text-gray-600">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {currentProducts.map((product) => (
                                        <tr
                                            key={product._id}
                                            className={`hover:bg-gray-50 ${product.quantity < product.minStock ? 'bg-red-100' : ''}`}
                                        >
                                            <td className="px-6 py-4">{product.name}</td>
                                            <td className="px-6 py-4">{product.category}</td>
                                            <td className="px-6 py-4 text-green-600 font-semibold">{formatPrice(product.price)}</td>
                                            <td className={`px-6 py-4 ${product.quantity < product.minStock ? 'text-red-600 font-bold' : ''}`}>
                                                {product.quantity}
                                            </td>
                                            <td className="px-6 py-4">{product.minStock}</td>
                                            <td className="px-6 py-4 flex space-x-3 justify-center">
                                                <button
                                                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
                                                    onClick={() => setCurrentProduct(product)}
                                                >
                                                    Edit
                                                </button>
                                                {user && user.role === 'admin' && (
                                                    <button
                                                        className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
                                                        onClick={() => handleDeleteConfirmation(product._id)}
                                                    >
                                                        Hapus
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>

                            {/* Pagination */}
                            <div className="flex justify-center items-center mt-4 space-x-4">
                                <button
                                    onClick={() => paginate(currentPage - 1)}
                                    disabled={currentPage === 1}
                                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 disabled:opacity-50"
                                >
                                    Sebelumnya
                                </button>

                                {/* Display current page and total pages */}
                                <span className="text-sm text-gray-600">{`Halaman ${currentPage} dari ${Math.ceil(filteredProducts.length / productsPerPage)}`}</span>

                                <button
                                    onClick={() => paginate(currentPage + 1)}
                                    disabled={currentPage === Math.ceil(filteredProducts.length / productsPerPage)}
                                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 disabled:opacity-50"
                                >
                                    Selanjutnya
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="mt-4 text-center text-gray-500">Tidak ada produk yang tersedia</div>
                    )}
                </div>
            </div>

            {/* Confirmation Modal */}
            {/* Confirmation Modal */}
            {isDeleting && (
                <div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg w-96">
                        <h2 className="text-xl font-semibold text-gray-800">Konfirmasi Hapus</h2>
                        <p className="mt-4 text-gray-600">Apakah anda yakin menghapus produk ini?</p>
                        <div className="mt-6 flex justify-end space-x-4">
                            <button
                                onClick={confirmDelete}
                                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
                            >
                                Hapus
                            </button>
                            <button
                                onClick={cancelDelete}
                                className="px-6 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition"
                            >
                                Batal
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Success Message Modal */}
            {message && (
                <div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg w-96">
                        <h2 className="text-xl font-semibold text-gray-800">Berhasil</h2>
                        <p className="mt-4 text-gray-600">{message}</p>
                        <div className="mt-6 flex justify-end">
                            <button
                                onClick={closeSuccessModal}
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

export default ProductList;
