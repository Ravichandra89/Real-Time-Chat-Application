import { Request, Response } from "express";
import bcrypt from "bcrypt";
import prisma from "../config/prisma.config";
import apiResponse from "../utils/apiResponse";
import jwt from "jsonwebtoken";
import { sendOtpEmail } from "../utils/EmailSender";

const JWT_SECRET = process.env.SECRET || "chatApp";

interface RegisterBody {
  username: string;
  email: string;
  password: string;
  phone: string;
}

export const RegisterUser = async (
  req: Request<{}, {}, RegisterBody>,
  res: Response
) => {
  try {
    const { username, email, password, phone } = req.body;
    if (!username || !email || !password || !phone) {
      return apiResponse(res, 400, false, "Please fill all fields");
    }

    // Check user already or not
    const userExist = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (userExist) {
      return apiResponse(res, 400, false, "User already exist");
    }

    // Create new user
    const hashPassword = await bcrypt.hash(password, 10);
    const newUser = await prisma.user.create({
      data: {
        username,
        email,
        phone,
        password: hashPassword,
        profile: "",
        isActive: true,
        lastSeen: new Date(),
      },
    });

    return apiResponse(res, 200, true, "User Registered Sucessfully", newUser);
  } catch (error) {
    console.error("Error Registering User", error);
    return apiResponse(res, 500, false, "Error while register user");
  }
};

interface LoginBody {
  email: string;
  password: string;
}

export const loginUser = async (
  req: Request<{}, {}, LoginBody>,
  res: Response
) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return apiResponse(res, 400, false, "Please fill all fields");
    }

    // Check user Exist or not with email
    const userExist = await prisma.user.findUnique({
      where: { email },
    });

    if (!userExist) {
      return apiResponse(res, 404, false, "User Not Exist");
    }

    // Compare password
    const isValidPassword = await bcrypt.compare(password, userExist.password);

    if (!isValidPassword) {
      return apiResponse(res, 401, false, "Invalid Password");
    }

    // Generate the token

    const token = jwt.sign(
      { id: userExist.userId, email: userExist.email },
      JWT_SECRET,
      {
        expiresIn: "1h",
      }
    );

    return apiResponse(res, 200, true, "User logged successfully", {
      token,
      userId: userExist.userId,
    });
  } catch (error) {
    console.error("Error Login User", error);
    return apiResponse(res, 500, false, "Error while login user");
  }
};

export const logout = async (req: Request, res: Response) => {
  try {
    return apiResponse(res, 200, true, "Logout Successfull!");
  } catch (error) {
    console.error("Error While logout user", error);
    return apiResponse(res, 500, false, "Error while logout user");
  }
};

interface forgotBody {
  email: string;
}

export const forgotPassword = async (
  req: Request<{}, {}, forgotBody>,
  res: Response
) => {
  try {
    const { email } = req.body;

    if (!email) {
      return apiResponse(res, 400, false, "Email is required");
    }

    const isValidUser = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (!isValidUser) {
      return apiResponse(res, 400, false, "Email is not registered");
    }

    // Sending otp
    const otp = await sendOtpEmail(email);

    return apiResponse(res, 200, true, "OTP sent successfully", { otp });
  } catch (error) {
    console.error("Error While forgot password", error);
    return apiResponse(res, 500, false, "Error while forgot password");
  }
};

interface resetBody {
  email: string;
  otp: string;
  newPassword: string;
}

export const resetPassword = async (
  req: Request<{}, {}, resetBody>,
  res: Response
) => {
  try {
    const { email, otp, newPassword } = req.body;

    
  } catch (error) {
    console.error("Error While reset password", error);
    return apiResponse(res, 500, false, "Error while reset password");
  }
};
