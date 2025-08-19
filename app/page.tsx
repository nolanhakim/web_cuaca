"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaSearch,
  FaTemperatureHigh,
  FaMapMarkerAlt,
  FaCloud,
  FaSun,
  FaCloudRain,
  FaSnowflake,
  FaSmog,
  FaBolt,
  FaWind,
  FaTint,
  FaTemperatureLow,
} from "react-icons/fa";
import { WiHumidity, WiBarometer } from "react-icons/wi";

interface WeatherData {
  id: number;
  name: string;
  sys: {
    country: string;
  };
  dt: number;
  timezone: number;
  weather: Array<{
    main: string;
    description: string;
  }>;
  main: {
    temp: number;
    feels_like: number;
    temp_min: number;
    temp_max: number;
    humidity: number;
    pressure: number;
  };
  wind: {
    speed: number;
  };
}

const RealTimeClock = ({ timezoneOffset }: { timezoneOffset: number }) => {
  const [currentTime, setCurrentTime] = useState<Date>(() => {
    const now = new Date();
    const localOffset = now.getTimezoneOffset() * 60;
    const targetOffset = timezoneOffset;
    const totalOffset = (localOffset + targetOffset) * 1000;
    return new Date(now.getTime() + totalOffset);
  });

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      const localOffset = now.getTimezoneOffset() * 60;
      const targetOffset = timezoneOffset;
      const totalOffset = (localOffset + targetOffset) * 1000;
      setCurrentTime(new Date(now.getTime() + totalOffset));
    }, 1000);

    return () => clearInterval(timer);
  }, [timezoneOffset]);

  return (
    <span>
      {currentTime.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      })}
    </span>
  );
};

