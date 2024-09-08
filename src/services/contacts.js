import { ContactsCollection } from '../db/models/contacts.js';
import { calculatePaginationData } from '../utils/calculatePaginationData.js';

export const getContacts = async ({
  userId,
  page,
  perPage,
  sortOrder,
  sortBy,
  filter,
}) => {
  const limit = perPage;
  const skip = (page - 1) * perPage;

  const contactsQuery = ContactsCollection.find();

  if (filter.isFavourite) {
    contactsQuery.where('contactsQuery').equals(filter.isFavourite);
  }

  contactsQuery.where('userId').equals(userId);

  const contactsCount = await ContactsCollection.find().countDocuments(
    contactsQuery,
  );

  const contacts = await contactsQuery
    .skip(skip)
    .limit(limit)
    .sort({ [sortBy]: sortOrder })
    .exec();

  const paginationData = calculatePaginationData(contactsCount, perPage, page);
  return {
    contacts,
    ...paginationData,
  };
};

export function getContactsById(contactId, userId) {
  return ContactsCollection.findOne({ _id: contactId, userId });
}

export const createContact = async (payload) => {
  return await ContactsCollection.create(payload);
};

export const updateContact = async (
  contactId,
  payload,
  userId,
  options = {},
) => {
  const contactForUpdate = await ContactsCollection.findOneAndUpdate(
    { _id: contactId, userId },
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

export const deleteContact = async (contactId, userId) => {
  return await ContactsCollection.findOneAndDelete({ _id: contactId, userId });
};
