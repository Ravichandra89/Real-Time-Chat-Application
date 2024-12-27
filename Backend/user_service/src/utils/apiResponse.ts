import { Response } from "express";

const apiResponse = (
  res: any,
  status: number,
  success: boolean,
  message: string,
  data?: any
) => {
  res.status(status).json({
    status,
    success,
    message,
    data,
  });
};

export default apiResponse;
