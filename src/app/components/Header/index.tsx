import { LogOut, Upload, User } from 'lucide-react'
import { signOut, useSession } from 'next-auth/react';
import React from 'react'

export const Header = () => {
  const { data: session } = useSession();
   const handleSignOut = async (): Promise<void> => {
    await signOut({ callbackUrl: '/login' });
  };
  return (
    <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="inline-flex items-center justify-center w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg mr-3">
                <Upload className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-xl font-bold text-gray-900">DriveClone</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <User className="w-5 h-5 text-gray-600" />
                <span className="text-sm text-gray-700">
                  {session?.user?.name || session?.user?.email || 'Demo User'}
                </span>
              </div>
              <button
                onClick={handleSignOut}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
              >
                <LogOut className="w-4 h-4 mr-1" />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>
  )
}
