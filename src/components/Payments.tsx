import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Student, Payment, FeeConfiguration, BusStop } from '../types';
import { studentService } from '../services/studentService';
import { paymentService } from '../services/paymentService';
import { configService } from '../services/configService';
import { Plus, Search, CreditCard, Receipt } from 'lucide-react';

const Payments: React.FC = () => {
  const { user } = useAuth();
  const [students, setStudents] = useState<Student[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [feeConfigurations, setFeeConfigurations] = useState<FeeConfiguration[]>([]);
  const [busStops, setBusStops] = useState<BusStop[]>([]);
  const [recentPayments, setRecentPayments] = useState<Payment[]>([]);

  useEffect(() => {
    loadData();
  }, [user]);

  useEffect(() => {
    filterStudents();
  }, [students, searchTerm]);

  const loadData = () => {
    // Load all data concurrently
    Promise.all([
      studentService.getStudents(user?.role || 'teacher', user?.class, user?.division),
      configService.getFeeConfigurations(),
      configService.getBusStops(),
      paymentService.getPayments(user?.role || 'teacher', user?.class, user?.division)
    ]).then(([studentsData, configsData, stopsData, paymentsData]) => {
      setStudents(studentsData);
      setFeeConfigurations(configsData);
      setBusStops(stopsData);
      setRecentPayments(paymentsData.slice(0, 10));
    }).catch(console.error);
  };

  const filterStudents = () => {
    let filtered = [...students];

    if (searchTerm) {
      filtered = filtered.filter(student =>
        student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.admissionNumber.includes(searchTerm)
      );
    }

    setFilteredStudents(filtered);
  };

  const handleAddPayment = (student: Student) => {
    setSelectedStudent(student);
    setShowPaymentForm(true);
  };

  const PaymentForm: React.FC = () => {
    const [paymentData, setPaymentData] = useState({
      developmentFee: false,
      busFee: false,
      specialPayment: false,
      specialPaymentType: '',
      specialAmount: 0,
      notes: '',
    });

    if (!selectedStudent) return null;

    const studentFeeConfig = feeConfigurations.find(fc => fc.class === selectedStudent.class);
    const studentBusStop = busStops.find(bs => bs.name === selectedStudent.busStop);
    
    const developmentFeeAmount = studentFeeConfig?.developmentFee || 0;
    const busFeeAmount = studentBusStop?.amount || 0;
    
    const totalAmount = 
      (paymentData.developmentFee ? developmentFeeAmount : 0) +
      (paymentData.busFee ? busFeeAmount : 0) +
      (paymentData.specialPayment ? paymentData.specialAmount : 0);

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      
      if (!paymentData.developmentFee && !paymentData.busFee && !paymentData.specialPayment) {
        alert('Please select at least one payment type');
        return;
      }

      const allPayments: Payment[] = JSON.parse(localStorage.getItem('school_payments') || '[]');
      const allStudents: Student[] = JSON.parse(localStorage.getItem('school_students') || '[]');
      const studentData = allStudents.find(s => s.id === selectedStudent.id);

      const payments: Payment[] = [];

      if (paymentData.developmentFee) {
        payments.push({
          id: `payment_${Date.now()}_dev`,
          studentId: selectedStudent.id,
          student: studentData || selectedStudent,
          paymentType: 'development',
          amount: developmentFeeAmount,
          description: `Development Fee - Class ${selectedStudent.class}`,
          receiptNumber: generateReceiptNumber(),
          createdAt: new Date(),
          createdBy: user?.username || 'system',
        });
      }

      if (paymentData.busFee) {
        payments.push({
          id: `payment_${Date.now()}_bus`,
          studentId: selectedStudent.id,
          student: studentData || selectedStudent,
          paymentType: 'bus',
          amount: busFeeAmount,
          description: `Bus Fee - ${selectedStudent.busStop}`,
          receiptNumber: generateReceiptNumber(),
          createdAt: new Date(),
          createdBy: user?.username || 'system',
        });
      }

      if (paymentData.specialPayment && paymentData.specialAmount > 0) {
        payments.push({
          id: `payment_${Date.now()}_special`,
          studentId: selectedStudent.id,
          student: studentData || selectedStudent,
          paymentType: 'special',
          amount: paymentData.specialAmount,
          description: `Special Payment - ${paymentData.specialPaymentType}`,
          receiptNumber: generateReceiptNumber(),
          createdAt: new Date(),
          createdBy: user?.username || 'system',
          specialPaymentType: paymentData.specialPaymentType,
        });
      }

      allPayments.push(...payments);
      localStorage.setItem('school_payments', JSON.stringify(allPayments));
      
      setShowPaymentForm(false);
      setSelectedStudent(null);
      loadData();
      
      // Generate receipt for the combined payment
      if (payments.length > 0) {
        generateReceipt(payments);
      }
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-md">
          <h3 className="text-lg font-semibold mb-4">Add Payment</h3>
          <div className="mb-4 p-3 bg-gray-50 rounded-md">
            <h4 className="font-medium">{selectedStudent.name}</h4>
            <p className="text-sm text-gray-600">
              Class {selectedStudent.class}{selectedStudent.division} • #{selectedStudent.admissionNumber}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 border rounded-md">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="developmentFee"
                    checked={paymentData.developmentFee}
                    onChange={(e) => setPaymentData({ ...paymentData, developmentFee: e.target.checked })}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="developmentFee" className="ml-2 text-sm font-medium text-gray-700">
                    Development Fee
                  </label>
                </div>
                <span className="text-sm font-medium">₹{developmentFeeAmount}</span>
              </div>

              <div className="flex items-center justify-between p-3 border rounded-md">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="busFee"
                    checked={paymentData.busFee}
                    onChange={(e) => setPaymentData({ ...paymentData, busFee: e.target.checked })}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="busFee" className="ml-2 text-sm font-medium text-gray-700">
                    Bus Fee ({selectedStudent.busStop})
                  </label>
                </div>
                <span className="text-sm font-medium">₹{busFeeAmount}</span>
              </div>

              {user?.role === 'admin' && (
                <div className="p-3 border rounded-md">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="specialPayment"
                        checked={paymentData.specialPayment}
                        onChange={(e) => setPaymentData({ ...paymentData, specialPayment: e.target.checked })}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label htmlFor="specialPayment" className="ml-2 text-sm font-medium text-gray-700">
                        Special Payment
                      </label>
                    </div>
                  </div>
                  {paymentData.specialPayment && (
                    <div className="space-y-2">
                      <input
                        type="text"
                        placeholder="Payment type (e.g., Tour, Exam Fee)"
                        value={paymentData.specialPaymentType}
                        onChange={(e) => setPaymentData({ ...paymentData, specialPaymentType: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                      <input
                        type="number"
                        placeholder="Amount"
                        value={paymentData.specialAmount}
                        onChange={(e) => setPaymentData({ ...paymentData, specialAmount: parseInt(e.target.value) || 0 })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="pt-4 border-t">
              <div className="flex justify-between items-center text-lg font-semibold">
                <span>Total Amount:</span>
                <span>₹{totalAmount}</span>
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={() => setShowPaymentForm(false)}
                className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Process Payment
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  const generateReceipt = (payments: Payment[]) => {
    const receiptWindow = window.open('', '_blank');
    if (!receiptWindow) return;

    const totalAmount = payments.reduce((sum, p) => sum + p.amount, 0);
    const receiptNumber = payments[0].receiptNumber;

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
          <div><strong>Receipt No:</strong> ${receiptNumber}</div>
          <div><strong>Date:</strong> ${new Date().toLocaleDateString()}</div>
        </div>
        
        <div class="student-info">
          <div><strong>Student Name:</strong> ${payments[0].student.name}</div>
          <div><strong>Admission No:</strong> ${payments[0].student.admissionNumber}</div>
          <div><strong>Class:</strong> ${payments[0].student.class}${payments[0].student.division}</div>
          <div><strong>Mobile:</strong> ${payments[0].student.mobile}</div>
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
            ${payments.map(payment => `
              <tr>
                <td>${payment.paymentType.charAt(0).toUpperCase() + payment.paymentType.slice(1)}</td>
                <td>${payment.description}</td>
                <td>₹${payment.amount}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        
        <div class="total">
          Total Amount Paid: ₹${totalAmount}
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">
          {user?.role === 'teacher' ? 'Add Payment' : 'Payment Management'}
        </h2>
      </div>

      {/* Search Students */}
      <div className="bg-white p-4 rounded-lg shadow-sm border">
        <div className="flex items-center space-x-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search students to add payment..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="text-sm text-gray-600">
            {filteredStudents.length} students found
          </div>
        </div>
      </div>

      {/* Students List */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-4 border-b">
          <h3 className="text-lg font-semibold">Select Student for Payment</h3>
        </div>
        <div className="divide-y divide-gray-200">
          {filteredStudents.map((student) => (
            <div key={student.id} className="p-4 hover:bg-gray-50 flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <CreditCard className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <div className="font-medium text-gray-900">{student.name}</div>
                  <div className="text-sm text-gray-500">
                    Class {student.class}{student.division} • #{student.admissionNumber} • {student.mobile}
                  </div>
                </div>
              </div>
              <button
                onClick={() => handleAddPayment(student)}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Payment
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Payments */}
      {recentPayments.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-4 border-b">
            <h3 className="text-lg font-semibold">Recent Payments</h3>
          </div>
          <div className="divide-y divide-gray-200">
            {recentPayments.map((payment) => (
              <div key={payment.id} className="p-4 flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0 h-10 w-10 bg-green-100 rounded-full flex items-center justify-center">
                    <Receipt className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">{payment.student.name}</div>
                    <div className="text-sm text-gray-500">
                      {payment.description} • {payment.receiptNumber}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-medium text-gray-900">₹{payment.amount}</div>
                  <div className="text-sm text-gray-500">
                    {new Date(payment.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Payment Form Modal */}
      {showPaymentForm && <PaymentForm />}
    </div>
  );
};

export default Payments;