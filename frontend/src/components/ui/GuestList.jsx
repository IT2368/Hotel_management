import { useEffect, useState } from 'react';
import api from '../services/api';

const GuestList = () => {
  const [guests, setGuests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchGuests = async () => {
      try {
        const response = await api.getAllGuests();
        setGuests(response.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchGuests();
  }, []);

  if (loading) return <div>Loading guests...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h2>Guest List</h2>
      <ul>
        {guests.map(guest => (
          <li key={guest._id}>
            {guest.firstName} {guest.lastName}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default GuestList;

