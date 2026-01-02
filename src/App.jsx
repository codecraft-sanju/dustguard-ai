import React, { useState, useEffect } from 'react';
import { 
  Wind, Droplets, Thermometer, Car, Activity, MapPin, Cpu, 
  Loader2, Sparkles, Zap, Scan, RefreshCw, Siren, TrendingUp, Globe, Crosshair
} from 'lucide-react';

// --- CONFIGURATION ---
const WEATHER_API_KEY = "e8f92dba56b67251fe8972441eb51dad"; 
const CITY_LAT = 28.6139; // Delhi Latitude
const CITY_LON = 77.2090; // Delhi Longitude

const App = () => {
  const [loading, setLoading] = useState(false);
  const [dataFetching, setDataFetching] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [mounted, setMounted] = useState(false);
  const [alertTriggered, setAlertTriggered] = useState(false);
  
  // Graph data state
  const [graphData, setGraphData] = useState([40, 45, 30, 50, 45, 60, 55]);

  useEffect(() => { setMounted(true); }, []);

  const [formData, setFormData] = useState({
    street_id: '04', // Default ID set kiya taki map par kuch dikhe
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

  const fetchLiveEnvironmentData = async () => {
    setDataFetching(true);
    setError(null);
    try {
      const weatherRes = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${CITY_LAT}&lon=${CITY_LON}&units=metric&appid=${WEATHER_API_KEY}`);
      const weatherData = await weatherRes.json();
      const pollutionRes = await fetch(`https://api.openweathermap.org/data/2.5/air_pollution?lat=${CITY_LAT}&lon=${CITY_LON}&appid=${WEATHER_API_KEY}`);
      const pollutionData = await pollutionRes.json();

      if (weatherData.main && pollutionData.list) {
        const pm25 = pollutionData.list[0].components.pm2_5;
        const pm10 = pollutionData.list[0].components.pm10;
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
      console.error("API Error", err);
      simulateRandomData();
    } finally {
      setDataFetching(false);
    }
  };

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

  // --- DEMO MODE ---
  const triggerDemoEmergency = () => {
    setFormData({
      street_id: 101, pm2_5: 350.5, pm10: 410.2, humidity: 20, 
      temperature: 42, traffic_density: 'High', dust_index: 380
    });
    setGraphData([60, 80, 120, 200, 350, 400, 420]);
    setTimeout(() => { setAlertTriggered(true); }, 500);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);
    setAlertTriggered(false);

    if (!alertTriggered) {
        setGraphData([
            Math.random()*50, Math.random()*60, Math.random()*50, 
            Math.random()*70, Number(formData.pm2_5), Number(formData.pm2_5) + 20, Number(formData.pm2_5) - 10
        ]);
    }

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
      if (data["cleaning needs"] === "Yes") setAlertTriggered(true);
    } catch (err) {
      setError('Connection corrupted. Unable to sync with AI Model.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-[#050505] text-zinc-100 font-sans selection:bg-emerald-500/30 overflow-hidden">
      
      {/* Background FX */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className={`absolute top-[-20%] left-[-10%] w-[70%] h-[70%] rounded-full blur-[120px] transition-all duration-1000 ${alertTriggered ? 'bg-red-900/30' : 'bg-emerald-900/10'}`} />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:100px_100px]" />
      </div>

      {/* Emergency Overlay */}
      {alertTriggered && (
        <div className="fixed top-0 left-0 w-full bg-red-500 text-black font-bold text-center py-2 z-50 animate-pulse tracking-widest uppercase text-sm">
          ⚠ Critical Environment Hazard Detected • Anti-Smog Protocol Initiated ⚠
        </div>
      )}

      <div className={`relative z-10 max-w-7xl mx-auto px-4 py-12 lg:py-20 transition-opacity duration-1000 ${mounted ? 'opacity-100' : 'opacity-0'}`}>
        
        {/* Header */}
        <header className="mb-12 text-center space-y-4">
           <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 backdrop-blur-md">
            <span className={`w-2 h-2 rounded-full ${alertTriggered ? 'bg-red-500 animate-ping' : 'bg-emerald-500'}`} />
            <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-400">Mainnet Connected</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white to-zinc-600">
            DustGuard<span className={alertTriggered ? "text-red-500" : "text-emerald-500"}>.AI</span>
          </h1>
        </header>

        <div className="grid lg:grid-cols-12 gap-6 items-stretch">
          
          {/* LEFT: INPUT PANEL */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            <div className="bg-[#0A0A0A]/90 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-2xl relative overflow-hidden">
               <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-${alertTriggered ? 'red' : 'emerald'}-500 to-transparent opacity-50`} />

              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-3">
                  <Activity className={`w-5 h-5 ${alertTriggered ? 'text-red-500' : 'text-emerald-500'}`} />
                  <span className="font-bold tracking-tight">Data Calibration</span>
                </div>
                <button onClick={fetchLiveEnvironmentData} disabled={dataFetching} className="p-2 bg-zinc-800 rounded-lg hover:bg-zinc-700 transition-colors">
                  <RefreshCw className={`w-4 h-4 text-emerald-400 ${dataFetching ? 'animate-spin' : ''}`} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <InputGroup label="Street ID" icon={<MapPin />} name="street_id" value={formData.street_id} onChange={handleChange} placeholder="04" delay="0" />
                  
                   <div className="space-y-2">
                    <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2 ml-1">
                      <Car className="w-3 h-3 text-emerald-500" /> Density
                    </label>
                    <select name="traffic_density" value={formData.traffic_density} onChange={handleChange} className="w-full bg-zinc-900/50 border border-white/5 rounded-xl px-4 py-3 text-sm text-zinc-300 focus:border-emerald-500/50 outline-none">
                        <option value="Low">Low</option><option value="Medium">Medium</option><option value="High">High</option>
                    </select>
                  </div>

                  <InputGroup label="PM 2.5" icon={<Wind />} name="pm2_5" value={formData.pm2_5} onChange={handleChange} placeholder="130" delay="100" />
                  <InputGroup label="PM 10" icon={<Wind />} name="pm10" value={formData.pm10} onChange={handleChange} placeholder="100" delay="150" />
                  <InputGroup label="Dust Index" icon={<Cpu />} name="dust_index" value={formData.dust_index} onChange={handleChange} placeholder="82" delay="200" />
                  <InputGroup label="Humidity" icon={<Droplets />} name="humidity" value={formData.humidity} onChange={handleChange} placeholder="34" delay="250" />
                </div>
                <InputGroup label="Temp (°C)" icon={<Thermometer />} name="temperature" value={formData.temperature} onChange={handleChange} placeholder="24.5" fullWidth />

                <button type="submit" disabled={loading} className={`w-full py-4 rounded-xl font-bold uppercase tracking-widest text-sm transition-all hover:scale-[1.02] active:scale-[0.98] ${alertTriggered ? 'bg-red-600 text-white shadow-[0_0_20px_rgba(220,38,38,0.5)]' : 'bg-emerald-600 text-white shadow-[0_0_20px_rgba(5,150,105,0.3)]'}`}>
                  {loading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : "Run Analysis"}
                </button>
              </form>
              
              <div className="mt-4 text-center">
                <button onClick={triggerDemoEmergency} className="text-[10px] text-zinc-700 hover:text-red-500 uppercase tracking-widest transition-colors">
                  [ Enable Simulation Protocol ]
                </button>
              </div>
            </div>
          </div>

          {/* RIGHT: DASHBOARD (MAP + GRAPH + RESULT) */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            
            {/* Top Row: REAL MAP & Graph */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-64">
                
                {/* 1. REAL SATELLITE MAP with TARGET OVERLAY (Updated) */}
                <div className="relative bg-zinc-900 border border-white/10 rounded-3xl overflow-hidden group">
                    {/* Header Overlay */}
                    <div className="absolute top-4 left-4 z-20 flex items-center gap-2 bg-white/90 px-2 py-1 rounded shadow-lg backdrop-blur-sm">
                        <Globe className="w-3 h-3 text-blue-600" />
                        <span className="text-[10px] font-bold text-zinc-800 uppercase tracking-widest">Live Sat-Feed</span>
                    </div>

                    {/* The Map */}
                    <iframe 
                        width="100%" 
                        height="100%" 
                        title="Live Map Feed"
                        frameBorder="0" 
                        scrolling="no" 
                        marginHeight="0" 
                        marginWidth="0" 
                        src={`https://www.openstreetmap.org/export/embed.html?bbox=${CITY_LON-0.05}%2C${CITY_LAT-0.05}%2C${CITY_LON+0.05}%2C${CITY_LAT+0.05}&amp;layer=mapnik&amp;marker=${CITY_LAT}%2C${CITY_LON}`}
                        className="w-full h-full opacity-80"
                    ></iframe>

                    {/* --- NEW: VISIBLE MARKER/TARGET SYSTEM --- */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30 pointer-events-none flex flex-col items-center justify-center">
                        {/* The Pulse Effect */}
                        <div className={`relative flex items-center justify-center w-12 h-12`}>
                            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${alertTriggered ? 'bg-red-500' : 'bg-emerald-500'}`}></span>
                            <div className={`relative inline-flex items-center justify-center rounded-full h-8 w-8 bg-black border-2 ${alertTriggered ? 'border-red-500' : 'border-emerald-500'}`}>
                                <Crosshair className={`w-4 h-4 ${alertTriggered ? 'text-red-500' : 'text-emerald-500'}`} />
                            </div>
                        </div>
                        
                        {/* Info Tag pointing to the location */}
                        <div className={`mt-2 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-widest backdrop-blur-md border ${alertTriggered ? 'bg-red-500/80 text-white border-red-400' : 'bg-black/70 text-emerald-400 border-emerald-500/50'}`}>
                             STREET ID: {formData.street_id || 'SCANNING...'}
                        </div>
                    </div>
                </div>

                {/* 2. PREDICTION GRAPH */}
                <div className="relative bg-[#0A0A0A]/90 border border-white/10 rounded-3xl overflow-hidden p-4 flex flex-col">
                    <div className="flex justify-between items-center mb-4 z-10">
                         <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">PM 2.5 Forecast</span>
                         <TrendingUp className="w-4 h-4 text-zinc-600" />
                    </div>
                    
                    <div className="flex-1 flex items-end justify-between gap-2 relative z-10 px-2 pb-2">
                        {graphData.map((val, i) => (
                            <div key={i} className="w-full relative group">
                                <div 
                                    style={{ height: `${Math.min(val, 100)}%` }} 
                                    className={`w-full rounded-t-sm transition-all duration-1000 ${alertTriggered ? 'bg-gradient-to-t from-red-900/50 to-red-500' : 'bg-gradient-to-t from-emerald-900/50 to-emerald-500'}`}
                                />
                            </div>
                        ))}
                    </div>
                    <div className="absolute inset-0 border-t border-white/5 top-1/2" />
                    <div className="absolute inset-0 border-t border-white/5 top-1/4" />
                    <div className="absolute inset-0 border-t border-white/5 top-3/4" />
                </div>
            </div>

            {/* Bottom: Result Output */}
            <div className={`flex-1 relative bg-[#0A0A0A]/90 border ${alertTriggered ? 'border-red-500/30 shadow-[0_0_30px_rgba(220,38,38,0.1)]' : 'border-white/10'} rounded-3xl p-8 overflow-hidden flex flex-col justify-center min-h-[300px]`}>
               
               <div className={`absolute inset-0 bg-gradient-to-b from-transparent via-emerald-500/5 to-transparent h-[20%] animate-scan pointer-events-none ${alertTriggered ? 'via-red-500/10' : ''}`} />

               {!result && !error && (
                <div className="text-center opacity-50">
                    <Scan className="w-16 h-16 text-zinc-600 mx-auto mb-4 animate-pulse" />
                    <p className="text-sm font-mono uppercase tracking-widest">Awaiting Input Stream...</p>
                </div>
               )}

               {result && (
                 <div className="animate-in fade-in zoom-in duration-500">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-end border-b border-white/5 pb-6 mb-6">
                        <div>
                            <div className="text-[10px] font-mono uppercase tracking-widest text-zinc-500 mb-2">Cleaning Protocol Status</div>
                            <div className={`text-6xl font-black tracking-tighter ${result["cleaning needs"] === "Yes" ? "text-red-500 drop-shadow-[0_0_20px_rgba(220,38,38,0.5)]" : "text-emerald-500 drop-shadow-[0_0_20px_rgba(5,150,105,0.5)]"}`}>
                                {result["cleaning needs"] === "Yes" ? "DEPLOY" : "STANDBY"}
                            </div>
                        </div>
                        <div className="mt-4 md:mt-0">
                            <div className={`px-4 py-2 rounded-lg border text-xs font-bold uppercase tracking-widest ${result["cleaning needs"] === "Yes" ? "bg-red-500/10 border-red-500 text-red-400" : "bg-emerald-500/10 border-emerald-500 text-emerald-400"}`}>
                                {result["cleaning needs"] === "Yes" ? "Action Required" : "Optimal Conditions"}
                            </div>
                        </div>
                    </div>

                    <div className="relative">
                        <div className="absolute -left-4 top-0 bottom-0 w-1 bg-gradient-to-b from-transparent via-zinc-700 to-transparent" />
                        <h4 className="flex items-center gap-2 text-sm font-bold text-zinc-300 mb-2 uppercase tracking-widest">
                            <Sparkles className="w-4 h-4 text-purple-400" /> AI Strategy
                        </h4>
                        <p className="text-zinc-400 leading-relaxed font-light text-sm md:text-base">
                            {result.suggestion}
                        </p>
                    </div>
                 </div>
               )}
            </div>

          </div>
        </div>
      </div>
      
      <style>{`
        @keyframes scan { 0% { transform: translateY(-100%); } 100% { transform: translateY(500%); } }
        .animate-scan { animation: scan 3s linear infinite; }
      `}</style>
    </div>
  );
};

const InputGroup = ({ label, icon, name, value, onChange, placeholder, fullWidth, delay }) => (
  <div className={`space-y-2 ${fullWidth ? 'col-span-2' : ''}`}>
    <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2 ml-1">
      <span className="text-emerald-500/80">{React.cloneElement(icon, { size: 12 })}</span> {label}
    </label>
    <input type="number" name={name} value={value} onChange={onChange} placeholder={placeholder} className="w-full bg-zinc-900/50 border border-white/5 rounded-xl px-4 py-3 text-sm text-zinc-300 focus:border-emerald-500/50 focus:bg-zinc-900 outline-none transition-all font-mono" />
  </div>
);

export default App;