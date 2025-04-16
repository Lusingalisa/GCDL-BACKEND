// In middleware/validators.js
const validateLogin = (req, res, next) => {
  console.log('Login validation - received:', req.body);
  
  const { email, password } = req.body;
  
  if (!email) {
    return res.status(400).json({ error: "Email is required" });
  }
  
  if (!password) {
    return res.status(400).json({ error: "Password is required" });
  }
  
  // Remove or adjust these if too strict:
  if (password.length < 6) {
    return res.status(400).json({ error: "Password too short" });
  }
  
  if (!/^\S+@\S+\.\S+$/.test(email)) {
    return res.status(400).json({ error: "Invalid email format" });
  }
  console.log("Validator received:", req.body);


  
  next();
};