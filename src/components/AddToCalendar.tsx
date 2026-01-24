import React, { useState, useRef, useEffect } from 'react';
import { Calendar, ChevronDown, Download, ExternalLink } from 'lucide-react';
import { ScreeningEvent } from '../types';

import { Button } from './ui/button';

interface AddToCalendarProps {
  event: ScreeningEvent;
  className?: string;
}

const AddToCalendar: React.FC<AddToCalendarProps> = ({ event, className = '' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Helper to parse date and time string into Date objects
  const getEventDates = () => {
    // Expected date format: "YYYY-MM-DD"
    // Expected time format: "09:00 AM - 02:00 PM"

    try {
      const [startTimeStr, endTimeStr] = event.time.split('-').map((s) => s.trim());

      const parseTime = (dateString: string, timeString: string) => {
        const [time, modifier] = timeString.split(' ');
        const [h, minutes] = time.split(':').map(Number);
        let hours = h;
        if (modifier === 'PM' && hours < 12) hours += 12;
        if (modifier === 'AM' && hours === 12) hours = 0;

        const date = new Date(dateString);
        date.setHours(hours, minutes, 0);
        return date;
      };

      // We parse against the event date. Note: This creates a Date object in the user's local timezone.
      // Ideally, we'd handle timezones explicitly, but for a local event app, local browser time is usually sufficient
      // or we assume the event is in the user's timezone context.
      // To strictly avoid timezone shifting for "floating" times, we construct strings manually below for the links.

      const startDate = parseTime(event.date + 'T00:00:00', startTimeStr);
      const endDate = parseTime(event.date + 'T00:00:00', endTimeStr);

      return { startDate, endDate };
    } catch (e) {
      console.error('Error parsing event dates', e);
      return { startDate: new Date(), endDate: new Date() };
    }
  };

  const { startDate, endDate } = getEventDates();

  // Format helper: YYYYMMDDTHHmmss
  const formatForLink = (date: Date) => {
    return date.toISOString().replace(/-|:|\.\d+/g, '');
  };

  const generateGoogleLink = () => {
    const start = formatForLink(startDate);
    const end = formatForLink(endDate);
    const details = `Screening Event at ${event.venueName}. Type: ${event.type}`;
    const location = `${event.address}, ${event.zip}`;

    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(event.name)}&dates=${start}/${end}&details=${encodeURIComponent(details)}&location=${encodeURIComponent(location)}`;
  };

  const generateOutlookLink = () => {
    const start = startDate.toISOString();
    const end = endDate.toISOString();
    const details = `Screening Event at ${event.venueName}. Type: ${event.type}`;
    const location = `${event.address}, ${event.zip}`;

    return `https://outlook.live.com/calendar/0/deeplink/compose?subject=${encodeURIComponent(event.name)}&startdt=${start}&enddt=${end}&body=${encodeURIComponent(details)}&location=${encodeURIComponent(location)}`;
  };

  const downloadICS = () => {
    const formatICSDate = (date: Date) => {
      return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    };

    const start = formatICSDate(startDate);
    const end = formatICSDate(endDate);
    const now = formatICSDate(new Date());

    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//CHAMPIONS//Screening Portal//EN',
      'BEGIN:VEVENT',
      `UID:${event.id}-${now}@champions-portal`,
      `DTSTAMP:${now}`,
      `DTSTART:${start}`,
      `DTEND:${end}`,
      `SUMMARY:${event.name}`,
      `DESCRIPTION:Screening Event at ${event.venueName} (${event.type})`,
      `LOCATION:${event.address}, ${event.zip}`,
      'END:VEVENT',
      'END:VCALENDAR',
    ].join('\n');

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.setAttribute('download', `${event.name.replace(/\s+/g, '-')}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setIsOpen(false);
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <Button
        variant="outline"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full justify-between"
        aria-haspopup="true"
        aria-expanded={isOpen}
      >
        <span className="flex items-center">
          <Calendar className="mr-2 h-4 w-4" />
          Add to Calendar
        </span>
        <ChevronDown
          className={`ml-2 h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
        />
      </Button>

      {isOpen && (
        <div className="absolute right-0 bottom-full mb-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-20 overflow-hidden animate-fade-in">
          <div className="py-1" role="menu" aria-orientation="vertical">
            <a
              href={generateGoogleLink()}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center px-4 py-3 text-sm text-slate-700 hover:bg-slate-100 hover:text-brand-red"
              role="menuitem"
              onClick={() => setIsOpen(false)}
            >
              <ExternalLink className="mr-3 h-4 w-4 text-slate-400 group-hover:text-brand-red" />
              Google Calendar
            </a>
            <a
              href={generateOutlookLink()}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center px-4 py-3 text-sm text-slate-700 hover:bg-slate-100 hover:text-brand-red"
              role="menuitem"
              onClick={() => setIsOpen(false)}
            >
              <ExternalLink className="mr-3 h-4 w-4 text-slate-400 group-hover:text-brand-red" />
              Outlook.com
            </a>
            <button
              onClick={downloadICS}
              className="w-full group flex items-center px-4 py-3 text-sm text-slate-700 hover:bg-slate-100 hover:text-brand-red text-left"
              role="menuitem"
            >
              <Download className="mr-3 h-4 w-4 text-slate-400 group-hover:text-brand-red" />
              Apple / Outlook (ICS)
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddToCalendar;
