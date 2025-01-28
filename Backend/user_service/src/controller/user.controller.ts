import { Request, Response } from "express";
import bcrypt from "bcrypt";
import prisma from "../config/prisma.config";
import apiResponse from "../utils/apiResponse";
import jwt from "jsonwebtoken";
import { sendOtpEmail } from "../utils/EmailSender";

const JWT_SECRET = process.env.SECRET || "chatApp";
const otp_expiry_time = 10;

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

// TODO: Did here the Token based Forgat Password and ResetPassword
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
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + otp_expiry_time);

    // Save Otp for UserId
    await prisma.otp.create({
      data: {
        userId: isValidUser.userId,
        email,
        otp,
        expiresAt,
      },
    });

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

    if (!email || !otp || !newPassword) {
      return apiResponse(
        res,
        400,
        false,
        "Email, OTP, and New Password are required"
      );
    }

    // Check if the user exists
    const isValidUser = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (!isValidUser) {
      return apiResponse(res, 400, false, "Email is not registered");
    }

    // Find the OTP associated with the userId
    const otpExist = await prisma.otp.findFirst({
      where: {
        userId: isValidUser.userId,
      },
    });

    if (!otpExist) {
      return apiResponse(res, 400, false, "OTP is not valid");
    }

    // Check if the OTP matches
    if (otpExist.otp !== otp) {
      return apiResponse(res, 404, false, "Invalid OTP");
    }

    // Check if the OTP has expired
    if (new Date() > otpExist.expiresAt) {
      return apiResponse(res, 400, false, "OTP has expired");
    }

    // Encrypt the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update the user's password
    await prisma.user.update({
      where: {
        userId: isValidUser.userId,
      },
      data: {
        password: hashedPassword,
      },
    });

    // Delete the OTP record after successful password reset
    await prisma.otp.delete({
      where: {
        id: otpExist.id,
      },
    });

    return apiResponse(res, 200, true, "Password Reset Successfully");
  } catch (error) {
    console.error("Error While resetting password", error);
    return apiResponse(res, 500, false, "Error while resetting password");
  }
};
