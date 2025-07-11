import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { Student } from '../types';

export const studentService = {
  async getStudents(userRole: string, userClass?: number, userDivision?: string): Promise<Student[]> {
    if (isSupabaseConfigured() && supabase) {
      try {
        let query = supabase.from('students').select('*');
        
        // Apply role-based filtering
        if (userRole === 'teacher' && userClass && userDivision) {
          query = query.eq('class', userClass).eq('division', userDivision);
        }
        
        const { data, error } = await query.order('class').order('division').order('name');
        
        if (error) {
          console.error('Error fetching students:', error);
          return [];
        }
        
        return data?.map(student => ({
          id: student.id,
          admissionNumber: student.admission_number,
          name: student.name,
          mobile: student.mobile,
          class: student.class,
          division: student.division,
          busStop: student.bus_stop,
          busNumber: student.bus_number,
          tripNumber: student.trip_number,
          createdAt: new Date(student.created_at),
          updatedAt: new Date(student.updated_at),
        })) || [];
      } catch (error) {
        console.error('Error in getStudents:', error);
        return [];
      }
    } else {
      // Fallback to localStorage
      const allStudents: Student[] = JSON.parse(localStorage.getItem('school_students') || '[]');
      
      if (userRole === 'teacher' && userClass && userDivision) {
        return allStudents.filter(s => s.class === userClass && s.division === userDivision);
      }
      
      return allStudents;
    }
  },

  async addStudent(student: Omit<Student, 'id' | 'createdAt' | 'updatedAt'>): Promise<Student | null> {
    if (isSupabaseConfigured() && supabase) {
      try {
        const { data, error } = await supabase
          .from('students')
          .insert({
            admission_number: student.admissionNumber,
            name: student.name,
            mobile: student.mobile,
            class: student.class,
            division: student.division,
            bus_stop: student.busStop,
            bus_number: student.busNumber,
            trip_number: student.tripNumber,
          })
          .select()
          .single();

        if (error) {
          console.error('Error adding student:', error);
          return null;
        }

        return {
          id: data.id,
          admissionNumber: data.admission_number,
          name: data.name,
          mobile: data.mobile,
          class: data.class,
          division: data.division,
          busStop: data.bus_stop,
          busNumber: data.bus_number,
          tripNumber: data.trip_number,
          createdAt: new Date(data.created_at),
          updatedAt: new Date(data.updated_at),
        };
      } catch (error) {
        console.error('Error in addStudent:', error);
        return null;
      }
    } else {
      // Fallback to localStorage
      const newStudent: Student = {
        ...student,
        id: `student_${Date.now()}`,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const allStudents: Student[] = JSON.parse(localStorage.getItem('school_students') || '[]');
      allStudents.push(newStudent);
      localStorage.setItem('school_students', JSON.stringify(allStudents));
      return newStudent;
    }
  },

  async updateStudent(id: string, student: Omit<Student, 'id' | 'createdAt' | 'updatedAt'>): Promise<Student | null> {
    if (isSupabaseConfigured() && supabase) {
      try {
        const { data, error } = await supabase
          .from('students')
          .update({
            admission_number: student.admissionNumber,
            name: student.name,
            mobile: student.mobile,
            class: student.class,
            division: student.division,
            bus_stop: student.busStop,
            bus_number: student.busNumber,
            trip_number: student.tripNumber,
            updated_at: new Date().toISOString(),
          })
          .eq('id', id)
          .select()
          .single();

        if (error) {
          console.error('Error updating student:', error);
          return null;
        }

        return {
          id: data.id,
          admissionNumber: data.admission_number,
          name: data.name,
          mobile: data.mobile,
          class: data.class,
          division: data.division,
          busStop: data.bus_stop,
          busNumber: data.bus_number,
          tripNumber: data.trip_number,
          createdAt: new Date(data.created_at),
          updatedAt: new Date(data.updated_at),
        };
      } catch (error) {
        console.error('Error in updateStudent:', error);
        return null;
      }
    } else {
      // Fallback to localStorage
      const allStudents: Student[] = JSON.parse(localStorage.getItem('school_students') || '[]');
      const updatedStudents = allStudents.map(s => 
        s.id === id 
          ? { ...s, ...student, updatedAt: new Date() }
          : s
      );
      localStorage.setItem('school_students', JSON.stringify(updatedStudents));
      
      const updatedStudent = updatedStudents.find(s => s.id === id);
      return updatedStudent || null;
    }
  },

  async deleteStudent(id: string): Promise<boolean> {
    if (isSupabaseConfigured() && supabase) {
      try {
        const { error } = await supabase
          .from('students')
          .delete()
          .eq('id', id);

        return !error;
      } catch (error) {
        console.error('Error deleting student:', error);
        return false;
      }
    } else {
      // Fallback to localStorage
      const allStudents: Student[] = JSON.parse(localStorage.getItem('school_students') || '[]');
      const updatedStudents = allStudents.filter(s => s.id !== id);
      localStorage.setItem('school_students', JSON.stringify(updatedStudents));
      return true;
    }
  }
};