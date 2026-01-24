import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Activity } from 'lucide-react';
import { Button } from '../components/ui/button';

const HomePage: React.FC = () => {
  return (
    <div className="flex flex-col bg-white min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-brand-dark text-white py-20 md:py-32 px-4 overflow-hidden">
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

      {/* Top Header Section - Matching Flyer Header */}
      <section className="pt-12 pb-8 px-4 text-center max-w-5xl mx-auto">
        {/* Logo and Title */}
        <div className="flex flex-col items-center mb-8">
          <img src="/img/logo-2.png" alt="CHAMPIONS Logo" className="h-24 w-auto mb-6" />
          <h1 className="text-4xl md:text-5xl font-bold text-brand-dark tracking-tight font-serif uppercase text-center">
            CHAMPIONS
            <br />
            <span className="text-brand-red">PAD Screening</span>
          </h1>
        </div>

        {/* Mission Statement */}
        <p className="text-lg md:text-xl text-slate-600 font-serif italic max-w-3xl mx-auto leading-relaxed">
          The Comprehensive Heart and Multidisciplinary Limb Preservation Outreach Networks
          (CHAMPIONS) is a vascular health initiative that provides free screenings to the public.
        </p>
      </section>

      {/* WHAT IS PAD? Section - Dark Blue Bar */}
      <section className="py-8 px-4 w-full">
        <div className="max-w-5xl mx-auto">
          {/* Section Header */}
          <div className="bg-brand-dark text-white py-3 px-8 rounded-full text-center shadow-md mb-8 max-w-3xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold uppercase tracking-wide">What is PAD?</h2>
          </div>

          <div className="flex flex-col md:flex-row items-center gap-12 px-4 md:px-12">
            <div className="md:w-1/2">
              <p className="text-slate-800 text-lg leading-relaxed mb-6 font-medium">
                Peripheral Artery Disease (PAD) is a chronic disease in which plaque builds up in
                the arteries of the legs. This plaque narrows the arteries, limiting the supply of
                oxygen and nutrients to the legs.
              </p>
              <p className="text-slate-800 text-lg leading-relaxed mb-6">
                Limited blood flow to the legs can result in muscle fatigue or cramping during daily
                activity, such as walking.
              </p>
              <div className="bg-red-50 border-l-4 border-brand-red p-4 italic text-slate-700">
                If left untreated, PAD can lead to limb amputation and increase the risk of heart
                attack or stroke.
              </div>
            </div>

            {/* Visual representation - existing image reused or placeholder for 'leg arteries' */}
            <div className="md:w-1/2 flex justify-center">
              <div className="relative w-64 h-64 bg-slate-100 rounded-full flex items-center justify-center p-4 shadow-inner">
                {/* Using standard icons to represent the diagram if image not available */}
                <img
                  src="/screening.png"
                  className="w-full h-full object-cover rounded-full opacity-90"
                  alt="Leg Arteries Illustration"
                />
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <span className="bg-white/80 px-2 py-1 rounded text-xs font-bold text-slate-500 backdrop-blur-sm">
                    Artery Visualization
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* WHO SHOULD BE SCREENED? Section - Red Bar */}
      <section className="py-12 px-4 w-full">
        <div className="max-w-5xl mx-auto">
          {/* Section Header */}
          <div className="bg-brand-red text-white py-3 px-8 rounded-full text-center shadow-md mb-12 max-w-4xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold uppercase tracking-wide">
              Who Should Be Screened For PAD?
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
            {/* Left Column: Assessment Values */}
            <div className="bg-white border-2 border-slate-200 rounded-2xl p-6 md:p-8 shadow-sm h-full flex flex-col">
              <div className="mb-4 pb-4 border-b border-slate-100">
                <h3 className="text-xl font-bold text-slate-800">
                  Anyone with assessment values as follows:
                </h3>
              </div>
              <ul className="space-y-3 flex-grow">
                {[
                  'Total cholesterol over 240 mg/dL',
                  'Triglycerides over 200 mg/dL',
                  'LDL over 160 mg/dL',
                  'Systolic blood pressure over 140 mmHg',
                  'Diastolic blood pressure over 90 mmHg',
                  'HbA1c (%) over 5.7%',
                  'Fasting glucose level over 100 mg/dL',
                ].map((item, index) => (
                  <li key={index} className="flex items-start">
                    <div className="h-2 w-2 rounded-full bg-slate-400 mt-2 mr-3 shrink-0" />
                    <span className="text-slate-700 font-medium">{item}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-center">
                <div className="flex flex-col items-center text-center">
                  <img
                    src="/img/logo.png"
                    className="h-16 w-auto mb-2 opacity-80"
                    alt="CHAMPIONS Small"
                  />
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">
                    Scientific Standards
                  </p>
                </div>
              </div>
            </div>

            {/* Right Column: Age Groups */}
            <div className="flex flex-col gap-6">
              {/* Age Group 1 */}
              <div className="border-2 border-slate-200 rounded-xl p-5 hover:border-brand-red transition-colors bg-white">
                <div className="inline-block bg-slate-100 text-slate-800 px-3 py-1 rounded-md text-sm font-bold border border-slate-300 mb-3">
                  Over 65 years old
                </div>
                <p className="text-slate-700 font-medium">Recommended for all individuals.</p>
              </div>

              {/* Age Group 2 */}
              <div className="border-2 border-slate-200 rounded-xl p-5 hover:border-brand-red transition-colors bg-white">
                <div className="inline-block bg-slate-100 text-slate-800 px-3 py-1 rounded-md text-sm font-bold border border-slate-300 mb-3">
                  55 to 65 years old
                </div>
                <p className="text-slate-700 font-medium mb-2">
                  With a history of any other following:
                </p>
                <p className="text-slate-500 text-sm leading-relaxed">
                  Smoking, diabetes, hypertension, kidney disease, blood clot in the legs,
                  amputation, heart attack, stroke, aortic aneurysm, pain or cramping while walking,
                  OR a family history of: aortic aneurysm, blood clot in legs or lungs, amputation,
                  heart attack, stroke.
                </p>
              </div>

              {/* Age Group 3 */}
              <div className="border-2 border-slate-200 rounded-xl p-5 hover:border-brand-red transition-colors bg-white">
                <div className="inline-block bg-slate-100 text-slate-800 px-3 py-1 rounded-md text-sm font-bold border border-slate-300 mb-3">
                  18 to 55 years old
                </div>
                <p className="text-slate-700 font-medium mb-2">
                  With a history of <span className="text-brand-red font-bold">diabetes AND</span> a
                  history any other following:
                </p>
                <p className="text-slate-500 text-sm leading-relaxed">
                  Smoking, hypertension, kidney disease, blood clot in the legs, heart attack,
                  stroke, aortic aneurysm, pain or cramping while walking, OR a family history of:
                  aortic aneurysm, blood clot in legs or lungs, amputation, heart attack, stroke.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action - Bottom */}
      <section className="bg-slate-50 py-16 border-t border-slate-200 mt-8">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-brand-dark mb-6">Ready to get checked?</h2>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button
              asChild
              className="bg-brand-red hover:bg-red-800 text-lg font-bold h-14 px-8 shadow-lg"
            >
              <Link to="/screenings">
                <MapPin className="mr-2 h-5 w-5" />
                Find a Screening Near You
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="border-2 border-brand-dark text-brand-dark hover:bg-brand-dark hover:text-white bg-transparent text-lg font-bold h-14 px-8"
            >
              <Link to="/quiz">
                <Activity className="mr-2 h-5 w-5" />
                Take the Digital Quiz
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
