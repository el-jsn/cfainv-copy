import React, { useState, useEffect, useCallback, useRef, memo } from "react";
import { Clock, Maximize, Minimize } from "lucide-react";
import axiosInstance from "./axiosInstance";
import playbackVid from "../assets/videoplayback.mp4";

const DayCard = memo(({ entry, currentDay, closures, messages }) => {
  const isToday = entry.day === currentDay;
  const closure = closures.find(c => {
    const closureStartDate = new Date(c.date);
    const closureEndDate = new Date(closureStartDate);

    if (c.duration) {
      const { value: durationValue, unit: durationUnit } = c.duration;
      const daysToAdd = durationUnit === "weeks" ? (7 * durationValue) - 1 : durationValue - 1;
      closureEndDate.setUTCDate(closureStartDate.getUTCDate() + daysToAdd);
    }

    const today = new Date();
    const todayUTC = new Date(Date.UTC(today.getFullYear(), today.getMonth(), today.getDate()));
    const currentWeekStart = new Date(todayUTC);
    currentWeekStart.setUTCDate(todayUTC.getUTCDate() - todayUTC.getUTCDay());
    const currentWeekEnd = new Date(currentWeekStart);
    currentWeekEnd.setUTCDate(currentWeekStart.getUTCDate() + 6);

    if (!(closureStartDate <= currentWeekEnd && closureEndDate >= currentWeekStart)) {
      return false;
    }

    const daysToAddForEntry = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
      .indexOf(entry.day) - todayUTC.getUTCDay();
    const entryDate = new Date(todayUTC);
    entryDate.setUTCDate(todayUTC.getUTCDate() + daysToAddForEntry);

    return entryDate >= closureStartDate && entryDate <= closureEndDate;
  });

  return (
    <div
      key={entry.day}
      className={`flex flex-col min-h-[24rem] sm:min-h-[28rem] lg:min-h-[32rem] transition-all duration-200
        ${isToday
          ? 'ring-2 ring-blue-500 shadow-lg border-transparent'
          : 'border border-gray-200 hover:shadow-md'
        } rounded-lg md:rounded-xl`}
    >
      <div
        className={`p-3 sm:p-4 rounded-t-lg md:rounded-t-xl font-semibold text-center
          ${isToday
            ? 'bg-blue-500 text-white'
            : 'bg-gradient-to-r from-gray-50 to-gray-100'
          }`}
      >
        <div className="text-base sm:text-lg">{entry.day}</div>
        {messages.find(msg => msg.day === entry.day) && (
          <div className="mt-2 text-xs sm:text-sm bg-yellow-50 p-2 sm:p-3 rounded-lg text-yellow-800 border border-yellow-200">
            {messages.find(msg => msg.day === entry.day).message}
          </div>
        )}
      </div>

      {closure ? (
        <div className="flex-1 flex flex-col justify-center items-center p-4 sm:p-6 bg-gradient-to-br from-red-50 via-red-100 to-red-50 relative overflow-hidden">
          <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
            {[...Array(15)].map((_, i) => (
              <circle
                key={i}
                cx={`${Math.random() * 100}%`}
                cy={`${Math.random() * 100}%`}
                r={`${Math.random() * 30 + 5}`}
                fill="rgba(239, 68, 68, 0.1)"
                className="animate-float"
                style={{
                  animationDuration: `${Math.random() * 10 + 20}s`,
                  animationDelay: `${i * -0.5}s`
                }}
              />
            ))}
          </svg>
          <div className="relative z-10 flex flex-col items-center">
            <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-red-600 mb-4">
              CLOSED
            </div>
            <div className="px-4 sm:px-6 py-2 sm:py-3 bg-white rounded-lg md:rounded-xl shadow-lg border-2 border-red-200 transition-all duration-300 hover:shadow-xl hover:scale-105 backdrop-blur-sm bg-opacity-80">
              <div className="text-center text-red-800 font-semibold text-sm sm:text-base">
                {closure.reason}
              </div>
            </div>
          </div>
          <div className="absolute top-0 left-0 w-16 h-16 bg-red-200 rounded-br-full opacity-50"></div>
          <div className="absolute bottom-0 right-0 w-24 h-24 bg-red-200 rounded-tl-full opacity-50"></div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col gap-2 sm:gap-3 p-2 sm:p-4">
          {[
            { name: "Filets", data: entry.filets, bg: "bg-blue-300 text-gray-800" },
            { name: "Spicy Filets", data: entry.spicy, bg: "bg-purple-300 text-gray-800" },
            { name: "Grilled Fillets", data: entry.grilledFilets, bg: "bg-amber-100 text-gray-800" },
            { name: "Grilled Nuggets", data: entry.grilledNuggets, bg: "bg-gray-200 text-gray-800" },
            { name: "Nuggets", data: entry.nuggets, bg: "bg-pink-300 text-gray-800" },
            { name: "Spicy Strips", data: entry.strips, bg: "bg-red-400 text-gray-800" },
          ].map((item, index) => (
            <div
              key={index}
              className={`flex-1 ${item.bg} p-2 sm:p-3 md:p-4 rounded-lg transition-all duration-200
                hover:shadow-sm flex flex-col justify-center items-center`}
            >
              <div className="font-medium text-center mb-1 text-sm sm:text-base">{item.name}</div>
              <div className={`text-center text-sm sm:text-base ${item.data.modified ? "text-red-700 font-bold" : ""}`}>
                {item.data.cases > 0 && <div>{item.data.cases} cases</div>}
                {item.data.bags > 0 && <div>{item.data.bags} bags</div>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
});

const ThawingCabinet = () => {
  const [salesData, setSalesData] = useState([]);
  const [filetsUtp, setFiletsUtp] = useState(0);
  const [spicyUtp, setSpicyUtp] = useState(0);
  const [grilledFiletsUtp, setGrilledFiletsUtp] = useState(0);
  const [grilledNuggetsUtp, setGrilledNuggetsUtp] = useState(0);
  const [nuggetsUtp, setNuggetsUtp] = useState(0);
  const [stripsUtp, setStripsUtp] = useState(0);
  const [calculatedData, setCalculatedData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [adjustments, setAdjustments] = useState([]);
  const [closures, setClosures] = useState([]);
  const [wakeLock, setWakeLock] = useState(null);
  const [messages, setMessages] = useState([]);
  const adjustmentsRef = useRef(adjustments);

  useEffect(() => {
    adjustmentsRef.current = adjustments;
  }, [adjustments]);

  const requestWakeLock = async () => {
    if ('wakeLock' in navigator) {
      try {
        const lock = await navigator.wakeLock.request('screen');
        setWakeLock(lock);
        lock.addEventListener('release', () => {
          setWakeLock(null);
        });
      } catch (err) {
        console.error(`Wake Lock error: ${err.name}, ${err.message}`);
      }
    } else {
      console.warn('Wake Lock API not supported. Using fallback for iOS devices.');
      const video = document.createElement('video');
      video.src = playbackVid;
      video.loop = true;
      video.muted = true;
      video.style.display = 'none';
      document.body.appendChild(video);
      video.play().catch(err => console.error('Video playback failed:', err));
    }
  };

  useEffect(() => {
    requestWakeLock();

    return () => {
      if (wakeLock) {
        wakeLock.release();
      }
      // Cleanup for fallback video
      const video = document.querySelector('video[src="' + playbackVid + '"]');
      if (video) {
        document.body.removeChild(video);
      }
    };
  }, []);

  useEffect(() => {
    if (!wakeLock) {
      requestWakeLock();
    }
  }, [wakeLock]);

  const getCurrentDay = () => {
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const now = new Date();
    return days[now.getDay()];
  };

  const toggleFullScreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullScreen(true);
      localStorage.setItem('isFullScreen', 'true');
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
        setIsFullScreen(false);
        localStorage.setItem('isFullScreen', 'false');
      }
    }
  }, []);

  const fetchAdjustments = useCallback(async () => {
    try {
      const adjustmentsResponse = await axiosInstance.get("/adjustment/data");
      setAdjustments(Array.isArray(adjustmentsResponse.data) ? adjustmentsResponse.data : []);
    } catch (error) {
      console.error("Error fetching adjustments:", error);
      setAdjustments([]);
    }
  }, []);

  const fetchClosures = useCallback(async () => {
    try {
      const closuresResponse = await axiosInstance.get("/closure/plans");
      const closuresData = Array.isArray(closuresResponse.data) ? closuresResponse.data : [];

      const today = new Date();
      const todayUTC = new Date(Date.UTC(today.getFullYear(), today.getMonth(), today.getDate()));
      const currentWeekStart = new Date(todayUTC);
      currentWeekStart.setUTCDate(todayUTC.getUTCDate() - todayUTC.getUTCDay());
      const currentWeekEnd = new Date(currentWeekStart);
      currentWeekEnd.setUTCDate(currentWeekStart.getUTCDate() + 6);

      const filteredClosures = closuresData.filter((closure) => {
        const closureStartDateUTC = new Date(closure.date);
        const closureEndDateUTC = new Date(closureStartDateUTC);

        if (closure.duration) {
          const { value: durationValue, unit: durationUnit } = closure.duration;
          const daysToAdd = durationUnit === "weeks" ? (7 * durationValue) - 1 : durationValue - 1;
          closureEndDateUTC.setUTCDate(closureStartDateUTC.getUTCDate() + daysToAdd);
        }
        return closureStartDateUTC <= currentWeekEnd && closureEndDateUTC >= currentWeekStart;
      });

      setClosures(filteredClosures);
    } catch (error) {
      console.error("Error fetching closures:", error);
      setClosures([]);
    }
  }, []);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [
        adjustmentsResponse,
        closuresResponse,
        messagesResponse,
        salesResponse,
        utpResponse,
        bufferResponse,
      ] = await Promise.all([
        axiosInstance.get("/adjustment/data"),
        axiosInstance.get("/closure/plans"),
        axiosInstance.get("/messages"),
        axiosInstance.get("/sales"),
        axiosInstance.get("/upt"),
        axiosInstance.get("/buffer"),
      ]);

      setAdjustments(Array.isArray(adjustmentsResponse.data) ? adjustmentsResponse.data : []);
      setClosures(Array.isArray(closuresResponse.data) ? closuresResponse.data : []);
      setMessages(messagesResponse.data);

      const fetchedSales = salesResponse.data;
      const daysOrder = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
      const sortedSales = daysOrder.map((day) => fetchedSales.find((entry) => entry.day === day) || { day, sales: 0 });
      setSalesData(sortedSales);

      const filetsUtpValue = utpResponse.data.find((item) => item.productName === "Filets")?.utp || 1.0;
      const spicyUtpValue = utpResponse.data.find((item) => item.productName === "Spicy Filets")?.utp || 1.0;
      const grilledFiletsUtpValue = utpResponse.data.find((item) => item.productName === "Grilled Filets")?.utp || 1.0;
      const grilledNuggetsUtpValue = utpResponse.data.find((item) => item.productName === "Grilled Nuggets")?.utp || 1.0;
      const nuggetsUtpValue = utpResponse.data.find((item) => item.productName === "Nuggets")?.utp || 1.0;
      const stripsUtpValue = utpResponse.data.find((item) => item.productName === "Spicy Strips")?.utp || 1.0;

      const calculateBufferMultiplier = (bufferPrcnt) => (100 + bufferPrcnt) / 100;

      const filetsBuffer = calculateBufferMultiplier(bufferResponse.data.find((item) => item.productName === "Filets")?.bufferPrcnt || 1);
      const spicyBuffer = calculateBufferMultiplier(bufferResponse.data.find((item) => item.productName === "Spicy Filets")?.bufferPrcnt || 1);
      const grilledFiletsBuffer = calculateBufferMultiplier(bufferResponse.data.find((item) => item.productName === "Grilled Filets")?.bufferPrcnt || 1);
      const grilledNuggetsBuffer = calculateBufferMultiplier(bufferResponse.data.find((item) => item.productName === "Grilled Nuggets")?.bufferPrcnt || 1);
      const nuggetsBuffer = calculateBufferMultiplier(bufferResponse.data.find((item) => item.productName === "Nuggets")?.bufferPrcnt || 1);
      const stripsBuffer = calculateBufferMultiplier(bufferResponse.data.find((item) => item.productName === "Spicy Strips")?.bufferPrcnt || 1);

      setFiletsUtp(filetsUtpValue);
      setSpicyUtp(spicyUtpValue);
      setGrilledFiletsUtp(grilledFiletsUtpValue);
      setGrilledNuggetsUtp(grilledNuggetsUtpValue);
      setNuggetsUtp(nuggetsUtpValue);
      setStripsUtp(stripsUtpValue);

      const calculatedCases = sortedSales.map((entry, index) => {
        const nextDaySales = sortedSales[(index + 1) % sortedSales.length]?.sales || 0;
        const dayAdjustments = adjustmentsRef.current.filter(msg => msg.day === entry.day);

        const applyMessage = (product, cases, bags = 0) => {
          const message = dayAdjustments.find(msg => msg.product === product);
          let finalCases = cases;
          let finalBags = bags;

          if (message) {
            const parts = message.message.split(' and ');
            parts.forEach(part => {
              const [change, unit] = part.trim().split(' ');
              const value = parseInt(change);
              if (!isNaN(value)) {
                if (unit === 'cases') {
                  finalCases += value;
                } else if (unit === 'bags') {
                  finalBags += value;
                }
              }
            });
          }
          return { cases: Math.max(0, finalCases), bags: Math.max(0, finalBags), modified: !!message };
        };

        const filetsCases = Math.ceil(((filetsUtpValue * (nextDaySales / 1000)) / 158) * filetsBuffer);
        const spicyCases = Math.ceil(((spicyUtpValue * (nextDaySales / 1000)) / 141) * spicyBuffer);
        const grilledFiletsBags = Math.ceil(((grilledFiletsUtpValue * (nextDaySales / 1000)) / 26) * grilledFiletsBuffer);
        const grilledFiletsCases = Math.floor(grilledFiletsBags / 6);
        const remainingGrilledFiletsBags = grilledFiletsBags % 6;
        const grilledNuggetsBags = Math.ceil(((grilledNuggetsUtpValue * (nextDaySales / 1000)) / 189) * grilledNuggetsBuffer);
        const grilledNuggetsCases = Math.floor(grilledNuggetsBags / 6);
        const remainingGrilledNuggetsBags = grilledNuggetsBags % 6;
        const nuggetsCases = Math.ceil(((nuggetsUtpValue * (nextDaySales / 1000)) / 1132) * nuggetsBuffer);
        const stripsBags = Math.ceil(((stripsUtpValue * (nextDaySales / 1000)) / 53) * stripsBuffer);
        const stripsCases = Math.floor(stripsBags / 6);
        const remainingStripsBags = stripsBags % 6;

        return {
          day: entry.day,
          filets: applyMessage("Filets", filetsCases),
          spicy: applyMessage("Spicy Filets", spicyCases),
          grilledFilets: applyMessage("Grilled Filets", grilledFiletsCases, remainingGrilledFiletsBags),
          grilledNuggets: applyMessage("Grilled Nuggets", grilledNuggetsCases, remainingGrilledNuggetsBags),
          nuggets: applyMessage("Nuggets", nuggetsCases),
          strips: applyMessage("Spicy Strips", stripsCases, remainingStripsBags)
        };
      });

      setCalculatedData(calculatedCases);
      setLastUpdated(new Date());
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  }, [adjustmentsRef]); // Added adjustmentsRef as a dependency

  useEffect(() => {
    fetchData();
    requestWakeLock();

    const intervalId = setInterval(fetchData, 10 * 60 * 1000);
    const messageIntervalId = setInterval(fetchAdjustments, 5 * 60 * 1000);
    const closuresIntervalId = setInterval(fetchClosures, 10 * 60 * 1000);

    const storedFullScreenPreference = localStorage.getItem('isFullScreen');
    if (storedFullScreenPreference === 'true' && !document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullScreen(true);
      setTimeout(() => {
        const middleHeight = document.body.scrollHeight / 2;
        window.scrollTo({
          top: middleHeight,
          behavior: 'smooth'
        });
      }, 0);
    }

    const handleFullScreenChange = () => {
      setIsFullScreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullScreenChange);

    return () => {
      clearInterval(intervalId);
      clearInterval(messageIntervalId);
      clearInterval(closuresIntervalId);
      document.removeEventListener('fullscreenchange', handleFullScreenChange);
    };
  }, [fetchData, fetchAdjustments, fetchClosures]); // Added fetch functions as dependencies

  const currentDay = getCurrentDay();

  return (
    <div className="bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="min-h-screen bg-white rounded-lg md:rounded-xl shadow-xl px-3 py-2 border border-gray-100">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4 sm:mb-6 md:mb-8">
          <div className="space-y-1">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800">Thawing Cabinet</h2>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-6 w-full sm:w-auto">
            <div className="flex items-center gap-2 sm:gap-3 bg-gray-50 px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm w-full sm:w-auto">
              <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 flex-shrink-0" />
              <span className="text-gray-600 font-medium whitespace-nowrap">
                Updated: {lastUpdated.toLocaleTimeString()}
              </span>
            </div>
            <button
              onClick={toggleFullScreen}
              className="p-2 sm:p-2.5 rounded-lg hover:bg-gray-100 transition-colors duration-200 border border-gray-200"
            >
              {isFullScreen ? (
                <Minimize className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
              ) : (
                <Maximize className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
              )}
            </button>
          </div>
        </div>

        {loading ? (
          <div className="h-full flex items-center justify-center p-8">
            <div className="animate-spin rounded-full h-12 w-12 sm:h-16 sm:w-16 border-4 border-blue-500 border-t-transparent"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-6 lg:grid-cols-6 xl:grid-cols-6 gap-3 sm:gap-4 md:gap-6">
            {calculatedData.map((entry) => (
              <DayCard
                key={entry.day}
                entry={entry}
                currentDay={currentDay}
                closures={closures}
                messages={messages}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ThawingCabinet;