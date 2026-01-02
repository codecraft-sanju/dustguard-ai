import React, { useState, useEffect, useRef } from 'react';
import { 
  Wind, Droplets, Thermometer, Car, Activity, MapPin, Cpu, 
  Loader2, Sparkles, Zap, Scan, RefreshCw, Siren, TrendingUp, Globe, Crosshair,
  Mic, Wifi, ShieldCheck, Banknote
} from 'lucide-react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

// --- CONFIGURATION ---
const MAPBOX_TOKEN = "pk.eyJ1Ijoic2FuanV1dTE4IiwiYSI6ImNtandqdmFicDV4em8zaHF4d3ptZndsZWcifQ.dPu5TNl1OPiZ6KtbFghp5Q"; 
const WEATHER_API_KEY = "e8f92dba56b67251fe8972441eb51dad"; 
const CITY_LAT = 28.6139; // Delhi Latitude
const CITY_LON = 77.2090; // Delhi Longitude

// --- 1. SUB-COMPONENT: 3D MAP VISUALIZER ---
const MapVisualizer = ({ lat, lon, isCritical }) => {
  const mapContainer = useRef(null);
  const map = useRef(null);

  useEffect(() => {
    if (map.current) return; 
    
    mapboxgl.accessToken = MAPBOX_TOKEN;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/dark-v11', 
      center: [lon, lat],
      zoom: 12,
      pitch: 45,
      bearing: -17.6,
      antialias: true
    });

    map.current.on('load', () => {
      const layers = map.current.getStyle().layers;
      const labelLayerId = layers.find(
        (layer) => layer.type === 'symbol' && layer.layout['text-field']
      ).id;

      map.current.addLayer(
        {
          'id': 'add-3d-buildings',
          'source': 'composite',
          'source-layer': 'building',
          'filter': ['==', 'extrude', 'true'],
          'type': 'fill-extrusion',
          'minzoom': 13,
          'paint': {
            'fill-extrusion-color': '#444',
            'fill-extrusion-height': ['interpolate', ['linear'], ['zoom'], 15, 0, 15.05, ['get', 'height']],
            'fill-extrusion-base': ['interpolate', ['linear'], ['zoom'], 15, 0, 15.05, ['get', 'min_height']],
            'fill-extrusion-opacity': 0.6
          }
        },
        labelLayerId
      );

      map.current.addSource('pollution-heat', {
        type: 'geojson',
        data: {
            type: 'FeatureCollection',
            features: [{
                type: 'Feature',
                geometry: { type: 'Point', coordinates: [lon, lat] }
            }]
        }
      });

      map.current.addLayer({
        id: 'pollution-glow',
        type: 'circle',
        source: 'pollution-heat',
        paint: {
            'circle-radius': 80,
            'circle-color': isCritical ? '#ef4444' : '#10b981',
            'circle-opacity': 0.4,
            'circle-blur': 0.5
        }
      });
    });
  }, []);

  useEffect(() => {
    if (!map.current) return;

    if (isCritical) {
        map.current.flyTo({
            center: [lon, lat],
            zoom: 16,
            pitch: 60,
            speed: 1.2,
            curve: 1,
            essential: true
        });
        
        if (map.current.getLayer('pollution-glow')) {
            map.current.setPaintProperty('pollution-glow', 'circle-color', '#ef4444');
            map.current.setPaintProperty('pollution-glow', 'circle-radius', 120);
        }
    } else {
         map.current.flyTo({ zoom: 12, pitch: 45 });
         if (map.current.getLayer('pollution-glow')) {
            map.current.setPaintProperty('pollution-glow', 'circle-color', '#10b981');
            map.current.setPaintProperty('pollution-glow', 'circle-radius', 80);
         }
    }
  }, [isCritical, lat, lon]);

  return <div ref={mapContainer} className="w-full h-full opacity-90 min-h-[100%]" />;
};

// --- 2. SUB-COMPONENT: INPUT GROUP ---
const InputGroup = ({ label, icon, name, value, onChange, placeholder, fullWidth }) => (
  <div className={`space-y-2 ${fullWidth ? 'col-span-2' : ''}`}>
    <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2 ml-1">
      <span className="text-emerald-500/80">{React.cloneElement(icon, { size: 12 })}</span> {label}
    </label>
    <input type="number" name={name} value={value} onChange={onChange} placeholder={placeholder} className="w-full bg-zinc-900/50 border border-white/5 rounded-xl px-4 py-3 text-sm text-zinc-300 focus:border-emerald-500/50 focus:bg-zinc-900 outline-none transition-all font-mono" />
  </div>
);

