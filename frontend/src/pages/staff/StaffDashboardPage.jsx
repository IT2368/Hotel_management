import { useContext, useState, useEffect } from "react";
import { AuthContext } from "../../context/AuthContext";
import useAuth from "../../hooks/useAuth";
import TaskManager from "../../components/staff/TaskManager.jsx";

// Simple icon components as fallbacks
const Bell = () => <span className="text-xl">🔔</span>;
const Clock = () => <span className="text-xl">⏰</span>;``
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

  const department = user?.staffProfile?.department || "service";
  const departmentConfig = {
    maintenance: {
      name: "Maintenance",
      color: "blue",
      icon: "🔧",
      description: "Equipment repair, facility maintenance, and technical support"
    },
    kitchen: {
      name: "Kitchen",
      color: "orange",
      icon: "👨‍🍳",
      description: "Food preparation, cooking, and kitchen operations"
    },
    service: {
      name: "Service",
      color: "green",
      icon: "👔",
      description: "Guest services, concierge, and customer support"
    },
        cleaning: {
      name: "Cleaning",
      color: "purple",
      icon: "🧹",
      description: "Room cleaning, laundry, and facility maintenance"
    }
  };

  const currentDept = departmentConfig[department];

  useEffect(() => {
    fetchDashboardData();
  }, []);

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
    { id: "department-tasks", label: "Department Tasks", icon: "🏢" },
    { id: "notifications", label: "Notifications", icon: "🔔" },
    { id: "schedule", label: "Schedule", icon: "📅" },
    { id: "colleagues", label: "Colleagues", icon: "👥" },
    { id: "reports", label: "Reports", icon: "📈" }
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
    <div className="min-h-screen bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow">
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
              className="px-6 py-2 bg-red-500 text-white rounded-full shadow hover:bg-red-600 dark:hover:bg-red-700 transition duration-300 font-medium"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 h-screen px-6 py-8">
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

          <nav className="space-y-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition duration-200 ${
                  activeTab === tab.id
                    ? "bg-indigo-50 text-indigo-700 border-l-4 border-indigo-600 dark:bg-gray-800 dark:text-indigo-300 dark:border-indigo-500"
                    : "text-gray-700 hover:bg-gray-50 dark:text-gray-200 dark:hover:bg-gray-800"
                }`}
              >
                <span className="text-lg">{tab.icon}</span>
                <span className="font-medium">{tab.label}</span>
              </button>
            ))}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-8">
          {activeTab === "overview" && <OverviewTab user={user} department={department} />}
          {activeTab === "tasks" && <TasksTab user={user} department={department} />}
          {activeTab === "department-tasks" && <DepartmentTasksTab user={user} department={department} />}
          {activeTab === "notifications" && <NotificationsTab user={user} />}
          {activeTab === "schedule" && <ScheduleTab user={user} />}
          {activeTab === "colleagues" && <ColleaguesTab user={user} department={department} />}
          {activeTab === "reports" && <ReportsTab user={user} department={department} />}
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
          <div key={stat.title} className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
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
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <button onClick={() => setActiveTab("tasks")} className="w-full text-left p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition duration-200">
              <div className="flex items-center space-x-3">
                <span className="text-lg">📋</span>
                <span>View My Tasks</span>
              </div>
            </button>
            <button onClick={() => setActiveTab("department-tasks")} className="w-full text-left p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition duration-200">
              <div className="flex items-center space-x-3">
                <span className="text-lg">🏢</span>
                <span>View Department Tasks</span>
              </div>
            </button>
            <button onClick={() => setActiveTab("notifications")} className="w-full text-left p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition duration-200">
              <div className="flex items-center space-x-3">
                <span className="text-lg">🔔</span>
                <span>Check Notifications</span>
              </div>
            </button>
            <button onClick={() => setActiveTab("schedule")} className="w-full text-left p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition duration-200">
              <div className="flex items-center space-x-3">
                <span className="text-lg">📅</span>
                <span>View Schedule</span>
              </div>
            </button>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
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
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">My Tasks</h2>
        <p className="text-gray-600 dark:text-gray-300 text-sm">View and update your assigned tasks</p>
      </div>
      
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        <TaskManager department={department} user={user} viewMode="mine" />
      </div>
    </div>
  );
}

// Department Tasks Tab Component
function DepartmentTasksTab({ user, department }) {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Department Tasks</h2>
        <p className="text-gray-600 dark:text-gray-300 text-sm">View all tasks in the {department} department</p>
      </div>
      
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        <TaskManager department={department} user={user} viewMode="department" />
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
        <button className="px-4 py-2 text-indigo-600 dark:text-indigo-300 hover:bg-indigo-50 dark:hover:bg-gray-700 rounded-lg transition duration-200">
          Mark all as read
        </button>
      </div>
      
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        <div className="p-6">
          <p className="text-gray-600 dark:text-gray-300 text-center py-8">
            Notification system will be implemented here with real-time updates.
          </p>
        </div>
      </div>
    </div>
  );
}

// Schedule Tab Component
function ScheduleTab({ user }) {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">My Schedule</h2>
      
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        <div className="p-6">
          <p className="text-gray-600 dark:text-gray-300 text-center py-8">
            Schedule management will be implemented here with calendar view.
          </p>
        </div>
      </div>
    </div>
  );
}

// Colleagues Tab Component
function ColleaguesTab({ user, department }) {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">My Colleagues</h2>
      
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        <div className="p-6">
          <p className="text-gray-600 dark:text-gray-300 text-center py-8">
            Team member list will be implemented here with contact information.
          </p>
        </div>
      </div>
    </div>
  );
}

// Reports Tab Component
function ReportsTab({ user, department }) {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Reports & Analytics</h2>
      
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        <div className="p-6">
          <p className="text-gray-600 dark:text-gray-300 text-center py-8">
            Performance reports and analytics will be implemented here.
          </p>
        </div>
      </div>
    </div>
  );
}
