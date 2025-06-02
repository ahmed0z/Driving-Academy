import React, { useState, useEffect, useMemo } from 'react';
import { Calendar, Clock, Car, User, Plus, Trash2, Edit3, Save, X, Hash, ListFilter, Settings, BookUser, Award, Users, Sun, Moon, AlertTriangle, CheckCircle, XCircle, Download, Check, ShieldAlert, DollarSign, MessageSquare, TrendingUp, Edit, FileText, CreditCard, Users2, CarFront, ArrowDownCircle, ArrowUpCircle, Info, Search, Eye, EyeOff } from 'lucide-react';

// Helper function to capitalize the first letter of each word
const capitalizeWords = (str) => {
  if (typeof str !== 'string' || !str) return '';
  return str
    .toLowerCase()
    .split(' ')
    .map(word => {
      if (word.length === 0) return '';
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(' ');
};

// Helper function to get current month's start and end date as strings
const getCurrentMonthDateRangeStrings = () => {
    const today = new Date();
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

    const formatDate = (date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    return {
        start: formatDate(firstDayOfMonth),
        end: formatDate(lastDayOfMonth)
    };
};

const todayDateString = new Date().toISOString().split('T')[0];

// Helper function to format 24-hour time to 12-hour AM/PM
const formatTo12Hour = (time24) => {
    if (!time24) return '';
    const [hours, minutes] = time24.split(':');
    let h = parseInt(hours, 10);
    const period = h >= 12 ? 'PM' : 'AM';
    h = h % 12 || 12; // Convert h to 12-hour format (0 becomes 12)
    return `${String(h).padStart(2, '0')}:${minutes} ${period}`;
};

// Helper function to add one hour to a 12-hour AM/PM time string
const addOneHourTo12HourTime = (time12Hour) => {
    if (!time12Hour) return '';
    const [timePart, period] = time12Hour.split(' ');
    let [hours, minutes] = timePart.split(':').map(Number);

    // Convert to 24-hour format for easier addition
    if (period === 'PM' && hours !== 12) {
        hours += 12;
    } else if (period === 'AM' && hours === 12) { // Midnight case
        hours = 0;
    }

    hours = (hours + 1) % 24; // Add one hour and handle overflow

    // Convert back to 12-hour AM/PM string
    const newPeriod = hours >= 12 ? 'PM' : 'AM';
    let displayHours = hours % 12 || 12;

    return `${String(displayHours).padStart(2, '0')}:${String(minutes).padStart(2, '0')} ${newPeriod}`;
};


// Main component for the Driving School Management System
const DrivingSchoolSystem = () => {
  // --- Core States ---
  const [captains, setCaptains] = useState([
    { id: 1, name: 'Ahmed Hassan', phone: '010-1234-5678' },
    { id: 2, name: 'Mohamed Ali', phone: '010-2345-6789' },
    { id: 3, name: 'Sara Ahmed', phone: '010-3456-7890' }
  ]);
  const [carsList, setCarsList] = useState([
    { id: 1, name: 'Toyota Yaris', number: 'ABC 123', type: 'automatic' },
    { id: 2, name: 'Honda Civic', number: 'DEF 456', type: 'automatic' },
    { id: 3, name: 'Kia Cerato', number: 'GHI 789', type: 'automatic' },
    { id: 4, name: 'Fiat Tipo', number: 'JKL 012', type: 'manual' },
    { id: 5, name: 'Hyundai Accent', number: 'MNO 345', type: 'manual' },
  ]);
  const [reservations, setReservations] = useState([]);
  const [selectedDate, setSelectedDate] = useState(todayDateString);
  const [captainHolidays, setCaptainHolidays] = useState([]);
  const [carMaintenance, setCarMaintenance] = useState([]);
  const [studentProfiles, setStudentProfiles] = useState({});
  const [totalCoursePrice, setTotalCoursePrice] = useState(2000);
  const [isEditingCoursePrice, setIsEditingCoursePrice] = useState(false);
  const [tempCoursePrice, setTempCoursePrice] = useState(totalCoursePrice);
  const [manualTransactions, setManualTransactions] = useState([]);

  // --- UI Control States ---
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [currentPage, setCurrentPage] = useState('reservations');
  const [currentReservationSubPage, setCurrentReservationSubPage] = useState('newReservation');
  const [currentManagementSubPage, setCurrentManagementSubPage] = useState('money');
  const [activeForm, setActiveForm] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmModalConfig, setConfirmModalConfig] = useState({ message: '', onConfirm: null, itemType: '' });
  const [notification, setNotification] = useState({ isVisible: false, message: '', type: 'info' });
  const [showManualTransactionModal, setShowManualTransactionModal] = useState(false);
  const [manualTransactionType, setManualTransactionType] = useState('add');
  const [manualTransactionAmount, setManualTransactionAmount] = useState('');
  const [manualTransactionReason, setManualTransactionReason] = useState('');

  // --- Time Slots Definition (12-hour format) ---
  const timeSlots24HourBase = [
    '08:00', '09:00', '10:00', '11:00', '12:00',
    '13:00', '14:00', '15:00', '16:00', '17:00', '18:00'
  ];
  const timeSlots = useMemo(() => timeSlots24HourBase.map(formatTo12Hour), []);


  // --- Form States ---
  const initialNewReservationState = { studentName: '', phone: '', carType: 'automatic', carId: '', time: timeSlots[0], captainId: '', date: todayDateString, paymentAmount: '', captainFeedback: '' };
  const [newReservation, setNewReservation] = useState({...initialNewReservationState, date: selectedDate });
  const [nextLectureNumberForForm, setNextLectureNumberForForm] = useState(null);
  const [phoneInputError, setPhoneInputError] = useState('');
  const [studentHasOtherLecturesToday, setStudentHasOtherLecturesToday] = useState(false);
  const [newHoliday, setNewHoliday] = useState({ captainId: '', startDate: '', endDate: '', reason: '' });
  const [newMaintenance, setNewMaintenance] = useState({ carId: '', startDate: '', endDate: '', reason: '' });
  const [newCaptain, setNewCaptain] = useState({ name: '', phone: '' });
  const [newCar, setNewCar] = useState({ name: '', number: '', type: 'automatic' });

  // --- Editing States ---
  const [editingCaptainId, setEditingCaptainId] = useState(null);
  const [editCaptainData, setEditCaptainData] = useState({ name: '', phone: '' });
  const [editingCarId, setEditingCarId] = useState(null);
  const [editCarData, setEditCarData] = useState({ name: '', number: '', type: 'automatic' });
  const [editingStudentPhoneKey, setEditingStudentPhoneKey] = useState(null);
  const [editStudentData, setEditStudentData] = useState({ name: '', phone: '' });
  const [editingFeedbackLectureId, setEditingFeedbackLectureId] = useState(null);
  const [currentFeedbackText, setCurrentFeedbackText] = useState('');

  // --- Filter/Search States for Student History ---
  const currentMonthRange = getCurrentMonthDateRangeStrings();
  const [exportStartDate, setExportStartDate] = useState(currentReservationSubPage === 'studentHistory' ? currentMonthRange.start : '');
  const [exportEndDate, setExportEndDate] = useState(currentReservationSubPage === 'studentHistory' ? currentMonthRange.end : '');
  const [studentHistorySearchQuery, setStudentHistorySearchQuery] = useState('');
  const [moneyFilterStartDate, setMoneyFilterStartDate] = useState('');
  const [moneyFilterEndDate, setMoneyFilterEndDate] = useState('');

  // --- Search/Filter States for Maintenance & Holidays ---
  const [showCarMaintenanceSearch, setShowCarMaintenanceSearch] = useState(false);
  const [carMaintenanceSearchQuery, setCarMaintenanceSearchQuery] = useState('');
  const [carMaintenanceSearchDate, setCarMaintenanceSearchDate] = useState('');

  const [showCaptainHolidaySearch, setShowCaptainHolidaySearch] = useState(false);
  const [captainHolidaySearchQuery, setCaptainHolidaySearchQuery] = useState('');
  const [captainHolidaySearchDate, setCaptainHolidaySearchDate] = useState('');

  // --- State for Info Tab ---
  const [infoTabDate, setInfoTabDate] = useState(todayDateString);


  // --- Constants ---
  const MANDATORY_PAYMENT_LECTURES = [1, 2, 4];
  const MAX_LECTURES_PER_STUDENT = 9;

  const automaticCarCount = carsList.filter(c => c.type === 'automatic').length;
  const manualCarCount = carsList.filter(c => c.type === 'manual').length;
  const totalCarCount = carsList.length;

  const aggregatedStudents = React.useMemo(() => {
    const studentsData = new Map();
    reservations.forEach(reservation => {
        const phone = reservation.phone.trim();
        const studentName = capitalizeWords(reservation.studentName);
        if (!studentsData.has(phone)) {
            studentsData.set(phone, { name: studentName, phone: phone, lectures: [] });
        }
        studentsData.get(phone).name = studentName; // Ensure latest name is used
        studentsData.get(phone).lectures.push(reservation);
    });
    studentsData.forEach(student => {
        student.lectures.sort((a, b) => (a.lectureNumber || 0) - (b.lectureNumber || 0) || new Date(a.date).getTime() - new Date(b.date).getTime());
    });
    return Array.from(studentsData.values()).sort((a,b) => a.name.localeCompare(b.name));
  }, [reservations]);

  const filteredAndSearchedStudentHistory = useMemo(() => {
    let studentsToDisplay = [...aggregatedStudents];

    if (studentHistorySearchQuery.trim() !== '') {
        const lowerSearchQuery = studentHistorySearchQuery.toLowerCase();
        studentsToDisplay = studentsToDisplay.filter(student =>
            student.name.toLowerCase().includes(lowerSearchQuery) ||
            student.phone.includes(lowerSearchQuery)
        );
    }

    if (exportStartDate || exportEndDate) {
        studentsToDisplay = studentsToDisplay.map(student => {
            const lecturesInDateRange = student.lectures.filter(lecture => {
                const lectureDateStr = lecture.date;
                if (exportStartDate && exportEndDate) {
                    return lectureDateStr >= exportStartDate && lectureDateStr <= exportEndDate;
                } else if (exportStartDate) {
                    // If only start date is provided, filter for that specific date for consistency with previous behavior
                    // Or, if you want to filter from start date onwards, use: return lectureDateStr >= exportStartDate;
                    return lectureDateStr === exportStartDate; 
                } else if (exportEndDate) {
                     // If only end date is provided, filter for that specific date
                    return lectureDateStr === exportEndDate;
                }
                return true; 
            });
            return { ...student, lectures: lecturesInDateRange };
        }).filter(student => student.lectures.length > 0);
    }
    return studentsToDisplay;
  }, [aggregatedStudents, studentHistorySearchQuery, exportStartDate, exportEndDate]);

  const displayedCarMaintenance = useMemo(() => {
    let filtered = [...carMaintenance];
    if (showCarMaintenanceSearch) {
        if (carMaintenanceSearchQuery.trim() !== '') {
            const query = carMaintenanceSearchQuery.toLowerCase();
            filtered = filtered.filter(m => {
                const car = getCarDetails(parseInt(m.carId));
                return car && (car.name.toLowerCase().includes(query) || car.number.toLowerCase().includes(query));
            });
        }
        if (carMaintenanceSearchDate) {
            filtered = filtered.filter(m => m.startDate <= carMaintenanceSearchDate && m.endDate >= carMaintenanceSearchDate);
        }
    } else { 
        filtered = filtered.filter(m => m.endDate >= todayDateString);
    }
    return filtered.sort((a,b) => new Date(a.startDate) - new Date(b.startDate));
  }, [carMaintenance, showCarMaintenanceSearch, carMaintenanceSearchQuery, carMaintenanceSearchDate, carsList]);

  const displayedCaptainHolidays = useMemo(() => {
    let filtered = [...captainHolidays];
    if (showCaptainHolidaySearch) {
        if (captainHolidaySearchQuery.trim() !== '') {
            const query = captainHolidaySearchQuery.toLowerCase();
            filtered = filtered.filter(h => getCaptainName(parseInt(h.captainId)).toLowerCase().includes(query));
        }
        if (captainHolidaySearchDate) {
            filtered = filtered.filter(h => h.startDate <= captainHolidaySearchDate && h.endDate >= captainHolidaySearchDate);
        }
    } else { 
        filtered = filtered.filter(h => h.endDate >= todayDateString);
    }
    return filtered.sort((a,b) => new Date(a.startDate) - new Date(b.startDate));
  }, [captainHolidays, showCaptainHolidaySearch, captainHolidaySearchQuery, captainHolidaySearchDate, captains]);

  const firstLecturesOnSelectedInfoDate = useMemo(() => {
    if (!infoTabDate) return [];
    return reservations
        .filter(res => res.date === infoTabDate && res.lectureNumber === 1)
        .sort((a, b) => timeSlots.indexOf(a.time) - timeSlots.indexOf(b.time));
  }, [reservations, infoTabDate, timeSlots]);


  const getCurrentMonthDateRange = () => {
    const today = new Date();
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    lastDay.setHours(23,59,59,999); // Ensure end of day
    return { start: firstDay, end: lastDay, monthYear: `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}` };
  };

  const getTodayDateRange = (dateStr) => {
    const date = new Date(dateStr);
    const start = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const end = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    end.setHours(23,59,59,999); // Ensure end of day
    return { start, end };
  };

  const calculateFinancials = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setHours(23,59,59,999); // Ensure end of day for endDate comparison

    const reservationPayments = reservations
        .filter(res => {
            const resDate = new Date(res.date);
            return resDate >= start && resDate <= end;
        })
        .reduce((sum, res) => sum + (res.paymentAmount || 0), 0);

    const manualAdds = manualTransactions
        .filter(t => t.type === 'add' && new Date(t.date) >= start && new Date(t.date) <= end)
        .reduce((sum, t) => sum + t.amount, 0);

    const manualTakes = manualTransactions
        .filter(t => t.type === 'take' && new Date(t.date) >= start && new Date(t.date) <= end)
        .reduce((sum, t) => sum + t.amount, 0);

    return { collected: reservationPayments + manualAdds - manualTakes, taken: manualTakes };
  };

  const financialsForFilteredRange = useMemo(() => {
    if (moneyFilterStartDate && moneyFilterEndDate) {
        return calculateFinancials(moneyFilterStartDate, moneyFilterEndDate);
    }
    const currentMonth = getCurrentMonthDateRange();
    // Format Date objects from getCurrentMonthDateRange to strings if calculateFinancials expects strings
    const formatDate = (dateObj) => dateObj.toISOString().split('T')[0];
    return calculateFinancials(formatDate(currentMonth.start), formatDate(currentMonth.end));
  }, [reservations, manualTransactions, moneyFilterStartDate, moneyFilterEndDate]);

  const financialsForToday = useMemo(() => {
    // selectedDate is already a string in 'YYYY-MM-DD' format
    const todayRange = getTodayDateRange(selectedDate); 
    const formatDate = (dateObj) => dateObj.toISOString().split('T')[0];
    return calculateFinancials(formatDate(todayRange.start), formatDate(todayRange.end));
  }, [reservations, manualTransactions, selectedDate]);


  const isCarUnderMaintenance = (carId, date) => carMaintenance.some(m => parseInt(m.carId) === carId && date >= m.startDate && date <= m.endDate && m.endDate >= todayDateString);
  const isCarReserved = (carId, date, time) => reservations.some(r => parseInt(r.carId) === carId && r.date === date && r.time === time); // time is now 12-hour format
  
  const getAvailableCarsForReservation = (date, time, carType) => { // time is 12-hour format
    if (!date || !time || !carType) return [];
    return carsList.filter(car => car.type === carType && !isCarReserved(car.id, date, time) && !isCarUnderMaintenance(car.id, date));
  };
  
  const getHourlyAvailability = (date) => { // date is YYYY-MM-DD
    return timeSlots.map(startTime12Hour => { // timeSlots are now 12-hour format
        const availableAutomatic = carsList.filter(car => car.type === 'automatic' && !isCarReserved(car.id, date, startTime12Hour) && !isCarUnderMaintenance(car.id, date)).length;
        const totalActiveAutomatic = automaticCarCount - carMaintenance.filter(m => carsList.find(c=>c.id === parseInt(m.carId))?.type === 'automatic' && date >= m.startDate && date <= m.endDate && m.endDate >= todayDateString).length;
        const availableManual = carsList.filter(car => car.type === 'manual' && !isCarReserved(car.id, date, startTime12Hour) && !isCarUnderMaintenance(car.id, date)).length;
        const totalActiveManual = manualCarCount - carMaintenance.filter(m => carsList.find(c=>c.id === parseInt(m.carId))?.type === 'manual' && date >= m.startDate && date <= m.endDate && m.endDate >= todayDateString).length;
        
        const endTime12Hour = addOneHourTo12HourTime(startTime12Hour);

        return { 
            time: startTime12Hour, // This is the 12-hour start time string
            displayTime: `${startTime12Hour} - ${endTime12Hour}`, // Formatted display string
            automatic: { available: availableAutomatic, total: Math.max(0, totalActiveAutomatic) }, 
            manual: { available: availableManual, total: Math.max(0, totalActiveManual) } 
        };
    });
  };

  const getAvailableCaptains = (date, time) => { // time is 12-hour format
    if(!date || !time) return [];
    const busyCaptainIds = reservations.filter(r => r.date === date && r.time === time).map(r => parseInt(r.captainId));
    const holidayCaptainIds = captainHolidays.filter(h => date >= h.startDate && date <= h.endDate && h.endDate >= todayDateString).map(h => parseInt(h.captainId));
    return captains.filter(c => !busyCaptainIds.includes(c.id) && !holidayCaptainIds.includes(c.id));
  };
  const getCarDetails = (carId) => carsList.find(c => c.id === carId);
  const getCaptainName = (captainId) => captains.find(c => c.id === captainId)?.name || 'Unknown Captain';

  let notificationTimer = null;
  const showFeedback = (message, type = 'info') => {
    if (notificationTimer) clearTimeout(notificationTimer);
    setNotification({ isVisible: true, message, type });
    notificationTimer = setTimeout(() => setNotification({ isVisible: false, message: '', type: 'info' }), 5000);
  };

  const handleConfirmDelete = () => {
    if (confirmModalConfig.onConfirm) confirmModalConfig.onConfirm();
    setShowConfirmModal(false);
    setConfirmModalConfig({ message: '', onConfirm: null, itemType: '' });
  };
  const handleCancelDelete = () => {
    setShowConfirmModal(false);
    setConfirmModalConfig({ message: '', onConfirm: null, itemType: '' });
  };

  const addReservation = () => {
    const trimmedPhone = newReservation.phone.trim();
    const capitalizedName = capitalizeWords(newReservation.studentName.trim());

    if (trimmedPhone.length !== 11 || !/^\d+$/.test(trimmedPhone)) { showFeedback('Phone number must be exactly 11 numeric digits.', 'error'); setPhoneInputError('Phone number must be exactly 11 digits.'); return; }
    if (!capitalizedName) { showFeedback('Student name cannot be empty.', 'error'); return; }
    const existingStudentProfile = studentProfiles[trimmedPhone];
    if (existingStudentProfile && existingStudentProfile.name !== capitalizedName) { const errorMsg = `Phone number ${trimmedPhone} is already associated with "${existingStudentProfile.name}".`; showFeedback(errorMsg, 'error'); setPhoneInputError(errorMsg); return; }
    const existingReservationAtSameTime = reservations.find( r => r.phone.trim() === trimmedPhone && r.date === newReservation.date && r.time === newReservation.time ); // newReservation.time is 12-hour
    if (existingReservationAtSameTime) { showFeedback(`Student ${capitalizedName} already has a reservation at ${newReservation.time} on ${newReservation.date}.`, 'error'); return; }
    setPhoneInputError('');

    let lectureNumberToSave = nextLectureNumberForForm;
    if (lectureNumberToSave === null && trimmedPhone) { 
        const studentPreviousReservations = reservations.filter(r => r.phone.trim() === trimmedPhone);
        lectureNumberToSave = 1;
        if (studentPreviousReservations.length > 0) {
            const maxLectureNum = Math.max(...studentPreviousReservations.map(r => r.lectureNumber || 0));
            lectureNumberToSave = maxLectureNum + 1;
        }
    }

    if (lectureNumberToSave > MAX_LECTURES_PER_STUDENT) {
        showFeedback(`Student ${capitalizedName} has reached the maximum of ${MAX_LECTURES_PER_STUDENT} lectures. Cannot add more.`, 'error');
        return;
    }

    if (!newReservation.carId || !newReservation.captainId || !newReservation.date || !newReservation.time) { showFeedback('Please fill all required fields for reservation (car, captain, date, time).', 'error'); return; }
    const paymentAmountValue = parseFloat(newReservation.paymentAmount);
    if (MANDATORY_PAYMENT_LECTURES.includes(lectureNumberToSave)) { if (isNaN(paymentAmountValue) || paymentAmountValue <= 0) { showFeedback(`Warning: Payment is typically mandatory for Lecture #${lectureNumberToSave} and was not entered or is invalid.`, 'error'); } } // Changed to error for clarity
    const carIdNum = parseInt(newReservation.carId);
    const car = getCarDetails(carIdNum);
    if (!car || isCarReserved(carIdNum, newReservation.date, newReservation.time) || isCarUnderMaintenance(carIdNum, newReservation.date)) { showFeedback('Selected car is no longer available. Please select another car.', 'error'); return; }
    
    const reservationToAdd = { id: Date.now(), ...newReservation, studentName: capitalizedName, phone: trimmedPhone, carId: carIdNum, captainId: parseInt(newReservation.captainId), lectureNumber: lectureNumberToSave, paymentAmount: newReservation.paymentAmount && !isNaN(paymentAmountValue) && paymentAmountValue > 0 ? paymentAmountValue : null, captainFeedback: '' };
    setReservations([...reservations, reservationToAdd]);
    setStudentProfiles(prevProfiles => ({ ...prevProfiles, [trimmedPhone]: { name: capitalizedName, idCardSubmitted: prevProfiles[trimmedPhone]?.idCardSubmitted || false } }));
    setNewReservation({...initialNewReservationState, date: selectedDate, time: timeSlots[0] }); // Reset time to the first slot
    setNextLectureNumberForForm(null);
    showFeedback(`Reservation added! (Lecture #${lectureNumberToSave})`, 'success');
  };

  const addHoliday = () => {
    if (!newHoliday.captainId || !newHoliday.startDate || !newHoliday.endDate) { showFeedback('Please select captain and dates for holiday.', 'error'); return; }
    if (newHoliday.startDate > newHoliday.endDate) { showFeedback('Holiday start date cannot be after end date.', 'error'); return; }
    setCaptainHolidays([...captainHolidays, { id: Date.now(), ...newHoliday, captainId: parseInt(newHoliday.captainId) }]);
    setNewHoliday({ captainId: '', startDate: '', endDate: '', reason: '' });
    setActiveForm(null); showFeedback('Holiday added successfully!', 'success');
  };

  const addMaintenance = () => {
    if (!newMaintenance.carId || !newMaintenance.startDate || !newMaintenance.endDate || !newMaintenance.reason) { showFeedback('Please select car, dates, and reason for maintenance.', 'error'); return; }
    if (newMaintenance.startDate > newMaintenance.endDate) { showFeedback('Maintenance start date cannot be after end date.', 'error'); return; }
    setCarMaintenance([...carMaintenance, { id: Date.now(), ...newMaintenance, carId: parseInt(newMaintenance.carId) }]);
    setNewMaintenance({ carId: '', startDate: '', endDate: '', reason: '' });
    setActiveForm(null); showFeedback('Car maintenance schedule added!', 'success');
  };

  const addCaptain = () => {
    if (!newCaptain.name || !newCaptain.phone) { showFeedback('Captain name and phone are required.', 'error'); return; }
    setCaptains([...captains, { id: Date.now(), ...newCaptain }]);
    setNewCaptain({ name: '', phone: '' }); showFeedback('Captain added!', 'success');
  };
  const handleUpdateCaptain = () => {
    if (!editCaptainData.name || !editCaptainData.phone) { showFeedback('Captain name and phone cannot be empty.', 'error'); return; }
    setCaptains(captains.map(c => c.id === editingCaptainId ? { ...c, ...editCaptainData } : c));
    setEditingCaptainId(null); showFeedback('Captain updated!', 'success');
  };

  const requestDeleteCaptain = (id) => {
    const captainToDelete = captains.find(c => c.id === id);
    if (!captainToDelete) return;
    if (reservations.some(r => parseInt(r.captainId) === id)) { showFeedback(`Cannot delete captain ${captainToDelete.name}, they have existing reservations.`, 'error'); return; }
    if (captainHolidays.some(h => parseInt(h.captainId) === id && h.endDate >= todayDateString)) { showFeedback(`Cannot delete captain ${captainToDelete.name}, they have scheduled upcoming holidays.`, 'error'); return; }
    setConfirmModalConfig({ message: `Are you sure you want to delete captain "${captainToDelete.name}"?`, onConfirm: () => { setCaptains(p => p.filter(c => c.id !== id)); showFeedback('Captain deleted.', 'success'); }, itemType: 'Captain' });
    setShowConfirmModal(true);
  };

  const addCar = () => {
    if (!newCar.name || !newCar.number) { showFeedback('Car name and number are required.', 'error'); return; }
    if (carsList.some(car => car.number.toLowerCase() === newCar.number.toLowerCase())) { showFeedback('Car with this number already exists.', 'error'); return; }
    setCarsList([...carsList, { id: Date.now(), ...newCar }]);
    setNewCar({ name: '', number: '', type: 'automatic' }); showFeedback('Car added!', 'success');
  };
  const handleUpdateCar = () => {
    if (!editCarData.name || !editCarData.number) { showFeedback('Car name and number cannot be empty.', 'error'); return; }
    if (carsList.some(car => car.id !== editingCarId && car.number.toLowerCase() === editCarData.number.toLowerCase())) { showFeedback('Another car with this number exists.', 'error'); return; }
    setCarsList(carsList.map(c => c.id === editingCarId ? { ...c, ...editCarData } : c));
    setEditingCarId(null); showFeedback('Car updated!', 'success');
  };

  const requestDeleteCar = (id) => {
    const carToDelete = carsList.find(c => c.id === id);
    if(!carToDelete) return;
    if (reservations.some(r => parseInt(r.carId) === id)) { showFeedback(`Cannot delete car "${carToDelete.name} (${carToDelete.number})", it has existing reservations.`, 'error'); return; }
    if (carMaintenance.some(m => parseInt(m.carId) === id && m.endDate >= todayDateString)) { showFeedback(`Cannot delete car "${carToDelete.name} (${carToDelete.number})", it has scheduled upcoming maintenance.`, 'error'); return; }
    setConfirmModalConfig({ message: `Are you sure you want to delete car "${carToDelete.name} (${carToDelete.number})"?`, onConfirm: () => { setCarsList(p => p.filter(c => c.id !== id)); showFeedback('Car deleted.', 'success'); }, itemType: 'Car' });
    setShowConfirmModal(true);
  };

  const requestDeleteReservation = (id) => {
    const res = reservations.find(r => r.id === id);
    if (!res) return;
    setConfirmModalConfig({ message: `Delete reservation for "${res.studentName}" (Lecture #${res.lectureNumber}) on ${res.date} at ${res.time}?`, onConfirm: () => { setReservations(p => p.filter(r => r.id !== id)); showFeedback('Reservation deleted.', 'success'); }, itemType: 'Reservation' });
    setShowConfirmModal(true);
  };

  const requestDeleteHoliday = (id) => {
    const hol = captainHolidays.find(h => h.id === id);
    if (!hol) return;
    const capName = getCaptainName(parseInt(hol.captainId));
    setConfirmModalConfig({ message: `Delete holiday for "${capName}" (${hol.startDate} to ${hol.endDate})?`, onConfirm: () => { setCaptainHolidays(p => p.filter(h => h.id !== id)); showFeedback('Holiday deleted.', 'success'); }, itemType: 'Holiday' });
    setShowConfirmModal(true);
  };

  const requestDeleteMaintenance = (id) => {
    const maint = carMaintenance.find(m => m.id === id);
    if (!maint) return;
    const carDet = getCarDetails(parseInt(maint.carId));
    const carName = carDet ? `${carDet.name} (${carDet.number})` : 'Unknown Car';
    setConfirmModalConfig({ message: `Delete maintenance for "${carName}" (${maint.startDate} to ${maint.endDate})?`, onConfirm: () => { setCarMaintenance(p => p.filter(m => m.id !== id)); showFeedback('Maintenance record deleted.', 'success'); }, itemType: 'Maintenance' });
    setShowConfirmModal(true);
  };

  const getDayReservations = (date) => reservations.filter(r => r.date === date);

  const handleUpdateStudent = () => {
    const { name, phone } = editStudentData;
    const newName = capitalizeWords(name);
    const newPhone = phone.trim();

    if (!newName) { showFeedback('Student name cannot be empty.', 'error'); return; }
    if (newPhone.length !== 11 || !/^\d+$/.test(newPhone)) { showFeedback('Phone number must be exactly 11 numeric digits.', 'error'); return; }

    const studentProfileWithNewPhone = studentProfiles[newPhone];
    if (studentProfileWithNewPhone && newPhone !== editingStudentPhoneKey) {
        showFeedback(`Phone number ${newPhone} is already used by ${studentProfileWithNewPhone.name}.`, 'error');
        return;
    }

    setReservations(prevReservations =>
        prevReservations.map(res => {
            if (res.phone.trim() === editingStudentPhoneKey) {
                return { ...res, studentName: newName, phone: newPhone };
            }
            return res;
        })
    );

    setStudentProfiles(prevProfiles => {
        const updatedProfiles = {...prevProfiles};
        const profileData = updatedProfiles[editingStudentPhoneKey];
        if (editingStudentPhoneKey !== newPhone) { // If phone number changed, delete old key
            delete updatedProfiles[editingStudentPhoneKey];
        }
        updatedProfiles[newPhone] = { // Add/update with new phone key
            ...(profileData || {}), // carry over existing data like idCardSubmitted
            name: newName,
        };
        return updatedProfiles;
    });

    showFeedback('Student details updated successfully!', 'success');
    setEditingStudentPhoneKey(null);
    setEditStudentData({ name: '', phone: '' });
  };

  const handleToggleIdCardStatus = (studentPhone) => {
    const currentStatus = studentProfiles[studentPhone]?.idCardSubmitted || false;
    const studentName = studentProfiles[studentPhone]?.name || 'This student';

    const updateStatus = (newStatus) => {
        setStudentProfiles(prev => ({
            ...prev,
            [studentPhone]: {
                ...(prev[studentPhone] || { name: studentName, phone: studentPhone }), // Ensure profile exists
                idCardSubmitted: newStatus
            }
        }));
        showFeedback(`ID card status for ${studentName} updated to ${newStatus ? 'Submitted' : 'Not Submitted'}.`, 'success');
    };

    if (currentStatus) { // If currently submitted, confirm before marking as not submitted
        setConfirmModalConfig({
            message: `Are you sure you want to mark ID card as NOT submitted for "${studentName}"?`,
            onConfirm: () => updateStatus(false),
            itemType: 'ID Status'
        });
        setShowConfirmModal(true);
    } else {
        updateStatus(true); // If not submitted, mark as submitted directly
    }
  };

  const handleSaveFeedback = (lectureId) => {
    setReservations(prevReservations =>
        prevReservations.map(res =>
            res.id === lectureId ? { ...res, captainFeedback: currentFeedbackText } : res
        )
    );
    setEditingFeedbackLectureId(null);
    setCurrentFeedbackText('');
    showFeedback('Captain feedback saved!', 'success');
  };

  const handleSaveCoursePrice = () => {
    const price = parseFloat(tempCoursePrice);
    if (isNaN(price) || price < 0) {
        showFeedback('Invalid course price. Please enter a positive number.', 'error');
        setTempCoursePrice(totalCoursePrice); // Reset to original if invalid
        return;
    }
    setTotalCoursePrice(price);
    setIsEditingCoursePrice(false);
    showFeedback('Total course price updated!', 'success');
  };

  const handleManualTransaction = () => {
    const amount = parseFloat(manualTransactionAmount);
    if (isNaN(amount) || amount <= 0) {
        showFeedback('Please enter a valid positive amount.', 'error');
        return;
    }
    if (!manualTransactionReason.trim()) {
        showFeedback('Please provide a reason for the transaction.', 'error');
        return;
    }

    const newTransaction = {
        id: Date.now(),
        date: todayDateString, // Transaction date is always today
        type: manualTransactionType,
        amount: amount,
        reason: manualTransactionReason.trim()
    };
    setManualTransactions(prev => [...prev, newTransaction]);
    showFeedback(`Money ${manualTransactionType === 'add' ? 'added' : 'taken'} successfully.`, 'success');
    setShowManualTransactionModal(false);
    setManualTransactionAmount('');
    setManualTransactionReason('');
  };


  const exportFilteredReservationsToCSV = () => {
    const studentsToExport = filteredAndSearchedStudentHistory;

    let allLecturesToExport = [];
    studentsToExport.forEach(student => {
        student.lectures.forEach(lecture => {
            allLecturesToExport.push({
                ...lecture,
                studentName: student.name, // Add student name and phone from the parent student object
                phone: student.phone
            });
        });
    });

    if (allLecturesToExport.length === 0) {
        showFeedback('No lecture data matching the current filters to export.', 'info');
        return;
    }

    const totalPaymentsInExport = allLecturesToExport.reduce((sum, lec) => sum + (lec.paymentAmount || 0), 0);
    const headers = ["Student Name", "Phone", "Lecture #", "Date", "Time", "Car Name", "Car Number", "Car Type", "Captain Name", "Payment (EGP)", "Remaining for Course (EGP)", "Captain Feedback"];
    
    let summaryRows = [];
    let dateRangeDescription = "all_dates";

    if (exportStartDate && exportEndDate) {
        summaryRows.push([`Exporting Data for Range: ${exportStartDate} to ${exportEndDate}`]);
        dateRangeDescription = `${exportStartDate}_to_${exportEndDate}`;
    } else if (exportStartDate) {
        summaryRows.push([`Exporting Data for Date: ${exportStartDate}`]);
        dateRangeDescription = exportStartDate;
    } else if (exportEndDate) {
        summaryRows.push([`Exporting Data for Date: ${exportEndDate}`]);
        dateRangeDescription = exportEndDate;
    }
    summaryRows.push([`Total Payments in Exported Data:`, `${totalPaymentsInExport.toFixed(2)} EGP`]);
    summaryRows.push([]); // Empty row for spacing


    const dataRows = allLecturesToExport
      .sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime() || timeSlots.indexOf(a.time) - timeSlots.indexOf(b.time)) // Sort by date, then by timeSlot index
      .map(res => {
        const car = getCarDetails(parseInt(res.carId));
        const captain = getCaptainName(parseInt(res.captainId));
        const payment = (res.paymentAmount !== null && res.paymentAmount !== undefined) ? res.paymentAmount.toFixed(2) : '';
        const feedback = res.captainFeedback ? `"${res.captainFeedback.replace(/"/g, '""')}"` : ''; // Escape quotes for CSV
        
        // Calculate remaining based on all student's payments up to the point of this lecture
        const studentAllReservations = reservations.filter(r => r.phone === res.phone);
        // Sum payments for lectures that occurred before or at the same time as the current lecture
        const studentPaymentsUpToThisLecture = studentAllReservations
            .filter(r => {
                const rDate = new Date(r.date);
                const currentResDate = new Date(res.date);
                if (rDate < currentResDate) return true;
                // If dates are same, compare by time slot index
                if (r.date === res.date && timeSlots.indexOf(r.time) <= timeSlots.indexOf(res.time)) return true; 
                return false;
            })
            .reduce((sum, r) => sum + (r.paymentAmount || 0), 0);

        const remainingForCourse = Math.max(0, totalCoursePrice - studentPaymentsUpToThisLecture);

        return [
          `"${res.studentName.replace(/"/g, '""')}"`, res.phone, res.lectureNumber || '', res.date, res.time,
          car ? `"${car.name.replace(/"/g, '""')}"` : '', car ? car.number : '', car ? capitalizeWords(car.type) : '',
          `"${captain.replace(/"/g, '""')}"`, payment, remainingForCourse.toFixed(2), feedback
        ].join(',');
      });

    const csvRows = [...summaryRows.map(row => row.join(',')), headers.join(','), ...dataRows];
    const csvString = csvRows.join('\r\n');
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `student_lectures_history_${dateRangeDescription}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      showFeedback('Filtered student lectures history exported successfully!', 'success');
    } else { showFeedback('CSV export is not supported by your browser.', 'error'); }
  };

  const exportUpcomingLecturesToCSV = () => {
    const today = todayDateString; 

    let studentsToConsider = [...aggregatedStudents];

    // Apply student search query if active
    if (studentHistorySearchQuery.trim() !== '') {
        const lowerSearchQuery = studentHistorySearchQuery.toLowerCase();
        studentsToConsider = studentsToConsider.filter(student =>
            student.name.toLowerCase().includes(lowerSearchQuery) ||
            student.phone.includes(lowerSearchQuery)
        );
    }

    let upcomingLecturesToExport = [];
    studentsToConsider.forEach(student => {
        student.lectures.forEach(lecture => {
            if (lecture.date >= today) { // Filter for upcoming lectures
                upcomingLecturesToExport.push({
                    ...lecture,
                    studentName: student.name, 
                    phone: student.phone
                });
            }
        });
    });

    if (upcomingLecturesToExport.length === 0) {
        showFeedback('No upcoming lectures found' + (studentHistorySearchQuery.trim() !== '' ? ' for the current search.' : '.'), 'info');
        return;
    }

    const totalPaymentsInExport = upcomingLecturesToExport.reduce((sum, lec) => sum + (lec.paymentAmount || 0), 0);
    const headers = ["Student Name", "Phone", "Lecture #", "Date", "Time", "Car Name", "Car Number", "Car Type", "Captain Name", "Payment (EGP)", "Remaining for Course (EGP)", "Captain Feedback"];
    
    const summaryRows = [
        [`Exporting Upcoming Lectures (from ${today})`],
        studentHistorySearchQuery.trim() !== '' ? [`Filtered by search: "${studentHistorySearchQuery}"`] : [],
        [`Total Payments in Exported Upcoming Data:`, `${totalPaymentsInExport.toFixed(2)} EGP`],
        [] 
    ].filter(row => row.length > 0);


    const dataRows = upcomingLecturesToExport
      .sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime() || timeSlots.indexOf(a.time) - timeSlots.indexOf(b.time)) 
      .map(res => {
        const car = getCarDetails(parseInt(res.carId));
        const captain = getCaptainName(parseInt(res.captainId));
        const payment = (res.paymentAmount !== null && res.paymentAmount !== undefined) ? res.paymentAmount.toFixed(2) : '';
        const feedback = res.captainFeedback ? `"${res.captainFeedback.replace(/"/g, '""')}"` : '';
        
        const studentAllReservations = reservations.filter(r => r.phone === res.phone);
        const studentTotalPayments = studentAllReservations.reduce((sum, r) => sum + (r.paymentAmount || 0), 0);
        const remainingForCourse = Math.max(0, totalCoursePrice - studentTotalPayments);

        return [
          `"${res.studentName.replace(/"/g, '""')}"`, res.phone, res.lectureNumber || '', res.date, res.time,
          car ? `"${car.name.replace(/"/g, '""')}"` : '', car ? car.number : '', car ? capitalizeWords(car.type) : '',
          `"${captain.replace(/"/g, '""')}"`, payment, remainingForCourse.toFixed(2), feedback
        ].join(',');
      });

    const csvRows = [...summaryRows.map(row => row.join(',')), headers.join(','), ...dataRows];
    const csvString = csvRows.join('\r\n');
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `upcoming_student_lectures_${today}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      showFeedback('Upcoming student lectures exported successfully!', 'success');
    } else { showFeedback('CSV export is not supported by your browser.', 'error'); }
  };


  useEffect(() => {
    if (currentPage === 'reservations' && currentReservationSubPage === 'newReservation') {
        setNewReservation(prev => ({ ...prev, date: selectedDate, carId: '', captainId: '', paymentAmount: '' , time: timeSlots[0]}));
    }
  }, [selectedDate, currentPage, currentReservationSubPage, timeSlots]);


  useEffect(() => {
    // Reset car, captain, and payment when car type, date, or time changes for a new reservation
    // This prevents carrying over selections that might no longer be valid
    setNewReservation(prev => ({ ...prev, carId: '', captainId: '', paymentAmount: ''}));
   }, [newReservation.carType, newReservation.date, newReservation.time]); // Dependencies that trigger this reset

  useEffect(() => {
    if (currentReservationSubPage === 'newReservation' && newReservation.phone.trim() && newReservation.date) {
        const todaysReservationsForStudent = reservations.filter(
            r => r.phone.trim() === newReservation.phone.trim() && r.date === newReservation.date
        );
        setStudentHasOtherLecturesToday(todaysReservationsForStudent.length > 0);
    } else {
        setStudentHasOtherLecturesToday(false);
    }
  }, [newReservation.phone, newReservation.date, reservations, currentReservationSubPage]);

  useEffect(() => {
    if (newReservation.phone && newReservation.phone.trim() !== '') {
      const studentPhoneNumber = newReservation.phone.trim();
      const studentPreviousReservations = reservations.filter(r => r.phone.trim() === studentPhoneNumber);
      let lectureNumber = 1;
      if (studentPreviousReservations.length > 0) {
        const maxLectureNum = Math.max(...studentPreviousReservations.map(r => r.lectureNumber || 0));
        lectureNumber = maxLectureNum + 1;
      }
      setNextLectureNumberForForm(lectureNumber);
    } else { setNextLectureNumberForForm(null); }
  }, [newReservation.phone, reservations]);

  useEffect(() => {
    if (isDarkMode) { document.documentElement.classList.add('dark'); }
    else { document.documentElement.classList.remove('dark'); }
  }, [isDarkMode]);

  const handleStudentInputChange = (e) => {
    const rawNameInput = e.target.value;
    // Don't auto-capitalize while typing to allow user to type freely and match datalist
    // const capitalizedName = capitalizeWords(rawNameInput); 
    const previousStudentNameInForm = newReservation.studentName;

    setNewReservation(prev => {
        const selectedStudentFromDatalist = aggregatedStudents.find(s => s.name.toLowerCase() === rawNameInput.toLowerCase());

        if (selectedStudentFromDatalist) {
            // If a student is selected from datalist, populate their name and phone
            return { ...prev, studentName: selectedStudentFromDatalist.name, phone: selectedStudentFromDatalist.phone };
        } else {
            // If typing a new name or modifying an existing one not from datalist
            // Keep the phone if the name (ignoring case for comparison) hasn't changed substantially, otherwise clear phone
            const phoneToKeep = (previousStudentNameInForm.toLowerCase() === rawNameInput.toLowerCase() && prev.phone) ? prev.phone : '';
             if (!phoneToKeep && prev.phone !== '') { // If phone is cleared, reset lecture number
                 setNextLectureNumberForForm(null);
            }
            return { ...prev, studentName: rawNameInput, phone: phoneToKeep }; // Store raw input for name
        }
    });
};

  const handleEditStudentNameChange = (e) => {
    // Capitalize when saving/updating, not during intermediate typing for edit form
    setEditStudentData(prev => ({ ...prev, name: e.target.value }));
  };

  const handleEditStudentPhoneChange = (e) => {
    const numericValue = e.target.value.replace(/\D/g, ''); // Allow only digits
    setEditStudentData(prev => ({ ...prev, phone: numericValue.slice(0, 11) })); // Max 11 digits
  };

  const handlePhoneInputChange = (e) => {
    const rawValue = e.target.value;
    const numericValue = rawValue.replace(/\D/g, ''); // Allow only digits
    setNewReservation(prev => ({...prev, phone: numericValue.slice(0, 11)})); // Max 11 digits
    if (phoneInputError) setPhoneInputError(''); // Clear error on input change
  };

  const validatePhoneNumberOnBlur = () => {
    const trimmedPhone = newReservation.phone.trim();
    const studentNameInForm = capitalizeWords(newReservation.studentName.trim()); // Capitalize for comparison
    if (trimmedPhone === '') { setPhoneInputError(''); return; } // No error if empty
    if (trimmedPhone.length !== 11) { setPhoneInputError('Phone number must be exactly 11 digits.'); return; }
    const existingStudentProfile = studentProfiles[trimmedPhone];
    // Check if phone is associated with a *different* student name
    if (existingStudentProfile && existingStudentProfile.name !== studentNameInForm && studentNameInForm !== '') { 
        setPhoneInputError(`Phone associated with "${existingStudentProfile.name}".`); return; 
    }
    setPhoneInputError(''); // Clear error if valid or no conflict
  };

  const handleNewReservationStudentNameBlur = () => {
    // Capitalize student name on blur for the new reservation form
    setNewReservation(prev => ({...prev, studentName: capitalizeWords(prev.studentName)}));
  };


  const toggleDarkMode = () => setIsDarkMode(!isDarkMode);

  const commonFormButtonClasses = "px-4 py-2 rounded-lg flex items-center transition-colors text-sm";
  const commonSectionClasses = "bg-gray-50 dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-lg mb-8";
  const commonInputClasses = "px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 dark:focus:border-blue-400 w-full bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500";
  const commonLabelClasses = "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1";

  const mainNavButtonBase = "px-6 py-3 font-medium text-sm sm:text-base transition-colors flex items-center rounded-t-lg border-x border-t";
  const mainNavButtonInactive = "text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 border-gray-200 dark:border-slate-600";
  const mainNavButtonActive = "bg-white dark:bg-slate-800 border-gray-300 dark:border-gray-700 border-b-white dark:border-b-slate-800 text-blue-600 dark:text-blue-400";

  const subNavButtonBase = "px-4 py-2 text-sm font-medium rounded-md flex items-center transition-colors border";
  const subNavButtonInactive = "text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 border-gray-300 dark:border-slate-600";
  const subNavButtonActive = "bg-blue-600 dark:bg-blue-500 text-white border-blue-600 dark:border-blue-500";

  const iconButtonBase = "p-2 rounded-full transition-colors border bg-gray-100 dark:bg-slate-700 border-gray-300 dark:border-slate-600";
  const editIconButton = `${iconButtonBase} text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-700/50 hover:border-blue-400 dark:hover:border-blue-500`;
  const deleteIconButton = `${iconButtonBase} text-red-500 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-700/50 hover:border-red-400 dark:hover:border-red-500`;
  const smallIconButtonBase = "p-1 rounded-full transition-colors border bg-gray-100 dark:bg-slate-700 border-gray-300 dark:border-slate-600";
  const smallEditIconButton = `${smallIconButtonBase} ml-2 text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-700/30 hover:border-blue-200 dark:hover:border-blue-600`;
  const smallDeleteIconButton = `${smallIconButtonBase} text-red-500 hover:text-red-700 dark:hover:text-red-400 hover:bg-red-100 dark:hover:bg-red-700/30 hover:border-red-200 dark:hover:border-red-600`;
  const darkModeToggleButton = `p-2 rounded-full transition-colors border text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-slate-700 border-gray-300 dark:border-slate-600 hover:bg-gray-200 dark:hover:bg-slate-600`;


  const isPaymentFieldMandatoryForCurrentLecture = nextLectureNumberForForm !== null && MANDATORY_PAYMENT_LECTURES.includes(nextLectureNumberForForm);

  const resetNewReservationForm = () => {
    setNewReservation({...initialNewReservationState, date: selectedDate, time: timeSlots[0] });
    setNextLectureNumberForForm(null);
    setPhoneInputError('');
  };

  return (
    <div className={`${isDarkMode ? 'dark' : ''}`}>
      <style>
        {`
          input[type="date"]::-webkit-calendar-picker-indicator {
            filter: ${isDarkMode ? 'invert(1) brightness(0.8)' : 'grayscale(70%) brightness(60%) contrast(150%)'};
          }
        `}
      </style>
      <div className="max-w-7xl mx-auto p-4 sm:p-6 bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-800 dark:to-gray-900 min-h-screen font-sans transition-colors duration-300">
        {notification.isVisible && ( <div className={`fixed top-5 right-5 p-4 rounded-lg shadow-lg text-white text-sm z-[100] flex items-center ${notification.type === 'error' ? 'bg-red-500 dark:bg-red-600' : ''} ${notification.type === 'success' ? 'bg-green-500 dark:bg-green-600' : ''} ${notification.type === 'info' ? 'bg-blue-500 dark:bg-blue-600' : ''} transition-opacity duration-300 ${notification.isVisible ? 'opacity-100' : 'opacity-0'}`}> {notification.type === 'error' && <XCircle size={20} className="mr-2" />} {notification.type === 'success' && <CheckCircle size={20} className="mr-2" />} {notification.message} <button onClick={() => setNotification({...notification, isVisible: false})} className="ml-4 text-white hover:text-gray-200" aria-label="Close notification"><X size={18} /></button> </div> )}
        {showManualTransactionModal && ( <div className="fixed inset-0 bg-black bg-opacity-50 dark:bg-opacity-70 flex items-center justify-center z-50 p-4"> <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-xl max-w-md w-full"> <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4"> {manualTransactionType === 'add' ? 'Manually Add Payment' : 'Manually Record Expense'} </h3> <div className="space-y-4"> <div> <label htmlFor="manualAmount" className={commonLabelClasses}>Amount (EGP)</label> <input id="manualAmount" type="number" value={manualTransactionAmount} onChange={(e) => setManualTransactionAmount(e.target.value)} className={commonInputClasses} placeholder="Enter amount" min="0"/> </div> <div> <label htmlFor="manualReason" className={commonLabelClasses}>Reason / Description</label> <textarea id="manualReason" value={manualTransactionReason} onChange={(e) => setManualTransactionReason(e.target.value)} className={`${commonInputClasses} h-20`} placeholder="Enter reason or description"/> </div> </div> <div className="flex justify-end gap-3 mt-6"> <button onClick={() => {setShowManualTransactionModal(false); setManualTransactionAmount(''); setManualTransactionReason('');}} className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 rounded-lg transition-colors"> Cancel </button> <button onClick={handleManualTransaction} className={`px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors ${manualTransactionType === 'add' ? 'bg-green-500 hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700' : 'bg-red-500 hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700'}`}> {manualTransactionType === 'add' ? 'Add Payment' : 'Record Expense'} </button> </div> </div> </div> )}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-6 sm:p-8">
          {showConfirmModal && ( <div className="fixed inset-0 bg-black bg-opacity-50 dark:bg-opacity-70 flex items-center justify-center z-50 p-4"> <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-xl max-w-sm w-full"> <div className="flex items-center mb-4"> <AlertTriangle className="text-red-500 dark:text-red-400 mr-3" size={24} /> <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Confirm Action</h3> </div> <p className="text-sm text-gray-600 dark:text-gray-300 mb-6">{confirmModalConfig.message}</p> <div className="flex justify-end gap-3"> <button onClick={handleCancelDelete} className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 rounded-lg transition-colors">Cancel</button> <button onClick={handleConfirmDelete} className={`px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors ${confirmModalConfig.itemType === 'ID Status' ? 'bg-orange-500 hover:bg-orange-600 dark:bg-orange-600 dark:hover:bg-orange-700' : 'bg-red-600 hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600'}`}>{confirmModalConfig.itemType === 'ID Status' ? 'Confirm Change' : `Delete ${confirmModalConfig.itemType}`}</button> </div> </div> </div> )}
          
          <div className="mb-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center">
                    <img
                        src="https://placehold.co/60x60/0284c7/FFFFFF?text=Logo" 
                        alt="El Leader Driving Academy Logo"
                        className="h-12 w-12 sm:h-16 sm:w-16 mr-3 sm:mr-4 rounded-full object-contain"
                        onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/60x60/CCCCCC/000000?text=Error'; }}
                    />
                    <div>
                        <h1 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-gray-100">El Leader Driving Academy</h1>
                        <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm">{totalCarCount} Cars • {manualCarCount} Manual • {automaticCarCount} Automatic • {timeSlots[0]} - {addOneHourTo12HourTime(timeSlots[timeSlots.length - 1])}</p>
                    </div>
                </div>
                <button onClick={toggleDarkMode} className={`${darkModeToggleButton}`} aria-label="Toggle dark mode">
                    {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
                </button>
            </div>
          </div>
          
          <nav className="flex justify-center border-b border-gray-300 dark:border-gray-700 mb-8 -mx-6 sm:-mx-8 px-2 sm:px-4">
            <button onClick={() => { setCurrentPage('reservations'); setCurrentReservationSubPage('newReservation'); resetNewReservationForm(); setActiveForm(null); setExportStartDate(''); setExportEndDate('');}} className={`${mainNavButtonBase} ${currentPage === 'reservations' ? mainNavButtonActive : mainNavButtonInactive}`}><BookUser className="inline mr-2" size={18}/> Reservations</button>
            <button onClick={() => { setCurrentPage('management'); setCurrentManagementSubPage('money'); setActiveForm(null);}} className={`${mainNavButtonBase} ${currentPage === 'management' ? mainNavButtonActive : mainNavButtonInactive}`}><Settings className="inline mr-2" size={18}/> Management</button>
          </nav>

          {currentPage === 'reservations' && (
            <div>
              <div className="mb-6 flex flex-wrap justify-center gap-2 border-b border-gray-200 dark:border-gray-700 pb-2">
                <button onClick={() => { setCurrentReservationSubPage('newReservation'); resetNewReservationForm(); setActiveForm(null); setExportStartDate(''); setExportEndDate(''); setStudentHistorySearchQuery(''); }} className={`${subNavButtonBase} ${currentReservationSubPage === 'newReservation' ? subNavButtonActive : subNavButtonInactive}`}> <Plus size={16} className="mr-2"/> New Reservation </button>
                <button onClick={() => { setCurrentReservationSubPage('studentHistory'); setActiveForm(null); const monthRange = getCurrentMonthDateRangeStrings(); setExportStartDate(monthRange.start); setExportEndDate(monthRange.end); setStudentHistorySearchQuery(''); }} className={`${subNavButtonBase} ${currentReservationSubPage === 'studentHistory' ? subNavButtonActive : subNavButtonInactive}`}> <FileText size={16} className="mr-2"/> Student History </button>
              </div>

              {currentReservationSubPage === 'newReservation' && (
                <>
                  <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between"> <div> <label htmlFor="selectedDate" className={commonLabelClasses}><Calendar className="inline mr-2" size={16} /> Select Date for Context / New Booking</label> <input id="selectedDate" type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} className={`${commonInputClasses.replace('w-full', 'max-w-xs')} bg-gray-100 dark:bg-gray-700 dark:[color-scheme:dark]`} /> </div> </div>
                  <div className={commonSectionClasses}> <h3 className="text-xl font-semibold mb-4 text-gray-700 dark:text-gray-200">New Reservation Details</h3> <div className="grid md:grid-cols-2 gap-x-4 gap-y-3"> <div> <label htmlFor="studentNameInput" className={commonLabelClasses}>Student Name</label> <input id="studentNameInput" type="text" placeholder="Type or select student" value={newReservation.studentName} onChange={handleStudentInputChange} onBlur={handleNewReservationStudentNameBlur} list="students-datalist" className={commonInputClasses} /> <datalist id="students-datalist">{aggregatedStudents.map(student => (<option key={student.phone} value={student.name} /> ))}</datalist> </div> <div> <label htmlFor="studentPhoneInput" className={commonLabelClasses}>Phone Number (11 digits)</label> <input id="studentPhoneInput" type="tel" placeholder="01xxxxxxxxx" value={newReservation.phone} onChange={handlePhoneInputChange} onBlur={validatePhoneNumberOnBlur} maxLength="11" className={commonInputClasses} /> {phoneInputError && <p className="mt-1 text-xs text-red-500 dark:text-red-400">{phoneInputError}</p>} {nextLectureNumberForForm !== null && !phoneInputError && (<p className="mt-1 text-xs text-indigo-600 dark:text-indigo-400 flex items-center"><Award size={12} className="inline mr-1"/> Next Lecture: #{nextLectureNumberForForm}</p>)} {studentHasOtherLecturesToday && !phoneInputError && (<p className="mt-1 text-xs text-orange-500 dark:text-orange-400 flex items-center"><Info size={12} className="inline mr-1"/> Student has other lecture(s) today.</p>)}</div> <div><label htmlFor="reservationDate" className={commonLabelClasses}>Date</label><input id="reservationDate" type="date" value={newReservation.date} min={todayDateString} onChange={(e) => setNewReservation({...newReservation, date: e.target.value})} className={`${commonInputClasses} bg-gray-100 dark:bg-gray-700 dark:[color-scheme:dark]`} /></div> <div><label htmlFor="reservationTime" className={commonLabelClasses}>Time</label><select id="reservationTime" value={newReservation.time} onChange={(e) => setNewReservation({...newReservation, time: e.target.value})} className={commonInputClasses}>{timeSlots.map(time => (<option key={time} value={time}>{time}</option>))}</select></div> <div><label htmlFor="reservationCarType" className={commonLabelClasses}>Car Type</label><select id="reservationCarType" value={newReservation.carType} onChange={(e) => setNewReservation({...newReservation, carType: e.target.value})} className={commonInputClasses}><option value="automatic">Automatic Car</option><option value="manual">Manual Car</option></select></div> <div><label htmlFor="reservationCar" className={commonLabelClasses}>Car</label><select id="reservationCar" value={newReservation.carId} onChange={(e) => setNewReservation({...newReservation, carId: e.target.value})} className={commonInputClasses} disabled={!newReservation.date || !newReservation.time || !newReservation.carType}><option value="">Select Available Car</option>{getAvailableCarsForReservation(newReservation.date, newReservation.time, newReservation.carType).map(car => (<option key={car.id} value={car.id}>{car.name} ({car.number})</option>))}</select></div> <div><label htmlFor="reservationCaptain" className={commonLabelClasses}>Captain</label><select id="reservationCaptain" value={newReservation.captainId} onChange={(e) => setNewReservation({...newReservation, captainId: e.target.value})} className={commonInputClasses} disabled={!newReservation.date || !newReservation.time}><option value="">Select Available Captain</option>{getAvailableCaptains(newReservation.date, newReservation.time).map(captain => (<option key={captain.id} value={captain.id}>{captain.name}</option>))}</select></div> <div> <label htmlFor="paymentAmountInput" className={commonLabelClasses}>Payment Amount (EGP)</label> <input id="paymentAmountInput" type="number" placeholder="Enter amount" value={newReservation.paymentAmount} onChange={(e) => setNewReservation({...newReservation, paymentAmount: e.target.value})} className={commonInputClasses} min="0"/> {isPaymentFieldMandatoryForCurrentLecture && ( <p className="mt-1 text-xs text-orange-500 dark:text-orange-400">Payment mandatory for this lecture.</p> )} </div> </div> <div className="flex gap-4 mt-6"> <button onClick={addReservation} className={`bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600 text-white ${commonFormButtonClasses}`}><Save className="mr-2" size={16} /> Save Reservation</button> <button onClick={resetNewReservationForm} className={`bg-gray-500 hover:bg-gray-600 dark:bg-gray-600 dark:hover:bg-gray-700 text-white dark:text-gray-100 ${commonFormButtonClasses}`}><X className="mr-2" size={16} /> Clear Form</button> </div> </div>
                  
                  <div className={`${commonSectionClasses} mb-8`}>
                    <h3 className="text-lg font-semibold mb-3 text-gray-700 dark:text-gray-200">Hourly Availability for {selectedDate}</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5 gap-2 max-h-48 overflow-y-auto p-1">
                      {getHourlyAvailability(selectedDate).map(slot => (
                        <div key={slot.time} className="p-2 bg-white dark:bg-slate-700 rounded-md shadow-sm border dark:border-slate-600">
                          <p className="font-medium text-gray-800 dark:text-gray-100 text-xs">{slot.displayTime}</p>
                          <div className="text-xs mt-0.5">
                            <p className="text-blue-600 dark:text-blue-400">Auto: <span className="font-medium">{slot.automatic.available} / {slot.automatic.total}</span></p>
                            <p className="text-orange-600 dark:text-orange-400">Manual: <span className="font-medium">{slot.manual.available} / {slot.manual.total}</span></p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="mb-8">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-2xl font-semibold text-gray-700 dark:text-gray-200">Reservations for {selectedDate}</h3>
                        <div className="text-sm text-green-600 dark:text-green-400 font-medium bg-green-50 dark:bg-green-700/30 px-3 py-1 rounded-full flex items-center">
                            <DollarSign size={16} className="mr-1.5"/>
                            Today's Collected: {financialsForToday.collected.toFixed(2)} EGP
                        </div>
                    </div>
                    {getDayReservations(selectedDate).length === 0 ? (<p className="text-gray-500 dark:text-gray-400 text-center py-8 bg-gray-50 dark:bg-gray-700/50 rounded-lg">No reservations</p>) : ( <div className="space-y-4"> {getDayReservations(selectedDate).sort((a,b) => timeSlots.indexOf(a.time) - timeSlots.indexOf(b.time)).map(reservation => { const car = getCarDetails(parseInt(reservation.carId)); return ( <div key={reservation.id} className="bg-white dark:bg-slate-700 border border-gray-200 dark:border-gray-700 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow"> <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center"> <div className="flex-1 mb-3 sm:mb-0"> <div className="flex items-center mb-1"><span className="font-semibold text-lg text-blue-700 dark:text-blue-400">{reservation.studentName}</span>{reservation.lectureNumber && (<span className="ml-2 px-2 py-0.5 bg-indigo-100 dark:bg-indigo-700 text-indigo-700 dark:text-indigo-100 text-xs font-semibold rounded-full flex items-center"><Award size={12} className="mr-1"/> L#{reservation.lectureNumber}</span>)}</div> <div className="text-sm text-gray-600 dark:text-gray-300">Phone: {reservation.phone}</div> <div className="text-sm text-gray-600 dark:text-gray-300">Car: <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${ car?.type === 'manual' ? 'bg-orange-100 dark:bg-orange-700 text-orange-800 dark:text-orange-100' : 'bg-blue-100 dark:bg-blue-700 text-blue-800 dark:text-blue-100'}`}>{car ? `${car.name} (${car.number}) - ${capitalizeWords(car.type)}` : 'N/A'}</span></div> <div className="text-sm text-gray-600 dark:text-gray-300 flex items-center mt-1"><Clock className="mr-1.5 text-gray-500 dark:text-gray-400" size={14} /> {reservation.time}</div> <div className="text-sm text-gray-600 dark:text-gray-300 flex items-center mt-1"><User className="mr-1.5 text-gray-500 dark:text-gray-400" size={14} /> {getCaptainName(parseInt(reservation.captainId))}</div> {reservation.paymentAmount && (<div className="text-sm text-green-600 dark:text-green-400 flex items-center mt-1"><DollarSign size={14} className="mr-1"/> Paid: {reservation.paymentAmount.toFixed(2)} EGP</div>)}</div> <div className="flex gap-2 self-start sm:self-center"> <button onClick={() => requestDeleteReservation(reservation.id)} className={deleteIconButton} aria-label="Delete reservation"><Trash2 size={18} /></button> </div> </div> </div>);})} </div>)}
                  </div>
                </>
              )}

              {currentReservationSubPage === 'studentHistory' && (
                <>
                  <div className={commonSectionClasses}>
                    <h3 className="text-xl font-semibold mb-4 text-gray-700 dark:text-gray-200">Filter & Export Student Lecture History</h3>
                    <div className="grid md:grid-cols-2 gap-4 items-end">
                        <div className="md:col-span-2 grid sm:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="historyStartDate" className={commonLabelClasses}>Filter Start Date (for main export)</label>
                                <input id="historyStartDate" type="date" value={exportStartDate} onChange={(e) => setExportStartDate(e.target.value)} className={`${commonInputClasses} bg-gray-100 dark:bg-gray-700 dark:[color-scheme:dark]`} />
                            </div>
                            <div>
                                <label htmlFor="historyEndDate" className={commonLabelClasses}>Filter End Date (for main export)</label>
                                <input id="historyEndDate" type="date" value={exportEndDate} onChange={(e) => setExportEndDate(e.target.value)} min={exportStartDate || ''} className={`${commonInputClasses} bg-gray-100 dark:bg-gray-700 dark:[color-scheme:dark]`} />
                            </div>
                        </div>
                        <div className="md:col-span-2 grid sm:grid-cols-2 gap-4 mt-4 md:mt-0">
                            <button 
                                onClick={exportFilteredReservationsToCSV} 
                                className="bg-teal-500 hover:bg-teal-600 dark:bg-teal-600 dark:hover:bg-teal-700 text-white px-4 py-2.5 rounded-lg text-sm font-medium flex items-center justify-center transition-colors shadow-sm h-[42px]"
                            >
                                <Download size={16} className="mr-2"/> Export Filtered View
                            </button>
                            <button 
                                onClick={exportUpcomingLecturesToCSV} 
                                className="bg-sky-500 hover:bg-sky-600 dark:bg-sky-600 dark:hover:bg-sky-700 text-white px-4 py-2.5 rounded-lg text-sm font-medium flex items-center justify-center transition-colors shadow-sm h-[42px]"
                            >
                                <Download size={16} className="mr-2"/> Export New as Excel File
                            </button>
                        </div>
                    </div>
                  </div>

                  <div className={commonSectionClasses.replace('mb-8', '')}>
                    <div className="mb-6">
                        <label htmlFor="studentHistorySearch" className={commonLabelClasses}>Search Student (Name or Phone)</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Search className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                            </div>
                            <input
                                id="studentHistorySearch"
                                type="search"
                                placeholder="Search by name or phone..."
                                value={studentHistorySearchQuery}
                                onChange={(e) => setStudentHistorySearchQuery(e.target.value)}
                                className={`${commonInputClasses} pl-10`}
                            />
                        </div>
                    </div>

                    <h3 className="text-2xl font-semibold mb-6 text-gray-700 dark:text-gray-200"><Users className="inline mr-2.5" />Students Lecture History</h3>
                    {filteredAndSearchedStudentHistory.length === 0 ? (<p className="text-gray-500 dark:text-gray-400 text-center py-4">No student lecture data matches the current filters.</p>) : ( <div className="space-y-6 max-h-[500px] overflow-y-auto p-1"> {filteredAndSearchedStudentHistory.map(student => { const idCardStatus = studentProfiles[student.phone]?.idCardSubmitted || false; const totalPaidByStudentForAllLectures = aggregatedStudents.find(s => s.phone === student.phone)?.lectures.reduce((sum, lec) => sum + (lec.paymentAmount || 0), 0) || 0; const remainingAmount = Math.max(0, totalCoursePrice - totalPaidByStudentForAllLectures); return ( <div key={student.phone} className="bg-white dark:bg-slate-700 p-4 rounded-lg shadow border border-gray-200 dark:border-slate-600"> {editingStudentPhoneKey === student.phone ? ( <div className="space-y-3"> <div> <label htmlFor={`edit-student-name-${student.phone}`} className={commonLabelClasses}>Name</label> <input id={`edit-student-name-${student.phone}`} type="text" value={editStudentData.name} onChange={handleEditStudentNameChange} onBlur={() => setEditStudentData(prev => ({...prev, name: capitalizeWords(prev.name)}))} className={commonInputClasses} /> </div> <div> <label htmlFor={`edit-student-phone-${student.phone}`} className={commonLabelClasses}>Phone (11 digits)</label> <input id={`edit-student-phone-${student.phone}`} type="tel" value={editStudentData.phone} onChange={handleEditStudentPhoneChange} maxLength="11" className={commonInputClasses} /> </div> <div className="flex gap-3 mt-2"> <button onClick={handleUpdateStudent} className={`bg-green-500 hover:bg-green-600 dark:bg-green-500 dark:hover:bg-green-600 text-white ${commonFormButtonClasses}`}><Save size={16} className="mr-1.5" />Save Changes</button> <button onClick={() => { setEditingStudentPhoneKey(null); setEditStudentData({name: '', phone: ''});}} className={`bg-gray-300 hover:bg-gray-400 dark:bg-gray-600 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-100 ${commonFormButtonClasses}`}><X size={16} className="mr-1.5" />Cancel</button> </div> </div> ) : ( <> <div className="flex justify-between items-start mb-2"> <div> <h4 className="text-lg font-semibold text-indigo-700 dark:text-indigo-400 mb-1">{student.name}</h4> <p className="text-sm text-gray-600 dark:text-gray-300">Phone: {student.phone}</p> </div> <div className="flex items-center space-x-2"> <div className="flex items-center space-x-1"> <span className={`text-xs font-medium ${idCardStatus ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>ID Card:</span> <button onClick={() => handleToggleIdCardStatus(student.phone)} className={`w-10 h-5 flex items-center rounded-full p-0.5 cursor-pointer transition-colors duration-300 ease-in-out ${idCardStatus ? 'bg-green-500 dark:bg-green-600' : 'bg-red-500 dark:bg-red-600'}`}><span className={`block w-4 h-4 bg-white rounded-full shadow-md transform transition-transform duration-300 ease-in-out ${idCardStatus ? 'translate-x-5' : 'translate-x-0'}`}></span></button> </div> <button onClick={() => { setEditingStudentPhoneKey(student.phone); setEditStudentData({ name: student.name, phone: student.phone }); }} className={editIconButton} aria-label="Edit student"> <Edit3 size={16} /> </button> </div> </div>
                      {student.lectures.length === 0 ? (<p className="text-sm text-gray-500 dark:text-gray-400">No lectures match current date filter.</p>) : (
                        <div className="overflow-x-auto">
                          <table className="min-w-full text-sm">
                            <thead className="bg-gray-100 dark:bg-slate-600">
                              <tr>
                                <th className="px-3 py-2 text-left font-medium text-gray-600 dark:text-gray-300">Lec #</th>
                                <th className="px-3 py-2 text-left font-medium text-gray-600 dark:text-gray-300">Date</th>
                                <th className="px-3 py-2 text-left font-medium text-gray-600 dark:text-gray-300">Time</th>
                                <th className="px-3 py-2 text-left font-medium text-gray-600 dark:text-gray-300">Car</th>
                                <th className="px-3 py-2 text-left font-medium text-gray-600 dark:text-gray-300">Captain</th>
                                <th className="px-3 py-2 text-left font-medium text-gray-600 dark:text-gray-300 whitespace-nowrap">Payment (EGP) <span className={`text-xs ${remainingAmount > 0 ? 'text-red-500 dark:text-red-400' : 'text-green-500 dark:text-green-400' }`}>(Rem: {remainingAmount.toFixed(2)})</span></th>
                                <th className="px-3 py-2 text-left font-medium text-gray-600 dark:text-gray-300">Captain FB</th>
                                <th className="px-3 py-2 text-left font-medium text-gray-600 dark:text-gray-300">Actions</th>
                              </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-slate-700 divide-y divide-gray-200 dark:divide-slate-600">
                              {student.lectures.map(lecture => {
                                const carDetails = getCarDetails(parseInt(lecture.carId));
                                const captainName = getCaptainName(parseInt(lecture.captainId));
                                return (
                                  <tr key={lecture.id}>
                                    <td className="px-3 py-2 whitespace-nowrap text-gray-800 dark:text-gray-200">{lecture.lectureNumber}</td>
                                    <td className="px-3 py-2 whitespace-nowrap text-gray-800 dark:text-gray-200">{lecture.date}</td>
                                    <td className="px-3 py-2 whitespace-nowrap text-gray-800 dark:text-gray-200">{lecture.time}</td>
                                    <td className="px-3 py-2 whitespace-nowrap text-gray-800 dark:text-gray-200">{carDetails ? `${carDetails.name} (${carDetails.number})` : 'N/A'}</td>
                                    <td className="px-3 py-2 whitespace-nowrap text-gray-800 dark:text-gray-200">{captainName}</td>
                                    <td className="px-3 py-2 whitespace-nowrap text-gray-800 dark:text-gray-200">{lecture.paymentAmount ? lecture.paymentAmount.toFixed(2) : '-'}</td>
                                    <td className="px-3 py-2 text-gray-800 dark:text-gray-200 min-w-[150px]">
                                      {editingFeedbackLectureId === lecture.id ? (
                                        <div className="flex flex-col items-start">
                                          <textarea value={currentFeedbackText} onChange={(e) => setCurrentFeedbackText(e.target.value)} className={`${commonInputClasses} text-xs h-16 mb-1`} rows="2"/>
                                          <div className="flex gap-1"><button onClick={() => handleSaveFeedback(lecture.id)} className="p-1 bg-green-500 text-white rounded hover:bg-green-600"><Save size={12}/></button><button onClick={() => setEditingFeedbackLectureId(null)} className="p-1 bg-gray-400 text-white rounded hover:bg-gray-500"><X size={12}/></button></div>
                                        </div>
                                      ) : (
                                        <div className="flex justify-between items-start"><span className="text-xs whitespace-pre-wrap break-words">{lecture.captainFeedback || "-"}</span><button onClick={() => { setEditingFeedbackLectureId(lecture.id); setCurrentFeedbackText(lecture.captainFeedback || ''); }} className={smallEditIconButton}><Edit3 size={12}/></button></div>
                                      )}
                                    </td>
                                    <td className="px-3 py-2 whitespace-nowrap">
                                      <button onClick={() => requestDeleteReservation(lecture.id)} className={smallDeleteIconButton} aria-label="Delete lecture"><Trash2 size={16} /></button>
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </>
                  )}
                </div>
              );})}
            </div>
          )}
        </div>
                </>
              )}
            </div>
          )}

          {currentPage === 'management' && (
            <div>
              <div className="mb-6 flex flex-wrap justify-center gap-2 border-b border-gray-200 dark:border-gray-700 pb-2">
                {[ 
                    { key: 'money', label: 'Money', icon: CreditCard },
                    { key: 'cars', label: 'Cars', icon: CarFront },
                    { key: 'captains', label: 'Captains', icon: Users2 },
                    { key: 'info', label: 'Info', icon: Info }, 
                ].map(tab => ( <button key={tab.key} onClick={() => { setCurrentManagementSubPage(tab.key); setActiveForm(null); if(tab.key === 'info') setInfoTabDate(todayDateString);}} className={`${subNavButtonBase} ${currentManagementSubPage === tab.key ? subNavButtonActive : subNavButtonInactive}`}> <tab.icon size={16} className="mr-2"/> {tab.label} </button> ))}
              </div>
              {currentManagementSubPage === 'money' && ( <> <div className={commonSectionClasses}> <h3 className="text-xl font-semibold mb-4 text-gray-700 dark:text-gray-200">Financial Summary & Manual Transactions</h3> <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6 items-end"> <div className="lg:col-span-2 grid sm:grid-cols-2 gap-4"> <div> <label htmlFor="moneyFilterStartDate" className={commonLabelClasses}>Filter Start Date:</label> <input id="moneyFilterStartDate" type="date" value={moneyFilterStartDate} onChange={(e) => setMoneyFilterStartDate(e.target.value)} className={`${commonInputClasses} bg-gray-100 dark:bg-gray-700 dark:[color-scheme:dark]`} /> </div> <div> <label htmlFor="moneyFilterEndDate" className={commonLabelClasses}>Filter End Date:</label> <input id="moneyFilterEndDate" type="date" value={moneyFilterEndDate} onChange={(e) => setMoneyFilterEndDate(e.target.value)} min={moneyFilterStartDate || ''} className={`${commonInputClasses} bg-gray-100 dark:bg-gray-700 dark:[color-scheme:dark]`} /> </div> </div> <div className="flex flex-col sm:flex-row lg:flex-col gap-2 mt-4 md:mt-0 lg:mt-auto self-end"> <button onClick={() => { setManualTransactionType('add'); setShowManualTransactionModal(true);}} className="w-full bg-green-500 hover:bg-green-600 text-white px-4 py-2.5 rounded-lg flex items-center justify-center text-sm"><ArrowUpCircle size={16} className="mr-2"/>Add Money</button> <button onClick={() => { setManualTransactionType('take'); setShowManualTransactionModal(true);}} className="w-full bg-red-500 hover:bg-red-600 text-white px-4 py-2.5 rounded-lg flex items-center justify-center text-sm"><ArrowDownCircle size={16} className="mr-2"/>Take Money</button> </div> </div> <div className="grid md:grid-cols-2 gap-6 mb-6"> <div className="bg-white dark:bg-slate-700 p-4 rounded-lg shadow border dark:border-slate-600"> <div className="flex items-center text-lg mb-1"> <TrendingUp size={24} className="mr-3 text-green-500 dark:text-green-400"/> <span className="font-semibold text-gray-700 dark:text-gray-200">Net Collected:</span> </div> <p className="ml-9 font-bold text-2xl text-green-600 dark:text-green-300">{financialsForFilteredRange.collected.toFixed(2)} EGP</p> { (moneyFilterStartDate && moneyFilterEndDate) ? <p className="ml-9 text-xs text-gray-500 dark:text-gray-400">({moneyFilterStartDate} to {moneyFilterEndDate})</p> : <p className="ml-9 text-xs text-gray-500 dark:text-gray-400">(For Current Month: {getCurrentMonthDateRange().monthYear})</p> } </div> <div className="bg-white dark:bg-slate-700 p-4 rounded-lg shadow border dark:border-slate-600"> <div className="flex items-center text-lg mb-1"> <DollarSign size={24} className="mr-3 text-red-500 dark:text-red-400"/> <span className="font-semibold text-gray-700 dark:text-gray-200">Total Taken:</span> </div> <p className="ml-9 font-bold text-2xl text-red-600 dark:text-red-300">{financialsForFilteredRange.taken.toFixed(2)} EGP</p> { (moneyFilterStartDate && moneyFilterEndDate) ? <p className="ml-9 text-xs text-gray-500 dark:text-gray-400">({moneyFilterStartDate} to {moneyFilterEndDate})</p> : <p className="ml-9 text-xs text-gray-500 dark:text-gray-400">(For Current Month: {getCurrentMonthDateRange().monthYear})</p> } </div> </div> <div className="grid md:grid-cols-2 gap-6"> <div className="bg-white dark:bg-slate-700 p-4 rounded-lg shadow border dark:border-slate-600"> <h4 className="font-semibold text-gray-700 dark:text-gray-200 mb-1">Today's Net Collected ({selectedDate})</h4> <p className="font-bold text-xl text-green-600 dark:text-green-300">{financialsForToday.collected.toFixed(2)} EGP</p> </div> <div className="bg-white dark:bg-slate-700 p-4 rounded-lg shadow border dark:border-slate-600"> <h4 className="font-semibold text-gray-700 dark:text-gray-200 mb-1">Today's Total Taken ({selectedDate})</h4> <p className="font-bold text-xl text-red-600 dark:text-red-300">{financialsForToday.taken.toFixed(2)} EGP</p> </div> </div> </div> <div className={`${commonSectionClasses} mt-8`}> <label htmlFor="totalCoursePriceInput" className={`${commonLabelClasses} mb-2 text-lg`}>Total Course Price (EGP):</label> <div className="flex items-center gap-2 max-w-sm"> <input id="totalCoursePriceInput" type="number" value={isEditingCoursePrice ? tempCoursePrice : totalCoursePrice} onChange={(e) => setTempCoursePrice(e.target.value)} onBlur={() => { if(isEditingCoursePrice) handleSaveCoursePrice();}} readOnly={!isEditingCoursePrice} className={`${commonInputClasses} flex-grow ${isEditingCoursePrice ? 'ring-2 ring-blue-500' : ''}`} min="0"/> {isEditingCoursePrice ? ( <> <button onClick={handleSaveCoursePrice} className="p-2 bg-green-500 text-white rounded hover:bg-green-600"><Save size={18}/></button> <button onClick={() => { setIsEditingCoursePrice(false); setTempCoursePrice(totalCoursePrice);}} className="p-2 bg-gray-400 text-white rounded hover:bg-gray-500"><X size={18}/></button> </> ) : ( <button onClick={() => {setIsEditingCoursePrice(true); setTempCoursePrice(totalCoursePrice);}} className="p-2 bg-blue-500 text-white rounded hover:bg-blue-600"><Edit3 size={18}/></button> )} </div> </div> </> )}
              
              {currentManagementSubPage === 'cars' && (
                <>
                  {!activeForm && (<div className="flex flex-wrap gap-3 sm:gap-4 justify-center mb-8"><button onClick={() => setActiveForm('addMaintenance')} className="bg-red-500 hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700 text-white px-4 sm:px-6 py-3 rounded-lg font-medium flex items-center transition-colors shadow-md hover:shadow-lg text-sm sm:text-base"><Plus className="mr-2" size={20} /> Add Car Maintenance</button></div>)}
                  {activeForm === 'addMaintenance' && ( <div className={commonSectionClasses}> <h3 className="text-xl font-semibold mb-4 text-red-800 dark:text-red-400">Car Maintenance</h3> <div className="grid md:grid-cols-2 gap-4"> <select value={newMaintenance.carId} onChange={(e) => setNewMaintenance({...newMaintenance, carId: e.target.value})} className={`${commonInputClasses} focus:ring-red-500 dark:focus:ring-red-400 dark:focus:border-red-400`}> <option value="">Select Car</option> {carsList.map(car => (<option key={car.id} value={car.id}>{car.name} ({car.number}) - {capitalizeWords(car.type)}</option>))} </select> <input type="text" placeholder="Maintenance Reason" value={newMaintenance.reason} onChange={(e) => setNewMaintenance({...newMaintenance, reason: e.target.value})} className={`${commonInputClasses} focus:ring-red-500 dark:focus:ring-red-400 dark:focus:border-red-400`} /> <div><label className={commonLabelClasses}>Start Date</label><input type="date" value={newMaintenance.startDate} min={todayDateString} onChange={(e) => setNewMaintenance({...newMaintenance, startDate: e.target.value})} className={`${commonInputClasses} bg-gray-100 dark:bg-gray-700 dark:[color-scheme:dark] focus:ring-red-500 dark:focus:ring-red-400 dark:focus:border-red-400`} /></div> <div><label className={commonLabelClasses}>End Date</label><input type="date" value={newMaintenance.endDate} min={newMaintenance.startDate || todayDateString} onChange={(e) => setNewMaintenance({...newMaintenance, endDate: e.target.value})} className={`${commonInputClasses} bg-gray-100 dark:bg-gray-700 dark:[color-scheme:dark] focus:ring-red-500 dark:focus:ring-red-400 dark:focus:border-red-400`} /></div> </div> <div className="flex gap-4 mt-6"> <button onClick={addMaintenance} className={`bg-red-600 hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600 text-white ${commonFormButtonClasses}`}><Save className="mr-2" size={16} /> Save</button> <button onClick={() => setActiveForm(null)} className={`bg-gray-500 hover:bg-gray-600 dark:bg-gray-600 dark:hover:bg-gray-700 text-white dark:text-gray-100 ${commonFormButtonClasses}`}><X className="mr-2" size={16} /> Cancel</button> </div> </div> )}
                  
                  <div className="bg-red-50 dark:bg-gray-800/30 rounded-xl p-6 border border-red-200 dark:border-red-700/50 shadow-md mb-8">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-xl font-semibold text-red-800 dark:text-red-400">
                            {showCarMaintenanceSearch ? "Search All Maintenance" : "Upcoming/Current Maintenance"}
                        </h3>
                        <button
                            onClick={() => {
                                setShowCarMaintenanceSearch(!showCarMaintenanceSearch);
                                if (showCarMaintenanceSearch) { 
                                    setCarMaintenanceSearchQuery('');
                                    setCarMaintenanceSearchDate('');
                                }
                            }}
                            className={`${smallIconButtonBase} ${showCarMaintenanceSearch ? 'bg-red-100 dark:bg-red-700/50' : ''} hover:bg-red-100 dark:hover:bg-red-700/50`}
                            title={showCarMaintenanceSearch ? "Hide Search & Show Upcoming" : "Show Past & Search All"}
                        >
                            {showCarMaintenanceSearch ? <EyeOff size={18} className="text-red-600 dark:text-red-400"/> : <Search size={18} className="text-red-600 dark:text-red-400"/>}
                        </button>
                    </div>

                    {showCarMaintenanceSearch && (
                        <div className="grid sm:grid-cols-2 gap-4 mb-6 p-4 bg-red-100 dark:bg-red-900/30 rounded-lg">
                            <div>
                                <label htmlFor="carMaintSearchQuery" className={`${commonLabelClasses} text-red-700 dark:text-red-300`}>Search Car (Name/Number)</label>
                                <input
                                    id="carMaintSearchQuery"
                                    type="search"
                                    placeholder="e.g., Toyota or ABC 123"
                                    value={carMaintenanceSearchQuery}
                                    onChange={(e) => setCarMaintenanceSearchQuery(e.target.value)}
                                    className={commonInputClasses}
                                />
                            </div>
                            <div>
                                <label htmlFor="carMaintSearchDate" className={`${commonLabelClasses} text-red-700 dark:text-red-300`}>Active on Date</label>
                                <input
                                    id="carMaintSearchDate"
                                    type="date"
                                    value={carMaintenanceSearchDate}
                                    onChange={(e) => setCarMaintenanceSearchDate(e.target.value)}
                                    className={`${commonInputClasses} bg-gray-50 dark:bg-gray-700 dark:[color-scheme:dark]`}
                                />
                            </div>
                        </div>
                    )}
                    {displayedCarMaintenance.length === 0 ? (<p className="text-gray-500 dark:text-gray-400 text-center py-4">No cars in maintenance matching criteria.</p>) : ( <div className="space-y-3 max-h-60 overflow-y-auto p-1"> {displayedCarMaintenance.map(maintenance => { const car = getCarDetails(parseInt(maintenance.carId)); return ( <div key={maintenance.id} className="bg-white dark:bg-slate-700 rounded-lg p-4 flex justify-between items-center shadow-sm border dark:border-slate-600"> <div><div className="font-semibold capitalize dark:text-gray-100">{car ? `${car.name} (${car.number})` : 'Unknown Car'}</div><div className="text-sm text-gray-600 dark:text-gray-300">{maintenance.startDate} to {maintenance.endDate}</div><div className="text-sm text-red-600 dark:text-red-400 italic">Reason: {maintenance.reason}</div></div> <button onClick={() => requestDeleteMaintenance(maintenance.id)} className={deleteIconButton} aria-label="Delete maintenance"><Trash2 size={18} /></button> </div>);})} </div>)}
                  </div>

                  <div className={commonSectionClasses.replace('mb-8', '')}> <h3 className="text-2xl font-semibold mb-6 text-gray-700 dark:text-gray-200"><Car className="inline mr-2.5" />Cars Management</h3> <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8 items-end"> <input type="text" placeholder="Car Name" value={newCar.name} onChange={(e) => setNewCar({...newCar, name: e.target.value})} className={commonInputClasses} /> <input type="text" placeholder="Car Number" value={newCar.number} onChange={(e) => setNewCar({...newCar, number: e.target.value})} className={commonInputClasses} /> <select value={newCar.type} onChange={(e) => setNewCar({...newCar, type: e.target.value})} className={`${commonInputClasses} h-[42px]`}> <option value="automatic">Automatic</option><option value="manual">Manual</option></select> <button onClick={addCar} className={`md:col-span-2 lg:col-span-1 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white ${commonFormButtonClasses} h-[42px] justify-center w-full mt-4 md:mt-0`}><Plus className="mr-2" size={18} />Add</button> </div> <div className="space-y-4 max-h-96 overflow-y-auto p-1"> {carsList.map(car => ( <div key={car.id} className="bg-white dark:bg-slate-700 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-slate-600"> {editingCarId === car.id ? (<div className="space-y-3"><input type="text" placeholder="Car Name" value={editCarData.name} onChange={(e) => setEditCarData({ ...editCarData, name: e.target.value })} className={commonInputClasses} /><input type="text" placeholder="Car Number" value={editCarData.number} onChange={(e) => setEditCarData({ ...editCarData, number: e.target.value })} className={commonInputClasses} /><select value={editCarData.type} onChange={(e) => setEditCarData({ ...editCarData, type: e.target.value })} className={commonInputClasses}><option value="automatic">Automatic</option><option value="manual">Manual</option></select><div className="flex gap-3 mt-2"><button onClick={handleUpdateCar} className={`bg-green-500 hover:bg-green-600 dark:bg-green-500 dark:hover:bg-green-600 text-white ${commonFormButtonClasses}`}><Save size={16} className="mr-1.5" />Save</button><button onClick={() => setEditingCarId(null)} className={`bg-gray-300 hover:bg-gray-400 dark:bg-gray-600 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-100 ${commonFormButtonClasses}`}><X size={16} className="mr-1.5" />Cancel</button></div></div>) : (<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center"><div className="mb-2 sm:mb-0"><span className="font-semibold text-lg text-gray-800 dark:text-gray-100">{car.name}</span><div className="text-sm text-gray-600 dark:text-gray-300"><Hash className="inline mr-1 text-gray-500 dark:text-gray-400" size={12}/>{car.number}</div><div className="text-sm text-gray-600 dark:text-gray-300"><ListFilter className="inline mr-1 text-gray-500 dark:text-gray-400" size={12}/>{capitalizeWords(car.type)}</div></div><div className="flex gap-2 self-start sm:self-center"><button onClick={() => {setEditingCarId(car.id); setEditCarData({ name: car.name, number: car.number, type: car.type });}} className={editIconButton} aria-label="Edit car"><Edit3 size={18} /></button><button onClick={() => requestDeleteCar(car.id)} className={deleteIconButton} aria-label="Delete car"><Trash2 size={18} /></button></div></div>)}</div>))} </div> </div>
                </>
              )}

              {currentManagementSubPage === 'captains' && (
                <>
                  {!activeForm && (<div className="flex flex-wrap gap-3 sm:gap-4 justify-center mb-8"><button onClick={() => setActiveForm('addHoliday')} className="bg-orange-500 hover:bg-orange-600 dark:bg-orange-600 dark:hover:bg-orange-700 text-white px-4 sm:px-6 py-3 rounded-lg font-medium flex items-center transition-colors shadow-md hover:shadow-lg text-sm sm:text-base"><Plus className="mr-2" size={20} /> Add Captain Holiday</button></div>)}
                  {activeForm === 'addHoliday' && ( <div className={commonSectionClasses}> <h3 className="text-xl font-semibold mb-4 text-orange-800 dark:text-orange-300">Captain Holiday</h3> <div className="grid md:grid-cols-2 gap-4"> <select value={newHoliday.captainId} onChange={(e) => setNewHoliday({...newHoliday, captainId: e.target.value})} className={`${commonInputClasses} focus:ring-orange-500 dark:focus:ring-orange-400 dark:focus:border-orange-400`}> <option value="">Select Captain</option> {captains.map(captain => (<option key={captain.id} value={captain.id}>{captain.name}</option>))} </select> <input type="text" placeholder="Holiday Reason (Optional)" value={newHoliday.reason} onChange={(e) => setNewHoliday({...newHoliday, reason: e.target.value})} className={`${commonInputClasses} focus:ring-orange-500 dark:focus:ring-orange-400 dark:focus:border-orange-400`} /> <div><label className={commonLabelClasses}>Start Date</label><input type="date" value={newHoliday.startDate} min={todayDateString} onChange={(e) => setNewHoliday({...newHoliday, startDate: e.target.value})} className={`${commonInputClasses} bg-gray-100 dark:bg-gray-700 dark:[color-scheme:dark] focus:ring-orange-500 dark:focus:ring-orange-400 dark:focus:border-orange-400`} /></div> <div><label className={commonLabelClasses}>End Date</label><input type="date" value={newHoliday.endDate} min={newHoliday.startDate || todayDateString} onChange={(e) => setNewHoliday({...newHoliday, endDate: e.target.value})} className={`${commonInputClasses} bg-gray-100 dark:bg-gray-700 dark:[color-scheme:dark] focus:ring-orange-500 dark:focus:ring-orange-400 dark:focus:border-orange-400`} /></div> </div> <div className="flex gap-4 mt-6"> <button onClick={addHoliday} className={`bg-orange-600 hover:bg-orange-700 dark:bg-orange-500 dark:hover:bg-orange-600 text-white ${commonFormButtonClasses}`}><Save className="mr-2" size={16} /> Save</button> <button onClick={() => setActiveForm(null)} className={`bg-gray-500 hover:bg-gray-600 dark:bg-gray-600 dark:hover:bg-gray-700 text-white dark:text-gray-100 ${commonFormButtonClasses}`}><X className="mr-2" size={16} /> Cancel</button> </div> </div> )}
                  
                  <div className="bg-orange-50 dark:bg-gray-800/30 rounded-xl p-6 border border-orange-200 dark:border-orange-700/50 shadow-md mb-8">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-xl font-semibold text-orange-800 dark:text-orange-300">
                            {showCaptainHolidaySearch ? "Search All Holidays" : "Upcoming/Current Holidays"}
                        </h3>
                        <button
                            onClick={() => {
                                setShowCaptainHolidaySearch(!showCaptainHolidaySearch);
                                if (showCaptainHolidaySearch) { 
                                    setCaptainHolidaySearchQuery('');
                                    setCaptainHolidaySearchDate('');
                                }
                            }}
                            className={`${smallIconButtonBase} ${showCaptainHolidaySearch ? 'bg-orange-100 dark:bg-orange-700/50' : ''} hover:bg-orange-100 dark:hover:bg-orange-700/50`}
                            title={showCaptainHolidaySearch ? "Hide Search & Show Upcoming" : "Show Past & Search All"}
                        >
                            {showCaptainHolidaySearch ? <EyeOff size={18} className="text-orange-600 dark:text-orange-400"/> : <Search size={18} className="text-orange-600 dark:text-orange-400"/>}
                        </button>
                    </div>
                    {showCaptainHolidaySearch && (
                        <div className="grid sm:grid-cols-2 gap-4 mb-6 p-4 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                            <div>
                                <label htmlFor="captHolSearchQuery" className={`${commonLabelClasses} text-orange-700 dark:text-orange-300`}>Search Captain Name</label>
                                <input
                                    id="captHolSearchQuery"
                                    type="search"
                                    placeholder="e.g., Ahmed Hassan"
                                    value={captainHolidaySearchQuery}
                                    onChange={(e) => setCaptainHolidaySearchQuery(e.target.value)}
                                    className={commonInputClasses}
                                />
                            </div>
                            <div>
                                <label htmlFor="captHolSearchDate" className={`${commonLabelClasses} text-orange-700 dark:text-orange-300`}>Active on Date</label>
                                <input
                                    id="captHolSearchDate"
                                    type="date"
                                    value={captainHolidaySearchDate}
                                    onChange={(e) => setCaptainHolidaySearchDate(e.target.value)}
                                    className={`${commonInputClasses} bg-gray-50 dark:bg-gray-700 dark:[color-scheme:dark]`}
                                />
                            </div>
                        </div>
                    )}
                    {displayedCaptainHolidays.length === 0 ? (<p className="text-gray-500 dark:text-gray-400 text-center py-4">No holidays matching criteria.</p>) : ( <div className="space-y-3 max-h-60 overflow-y-auto p-1"> {displayedCaptainHolidays.map(holiday => ( <div key={holiday.id} className="bg-white dark:bg-slate-700 rounded-lg p-4 flex justify-between items-center shadow-sm border dark:border-slate-600"> <div><div className="font-semibold dark:text-gray-100">{getCaptainName(parseInt(holiday.captainId))}</div><div className="text-sm text-gray-600 dark:text-gray-300">{holiday.startDate} to {holiday.endDate}</div>{holiday.reason && <div className="text-sm text-orange-600 dark:text-orange-400 italic">Reason: {holiday.reason}</div>}</div> <button onClick={() => requestDeleteHoliday(holiday.id)} className={deleteIconButton} aria-label="Delete holiday"><Trash2 size={18} /></button> </div>))} </div>)}
                  </div>

                  <div className={commonSectionClasses.replace('mb-8', '')}> <h3 className="text-2xl font-semibold mb-6 text-gray-700 dark:text-gray-200"><User className="inline mr-2.5" />Captains Management</h3> <div className="grid md:grid-cols-3 gap-4 mb-8 items-end"> <input type="text" placeholder="Captain Name" value={newCaptain.name} onChange={(e) => setNewCaptain({...newCaptain, name: e.target.value})} className={commonInputClasses} /> <input type="tel" placeholder="Phone Number" value={newCaptain.phone} onChange={(e) => setNewCaptain({...newCaptain, phone: e.target.value})} className={commonInputClasses} /> <button onClick={addCaptain} className={`bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white ${commonFormButtonClasses} h-[42px] justify-center w-full`}><Plus className="mr-2" size={18} />Add</button> </div> <div className="space-y-4 max-h-96 overflow-y-auto p-1"> {captains.map(captain => ( <div key={captain.id} className="bg-white dark:bg-slate-700 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-slate-600"> {editingCaptainId === captain.id ? (<div className="space-y-3"><input type="text" value={editCaptainData.name} onChange={(e) => setEditCaptainData({ ...editCaptainData, name: e.target.value })} className={commonInputClasses} /><input type="tel" value={editCaptainData.phone} onChange={(e) => setEditCaptainData({ ...editCaptainData, phone: e.target.value })} className={commonInputClasses} /><div className="flex gap-3 mt-2"><button onClick={handleUpdateCaptain} className={`bg-green-500 hover:bg-green-600 dark:bg-green-500 dark:hover:bg-green-600 text-white ${commonFormButtonClasses}`}><Save size={16} className="mr-1.5" />Save</button><button onClick={() => setEditingCaptainId(null)} className={`bg-gray-300 hover:bg-gray-400 dark:bg-gray-600 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-100 ${commonFormButtonClasses}`}><X size={16} className="mr-1.5" />Cancel</button></div></div>) : (<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center"><div className="mb-2 sm:mb-0"><span className="font-semibold text-lg text-gray-800 dark:text-gray-100">{captain.name}</span><span className="text-gray-600 dark:text-gray-300 block sm:inline sm:ml-4">{captain.phone}</span></div><div className="flex gap-2 self-start sm:self-center"><button onClick={() => {setEditingCaptainId(captain.id); setEditCaptainData({ name: captain.name, phone: captain.phone });}} className={editIconButton} aria-label="Edit captain"><Edit3 size={18} /></button><button onClick={() => requestDeleteCaptain(captain.id)} className={deleteIconButton} aria-label="Delete captain"><Trash2 size={18} /></button></div></div>)}</div>))} </div> </div>
                </>
              )}
              {currentManagementSubPage === 'info' && (
                <div className={commonSectionClasses}>
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-200">
                            <Info className="inline mr-2" /> First Time Lectures Information
                        </h3>
                    </div>
                    <div className="flex items-center mb-6"> 
                        <div>
                            <label htmlFor="infoTabDate" className={commonLabelClasses}>Select Date:</label>
                            <input
                                id="infoTabDate"
                                type="date"
                                value={infoTabDate}
                                onChange={(e) => setInfoTabDate(e.target.value)}
                                className={`${commonInputClasses.replace('w-full', '')} max-w-xs bg-gray-100 dark:bg-gray-700 dark:[color-scheme:dark] h-10`}
                            />
                        </div>
                        <span className="ml-3 w-10 h-10 bg-blue-500 dark:bg-blue-600 text-white text-sm font-bold rounded-full flex items-center justify-center">
                            {firstLecturesOnSelectedInfoDate.length}
                        </span>
                    </div>

                    {firstLecturesOnSelectedInfoDate.length === 0 ? (
                        <p className="text-gray-500 dark:text-gray-400 text-center py-4">No first-time lectures on this date.</p>
                    ) : (
                        <div className="space-y-3 max-h-[400px] overflow-y-auto">
                            {firstLecturesOnSelectedInfoDate.map(lecture => {
                                const car = getCarDetails(parseInt(lecture.carId));
                                const captain = getCaptainName(parseInt(lecture.captainId));
                                return (
                                    <div key={lecture.id} className="bg-white dark:bg-slate-700 p-3 rounded-lg shadow-sm border dark:border-slate-600">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <p className="font-semibold text-blue-600 dark:text-blue-400">{lecture.studentName}</p>
                                                <p className="text-xs text-gray-500 dark:text-gray-400">{lecture.phone}</p>
                                            </div>
                                            <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-700 text-blue-700 dark:text-blue-100 text-xs font-semibold rounded-full">
                                                Lecture #{lecture.lectureNumber}
                                            </span>
                                        </div>
                                        <div className="mt-2 text-sm space-y-0.5">
                                            <p className="text-gray-600 dark:text-gray-300">Time: {lecture.time}</p>
                                            <p className="text-gray-600 dark:text-gray-300">Car: {car ? `${car.name} (${car.number}) - ${capitalizeWords(car.type)}` : 'N/A'}</p>
                                            <p className="text-gray-600 dark:text-gray-300">Captain: {captain}</p>
                                            {lecture.paymentAmount && (
                                                <p className="text-green-600 dark:text-green-400">Paid: {lecture.paymentAmount.toFixed(2)} EGP</p>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Wrapper App component
const App = () => {
  return <DrivingSchoolSystem />;
}

export default App;
