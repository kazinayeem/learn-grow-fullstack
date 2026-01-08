import { Request, Response } from "express";
import { Contact } from "../model/contact.model";

export const createContact = async (req: Request, res: Response) => {
  try {
    const { firstName, lastName, email, subject, message } = req.body || {};
    if (!firstName || !lastName || !email || !subject || !message) {
      return res.status(400).json({ success: false, message: "Missing required fields" });
    }

    const contact = await Contact.create({ firstName, lastName, email, subject, message });
    return res.status(201).json({ success: true, data: contact });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Failed to create contact" });
  }
};

export const getContacts = async (_req: Request, res: Response) => {
  try {
    const contacts = await Contact.find().sort({ createdAt: -1 }).lean();
    return res.status(200).json({ success: true, data: contacts });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Failed to fetch contacts" });
  }
};

export const markContactRead = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updated = await Contact.findByIdAndUpdate(id, { isRead: true }, { new: true }).lean();
    if (!updated) {
      return res.status(404).json({ success: false, message: "Contact not found" });
    }
    return res.status(200).json({ success: true, data: updated });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Failed to update contact" });
  }
};

export const deleteContact = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const deleted = await Contact.findByIdAndDelete(id).lean();
    if (!deleted) {
      return res.status(404).json({ success: false, message: "Contact not found" });
    }
    return res.status(200).json({ success: true, message: "Deleted" });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Failed to delete contact" });
  }
};
