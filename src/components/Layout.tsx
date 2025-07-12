import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import ConnectionStatus from './ConnectionStatus';
import { 
  LogOut, 
  Home, 
  Users, 
  CreditCard, 
  Settings, 
  FileText,
  School,
  Key
} from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  currentPage: string;
  onPageChange: (page: string) => void;
}

const Layout: React.FC<LayoutProps> = ({ children, currentPage, onPageChange }) => {
  const { user, logout } = useAuth();

  const adminMenuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'students', label: 'Students', icon: Users },
    { id: 'payments', label: 'Payments', icon: CreditCard },
    { id: 'reports', label: 'Reports', icon: FileText },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const teacherMenuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'students', label: 'My Students', icon: Users },
    { id: 'payments', label: 'Add Payment', icon: CreditCard },
    { id: 'reports', label: 'My Reports', icon: FileText },
  ];

  const menuItems = user?.role === 'admin' ? adminMenuItems : teacherMenuItems;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <img 
                src="/New Logo.png" 
                alt="Sarvodaya School Logo" 
                className="h-12 w-12 rounded-full object-cover"
                onError={(e) => {
                  // Fallback to icon if image fails to load
                  e.currentTarget.style.display = 'none';
                  e.currentTarget.nextElementSibling?.classList.remove('hidden');
                }}
              />
              <School className="h-8 w-8 text-blue-600 hidden" />
              <h1 className="ml-3 text-xl font-bold text-gray-900">
                Sarvodaya Higher Secondary School
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <ConnectionStatus />
              <div className="text-sm text-gray-700">
                Welcome, <span className="font-medium">{user?.username}</span>
                {user?.role === 'teacher' && (
                  <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                    Class {user.class}{user.division}
                  </span>
                )}
              </div>
              <button
                onClick={() => onPageChange('change-password')}
                className="flex items-center text-gray-500 hover:text-gray-700 p-2"
                title="Change Password"
              >
                <Key className="h-5 w-5" />
              </button>
              <button
                onClick={logout}
                className="flex items-center text-gray-500 hover:text-gray-700 p-2"
                title="Logout"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex space-x-6">
          {/* Sidebar */}
          <div className="w-64 bg-white rounded-lg shadow-sm p-4">
            <nav className="space-y-2">
              {menuItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => onPageChange(item.id)}
                    className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                      currentPage === item.id
                        ? 'bg-blue-100 text-blue-700 border-l-4 border-blue-600'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="h-5 w-5 mr-3" />
                    {item.label}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Layout;