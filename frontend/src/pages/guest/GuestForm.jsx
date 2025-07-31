import GuestForm from '../../components/ui/GuestForm';
import { useNavigate, useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import api from '../../services/api';

export default function GuestFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [initialData, setInitialData] = useState(null);

  useEffect(() => {
    if (id) {
      api.getUserById(id).then(res => setInitialData(res.data || res));
    }
  }, [id]);

  const handleSuccess = () => navigate('/guests');

  return (
    <div>
      <h2>{id ? 'Edit Guest' : 'Add Guest'}</h2>
      <GuestForm onSuccess={handleSuccess} initialData={initialData || {}} />
    </div>
  );
} 