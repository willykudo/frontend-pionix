import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import authService from '../../services/authService';

const Login = ({ setIsAuthenticated }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const response = await authService.login({ username, password });
            localStorage.setItem('token', response.data.token); // Set new token
            setIsAuthenticated(true);
            setMessage('Login successful!');
            navigate('/stok');
        } catch (error) {
            setMessage(error.response?.data?.error || 'Login failed.');
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-blue-100 via-gray-100 to-gray-50">
            <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-2xl shadow-xl">
                <h2 className="text-4xl font-extrabold text-center text-gray-800">Selamat Datang</h2>
                <p className="text-sm text-center text-gray-500">Mohon isikan username dan password untuk login</p>
                <form className="space-y-6" onSubmit={handleLogin}>
                    <div>
                        <label className="block mb-2 text-sm font-medium text-gray-700">Username</label>
                        <input
                            type="text"
                            placeholder="Masukan username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                            className="w-full px-4 py-3 text-gray-800 bg-gray-100 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
                        />
                    </div>
                    <div>
                        <label className="block mb-2 text-sm font-medium text-gray-700">Password</label>
                        <input
                            type="password"
                            placeholder="Masukan password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="w-full px-4 py-3 text-gray-800 bg-gray-100 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full py-3 text-lg font-semibold text-white bg-blue-500 rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-4 focus:ring-blue-300"
                    >
                        Log In
                    </button>
                    {message && (
                        <p className={`mt-4 text-center text-sm ${message.includes('successful') ? 'text-green-500' : 'text-red-500'}`}>
                            {message}
                        </p>
                    )}
                </form>
                {/* <div className="flex items-center justify-between">
                    <Link to="/forgot-password" className="text-sm text-blue-500 hover:underline">
                        Forgot password?
                    </Link>
                </div> */}
                <p className="text-sm text-center text-gray-600">
                    Tidak punya akun?{' '}
                    <Link to="/register" className="font-medium text-blue-500 hover:underline">
                        Daftar disini
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default Login;
