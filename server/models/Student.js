// server/models/Student.js
const { v4: uuidv4 } = require('uuid');
const { readStudents, writeStudents } = require('../utils/fileStorage');

class Student {
  static async create(studentData) {
    const students = readStudents();
    
    // Check if student already exists
    const exists = students.some(
      s => s.email === studentData.email || s.lrn === studentData.lrn
    );

    if (exists) {
      throw new Error('Student with this email or LRN already exists');
    }

    const newStudent = {
      id: uuidv4(),
      ...studentData,
      createdAt: new Date().toISOString(),
    };

    students.push(newStudent);
    const success = writeStudents(students);

    if (!success) {
      throw new Error('Failed to save student');
    }

    return newStudent;
  }

  static async findAll() {
    return readStudents();
  }

  static async findById(id) {
    const students = readStudents();
    return students.find(s => s.id === id);
  }

  static async findByEmail(email) {
    const students = readStudents();
    return students.find(s => s.email === email);
  }

  static async findByLRN(lrn) {
    const students = readStudents();
    return students.find(s => s.lrn === lrn);
  }

  static async update(id, updateData) {
    const students = readStudents();
    const index = students.findIndex(s => s.id === id);

    if (index === -1) {
      throw new Error('Student not found');
    }

    students[index] = {
      ...students[index],
      ...updateData,
      updatedAt: new Date().toISOString()
    };

    const success = writeStudents(students);

    if (!success) {
      throw new Error('Failed to update student');
    }

    return students[index];
  }

  static async delete(id) {
    const students = readStudents();
    const index = students.findIndex(s => s.id === id);

    if (index === -1) {
      throw new Error('Student not found');
    }

    const deleted = students.splice(index, 1);
    const success = writeStudents(students);

    if (!success) {
      throw new Error('Failed to delete student');
    }

    return deleted[0];
  }

  static async findByGradeAndSection(gradeLevel, section) {
     const students = readStudents();
     // Normalize both input and student fields for robust matching
     const normalize = str => (str || '').toString().trim().toLowerCase();
     return students.filter(s => 
      normalize(s.gradeLevel) === normalize(gradeLevel) &&
      normalize(s.section) === normalize(section)
     );
  }

  static async findByGradeLevel(gradeLevel) {
     const students = readStudents();
     const normalize = str => (str || '').toString().trim().toLowerCase();
     return students.filter(s => normalize(s.gradeLevel) === normalize(gradeLevel));
  }
}

module.exports = Student;
