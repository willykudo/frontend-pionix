import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaBoxes, FaClock, FaUserCheck, FaTruck, FaUserCircle } from 'react-icons/fa';
import authService from '../services/authService';

const NavigationMenu = ({ setIsAuthenticated }) => {
    const [user, setUser] = useState(null);
    const [users, setUsers] = useState([]);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchUserData = async () => {
            const token = localStorage.getItem('token');
            if (token) {
                try {
                    const response = await authService.getUserById('me', token);
                    setUser(response.data);

                    if (response.data.role === 'admin') {
                        const allUsers = await authService.getAllUsers(token);
                        setUsers(allUsers.data);
                    }
                } catch (error) {
                    console.error('Error fetching user data:', error);
                }
            }
        };
        fetchUserData();
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('token');
        setIsAuthenticated(false);
        navigate('/login');
    };

    const toggleDropdown = () => {
        setIsDropdownOpen(!isDropdownOpen);
    };

    return (
        <nav className="bg-gray-900 shadow-md">
            <div className="container mx-auto px-4">
                <div className="flex items-center justify-between h-16">
                    {/* Logo Section */}
                    <div className="flex items-center">
                        <h1 className="text-2xl font-bold text-white">Pionix</h1>
                    </div>

                    {/* Navigation Links */}
                    <div className="hidden md:flex space-x-8">
                        <Link
                            to="/stok"
                            className="text-gray-300 hover:text-white hover:bg-gray-700 px-3 py-2 rounded-md text-sm font-medium transition"
                        >
                            <FaBoxes className="inline mr-2" /> Manajemen Stok
                        </Link>
                        <Link
                            to="/shifting"
                            className="text-gray-300 hover:text-white hover:bg-gray-700 px-3 py-2 rounded-md text-sm font-medium transition"
                        >
                            <FaClock className="inline mr-2" /> Jadwal Shift
                        </Link>
                        <Link
                            to="/presensi"
                            className="text-gray-300 hover:text-white hover:bg-gray-700 px-3 py-2 rounded-md text-sm font-medium transition"
                        >
                            <FaUserCheck className="inline mr-2" /> Presensi
                        </Link>
                        <Link
                            to="/penyewaan"
                            className="text-gray-300 hover:text-white hover:bg-gray-700 px-3 py-2 rounded-md text-sm font-medium transition"
                        >
                            <FaTruck className="inline mr-2" /> Penyewaan Alat Berat
                        </Link>
                    </div>

                    {/* User Dropdown */}
                    <div className="relative">
                        <button
                            className="flex items-center space-x-2 text-gray-300 hover:text-white focus:outline-none"
                            onClick={toggleDropdown}
                        >
                            <FaUserCircle className="h-8 w-8" />
                            {user && <span className="hidden md:inline-block">{user.name}</span>}
                        </button>

                        {isDropdownOpen && (
                            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1">
                                <Link
                                    to="/profil"
                                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                >
                                    Your Profile
                                </Link>
                                <button
                                    onClick={handleLogout}
                                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                >
                                    Sign out
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Mobile Menu Button */}
                <div className="md:hidden flex justify-end mt-2">
                    <button className="text-gray-300 hover:text-white focus:outline-none">
                        <svg
                            className="h-6 w-6"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M4 6h16M4 12h16M4 18h16"
                            />
                        </svg>
                    </button>
                </div>
            </div>
        </nav>
    );
};

export default NavigationMenu;
