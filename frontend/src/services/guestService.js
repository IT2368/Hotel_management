// src/services/guestService.js
import api from './api'; // importing your configured Axios instance

// Create new guest
export const createGuest = async (guestData) => {
  const response = await api.post('/guests', guestData);
  return response.data;
};

// Get all guests
export const getGuests = async () => {
  const response = await api.get('/guests');
  return response.data;
};

// Get single guest
export const getGuestById = async (guestId) => {
  const response = await api.get(`/guests/${guestId}`);
  return response.data;
};

// Update guest
export const updateGuest = async (guestId, guestData) => {
  const response = await api.put(`/guests/${guestId}`, guestData);
  return response.data;
};

// Delete guest
export const deleteGuest = async (guestId) => {
  const response = await api.delete(`/guests/${guestId}`);
  return response.data;
};
