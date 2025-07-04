import React, { useState } from 'react';
import { User } from '../../types.ts';
import { apiService } from '../../services/apiService.ts';

interface SignInFormProps {
  onSwitch: () => void;
  onSignIn: (user: User) => void;
}

const SignInForm: React.FC<SignInFormProps> = ({ onSwitch, onSignIn }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await apiService.login({ email, password });
      console.log('✅ Login successful:', response);
      onSignIn(response.user);
    } catch (error: any) {
      console.error('❌ Login failed:', error);
      setError(error.message || 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-sm p-8 bg-white rounded-2xl shadow-lg border border-brand-pink-200/50">
      <h3 className="text-3xl font-bold text-brand-pink-500 text-center mb-8">Sign in</h3>
      
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="text-sm font-medium text-brand-pink-600">Email:</label>
          <input 
            type="email" 
            required 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="w-full mt-1 p-3 bg-brand-pink-50 border border-brand-pink-200 text-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-pink-400 focus:border-transparent transition" />
        </div>
        <div>
          <label className="text-sm font-medium text-brand-pink-600">Password:</label>
          <input 
            type="password" 
            required 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full mt-1 p-3 bg-brand-pink-50 border border-brand-pink-200 text-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-pink-400 focus:border-transparent transition" />
        </div>
        <button 
          type="submit" 
          disabled={isLoading}
          className="w-full py-3 bg-gradient-to-r from-pink-500 to-rose-400 text-white font-bold rounded-lg shadow-md hover:shadow-lg transition transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Signing in...' : 'Sign in'}
        </button>
      </form>
      <p className="text-center text-sm text-gray-600 mt-6">
        Don't have account? <button onClick={onSwitch} className="font-semibold text-brand-pink-500 hover:underline">Sign up now</button>
      </p>
    </div>
  );
};

export default SignInForm;