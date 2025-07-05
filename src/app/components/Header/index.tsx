'use client';

import { LogOut, Upload, User } from 'lucide-react';
import { signOut, useSession } from 'next-auth/react';
import React from 'react';
import Button from '../Button';
import { getBaseUrl } from '@/app/utils/functions';

export const Header = () => {
  const { data: session } = useSession();

  const handleSignOut = async (): Promise<void> => {
    await signOut({ callbackUrl: getBaseUrl() + '/', });
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

            <Button variant="danger" size="sm" onClick={handleSignOut}>
              <LogOut className="w-4 h-4 mr-1" />
              Sign Out
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};
