
import React, { useState, useEffect } from 'react';
import { Workout, PeriodType } from './types';
import { INITIAL_WORKOUTS, PRESET_EXERCISES } from './constants';
import WorkoutEditor from './components/WorkoutEditor';
import TimerView from './components/TimerView';
import WorkoutCard from './components/WorkoutCard';
import { PlusIcon } from './components/Icons';

const App: React.FC = () => {
  const [workouts, setWorkouts] = useState<Workout[]>(() => {
    const saved = localStorage.getItem('tabata-fran-workouts-v3');
    if (saved === null) return INITIAL_WORKOUTS;
    try {
      const parsed = JSON.parse(saved);
      // Si el array está vacío pero el usuario nunca lo borró explícitamente, devolvemos vacío
      // Si parsed no es un array, devolvemos INITIAL_WORKOUTS
      return Array.isArray(parsed) ? parsed : INITIAL_WORKOUTS;
    } catch (e) {
      return INITIAL_WORKOUTS;
    }
  });

  const [customExercises, setCustomExercises] = useState<string[]>(() => {
    const saved = localStorage.getItem('tabata-fran-custom-ex-v3');
    return saved ? JSON.parse(saved) : [];
  });

  const [activeWorkout, setActiveWorkout] = useState<Workout | null>(null);
  const [isEditing, setIsEditing] = useState<Workout | null>(null);

  useEffect(() => {
    localStorage.setItem('tabata-fran-workouts-v3', JSON.stringify(workouts));
  }, [workouts]);

  useEffect(() => {
    localStorage.setItem('tabata-fran-custom-ex-v3', JSON.stringify(customExercises));
  }, [customExercises]);

  const handleSaveWorkout = (workout: Workout) => {
    const newExNames = workout.periods
      .map(p => p.name.trim())
      .filter(name => 
        name.length > 0 && 
        !PRESET_EXERCISES.some(ex => ex.toLowerCase() === name.toLowerCase()) &&
        !customExercises.some(ex => ex.toLowerCase() === name.toLowerCase())
      );

    if (newExNames.length > 0) {
      setCustomExercises(prev => [...prev, ...Array.from(new Set(newExNames))]);
    }

    setWorkouts(prev => {
      const index = prev.findIndex(w => w.id === workout.id);
      if (index !== -1) {
        const next = [...prev];
        next[index] = workout;
        return next;
      }
      return [...prev, workout];
    });
    setIsEditing(null);
  };

  const handleDeleteWorkout = (id: string) => {
    setWorkouts(prev => prev.filter(w => w.id !== id));
  };

  if (activeWorkout) {
    return <TimerView workout={activeWorkout} onBack={() => setActiveWorkout(null)} />;
  }

  const allExercises = Array.from(new Set([...PRESET_EXERCISES, ...customExercises]));

  return (
    <div className="h-[100dvh] flex flex-col bg-[#00358E] safe-pt safe-pb">
      <header className="px-6 py-4 flex justify-between items-center bg-[#00358E] z-10 border-b border-[#FFC107]/40 shadow-xl">
        <div>
          <h1 className="text-3xl font-extrabold text-[#FFC107] tracking-tighter">
            TABATAFRAN
          </h1>
          <p className="text-white/70 text-[10px] font-bold uppercase tracking-widest">Gimnasio Virtual CABJ</p>
        </div>
        <button 
          onClick={() => setIsEditing({ id: Date.now().toString(), name: '', periods: [] })}
          className="bg-[#FFC107] text-[#00358E] p-3 rounded-full shadow-lg active:scale-90 transition-transform"
        >
          <PlusIcon className="w-6 h-6" />
        </button>
      </header>

      <main className="flex-1 overflow-y-auto p-4 space-y-4 pb-20 scrollable-content">
        {workouts.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-10">
            <div className="text-6xl mb-4 opacity-20">🏃‍♂️</div>
            <p className="text-white/40 font-bold uppercase tracking-widest text-xs">No hay rutinas guardadas</p>
            <button 
              onClick={() => setIsEditing({ id: Date.now().toString(), name: '', periods: [] })}
              className="mt-4 text-[#FFC107] border border-[#FFC107]/30 px-6 py-2 rounded-full font-bold text-sm"
            >
              CREAR PRIMERA RUTINA
            </button>
          </div>
        ) : (
          workouts.map(workout => (
            <WorkoutCard 
              key={workout.id} 
              workout={workout} 
              onStart={() => setActiveWorkout(workout)}
              onEdit={() => setIsEditing(workout)}
              onDelete={() => handleDeleteWorkout(workout.id)}
            />
          ))
        )}
      </main>

      {isEditing && (
        <WorkoutEditor 
          workout={isEditing} 
          availableExercises={allExercises}
          onSave={handleSaveWorkout} 
          onCancel={() => setIsEditing(null)} 
        />
      )}
    </div>
  );
};

export default App;
