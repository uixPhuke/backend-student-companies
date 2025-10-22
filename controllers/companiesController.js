const Company = require("../models/companiesSchema");
const jwt = require("jsonwebtoken");

const generateToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });

// Company Register
const registerCompany = async (req, res) => {
  try {
    const { companyName, email, phone, password, internshipType } = req.body;

    if (!companyName || !email || !phone || !password || !internshipType)
      return res.status(400).json({ success: false, message: "All fields are required." });

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^[6-9]\d{9}$/;

    if (!emailRegex.test(email))
      return res.status(400).json({ message: "Invalid email format." });
    if (!phoneRegex.test(phone))
      return res.status(400).json({ message: "Invalid phone number." });

    // Validate internshipType against enum values
    const validInternshipTypes = ["Technical", "Non-Technical", "Management", "Research", "Design"];
    if (!validInternshipTypes.includes(internshipType))
      return res.status(400).json({ message: "Invalid internship type." });

    const existing = await Company.findOne({ $or: [{ email }, { phone }] });
    if (existing)
      return res.status(400).json({ message: "Company already registered with given email/phone." });

    const company = await Company.create({ 
      companyName, 
      email, 
      phone, 
      password, 
      internshipType 
    });

    res.status(201).json({
      success: true,
      message: "Company registered successfully!",
      token: generateToken(company._id),
      data: company,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error registering company.", error: error.message });
  }
};

// Company Login - Updated to accept emailOrPhone
const loginCompany = async (req, res) => {
  try {
    const { emailOrPhone, password } = req.body;

    if (!emailOrPhone || !password)
      return res.status(400).json({ message: "Email/Phone and password are required." });

    // Check if input is email or phone
    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailOrPhone);
    const isPhone = /^[6-9]\d{9}$/.test(emailOrPhone);

    let company;
    if (isEmail) {
      company = await Company.findOne({ email: emailOrPhone });
    } else if (isPhone) {
      company = await Company.findOne({ phone: emailOrPhone });
    } else {
      return res.status(400).json({ message: "Invalid email or phone format." });
    }

    if (!company) return res.status(404).json({ message: "Company not found." });

    const isMatch = await company.comparePassword(password);
    if (!isMatch) return res.status(401).json({ message: "Invalid credentials." });

    res.status(200).json({
      success: true,
      message: "Login successful!",
      token: generateToken(company._id),
      data: company,
    });
  } catch (error) {
    res.status(500).json({ message: "Error logging in.", error: error.message });
  }
};

module.exports = { registerCompany, loginCompany };