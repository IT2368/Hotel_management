import api from './api.js';

// Send a new message
export const sendMessage = async (messageData) => {
  try {
    const response = await api.post('/v1/messages', messageData);
    return response.data;
  } catch (error) {
    console.error('Error sending message:', error);
    throw error.response?.data || { message: 'Error sending message' };
  }
};

// Get all messages for the current user
export const getMessages = async () => {
  try {
    const response = await api.get('/v1/messages');
    return response.data;
  } catch (error) {
    console.error('Error fetching messages:', error);
    throw error.response?.data || { message: 'Error fetching messages' };
  }
};

// Get a single message by ID
export const getMessageById = async (messageId) => {
  try {
    const response = await api.get(`/v1/messages/${messageId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching message:', error);
    throw error.response?.data || { message: 'Error fetching message' };
  }
};

// Update a message
export const updateMessage = async (messageId, updateData) => {
  try {
    const response = await api.put(`/v1/messages/${messageId}`, updateData);
    return response.data;
  } catch (error) {
    console.error('Error updating message:', error);
    throw error.response?.data || { message: 'Error updating message' };
  }
};

// Delete a message
export const deleteMessage = async (messageId) => {
  try {
    const response = await api.delete(`/v1/messages/${messageId}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting message:', error);
    throw error.response?.data || { message: 'Error deleting message' };
  }
};
