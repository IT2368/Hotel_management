import { Link } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import useAuth from '../../hooks/useAuth';

export default function GuestDashboardPage() {
  const { user } = useContext(AuthContext);
  const { logout } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white px-6 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-indigo-700">
            Welcome back, {user?.name?.split(' ')[0]} 👋
          </h1>
          <button
            onClick={logout}
            className="px-6 py-2 bg-red-500 text-white rounded-full shadow hover:bg-red-600 transition duration-300 font-medium"
          >
            Logout
          </button>
        </div>

        {/* Dashboard Cards */}
        <div className="grid grid-cols-1 gap-6">
          <DashboardCard
            title="My Profile"
            description="View and update your personal details."
            to={`/guests/${user?._id}`}
          />
        </div>
      </div>
    </div>
  );
}

function DashboardCard({ title, description, to }) {
  return (
    <div className="bg-white shadow rounded-lg p-6 hover:shadow-lg transition duration-300">
      <h2 className="text-xl font-semibold text-gray-800 mb-2">{title}</h2>
      <p className="text-gray-600 text-sm mb-4">{description}</p>
      <Link
        to={to}
        className="inline-block px-4 py-1 bg-indigo-600 text-white text-sm rounded-full hover:bg-indigo-700 transition duration-300"
      >
        Go to {title}
      </Link>
    </div>
  );
}
