import { useContext, useState, useEffect } from "react";
import { AuthContext } from "../../context/AuthContext";
import useAuth from "../../hooks/useAuth";

// Simple icon components as fallbacks
const Bell = () => <span className="text-xl">🔔</span>;
const Clock = () => <span className="text-xl">⏰</span>;
const CheckCircle = () => <span className="text-xl">✅</span>;
const AlertTriangle = () => <span className="text-xl">⚠️</span>;
const Users = () => <span className="text-xl">👥</span>;
const Calendar = () => <span className="text-xl">📅</span>;
const Settings = () => <span className="text-xl">⚙️</span>;

export default function StaffDashboardPage() {
  const { user } = useContext(AuthContext);
  const { logout } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");
  const [notifications, setNotifications] = useState([]);
  const [urgentAlerts, setUrgentAlerts] = useState([]);
  const [taskStats, setTaskStats] = useState({});
  const [loading, setLoading] = useState(true);

  // Open tab from query string if provided (e.g., /staff/dashboard?tab=tasks)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tabFromUrl = params.get("tab");
    if (tabFromUrl) {
      setActiveTab(tabFromUrl);
    }
  }, []);

  // Get department from user profile with multiple fallback checks
  const department = user?.staffProfile?.department || user?.department || "service";
  
  const departmentConfig = {
    maintenance: {
      name: "Maintenance",
      color: "blue",
      icon: "🔧",
      description: "Equipment repair, facility maintenance, and technical support",
      backgroundImage: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80"
    },
    kitchen: {
      name: "Kitchen",
      color: "orange",
      icon: "👨‍🍳",
      description: "Food preparation, cooking, and kitchen operations",
      backgroundImage: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80"
    },
    service: {
      name: "Service",
      color: "green",
      icon: "👔",
      description: "Guest services, concierge, and customer support",
      backgroundImage: "https://images.unsplash.com/photo-1564501049412-61c2a3083791?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80"
    },
    cleaning: {
      name: "Cleaning",
      color: "purple",
      icon: "🧹",
      description: "Room cleaning, laundry, and facility maintenance",
      backgroundImage: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80"
    }
  };

  // Ensure we have a valid department configuration
  const currentDept = departmentConfig[department] || departmentConfig.service;

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Force re-render when user changes (important for switching between staff members)
  useEffect(() => {
    if (user) {
      console.log("User changed:", user);
      console.log("Staff Profile:", user.staffProfile);
      console.log("Department:", department);
    }
  }, [user, department]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      // Fetch notifications, alerts, and stats
      // This would be implemented with your API calls
      setLoading(false);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      setLoading(false);
    }
  };

  const tabs = [
    { id: "overview", label: "Overview", icon: "📊" },
    { id: "tasks", label: "My Tasks", icon: "📋" },
    { id: "notifications", label: "Notifications", icon: "🔔" }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-300">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen text-gray-800 dark:text-gray-200 relative"
      style={{
        backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.6)), url('${currentDept.backgroundImage}')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed'
      }}
    >
      {/* Header */}
      <header className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm shadow-lg border-b border-white/20">
        <div className="mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <div className={`p-3 rounded-lg bg-${currentDept.color}-100 dark:bg-gray-700`}>
              <span className="text-2xl">{currentDept.icon}</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                Valdor Hotel - {currentDept.name} Dashboard
              </h1>
              <p className="text-gray-600 dark:text-gray-300 text-sm">{currentDept.description}</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Bell />
              {urgentAlerts.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {urgentAlerts.length}
                </span>
              )}
            </div>
            <button
              onClick={logout}
              className="group relative px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 font-semibold overflow-hidden"
            >
              <span className="absolute inset-0 bg-gradient-to-r from-red-600 to-red-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
              <span className="relative flex items-center space-x-2">
                <span>🚪</span>
                <span>Logout</span>
              </span>
            </button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm border-r border-white/30 dark:border-gray-800/50 h-screen px-6 py-8 shadow-xl">
          <div className="mb-8">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900 rounded-full flex items-center justify-center">
                <span className="text-indigo-600 dark:text-indigo-300 font-semibold">
                  {user?.name?.charAt(0)}
                </span>
              </div>
              <div>
                <p className="font-semibold text-gray-800 dark:text-gray-100">{user?.name}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">{user?.staffProfile?.position}</p>
              </div>
            </div>
          </div>

          <nav className="space-y-3">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`group w-full flex items-center space-x-4 px-5 py-4 rounded-xl text-left transition-all duration-300 transform hover:scale-105 ${
                  activeTab === tab.id
                    ? "bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg border border-indigo-400"
                    : "text-gray-700 hover:bg-white/60 dark:text-gray-200 dark:hover:bg-gray-800/60 backdrop-blur-sm border border-transparent hover:border-white/40 hover:shadow-md"
                }`}
              >
                <div className={`p-2 rounded-lg transition-all duration-300 ${
                  activeTab === tab.id 
                    ? "bg-white/20 shadow-inner" 
                    : "bg-gray-100/50 dark:bg-gray-700/50 group-hover:bg-white/70 dark:group-hover:bg-gray-600/70"
                }`}>
                  <span className="text-xl">{tab.icon}</span>
                </div>
                <span className="font-semibold text-base">{tab.label}</span>
                {activeTab === tab.id && (
                  <div className="ml-auto w-2 h-2 bg-white rounded-full animate-pulse"></div>
                )}
              </button>
            ))}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-8">
          <div className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm rounded-lg shadow-xl border border-white/20 dark:border-gray-800/50 p-6">
            {activeTab === "overview" && <OverviewTab user={user} department={department} />}
            {activeTab === "tasks" && <TasksTab user={user} department={department} />}
            {activeTab === "notifications" && <NotificationsTab user={user} />}
          </div>
        </main>
      </div>
    </div>
  );
}

