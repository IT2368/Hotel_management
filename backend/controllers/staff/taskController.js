// 📁 backend/controllers/staff/taskController.js
import StaffTask from "../../models/StaffTask.js";
import StaffNotification from "../../models/StaffNotification.js";
import StaffProfile from "../../models/profiles/StaffProfile.js";
import { User } from "../../models/User.js";
import { formatResponse } from "../../utils/responseFormatter.js";
import logger from "../../utils/logger.js";
import NotificationService from "../../services/notification/notificationService.js";

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

// Assign existing DB tasks to staff fairly by department (round-robin)
export const assignExistingTasks = async (req, res) => {
  try {
    const {
      departments, // optional array of dept keys e.g., ["maintenance","kitchen"]
      onlyUnassigned = true, // only tasks without assignedTo
      overwriteAssignments = false, // reassign even if assignedTo exists
      statuses = ["pending"], // statuses to consider
      notify = true, // send notifications to assigned staff
      sortBy = "dueDate" // dueDate or createdAt
    } = req.body || {};

    // Build staff per-department map
    const staffQuery = { isActive: true };
    if (Array.isArray(departments) && departments.length > 0) {
      staffQuery.department = { $in: departments };
    }
    const staffProfiles = await StaffProfile.find(staffQuery).select("userId department");
    const deptToStaff = staffProfiles.reduce((acc, sp) => {
      if (!acc[sp.department]) acc[sp.department] = [];
      acc[sp.department].push(sp.userId);
      return acc;
    }, {});

    if (Object.keys(deptToStaff).length === 0) {
      return res
        .status(400)
        .json(
          formatResponse(false, "No active staff found for the provided departments")
        );
    }

    // Build task query
    const taskQuery = { status: { $in: statuses } };
    const departmentsToUse = Array.isArray(departments) && departments.length > 0
      ? departments
      : Object.keys(deptToStaff);
    taskQuery.department = { $in: departmentsToUse };
    if (onlyUnassigned && !overwriteAssignments) {
      taskQuery.$or = [{ assignedTo: { $exists: false } }, { assignedTo: null }];
    }

    const sort = sortBy === "dueDate" ? { dueDate: 1, createdAt: 1 } : { createdAt: 1 };
    const tasks = await StaffTask.find(taskQuery).sort(sort);

    if (tasks.length === 0) {
      return res.json(
        formatResponse(true, "No matching tasks found to assign", { assigned: 0 })
      );
    }

    // Prepare round-robin indices per department
    const rrIndex = {};
    Object.keys(deptToStaff).forEach((dept) => (rrIndex[dept] = 0));

    let assignedCount = 0;
    const assignments = [];

    for (const task of tasks) {
      const dept = task.department;
      const staffList = deptToStaff[dept] || [];
      if (staffList.length === 0) continue; // no staff in that dept

      // Skip if already assigned and we don't overwrite
      if (task.assignedTo && !overwriteAssignments) continue;

      // Round-robin pick
      const index = rrIndex[dept] % staffList.length;
      const staffUserId = staffList[index];
      rrIndex[dept]++;

      // Assign
      task.assignedTo = staffUserId;
      if (!task.assignedBy) task.assignedBy = req.user._id; // default assigner
      await task.save();

      assignments.push({ taskId: task._id, department: dept, assignedTo: staffUserId });
      assignedCount++;

      if (notify) {
        await createTaskNotification(task, "task_assigned");
      }
    }

    res.json(
      formatResponse(true, "Tasks assigned successfully", {
        assigned: assignedCount,
        totalConsidered: tasks.length,
        departments: departmentsToUse,
        assignments,
      })
    );
  } catch (error) {
    logger.error("Error assigning existing tasks:", error);
    res
      .status(500)
      .json(
        formatResponse(false, "Failed to assign existing tasks", null, error.message)
      );
  }
};

