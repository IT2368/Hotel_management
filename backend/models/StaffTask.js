// 📁 backend/models/StaffTask.js
import mongoose from "mongoose";

const staffTaskSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    department: {
      type: String,
      enum: ["maintenance", "kitchen", "service", "cleaning"],
      required: true,
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high", "urgent"],
      default: "medium",
    },
    status: {
      type: String,
      enum: ["pending", "process", "completed", "handoff_pending", "handoff_accepted"],
      default: "pending",
    },
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    assignedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    handoffTo: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // For task handoffs
    handoffFrom: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // Who handed off the task
    handoffDepartment: { type: String }, // Department to handoff to
    handoffReason: { type: String }, // Reason for handoff
    dueDate: { type: Date },
    completedAt: { type: Date },
    location: {
      type: String,
      enum: ["room", "kitchen", "lobby", "gym", "pool", "parking", "other"],
      required: true,
    },
    roomNumber: { type: String }, // For room-specific tasks
    category: {
      type: String,
      enum: [
        // Maintenance categories
        "electrical", "plumbing", "hvac", "appliance", "structural", "general",
        // Kitchen categories
        "food_preparation", "cooking", "cleaning", "inventory", "equipment",
        // Service categories
        "guest_request", "room_service", "concierge", "transportation", "event",
        // Cleaning categories
        "cleaning", "laundry", "restocking", "inspection", "deep_cleaning"
      ],
      required: true,
    },
    estimatedDuration: { type: Number }, // in minutes
    actualDuration: { type: Number }, // in minutes
    materials: [String], // List of required materials/tools
    notes: [{
      content: String,
      addedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      addedAt: { type: Date, default: Date.now },
    }],
    attachments: [{
      filename: String,
      url: String,
      uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      uploadedAt: { type: Date, default: Date.now },
    }],
    isUrgent: { type: Boolean, default: false },
    requiresApproval: { type: Boolean, default: false },
    approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    approvedAt: { type: Date },
    tags: [String], // For additional categorization
  },
  { timestamps: true }
);

// Indexes for better query performance
staffTaskSchema.index({ department: 1, status: 1 });
staffTaskSchema.index({ assignedTo: 1, status: 1 });
staffTaskSchema.index({ priority: 1, dueDate: 1 });
staffTaskSchema.index({ isUrgent: 1, status: 1 });

const StaffTask = mongoose.model("StaffTask", staffTaskSchema);
export default StaffTask; 