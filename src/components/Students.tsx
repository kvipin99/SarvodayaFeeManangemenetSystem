import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Student } from '../types';
import { generateCSVTemplate, parseCSVData } from '../utils/data';
import { studentService } from '../services/studentService';
import { 
  Plus, 
  Search, 
  Download, 
  Upload, 
  Edit, 
  Trash2,
  User,
  Phone,
  MapPin,
  Bus
} from 'lucide-react';

const Students: React.FC = () => {
  const { user } = useAuth();
  const [students, setStudents] = useState<Student[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [classFilter, setClassFilter] = useState('');
  const [divisionFilter, setDivisionFilter] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [csvContent, setCsvContent] = useState('');

  useEffect(() => {
    loadStudents();
  }, [user]);

  useEffect(() => {
    filterStudents();
  }, [students, searchTerm, classFilter, divisionFilter]);

  const loadStudents = () => {
    studentService.getStudents(user?.role || 'teacher', user?.class, user?.division)
      .then(setStudents)
      .catch(console.error);
  };

  const filterStudents = () => {
    let filtered = [...students];

    if (searchTerm) {
      filtered = filtered.filter(student =>
        student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.admissionNumber.includes(searchTerm) ||
        student.mobile.includes(searchTerm)
      );
    }

    if (classFilter) {
      filtered = filtered.filter(student => student.class === parseInt(classFilter));
    }

    if (divisionFilter) {
      filtered = filtered.filter(student => student.division === divisionFilter);
    }

    setFilteredStudents(filtered);
  };

  const handleAddStudent = (studentData: Omit<Student, 'id' | 'createdAt' | 'updatedAt'>) => {
    studentService.addStudent(studentData)
      .then((newStudent) => {
        if (newStudent) {
          loadStudents();
          setShowAddForm(false);
        }
      })
      .catch(console.error);
  };

  const handleUpdateStudent = (studentData: Omit<Student, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!editingStudent) return;

    studentService.updateStudent(editingStudent.id, studentData)
      .then((updatedStudent) => {
        if (updatedStudent) {
          loadStudents();
          setEditingStudent(null);
        }
      })
      .catch(console.error);
  };

  const handleDeleteStudent = (studentId: string) => {
    if (window.confirm('Are you sure you want to delete this student?')) {
      studentService.deleteStudent(studentId)
        .then((success) => {
          if (success) {
            loadStudents();
          }
        })
        .catch(console.error);
    }
  };

  const downloadCSVTemplate = () => {
    const template = generateCSVTemplate();
    const blob = new Blob([template], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'student_template.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCSVUpload = () => {
    if (!csvContent.trim()) return;

    try {
      const parsedData = parseCSVData(csvContent);
      const allStudents: Student[] = JSON.parse(localStorage.getItem('school_students') || '[]');
      
      parsedData.forEach(data => {
        if (data.admissionNumber && data.name) {
          const newStudent: Student = {
            id: `student_${Date.now()}_${Math.random()}`,
            admissionNumber: data.admissionNumber,
            name: data.name,
            mobile: data.mobile || '',
            class: data.class || 1,
            division: data.division || 'A',
            busStop: data.busStop || 'City Center',
            busNumber: data.busNumber || 1,
            tripNumber: data.tripNumber || 1,
            createdAt: new Date(),
            updatedAt: new Date(),
          };
          allStudents.push(newStudent);
        }
      });

      localStorage.setItem('school_students', JSON.stringify(allStudents));
      loadStudents();
      setShowUploadModal(false);
      setCsvContent('');
    } catch (error) {
      alert('Error parsing CSV data. Please check the format.');
    }
  };

  const StudentForm: React.FC<{
    student?: Student;
    onSubmit: (data: Omit<Student, 'id' | 'createdAt' | 'updatedAt'>) => void;
    onCancel: () => void;
  }> = ({ student, onSubmit, onCancel }) => {
    const [formData, setFormData] = useState({
      admissionNumber: student?.admissionNumber || '',
      name: student?.name || '',
      mobile: student?.mobile || '',
      class: student?.class || 1,
      division: student?.division || 'A',
      busStop: student?.busStop || 'City Center',
      busNumber: student?.busNumber || 1,
      tripNumber: student?.tripNumber || 1,
    });

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      onSubmit(formData);
    };

    const busStops = ['City Center', 'Railway Station', 'Bus Stand', 'Market Square', 'Hospital Junction', 'Temple Road', 'School Gate'];

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-md">
          <h3 className="text-lg font-semibold mb-4">
            {student ? 'Edit Student' : 'Add New Student'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Admission Number
              </label>
              <input
                type="text"
                value={formData.admissionNumber}
                onChange={(e) => setFormData({ ...formData, admissionNumber: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mobile Number
              </label>
              <input
                type="tel"
                value={formData.mobile}
                onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Class
                </label>
                <select
                  value={formData.class}
                  onChange={(e) => setFormData({ ...formData, class: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={user?.role === 'teacher'}
                >
                  {Array.from({ length: 12 }, (_, i) => (
                    <option key={i + 1} value={i + 1}>
                      {i + 1}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Division
                </label>
                <select
                  value={formData.division}
                  onChange={(e) => setFormData({ ...formData, division: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={user?.role === 'teacher'}
                >
                  {['A', 'B', 'C', 'D', 'E'].map(div => (
                    <option key={div} value={div}>
                      {div}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Bus Stop
              </label>
              <select
                value={formData.busStop}
                onChange={(e) => setFormData({ ...formData, busStop: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {busStops.map(stop => (
                  <option key={stop} value={stop}>
                    {stop}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bus Number
                </label>
                <select
                  value={formData.busNumber}
                  onChange={(e) => setFormData({ ...formData, busNumber: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {Array.from({ length: 6 }, (_, i) => (
                    <option key={i + 1} value={i + 1}>
                      {i + 1}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Trip Number
                </label>
                <select
                  value={formData.tripNumber}
                  onChange={(e) => setFormData({ ...formData, tripNumber: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {Array.from({ length: 3 }, (_, i) => (
                    <option key={i + 1} value={i + 1}>
                      {i + 1}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={onCancel}
                className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                {student ? 'Update' : 'Add'} Student
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">
          {user?.role === 'teacher' ? 'My Students' : 'Student Management'}
        </h2>
        <div className="flex space-x-3">
          {user?.role === 'admin' && (
            <>
              <button
                onClick={downloadCSVTemplate}
                className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
              >
                <Download className="h-4 w-4 mr-2" />
                CSV Template
              </button>
              <button
                onClick={() => setShowUploadModal(true)}
                className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                <Upload className="h-4 w-4 mr-2" />
                Upload CSV
              </button>
            </>
          )}
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Student
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm border">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search students..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          {user?.role === 'admin' && (
            <>
              <select
                value={classFilter}
                onChange={(e) => setClassFilter(e.target.value)}
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
                value={divisionFilter}
                onChange={(e) => setDivisionFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Divisions</option>
                {['A', 'B', 'C', 'D', 'E'].map(div => (
                  <option key={div} value={div}>
                    Division {div}
                  </option>
                ))}
              </select>
            </>
          )}
          
          <div className="text-sm text-gray-600 flex items-center">
            Total: {filteredStudents.length} students
          </div>
        </div>
      </div>

      {/* Students Table */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Student
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Class
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Transport
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredStudents.map((student) => (
                <tr key={student.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                          <User className="h-5 w-5 text-blue-600" />
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{student.name}</div>
                        <div className="text-sm text-gray-500">#{student.admissionNumber}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Phone className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-sm text-gray-900">{student.mobile}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {student.class}{student.division}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 text-gray-400 mr-1" />
                        {student.busStop}
                      </div>
                      <div className="flex items-center mt-1">
                        <Bus className="h-4 w-4 text-gray-400 mr-1" />
                        Bus {student.busNumber} • Trip {student.tripNumber}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => setEditingStudent(student)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteStudent(student.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Student Form */}
      {(showAddForm || editingStudent) && (
        <StudentForm
          student={editingStudent || undefined}
          onSubmit={editingStudent ? handleUpdateStudent : handleAddStudent}
          onCancel={() => {
            setShowAddForm(false);
            setEditingStudent(null);
          }}
        />
      )}

      {/* CSV Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Upload Student Data</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Paste CSV Content
                </label>
                <textarea
                  value={csvContent}
                  onChange={(e) => setCsvContent(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={6}
                  placeholder="Paste your CSV content here..."
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowUploadModal(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCSVUpload}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Upload
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Students;