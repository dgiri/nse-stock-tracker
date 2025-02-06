"use client";

import React from "react";
import { TrendingUp, Mail, Info, Shield } from "lucide-react";

const Footer: React.FC = () => {
  return (
    <footer className="bg-white border-t mt-8">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* About Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-500" />
              <h3 className="font-bold text-lg">NSE Stock Tracker</h3>
            </div>
            <p className="text-sm text-gray-600">
              Real-time stock market data and analysis tool for the National
              Stock Exchange of India.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a
                  href="https://www.nseindia.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-600 hover:text-blue-500"
                >
                  NSE Official Website
                </a>
              </li>
              <li>
                <a
                  href="https://www.sebi.gov.in/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-600 hover:text-blue-500"
                >
                  SEBI
                </a>
              </li>
              <li>
                <a
                  href="https://www.nseindia.com/market-data/market-watch"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-600 hover:text-blue-500"
                >
                  Market Watch
                </a>
              </li>
            </ul>
          </div>

          {/* Market Hours */}
          <div>
            <h3 className="font-semibold mb-4">Trading Hours</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>Regular Market: 9:15 AM - 3:30 PM</li>
              <li>Pre-market: 9:00 AM - 9:15 AM</li>
              <li>Post-market: 3:30 PM - 4:00 PM</li>
              <li className="text-gray-500">All times in IST</li>
            </ul>
          </div>

          {/* Disclaimer */}
          <div>
            <h3 className="font-semibold mb-4">Disclaimer</h3>
            <p className="text-sm text-gray-600">
              Data provided is for informational purposes only. We do not
              guarantee accuracy or timeliness of the information.
            </p>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-8 pt-4 border-t">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-600">
            <div className="flex items-center gap-6">
              <span>© {new Date().getFullYear()} NSE Stock Tracker</span>
              <a href="#" className="hover:text-blue-500">
                Privacy Policy
              </a>
              <a href="#" className="hover:text-blue-500">
                Terms of Use
              </a>
            </div>
            <div className="flex items-center gap-4">
              <a
                href="#"
                className="hover:text-blue-500 flex items-center gap-1"
              >
                <Mail className="w-4 h-4" />
                Contact
              </a>
              <a
                href="#"
                className="hover:text-blue-500 flex items-center gap-1"
              >
                <Info className="w-4 h-4" />
                About
              </a>
              <a
                href="#"
                className="hover:text-blue-500 flex items-center gap-1"
              >
                <Shield className="w-4 h-4" />
                Security
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
