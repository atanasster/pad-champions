import React, { useState, useRef } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { 
  MapPin, Clock, Navigation, Calendar as CalendarIcon, 
  Info, Plus, X, Save, Scissors, Pill, Users, Landmark,
  Trash2, AlertTriangle
} from 'lucide-react';
import { MOCK_EVENTS } from '../data/mockData';
import { ScreeningEvent } from '../types';
import AddToCalendar from '../components/AddToCalendar';
import { Card, CardContent } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Select } from '../components/ui/select';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';

// Helper to get visual config based on type
const getVenueStyle = (type: string) => {
  switch (type) {
    case 'Barbershop':
      return { color: '#dc2626', icon: Scissors, bg: 'bg-red-600', lightBg: 'bg-red-50', text: 'text-red-700' };
    case 'Church':
      return { color: '#4f46e5', icon: Landmark, bg: 'bg-indigo-600', lightBg: 'bg-indigo-50', text: 'text-indigo-700' };
    case 'Pharmacy':
      return { color: '#059669', icon: Pill, bg: 'bg-emerald-600', lightBg: 'bg-emerald-50', text: 'text-emerald-700' };
    case 'Community Center':
      return { color: '#d97706', icon: Users, bg: 'bg-amber-600', lightBg: 'bg-amber-50', text: 'text-amber-700' };
    default:
      return { color: '#475569', icon: MapPin, bg: 'bg-slate-600', lightBg: 'bg-slate-50', text: 'text-slate-700' };
  }
};

