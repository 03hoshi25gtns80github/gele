"use client";
import React from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import { FaVideo } from "react-icons/fa";

interface CalendarProps {
  dates: string[];
  onDateSelect: (date: string) => void;
}

const Calendar: React.FC<CalendarProps> = ({ dates, onDateSelect }) => {
  const events = dates.map(date => ({
    title: "",
    start: date,
    display: "background",
    backgroundColor: "transparent",
    extendedProps: { hasVideo: true }
  }));

  const eventContent = (eventInfo: any) => {
    if (eventInfo.event.extendedProps.hasVideo) {
      return (
        <div style={{ position: "relative", height: "100%" }}>
          <FaVideo style={{ 
            color: "blue", 
            fontSize: "3em", 
            position: "absolute", 
            bottom: "5px", 
            right: "5px" 
          }} />
        </div>
      );
    }
  };

  const handleDateClick = (arg: any) => {
    onDateSelect(arg.dateStr);
  };

  return (
    <div
      style={{
        width: "120vh",
        height: "100vh",
        backgroundColor: "rgba(255, 255, 255, 0.7)",
        padding: "10px",
        borderRadius: "10px",
      }}
    >
      <FullCalendar
        plugins={[dayGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        events={events}
        eventContent={eventContent}
        dateClick={handleDateClick}
        height="100%"
      />
    </div>
  );
};

export default Calendar;
