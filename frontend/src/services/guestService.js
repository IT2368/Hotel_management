import axios from 'axios';

const API_URL = 'http://localhost:5000/api/guests';

// Create new guest
export const createGuest = async (guestData) => {
  const response = await axios.post(API_URL, guestData);
  return response.data;
};

// Get all guests
export const getGuests = async () => {
  const response = await axios.get(API_URL);
  return response.data;
};

// Get single guest
export const getGuestById = async (guestId) => {
  const response = await axios.get(`${API_URL}/${guestId}`);
  return response.data;
};

// Update guest
export const updateGuest = async (guestId, guestData) => {
  const response = await axios.put(`${API_URL}/${guestId}`, guestData);
  return response.data;
};

// Delete guest
export const deleteGuest = async (guestId) => {
  const response = await axios.delete(`${API_URL}/${guestId}`);
  return response.data;
};