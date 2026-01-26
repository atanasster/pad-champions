import React from 'react';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';

const About: React.FC = () => {
  return (
    <div className="bg-white min-h-screen py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl md:text-5xl font-bold text-brand-dark mb-8 font-serif">
          About CHAMPIONS
        </h1>

        <div className="prose prose-lg text-slate-700 max-w-none">
          <p className="lead text-xl leading-relaxed text-slate-600 font-light mb-8">
            The{' '}
            <strong className="font-semibold text-brand-dark">
              Comprehensive Heart and Limb Multidisciplinary Limb Preservation Networks (CHAMPIONS)
            </strong>{' '}
            is a community-based initiative dedicated to reducing preventable amputations in
            underserved communities.
          </p>

          <div className="my-10 bg-blue-50 border-l-4 border-blue-600 p-8 rounded-r-lg">
            <h3 className="text-xl font-bold text-blue-900 mb-2 font-serif">
              Important Distinction
            </h3>
            <p className="text-blue-800 mb-0">
              We are a <strong>health screening and education program</strong>. We are NOT the
              "CHAMPION Trial" associated with the CardioMEMS heart failure device or other
              pharmaceutical clinical trials. Our goal is to connect you with existing care, not to
              recruit you for experimental studies.
            </p>
          </div>

          <h2 className="text-3xl font-bold text-brand-dark mt-12 mb-6 font-serif">Our Mission</h2>
          <p className="mb-4">
            Peripheral Artery Disease (PAD) disproportionately affects African American and Latino
            communities, often leading to unnecessary amputations due to late diagnosis. We believe
            that zip code should not determine health outcomes.
          </p>
          <p className="mb-8">
            By bringing screenings directly to trusted community spaces—barbershops, churches, and
            community centers—we remove barriers to care like transportation and insurance
            requirements.
          </p>

          <h2 className="text-3xl font-bold text-brand-dark mt-12 mb-6 font-serif">
            Founder's Message
          </h2>
          <Card className="mt-6 bg-slate-50 border-none shadow-xs">
            <CardContent className="p-8 flex flex-col md:flex-row gap-8 items-start">
              <img
                src="https://picsum.photos/id/1005/200/200"
                alt="Dr. O'Banion Placeholder"
                className="w-32 h-32 rounded-full object-cover shadow-lg border-4 border-white"
              />
              <div>
                <blockquote className="italic text-slate-600 text-lg mb-4">
                  "We cannot afford to wait for patients to come to the hospital. Preventing limb
                  loss and disability means stepping into the spaces people live, where they feel
                  seen and safe, listening to their stories, and acting before it's too late."
                </blockquote>
                <p className="font-bold text-brand-dark font-serif text-lg">
                  — Dr. O'Banion, Founder
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mt-16 pt-10 border-t border-slate-200 text-center">
          <p className="mb-6 text-xl text-brand-dark font-serif font-bold">
            Interested in supporting our work?
          </p>
          <Button className="bg-brand-dark hover:bg-slate-800 text-white font-bold h-14 px-10 text-lg shadow-lg">
            Donate to the Foundation
          </Button>
        </div>
      </div>
    </div>
  );
};

export default About;