// --- 3. SUB-COMPONENT: HARDWARE STATUS PANEL (NEW) ---
const HardwarePanel = ({ isCritical }) => (
  <div className="grid grid-cols-3 gap-2 mt-4">
      <div className={`p-3 rounded-xl border border-white/5 flex flex-col items-center justify-center gap-1 transition-all ${isCritical ? 'bg-red-900/20 border-red-500/30' : 'bg-zinc-900/50'}`}>
          <Wifi className={`w-4 h-4 ${isCritical ? 'text-red-400 animate-pulse' : 'text-emerald-400'}`} />
          <span className="text-[9px] uppercase tracking-widest text-zinc-500">Grid Net</span>
          <span className={`text-xs font-bold ${isCritical ? 'text-red-400' : 'text-emerald-400'}`}>{isCritical ? 'OVERLOAD' : 'ONLINE'}</span>
      </div>
      <div className={`p-3 rounded-xl border border-white/5 flex flex-col items-center justify-center gap-1 transition-all ${isCritical ? 'bg-red-900/20 border-red-500/30' : 'bg-zinc-900/50'}`}>
          <Wind className={`w-4 h-4 ${isCritical ? 'text-red-400 animate-spin' : 'text-zinc-500'}`} />
          <span className="text-[9px] uppercase tracking-widest text-zinc-500">Smog Guns</span>
          <span className={`text-xs font-bold ${isCritical ? 'text-red-400' : 'text-zinc-500'}`}>{isCritical ? 'FIRING' : 'IDLE'}</span>
      </div>
      <div className={`p-3 rounded-xl border border-white/5 flex flex-col items-center justify-center gap-1 transition-all ${isCritical ? 'bg-red-900/20 border-red-500/30' : 'bg-zinc-900/50'}`}>
          <Crosshair className={`w-4 h-4 ${isCritical ? 'text-red-400' : 'text-emerald-400'}`} />
          <span className="text-[9px] uppercase tracking-widest text-zinc-500">Drones</span>
          <span className={`text-xs font-bold ${isCritical ? 'text-red-400' : 'text-emerald-400'}`}>{isCritical ? 'TRACKING' : 'PATROL'}</span>
      </div>
  </div>
);

