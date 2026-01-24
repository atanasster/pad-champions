import React, { useState, useEffect } from 'react';
import { MapPin, Calendar, Clock, Navigation, Search, Filter, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import { httpsCallable } from 'firebase/functions';
import { functions } from '../lib/firebase';
import { ScreeningEvent } from '../types';
import AddToCalendar from '../components/AddToCalendar';
import { Card, CardContent } from '../components/ui/card';
import { Input } from '../components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Label } from '../components/ui/label';

const ScreeningLocator: React.FC = () => {
  const [zipFilter, setZipFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('All');
  const [events, setEvents] = useState<ScreeningEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);
      try {
        const getEventsFn = httpsCallable<void, { events: ScreeningEvent[] }>(functions, 'getEvents');
        const result = await getEventsFn();
        setEvents(result.data.events);
      } catch (error) {
        console.error('Error fetching events:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  const filteredEvents = events
    .filter((event) => {
      const matchesZip = event.zip.includes(zipFilter);
      const matchesType = typeFilter === 'All' || event.type === typeFilter;
      return matchesZip && matchesType;
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const totalPages = Math.ceil(filteredEvents.length / itemsPerPage);
  const paginatedEvents = filteredEvents.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [zipFilter, typeFilter]);

  return (
    <div className="bg-slate-50 min-h-screen py-10">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl md:text-4xl font-bold text-brand-dark mb-2 font-serif">
          Find a Free Screening
        </h1>
        <p className="text-lg text-slate-700 mb-8">
          Locate a Pop-up Clinic near you. No insurance required.
        </p>

        {/* Filters */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="zip" className="flex items-center gap-2">
                  <Search className="w-4 h-4" /> Filter by Zip Code
                </Label>
                <Input
                  type="text"
                  id="zip"
                  placeholder="Enter zip code..."
                  value={zipFilter}
                  onChange={(e) => setZipFilter(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="type" className="flex items-center gap-2">
                  <Filter className="w-4 h-4" /> Venue Type
                </Label>
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger id="type">
                    <SelectValue placeholder="Select venue type..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All">All Locations</SelectItem>
                    <SelectItem value="Barbershop">Barbershops</SelectItem>
                    <SelectItem value="Church">Churches</SelectItem>
                    <SelectItem value="Community Center">Community Centers</SelectItem>
                    <SelectItem value="Pharmacy">Pharmacies</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Results List */}
        <div className="space-y-6">
          {loading ? (
            <div className="flex justify-center items-center py-12">
               <Loader2 className="w-10 h-10 animate-spin text-brand-red" />
            </div>
          ) : filteredEvents.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg border-2 border-dashed border-slate-300">
              <p className="text-xl text-slate-500 mb-4">
                No screenings found matching your criteria.
              </p>
              <Button
                variant="link"
                onClick={() => {
                  setZipFilter('');
                  setTypeFilter('All');
                }}
                className="text-brand-red font-bold text-lg"
              >
                Clear Filters
              </Button>
            </div>
          ) : (
            paginatedEvents.map((event) => (
              <Card
                key={event.id}
                className="overflow-hidden border-l-8 border-l-brand-red transition-shadow hover:shadow-md"
              >
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row gap-6">
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <Badge
                            variant="secondary"
                            className="mb-2 text-brand-red bg-red-50 border-red-100"
                          >
                            {event.type}
                          </Badge>
                          <h3 className="text-2xl font-bold text-brand-dark mb-1 font-serif">
                            {event.name}
                          </h3>
                          <p className="text-slate-600 font-medium text-lg">{event.venueName}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-6">
                        <div className="flex items-center text-slate-700">
                          <Calendar className="h-5 w-5 mr-3 text-slate-400" />
                          <span className="text-base font-medium">
                            {new Date(event.date + 'T12:00:00').toLocaleDateString('en-US', {
                              weekday: 'long',
                              month: 'long',
                              day: 'numeric',
                            })}
                          </span>
                        </div>
                        <div className="flex items-center text-slate-700">
                          <Clock className="h-5 w-5 mr-3 text-slate-400" />
                          <span className="text-base font-medium">{event.time}</span>
                        </div>
                        <div className="flex items-center text-slate-700 sm:col-span-2">
                          <MapPin className="h-5 w-5 mr-3 text-slate-400" />
                          <span className="text-base font-medium">
                            {event.address}, {event.zip}
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row gap-3">
                        <Button
                          asChild
                          className="flex-1 bg-brand-red hover:bg-red-800 text-white font-bold h-12 text-base"
                        >
                          <a
                            href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(event.address)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <Navigation className="mr-2 h-5 w-5" />
                            Get Directions
                          </a>
                        </Button>
                        <div className="flex-1">
                          <AddToCalendar event={event} />
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}

          {/* Pagination Controls */}
          {filteredEvents.length > 0 && (
            <div className="flex justify-center items-center gap-4 py-8">
              <Button
                variant="outline"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4 mr-2" />
                Previous
              </Button>
              <span className="text-slate-600 font-medium">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                Next
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ScreeningLocator;
