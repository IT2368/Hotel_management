import { useState, useEffect } from "react";
import { getPublicStaffUpdates } from "../../services/guestService.js";

export default function StaffUpdatesViewer({ roomNumber, department }) {
  const [updates, setUpdates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    department: department || "all",
    status: "all"
  });

  useEffect(() => {
    fetchStaffUpdates();
  }, [filters, roomNumber]);

  const fetchStaffUpdates = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = {};
      if (filters.department !== "all") params.department = filters.department;
      if (roomNumber) params.roomNumber = roomNumber;
      
      const response = await getPublicStaffUpdates(params);
      setUpdates(response.data.updates);
    } catch (err) {
      setError("Failed to load staff updates");
      console.error("Error fetching staff updates:", err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "pending": return "bg-yellow-100 text-yellow-800";
      case "process": return "bg-orange-100 text-orange-800";
      case "completed": return "bg-green-100 text-green-800";
      case "handoff_pending": return "bg-purple-100 text-purple-800";
      case "handoff_accepted": return "bg-blue-100 text-blue-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getDepartmentIcon = (department) => {
    switch (department) {
      case "maintenance": return "🔧";
      case "kitchen": return "👨‍🍳";
      case "service": return "👔";
      case "cleaning": return "🧹";
      default: return "👤";
    }
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));

    if (diffInMinutes < 1) return "Just now";
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return date.toLocaleDateString();
  };

  const filteredUpdates = updates.filter(update => {
    if (filters.status !== "all" && update.status !== filters.status) {
      return false;
    }
    return true;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        <span className="ml-2 text-gray-600">Loading staff updates...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-8">
        <div className="text-red-500 text-lg mb-2">⚠️</div>
        <p className="text-gray-600">{error}</p>
        <button 
          onClick={fetchStaffUpdates}
          className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-800">
              Valdor Hotel - Staff Updates
            </h2>
            <p className="text-gray-600 text-sm">
              Real-time updates from our staff members
            </p>
          </div>
          <button 
            onClick={fetchStaffUpdates}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition duration-200"
          >
            Refresh
          </button>
        </div>

        {/* Filters */}
        <div className="mt-4 flex space-x-4">
          <select
            value={filters.department}
            onChange={(e) => setFilters(prev => ({ ...prev, department: e.target.value }))}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">All Departments</option>
            <option value="maintenance">Maintenance</option>
            <option value="kitchen">Kitchen</option>
            <option value="service">Service</option>
            <option value="cleaning">Cleaning</option>
          </select>

          <select
            value={filters.status}
            onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">All Status</option>
            <option value="process">In Process</option>
            <option value="completed">Completed</option>
            <option value="handoff_pending">Handoff Pending</option>
            <option value="handoff_accepted">Handoff Accepted</option>
          </select>
        </div>
      </div>

      {/* Updates List */}
      <div className="p-6">
        {filteredUpdates.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">📋</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No updates available</h3>
            <p className="text-gray-600">
              {filters.department !== "all" || filters.status !== "all"
                ? "Try adjusting your filters"
                : "No staff updates at the moment"}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredUpdates.map((update) => (
              <div key={update.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition duration-200">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <span className="text-2xl">{getDepartmentIcon(update.department)}</span>
                      <h4 className="text-lg font-medium text-gray-900">{update.title}</h4>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(update.status)}`}>
                        {update.status === "process" ? "In Process" : update.status}
                      </span>
                    </div>
                    
                    <p className="text-gray-600 mb-3">{update.description}</p>
                    
                    <div className="flex items-center space-x-6 text-sm text-gray-500">
                      <span>📍 {update.location}</span>
                      {update.roomNumber && <span>🏠 Room {update.roomNumber}</span>}
                      <span>📂 {update.category}</span>
                      <span>👤 {update.assignedTo}</span>
                      <span>⏰ {formatTime(update.updatedAt)}</span>
                      {update.handoffDepartment && (
                        <span className="text-purple-600">🔄 Handoff to {update.handoffDepartment}</span>
                      )}
                      {update.handoffReason && (
                        <span className="text-gray-600">💬 {update.handoffReason}</span>
                      )}
                      {update.isCompleted && update.completedAt && (
                        <span className="text-green-600">✅ Completed {formatTime(update.completedAt)}</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 