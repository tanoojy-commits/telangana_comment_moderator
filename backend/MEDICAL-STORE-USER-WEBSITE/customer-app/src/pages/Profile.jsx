import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { 
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, LineChart, Line 
} from 'recharts';
import { User, Phone, Mail, Lock, LogOut, CheckCircle2, ShieldAlert, Award, FileText } from 'lucide-react';

const EXPENSE_DATA = [
  { month: 'Jan', expenses: 380, medications: 3 },
  { month: 'Feb', expenses: 620, medications: 5 },
  { month: 'Mar', expenses: 450, medications: 4 },
  { month: 'Apr', expenses: 890, medications: 6 },
  { month: 'May', expenses: 240, medications: 2 },
  { month: 'Jun', expenses: 1150, medications: 7 }
];

const HEALTH_STATS = [
  { day: 'Mon', compliance: 100, bloodSugar: 110 },
  { day: 'Tue', compliance: 100, bloodSugar: 115 },
  { day: 'Wed', compliance: 0, bloodSugar: 130 },
  { day: 'Thu', compliance: 100, bloodSugar: 120 },
  { day: 'Fri', compliance: 100, bloodSugar: 114 },
  { day: 'Sat', compliance: 100, bloodSugar: 108 },
  { day: 'Sun', compliance: 100, bloodSugar: 105 }
];

