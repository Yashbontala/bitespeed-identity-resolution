import { Request, Response } from 'express';
import { handleIdentify } from '../services/identifyService';

export const identifyCustomer = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, phoneNumber } = req.body;

    if (!email && !phoneNumber) {
      res.status(400).json({ error: "Email or phoneNumber is required" });
      return;
    }

    const result = await handleIdentify(email, phoneNumber);
    res.status(200).json(result);
  } catch (error) {
    console.error("Identify error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
