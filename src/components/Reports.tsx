import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Payment, Student, BusStop } from '../types';
import { configService } from '../services/configService';
import { 
  FileText, 
  Download, 
  Filter, 
  Calendar,
  IndianRupee,
  TrendingUp,
  Receipt,
  Users,
  Bus,
  MapPin
} from 'lucide-react';

const Reports: React.FC = () => {
  const { user } = useAuth();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [filteredPayments, setFilteredPayments] = useState<Payment[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [busStops, setBusStops] = useState<BusStop[]>([]);
  const [activeTab, setActiveTab] = useState<'payments' | 'students'>('payments');
  const [filters, setFilters] = useState({
    paymentType: '',
    class: '',
    division: '',
    dateFrom: '',
    dateTo: '',
    busNumber: '',
    busStop: '',
    tripNumber: '',
  });

  useEffect(() => {
    loadData();
  }, [user]);

  useEffect(() => {
    filterPayments();
  }, [payments, filters]);

  const loadData = () => {
    const allPayments: Payment[] = JSON.parse(localStorage.getItem('school_payments') || '[]');
    const allStudents: Student[] = JSON.parse(localStorage.getItem('school_students') || '[]');
    
    setStudents(allStudents);
    
    // Populate student data in payments
    const paymentsWithStudents = allPayments.map(payment => ({
      ...payment,
      student: allStudents.find(s => s.id === payment.studentId) || payment.student
    }));

    if (user?.role === 'teacher' && user.class && user.division) {
      const teacherPayments = paymentsWithStudents.filter(
        p => p.student.class === user.class && p.student.division === user.division
      );
      setPayments(teacherPayments);
      const teacherStudents = allStudents.filter(
        s => s.class === user.class && s.division === user.division
      );
      setStudents(teacherStudents);
    } else {
      setPayments(paymentsWithStudents);
      setStudents(allStudents);
    }
    
    // Load bus stops
    configService.getBusStops().then(setBusStops);
  };

  const filterPayments = () => {
    let filtered = [...payments];

    if (filters.paymentType) {
      filtered = filtered.filter(p => p.paymentType === filters.paymentType);
    }

    if (filters.class) {
      filtered = filtered.filter(p => p.student.class === parseInt(filters.class));
    }

    if (filters.division) {
      filtered = filtered.filter(p => p.student.division === filters.division);
    }

    if (filters.busNumber) {
      filtered = filtered.filter(p => p.student.busNumber === parseInt(filters.busNumber));
    }

    if (filters.busStop) {
      filtered = filtered.filter(p => p.student.busStop === filters.busStop);
    }

    if (filters.tripNumber) {
      filtered = filtered.filter(p => p.student.tripNumber === parseInt(filters.tripNumber));
    }

    if (filters.dateFrom) {
      filtered = filtered.filter(p => 
        new Date(p.createdAt) >= new Date(filters.dateFrom)
      );
    }

    if (filters.dateTo) {
      filtered = filtered.filter(p => 
        new Date(p.createdAt) <= new Date(filters.dateTo)
      );
    }

    setFilteredPayments(filtered);
  };

  const downloadReport = () => {
    const csvContent = activeTab === 'payments' ? generatePaymentCSVReport() : generateStudentCSVReport();
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${activeTab}_report_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const generatePaymentCSVReport = () => {
    const headers = [
      'Receipt Number',
      'Student Name',
      'Admission Number',
      'Class',
      'Division',
      'Mobile',
      'Payment Type',
      'Description',
      'Amount',
      'Date',
      'Created By'
    ];

    const rows = filteredPayments.map(payment => [
      payment.receiptNumber,
      payment.student.name,
      payment.student.admissionNumber,
      payment.student.class,
      payment.student.division,
      payment.student.mobile,
      payment.paymentType,
      payment.description,
      payment.amount,
      new Date(payment.createdAt).toLocaleDateString(),
      payment.createdBy
    ]);

    return [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
  };

  const generateStudentCSVReport = () => {
    const headers = [
      'Admission Number',
      'Student Name',
      'Class',
      'Division',
      'Mobile',
      'Bus Stop',
      'Bus Number',
      'Trip Number'
    ];

    const filteredStudents = getFilteredStudents();
    const rows = filteredStudents.map(student => [
      student.admissionNumber,
      student.name,
      student.class,
      student.division,
      student.mobile,
      student.busStop,
      student.busNumber,
      student.tripNumber
    ]);

    return [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
  };

  const getFilteredStudents = () => {
    let filtered = [...students];

    if (filters.class) {
      filtered = filtered.filter(s => s.class === parseInt(filters.class));
    }

    if (filters.division) {
      filtered = filtered.filter(s => s.division === filters.division);
    }

    if (filters.busNumber) {
      filtered = filtered.filter(s => s.busNumber === parseInt(filters.busNumber));
    }

    if (filters.busStop) {
      filtered = filtered.filter(s => s.busStop === filters.busStop);
    }

    if (filters.tripNumber) {
      filtered = filtered.filter(s => s.tripNumber === parseInt(filters.tripNumber));
    }

    return filtered;
  };

  const getStudentStats = () => {
    const filteredStudents = getFilteredStudents();
    
    // Group by different criteria
    const byClass = filteredStudents.reduce((acc, student) => {
      const key = `${student.class}${student.division}`;
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const byBusStop = filteredStudents.reduce((acc, student) => {
      acc[student.busStop] = (acc[student.busStop] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const byBusNumber = filteredStudents.reduce((acc, student) => {
      const key = `Bus ${student.busNumber}`;
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const byTrip = filteredStudents.reduce((acc, student) => {
      const key = `Trip ${student.tripNumber}`;
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return { byClass, byBusStop, byBusNumber, byTrip, total: filteredStudents.length };
  };
  const printReceipt = (payment: Payment) => {
    const receiptWindow = window.open('', '_blank');
    if (!receiptWindow) return;

    const receiptHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Payment Receipt</title>
        <style>
          body { font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 20px; }
          .school-name { font-size: 24px; font-weight: bold; color: #333; }
          .receipt-title { font-size: 18px; color: #666; margin-top: 10px; }
          .receipt-info { display: flex; justify-content: space-between; margin-bottom: 20px; }
          .student-info { background: #f5f5f5; padding: 15px; border-radius: 5px; margin-bottom: 20px; }
          .payment-details { border-collapse: collapse; width: 100%; margin-bottom: 20px; }
          .payment-details th, .payment-details td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          .payment-details th { background-color: #f2f2f2; }
          .total { font-size: 18px; font-weight: bold; text-align: right; margin-top: 20px; }
          .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; }
          @media print {
            body { margin: 0; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="school-name">SARVODAYA HIGHER SECONDARY SCHOOL</div>
          <div class="receipt-title">Fee Payment Receipt</div>
        </div>
        
        <div class="receipt-info">
          <div><strong>Receipt No:</strong> ${payment.receiptNumber}</div>
          <div><strong>Date:</strong> ${new Date(payment.createdAt).toLocaleDateString()}</div>
        </div>
        
        <div class="student-info">
          <div><strong>Student Name:</strong> ${payment.student.name}</div>
          <div><strong>Admission No:</strong> ${payment.student.admissionNumber}</div>
          <div><strong>Class:</strong> ${payment.student.class}${payment.student.division}</div>
          <div><strong>Mobile:</strong> ${payment.student.mobile}</div>
        </div>
        
        <table class="payment-details">
          <thead>
            <tr>
              <th>Payment Type</th>
              <th>Description</th>
              <th>Amount</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>${payment.paymentType.charAt(0).toUpperCase() + payment.paymentType.slice(1)}</td>
              <td>${payment.description}</td>
              <td>₹${payment.amount}</td>
            </tr>
          </tbody>
        </table>
        
        <div class="total">
          Total Amount Paid: ₹${payment.amount}
        </div>
        
        <div class="footer">
          <p>Thank you for your payment!</p>
          <p><em>This is a computer-generated receipt.</em></p>
          <button class="no-print" onclick="window.print()">Print Receipt</button>
        </div>
      </body>
      </html>
    `;

    receiptWindow.document.write(receiptHTML);
    receiptWindow.document.close();
  };

  const totalAmount = filteredPayments.reduce((sum, p) => sum + p.amount, 0);
  const totalByType = filteredPayments.reduce((acc, p) => {
    acc[p.paymentType] = (acc[p.paymentType] || 0) + p.amount;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">
          {user?.role === 'teacher' ? 'My Reports' : 'Payment Reports'}
        </h2>
        <div className="flex space-x-3">
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setActiveTab('payments')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'payments'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Payment Reports
            </button>
            {user?.role === 'admin' && (
              <button
                onClick={() => setActiveTab('students')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === 'students'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Student Reports
              </button>
            )}
          </div>
          <button
            onClick={downloadReport}
            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
          >
            <Download className="h-4 w-4 mr-2" />
            Download {activeTab === 'payments' ? 'Payment' : 'Student'} Report
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      {activeTab === 'payments' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-blue-100">
                <IndianRupee className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Collections</p>
                <p className="text-2xl font-bold text-gray-900">₹{totalAmount.toLocaleString()}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-green-100">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Payments</p>
                <p className="text-2xl font-bold text-gray-900">{filteredPayments.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-purple-100">
                <FileText className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Development Fee</p>
                <p className="text-2xl font-bold text-gray-900">₹{(totalByType.development || 0).toLocaleString()}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-orange-100">
                <FileText className="h-6 w-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Bus Fee</p>
                <p className="text-2xl font-bold text-gray-900">₹{(totalByType.bus || 0).toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-blue-100">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Students</p>
                <p className="text-2xl font-bold text-gray-900">{getStudentStats().total}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-green-100">
                <MapPin className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Bus Stops</p>
                <p className="text-2xl font-bold text-gray-900">{Object.keys(getStudentStats().byBusStop).length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-purple-100">
                <Bus className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Buses</p>
                <p className="text-2xl font-bold text-gray-900">{Object.keys(getStudentStats().byBusNumber).length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-orange-100">
                <FileText className="h-6 w-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Classes</p>
                <p className="text-2xl font-bold text-gray-900">{Object.keys(getStudentStats().byClass).length}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm border">
        <div className="flex items-center mb-4">
          <Filter className="h-5 w-5 text-gray-400 mr-2" />
          <h3 className="text-lg font-semibold">Filters</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {activeTab === 'payments' && (
            <select
              value={filters.paymentType}
              onChange={(e) => setFilters({ ...filters, paymentType: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Payment Types</option>
              <option value="development">Development Fee</option>
              <option value="bus">Bus Fee</option>
              <option value="special">Special Payment</option>
            </select>
          )}

          {user?.role === 'admin' && (
            <>
              <select
                value={filters.class}
                onChange={(e) => setFilters({ ...filters, class: e.target.value })}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Classes</option>
                {Array.from({ length: 12 }, (_, i) => (
                  <option key={i + 1} value={i + 1}>
                    Class {i + 1}
                  </option>
                ))}
              </select>

              <select
                value={filters.division}
                onChange={(e) => setFilters({ ...filters, division: e.target.value })}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Divisions</option>
                {['A', 'B', 'C', 'D', 'E'].map(div => (
                  <option key={div} value={div}>
                    Division {div}
                  </option>
                ))}
              </select>

              <select
                value={filters.busStop}
                onChange={(e) => setFilters({ ...filters, busStop: e.target.value })}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Bus Stops</option>
                {busStops.map(stop => (
                  <option key={stop.id} value={stop.name}>
                    {stop.name}
                  </option>
                ))}
              </select>

              <select
                value={filters.busNumber}
                onChange={(e) => setFilters({ ...filters, busNumber: e.target.value })}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Bus Numbers</option>
                {Array.from({ length: 6 }, (_, i) => (
                  <option key={i + 1} value={i + 1}>
                    Bus {i + 1}
                  </option>
                ))}
              </select>

              <select
                value={filters.tripNumber}
                onChange={(e) => setFilters({ ...filters, tripNumber: e.target.value })}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Trip Numbers</option>
                {Array.from({ length: 3 }, (_, i) => (
                  <option key={i + 1} value={i + 1}>
                    Trip {i + 1}
                  </option>
                ))}
              </select>
            </>
          )}

          {activeTab === 'payments' && (
            <>
              <div className="flex items-center">
                <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                <input
                  type="date"
                  value={filters.dateFrom}
                  onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center">
                <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                <input
                  type="date"
                  value={filters.dateTo}
                  onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </>
          )}
        </div>
      </div>

      {/* Payment List */}
      {activeTab === 'payments' ? (
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Receipt
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Student
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Payment Details
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredPayments.map((payment) => (
                  <tr key={payment.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{payment.receiptNumber}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{payment.student.name}</div>
                      <div className="text-sm text-gray-500">
                        Class {payment.student.class}{payment.student.division} • #{payment.student.admissionNumber}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{payment.description}</div>
                      <div className="text-sm text-gray-500">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          payment.paymentType === 'development' ? 'bg-purple-100 text-purple-800' :
                          payment.paymentType === 'bus' ? 'bg-orange-100 text-orange-800' :
                          'bg-pink-100 text-pink-800'
                        }`}>
                          {payment.paymentType}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">₹{payment.amount}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{new Date(payment.createdAt).toLocaleDateString()}</div>
                      <div className="text-sm text-gray-500">by {payment.createdBy}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => printReceipt(payment)}
                        className="text-blue-600 hover:text-blue-900 flex items-center"
                      >
                        <Receipt className="h-4 w-4 mr-1" />
                        Print
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Student Statistics */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Students by Class</h3>
              <div className="space-y-2">
                {Object.entries(getStudentStats().byClass).map(([classDiv, count]) => (
                  <div key={classDiv} className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Class {classDiv}</span>
                    <span className="text-sm font-medium text-gray-900 bg-blue-100 px-2 py-1 rounded">
                      {count} students
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Students by Bus Stop</h3>
              <div className="space-y-2">
                {Object.entries(getStudentStats().byBusStop).map(([stop, count]) => (
                  <div key={stop} className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">{stop}</span>
                    <span className="text-sm font-medium text-gray-900 bg-green-100 px-2 py-1 rounded">
                      {count} students
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Students by Bus Number</h3>
              <div className="space-y-2">
                {Object.entries(getStudentStats().byBusNumber).map(([bus, count]) => (
                  <div key={bus} className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">{bus}</span>
                    <span className="text-sm font-medium text-gray-900 bg-purple-100 px-2 py-1 rounded">
                      {count} students
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Students by Trip Number</h3>
              <div className="space-y-2">
                {Object.entries(getStudentStats().byTrip).map(([trip, count]) => (
                  <div key={trip} className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">{trip}</span>
                    <span className="text-sm font-medium text-gray-900 bg-orange-100 px-2 py-1 rounded">
                      {count} students
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reports;