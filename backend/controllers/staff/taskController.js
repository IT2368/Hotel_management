// 📁 backend/controllers/staff/taskController.js
import StaffTask from "../../models/StaffTask.js";
import StaffNotification from "../../models/StaffNotification.js";
import StaffProfile from "../../models/profiles/StaffProfile.js";
import User from "../../models/User.js";
import { formatResponse } from "../../utils/responseFormatter.js";
import { logger } from "../../utils/logger.js";

// Get all tasks with filtering
export const getTasks = async (req, res) => {
  try {
    const {
      department,
      status,
      priority,
      assignedTo,
      category,
      location,
      isUrgent,
      page = 1,
      limit = 20,
      sortBy = "createdAt",
      sortOrder = "desc"
    } = req.query;

    const filter = {};

    // Apply filters
    if (department) filter.department = department;
    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (assignedTo) filter.assignedTo = assignedTo;
    if (category) filter.category = category;
    if (location) filter.location = location;
    if (isUrgent !== undefined) filter.isUrgent = isUrgent === "true";

    // Pagination
    const skip = (page - 1) * limit;
    const sort = { [sortBy]: sortOrder === "desc" ? -1 : 1 };

    const tasks = await StaffTask.find(filter)
      .populate("assignedTo", "name email")
      .populate("assignedBy", "name email")
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await StaffTask.countDocuments(filter);

    res.json(formatResponse(true, "Tasks retrieved successfully", {
      tasks,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    }));
  } catch (error) {
    logger.error("Error getting tasks:", error);
    res.status(500).json(formatResponse(false, "Failed to get tasks", null, error.message));
  }
};

// Get tasks for specific staff member
export const getMyTasks = async (req, res) => {
  try {
    const { userId } = req.user;
    const { status, priority, page = 1, limit = 20 } = req.query;

    const filter = { assignedTo: userId };
    if (status) filter.status = status;
    if (priority) filter.priority = priority;

    const skip = (page - 1) * limit;

    const tasks = await StaffTask.find(filter)
      .populate("assignedBy", "name email")
      .sort({ priority: -1, createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await StaffTask.countDocuments(filter);

    res.json(formatResponse(true, "My tasks retrieved successfully", {
      tasks,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    }));
  } catch (error) {
    logger.error("Error getting my tasks:", error);
    res.status(500).json(formatResponse(false, "Failed to get my tasks", null, error.message));
  }
};

// Create new task
export const createTask = async (req, res) => {
  try {
    const {
      title,
      description,
      department,
      priority,
      location,
      roomNumber,
      category,
      estimatedDuration,
      materials,
      dueDate,
      assignedTo,
      isUrgent,
      requiresApproval,
      tags
    } = req.body;

    const taskData = {
      title,
      description,
      department,
      priority,
      location,
      category,
      estimatedDuration,
      materials,
      assignedBy: req.user.userId,
      isUrgent,
      requiresApproval,
      tags
    };

    if (roomNumber) taskData.roomNumber = roomNumber;
    if (dueDate) taskData.dueDate = new Date(dueDate);
    if (assignedTo) taskData.assignedTo = assignedTo;

    const task = new StaffTask(taskData);
    await task.save();

    // Create notification for assigned staff
    if (assignedTo) {
      await createTaskNotification(task, "task_assigned");
    }

    const populatedTask = await StaffTask.findById(task._id)
      .populate("assignedTo", "name email")
      .populate("assignedBy", "name email");

    res.status(201).json(formatResponse(true, "Task created successfully", populatedTask));
  } catch (error) {
    logger.error("Error creating task:", error);
    res.status(500).json(formatResponse(false, "Failed to create task", null, error.message));
  }
};

// Update task
export const updateTask = async (req, res) => {
  try {
    const { taskId } = req.params;
    const updateData = req.body;

    const task = await StaffTask.findById(taskId);
    if (!task) {
      return res.status(404).json(formatResponse(false, "Task not found"));
    }

    // Check if status is being updated
    const statusChanged = updateData.status && updateData.status !== task.status;
    const wasCompleted = task.status === "completed";
    const willBeCompleted = updateData.status === "completed";

    // Update task
    Object.assign(task, updateData);
    
    // Set completion time if task is being completed
    if (willBeCompleted && !wasCompleted) {
      task.completedAt = new Date();
      task.actualDuration = task.actualDuration || 
        Math.round((task.completedAt - task.createdAt) / (1000 * 60)); // minutes
    }

    await task.save();

    // Create notifications for status changes
    if (statusChanged) {
      await createTaskNotification(task, "task_updated");
    }

    const updatedTask = await StaffTask.findById(taskId)
      .populate("assignedTo", "name email")
      .populate("assignedBy", "name email");

    res.json(formatResponse(true, "Task updated successfully", updatedTask));
  } catch (error) {
    logger.error("Error updating task:", error);
    res.status(500).json(formatResponse(false, "Failed to update task", null, error.message));
  }
};

// Add note to task
export const addTaskNote = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { content } = req.body;

    const task = await StaffTask.findById(taskId);
    if (!task) {
      return res.status(404).json(formatResponse(false, "Task not found"));
    }

    task.notes.push({
      content,
      addedBy: req.user.userId
    });

    await task.save();

    res.json(formatResponse(true, "Note added successfully", task.notes[task.notes.length - 1]));
  } catch (error) {
    logger.error("Error adding task note:", error);
    res.status(500).json(formatResponse(false, "Failed to add note", null, error.message));
  }
};

