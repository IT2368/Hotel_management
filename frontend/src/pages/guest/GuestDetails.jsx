import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getGuestById } from '../../services/guestService';


export default function GuestDetails() {
  const { id } = useParams();
  const [guest, setGuest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    getGuestById(id)
    .then(res => setGuest(res))
    .catch(err => setError(err.message))
    .finally(() => setLoading(false));

  }, [id]);

  if (loading) return <div>Loading guest details...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!guest) return <div>No guest found.</div>;

  return (
    <div>
      <h2>{guest.firstName} {guest.lastName}</h2>
      <p>Email: {guest.email}</p>
      <p>Phone: {guest.phone}</p>
      <p>Address: {guest.address?.street}, {guest.address?.city}, {guest.address?.state}, {guest.address?.zipCode}, {guest.address?.country}</p>
      <p>ID Proof: {guest.idProof?.type} - {guest.idProof?.number}</p>
      <p>Preferences: Room Type - {guest.preferences?.roomType}, Amenities - {guest.preferences?.amenities?.join(', ')}, Special Requests - {guest.preferences?.specialRequests}</p>
    </div>
  );
} 