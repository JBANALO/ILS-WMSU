const express = require('express');
const router = express.Router();
const classController = require('../controllers/classController');

// Get all classes
router.get('/', classController.getAllClasses);

// Get classes for a specific adviser (must be before :classId routes)
router.get('/adviser/:adviserId', classController.getAdviserClasses);

// Get classes for a specific subject teacher
router.get('/subject-teacher/:teacherId', classController.getSubjectTeacherClasses);

// Assign adviser to a class
router.put('/:classId/assign', classController.assignAdviserToClass);

// Unassign adviser from a class
router.put('/:classId/unassign', classController.unassignAdviser);

// Assign subject teacher to a class
router.put('/:classId/assign-subject-teacher', classController.assignSubjectTeacher);

// Unassign subject teacher from a class
router.put('/:classId/unassign-subject-teacher/:teacherId', classController.unassignSubjectTeacher);

module.exports = router;