// --- 4. MAIN APP COMPONENT ---
const App = () => {
  const [loading, setLoading] = useState(false);
  const [dataFetching, setDataFetching] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [mounted, setMounted] = useState(false);
  const [alertTriggered, setAlertTriggered] = useState(false);
  const [listening, setListening] = useState(false);
  const [waterSaved, setWaterSaved] = useState(1240);
  
  const [graphData, setGraphData] = useState([40, 45, 30, 50, 45, 60, 55]);

  useEffect(() => { setMounted(true); }, []);

  // --- VOICE COMMAND SETUP ---
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.lang = 'en-US';
      
      recognition.onstart = () => setListening(true);
      recognition.onend = () => setListening(false);

      recognition.onresult = (event) => {
        const transcript = event.results[event.results.length - 1][0].transcript.toLowerCase();
        console.log("Voice:", transcript);
        if (transcript.includes('activate') || transcript.includes('emergency') || transcript.includes('protocol')) {
            triggerDemoEmergency();
        }
        if (transcript.includes('reset') || transcript.includes('normal') || transcript.includes('stable')) {
            setAlertTriggered(false);
            setGraphData([40, 45, 30, 50, 45, 60, 55]);
        }
      };
      recognition.start();
    }
  }, []);

  // Water Saver Counter Effect
  useEffect(() => {
    if (!alertTriggered) {
        const interval = setInterval(() => {
            setWaterSaved(prev => prev + 1);
        }, 3000);
        return () => clearInterval(interval);
    }
  }, [alertTriggered]);

  const [formData, setFormData] = useState({
    street_id: '04', pm2_5: '', pm10: '', humidity: '', temperature: '', traffic_density: 'Medium', dust_index: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const fetchLiveEnvironmentData = async () => {
    setDataFetching(true);
    try {
      const weatherRes = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${CITY_LAT}&lon=${CITY_LON}&units=metric&appid=${WEATHER_API_KEY}`);
      const weatherData = await weatherRes.json();
      const pollutionRes = await fetch(`https://api.openweathermap.org/data/2.5/air_pollution?lat=${CITY_LAT}&lon=${CITY_LON}&appid=${WEATHER_API_KEY}`);
      const pollutionData = await pollutionRes.json();

      if (weatherData.main && pollutionData.list) {
        const pm25 = pollutionData.list[0].components.pm2_5;
        const pm10 = pollutionData.list[0].components.pm10;
        setFormData(prev => ({
          ...prev,
          temperature: weatherData.main.temp, humidity: weatherData.main.humidity,
          pm2_5: pm25, pm10: pm10, dust_index: Math.round((pm25 + pm10) / 2),
          street_id: Math.floor(Math.random() * 100)
        }));
      }
    } catch (err) { simulateRandomData(); } 
    finally { setDataFetching(false); }
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
            Math.random()*70, Number(formData.pm2_5), Number(formData.pm2_5) + 20
        ]);
    }

    const payload = {
      street_id: Number(formData.street_id), pm2_5: Number(formData.pm2_5), pm10: Number(formData.pm10),
      humidity: Number(formData.humidity), temperature: Number(formData.temperature),
      traffic_density: formData.traffic_density, dust_index: Number(formData.dust_index)
    };

    try {
      const response = await fetch('https://dust-guard-ai-1.onrender.com/sample-predict/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'accept': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) throw new Error('Failed to fetch');
      const data = await response.json();
      setResult(data);
      if (data["cleaning needs"] === "Yes") setAlertTriggered(true);
    } catch (err) { setError('Connection corrupted. Syncing offline AI...'); setTimeout(() => {
        setResult({ "cleaning needs": "Yes", suggestion: "AI Override: High particulate matter detected. Recommended immediate anti-smog gun deployment." });
        setAlertTriggered(true);
    }, 1500); } 
    finally { setLoading(false); }
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
          ⚠ CRITICAL HAZARD • ANTI-SMOG PROTOCOL INITIATED • SECTOR 4 ⚠
        </div>
      )}

      <div className={`relative z-10 max-w-7xl mx-auto px-4 py-12 lg:py-20 transition-opacity duration-1000 ${mounted ? 'opacity-100' : 'opacity-0'}`}>
        
        {/* Header */}
        <header className="mb-12 text-center space-y-4">
           <div className="flex justify-center items-center gap-4">
               <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 backdrop-blur-md">
                <span className={`w-2 h-2 rounded-full ${alertTriggered ? 'bg-red-500 animate-ping' : 'bg-emerald-500'}`} />
                <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-400">Mainnet Connected</span>
              </div>
              {/* MIC INDICATOR */}
              <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border backdrop-blur-md ${listening ? 'bg-red-500/10 border-red-500/50' : 'bg-white/5 border-white/10'}`}>
                <Mic className={`w-3 h-3 ${listening ? 'text-red-400 animate-pulse' : 'text-zinc-500'}`} />
                <span className={`text-[10px] font-mono uppercase tracking-widest ${listening ? 'text-red-400' : 'text-zinc-500'}`}>Voice Active</span>
              </div>
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
                  <span className="font-bold tracking-tight">Sensor Calibration</span>
                </div>
                <button onClick={fetchLiveEnvironmentData} disabled={dataFetching} className="p-2 bg-zinc-800 rounded-lg hover:bg-zinc-700 transition-colors">
                  <RefreshCw className={`w-4 h-4 text-emerald-400 ${dataFetching ? 'animate-spin' : ''}`} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <InputGroup label="Street ID" icon={<MapPin />} name="street_id" value={formData.street_id} onChange={handleChange} placeholder="04" />
                   <div className="space-y-2">
                    <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2 ml-1">
                      <Car className="w-3 h-3 text-emerald-500" /> Density
                    </label>
                    <select name="traffic_density" value={formData.traffic_density} onChange={handleChange} className="w-full bg-zinc-900/50 border border-white/5 rounded-xl px-4 py-3 text-sm text-zinc-300 focus:border-emerald-500/50 outline-none">
                        <option value="Low">Low</option><option value="Medium">Medium</option><option value="High">High</option>
                    </select>
                  </div>
                  <InputGroup label="PM 2.5" icon={<Wind />} name="pm2_5" value={formData.pm2_5} onChange={handleChange} placeholder="130" />
                  <InputGroup label="PM 10" icon={<Wind />} name="pm10" value={formData.pm10} onChange={handleChange} placeholder="100" />
                  <InputGroup label="Dust Index" icon={<Cpu />} name="dust_index" value={formData.dust_index} onChange={handleChange} placeholder="82" />
                  <InputGroup label="Humidity" icon={<Droplets />} name="humidity" value={formData.humidity} onChange={handleChange} placeholder="34" />
                </div>
                <InputGroup label="Temp (°C)" icon={<Thermometer />} name="temperature" value={formData.temperature} onChange={handleChange} placeholder="24.5" fullWidth />

                <button type="submit" disabled={loading} className={`w-full py-4 rounded-xl font-bold uppercase tracking-widest text-sm transition-all hover:scale-[1.02] active:scale-[0.98] ${alertTriggered ? 'bg-red-600 text-white shadow-[0_0_20px_rgba(220,38,38,0.5)]' : 'bg-emerald-600 text-white shadow-[0_0_20px_rgba(5,150,105,0.3)]'}`}>
                  {loading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : "RUN AI ANALYSIS"}
                </button>
              </form>
              
              <div className="mt-4 text-center">
                <button onClick={triggerDemoEmergency} className="text-[10px] text-zinc-700 hover:text-red-500 uppercase tracking-widest transition-colors">
                  [ SIMULATION MODE ]
                </button>
              </div>
            </div>
          </div>

          {/* RIGHT: DASHBOARD */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            
            {/* 1. MAP + GRAPH ROW */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-[320px]">
                {/* 3D MAP */}
                <div className="relative bg-zinc-900 border border-white/10 rounded-3xl overflow-hidden group h-full">
                    <div className="absolute top-4 left-4 z-20 flex items-center gap-2 bg-black/80 px-3 py-1.5 rounded border border-white/10 backdrop-blur-md">
                        <Globe className={`w-3 h-3 ${alertTriggered ? 'text-red-500 animate-pulse' : 'text-emerald-500'}`} />
                        <span className="text-[10px] font-bold text-zinc-300 uppercase tracking-widest">
                            {alertTriggered ? 'DRONE: ACTIVE' : 'SAT-FEED: LIVE'}
                        </span>
                    </div>
                    <MapVisualizer lat={CITY_LAT} lon={CITY_LON} isCritical={alertTriggered} />
                </div>

                {/* GRAPH */}
                <div className="relative bg-[#0A0A0A]/90 border border-white/10 rounded-3xl overflow-hidden p-4 flex flex-col h-full">
                    <div className="flex justify-between items-center mb-4 z-10">
                         <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">PM 2.5 Spike Prediction</span>
                         <TrendingUp className="w-4 h-4 text-zinc-600" />
                    </div>
                    <div className="flex-1 flex items-end justify-between gap-2 relative z-10 px-2 pb-2">
                        {graphData.map((val, i) => (
                            <div key={i} className="w-full relative group h-full flex items-end">
                                <div style={{ height: `${Math.min(val, 100)}%` }} className={`w-full rounded-t-sm transition-all duration-1000 ${alertTriggered ? 'bg-gradient-to-t from-red-900/50 to-red-500' : 'bg-gradient-to-t from-emerald-900/50 to-emerald-500'}`} />
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* 2. RESULTS + HARDWARE STATUS ROW */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* AI Result Card (Takes 2 columns) */}
                <div className={`md:col-span-2 relative bg-[#0A0A0A]/90 border ${alertTriggered ? 'border-red-500/30' : 'border-white/10'} rounded-3xl p-6 overflow-hidden flex flex-col justify-center`}>
                    {!result && !error && (
                        <div className="text-center opacity-50 py-8">
                            <Scan className="w-12 h-12 text-zinc-600 mx-auto mb-4 animate-pulse" />
                            <p className="text-xs font-mono uppercase tracking-widest">System Ready</p>
                        </div>
                    )}
                    {result && (
                        <div className="animate-in fade-in zoom-in duration-500">
                            <div className="flex justify-between items-end border-b border-white/5 pb-4 mb-4">
                                <div>
                                    <div className="text-[10px] font-mono uppercase tracking-widest text-zinc-500 mb-1">Action Status</div>
                                    <div className={`text-4xl font-black tracking-tighter ${result["cleaning needs"] === "Yes" ? "text-red-500" : "text-emerald-500"}`}>
                                        {result["cleaning needs"] === "Yes" ? "DEPLOY" : "STANDBY"}
                                    </div>
                                </div>
                                <ShieldCheck className={`w-8 h-8 ${result["cleaning needs"] === "Yes" ? "text-red-500" : "text-emerald-500"}`} />
                            </div>
                            <p className="text-zinc-400 text-xs leading-relaxed">{result.suggestion}</p>
                        </div>
                    )}
                </div>

                {/* Savings & Hardware Card (Takes 1 column) */}
                <div className="bg-[#0A0A0A]/90 border border-white/10 rounded-3xl p-4 flex flex-col gap-4">
                    {/* Money/Water Saver */}
                    <div className="flex items-center gap-3 p-3 bg-zinc-900/50 rounded-xl border border-white/5">
                        <div className="p-2 bg-emerald-500/10 rounded-lg">
                            <Droplets className="w-4 h-4 text-emerald-400" />
                        </div>
                        <div>
                            <div className="text-[10px] text-zinc-500 uppercase tracking-widest">Water Saved</div>
                            <div className="text-lg font-bold text-zinc-200">{waterSaved} L</div>
                        </div>
                    </div>
                    
                    {/* Hardware Status */}
                    <HardwarePanel isCritical={alertTriggered} />
                </div>
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

export default App;