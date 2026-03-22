import User from "../models/user.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";



export const LoginUser = async (req, res) => {
  try {
    const { username, password } = req.body;

    
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: "All fields are required"
      });
    }

    const user = await User.findOne({ name: username });
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid username or password"
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid username or password"
      });
    }

    const token = jwt.sign(
      { userid: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );    


res.cookie("token", token, {
  httpOnly: true,

  secure: true,
  sameSite: "none",
  maxAge: 7 * 24 * 60 * 60 * 1000,
  path: "/" 
});

    return res.status(200).json({
      success: true,
      user: {
        id: user._id,
        username: user.name
      }
    });

  } catch (err) {
    console.error("Login Error:", err);
    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

export const SingupUser = async (req, res) => {
  try {
    const { name, contact, password, confirmPassword } = req.body;

    if (!name || !contact || !password || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "All fields are required"
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Passwords do not match"
      });
    }

    const existingUser = await User.findOne({
      $or: [{ name }, { contact }]
    });




    if (existingUser) {
      return res.json({
        success: false,
        message: existingUser.name === name
          ? "Username already exists"
          : "Contact number already registered"
      });
    }


    const hash = await bcrypt.hash(password, 10);

    await User.create({
      name,
      contact,
      password: hash
    });

    return res.status(201).json({
      success: true,
      message: "Signup successful"
    });

  } catch (err) {
    console.error("Signup Error:", err);
    return res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};


export const getAllUsers = async () => {
  try {
    const users = await User.find({}) .select("_id name contact online");

    // same structure jaisa pehle frontend expect karta tha
    return users.map(user => ({
      id: user._id.toString(),
      name: user.name,
      contact: user.contact,
      online: user.online
    }));

  } catch (err) {
    console.error("❌ getAllUsers error:", err);
    return [];
  }
};

export const logout = async (req, res) => {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      secure: true, 
      sameSite: "none", 
    });

    return res.status(200).json({
      success: true,
      message: "Logged out successfully! ",
    });
  } catch (err) {
    console.error("Logout Error:", err);
    return res.status(500).json({
      success: false,
      message: "Server error during logout",
    });
  }
};

