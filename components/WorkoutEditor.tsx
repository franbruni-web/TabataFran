import React, { useState, useMemo } from 'react';
import { Workout, Period, PeriodType } from '../types';
import { TrashIcon, PlusIcon, XIcon, ClockIcon, RotateCcwIcon, EditIcon } from './Icons';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface Props {
  workout: Workout;
  availableExercises: string[];
  onSave: (workout: Workout) => void;
  onCancel: () => void;
}

const SortablePeriod = ({ period, index, handleOpenEditPeriod, removePeriod }: any) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: period.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 1,
    position: 'relative' as any,
  };

  return (
    <div 
      ref={setNodeRef}
      style={style}
      className={`bg-blue-900/30 border p-4 rounded-xl space-y-3 shadow-inner ${isDragging ? 'opacity-95 scale-[1.02] border-[#FFC107] shadow-2xl ring-2 ring-[#FFC107]/50' : 'border-[#FFC107]/10 transition-transform duration-300'}`}
    >
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <span 
            {...attributes} 
            {...listeners} 
            className="text-white/50 text-xl cursor-grab active:cursor-grabbing px-4 py-2 -ml-2 select-none outline-none" 
            style={{ touchAction: 'none', WebkitTouchCallout: 'none' }}
            title="Arrastrar para reordenar"
          >
            ☰
          </span>
          <span className="text-[10px] font-black text-white/30 tracking-widest">ROUND #{index + 1}</span>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={() => handleOpenEditPeriod(period)} className="text-blue-400 p-2 active:scale-75">
            <EditIcon className="w-5 h-5" />
          </button>
          <button onClick={() => removePeriod(period.id)} className="text-red-400 p-2 active:scale-75">
            <TrashIcon className="w-5 h-5" />
          </button>
        </div>
      </div>
      
      <div className="flex justify-between items-center bg-black/20 p-3 rounded-xl border border-white/5 cursor-default">
        <div>
          <span className="text-[10px] font-bold text-white/50 uppercase block mb-0.5">{period.type}</span>
          <span className="text-sm font-black text-white">{period.name || 'Sin nombre'}</span>
        </div>
        <div className="flex items-center gap-1.5 bg-[#002244] px-3 py-1.5 rounded-lg border border-[#FFC107]/20">
          <ClockIcon className="w-4 h-4 text-[#FFC107]" />
          <span className="text-[#FFC107] font-mono font-bold text-sm">{period.duration}s</span>
        </div>
      </div>
    </div>
  );
};

