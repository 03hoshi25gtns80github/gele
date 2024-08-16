"use client";
import React from "react";
import ReactCalendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { FaVideo } from "react-icons/fa";

interface CalendarProps {
  dates: string[];
  onDateSelect: (date: string) => void;
}

const Calendar: React.FC<CalendarProps> = ({ dates, onDateSelect }) => {
  const tileContent = ({ date, view }: { date: Date; view: string }) => {
    if (view === "month" && dates.includes(date.toISOString().split("T")[0])) {
      return <FaVideo style={{ color: "red", fontSize: "1.5em" }} />;
    }
  };

  return (
    <ReactCalendar
      locale="en"
      tileContent={tileContent}
      onClickDay={(value) => onDateSelect(value.toISOString().split("T")[0])}
    />
  );
};

export default Calendar;
