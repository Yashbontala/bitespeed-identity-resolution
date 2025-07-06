import { prisma } from '../db';

export const findAllRelatedContacts = async (email?: string, phoneNumber?: string) => {
  const candidates = await prisma.contact.findMany({
    where: {
      OR: [
        { email: email || undefined },
        { phoneNumber: phoneNumber || undefined }
      ]
    },
    include: {
      primaryContact: true,
      secondaryContacts: true
    },
    orderBy: { createdAt: 'asc' }
  });

  const relatedIds = new Set<number>();

  for (const contact of candidates) {
    if (contact.linkPrecedence === 'primary') {
      relatedIds.add(contact.id);
      contact.secondaryContacts.forEach(c => relatedIds.add(c.id));
    } else {
      relatedIds.add(contact.linkedId!);
    }
  }

  return prisma.contact.findMany({
    where: {
      OR: [
        { id: { in: Array.from(relatedIds) } },
        { linkedId: { in: Array.from(relatedIds) } }
      ]
    },
    orderBy: { createdAt: 'asc' }
  });
};

export const createContact = async (
  email: string | null,
  phoneNumber: string | null,
  linkPrecedence: 'primary' | 'secondary',
  linkedId: number | null = null
) => {
  return prisma.contact.create({
    data: { email, phoneNumber, linkPrecedence, linkedId }
  });
};

export const updateContactToSecondary = async (id: number, linkedId: number) => {
  return prisma.contact.update({
    where: { id },
    data: {
      linkPrecedence: 'secondary',
      linkedId
    }
  });
};
