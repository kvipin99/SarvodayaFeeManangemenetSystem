import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { Payment, Student } from '../types';
import { generateReceiptNumber } from '../utils/data';

export const paymentService = {
  async getPayments(userRole: string, userClass?: number, userDivision?: string): Promise<Payment[]> {
    if (isSupabaseConfigured() && supabase) {
      try {
        let query = supabase
          .from('payments')
          .select(`
            *,
            students (
              id,
              admission_number,
              name,
              mobile,
              class,
              division,
              bus_stop,
              bus_number,
              trip_number,
              created_at,
              updated_at
            )
          `);
        
        const { data, error } = await query.order('created_at', { ascending: false });
        
        if (error) {
          console.error('Error fetching payments:', error);
          return [];
        }
        
        let payments = data?.map(payment => ({
          id: payment.id,
          studentId: payment.student_id,
          student: {
            id: payment.students.id,
            admissionNumber: payment.students.admission_number,
            name: payment.students.name,
            mobile: payment.students.mobile,
            class: payment.students.class,
            division: payment.students.division,
            busStop: payment.students.bus_stop,
            busNumber: payment.students.bus_number,
            tripNumber: payment.students.trip_number,
            createdAt: new Date(payment.students.created_at),
            updatedAt: new Date(payment.students.updated_at),
          },
          paymentType: payment.payment_type as 'development' | 'bus' | 'special',
          amount: payment.amount,
          description: payment.description,
          receiptNumber: payment.receipt_number,
          createdAt: new Date(payment.created_at),
          createdBy: payment.created_by,
          specialPaymentType: payment.special_payment_type,
        })) || [];

        // Apply role-based filtering
        if (userRole === 'teacher' && userClass && userDivision) {
          payments = payments.filter(p => 
            p.student.class === userClass && p.student.division === userDivision
          );
        }
        
        return payments;
      } catch (error) {
        console.error('Error in getPayments:', error);
        return [];
      }
    } else {
      // Fallback to localStorage
      const allPayments: Payment[] = JSON.parse(localStorage.getItem('school_payments') || '[]');
      const allStudents: Student[] = JSON.parse(localStorage.getItem('school_students') || '[]');
      
      const paymentsWithStudents = allPayments.map(payment => ({
        ...payment,
        student: allStudents.find(s => s.id === payment.studentId) || payment.student
      }));

      if (userRole === 'teacher' && userClass && userDivision) {
        return paymentsWithStudents.filter(p => 
          p.student.class === userClass && p.student.division === userDivision
        );
      }
      
      return paymentsWithStudents;
    }
  },

  async addPayment(payment: Omit<Payment, 'id' | 'createdAt' | 'receiptNumber'>): Promise<Payment | null> {
    if (isSupabaseConfigured() && supabase) {
      try {
        const receiptNumber = generateReceiptNumber();
        
        const { data, error } = await supabase
          .from('payments')
          .insert({
            student_id: payment.studentId,
            payment_type: payment.paymentType,
            amount: payment.amount,
            description: payment.description,
            receipt_number: receiptNumber,
            special_payment_type: payment.specialPaymentType,
            created_by: payment.createdBy,
          })
          .select(`
            *,
            students (
              id,
              admission_number,
              name,
              mobile,
              class,
              division,
              bus_stop,
              bus_number,
              trip_number,
              created_at,
              updated_at
            )
          `)
          .single();

        if (error) {
          console.error('Error adding payment:', error);
          return null;
        }

        return {
          id: data.id,
          studentId: data.student_id,
          student: {
            id: data.students.id,
            admissionNumber: data.students.admission_number,
            name: data.students.name,
            mobile: data.students.mobile,
            class: data.students.class,
            division: data.students.division,
            busStop: data.students.bus_stop,
            busNumber: data.students.bus_number,
            tripNumber: data.students.trip_number,
            createdAt: new Date(data.students.created_at),
            updatedAt: new Date(data.students.updated_at),
          },
          paymentType: data.payment_type as 'development' | 'bus' | 'special',
          amount: data.amount,
          description: data.description,
          receiptNumber: data.receipt_number,
          createdAt: new Date(data.created_at),
          createdBy: data.created_by,
          specialPaymentType: data.special_payment_type,
        };
      } catch (error) {
        console.error('Error in addPayment:', error);
        return null;
      }
    } else {
      // Fallback to localStorage
      const newPayment: Payment = {
        ...payment,
        id: `payment_${Date.now()}`,
        receiptNumber: generateReceiptNumber(),
        createdAt: new Date(),
      };

      const allPayments: Payment[] = JSON.parse(localStorage.getItem('school_payments') || '[]');
      allPayments.push(newPayment);
      localStorage.setItem('school_payments', JSON.stringify(allPayments));
      return newPayment;
    }
  }
};