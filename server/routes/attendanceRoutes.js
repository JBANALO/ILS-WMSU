const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

// Path to attendance data file
const attendanceDataPath = path.join(__dirname, '../../data/attendance.json');

// Initialize attendance file if it doesn't exist
if (!fs.existsSync(attendanceDataPath)) {
  fs.writeFileSync(attendanceDataPath, JSON.stringify([]));
}

// Get attendance data
const getAttendanceData = () => {
  try {
    const data = fs.readFileSync(attendanceDataPath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading attendance data:', error);
    return [];
  }
};

// Save attendance data
const saveAttendanceData = (data) => {
  try {
    fs.writeFileSync(attendanceDataPath, JSON.stringify(data, null, 2));
    return true;
  } catch (error) {
    console.error('Error saving attendance data:', error);
    return false;
  }
};

// POST /api/attendance - Record attendance via QR scan
router.post('/', async (req, res) => {
  try {
    const { studentId, qrData, location, deviceInfo } = req.body;
    
    if (!studentId) {
      return res.status(400).json({
        success: false,
        message: 'Student ID is required'
      });
    }

    // Get student data to validate
    const studentsPath = path.join(__dirname, '../../data/students.json');
    const students = JSON.parse(fs.readFileSync(studentsPath, 'utf8'));
    const student = students.find(s => s.id === studentId);
    
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    // Get current attendance data
    const attendanceData = getAttendanceData();
    
    // Check if already recorded today
    const today = new Date().toISOString().split('T')[0];
    const existingRecord = attendanceData.find(record => 
      record.studentId === studentId && 
      record.date === today
    );

    if (existingRecord) {
      return res.status(400).json({
        success: false,
        message: 'Attendance already recorded for today',
        data: existingRecord
      });
    }

    // Create new attendance record
    const attendanceRecord = {
      id: Date.now().toString(),
      studentId: studentId,
      studentName: student.fullName,
      gradeLevel: student.gradeLevel,
      section: student.section,
      date: today,
      timestamp: new Date().toISOString(),
      status: 'Present',
      location: location || 'Unknown',
      deviceInfo: deviceInfo || {},
      qrData: qrData
    };

    // Add to attendance data
    attendanceData.push(attendanceRecord);
    
    // Save to file
    if (saveAttendanceData(attendanceData)) {
      res.json({
        success: true,
        message: 'Attendance recorded successfully',
        data: attendanceRecord
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Failed to save attendance record'
      });
    }

  } catch (error) {
    console.error('Error recording attendance:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

// GET /api/attendance - Get attendance records
router.get('/', async (req, res) => {
  try {
    const { date, studentId, gradeLevel, section } = req.query;
    let attendanceData = getAttendanceData();

    // Apply filters
    if (date) {
      attendanceData = attendanceData.filter(record => record.date === date);
    }
    if (studentId) {
      attendanceData = attendanceData.filter(record => record.studentId === studentId);
    }
    if (gradeLevel) {
      attendanceData = attendanceData.filter(record => record.gradeLevel === gradeLevel);
    }
    if (section) {
      attendanceData = attendanceData.filter(record => record.section === section);
    }

    res.json({
      success: true,
      data: attendanceData
    });

  } catch (error) {
    console.error('Error fetching attendance:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

// GET /api/attendance/today - Get today's attendance
router.get('/today', async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const attendanceData = getAttendanceData();
    const todayRecords = attendanceData.filter(record => record.date === today);

    res.json({
      success: true,
      data: todayRecords,
      count: todayRecords.length
    });

  } catch (error) {
    console.error('Error fetching today\'s attendance:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

// GET /api/attendance/student/:id - Get attendance for specific student
router.get('/student/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const attendanceData = getAttendanceData();
    const studentRecords = attendanceData.filter(record => record.studentId === id);

    res.json({
      success: true,
      data: studentRecords,
      count: studentRecords.length
    });

  } catch (error) {
    console.error('Error fetching student attendance:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

module.exports = router;