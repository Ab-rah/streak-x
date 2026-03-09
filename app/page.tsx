'use client'
import { useState, useEffect } from 'react';
import { Calendar, CheckCircle, ArrowLeft, ArrowRight, Info, Award, User, LogOut, Activity, Clock, Flame, X } from 'lucide-react';

type WorkoutData = {
  completed: boolean;
  type?: string;
  duration?: number;
  calories?: number;
  notes?: string;
};

export default function StreakX() {
  const [days, setDays] = useState<(WorkoutData | null)[]>(Array(100).fill(null));
  const [currentView, setCurrentView] = useState(0);
  const [showInfo, setShowInfo] = useState(false);
  const [animation, setAnimation] = useState('');
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDayIndex, setSelectedDayIndex] = useState<number | null>(null);
  const [workoutForm, setWorkoutForm] = useState<WorkoutData>({ completed: false });
  
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [usernameInput, setUsernameInput] = useState('');
  const [isClient, setIsClient] = useState(false);
  
  const daysPerView = 28; // 4 rows of 7 days for calendar view

  const loadUserDays = (username: string) => {
    const savedDays = localStorage.getItem(`streakXDays_${username}`);
    if (savedDays) {
      try {
        const parsed = JSON.parse(savedDays);
        // Migration logic: if old boolean array, convert to explicit object
        const migrated = parsed.map((item: any) => {
           if (typeof item === 'boolean') {
              return item ? { completed: true, type: 'Legacy Workout', duration: 0, calories: 0 } : null;
           }
           return item;
        });
        setDays(migrated);
      } catch (e) {
        setDays(Array(100).fill(null));
      }
    } else {
      setDays(Array(100).fill(null)); // Reset if new
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
    setDays(Array(100).fill(null));
    setUsernameInput('');
    setCurrentView(0);
  };
  
  const openDayModal = (index: number) => {
    setSelectedDayIndex(index);
    const existingData = days[index];
    if (existingData) {
      setWorkoutForm({ ...existingData });
    } else {
      setWorkoutForm({ completed: false, type: 'Running', duration: 30, calories: 300, notes: '' });
    }
    setIsModalOpen(true);
  };

  const saveWorkout = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedDayIndex === null) return;

    const newDays = [...days];
    const isNewCompletion = !newDays[selectedDayIndex]?.completed;
    
    newDays[selectedDayIndex] = { ...workoutForm, completed: true };
    setDays(newDays);
    
    if (isNewCompletion) {
      setAnimation('celebration');
      setTimeout(() => setAnimation(''), 1500);
    }
    
    if (currentUser) {
      localStorage.setItem(`streakXDays_${currentUser}`, JSON.stringify(newDays));
    }
    
    setIsModalOpen(false);
  };

  const toggleDayStatus = (index: number, e: React.MouseEvent) => {
    e.stopPropagation(); // don't trigger modal
    const newDays = [...days];
    const isCurrentlyCompleted = !!newDays[index]?.completed;
    
    if (isCurrentlyCompleted) {
       newDays[index] = null; // Uncheck
    } else {
       newDays[index] = { completed: true, type: 'Quick Workout', duration: 15, calories: 100 }; // Quick check
       setAnimation('celebration');
       setTimeout(() => setAnimation(''), 1500);
    }
    
    setDays(newDays);
    if (currentUser) {
      localStorage.setItem(`streakXDays_${currentUser}`, JSON.stringify(newDays));
    }
  };
  
  useEffect(() => {
    setIsClient(true);
    // Load from localStorage on component mount
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
    if (currentView < Math.ceil(100 / daysPerView) - 1) {
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

  const totalCalories = days.reduce((sum, day) => sum + (day?.calories || 0), 0);
  const totalDuration = days.reduce((sum, day) => sum + (day?.duration || 0), 0);
  
  // Calculate calendar layout
  const getCalendarDays = () => {
    const result = [];
    // Calculate which day of week the period starts (0-6, with 0 = Sunday)
    // For simplicity, we'll assume the first day of each period starts on a specific weekday
    // This can be adjusted as needed
    const startOffset = (currentView * 4) % 7; // 4 is the number of weeks per view
    
    // Add empty placeholders at the beginning
    for (let i = 0; i < startOffset; i++) {
      result.push({ isEmpty: true });
    }
    
    // Add actual days
    for (let i = startDay; i < endDay; i++) {
      result.push({ 
        isEmpty: false, 
        dayNumber: i + 1,
        completed: days[i],
        index: i
      });
    }
    
    return result;
  };
  
  const maxViewIndex = Math.ceil(100 / daysPerView) - 1;
  const startDay = currentView * daysPerView;
  const endDay = Math.min(startDay + daysPerView, 100);
  const completedDaysCount = days.filter(day => day?.completed).length;
  const progressPercentage = (completedDaysCount / 100) * 100;
  const calendarDays = getCalendarDays();
  
  if (!isClient) return null; // Avoid hydration mismatch

  if (!currentUser) {
    return (
      <div className="flex flex-col min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 text-gray-800 items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md animate-fade-in relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-indigo-500 to-purple-600"></div>
          <div className="flex justify-center mb-6">
             <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center shadow-inner">
               <Calendar className="text-indigo-600 w-8 h-8" />
             </div>
          </div>
          <h1 className="text-3xl font-bold text-center mb-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-transparent bg-clip-text">Welcome to StreaX</h1>
          <p className="text-gray-500 text-center mb-8">Enter your name to start tracking your 100-day consistency challenge.</p>
          
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">Your Name</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User size={18} className="text-gray-400" />
                </div>
                <input
                  type="text"
                  id="username"
                  name="username"
                  value={usernameInput}
                  onChange={(e) => setUsernameInput(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow outline-none"
                  placeholder="e.g. Alex"
                  required
                />
              </div>
            </div>
            <button 
              type="submit"
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-lg font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all hover:shadow-md transform hover:-translate-y-0.5"
            >
              Get Started
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 text-gray-800">
      {/* Header */}
      <header className="bg-white shadow-md py-4 px-6 z-10 sticky top-0">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Calendar className="text-indigo-600" />
            <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 text-transparent bg-clip-text">StreaX</h1>
          </div>
          <div className="flex items-center space-x-2 sm:space-x-4">
            <div className="hidden sm:flex items-center space-x-2 text-sm text-gray-600 bg-gray-50 px-3 py-1.5 rounded-full border border-gray-100">
               <User size={16} className="text-indigo-500" />
               <span className="font-medium">{currentUser}</span>
            </div>
            <button 
              onClick={() => setShowInfo(!showInfo)}
              className="p-2 rounded-full hover:bg-gray-100 transition text-gray-500"
              title="Info"
            >
              <Info size={20} />
            </button>
            <button
              onClick={handleLogout}
              className="p-2 rounded-full hover:bg-red-50 text-gray-500 hover:text-red-500 transition"
              title="Switch User / Logout"
            >
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </header>
      
      {/* Main content */}
      <main className="flex-grow px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Info modal */}
          {showInfo && (
            <div className="bg-white rounded-lg shadow-lg p-6 mb-6 animate-fade-in">
              <h2 className="text-xl font-bold mb-3 text-indigo-700">Welcome to StreaX!</h2>
              <p className="mb-3">Track your 100-day consistency challenge with StreaX. Click on a day to mark it as completed.</p>
              <p className="mb-4">Stay consistent and watch your progress grow day by day!</p>
              <button 
                onClick={() => setShowInfo(false)} 
                className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition"
              >
                Got it
              </button>
            </div>
          )}

          {/* Stats section */}
          <div className="mb-8 bg-white rounded-xl shadow-md p-6">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="flex flex-col items-center justify-center p-4 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-lg shadow-sm border border-indigo-100">
                <p className="text-sm font-medium text-indigo-800 mb-1 flex items-center"><Activity size={16} className="mr-1"/> Streak</p>
                <p className="text-3xl font-bold text-indigo-700">{currentStreak()}</p>
              </div>
              <div className="flex flex-col items-center justify-center p-4 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-lg shadow-sm border border-indigo-100">
                <p className="text-sm font-medium text-indigo-800 mb-1 flex items-center"><CheckCircle size={16} className="mr-1"/> Days</p>
                <p className="text-3xl font-bold text-indigo-700">{completedDaysCount}</p>
              </div>
              <div className="flex flex-col items-center justify-center p-4 bg-gradient-to-br from-orange-50 to-red-50 rounded-lg shadow-sm border border-orange-100">
                <p className="text-sm font-medium text-orange-800 mb-1 flex items-center"><Flame size={16} className="mr-1"/> Calories</p>
                <p className="text-3xl font-bold text-orange-600">{totalCalories.toLocaleString()}</p>
              </div>
              <div className="flex flex-col items-center justify-center p-4 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg shadow-sm border border-blue-100">
                <p className="text-sm font-medium text-blue-800 mb-1 flex items-center"><Clock size={16} className="mr-1"/> Active Time</p>
                <p className="text-2xl font-bold text-blue-600">
                   {totalDuration > 60 
                      ? `${Math.floor(totalDuration/60)}h ${totalDuration%60}m` 
                      : `${totalDuration} mins`}
                </p>
              </div>
            </div>
            
            {/* Progress bar */}
            <div className="mt-6 bg-gray-200 rounded-full h-4 overflow-hidden">
              <div 
                className="bg-gradient-to-r from-indigo-500 to-purple-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>
          
          {/* Days grid navigation */}
          <div className="flex justify-between items-center mb-6">
            <button 
              onClick={handlePrevious}
              disabled={currentView === 0}
              className={`flex items-center space-x-1 px-3 py-2 rounded-md ${currentView === 0 ? 'text-gray-400 cursor-not-allowed' : 'hover:bg-indigo-100 text-indigo-700'}`}
            >
              <ArrowLeft size={16} />
              <span>Previous</span>
            </button>
            
            <h2 className="text-lg font-semibold flex items-center justify-center">
              <Calendar size={18} className="mr-2 text-indigo-600" />
              <span>Month {Math.floor(startDay / 28) + 1}</span>
            </h2>
            
            <button 
              onClick={handleNext}
              disabled={currentView === maxViewIndex}
              className={`flex items-center space-x-1 px-3 py-2 rounded-md ${currentView === maxViewIndex ? 'text-gray-400 cursor-not-allowed' : 'hover:bg-indigo-100 text-indigo-700'}`}
            >
              <span>Next</span>
              <ArrowRight size={16} />
            </button>
          </div>
          
          {/* Calendar-style days grid */}
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
            {/* <div className="mb-4 grid grid-cols-7 gap-1 text-center">
              {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, idx) => (
                <div key={idx} className="text-xs font-semibold text-gray-500 p-2">
                  {day}
                </div>
              ))}
            </div> */}
            
            <div className="grid grid-cols-7 gap-1">
              {calendarDays.map((day, idx) => {
                if (day.isEmpty) {
                  return (
                    <div key={`empty-${idx}`} className="aspect-square"></div>
                  );
                }
                
                return (
                  <button
                    key={idx}
                    onClick={() => day.index !== undefined && openDayModal(day.index)}
                    className={`aspect-square flex flex-col items-center justify-center rounded-lg hover:shadow-md transition-all transform hover:scale-105 relative overflow-hidden group border
                      ${day.completed 
                        ? 'bg-gradient-to-br from-indigo-600 to-purple-700 border-indigo-400 text-white shadow-[0_0_15px_rgba(79,70,229,0.5)] z-10' 
                        : 'bg-white hover:bg-gray-50 border-gray-200 shadow-sm'}`}
                  >
                    <span className={`text-lg font-bold ${day.completed ? 'text-white' : 'text-gray-600'}`}>
                      {day.dayNumber}
                    </span>
                    
                    {day.completed && days[day.index] && (
                       <div className="text-[10px] sm:text-xs font-medium text-indigo-100 opacity-90 mt-1 truncate w-full px-1 text-center">
                         {days[day.index]?.calories ? `${days[day.index]?.calories} kcal` : ''}
                       </div>
                    )}

                    {!day.completed && (
                       <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-indigo-50 bg-opacity-90">
                          <span className="text-indigo-600 text-xs font-semibold">+ Log</span>
                       </div>
                    )}

                    {day.completed && (
                      <div className="absolute top-1 right-1">
                        <CheckCircle className="text-green-300 w-4 h-4 shadow-sm rounded-full bg-indigo-800 bg-opacity-50" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
          
          {/* Achievement badges */}
          {completedDaysCount > 0 && (
            <div className="bg-white rounded-xl shadow-md p-6 mb-8 border border-gray-100">
              <h3 className="text-lg font-semibold mb-4 flex items-center text-gray-800">
                <Award className="mr-2 text-yellow-500" />
                Special Milestones
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {completedDaysCount >= 1 && (
                  <div className={`flex flex-col items-center p-4 rounded-xl shadow-sm border ${completedDaysCount >= 1 ? 'bg-gradient-to-b from-white to-amber-50 border-amber-200' : 'bg-gray-50 border-gray-200'}`}>
                    <div className={`w-14 h-14 rounded-full flex items-center justify-center mb-3 shadow-inner ${completedDaysCount >= 1 ? 'bg-gradient-to-br from-amber-400 to-yellow-500' : 'bg-gray-200'}`}>
                      <span className="text-white font-bold text-xl">1</span>
                    </div>
                    <span className="text-sm font-medium text-gray-700 text-center">First Day</span>
                  </div>
                )}
                
                {completedDaysCount >= 7 && (
                  <div className={`flex flex-col items-center p-4 rounded-xl shadow-sm border ${completedDaysCount >= 7 ? 'bg-gradient-to-b from-white to-blue-50 border-blue-200' : 'bg-gray-50 border-gray-200'}`}>
                    <div className={`w-14 h-14 rounded-full flex items-center justify-center mb-3 shadow-inner ${completedDaysCount >= 7 ? 'bg-gradient-to-br from-blue-400 to-indigo-500' : 'bg-gray-200'}`}>
                      <span className="text-white font-bold text-xl">7</span>
                    </div>
                    <span className="text-sm font-medium text-gray-700 text-center">One Week</span>
                  </div>
                )}
                
                {totalCalories >= 5000 && (
                  <div className={`flex flex-col items-center p-4 rounded-xl shadow-sm border bg-gradient-to-b from-white to-orange-50 border-orange-200`}>
                    <div className={`w-14 h-14 rounded-full flex items-center justify-center mb-3 shadow-inner bg-gradient-to-br from-orange-400 to-red-500`}>
                      <Flame className="text-white" size={24} />
                    </div>
                    <span className="text-sm font-medium text-gray-700 text-center">5k Calories</span>
                  </div>
                )}
                
                {totalDuration >= 1440 && (
                  <div className={`flex flex-col items-center p-4 rounded-xl shadow-sm border bg-gradient-to-b from-white to-cyan-50 border-cyan-200`}>
                    <div className={`w-14 h-14 rounded-full flex items-center justify-center mb-3 shadow-inner bg-gradient-to-br from-cyan-400 to-blue-500`}>
                      <Clock className="text-white" size={24} />
                    </div>
                    <span className="text-sm font-medium text-gray-700 text-center">24h Active</span>
                  </div>
                )}

                {completedDaysCount >= 100 && (
                  <div className={`flex flex-col items-center p-4 rounded-xl shadow-sm border ${completedDaysCount >= 100 ? 'bg-gradient-to-b from-white to-purple-50 border-purple-200' : 'bg-gray-50 border-gray-200'}`}>
                    <div className={`w-14 h-14 rounded-full flex items-center justify-center mb-3 shadow-inner ${completedDaysCount >= 100 ? 'bg-gradient-to-br from-purple-500 to-fuchsia-600' : 'bg-gray-200'}`}>
                      <span className="text-white font-bold text-xl">100</span>
                    </div>
                    <span className="text-sm font-medium text-gray-700 text-center">Titan</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>
      
      {/* Workout Modal */}
      {isModalOpen && selectedDayIndex !== null && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden transform transition-all">
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4 flex justify-between items-center text-white">
              <h3 className="font-bold text-lg flex items-center">
                <Activity className="mr-2 h-5 w-5" />
                {workoutForm.completed && days[selectedDayIndex]?.completed ? 'Edit Workout' : 'Log Workout'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-white/80 hover:text-white transition-colors bg-white/10 hover:bg-white/20 p-1 rounded-full">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={saveWorkout} className="p-6 space-y-5">
              <div className="flex items-center space-x-4 mb-2">
                 <div className="w-12 h-12 bg-indigo-100 text-indigo-700 rounded-xl flex items-center justify-center font-bold text-xl shadow-sm border border-indigo-200">
                    {selectedDayIndex + 1}
                 </div>
                 <div>
                    <p className="text-sm text-gray-500 font-medium uppercase tracking-wider">Day Tracker</p>
                    <p className="font-semibold text-gray-800">
                      {Math.floor(selectedDayIndex / 28) + 1 > 1 ? `Month ${Math.floor(selectedDayIndex / 28) + 1}, Week ${Math.floor((selectedDayIndex % 28) / 7) + 1}` : `Week ${Math.floor(selectedDayIndex / 7) + 1}`}
                    </p>
                 </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Workout Type</label>
                  <select 
                    value={workoutForm.type || 'Running'}
                    onChange={(e) => setWorkoutForm({...workoutForm, type: e.target.value})}
                    className="w-full border-gray-300 rounded-lg shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2.5 bg-gray-50 border outline-none transition-all"
                  >
                    <option value="Running">🏃‍♂️ Running</option>
                    <option value="Cycling">🚴‍♂️ Cycling</option>
                    <option value="Swimming">🏊‍♂️ Swimming</option>
                    <option value="Weightlifting">🏋️‍♂️ Weightlifting</option>
                    <option value="Yoga">🧘‍♀️ Yoga</option>
                    <option value="HIIT">⏱️ HIIT</option>
                    <option value="Rest Day">🛋️ Active Rest Day</option>
                  </select>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Duration (mins)</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                        <Clock size={16} />
                      </div>
                      <input 
                        type="number" 
                        min="0"
                        value={workoutForm.duration || ''}
                        onChange={(e) => setWorkoutForm({...workoutForm, duration: parseInt(e.target.value) || 0})}
                        className="w-full pl-9 border-gray-300 rounded-lg shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2.5 bg-gray-50 border outline-none transition-all"
                        placeholder="45"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Calories</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-orange-400">
                        <Flame size={16} />
                      </div>
                      <input 
                        type="number" 
                        min="0"
                        value={workoutForm.calories || ''}
                        onChange={(e) => setWorkoutForm({...workoutForm, calories: parseInt(e.target.value) || 0})}
                        className="w-full pl-9 border-gray-300 rounded-lg shadow-sm focus:border-orange-500 focus:ring-orange-500 p-2.5 bg-gray-50 border outline-none transition-all"
                        placeholder="350"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Notes (Optional)</label>
                  <textarea 
                    value={workoutForm.notes || ''}
                    onChange={(e) => setWorkoutForm({...workoutForm, notes: e.target.value})}
                    className="w-full border-gray-300 rounded-lg shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2.5 bg-gray-50 border outline-none transition-all resize-none"
                    placeholder="How did you feel today?"
                    rows={2}
                  ></textarea>
                </div>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row gap-3">
                <button 
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-2.5 px-4 rounded-lg font-medium shadow-md hover:shadow-lg transform transition-all hover:-translate-y-0.5"
                >
                  Save Workout
                </button>
                {days[selectedDayIndex]?.completed && (
                  <button 
                    type="button"
                    onClick={(e) => {
                      toggleDayStatus(selectedDayIndex, e);
                      setIsModalOpen(false);
                    }}
                    className="sm:flex-none bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 py-2.5 px-4 rounded-lg font-medium border border-red-100 transition-colors"
                  >
                    Delete Entry
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}
      
      {/* Celebration animation */}
      {animation === 'celebration' && (
        <div className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center">
          <div className="confetti-container">
            {Array(30).fill(0).map((_, i) => (
              <div 
                key={i}
                className="confetti"
                style={{
                  left: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 2}s`,
                  backgroundColor: ['#FF6B6B', '#4ECDC4', '#FFE66D', '#FF8C42', '#6B5CA5'][Math.floor(Math.random() * 5)]
                }}
              />
            ))}
          </div>
        </div>
      )}
      
      {/* Footer */}
      <footer className="bg-white shadow-inner py-4 px-6">
        <div className="max-w-4xl mx-auto text-center text-sm text-gray-500">
          <p>StreakX - Track your 100-day consistency challenge</p>
        </div>
      </footer>
      
      {/* Global styles */}
      
    </div>
  );
}