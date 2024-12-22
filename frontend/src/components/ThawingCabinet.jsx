import React, { useState, useEffect, useCallback, useRef } from "react";
import { Clock, Maximize, Minimize } from "lucide-react";
import axiosInstance from "./axiosInstance";

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
  const [messages, setMessages] = useState([]);
  const [closures, setClosures] = useState([]);
  const messagesRef = useRef(messages);

  let wakeLock = null;

  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  const requestWakeLock = async () => {
    try {
      wakeLock = await navigator.wakeLock.request('screen');
      console.log('Wake Lock is active');
    } catch (err) {
      console.error(`${err.name}, ${err.message}`);
    }
  };

  const releaseWakeLock = async () => {
    if (wakeLock) {
      await wakeLock.release();
      wakeLock = null;
      console.log('Wake Lock has been released');
    }
  };

  const getCurrentDay = () => {
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    return days[new Date().getDay()];
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

  const fetchMessages = async () => {
    try {
      const messagesResponse = await axiosInstance.get("/msg/data");
      if (Array.isArray(messagesResponse.data)) {
        setMessages(messagesResponse.data);
      } else {
        console.error('Messages response is not an array:', messagesResponse.data);
        setMessages([]);
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
      setMessages([]);
    }
  };

  const fetchClosures = async () => {
    try {
      const closuresResponse = await axiosInstance.get("/closure/plans");
      const closuresData = Array.isArray(closuresResponse.data) ? closuresResponse.data : [closuresResponse.data];
      setClosures(closuresData);
      console.log('Fetched closures:', closuresData);
    } catch (error) {
      console.error("Error fetching closures:", error);
      setClosures([]);
    }
  };

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      await fetchMessages();
      await fetchClosures();
      const salesResponse = await axiosInstance.get("/sales");
      const fetchedSales = salesResponse.data;
      const daysOrder = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
      const sortedSales = daysOrder.map((day) => fetchedSales.find((entry) => entry.day === day) || { day, sales: 0 });
      setSalesData(sortedSales);

      const utpResponse = await axiosInstance.get("/upt");
      const filetsUtpValue = utpResponse.data.find((item) => item.productName === "Filets")?.utp || 1.0;
      const spicyUtpValue = utpResponse.data.find((item) => item.productName === "Spicy Filets")?.utp || 1.0;
      const grilledFiletsUtpValue = utpResponse.data.find((item) => item.productName === "Grilled Filets")?.utp || 1.0;
      const grilledNuggetsUtpValue = utpResponse.data.find((item) => item.productName === "Grilled Nuggets")?.utp || 1.0;
      const nuggetsUtpValue = utpResponse.data.find((item) => item.productName === "Nuggets")?.utp || 1.0;
      const stripsUtpValue = utpResponse.data.find((item) => item.productName === "Spicy Strips")?.utp || 1.0;

      const bufferResponse = await axiosInstance.get("/buffer");
      const calculateBufferMultiplier = (bufferPrcnt) => {
        if (bufferPrcnt < 0) {
          return (100 + bufferPrcnt) / 100;
        } else {
          return (100 + bufferPrcnt) / 100;
        }
      };

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
        const dayMessages = messagesRef.current.filter(msg => msg.day === entry.day);
        console.log(`Processing ${entry.day} messages:`, dayMessages);

        const applyMessage = (product, cases, bags = 0) => {
          const message = dayMessages.find(msg => msg.product === product);
          let finalCases = cases;
          let finalBags = bags;

          if (message) {
            console.log(`Applying message for ${product}:`, message);
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

        const filetsData = applyMessage("Filets", filetsCases);
        const spicyData = applyMessage("Spicy Filets", spicyCases);
        const grilledFiletsData = applyMessage("Grilled Filets", grilledFiletsCases, remainingGrilledFiletsBags);
        const grilledNuggetsData = applyMessage("Grilled Nuggets", grilledNuggetsCases, remainingGrilledNuggetsBags);
        const nuggetsData = applyMessage("Nuggets", nuggetsCases);
        const stripsData = applyMessage("Spicy Strips", stripsCases, remainingStripsBags);

        return {
          day: entry.day,
          filets: filetsData,
          spicy: spicyData,
          grilledFilets: grilledFiletsData,
          grilledNuggets: grilledNuggetsData,
          nuggets: nuggetsData,
          strips: stripsData
        };
      });

      setCalculatedData(calculatedCases);
      setLastUpdated(new Date());
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    requestWakeLock();

    const intervalId = setInterval(fetchData, 15 * 60 * 1000);
    const messageIntervalId = setInterval(fetchMessages, 5 * 60 * 1000);
    const closuresIntervalId = setInterval(fetchClosures, 60 * 60 * 1000);

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
      releaseWakeLock();
      document.removeEventListener('fullscreenchange', handleFullScreenChange);
    };
  }, [fetchData]);

  const currentDay = getCurrentDay();

  return (
    <div className="h-screen w-full p-4 bg-gray-50">
      <div className="h-full bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Thawing Cabinet Dashboard</h2>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-blue-500" />
              <span className="text-sm text-gray-600">
                Last updated: {lastUpdated.toLocaleTimeString()}
              </span>
            </div>
            <button onClick={toggleFullScreen} className="p-2 rounded-full hover:bg-gray-200 transition-colors">
              {isFullScreen ? (
                <Minimize className="w-5 h-5 text-gray-600" />
              ) : (
                <Maximize className="w-5 h-5 text-gray-600" />
              )}
            </button>
          </div>
        </div>
        {loading ? (
          <div className="h-full flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <div className="grid grid-cols-6 gap-4 h-[calc(100%-4rem)]">
            {calculatedData.map((entry) => {
              const isToday = entry.day === currentDay;
              const closure = closures.find(c => {
                // Parse closure start date in UTC
                const closureStartDate = new Date(c.date);
                
                // Calculate closure end date based on duration
                const closureEndDate = new Date(closureStartDate);
                if (c.duration) {
                  const durationValue = c.duration.value;
                  const durationUnit = c.duration.unit;
                  
                  if (durationUnit === "days") {
                    // For days, add duration - 1 (since start date counts as first day)
                    closureEndDate.setDate(closureStartDate.getDate() + (durationValue - 1));
                  } else if (durationUnit === "weeks") {
                    // For weeks, add (7 * weeks) - 1 days
                    closureEndDate.setDate(closureStartDate.getDate() + (7 * durationValue) - 1);
                  }
                }
                
                // Get today in UTC
                const today = new Date();
                const todayUTC = new Date(Date.UTC(
                  today.getUTCFullYear(),
                  today.getUTCMonth(),
                  today.getDate()
                ));
                
                // Calculate the entry date in UTC
                const daysToAdd = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
                  .indexOf(entry.day) - today.getDay();
                const entryDate = new Date(today);
                entryDate.setDate(today.getDate() + daysToAdd);
                
                // Debug logging
                console.log('Closure check:', {
                  entryDay: entry.day,
                  closureStart: closureStartDate.toISOString(),
                  closureEnd: closureEndDate.toISOString(),
                  entryDate: entryDate.toISOString(),
                  duration: c.duration,
                  isWithinRange: entryDate >= closureStartDate && entryDate <= closureEndDate
                });
                
                // Check if entry date falls within closure period
                return entryDate >= closureStartDate && entryDate <= closureEndDate;
              });
              return (
                <div
                  key={entry.day}
                  className={`flex flex-col h-full rounded-lg border ${
                    isToday ? 'ring-2 ring-blue-500 shadow-lg' : 'border-gray-200'
                  }`}
                >
                  <div
                    className={`p-3 rounded-t-lg font-semibold text-center ${
                      isToday ? 'bg-blue-500 text-white' : 'bg-gray-100'
                    }`}
                  >
                    {entry.day}
                  </div>
                  {closure ? (
                    <div className="flex-1 flex flex-col justify-center items-center p-4 bg-red-100">
                      <div className="text-2xl font-bold text-red-600 mb-2">CLOSED</div>
                      <div className="text-center text-red-800">{closure.reason}</div>
                    </div>
                  ) : (
                    <div className="flex-1 flex flex-col gap-2 p-2">
                      {[
                        { name: "Filets", data: entry.filets, bg: "bg-blue-300" },
                        { name: "Spicy Filets", data: entry.spicy, bg: "bg-purple-300" },
                        { name: "Grilled Fillets", data: entry.grilledFilets, bg: "bg-amber-100" },
                        { name: "Grilled Nuggets", data: entry.grilledNuggets, bg: "bg-gray-200" },
                        { name: "Nuggets", data: entry.nuggets, bg: "bg-pink-300" },
                        { name: "Spicy Strips", data: entry.strips, bg: "bg-red-400" },
                      ].map((item, index) => (
                        <div key={index} className={`flex-1 ${item.bg} p-3 rounded flex flex-col justify-center items-center`}>
                          <div className="font-medium text-center">{item.name}</div>
                          <div className={item.data.modified ? "text-red-600 font-bold" : ""}>
                            {item.data.cases > 0 && <div>{item.data.cases} cases</div>}
                            {item.data.bags > 0 && <div>{item.data.bags} bags</div>}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default ThawingCabinet;