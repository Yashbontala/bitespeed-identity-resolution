import {
    findContactsByEmailOrPhone,
    findLinkedTree,
    createContact,
    updateContactToSecondary
  } from '../dao/contactDao';
  
  export const handleIdentify = async (email?: string, phoneNumber?: string) => {
    const existingContacts = await findContactsByEmailOrPhone(email, phoneNumber);
    let allRelatedContacts: any[] = [];
  
    for (const contact of existingContacts) {
      const group = await findLinkedTree(contact);
      allRelatedContacts.push(...group);
    }
  
    // Remove duplicates
    const contactMap = new Map<number, any>();
    allRelatedContacts.forEach(c => contactMap.set(c.id, c));
    const mergedContacts = [...contactMap.values()];
  
    // Case 1: No related contacts found → create new primary
    if (mergedContacts.length === 0) {
      const newContact = await createContact(email || null, phoneNumber || null, 'primary');
  
      const emails: string[] = email ? [email] : [];
      const phones: string[] = phoneNumber ? [phoneNumber] : [];
  
      return formatResponse(newContact.id, emails, phones, []);
    }
  
    // Determine oldest (primary)
    let primary = mergedContacts[0];
    for (const c of mergedContacts) {
      if (c.createdAt < primary.createdAt) {
        primary = c;
      }
    }
  
    const emails = new Set<string>();
    const phones = new Set<string>();
    const secondaryIds: number[] = [];
  
    for (const c of mergedContacts) {
      if (c.email) emails.add(c.email);
      if (c.phoneNumber) phones.add(c.phoneNumber);
      if (c.id !== primary.id) {
        secondaryIds.push(c.id);
        if (c.linkedId !== primary.id || c.linkPrecedence !== 'secondary') {
          await updateContactToSecondary(c.id, primary.id);
        }
      }
    }
  
    // Case 2: If incoming request adds new info → create secondary contact
    const existingEmails = mergedContacts.map(c => c.email);
    const existingPhones = mergedContacts.map(c => c.phoneNumber);
  
    const isNewEmail = email && !existingEmails.includes(email);
    const isNewPhone = phoneNumber && !existingPhones.includes(phoneNumber);
  
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
  
    // Sort: primary first
    const emailList = [primary.email, ...[...emails].filter(e => e && e !== primary.email)];
    const phoneList = [primary.phoneNumber, ...[...phones].filter(p => p && p !== primary.phoneNumber)];
  
    return formatResponse(
      primary.id,
      emailList.filter((e): e is string => Boolean(e)),
      phoneList.filter((p): p is string => Boolean(p)),
      secondaryIds
    );
  };
  
  function formatResponse(
    primaryId: number,
    emails: string[],
    phoneNumbers: string[],
    secondaryIds: number[]
  ) {
    return {
      contact: {
        primaryContatctId: primaryId,
        emails,
        phoneNumbers,
        secondaryContactIds: secondaryIds
      }
    };
  }
  