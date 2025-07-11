import { Student, Payment, FeeConfiguration, BusStop, DashboardStats } from '../types';

// Initialize default data
export const initializeDefaultData = () => {
  // Initialize fee configurations
  if (!localStorage.getItem('school_fee_configurations')) {
    const feeConfigs: FeeConfiguration[] = [];
    for (let i = 1; i <= 12; i++) {
      feeConfigs.push({
        id: `fee_config_${i}`,
        class: i,
        developmentFee: 1000 + (i * 100), // Increasing fee with class
        updatedAt: new Date(),
      });
    }
    localStorage.setItem('school_fee_configurations', JSON.stringify(feeConfigs));
  }

  // Initialize bus stops
  if (!localStorage.getItem('school_bus_stops')) {
    const busStops: BusStop[] = [
      { id: 'stop1', name: 'City Center', amount: 500, createdAt: new Date() },
      { id: 'stop2', name: 'Railway Station', amount: 600, createdAt: new Date() },
      { id: 'stop3', name: 'Bus Stand', amount: 450, createdAt: new Date() },
      { id: 'stop4', name: 'Market Square', amount: 550, createdAt: new Date() },
      { id: 'stop5', name: 'Hospital Junction', amount: 650, createdAt: new Date() },
      { id: 'stop6', name: 'Temple Road', amount: 400, createdAt: new Date() },
      { id: 'stop7', name: 'School Gate', amount: 300, createdAt: new Date() },
    ];
    localStorage.setItem('school_bus_stops', JSON.stringify(busStops));
  }

  // Initialize sample students
  if (!localStorage.getItem('school_students')) {
    const students: Student[] = [];
    const sampleNames = [
      'Rahul Sharma', 'Priya Patel', 'Amit Kumar', 'Sneha Gupta', 'Ravi Singh',
      'Kavya Reddy', 'Arjun Nair', 'Pooja Joshi', 'Vikram Yadav', 'Divya Agarwal'
    ];
    
    let admissionCounter = 1001;
    for (let classNum = 1; classNum <= 12; classNum++) {
      for (let div = 0; div < 5; div++) {
        const division = String.fromCharCode(65 + div);
        // Add 2-3 students per class-division
        for (let i = 0; i < 3; i++) {
          if (admissionCounter <= 1100) {
            students.push({
              id: `student_${admissionCounter}`,
              admissionNumber: admissionCounter.toString(),
              name: sampleNames[Math.floor(Math.random() * sampleNames.length)],
              mobile: `98${Math.floor(Math.random() * 100000000).toString().padStart(8, '0')}`,
              class: classNum,
              division,
              busStop: 'City Center',
              busNumber: Math.floor(Math.random() * 6) + 1,
              tripNumber: Math.floor(Math.random() * 3) + 1,
              createdAt: new Date(),
              updatedAt: new Date(),
            });
            admissionCounter++;
          }
        }
      }
    }
    localStorage.setItem('school_students', JSON.stringify(students));
  }

  // Initialize sample payments
  if (!localStorage.getItem('school_payments')) {
    localStorage.setItem('school_payments', JSON.stringify([]));
  }
};

export const generateReceiptNumber = (): string => {
  const date = new Date();
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  const time = Date.now().toString().slice(-6);
  return `SHSS${year}${month}${day}${time}`;
};

export const getDashboardStats = (userRole: string, userClass?: number, userDivision?: string): DashboardStats => {
  const students: Student[] = JSON.parse(localStorage.getItem('school_students') || '[]');
  const payments: Payment[] = JSON.parse(localStorage.getItem('school_payments') || '[]');

  let filteredStudents = students;
  let filteredPayments = payments;

  if (userRole === 'teacher' && userClass && userDivision) {
    filteredStudents = students.filter(s => s.class === userClass && s.division === userDivision);
    const studentIds = filteredStudents.map(s => s.id);
    filteredPayments = payments.filter(p => studentIds.includes(p.studentId));
  }

  const totalCollections = filteredPayments.reduce((sum, p) => sum + p.amount, 0);
  const developmentFeeCollections = filteredPayments
    .filter(p => p.paymentType === 'development')
    .reduce((sum, p) => sum + p.amount, 0);
  const busFeeCollections = filteredPayments
    .filter(p => p.paymentType === 'bus')
    .reduce((sum, p) => sum + p.amount, 0);
  const specialPaymentCollections = filteredPayments
    .filter(p => p.paymentType === 'special')
    .reduce((sum, p) => sum + p.amount, 0);

  // Class-wise breakup
  const classWiseBreakup = filteredStudents.reduce((acc, student) => {
    const key = `${student.class}-${student.division}`;
    const existing = acc.find(item => item.class === student.class && item.division === student.division);
    if (existing) {
      existing.count++;
    } else {
      acc.push({ class: student.class, division: student.division, count: 1 });
    }
    return acc;
  }, [] as { class: number; division: string; count: number }[]);

  // Recent payments (last 10)
  const recentPayments = filteredPayments
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 10);

  return {
    totalStudents: filteredStudents.length,
    totalCollections,
    developmentFeeCollections,
    busFeeCollections,
    specialPaymentCollections,
    classWiseBreakup,
    recentPayments,
  };
};

export const generateCSVTemplate = (): string => {
  const headers = ['Admission Number', 'Name', 'Mobile', 'Class', 'Division', 'Bus Stop', 'Bus Number', 'Trip Number'];
  const sample = ['1001', 'John Doe', '9876543210', '10', 'A', 'City Center', '1', '1'];
  return [headers.join(','), sample.join(',')].join('\n');
};

export const parseCSVData = (csvContent: string): Partial<Student>[] => {
  const lines = csvContent.trim().split('\n');
  const headers = lines[0].split(',').map(h => h.trim());
  const data: Partial<Student>[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map(v => v.trim());
    if (values.length >= 8) {
      data.push({
        admissionNumber: values[0],
        name: values[1],
        mobile: values[2],
        class: parseInt(values[3]),
        division: values[4],
        busStop: values[5],
        busNumber: parseInt(values[6]),
        tripNumber: parseInt(values[7]),
      });
    }
  }

  return data;
};