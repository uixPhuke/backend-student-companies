const Company = require("../models/companiesSchema");
const jwt = require("jsonwebtoken");

const generateToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });

// Company Register
const registerCompany = async (req, res) => {
  try {
    const { companyName, email, phone, password } = req.body;

    if (!companyName || !email || !phone || !password)
      return res.status(400).json({ success: false, message: "All fields are required." });

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^[6-9]\d{9}$/;

    if (!emailRegex.test(email))
      return res.status(400).json({ message: "Invalid email format." });
    if (!phoneRegex.test(phone))
      return res.status(400).json({ message: "Invalid phone number." });

    const existing = await Company.findOne({ $or: [{ email }, { phone }] });
    if (existing)
      return res.status(400).json({ message: "Company already registered with given email/phone." });

    const company = await Company.create({ companyName, email, phone, password });

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

// Company Login
const loginCompany = async (req, res) => {
  try {
    const { email, password } = req.body;

    const company = await Company.findOne({ email });
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
