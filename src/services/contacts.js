import { ContactsCollection } from '../db/models/contacts.js';

export const getContacts = async () => {
  const contacts = await ContactsCollection.find();
  return contacts;
};

export const getContactsById = async (contactId) => {
  const contact = await ContactsCollection.findById(contactId);
  return contact;
};

export const createContact = async (payload) => {
  return await ContactsCollection.create(payload);
};

export const updateContact = async (id, payload, options = {}) => {
  const contactForUpdate = await ContactsCollection.findOneAndUpdate(
    { _id: id },
    payload,
    {
      new: true,
      includeResultMetadata: true,
      ...options,
    },
  );
  if (!contactForUpdate || !contactForUpdate.value) return null;
  return {
    contact: contactForUpdate.value,
  };
};

export const deleteContact = async (id) => {
  return await ContactsCollection.findOneAndDelete({ _id: id });
};
