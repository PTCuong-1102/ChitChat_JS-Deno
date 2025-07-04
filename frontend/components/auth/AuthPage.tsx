import React, { useState } from 'react';
import SignInForm from './SignInForm.tsx';
import SignUpForm from './SignUpForm.tsx';
import { User } from '../../types.ts';

interface AuthPageProps {
  onSignIn: (user: User) => void;
  onSignUp: (user: User) => void;
}

const AuthPage: React.FC<AuthPageProps> = ({ onSignIn, onSignUp }) => {
  const [isSigningUp, setIsSigningUp] = useState(true);

  return (
    <div className="min-h-screen bg-brand-bg flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-6xl mx-auto bg-white rounded-2xl shadow-2xl overflow-hidden">
        <header className="p-4 flex justify-between items-center bg-brand-pink-100/50 border-b border-brand-pink-200/50">
          <h1 className="text-xl font-bold text-brand-pink-600">ChitChat</h1>
          <button className="text-gray-500 hover:text-gray-800">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </header>
        <main className="grid md:grid-cols-2">
          <div className="p-12 md:p-20 flex flex-col justify-center">
            <h2 className="text-5xl font-bold text-brand-pink-500 mb-4">Welcome to</h2>
            <h2 className="text-5xl font-bold text-brand-pink-500 mb-8">ChitChat App</h2>
            <p className="text-gray-600 leading-relaxed">
              Seamlessly connect with friends in private chats, collaborate in group conversations, or explore the future of interaction with our built-in Gemini AI assistant. Your beautifully simple and intelligent chat experience starts here.
            </p>
          </div>
          <div className="p-12 md:p-16 flex items-center justify-center bg-brand-pink-50">
             {isSigningUp ? (
              <SignUpForm onSwitch={() => setIsSigningUp(false)} onSignUp={onSignUp} />
            ) : (
              <SignInForm onSwitch={() => setIsSigningUp(true)} onSignIn={onSignIn} />
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AuthPage;