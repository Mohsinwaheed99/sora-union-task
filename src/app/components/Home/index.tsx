'use client';
import React, { useState } from 'react';
import { Upload } from 'lucide-react';
import { useRouter } from 'next/navigation';
import LoginForm from '../LoginForm';
import SignupForm from '../SignupForm';
import { login, signup } from '@/app/services/auth.service';

const Home = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  console.log('router',router);

  const handleLoginSubmit = async (data: { email: string; password: string }) => {
    setIsLoading(true);
    setError('');

    try {
      const result = await login(data);

      if (!result.success) {
        setError('Invalid email or password');
      } else {
        router.replace('/dashboard');
      }
    } catch (err) {
      setError('An error occurred during login');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignupSubmit = async (data: {
    name: string;
    email: string;
    password: string;
    confirmPassword: string;
  }) => {
    setIsLoading(true);
    setError('');

    try {
      const response = await signup(data);

      const loginResult = await login({
        email: data.email,
        password: data.password,
      });

      if (!loginResult.success) {
        setError('Account created but login failed. Please try logging in manually.');
      } else {
        router.replace('/dashboard');
      }
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Signup failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-pink-100 to-yellow-100 flex items-center justify-center p-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-full blur-3xl"></div>
      </div>

      <div className="w-full max-w-md relative">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl mb-4 shadow-xl">
            <Upload className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
            DriveClone
          </h1>
          <p className="text-gray-600 mt-2">
            {isLogin ? 'Welcome back! Sign in to your account' : 'Create your account to get started'}
          </p>
        </div>

        <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 p-8 transition-all duration-300">
          <div className="flex bg-gray-100 rounded-xl p-1 mb-8">
            <span
              onClick={() => {
                setIsLogin(true);
                setError('');
              }}
              className={`flex-1 py-2 px-4 text-center rounded-lg cursor-pointer text-sm font-medium transition-all duration-200 ${
                isLogin 
                  ? 'bg-white text-gray-900 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Sign In
            </span>
            <span
              onClick={() => {
                setIsLogin(false);
                setError('');
              }}
              className={`flex-1 py-2 px-4 rounded-lg text-center cursor-pointer text-sm font-medium transition-all duration-200 ${
                !isLogin 
                  ? 'bg-white text-gray-900 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Sign Up
            </span>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          {isLogin ? (
            <LoginForm onSubmit={handleLoginSubmit} isLoading={isLoading} />
          ) : (
            <SignupForm onSubmit={handleSignupSubmit} isLoading={isLoading} />
          )}

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              {isLogin ? "Don't have an account? " : "Already have an account? "}
              <span
                onClick={() => {
                  setIsLogin(!isLogin);
                  setError('');
                }}
                className="font-medium text-blue-600 hover:text-blue-500 transition-colors cursor-pointer"
              >
                {isLogin ? 'Sign up' : 'Sign in'}
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;