const EventCalendar: React.FC = () => {
  // Initialize with MOCK_EVENTS but allow updates
  const [events, setEvents] = useState<ScreeningEvent[]>(MOCK_EVENTS);
  const [selectedEvents, setSelectedEvents] = useState<ScreeningEvent[]>([]);
  const [selectedDateLabel, setSelectedDateLabel] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false); // Acts as "Admin Mode" toggle
  const [eventToDelete, setEventToDelete] = useState<ScreeningEvent | null>(null);
  
  // Form State
  const [formData, setFormData] = useState<Omit<ScreeningEvent, 'id' | 'coordinates'>>({
    name: '',
    date: new Date().toISOString().split('T')[0],
    time: '',
    venueName: '',
    address: '',
    zip: '',
    type: 'Community Center'
  });

  // Create a ref if we need to access calendar API later
  const calendarRef = useRef<FullCalendar>(null);

  // Map our data to FullCalendar event format
  const calendarEvents = events.map(event => {
    const style = getVenueStyle(event.type);
    return {
      id: event.id,
      title: event.name, // Will appear on the calendar
      start: event.date, // YYYY-MM-DD
      extendedProps: {
        ...event
      },
      backgroundColor: style.color,
      borderColor: style.color,
      textColor: '#ffffff',
      classNames: ['cursor-pointer', 'hover:opacity-90', 'transition-opacity'] 
    };
  });

  // Custom render for calendar events
  const renderEventContent = (eventInfo: any) => {
    const type = eventInfo.event.extendedProps.type;
    const { icon: Icon } = getVenueStyle(type);
    
    return (
        <div className="flex items-center gap-1.5 px-1.5 py-0.5 w-full overflow-hidden">
            <Icon size={12} className="flex-shrink-0" strokeWidth={3} />
            <span className="truncate text-xs font-bold leading-tight">{eventInfo.event.title}</span>
        </div>
    );
  };

  const handleDateClick = (arg: { dateStr: string }) => {
    // Filter events for this day
    const eventsOnDay = events.filter(e => e.date === arg.dateStr);
    
    setSelectedEvents(eventsOnDay);
    
    // Format friendly date safely
    const [year, month, day] = arg.dateStr.split('-').map(Number);
    const dateObj = new Date(year, month - 1, day);
    
    setSelectedDateLabel(dateObj.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }));
  };

  const handleEventClick = (arg: { event: any }) => {
    // When clicking the chip, show just that event
    const eventData = events.find(e => e.id === arg.event.id);
    if (eventData) {
      setSelectedEvents([eventData]);
      
      // Parse date safely to avoid timezone shifts
      const [year, month, day] = eventData.date.split('-').map(Number);
      const dateObj = new Date(year, month - 1, day);

      setSelectedDateLabel(dateObj.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }));
      
      // Scroll to details with a slight delay to ensure DOM update
      setTimeout(() => {
        document.getElementById('event-details')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 50);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddEvent = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newEvent: ScreeningEvent = {
      id: Date.now().toString(),
      ...formData,
      // Mock coordinates for the new event since we don't have a geocoder
      coordinates: { lat: 37.8044, lng: -122.2712 } 
    };

    const updatedEvents = [...events, newEvent];
    setEvents(updatedEvents);
    
    // Close form and reset
    setIsFormOpen(false);
    setFormData({
      name: '',
      date: new Date().toISOString().split('T')[0],
      time: '',
      venueName: '',
      address: '',
      zip: '',
      type: 'Community Center'
    });

    // Automatically select the new date to show the event
    handleDateClick({ dateStr: newEvent.date });
  };

  const initiateDelete = (id: string) => {
    const event = events.find(e => e.id === id);
    if (event) {
      setEventToDelete(event);
    }
  };

  const confirmDelete = () => {
    if (!eventToDelete) return;

    const updatedEvents = events.filter(e => e.id !== eventToDelete.id);
    setEvents(updatedEvents);
    
    // Also remove from selected view if present
    const updatedSelected = selectedEvents.filter(e => e.id !== eventToDelete.id);
    setSelectedEvents(updatedSelected);
    
    setEventToDelete(null);
  };

  return (
    <div className="bg-slate-50 min-h-screen py-10 relative">
      {/* Delete Confirmation Modal */}
      {eventToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
          <Card className="max-w-md w-full animate-in zoom-in-95">
            <CardContent className="p-6">
                <div className="flex items-center gap-4 mb-4">
                <div className="p-3 bg-red-100 rounded-full flex-shrink-0">
                    <AlertTriangle className="w-6 h-6 text-red-600" />
                </div>
                <h3 className="text-xl font-bold text-slate-900">Delete Event?</h3>
                </div>
                
                <p className="text-slate-600 mb-6 text-lg">
                Are you sure you want to delete <span className="font-bold text-slate-900">{eventToDelete.name}</span>? 
                <span className="block mt-2 text-sm text-red-600 font-medium">This action cannot be undone.</span>
                </p>
                
                <div className="flex justify-end gap-3">
                <Button 
                    variant="ghost"
                    onClick={() => setEventToDelete(null)}
                >
                    Cancel
                </Button>
                <Button 
                    variant="destructive"
                    onClick={confirmDelete}
                >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete Event
                </Button>
                </div>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-brand-dark mb-2 font-serif">Screening Events Calendar</h1>
            <p className="text-lg text-slate-700">
              Browse upcoming screenings by date.
            </p>
          </div>
          <Button 
            onClick={() => setIsFormOpen(!isFormOpen)}
            variant={isFormOpen ? "secondary" : "default"}
            className={isFormOpen ? "" : "bg-brand-dark hover:bg-slate-800"}
          >
            {isFormOpen ? <><X className="w-5 h-5 mr-2" /> Close Admin Mode</> : <><Plus className="w-5 h-5 mr-2" /> Admin / Add Event</>}
          </Button>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-4 mb-6 text-sm text-slate-600">
          <div className="flex items-center"><div className="w-3 h-3 rounded-full bg-red-600 mr-2"></div> Barbershop</div>
          <div className="flex items-center"><div className="w-3 h-3 rounded-full bg-indigo-600 mr-2"></div> Church</div>
          <div className="flex items-center"><div className="w-3 h-3 rounded-full bg-emerald-600 mr-2"></div> Pharmacy</div>
          <div className="flex items-center"><div className="w-3 h-3 rounded-full bg-amber-600 mr-2"></div> Community Center</div>
        </div>

        {/* Admin Form */}
        {isFormOpen && (
          <Card className="mb-8 border-2 border-slate-200 shadow-md animate-in slide-in-from-top-4">
            <CardContent className="p-6">
                <h2 className="text-xl font-bold text-brand-dark mb-4 flex items-center">
                <Plus className="w-5 h-5 mr-2 text-brand-red" />
                Add New Screening Event
                </h2>
                <form onSubmit={handleAddEvent}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700">Event Name</label>
                        <Input 
                            required
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            placeholder="e.g. Health Fair at St. Mary's"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700">Venue Name</label>
                        <Input 
                            required
                            name="venueName"
                            value={formData.venueName}
                            onChange={handleInputChange}
                            placeholder="e.g. St. Mary's Church"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700">Date</label>
                        <Input 
                            required
                            type="date"
                            name="date"
                            value={formData.date}
                            onChange={handleInputChange}
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700">Time</label>
                        <Input 
                            required
                            name="time"
                            value={formData.time}
                            onChange={handleInputChange}
                            placeholder="e.g. 10:00 AM - 2:00 PM"
                        />
                    </div>
                    <div className="md:col-span-2 space-y-2">
                        <label className="text-sm font-medium text-slate-700">Address</label>
                        <Input 
                            required
                            name="address"
                            value={formData.address}
                            onChange={handleInputChange}
                            placeholder="1234 Main St"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700">Zip Code</label>
                        <Input 
                            required
                            name="zip"
                            value={formData.zip}
                            onChange={handleInputChange}
                            placeholder="94612"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700">Venue Type</label>
                        <Select 
                            name="type"
                            value={formData.type}
                            onChange={handleInputChange}
                        >
                            <option value="Barbershop">Barbershop</option>
                            <option value="Church">Church</option>
                            <option value="Community Center">Community Center</option>
                            <option value="Pharmacy">Pharmacy</option>
                        </Select>
                    </div>
                </div>
                <div className="flex justify-end gap-3">
                    <Button 
                        type="button" 
                        variant="ghost"
                        onClick={() => setIsFormOpen(false)}
                    >
                    Cancel
                    </Button>
                    <Button 
                        type="submit"
                        className="bg-brand-red hover:bg-red-800"
                    >
                        <Save className="w-4 h-4 mr-2" />
                        Save Event
                    </Button>
                </div>
                </form>
            </CardContent>
          </Card>
        )}

        {/* Calendar Container */}
        <Card className="mb-8 overflow-hidden shadow-lg border border-slate-200">
            <CardContent className="p-4 md:p-6">
                <FullCalendar
                    ref={calendarRef}
                    plugins={[dayGridPlugin, interactionPlugin]}
                    initialView="dayGridMonth"
                    initialDate={events.length > 0 ? events[0].date : new Date().toISOString().split('T')[0]} 
                    headerToolbar={{
                    left: 'prev,next today',
                    center: 'title',
                    right: 'dayGridMonth'
                    }}
                    events={calendarEvents}
                    eventContent={renderEventContent}
                    dateClick={handleDateClick}
                    eventClick={handleEventClick}
                    height="auto"
                    contentHeight="auto"
                    fixedWeekCount={false}
                    dayMaxEvents={true}
                />
            </CardContent>
        </Card>

        {/* Selected Date Details Area */}
        <div className="min-h-[200px] scroll-mt-20" id="event-details">
            {selectedDateLabel ? (
                <div className="animate-in fade-in duration-300">
                    <div className="flex items-center mb-6">
                        <CalendarIcon className="h-6 w-6 text-brand-red mr-2" />
                        <h3 className="text-2xl font-bold text-brand-dark font-serif">
                            {selectedDateLabel}
                        </h3>
                    </div>
                    
                    {selectedEvents.length > 0 ? (
                        <div className="grid gap-6">
                             {selectedEvents.map(event => (
                                <EventCard 
                                  key={event.id} 
                                  event={event} 
                                  isAdmin={isFormOpen} 
                                  onDelete={initiateDelete} 
                                />
                             ))}
                        </div>
                    ) : (
                        <div className="bg-white p-8 rounded-xl border border-dashed border-slate-300 text-center text-slate-500">
                            <Info className="h-12 w-12 mx-auto mb-2 text-slate-300" />
                            <p className="text-lg font-medium">No screenings scheduled.</p>
                            <p className="text-sm">Please select another date with a colored marker.</p>
                        </div>
                    )}
                </div>
            ) : (
                 <div className="bg-blue-50 border border-blue-100 rounded-xl p-8 text-center text-slate-600">
                    <p className="text-lg font-medium">Select a date or event on the calendar above to view details.</p>
                 </div>
            )}
        </div>

      </div>
    </div>
  );
};