// Get tasks for specific staff member
export const getMyTasks = async (req, res) => {
  try {
    const userId = req.user._id;
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
      assignedBy: req.user._id,
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
    const updateData = { ...req.body };

    // Normalize status casing from clients (e.g., "Completed" -> "completed")
    if (typeof updateData.status === "string") {
      const normalized = updateData.status.trim().toLowerCase();
      const allowed = [
        "pending",
        "process",
        "completed",
        "handoff_pending",
        "handoff_accepted",
      ];
      if (allowed.includes(normalized)) {
        updateData.status = normalized;
      }
    }

    const task = await StaffTask.findById(taskId);
    if (!task) {
      return res.status(404).json(formatResponse(false, "Task not found"));
    }

    // Check if status is being updated
    const statusChanged = updateData.status && updateData.status !== task.status;
    const wasCompleted = task.status === "completed";
    const willBeCompleted = updateData.status === "completed";
    const isHandoff = updateData.status === "handoff_pending";

    // Update task
    Object.assign(task, updateData);
    
    // Set completion time if task is being completed
    if (willBeCompleted && !wasCompleted) {
      task.completedAt = new Date();
      task.actualDuration = task.actualDuration || 
        Math.round((task.completedAt - task.createdAt) / (1000 * 60)); // minutes
    }

    // Handle handoff logic
    if (isHandoff && updateData.handoffDepartment) {
      task.handoffDepartment = updateData.handoffDepartment;
      task.handoffReason = updateData.handoffReason || "Task ready for next department";
      task.handoffFrom = req.user._id;
      
      // Create notification for handoff
      await createTaskNotification(task, "task_handoff");
    }

    await task.save();

    // Create notifications for status changes
    if (statusChanged) {
      await createTaskNotification(task, "task_updated");
    }

    // If task has just been completed, notify manager(s)
    if (willBeCompleted && !wasCompleted) {
      try {
        // Re-fetch populated task details for richer notification content
        const populatedForNotify = await StaffTask.findById(task._id)
          .populate("assignedTo", "name email role")
          .populate("assignedBy", "name email role");

        // Determine manager recipients
        let managerIds = [];
        if (populatedForNotify?.assignedBy) {
          const assigner = populatedForNotify.assignedBy;
          if (assigner.role === "manager") {
            managerIds = [assigner._id];
          }
        }

        if (managerIds.length === 0) {
          const managers = await User.find({ role: "manager", isApproved: true }).select("_id");
          managerIds = managers.map((m) => m._id);
        }

        // Build notification message
        const title = `Task Completed: ${populatedForNotify.title}`;
        const completedBy = populatedForNotify.assignedTo?.name || "Staff Member";
        const message = `"${populatedForNotify.title}" has been marked as completed by ${completedBy}.`;

        // Send notifications to managers (in-app)
        await Promise.all(
          managerIds.map((managerId) =>
            NotificationService.sendNotification({
              userId: managerId,
              userType: "manager",
              type: "staff_alert", // Using existing manager-friendly type
              title,
              message,
              channel: "inApp",
              priority: populatedForNotify.isUrgent ? "high" : "medium",
              metadata: {
                taskId: populatedForNotify._id.toString(),
                department: populatedForNotify.department,
                location: populatedForNotify.location,
                roomNumber: populatedForNotify.roomNumber,
                completedAt: new Date().toISOString(),
              },
              actionUrl: `/staff/tasks/${populatedForNotify._id}`,
            })
          )
        );

        // Also create a staff notification of type task_completed for historical record
        await createTaskNotification(task, "task_completed");
      } catch (notifyErr) {
        logger.error("Error sending manager completion notification:", notifyErr);
      }
    }

    const updatedTask = await StaffTask.findById(taskId)
      .populate("assignedTo", "name email")
      .populate("assignedBy", "name email")
      .populate("handoffTo", "name email")
      .populate("handoffFrom", "name email");

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
      addedBy: req.user._id
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

// Get public staff updates for guests
export const getPublicStaffUpdates = async (req, res) => {
  try {
    const { department, roomNumber, limit = 20 } = req.query;
    const filter = {};

    // Apply filters
    if (department) filter.department = department;
    if (roomNumber) filter.roomNumber = roomNumber;

    // Show tasks that are in process, completed, or handoff pending
    filter.status = { $in: ["process", "completed", "handoff_pending"] };

    const tasks = await StaffTask.find(filter)
      .populate("assignedTo", "name")
      .populate("assignedBy", "name")
      .populate("handoffFrom", "name")
      .sort({ updatedAt: -1 })
      .limit(parseInt(limit))
      .select("title description status department roomNumber location category updatedAt completedAt assignedTo handoffDepartment handoffReason handoffFrom");

    // Format the response for public viewing
    const publicUpdates = tasks.map(task => ({
      id: task._id,
      title: task.title,
      description: task.description,
      status: task.status,
      department: task.department,
      roomNumber: task.roomNumber,
      location: task.location,
      category: task.category,
      assignedTo: task.assignedTo?.name || "Staff Member",
      updatedAt: task.updatedAt,
      completedAt: task.completedAt,
      isCompleted: task.status === "completed",
      handoffDepartment: task.handoffDepartment,
      handoffReason: task.handoffReason,
      handoffFrom: task.handoffFrom?.name
    }));

    res.json(formatResponse(true, "Public staff updates retrieved successfully", {
      updates: publicUpdates,
      total: publicUpdates.length
    }));
  } catch (error) {
    logger.error("Error getting public staff updates:", error);
    res.status(500).json(formatResponse(false, "Failed to get public staff updates", null, error.message));
  }
};

// Accept task handoff
export const acceptHandoff = async (req, res) => {
  try {
    const { taskId } = req.params;
    const userId = req.user._id;

    const task = await StaffTask.findById(taskId);
    if (!task) {
      return res.status(404).json(formatResponse(false, "Task not found"));
    }

    if (task.status !== "handoff_pending") {
      return res.status(400).json(formatResponse(false, "Task is not pending handoff"));
    }

    // Update task to accepted handoff
    task.status = "handoff_accepted";
    task.assignedTo = userId;
    task.department = task.handoffDepartment;
    task.handoffTo = userId;

    await task.save();

    // Create notification for handoff acceptance
    await createTaskNotification(task, "handoff_accepted");

    const updatedTask = await StaffTask.findById(taskId)
      .populate("assignedTo", "name email")
      .populate("assignedBy", "name email")
      .populate("handoffTo", "name email")
      .populate("handoffFrom", "name email");

    res.json(formatResponse(true, "Handoff accepted successfully", updatedTask));
  } catch (error) {
    logger.error("Error accepting handoff:", error);
    res.status(500).json(formatResponse(false, "Failed to accept handoff", null, error.message));
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
    case "task_handoff":
      return `Task "${task.title}" has been handed off to ${task.handoffDepartment} department`;
    case "handoff_accepted":
      return `You have accepted the handoff for task: ${task.title}`;
    default:
      return `Task "${task.title}" notification.`;
  }
};