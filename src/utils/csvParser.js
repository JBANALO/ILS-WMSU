/**
 * Helper function to remove quotes from CSV values
 * @param {string} value - CSV value possibly wrapped in quotes
 * @returns {string} Cleaned value
 */
const cleanCSVValue = (value) => {
  if (!value) return '';
  // Remove leading and trailing quotes if present
  let cleaned = value.trim();
  if ((cleaned.startsWith('"') && cleaned.endsWith('"')) || 
      (cleaned.startsWith("'") && cleaned.endsWith("'"))) {
    cleaned = cleaned.slice(1, -1);
  }
  return cleaned.trim();
};

/**
 * Parse CSV file and return array of objects
 * @param {File} file - CSV file to parse
 * @returns {Promise<Array>} Array of parsed data
 */
export const parseCSVFile = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (event) => {
      try {
        const csv = event.target.result;
        const lines = csv.split('\n').filter(line => line.trim());
        
        if (lines.length < 2) {
          reject(new Error('CSV file is empty or has no data rows'));
          return;
        }

        // Parse header
        const headers = lines[0].split(',').map(h => cleanCSVValue(h));
        const data = [];

        // Parse data rows
        for (let i = 1; i < lines.length; i++) {
          const values = lines[i].split(',').map(v => cleanCSVValue(v));
          const row = {};

          headers.forEach((header, index) => {
            row[header] = values[index] || '';
          });

          // Only require firstName and lastName, email is optional (will be auto-generated)
          if (row.firstName && row.lastName) {
            data.push(row);
          }
        }

        if (data.length === 0) {
          reject(new Error('No valid data rows found in CSV. Make sure each row has firstName and lastName.'));
          return;
        }

        resolve(data);
      } catch (error) {
        reject(new Error(`Error parsing CSV: ${error.message}`));
      }
    };

    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };

    reader.readAsText(file);
  });
};

/**
 * Auto-generate email from firstName and lastName
 * @param {string} firstName - Student's first name
 * @param {string} lastName - Student's last name
 * @returns {string} Generated email
 */
export const generateEmail = (firstName, lastName) => {
  const first = firstName?.trim().toLowerCase() || '';
  const last = lastName?.trim().toLowerCase() || '';
  const email = `${first}.${last}@wmsu.edu.ph`;
  return email;
};

/**
 * Auto-generate username from firstName and lastName
 * @param {string} firstName - Student's first name
 * @param {string} lastName - Student's last name
 * @returns {string} Generated username
 */
export const generateUsername = (firstName, lastName) => {
  const first = firstName?.trim().toLowerCase() || '';
  const last = lastName?.trim().toLowerCase() || '';
  const username = `${first}.${last}`;
  return username;
};

/**
 * Process students data - auto-generate emails and usernames if not provided
 * @param {Array} students - Array of student objects
 * @returns {Array} Processed students with emails and usernames
 */
export const processStudentData = (students) => {
  return students.map(student => ({
    ...student,
    // Auto-generate email if not provided or empty
    email: student.email?.trim() 
      ? student.email 
      : generateEmail(student.firstName, student.lastName),
    // Auto-generate username if not provided or empty
    username: student.username?.trim()
      ? student.username
      : generateUsername(student.firstName, student.lastName)
  }));
};

/**
 * Validate student data from CSV
 * @param {Array} students - Array of student objects
 * @returns {Object} Validation result with errors array
 */
export const validateStudentData = (students) => {
  const errors = [];

  students.forEach((student, index) => {
    const rowNum = index + 2; // +2 because of header row and 0-indexing

    if (!student.firstName?.trim()) {
      errors.push(`Row ${rowNum}: firstName is required`);
    }
    if (!student.lastName?.trim()) {
      errors.push(`Row ${rowNum}: lastName is required`);
    }
    // Email is now optional - will be auto-generated
    if (student.email?.trim() && !student.email?.includes('@wmsu.edu.ph')) {
      errors.push(`Row ${rowNum}: email must be a valid WMSU email (@wmsu.edu.ph) if provided`);
    }
    // Username is now optional - will be auto-generated
    if (!student.gradeLevel?.trim()) {
      errors.push(`Row ${rowNum}: gradeLevel is required`);
    }
    if (!student.section?.trim()) {
      errors.push(`Row ${rowNum}: section is required`);
    }
  });

  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Process teachers data - auto-generate emails and usernames if not provided
 * @param {Array} teachers - Array of teacher objects
 * @returns {Array} Processed teachers with emails and usernames
 */
export const processTeacherData = (teachers) => {
  return teachers.map(teacher => {
    // Parse subjects if provided as semicolon or comma-separated string
    let subjectsHandled = [];
    if (teacher.subjects?.trim()) {
      subjectsHandled = teacher.subjects
        .split(/[;,]/)
        .map(s => s.trim())
        .filter(s => s);
    }

    // Determine role based on isSubjectTeacher field or position
    let role = 'teacher';
    if (teacher.isSubjectTeacher?.toString().toLowerCase() === 'true' || teacher.isSubjectTeacher === '1') {
      role = 'subject_teacher';
    } else if (teacher.position?.toLowerCase().includes('adviser')) {
      role = 'adviser';
    }

    return {
      firstName: teacher.firstName?.trim() || '',
      lastName: teacher.lastName?.trim() || '',
      email: teacher.email?.trim() 
        ? teacher.email 
        : generateEmail(teacher.firstName, teacher.lastName),
      username: teacher.username?.trim()
        ? teacher.username
        : generateUsername(teacher.firstName, teacher.lastName),
      role: role,
      subjectsHandled: subjectsHandled,
      position: teacher.position?.trim() || '',
      department: 'Elementary'
    };
  });
};

/**
 * Validate teacher data from CSV
 * @param {Array} teachers - Array of teacher objects
 * @returns {Object} Validation result with errors array
 */
export const validateTeacherData = (teachers) => {
  const errors = [];

  teachers.forEach((teacher, index) => {
    const rowNum = index + 2; // +2 because of header row and 0-indexing

    // Required fields
    if (!teacher.firstName?.trim()) {
      errors.push(`Row ${rowNum}: firstName is required`);
    }
    if (!teacher.lastName?.trim()) {
      errors.push(`Row ${rowNum}: lastName is required`);
    }

    // Validate email format if provided
    if (teacher.email?.trim() && !teacher.email?.includes('@wmsu.edu.ph')) {
      errors.push(`Row ${rowNum}: email must be a valid WMSU email (@wmsu.edu.ph) if provided`);
    }

    // If subject teacher, require subjects
    if ((teacher.isSubjectTeacher?.toString().toLowerCase() === 'true' || teacher.isSubjectTeacher === '1') 
        && !teacher.subjects?.trim()) {
      errors.push(`Row ${rowNum}: subjects are required for subject teachers`);
    }
  });

  return {
    isValid: errors.length === 0,
    errors
  };
};
