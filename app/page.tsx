'use client'
import { useState, useEffect } from 'react';
import { Calendar, CheckCircle, ArrowLeft, ArrowRight, Info, Award, User, LogOut, Activity, Clock, Flame, Footprints, X, Loader2, Target } from 'lucide-react';

type ActivityData = {
  completed: boolean;
  type?: string;
  subType?: string; // e.g. "Running", "Coding Language"
  duration?: number;
  metricValue?: number; // Replaces calories
  notes?: string;
};

export default function StreakX() {
  const [days, setDays] = useState<(ActivityData | null)[]>([]);
  const [currentView, setCurrentView] = useState(0);
  const [targetDays, setTargetDays] = useState(100);
  const [showInfo, setShowInfo] = useState(false);
  const [animation, setAnimation] = useState('');
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDayIndex, setSelectedDayIndex] = useState<number | null>(null);
  const [activityForm, setActivityForm] = useState<ActivityData>({ completed: false });
  
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [usernameInput, setUsernameInput] = useState('');
  const [targetDaysInput, setTargetDaysInput] = useState('100');
  const [isClient, setIsClient] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  const daysPerView = 28; // 4 rows of 7 days for calendar view

  const loadUserDays = async (username: string) => {
    setIsSaving(true);
    try {
      const storedData = localStorage.getItem(`streakX_user_${username}`);
      if (storedData) {
         const userData = JSON.parse(storedData);
         setTargetDays(userData.targetDays);
         setDays(userData.days);
      } else {
         const defaultTarget = parseInt(targetDaysInput) || 100;
         setTargetDays(defaultTarget);
         setDays(Array(defaultTarget).fill(null));
      }
    } catch (e) {
      console.error("Error loading profile", e);
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (usernameInput.trim()) {
      const name = usernameInput.trim();
      setCurrentUser(name);
      localStorage.setItem('streakXCurrentUser', name);
      loadUserDays(name);
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('streakXCurrentUser');
    setDays([]);
    setUsernameInput('');
    setTargetDays(100);
    setCurrentView(0);
  };
  
  const openDayModal = (index: number) => {
    setSelectedDayIndex(index);
    const existingData = days[index];
    if (existingData) {
      // Support legacy data
      if ((existingData as any).calories) {
        existingData.metricValue = (existingData as any).calories;
      }
      setActivityForm({ ...existingData });
    } else {
      setActivityForm({ completed: false, type: 'Workout', subType: 'Running', duration: 30, metricValue: 300, notes: '' });
    }
    setIsModalOpen(true);
  };

  const saveActivity = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedDayIndex === null || !currentUser) return;

    const newDays = [...days];
    const isNewCompletion = !newDays[selectedDayIndex]?.completed;
    
    newDays[selectedDayIndex] = { ...activityForm, completed: true };
    setDays(newDays);
    setIsModalOpen(false);
    
    if (isNewCompletion) {
      setAnimation('celebration');
      setTimeout(() => setAnimation(''), 3000);
    }
    
    setIsSaving(true);
    try {
       localStorage.setItem(`streakX_user_${currentUser}`, JSON.stringify({ targetDays, days: newDays }));
    } catch (e) {
       console.error("Error saving data", e);
    } finally {
       setIsSaving(false);
    }
  };

  const toggleDayStatus = (index: number, e: React.MouseEvent) => {
    e.stopPropagation(); 
    if (!currentUser) return;
    
    const newDays = [...days];
    const isCurrentlyCompleted = !!newDays[index]?.completed;
    
    if (isCurrentlyCompleted) {
       newDays[index] = null; // Uncheck
    } else {
       newDays[index] = { completed: true, type: 'Quick Session', duration: 15, metricValue: 1 };
       setAnimation('celebration');
       setTimeout(() => setAnimation(''), 3000);
    }
    
    setDays(newDays);
    
    setIsSaving(true);
    try {
       localStorage.setItem(`streakX_user_${currentUser}`, JSON.stringify({ targetDays, days: newDays }));
    } catch (e) {
       console.error("Error saving data", e);
    } finally {
       setIsSaving(false);
    }
  };
  
  useEffect(() => {
    setIsClient(true);
    const savedUser = localStorage.getItem('streakXCurrentUser');
    if (savedUser) {
      setCurrentUser(savedUser);
      loadUserDays(savedUser);
    }
  }, []);
  
  const handlePrevious = () => {
    if (currentView > 0) {
      setCurrentView(currentView - 1);
    }
  };
  
  const handleNext = () => {
    if (currentView < Math.ceil(targetDays / daysPerView) - 1) {
      setCurrentView(currentView + 1);
    }
  };
  
  const currentStreak = () => {
    let count = 0;
    for (let i = 0; i < days.length; i++) {
      if (days[i]?.completed) count++;
      else break;
    }
    return count;
  };

  const totalFocusTime = days.reduce((sum, day) => sum + (day?.type !== 'Workout' ? (day?.duration || 0) : 0), 0);
  const totalCalories = days.reduce((sum, day) => sum + (day?.type === 'Workout' && day?.subType !== 'Walking' ? (day?.metricValue || (day as any)?.calories || 0) : 0), 0);
  const totalSteps = days.reduce((sum, day) => sum + (day?.type === 'Workout' && day?.subType === 'Walking' ? (day?.metricValue || 0) : 0), 0);
  const totalDuration = days.reduce((sum, day) => sum + (day?.duration || 0), 0);
  
  const getCalendarDays = () => {
    const result = [];
    const startOffset = (currentView * 4) % 7; 
    
    for (let i = 0; i < startOffset; i++) {
      result.push({ isEmpty: true });
    }
    
    for (let i = startDay; i < endDay; i++) {
      result.push({ 
        isEmpty: false, 
        dayNumber: i + 1,
        completed: !!days[i]?.completed,
        index: i
      });
    }
    
    return result;
  };
  
  const maxViewIndex = Math.ceil(targetDays / daysPerView) - 1;
  const startDay = currentView * daysPerView;
  const endDay = Math.min(startDay + daysPerView, targetDays);
  const completedDaysCount = days.filter(day => day?.completed).length;
  const safeTargetDays = targetDays > 0 ? targetDays : 1;
  const progressPercentage = (completedDaysCount / safeTargetDays) * 100;
  const calendarDays = getCalendarDays();
  
  if (!isClient) return null;

  if (!currentUser) {
    return (
      <div className="flex flex-col min-h-screen bg-zinc-950 text-zinc-100 items-center justify-center p-4 relative overflow-hidden">
        {/* Glow blobs for background aesthetics */}
        <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-orange-600/10 rounded-full blur-[120px] pointer-events-none mix-blend-screen" />
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none mix-blend-screen" />
        
        <div className="bg-zinc-900/60 backdrop-blur-2xl border border-zinc-800/50 rounded-3xl shadow-2xl p-8 w-full max-w-md relative z-10 animate-fade-in">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-500 via-red-500 to-indigo-500"></div>
          
          <div className="flex justify-center mb-8">
             <div className="w-20 h-20 bg-zinc-800/80 rounded-2xl flex items-center justify-center border border-zinc-700/50 shadow-inner">
               <Calendar className="text-orange-500 w-10 h-10 drop-shadow-[0_0_15px_rgba(249,115,22,0.5)]" />
             </div>
          </div>
          
          <h1 className="text-4xl font-bold text-center mb-3 text-white tracking-tight">StreakX</h1>
          <p className="text-zinc-400 text-center mb-10 text-sm">Log in to track your 100-day journey.</p>
          
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label htmlFor="username" className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-2">Your Name</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-zinc-500">
                  <User size={18} />
                </div>
                <input
                  type="text"
                  id="username"
                  name="username"
                  value={usernameInput}
                  onChange={(e) => setUsernameInput(e.target.value)}
                  className="block w-full pl-11 pr-4 py-3.5 bg-zinc-950/50 border border-zinc-800 rounded-xl focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 text-zinc-100 placeholder-zinc-700 transition-all outline-none"
                  placeholder="e.g. Alex"
                  required
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="targetDays" className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-2">Target Days</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-zinc-500">
                  <Target size={18} />
                </div>
                <input
                  type="number"
                  id="targetDays"
                  name="targetDays"
                  min="1"
                  max="1000"
                  value={targetDaysInput}
                  onChange={(e) => setTargetDaysInput(e.target.value)}
                  className="block w-full pl-11 pr-4 py-3.5 bg-zinc-950/50 border border-zinc-800 rounded-xl focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 text-zinc-100 placeholder-zinc-700 transition-all outline-none"
                  placeholder="100"
                  required
                />
              </div>
            </div>

            <button 
              type="submit"
              disabled={isSaving}
              className="w-full flex justify-center items-center py-4 px-4 rounded-xl text-lg font-bold text-white bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-zinc-900 focus:ring-emerald-500 transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_30px_rgba(16,185,129,0.5)] transform hover:-translate-y-1 disabled:opacity-75 disabled:cursor-not-allowed"
            >
              {isSaving ? <Loader2 size={24} className="animate-spin" /> : "Enter StreaX"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-zinc-950 text-zinc-100 relative selection:bg-emerald-500/30">
      {/* Background Ambience */}
      <div className="fixed top-[-20%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-emerald-600/5 blur-[150px] pointer-events-none z-0"></div>
      <div className="fixed bottom-[-20%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-indigo-600/5 blur-[150px] pointer-events-none z-0"></div>

      {/* Header */}
      <header className="bg-zinc-900/60 backdrop-blur-xl border-b border-zinc-800/60 py-4 px-6 z-30 sticky top-0">
        <div className="max-w-5xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-lg flex items-center justify-center shadow-[0_0_15px_rgba(16,185,129,0.4)]">
              <Calendar className="text-white w-5 h-5" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white hidden sm:block">StreakX</h1>
          </div>
          <div className="flex items-center space-x-2 sm:space-x-4">
            <div className="flex items-center space-x-2 text-sm text-zinc-300 bg-zinc-800/50 px-4 py-2 rounded-full border border-zinc-700/50 backdrop-blur-md">
               <User size={16} className="text-emerald-400" />
               <span className="font-semibold">{currentUser}</span>
               {isSaving && <Loader2 size={12} className="text-emerald-400 animate-spin ml-2" />}
            </div>
            <button 
              onClick={() => setShowInfo(!showInfo)}
              className="p-2.5 rounded-full bg-zinc-800/50 border border-zinc-700/50 hover:bg-zinc-700/50 transition-colors text-zinc-400 hover:text-white backdrop-blur-md"
              title="Info"
            >
              <Info size={18} />
            </button>
            <button
              onClick={handleLogout}
              className="p-2.5 rounded-full bg-zinc-800/50 border border-zinc-700/50 hover:bg-red-900/30 hover:border-red-800/50 hover:text-red-400 text-zinc-400 transition-colors backdrop-blur-md"
              title="Switch User / Logout"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </header>
      
      {/* Main content */}
      <main className="flex-grow px-4 py-8 z-10">
        <div className="max-w-5xl mx-auto space-y-8">
          
          {showInfo && (
            <div className="bg-zinc-900/80 backdrop-blur-lg border border-indigo-500/30 rounded-2xl p-6 animate-fade-in shadow-[0_0_30px_rgba(99,102,241,0.1)] relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500" />
              <h2 className="text-xl font-bold mb-2 text-white flex items-center"><Info className="mr-2 text-indigo-400" size={20}/> Welcome to StreaX!</h2>
              <p className="text-zinc-400 mb-4 leading-relaxed">Track your habits and consistency day by day. Click on a tile to log your activity—whether it's reading, coding, meditation, or working out.</p>
              <button 
                onClick={() => setShowInfo(false)} 
                className="bg-zinc-800 hover:bg-zinc-700 text-white px-5 py-2 rounded-lg font-medium transition-colors text-sm border border-zinc-700"
              >
                Dismiss
              </button>
            </div>
          )}

          {/* Stats section */}
          <div className="bg-zinc-900/40 backdrop-blur-xl border border-zinc-800/60 rounded-3xl p-6 sm:p-8 shadow-2xl">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 sm:gap-6">
              
              <div className="flex flex-col items-center sm:items-start justify-center p-5 bg-zinc-950/50 rounded-2xl border border-zinc-800/80 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/10 rounded-full blur-2xl group-hover:bg-indigo-500/20 transition-all" />
                <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2 flex items-center"><Activity size={14} className="mr-1.5 text-indigo-400"/> Streak</p>
                <div className="flex items-end space-x-1">
                  <p className="text-3xl sm:text-4xl font-bold text-white tracking-tight">{currentStreak()}</p>
                  <p className="text-zinc-500 font-medium pb-1 text-sm">days</p>
                </div>
              </div>
              
              <div className="flex flex-col items-center sm:items-start justify-center p-5 bg-zinc-950/50 rounded-2xl border border-zinc-800/80 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/20 transition-all" />
                <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2 flex items-center"><CheckCircle size={14} className="mr-1.5 text-emerald-400"/> Progress</p>
                <div className="flex items-baseline space-x-1">
                   <p className="text-3xl sm:text-4xl font-bold text-white tracking-tight">{completedDaysCount}</p>
                   <p className="text-sm font-semibold text-zinc-600">/ {targetDays}</p>
                </div>
              </div>

              <div className="flex flex-col items-center sm:items-start justify-center p-5 bg-zinc-950/50 rounded-2xl border border-zinc-800/80 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/10 rounded-full blur-2xl group-hover:bg-cyan-500/20 transition-all" />
                <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2 flex items-center"><Clock size={14} className="mr-1.5 text-cyan-400"/> Focus Time</p>
                <p className="text-2xl sm:text-3xl font-bold text-white tracking-tight mt-1">
                   {totalFocusTime > 600 
                      ? `${Math.floor(totalFocusTime/60)}h` 
                      : totalFocusTime > 60 
                        ? `${Math.floor(totalFocusTime/60)}h ${totalFocusTime%60}` 
                        : `${totalFocusTime}m`}
                </p>
              </div>
              
              <div className="flex flex-col items-center sm:items-start justify-center p-5 bg-zinc-950/50 rounded-2xl border border-zinc-800/80 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-24 h-24 bg-orange-500/10 rounded-full blur-2xl group-hover:bg-orange-500/20 transition-all" />
                <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2 flex items-center"><Flame size={14} className="mr-1.5 text-orange-400"/> Calories Burned</p>
                <div className="flex items-end space-x-1">
                  <p className="text-3xl sm:text-4xl font-bold text-white tracking-tight">{totalCalories > 9999 ? (totalCalories/1000).toFixed(1) + 'k' : totalCalories}</p>
                  <p className="text-zinc-500 font-medium pb-1 text-sm">kcal</p>
                </div>
              </div>
              
              <div className="flex flex-col items-center sm:items-start justify-center p-5 bg-zinc-950/50 rounded-2xl border border-zinc-800/80 relative overflow-hidden group col-span-2 sm:col-span-1 md:col-span-1">
                <div className="absolute top-0 right-0 w-24 h-24 bg-teal-500/10 rounded-full blur-2xl group-hover:bg-teal-500/20 transition-all" />
                <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2 flex items-center"><Footprints size={14} className="mr-1.5 text-teal-400"/> Steps</p>
                <div className="flex items-end space-x-1">
                  <p className="text-3xl sm:text-4xl font-bold text-white tracking-tight">{totalSteps > 9999 ? (totalSteps/1000).toFixed(1) + 'k' : totalSteps}</p>
                  <p className="text-zinc-500 font-medium pb-1 text-sm">steps</p>
                </div>
              </div>
            </div>
            
            {/* Progress bar */}
            <div className="mt-8 relative">
              <div className="flex justify-between text-xs font-semibold text-zinc-500 mb-2 px-1">
                <span>0%</span>
                <span>{progressPercentage.toFixed(1)}%</span>
                <span>100%</span>
              </div>
              <div className="bg-zinc-950/80 rounded-full h-3 sm:h-4 overflow-hidden border border-zinc-800/80 shadow-[inset_0_2px_4px_rgba(0,0,0,0.6)]">
                <div 
                  className="bg-gradient-to-r from-orange-600 via-red-500 to-orange-400 h-full rounded-full transition-all duration-1000 ease-out relative"
                  style={{ width: `${progressPercentage}%` }}
                >
                  <div className="absolute top-0 right-0 bottom-0 left-0 bg-[linear-gradient(45deg,rgba(255,255,255,0.2)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.2)_50%,rgba(255,255,255,0.2)_75%,transparent_75%,transparent)] bg-[length:20px_20px] animate-[pulse-glow_2s_linear_infinite]" />
                </div>
              </div>
            </div>
          </div>
          
          {/* Days grid container */}
          <div className="bg-zinc-900/40 backdrop-blur-xl border border-zinc-800/60 rounded-3xl p-6 sm:p-8 shadow-2xl relative">
            
            <div className="flex justify-between items-center mb-8 relative z-10">
              <button 
                onClick={handlePrevious}
                disabled={currentView === 0}
                className={`flex items-center justify-center p-3 rounded-xl border ${currentView === 0 ? 'border-zinc-800 text-zinc-700 cursor-not-allowed bg-zinc-900/50' : 'border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white bg-zinc-800/30'} transition-all`}
              >
                <ArrowLeft size={18} />
              </button>
              
              <div className="flex flex-col items-center">
                <h2 className="text-xl sm:text-2xl font-bold flex items-center text-white tracking-tight">
                  Cycle {Math.floor(startDay / 28) + 1}
                </h2>
                <div className="h-1 w-12 bg-orange-500 rounded-full mt-1.5 shadow-[0_0_10px_rgba(249,115,22,0.6)]"></div>
              </div>
              
              <button 
                onClick={handleNext}
                disabled={currentView === maxViewIndex}
                className={`flex items-center justify-center p-3 rounded-xl border ${currentView === maxViewIndex ? 'border-zinc-800 text-zinc-700 cursor-not-allowed bg-zinc-900/50' : 'border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white bg-zinc-800/30'} transition-all`}
              >
                <ArrowRight size={18} />
              </button>
            </div>
            
            <div className="grid grid-cols-7 gap-2 sm:gap-3 lg:gap-4 relative z-10">
              {calendarDays.map((day, idx) => {
                if (day.isEmpty) {
                  return (
                    <div key={`empty-${idx}`} className="aspect-square rounded-2xl bg-zinc-950/30 border border-zinc-800/30"></div>
                  );
                }
                
                return (
                  <button
                    key={idx}
                    onClick={() => day.index !== undefined && openDayModal(day.index)}
                    className={`aspect-square flex flex-col items-center justify-center rounded-2xl transition-all duration-300 transform relative overflow-hidden group
                      ${day.completed 
                        ? 'bg-gradient-to-br from-orange-500 to-red-600 border border-orange-400/50 text-white shadow-[0_0_20px_rgba(234,88,12,0.3)] hover:scale-105 z-10 hover:shadow-[0_0_30px_rgba(234,88,12,0.5)]' 
                        : 'bg-zinc-900/50 hover:bg-zinc-800/80 border border-zinc-800 hover:border-orange-500/40 text-zinc-500 hover:text-white hover:scale-105'}`}
                  >
                    <span className={`text-xl sm:text-2xl font-bold ${day.completed ? 'text-white' : ''}`}>
                      {day.dayNumber}
                    </span>
                    
                    {day.completed && days[day.index] && (
                       <div className="text-[10px] sm:text-xs font-semibold text-orange-100 opacity-90 mt-0.5 sm:mt-1 truncate w-full px-1 text-center">
                         {days[day.index]?.metricValue ? `${days[day.index]?.metricValue} pts` : days[day.index]?.type}
                       </div>
                    )}

                    {!day.completed && (
                       <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-zinc-800/90 backdrop-blur-[2px]">
                          <span className="text-orange-400 text-sm font-bold tracking-wider">+ LOG</span>
                       </div>
                    )}

                    {day.completed && (
                      <div className="absolute top-1.5 right-1.5 sm:top-2 sm:right-2">
                        <CheckCircle className="text-white w-3 h-3 sm:w-4 sm:h-4 drop-shadow-md" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
          
          {/* Achievement badges */}
          {completedDaysCount > 0 && (
            <div className="bg-zinc-900/40 backdrop-blur-xl border border-zinc-800/60 rounded-3xl p-6 sm:p-8 shadow-2xl">
              <h3 className="text-xl font-bold mb-6 flex items-center text-white">
                <Award className="mr-3 text-yellow-400 w-6 h-6" />
                Accolades
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                {completedDaysCount >= 1 && (
                  <div className={`flex flex-col items-center p-5 rounded-2xl border ${completedDaysCount >= 1 ? 'bg-zinc-950/80 border-yellow-500/30 shadow-[0_4px_20px_rgba(234,179,8,0.1)]' : 'bg-zinc-900 border-zinc-800'}`}>
                    <div className={`w-14 h-14 rounded-full flex items-center justify-center mb-3 shadow-[0_0_15px_rgba(234,179,8,0.4)] ${completedDaysCount >= 1 ? 'bg-gradient-to-br from-yellow-400 to-amber-600' : 'bg-zinc-800'}`}>
                      <span className="text-white font-bold text-xl">1</span>
                    </div>
                    <span className="text-sm font-semibold text-zinc-300 text-center">First Step</span>
                  </div>
                )}
                
                {completedDaysCount >= 7 && (
                  <div className={`flex flex-col items-center p-5 rounded-2xl border bg-zinc-950/80 border-blue-500/30 shadow-[0_4px_20px_rgba(59,130,246,0.1)]`}>
                    <div className={`w-14 h-14 rounded-full flex items-center justify-center mb-3 shadow-[0_0_15px_rgba(59,130,246,0.4)] bg-gradient-to-br from-blue-400 to-indigo-600`}>
                      <span className="text-white font-bold text-xl">7</span>
                    </div>
                    <span className="text-sm font-semibold text-zinc-300 text-center">One Week</span>
                  </div>
                )}
                
                {totalCalories >= 5000 && (
                  <div className={`flex flex-col items-center p-5 rounded-2xl border bg-zinc-950/80 border-orange-500/30 shadow-[0_4px_20px_rgba(249,115,22,0.1)]`}>
                    <div className={`w-14 h-14 rounded-full flex items-center justify-center mb-3 shadow-[0_0_15px_rgba(249,115,22,0.4)] bg-gradient-to-br from-orange-400 to-red-600`}>
                      <Flame className="text-white" size={24} />
                    </div>
                    <span className="text-sm font-semibold text-zinc-300 text-center">5k Points</span>
                  </div>
                )}
                
                {totalDuration >= 1440 && (
                  <div className={`flex flex-col items-center p-5 rounded-2xl border bg-zinc-950/80 border-cyan-500/30 shadow-[0_4px_20px_rgba(6,182,212,0.1)]`}>
                    <div className={`w-14 h-14 rounded-full flex items-center justify-center mb-3 shadow-[0_0_15px_rgba(6,182,212,0.4)] bg-gradient-to-br from-cyan-400 to-blue-500`}>
                      <Clock className="text-white" size={24} />
                    </div>
                    <span className="text-sm font-semibold text-zinc-300 text-center">24h Active</span>
                  </div>
                )}

                {completedDaysCount >= Math.floor(targetDays / 2) && targetDays >= 10 && (
                  <div className={`flex flex-col items-center p-5 rounded-2xl border bg-zinc-950/80 border-emerald-500/30 shadow-[0_4px_20px_rgba(16,185,129,0.1)]`}>
                    <div className={`w-14 h-14 rounded-full flex items-center justify-center mb-3 shadow-[0_0_15px_rgba(16,185,129,0.4)] bg-gradient-to-br from-emerald-400 to-green-600`}>
                      <span className="text-white font-bold text-xl">50%</span>
                    </div>
                    <span className="text-sm font-semibold text-zinc-300 text-center">Halfway</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>
      
      {/* Glassmorphic Modal overlay */}
      {isModalOpen && selectedDayIndex !== null && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden transform transition-all relative">
            <div className={`absolute top-0 left-0 w-full h-1 ${activityForm.completed && days[selectedDayIndex]?.completed ? 'bg-gradient-to-r from-emerald-400 to-teal-500' : 'bg-gradient-to-r from-orange-500 to-red-500'}`}></div>
            
            <div className="px-6 py-5 flex justify-between items-center border-b border-zinc-800/80">
              <h3 className="font-bold text-xl flex items-center text-white">
                <Activity className={`mr-2 h-6 w-6 ${activityForm.completed && days[selectedDayIndex]?.completed ? 'text-emerald-400' : 'text-orange-500'}`} />
                {activityForm.completed && days[selectedDayIndex]?.completed ? 'Edit Session' : 'Log Session'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-zinc-500 hover:text-white transition-colors bg-zinc-800/50 hover:bg-zinc-700 p-1.5 rounded-full">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={saveActivity} className="p-6 space-y-6">
              <div className="flex items-center space-x-4 p-4 bg-zinc-950/50 rounded-2xl border border-zinc-800">
                 <div className="w-14 h-14 bg-zinc-800 text-white rounded-xl flex items-center justify-center font-bold text-2xl border border-zinc-700">
                    {selectedDayIndex + 1}
                 </div>
                 <div>
                    <p className="text-xs text-zinc-500 font-bold uppercase tracking-wider mb-0.5">Timeline Status</p>
                    <p className="font-semibold text-zinc-200">
                      {Math.floor(selectedDayIndex / 28) + 1 > 1 ? `Cycle ${Math.floor(selectedDayIndex / 28) + 1}, Week ${Math.floor((selectedDayIndex % 28) / 7) + 1}` : `Week ${Math.floor(selectedDayIndex / 7) + 1}`}
                    </p>
                 </div>
              </div>

              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="flex-1">
                    <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-widest mb-1.5">Activity Type</label>
                    <select 
                      value={activityForm.type || 'Workout'}
                      onChange={(e) => {
                         const newType = e.target.value;
                         setActivityForm({
                           ...activityForm, 
                           type: newType,
                           // Reset specific fields when switching type to avoid bad data
                           metricValue: newType === 'Workout' ? 300 : undefined,
                           subType: newType === 'Workout' ? 'Running' : undefined
                         })
                      }}
                      className="w-full bg-zinc-950 border border-zinc-800 text-white rounded-xl focus:border-orange-500/50 focus:ring-2 focus:ring-orange-500/20 p-3 outline-none transition-all appearance-none"
                    >
                      <option value="Workout">🏋️‍♂️ Workout / Exercise</option>
                      <option value="Reading">📚 Reading</option>
                      <option value="Meditation">🧘‍♀️ Meditation</option>
                      <option value="Coding">💻 Coding / Building</option>
                      <option value="Learning">🧠 Learning / Study</option>
                      <option value="Creative">🎨 Creative Work</option>
                      <option value="Hydration">💧 Hydration</option>
                      <option value="Chores">🧹 Chores / Cleaning</option>
                      <option value="Custom">🚀 Custom Activity</option>
                    </select>
                  </div>

                  {activityForm.type === 'Workout' && (
                    <div className="flex-1 animate-fade-in">
                      <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-widest mb-1.5">Exercise</label>
                      <select 
                        value={activityForm.subType || 'Running'}
                        onChange={(e) => setActivityForm({...activityForm, subType: e.target.value})}
                        className="w-full bg-zinc-950 border border-zinc-800 text-white rounded-xl focus:border-orange-500/50 focus:ring-2 focus:ring-orange-500/20 p-3 outline-none transition-all appearance-none"
                      >
                        <option value="Running">Running</option>
                        <option value="Cycling">Cycling</option>
                        <option value="Swimming">Swimming</option>
                        <option value="Weightlifting">Weightlifting</option>
                        <option value="Yoga">Yoga</option>
                        <option value="HIIT">HIIT</option>
                        <option value="Walking">Walking</option>
                      </select>
                    </div>
                  )}
                </div>
                
                <div className={`grid gap-4 ${activityForm.type === 'Workout' ? 'grid-cols-2' : 'grid-cols-1'}`}>
                  <div>
                    <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-widest mb-1.5">Duration</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500">
                        <Clock size={16} />
                      </div>
                      <input 
                        type="number" 
                        min="0"
                        value={activityForm.duration || ''}
                        onChange={(e) => setActivityForm({...activityForm, duration: parseInt(e.target.value) || 0})}
                        className="w-full pl-10 pr-3 border border-zinc-800 rounded-xl focus:border-orange-500/50 focus:ring-2 focus:ring-orange-500/20 p-3 bg-zinc-950 text-white outline-none transition-all placeholder-zinc-700"
                        placeholder="Mins"
                      />
                    </div>
                  </div>
                  
                  {activityForm.type === 'Workout' && (
                    <div className="animate-fade-in">
                      <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-widest mb-1.5">
                        {activityForm.subType === 'Walking' ? 'Steps' : 'Calories Burned'}
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-orange-500">
                          {activityForm.subType === 'Walking' ? <Footprints size={16} /> : <Flame size={16} />}
                        </div>
                        <input 
                          type="number" 
                          min="0"
                          value={activityForm.metricValue || ''}
                          onChange={(e) => setActivityForm({...activityForm, metricValue: parseInt(e.target.value) || 0})}
                          className="w-full pl-10 pr-3 border border-zinc-800 rounded-xl focus:border-orange-500/50 focus:ring-2 focus:ring-orange-500/20 p-3 bg-zinc-950 text-white outline-none transition-all placeholder-zinc-700"
                          placeholder={activityForm.subType === 'Walking' ? 'Steps' : 'Kcal'}
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-widest mb-1.5">Notes</label>
                  <textarea 
                    value={activityForm.notes || ''}
                    onChange={(e) => setActivityForm({...activityForm, notes: e.target.value})}
                    className="w-full border border-zinc-800 rounded-xl focus:border-orange-500/50 focus:ring-2 focus:ring-orange-500/20 p-3 bg-zinc-950 text-white outline-none transition-all resize-none placeholder-zinc-700"
                    placeholder="Capture your thoughts..."
                    rows={3}
                  ></textarea>
                </div>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row gap-3">
                <button 
                  type="submit"
                  className={`flex-1 text-white py-3.5 px-4 rounded-xl font-bold shadow-[0_0_15px_rgba(234,88,12,0.3)] hover:shadow-[0_0_25px_rgba(234,88,12,0.5)] transform transition-all hover:-translate-y-1 ${activityForm.completed && days[selectedDayIndex]?.completed ? 'bg-gradient-to-r from-emerald-500 to-teal-600 shadow-[0_0_15px_rgba(16,185,129,0.3)] hover:shadow-[0_0_25px_rgba(16,185,129,0.5)]' : 'bg-gradient-to-r from-orange-500 to-red-600'}`}
                >
                  {activityForm.completed && days[selectedDayIndex]?.completed ? 'Update Session' : 'Commit to Log'}
                </button>
                {days[selectedDayIndex]?.completed && (
                  <button 
                    type="button"
                    onClick={(e) => {
                      toggleDayStatus(selectedDayIndex, e);
                      setIsModalOpen(false);
                    }}
                    className="sm:flex-none bg-zinc-950 text-red-500 hover:bg-red-500/10 py-3.5 px-6 rounded-xl font-bold border border-zinc-800 hover:border-red-500/50 transition-colors"
                  >
                    Delete
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}
      
      {/* Celebration animation uses vibrant neon colors in CSS */}
      {animation === 'celebration' && (
        <div className="fixed inset-0 pointer-events-none z-[100] flex items-center justify-center bg-black/30 backdrop-blur-sm">
          <div className="confetti-container">
            {Array(50).fill(0).map((_, i) => (
              <div 
                key={i}
                className="confetti"
                style={{
                  left: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 2}s`,
                  backgroundColor: ['#f97316', '#ef4444', '#10b981', '#3b82f6', '#8b5cf6'][Math.floor(Math.random() * 5)]
                }}
              />
            ))}
          </div>
          <div className="text-4xl sm:text-6xl font-bold text-white bg-zinc-900/80 backdrop-blur-md px-10 py-6 rounded-3xl border border-zinc-700/50 shadow-[0_0_50px_rgba(249,115,22,0.5)] animate-fade-in flex flex-col items-center">
             <Flame className="w-16 h-16 text-orange-500 mb-4 animate-pulse-glow" />
             DAY CONQUERED!
          </div>
        </div>
      )}
    </div>
  );
}