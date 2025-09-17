import { useContext, useState, useEffect } from "react";
import { AuthContext } from "../../context/AuthContext";
import useAuth from "../../hooks/useAuth";
import StaffUpdatesViewer from "../../components/guest/StaffUpdatesViewer.jsx";

export default function GuestDashboardPage() {
  const { user } = useContext(AuthContext);
  const { logout } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");
  const [guestProfile, setGuestProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchGuestProfile();
  }, []);

  const fetchGuestProfile = async () => {
    try {
      setLoading(true);
      // Fetch guest profile data
      // This would be implemented with your API calls
      setLoading(false);
    } catch (error) {
      console.error("Error fetching guest profile:", error);
      setLoading(false);
    }
  };

  const tabs = [
    { id: "overview", label: "Overview", icon: "🏠" },
    { id: "staff-updates", label: "Staff Updates", icon: "👥" },
    { id: "bookings", label: "My Bookings", icon: "📅" },
    { id: "services", label: "Services", icon: "🛎️" },
    { id: "profile", label: "Profile", icon: "👤" }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 text-gray-800">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <div className="p-3 rounded-lg bg-indigo-100">
              <span className="text-2xl">🏨</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">
                Valdor Hotel - Guest Dashboard
              </h1>
              <p className="text-gray-600 text-sm">Welcome back, {user?.name}</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={logout}
              className="px-6 py-2 bg-red-500 text-white rounded-full shadow hover:bg-red-600 transition duration-300 font-medium"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-white border-r h-screen px-6 py-8">
          <div className="mb-8">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                <span className="text-indigo-600 font-semibold">
                  {user?.name?.charAt(0)}
                </span>
              </div>
              <div>
                <p className="font-semibold text-gray-800">{user?.name}</p>
                <p className="text-sm text-gray-600">Guest</p>
              </div>
            </div>
          </div>

          <nav className="space-y-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition duration-200 ${
                  activeTab === tab.id
                    ? "bg-indigo-50 text-indigo-700 border-l-4 border-indigo-600"
                    : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                <span className="text-xl">{tab.icon}</span>
                <span className="font-medium">{tab.label}</span>
              </button>
            ))}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-8">
          {activeTab === "overview" && <OverviewTab user={user} />}
          {activeTab === "staff-updates" && <StaffUpdatesTab user={user} />}
          {activeTab === "bookings" && <BookingsTab user={user} />}
          {activeTab === "services" && <ServicesTab user={user} />}
          {activeTab === "profile" && <ProfileTab user={user} />}
        </main>
      </div>
    </div>
  );
}

// Overview Tab Component
function OverviewTab({ user }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100">
              <span className="text-2xl">📅</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Current Stay</p>
              <p className="text-2xl font-semibold text-gray-900">Room 101</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100">
              <span className="text-2xl">✅</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Requests</p>
              <p className="text-2xl font-semibold text-gray-900">2</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-purple-100">
              <span className="text-2xl">⭐</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Loyalty Points</p>
              <p className="text-2xl font-semibold text-gray-900">1,250</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition duration-200">
            <div className="text-center">
              <span className="text-2xl mb-2 block">🛎️</span>
              <p className="font-medium">Request Service</p>
            </div>
          </button>
          <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition duration-200">
            <div className="text-center">
              <span className="text-2xl mb-2 block">🍽️</span>
              <p className="font-medium">Order Food</p>
            </div>
          </button>
          <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition duration-200">
            <div className="text-center">
              <span className="text-2xl mb-2 block">🚗</span>
              <p className="font-medium">Book Transport</p>
            </div>
          </button>
          <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition duration-200">
            <div className="text-center">
              <span className="text-2xl mb-2 block">📞</span>
              <p className="font-medium">Contact Staff</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}

// Staff Updates Tab Component
function StaffUpdatesTab({ user }) {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Staff Updates</h2>
        <p className="text-gray-600 text-sm">
          Real-time updates from our staff members
        </p>
      </div>
      
      <StaffUpdatesViewer roomNumber="101" />
    </div>
  );
}

// Bookings Tab Component
function BookingsTab({ user }) {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">My Bookings</h2>
        <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition duration-200">
          + New Booking
        </button>
      </div>
      
      <div className="bg-white rounded-lg shadow">
        <div className="p-6">
          <p className="text-gray-600 text-center py-8">
            Booking history and management will be implemented here.
          </p>
        </div>
      </div>
    </div>
  );
}

// Services Tab Component
function ServicesTab({ user }) {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Hotel Services</h2>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="text-center">
            <span className="text-4xl mb-4 block">🍽️</span>
            <h3 className="text-lg font-semibold mb-2">Room Service</h3>
            <p className="text-gray-600 mb-4">Order delicious meals to your room</p>
            <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
              Order Now
            </button>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="text-center">
            <span className="text-4xl mb-4 block">🧹</span>
            <h3 className="text-lg font-semibold mb-2">Housekeeping</h3>
            <p className="text-gray-600 mb-4">Request room cleaning and maintenance</p>
            <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
              Request
            </button>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="text-center">
            <span className="text-4xl mb-4 block">🚗</span>
            <h3 className="text-lg font-semibold mb-2">Transportation</h3>
            <p className="text-gray-600 mb-4">Book airport transfers and local transport</p>
            <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
              Book Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Profile Tab Component
function ProfileTab({ user }) {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">My Profile</h2>
        <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition duration-200">
          Edit Profile
        </button>
      </div>
      
      <div className="bg-white rounded-lg shadow p-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Name</label>
            <p className="mt-1 text-gray-900">{user?.name}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <p className="mt-1 text-gray-900">{user?.email}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Phone</label>
            <p className="mt-1 text-gray-900">{user?.phone || "Not provided"}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
