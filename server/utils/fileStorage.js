// server/utils/fileStorage.js
const fs = require('fs');
const path = require('path');

const dataPath = path.join(__dirname, '../../data');
const usersFile = path.join(dataPath, 'users.json');
const studentsFile = path.join(dataPath, 'students.json');

// Ensure data directory exists
if (!fs.existsSync(dataPath)) {
  fs.mkdirSync(dataPath, { recursive: true });
}

// Initialize users file if it doesn't exist
if (!fs.existsSync(usersFile)) {
  fs.writeFileSync(usersFile, JSON.stringify([], null, 2));
}

// Initialize students file if it doesn't exist
if (!fs.existsSync(studentsFile)) {
  fs.writeFileSync(studentsFile, JSON.stringify([], null, 2));
}

const readUsers = () => {
  try {
    const data = fs.readFileSync(usersFile, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading users file:', error);
    return [];
  }
};

const writeUsers = (users) => {
  try {
    fs.writeFileSync(usersFile, JSON.stringify(users, null, 2));
    return true;
  } catch (error) {
    console.error('Error writing to users file:', error);
    return false;
  }
};

const readStudents = () => {
  try {
    const data = fs.readFileSync(studentsFile, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading students file:', error);
    return [];
  }
};

const writeStudents = (students) => {
  try {
    fs.writeFileSync(studentsFile, JSON.stringify(students, null, 2));
    return true;
  } catch (error) {
    console.error('Error writing to students file:', error);
    return false;
  }
};

module.exports = {
  readUsers,
  writeUsers,
  readStudents,
  writeStudents
};
