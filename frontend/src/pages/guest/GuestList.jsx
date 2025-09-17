import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';

export default function GuestList() {
  const [guests, setGuests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    api.getAllGuests()
      .then(res => setGuests(res.data || res))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div>Loading guests...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h2>Guest List</h2>
      <ul>
        {guests.map(guest => (
          <li key={guest._id}>
            <Link to={`/guests/${guest._id}`}>{guest.firstName} {guest.lastName}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
} 