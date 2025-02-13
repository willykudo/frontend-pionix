import React, { useEffect, useState } from 'react';
import authService from '../../services/authService';
import { FiEdit, FiTrash } from 'react-icons/fi';

const Profile = ({ setIsAuthenticated }) => {
    const [user, setUser] = useState(null);
    const [users, setUsers] = useState([]);
    const [editingEmployee, setEditingEmployee] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [usersPerPage] = useState(3); // Number of users per page
    const [searchTerm, setSearchTerm] = useState(''); // State for search term
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
    const [userToDelete, setUserToDelete] = useState(null);
    const [modalMessage, setModalMessage] = useState('');

    const fetchUserData = async () => {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const response = await authService.getProfile(token);
                setUser(response.data);
                localStorage.setItem('user', JSON.stringify(response.data));
                // setIsAuthenticated(true)
                if (response.data.role === 'admin') {
                    const allUsersResponse = await authService.getAllUsers(token);
                    setUsers(allUsersResponse.data);
                }
            } catch (error) {
                console.error('Error fetching profile data:', error);
            }
        }
    };

    useEffect(() => {
        fetchUserData();
    }, []);

    const handleUpdate = async (updatedData) => {
        try {
            await authService.updateUser(user._id, updatedData);
            setUser((prevState) => ({ ...prevState, ...updatedData }));
            setModalMessage('Data profile berhasil diperbarui.');
            setShowSuccessModal(true);
            fetchUserData()
        } catch (error) {
            console.error('Error updating profile:', error);
        }
    };

    const handleEditUser = (userId) => {
        try {
            const employeeToEdit = users.find((u) => u._id === userId);
            setEditingEmployee(employeeToEdit);
        } catch (error) {
            console.error('Error updating user:', error);
        }
    };

    const confirmDeleteUser = (userId) => {
        setUserToDelete(userId);
        setModalMessage('Apakah Anda yakin ingin menghapus data presensi ini?');
        setShowDeleteConfirmModal(true);
    };

    const handleDeleteUser = async (userId) => {
        try {
            await authService.deleteUser(userToDelete);
            setUsers((prevState) => prevState.filter((u) => u._id !== userToDelete));
            setModalMessage('Data karyawan berhasil dihapus.');
            setShowDeleteConfirmModal(false);
            setShowSuccessModal(true)
            fetchUserData()
        } catch (error) {
            console.error('Error deleting user:', error);
        }
    };

    const handleUpdateEmployee = async (employeeId, updatedData) => {
        try {
            await authService.updateUser(employeeId, updatedData);
            setUsers((prevState) =>
                prevState.map((user) =>
                    user._id === employeeId ? { ...user, ...updatedData } : user
                )
            );
            setEditingEmployee(null);
            setModalMessage('Data karyawan berhasil diperbarui.');
            setShowSuccessModal(true);
            fetchUserData()
        } catch (error) {
            console.error('Error updating employee:', error);
        }
    };


    // Filter users based on the search term
    const filteredUsers = users.filter((user) =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.role.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Pagination Logic
    const indexOfLastUser = currentPage * usersPerPage;
    const indexOfFirstUser = indexOfLastUser - usersPerPage;
    const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);

    // Pagination buttons logic
    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    return (
        <div className="p-6 bg-gradient-to-b from-blue-100 via-gray-100 to-gray-50 min-h-screen flex flex-col items-center">
            <div className="bg-white shadow-lg rounded-xl p-8 w-full max-w-5xl">
                <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">Profil Pengguna</h1>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* User Profile Section */}
                    <div className="space-y-8">
                        <h3 className="text-xl font-bold text-gray-700 border-b pb-2">Data Pribadi</h3>
                        <form
                            className="space-y-6"
                            onSubmit={(e) => {
                                e.preventDefault();
                                const updatedData = {
                                    name: e.target.name.value,
                                    username: e.target.username.value,
                                    password: e.target.password.value,
                                    role: e.target.role.value,
                                };
                                handleUpdate(updatedData);
                            }}
                        >
                            <div className="space-y-4">
                                <div>
                                    <label
                                        htmlFor="name"
                                        className="block text-sm font-medium text-gray-700"
                                    >
                                        Nama
                                    </label>
                                    <input
                                        type="text"
                                        id="name"
                                        name="name"
                                        defaultValue={user?.name}
                                        className="w-full px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg text-gray-700"
                                    />
                                </div>
                                <div>
                                    <label
                                        htmlFor="username"
                                        className="block text-sm font-medium text-gray-700"
                                    >
                                        Username
                                    </label>
                                    <input
                                        type="text"
                                        id="username"
                                        name="username"
                                        defaultValue={user?.username}
                                        className="w-full px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg text-gray-700"
                                    />
                                </div>
                                <div>
                                    <label
                                        htmlFor="password"
                                        className="block text-sm font-medium text-gray-700"
                                    >
                                        Password
                                    </label>
                                    <input
                                        type="password"
                                        id="password"
                                        name="password"
                                        placeholder="Kosongkan jika tidak diubah"
                                        className="w-full px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg text-gray-700"
                                    />
                                </div>
                                <div>
                                    <label
                                        htmlFor="role"
                                        className="block text-sm font-medium text-gray-700"
                                    >
                                        Role
                                    </label>
                                    <input
                                        id="role"
                                        name="role"
                                        defaultValue={user?.role}
                                        disabled
                                        className="w-full px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg text-gray-700"
                                    >

                                    </input>
                                </div>
                            </div>
                            <button
                                type="submit"
                                className="px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition"
                            >
                                Update Profile
                            </button>
                        </form>
                    </div>

                    {/* Employee Edit Form for Admin */}
                    {editingEmployee && (
                        <div className="space-y-8">
                            <h3 className="text-xl font-bold text-gray-700 border-b pb-2">Edit Data Karyawan</h3>
                            <form
                                className="space-y-6"
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    const updatedData = {
                                        name: e.target.name.value,
                                        username: e.target.username.value,
                                        password: e.target.password.value,
                                        role: e.target.role.value,
                                    };
                                    handleUpdateEmployee(editingEmployee._id, updatedData);
                                }}
                            >
                                <div className="space-y-4">
                                    <div>
                                        <label
                                            htmlFor="name"
                                            className="block text-sm font-medium text-gray-700"
                                        >
                                            Nama
                                        </label>
                                        <input
                                            type="text"
                                            id="name"
                                            name="name"
                                            defaultValue={editingEmployee?.name}
                                            className="w-full px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg text-gray-700"
                                        />
                                    </div>
                                    <div>
                                        <label
                                            htmlFor="username"
                                            className="block text-sm font-medium text-gray-700"
                                        >
                                            Username
                                        </label>
                                        <input
                                            type="text"
                                            id="username"
                                            name="username"
                                            defaultValue={editingEmployee?.username}
                                            className="w-full px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg text-gray-700"
                                        />
                                    </div>
                                    <div>
                                        <label
                                            htmlFor="password"
                                            className="block text-sm font-medium text-gray-700"
                                        >
                                            Password
                                        </label>
                                        <input
                                            type="password"
                                            id="password"
                                            name="password"
                                            placeholder="Kosongkan jika tidak diubah"
                                            className="w-full px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg text-gray-700"
                                        />
                                    </div>
                                    <div>
                                        <label
                                            htmlFor="role"
                                            className="block text-sm font-medium text-gray-700"
                                        >
                                            Role
                                        </label>
                                        <select
                                            id="role"
                                            name="role"
                                            defaultValue={editingEmployee?.role}
                                            className="w-full px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg text-gray-700"
                                        >
                                            <option value="karyawan">Karyawan</option>
                                            <option value="admin">Admin</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="flex space-x-4">
                                    <button
                                        type="submit"
                                        className="px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition"
                                    >
                                        Update Employee
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setEditingEmployee(null)} // Tambahkan logika ini untuk menutup form
                                        className="px-6 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                </div>
            </div>

            {/* Search and Pagination Section */}
            {user?.role === 'admin' && <div className="mt-4 w-full max-w-5xl">
                <h2 className="text-2xl font-bold text-gray-700 mb-4">Daftar Karyawan</h2>
                <input
                    type="text"
                    placeholder="Search by username, name, or role..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="px-4 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
                />
                <div className="bg-white shadow-md rounded-lg">
                    <table className="min-w-full border-collapse text-left text-sm">
                        <thead>
                            <tr className="bg-blue-100 text-gray-700">
                                <th className="px-6 py-3 font-semibold">Nama</th>
                                <th className="px-6 py-3 font-semibold">Username</th>
                                <th className="px-6 py-3 font-semibold">Role</th>
                                <th className="px-6 py-3 font-semibold text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredUsers.length > 0 ? (
                                currentUsers.map((user) => (
                                    <tr key={user._id} className="hover:bg-gray-50 transition duration-150">
                                        <td className="px-6 py-3 text-gray-800">{user.name}</td>
                                        <td className="px-6 py-3 text-gray-800">{user.username}</td>
                                        <td className="px-6 py-3 text-gray-800">{user.role}</td>
                                        <td className="px-6 py-3 flex justify-center space-x-4">
                                            <button onClick={() => handleEditUser(user._id)} className="text-blue-500 hover:text-blue-700 flex items-center space-x-1">
                                                <FiEdit size={18} /> <span>Edit</span>
                                            </button>
                                            <button onClick={() => confirmDeleteUser(user._id)} className="text-red-500 hover:text-red-700 flex items-center space-x-1">
                                                <FiTrash size={18} /> <span>Delete</span>
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="4" className="px-6 py-3 text-center text-gray-500">
                                        No users found
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="mt-6 flex justify-center space-x-4">
                    <button
                        onClick={() => paginate(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="px-4 py-2 bg-gray-500 text-white rounded-md mr-2 disabled:opacity-50"
                    >
                        Previous
                    </button>
                    <span className="flex items-center text-gray-700">
                        Page {currentPage} of {Math.ceil(filteredUsers.length / usersPerPage)}
                    </span>
                    <button
                        onClick={() => paginate(currentPage + 1)}
                        disabled={indexOfLastUser >= filteredUsers.length}
                        className="px-4 py-2 bg-gray-500 text-white rounded-md mr-2 disabled:opacity-50"
                    >
                        Next
                    </button>
                </div>
            </div>}

            {/* Modal Success Edit */}
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

            {/* Modal Konfirmasi Hapus */}
            {showDeleteConfirmModal && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg w-96">
                        <h2 className="text-xl font-semibold text-gray-800">Konfirmasi Hapus</h2>
                        <p className="mt-4 text-gray-600">{modalMessage}</p>
                        <div className="mt-6 flex justify-end space-x-4">
                            <button
                                onClick={handleDeleteUser}
                                className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition"
                            >
                                Hapus
                            </button>
                            <button
                                onClick={() => setShowDeleteConfirmModal(false)}
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

export default Profile;