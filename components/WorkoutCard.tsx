
import React, { useState, useEffect, useRef } from 'react';
import { Workout } from '../types';
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
    onStart();
  };

  const handleExportPDF = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const html = `
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <title>${workout.name} - TabataFran</title>
        <style>
          body { font-family: system-ui, -apple-system, sans-serif; background-color: #ffffff; color: #002244; padding: 40px; margin: 0; }
          .header { text-align: center; border-bottom: 3px solid #00358E; padding-bottom: 20px; margin-bottom: 30px; }
          .header h1 { color: #00358E; font-size: 36px; margin: 0; text-transform: uppercase; font-style: italic; font-weight: 900; }
          .header p { color: #666; font-size: 16px; margin-top: 10px; }
          .badge { display: inline-block; background-color: #FFC107; color: #00358E; padding: 8px 20px; border-radius: 20px; font-weight: bold; font-size: 14px; margin-top: 10px; text-transform: uppercase; }
          table { width: 100%; border-collapse: separate; border-spacing: 0; margin-top: 20px; border-radius: 10px; overflow: hidden; border: 1px solid #00358E; }
          th { background-color: #00358E; color: #FFC107; padding: 15px; text-align: left; font-size: 14px; text-transform: uppercase; border-bottom: 2px solid #FFC107; }
          td { padding: 15px; border-bottom: 1px solid #e2e8f0; }
          tr:last-child td { border-bottom: none; }
          .row-EJERCICIO { font-weight: bold; color: #002244; }
          .row-DESCANSO { color: #64748b; background-color: #f8fafc; font-style: italic; }
          .footer { margin-top: 40px; text-align: center; color: #94a3b8; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; }
          @media print { body { padding: 0; } .badge { -webkit-print-color-adjust: exact; print-color-adjust: exact; } th { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>${workout.name || 'Rutina de Entrenamiento'}</h1>
          ${workout.description ? `<p>${workout.description}</p>` : ''}
          <div class="badge">Duración Total: ${minutes} min ${seconds} seg</div>
        </div>
        <table>
          <thead>
            <tr>
              <th width="10%">#</th>
              <th width="25%">Tipo</th>
              <th width="45%">Ejercicio</th>
              <th width="20%">Tiempo</th>
            </tr>
          </thead>
          <tbody>
            ${workout.periods.map((p, i) => `
              <tr class="row-${p.type}">
                <td>${i + 1}</td>
                <td>${p.type}</td>
                <td>${p.name || p.type}</td>
                <td>${p.duration}s</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        <div class="footer">Generado con TabataFran Pro</div>
        <script>
          window.onload = () => { window.print(); window.setTimeout(() => window.close(), 500); }
        </script>
      </body>
      </html>
    `;
    
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(html);
      printWindow.document.close();
    }
  };

  return (
    <div 
      className={`bg-[#002244] border ${isConfirmingDelete ? 'border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.3)]' : 'border-[#FFC107]/30'} p-5 rounded-2xl shadow-lg active:bg-[#00358E] transition-all relative overflow-hidden flex flex-col`}
      onClick={onStart}
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
