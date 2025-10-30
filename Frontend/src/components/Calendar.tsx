import { useEffect, useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import type { CalendarProps } from "../Interfaces/CalenderProps";
import "../styles/calender.css";

const Calendar = ({
  selectedDate,
  onDateChange,
  variant = "popup",
}: CalendarProps) => {
  const [showCalendar, setShowCalendar] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 825);
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 825);
    };
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);
  const effectiveVariant = isMobile ? "popup" : variant ?? "full";
  const goToPreviousDay = () => {
    if (!selectedDate) return;
    const prevDate = new Date(selectedDate);
    prevDate.setDate(prevDate.getDate() - 1);
    onDateChange(prevDate);
  };

  const goToNextDay = () => {
    if (!selectedDate) return;
    const nextDate = new Date(selectedDate);
    nextDate.setDate(nextDate.getDate() + 1);
    onDateChange(nextDate);
  };

  const toggleCalendar = () => setShowCalendar((prev) => !prev);

  const handleDateChange = (date: Date) => {
    onDateChange(date);
    if (effectiveVariant === "popup") setShowCalendar(false);
  };
  const isToday = selectedDate
    ? selectedDate.toDateString() === new Date().toDateString()
    : false;
  const fullCalendarProps = {
    selected: selectedDate,
    onChange: (date: Date | null) => {
      if (date) handleDateChange(date);
    },
    minDate: new Date(),
    inline: true,
    dayClassName: (date: Date) => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return date < today ? "past-day" : "";
    },
  };

  return (
    <div className={`custom-calendar ${effectiveVariant}`}>
      {/* Variant handling */}
      {effectiveVariant === "popup" ? (
        <div className="calendar-popup">
          <div className="calendar-header">
            {!isToday && <button onClick={goToPreviousDay}>◀</button>}

            <button onClick={toggleCalendar} className="selected-date">
              {selectedDate
                ? selectedDate.toLocaleDateString("sv-SE", {
                    weekday: "short",
                    month: "short",
                    day: "numeric",
                  })
                : "Välj datum"}
            </button>

            <button onClick={goToNextDay}>▶</button>
          </div>
          {showCalendar && <DatePicker {...fullCalendarProps} />}
        </div>
      ) : (
        <div className="calendar-full">
          <DatePicker {...fullCalendarProps} />
        </div>
      )}
    </div>
  );
};

export default Calendar;
