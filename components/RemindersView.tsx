import React, { useState } from 'react';
import { TRANSLATIONS } from '../constants';
import { PolicyData, Client, AppView } from '../types';
import { Bell, Calendar, UploadCloud, Mail, Phone, ExternalLink, AlertCircle, Clock } from 'lucide-react';

interface RemindersViewProps {
  t: typeof TRANSLATIONS['en']['reminders'];
  policies: PolicyData[];
  clients: Client[];
  onUploadRenewal: () => void;
}

export const RemindersView: React.FC<RemindersViewProps> = ({ t, policies, clients, onUploadRenewal }) => {
  const [filter, setFilter] = useState<'all' | 'urgent'>('all');

  // Logic to find upcoming policy anniversaries (Next 60 days)
  const getUpcomingReminders = () => {
    const today = new Date();
    
    return policies.map(policy => {
      const [day, month] = policy.policyAnniversaryDate.split('/').map(Number);
      
      // Construct date for this year
      let anniversaryDate = new Date(today.getFullYear(), month - 1, day);
      
      // If date passed this year, check next year
      if (anniversaryDate < today) {
        anniversaryDate.setFullYear(today.getFullYear() + 1);
      }
      
      const diffTime = anniversaryDate.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      return {
        ...policy,
        nextAnniversary: anniversaryDate,
        daysRemaining: diffDays,
        client: clients.find(c => c.name === policy.holderName)
      };
    })
    .filter(item => item.daysRemaining >= 0 && item.daysRemaining <= 60)
    .sort((a, b) => a.daysRemaining - b.daysRemaining);
  };

  const reminders = getUpcomingReminders();
  const filteredReminders = filter === 'urgent' 
    ? reminders.filter(r => r.daysRemaining <= 30) 
    : reminders;

  const getUrgencyColor = (days: number) => {
    if (days <= 14) return 'bg-red-50 text-red-700 border-red-200'; // Critical
    if (days <= 30) return 'bg-amber-50 text-amber-700 border-amber-200'; // Warning
    return 'bg-blue-50 text-blue-700 border-blue-200'; // Info
  };

  const getUrgencyIcon = (days: number) => {
    if (days <= 14) return <AlertCircle className="w-4 h-4" />;
    if (days <= 30) return <Clock className="w-4 h-4" />;
    return <Calendar className="w-4 h-4" />;
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
           <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
             <Bell className="w-6 h-6 text-brand-500" />
             {t.title}
           </h1>
           <p className="text-slate-500 text-sm mt-1">{t.subtitle}</p>
        </div>
        
        {/* Filter Tabs */}
        <div className="flex bg-white rounded-lg p-1 border border-slate-200 shadow-sm">
           <button 
             onClick={() => setFilter('all')}
             className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
               filter === 'all' ? 'bg-slate-100 text-slate-800' : 'text-slate-500 hover:text-slate-700'
             }`}
           >
             {t.filterAll}
           </button>
           <button 
             onClick={() => setFilter('urgent')}
             className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
               filter === 'urgent' ? 'bg-red-50 text-red-700' : 'text-slate-500 hover:text-slate-700'
             }`}
           >
             {t.filterUrgent}
           </button>
        </div>
      </div>

      <div className="grid gap-4">
        {filteredReminders.length > 0 ? (
          filteredReminders.map(reminder => (
            <div key={reminder.id} className="bg-white rounded-xl border border-slate-200 shadow-sm hover:border-brand-300 transition-colors p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
               {/* Left Section: Days Remaining Indicator */}
               <div className="flex items-center gap-4">
                  <div className={`flex flex-col items-center justify-center w-16 h-16 rounded-xl border-2 ${getUrgencyColor(reminder.daysRemaining)}`}>
                     <span className="text-xl font-bold">{reminder.daysRemaining}</span>
                     <span className="text-[10px] uppercase font-bold tracking-wider">Days</span>
                  </div>
                  
                  <div>
                     <h3 className="font-bold text-slate-800 text-lg">{reminder.planName}</h3>
                     <div className="flex items-center gap-2 text-sm text-slate-500 mb-1">
                        <span className="font-medium text-slate-700">{reminder.holderName}</span>
                        <span>•</span>
                        <span className="font-mono">{reminder.policyNumber}</span>
                     </div>
                     <div className="flex items-center gap-2">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold border ${getUrgencyColor(reminder.daysRemaining)}`}>
                           {getUrgencyIcon(reminder.daysRemaining)}
                           <span className="ml-1">
                              {reminder.daysRemaining <= 30 ? t.urgent : t.upcoming}
                           </span>
                        </span>
                        <span className="text-xs text-slate-400">
                           {t.anniversary}: {reminder.nextAnniversary.toLocaleDateString()}
                        </span>
                     </div>
                  </div>
               </div>

               {/* Right Section: Actions */}
               <div className="flex items-center gap-3 w-full md:w-auto pt-4 md:pt-0 border-t md:border-t-0 border-slate-100">
                  <div className="flex flex-col gap-1 mr-4 text-right hidden md:block">
                     <span className="text-xs text-slate-400 uppercase font-bold">{t.policyDetails}</span>
                     <span className="text-sm font-medium text-slate-700">${reminder.premiumAmount.toLocaleString()} / {reminder.paymentMode}</span>
                  </div>

                  {reminder.client && (
                     <div className="flex gap-2">
                        {reminder.client.email && (
                            <a href={`mailto:${reminder.client.email}`} className="p-2 text-slate-400 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-colors" title={reminder.client.email}>
                                <Mail className="w-5 h-5" />
                            </a>
                        )}
                        {reminder.client.phone && (
                            <a href={`tel:${reminder.client.phone}`} className="p-2 text-slate-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors" title={reminder.client.phone}>
                                <Phone className="w-5 h-5" />
                            </a>
                        )}
                     </div>
                  )}

                  <button 
                     onClick={onUploadRenewal}
                     className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium rounded-lg shadow-sm flex items-center gap-2 transition-colors"
                  >
                     <UploadCloud className="w-4 h-4" />
                     {t.uploadRenewal}
                  </button>
               </div>
            </div>
          ))
        ) : (
          <div className="text-center py-16 bg-slate-50 rounded-xl border border-dashed border-slate-300">
             <Bell className="w-12 h-12 text-slate-300 mx-auto mb-3" />
             <p className="text-slate-500 font-medium">{t.noReminders}</p>
          </div>
        )}
      </div>
    </div>
  );
};