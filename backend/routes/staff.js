// 📁 backend/routes/staff.js
import express from "express";
import { authenticateToken } from "../middleware/auth.js";
import { authorizeRoles } from "../middleware/roleAuth.js";
import * as taskController from "../controllers/staff/taskController.js";
import * as notificationController from "../controllers/staff/notificationController.js";
import * as staffController from "../controllers/staff/staffController.js";
import * as scheduleController from "../controllers/staff/scheduleController.js";

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticateToken);
router.use(authorizeRoles(["staff", "manager", "admin"]));

// Task Management Routes
router.get("/tasks", taskController.getTasks);
router.get("/tasks/my", taskController.getMyTasks);
router.post("/tasks", taskController.createTask);
router.put("/tasks/:taskId", taskController.updateTask);
router.delete("/tasks/:taskId", taskController.deleteTask);
router.post("/tasks/:taskId/notes", taskController.addTaskNote);
router.post("/tasks/:taskId/accept-handoff", taskController.acceptHandoff);
router.get("/tasks/stats", taskController.getTaskStats);

// Notification Routes
router.get("/notifications", notificationController.getMyNotifications);
router.put("/notifications/:notificationId/read", notificationController.markNotificationAsRead);
router.put("/notifications/read-all", notificationController.markAllNotificationsAsRead);
router.put("/notifications/:notificationId/acknowledge", notificationController.acknowledgeNotification);
router.post("/notifications/announcement", notificationController.createAnnouncement);
router.get("/notifications/stats", notificationController.getNotificationStats);
router.delete("/notifications/:notificationId", notificationController.deleteNotification);
router.get("/notifications/urgent", notificationController.getUrgentAlerts);

// Staff Management Routes (for managers and admins)
router.get("/profile", staffController.getMyProfile);
router.put("/profile", staffController.updateMyProfile);
router.get("/colleagues", staffController.getColleagues);
router.get("/colleagues/:staffId", staffController.getColleagueProfile);

// Schedule Routes
router.get("/schedule", scheduleController.getMySchedule);
router.get("/schedule/week", scheduleController.getWeeklySchedule);
router.put("/schedule/availability", scheduleController.updateAvailability);

export default router;