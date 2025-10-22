# I-Camp Backend

Backend server for I-Camp registration system built with Node.js, Express, and MongoDB. Handles student registration with comprehensive input validation.

## Features

* Register and Login KIIT & Non-KIIT students
* Register and Login Companies
* Input validation with regex (name, phone, email)
* Prevents duplicate phone registrations
* Stores data in MongoDB
* CORS enabled for frontend integration
* Middleware implementation- JsonWebToken

## Tech Stack
* Runtime: Node.js
* Framework: Express.js
* Database: MongoDB with Mongoose ODM
* Security: CORS, Input Validation, JsonWebToken
* Environment: dotenv
* Development: Nodemon (dev dependency)


## Installation
1. Clone the repository:


```bash
git clone https://github.com/SkSin19/E-Cell_Probation_I-Camp.git
cd backend
```
2.Install dependencies:
```bash
npm install
```

3. Create .env file in the root directory:
```bash
PORT=8000
MONGO_URL=<MONGO_URL>
JWT_SECRET=<secretl>

```

## Running the Server
```bash
nodemon
npm start
```
Server runs at: [http://localhost:8000](http://localhost:8000)

## API Testing (POST request)
* Student Register
```bash
http://localhost:8000/api/v1/student/register
```
Request Body:
```bash
{
  "firstName": "John",
  "lastName": "Doe",
  "isFromKiit": true,
  "emailKiit": "johuf@kiit.ac.in",
  "emailNonKiit": null,
  "phone": "9871241210",
  "internshipType": "Technical",
  "password": "password123"
}
```
* Student Login
```bash
http://localhost:8000/api/v1/student/login
```
Request Body:
```bash
{
  "emailOrPhone": "9876541210",
  "password": "password123"
}

```
*Companies Register
```bash
http://localhost:8000/api/v2/companies/register
```
Request Body:
```bash

{
  "companyName": "phixel",
  "email": "hr@pcompany.com",
  "phone": "9876543222",
  "password": "company123",
  "internshipType": "Technical"
}
```
* Comapanies Login

```bash
http://localhost:8000/api/v2/companies/login
```
Request Body:
```bash
{
  "emailOrPhone": "hr@phixel.com",
  "password": "company123"
}

```

## Validation Rule

* Name: Letters only (alphabetic characters)
* Phone: 10 digits
* KIIT Email: Must end with @kiit.ac.in
* Non-KIIT Email: Standard email format validation
* jsonwebtoken with accesstoken

## Error Handling
* Returns appropriate HTTP status codes (400, 500, etc.)
* Descriptive error messages for validation failures
* Duplicate phone number detection
* Unauthorization