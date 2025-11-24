
import React, { useState } from 'react';
import { PresetItem, ScheduleItem, ReminderItem, Child } from '../types';
import { Calendar as CalendarIcon, Trash2, Plus, Bell, X, ChevronLeft, ChevronRight, Repeat } from 'lucide-react';

interface CalendarPlannerProps {
  presets: PresetItem[];
  childrenData: Child[];
  currentSchedules: ScheduleItem[];
  currentReminders: ReminderItem[];
  onSave: (schedules: ScheduleItem[], reminders: ReminderItem[]) => void;
  onClose: () => void;
}

const DAYS_SHORT = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
const MONTHS = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];

const CalendarPlanner: React.FC<CalendarPlannerProps> = ({ 
  presets, childrenData, currentSchedules, currentReminders, onSave, onClose 
}) => {
  const [schedules, setSchedules] = useState<ScheduleItem[]>(currentSchedules || []);
  const [reminders, setReminders] = useState<ReminderItem[]>(currentReminders || []);
  
  // Calendar State
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  
  // UI State
  const [selectedChild, setSelectedChild] = useState<string>('all'); // 'all' or childId
  const [activeTab, setActiveTab] = useState<'TASK' | 'REMINDER'>('TASK');
  const [isRecurring, setIsRecurring] = useState(false);

  // Generate Calendar Grid
  const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);

  const calendarDays: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) calendarDays.push(null);
  for (let i = 1; i <= daysInMonth; i++) calendarDays.push(i);

  const handlePrevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const handleNextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const getFormattedDate = (date: Date) => date.toISOString().split('T')[0];

  // -- Handlers --

  const handleAddSchedule = (presetId: string) => {
    const dateStr = getFormattedDate(selectedDate);
    const dayOfWeek = selectedDate.getDay();

    const newSchedule: ScheduleItem = {
      id: crypto.randomUUID(),
      frequency: isRecurring ? 'WEEKLY' : 'ONCE',
      date: isRecurring ? undefined : dateStr,
      dayOfWeek: isRecurring ? dayOfWeek : undefined,
      presetId,
      childId: selectedChild === 'all' ? undefined : selectedChild
    };
    setSchedules([...schedules, newSchedule]);
  };

  const handleAddReminder = (text: string) => {
    if (!text.trim()) return;
    const dateStr = getFormattedDate(selectedDate);
    const dayOfWeek = selectedDate.getDay();

    const newReminder: ReminderItem = {
      id: crypto.randomUUID(),
      frequency: isRecurring ? 'WEEKLY' : 'ONCE',
      date: isRecurring ? undefined : dateStr,
      dayOfWeek: isRecurring ? dayOfWeek : undefined,
      text,
      childId: selectedChild === 'all' ? undefined : selectedChild
    };
    setReminders([...reminders, newReminder]);
  };

  const handleRemoveSchedule = (id: string) => {
    setSchedules(schedules.filter(s => s.id !== id));
  };

  const handleRemoveReminder = (id: string) => {
    setReminders(reminders.filter(r => r.id !== id));
  };

  const handleSave = () => {
    onSave(schedules, reminders);
    onClose();
  };

  // Filter for selected date view
  const selectedDateStr = getFormattedDate(selectedDate);
  const selectedDayOfWeek = selectedDate.getDay();

  const daySchedules = schedules.filter(s => {
    // Check child filter
    if (selectedChild !== 'all' && s.childId && s.childId !== selectedChild) return false;
    
    // Check date match
    if (s.frequency === 'ONCE') return s.date === selectedDateStr;
    if (s.frequency === 'WEEKLY') return s.dayOfWeek === selectedDayOfWeek;
    return false;
  });

  const dayReminders = reminders.filter(r => {
    if (selectedChild !== 'all' && r.childId && r.childId !== selectedChild) return false;
    if (r.frequency === 'ONCE') return r.date === selectedDateStr;
    if (r.frequency === 'WEEKLY') return r.dayOfWeek === selectedDayOfWeek;
    return false;
  });

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-5xl h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="p-4 border-b flex justify-between items-center bg-slate-50">
          <div className="flex items-center gap-2">
            <CalendarIcon className="text-brand-600" />
            <h3 className="font-bold text-lg text-slate-800">Agenda Familiar</h3>
          </div>
          <div className="flex gap-2">
            <button onClick={onClose} className="px-4 py-2 text-slate-500 font-medium hover:bg-slate-100 rounded-lg">Cancelar</button>
            <button onClick={handleSave} className="px-6 py-2 bg-brand-600 text-white font-bold rounded-lg hover:bg-brand-700 shadow-sm">Salvar Alterações</button>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row flex-1 overflow-hidden">
          
          {/* LEFT: Calendar Grid */}
          <div className="lg:w-7/12 p-6 border-r bg-white overflow-y-auto flex flex-col">
            
            {/* Calendar Navigation */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-slate-800 capitalize">{MONTHS[month]} {year}</h2>
              <div className="flex gap-2">
                <button onClick={handlePrevMonth} className="p-2 hover:bg-slate-100 rounded-full border"><ChevronLeft /></button>
                <button onClick={() => setCurrentDate(new Date())} className="px-3 py-2 text-sm font-bold text-brand-600 hover:bg-brand-50 rounded-lg border border-brand-200">Hoje</button>
                <button onClick={handleNextMonth} className="p-2 hover:bg-slate-100 rounded-full border"><ChevronRight /></button>
              </div>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-7 mb-2 text-center">
              {DAYS_SHORT.map(d => <div key={d} className="text-xs font-bold text-slate-400 uppercase py-2">{d}</div>)}
            </div>
            <div className="grid grid-cols-7 gap-2 auto-rows-fr">
              {calendarDays.map((day, idx) => {
                if (day === null) return <div key={`empty-${idx}`} className="aspect-square"></div>;

                const dateObj = new Date(year, month, day);
                const dateStr = getFormattedDate(dateObj);
                const isSelected = getFormattedDate(selectedDate) === dateStr;
                const isToday = getFormattedDate(new Date()) === dateStr;
                const dayOfWeek = dateObj.getDay();

                // Indicators
                const hasEvents = schedules.some(s => 
                  (s.frequency === 'ONCE' && s.date === dateStr) || 
                  (s.frequency === 'WEEKLY' && s.dayOfWeek === dayOfWeek)
                );
                const hasReminders = reminders.some(r => 
                  (r.frequency === 'ONCE' && r.date === dateStr) || 
                  (r.frequency === 'WEEKLY' && r.dayOfWeek === dayOfWeek)
                );

                return (
                  <button
                    key={day}
                    onClick={() => { setSelectedDate(dateObj); setIsRecurring(false); }}
                    className={`
                      aspect-square rounded-xl flex flex-col items-center justify-center relative border transition-all
                      ${isSelected 
                        ? 'bg-brand-600 text-white border-brand-600 shadow-md scale-105 z-10' 
                        : isToday 
                          ? 'bg-brand-50 text-brand-700 border-brand-200 font-bold'
                          : 'bg-slate-50 text-slate-700 border-transparent hover:bg-slate-100 hover:border-slate-200'
                      }
                    `}
                  >
                    <span className="text-lg">{day}</span>
                    <div className="flex gap-1 mt-1">
                       {hasEvents && <div className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-white' : 'bg-green-500'}`}></div>}
                       {hasReminders && <div className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-white' : 'bg-yellow-500'}`}></div>}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* RIGHT: Day Details & Add Form */}
          <div className="lg:w-5/12 bg-slate-50 flex flex-col h-full">
            
            {/* Detail Header */}
            <div className="p-6 border-b bg-white">
              <h2 className="text-xl font-bold text-slate-800 mb-1">
                {selectedDate.getDate()} de {MONTHS[selectedDate.getMonth()]}
              </h2>
              <p className="text-slate-500 text-sm capitalize">
                {selectedDate.toLocaleDateString('pt-BR', { weekday: 'long' })}
              </p>
            </div>

            {/* Filters / Add Toggle */}
            <div className="p-4 flex gap-2 border-b bg-slate-50">
               <select 
                value={selectedChild} 
                onChange={e => setSelectedChild(e.target.value)}
                className="p-2 border rounded-lg text-sm bg-white flex-1 outline-none focus:ring-2 focus:ring-brand-500"
              >
                <option value="all">Todos os Filhos</option>
                {childrenData.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>

            {/* Lists */}
            <div className="flex-1 overflow-y-auto p-4 space-y-6">
              
              {/* Tasks List */}
              <div>
                <h4 className="text-xs font-bold text-slate-500 uppercase mb-2 flex justify-between items-center">
                  Tarefas
                  <span className="bg-slate-200 px-2 rounded-full text-slate-600">{daySchedules.length}</span>
                </h4>
                <div className="space-y-2">
                  {daySchedules.map(sched => {
                     const preset = presets.find(p => p.id === sched.presetId);
                     if (!preset) return null;
                     const child = sched.childId ? childrenData.find(c => c.id === sched.childId) : null;

                     return (
                       <div key={sched.id} className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between group">
                          <div className="flex items-center gap-3">
                            <span className="text-xl">{preset.emoji}</span>
                            <div>
                              <div className="flex items-center gap-1">
                                <p className="font-bold text-slate-800 text-sm">{preset.label}</p>
                                {sched.frequency === 'WEEKLY' && <Repeat size={10} className="text-slate-400" />}
                              </div>
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
                  })}
                  {daySchedules.length === 0 && <p className="text-sm text-slate-400 italic">Nenhuma tarefa agendada.</p>}
                </div>
              </div>

              {/* Reminders List */}
              <div>
                <h4 className="text-xs font-bold text-slate-500 uppercase mb-2 flex justify-between items-center">
                  Lembretes
                  <span className="bg-slate-200 px-2 rounded-full text-slate-600">{dayReminders.length}</span>
                </h4>
                <div className="space-y-2">
                  {dayReminders.map(rem => {
                      const child = rem.childId ? childrenData.find(c => c.id === rem.childId) : null;
                      return (
                        <div key={rem.id} className="bg-yellow-50 p-3 rounded-xl border border-yellow-100 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <Bell size={18} className="text-yellow-600" />
                              <div>
                                <div className="flex items-center gap-1">
                                  <p className="font-medium text-slate-800 text-sm">{rem.text}</p>
                                  {rem.frequency === 'WEEKLY' && <Repeat size={10} className="text-yellow-600/50" />}
                                </div>
                                {child && <p className="text-xs text-slate-500">Para: {child.name}</p>}
                              </div>
                            </div>
                            <button onClick={() => handleRemoveReminder(rem.id)} className="text-yellow-400 hover:text-red-500 p-2">
                              <Trash2 size={16} />
                            </button>
                        </div>
                      );
                  })}
                  {dayReminders.length === 0 && <p className="text-sm text-slate-400 italic">Nenhum lembrete.</p>}
                </div>
              </div>

            </div>

            {/* Add New Section */}
            <div className="p-4 bg-white border-t shadow-lg z-10">
              <div className="flex gap-2 mb-3">
                 <button 
                   onClick={() => setActiveTab('TASK')} 
                   className={`flex-1 py-1.5 text-xs font-bold rounded uppercase ${activeTab === 'TASK' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-400'}`}
                 >
                   Adicionar Tarefa
                 </button>
                 <button 
                   onClick={() => setActiveTab('REMINDER')} 
                   className={`flex-1 py-1.5 text-xs font-bold rounded uppercase ${activeTab === 'REMINDER' ? 'bg-yellow-100 text-yellow-700' : 'bg-slate-100 text-slate-400'}`}
                 >
                   Adicionar Lembrete
                 </button>
              </div>

              <div className="flex items-center gap-2 mb-3">
                 <label className="flex items-center gap-2 text-xs font-bold text-slate-600 cursor-pointer select-none">
                   <input 
                     type="checkbox" 
                     checked={isRecurring}
                     onChange={e => setIsRecurring(e.target.checked)}
                     className="rounded text-brand-600 focus:ring-brand-500"
                   />
                   <span className="flex items-center gap-1">
                     <Repeat size={12} />
                     Repetir toda {selectedDate.toLocaleDateString('pt-BR', { weekday: 'long' })}
                   </span>
                 </label>
              </div>

              {activeTab === 'TASK' ? (
                 <div className="space-y-2 max-h-32 overflow-y-auto">
                    {presets.filter(p => p.type === 'EARN').map(preset => (
                      <button
                        key={preset.id}
                        onClick={() => handleAddSchedule(preset.id)}
                        className="w-full p-2 text-left text-sm border rounded hover:bg-brand-50 hover:border-brand-200 flex items-center gap-2 group"
                      >
                        <span>{preset.emoji}</span>
                        <span className="flex-1 truncate">{preset.label}</span>
                        <Plus size={14} className="text-brand-500 opacity-0 group-hover:opacity-100"/>
                      </button>
                    ))}
                 </div>
              ) : (
                 <form 
                   onSubmit={(e) => {
                     e.preventDefault();
                     const input = (e.currentTarget.elements[0] as HTMLInputElement);
                     handleAddReminder(input.value);
                     input.value = '';
                   }}
                   className="flex gap-2"
                 >
                   <input type="text" placeholder="Ex: Médico às 14h" className="flex-1 text-sm p-2 border rounded-lg outline-none focus:ring-1 focus:ring-brand-500" required />
                   <button type="submit" className="p-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700"><Plus size={18}/></button>
                 </form>
              )}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default CalendarPlanner;
