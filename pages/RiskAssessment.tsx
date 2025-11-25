import React, { useState } from 'react';
import { QuizQuestion } from '../types';
import { Link } from 'react-router-dom';
import { AlertCircle, CheckCircle } from 'lucide-react';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';

const QUESTIONS: QuizQuestion[] = [
  { id: 1, text: "Do you smoke or have you smoked in the past?", weight: 2 },
  { id: 2, text: "Do you have diabetes?", weight: 2 },
  { id: 3, text: "Are you over the age of 50?", weight: 1 },
  { id: 4, text: "Do your legs feel tired, heavy, or cramp when you walk?", weight: 3 },
  { id: 5, text: "Do you have high blood pressure or high cholesterol?", weight: 1 },
];

const RiskAssessment: React.FC = () => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);

  const handleAnswer = (isYes: boolean) => {
    if (isYes) {
      setScore(score + QUESTIONS[currentQuestionIndex].weight);
    }

    if (currentQuestionIndex < QUESTIONS.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      setIsCompleted(true);
    }
  };

  const resetQuiz = () => {
    setScore(0);
    setCurrentQuestionIndex(0);
    setIsCompleted(false);
  };

  // High risk threshold
  const isHighRisk = score >= 3;

  return (
    <div className="bg-slate-50 min-h-screen py-10 px-4">
      <div className="max-w-2xl mx-auto">
        <Card className="overflow-hidden shadow-xl border-slate-200">
          <div className="bg-brand-dark p-6">
            <h1 className="text-2xl md:text-3xl font-bold text-white text-center font-serif">
              Am I At Risk?
            </h1>
            <p className="text-slate-300 text-center mt-2">
              Take this 1-minute assessment to see if you should get screened.
            </p>
          </div>

          <CardContent className="p-8">
            {!isCompleted ? (
              <div className="text-center">
                <div className="mb-10">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest bg-slate-100 px-3 py-1 rounded-full">Question {currentQuestionIndex + 1} of {QUESTIONS.length}</span>
                    <h2 className="text-2xl md:text-3xl font-bold text-brand-dark mt-6 leading-relaxed font-serif">
                    {QUESTIONS[currentQuestionIndex].text}
                    </h2>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button
                    onClick={() => handleAnswer(true)}
                    className="w-full sm:w-1/3 h-14 text-xl font-bold bg-brand-red hover:bg-red-800"
                  >
                    Yes
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => handleAnswer(false)}
                    className="w-full sm:w-1/3 h-14 text-xl font-bold"
                  >
                    No
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center animate-in fade-in zoom-in-95 duration-300">
                {isHighRisk ? (
                  <div className="bg-red-50 p-8 rounded-xl border border-red-200 mb-8">
                    <AlertCircle className="h-16 w-16 text-brand-red mx-auto mb-4" />
                    <h2 className="text-3xl font-bold text-brand-red mb-4 font-serif">You May Be At Risk</h2>
                    <p className="text-slate-800 text-lg mb-8 leading-relaxed">
                      Based on your answers, you have factors common in people with leg artery blockages. We strongly recommend getting a free screening.
                    </p>
                    <Button
                      asChild
                      className="w-full sm:w-auto bg-brand-red hover:bg-red-800 text-lg font-bold h-14 px-8"
                    >
                      <Link to="/screenings">
                        Find a Screening Near You
                      </Link>
                    </Button>
                  </div>
                ) : (
                  <div className="bg-green-50 p-8 rounded-xl border border-green-200 mb-8">
                    <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
                    <h2 className="text-3xl font-bold text-green-700 mb-4 font-serif">Low Risk</h2>
                    <p className="text-slate-800 text-lg mb-8 leading-relaxed">
                      Your answers suggest a lower risk, but it's always good to stay informed. Keep your legs healthy by walking daily!
                    </p>
                    <Button
                      asChild
                      className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-lg font-bold h-14 px-8"
                    >
                      <Link to="/learn">
                        Learn More About Leg Health
                      </Link>
                    </Button>
                  </div>
                )}
                
                <Button
                    variant="ghost"
                    onClick={resetQuiz}
                    className="text-slate-500 hover:text-slate-800"
                >
                    Retake Quiz
                </Button>
              </div>
            )}
          </CardContent>
          
          {/* Progress Bar */}
          {!isCompleted && (
              <div className="w-full bg-slate-100 h-2">
                  <div 
                    className="bg-brand-red h-2 transition-all duration-300 ease-out" 
                    style={{width: `${((currentQuestionIndex + 1) / QUESTIONS.length) * 100}%`}}
                  ></div>
              </div>
          )}
        </Card>
        
        <p className="text-center text-slate-500 text-sm mt-8">
            Disclaimer: This tool provides information only and does not constitute medical advice or diagnosis. 
            Always consult with a healthcare professional for medical concerns.
        </p>
      </div>
    </div>
  );
};

export default RiskAssessment;