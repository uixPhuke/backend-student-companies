const Student = require("../models/studentSchema");
const jwt = require("jsonwebtoken");

// Generate JWT token
const generateToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });

const registerStudent = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      isFromKiit,
      emailKiit,
      emailNonKiit,
      phone,
      internshipType,
      password,
    } = req.body;

    // Input validation
    if (!firstName || !lastName || typeof isFromKiit !== "boolean" || !phone || !internshipType || !password) {
      return res.status(400).json({ success: false, message: "Please fill all required fields." });
    }

    const nameRegex = /^[A-Za-z\s]+$/;
    if (!nameRegex.test(firstName) || !nameRegex.test(lastName))
      return res.status(400).json({ success: false, message: "Name should contain only alphabets." });

    const phoneRegex = /^[6-9]\d{9}$/;
    if (!phoneRegex.test(phone))
      return res.status(400).json({ success: false, message: "Invalid phone number format." });

    if (isFromKiit) {
      if (!emailKiit) return res.status(400).json({ message: "KIIT email required." });
      const kiitEmailRegex = /^[a-z0-9._%+-]+@kiit\.ac\.in$/i;
      if (!kiitEmailRegex.test(emailKiit))
        return res.status(400).json({ message: "Invalid KIIT email format." });
    } else {
      if (!emailNonKiit) return res.status(400).json({ message: "Email required for non-KIIT students." });
      const generalEmailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!generalEmailRegex.test(emailNonKiit))
        return res.status(400).json({ message: "Invalid email format." });
    }

    // FIXED: Better duplicate checking logic
    const existingQueries = [{ phone }];
    
    if (isFromKiit && emailKiit) {
      existingQueries.push({ emailKiit });
    } else if (!isFromKiit && emailNonKiit) {
      existingQueries.push({ emailNonKiit });
    }

    const existing = await Student.findOne({
      $or: existingQueries
    });

    if (existing) {
      if (existing.phone === phone) {
        return res.status(400).json({ message: "Phone already registered." });
      }
      if (isFromKiit && existing.emailKiit === emailKiit) {
        return res.status(400).json({ message: "KIIT email already registered." });
      }
      if (!isFromKiit && existing.emailNonKiit === emailNonKiit) {
        return res.status(400).json({ message: "Email already registered." });
      }
    }

    const newStudent = await Student.create({
      firstName,
      lastName,
      isFromKiit,
      emailKiit: isFromKiit ? emailKiit : null,
      emailNonKiit: !isFromKiit ? emailNonKiit : null,
      phone,
      internshipType,
      password,
    });

    res.status(201).json({
      success: true,
      message: "Student registration successful!",
      token: generateToken(newStudent._id),
      data: newStudent,
    });
  } catch (error) {
    // Handle MongoDB duplicate key errors
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      if (field === 'phone') {
        return res.status(400).json({ message: "Phone already registered." });
      } else if (field === 'emailKiit') {
        return res.status(400).json({ message: "KIIT email already registered." });
      } else if (field === 'emailNonKiit') {
        return res.status(400).json({ message: "Email already registered." });
      }
    }
    res.status(500).json({ success: false, message: "Server error during registration.", error: error.message });
  }
};

// Login with emailOrPhone (unchanged, working correctly)
const loginStudent = async (req, res) => {
  try {
    const { emailOrPhone, password } = req.body;
    
    if (!emailOrPhone || !password)
      return res.status(400).json({ success: false, message: "Email/Phone and password are required." });

    // Check if input is email or phone
    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailOrPhone);
    const isKiitEmail = /^[a-z0-9._%+-]+@kiit\.ac\.in$/i.test(emailOrPhone);
    const isPhone = /^[6-9]\d{9}$/.test(emailOrPhone);

    let student;
    if (isEmail || isKiitEmail) {
      // Search in both emailKiit and emailNonKiit fields
      student = await Student.findOne({
        $or: [
          { emailKiit: emailOrPhone },
          { emailNonKiit: emailOrPhone }
        ]
      });
    } else if (isPhone) {
      student = await Student.findOne({ phone: emailOrPhone });
    } else {
      return res.status(400).json({ success: false, message: "Invalid email or phone format." });
    }

    if (!student) return res.status(404).json({ success: false, message: "Student not found." });

    const isMatch = await student.comparePassword(password);
    if (!isMatch) return res.status(401).json({ success: false, message: "Invalid credentials." });

    res.status(200).json({
      success: true,
      message: "Login successful!",
      token: generateToken(student._id),
      data: student,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error during login.", error: error.message });
  }
};

module.exports = { registerStudent, loginStudent };