// Overview Tab Component
function OverviewTab({ user, department }) {
  const [taskStats, setTaskStats] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTaskStats();
  }, [department]);

  const fetchTaskStats = async () => {
    try {
      setLoading(true);
      // Fetch task statistics for the department
      const response = await fetch(`/api/staff/tasks/stats?department=${encodeURIComponent(department)}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setTaskStats(data.data || {});
      } else {
        // Fallback to mock data if API fails
        setTaskStats({
          totalTasks: 10,
          pendingTasks: 8,
          completedTasks: 2,
          urgentTasks: 3
        });
      }
      setLoading(false);
    } catch (error) {
      console.error("Error fetching task stats:", error);
      // Fallback to mock data
      setTaskStats({
        totalTasks: 10,
        pendingTasks: 8,
        completedTasks: 2,
        urgentTasks: 3
      });
      setLoading(false);
    }
  };

  const stats = [
    {
      title: "Total Tasks",
      value: taskStats.totalTasks || "10",
      change: "+2",
      icon: CheckCircle,
      color: "green"
    },
    {
      title: "Pending Tasks",
      value: taskStats.pendingTasks || "8",
      change: "-1",
      icon: Clock,
      color: "yellow"
    },
    {
      title: "Urgent Tasks",
      value: taskStats.urgentTasks || "3",
      change: "+1",
      icon: AlertTriangle,
      color: "red"
    },
    {
      title: "Completed Today",
      value: taskStats.completedTasks || "2",
      change: "+2",
      icon: CheckCircle,
      color: "blue"
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-4">
          Welcome back, {user?.name?.split(" ")[0]}! 👋
        </h2>
        <p className="text-gray-600 dark:text-gray-300">
          Here's what's happening in your {department} department today.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div key={stat.title} className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-lg shadow-lg border border-white/30 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stat.value}</p>
              </div>
              <div className={`p-3 rounded-full bg-${stat.color}-100`}>
                <stat.icon />
              </div>
            </div>
            <div className="mt-4">
              <span className={`text-sm font-medium ${
                stat.change.startsWith('+') ? 'text-green-600' : 
                stat.change.startsWith('-') ? 'text-red-600' : 'text-gray-600 dark:text-gray-400'
              }`}>
                {stat.change} from yesterday
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-lg shadow-lg border border-white/30 p-6">
          <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <button onClick={() => setActiveTab("tasks")} className="group w-full text-left p-4 rounded-xl border border-white/40 dark:border-gray-700/50 hover:bg-gradient-to-r hover:from-blue-500/20 hover:to-indigo-500/20 dark:hover:from-blue-600/20 dark:hover:to-indigo-600/20 backdrop-blur-sm transition-all duration-300 transform hover:scale-105 hover:shadow-lg">
              <div className="flex items-center space-x-4">
                <div className="p-2 bg-blue-100/70 dark:bg-blue-900/50 rounded-lg group-hover:bg-blue-200/80 dark:group-hover:bg-blue-800/60 transition-all duration-300">
                  <span className="text-xl">📋</span>
                </div>
                <div>
                  <span className="font-semibold text-gray-800 dark:text-gray-200">View My Tasks</span>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Manage your assignments</p>
                </div>
                <div className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <span className="text-blue-500">→</span>
                </div>
              </div>
            </button>
            <button onClick={() => setActiveTab("notifications")} className="group w-full text-left p-4 rounded-xl border border-white/40 dark:border-gray-700/50 hover:bg-gradient-to-r hover:from-purple-500/20 hover:to-pink-500/20 dark:hover:from-purple-600/20 dark:hover:to-pink-600/20 backdrop-blur-sm transition-all duration-300 transform hover:scale-105 hover:shadow-lg">
              <div className="flex items-center space-x-4">
                <div className="p-2 bg-purple-100/70 dark:bg-purple-900/50 rounded-lg group-hover:bg-purple-200/80 dark:group-hover:bg-purple-800/60 transition-all duration-300">
                  <span className="text-xl">🔔</span>
                </div>
                <div>
                  <span className="font-semibold text-gray-800 dark:text-gray-200">Check Notifications</span>
                  <p className="text-sm text-gray-600 dark:text-gray-400">View updates & alerts</p>
                </div>
                <div className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <span className="text-purple-500">→</span>
                </div>
              </div>
            </button>
          </div>
        </div>

        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-lg shadow-lg border border-white/30 p-6">
          <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm text-gray-600 dark:text-gray-300">Task "Fix Room 205 AC" completed</span>
              <span className="text-xs text-gray-400">2 hours ago</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span className="text-sm text-gray-600 dark:text-gray-300">New task assigned: "Kitchen equipment maintenance"</span>
              <span className="text-xs text-gray-400">4 hours ago</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
              <span className="text-sm text-gray-600 dark:text-gray-300">Schedule updated for next week</span>
              <span className="text-xs text-gray-400">1 day ago</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Tasks Tab Component
function TasksTab({ user, department }) {
  const [activeTaskView, setActiveTaskView] = useState("total");
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSampleTasks();
  }, [department, user]);

  const fetchSampleTasks = () => {
    // Generate sample tasks based on department and user
    const sampleTasks = generateSampleTasks(department, user);
    setTasks(sampleTasks);
    setLoading(false);
  };

  const getFilteredTasks = () => {
    switch (activeTaskView) {
      case "pending":
        return tasks.filter(task => task.status === "pending" || task.status === "process");
      case "urgent":
        return tasks.filter(task => task.priority === "urgent" || task.isUrgent);
      case "total":
      default:
        return tasks;
    }
  };

  const filteredTasks = getFilteredTasks();
  const pendingTasks = tasks.filter(task => task.status === "pending" || task.status === "process");
  const urgentTasks = tasks.filter(task => task.priority === "urgent" || task.isUrgent);

  const taskViews = [
    { id: "total", label: "Total Tasks", count: tasks.length, icon: "📋", color: "blue" },
    { id: "pending", label: "Pending Tasks", count: pendingTasks.length, icon: "⏳", color: "yellow" },
    { id: "urgent", label: "Urgent Tasks", count: urgentTasks.length, icon: "🚨", color: "red" }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">My Tasks</h2>
        <p className="text-gray-600 dark:text-gray-300 text-sm">View and manage your assigned tasks</p>
      </div>

      {/* Task Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {taskViews.map((view) => (
          <div
            key={view.id}
            onClick={() => setActiveTaskView(view.id)}
            className={`group relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 cursor-pointer transition-all duration-300 transform hover:scale-105 hover:shadow-2xl border overflow-hidden ${
              activeTaskView === view.id 
                ? 'ring-2 ring-indigo-500 border-indigo-400 bg-gradient-to-br from-indigo-50/80 to-purple-50/80 dark:from-indigo-900/40 dark:to-purple-900/40' 
                : 'border-white/40 dark:border-gray-700/50 hover:border-indigo-300/50'
            }`}
          >
            {activeTaskView === view.id && (
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 animate-pulse"></div>
            )}
            <div className="relative flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-1">{view.label}</p>
                <p className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-gray-100 dark:to-gray-300 bg-clip-text text-transparent">{view.count}</p>
                {activeTaskView === view.id && (
                  <div className="mt-2 flex items-center space-x-1 text-indigo-600 dark:text-indigo-400">
                    <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce"></div>
                    <span className="text-xs font-medium">Active View</span>
                  </div>
                )}
              </div>
              <div className={`relative p-4 rounded-2xl transition-all duration-300 ${
                activeTaskView === view.id 
                  ? `bg-gradient-to-br from-${view.color}-400 to-${view.color}-600 shadow-lg transform rotate-3` 
                  : `bg-${view.color}-100/70 dark:bg-gray-700/50 group-hover:bg-${view.color}-200/80 dark:group-hover:bg-gray-600/70 group-hover:rotate-6`
              }`}>
                <span className={`text-3xl ${
                  activeTaskView === view.id ? 'filter drop-shadow-sm' : ''
                }`}>{view.icon}</span>
                {activeTaskView === view.id && (
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-white rounded-full animate-ping"></div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Task List */}
      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-lg shadow-lg border border-white/30">
        <div className="p-6 border-b border-white/30 dark:border-gray-700/50">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              {taskViews.find(v => v.id === activeTaskView)?.label} ({filteredTasks.length})
            </h3>
          </div>
        </div>

        <div className="divide-y divide-white/30 dark:divide-gray-700/50">
          {filteredTasks.length === 0 ? (
            <div className="p-12 text-center">
              <div className="text-gray-400 text-6xl mb-4">📋</div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">No tasks found</h3>
              <p className="text-gray-600 dark:text-gray-300">
                No {activeTaskView} tasks available at the moment.
              </p>
            </div>
          ) : (
            filteredTasks.map(task => (
              <TaskCard
                key={task._id}
                task={task}
                onStatusChange={(taskId, newStatus) => {
                  setTasks(prevTasks =>
                    prevTasks.map(t =>
                      t._id === taskId ? { ...t, status: newStatus } : t
                    )
                  );
                }}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}

// Notifications Tab Component
function NotificationsTab({ user }) {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Notifications</h2>
        <button className="group relative px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 font-semibold overflow-hidden">
          <span className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
          <span className="relative flex items-center space-x-2">
            <span>✓</span>
            <span>Mark all as read</span>
          </span>
        </button>
      </div>
      
      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-lg shadow-lg border border-white/30">
        <div className="p-6">
          <p className="text-gray-600 dark:text-gray-300 text-center py-8">
            Notification system will be implemented here with real-time updates.
          </p>
        </div>
      </div>
    </div>
  );
}

// Task Card Component for displaying individual tasks
function TaskCard({ task, onStatusChange }) {
  const getStatusIcon = (status) => {
    switch (status) {
      case "pending":
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case "process":
        return <AlertTriangle className="h-4 w-4 text-orange-500" />;
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "urgent":
        return "bg-red-100 text-red-800 border-red-200";
      case "high":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "low":
        return "bg-green-100 text-green-800 border-green-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const handleStatusChange = (newStatus) => {
    onStatusChange(task._id, newStatus);
  };

  return (
    <div className="group p-6 hover:bg-white/60 dark:hover:bg-gray-700/60 backdrop-blur-sm transition-all duration-300 hover:shadow-md border-l-4 border-transparent hover:border-indigo-400">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-2">
            {getStatusIcon(task.status)}
            <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100">{task.title}</h4>
            <span className={`px-3 py-1 text-xs font-bold rounded-full border-2 shadow-sm ${getPriorityColor(task.priority)} transform group-hover:scale-105 transition-transform duration-200`}>
              {task.priority.toUpperCase()}
            </span>
            {task.isUrgent && (
              <span className="px-3 py-1 text-xs font-bold bg-gradient-to-r from-red-500 to-red-600 text-white rounded-full shadow-lg animate-pulse border-2 border-red-300">
                🚨 URGENT
              </span>
            )}
          </div>
          
          <p className="text-gray-600 dark:text-gray-300 mb-3">{task.description}</p>
          
          <div className="flex items-center space-x-6 text-sm text-gray-500 dark:text-gray-400">
            <span>📍 {task.location}</span>
            {task.roomNumber && <span>🏠 Room {task.roomNumber}</span>}
            <span>📂 {task.category}</span>
            <span>⏱️ {task.estimatedDuration} min</span>
            <span>📅 {new Date(task.createdAt).toLocaleDateString()}</span>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <div className="relative">
            <select
              value={task.status}
              onChange={(e) => handleStatusChange(e.target.value)}
              className="appearance-none px-4 py-2 pr-8 text-sm font-medium border-2 border-white/40 dark:border-gray-700/50 rounded-xl bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-400 hover:border-indigo-300 transition-all duration-300 cursor-pointer shadow-sm hover:shadow-md"
            >
              <option value="pending">🟡 Pending</option>
              <option value="process">🟠 In Progress</option>
              <option value="completed">🟢 Completed</option>
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper function to generate sample tasks based on department and user
function generateSampleTasks(department, user) {
  const baseId = Date.now();
  
  const taskTemplates = {
    maintenance: [
      {
        title: "Fix AC in Room 205",
        description: "Guest reported AC not working properly. Need to check and repair the cooling system.",
        category: "hvac",
        priority: "high",
        status: "pending",
        location: "room",
        roomNumber: "205",
        estimatedDuration: 45,
        isUrgent: false
      },
      {
        title: "Replace light bulbs in lobby",
        description: "Several light bulbs in the main lobby area need replacement.",
        category: "electrical",
        priority: "medium",
        status: "process",
        location: "lobby",
        estimatedDuration: 30,
        isUrgent: false
      },
      {
        title: "Fix leaking faucet in Room 312",
        description: "Guest reported a leaking bathroom faucet that needs immediate attention.",
        category: "plumbing",
        priority: "urgent",
        status: "pending",
        location: "room",
        roomNumber: "312",
        estimatedDuration: 60,
        isUrgent: true
      },
      {
        title: "Elevator maintenance check",
        description: "Monthly elevator safety and maintenance inspection.",
        category: "general",
        priority: "medium",
        status: "completed",
        location: "other",
        estimatedDuration: 90,
        isUrgent: false
      },
      {
        title: "Pool filtration system repair",
        description: "Pool filtration system showing error codes, needs diagnostic and repair.",
        category: "general",
        priority: "high",
        status: "pending",
        location: "pool",
        estimatedDuration: 120,
        isUrgent: false
      }
    ],
    kitchen: [
      {
        title: "Prepare breakfast buffet",
        description: "Set up and prepare breakfast buffet for hotel guests.",
        category: "food_preparation",
        priority: "high",
        status: "completed",
        location: "kitchen",
        estimatedDuration: 60,
        isUrgent: false
      },
      {
        title: "Clean and sanitize prep area",
        description: "Deep clean and sanitize all food preparation surfaces and equipment.",
        category: "cleaning",
        priority: "medium",
        status: "process",
        location: "kitchen",
        estimatedDuration: 45,
        isUrgent: false
      },
      {
        title: "Inventory check - dairy products",
        description: "Check expiration dates and stock levels for all dairy products.",
        category: "inventory",
        priority: "medium",
        status: "pending",
        location: "kitchen",
        estimatedDuration: 30,
        isUrgent: false
      },
      {
        title: "Fix commercial oven temperature",
        description: "Oven not reaching proper temperature, affecting cooking times.",
        category: "equipment",
        priority: "urgent",
        status: "pending",
        location: "kitchen",
        estimatedDuration: 90,
        isUrgent: true
      },
      {
        title: "Prepare special dietary meals",
        description: "Prepare gluten-free and vegan options for guests with dietary restrictions.",
        category: "cooking",
        priority: "high",
        status: "process",
        location: "kitchen",
        estimatedDuration: 75,
        isUrgent: false
      }
    ],
    service: [
      {
        title: "Guest transportation request",
        description: "Guest in Room 301 needs transportation to airport at 2 PM.",
        category: "transportation",
        priority: "medium",
        status: "pending",
        location: "lobby",
        roomNumber: "301",
        estimatedDuration: 20,
        isUrgent: false
      },
      {
        title: "VIP guest welcome setup",
        description: "Prepare welcome amenities and room setup for VIP guest arrival.",
        category: "guest_request",
        priority: "high",
        status: "process",
        location: "room",
        roomNumber: "501",
        estimatedDuration: 40,
        isUrgent: false
      },
      {
        title: "Handle guest complaint",
        description: "Guest complaint about noise levels, needs immediate attention and resolution.",
        category: "guest_request",
        priority: "urgent",
        status: "pending",
        location: "room",
        roomNumber: "203",
        estimatedDuration: 30,
        isUrgent: true
      },
      {
        title: "Concierge tour booking",
        description: "Arrange city tour bookings for group of 8 guests.",
        category: "concierge",
        priority: "medium",
        status: "completed",
        location: "lobby",
        estimatedDuration: 25,
        isUrgent: false
      },
      {
        title: "Room service delivery",
        description: "Deliver dinner order to Room 408 - special dietary requirements.",
        category: "room_service",
        priority: "high",
        status: "pending",
        location: "room",
        roomNumber: "408",
        estimatedDuration: 15,
        isUrgent: false
      }
    ],
    cleaning: [
      {
        title: "Deep clean Room 102",
        description: "Guest checked out. Room needs deep cleaning and sanitization.",
        category: "deep_cleaning",
        priority: "high",
        status: "pending",
        location: "room",
        roomNumber: "102",
        estimatedDuration: 90,
        isUrgent: false
      },
      {
        title: "Laundry - bed linens",
        description: "Process and clean bed linens from checkout rooms.",
        category: "laundry",
        priority: "medium",
        status: "process",
        location: "other",
        estimatedDuration: 120,
        isUrgent: false
      },
      {
        title: "Restock housekeeping supplies",
        description: "Restock cleaning supplies and amenities on floors 2 and 3.",
        category: "restocking",
        priority: "medium",
        status: "completed",
        location: "other",
        estimatedDuration: 45,
        isUrgent: false
      },
      {
        title: "Emergency spill cleanup",
        description: "Large spill in main corridor needs immediate cleanup and safety measures.",
        category: "cleaning",
        priority: "urgent",
        status: "pending",
        location: "other",
        estimatedDuration: 20,
        isUrgent: true
      },
      {
        title: "Gym equipment sanitization",
        description: "Daily sanitization of all gym equipment and surfaces.",
        category: "cleaning",
        priority: "high",
        status: "process",
        location: "gym",
        estimatedDuration: 60,
        isUrgent: false
      }
    ]
  };

  const templates = taskTemplates[department] || taskTemplates.service;
  
  return templates.map((template, index) => ({
    ...template,
    _id: `${baseId + index}`,
    assignedTo: {
      id: user?.id || 'user1',
      name: user?.name || 'Current User'
    },
    createdAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString() // Random date within last week
  }));
}
