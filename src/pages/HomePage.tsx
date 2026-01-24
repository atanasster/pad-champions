import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Activity, CalendarCheck, ArrowRight } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';

const HomePage: React.FC = () => {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative bg-brand-dark text-white py-20 md:py-32 px-4 overflow-hidden">
        {/* Background Overlay (Conceptual) */}

        <div className="max-w-7xl mx-auto relative z-10 flex flex-col md:flex-row items-center">
          <div className="md:w-3/4 mb-10 md:mb-0">
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight leading-tight mb-6 font-serif">
              Do your legs hurt when you walk?
            </h1>
            <p className="text-xl md:text-2xl text-slate-200 mb-10 max-w-2xl font-light">
              Leg cramps aren't just "getting old." It might be your arteries. Get checked for free
              in your neighborhood.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                asChild
                className="bg-brand-red hover:bg-red-800 text-lg font-bold h-14 px-8 shadow-lg"
              >
                <Link to="/screenings">
                  <MapPin className="mr-2 h-5 w-5" />
                  Find a Free Screening
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="border-2 border-white text-white hover:bg-white hover:text-brand-dark bg-transparent text-lg font-bold h-14 px-8 shadow-lg"
              >
                <Link to="/quiz">
                  <Activity className="mr-2 h-5 w-5" />
                  Take the Risk Quiz
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Info Cards */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Card 1 */}
            <Card className="border-t-4 border-t-brand-red shadow-xs hover:shadow-md transition">
              <CardContent className="p-8">
                <div className="h-12 w-12 bg-red-50 rounded-full flex items-center justify-center mb-6">
                  <Activity className="h-6 w-6 text-brand-red" />
                </div>
                <h2 className="text-2xl font-bold text-brand-dark mb-4 font-serif">What is PAD?</h2>
                <p className="text-slate-600 text-lg mb-6 leading-relaxed">
                  Peripheral Artery Disease (PAD) is when leg arteries get blocked. It causes pain
                  when walking and can lead to serious foot problems.
                </p>
                <Button variant="link" asChild className="text-brand-red font-bold p-0 text-base">
                  <Link to="/learn" className="flex items-center">
                    Learn the signs <ArrowRight className="ml-1 h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>

            {/* Card 2 */}
            <Card className="border-t-4 border-t-brand-red shadow-xs hover:shadow-md transition">
              <CardContent className="p-8">
                <div className="h-12 w-12 bg-red-50 rounded-full flex items-center justify-center mb-6">
                  <CalendarCheck className="h-6 w-6 text-brand-red" />
                </div>
                <h2 className="text-2xl font-bold text-brand-dark mb-4 font-serif">
                  Pop-up Clinics
                </h2>
                <p className="text-slate-600 text-lg mb-6 leading-relaxed">
                  We come to you. Free screenings at barbershops, churches, and community centers.
                  No insurance needed.
                </p>
                <Button variant="link" asChild className="text-brand-red font-bold p-0 text-base">
                  <Link to="/screenings" className="flex items-center">
                    See upcoming events <ArrowRight className="ml-1 h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>

            {/* Card 3 */}
            <Card className="border-t-4 border-t-slate-600 shadow-xs hover:shadow-md transition">
              <CardContent className="p-8">
                <div className="h-12 w-12 bg-slate-100 rounded-full flex items-center justify-center mb-6">
                  <MapPin className="h-6 w-6 text-slate-800" />
                </div>
                <h2 className="text-2xl font-bold text-brand-dark mb-4 font-serif">For Students</h2>
                <p className="text-slate-600 text-lg mb-6 leading-relaxed">
                  Medical students can gain clinical hours and mentorship. Join our volunteer
                  network today.
                </p>
                <Button variant="link" asChild className="text-brand-dark font-bold p-0 text-base">
                  <Link to="/volunteer" className="flex items-center">
                    Join the team <ArrowRight className="ml-1 h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Visual Break / Image Section */}
      <section className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-brand-dark rounded-xl overflow-hidden shadow-2xl flex flex-col md:flex-row">
            <div className="md:w-1/2 p-12 flex flex-col justify-center">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-6 font-serif">
                Why Early Screening Matters
              </h2>
              <p className="text-slate-300 text-lg mb-8 leading-relaxed">
                Most people don't know they have a blockage until it's severe. A simple 10-minute
                check can save your mobility and independence.
              </p>
              <Button
                asChild
                className="bg-brand-red hover:bg-red-800 text-white font-bold h-12 px-6 self-start"
              >
                <Link to="/quiz">Check Your Risk Score</Link>
              </Button>
            </div>
            <div className="md:w-1/2 bg-slate-200 h-64 md:h-auto relative">
              <img
                src="/screening.png"
                alt="Doctor checking pulse"
                className="absolute inset-0 w-full h-full object-cover opacity-80"
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
