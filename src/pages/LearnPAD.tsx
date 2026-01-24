import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Activity, AlertTriangle, Search, ChevronRight } from 'lucide-react';
import InteractivePADExplorer from '../components/InteractivePADExplorer';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';

const LearnPAD: React.FC = () => {
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="bg-white min-h-screen">
      {/* Breadcrumb / Top Bar */}
      <div className="bg-slate-100 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
            <p className="text-sm text-slate-500">
                <Link to="/" className="hover:text-brand-red">Home</Link>
                <span className="mx-2">/</span>
                <span className="text-brand-dark font-semibold">Peripheral Artery Disease</span>
            </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* Main Content Article */}
          <div className="lg:col-span-8">
            <h1 className="text-4xl md:text-5xl font-bold text-brand-dark mb-6 font-serif">
              Peripheral Artery Disease (PAD)
            </h1>
            <p className="text-xl text-slate-600 leading-relaxed mb-8">
              Peripheral artery disease (PAD) is a common condition where narrowed arteries reduce blood flow to the limbs. It typically affects the legs, causing pain when walking (claudication).
            </p>

            {/* Quick Summary Box */}
            <div className="bg-blue-50 border-l-4 border-blue-600 p-6 mb-12 rounded-r-lg">
                <h3 className="text-blue-900 font-bold text-lg mb-2 font-serif">Key Takeaways</h3>
                <ul className="space-y-2 text-blue-800">
                    <li className="flex items-start">
                        <span className="mr-2">•</span>
                        PAD is often caused by a buildup of fatty deposits in the arteries (atherosclerosis).
                    </li>
                    <li className="flex items-start">
                         <span className="mr-2">•</span>
                         Common symptoms include leg pain when walking that goes away with rest.
                    </li>
                     <li className="flex items-start">
                         <span className="mr-2">•</span>
                         Early detection can prevent serious complications like amputation.
                    </li>
                </ul>
            </div>

            {/* Section 1: Overview */}
            <div id="overview" className="mb-12 scroll-mt-24">
                <h2 className="text-3xl font-bold text-brand-dark mb-4 border-b pb-2 font-serif">Overview</h2>
                <p className="text-slate-700 mb-4 leading-7">
                    Just as your heart arteries can get clogged, the arteries in your legs can too. This condition is called Peripheral Artery Disease (PAD). It occurs when plaque (fat and cholesterol) builds up in the arteries that supply blood to your limbs.
                </p>
                <p className="text-slate-700 mb-6 leading-7">
                    Over time, this plaque can harden and narrow your arteries. This limits the flow of oxygen-rich blood to your organs and other parts of your body.
                </p>

                {/* Interactive Visual Component */}
                <InteractivePADExplorer />
                
            </div>

            {/* Section 2: Symptoms */}
            <div id="symptoms" className="mb-12 scroll-mt-24">
                <h2 className="text-3xl font-bold text-brand-dark mb-4 border-b pb-2 font-serif">Symptoms</h2>
                <p className="text-slate-700 mb-4">
                    Many people with mild PAD have no symptoms. However, the most common symptom is muscle pain or cramping in your legs or arms that is triggered by activity, such as walking, but disappears after a few minutes of rest. This is known as <strong>claudication</strong>.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                    <Card>
                        <CardContent className="p-5">
                            <h4 className="font-bold text-brand-red mb-2 flex items-center">
                                <Activity className="w-5 h-5 mr-2" /> Claudication
                            </h4>
                            <p className="text-sm text-slate-600">Painful cramping in your hip, thigh or calf muscles after certain activities, such as walking or climbing stairs.</p>
                        </CardContent>
                    </Card>
                     <Card>
                        <CardContent className="p-5">
                            <h4 className="font-bold text-brand-red mb-2 flex items-center">
                                <AlertTriangle className="w-5 h-5 mr-2" /> Skin Changes
                            </h4>
                            <p className="text-sm text-slate-600">Shiny skin on your legs, hair loss or slower hair growth on your feet and legs.</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-5">
                            <h4 className="font-bold text-brand-red mb-2 flex items-center">
                                <Activity className="w-5 h-5 mr-2" /> Coldness
                            </h4>
                            <p className="text-sm text-slate-600">Coldness in your lower leg or foot, especially when compared with the other side.</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-5">
                            <h4 className="font-bold text-brand-red mb-2 flex items-center">
                                <AlertTriangle className="w-5 h-5 mr-2" /> Non-Healing Sores
                            </h4>
                            <p className="text-sm text-slate-600">Sores on your toes, feet or legs that won't heal or take a very long time to heal.</p>
                        </CardContent>
                    </Card>
                </div>
            </div>

             {/* Section 3: Risk Factors */}
            <div id="risk-factors" className="mb-12 scroll-mt-24">
                <h2 className="text-3xl font-bold text-brand-dark mb-4 border-b pb-2 font-serif">Risk Factors</h2>
                <p className="text-slate-700 mb-4">
                    Factors that increase your risk of developing peripheral artery disease include:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-slate-700 marker:text-brand-red">
                    <li><strong>Smoking:</strong> This is the single biggest risk factor for PAD.</li>
                    <li><strong>Diabetes:</strong> High blood sugar can damage your arteries over time.</li>
                    <li><strong>Age:</strong> Risk increases significantly after age 50.</li>
                    <li><strong>High Blood Pressure:</strong> Increases the force of blood against your artery walls.</li>
                    <li><strong>High Cholesterol:</strong> Contributes to the buildup of plaques.</li>
                </ul>
            </div>

            {/* Section 4: When to see a doctor */}
            <Card id="diagnosis" className="bg-slate-50 border-slate-200">
                <CardContent className="p-8">
                    <h2 className="text-2xl font-bold text-brand-dark mb-4 font-serif">When to see a doctor</h2>
                    <p className="text-slate-700 mb-6">
                        If you have leg pain, numbness or other symptoms, don't dismiss them as a normal part of aging. Call your doctor and ask about PAD.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4">
                        <Button asChild className="bg-brand-red hover:bg-red-800 text-white font-bold">
                            <Link to="/screenings">
                                Find a Screening Event
                            </Link>
                        </Button>
                        <Button asChild variant="outline" className="border-slate-300 text-slate-700 font-bold">
                            <Link to="/quiz">
                                Take Risk Assessment
                            </Link>
                        </Button>
                    </div>
                </CardContent>
            </Card>

          </div>

          {/* Sidebar Navigation */}
          <div className="lg:col-span-4">
            <div className="sticky top-24 space-y-8">
                
                {/* Table of Contents */}
                <Card>
                    <CardContent className="p-6">
                        <h3 className="text-lg font-bold text-brand-dark mb-4 uppercase tracking-wider text-xs">On This Page</h3>
                        <nav className="space-y-1">
                            <Button variant="ghost" onClick={() => scrollToSection('overview')} className="w-full justify-start text-slate-600 h-auto py-2 px-2 hover:text-brand-red hover:underline">Overview</Button>
                            <Button variant="ghost" onClick={() => scrollToSection('symptoms')} className="w-full justify-start text-slate-600 h-auto py-2 px-2 hover:text-brand-red hover:underline">Symptoms</Button>
                            <Button variant="ghost" onClick={() => scrollToSection('risk-factors')} className="w-full justify-start text-slate-600 h-auto py-2 px-2 hover:text-brand-red hover:underline">Risk Factors</Button>
                            <Button variant="ghost" onClick={() => scrollToSection('diagnosis')} className="w-full justify-start text-slate-600 h-auto py-2 px-2 hover:text-brand-red hover:underline">Diagnosis & Prevention</Button>
                        </nav>
                    </CardContent>
                </Card>

                {/* CTA Card */}
                <Card className="bg-brand-dark border-none text-white shadow-lg">
                    <CardContent className="p-6">
                        <h3 className="text-xl font-bold font-serif mb-2">Get Checked Today</h3>
                        <p className="text-slate-300 mb-6 text-sm">
                            Early detection is the best prevention. Find a free screening near you.
                        </p>
                        <Button asChild className="w-full bg-brand-red hover:bg-red-700 font-bold">
                            <Link to="/screenings">
                                Find a Location
                            </Link>
                        </Button>
                        <div className="mt-4 pt-4 border-t border-slate-700 text-center">
                            <Link to="/quiz" className="text-sm text-slate-400 hover:text-white underline">
                                Am I at risk? Take the quiz
                            </Link>
                        </div>
                    </CardContent>
                </Card>

                 {/* Volunteer Teaser */}
                <Card className="bg-slate-50 border-slate-200">
                    <CardContent className="p-6">
                        <h4 className="font-bold text-brand-dark mb-2">For Medical Students</h4>
                        <p className="text-sm text-slate-600 mb-4">
                            Join our network of volunteers to help screen patients in your community.
                        </p>
                        <Button asChild variant="link" className="text-brand-red font-bold text-sm p-0">
                            <Link to="/volunteer" className="flex items-center">
                                Volunteer Information <ChevronRight className="w-4 h-4 ml-1" />
                            </Link>
                        </Button>
                    </CardContent>
                </Card>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default LearnPAD;