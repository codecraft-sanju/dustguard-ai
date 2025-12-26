import React, { useState } from 'react';
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
  Lightbulb
} from 'lucide-react';

// Helper component to format the markdown-style text from API
const RecommendationDisplay = ({ text }) => {
  if (!text) return null;

  // Split text to separate intro from points (assuming points start with '*')
  const sections = text.split('*');
  const intro = sections[0]; // The text before the first bullet
  const points = sections.slice(1); // The bullet points

  return (
    <div className="space-y-4">
      {/* Intro Text */}
      {intro && (
        <p className="text-zinc-300 text-sm leading-relaxed mb-4 border-b border-white/5 pb-4">
          {intro}
        </p>
      )}

      {/* Bullet Points */}
      <div className="grid gap-3">
        {points.map((point, index) => {
          // Parse bold text formatted as **Text**
          const parts = point.split(/(\*\*.*?\*\*)/g);
          
          return (
            <div key={index} className="flex gap-3 items-start bg-white/5 p-4 rounded-xl border border-white/5 hover:border-emerald-500/30 transition-colors group">
              <div className="mt-1 bg-emerald-500/20 p-1.5 rounded-full shrink-0 group-hover:bg-emerald-500/30 transition-colors">
                <Lightbulb className="w-3.5 h-3.5 text-emerald-400" />
              </div>
              <p className="text-zinc-300 text-sm leading-relaxed">
                {parts.map((part, i) => {
                  if (part.startsWith('**') && part.endsWith('**')) {
                    // Remove asterisks and render bold/colored
                    return (
                      <span key={i} className="block text-emerald-300 font-semibold mb-1 text-base">
                        {part.slice(2, -2)}
                      </span>
                    );
                  }
                  return <span key={i}>{part}</span>;
                })}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const App = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  // Initial form state
  const [formData, setFormData] = useState({
    street_id: '',
    pm2_5: '',
    pm10: '',
    humidity: '',
    temperature: '',
    traffic_density: 'High', // Default value
    dust_index: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    // Prepare payload
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
        headers: {
          'Content-Type': 'application/json',
          'accept': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error('Failed to fetch prediction');
      }

      const data = await response.json();
      setResult(data);
    } catch (err) {
      setError('Error connecting to DustGuard AI Model. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans selection:bg-emerald-500/30">
      {/* Background Gradient Mesh */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-emerald-500/5 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-teal-500/5 blur-[120px]" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 py-12 lg:py-20">
        
        {/* Header Section */}
        <header className="mb-16 text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium tracking-wider uppercase">
            <Sparkles className="w-3 h-3" />
            AI Powered Environment Control
          </div>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white via-zinc-200 to-zinc-500">
            DustGuard AI
          </h1>
          <p className="text-zinc-400 max-w-2xl mx-auto text-lg">
            Advanced particulate matter analysis and automated cleaning scheduling system.
          </p>
        </header>

        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-start">
          
          {/* Input Form Card */}
          <div className="bg-zinc-900/50 backdrop-blur-xl border border-white/5 rounded-3xl p-6 md:p-8 shadow-2xl shadow-black/50">
            <div className="flex items-center gap-3 mb-8 border-b border-white/5 pb-6">
              <Activity className="w-5 h-5 text-emerald-500" />
              <h2 className="text-xl font-semibold text-white">Sensor Input Parameters</h2>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-2 gap-5">
                {/* Street ID */}
                <InputGroup 
                  label="Street ID" 
                  icon={<MapPin className="w-4 h-4" />}
                  name="street_id"
                  value={formData.street_id}
                  onChange={handleChange}
                  placeholder="e.g. 4"
                />
                
                {/* Traffic Density */}
                <div className="space-y-2">
                  <label className="text-xs font-medium text-zinc-400 uppercase tracking-wider flex items-center gap-2">
                    <Car className="w-4 h-4 text-emerald-500" /> Traffic Density
                  </label>
                  <div className="relative">
                    <select
                      name="traffic_density"
                      value={formData.traffic_density}
                      onChange={handleChange}
                      className="w-full bg-zinc-950/50 border border-white/10 rounded-xl px-4 py-3.5 text-zinc-200 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all appearance-none cursor-pointer hover:bg-zinc-900"
                    >
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                      <svg className="w-4 h-4 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                    </div>
                  </div>
                </div>

                {/* PM 2.5 */}
                <InputGroup 
                  label="PM 2.5 Level" 
                  icon={<Wind className="w-4 h-4" />}
                  name="pm2_5"
                  value={formData.pm2_5}
                  onChange={handleChange}
                  placeholder="e.g. 130"
                />

                {/* PM 10 */}
                <InputGroup 
                  label="PM 10 Level" 
                  icon={<Wind className="w-4 h-4" />}
                  name="pm10"
                  value={formData.pm10}
                  onChange={handleChange}
                  placeholder="e.g. 100"
                />

                {/* Dust Index */}
                <InputGroup 
                  label="Dust Index" 
                  icon={<Cpu className="w-4 h-4" />}
                  name="dust_index"
                  value={formData.dust_index}
                  onChange={handleChange}
                  placeholder="e.g. 82"
                />

                {/* Humidity */}
                <InputGroup 
                  label="Humidity %" 
                  icon={<Droplets className="w-4 h-4" />}
                  name="humidity"
                  value={formData.humidity}
                  onChange={handleChange}
                  placeholder="e.g. 34"
                />
              </div>

              {/* Temperature - Full Width */}
              <InputGroup 
                label="Temperature (°C)" 
                icon={<Thermometer className="w-4 h-4" />}
                name="temperature"
                value={formData.temperature}
                onChange={handleChange}
                placeholder="e.g. 4"
                fullWidth
              />

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold py-4 rounded-xl shadow-lg shadow-emerald-900/20 transform transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-4"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Processing Data...
                  </>
                ) : (
                  <>
                    <Cpu className="w-5 h-5" />
                    Analyze Air Quality
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Results Section */}
          <div className="space-y-6">
            {!result && !error && (
              <div className="h-full min-h-[400px] flex flex-col items-center justify-center text-zinc-500 bg-zinc-900/30 backdrop-blur-md border border-white/5 rounded-3xl border-dashed">
                <Wind className="w-16 h-16 mb-4 opacity-20" />
                <p>Waiting for sensor input data...</p>
              </div>
            )}

            {error && (
               <div className="p-6 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-200 flex items-center gap-4">
                 <AlertTriangle className="w-6 h-6 text-red-500" />
                 {error}
               </div>
            )}

            {result && (
              <>
                {/* Status Card */}
                <div className={`p-8 rounded-3xl border backdrop-blur-xl transition-all duration-500 ${
                  result["cleaning needs"] === "Yes" 
                    ? 'bg-amber-500/10 border-amber-500/20 shadow-[0_0_30px_rgba(245,158,11,0.1)]' 
                    : 'bg-emerald-500/10 border-emerald-500/20 shadow-[0_0_30px_rgba(16,185,129,0.1)]'
                }`}>
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-medium uppercase tracking-wider opacity-70 mb-1">Analysis Result</p>
                      <h3 className="text-3xl font-bold text-white mb-2">
                        Cleaning Required: 
                        <span className={result["cleaning needs"] === "Yes" ? "text-amber-400 ml-2" : "text-emerald-400 ml-2"}>
                          {result["cleaning needs"].toUpperCase()}
                        </span>
                      </h3>
                      <p className="text-zinc-400 text-sm">Status: {result.status}</p>
                    </div>
                    <div className={`p-3 rounded-full ${
                      result["cleaning needs"] === "Yes" ? "bg-amber-500/20 text-amber-400" : "bg-emerald-500/20 text-emerald-400"
                    }`}>
                      {result["cleaning needs"] === "Yes" ? <AlertTriangle size={32} /> : <CheckCircle2 size={32} />}
                    </div>
                  </div>
                </div>

                {/* AI Suggestion Card - UPDATED SECTION */}
                <div className="bg-zinc-900/80 backdrop-blur-xl border border-white/10 rounded-3xl p-8 relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-32 bg-emerald-500/5 blur-[80px] rounded-full pointer-events-none" />
                  
                  <h4 className="flex items-center gap-2 text-lg font-semibold text-emerald-400 mb-6">
                    <Sparkles className="w-5 h-5" />
                    AI Recommendations
                  </h4>
                  
                  {/* Using the custom parser component here */}
                  <RecommendationDisplay text={result.suggestion} />
                  
                </div>
              </>
            )}
          </div>
        </div>
        
        {/* Footer */}
        <footer className="mt-20 text-center text-zinc-600 text-sm">
          <p>© 2025 DustGuard AI • Powered by Advanced Machine Learning</p>
        </footer>
      </div>
    </div>
  );
};

// Reusable Input Component
const InputGroup = ({ label, icon, name, value, onChange, placeholder, fullWidth }) => (
  <div className={`space-y-2 ${fullWidth ? 'col-span-2' : ''}`}>
    <label className="text-xs font-medium text-zinc-400 uppercase tracking-wider flex items-center gap-2">
      <span className="text-emerald-500">{icon}</span> {label}
    </label>
    <input
      type="number"
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className="w-full bg-zinc-950/50 border border-white/10 rounded-xl px-4 py-3.5 text-zinc-200 placeholder:text-zinc-700 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all hover:bg-zinc-900"
    />
  </div>
);

export default App;