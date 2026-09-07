import React, { useState } from 'react';
import { AnimatePresence } from 'framer-motion';

import { Footer } from './components/Footer';
import { SoundToggle } from './components/SoundToggle';
import { InteractiveBackground } from './components/InteractiveBackground';
import { Screen1Proposal } from './components/Screen1Proposal';
import { Screen2Shock } from './components/Screen2Shock';
import { Screen3Schedule } from './components/Screen3Schedule';
import { Screen4Food } from './components/Screen4Food';
import { Screen5Confirmation } from './components/Screen5Confirmation';
import { Screen6Paywall } from './components/Screen6Paywall';

export default function App() {
  const [step, setStep] = useState(1);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [selectedFood, setSelectedFood] = useState(null);

  // Navigation helpers
  const nextStep = () => setStep((prev) => Math.min(prev + 1, 6));
  const prevStep = () => setStep((prev) => Math.max(prev - 1, 1));
  const restart = () => {
    setSelectedDate('');
    setSelectedTime('');
    setSelectedFood(null);
    setStep(1);
  };

  const handleSaveSchedule = (date, time) => {
    setSelectedDate(date);
    setSelectedTime(time);
    nextStep();
  };

  const handleSelectFood = (foodOption) => {
    setSelectedFood(foodOption);
    nextStep();
  };

  return (
    <div className="min-h-screen bg-blush-gradient flex flex-col justify-between items-center py-8 px-4 relative overflow-hidden select-none">
      {/* Sound Toggle Control */}
      <SoundToggle />

      {/* Ambient background particles & click bursts */}
      <InteractiveBackground />

      {/* Header step progress bar (subtle) */}
      <div className="w-full max-w-xs mx-auto mb-4 flex items-center justify-center gap-1.5 opacity-60">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              i === step
                ? 'w-6 bg-rose-500'
                : i < step
                ? 'w-2 bg-pink-400'
                : 'w-2 bg-pink-200/80'
            }`}
          />
        ))}
      </div>

      {/* Main Screen Container */}
      <main className="w-full flex-1 flex items-center justify-center relative my-auto">
        <AnimatePresence mode="wait">
          {step === 1 && (
            <Screen1Proposal key="step1" onNext={nextStep} />
          )}

          {step === 2 && (
            <Screen2Shock key="step2" onNext={nextStep} />
          )}

          {step === 3 && (
            <Screen3Schedule
              key="step3"
              selectedDate={selectedDate}
              selectedTime={selectedTime}
              onSaveSchedule={handleSaveSchedule}
            />
          )}

          {step === 4 && (
            <Screen4Food
              key="step4"
              selectedFood={selectedFood}
              onSelectFood={handleSelectFood}
            />
          )}

          {step === 5 && (
            <Screen5Confirmation
              key="step5"
              selectedTime={selectedTime}
              onNext={nextStep}
            />
          )}

          {step === 6 && (
            <Screen6Paywall
              key="step6"
              selectedDate={selectedDate}
              selectedTime={selectedTime}
              selectedFood={selectedFood}
              onGoBack={prevStep}
              onRestart={restart}
            />
          )}
        </AnimatePresence>
      </main>

      {/* Permanent Footer on every screen */}
      <Footer />
    </div>
  );
}