// Helper Component for List Item
interface EventCardProps {
  event: ScreeningEvent;
  isAdmin?: boolean;
  onDelete?: (id: string) => void;
}

const EventCard: React.FC<EventCardProps> = ({ event, isAdmin, onDelete }) => {
    const style = getVenueStyle(event.type);
    const Icon = style.icon;

    return (
        <Card className={`border-l-4 overflow-hidden relative group hover:shadow-md transition-shadow`} style={{ borderLeftColor: style.color }}>
            <CardContent className="p-6 flex flex-col md:flex-row justify-between items-start md:items-center">
            
                {/* Delete Button (Only visible in Admin Mode) */}
                {isAdmin && onDelete && (
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                    e.stopPropagation();
                    onDelete(event.id);
                    }}
                    className="absolute top-2 right-2 text-slate-400 hover:text-red-600 hover:bg-red-50 z-10"
                    title="Delete Event"
                >
                    <Trash2 className="w-5 h-5" />
                </Button>
                )}

                <div className="mb-4 md:mb-0">
                    <span className={`inline-flex items-center px-2 py-1 ${style.lightBg} ${style.text} text-xs font-bold uppercase tracking-wide rounded mb-2`}>
                        <Icon size={12} className="mr-1.5" />
                        {event.type}
                    </span>
                    <h4 className="text-xl font-bold text-brand-dark font-serif">{event.name}</h4>
                    <p className="text-slate-600 font-medium">{event.venueName}</p>
                    <div className="flex flex-col sm:flex-row gap-4 mt-3 text-sm text-slate-600">
                        <div className="flex items-center bg-slate-50 px-2 py-1 rounded">
                            <Clock className="h-4 w-4 mr-2 text-slate-400" /> {event.time}
                        </div>
                        <div className="flex items-center bg-slate-50 px-2 py-1 rounded">
                            <MapPin className="h-4 w-4 mr-2 text-slate-400" /> {event.address}, {event.zip}
                        </div>
                    </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
                    <Button 
                        asChild
                        className="bg-brand-dark hover:bg-slate-800"
                    >
                        <a 
                            href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(event.address)}`}
                            target="_blank" 
                            rel="noreferrer"
                        >
                            <Navigation className="h-4 w-4 mr-2" />
                            Directions
                        </a>
                    </Button>
                    <div className="min-w-[170px]">
                        <AddToCalendar event={event} />
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}

export default EventCalendar;