export default function Home() {
  const [city, setCity] = useState("");
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const fetchWeather = async () => {
    if (!city.trim()) return;

    setIsLoading(true);
    setError("");
    
    try {
      const res = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${process.env.NEXT_PUBLIC_WEATHER_API_KEY}&units=metric`
      );

      if (!res.ok) {
        throw new Error("City not found. Please try another location.");
      }

      const data: WeatherData = await res.json();
      setWeather(data);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unknown error occurred");
      }
      setWeather(null);
    } finally {
      setIsLoading(false);
    }
  };

  const getWeatherIcon = (main: string) => {
    const iconClass = "text-7xl md:text-8xl mb-4";
    switch (main) {
      case "Clear":
        return <FaSun className={`${iconClass} text-yellow-400 animate-pulse`} />;
      case "Clouds":
        return <FaCloud className={`${iconClass} text-gray-300`} />;
      case "Rain":
        return <FaCloudRain className={`${iconClass} text-blue-400 animate-bounce`} />;
      case "Snow":
        return <FaSnowflake className={`${iconClass} text-cyan-300 animate-spin-slow`} />;
      case "Thunderstorm":
        return <FaBolt className={`${iconClass} text-yellow-500 animate-pulse`} />;
      case "Mist":
      case "Smoke":
      case "Haze":
      case "Fog":
        return <FaSmog className={`${iconClass} text-gray-400`} />;
      default:
        return <FaCloud className={`${iconClass} text-gray-300`} />;
    }
  };

  const getBackgroundGradient = () => {
    if (!weather) return "from-blue-900 via-gray-900 to-black";
    
    const weatherMain = weather.weather[0].main;
    switch (weatherMain) {
      case "Clear":
        return "from-blue-400 to-blue-600";
      case "Rain":
        return "from-gray-600 to-blue-800";
      case "Clouds":
        return "from-gray-500 to-gray-700";
      case "Snow":
        return "from-cyan-200 to-blue-300";
      case "Thunderstorm":
        return "from-purple-800 to-gray-900";
      default:
        return "from-blue-900 via-gray-900 to-black";
    }
  };

  return (
    <div className={`flex flex-col items-center justify-center min-h-screen 
      bg-gradient-to-br ${getBackgroundGradient()} text-white p-4 md:p-8 transition-all duration-1000`}>
      
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-2xl text-center mb-8"
      >
        <h1 className="text-4xl md:text-5xl font-extrabold mb-2 tracking-tight">
          WeatherSphere
        </h1>
        <p className="text-blue-200">Get real-time weather updates anywhere</p>
      </motion.header>

      {/* Search Section */}
      <motion.div 
        className="w-full max-w-2xl mb-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <div className="flex flex-col md:flex-row gap-3 w-full">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Enter city name..."
              value={city}
              onChange={(e) => setCity(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && fetchWeather()}
              className="w-full px-5 py-4 rounded-xl bg-white/10 backdrop-blur-sm 
                border border-white/20 focus:border-blue-400 outline-none 
                transition-all duration-300 text-lg placeholder-white/60"
              disabled={isLoading}
            />
            {isLoading && (
              <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              </div>
            )}
          </div>
          <button
            onClick={fetchWeather}
            disabled={isLoading || !city.trim()}
            className={`px-6 py-4 rounded-xl flex items-center justify-center gap-2 
              transition-all duration-300 text-lg font-medium
              ${isLoading || !city.trim() 
                ? 'bg-gray-600 cursor-not-allowed' 
                : 'bg-blue-600 hover:bg-blue-700 active:scale-95'}`}
          >
            <FaSearch /> {isLoading ? 'Searching...' : 'Search'}
          </button>
        </div>
      </motion.div>

      {/* Error Message */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="w-full max-w-2xl mb-6"
          >
            <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4 text-center">
              <p className="text-red-200 font-medium">{error}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Weather Card */}
      <AnimatePresence>
        {weather && (
          <motion.div
            key={weather.id}
            initial={{ opacity: 0, y: 40, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="w-full max-w-2xl"
          >
            <div className="bg-white/10 backdrop-blur-lg p-6 md:p-8 rounded-2xl 
              shadow-2xl border border-white/20 overflow-hidden relative">
              
              {/* Decorative elements */}
              <div className="absolute -top-20 -right-20 w-40 h-40 rounded-full 
                bg-white/10 blur-xl"></div>
              <div className="absolute -bottom-10 -left-10 w-32 h-32 rounded-full 
                bg-blue-400/20 blur-xl"></div>
              
              <div className="relative z-10">
                {/* Location and Date */}
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h2 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
                      <FaMapMarkerAlt className="text-blue-300" /> 
                      {weather.name}, {weather.sys.country}
                    </h2>
                    <p className="text-white/80 text-sm mt-1">
                      {new Date().toLocaleDateString('en-US', { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-white/60">Local Time</p>
                    <p className="text-lg font-medium">
                      <RealTimeClock timezoneOffset={weather.timezone} />
                    </p>
                  </div>
                </div>

                {/* Main Weather Info */}
                <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-8">
                  <div className="text-center md:text-left">
                    {getWeatherIcon(weather.weather[0].main)}
                    <p className="capitalize text-xl tracking-wide -mt-2">
                      {weather.weather[0].description}
                    </p>
                  </div>
                  
                  <div className="text-center">
                    <p className="text-6xl md:text-7xl font-extrabold mb-2 flex items-center justify-center gap-2">
                      {Math.round(weather.main.temp)}°C
                    </p>
                    <div className="flex gap-4 justify-center">
                      <p className="flex items-center gap-1 text-sm">
                        <FaTemperatureLow /> {Math.round(weather.main.temp_min)}°
                      </p>
                      <p className="flex items-center gap-1 text-sm">
                        <FaTemperatureHigh /> {Math.round(weather.main.temp_max)}°
                      </p>
                    </div>
                  </div>
                </div>

                {/* Weather Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="bg-white/10 p-4 rounded-xl backdrop-blur-sm border border-white/10">
                    <div className="flex items-center gap-2 mb-1">
                      <WiHumidity className="text-2xl text-blue-300" />
                      <span className="text-sm font-medium">Humidity</span>
                    </div>
                    <p className="text-xl font-bold">{weather.main.humidity}%</p>
                  </div>
                  
                  <div className="bg-white/10 p-4 rounded-xl backdrop-blur-sm border border-white/10">
                    <div className="flex items-center gap-2 mb-1">
                      <FaWind className="text-blue-300" />
                      <span className="text-sm font-medium">Wind</span>
                    </div>
                    <p className="text-xl font-bold">{weather.wind.speed} m/s</p>
                  </div>
                  
                  <div className="bg-white/10 p-4 rounded-xl backdrop-blur-sm border border-white/10">
                    <div className="flex items-center gap-2 mb-1">
                      <WiBarometer className="text-2xl text-blue-300" />
                      <span className="text-sm font-medium">Pressure</span>
                    </div>
                    <p className="text-xl font-bold">{weather.main.pressure} hPa</p>
                  </div>
                  
                  <div className="bg-white/10 p-4 rounded-xl backdrop-blur-sm border border-white/10">
                    <div className="flex items-center gap-2 mb-1">
                      <FaTint className="text-blue-300" />
                      <span className="text-sm font-medium">Feels Like</span>
                    </div>
                    <p className="text-xl font-bold">{Math.round(weather.main.feels_like)}°C</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Empty State */}
      {!weather && !error && !isLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-12 text-center max-w-md"
        >
          <div className="bg-white/5 p-8 rounded-2xl border border-dashed border-white/20">
            <FaSearch className="text-4xl mx-auto text-white/30 mb-4" />
            <h3 className="text-xl font-medium mb-2">Search for Weather</h3>
            <p className="text-white/60">
              Enter a city name above to get current weather information, including temperature, humidity, and more.
            </p>
          </div>
        </motion.div>
      )}
    </div>
  );
}