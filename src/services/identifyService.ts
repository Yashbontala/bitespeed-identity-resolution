import {
  findAllRelatedContacts,
  createContact,
  updateContactToSecondary
} from '../dao/contactDao';
import { buildIdentifyResponse } from '../utils/responseBuilder';

export const handleIdentify = async (email?: string, phoneNumber?: string) => {
  const mergedContacts = await findAllRelatedContacts(email, phoneNumber);

  if (mergedContacts.length === 0) {
    const newContact = await createContact(email ?? null, phoneNumber ?? null, 'primary');
  
    const emails: string[] = email ? [email] : [];
    const phones: string[] = phoneNumber ? [phoneNumber] : [];
  
    return buildIdentifyResponse(newContact, emails, phones, []);
  }
  

  const primary = mergedContacts[0];

  const emails = new Set<string>();
  const phones = new Set<string>();
  const secondaryIds: number[] = [];

  for (const contact of mergedContacts) {
    if (contact.email) emails.add(contact.email);
    if (contact.phoneNumber) phones.add(contact.phoneNumber);

    if (contact.id !== primary.id) {
      secondaryIds.push(contact.id);
      if (contact.linkedId !== primary.id || contact.linkPrecedence !== 'secondary') {
        await updateContactToSecondary(contact.id, primary.id);
      }
    }
  }

  const isNewEmail = email && !emails.has(email);
  const isNewPhone = phoneNumber && !phones.has(phoneNumber);

  if (isNewEmail || isNewPhone) {
    const newContact = await createContact(
      isNewEmail ? email : null,
      isNewPhone ? phoneNumber : null,
      'secondary',
      primary.id
    );
    secondaryIds.push(newContact.id);
    if (newContact.email) emails.add(newContact.email);
    if (newContact.phoneNumber) phones.add(newContact.phoneNumber);
  }

  return buildIdentifyResponse(primary, Array.from(emails), Array.from(phones), secondaryIds);
};
