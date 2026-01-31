import React, { useState } from 'react';
import { CHART_DATA, TRANSLATIONS } from '../constants';
import { Client, PolicyData, PaymentMode } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Users, FileText, DollarSign, ArrowUpRight, Cake, Bell, AlertCircle } from 'lucide-react';

interface DashboardViewProps {
  t: typeof TRANSLATIONS['en']['dashboard'];
  clients: Client[];
  policies: PolicyData[];
}

export const DashboardView: React.FC<DashboardViewProps> = ({ t, clients, policies }) => {
  const [activeTab, setActiveTab] = useState<'premiums' | 'birthdays'>('premiums');

  // Logic to filter upcoming birthdays (Real-time logic)
  const upcomingBirthdays = clients.filter(client => {
    const today = new Date();
    const bday = new Date(client.birthday);
    
    // Create a birthday date object for the current year
    const nextBirthday = new Date(today.getFullYear(), bday.getMonth(), bday.getDate());
    
    // If birthday has already passed this year, look at next year
    if (nextBirthday < today) {
      nextBirthday.setFullYear(today.getFullYear() + 1);
    }
    
    // Check if birthday is within the next 45 days
    const diffTime = nextBirthday.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays >= 0 && diffDays <= 45;
  }).sort((a, b) => {
    // Sort logic to handle year crossover
    const today = new Date();
    const getNextBday = (dateStr: string) => {
       const d = new Date(dateStr);
       const next = new Date(today.getFullYear(), d.getMonth(), d.getDate());
       if (next < today) next.setFullYear(today.getFullYear() + 1);
       return next;
    };
    return getNextBday(a.birthday).getTime() - getNextBday(b.birthday).getTime();
  });

  // Calculate next premium date based on anniversary and mode
  const getNextPremiumDate = (anniversary: string, mode: PaymentMode): Date => {
      const today = new Date();
      const [day, month] = anniversary.split('/').map(Number);
      
      // Anniversary for current year
      let baseDate = new Date(today.getFullYear(), month - 1, day);
      
      // If payment is Yearly, just check anniversary
      if (mode === 'Yearly') {
          if (baseDate < today) baseDate.setFullYear(today.getFullYear() + 1);
          return baseDate;
      }

      // For other modes, generate all potential dates for the year and find next one
      const interval = mode === 'Half-Yearly' ? 6 : mode === 'Quarterly' ? 3 : 1;
      
      let candidateDate = new Date(today.getFullYear(), month - 1, day);
      // Backtrack to start of year or ensure we cover cycles correctly relative to anniversary
      // Simple approach: Start from anniversary this year, if past, add interval until future
      
      // Reset to anniversary of THIS year
      candidateDate = new Date(today.getFullYear(), month - 1, day);
      
      // If anniversary is future, it's a candidate. If past, add months.
      // But we need to support cycles that wrap year.
      // Let's just project 12 months forward from anniversary and pick closest.
      
      let nextDate = new Date(candidateDate);
      // If original anniversary is in past, start adding intervals
      while (nextDate < today) {
          nextDate.setMonth(nextDate.getMonth() + interval);
      }
      
      return nextDate;
  };

  const duePolicies = policies.map(p => ({
      ...p,
      nextDueDate: getNextPremiumDate(p.policyAnniversaryDate, p.paymentMode)
  })).filter(p => {
      const today = new Date();
      const diffTime = p.nextDueDate.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays >= 0 && diffDays <= 60; // Next 60 days
  }).sort((a, b) => a.nextDueDate.getTime() - b.nextDueDate.getTime());

  // Calculate stats
  const totalPremium = policies.reduce((sum, p) => sum + p.premiumAmount, 0);
  const activePoliciesCount = policies.filter(p => p.status === 'Active').length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-800">{t.title}</h1>
        <p className="text-slate-500 text-sm">{t.subtitle}</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-blue-50 rounded-lg">
              <Users className="w-6 h-6 text-brand-600" />
            </div>
            <span className="text-xs font-medium text-green-600 flex items-center bg-green-50 px-2 py-1 rounded-full">
              +12% <ArrowUpRight className="w-3 h-3 ml-1" />
            </span>
          </div>
          <p className="text-slate-500 text-sm font-medium">{t.totalClients}</p>
          <h3 className="text-2xl font-bold text-slate-800">{clients.length}</h3>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-indigo-50 rounded-lg">
              <FileText className="w-6 h-6 text-indigo-600" />
            </div>
            <span className="text-xs font-medium text-green-600 flex items-center bg-green-50 px-2 py-1 rounded-full">
              +5% <ArrowUpRight className="w-3 h-3 ml-1" />
            </span>
          </div>
          <p className="text-slate-500 text-sm font-medium">{t.activePolicies}</p>
          <h3 className="text-2xl font-bold text-slate-800">{activePoliciesCount}</h3>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-emerald-50 rounded-lg">
              <DollarSign className="w-6 h-6 text-emerald-600" />
            </div>
            <span className="text-xs font-medium text-slate-500">
              {t.monthly}
            </span>
          </div>
          <p className="text-slate-500 text-sm font-medium">{t.premiumRevenue}</p>
          <h3 className="text-2xl font-bold text-slate-800">${(totalPremium / 1000).toFixed(1)}k</h3>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-amber-50 rounded-lg">
              <Bell className="w-6 h-6 text-amber-600" />
            </div>
            <span className="text-xs font-medium text-amber-600 bg-amber-50 px-2 py-1 rounded-full">
              {t.attentionNeeded}
            </span>
          </div>
          <p className="text-slate-500 text-sm font-medium">{t.reminders}</p>
          <h3 className="text-2xl font-bold text-slate-800">{upcomingBirthdays.length + duePolicies.length}</h3>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Chart Section */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="text-lg font-bold text-slate-800 mb-6">{t.policyDist}</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={CHART_DATA}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b'}} />
                <Tooltip 
                  contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} 
                  cursor={{fill: '#f1f5f9'}}
                />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {CHART_DATA.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={['#0ea5e9', '#6366f1', '#10b981', '#f59e0b'][index % 4]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Reminders & Notifications Panel */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-800">{t.upcomingReminders}</h3>
          </div>
          
          <div className="flex border-b border-slate-100">
            <button 
              className={`flex-1 py-3 text-sm font-medium transition-colors ${activeTab === 'premiums' ? 'text-brand-600 border-b-2 border-brand-600' : 'text-slate-500 hover:text-slate-800'}`}
              onClick={() => setActiveTab('premiums')}
            >
              {t.premiumsDue} ({duePolicies.length})
            </button>
            <button 
              className={`flex-1 py-3 text-sm font-medium transition-colors ${activeTab === 'birthdays' ? 'text-brand-600 border-b-2 border-brand-600' : 'text-slate-500 hover:text-slate-800'}`}
              onClick={() => setActiveTab('birthdays')}
            >
              {t.birthdays} ({upcomingBirthdays.length})
            </button>
          </div>

          <div className="p-4 overflow-y-auto max-h-[250px] space-y-3">
            {activeTab === 'premiums' && (
              <>
                {duePolicies.length > 0 ? duePolicies.map(policy => (
                  <div key={policy.id} className="flex items-start p-3 bg-red-50 rounded-lg border border-red-100">
                    <div className="p-2 bg-white rounded-md border border-red-100 mr-3">
                      <AlertCircle className="w-4 h-4 text-red-500" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-800">{policy.holderName}</p>
                      <p className="text-xs text-slate-500 mb-1">{policy.type} • {policy.paymentMode}</p>
                      <p className="text-xs font-medium text-red-600">
                        Due: {policy.nextDueDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </p>
                    </div>
                  </div>
                )) : (
                  <p className="text-sm text-slate-500 text-center py-4">{t.noPremiums}</p>
                )}
              </>
            )}

            {activeTab === 'birthdays' && (
              <>
                {upcomingBirthdays.length > 0 ? upcomingBirthdays.map(client => (
                  <div key={client.id} className="flex items-center p-3 bg-brand-50 rounded-lg border border-brand-100">
                    <div className="p-2 bg-white rounded-full border border-brand-100 mr-3">
                      <Cake className="w-4 h-4 text-brand-500" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-slate-800">{client.name}</p>
                      <p className="text-xs text-brand-600 font-medium">
                        Turns {new Date().getFullYear() - new Date(client.birthday).getFullYear()} on {new Date(client.birthday).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </p>
                    </div>
                    <button className="text-xs bg-white border border-slate-200 text-slate-600 px-2 py-1 rounded hover:bg-slate-50">
                      {t.sendWish}
                    </button>
                  </div>
                )) : (
                  <p className="text-sm text-slate-500 text-center py-4">{t.noBirthdays}</p>
                )}
              </>
            )}
          </div>
          
          <div className="mt-auto p-4 border-t border-slate-100 bg-slate-50 rounded-b-xl text-center">
            <button className="text-sm text-brand-600 font-medium hover:underline">{t.viewCalendar}</button>
          </div>
        </div>
      </div>

       {/* Recent Policies Table (Simple) */}
       <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-200">
           <h3 className="text-lg font-bold text-slate-800">{t.recentUpdates}</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-slate-500 font-medium">
              <tr>
                <th className="px-6 py-3">{t.table.policyNo}</th>
                <th className="px-6 py-3">{t.table.holder}</th>
                <th className="px-6 py-3">{t.table.type}</th>
                <th className="px-6 py-3">{t.table.anniversary}</th>
                <th className="px-6 py-3">{t.table.mode}</th>
                <th className="px-6 py-3">{t.table.status}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {policies.map((policy) => (
                <tr key={policy.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4 font-medium text-slate-900">{policy.policyNumber}</td>
                  <td className="px-6 py-4 text-slate-600">{policy.holderName}</td>
                  <td className="px-6 py-4 text-slate-600">{policy.type}</td>
                  <td className="px-6 py-4 text-slate-600">{policy.policyAnniversaryDate}</td>
                  <td className="px-6 py-4 text-slate-600">{policy.paymentMode}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      policy.status === 'Active' ? 'bg-green-100 text-green-800' : 
                      policy.status === 'Pending' ? 'bg-amber-100 text-amber-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {policy.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};