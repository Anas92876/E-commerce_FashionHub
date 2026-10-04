const { validationResult } = require('express-validator');
const { supabase } = require('../config/supabase');
const { toApi, check, normalizeId } = require('../utils/db');

const findContact = async (id) => {
  const contactId = normalizeId(id);
  if (!contactId) return null;
  return check(await supabase.from('contacts').select('*').eq('id', contactId).maybeSingle());
};

const updateContact = async (id, updates) =>
  toApi(check(await supabase.from('contacts').update(updates).eq('id', id).select('*').single()));

// @desc    Submit contact form
// @route   POST /api/contact
// @access  Public
exports.submitContact = async (req, res) => {
  try {
    // Validation
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array(),
      });
    }

    const { name, email, phone, subject, message } = req.body;

    // Create contact in database
    const contact = toApi(check(
      await supabase
        .from('contacts')
        .insert({
          name: String(name).trim(),
          email: String(email).trim().toLowerCase(),
          phone: phone ? String(phone).trim() : null,
          subject: String(subject).trim(),
          message,
        })
        .select('*')
        .single()
    ));

    res.status(201).json({
      success: true,
      message: 'Your message has been sent successfully! We will get back to you soon.',
      data: contact,
    });
  } catch (error) {
    console.error('Contact submission error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send message. Please try again later.',
    });
  }
};

// @desc    Get all contact messages
// @route   GET /api/contact
// @access  Private/Admin
exports.getAllContacts = async (req, res) => {
  try {
    const rows = check(
      await supabase.from('contacts').select('*').order('created_at', { ascending: false })
    );

    res.status(200).json({
      success: true,
      count: rows.length,
      data: rows.map((row) => toApi(row)),
    });
  } catch (error) {
    console.error('Get contacts error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve messages',
    });
  }
};

// @desc    Get single contact message
// @route   GET /api/contact/:id
// @access  Private/Admin
exports.getContactById = async (req, res) => {
  try {
    let contact = await findContact(req.params.id);

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Message not found',
      });
    }

    // Mark as read
    contact = contact.is_read ? toApi(contact) : await updateContact(contact.id, { is_read: true });

    res.status(200).json({
      success: true,
      data: contact,
    });
  } catch (error) {
    console.error('Get contact error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve message',
    });
  }
};

// @desc    Update contact status
// @route   PUT /api/contact/:id/status
// @access  Private/Admin
exports.updateContactStatus = async (req, res) => {
  try {
    const { status, isRead } = req.body;

    if (status && !['new', 'read', 'replied'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status',
      });
    }

    const existing = await findContact(req.params.id);

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'Message not found',
      });
    }

    const updates = {};
    if (status) updates.status = status;
    if (typeof isRead !== 'undefined') updates.is_read = isRead;

    const contact = await updateContact(existing.id, updates);

    res.status(200).json({
      success: true,
      message: 'Status updated successfully',
      data: contact,
    });
  } catch (error) {
    console.error('Update contact status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update status',
    });
  }
};

// @desc    Delete contact message
// @route   DELETE /api/contact/:id
// @access  Private/Admin
exports.deleteContact = async (req, res) => {
  try {
    const contact = await findContact(req.params.id);

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Message not found',
      });
    }

    check(await supabase.from('contacts').delete().eq('id', contact.id));

    res.status(200).json({
      success: true,
      message: 'Message deleted successfully',
    });
  } catch (error) {
    console.error('Delete contact error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete message',
    });
  }
};
