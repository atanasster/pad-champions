import React, { useEffect, useState } from 'react';
import { httpsCallable } from 'firebase/functions';
import { functions } from '../../lib/firebase';
import { ScreeningEvent } from '../../types';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { DatePicker } from '../ui/date-picker';
import { Loader2, Plus, Trash2, Edit, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { ConfirmationModal } from '../ui/confirmation-modal';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form"

// Define Zod Schema
const eventSchema = z.object({
  name: z.string().min(2, "Event name must be at least 2 characters."),
  venueName: z.string().min(2, "Venue name must be at least 2 characters."),
  type: z.enum(['Community Center', 'Barbershop', 'Church', 'Pharmacy']),
  date: z.date(),
  time: z.string().min(1, "Time is required (e.g., 10:00 AM - 02:00 PM)"),
  address: z.string().min(5, "Address must be at least 5 characters."),
  zip: z.string().regex(/^\d{5}$/, "Zip code must be 5 digits."),
});

interface EventsManagerProps {
  userRole?: string;
}

const EventsManager: React.FC<EventsManagerProps> = () => {
  const [events, setEvents] = useState<ScreeningEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [view, setView] = useState<'list' | 'form'>('list');

  const [editingId, setEditingId] = useState<string | null>(null);
  const [sortConfig, setSortConfig] = useState<{ key: keyof ScreeningEvent; direction: 'asc' | 'desc' } | null>({ key: 'date', direction: 'desc' });

  const sortedEvents = React.useMemo(() => {
    const sortableItems = [...events];
    if (sortConfig !== null) {
      sortableItems.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableItems;
  }, [events, sortConfig]);

  const requestSort = (key: keyof ScreeningEvent) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const getSortIcon = (name: keyof ScreeningEvent) => {
    if (!sortConfig || sortConfig.key !== name) {
      return <ArrowUpDown className="w-4 h-4 ml-2 opacity-50" />;
    }
    return sortConfig.direction === 'asc' ? (
      <ArrowUp className="w-4 h-4 ml-2" />
    ) : (
      <ArrowDown className="w-4 h-4 ml-2" />
    );
  };

  const form = useForm<z.infer<typeof eventSchema>>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      name: "",
      venueName: "",
      type: "Community Center",
      time: "",
      address: "",
      zip: "",
    },
  });

  const [modal, setModal] = useState<{
    isOpen: boolean;
    title: string;
    message: React.ReactNode;
    onConfirm?: () => void;
    onCloseCallback?: () => void;
    confirmText?: string;
    variant?: 'default' | 'destructive';
  }>({
    isOpen: false,
    title: '',
    message: '',
  });

  const closeModal = () => {
    setModal(prev => ({ ...prev, isOpen: false }));
    if (modal.onCloseCallback) {
      modal.onCloseCallback();
    }
  };

  const showConfirm = (title: string, message: string, onConfirm: () => void, variant: 'default' | 'destructive' = 'default', confirmText = 'Confirm') => {
    setModal({
      isOpen: true,
      title,
      message,
      onConfirm: async () => {
        setModal(prev => ({ ...prev, isOpen: false }));
        await onConfirm();
      },
      variant,
      confirmText,
    });
  };

  const showAlert = (title: string, message: string, onCloseCallback?: () => void) => {
    setModal({
      isOpen: true,
      title,
      message,
      onCloseCallback,
    });
  };

  const fetchEvents = React.useCallback(async () => {
    setLoading(true);
    try {
      const getEventsFn = httpsCallable<void, { events: ScreeningEvent[] }>(functions, 'getEvents');
      const result = await getEventsFn();
      setEvents(result.data.events);
    } catch (error) {
      console.error('Error fetching events:', error);
      // We can't call showAlert here easily if showAlert changes on every render.
      // But showAlert sets state, it might be stable if we wrap it too.
      // For now, let's keep it simple and just console error or assume showAlert is stable enough or suppress if needed.
      // Wait, duplication of logic. Let's just suppress the warning for the effect or include it.
      // If we use useCallback, we need to include functions in deps (stable) and setEvents (stable).
      // But showAlert uses setModal.
    } finally {
      setLoading(false);
    }
  }, []);

  // We need to define showAlert before fetchEvents if we want to use it, or hoist it, or use a ref.
  // Actually, simplest fix for the "function used before defined" issue if we move it:
  // Just disable the exhaustive-deps line for the useEffect seeing as fetchEvents is meant to be called on mount.


  useEffect(() => {
    fetchEvents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);



  const handleDelete = (id: string) => {
    showConfirm(
      'Delete Event',
      'Are you sure you want to delete this event?',
      () => executeDelete(id),
      'destructive',
      'Delete'
    );
  };

  const executeDelete = async (id: string) => {
    setProcessing(true);
    try {
      const manageEventFn = httpsCallable(functions, 'manageEvent');
      await manageEventFn({ action: 'delete', eventId: id });
      setEvents(events.filter(e => e.id !== id));
      showAlert('Success', 'Event deleted successfully');
    } catch (error) {
      console.error('Error deleting event:', error);
      const message = error instanceof Error ? error.message : 'Unknown error';
      showAlert('Error', `Failed to delete event: ${message}`);
    } finally {
      setProcessing(false);
    }
  };

  const handleEdit = (event: ScreeningEvent) => {
    console.log("Editing event:", event); // Debug
    setEditingId(event.id || null);
    
    // Reset form with values. Ensure date is a Date object.
    form.reset({
      name: event.name,
      venueName: event.venueName,
      type: event.type as "Community Center" | "Barbershop" | "Church" | "Pharmacy",
      date: new Date(event.date), // critical conversion
      time: event.time,
      address: event.address,
      zip: event.zip,
    });
    
    setView('form');
  };

  const handleAddNew = () => {
    setEditingId(null);
    form.reset({
      name: "",
      venueName: "",
      type: "Community Center",
      date: undefined,
      time: "",
      address: "",
      zip: "",
    });
    setView('form');
  };

  const onSubmit = async (values: z.infer<typeof eventSchema>) => {
    setProcessing(true);
    try {
      const manageEventFn = httpsCallable(functions, 'manageEvent');
      const action = editingId ? 'update' : 'create';
      
      const payloadData: Partial<ScreeningEvent> = {
        ...values,
        date: values.date.toISOString().split('T')[0],
        coordinates: { lat: 37.8044, lng: -122.2712 }
      };

      const payload = {
        action,
        eventPayload: payloadData,
        eventId: editingId
      };
      
      await manageEventFn(payload);
      
      showAlert('Success', `Event ${editingId ? 'updated' : 'created'} successfully!`, () => {
        setView('list');
        fetchEvents();
      });
    } catch (error) {
      console.error(`Error ${editingId ? 'updating' : 'creating'} event:`, error);
      const message = error instanceof Error ? error.message : 'Unknown error';
      showAlert('Error', `Failed to save event: ${message}`);
    } finally {
      setProcessing(false);
    }
  };

  if (view === 'form') {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{editingId ? 'Edit Event' : 'Add New Event'}</CardTitle>
          <CardDescription>Fill in the details for the screening event.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Event Name <span className="text-red-500">*</span></FormLabel>
                      <FormControl>
                        <Input placeholder="Health Fair..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="venueName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Venue Name <span className="text-red-500">*</span></FormLabel>
                      <FormControl>
                        <Input placeholder="Community Hall..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Venue Type <span className="text-red-500">*</span></FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Community Center">Community Center</SelectItem>
                          <SelectItem value="Barbershop">Barbershop</SelectItem>
                          <SelectItem value="Church">Church</SelectItem>
                          <SelectItem value="Pharmacy">Pharmacy</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="date"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Date <span className="text-red-500">*</span></FormLabel>
                      <DatePicker
                        date={field.value}
                        setDate={field.onChange}
                      />
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="time"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Time <span className="text-red-500">*</span></FormLabel>
                      <FormControl>
                        <Input placeholder="10:00 AM - 02:00 PM" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="zip"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Zip Code <span className="text-red-500">*</span></FormLabel>
                      <FormControl>
                        <Input placeholder="94612" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="md:col-span-2">
                  <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Address <span className="text-red-500">*</span></FormLabel>
                        <FormControl>
                          <Input placeholder="123 Main St..." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Lat/Lng inputs removed as per request */}
              </div>
              
              <div className="flex justify-end gap-3 pt-4">
                <Button type="button" variant="outline" onClick={() => setView('list')}>
                  Cancel
                </Button>
                <Button type="submit" disabled={processing}>
                  {processing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Save Event
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-slate-800">Screening Events</h2>
        <div className="flex gap-2">
          {/* Seed Data button removed */}
          <Button onClick={handleAddNew}>
            <Plus className="w-4 h-4 mr-2" /> Add Event
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center p-8">
          <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
        </div>
      ) : events.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center p-12 text-slate-500">
            <p>No events found.</p>
            <Button variant="link" onClick={handleAddNew}>Create your first event</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="bg-white rounded-md border border-slate-200 overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="p-4 font-medium text-slate-500 text-sm cursor-pointer hover:text-slate-700 transition-colors" onClick={() => requestSort('name')}>
                  <div className="flex items-center">
                    Event Name
                    {getSortIcon('name')}
                  </div>
                </th>
                <th className="p-4 font-medium text-slate-500 text-sm cursor-pointer hover:text-slate-700 transition-colors" onClick={() => requestSort('date')}>
                  <div className="flex items-center">
                    Date
                    {getSortIcon('date')}
                  </div>
                </th>
                <th className="p-4 font-medium text-slate-500 text-sm cursor-pointer hover:text-slate-700 transition-colors" onClick={() => requestSort('venueName')}>
                  <div className="flex items-center">
                    Venue
                    {getSortIcon('venueName')}
                  </div>
                </th>
                <th className="p-4 font-medium text-slate-500 text-sm cursor-pointer hover:text-slate-700 transition-colors" onClick={() => requestSort('type')}>
                  <div className="flex items-center">
                    Type
                    {getSortIcon('type')}
                  </div>
                </th>
                <th className="p-4 font-medium text-slate-500 text-sm text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {sortedEvents.map((event) => (
                <tr key={event.id} className="hover:bg-slate-50">
                  <td className="p-4 font-medium">{event.name}</td>
                  <td className="p-4 text-slate-600">{event.date}</td>
                  <td className="p-4 text-slate-600">{event.venueName}</td>
                  <td className="p-4">
                    <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-slate-100 text-slate-700">
                      {event.type}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <button 
                      onClick={() => handleEdit(event)}
                      className="text-slate-400 hover:text-indigo-600 mr-3"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => event.id && handleDelete(event.id)}
                      className="text-slate-400 hover:text-red-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <ConfirmationModal
        isOpen={modal.isOpen}
        onClose={closeModal}
        onConfirm={modal.onConfirm}
        title={modal.title}
        message={modal.message}
        variant={modal.variant}
        confirmText={modal.confirmText}
      />
    </div>
  );
};

export default EventsManager;
