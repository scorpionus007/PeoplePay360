import React, { createContext, useContext, useState, useEffect } from 'react';
import { Payslip } from '../types';
import { attendanceService } from '../api/services';

export type TabKey = 'home' | 'work' | 'wallet';

export type ModalKey =
  | 'timeoff'
  | 'advance'
  | 'payslip'
  | 'it'
  | 'immigration'
  | 'expense'
  | 'ai'
  | 'referral'
  | 'directory'
  | null;

interface AppContextType {
  activeTab: TabKey;
  setActiveTab: (tab: TabKey) => void;
  activeModal: ModalKey;
  openModal: (key: ModalKey, payload?: any) => void;
  closeModal: () => void;
  modalPayload: any;
  selectedPayslip: Payslip | null;
  setSelectedPayslip: (payslip: Payslip | null) => void;
  isBalanceMasked: boolean;
  toggleBalanceMask: () => void;
  isAdvanceMasked: boolean;
  toggleAdvanceMask: () => void;
  isClockedIn: boolean;
  clockInTime: Date | null;
  workedDuration: string;
  handleClockIn: () => Promise<void>;
  handleClockOut: () => Promise<void>;
  notificationToast: string | null;
  showToast: (msg: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeTab, setActiveTab] = useState<TabKey>('work');
  const [activeModal, setActiveModal] = useState<ModalKey>(null);
  const [modalPayload, setModalPayload] = useState<any>(null);
  const [selectedPayslip, setSelectedPayslip] = useState<Payslip | null>(null);
  const [isBalanceMasked, setIsBalanceMasked] = useState<boolean>(true);
  const [isAdvanceMasked, setIsAdvanceMasked] = useState<boolean>(true);

  // Attendance live tracker
  const [isClockedIn, setIsClockedIn] = useState<boolean>(true);
  const [clockInTime, setClockInTime] = useState<Date | null>(new Date(Date.now() - 4.5 * 3600 * 1000));
  const [workedDuration, setWorkedDuration] = useState<string>('04h 32m');
  const [notificationToast, setNotificationToast] = useState<string | null>(null);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isClockedIn && clockInTime) {
      interval = setInterval(() => {
        const diffMs = Date.now() - clockInTime.getTime();
        const hrs = Math.floor(diffMs / (1000 * 60 * 60));
        const mins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
        setWorkedDuration(`${hrs.toString().padStart(2, '0')}h ${mins.toString().padStart(2, '0')}m`);
      }, 30000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isClockedIn, clockInTime]);

  const openModal = (key: ModalKey, payload?: any) => {
    setModalPayload(payload || null);
    setActiveModal(key);
  };

  const closeModal = () => {
    setActiveModal(null);
    setModalPayload(null);
  };

  const toggleBalanceMask = () => {
    setIsBalanceMasked((prev) => !prev);
  };

  const toggleAdvanceMask = () => {
    setIsAdvanceMasked((prev) => !prev);
  };

  const showToast = (msg: string) => {
    setNotificationToast(msg);
    setTimeout(() => {
      setNotificationToast(null);
    }, 3000);
  };

  const handleClockIn = async () => {
    await attendanceService.checkIn();
    setIsClockedIn(true);
    setClockInTime(new Date());
    setWorkedDuration('00h 01m');
    showToast('Attendance recorded: Clocked in successfully');
  };

  const handleClockOut = async () => {
    await attendanceService.checkOut();
    setIsClockedIn(false);
    showToast('Attendance recorded: Clocked out successfully');
  };

  return (
    <AppContext.Provider
      value={{
        activeTab,
        setActiveTab,
        activeModal,
        openModal,
        closeModal,
        modalPayload,
        selectedPayslip,
        setSelectedPayslip,
        isBalanceMasked,
        toggleBalanceMask,
        isAdvanceMasked,
        toggleAdvanceMask,
        isClockedIn,
        clockInTime,
        workedDuration,
        handleClockIn,
        handleClockOut,
        notificationToast,
        showToast,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export function useApp(): AppContextType {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
