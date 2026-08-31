import React, { useState } from 'react';
import { Lock, KeyRound, ArrowRight, ShieldCheck, Loader2, Eye, EyeOff } from 'lucide-react';
import { verifyPasscodeApi } from '../utils/authApi';

interface LoginScreenProps {
  onSuccess: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onSuccess }) => {
  const [passcode, setPasscode] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [shake, setShake] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passcode.trim()) return;

    setIsLoading(true);
    setError(false);
    setErrorMessage('');

    try {
      const result = await verifyPasscodeApi(passcode);
      if (result.success && result.role) {
        localStorage.setItem('kaf_authenticated_v1', 'true');
        localStorage.setItem('kaf_user_role', result.role);
        onSuccess();
      } else {
        setError(true);
        setErrorMessage(result.error || 'Incorrect passcode. Please check with your administrator.');
        setShake(true);
        setTimeout(() => setShake(false), 500);
      }
    } catch (err: any) {
      setError(true);
      setErrorMessage('Verification failed. Please try again.');
      setShake(true);
      setTimeout(() => setShake(false), 500);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 font-['Plus_Jakarta_Sans',sans-serif]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(99,102,241,0.15),transparent_50%)] pointer-events-none" />
      
      <div className={`w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-100 p-8 relative z-10 transition-transform ${shake ? 'animate-bounce' : ''}`}>
        
        {/* Header Icon & Title */}
        <div className="text-center space-y-3 mb-8">
          <div className="w-16 h-16 rounded-2xl bg-indigo-600 text-white flex items-center justify-center mx-auto shadow-lg shadow-indigo-500/30 text-2xl font-extrabold tracking-tight">
            K
          </div>
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-bold mb-2 border border-indigo-100">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Secure Access Portal</span>
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">KAF Agency Simulator</h1>
            <p className="text-xs text-slate-500 mt-1">Enter your passcode to access executive commission modeling</p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <KeyRound className="w-3.5 h-3.5 text-indigo-600" />
              <span>Passcode</span>
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                autoCapitalize="none"
                autoComplete="off"
                autoCorrect="off"
                spellCheck="false"
                value={passcode}
                onChange={(e) => {
                  setPasscode(e.target.value);
                  if (error) setError(false);
                }}
                placeholder="Enter passcode"
                autoFocus
                className={`w-full bg-slate-50 border rounded-2xl pl-4 pr-11 py-3.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-hidden transition-all ${
                  error ? 'border-red-300 bg-red-50/30 focus:border-red-500' : 'border-slate-200 focus:border-indigo-600 focus:bg-white'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer p-1"
                title={showPassword ? 'Hide passcode' : 'Show passcode'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {error && (
              <p className="text-xs font-bold text-red-600 pl-1 mt-1">
                ❌ {errorMessage || 'Incorrect passcode. Please check with your administrator.'}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 disabled:opacity-70 text-white font-extrabold py-3.5 px-4 rounded-2xl shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer text-sm"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Verifying...</span>
              </>
            ) : (
              <>
                <span>Unlock Simulator</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Footer Hint */}
        <div className="mt-8 pt-6 border-t border-slate-100 text-center">
          <p className="text-[11px] text-slate-400 font-medium">
            Authorized personnel only. Sessions are secured.
          </p>
        </div>

      </div>
    </div>
  );
};
