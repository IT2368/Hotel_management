import axios from 'axios';

const API_URL = '/api/v1/messages';

// Get authorization header
const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  };
};

// Send a new message
export const sendMessage = async (messageData) => {
  try {
    const response = await axios.post(
      API_URL,
      messageData,
      getAuthHeader()
    );
    return response.data;
  } catch (error) {
    console.error('Error sending message:', error);
    throw error.response?.data || { message: 'Error sending message' };
  }
};

// Get all messages for the current user
export const getMessages = async () => {
  try {
    const response = await axios.get(API_URL, getAuthHeader());
    return response.data;
  } catch (error) {
    console.error('Error fetching messages:', error);
    throw error.response?.data || { message: 'Error fetching messages' };
  }
};

// Get a single message by ID
export const getMessageById = async (messageId) => {
  try {
    const response = await axios.get(`${API_URL}/${messageId}`, getAuthHeader());
    return response.data;
  } catch (error) {
    console.error('Error fetching message:', error);
    throw error.response?.data || { message: 'Error fetching message' };
  }
};

// Update a message
export const updateMessage = async (messageId, updateData) => {
  try {
    const response = await axios.put(
      `${API_URL}/${messageId}`,
      updateData,
      getAuthHeader()
    );
    return response.data;
  } catch (error) {
    console.error('Error updating message:', error);
    throw error.response?.data || { message: 'Error updating message' };
  }
};

// Delete a message
export const deleteMessage = async (messageId) => {
  try {
    const response = await axios.delete(
      `${API_URL}/${messageId}`,
      getAuthHeader()
    );
    return response.data;
  } catch (error) {
    console.error('Error deleting message:', error);
    throw error.response?.data || { message: 'Error deleting message' };
  }
};
