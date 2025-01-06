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
    currentWeekStart.setUTCDate(todayUTC.getUTCDate() - (todayUTC.getUTCDay() === 0 ? 6 : todayUTC.getUTCDay() - 1)); // Adjusted for Monday as start
    const currentWeekEnd = new Date(currentWeekStart);
    currentWeekEnd.setUTCDate(currentWeekStart.getUTCDate() + 5); // Adjusted for 6-day week

    if (!(closureStartDate <= currentWeekEnd && closureEndDate >= currentWeekStart)) {
      return false;
    }

    const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const todayDayIndex = todayUTC.getUTCDay(); // 0 for Sunday, 1 for Monday, etc.
    const currentDayIndex = daysOfWeek.indexOf(entry.day);

    // Calculate the date of the current entry within the current week
    let daysToAddForEntry = currentDayIndex - (todayDayIndex === 0 ? 6 : todayDayIndex - 1);
    if (daysToAddForEntry < 0) {
      daysToAddForEntry += 7;
    }

    const entryDate = new Date(currentWeekStart);
    entryDate.setUTCDate(currentWeekStart.getUTCDate() + daysToAddForEntry);

    return entryDate >= closureStartDate && entryDate <= closureEndDate;
  });

  return (
    <div
      key={entry.day}
      className={`flex flex-col transition-all duration-200
        ${isToday
          ? 'ring-2 ring-blue-500 shadow-lg border-transparent'
          : 'border border-gray-200 hover:shadow-md'
        } rounded-lg md:rounded-xl`}
      style={{ height: '100%', width: '100%' }}
    >
      <div
        className={`p-2 sm:p-2 rounded-t-lg md:rounded-t-xl font-bold text-center text-sm sm:text-base
          ${isToday
            ? 'bg-gradient-to-r from-blue-500 to-blue-700 text-white'
            : 'bg-gradient-to-r from-gray-100 to-gray-200'
          }`}
      >
        <div className="p-1">{entry.day}</div>
        {messages.find(msg => msg.day === entry.day) && (
          <div className="mt-1 text-xs sm:text-sm bg-yellow-50 p-1 rounded-md text-yellow-800 border border-yellow-200">
            {messages.find(msg => msg.day === entry.day).message}
          </div>
        )}
      </div>

      {closure ? (
        <div className="flex-1 flex flex-col justify-center items-center p-2 sm:p-3 bg-gradient-to-br from-red-50 via-red-100 to-red-50 relative overflow-hidden">
          <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
            {[...Array(15)].map((_, i) => (
              <circle
                key={i}
                cx={`${Math.random() * 100}%`}
                cy={`${Math.random() * 100}%`}
                r={`${Math.random() * 40 + 10}`}
                fill="rgba(239, 68, 68, 0.1)"
                className="animate-float"
                style={{
                  animationDuration: `${Math.random() * 20 + 20}s`,
                  animationDelay: `${i * -0.2}s`
                }}
              />
            ))}
          </svg>
          <div className="relative z-10 flex flex-col items-center">
            <div className="text-xl sm:text-2xl md:text-3xl font-bold text-red-600 mb-2">
              CLOSED
            </div>
            <div className="px-2 sm:px-3 py-1 bg-white rounded-lg md:rounded-xl shadow-md border border-red-200 transition-all duration-300 hover:shadow-xl hover:scale-105 backdrop-blur-sm bg-opacity-80">
              <div className="text-center text-red-800 font-semibold text-sm sm:text-base">
                {closure.reason}
              </div>
            </div>
          </div>
          <div className="absolute top-0 left-0 w-8 h-8 bg-red-200 rounded-br-full opacity-50"></div>
          <div className="absolute bottom-0 right-0 w-12 h-12 bg-red-200 rounded-tl-full opacity-50"></div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col gap-1 p-1 sm:p-2">
          {[
            { name: "Filets", data: entry.filets, bg: "bg-blue-300 text-gray-800" },
            { name: "Spicy Filets", data: entry.spicy, bg: "bg-purple-200 text-gray-800" },
            { name: "Grilled Fillets", data: entry.grilledFilets, bg: "bg-amber-200 text-gray-800" },
            { name: "Grilled Nuggets", data: entry.grilledNuggets, bg: "bg-gray-300 text-gray-800" },
            { name: "Nuggets", data: entry.nuggets, bg: "bg-pink-200 text-gray-800" },
            { name: "Spicy Strips", data: entry.strips, bg: "bg-red-400 text-gray-800" },
          ].map((item, index) => (
            <div
              key={index}
              className={`flex-1 ${item.bg} p-2 m-1 rounded-md transition-all duration-200
                hover:shadow-sm flex flex-col justify-center items-center`}
            >
              <div className="font-semibold text-center mb-0.5 text-l sm:text-base">{item.name}</div>
              <div className={`text-center text-l sm:text-base ${item.data.modified ? "text-red-700 font-bold" : ""}`}>
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
    const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const now = new Date();
    const dayIndex = now.getDay(); // 0 for Sunday, 1 for Monday, etc.
    return days[(dayIndex + 6) % 7]; // Adjust to start from Monday
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
      currentWeekStart.setUTCDate(todayUTC.getUTCDate() - (todayUTC.getUTCDay() === 0 ? 6 : todayUTC.getUTCDay() - 1)); // Adjusted for Monday as start
      const currentWeekEnd = new Date(currentWeekStart);
      currentWeekEnd.setUTCDate(currentWeekStart.getUTCDate() + 5); // Adjusted for 6-day week

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
  }, [adjustmentsRef]);

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
  }, [fetchData, fetchAdjustments, fetchClosures]);

  const currentDay = getCurrentDay();

  return (
    <div className="fixed top-0 left-0 w-full h-full bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="h-full w-full bg-white rounded-lg md:rounded-xl shadow-xl p-2 sm:p-4 border border-gray-100 flex flex-col">
        {/* Header Section */}
        <div className="flex items-center justify-between mb-2 sm:mb-3">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-gray-800">Thawing Cabinet</h2>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <div className="flex items-center gap-1 sm:gap-2 bg-gray-50 px-2 sm:px-3 py-1 rounded-lg text-xs sm:text-sm">
              <Clock className="w-3 h-3 sm:w-4 sm:h-4 text-blue-600 flex-shrink-0" />
              <span className="text-gray-600 font-medium whitespace-nowrap">
                Updated: {lastUpdated.toLocaleTimeString()}
              </span>
            </div>
            <button
              onClick={toggleFullScreen}
              className="p-1 rounded-lg hover:bg-gray-100 transition-colors duration-200 border border-gray-200"
            >
              {isFullScreen ? (
                <Minimize className="w-3 h-3 sm:w-4 sm:h-4 text-gray-600" />
              ) : (
                <Maximize className="w-3 h-3 sm:w-4 sm:h-4 text-gray-600" />
              )}
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex-1 flex items-center justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 sm:h-12 sm:w-12 border-4 border-blue-500 border-t-transparent"></div>
          </div>
        ) : (
          <div className="flex-1 grid grid-cols-6 gap-1 sm:gap-2" style={{ maxHeight: 'calc(100% - 50px)' }}>
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