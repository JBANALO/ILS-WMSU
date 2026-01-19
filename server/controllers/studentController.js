// server/controllers/studentController.js
const Student = require('../models/Student');

exports.createStudent = async (req, res) => {
  try {
    const student = await Student.create(req.body);
    res.status(201).json({
      status: 'success',
      data: { student }
    });
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error.message
    });
  }
};

exports.getStudents = async (req, res) => {
  try {
    const students = await Student.findAll();
    res.status(200).json({
      status: 'success',
      data: students
    });
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error.message
    });
  }
};

exports.getStudent = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({
        status: 'fail',
        message: 'Student not found'
      });
    }
    res.status(200).json({
      status: 'success',
      data: { student }
    });
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error.message
    });
  }
};

exports.updateStudent = async (req, res) => {
  try {
    const student = await Student.update(req.params.id, req.body);
    res.status(200).json({
      status: 'success',
      data: { student }
    });
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error.message
    });
  }
};

exports.deleteStudent = async (req, res) => {
  try {
    // Get student first to get their email
    const allStudents = await Student.findAll();
    const student = allStudents.find(s => s.id === req.params.id);
    
    if (!student) {
      return res.status(404).json({
        status: 'fail',
        message: 'Student not found'
      });
    }

    // Save email before deletion
    const studentEmail = student.email;

    // Delete the student
    const deletedStudent = await Student.delete(req.params.id);
    
    // Also delete the user account if the student has an email
    if (studentEmail) {
      const User = require('../models/User');
      const userDeleted = User.deleteByEmail(studentEmail);
      console.log(`User account deleted for email: ${studentEmail}, result: ${userDeleted}`);
    }
    
    res.status(200).json({
      status: 'success',
      message: 'Student and user account deleted successfully',
      data: { student: deletedStudent }
    });
  } catch (error) {
    console.error('Error deleting student:', error);
    res.status(400).json({
      status: 'fail',
      message: error.message
    });
  }
};

exports.getStudentsByGradeLevel = async (req, res) => {
  try {
    const students = await Student.findByGradeLevel(req.params.gradeLevel);
    res.status(200).json({
      status: 'success',
      data: students
    });
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error.message
    });
  }
};

exports.getStudentsByGradeAndSection = async (req, res) => {
  try {
    const { gradeLevel, section } = req.params;
    const students = await Student.findByGradeAndSection(gradeLevel, section);
    res.status(200).json({
      status: 'success',
      data: students
    });
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error.message
    });
  }
};

exports.deleteAllStudents = async (req, res) => {
  try {
    const User = require('../models/User');
    
    // Get all students first to collect their emails
    const allStudents = await Student.findAll();
    const studentEmails = allStudents.map(s => s.email).filter(email => email);
    
    // Delete all student user accounts by email
    studentEmails.forEach(email => {
      User.deleteByEmail(email);
    });
    
    // Delete all student records from database
    const { writeStudents } = require('../utils/fileStorage');
    const success = writeStudents([]);
    
    if (!success) {
      throw new Error('Failed to delete all students');
    }
    
    console.log(`Deleted ${allStudents.length} students and ${studentEmails.length} user accounts`);
    
    res.status(200).json({
      status: 'success',
      message: `Deleted all ${allStudents.length} students and their ${studentEmails.length} user accounts`,
      data: {
        studentsDeleted: allStudents.length,
        accountsDeleted: studentEmails.length
      }
    });
  } catch (error) {
    console.error('Error deleting all students:', error);
    res.status(400).json({
      status: 'fail',
      message: error.message
    });
  }
};

// Update student grades
exports.updateGrades = async (req, res) => {
  try {
    const { id } = req.params;
    const { grades, average, quarter, lastGradeEditTime } = req.body;

    const allStudents = await Student.findAll();
    const student = allStudents.find(s => s.id === id);

    if (!student) {
      return res.status(404).json({
        status: 'fail',
        message: 'Student not found'
      });
    }

    // Update grades
    if (!student.grades) {
      student.grades = {};
    }

    // If quarter is 'all', update all quarters
    if (quarter === 'all') {
      Object.keys(grades).forEach(subject => {
        if (!student.grades[subject]) {
          student.grades[subject] = { q1: 0, q2: 0, q3: 0, q4: 0 };
        }
        student.grades[subject] = {
          ...student.grades[subject],
          ...grades[subject]
        };
      });
    } else {
      // Update specific quarter
      Object.keys(grades).forEach(subject => {
        if (!student.grades[subject]) {
          student.grades[subject] = { q1: 0, q2: 0, q3: 0, q4: 0 };
        }
        student.grades[subject][quarter] = grades[subject];
      });
    }

    // Update student average and last edit time
    student.average = average;
    student.lastGradeEditTime = lastGradeEditTime;

    // Save updated student
    const updatedStudent = await Student.update(id, student);

    res.status(200).json({
      status: 'success',
      message: 'Grades updated successfully',
      data: { student: updatedStudent }
    });
  } catch (error) {
    console.error('Error updating grades:', error);
    res.status(400).json({
      status: 'fail',
      message: error.message
    });
  }
};
