
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Workout, PeriodType } from '../types';
import { audioService } from '../services/audioService';
import { PERIOD_CONFIG, getEmojiForExercise } from '../constants';
import { ArrowLeftIcon, PlayIcon, PauseIcon, SkipForwardIcon, RotateCcwIcon, XIcon } from './Icons';

interface Props {
  workout: Workout;
  onBack: () => void;
}

const TimerView: React.FC<Props> = ({ workout, onBack }) => {
  const [index, setIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(workout.periods[0]?.duration || 0);
  const [isActive, setIsActive] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  
  const currentPeriod = workout.periods[index];
  const nextPeriod = workout.periods[index + 1];
  const timerRef = useRef<number | null>(null);

  const completeWorkout = useCallback(() => {
    setIsActive(false);
    setIsFinished(true);
    audioService.playComplete();
  }, []);

  const nextStep = useCallback(() => {
    if (index < workout.periods.length - 1) {
      const nextIdx = index + 1;
      const nextP = workout.periods[nextIdx];
      setIndex(nextIdx);
      setTimeLeft(nextP.duration);
      
      if (nextP.type === PeriodType.REST || nextP.type === PeriodType.COOLDOWN) {
        audioService.playRest();
      } else {
        audioService.playStart();
      }
    } else {
      completeWorkout();
    }
  }, [index, workout.periods, completeWorkout]);

  useEffect(() => {
    if (isActive && timeLeft > 0) {
      timerRef.current = window.setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            nextStep();
            return 0;
          }
          if (prev <= 4) audioService.playTick();
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [isActive, timeLeft, nextStep]);

  const toggleTimer = () => {
    if (!isActive && timeLeft === currentPeriod.duration && index === 0) {
      audioService.playStart();
    }
    setIsActive(!isActive);
  };

  const resetTimer = () => {
    setIsActive(false);
    setIsFinished(false);
    setIndex(0);
    setTimeLeft(workout.periods[0].duration);
  };

  const handleBackClick = () => {
    if (isActive || index > 0 || (workout.periods[0] && timeLeft < workout.periods[0].duration)) {
      setIsActive(false);
      setShowExitConfirm(true);
    } else {
      onBack();
    }
  };

  if (isFinished) {
    return (
      <div className="h-[100dvh] bg-[#002244] flex flex-col items-center justify-center p-8 text-center animate-in zoom-in duration-300 safe-pt safe-pb overflow-hidden">
        <div className="w-32 h-32 bg-[#FFC107] rounded-full flex items-center justify-center mb-8 text-6xl shadow-2xl ring-4 ring-[#FFC107]/20">
          🏆
        </div>
        <h2 className="text-4xl font-black text-[#FFC107] mb-4 tracking-tighter uppercase italic">¡CAMPEÓN!</h2>
        <p className="text-white/80 text-lg mb-10">Rutina <span className="text-[#FFC107] font-bold">{workout.name}</span> completada.</p>
        <div className="flex flex-col w-full gap-4 max-w-xs">
          <button onClick={resetTimer} className="bg-blue-900 text-white font-black py-4 rounded-2xl border border-[#FFC107]/20 active:scale-95 shadow-lg">REPETIR</button>
          <button onClick={onBack} className="bg-[#FFC107] text-[#00358E] font-black py-4 rounded-2xl active:scale-95 shadow-xl">VOLVER</button>
        </div>
      </div>
    );
  }

  const config = PERIOD_CONFIG[currentPeriod.type];
  const exerciseEmoji = getEmojiForExercise(currentPeriod.name, currentPeriod.type);
  const progress = (timeLeft / currentPeriod.duration) * 100;

  return (
    <div className={`h-[100dvh] flex flex-col transition-colors duration-500 bg-[#002244] safe-pt overflow-hidden`}>
      <header className="p-5 flex items-center justify-between z-10">
        <button onClick={handleBackClick} className="p-3 bg-black/30 rounded-full text-white active:scale-90">
          <ArrowLeftIcon className="w-6 h-6" />
        </button>
        <div className="text-center">
          <div className="text-[#FFC107] text-[10px] font-black uppercase tracking-widest">{workout.name}</div>
          <div className="text-white/60 text-xs font-mono mt-0.5 uppercase tracking-tighter">Round {index + 1} / {workout.periods.length}</div>
        </div>
        <div className="w-12"></div>
      </header>

      <main className={`flex-1 flex flex-col items-center justify-center relative transition-all duration-700 ${config.bg}`}>
        <div className="text-center z-10 p-6 w-full">
          <div className="text-9xl mb-6 drop-shadow-[0_5px_15px_rgba(0,0,0,0.5)] animate-bounce">{exerciseEmoji}</div>
          <h3 className="text-3xl font-black text-white mb-2 uppercase tracking-wide px-4 break-words drop-shadow-md">
            {currentPeriod.name || currentPeriod.type}
          </h3>
          <div className="relative inline-block mt-4">
             <div className={`text-[12rem] leading-none font-black tabular-nums transition-all duration-300 ${config.color} drop-shadow-[0_10px_20px_rgba(0,0,0,0.6)]`}>
               {timeLeft}
             </div>
             <div className="absolute -bottom-2 right-0 text-white/30 font-bold text-sm tracking-widest">SEG</div>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 w-full h-3 bg-black/40">
          <div className={`h-full transition-all duration-1000 ease-linear ${config.color.replace('text-', 'bg-')}`} style={{ width: `${progress}%` }}></div>
        </div>
      </main>

      <footer className="p-8 pb-12 safe-pb flex items-center justify-center gap-6 bg-[#001b36] shadow-[0_-10px_30px_rgba(0,0,0,0.5)] z-20">
        <button onClick={resetTimer} className="p-4 bg-white/5 rounded-full text-white active:bg-white/20" title="Reiniciar">
          <RotateCcwIcon className="w-8 h-8" />
        </button>
        
        <button 
          onClick={toggleTimer}
          className={`p-10 rounded-full transition-all transform active:scale-90 shadow-2xl ${isActive ? 'bg-white text-[#00358E]' : 'bg-[#FFC107] text-[#00358E] scale-110 shadow-[#FFC107]/40 ring-4 ring-[#FFC107]/20'}`}
        >
          {isActive ? <PauseIcon className="w-10 h-10" /> : <PlayIcon className="w-12 h-12" />}
        </button>

        <button onClick={() => { audioService.playTick(); nextStep(); }} className="p-4 bg-white/5 rounded-full text-white active:bg-white/20" title="Saltar">
          <SkipForwardIcon className="w-8 h-8" />
        </button>
      </footer>

      {nextPeriod && (
        <div className="absolute bottom-[240px] left-0 w-full flex justify-center px-6 pointer-events-none z-10">
          <div className="bg-black/80 backdrop-blur-xl px-6 py-3 rounded-2xl border border-white/10 text-center shadow-2xl">
            <span className="text-white/40 text-[9px] font-black block uppercase tracking-tighter">SIGUIENTE</span>
            <span className="text-white font-black text-sm uppercase">{nextPeriod.name || nextPeriod.type} · {nextPeriod.duration}s</span>
          </div>
        </div>
      )}

      {showExitConfirm && (
        <div className="fixed inset-0 z-[200] bg-black/95 backdrop-blur-md flex items-center justify-center p-6 animate-in fade-in duration-200">
          <div className="bg-[#002244] border-2 border-[#FFC107] p-8 rounded-3xl w-full max-w-sm text-center shadow-2xl">
            <div className="text-[#FFC107] mb-6 flex justify-center">
               <XIcon className="w-16 h-16" />
            </div>
            <h4 className="text-2xl font-black text-white mb-2 uppercase italic tracking-tighter">¿ABANDONAR?</h4>
            <p className="text-white/60 mb-8 font-medium">Si sales ahora, perderás el progreso.</p>
            <div className="flex flex-col gap-3">
              <button 
                onClick={() => setShowExitConfirm(false)}
                className="bg-white text-[#00358E] font-black py-4 rounded-xl active:scale-95 shadow-lg"
              >
                CONTINUAR
              </button>
              <button 
                onClick={onBack}
                className="bg-red-600 text-white font-black py-4 rounded-xl active:scale-95 shadow-lg"
              >
                SALIR
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TimerView;
