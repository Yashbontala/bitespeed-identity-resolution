import { Contact } from '@prisma/client';

export const buildIdentifyResponse = (
  primary: Contact,
  emails: string[],
  phones: string[],
  secondaryIds: number[]
) => {
  return {
    contact: {
      primaryContatctId: primary.id,
      emails: [primary.email, ...emails.filter(e => e !== primary.email && e)].filter(Boolean),
      phoneNumbers: [primary.phoneNumber, ...phones.filter(p => p !== primary.phoneNumber && p)].filter(Boolean),
      secondaryContactIds: secondaryIds
    }
  };
};
