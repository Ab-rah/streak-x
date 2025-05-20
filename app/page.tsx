'use client'
import { useState, useEffect } from 'react';
import { Calendar, CheckCircle, ArrowLeft, ArrowRight, Info, Award } from 'lucide-react';

export default function StreakX() {
  const [days, setDays] = useState(Array(100).fill(false));
  const [currentView, setCurrentView] = useState(0);
  const [showInfo, setShowInfo] = useState(false);
  const [animation, setAnimation] = useState('');
  const daysPerView = 28; // 4 rows of 7 days for calendar view
  
  const toggleDay = (index) => {
    const newDays = [...days];
    newDays[index] = !newDays[index];
    setDays(newDays);
    
    if (newDays[index]) {
      setAnimation('celebration');
      setTimeout(() => setAnimation(''), 1500);
    }
    
    // Save to localStorage
    localStorage.setItem('streakXDays', JSON.stringify(newDays));
  };
  
  useEffect(() => {
    // Load from localStorage on component mount
    const savedDays = localStorage.getItem('streakXDays');
    if (savedDays) {
      setDays(JSON.parse(savedDays));
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
      if (days[i]) count++;
      else break;
    }
    return count;
  };
  
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
  const completedDaysCount = days.filter(day => day).length;
  const progressPercentage = (completedDaysCount / 100) * 100;
  const calendarDays = getCalendarDays();
  
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 text-gray-800">
      {/* Header */}
      <header className="bg-white shadow-md py-4 px-6">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Calendar className="text-indigo-600" />
            <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 text-transparent bg-clip-text">StreaX</h1>
          </div>
          <button 
            onClick={() => setShowInfo(!showInfo)}
            className="p-2 rounded-full hover:bg-gray-100 transition"
          >
            <Info size={20} className="text-gray-500" />
          </button>
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex flex-col items-center justify-center p-4 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-lg">
                <p className="text-sm text-gray-500 mb-1">Current Streak</p>
                <p className="text-3xl font-bold text-indigo-700">{currentStreak()}</p>
              </div>
              <div className="flex flex-col items-center justify-center p-4 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-lg">
                <p className="text-sm text-gray-500 mb-1">Days Completed</p>
                <p className="text-3xl font-bold text-indigo-700">{completedDaysCount}</p>
              </div>
              <div className="flex flex-col items-center justify-center p-4 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-lg">
                <p className="text-sm text-gray-500 mb-1">Progress</p>
                <p className="text-3xl font-bold text-indigo-700">{progressPercentage.toFixed(0)}%</p>
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
                    onClick={() => toggleDay(day.index)}
                    className={`aspect-square flex flex-col items-center justify-center rounded-lg hover:shadow-md transition-all transform hover:scale-105 relative
                      ${day.completed 
                        ? 'bg-gradient-to-br from-indigo-600 to-purple-700 text-white ring-2 ring-indigo-300' 
                        : 'bg-white hover:bg-indigo-50 border border-gray-200'}`}
                  >
                    <span className="text-lg font-semibold">{day.dayNumber}</span>
                    {day.completed && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="absolute inset-0 border-2 rounded-lg border-white opacity-20"></div>
                        <CheckCircle className="text-white opacity-90" size={20} />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
          
          {/* Achievement badges */}
          {completedDaysCount > 0 && (
            <div className="bg-white rounded-xl shadow-md p-6 mb-8">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <Award className="mr-2 text-indigo-600" />
                Achievements
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {completedDaysCount >= 1 && (
                  <div className={`flex flex-col items-center p-3 rounded-lg ${completedDaysCount >= 1 ? 'bg-gradient-to-br from-amber-50 to-yellow-100' : 'bg-gray-100'}`}>
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 ${completedDaysCount >= 1 ? 'bg-gradient-to-br from-amber-400 to-yellow-500' : 'bg-gray-300'}`}>
                      <span className="text-white font-bold">1</span>
                    </div>
                    <span className="text-xs text-center">First Day</span>
                  </div>
                )}
                
                {completedDaysCount >= 7 && (
                  <div className={`flex flex-col items-center p-3 rounded-lg ${completedDaysCount >= 7 ? 'bg-gradient-to-br from-indigo-50 to-blue-100' : 'bg-gray-100'}`}>
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 ${completedDaysCount >= 7 ? 'bg-gradient-to-br from-indigo-400 to-blue-500' : 'bg-gray-300'}`}>
                      <span className="text-white font-bold">7</span>
                    </div>
                    <span className="text-xs text-center">One Week</span>
                  </div>
                )}
                
                {completedDaysCount >= 30 && (
                  <div className={`flex flex-col items-center p-3 rounded-lg ${completedDaysCount >= 30 ? 'bg-gradient-to-br from-purple-50 to-violet-100' : 'bg-gray-100'}`}>
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 ${completedDaysCount >= 30 ? 'bg-gradient-to-br from-purple-400 to-violet-500' : 'bg-gray-300'}`}>
                      <span className="text-white font-bold">30</span>
                    </div>
                    <span className="text-xs text-center">One Month</span>
                  </div>
                )}
                
                {completedDaysCount >= 50 && (
                  <div className={`flex flex-col items-center p-3 rounded-lg ${completedDaysCount >= 50 ? 'bg-gradient-to-br from-emerald-50 to-green-100' : 'bg-gray-100'}`}>
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 ${completedDaysCount >= 50 ? 'bg-gradient-to-br from-emerald-400 to-green-500' : 'bg-gray-300'}`}>
                      <span className="text-white font-bold">50</span>
                    </div>
                    <span className="text-xs text-center">Halfway</span>
                  </div>
                )}
                
                {completedDaysCount >= 100 && (
                  <div className={`flex flex-col items-center p-3 rounded-lg ${completedDaysCount >= 100 ? 'bg-gradient-to-br from-rose-50 to-red-100' : 'bg-gray-100'}`}>
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 ${completedDaysCount >= 100 ? 'bg-gradient-to-br from-rose-400 to-red-500' : 'bg-gray-300'}`}>
                      <span className="text-white font-bold">100</span>
                    </div>
                    <span className="text-xs text-center">Challenge Complete</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>
      
      {/* Celebration animation */}
      {animation === 'celebration' && (
        <div className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center">
          <div className="confetti-container">
            {Array(30).fill().map((_, i) => (
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