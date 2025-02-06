"use client";

import React, { useEffect, useState } from "react";
import { TrendingUp, LineChart, Activity, Clock } from "lucide-react";

const MarketHeader = () => {
  const [marketStatus, setMarketStatus] = useState({
    isOpen: false,
    message: "",
    timeUntilChange: "",
  });

  const calculateMarketStatus = (time: Date) => {
    const hours = time.getHours();
    const minutes = time.getMinutes();
    const day = time.getDay();
    const currentTimeInMinutes = hours * 60 + minutes;

    // Market hours
    const marketOpen = 9 * 60 + 15; // 9:15 AM
    const marketClose = 15 * 60 + 30; // 3:30 PM

    // Calculate time until next state change
    let timeUntilChange = "";

    // Weekend check
    if (day === 0 || day === 6) {
      return {
        isOpen: false,
        message: "Weekend (Closed)",
        timeUntilChange: "Opens on Monday",
      };
    }

    if (currentTimeInMinutes < marketOpen) {
      // Before market opens
      const minutesUntilOpen = marketOpen - currentTimeInMinutes;
      const hours = Math.floor(minutesUntilOpen / 60);
      const mins = minutesUntilOpen % 60;
      timeUntilChange = `Opens in ${hours}h ${mins}m`;

      return { isOpen: false, message: "Pre-market", timeUntilChange };
    } else if (
      currentTimeInMinutes >= marketOpen &&
      currentTimeInMinutes < marketClose
    ) {
      // Market is open
      const minutesUntilClose = marketClose - currentTimeInMinutes;
      const hours = Math.floor(minutesUntilClose / 60);
      const mins = minutesUntilClose % 60;
      timeUntilChange = `Closes in ${hours}h ${mins}m`;

      return { isOpen: true, message: "Open", timeUntilChange };
    } else {
      // After market closes
      return {
        isOpen: false,
        message: "Closed",
        timeUntilChange: "Opens tomorrow at 9:15 AM",
      };
    }
  };

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setMarketStatus(calculateMarketStatus(now));
    };

    // Update immediately
    updateTime();

    // Update every minute
    const interval = setInterval(updateTime, 60000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-white border-b">
      <div className="max-w-6xl mx-auto p-4">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          {/* Logo and Title */}
          <div className="flex items-center gap-3">
            <div className="bg-blue-500 p-2 rounded-lg">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                NSE Stock Tracker
                <span className="text-sm font-normal px-2 py-1 bg-blue-100 text-blue-700 rounded">
                  Live
                </span>
              </h1>
              <p className="text-sm text-gray-600">
                Track real-time stock prices and market data
              </p>
            </div>
          </div>

          {/* Market Status */}
          <div className="flex gap-6">
            <div className="flex items-center gap-2">
              <LineChart className="w-5 h-5 text-gray-600" />
              <div>
                <p className="text-sm font-medium">Market Status</p>
                <div className="flex items-center gap-2">
                  <span
                    className={`inline-block w-2 h-2 rounded-full ${
                      marketStatus.isOpen ? "bg-green-500" : "bg-red-500"
                    }`}
                  ></span>
                  <p
                    className={`text-sm ${
                      marketStatus.isOpen ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {marketStatus.message}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-gray-600" />
              <div>
                <p className="text-sm font-medium">
                  Time Until {marketStatus.isOpen ? "Close" : "Open"}
                </p>
                <p className="text-sm text-gray-600">
                  {marketStatus.timeUntilChange}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-gray-600" />
              <div>
                <p className="text-sm font-medium">Market Hours</p>
                <p className="text-sm text-gray-600">9:15 AM - 3:30 PM IST</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MarketHeader;
