// server/controllers/userController.js
const User = require('../models/User');
const Student = require('../models/Student');
const { signToken } = require('../utils/auth');

exports.signup = async (req, res) => {
  try {
    const { email, password, confirmPassword, ...userData } = req.body;

    if (password !== confirmPassword) {
      return res.status(400).json({
        status: 'fail',
        message: 'Passwords do not match',
      });
    }

    const user = await User.create({
      ...userData,
      email,
      password,
      role: userData.role || 'student',
      status: 'pending', // All new signups require admin approval
    });

    // If creating a student account, also create student record
    if ((userData.role || 'student') === 'student') {
      try {
        await Student.create({
          firstName: userData.firstName,
          lastName: userData.lastName,
          email: email,
          fullName: `${userData.firstName} ${userData.lastName}`,
          userId: user.id,
          gradeLevel: userData.gradeLevel || '',
          section: userData.section || '',
          lrn: userData.lrn || `${Date.now()}`, // Generate LRN if not provided
          average: 0,
          grades: {},
        });
      } catch (studentError) {
        console.warn('Warning: Could not create student record:', studentError.message);
        // Don't fail the user creation if student record creation fails
      }
    }

    const token = signToken(user.id);

    res.status(201).json({
      status: 'success',
      token,
      data: {
        user,
      },
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message,
    });
  }
};

exports.signupBatch = async (req, res) => {
  try {
    const { users: usersData } = req.body;

    if (!Array.isArray(usersData) || usersData.length === 0) {
      return res.status(400).json({
        status: 'fail',
        message: 'Please provide an array of users',
      });
    }

    // Validate all users
    for (const user of usersData) {
      if (user.password !== user.confirmPassword) {
        return res.status(400).json({
          status: 'fail',
          message: `Passwords do not match for ${user.email}`,
        });
      }
    }

    const createdUsers = await User.createBatch(
      usersData.map(u => ({
        ...u,
        role: u.role || 'student',
      }))
    );

    res.status(201).json({
      status: 'success',
      data: {
        count: createdUsers.length,
        users: createdUsers,
      },
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message,
    });
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    const { role } = req.query;
    const User = require('../models/User');
    const { readUsers } = require('../utils/fileStorage');
    
    let users = readUsers();
    
    // Filter by role if provided
    if (role) {
      users = users.filter(u => u.role === role);
    }
    
    // Remove passwords before returning
    users = users.map(u => {
      const { password, ...userWithoutPassword } = u;
      return userWithoutPassword;
    });
    
    res.status(200).json({
      status: 'success',
      count: users.length,
      data: {
        users: users
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        status: 'fail',
        message: 'User not found',
      });
    }
    res.status(200).json({
      status: 'success',
      data: {
        user,
      },
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Error fetching user data',
    });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!id) {
      return res.status(400).json({
        status: 'fail',
        message: 'User ID is required',
      });
    }

    const deleted = User.deleteById(id);

    if (!deleted) {
      return res.status(404).json({
        status: 'fail',
        message: 'User not found or already deleted',
      });
    }

    res.status(200).json({
      status: 'success',
      message: 'User deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message,
    });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    if (!id) {
      return res.status(400).json({
        status: 'fail',
        message: 'User ID is required',
      });
    }

    // Get all users
    const users = require('../utils/fileStorage').readUsers();
    const userIndex = users.findIndex(u => u.id === id);

    if (userIndex === -1) {
      return res.status(404).json({
        status: 'fail',
        message: 'User not found',
      });
    }

    // Don't allow updating password directly
    delete updates.password;
    delete updates.id;
    delete updates.createdAt;

    // Update user
    users[userIndex] = {
      ...users[userIndex],
      ...updates,
    };

    const success = require('../utils/fileStorage').writeUsers(users);

    if (!success) {
      return res.status(500).json({
        status: 'fail',
        message: 'Failed to update user',
      });
    }

    // Return user without password
    const { password, ...userWithoutPassword } = users[userIndex];

    res.status(200).json({
      status: 'success',
      data: {
        user: userWithoutPassword,
      },
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message,
    });
  }
};

exports.getPendingTeachers = async (req, res) => {
  try {
    const { readUsers } = require('../utils/fileStorage');
    const users = readUsers();
    
    // Get ALL pending users (students, teachers, advisers)
    const pendingTeachers = users
      .filter(user => user.status === 'pending')
      .map(user => {
        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword;
      });
    
    res.status(200).json({
      status: 'success',
      count: pendingTeachers.length,
      data: {
        teachers: pendingTeachers
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

exports.approveTeacher = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        status: 'fail',
        message: 'User ID is required',
      });
    }

    const { readUsers, writeUsers, readStudents, writeStudents } = require('../utils/fileStorage');
    const { v4: uuidv4 } = require('uuid');
    
    const users = readUsers();
    const userIndex = users.findIndex(u => u.id === id);

    if (userIndex === -1) {
      return res.status(404).json({
        status: 'fail',
        message: 'User not found',
      });
    }

    users[userIndex].status = 'approved';

    const success = writeUsers(users);

    if (!success) {
      return res.status(500).json({
        status: 'fail',
        message: 'Failed to approve user',
      });
    }

    // If role is student, create student record in students.json (port 3001 API)
    if (users[userIndex].role === 'student') {
      try {
        const students = readStudents();
        const studentExists = students.some(s => s.email === users[userIndex].email);
        
        if (!studentExists) {
          const newStudent = {
            id: uuidv4(),
            fullName: users[userIndex].fullName,
            email: users[userIndex].email,
            gradeLevel: users[userIndex].gradeLevel || '7',
            section: users[userIndex].section || 'N/A',
            lrn: users[userIndex].lrn || '',
            grades: {},
            average: 0,
            createdAt: new Date().toISOString()
          };
          
          students.push(newStudent);
          writeStudents(students);
        }
      } catch (studentError) {
        // Log but don't fail user approval if student creation fails
        console.error('Error creating student record:', studentError.message);
      }
    }

    const { password, ...userWithoutPassword } = users[userIndex];

    res.status(200).json({
      status: 'success',
      message: 'User approved successfully',
      data: {
        user: userWithoutPassword,
      },
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message,
    });
  }
};

exports.declineTeacher = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    if (!id) {
      return res.status(400).json({
        status: 'fail',
        message: 'Teacher ID is required',
      });
    }

    const { readUsers, writeUsers } = require('../utils/fileStorage');
    const users = readUsers();
    const userIndex = users.findIndex(u => u.id === id);

    if (userIndex === -1) {
      return res.status(404).json({
        status: 'fail',
        message: 'Teacher not found',
      });
    }

    users[userIndex].status = 'declined';
    users[userIndex].declineReason = reason || 'No reason provided';

    const success = writeUsers(users);

    if (!success) {
      return res.status(500).json({
        status: 'fail',
        message: 'Failed to decline teacher',
      });
    }

    const { password, ...userWithoutPassword } = users[userIndex];

    res.status(200).json({
      status: 'success',
      message: 'Teacher declined successfully',
      data: {
        user: userWithoutPassword,
      },
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message,
    });
  }
};