// Delete task
export const deleteTask = async (req, res) => {
  try {
    const { taskId } = req.params;

    const task = await StaffTask.findById(taskId);
    if (!task) {
      return res.status(404).json(formatResponse(false, "Task not found"));
    }

    await StaffTask.findByIdAndDelete(taskId);

    res.json(formatResponse(true, "Task deleted successfully"));
  } catch (error) {
    logger.error("Error deleting task:", error);
    res.status(500).json(formatResponse(false, "Failed to delete task", null, error.message));
  }
};

// Get task statistics
export const getTaskStats = async (req, res) => {
  try {
    const { department, timeRange = "today" } = req.query;
    const filter = {};

    if (department) filter.department = department;

    // Date filtering
    const now = new Date();
    let startDate;
    switch (timeRange) {
      case "today":
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      case "week":
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case "month":
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    }

    filter.createdAt = { $gte: startDate };

    const stats = await StaffTask.aggregate([
      { $match: filter },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
          avgDuration: { $avg: "$actualDuration" }
        }
      }
    ]);

    const totalTasks = await StaffTask.countDocuments(filter);
    const urgentTasks = await StaffTask.countDocuments({ ...filter, isUrgent: true });

    const result = {
      total: totalTasks,
      urgent: urgentTasks,
      byStatus: stats.reduce((acc, stat) => {
        acc[stat._id] = { count: stat.count, avgDuration: stat.avgDuration };
        return acc;
      }, {}),
      timeRange
    };

    res.json(formatResponse(true, "Task statistics retrieved successfully", result));
  } catch (error) {
    logger.error("Error getting task stats:", error);
    res.status(500).json(formatResponse(false, "Failed to get task statistics", null, error.message));
  }
};

// Helper function to create task notifications
const createTaskNotification = async (task, type) => {
  try {
    const notificationData = {
      title: getNotificationTitle(type, task),
      message: getNotificationMessage(type, task),
      type,
      priority: task.isUrgent ? "urgent" : task.priority,
      department: task.department,
      relatedTask: task._id,
      sender: task.assignedBy,
      actionRequired: type === "task_assigned",
      actionUrl: `/staff/tasks/${task._id}`,
      metadata: {
        taskId: task._id.toString(),
        roomNumber: task.roomNumber,
        location: task.location,
        estimatedTime: task.estimatedDuration ? `${task.estimatedDuration} minutes` : "Not specified"
      }
    };

    if (task.assignedTo) {
      notificationData.recipients = [{ userId: task.assignedTo }];
    } else {
      // If no specific assignment, notify all staff in the department
      const departmentStaff = await StaffProfile.find({ 
        department: task.department, 
        isActive: true 
      }).select("userId");
      
      notificationData.recipients = departmentStaff.map(staff => ({ userId: staff.userId }));
    }

    const notification = new StaffNotification(notificationData);
    await notification.save();
  } catch (error) {
    logger.error("Error creating task notification:", error);
  }
};

const getNotificationTitle = (type, task) => {
  switch (type) {
    case "task_assigned":
      return `New Task Assigned: ${task.title}`;
    case "task_updated":
      return `Task Updated: ${task.title}`;
    case "task_completed":
      return `Task Completed: ${task.title}`;
    default:
      return `Task Notification: ${task.title}`;
  }
};

const getNotificationMessage = (type, task) => {
  switch (type) {
    case "task_assigned":
      return `You have been assigned a new ${task.priority} priority task: "${task.title}" in ${task.location}.`;
    case "task_updated":
      return `Task "${task.title}" has been updated. Current status: ${task.status}.`;
    case "task_completed":
      return `Task "${task.title}" has been marked as completed.`;
    default:
      return `Task "${task.title}" notification.`;
  }
};