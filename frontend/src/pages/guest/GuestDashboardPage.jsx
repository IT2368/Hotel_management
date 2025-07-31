import { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

export default function GuestProfilePage() {
  const { user, logout } = useContext(AuthContext);
  const [profile, setProfile] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteSuccess, setDeleteSuccess] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const userId = user?._id || user?.userId || profile?._id;
    if (userId) {
      api.getUserById(userId)
        .then(res => setProfile(res.data || res))
        .catch(err => setError(err.message));
      api.getUserBookings(userId)
        .then(res => setBookings(res.data || res))
        .catch(() => {});
    }
    setLoading(false);
  }, [user]);

  const handleDelete = async () => {
    const userId = profile?._id;
    if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      try {
        await api.deleteUser(userId);
        setDeleteSuccess(true);
        logout();
      } catch (err) {
        setError(err.message);
      }
    }
  };

  if (loading) return <div className="text-center py-10">Loading profile...</div>;
  if (error) return <div className="text-center text-red-500 py-10">Error: {error}</div>;
  if (!profile) return <div className="text-center py-10">No profile found.</div>;
  if (deleteSuccess) return <div className="text-center py-10 text-green-600">Account deleted. Goodbye!</div>;

  // Safe preferences and amenities handling
  const preferences = profile.preferences || {};
  const amenities = Array.isArray(preferences.amenities)
    ? preferences.amenities.join(', ')
    : (preferences.amenities || '');

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white px-4 py-10">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white shadow-xl rounded-2xl p-8 mb-8">
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
          <div className="flex flex-col items-center mb-6">
            <div className="w-24 h-24 rounded-full border-4 border-indigo-200 flex items-center justify-center bg-white overflow-hidden mb-2">
              {profile.profileImage ? (
                <img src={profile.profileImage.startsWith('http') ? profile.profileImage : `${profile.profileImage}`} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <svg className="w-16 h-16 text-indigo-300" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <circle cx="12" cy="8" r="4" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 20c0-4 4-7 8-7s8 3 8 7" />
                </svg>
              )}
            </div>
          </div>
          <h1 className="text-3xl font-bold text-blue-700 mb-2 text-center">My Booking Profile</h1>
          <div className="space-y-2 text-gray-700">
            <div><span className="font-semibold">Name:</span> {profile.name}</div>
            <div><span className="font-semibold">Email:</span> {profile.email}</div>
            <div><span className="font-semibold">Phone:</span> {profile.phone}</div>
            <div><span className="font-semibold">NIC:</span> {profile.nic}</div>
            <div><span className="font-semibold">Address:</span> {profile.address?.street}, {profile.address?.city}, {profile.address?.state}, {profile.address?.zipCode}, {profile.address?.country}</div>
            <div><span className="font-semibold">ID Proof:</span> {profile.idProof?.type} - {profile.idProof?.number}</div>
            <div><span className="font-semibold">Preferences:</span> Room Type - {preferences.roomType || ''}, Amenities - {amenities}, Special Requests - {preferences.specialRequests || ''}</div>
            <div><span className="font-semibold">Role:</span> {profile.role}</div>
            <div><span className="font-semibold">Email Verified:</span> {profile.emailVerified ? 'Yes' : 'No'}</div>
            <div><span className="font-semibold">Active:</span> {profile.isActive ? 'Yes' : 'No'}</div>
            <div><span className="font-semibold">Approved:</span> {profile.isApproved ? 'Yes' : 'No'}</div>
            {profile.deals && profile.deals.length > 0 && (
              <div>
                <span className="font-semibold">Deals:</span>
                <ul className="list-disc ml-6">
                  {profile.deals.map((deal, idx) => (
                    <li key={idx}>
                      <span className="font-semibold">{deal.title}</span>: {deal.description} (Discount: {deal.discount}%, Valid Until: {deal.validUntil ? new Date(deal.validUntil).toLocaleDateString() : 'N/A'})
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
          <div className="mt-6 flex gap-4">
            <button
              className="px-6 py-2 bg-indigo-600 text-white rounded-full shadow hover:bg-indigo-700 transition font-medium"
              onClick={() => navigate(`/guests/edit/${profile._id}`)}
            >
              Edit Profile
            </button>
            <button
              onClick={logout}
              className="px-6 py-2 bg-red-500 text-white rounded-full shadow hover:bg-red-600 transition font-medium"
            >
              Logout
            </button>
            <button
              onClick={handleDelete}
              className="px-6 py-2 bg-gray-300 text-red-700 rounded-full shadow hover:bg-red-400 transition font-medium"
            >
              Delete Account
            </button>
          </div>
        </div>
        {/* Booking Details Section */}
        <div className="bg-white shadow rounded-2xl p-8">
          <h2 className="text-2xl font-semibold text-blue-700 mb-4">My Bookings</h2>
          {bookings.length === 0 ? (
            <div className="text-gray-500 italic">You have no bookings yet.</div>
          ) : (
            <ul className="divide-y divide-gray-200">
              {bookings.map(booking => (
                <li key={booking._id} className="py-2">
                  <div><span className="font-semibold">Booking ID:</span> {booking._id}</div>
                  <div><span className="font-semibold">Room:</span> {booking.room || booking.roomNumber || 'N/A'}</div>
                  <div><span className="font-semibold">Check-in:</span> {booking.checkInDate ? new Date(booking.checkInDate).toLocaleDateString() : 'N/A'}</div>
                  <div><span className="font-semibold">Check-out:</span> {booking.checkOutDate ? new Date(booking.checkOutDate).toLocaleDateString() : 'N/A'}</div>
                  {/* Add more booking details as needed */}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
