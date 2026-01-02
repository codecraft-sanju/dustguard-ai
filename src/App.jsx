import React, { useState, useEffect } from 'react';
import { 
  Wind, 
  Droplets, 
  Thermometer, 
  Car, 
  Activity, 
  MapPin, 
  Cpu, 
  CheckCircle2, 
  AlertTriangle,
  Loader2,
  Sparkles,
  Zap,
  BarChart3,
  Scan,
  RefreshCw,
  Siren 
} from 'lucide-react';

// --- CONFIGURATION ---
const WEATHER_API_KEY = "e8f92dba56b67251fe8972441eb51dad"; 
const CITY_LAT = 28.6139; // New Delhi Latitude
const CITY_LON = 77.2090; // New Delhi Longitude

const App = () => {
  const [loading, setLoading] = useState(false);
  const [dataFetching, setDataFetching] = useState(false); // For API fetch loader
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [mounted, setMounted] = useState(false);
  const [alertTriggered, setAlertTriggered] = useState(false); // For Critical Alert Popup

  useEffect(() => {
    setMounted(true);
  }, []);

  const [formData, setFormData] = useState({
    street_id: '',
    pm2_5: '',
    pm10: '',
    humidity: '',
    temperature: '',
    traffic_density: 'Medium',
    dust_index: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // --- WINNING FEATURE 1: REAL-TIME DATA FETCH ---
  const fetchLiveEnvironmentData = async () => {
    setDataFetching(true);
    setError(null);
    try {
      // 1. Fetch Weather (Temp, Humidity)
      const weatherRes = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${CITY_LAT}&lon=${CITY_LON}&units=metric&appid=${WEATHER_API_KEY}`);
      const weatherData = await weatherRes.json();

      // 2. Fetch Air Pollution (PM2.5, PM10)
      const pollutionRes = await fetch(`https://api.openweathermap.org/data/2.5/air_pollution?lat=${CITY_LAT}&lon=${CITY_LON}&appid=${WEATHER_API_KEY}`);
      const pollutionData = await pollutionRes.json();

      if (weatherData.main && pollutionData.list) {
        const pm25 = pollutionData.list[0].components.pm2_5;
        const pm10 = pollutionData.list[0].components.pm10;
        
        // Auto-calculate logic
        const dustIdx = Math.round((pm25 + pm10) / 2); 

        setFormData(prev => ({
          ...prev,
          temperature: weatherData.main.temp,
          humidity: weatherData.main.humidity,
          pm2_5: pm25,
          pm10: pm10,
          dust_index: dustIdx,
          street_id: Math.floor(Math.random() * 100)
        }));
      }
    } catch (err) {
      console.error("API Error (Using Mock Data instead):", err);
      simulateRandomData();
    } finally {
      setDataFetching(false);
    }
  };

  // Fallback / Random Data Generator
  const simulateRandomData = () => {
    setFormData({
      street_id: Math.floor(Math.random() * 50),
      pm2_5: (Math.random() * 50 + 20).toFixed(1),
      pm10: (Math.random() * 60 + 30).toFixed(1),
      humidity: Math.floor(Math.random() * 40 + 30),
      temperature: (Math.random() * 10 + 25).toFixed(1),
      traffic_density: 'Medium',
      dust_index: Math.floor(Math.random() * 60 + 40)
    });
  };

  // --- WINNING FEATURE 2: DEMO / GOD MODE (For Presentation) ---
  const triggerDemoEmergency = () => {
    setFormData({
      street_id: 101,
      pm2_5: 350.5,     // Very High
      pm10: 410.2,      // Very High
      humidity: 20,     // Dry air = More dust
      temperature: 42,  // Hot
      traffic_density: 'High',
      dust_index: 380
    });
    
    // Auto submit trigger karne jaisa effect
    setTimeout(() => {
        setAlertTriggered(true); // Show Red Alert Toast
    }, 500);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);
    setAlertTriggered(false);

    const payload = {
      street_id: Number(formData.street_id),
      pm2_5: Number(formData.pm2_5),
      pm10: Number(formData.pm10),
      humidity: Number(formData.humidity),
      temperature: Number(formData.temperature),
      traffic_density: formData.traffic_density,
      dust_index: Number(formData.dust_index)
    };

    try {
      const response = await fetch('https://dust-guard-ai-1.onrender.com/sample-predict/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'accept': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) throw new Error('Failed to fetch prediction');
      const data = await response.json();
      setResult(data);
      
      // If cleaning is needed, trigger the "Visual Alarm"
      if (data["cleaning needs"] === "Yes") {
        setAlertTriggered(true);
      }

    } catch (err) {
      setError('Connection corrupted. Unable to sync with AI Model.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-[#050505] text-zinc-100 font-sans selection:bg-emerald-500/30 overflow-hidden">
      
      {/* --- Ambient Background Animations --- */}
      <div className="fixed inset-0 z-0">
        <div className={`absolute top-[-20%] left-[-10%] w-[70%] h-[70%] rounded-full blur-[120px] animate-pulse-slow transition-colors duration-1000 ${alertTriggered ? 'bg-red-900/20' : 'bg-emerald-900/10'}`} />
        <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] rounded-full bg-teal-900/10 blur-[120px] animate-pulse-slow delay-1000" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:100px_100px] [mask-image:radial-gradient(ellipse_at_center,black_40%,transparent_100%)] pointer-events-none" />
      </div>

      {/* --- EMERGENCY ALERT OVERLAY (For Demo) --- */}
      {alertTriggered && (
        <div className="fixed top-10 left-1/2 -translate-x-1/2 z-50 animate-slide-down">
          <div className="bg-red-500/10 backdrop-blur-md border border-red-500 text-red-500 px-8 py-4 rounded-full shadow-[0_0_50px_rgba(239,68,68,0.4)] flex items-center gap-4">
            <Siren className="w-6 h-6 animate-pulse" />
            <span className="font-bold tracking-widest uppercase">Critical Dust Levels • Auto-Deployment Activated</span>
          </div>
        </div>
      )}

      <div className={`relative z-10 max-w-7xl mx-auto px-4 py-12 lg:py-20 transition-opacity duration-1000 ${mounted ? 'opacity-100' : 'opacity-0'}`}>
        
        {/* --- Header --- */}
        <header className="mb-20 text-center space-y-6">
          <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-md shadow-[0_0_20px_rgba(16,185,129,0.1)] group hover:bg-white/10 transition-all cursor-default">
            <span className="relative flex h-2 w-2">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${alertTriggered ? 'bg-red-400' : 'bg-emerald-400'}`}></span>
              <span className={`relative inline-flex rounded-full h-2 w-2 ${alertTriggered ? 'bg-red-500' : 'bg-emerald-500'}`}></span>
            </span>
            <span className={`text-xs font-semibold tracking-[0.2em] uppercase transition-colors ${alertTriggered ? 'text-red-300' : 'text-emerald-300'}`}>
              System Online v2.4
            </span>
          </div>
          
          <h1 className="text-6xl md:text-8xl font-bold tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white via-zinc-200 to-zinc-600 drop-shadow-2xl">
            DustGuard<span className={alertTriggered ? "text-red-500 transition-colors duration-500" : "text-emerald-500 transition-colors duration-500"}>.AI</span>
          </h1>
        </header>

        <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          
          {/* --- Input Column (Left - 5 Cols) --- */}
          <div className="lg:col-span-5 relative group">
            <div className={`absolute -inset-1 bg-gradient-to-r rounded-[2.5rem] blur-xl opacity-0 group-hover:opacity-100 transition duration-1000 ${alertTriggered ? 'from-red-500/20 to-orange-500/20' : 'from-emerald-500/20 to-teal-500/20'}`} />
            
            <div className="relative bg-[#0A0A0A]/80 backdrop-blur-2xl border border-white/5 rounded-[2rem] p-8 shadow-2xl overflow-hidden">
              
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-2xl border ${alertTriggered ? 'bg-red-500/10 border-red-500/20 text-red-400' : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'}`}>
                    <Activity className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white tracking-tight">Sensor Calibration</h2>
                    <p className="text-zinc-500 text-xs uppercase tracking-wider mt-1">Input environmental metrics</p>
                  </div>
                </div>

                {/* --- FETCH DATA BUTTON --- */}
                <button 
                  onClick={fetchLiveEnvironmentData}
                  disabled={dataFetching}
                  title="Fetch Real-time Data"
                  className="p-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-emerald-400 border border-white/5 transition-all active:scale-95 disabled:opacity-50"
                >
                  <RefreshCw className={`w-5 h-5 ${dataFetching ? 'animate-spin' : ''}`} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-2 gap-5">
                  <InputGroup label="Street ID" icon={<MapPin />} name="street_id" value={formData.street_id} onChange={handleChange} placeholder="04" delay="100" />
                  
                  {/* Traffic Select */}
                  <div className="space-y-2 opacity-0 animate-slide-up" style={{ animationDelay: '150ms', animationFillMode: 'forwards' }}>
                    <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2 ml-1">
                      <Car className="w-3 h-3 text-emerald-500" /> Density
                    </label>
                    <div className="relative group/select">
                      <select
                        name="traffic_density"
                        value={formData.traffic_density}
                        onChange={handleChange}
                        className="w-full bg-zinc-900/50 border border-white/5 rounded-xl px-4 py-4 text-zinc-300 focus:outline-none focus:border-emerald-500/50 focus:bg-zinc-900 focus:ring-1 focus:ring-emerald-500/50 transition-all appearance-none cursor-pointer"
                      >
                        <option value="Low">Low Traffic</option>
                        <option value="Medium">Medium Traffic</option>
                        <option value="High">High Traffic</option>
                      </select>
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-500">
                        <BarChart3 className="w-4 h-4" />
                      </div>
                    </div>
                  </div>

                  <InputGroup label="PM 2.5" icon={<Wind />} name="pm2_5" value={formData.pm2_5} onChange={handleChange} placeholder="130" delay="200" />
                  <InputGroup label="PM 10" icon={<Wind />} name="pm10" value={formData.pm10} onChange={handleChange} placeholder="100" delay="250" />
                  <InputGroup label="Dust Index" icon={<Cpu />} name="dust_index" value={formData.dust_index} onChange={handleChange} placeholder="82" delay="300" />
                  <InputGroup label="Humidity %" icon={<Droplets />} name="humidity" value={formData.humidity} onChange={handleChange} placeholder="34" delay="350" />
                </div>

                <div className="opacity-0 animate-slide-up" style={{ animationDelay: '400ms', animationFillMode: 'forwards' }}>
                  <InputGroup label="Temperature (°C)" icon={<Thermometer />} name="temperature" value={formData.temperature} onChange={handleChange} placeholder="24.5" fullWidth />
                </div>

                {/* --- ACTION BUTTONS --- */}
                <div className="pt-4 space-y-3 opacity-0 animate-slide-up" style={{ animationDelay: '500ms', animationFillMode: 'forwards' }}>
                  <button
                    type="submit"
                    disabled={loading}
                    className={`group relative w-full overflow-hidden rounded-xl p-[1px] focus:outline-none disabled:opacity-50 ${alertTriggered ? 'bg-red-600' : 'bg-emerald-600'}`}
                  >
                    <span className="absolute inset-[-1000%] animate-[spin_2s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#E2E8F0_0%,#10B981_50%,#E2E8F0_100%)] opacity-0 group-hover:opacity-100 transition-opacity" />
                    <span className="inline-flex h-full w-full cursor-pointer items-center justify-center rounded-xl bg-zinc-950 px-8 py-4 text-sm font-medium text-emerald-100 backdrop-blur-3xl transition-all group-hover:bg-zinc-900/90 gap-3">
                      {loading ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin text-emerald-500" />
                          <span className="tracking-widest uppercase text-xs">Processing Stream...</span>
                        </>
                      ) : (
                        <>
                          <Zap className={`w-5 h-5 group-hover:scale-110 transition-transform ${alertTriggered ? 'text-red-400' : 'text-emerald-400'}`} />
                          <span className="tracking-widest uppercase text-xs font-bold">Initiate Analysis</span>
                        </>
                      )}
                    </span>
                  </button>

                  {/* HIDDEN DEMO BUTTON (Small and subtle) */}
                  <button 
                    type="button"
                    onClick={triggerDemoEmergency}
                    className="w-full py-2 text-[10px] uppercase tracking-widest text-zinc-700 hover:text-red-500 transition-colors"
                  >
                    [ Initialize Simulation Protocol ]
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* --- Output Column (Right - 7 Cols) --- */}
          <div className="lg:col-span-7 h-full min-h-[600px] relative">
            <div className={`absolute inset-0 border rounded-[2rem] bg-black/40 backdrop-blur-sm overflow-hidden transition-colors duration-500 ${alertTriggered ? 'border-red-500/20' : 'border-white/5'}`}>
               <div className={`absolute inset-0 bg-gradient-to-b from-transparent via-emerald-500/5 to-transparent h-[50%] animate-scan pointer-events-none ${alertTriggered ? 'via-red-500/10' : ''}`} />
            </div>

            <div className="relative h-full p-8 md:p-12 flex flex-col">
              {!result && !error && (
                <div className="flex-1 flex flex-col items-center justify-center text-zinc-600 space-y-6">
                  <div className="relative">
                    <div className="absolute inset-0 bg-emerald-500/20 blur-xl rounded-full animate-pulse-slow"></div>
                    <Scan className="w-24 h-24 text-zinc-800 relative z-10" strokeWidth={0.5} />
                  </div>
                  <div className="text-center space-y-2">
                    <p className="text-xl font-medium text-zinc-500">System Standby</p>
                    <p className="text-sm font-mono text-zinc-700">Waiting for telemetry data stream...</p>
                  </div>
                </div>
              )}

              {error && (
                <div className="flex-1 flex items-center justify-center">
                   <div className="p-8 bg-red-950/20 border border-red-500/30 rounded-3xl backdrop-blur-xl text-red-200 flex flex-col items-center gap-4 max-w-md text-center">
                    <AlertTriangle className="w-10 h-10 text-red-500" />
                    <p>{error}</p>
                   </div>
                </div>
              )}

              {result && (
                <div className="animate-in fade-in zoom-in duration-500 space-y-8">
                  {/* --- Result Logic --- */}
                  <div className="flex justify-between items-end border-b border-white/10 pb-6">
                    <div>
                      <h3 className="text-zinc-400 text-xs font-mono uppercase tracking-[0.2em] mb-2">Diagnosis Report</h3>
                      <div className="flex items-center gap-3">
                         <span className={`text-5xl md:text-6xl font-black tracking-tighter ${
                            result["cleaning needs"] === "Yes" ? "text-red-500 drop-shadow-[0_0_15px_rgba(239,68,68,0.5)]" : "text-emerald-500 drop-shadow-[0_0_15px_rgba(16,185,129,0.5)]"
                          }`}>
                            {result["cleaning needs"].toUpperCase()}
                          </span>
                      </div>
                    </div>
                  </div>

                  {/* AI Suggestion Box */}
                  <div className={`relative bg-gradient-to-br from-zinc-900 to-black border rounded-3xl p-8 overflow-hidden group ${result["cleaning needs"] === "Yes" ? "border-red-500/30" : "border-white/10"}`}>
                    <div className="relative z-10">
                      <h4 className={`flex items-center gap-3 text-sm font-bold mb-6 uppercase tracking-widest ${result["cleaning needs"] === "Yes" ? "text-red-400" : "text-emerald-400"}`}>
                        <Sparkles className="w-4 h-4" />
                        AI Strategic Protocol
                      </h4>
                      <div className="prose prose-invert prose-sm max-w-none text-zinc-300 leading-relaxed font-light">
                        {result.suggestion}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes scan { 0% { transform: translateY(-100%); } 100% { transform: translateY(200%); } }
        @keyframes pulse-slow { 0%, 100% { opacity: 0.4; transform: scale(1); } 50% { opacity: 0.7; transform: scale(1.1); } }
        @keyframes slide-up { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes slide-down { from { opacity: 0; transform: translateY(-50px); } to { opacity: 1; transform: translateY(0); } }
        .animate-scan { animation: scan 4s linear infinite; }
        .animate-pulse-slow { animation: pulse-slow 8s ease-in-out infinite; }
        .animate-slide-up { animation: slide-up 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .animate-slide-down { animation: slide-down 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
      `}</style>
    </div>
  );
};

// Simple Input Component
const InputGroup = ({ label, icon, name, value, onChange, placeholder, fullWidth, delay = '0' }) => (
  <div className={`space-y-2 opacity-0 animate-slide-up ${fullWidth ? 'col-span-2' : ''}`} style={{ animationDelay: `${delay}ms`, animationFillMode: 'forwards' }}>
    <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2 ml-1">
      <span className="text-emerald-500/80">{React.cloneElement(icon, { size: 12 })}</span> {label}
    </label>
    <div className="relative group">
      <input type="number" name={name} value={value} onChange={onChange} placeholder={placeholder} className="w-full bg-zinc-900/50 border border-white/5 rounded-xl px-4 py-4 text-zinc-300 focus:outline-none focus:border-emerald-500/50 focus:bg-zinc-900 focus:ring-1 focus:ring-emerald-500/50 transition-all hover:border-white/10 hover:bg-zinc-900/80 font-mono text-sm" />
      <div className="absolute bottom-0 left-2 right-2 h-[1px] bg-emerald-500/0 group-hover:bg-emerald-500/50 transition-all duration-500" />
    </div>
  </div>
);

export default App;