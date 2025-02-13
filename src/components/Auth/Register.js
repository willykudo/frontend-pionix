import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import authService from '../../services/authService';

const Register = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('karyawan');
    const [name, setName] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [modalMessage, setModalMessage] = useState('');
    const [showSuccessModal, setShowSuccessModal] = useState(false);

    const validatePassword = (password) => {
        const passwordRegex =
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&_])[A-Za-z\d@$!%*?&_]{8,}$/;
        return passwordRegex.test(password);
    };

    const handleRegister = async (e) => {
        e.preventDefault();

        if (!validatePassword(password)) {
            setModalMessage(
                'Password must be at least 8 characters long, include uppercase, lowercase, a number, and a special character @$!%*?&_.'
            );
            return;
        }

        try {
            await authService.register({
                username,
                password,
                role,
                name,
            });
            setModalMessage('Berhasil membuat data user baru');
            setShowSuccessModal(true); // Show success modal
        } catch (error) {
            setModalMessage(error.response?.data?.error || 'Registration failed.');
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-blue-100 via-gray-100 to-gray-50">
            <div className="w-full max-w-lg p-8 space-y-6 bg-white rounded-lg shadow-xl">
                <h2 className="text-3xl font-extrabold text-center text-gray-800">Buat Akun</h2>
                <p className="text-sm text-center text-gray-600">Daftar untuk memulai!</p>
                <form className="space-y-5" onSubmit={handleRegister}>
                    <div>
                        <label className="block mb-1 text-sm font-medium text-gray-700">Nama Lengkap</label>
                        <input
                            type="text"
                            placeholder="Masukan nama lengkap"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                            className="w-full px-4 py-3 text-gray-800 bg-gray-100 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                        />
                    </div>
                    <div>
                        <label className="block mb-1 text-sm font-medium text-gray-700">Username</label>
                        <input
                            type="text"
                            placeholder="Masukan username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                            className="w-full px-4 py-3 text-gray-800 bg-gray-100 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                        />
                    </div>
                    <div>
                        <label className="block mb-1 text-sm font-medium text-gray-700">Password</label>
                        <input
                            type={showPassword ? "text" : "password"}
                            placeholder="Masukan password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="w-full px-4 py-3 text-gray-800 bg-gray-100 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                        />
                        <p className="mt-2 text-xs text-gray-500">
                            Kata sandi minimal harus terdiri dari 8 karakter, meliputi huruf besar, huruf kecil, angka, dan karakter khusus @$!%*?&_.
                        </p>
                        <div className="flex items-center mt-3">
                            <input
                                type="checkbox"
                                id="showPassword"
                                checked={showPassword}
                                onChange={() => setShowPassword(!showPassword)}
                                className="mr-2"
                            />
                            <label htmlFor="showPassword" className="text-sm text-gray-600">Show Password</label>
                        </div>
                    </div>
                    <div>
                        <label className="block mb-1 text-sm font-medium text-gray-700">Role</label>
                        <select
                            value={role}
                            onChange={(e) => setRole(e.target.value)}
                            className="w-full px-4 py-3 text-gray-800 bg-gray-100 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                        >
                            <option value="karyawan">Karyawan</option>
                            <option value="admin">Admin</option>
                        </select>
                    </div>
                    <button
                        type="submit"
                        className="w-full py-3 text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2"
                    >
                        Register
                    </button>
                </form>
                <p className="mt-4 text-sm text-center text-gray-600">
                    Sudah punya akun?{' '}
                    <Link to="/login" className="text-blue-600 hover:underline">
                        Login disini
                    </Link>
                </p>
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
        </div>
    );
};

export default Register;