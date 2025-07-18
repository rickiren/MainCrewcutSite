import React, { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { AuthService } from '../lib/auth';
import { DatabaseService } from '../lib/supabase';
import { LogIn, UserPlus, Loader2 } from 'lucide-react';

interface AuthWrapperProps {
  children: (user: User) => React.ReactNode;
}

export default function AuthWrapper({ children }: AuthWrapperProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check current user
    AuthService.getCurrentUser()
      .then(user => {
        setUser(user);
        setLoading(false);
      })
      .catch(() => {
        setUser(null);
        setLoading(false);
      });

    // Listen for auth changes
    const { data: { subscription } } = AuthService.onAuthStateChange((user) => {
      setUser(user);
      setLoading(false);
      
      // Initialize user settings when they first sign in
      if (user) {
        initializeUserSettings(user.id);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const initializeUserSettings = async (userId: string) => {
    try {
      const existingSettings = await DatabaseService.getUserSettings(userId);
      if (!existingSettings) {
        await DatabaseService.saveUserSettings({
          user_id: userId,
          polling_interval_seconds: 5,
          max_conversation_history: 50,
          preferred_timeframes: ['1m', '5m', '15m'],
          risk_tolerance: 'medium',
          notification_settings: {
            ticker_changes: true,
            grade_alerts: true,
            risk_warnings: true
          },
          ai_personality: 'balanced'
        });
      }
    } catch (error) {
      console.error('Error initializing user settings:', error);
    }
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    setError(null);

    try {
      if (authMode === 'signin') {
        await AuthService.signIn(email, password);
      } else {
        await AuthService.signUp(email, password);
      }
    } catch (error: any) {
      setError(error.message);
    } finally {
      setAuthLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="h-screen bg-black text-green-400 font-mono flex items-center justify-center">
        <div className="flex items-center space-x-3">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span>Loading AI Trading Coach...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="h-screen bg-black text-green-400 font-mono flex items-center justify-center">
        <div className="w-full max-w-md p-8 bg-gray-900 border border-green-700 rounded-lg">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-green-400 mb-2">AI Trading Coach</h1>
            <p className="text-green-600">Sign in to access your trading memory</p>
          </div>

          <form onSubmit={handleAuth} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-green-400 mb-2">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-3 py-2 bg-black border border-green-700 rounded-lg text-green-400 focus:outline-none focus:border-green-500"
                placeholder="trader@example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-green-400 mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-3 py-2 bg-black border border-green-700 rounded-lg text-green-400 focus:outline-none focus:border-green-500"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <div className="p-3 bg-red-900/30 border border-red-700 rounded-lg">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={authLoading}
              className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-black font-medium rounded-lg transition-colors"
            >
              {authLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : authMode === 'signin' ? (
                <>
                  <LogIn className="w-4 h-4" />
                  <span>Sign In</span>
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4" />
                  <span>Sign Up</span>
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => setAuthMode(authMode === 'signin' ? 'signup' : 'signin')}
              className="text-green-500 hover:text-green-400 text-sm transition-colors"
            >
              {authMode === 'signin' 
                ? "Don't have an account? Sign up" 
                : "Already have an account? Sign in"
              }
            </button>
          </div>

          <div className="mt-8 p-4 bg-black border border-green-800 rounded-lg">
            <h3 className="text-green-400 font-semibold mb-2">🧠 Memory Features</h3>
            <ul className="text-green-600 text-sm space-y-1">
              <li>• Persistent chat history across sessions</li>
              <li>• Screenshot analysis storage</li>
              <li>• Ticker session tracking</li>
              <li>• Trade logging and analytics</li>
              <li>• AI learning from your patterns</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  return <>{children(user)}</>;
}