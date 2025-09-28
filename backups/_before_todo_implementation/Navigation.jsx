import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { BarChart3, Database, Activity, RefreshCw, Moon, Sun, Youtube, Brain } from 'lucide-react';

const Navigation = ({ darkMode, setDarkMode, onRefresh }) => {
  const location = useLocation();

  const navItems = [
    { path: '/', icon: BarChart3, label: 'Dashboard' },
    { path: '/visualization', icon: Database, label: 'Data Viz' },
    { path: '/predictor', icon: Brain, label: 'AI Predictor' },
    { path: '/status', icon: Activity, label: 'Status' },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <nav className={`sticky top-0 z-50 border-b transition-colors duration-300 ${
      darkMode 
        ? 'bg-gray-800 border-gray-700' 
        : 'bg-white border-gray-200'
    }`}>
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center space-x-3">
            <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-r from-red-500 to-red-600 rounded-lg">
              <Youtube className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold">YouTube Extractor</h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">ML-Ready Insights</p>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-1">
            {navItems.map(({ path, icon: Icon, label }) => (
              <Link
                key={path}
                to={path}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors duration-200 ${
                  isActive(path)
                    ? darkMode
                      ? 'bg-blue-600 text-white'
                      : 'bg-blue-100 text-blue-700'
                    : darkMode
                      ? 'text-gray-300 hover:bg-gray-700 hover:text-white'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{label}</span>
              </Link>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-2">
            <button
              onClick={onRefresh}
              className={`p-2 rounded-lg transition-colors duration-200 ${
                darkMode
                  ? 'hover:bg-gray-700 text-gray-300'
                  : 'hover:bg-gray-100 text-gray-600'
              }`}
              title="Refresh Data"
            >
              <RefreshCw className="w-5 h-5" />
            </button>
            
            <button
              onClick={() => setDarkMode(!darkMode)}
              className={`p-2 rounded-lg transition-colors duration-200 ${
                darkMode
                  ? 'hover:bg-gray-700 text-gray-300'
                  : 'hover:bg-gray-100 text-gray-600'
              }`}
              title={darkMode ? 'Light Mode' : 'Dark Mode'}
            >
              {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden pb-4">
          <div className="flex space-x-1">
            {navItems.map(({ path, icon: Icon, label }) => (
              <Link
                key={path}
                to={path}
                className={`flex-1 flex flex-col items-center py-2 px-3 rounded-lg transition-colors duration-200 ${
                  isActive(path)
                    ? darkMode
                      ? 'bg-blue-600 text-white'
                      : 'bg-blue-100 text-blue-700'
                    : darkMode
                      ? 'text-gray-300 hover:bg-gray-700'
                      : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Icon className="w-4 h-4 mb-1" />
                <span className="text-xs font-medium">{label}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
