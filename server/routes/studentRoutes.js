// server/routes/studentRoutes.js
const express = require('express');
const studentController = require('../controllers/studentController');

const router = express.Router();

// Create a new student
router.post('/', studentController.createStudent);

// Get all students
router.get('/', studentController.getStudents);

// Get students by grade level
router.get('/grade/:gradeLevel', studentController.getStudentsByGradeLevel);

// Get students by grade and section
router.get('/grade/:gradeLevel/section/:section', studentController.getStudentsByGradeAndSection);

// Update student grades (must come BEFORE the generic :id route)
router.put('/:id/grades', studentController.updateGrades);

// Get a specific student
router.get('/:id', studentController.getStudent);

// Update a student
router.put('/:id', studentController.updateStudent);

// Delete a specific student
router.delete('/:id', studentController.deleteStudent);

// Delete all students (and their user accounts)
router.delete('/', studentController.deleteAllStudents);

module.exports = router;
