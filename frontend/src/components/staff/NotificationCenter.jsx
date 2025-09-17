import { useState, useEffect } from "react";
import { Bell, Check, X, AlertTriangle, Info, Clock, Star, Filter } from "lucide-react";

export default function NotificationCenter({ user }) {
  const [notifications, setNotifications] = useState([]);
  const [filteredNotifications, setFilteredNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    type: "all",
    priority: "all",
    read: "all"
  });
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchNotifications();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [notifications, filters]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      // API call to fetch notifications
      // const response = await api.get('/staff/notifications');
      // setNotifications(response.data.notifications);
      
      // Mock data for now
      setNotifications(getMockNotifications());
      setLoading(false);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...notifications];

    if (filters.type !== "all") {
      filtered = filtered.filter(notification => notification.type === filters.type);
    }

    if (filters.priority !== "all") {
      filtered = filtered.filter(notification => notification.priority === filters.priority);
    }

    if (filters.read === "read") {
      filtered = filtered.filter(notification => notification.readAt);
    } else if (filters.read === "unread") {
      filtered = filtered.filter(notification => !notification.readAt);
    }

    setFilteredNotifications(filtered);
  };

  const markAsRead = async (notificationId) => {
    try {
      // API call to mark notification as read
      // await api.put(`/staff/notifications/${notificationId}/read`);
      
      setNotifications(prev =>
        prev.map(notification =>
          notification.id === notificationId
            ? { ...notification, readAt: new Date().toISOString() }
            : notification
        )
      );
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const markAllAsRead = async () => {
    try {
      // API call to mark all notifications as read
      // await api.put('/staff/notifications/read-all');
      
      setNotifications(prev =>
        prev.map(notification => ({
          ...notification,
          readAt: notification.readAt || new Date().toISOString()
        }))
      );
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
    }
  };

  const deleteNotification = async (notificationId) => {
    try {
      // API call to delete notification
      // await api.delete(`/staff/notifications/${notificationId}`);
      
      setNotifications(prev =>
        prev.filter(notification => notification.id !== notificationId)
      );
    } catch (error) {
      console.error("Error deleting notification:", error);
    }
  };

  const getNotificationIcon = (type, priority) => {
    if (priority === "urgent") {
      return <AlertTriangle className="h-5 w-5 text-red-500" />;
    }

    switch (type) {
      case "task_assigned":
        return <Star className="h-5 w-5 text-blue-500" />;
      case "task_updated":
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case "task_completed":
        return <Check className="h-5 w-5 text-green-500" />;
      case "urgent_alert":
        return <AlertTriangle className="h-5 w-5 text-red-500" />;
      case "system_announcement":
        return <Info className="h-5 w-5 text-purple-500" />;
      case "reminder":
        return <Clock className="h-5 w-5 text-orange-500" />;
      default:
        return <Bell className="h-5 w-5 text-gray-500" />;
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "urgent":
        return "border-l-red-500 bg-red-50";
      case "high":
        return "border-l-orange-500 bg-orange-50";
      case "medium":
        return "border-l-yellow-500 bg-yellow-50";
      case "low":
        return "border-l-green-500 bg-green-50";
      default:
        return "border-l-gray-300 bg-white";
    }
  };

  const getTypeLabel = (type) => {
    switch (type) {
      case "task_assigned":
        return "Task Assigned";
      case "task_updated":
        return "Task Updated";
      case "task_completed":
        return "Task Completed";
      case "urgent_alert":
        return "Urgent Alert";
      case "system_announcement":
        return "Announcement";
      case "reminder":
        return "Reminder";
      default:
        return "Notification";
    }
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));

    if (diffInMinutes < 1) return "Just now";
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  const unreadCount = notifications.filter(n => !n.readAt).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold text-gray-800">Notifications</h2>
          <p className="text-gray-600 text-sm">
            {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center space-x-2 px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition duration-200"
          >
            <Filter className="h-4 w-4" />
            <span>Filters</span>
          </button>
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="px-4 py-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition duration-200"
            >
              Mark all as read
            </button>
          )}
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="bg-white rounded-lg shadow p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Type
              </label>
              <select
                value={filters.type}
                onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="all">All Types</option>
                <option value="task_assigned">Task Assigned</option>
                <option value="task_updated">Task Updated</option>
                <option value="task_completed">Task Completed</option>
                <option value="urgent_alert">Urgent Alert</option>
                <option value="system_announcement">Announcement</option>
                <option value="reminder">Reminder</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Priority
              </label>
              <select
                value={filters.priority}
                onChange={(e) => setFilters(prev => ({ ...prev, priority: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="all">All Priorities</option>
                <option value="urgent">Urgent</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                value={filters.read}
                onChange={(e) => setFilters(prev => ({ ...prev, read: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="all">All</option>
                <option value="unread">Unread</option>
                <option value="read">Read</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Notifications List */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">
              Notifications ({filteredNotifications.length})
            </h3>
            <div className="text-sm text-gray-600">
              Showing {filteredNotifications.length} of {notifications.length} notifications
            </div>
          </div>
        </div>

        <div className="divide-y divide-gray-200">
          {filteredNotifications.length === 0 ? (
            <div className="p-12 text-center">
              <div className="text-gray-400 text-6xl mb-4">🔔</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No notifications found</h3>
              <p className="text-gray-600">
                {Object.values(filters).some(f => f !== "all")
                  ? "Try adjusting your filters"
                  : "You're all caught up!"}
              </p>
            </div>
          ) : (
            filteredNotifications.map(notification => (
              <NotificationCard
                key={notification.id}
                notification={notification}
                onMarkAsRead={markAsRead}
                onDelete={deleteNotification}
                getNotificationIcon={getNotificationIcon}
                getPriorityColor={getPriorityColor}
                getTypeLabel={getTypeLabel}
                formatTime={formatTime}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}

// Notification Card Component
function NotificationCard({ 
  notification, 
  onMarkAsRead, 
  onDelete, 
  getNotificationIcon, 
  getPriorityColor, 
  getTypeLabel, 
  formatTime 
}) {
  const isRead = !!notification.readAt;

  return (
    <div className={`p-6 border-l-4 ${getPriorityColor(notification.priority)} hover:bg-gray-50 transition duration-200 ${
      isRead ? 'opacity-75' : ''
    }`}>
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-4 flex-1">
          <div className="flex-shrink-0 mt-1">
            {getNotificationIcon(notification.type, notification.priority)}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 mb-2">
              <h4 className="text-sm font-medium text-gray-900">
                {notification.title}
              </h4>
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                notification.priority === 'urgent' 
                  ? 'bg-red-100 text-red-800' 
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {notification.priority}
              </span>
              <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                {getTypeLabel(notification.type)}
              </span>
            </div>
            
            <p className="text-sm text-gray-600 mb-3">
              {notification.message}
            </p>
            
            <div className="flex items-center space-x-4 text-xs text-gray-500">
              <span>{formatTime(notification.createdAt)}</span>
              {notification.sender && (
                <span>From: {notification.sender.name}</span>
              )}
              {notification.relatedTask && (
                <span>Task: {notification.relatedTask.title}</span>
              )}
              {notification.relatedRoom && (
                <span>Room: {notification.relatedRoom}</span>
              )}
            </div>

            {notification.actionRequired && (
              <div className="mt-3">
                <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full">
                  Action Required
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {!isRead && (
            <button
              onClick={() => onMarkAsRead(notification.id)}
              className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition duration-200"
              title="Mark as read"
            >
              <Check className="h-4 w-4" />
            </button>
          )}
          
          <button
            onClick={() => onDelete(notification.id)}
            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition duration-200"
            title="Delete notification"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

// Helper function to get mock notifications
function getMockNotifications() {
  return [
    {
      id: 1,
      title: "New Task Assigned: Fix AC in Room 205",
      message: "You have been assigned a new high priority task: \"Fix AC in Room 205\" in room location.",
      type: "task_assigned",
      priority: "high",
      readAt: null,
      createdAt: "2024-01-15T10:30:00Z",
      sender: { name: "Manager John" },
      relatedTask: { title: "Fix AC in Room 205" },
      relatedRoom: "205",
      actionRequired: true
    },
    {
      id: 2,
      title: "Urgent Alert: Kitchen Equipment Failure",
      message: "Critical alert: Main oven in kitchen A has malfunctioned. Immediate attention required.",
      type: "urgent_alert",
      priority: "urgent",
      readAt: null,
      createdAt: "2024-01-15T09:15:00Z",
      sender: { name: "System" },
      actionRequired: true
    },
    {
      id: 3,
      title: "Task Updated: Room Cleaning Schedule",
      message: "Task \"Room Cleaning Schedule\" has been updated. Current status: In Progress.",
      type: "task_updated",
      priority: "medium",
      readAt: "2024-01-15T08:45:00Z",
      createdAt: "2024-01-15T08:45:00Z",
      sender: { name: "Supervisor Sarah" },
      relatedTask: { title: "Room Cleaning Schedule" }
    },
    {
      id: 4,
      title: "System Announcement: Staff Meeting",
      message: "Reminder: Staff meeting scheduled for tomorrow at 9 AM in the conference room.",
      type: "system_announcement",
      priority: "medium",
      readAt: "2024-01-15T07:30:00Z",
      createdAt: "2024-01-15T07:30:00Z",
      sender: { name: "HR Department" }
    },
    {
      id: 5,
      title: "Task Completed: Lobby Maintenance",
      message: "Task \"Lobby Maintenance\" has been marked as completed by Mike Johnson.",
      type: "task_completed",
      priority: "low",
      readAt: "2024-01-15T06:20:00Z",
      createdAt: "2024-01-15T06:20:00Z",
      sender: { name: "Mike Johnson" },
      relatedTask: { title: "Lobby Maintenance" }
    },
    {
      id: 6,
      title: "Reminder: Equipment Inspection Due",
      message: "Reminder: Monthly equipment inspection is due this week. Please complete by Friday.",
      type: "reminder",
      priority: "medium",
      readAt: null,
      createdAt: "2024-01-15T05:00:00Z",
      sender: { name: "Maintenance Supervisor" },
      actionRequired: true
    }
  ];
} 