export const Profile = () => {
  const { currentUser, updateProfile, changePassword, logout } = useAuth();
  
  // Edit Profile States
  const [name, setName] = useState(currentUser?.name || '');
  const [phone, setPhone] = useState(currentUser?.phone || '');
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState('');
  const [profileSuccess, setProfileSuccess] = useState('');

  // Password States
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');

  // Chart Styling state for Dark Mode
  const [chartTextColor, setChartTextColor] = useState('#64748b'); // slate 500
  const [chartGridColor, setChartGridColor] = useState('#f1f5f9'); // slate 100

  useEffect(() => {
    // Detect dark mode to adjust axes colors
    const isDark = document.documentElement.classList.contains('dark');
    setChartTextColor(isDark ? '#94a3b8' : '#64748b');
    setChartGridColor(isDark ? '#334155' : '#f1f5f9');
  }, []);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setProfileError('');
    setProfileSuccess('');

    if (!name || !phone) {
      setProfileError('Name and phone are required.');
      return;
    }

    if (!/^\d{10}$/.test(phone)) {
      setProfileError('Please enter a valid 10-digit mobile number.');
      return;
    }

    setProfileLoading(true);
    try {
      await updateProfile(name, phone);
      setProfileSuccess('Profile updated successfully!');
    } catch (err) {
      setProfileError(err.message || 'Could not update profile.');
    } finally {
      setProfileLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');

    if (!newPassword || !confirmPassword) {
      setPasswordError('Please fill in password fields.');
      return;
    }

    if (newPassword.length < 6) {
      setPasswordError('Password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('Passwords do not match.');
      return;
    }

    setPasswordLoading(true);
    try {
      await changePassword(newPassword);
      setPasswordSuccess('Password changed successfully!');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setPasswordError(err.message || 'Failed to change password.');
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10 page-fade-in">
      
      {/* 1. Profile Welcome Jumbotron */}
      <div className="bg-gradient-to-r from-primary-600 via-primary-500 to-emerald-500 rounded-3xl p-6 sm:p-8 text-white flex flex-col sm:flex-row items-center justify-between gap-6 shadow-lg shadow-primary-500/10">
        <div className="flex items-center gap-4 text-center sm:text-left flex-col sm:flex-row">
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center font-bold text-2xl border border-white/30 shrink-0">
            {currentUser?.name ? currentUser.name.charAt(0).toUpperCase() : 'U'}
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-black">{currentUser?.name}</h2>
            <p className="text-xs text-emerald-100 mt-1 flex items-center gap-1 justify-center sm:justify-start">
              <Mail size={12} />
              {currentUser?.email}
            </p>
          </div>
        </div>

        <button
          onClick={logout}
          className="flex items-center gap-1.5 bg-white/10 hover:bg-white/20 border border-white/20 px-5 py-2.5 rounded-2xl text-xs font-bold transition-all shadow shrink-0"
        >
          <LogOut size={14} />
          Sign Out
        </button>
      </div>

      {/* 2. RECHARTS CLINICAL DASHBOARD */}
      <section className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/60 p-6 sm:p-8 rounded-3xl shadow-sm space-y-8">
        <div>
          <h3 className="font-extrabold text-slate-800 dark:text-white text-base">Health & Pharmacy Analytics Dashboard</h3>
          <p className="text-xs text-slate-400 dark:text-slate-500 font-semibold mt-0.5">Visualize health statistics and monthly apothecary investments</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Chart 1: Healthcare Expense Tracker */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide flex items-center gap-1.5">
              <Award size={14} className="text-primary-600" />
              Monthly Medical Expenses (INR)
            </h4>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={EXPENSE_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid stroke={chartGridColor} strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="month" stroke={chartTextColor} fontSize={11} tickLine={false} />
                  <YAxis stroke={chartTextColor} fontSize={11} tickLine={false} axisLine={false} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(255,255,255,0.9)', 
                      borderRadius: '12px', 
                      border: 'none', 
                      boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                      fontSize: '11px'
                    }} 
                  />
                  <Bar dataKey="expenses" fill="#16a34a" radius={[6, 6, 0, 0]} name="Expense (₹)" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 2: Dosage Compliance & Sugar Monitor */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide flex items-center gap-1.5">
              <FileText size={14} className="text-accent-650 text-accent-500" />
              Blood Sugar Monitoring Trend (mg/dL)
            </h4>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={HEALTH_STATS} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid stroke={chartGridColor} strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="day" stroke={chartTextColor} fontSize={11} tickLine={false} />
                  <YAxis domain={[90, 140]} stroke={chartTextColor} fontSize={11} tickLine={false} axisLine={false} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(255,255,255,0.9)', 
                      borderRadius: '12px', 
                      border: 'none', 
                      boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                      fontSize: '11px'
                    }} 
                  />
                  <Line type="monotone" dataKey="bloodSugar" stroke="#0ea5e9" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} name="Glucose" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>
      </section>

      {/* 3. SETTINGS & SECURITY GRIDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Profile Editors Column */}
        <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/60 p-6 sm:p-8 rounded-3xl shadow-sm space-y-6">
          <h3 className="font-extrabold text-slate-850 dark:text-white text-base border-b border-slate-100 dark:border-slate-700 pb-3 flex items-center gap-2">
            <User size={18} className="text-primary-600" />
            Edit Profile Details
          </h3>

          {profileError && (
            <div className="bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 text-xs p-3 rounded-xl border border-red-200">
              {profileError}
            </div>
          )}
          {profileSuccess && (
            <div className="bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 text-xs p-3 rounded-xl border border-emerald-250">
              {profileSuccess}
            </div>
          )}

          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-1.5">Full Name</label>
              <div className="relative">
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-xs focus:ring-1 focus:ring-primary-500"
                />
                <User size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-1.5">Mobile Number</label>
              <div className="relative">
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-xs focus:ring-1 focus:ring-primary-500"
                />
                <Phone size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              </div>
            </div>

            <button
              type="submit"
              disabled={profileLoading}
              className="bg-primary-600 hover:bg-primary-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition-all shadow"
            >
              {profileLoading ? 'Saving...' : 'Update Details'}
            </button>
          </form>
        </div>

        {/* Change Password Column */}
        <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/60 p-6 sm:p-8 rounded-3xl shadow-sm space-y-6">
          <h3 className="font-extrabold text-slate-850 dark:text-white text-base border-b border-slate-100 dark:border-slate-700 pb-3 flex items-center gap-2">
            <Lock size={18} className="text-primary-600" />
            Security & Password
          </h3>

          {passwordError && (
            <div className="bg-red-50 dark:bg-red-950/20 text-red-650 dark:text-red-400 text-xs p-3 rounded-xl border border-red-200">
              {passwordError}
            </div>
          )}
          {passwordSuccess && (
            <div className="bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 text-xs p-3 rounded-xl border border-emerald-250">
              {passwordSuccess}
            </div>
          )}

          <form onSubmit={handleChangePassword} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-1.5">New Password</label>
              <div className="relative">
                <input
                  type="password"
                  placeholder="Min 6 characters"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-xs focus:ring-1 focus:ring-primary-500"
                />
                <Lock size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-1.5">Confirm New Password</label>
              <div className="relative">
                <input
                  type="password"
                  placeholder="Re-enter password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-xs focus:ring-1 focus:ring-primary-500"
                />
                <Lock size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              </div>
            </div>

            <button
              type="submit"
              disabled={passwordLoading}
              className="bg-primary-600 hover:bg-primary-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition-all shadow"
            >
              {passwordLoading ? 'Updating...' : 'Change Password'}
            </button>
          </form>
        </div>

      </div>

    </div>
  );
};

export default Profile;
