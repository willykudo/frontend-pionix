import React, { useEffect, useState } from 'react';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import enUS from 'date-fns/locale/en-US';
import shiftService from '../../services/shiftService';
import ShiftForm from './ShiftForm';
import ShiftDetail from './ShiftDetail'; // Import ShiftDetail
import 'react-big-calendar/lib/css/react-big-calendar.css';

const locales = { 'en-US': enUS };
const localizer = dateFnsLocalizer({
    format,
    parse,
    startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 1 }),
    getDay,
    locales,
});

const ShiftList = () => {
    const [shifts, setShifts] = useState([]);
    const [message, setMessage] = useState('');
    const [isFormVisible, setIsFormVisible] = useState(false);
    const [selectedDate, setSelectedDate] = useState(null);
    const [isShiftDetailVisible, setIsShiftDetailVisible] = useState(false);
    const [selectedShiftDetails, setSelectedShiftDetails] = useState([]);
    const [highlightedDates, setHighlightedDates] = useState([]);
    const [events, setEvents] = useState([]);

    const fetchShifts = async () => {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const fetchedShifts = await shiftService.getShifts(token);
                console.log(fetchedShifts)
                setShifts(fetchedShifts);

                // Reduce shifts to a simplified view based on date and type
                const shiftsByDateAndType = fetchedShifts.reduce((acc, shift) => {
                    const startDateKey = new Date(shift.startDate).toDateString();
                    const endDateKey = new Date(shift.endDate).toDateString();
                    const shiftKey = `${startDateKey}-${endDateKey}-${shift.shiftType}`;

                    if (!acc[shiftKey]) {
                        acc[shiftKey] = {
                            startDate: shift.startDate,
                            endDate: shift.endDate,
                            shiftType: shift.shiftType,
                        };
                    }
                    return acc;
                }, {});

                // Map reduced shifts to calendar events
                const formattedEvents = Object.values(shiftsByDateAndType).map(group => ({
                    id: `${group.startDate}-${group.endDate}-${group.shiftType}`,
                    start: new Date(group.startDate),
                    end: new Date(group.endDate),
                    title: group.shiftType === 'Morning' ? 'Shift Pagi' : 'Shift Siang',
                    shiftType: group.shiftType,
                }));

                setEvents(formattedEvents);
            } catch (error) {
                setMessage('Error fetching shifts: ' + (error.response?.data?.message || error.message));
            }
        }
    };


    useEffect(() => {
        fetchShifts();
    }, []);

    const handleSelectSlot = (slotInfo) => {
        setSelectedDate(slotInfo.start);
        setIsFormVisible(true);  // Show the form directly on selecting a date
    };

    const handleEventClick = (event) => {
        setIsShiftDetailVisible(true);

        // Filter shifts berdasarkan tanggal dan shiftType dari event yang diklik
        const shiftsOnDate = shifts.filter(shift =>
            new Date(shift.startDate).toDateString() === new Date(event.start).toDateString() &&
            new Date(shift.endDate).toDateString() === new Date(event.end).toDateString() &&
            shift.shiftType === event.shiftType
        );

        if (shiftsOnDate.length > 0) {
            setSelectedShiftDetails(shiftsOnDate);
            localStorage.setItem('selectedShiftDate', event.start.toISOString());
            localStorage.setItem('selectedShiftEndDate', event.end.toISOString());
            localStorage.setItem('selectedShiftType', event.shiftType);
        } else {
            alert(`No shifts found for ${event.title}`);
        }
    };

    const closeShiftDetail = () => {
        setIsShiftDetailVisible(false);
        setSelectedDate(null);
    };

    const getCellStyle = (date) => {
        if (highlightedDates.includes(date.toDateString())) {
            return {
                className: 'bg-yellow-100 border-2 border-yellow-500 rounded-lg text-black hover:bg-yellow-200 transition-all duration-150'
            };
        }
        return { className: 'hover:bg-gray-100 transition-all duration-150' };
    };

    const getEventStyle = (event) => {
        const eventColor = event.shiftType === 'Morning' ? '#34D399' : '#F59E0B'; // Green for morning, orange for afternoon

        return {
            style: {
                backgroundColor: eventColor,
                color: 'white',
                fontWeight: '500',
                padding: '0.2rem 0.5rem', // Reduced padding for smaller height
                borderRadius: '0.25rem', // Smaller border radius
                fontSize: '0.75rem', // Smaller font size
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)', // Subtle shadow for better fit
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                cursor: 'pointer',
                transition: 'all 0.2s ease-in-out',
            },
            className: 'hover:bg-opacity-90 active:bg-opacity-80',
        };
    };


    return (
        <div className="p-6 bg-gradient-to-b from-blue-100 via-gray-100 to-gray-50 min-h-screen items-center">
            <h1 className="text-3xl font-semibold text-gray-800 text-center mb-8">Jadwal Shift</h1>
            {message && (
                <p className={`mt-4 text-center ${message.includes('successfully') ? 'text-green-500' : 'text-red-500'}`}>
                    {message}
                </p>
            )}

            {!isShiftDetailVisible && (
                <>
                    <div className="mt-6">
                        <Calendar
                            localizer={localizer}
                            events={events}
                            startAccessor="start"
                            endAccessor="end"
                            style={{ height: 500 }}
                            onSelectEvent={handleEventClick}
                            selectable
                            onSelectSlot={handleSelectSlot}
                            dayPropGetter={(date) => ({
                                style: getCellStyle(date),
                            })}
                            views={['month', 'week', 'day', 'agenda']} // Ensure agenda view is available
                            eventPropGetter={getEventStyle}
                        />
                    </div>

                    {isFormVisible && (
                        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
                            <div className="bg-white p-6 rounded-lg shadow-lg z-100 max-w-md w-full">
                                <ShiftForm
                                    fetchShifts={fetchShifts}
                                    isEditMode={false}
                                    selectedShift={null}
                                    selectedDate={selectedDate}
                                    closeForm={() => setIsFormVisible(false)}
                                />
                            </div>
                        </div>
                    )}
                </>
            )}

            {isShiftDetailVisible && (
                <ShiftDetail
                    fetchShifts={fetchShifts}
                    selectedDate={selectedDate}
                    shiftsOnDate={selectedShiftDetails}
                    closeDetail={closeShiftDetail}
                />
            )}
        </div>
    );
};

export default ShiftList;
