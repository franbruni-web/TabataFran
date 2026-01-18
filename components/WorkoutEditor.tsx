
import React, { useState, useMemo } from 'react';
import { Workout, Period, PeriodType } from '../types';
import { TrashIcon, PlusIcon, XIcon, ClockIcon } from './Icons';

interface Props {
  workout: Workout;
  availableExercises: string[];
  onSave: (workout: Workout) => void;
  onCancel: () => void;
}

const WorkoutEditor: React.FC<Props> = ({ workout, availableExercises, onSave, onCancel }) => {
  const [edited, setEdited] = useState<Workout>({ ...workout });
  const [showPresets, setShowPresets] = useState<{ active: boolean, index: number | null }>({ active: false, index: null });
  const [searchTerm, setSearchTerm] = useState('');

  const addPeriod = () => {
    const newPeriod: Period = {
      id: Math.random().toString(36).substr(2, 9),
      name: '',
      type: PeriodType.EXERCISE,
      duration: 30
    };
    setEdited(prev => ({ ...prev, periods: [...prev.periods, newPeriod] }));
  };

  const removePeriod = (id: string) => {
    setEdited(prev => ({ ...prev, periods: prev.periods.filter(p => p.id !== id) }));
  };

  const updatePeriod = (id: string, updates: Partial<Period>) => {
    setEdited(prev => ({
      ...prev,
      periods: prev.periods.map(p => p.id === id ? { ...p, ...updates } : p)
    }));
  };

  const selectPreset = (name: string) => {
    if (showPresets.index !== null) {
      const periodId = edited.periods[showPresets.index].id;
      updatePeriod(periodId, { name });
    }
    setShowPresets({ active: false, index: null });
    setSearchTerm('');
  };

  const filteredPresets = useMemo(() => {
    return availableExercises.filter(ex => 
      ex.toLowerCase().includes(searchTerm.toLowerCase())
    ).sort((a, b) => a.localeCompare(b));
  }, [searchTerm, availableExercises]);

  return (
    <div className="fixed inset-0 z-[100] flex flex-col bg-[#002244] overflow-hidden">
      <header className="p-4 border-b border-[#FFC107]/30 flex justify-between items-center bg-[#00358E]">
        <h2 className="text-xl font-bold text-[#FFC107]">Configurar Rutina</h2>
        <button onClick={onCancel} className="p-2 text-white/70 active:scale-90">
          <XIcon className="w-6 h-6" />
        </button>
      </header>

      <div className="flex-1 overflow-y-auto p-4 space-y-6 scrollable-content pb-24">
        <div className="space-y-4">
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-[#FFC107] uppercase ml-1">Nombre de la Rutina</label>
            <input 
              value={edited.name}
              onChange={e => setEdited({ ...edited, name: e.target.value })}
              className="w-full bg-blue-900/50 border border-[#FFC107]/20 rounded-xl px-4 py-3 text-white placeholder-white/30 outline-none focus:border-[#FFC107]"
              placeholder="Ej. Tabata Piernas"
            />
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex justify-between items-center px-1">
            <h3 className="text-lg font-bold text-[#FFC107]">Etapas</h3>
            <button onClick={addPeriod} className="flex items-center gap-1 text-emerald-400 font-black text-sm active:scale-90">
              <PlusIcon className="w-4 h-4" /> AÑADIR ETAPA
            </button>
          </div>

          <div className="space-y-4">
            {edited.periods.map((period, index) => (
              <div key={period.id} className="bg-blue-900/30 border border-[#FFC107]/10 p-4 rounded-xl space-y-3 shadow-inner">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-black text-white/30 tracking-widest">ROUND #{index + 1}</span>
                  <button onClick={() => removePeriod(period.id)} className="text-red-400 p-1 active:scale-75">
                    <TrashIcon className="w-5 h-5" />
                  </button>
                </div>
                
                <div className="flex gap-2">
                  <input 
                    value={period.name}
                    onChange={e => updatePeriod(period.id, { name: e.target.value })}
                    className="flex-1 bg-black/20 border border-white/5 rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-[#FFC107]/30"
                    placeholder="Escribir ejercicio..."
                  />
                  <button 
                    onClick={() => setShowPresets({ active: true, index })}
                    className="bg-[#FFC107]/10 border border-[#FFC107]/30 text-[#FFC107] px-3 py-2 rounded-lg active:bg-[#FFC107] active:text-[#00358E] transition-colors"
                  >
                    <PlusIcon className="w-5 h-5" />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <select 
                    value={period.type}
                    onChange={e => updatePeriod(period.id, { type: e.target.value as PeriodType })}
                    className="bg-black/20 border-none rounded-lg px-3 py-2 text-xs text-white outline-none"
                  >
                    {Object.values(PeriodType).map(t => <option key={t} value={t} className="bg-[#002244] font-bold">{t}</option>)}
                  </select>
                  <div className="flex items-center gap-2 bg-black/20 px-3 py-2 rounded-lg">
                    <ClockIcon className="w-4 h-4 text-white/40" />
                    <input 
                      type="number"
                      value={period.duration}
                      onChange={e => updatePeriod(period.id, { duration: parseInt(e.target.value) || 0 })}
                      className="bg-transparent border-none text-white text-sm w-full outline-none font-mono font-bold"
                    />
                    <span className="text-[10px] text-white/40 font-bold uppercase">seg</span>
                  </div>
                </div>
              </div>
            ))}
            {edited.periods.length === 0 && (
              <div className="text-center py-10 text-white/20 italic text-sm">
                No hay etapas definidas. Toca "AÑADIR ETAPA".
              </div>
            )}
          </div>
        </div>
      </div>

      <footer className="p-4 bg-[#00358E] border-t border-[#FFC107]/30 flex gap-3 z-20 shadow-[0_-4px_20px_rgba(0,0,0,0.5)]">
        <button 
          onClick={() => onSave(edited)}
          className="flex-1 bg-[#FFC107] text-[#00358E] font-black py-4 rounded-xl shadow-lg active:scale-95 transition-transform"
        >
          GUARDAR RUTINA
        </button>
      </footer>

      {showPresets.active && (
        <div className="fixed inset-0 z-[110] bg-black/80 backdrop-blur-sm flex items-end">
          <div className="bg-[#002244] w-full rounded-t-3xl max-h-[85vh] flex flex-col p-6 animate-in slide-in-from-bottom duration-300 border-t border-[#FFC107]/50">
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-[#FFC107] font-black text-lg">Elegir Ejercicio</h4>
              <button onClick={() => { setShowPresets({ active: false, index: null }); setSearchTerm(''); }} className="p-2 text-white/50"><XIcon className="w-6 h-6" /></button>
            </div>
            
            <div className="mb-4">
              <input 
                autoFocus
                type="text"
                placeholder="Buscar ejercicio en biblioteca..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-blue-900/50 border border-[#FFC107]/20 rounded-xl px-4 py-3 text-white outline-none focus:border-[#FFC107]"
              />
            </div>

            <div className="flex-1 overflow-y-auto scrollable-content pb-10">
              <div className="grid grid-cols-2 gap-3">
                {filteredPresets.map(name => (
                  <button 
                    key={name}
                    onClick={() => selectPreset(name)}
                    className="bg-blue-900/50 hover:bg-[#FFC107] hover:text-[#00358E] p-4 rounded-xl text-white text-sm text-left border border-white/5 active:scale-95 transition-all font-bold"
                  >
                    {name}
                  </button>
                ))}
                {filteredPresets.length === 0 && (
                  <div className="col-span-2 py-10 text-center text-white/30">
                    No se encontraron resultados para "{searchTerm}"
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkoutEditor;
