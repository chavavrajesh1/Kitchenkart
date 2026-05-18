import { Request, Response } from "express";
import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import sendEmail from "../utils/sendEmail.js";
import asyncHandler from "../utils/asyncHandler.js";

// Helper function to generate token
const generateToken = (id: string, role: string) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET as string, {
    expiresIn: "30d",
  });
};

// @desc    Register a new User
// @route   POST /api/auth/register
// @access  Public
export const registerUser = asyncHandler (async (req: Request, res: Response) => {
    const { name, email, password, role } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      res.status(400);
      throw new Error("User already exists with this email");
    }

    const user = await User.create({
      name,
      email,
      password,
      role: role || "customer",
    });

    if (user) {
      // Welcome Email (Background process)
        sendEmail({
          email: user.email,
          subject: "Welcome to Kitchen Kart!",
          message: `Hi ${user.name}, Welcome to Kitchen Kart! Your registration has been successfully completed. Order your fresh vegetables now.`,        
      }).catch ((error) => console.log("Email failed to send, but user created.", error.message));
      
      res.status(201).json({
        success: true,
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id.toString(), user.role),
        message: "User registered successfully and Welcome Email sent!",
      });    
  } else {
    res.status(400);
    throw new Error("Invalid user data");
  }
});

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public

export const loginUser = asyncHandler (async (req: Request, res: Response) => {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (user && (await user.comparePassword(password))) {
      res.json({
        success: true,
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id.toString(), user.role),
      });
    } else {
      res.status(401);
      throw new Error("Invalid Email or Password"); 
    }
});
