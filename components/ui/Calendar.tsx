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
          <FaVideo className="text-blue-500 dark:text-gray-200 text-5xl absolute bottom-[5px] right-[5px]" />
        </div>
      );
    }
  };

  const handleDateClick = (arg: any) => {
    onDateSelect(arg.dateStr);
  };

  return (
    <div
      className="w-full h-full md:w-[120vh] md:h-[100vh] p-2 md:p-10 rounded-lg flex justify-center items-center max-w-[100vw] max-h-[100vh] bg-white dark:bg-slate-800 bg-opacity-80 dark:bg-opacity-90"
      style={{
        padding: "10px",
        borderRadius: "10px",
      }}
    >
      <div className="w-full h-full">
        <FullCalendar
          plugins={[dayGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          events={events}
          eventContent={eventContent}
          dateClick={handleDateClick}
          height="100%"
          contentHeight="auto"
          headerToolbar={{
            left: "title",
            center: "",
            right: "today prev,next",
          }}
          buttonText={{
            today: "今日",
            prev: "＜",
            next: "＞",
          }}
          titleFormat={{ year: "numeric", month: "numeric" }} // ここを追加
        />
      </div>
    </div>
  );
};

export default Calendar;
