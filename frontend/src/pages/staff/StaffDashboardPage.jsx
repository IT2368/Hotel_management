import { useContext, useState, useEffect, useRef } from "react";
import PropTypes from 'prop-types';
import { AuthContext } from "../../context/AuthContext";
import { useAuth } from "../../hooks/useAuth";
import staffService from "../../services/staffService";

// Department background images
const departmentBackgrounds = {
  kitchen: 'url("https://images.unsplash.com/photo-1600891964092-4316c288032e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80")',
  cleaning: 'url("https://images.unsplash.com/photo-1581578731548-c64695cc6952?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80")',
  service: 'url("https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80")',
  maintenance: 'url("https://images.unsplash.com/photo-1600607688969-a5bfcd646154?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80")',
};

// Module-scope department normalizer so all components can use it
function normalizeDepartment(value) {
  const key = String(value || "").toLowerCase().trim();
  const map = {
    chef: "kitchen",
    cheff: "kitchen",
    kitchen: "kitchen",
    maintenance: "maintenance",
    maintanence: "maintenance",
    maintenence: "maintenance",
    service: "service",
    services: "service",
    cleaning: "cleaning",
    housekeeping: "cleaning",
  };
  return map[key] || key || "service";
}

// TaskCard component for displaying individual tasks
function TaskCard({ task, onStatusChange, onSave }) {
  const [isEditing, setIsEditing] = useState(false);
  const [taskData, setTaskData] = useState({ ...task });

  const handleSave = () => {
    onSave?.(task.id, taskData);
    setIsEditing(false);
  };

  if (!task) return null;

  return (
    <div className="task-card bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 mb-4">
      {isEditing ? (
        <div className="edit-mode space-y-2">
          <input
            className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
            value={taskData.title}
            onChange={(e) => setTaskData({...taskData, title: e.target.value})}
          />
          <textarea
            className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
            value={taskData.description}
            onChange={(e) => setTaskData({...taskData, description: e.target.value})}
          />
          <div className="flex space-x-2">
            <button 
              onClick={handleSave}
              className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Save
            </button>
            <button 
              onClick={() => setIsEditing(false)}
              className="px-3 py-1 bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div className="view-mode">
          <h3 className="text-lg font-semibold dark:text-white">{task.title}</h3>
          <p className="text-gray-600 dark:text-gray-300 mb-2">{task.description}</p>
          <div className="flex space-x-2">
            <button 
              onClick={() => setIsEditing(true)}
              className="px-2 py-1 bg-yellow-500 text-white text-sm rounded hover:bg-yellow-600"
            >
              Edit
            </button>
            <button 
              onClick={() => onStatusChange?.(task.id, 'completed')}
              className="px-2 py-1 bg-green-500 text-white text-sm rounded hover:bg-green-600"
            >
              Complete
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

TaskCard.propTypes = {
  task: PropTypes.object,
  onStatusChange: PropTypes.func,
  onSave: PropTypes.func
};

// Helper function to generate sample tasks
function generateSampleTasks(department, user) {
  const baseTasks = {
    kitchen: [
      {
        id: 'task-1',
        title: 'Prepare breakfast buffet',
        description: 'Set up and prepare all items for the breakfast buffet',
        status: 'pending',
        priority: 'high',
        dueDate: '2023-11-15',
        assignedTo: user?.id || 'unknown'
      },
      {
        id: 'task-2',
        title: 'Inventory check',
        description: 'Check and restock kitchen inventory',
        status: 'in-progress',
        priority: 'medium',
        dueDate: '2023-11-16',
        assignedTo: user?.id || 'unknown'
      }
    ],
    maintenance: [
      {
        id: 'task-3',
        title: 'Fix AC in room 205',
        description: 'Guest reported AC not working properly',
        status: 'pending',
        priority: 'high',
        dueDate: '2023-11-14',
        assignedTo: user?.id || 'unknown'
      }
    ],
    cleaning: [
      {
        id: 'task-4',
        title: 'Clean room 301',
        description: 'Thorough cleaning after checkout',
        status: 'pending',
        priority: 'high',
        dueDate: '2023-11-14',
        assignedTo: user?.id || 'unknown'
      }
    ],
    service: [
      {
        id: 'task-5',
        title: 'Welcome new guest',
        description: 'Mr. Smith checking in at 2 PM',
        status: 'pending',
        priority: 'medium',
        dueDate: '2023-11-14',
        assignedTo: user?.id || 'unknown'
      }
    ]
  };

  return baseTasks[department?.toLowerCase()] || [];
}

const tabs = [
  { id: "overview", label: "Overview", icon: "📊" },
  { id: "tasks", label: "My Tasks", icon: "📋" },
  { id: "contact", label: "Contact Manager", icon: "💬" },
  { id: "notifications", label: "Notifications", icon: "🔔" }
];

function StaffDashboardPage() {
  const { user } = useContext(AuthContext);
  const { logout, checkAuth } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");
  const [tasks, setTasks] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [taskStats, setTaskStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const fileInputRef = useRef(null);
  
  // Get department from user profile with role-based fallback mapping
  const roleDeptMap = {
    chef: "kitchen",
    cheff: "kitchen",
    kitchen: "kitchen",
    maintenance: "maintenance",
    maintanence: "maintenance",
    service: "service",
    cleaning: "cleaning",
    housekeeping: "cleaning",
  };
  
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
  
  // Get user's department
  const inferredDept = roleDeptMap[(user?.staffProfile?.position || user?.role || "").toLowerCase()];
  const department = user?.staffProfile?.department || user?.department || inferredDept || "service";
  
  // Ensure we have a valid department configuration
  const currentDept = departmentConfig[department] || departmentConfig.service;
  
  // Get background image based on department
  const normalizedDept = normalizeDepartment(department);
  const departmentBg = departmentBackgrounds[normalizedDept] || departmentBackgrounds.cleaning;

  // Load tasks and initial data
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        // In a real app, you would fetch tasks from an API
        const sampleTasks = generateSampleTasks(department, user);
        setTasks(sampleTasks);
        
        // Set some sample notifications
        setNotifications([
          { id: 1, message: 'New task assigned: Prepare breakfast buffet', read: false },
          { id: 2, message: 'Team meeting at 2:00 PM', read: true },
        ]);
        
        // Set sample task stats
        setTaskStats({
          total: sampleTasks.length,
          completed: sampleTasks.filter(t => t.status === 'completed').length,
          inProgress: sampleTasks.filter(t => t.status === 'in-progress').length,
          pending: sampleTasks.filter(t => t.status === 'pending').length,
        });
        
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user, department]);

  const handleStatusChange = (taskId, newStatus) => {
    setTasks(tasks.map(task => 
      task.id === taskId ? { ...task, status: newStatus } : task
    ));
  };

  const handleSaveTask = (taskId, updates) => {
    setTasks(tasks.map(task => 
      task.id === taskId ? { ...task, ...updates } : task
    ));
  };
  
  const handleLogout = async () => {
    try {
      await logout();
      // Redirect handled by auth context
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };
  
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setUploadingPhoto(true);
      const formData = new FormData();
      formData.append('image', file);
      
      await staffService.uploadProfilePhoto(formData);
      await checkAuth(); // Refresh user data
    } catch (error) {
      console.error('Error uploading profile photo:', error);
    } finally {
      setUploadingPhoto(false);
    }
  };

  // Loading state
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
  
  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center text-red-500 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
          <p>Error loading dashboard: {error.message}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Render tab content based on active tab
  const renderTabContent = () => {
    switch (activeTab) {
      case 'tasks':
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">My Tasks</h2>
            {tasks.length === 0 ? (
              <p className="text-gray-600 dark:text-gray-300">No tasks assigned.</p>
            ) : (
              tasks.map(task => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onStatusChange={handleStatusChange}
                  onSave={handleSaveTask}
                />
              ))
            )}
          </div>
        );
      case 'contact':
        return (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">Contact Manager</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Need help? Contact your manager for assistance.
            </p>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Subject
                </label>
                <input
                  type="text"
                  className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                  placeholder="Enter subject"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Message
                </label>
                <textarea
                  className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                  rows={4}
                  placeholder="Type your message here..."
                ></textarea>
              </div>
              <button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
                Send Message
              </button>
            </div>
          </div>
        );
      case 'notifications':
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">Notifications</h2>
            {notifications.length === 0 ? (
              <p className="text-gray-600 dark:text-gray-300">No notifications.</p>
            ) : (
              <div className="space-y-2">
                {notifications.map(notification => (
                  <div 
                    key={notification.id}
                    className={`p-4 rounded-lg ${
                      notification.read 
                        ? 'bg-gray-100 dark:bg-gray-800' 
                        : 'bg-blue-50 dark:bg-blue-900/30'
                    }`}
                  >
                    <p className="text-gray-800 dark:text-gray-200">{notification.message}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {new Date().toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      case 'overview':
      default:
        return (
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">Welcome, {user?.name || 'User'}!</h2>
              <p className="text-gray-600 dark:text-gray-300">
                You are logged in as {user?.role || 'staff'} in the {currentDept.name} department.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
                <h3 className="font-semibold text-gray-700 dark:text-gray-200">Total Tasks</h3>
                <p className="text-2xl font-bold text-blue-500">{taskStats.total || 0}</p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
                <h3 className="font-semibold text-gray-700 dark:text-gray-200">Completed</h3>
                <p className="text-2xl font-bold text-green-500">{taskStats.completed || 0}</p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
                <h3 className="font-semibold text-gray-700 dark:text-gray-200">In Progress</h3>
                <p className="text-2xl font-bold text-yellow-500">{taskStats.inProgress || 0}</p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
                <h3 className="font-semibold text-gray-700 dark:text-gray-200">Pending</h3>
                <p className="text-2xl font-bold text-red-500">{taskStats.pending || 0}</p>
              </div>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Upcoming Tasks</h3>
              {tasks.length === 0 ? (
                <p className="text-gray-600 dark:text-gray-300">No upcoming tasks.</p>
              ) : (
                <div className="space-y-2">
                  {tasks.slice(0, 3).map(task => (
                    <div key={task.id} className="p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium text-gray-800 dark:text-gray-200">{task.title}</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{task.description}</p>
                        </div>
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          task.status === 'completed' 
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' 
                            : task.status === 'in-progress'
                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                            : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                        }`}>
                          {task.status.replace('-', ' ')}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              {tasks.length > 3 && (
                <button 
                  onClick={() => setActiveTab('tasks')}
                  className="mt-4 text-sm text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                >
                  View all tasks →
                </button>
              )}
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 relative">
      {/* Department Background */}
      <div 
        className="fixed inset-0 -z-10 opacity-20 dark:opacity-10 transition-opacity duration-500"
        style={{ 
          backgroundImage: departmentBg,
          backgroundAttachment: 'fixed',
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      />
      
      {/* Main Content */}
      <div className="relative z-10">
        {/* Header */}
        <header className="bg-white dark:bg-gray-800 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex justify-between items-center">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {currentDept.icon} {currentDept.name} Dashboard
              </h1>
              
              <div className="relative">
                <button 
                  onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                  className="flex items-center space-x-2 focus:outline-none"
                >
                  <div className="relative">
                    <img 
                      className="h-10 w-10 rounded-full"
                      src={user?.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'U')}&background=random`}
                      alt={user?.name || 'User'}
                    />
                    {uploadingPhoto && (
                      <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                      </div>
                    )}
                  </div>
                  <span className="text-gray-700 dark:text-gray-200">
                    {user?.name || 'User'}
                  </span>
                  <svg 
                    className={`h-5 w-5 text-gray-500 transition-transform ${profileMenuOpen ? 'transform rotate-180' : ''}`} 
                    xmlns="http://www.w3.org/2000/svg" 
                    viewBox="0 0 20 20" 
                    fill="currentColor"
                  >
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
                
                {/* Profile Dropdown */}
                {profileMenuOpen && (
                  <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
                    <div className="py-1" role="none">
                      <div className="px-4 py-2 text-sm text-gray-700 dark:text-gray-200 border-b border-gray-100 dark:border-gray-700">
                        Signed in as <span className="font-medium">{user?.email || 'user@example.com'}</span>
                      </div>
                      
                      <label className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer">
                        Change Photo
                        <input 
                          type="file" 
                          ref={fileInputRef}
                          onChange={handleFileChange}
                          accept="image/*"
                          className="hidden"
                        />
                      </label>
                      
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        Sign out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Tabs */}
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="-mb-px flex max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" aria-label="Tabs">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600 dark:text-blue-400 dark:border-blue-400'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:border-gray-500'
                  } whitespace-nowrap py-4 px-4 border-b-2 font-medium text-sm flex items-center space-x-2`}
                >
                  <span>{tab.icon}</span>
                  <span>{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>
        </header>
        
        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {renderTabContent()}
        </main>
      </div>
    </div>
  );
}

// Add PropTypes validation
StaffDashboardPage.propTypes = {
  // Add any props validation here if needed
};

export default StaffDashboardPage;
