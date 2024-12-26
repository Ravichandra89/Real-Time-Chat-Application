import express from "express";
import apiResponse from "../apiResponse";
import prisma from "../config/prisma.config";

export const loginUser = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return apiResponse(res, 404, false, "Missing Email and Password");
    };
  } catch (error) {
    console.error("Error logging User", error);
    return apiResponse(res, 500, false, "Error logging User");
  }
};

export const RegisterUser = async (req: Request, res: Response) => {};

export const logOutUser = async (req: Request, res: Response) => {};
