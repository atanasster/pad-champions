import React, { useState } from 'react';
import { Lock, User, Calendar, BookOpen } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Select } from '../components/ui/select';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';

const Volunteer: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'info' | 'login'>('info');

  return (
    <div className="min-h-screen bg-slate-50 py-10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Toggle Tabs */}
        <div className="flex justify-center mb-10">
          <div className="bg-white p-1.5 rounded-lg shadow-sm border border-slate-200 inline-flex gap-1">
            <Button
              variant={activeTab === 'info' ? 'default' : 'ghost'}
              onClick={() => setActiveTab('info')}
              className={activeTab === 'info' ? 'bg-brand-red hover:bg-red-800' : 'text-slate-600'}
            >
              For Volunteers
            </Button>
            <Button
              variant={activeTab === 'login' ? 'default' : 'ghost'}
              onClick={() => setActiveTab('login')}
              className={activeTab === 'login' ? 'bg-brand-red hover:bg-red-800' : 'text-slate-600'}
            >
              <Lock className="w-4 h-4 mr-2" />
              Volunteer Login
            </Button>
          </div>
        </div>

        {activeTab === 'info' ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            <div>
              <h1 className="text-4xl font-bold text-brand-dark mb-6 font-serif">Join the CHAMPIONS Network</h1>
              <p className="text-lg text-slate-700 mb-8 leading-relaxed">
                Medical students and health professionals: Help us save limbs in your community.
              </p>
              
              <div className="space-y-6">
                <Card className="border-none shadow-none bg-transparent">
                    <CardContent className="p-0 flex">
                        <div className="flex-shrink-0">
                            <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                            <User className="h-6 w-6 text-blue-700" />
                            </div>
                        </div>
                        <div className="ml-4">
                            <h3 className="text-xl font-bold text-brand-dark mb-1">Clinical Experience</h3>
                            <p className="text-slate-600">Gain hands-on experience performing ABI tests and patient histories under vascular surgeon supervision.</p>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-none shadow-none bg-transparent">
                    <CardContent className="p-0 flex">
                        <div className="flex-shrink-0">
                            <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                            <BookOpen className="h-6 w-6 text-green-700" />
                            </div>
                        </div>
                        <div className="ml-4">
                            <h3 className="text-xl font-bold text-brand-dark mb-1">Training Provided</h3>
                            <p className="text-slate-600">Access our digital library of protocols, Doppler usage guides, and patient education scripts.</p>
                        </div>
                    </CardContent>
                </Card>
                
                <Card className="border-none shadow-none bg-transparent">
                    <CardContent className="p-0 flex">
                        <div className="flex-shrink-0">
                            <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
                            <Calendar className="h-6 w-6 text-purple-700" />
                            </div>
                        </div>
                        <div className="ml-4">
                            <h3 className="text-xl font-bold text-brand-dark mb-1">Flexible Shifts</h3>
                            <p className="text-slate-600">Sign up for 4-hour shifts at pop-up clinics that fit your rotation schedule.</p>
                        </div>
                    </CardContent>
                </Card>
              </div>

              <Card className="mt-10 bg-slate-100 border-slate-200">
                <CardContent className="p-6">
                    <h4 className="font-bold text-brand-dark mb-2">Community Partners</h4>
                    <p className="text-slate-600 text-sm mb-4">Are you a barbershop, church, or community center looking to host an event?</p>
                    <Button variant="link" className="text-brand-red font-bold px-0 underline">Request Host Information Packet</Button>
                </CardContent>
              </Card>
            </div>

            {/* Registration Form Mockup */}
            <Card className="shadow-lg border-t-4 border-t-brand-red">
                <CardHeader>
                    <CardTitle>New Volunteer Registration</CardTitle>
                </CardHeader>
                <CardContent>
                  <form className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700">First Name</label>
                        <Input type="text" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700">Last Name</label>
                        <Input type="text" />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700">Email (Use .edu if student)</label>
                      <Input type="email" />
                    </div>

                    <div className="space-y-2">
                       <label className="text-sm font-medium text-slate-700">Affiliation / Medical School</label>
                       <Select>
                         <option>Select Institution...</option>
                         <option>UCSF School of Medicine</option>
                         <option>Stanford Medicine</option>
                         <option>UC Davis</option>
                         <option>Other / Community Physician</option>
                       </Select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700">Role</label>
                       <Select>
                         <option>Medical Student (Year 1-2)</option>
                         <option>Medical Student (Year 3-4)</option>
                         <option>Resident/Fellow</option>
                         <option>Attending Physician</option>
                         <option>Nurse / NP / PA</option>
                       </Select>
                    </div>

                    <Button type="button" className="w-full bg-brand-red hover:bg-red-800 font-bold py-6 text-lg mt-4">
                      Submit Application
                    </Button>
                    <p className="text-xs text-slate-500 text-center mt-2">
                      Applications are reviewed within 48 hours.
                    </p>
                  </form>
                </CardContent>
            </Card>
          </div>
        ) : (
          <div className="max-w-md mx-auto">
             <Card className="shadow-lg">
               <CardContent className="p-8">
                   <div className="text-center mb-6">
                     <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-slate-100 mb-4">
                        <Lock className="h-10 w-10 text-slate-400" />
                     </div>
                     <h2 className="text-2xl font-bold text-brand-dark">Volunteer Portal</h2>
                   </div>
                   <form className="space-y-4">
                     <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700">Email</label>
                        <Input type="email" />
                     </div>
                     <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700">Password</label>
                        <Input type="password" />
                     </div>
                     <Button type="button" className="w-full bg-brand-dark hover:bg-slate-800 font-bold py-6">
                       Log In
                     </Button>
                     <div className="text-center mt-4">
                        <Button variant="link" onClick={() => setActiveTab('info')} className="text-sm text-brand-red h-auto p-0">
                          Need an account? Register here.
                        </Button>
                     </div>
                   </form>
               </CardContent>
             </Card>
          </div>
        )}

      </div>
    </div>
  );
};

export default Volunteer;