const WorkoutEditor: React.FC<Props> = ({ workout, availableExercises, onSave, onCancel }) => {
  const [edited, setEdited] = useState<Workout>({ ...workout });
  const [showPresets, setShowPresets] = useState(false);
  const [editingPeriod, setEditingPeriod] = useState<{ active: boolean, isNew: boolean, period: Period | null }>({ active: false, isNew: false, period: null });
  const [showRepeatTool, setShowRepeatTool] = useState(false);
  const [repeatCount, setRepeatCount] = useState(2);
  const [repeatTimes, setRepeatTimes] = useState(7);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  // Validation — save button is disabled unless name is filled and at least one period exists
  const isValid = edited.name.trim().length > 0 && edited.periods.length > 0;

  const handleCancel = () => {
    if (JSON.stringify(edited) !== JSON.stringify(workout)) {
      setShowCancelConfirm(true);
    } else {
      onCancel();
    }
  };

  const totalDuration = edited.periods.reduce((acc, p) => acc + p.duration, 0);
  const totalMin = Math.floor(totalDuration / 60);
  const totalSec = totalDuration % 60;


  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setEdited((prev) => {
        const oldIndex = prev.periods.findIndex((p) => p.id === active.id);
        const newIndex = prev.periods.findIndex((p) => p.id === over.id);
        return { ...prev, periods: arrayMove(prev.periods, oldIndex, newIndex) };
      });
    }
  };

  const handleOpenAddPeriod = () => {
    setEditingPeriod({
      active: true,
      isNew: true,
      period: {
        id: Math.random().toString(36).substr(2, 9),
        name: '',
        type: PeriodType.EXERCISE,
        duration: 40
      }
    });
  };

  const handleOpenEditPeriod = (period: Period) => {
    setEditingPeriod({ active: true, isNew: false, period: { ...period } });
  };

  const handleSavePeriod = () => {
    if (!editingPeriod.period) return;
    if (editingPeriod.isNew) {
      setEdited(prev => ({ ...prev, periods: [...prev.periods, editingPeriod.period!] }));
    } else {
      setEdited(prev => ({
        ...prev,
        periods: prev.periods.map(p => p.id === editingPeriod.period!.id ? editingPeriod.period! : p)
      }));
    }
    setEditingPeriod({ active: false, isNew: false, period: null });
  };

  const removePeriod = (id: string) => {
    setEdited(prev => ({ ...prev, periods: prev.periods.filter(p => p.id !== id) }));
  };

  const handleRepeatBlocks = () => {
    if (edited.periods.length === 0) return;
    const numToCopy = Math.min(repeatCount, edited.periods.length);
    const blocksToCopy = edited.periods.slice(-numToCopy);
    let newPeriods = [...edited.periods];
    for (let i = 0; i < repeatTimes; i++) {
      const cloned = blocksToCopy.map(p => ({
        ...p,
        id: Math.random().toString(36).substr(2, 9)
      }));
      newPeriods = [...newPeriods, ...cloned];
    }
    setEdited(prev => ({ ...prev, periods: newPeriods }));
    setShowRepeatTool(false);
  };

  const handleTypeChangeInForm = (type: PeriodType) => {
    setEditingPeriod(prev => {
      if (!prev.period) return prev;
      let newDuration = prev.period.duration;
      if (type === PeriodType.EXERCISE) newDuration = 40;
      if (type === PeriodType.REST) newDuration = 20;
      return {
        ...prev,
        period: { ...prev.period, type, duration: newDuration }
      };
    });
  };

  const selectPreset = (name: string) => {
    if (editingPeriod.active && editingPeriod.period) {
      setEditingPeriod(prev => ({ ...prev, period: { ...prev.period!, name } }));
    }
    setShowPresets(false);
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
        <button onClick={handleCancel} className="p-2 text-white/70 active:scale-90">
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
              className={`w-full bg-blue-900/50 border rounded-xl px-4 py-3 text-white placeholder-white/30 outline-none transition-colors ${
                edited.name.trim().length === 0 ? 'border-red-500/50 focus:border-red-400' : 'border-[#FFC107]/20 focus:border-[#FFC107]'
              }`}
              placeholder="Ej. Tabata Piernas"
            />
            {edited.name.trim().length === 0 && (
              <p className="text-red-400 text-[10px] font-bold ml-1 mt-1">⚠ El nombre no puede estar vacío.</p>
            )}
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-[#FFC107]/70 uppercase ml-1">Descripción <span className="text-white/30 normal-case font-normal">(opcional)</span></label>
            <input
              value={edited.description || ''}
              onChange={e => setEdited({ ...edited, description: e.target.value })}
              className="w-full bg-blue-900/50 border border-[#FFC107]/10 rounded-xl px-4 py-3 text-white placeholder-white/30 outline-none focus:border-[#FFC107]/40"
              placeholder="Ej. Rutina de piernas para principiantes"
            />
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex justify-between items-center px-1">
            <h3 className="text-lg font-bold text-[#FFC107]">Etapas</h3>
            <div className="flex gap-3">
               {edited.periods.length > 0 && (
                 <button 
                  onClick={() => setShowRepeatTool(true)}
                  className="flex items-center gap-1 text-[#FFC107] font-black text-[10px] bg-[#FFC107]/10 px-2 py-1 rounded-md border border-[#FFC107]/20 active:scale-90"
                 >
                   <RotateCcwIcon className="w-3 h-3" /> REPETIR ÚLTIMOS
                 </button>
               )}
               <button onClick={handleOpenAddPeriod} className="flex items-center gap-1 text-emerald-400 font-black text-[10px] bg-emerald-400/10 px-2 py-1 rounded-md border border-emerald-400/20 active:scale-90">
                 <PlusIcon className="w-3 h-3" /> AÑADIR PASO
               </button>
            </div>
          </div>

          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={edited.periods.map(p => p.id)} strategy={verticalListSortingStrategy}>
              <div className="space-y-4">
                {edited.periods.map((period, index) => (
                  <SortablePeriod 
                    key={period.id} 
                    period={period} 
                    index={index} 
                    handleOpenEditPeriod={handleOpenEditPeriod} 
                    removePeriod={removePeriod} 
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        </div>
      </div>

      <footer className="p-4 bg-[#00358E] border-t border-[#FFC107]/30 flex items-center gap-3 z-20">
        {edited.periods.length === 0 && (
          <p className="w-full text-center text-red-400/80 text-[10px] font-bold uppercase tracking-wider absolute -top-6 left-0 right-0">
            ⚠ Agregá al menos una etapa
          </p>
        )}
        <div className="flex items-center justify-center px-4 py-4 bg-blue-900/50 rounded-xl border border-[#FFC107]/20 font-mono text-[#FFC107] text-xs font-black shrink-0">
          ⏱ {totalMin}m {totalSec}s
        </div>
        <button
          onClick={() => isValid && onSave(edited)}
          disabled={!isValid}
          className={`flex-1 font-black py-4 rounded-xl transition-all ${
            isValid
              ? 'bg-[#FFC107] text-[#00358E] active:scale-95'
              : 'bg-[#FFC107]/25 text-[#00358E]/40 cursor-not-allowed'
          }`}
        >
          GUARDAR RUTINA
        </button>
      </footer>

      {showRepeatTool && (
        <div className="fixed inset-0 z-[150] bg-black/90 flex items-center justify-center p-6">
           <div className="bg-[#002244] border-2 border-[#FFC107] p-6 rounded-3xl w-full max-w-sm shadow-2xl">
              <h4 className="text-[#FFC107] font-black uppercase italic text-xl mb-6">Repetir Bloque</h4>
              <div className="space-y-6">
                <div>
                  <label className="text-[10px] text-white/60 font-bold uppercase mb-2 block">¿Cuántos pasos hacia atrás?</label>
                  <div className="flex items-center gap-4 bg-black/40 p-1 rounded-2xl">
                    <button onClick={() => setRepeatCount(Math.max(1, repeatCount - 1))} className="w-12 h-12 bg-white/5 rounded-xl text-[#FFC107] font-black text-xl">-</button>
                    <span className="flex-1 text-center text-2xl font-black text-white">{repeatCount}</span>
                    <button onClick={() => setRepeatCount(Math.min(edited.periods.length, repeatCount + 1))} className="w-12 h-12 bg-white/5 rounded-xl text-[#FFC107] font-black text-xl">+</button>
                  </div>
                </div>
                <div>
                  <label className="text-[10px] text-white/60 font-bold uppercase mb-2 block">¿Cuántas veces repetir?</label>
                  <div className="flex items-center gap-4 bg-black/40 p-1 rounded-2xl">
                    <button onClick={() => setRepeatTimes(Math.max(1, repeatTimes - 1))} className="w-12 h-12 bg-white/5 rounded-xl text-[#FFC107] font-black text-xl">-</button>
                    <span className="flex-1 text-center text-2xl font-black text-white">{repeatTimes}</span>
                    <button onClick={() => setRepeatTimes(repeatTimes + 1)} className="w-12 h-12 bg-white/5 rounded-xl text-[#FFC107] font-black text-xl">+</button>
                  </div>
                </div>
                <button onClick={handleRepeatBlocks} className="w-full bg-[#FFC107] text-[#00358E] font-black py-4 rounded-xl shadow-lg active:scale-95">DUPLICAR BLOQUE</button>
                <button onClick={() => setShowRepeatTool(false)} className="w-full text-white/40 font-bold py-2 rounded-xl text-xs uppercase">CANCELAR</button>
              </div>
           </div>
        </div>
      )}

      {editingPeriod.active && editingPeriod.period && (
        <div className="fixed inset-0 z-[120] bg-black/90 backdrop-blur-sm flex items-center justify-center p-6">
          <div className="bg-[#002244] border-2 border-[#FFC107] p-6 rounded-3xl w-full max-w-sm shadow-2xl space-y-4">
            <div className="flex justify-between items-center mb-2">
              <h4 className="text-[#FFC107] font-black uppercase italic text-xl">
                {editingPeriod.isNew ? 'Añadir Paso' : 'Editar Paso'}
              </h4>
              <button onClick={() => setEditingPeriod({ active: false, isNew: false, period: null })} className="text-white/50 active:scale-90 p-2">
                <XIcon className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-[10px] text-white/60 font-bold uppercase mb-1 block ml-1">Tipo de etapa</label>
                <select 
                  value={editingPeriod.period.type}
                  onChange={e => handleTypeChangeInForm(e.target.value as PeriodType)}
                  className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none appearance-none font-bold"
                >
                  {Object.values(PeriodType).map(t => <option key={t} value={t} className="bg-[#002244] font-bold">{t}</option>)}
                </select>
              </div>

              <div>
                <label className="text-[10px] text-white/60 font-bold uppercase mb-1 block ml-1">Ejercicio / Nombre</label>
                <div className="flex gap-2">
                  <input 
                    value={editingPeriod.period.name}
                    onChange={e => setEditingPeriod(prev => ({ ...prev, period: { ...prev.period!, name: e.target.value } }))}
                    className="flex-1 bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-[#FFC107]/50"
                    placeholder="Escribir nombre..."
                  />
                  <button 
                    onClick={() => setShowPresets(true)}
                    className="bg-[#FFC107]/10 border border-[#FFC107]/30 text-[#FFC107] px-4 py-3 rounded-xl active:bg-[#FFC107] active:text-[#002244] transition-colors"
                  >
                    <PlusIcon className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div>
                <label className="text-[10px] text-white/60 font-bold uppercase mb-1 block ml-1">Duración (segundos)</label>
                <div className="flex items-center gap-3 bg-black/30 border border-white/10 px-4 py-3 rounded-xl focus-within:border-[#FFC107]/50">
                  <ClockIcon className="w-5 h-5 text-white/40" />
                  <input 
                    type="number"
                    value={editingPeriod.period.duration}
                    onChange={e => setEditingPeriod(prev => ({ ...prev, period: { ...prev.period!, duration: parseInt(e.target.value) || 0 } }))}
                    className="bg-transparent border-none text-white text-xl w-full outline-none font-mono font-black"
                  />
                </div>
              </div>
            </div>

            <button 
              onClick={handleSavePeriod} 
              className="w-full mt-6 bg-[#FFC107] text-[#00358E] font-black py-4 rounded-xl shadow-lg active:scale-95 transition-transform tracking-tighter"
            >
              GUARDAR PASO
            </button>
          </div>
        </div>
      )}

      {showPresets && (
        <div className="fixed inset-0 z-[130] bg-black/90 backdrop-blur-sm flex items-end">
          <div className="bg-[#002244] w-full rounded-t-3xl max-h-[85vh] flex flex-col p-6 border-t border-[#FFC107]/50">
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-[#FFC107] font-black text-lg">Elegir Ejercicio</h4>
              <button onClick={() => setShowPresets(false)} className="p-2 text-white/50"><XIcon className="w-6 h-6" /></button>
            </div>
            <input 
              autoFocus
              type="text"
              placeholder="Buscar..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-blue-900/50 border border-[#FFC107]/20 rounded-xl px-4 py-3 text-white outline-none mb-4"
            />
            <div className="flex-1 overflow-y-auto grid grid-cols-2 gap-3 pb-10">
              {filteredPresets.map(name => (
                <button key={name} onClick={() => selectPreset(name)} className="bg-blue-900/50 p-4 rounded-xl text-white text-sm text-left border border-white/5 active:bg-[#FFC107] active:text-[#00358E]">
                  {name}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {showCancelConfirm && (
        <div className="fixed inset-0 z-[200] bg-black/95 backdrop-blur-md flex items-center justify-center p-6 animate-in fade-in duration-200">
          <div className="bg-[#002244] border-2 border-[#FFC107] p-8 rounded-3xl w-full max-w-sm text-center shadow-2xl">
            <h4 className="text-2xl font-black text-white mb-2 uppercase italic tracking-tighter">¿DESCARTAR CAMBIOS?</h4>
            <p className="text-white/60 mb-8 font-medium">Tienes cambios sin guardar que se perderán.</p>
            <div className="flex flex-col gap-3">
              <button
                onClick={() => setShowCancelConfirm(false)}
                className="bg-white text-[#00358E] font-black py-4 rounded-xl active:scale-95 shadow-lg"
              >
                CONTINUAR EDITANDO
              </button>
              <button
                onClick={onCancel}
                className="bg-red-600 text-white font-black py-4 rounded-xl active:scale-95 shadow-lg"
              >
                DESCARTAR
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkoutEditor;
