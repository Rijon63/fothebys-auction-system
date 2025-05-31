import express from 'express';
import Client from '../models/Client.js';
import User from '../models/User.js';
import { verifyToken, checkRole } from '../middleware/authMiddleware.js';

const router = express.Router();

// Create Client
router.post('/', verifyToken, checkRole(['admin']), async (req, res) => {
  try {
    const client = new Client(req.body);
    await client.save();
    res.status(201).json(client);
  } catch (error) {
    console.error('Error creating client:', error);
    res.status(400).json({ error: 'Failed to create client', details: error.message });
  }
});

// Get Client by User ID
router.get('/user/:userId', verifyToken, checkRole(['admin']), async (req, res) => {
  try {
    const client = await Client.findOne({ userId: req.params.userId });
    if (!client) {
      return res.status(404).json({ error: 'Client not found' });
    }
    res.json(client);
  } catch (error) {
    console.error('Error fetching client by userId:', error);
    res.status(500).json({ error: 'Failed to fetch client', details: error.message });
  }
});

// Get Client by User clientId (UUID)
router.get('/by-user-clientid/:clientId', verifyToken, async (req, res) => {
  try {
    const { clientId } = req.params;
    console.log('Fetching client for clientId:', clientId);
    const user = await User.findOne({ clientId, role: 'buyer' });
    if (!user) {
      console.log('User not found for clientId:', clientId);
      return res.status(404).json({ error: 'User not found' });
    }
    const client = await Client.findOne({ userId: user._id });
    if (!client) {
      console.log('Client not found for userId:', user._id);
      return res.status(404).json({ error: 'Client not found for this user' });
    }
    res.json(client);
  } catch (error) {
    console.error('Error fetching client by clientId:', error);
    res.status(500).json({ error: 'Failed to fetch client', details: error.message });
  }
});

// Get All Clients (Admin Only)
router.get('/', verifyToken, checkRole(['admin']), async (req, res) => {
  try {
    const clients = await Client.find();
    res.json(clients);
  } catch (error) {
    console.error('Error fetching all clients:', error);
    res.status(500).json({ error: 'Failed to fetch clients', details: error.message });
  }
});

// Get Single Client
router.get('/:id', verifyToken, checkRole(['admin']), async (req, res) => {
  try {
    const client = await Client.findById(req.params.id);
    if (!client) {
      return res.status(404).json({ error: 'Client not found' });
    }
    res.json(client);
  } catch (error) {
    console.error('Error fetching client by ID:', error);
    res.status(500).json({ error: 'Failed to fetch client', details: error.message });
  }
});

// Update Client
router.put('/:id', verifyToken, checkRole(['admin']), async (req, res) => {
  try {
    const updated = await Client.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!updated) {
      return res.status(404).json({ error: 'Client not found' });
    }
    res.json(updated);
  } catch (error) {
    console.error('Error updating client:', error);
    res.status(500).json({ error: 'Failed to update client', details: error.message });
  }
});

// Delete Client
router.delete('/:id', verifyToken, checkRole(['admin']), async (req, res) => {
  try {
    const client = await Client.findByIdAndDelete(req.params.id);
    if (!client) {
      return res.status(404).json({ error: 'Client not found' });
    }
    res.json({ message: 'Client deleted' });
  } catch (error) {
    console.error('Error deleting client:', error);
    res.status(500).json({ error: 'Failed to delete client', details: error.message });
  }
});

export default router;