
import React, { useState } from 'react';
import { PresetItem, ScheduleItem, ReminderItem, Child } from '../types';
import { Calendar, Trash2, Plus, Bell, X } from 'lucide-react';

interface WeeklyPlannerProps {
  presets: PresetItem[];
  childrenData: Child[];
  currentSchedules: ScheduleItem[];
  currentReminders: ReminderItem[];
  onSave: (schedules: ScheduleItem[], reminders: ReminderItem[]) => void;
  onClose: () => void;
}

const DAYS = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];

const WeeklyPlanner: React.FC<WeeklyPlannerProps> = ({ 
  presets, childrenData, currentSchedules, currentReminders, onSave, onClose 
}) => {
  const [schedules, setSchedules] = useState<ScheduleItem[]>(currentSchedules);
  const [reminders, setReminders] = useState<ReminderItem[]>(currentReminders);
  
  const [selectedDay, setSelectedDay] = useState(new Date().getDay());
  const [selectedChild, setSelectedChild] = useState<string>('all'); // 'all' or childId

  const handleAddSchedule = (presetId: string) => {
    const newSchedule: ScheduleItem = {
      id: crypto.randomUUID(),
      frequency: 'WEEKLY',
      dayOfWeek: selectedDay,
      presetId,
      childId: selectedChild === 'all' ? undefined : selectedChild
    };
    setSchedules([...schedules, newSchedule]);
  };

  const handleRemoveSchedule = (id: string) => {
    setSchedules(schedules.filter(s => s.id !== id));
  };

  const handleAddReminder = (text: string) => {
    if (!text.trim()) return;
    const newReminder: ReminderItem = {
      id: crypto.randomUUID(),
      frequency: 'WEEKLY',
      dayOfWeek: selectedDay,
      text,
      childId: selectedChild === 'all' ? undefined : selectedChild
    };
    setReminders([...reminders, newReminder]);
  };

  const handleRemoveReminder = (id: string) => {
    setReminders(reminders.filter(r => r.id !== id));
  };

  const handleSave = () => {
    onSave(schedules, reminders);
    onClose();
  };

  // Filter items for current view
  const daySchedules = schedules.filter(s => s.dayOfWeek === selectedDay && (selectedChild === 'all' || !s.childId || s.childId === selectedChild));
  const dayReminders = reminders.filter(r => r.dayOfWeek === selectedDay && (selectedChild === 'all' || !r.childId || r.childId === selectedChild));

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="p-4 border-b flex justify-between items-center bg-slate-50">
          <div className="flex items-center gap-2">
            <Calendar className="text-brand-600" />
            <h3 className="font-bold text-lg text-slate-800">Agenda Semanal</h3>
          </div>
          <div className="flex gap-2">
            <button onClick={onClose} className="px-4 py-2 text-slate-500 font-medium hover:bg-slate-100 rounded-lg">Cancelar</button>
            <button onClick={handleSave} className="px-6 py-2 bg-brand-600 text-white font-bold rounded-lg hover:bg-brand-700 shadow-sm">Salvar Alterações</button>
          </div>
        </div>

        <div className="flex flex-1 overflow-hidden">
          
          {/* Sidebar - Controls & Presets */}
          <div className="w-1/3 bg-slate-50 border-r p-4 overflow-y-auto space-y-6">
            
            {/* Child Filter */}
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Filtrar por Filho</label>
              <select 
                value={selectedChild} 
                onChange={e => setSelectedChild(e.target.value)}
                className="w-full p-2 border rounded-lg text-sm bg-white"
              >
                <option value="all">Todos</option>
                {childrenData.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>

            {/* Presets List */}
            <div>
              <h4 className="text-xs font-bold text-slate-500 uppercase mb-2">Tarefas Disponíveis</h4>
              <div className="space-y-2">
                {presets.filter(p => p.type === 'EARN').map(preset => (
                  <button
                    key={preset.id}
                    onClick={() => handleAddSchedule(preset.id)}
                    className="w-full p-2 bg-white border border-slate-200 rounded-lg text-left hover:border-brand-400 hover:shadow-sm transition-all flex items-center gap-2 group"
                  >
                    <span className="text-xl">{preset.emoji}</span>
                    <span className="text-sm font-medium text-slate-700 flex-1">{preset.label}</span>
                    <Plus size={16} className="text-brand-500 opacity-0 group-hover:opacity-100" />
                  </button>
                ))}
              </div>
            </div>

            {/* Add Reminder Input */}
            <div>
               <h4 className="text-xs font-bold text-slate-500 uppercase mb-2">Adicionar Lembrete</h4>
               <form 
                 onSubmit={(e) => {
                   e.preventDefault();
                   const input = (e.currentTarget.elements[0] as HTMLInputElement);
                   handleAddReminder(input.value);
                   input.value = '';
                 }}
                 className="flex gap-2"
               >
                 <input type="text" placeholder="Ex: Natação" className="flex-1 text-sm p-2 border rounded-lg outline-none focus:ring-1 focus:ring-brand-500" />
                 <button type="submit" className="p-2 bg-slate-200 rounded-lg hover:bg-slate-300"><Plus size={16}/></button>
               </form>
            </div>

          </div>

          {/* Main - Calendar View */}
          <div className="flex-1 flex flex-col">
            
            {/* Day Selector */}
            <div className="flex border-b bg-white">
              {DAYS.map((day, index) => (
                <button
                  key={day}
                  onClick={() => setSelectedDay(index)}
                  className={`flex-1 py-3 text-sm font-bold border-b-2 transition-colors ${
                    selectedDay === index 
                      ? 'border-brand-600 text-brand-600 bg-brand-50' 
                      : 'border-transparent text-slate-400 hover:text-slate-600'
                  }`}
                >
                  <span className="hidden md:inline">{day}</span>
                  <span className="md:hidden">{day.slice(0, 3)}</span>
                </button>
              ))}
            </div>

            {/* Daily Content */}
            <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50">
              <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                Agenda de {DAYS[selectedDay]}
                {selectedChild !== 'all' && <span className="text-sm font-normal text-slate-500 bg-white px-2 py-1 rounded-full border">para {childrenData.find(c => c.id === selectedChild)?.name}</span>}
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Tasks Column */}
                <div className="space-y-3">
                   <h3 className="font-bold text-slate-500 text-sm uppercase flex items-center gap-2">
                     Tarefas Agendadas
                     <span className="bg-slate-200 text-slate-600 text-xs px-2 py-0.5 rounded-full">{daySchedules.length}</span>
                   </h3>
                   {daySchedules.length === 0 ? (
                     <div className="p-8 border-2 border-dashed border-slate-200 rounded-xl text-center text-slate-400 text-sm">
                       Arraste ou clique nas tarefas ao lado para adicionar.
                     </div>
                   ) : (
                     daySchedules.map(sched => {
                       const preset = presets.find(p => p.id === sched.presetId);
                       if (!preset) return null;
                       const child = sched.childId ? childrenData.find(c => c.id === sched.childId) : null;

                       return (
                         <div key={sched.id} className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <span className="text-2xl">{preset.emoji}</span>
                              <div>
                                <p className="font-bold text-slate-800 text-sm">{preset.label}</p>
                                <p className="text-xs text-slate-500">
                                  {child ? child.name : 'Todos'} • {preset.defaultAmount} pts
                                </p>
                              </div>
                            </div>
                            <button onClick={() => handleRemoveSchedule(sched.id)} className="text-slate-300 hover:text-red-500 p-2">
                              <Trash2 size={16} />
                            </button>
                         </div>
                       );
                     })
                   )}
                </div>

                {/* Reminders Column */}
                <div className="space-y-3">
                   <h3 className="font-bold text-slate-500 text-sm uppercase flex items-center gap-2">
                     Lembretes
                     <span className="bg-slate-200 text-slate-600 text-xs px-2 py-0.5 rounded-full">{dayReminders.length}</span>
                   </h3>
                   {dayReminders.length === 0 ? (
                     <div className="p-8 border-2 border-dashed border-slate-200 rounded-xl text-center text-slate-400 text-sm">
                       Nenhum lembrete para este dia.
                     </div>
                   ) : (
                     dayReminders.map(rem => {
                        const child = rem.childId ? childrenData.find(c => c.id === rem.childId) : null;
                        return (
                          <div key={rem.id} className="bg-yellow-50 p-3 rounded-xl border border-yellow-100 flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <Bell size={18} className="text-yellow-600" />
                                <div>
                                  <p className="font-medium text-slate-800 text-sm">{rem.text}</p>
                                  {child && <p className="text-xs text-slate-500">Para: {child.name}</p>}
                                </div>
                              </div>
                              <button onClick={() => handleRemoveReminder(rem.id)} className="text-yellow-400 hover:text-red-500 p-2">
                                <Trash2 size={16} />
                              </button>
                          </div>
                        );
                     })
                   )}
                </div>

              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WeeklyPlanner;
