# Bulk Student Import Feature - User Guide

## Overview
The **Bulk Import (CSV)** feature allows you to create multiple student accounts at once by uploading a CSV file. This is much faster than creating individual accounts one by one.

## How to Use

### Step 1: Download the Template
1. Go to **Admin Dashboard** → **Students Management**
2. Click the **"Bulk Import (CSV)"** button
3. Click **"Download CSV Template"** to get the sample file

### Step 2: Prepare Your CSV File
The CSV file must have exactly these columns in this order:
```
firstName,lastName,email,username,gradeLevel,section
```

**Example:**
```csv
firstName,lastName,email,username,gradeLevel,section
Juan,Dela Cruz,juan@wmsu.edu.ph,juan.delcruz,Grade 3,Wisdom
Maria,Santos,maria@wmsu.edu.ph,maria.santos,Grade 4,Knowledge
Carlos,Reyes,carlos@wmsu.edu.ph,carlos.reyes,Grade 5,Excellence
```

### Requirements for Each Row:
- **firstName** - Student's first name (required)
- **lastName** - Student's last name (required)
- **email** - Must end with @wmsu.edu.ph (required, must be unique)
- **username** - Unique username for login (required)
- **gradeLevel** - Examples: Grade 3, Grade 4, Kindergarten (required)
- **section** - Class section like Wisdom, Knowledge, Excellence (required)

### Step 3: Upload and Review
1. Click **"Bulk Import (CSV)"** button
2. Select your CSV file
3. Set the **Default Password** for all students (default is "Password123")
   - Students can change this password later after login
4. Review the preview showing all students to be imported
5. Click **"Import [X] Students"** to start the bulk import

### Step 4: Monitor Progress
- The system will create accounts for all students
- You'll see a loading indicator while accounts are being created
- Each student's result will show as success ✅ or failure ❌

### Step 5: View Results
After import completes, you'll see:
- ✅ Successfully created accounts
- ❌ Failed accounts with reason (e.g., email already exists, duplicate username)
- Summary showing how many succeeded

---

## Common Errors and Solutions

### ❌ "email must be a valid WMSU email"
**Problem:** Email doesn't end with @wmsu.edu.ph
**Solution:** Make sure all emails are in format: `name@wmsu.edu.ph`

### ❌ "User with this email or username already exists"
**Problem:** Email or username already in the system
**Solution:** 
- Use unique usernames and emails
- Check if student already exists in the system
- Delete the duplicate row from your CSV

### ❌ "Row [X]: [field] is required"
**Problem:** Missing required field in that row
**Solution:** Make sure all columns have values: firstName, lastName, email, username, gradeLevel, section

### ❌ "CSV file is empty"
**Problem:** File has no data rows
**Solution:** Make sure your CSV file has at least one data row plus the header row

---

## Tips

✅ **Best Practices:**
- Use the provided template as a starting point
- Use consistent gradeLevel values (Grade 3, Grade 4, etc.)
- Make usernames lowercase and without spaces
- Always use @wmsu.edu.ph email addresses
- Double-check for duplicate emails and usernames before uploading

✅ **Password Management:**
- All imported students get the same default password
- Students should change their password on first login
- You can reset passwords individually if needed

✅ **File Format:**
- Save your file as .csv (CSV format)
- Use UTF-8 encoding
- Don't include extra columns beyond the required ones
- Don't leave rows blank in the middle

---

## Example CSV File

```csv
firstName,lastName,email,username,gradeLevel,section
Juan,Dela Cruz,juan@wmsu.edu.ph,juan.delcruz,Grade 3,Wisdom
Maria,Santos,maria@wmsu.edu.ph,maria.santos,Grade 3,Wisdom
Carlos,Reyes,carlos@wmsu.edu.ph,carlos.reyes,Grade 4,Knowledge
Rosa,Garcia,rosa@wmsu.edu.ph,rosa.garcia,Grade 4,Knowledge
Pedro,Morales,pedro@wmsu.edu.ph,pedro.morales,Grade 5,Excellence
Ana,Fernandez,ana@wmsu.edu.ph,ana.fernandez,Grade 5,Excellence
Luis,Gonzalez,luis@wmsu.edu.ph,luis.gonzalez,Grade 6,Leadership
```

---

## Need Help?

If you encounter issues:
1. Check the error message displayed in the import results
2. Review this guide for the specific error
3. Fix the CSV file and try again
4. Make sure the backend server is running on port 5000

---

**Last Updated:** December 23, 2025
