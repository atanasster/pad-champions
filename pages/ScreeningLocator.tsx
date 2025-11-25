import React, { useState } from 'react';
import { MapPin, Calendar, Clock, Navigation, Search, Filter } from 'lucide-react';
import { MOCK_EVENTS } from '../data/mockData';
import AddToCalendar from '../components/AddToCalendar';
import { Card, CardContent } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Select } from '../components/ui/select';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';

const ScreeningLocator: React.FC = () => {
  const [zipFilter, setZipFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('All');

  const filteredEvents = MOCK_EVENTS.filter(event => {
    const matchesZip = event.zip.includes(zipFilter);
    const matchesType = typeFilter === 'All' || event.type === typeFilter;
    return matchesZip && matchesType;
  });

  return (
    <div className="bg-slate-50 min-h-screen py-10">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl md:text-4xl font-bold text-brand-dark mb-2 font-serif">Find a Free Screening</h1>
        <p className="text-lg text-slate-700 mb-8">
          Locate a Pop-up Clinic near you. No insurance required.
        </p>

        {/* Filters */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label htmlFor="zip" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center gap-2">
                  <Search className="w-4 h-4" /> Filter by Zip Code
                </label>
                <Input
                  type="text"
                  id="zip"
                  placeholder="Enter zip code..."
                  value={zipFilter}
                  onChange={(e) => setZipFilter(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="type" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center gap-2">
                  <Filter className="w-4 h-4" /> Venue Type
                </label>
                <Select
                  id="type"
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                >
                  <option value="All">All Locations</option>
                  <option value="Barbershop">Barbershops</option>
                  <option value="Church">Churches</option>
                  <option value="Community Center">Community Centers</option>
                  <option value="Pharmacy">Pharmacies</option>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Results List */}
        <div className="space-y-6">
          {filteredEvents.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg border-2 border-dashed border-slate-300">
              <p className="text-xl text-slate-500 mb-4">No screenings found matching your criteria.</p>
              <Button 
                variant="link"
                onClick={() => {setZipFilter(''); setTypeFilter('All')}}
                className="text-brand-red font-bold text-lg"
              >
                Clear Filters
              </Button>
            </div>
          ) : (
            filteredEvents.map(event => (
              <Card key={event.id} className="overflow-hidden border-l-8 border-l-brand-red transition-shadow hover:shadow-md">
                <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row gap-6">
                        <div className="flex-1">
                            <div className="flex justify-between items-start mb-2">
                                <div>
                                     <Badge variant="secondary" className="mb-2 text-brand-red bg-red-50 border-red-100">
                                        {event.type}
                                    </Badge>
                                    <h3 className="text-2xl font-bold text-brand-dark mb-1 font-serif">{event.name}</h3>
                                    <p className="text-slate-600 font-medium text-lg">{event.venueName}</p>
                                </div>
                            </div>
                          
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-6">
                            <div className="flex items-center text-slate-700">
                              <Calendar className="h-5 w-5 mr-3 text-slate-400" />
                              <span className="text-base font-medium">{new Date(event.date + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</span>
                            </div>
                            <div className="flex items-center text-slate-700">
                              <Clock className="h-5 w-5 mr-3 text-slate-400" />
                              <span className="text-base font-medium">{event.time}</span>
                            </div>
                            <div className="flex items-center text-slate-700 sm:col-span-2">
                              <MapPin className="h-5 w-5 mr-3 text-slate-400" />
                              <span className="text-base font-medium">{event.address}, {event.zip}</span>
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
        </div>
      </div>
    </div>
  );
};

export default ScreeningLocator;