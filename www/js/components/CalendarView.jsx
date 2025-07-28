import React from "react";
import { LocalizationProvider, DateCalendar } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import zhCN from "date-fns/locale/zh-CN";

export default function CalendarView({ value, onChange }) {
  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={zhCN}>
      <DateCalendar value={value} onChange={onChange} />
    </LocalizationProvider>
  );
} 