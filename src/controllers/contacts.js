import {
  createContact,
  deleteContact,
  getContacts,
  getContactsById,
  updateContact,
} from '../services/contacts.js';
import createHttpError from 'http-errors';
import { parsePaginationParams } from '../utils/parsePaginationParams.js';
import { parseSortParams } from '../utils/parseSortParams.js';
import { parseFilterParams } from '../utils/parseFilterParams.js';
import { saveFileToCloudinary } from '../utils/saveFileToCloudinary.js';
import { env } from '../utils/env.js';

import { saveFileToUploadDir } from '../utils/saveFileToUploadDir.js';
import { CLOUDINARY } from '../constants/index.js';

export const getContactsController = async (req, res) => {
  const { page, perPage } = parsePaginationParams(req.query);
  const { sortBy, sortOrder } = parseSortParams(req.query);
  const filter = parseFilterParams(req.query);

  const contacts = await getContacts({
    userId: req.user._id,
    page,
    perPage,
    sortBy,
    sortOrder,
    filter,
  });

  res.status(200).json({
    status: 200,
    message: 'Successfully found contacts!',
    data: contacts,
  });
};

export async function getContactByIdController(req, res, next) {
  const { contactId } = req.params;
  const userId = req.user._id;
  const contact = await getContactsById(contactId, userId);

  if (contact === null) {
    return next(createHttpError.NotFound(404, 'Contact not found'));
  }

  if (contact.userId.toString() !== req.user._id.toString()) {
    return next(createHttpError.NotFound('Contact not found'));
  }

  res.send({
    status: 200,
    message: `Successfully found contact with id ${contactId}!`,
    data: contact,
  });
}

export async function createContactController(req, res) {
  const photo = req.file;

  let photoUrl;

  if (photo) {
    if (env(CLOUDINARY.ENABLE_CLOUDINARY) === 'true') {
      photoUrl = await saveFileToCloudinary(photo);
    } else {
      photoUrl = await saveFileToUploadDir(photo);
    }
  }

  const contact = {
    name: req.body.name,
    phoneNumber: req.body.phoneNumber,
    contactType: req.body.contactType,
    userId: req.user._id,
    photo: photoUrl,
  };

  const createdContact = await createContact(contact);

  res.send({
    status: 201,
    message: `Successfully created a contact!`,
    data: createdContact,
  });
}

export const patchContactController = async (req, res, next) => {
  const { contactId } = req.params;

  const photo = req.file;

  let photoUrl;

  if (photo) {
    if (env(CLOUDINARY.ENABLE_CLOUDINARY) === 'true') {
      photoUrl = await saveFileToCloudinary(photo);
    } else {
      photoUrl = await saveFileToUploadDir(photo);
    }
  }

  try {
    const result = await updateContact(contactId, req.body, req.user._id, {
      photo: photoUrl,
    });

    if (result === null) {
      return next(createHttpError(404, 'Contact not found'));
    }

    res.json({
      status: 200,
      message: `Successfully patched a contact!`,
      data: result.contact,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteContactController = async (req, res, next) => {
  const { contactId } = req.params;

  const contact = await deleteContact(contactId, req.user._id);

  if (!contact) {
    next(createHttpError(404, 'Contact not found'));
    return;
  }

  res.status(204).end();
};
