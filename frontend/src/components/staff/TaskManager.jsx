import { useState, useEffect } from "react";
import { Plus, Filter, Search, Clock, AlertTriangle, CheckCircle, XCircle, Edit, Trash2 } from "lucide-react";

export default function TaskManager({ department, user }) {
  const [tasks, setTasks] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [filters, setFilters] = useState({
    status: "all",
    priority: "all",
    category: "all",
    assignedTo: "all"
  });
  const [searchTerm, setSearchTerm] = useState("");

  const statusOptions = [
    { value: "all", label: "All Status" },
    { value: "pending", label: "Pending" },
    { value: "assigned", label: "Assigned" },
    { value: "in_progress", label: "In Progress" },
    { value: "completed", label: "Completed" },
    { value: "cancelled", label: "Cancelled" }
  ];

  const priorityOptions = [
    { value: "all", label: "All Priorities" },
    { value: "low", label: "Low" },
    { value: "medium", label: "Medium" },
    { value: "high", label: "High" },
    { value: "urgent", label: "Urgent" }
  ];

  const categoryOptions = getCategoryOptions(department);

  useEffect(() => {
    fetchTasks();
  }, [department]);

  useEffect(() => {
    applyFilters();
  }, [tasks, filters, searchTerm]);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      // API call to fetch tasks
      // const response = await api.get(`/staff/tasks?department=${department}`);
      // setTasks(response.data.tasks);
      
      // Mock data for now
      setTasks(getMockTasks(department));
      setLoading(false);
    } catch (error) {
      console.error("Error fetching tasks:", error);
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...tasks];

    // Apply status filter
    if (filters.status !== "all") {
      filtered = filtered.filter(task => task.status === filters.status);
    }

    // Apply priority filter
    if (filters.priority !== "all") {
      filtered = filtered.filter(task => task.priority === filters.priority);
    }

    // Apply category filter
    if (filters.category !== "all") {
      filtered = filtered.filter(task => task.category === filters.category);
    }

    // Apply assigned to filter
    if (filters.assignedTo !== "all") {
      filtered = filtered.filter(task => task.assignedTo?.id === filters.assignedTo);
    }

    // Apply search term
    if (searchTerm) {
      filtered = filtered.filter(task =>
        task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.roomNumber?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredTasks(filtered);
  };

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      // API call to update task status
      // await api.put(`/staff/tasks/${taskId}`, { status: newStatus });
      
      // Update local state
      setTasks(prevTasks =>
        prevTasks.map(task =>
          task.id === taskId ? { ...task, status: newStatus } : task
        )
      );
    } catch (error) {
      console.error("Error updating task status:", error);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "pending":
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case "in_progress":
        return <AlertTriangle className="h-4 w-4 text-blue-500" />;
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "cancelled":
        return <XCircle className="h-4 w-4 text-red-500" />;
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

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold text-gray-800">Task Management</h2>
          <p className="text-gray-600 text-sm">
            Manage and track all tasks in the {department} department
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition duration-200"
        >
          <Plus className="h-4 w-4" />
          <span>Create Task</span>
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex-1 min-w-64">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search tasks..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
          </div>

          <select
            value={filters.status}
            onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          >
            {statusOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          <select
            value={filters.priority}
            onChange={(e) => setFilters(prev => ({ ...prev, priority: e.target.value }))}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          >
            {priorityOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          <select
            value={filters.category}
            onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          >
            {categoryOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Task List */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">
              Tasks ({filteredTasks.length})
            </h3>
            <div className="text-sm text-gray-600">
              Showing {filteredTasks.length} of {tasks.length} tasks
            </div>
          </div>
        </div>

        <div className="divide-y divide-gray-200">
          {filteredTasks.length === 0 ? (
            <div className="p-12 text-center">
              <div className="text-gray-400 text-6xl mb-4">📋</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No tasks found</h3>
              <p className="text-gray-600">
                {searchTerm || Object.values(filters).some(f => f !== "all")
                  ? "Try adjusting your search or filters"
                  : "No tasks have been created yet"}
              </p>
            </div>
          ) : (
            filteredTasks.map(task => (
              <TaskCard
                key={task.id}
                task={task}
                onStatusChange={handleStatusChange}
                onEdit={() => {
                  setSelectedTask(task);
                  setShowEditModal(true);
                }}
                getStatusIcon={getStatusIcon}
                getPriorityColor={getPriorityColor}
              />
            ))
          )}
        </div>
      </div>

      {/* Create Task Modal */}
      {showCreateModal && (
        <TaskModal
          mode="create"
          department={department}
          onClose={() => setShowCreateModal(false)}
          onSave={(taskData) => {
            // Handle task creation
            console.log("Creating task:", taskData);
            setShowCreateModal(false);
          }}
        />
      )}

      {/* Edit Task Modal */}
      {showEditModal && selectedTask && (
        <TaskModal
          mode="edit"
          task={selectedTask}
          department={department}
          onClose={() => {
            setShowEditModal(false);
            setSelectedTask(null);
          }}
          onSave={(taskData) => {
            // Handle task update
            console.log("Updating task:", taskData);
            setShowEditModal(false);
            setSelectedTask(null);
          }}
        />
      )}
    </div>
  );
}

// Task Card Component
function TaskCard({ task, onStatusChange, onEdit, getStatusIcon, getPriorityColor }) {
  return (
    <div className="p-6 hover:bg-gray-50 transition duration-200">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-2">
            {getStatusIcon(task.status)}
            <h4 className="text-lg font-medium text-gray-900">{task.title}</h4>
            <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getPriorityColor(task.priority)}`}>
              {task.priority}
            </span>
            {task.isUrgent && (
              <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">
                Urgent
              </span>
            )}
          </div>
          
          <p className="text-gray-600 mb-3">{task.description}</p>
          
          <div className="flex items-center space-x-6 text-sm text-gray-500">
            <span>📍 {task.location}</span>
            {task.roomNumber && <span>🏠 Room {task.roomNumber}</span>}
            <span>📂 {task.category}</span>
            <span>⏱️ {task.estimatedDuration} min</span>
            {task.assignedTo && (
              <span>👤 {task.assignedTo.name}</span>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <select
            value={task.status}
            onChange={(e) => onStatusChange(task.id, e.target.value)}
            className="px-3 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          >
            <option value="pending">Pending</option>
            <option value="assigned">Assigned</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
          
          <button
            onClick={onEdit}
            className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition duration-200"
          >
            <Edit className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

// Task Modal Component
function TaskModal({ mode, task, department, onClose, onSave }) {
  const [formData, setFormData] = useState(
    mode === "edit" ? task : {
      title: "",
      description: "",
      priority: "medium",
      category: "",
      location: "other",
      roomNumber: "",
      estimatedDuration: "",
      materials: [],
      isUrgent: false,
      requiresApproval: false
    }
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">
              {mode === "create" ? "Create New Task" : "Edit Task"}
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <XCircle className="h-6 w-6" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Task Title *
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Priority
              </label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category *
              </label>
              <select
                required
                value={formData.category}
                onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="">Select Category</option>
                {getCategoryOptions(department).map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Location
              </label>
              <select
                value={formData.location}
                onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="room">Room</option>
                <option value="kitchen">Kitchen</option>
                <option value="lobby">Lobby</option>
                <option value="gym">Gym</option>
                <option value="pool">Pool</option>
                <option value="parking">Parking</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Room Number
              </label>
              <input
                type="text"
                value={formData.roomNumber}
                onChange={(e) => setFormData(prev => ({ ...prev, roomNumber: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="e.g., 205"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Estimated Duration (minutes)
              </label>
              <input
                type="number"
                value={formData.estimatedDuration}
                onChange={(e) => setFormData(prev => ({ ...prev, estimatedDuration: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="30"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description *
            </label>
            <textarea
              required
              rows={4}
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="Describe the task in detail..."
            />
          </div>

          <div className="flex items-center space-x-6">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.isUrgent}
                onChange={(e) => setFormData(prev => ({ ...prev, isUrgent: e.target.checked }))}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
              <span className="ml-2 text-sm text-gray-700">Mark as urgent</span>
            </label>

            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.requiresApproval}
                onChange={(e) => setFormData(prev => ({ ...prev, requiresApproval: e.target.checked }))}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
              <span className="ml-2 text-sm text-gray-700">Requires approval</span>
            </label>
          </div>

          <div className="flex justify-end space-x-4 pt-6 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition duration-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition duration-200"
            >
              {mode === "create" ? "Create Task" : "Update Task"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Helper function to get category options based on department
function getCategoryOptions(department) {
  const categories = {
    maintenance: [
      { value: "electrical", label: "Electrical" },
      { value: "plumbing", label: "Plumbing" },
      { value: "hvac", label: "HVAC" },
      { value: "appliance", label: "Appliance" },
      { value: "structural", label: "Structural" },
      { value: "general", label: "General" }
    ],
    kitchen: [
      { value: "food_preparation", label: "Food Preparation" },
      { value: "cooking", label: "Cooking" },
      { value: "cleaning", label: "Cleaning" },
      { value: "inventory", label: "Inventory" },
      { value: "equipment", label: "Equipment" }
    ],
    service: [
      { value: "guest_request", label: "Guest Request" },
      { value: "room_service", label: "Room Service" },
      { value: "concierge", label: "Concierge" },
      { value: "transportation", label: "Transportation" },
      { value: "event", label: "Event" }
    ],
    housekeeping: [
      { value: "cleaning", label: "Cleaning" },
      { value: "laundry", label: "Laundry" },
      { value: "restocking", label: "Restocking" },
      { value: "inspection", label: "Inspection" },
      { value: "deep_cleaning", label: "Deep Cleaning" }
    ]
  };

  return categories[department] || [];
}

// Helper function to get mock tasks
function getMockTasks(department) {
  const mockTasks = {
    maintenance: [
      {
        id: 1,
        title: "Fix AC in Room 205",
        description: "Guest reported AC not working properly. Need to check and repair.",
        status: "in_progress",
        priority: "high",
        category: "hvac",
        location: "room",
        roomNumber: "205",
        estimatedDuration: 45,
        isUrgent: false,
        assignedTo: { id: 1, name: "John Smith" },
        createdAt: "2024-01-15T10:00:00Z"
      },
      {
        id: 2,
        title: "Replace light bulbs in lobby",
        description: "Several light bulbs in the lobby need replacement.",
        status: "pending",
        priority: "medium",
        category: "electrical",
        location: "lobby",
        estimatedDuration: 30,
        isUrgent: false,
        assignedTo: { id: 2, name: "Mike Johnson" },
        createdAt: "2024-01-15T09:00:00Z"
      }
    ],
    kitchen: [
      {
        id: 3,
        title: "Prepare breakfast buffet",
        description: "Set up and prepare breakfast buffet for hotel guests.",
        status: "completed",
        priority: "high",
        category: "food_preparation",
        location: "kitchen",
        estimatedDuration: 60,
        isUrgent: false,
        assignedTo: { id: 3, name: "Chef Maria" },
        createdAt: "2024-01-15T06:00:00Z"
      }
    ],
    service: [
      {
        id: 4,
        title: "Guest transportation request",
        description: "Guest in Room 301 needs transportation to airport at 2 PM.",
        status: "assigned",
        priority: "medium",
        category: "transportation",
        location: "lobby",
        roomNumber: "301",
        estimatedDuration: 20,
        isUrgent: false,
        assignedTo: { id: 4, name: "Sarah Wilson" },
        createdAt: "2024-01-15T11:00:00Z"
      }
    ],
    housekeeping: [
      {
        id: 5,
        title: "Deep clean Room 102",
        description: "Guest checked out. Room needs deep cleaning and sanitization.",
        status: "pending",
        priority: "high",
        category: "deep_cleaning",
        location: "room",
        roomNumber: "102",
        estimatedDuration: 90,
        isUrgent: false,
        assignedTo: { id: 5, name: "Lisa Brown" },
        createdAt: "2024-01-15T12:00:00Z"
      }
    ]
  };

  return mockTasks[department] || [];
} 