import { PrismaClient } from '@prisma/client';

class PrismaSingleton {
  private static instance: PrismaClient;

  private constructor() {}

  static getInstance(): PrismaClient {
    if (!PrismaSingleton.instance) {
      PrismaSingleton.instance = new PrismaClient();
    }
    return PrismaSingleton.instance;
  }
}

export const prisma = PrismaSingleton.getInstance();