import React, { useState, useEffect } from "react";
import { v4 as uuidv4 } from 'uuid';  // Import UUID library

const ProductForm = ({ onSubmit, existingProduct }) => {
    const [productId, setProductId] = useState(uuidv4());  // Generate unique ID by default
    const [name, setName] = useState('');
    const [category, setCategory] = useState('');
    const [price, setPrice] = useState('');
    const [formattedPrice, setFormattedPrice] = useState('');
    const [quantity, setQuantity] = useState('');
    const [minStock, setMinStock] = useState('');

    useEffect(() => {
        if (existingProduct) {
            setProductId(existingProduct.productId);  // Use existing product ID if available
            setName(existingProduct.name);
            setCategory(existingProduct.category);
            setPrice(existingProduct.price);
            setFormattedPrice(formatPrice(existingProduct.price));
            setQuantity(existingProduct.quantity);
            setMinStock(existingProduct.minStock);
        } else {
            clearForm();  // Generate new productId if no existing product
        }
    }, [existingProduct]);

    const clearForm = () => {
        setProductId(uuidv4());  // Generate new unique ID when resetting the form
        setName('');
        setCategory('');
        setPrice('');
        setFormattedPrice('');
        setQuantity('');
        setMinStock('');
    };

    const formatPrice = (value) => {
        // Format price to include thousands separator
        return new Intl.NumberFormat('id-ID').format(value);
    };

    const handlePriceChange = (e) => {
        const rawValue = e.target.value.replace(/\D/g, '');  // Remove non-numeric characters
        setPrice(rawValue);  // Store the numeric value
        setFormattedPrice(formatPrice(rawValue));  // Format for display
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const productData = { productId, name, category, price, quantity, minStock };
        onSubmit(productData);
        clearForm();  // Reset the form after submission
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex flex-col">
                <label className="mb-2 text-gray-700 font-semibold">ID Produk</label>
                <input
                    type="text"
                    value={productId}
                    disabled
                    className="w-full px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg text-gray-700"
                    placeholder="ID produk otomatis"
                />
            </div>

            <div className="flex flex-col">
                <label className="mb-2 text-gray-700 font-semibold">Nama Produk</label>
                <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg text-gray-700"
                    placeholder="Masukkan nama produk"
                    required
                />
            </div>

            <div className="flex flex-col">
                <label className="mb-2 text-gray-700 font-semibold">Kategori</label>
                <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg text-gray-700"
                    required
                >
                    <option value="" disabled>Pilih kategori produk</option>
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

            <div className="flex flex-col">
                <label className="mb-2 text-gray-700 font-semibold">Harga</label>
                <input
                    type="text"
                    value={formattedPrice}
                    onChange={handlePriceChange}
                    className="w-full px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg text-gray-700"
                    placeholder="Masukkan harga produk"
                    required
                />
            </div>

            <div className="flex flex-col">
                <label className="mb-2 text-gray-700 font-semibold">Jumlah</label>
                <input
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    className="w-full px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg text-gray-700"
                    placeholder="Masukkan jumlah stok"
                    min="1"
                    required
                />
            </div>

            <div className="flex flex-col">
                <label className="mb-2 text-gray-700 font-semibold">Min. Stok</label>
                <input
                    type="number"
                    value={minStock}
                    onChange={(e) => setMinStock(e.target.value)}
                    className="w-full px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg text-gray-700"
                    placeholder="Masukkan stok minimum"
                    min="1"
                    required
                />
            </div>

            <div className="flex justify-between">
                <button
                    type="submit"
                    className="px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition"
                >
                    {existingProduct ? 'Edit Produk' : 'Tambah Produk'}
                </button>
                <button
                    type="button"
                    onClick={clearForm}
                    className="px-6 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition"
                >
                    Reset
                </button>
            </div>
        </form>
    );
};

export default ProductForm;
