const express=require("express")
const { registerStudent, loginStudent } =require('../controllers/studentController')

const router = express.Router();

//  Register new user
router.post("/register", registerStudent);
router.post('/login',loginStudent)


module.exports= router;
