
import React, { useState, useEffect, useRef } from 'react';
import html2pdf from 'html2pdf.js';
import { Workout, PeriodType } from '../types';
import { audioService } from '../services/audioService';
import { PlayIcon, EditIcon, TrashIcon, ClockIcon, XIcon, DownloadIcon } from './Icons';

interface Props {
  workout: Workout;
  onStart: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

const WorkoutCard: React.FC<Props> = ({ workout, onStart, onEdit, onDelete }) => {
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const confirmTimeoutRef = useRef<number | null>(null);

  const totalDuration = workout.periods.reduce((acc, p) => acc + p.duration, 0);
  const minutes = Math.floor(totalDuration / 60);
  const seconds = totalDuration % 60;

  const exerciseCount = workout.periods.filter(p => p.type === PeriodType.EXERCISE).length;
  const restCount = workout.periods.filter(p => p.type === PeriodType.REST).length;
  const totalSteps = workout.periods.length;

  // Limpiar el timeout si el componente se desmonta
  useEffect(() => {
    return () => {
      if (confirmTimeoutRef.current) window.clearTimeout(confirmTimeoutRef.current);
    };
  }, []);

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isConfirmingDelete) {
      setIsConfirmingDelete(true);
      // Auto-cancelar la confirmación después de 3 segundos si no se toca nada
      confirmTimeoutRef.current = window.setTimeout(() => {
        setIsConfirmingDelete(false);
      }, 3000);
    } else {
      if (confirmTimeoutRef.current) window.clearTimeout(confirmTimeoutRef.current);
      onDelete();
      setIsConfirmingDelete(false);
    }
  };

  const handleCancelDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (confirmTimeoutRef.current) window.clearTimeout(confirmTimeoutRef.current);
    setIsConfirmingDelete(false);
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onEdit();
  };

  const handleStart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    audioService.unlock();
    onStart();
  };

  const handleExportPDF = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const container = document.createElement('div');
    container.innerHTML = `
      <div style="font-family: system-ui, -apple-system, sans-serif; background-color: #ffffff; color: #002244; padding: 40px; width: 100%; box-sizing: border-box;">
        <div style="text-align: center; border-bottom: 3px solid #00358E; padding-bottom: 20px; margin-bottom: 30px;">
          <h1 style="color: #00358E; font-size: 36px; margin: 0; text-transform: uppercase; font-style: italic; font-weight: 900;">${workout.name || 'Rutina de Entrenamiento'}</h1>
          ${workout.description ? `<p style="color: #666; font-size: 16px; margin-top: 10px;">${workout.description}</p>` : ''}
          <div style="display: inline-block; background-color: #FFC107; color: #00358E; padding: 8px 20px; border-radius: 20px; font-weight: bold; font-size: 14px; margin-top: 10px; text-transform: uppercase;">Duración Total: ${minutes} min ${seconds} seg</div>
        </div>
        <table style="width: 100%; border-collapse: separate; border-spacing: 0; margin-top: 20px; border-radius: 10px; overflow: hidden; border: 1px solid #00358E;">
          <thead>
            <tr>
              <th style="width: 10%; background-color: #00358E; color: #FFC107; padding: 15px; text-align: left; font-size: 14px; text-transform: uppercase; border-bottom: 2px solid #FFC107;">#</th>
              <th style="width: 25%; background-color: #00358E; color: #FFC107; padding: 15px; text-align: left; font-size: 14px; text-transform: uppercase; border-bottom: 2px solid #FFC107;">Tipo</th>
              <th style="width: 45%; background-color: #00358E; color: #FFC107; padding: 15px; text-align: left; font-size: 14px; text-transform: uppercase; border-bottom: 2px solid #FFC107;">Ejercicio</th>
              <th style="width: 20%; background-color: #00358E; color: #FFC107; padding: 15px; text-align: left; font-size: 14px; text-transform: uppercase; border-bottom: 2px solid #FFC107;">Tiempo</th>
            </tr>
          </thead>
          <tbody>
            ${workout.periods.map((p, i) => `
              <tr style="${p.type === 'Descanso' || p.type.toString().toUpperCase() === 'DESCANSO' ? 'color: #64748b; background-color: #f8fafc; font-style: italic;' : 'font-weight: bold; color: #002244;'}">
                <td style="padding: 15px; border-bottom: 1px solid #e2e8f0;">${i + 1}</td>
                <td style="padding: 15px; border-bottom: 1px solid #e2e8f0;">${p.type}</td>
                <td style="padding: 15px; border-bottom: 1px solid #e2e8f0;">${p.name || p.type}</td>
                <td style="padding: 15px; border-bottom: 1px solid #e2e8f0;">${p.duration}s</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        <div style="margin-top: 40px; text-align: center; color: #94a3b8; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Generado con TabataFran Pro</div>
      </div>
    `;

    const opt: any = {
      margin:       0,
      filename:     `Rutina_${(workout.name || 'Tabata').replace(/\s+/g, '_')}.pdf`,
      image:        { type: 'jpeg', quality: 0.98 },
      html2canvas:  { scale: 2, useCORS: true },
      jsPDF:        { unit: 'in', format: 'letter', orientation: 'portrait' }
    };

    try {
      const pdfBlob = await html2pdf().set(opt).from(container).output('blob');
      const file = new File([pdfBlob], opt.filename, { type: 'application/pdf' });
      
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: workout.name || 'Rutina de Entrenamiento',
          text: 'Te comparto mi rutina desde TabataFran Pro'
        });
      } else {
        html2pdf().set(opt).from(container).save();
      }
    } catch (e) {
      console.warn('Share API failed or not supported, saving directly.', e);
      html2pdf().set(opt).from(container).save();
    }
  };

  return (
    <div 
      className={`bg-[#002244] border ${isConfirmingDelete ? 'border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.3)]' : 'border-[#FFC107]/30'} p-5 rounded-2xl shadow-lg transition-all relative overflow-hidden flex flex-col`}
    >
      <div className="flex justify-between items-start mb-3">
        <h3 className="text-xl font-black text-[#FFC107] uppercase italic tracking-tight">
          {workout.name || 'Nueva Rutina'}
        </h3>
        <div className="flex items-center gap-1 text-white/60 text-[10px] bg-black/40 px-2 py-1 rounded-md font-mono font-bold">
          <ClockIcon className="w-3 h-3" />
          <span>{minutes}M {seconds}S</span>
        </div>
      </div>

      {totalSteps > 0 && (
        <div className="flex items-center gap-2 mb-3 flex-wrap">
          <span className="text-[10px] font-black text-white/40 bg-white/5 px-2 py-0.5 rounded-full uppercase tracking-wider">
            {totalSteps} etapas
          </span>
          {exerciseCount > 0 && (
            <span className="text-[10px] font-black text-emerald-400/80 bg-emerald-400/10 px-2 py-0.5 rounded-full uppercase tracking-wider">
              💪 {exerciseCount} ejerc.
            </span>
          )}
          {restCount > 0 && (
            <span className="text-[10px] font-black text-blue-300/80 bg-blue-400/10 px-2 py-0.5 rounded-full uppercase tracking-wider">
              🧘 {restCount} desc.
            </span>
          )}
        </div>
      )}

      <p className="text-white/70 text-sm mb-6 line-clamp-1 font-medium">
        {workout.description || 'Toca para empezar el entrenamiento.'}
      </p>

      <div className="flex gap-2">
        {!isConfirmingDelete ? (
          <>
            <button 
              onClick={handleStart}
              className="flex-1 bg-[#FFC107] text-[#00358E] font-black py-4 rounded-xl flex items-center justify-center gap-2 active:scale-95 transition-transform shadow-md tracking-tighter"
            >
              <PlayIcon className="w-5 h-5" />
              ENTRENAR
            </button>
            <button 
              onClick={handleExportPDF}
              className="p-4 rounded-xl bg-blue-800 text-white border border-blue-600 active:scale-90 transition-transform shadow-md"
              aria-label="Exportar PDF"
              title="Exportar a PDF"
            >
              <DownloadIcon className="w-5 h-5" />
            </button>
            <button 
              onClick={handleEdit}
              className="p-4 rounded-xl bg-blue-900 text-[#FFC107] border border-[#FFC107]/20 active:scale-90 transition-transform shadow-md"
              aria-label="Editar"
            >
              <EditIcon className="w-5 h-5" />
            </button>
            <button 
              onClick={handleDeleteClick}
              className="p-4 rounded-xl bg-red-900/40 text-red-400 border border-red-500/30 active:scale-90 transition-transform shadow-md"
              aria-label="Eliminar"
            >
              <TrashIcon className="w-5 h-5" />
            </button>
          </>
        ) : (
          <div className="flex w-full gap-2 animate-in fade-in zoom-in duration-200">
            <button 
              onClick={handleDeleteClick}
              className="flex-[2] bg-red-600 text-white font-black py-4 rounded-xl flex items-center justify-center gap-2 active:scale-95 transition-transform shadow-lg tracking-tighter uppercase italic"
            >
              <TrashIcon className="w-5 h-5" />
              ¿ELIMINAR?
            </button>
            <button 
              onClick={handleCancelDelete}
              className="flex-1 bg-white/10 text-white font-black py-4 rounded-xl flex items-center justify-center gap-2 active:scale-95 transition-transform border border-white/20"
            >
              NO
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default WorkoutCard;
