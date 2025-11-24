
import React from 'react';
import { PresetItem, ScheduleItem, ReminderItem } from '../types';
import { CalendarCheck, Bell, CheckCircle2 } from 'lucide-react';

interface DailyAgendaProps {
  childId: string;
  schedules: ScheduleItem[];
  reminders: ReminderItem[];
  presets: PresetItem[];
  onCompleteTask: (preset: PresetItem) => void;
}

const DailyAgenda: React.FC<DailyAgendaProps> = ({ childId, schedules, reminders, presets, onCompleteTask }) => {
  const now = new Date();
  const todayDayOfWeek = now.getDay();
  const todayDateStr = now.toISOString().split('T')[0];
  
  const DAYS = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];

  // Filter Logic
  const todaySchedules = schedules.filter(s => {
    const matchesChild = !s.childId || s.childId === childId;
    if (!matchesChild) return false;

    if (s.frequency === 'WEEKLY') return s.dayOfWeek === todayDayOfWeek;
    if (s.frequency === 'ONCE') return s.date === todayDateStr;
    return false;
  });

  const todayReminders = reminders.filter(r => {
    const matchesChild = !r.childId || r.childId === childId;
    if (!matchesChild) return false;

    if (r.frequency === 'WEEKLY') return r.dayOfWeek === todayDayOfWeek;
    if (r.frequency === 'ONCE') return r.date === todayDateStr;
    return false;
  });

  if (todaySchedules.length === 0 && todayReminders.length === 0) return null;

  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 mb-6 animate-in slide-in-from-bottom-2">
      <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
        <CalendarCheck className="text-brand-600" size={20} />
        Agenda de Hoje ({DAYS[todayDayOfWeek]})
      </h3>

      <div className="space-y-3">
        {todayReminders.map(rem => (
          <div key={rem.id} className="flex items-start gap-3 p-3 bg-yellow-50 border border-yellow-100 rounded-xl">
             <Bell className="text-yellow-600 shrink-0 mt-0.5" size={18} />
             <span className="text-sm font-medium text-slate-800">{rem.text}</span>
          </div>
        ))}

        {todaySchedules.map(sched => {
          const preset = presets.find(p => p.id === sched.presetId);
          if (!preset) return null;

          return (
            <div key={sched.id} className="flex items-center justify-between p-3 bg-slate-50 border border-slate-100 rounded-xl hover:border-brand-200 transition-colors">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{preset.emoji}</span>
                <div>
                  <p className="font-bold text-slate-800 text-sm">{preset.label}</p>
                  <span className="text-xs font-bold text-green-600 bg-green-50 px-1.5 py-0.5 rounded">+{preset.defaultAmount} pts</span>
                </div>
              </div>
              <button 
                onClick={() => onCompleteTask(preset)}
                className="bg-brand-600 text-white p-2 rounded-lg hover:bg-brand-700 shadow-sm active:scale-95 transition-all flex items-center gap-1 text-xs font-bold"
              >
                <CheckCircle2 size={16} /> Feito
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default DailyAgenda;
