import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getDashboardStats } from '../utils/data';
import { DashboardStats } from '../types';
import { 
  Users, 
  IndianRupee, 
  TrendingUp, 
  Bus, 
  GraduationCap,
  Gift
} from 'lucide-react';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);

  useEffect(() => {
    const loadStats = () => {
      const dashboardStats = getDashboardStats(
        user?.role || 'teacher',
        user?.class,
        user?.division
      );
      setStats(dashboardStats);
    };

    loadStats();
  }, [user]);

  if (!stats) {
    return <div>Loading...</div>;
  }

  const StatCard: React.FC<{
    title: string;
    value: string | number;
    icon: React.ReactNode;
    color: string;
  }> = ({ title, value, icon, color }) => (
    <div className="bg-white p-6 rounded-lg shadow-sm border">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
        <div className={`p-3 rounded-lg ${color}`}>
          {icon}
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>
        <div className="text-sm text-gray-500">
          {user?.role === 'teacher' && (
            <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full">
              Class {user.class}{user.division}
            </span>
          )}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Students"
          value={stats.totalStudents}
          icon={<Users className="h-6 w-6 text-blue-600" />}
          color="bg-blue-100"
        />
        <StatCard
          title="Total Collections"
          value={`₹${stats.totalCollections.toLocaleString()}`}
          icon={<IndianRupee className="h-6 w-6 text-green-600" />}
          color="bg-green-100"
        />
        <StatCard
          title="Development Fee"
          value={`₹${stats.developmentFeeCollections.toLocaleString()}`}
          icon={<GraduationCap className="h-6 w-6 text-purple-600" />}
          color="bg-purple-100"
        />
        <StatCard
          title="Bus Fee"
          value={`₹${stats.busFeeCollections.toLocaleString()}`}
          icon={<Bus className="h-6 w-6 text-orange-600" />}
          color="bg-orange-100"
        />
      </div>

      {stats.specialPaymentCollections > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Special Payments"
            value={`₹${stats.specialPaymentCollections.toLocaleString()}`}
            icon={<Gift className="h-6 w-6 text-pink-600" />}
            color="bg-pink-100"
          />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Class-wise Breakdown */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {user?.role === 'admin' ? 'Class-wise Student Count' : 'My Class Students'}
          </h3>
          <div className="space-y-3">
            {stats.classWiseBreakup.map((item) => (
              <div key={`${item.class}-${item.division}`} className="flex justify-between items-center">
                <span className="text-sm text-gray-600">
                  Class {item.class}{item.division}
                </span>
                <span className="text-sm font-medium text-gray-900 bg-gray-100 px-2 py-1 rounded">
                  {item.count} students
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Payments */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Payments</h3>
          <div className="space-y-3">
            {stats.recentPayments.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-4">No payments recorded yet</p>
            ) : (
              stats.recentPayments.map((payment) => (
                <div key={payment.id} className="flex justify-between items-center border-b pb-2">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{payment.student.name}</p>
                    <p className="text-xs text-gray-500">
                      {payment.description} • {payment.receiptNumber}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">₹{payment.amount}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(payment.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;