import React from 'react';
import { isSupabaseConfigured } from '../lib/supabase';
import { Database, Wifi, WifiOff } from 'lucide-react';

const ConnectionStatus: React.FC = () => {
  const isConnected = isSupabaseConfigured();

  return (
    <div className={`flex items-center px-3 py-1 rounded-full text-xs font-medium ${
      isConnected 
        ? 'bg-green-100 text-green-800' 
        : 'bg-yellow-100 text-yellow-800'
    }`}>
      {isConnected ? (
        <>
          <Database className="h-3 w-3 mr-1" />
          Supabase Connected
        </>
      ) : (
        <>
          <WifiOff className="h-3 w-3 mr-1" />
          Local Storage Mode
        </>
      )}
    </div>
  );
};

export default ConnectionStatus;