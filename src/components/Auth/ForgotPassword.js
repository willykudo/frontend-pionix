import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import authService from '../../services/authService';

const ForgotPassword = () => {
    const [username, setUsername] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    // Fungsi untuk validasi password yang lebih kuat
    const validatePassword = (password) => {
        const passwordRegex =
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&_])[A-Za-z\d@$!%*?&_]{8,}$/;
        return passwordRegex.test(password);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Cek jika password valid
        if (!validatePassword(newPassword)) {
            setMessage('Password must be at least 8 characters long and include uppercase, lowercase, a number, and a special character.');
            return;
        }

        // Cek jika password baru dan konfirmasi password cocok
        if (newPassword !== confirmPassword) {
            setMessage('Passwords do not match.');
            return;
        }

        try {
            // Mengirim permintaan untuk mereset password
            const response = await authService.resetPassword(username, newPassword);

            // Memberikan umpan balik setelah berhasil mereset password
            if (response.success) {
                setMessage('Password reset successful! You can now log in with your new password.');
            } else {
                setMessage(response.message || 'Failed to reset password.');
            }
        } catch (error) {
            // Menangani error jika ada masalah dengan permintaan
            const errorMessage = error.response?.data?.error || 'An error occurred while resetting the password.';
            setMessage(errorMessage);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-blue-100 via-gray-100 to-gray-50">
            <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-2xl shadow-xl">
                <h2 className="text-4xl font-extrabold text-center text-gray-800">Reset Password</h2>
                <p className="text-sm text-center text-gray-500">Enter your username and new password</p>
                <form className="space-y-6" onSubmit={handleSubmit}>
                    <div>
                        <label className="block mb-2 text-sm font-medium text-gray-700">Username</label>
                        <input
                            type="text"
                            placeholder="Enter your username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                            className="w-full px-4 py-3 text-gray-800 bg-gray-100 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
                        />
                    </div>
                    <div>
                        <label className="block mb-2 text-sm font-medium text-gray-700">New Password</label>
                        <input
                            type={showPassword ? 'text' : 'password'}
                            placeholder="Enter new password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            required
                            className="w-full px-4 py-3 text-gray-800 bg-gray-100 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
                        />
                    </div>
                    <div>
                        <label className="block mb-2 text-sm font-medium text-gray-700">Confirm Password</label>
                        <input
                            type={showPassword ? 'text' : 'password'}
                            placeholder="Confirm new password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                            className="w-full px-4 py-3 text-gray-800 bg-gray-100 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
                        />
                    </div>
                    <div className="flex items-center space-x-2">
                        <input
                            type="checkbox"
                            id="showPassword"
                            checked={showPassword}
                            onChange={() => setShowPassword(!showPassword)}
                            className="w-4 h-4 text-blue-500 border-gray-300 rounded focus:ring-blue-400"
                        />
                        <label htmlFor="showPassword" className="text-sm text-gray-700">Show Password</label>
                    </div>
                    <button
                        type="submit"
                        className="w-full py-3 text-lg font-semibold text-white bg-blue-500 rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-4 focus:ring-blue-300"
                    >
                        Reset Password
                    </button>
                    {message && (
                        <p className={`mt-4 text-center text-sm ${message.includes('successful') ? 'text-green-500' : 'text-red-500'}`}>
                            {message}
                        </p>
                    )}
                </form>
                <p className="mt-4 text-sm text-center text-gray-600">
                    Already have an account?{' '}
                    <Link to="/login" className="text-blue-600 hover:underline">
                        Login here
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default ForgotPassword;
