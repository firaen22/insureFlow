import React from 'react';
import { AppView, Language } from '../types';
import { LayoutDashboard, UploadCloud, Users, Settings, Cloud, Bell, Menu, Languages, BookOpen, AlertTriangle } from 'lucide-react';
import { TRANSLATIONS } from '../constants';

interface LayoutProps {
  currentView: AppView;
  onChangeView: (view: AppView) => void;
  language: Language;
  onToggleLanguage: () => void;
  t: typeof TRANSLATIONS['en'];
  children: React.ReactNode;
  isDriveConnected: boolean;
  onConnectDrive: () => void;
}

export const Layout: React.FC<LayoutProps> = ({ 
  currentView, 
  onChangeView, 
  language,
  onToggleLanguage,
  t,
  children,
  isDriveConnected,
  onConnectDrive
}) => {
  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-white flex-shrink-0 hidden md:flex flex-col transition-all duration-300">
        
        <nav className="flex-1 px-4 py-6 space-y-2">
          <button
            onClick={() => onChangeView(AppView.DASHBOARD)}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
              currentView === AppView.DASHBOARD ? 'bg-brand-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <LayoutDashboard className="w-5 h-5" />
            <span>{t.nav.dashboard}</span>
          </button>
          
          <button
            onClick={() => onChangeView(AppView.UPLOAD)}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
              currentView === AppView.UPLOAD ? 'bg-brand-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <UploadCloud className="w-5 h-5" />
            <span>{t.nav.upload}</span>
          </button>

          <button
             onClick={() => onChangeView(AppView.CLIENTS)}
             className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
              currentView === AppView.CLIENTS ? 'bg-brand-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <Users className="w-5 h-5" />
            <span>{t.nav.clients}</span>
          </button>

          <button
             onClick={() => onChangeView(AppView.PRODUCTS)}
             className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
              currentView === AppView.PRODUCTS ? 'bg-brand-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <BookOpen className="w-5 h-5" />
            <span>{t.nav.products}</span>
          </button>

          <button
             onClick={() => onChangeView(AppView.REMINDERS)}
             className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
              currentView === AppView.REMINDERS ? 'bg-brand-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <Bell className="w-5 h-5" />
            <span>{t.nav.reminders}</span>
          </button>
        </nav>

        <div className="p-4 border-t border-slate-800">
          <button className="w-full flex items-center space-x-3 px-4 py-3 text-slate-400 hover:text-white transition-colors">
            <Settings className="w-5 h-5" />
            <span>{t.nav.settings}</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-slate-200 h-16 flex items-center justify-between px-6 shadow-sm z-10">
          <div className="flex items-center md:hidden">
            <button className="p-2 text-slate-500 hover:bg-slate-100 rounded-md">
              <Menu className="w-6 h-6" />
            </button>
          </div>
          
          <div className="flex items-center ml-auto space-x-4">
             {/* Language Switcher */}
             <button 
              onClick={onToggleLanguage}
              className="flex items-center space-x-2 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md transition-colors text-sm font-medium"
            >
              <Languages className="w-4 h-4" />
              <span>{language === 'en' ? 'EN' : '中'}</span>
            </button>

             {/* Cloud Status Indicator */}
             <button
              onClick={onConnectDrive}
              className={`flex items-center space-x-2 px-3 py-1.5 rounded-full border text-xs font-medium transition-all ${
                isDriveConnected 
                ? 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100' 
                : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100 hover:border-brand-300'
              }`}
            >
              <span className="relative flex h-2 w-2">
                {isDriveConnected ? (
                  <>
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                  </>
                ) : (
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-slate-400"></span>
                )}
              </span>
              <span>{isDriveConnected ? t.header.driveConnected : 'Connect Google Sheet'}</span>
            </button>

            <button 
              onClick={() => onChangeView(AppView.REMINDERS)}
              className="p-2 text-slate-400 hover:text-brand-600 transition-colors relative"
            >
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
            </button>
            <div className="w-8 h-8 bg-slate-200 rounded-full flex items-center justify-center text-slate-600 font-bold text-sm">
              AD
            </div>
          </div>
        </header>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-auto p-6 md:p-8">
          <div className="max-w-7xl mx-auto">
             {children}
          </div>
        </div>
      </main>
    </div>
  );
};