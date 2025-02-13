import React, { useState, useEffect } from 'react';
import attendanceService from '../../services/attendanceService';
import authService from '../../services/authService';
import shiftService from '../../services/shiftService';

const CheckInForm = ({ fetchAttendances, onCancel, onClose }) => {
    const [employeeId, setEmployeeId] = useState('');
    const [employeeName, setEmployeeName] = useState('');
    const [shiftStartTime, setShiftStartTime] = useState('');
    const [shiftEndTime, setShiftEndTime] = useState('');
    const [checkInImage, setCheckInImage] = useState(null);
    const [error, setError] = useState('');
    const [user, setUser] = useState(null);
    const [employeesForAdmin, setEmployeesForAdmin] = useState([]);
    const [role, setRole] = useState('');  // New state to check if the user is admin
    const [showSuccessModal, setShowSuccessModal] = useState(false); // State for success modal
    const [modalMessage, setModalMessage] = useState('');

    useEffect(() => {
        const fetchUserData = async () => {
            const token = localStorage.getItem('token');
            if (token) {
                try {
                    const response = await authService.getProfile(token);
                    setUser(response.data);
                    localStorage.setItem('user', JSON.stringify(response.data));

                    const employeeId = response.data._id;
                    const name = response.data.name;
                    setRole(response.data.role);  // Check if the user is admin

                    if (response.data.role === 'karyawan') {
                        // For Karyawan
                        const shifts = await shiftService.getShifts(token);
                        const today = new Date();
                        const todayString = today.toISOString().split('T')[0];

                        const shiftForToday = shifts.find(shift => {
                            const startDate = new Date(shift.startDate).toISOString().split('T')[0];
                            const endDate = new Date(shift.endDate).toISOString().split('T')[0];
                            const isToday = startDate <= todayString && endDate >= todayString;

                            const isEmployeeInShift = shift.employeeIds.some(emp => emp._id === employeeId);

                            return isToday && isEmployeeInShift;
                        });

                        if (shiftForToday) {
                            setShiftStartTime(`${todayString}T${shiftForToday.shiftStart}:00`);
                            setShiftEndTime(`${todayString}T${shiftForToday.shiftEnd}:00`);
                        }

                        setEmployeeId(employeeId);
                        setEmployeeName(name);
                    } else if (response.data.role === 'admin') {
                        // For Admin - get all employees scheduled today
                        const shifts = await shiftService.getShifts(token);
                        const today = new Date();
                        const todayString = today.toISOString().split('T')[0];

                        const shiftsForToday = shifts.filter(shift => {
                            const startDate = new Date(shift.startDate).toISOString().split('T')[0];
                            const endDate = new Date(shift.endDate).toISOString().split('T')[0];
                            return startDate <= todayString && endDate >= todayString;
                        });

                        const employeesInShifts = shiftsForToday.flatMap(shift =>
                            shift.employeeIds.map(emp => ({
                                employeeId: emp._id,
                                employeeName: emp.name,
                                shiftStartTime: shift.shiftStart,
                                shiftEndTime: shift.shiftEnd
                            }))
                        );

                        console.log(employeesInShifts);

                        setEmployeesForAdmin(employeesInShifts);
                    }
                } catch (error) {
                    console.error('Error fetching profile data:', error);
                }
            }
        };
        fetchUserData();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Check if shiftStartTime and shiftEndTime are empty
        if (!shiftStartTime || !shiftEndTime) {
            setError('Harap isi jadwal shift terlebih dahulu.');
            return;
        }

        try {
            const checkInData = { employeeId, employeeName, shiftStartTime, shiftEndTime };
            await attendanceService.addCheckIn(checkInData, checkInImage);

            // Clear the form data after successful check-in
            setEmployeeId('');
            setEmployeeName('');
            setShiftStartTime('');
            setShiftEndTime('');
            setCheckInImage(null);
            setModalMessage('Data check in berhasil ditambahkan.');
            fetchAttendances();
            setShowSuccessModal(true); // Show success modal
            setTimeout(() => {
                setShowSuccessModal(false); // Close success modal after a few seconds
                onClose();
            }, 2000);
        } catch (error) {
            setError(error.message);
        }
    };

    return (
        <>
            {/* Admin View - Show all employees for today */}
            {role === 'admin' &&
                (
                    <form onSubmit={handleSubmit} className="bg-white p-8 rounded-xl shadow-lg max-w-lg mx-auto space-y-6">
                        <h2 className="text-2xl font-semibold text-center text-gray-800 mb-6">Pilih Karyawan untuk Check In</h2>

                        <div className="space-y-4">
                            {/* Dropdown untuk memilih karyawan */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Pilih Karyawan</label>
                                <select
                                    onChange={(e) => {
                                        const selectedEmployee = employeesForAdmin.find(emp => emp.employeeId === e.target.value);
                                        if (selectedEmployee) {
                                            setEmployeeId(selectedEmployee.employeeId);
                                            setEmployeeName(selectedEmployee.employeeName);
                                            setShiftStartTime(`${new Date().toISOString().split('T')[0]}T${selectedEmployee.shiftStartTime}:00`);
                                            setShiftEndTime(`${new Date().toISOString().split('T')[0]}T${selectedEmployee.shiftEndTime}:00`);
                                        }
                                    }}
                                    className="w-full px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg text-gray-700"
                                >
                                    <option value="">Pilih Karyawan</option>
                                    {employeesForAdmin.map(emp => (
                                        <option key={emp.employeeId} value={emp.employeeId}>
                                            {emp.employeeName}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Form Fields for Check-In */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Id Karyawan</label>
                                <input
                                    type="text"
                                    value={employeeId}
                                    onChange={(e) => setEmployeeId(e.target.value)}
                                    disabled
                                    className="w-full px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg text-gray-700"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">Nama Karyawan</label>
                                <input
                                    type="text"
                                    value={employeeName}
                                    onChange={(e) => setEmployeeName(e.target.value)}
                                    disabled
                                    className="w-full px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg text-gray-700"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">Waktu Mulai Shift</label>
                                <input
                                    type="datetime-local"
                                    value={shiftStartTime}
                                    onChange={(e) => setShiftStartTime(e.target.value)}
                                    disabled
                                    className="w-full px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg text-gray-700"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">Waktu Selesai Shift</label>
                                <input
                                    type="datetime-local"
                                    value={shiftEndTime}
                                    onChange={(e) => setShiftEndTime(e.target.value)}
                                    disabled
                                    className="w-full px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg text-gray-700"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">Gambar Check-In</label>
                                <input
                                    type="file"
                                    onChange={(e) => setCheckInImage(e.target.files[0])}
                                    accept="image/*"
                                    required
                                    className="w-full px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg text-gray-700"
                                />
                            </div>
                        </div>

                        <div className="flex justify-between items-center space-x-4">
                            <button
                                type="submit"
                                className="w-full py-3 text-white bg-blue-600 rounded-md hover:bg-blue-700 transition"
                            >
                                Check In
                            </button>

                            <button
                                type="button"
                                onClick={onCancel}
                                className="w-full py-3 text-gray-700 bg-gray-300 rounded-md hover:bg-gray-400 transition"
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                )
            }

            {role === 'karyawan' &&
                (
                    <form onSubmit={handleSubmit} className="bg-white p-8 rounded-xl shadow-lg max-w-lg mx-auto space-y-6">
                        <h2 className="text-2xl font-semibold text-center text-gray-800 mb-6">Check In</h2>
                        {error && <p className="text-red-600 text-sm text-center">{error}</p>}

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Id Karyawan</label>
                                <input
                                    type="text"
                                    value={employeeId}
                                    onChange={(e) => setEmployeeId(e.target.value)}
                                    placeholder="Enter Employee ID"
                                    disabled
                                    className="w-full px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg text-gray-700"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">Nama Karyawan</label>
                                <input
                                    type="text"
                                    value={employeeName}
                                    onChange={(e) => setEmployeeName(e.target.value)}
                                    placeholder="Enter Employee Name"
                                    disabled
                                    className="w-full px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg text-gray-700"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">Waktu Mulai Shift</label>
                                <input
                                    type="datetime-local"
                                    value={shiftStartTime}
                                    onChange={(e) => setShiftStartTime(e.target.value)}
                                    disabled
                                    className="w-full px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg text-gray-700"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">Waktu Selesai Shift</label>
                                <input
                                    type="datetime-local"
                                    value={shiftEndTime}
                                    onChange={(e) => setShiftEndTime(e.target.value)}
                                    disabled
                                    className="w-full px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg text-gray-700"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">Gambar Check-In</label>
                                <input
                                    type="file"
                                    onChange={(e) => setCheckInImage(e.target.files[0])}
                                    accept="image/*"
                                    required
                                    className="w-full px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg text-gray-700"
                                />
                            </div>
                        </div>

                        <div className="flex justify-between items-center space-x-4">
                            <button
                                type="submit"
                                className="w-full py-3 text-white bg-blue-600 rounded-md hover:bg-blue-700 transition"
                            >
                                Check In
                            </button>

                            <button
                                type="button"
                                onClick={onCancel}
                                className="w-full py-3 text-gray-700 bg-gray-300 rounded-md hover:bg-gray-400 transition"
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                )
            }

            {showSuccessModal && (
                <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg w-96">
                        <h2 className="text-xl font-semibold text-gray-800">Berhasil</h2>
                        <p className="mt-4 text-gray-600">{modalMessage}</p>
                        <div className="mt-6 flex justify-end">
                            <button
                                onClick={() => {
                                    setShowSuccessModal(false);
                                    onClose(); // Tutup form setelah modal sukses
                                }}
                                className="px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition"
                            >
                                OK
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default CheckInForm;
