// src/dao/contactDao.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const findContactsByEmailOrPhone = async (email?: string, phoneNumber?: string) => {
  return prisma.contact.findMany({
    where: {
      OR: [
        { email: email || undefined },
        { phoneNumber: phoneNumber || undefined },
      ]
    },
    orderBy: { createdAt: 'asc' }
  });
};

export const findPrimaryContactWithSecondaries = async (contactId: number) => {
  const primary = await prisma.contact.findUnique({ where: { id: contactId } });
  const secondaries = await prisma.contact.findMany({ where: { linkedId: contactId } });
  return [primary, ...secondaries].filter(Boolean);
};

export const findLinkedTree = async (contact: any) => {
  if (contact.linkPrecedence === 'primary') {
    return findPrimaryContactWithSecondaries(contact.id);
  } else {
    return findPrimaryContactWithSecondaries(contact.linkedId!);
  }
};

export const createContact = async (email: string | null, phoneNumber: string | null, linkPrecedence: string, linkedId?: number) => {
  return prisma.contact.create({
    data: {
      email,
      phoneNumber,
      linkPrecedence,
      linkedId
    }
  });
};

export const updateContactToSecondary = async (id: number, linkedId: number) => {
  return prisma.contact.update({
    where: { id },
    data: {
      linkPrecedence: 'secondary',
      linkedId,
    }
  });
};
