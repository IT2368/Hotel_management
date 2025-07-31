import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';

export default function EditProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    nic: '',
    address: { street: '', city: '', state: '', zipCode: '', country: '' },
    idProof: { type: '' }, // removed number
    preferences: { amenities: '', specialRequests: '' }, // removed roomType
    profileImage: '',
    deals: [],
    role: '',
    emailVerified: false,
    isActive: false,
    isApproved: false
  });
  const [profileImageFile, setProfileImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (id) {
      api.getUserById(id)
        .then(res => {
          setForm({
            ...res.data,
            address: {
              street: res.data?.address?.street || '',
              city: res.data?.address?.city || '',
              state: res.data?.address?.state || '',
              zipCode: res.data?.address?.zipCode || '',
              country: res.data?.address?.country || ''
            },
            idProof: {
              type: res.data?.idProof?.type || ''
            },
            preferences: {
              amenities: (res.data?.preferences?.amenities || []).join(','),
              specialRequests: res.data?.preferences?.specialRequests || ''
            },
            profileImage: res.data?.profileImage || '',
            deals: res.data?.deals || [],
            role: res.data?.role || '',
            emailVerified: res.data?.emailVerified || false,
            isActive: res.data?.isActive || false,
            isApproved: res.data?.isApproved || false
          });
          setPreviewUrl(res.data.profileImage ? (res.data.profileImage.startsWith('http') ? res.data.profileImage : `${res.data.profileImage}`) : '');
        })
        .catch(err => setError(err.message))
        .finally(() => setLoading(false));
    }
  }, [id]);

  const handleChange = e => {
    const { name, value, files } = e.target;
    if (name === 'profileImage') {
      const file = files[0];
      setProfileImageFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    } else if (name.startsWith('address.')) {
      const key = name.split('.')[1];
      setForm(prev => ({
        ...prev,
        address: { ...prev.address, [key]: value }
      }));
    } else if (name.startsWith('idProof.')) {
      const key = name.split('.')[1];
      setForm(prev => ({
        ...prev,
        idProof: { ...prev.idProof, [key]: value }
      }));
    } else if (name.startsWith('preferences.')) {
      const key = name.split('.')[1];
      setForm(prev => ({
        ...prev,
        preferences: { ...prev.preferences, [key]: value }
      }));
    } else {
      setForm(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setError(null);
    try {
      let imageUrl = form.profileImage;
      if (profileImageFile) {
        const data = new FormData();
        data.append('image', profileImageFile);
        const uploadRes = await api.request({
          method: 'POST',
          url: `/users/${id}/upload-profile-image`,
          data,
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        imageUrl = uploadRes.data.url;
      }
      await api.request({
        method: 'PUT',
        url: `/users/${id}`,
        data: {
          ...form,
          profileImage: imageUrl,
          preferences: {
            ...form.preferences,
            amenities: form.preferences.amenities.split(',').map(a => a.trim())
          }
        }
      });
      setSuccess(true);
      setTimeout(() => navigate('/guest/dashboard'), 1000);
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) return <div className="text-center py-10">Loading...</div>;
  if (error) return <div className="text-center text-red-500 py-10">Error: {error}</div>;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-white px-4 py-10">
      <form onSubmit={handleSubmit} className="bg-white shadow-xl rounded-2xl p-8 w-full max-w-2xl" encType="multipart/form-data">
        <button
          type="button"
          className="mb-4 flex items-center text-indigo-600 hover:text-indigo-800 font-semibold"
          onClick={() => navigate(-1)}
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </button>
        <h2 className="text-2xl font-bold text-blue-700 mb-6">Edit Profile</h2>
        {/* Profile Image Upload */}
        <div className="mb-4 flex flex-col items-center">
          <div className="w-24 h-24 rounded-full border-4 border-indigo-200 flex items-center justify-center mb-2 bg-white overflow-hidden">
            {previewUrl ? (
              <img src={previewUrl} alt="Profile Preview" className="w-full h-full object-cover" />
            ) : (
              // Default profile SVG icon
              <svg className="w-16 h-16 text-indigo-300" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <circle cx="12" cy="8" r="4" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 20c0-4 4-7 8-7s8 3 8 7" />
              </svg>
            )}
          </div>
          <button
            type="button"
            className="mt-2 px-4 py-1 bg-indigo-600 text-white rounded-full font-semibold hover:bg-indigo-700 transition"
            onClick={() => document.getElementById('profileImageInput').click()}
          >
            Select Picture
          </button>
          <input
            id="profileImageInput"
            type="file"
            name="profileImage"
            accept="image/*"
            onChange={handleChange}
            className="hidden"
          />
        </div>
        <div className="mb-4">
          <label className="block font-semibold mb-1">Name</label>
          <input type="text" name="name" value={form.name || ''} onChange={handleChange} className="w-full border rounded px-3 py-2" required />
        </div>
        <div className="mb-4">
          <label className="block font-semibold mb-1">Email</label>
          <input type="email" name="email" value={form.email || ''} onChange={handleChange} className="w-full border rounded px-3 py-2" required />
        </div>
        <div className="mb-4">
          <label className="block font-semibold mb-1">Phone</label>
          <input type="text" name="phone" value={form.phone || ''} onChange={handleChange} className="w-full border rounded px-3 py-2" required />
        </div>
        <div className="mb-4">
          <label className="block font-semibold mb-1">NIC</label>
          <input type="text" name="nic" value={form.nic || ''} onChange={handleChange} className="w-full border rounded px-3 py-2" required />
        </div>
        <div className="mb-4">
          <label className="block font-semibold mb-1">Address</label>
          <input type="text" name="address.street" value={form.address?.street || ''} onChange={handleChange} placeholder="Street" className="w-full border rounded px-3 py-2 mb-2" />
          <input type="text" name="address.city" value={form.address?.city || ''} onChange={handleChange} placeholder="City" className="w-full border rounded px-3 py-2 mb-2" />
          <input type="text" name="address.state" value={form.address?.state || ''} onChange={handleChange} placeholder="State" className="w-full border rounded px-3 py-2 mb-2" />
          <input type="text" name="address.zipCode" value={form.address?.zipCode || ''} onChange={handleChange} placeholder="Zip Code" className="w-full border rounded px-3 py-2 mb-2" />
          <input type="text" name="address.country" value={form.address?.country || ''} onChange={handleChange} placeholder="Country" className="w-full border rounded px-3 py-2" />
        </div>
        <div className="mb-4">
          <label className="block font-semibold mb-1">ID Proof</label>
          <input type="text" name="idProof.type" value={form.idProof?.type || ''} onChange={handleChange} placeholder="Type (passport, driver-license, etc.)" className="w-full border rounded px-3 py-2 mb-2" />
        </div>
        <div className="mb-4">
          <label className="block font-semibold mb-1">Preferences</label>
          <input type="text" name="preferences.amenities" value={form.preferences?.amenities || ''} onChange={handleChange} placeholder="Amenities (comma separated)" className="w-full border rounded px-3 py-2 mb-2" />
          <input type="text" name="preferences.specialRequests" value={form.preferences?.specialRequests || ''} onChange={handleChange} placeholder="Special Requests" className="w-full border rounded px-3 py-2" />
        </div>
        <div className="mb-4">
          <label className="block font-semibold mb-1">Role</label>
          <input type="text" name="role" value={form.role || ''} onChange={handleChange} className="w-full border rounded px-3 py-2" disabled />
        </div>
        <div className="mb-4">
          <label className="block font-semibold mb-1">Email Verified</label>
          <input type="text" name="emailVerified" value={form.emailVerified ? 'Yes' : 'No'} className="w-full border rounded px-3 py-2" disabled />
        </div>
        <div className="mb-4">
          <label className="block font-semibold mb-1">Active</label>
          <input type="text" name="isActive" value={form.isActive ? 'Yes' : 'No'} className="w-full border rounded px-3 py-2" disabled />
        </div>
        <div className="mb-4">
          <label className="block font-semibold mb-1">Approved</label>
          <input type="text" name="isApproved" value={form.isApproved ? 'Yes' : 'No'} className="w-full border rounded px-3 py-2" disabled />
        </div>
        <button type="submit" className="w-full bg-indigo-600 text-white py-2 rounded-full font-semibold hover:bg-indigo-700 transition">Save Changes</button>
        {success && <div className="text-green-600 mt-4 text-center">Profile updated!</div>}
      </form>
    </div>
  );
} 