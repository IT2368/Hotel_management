// 📁 backend/models/profiles/StaffProfile.js
import mongoose from "mongoose";

const staffProfileSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", unique: true },
    department: {
      type: String,
      enum: ["maintenance", "kitchen", "service", "housekeeping"],
      required: true,
    },
    position: { type: String, required: true }, // e.g., "Senior Maintenance Technician", "Head Chef", "Concierge"
    shift: { 
      type: String, 
      enum: ["morning", "evening", "night", "flexible"],
      default: "morning"
    },
    shiftHours: {
      start: { type: String, default: "08:00" }, // 24-hour format
      end: { type: String, default: "16:00" },
    },
    assignedRooms: [{ type: mongoose.Schema.Types.ObjectId, ref: "Room" }],
    assignedAreas: [String], // e.g., ["Floor 1-3", "Kitchen A", "Pool Area"]
    skills: [String], // e.g., ["electrical", "plumbing", "cooking", "cleaning"]
    certifications: [{
      name: String,
      issuedBy: String,
      issuedDate: Date,
      expiryDate: Date,
      certificateNumber: String,
    }],
    emergencyContact: {
      name: String,
      relationship: String,
      phone: String,
      email: String,
    },
    performance: {
      rating: { type: Number, min: 1, max: 5, default: 3 },
      completedTasks: { type: Number, default: 0 },
      averageCompletionTime: { type: Number, default: 0 }, // in minutes
      lastReviewDate: Date,
    },
    availability: {
      isAvailable: { type: Boolean, default: true },
      unavailableUntil: Date,
      reason: String,
    },
    preferences: {
      preferredTasks: [String],
      preferredAreas: [String],
      maxTasksPerDay: { type: Number, default: 8 },
    },
    // Department-specific fields
    departmentSpecific: {
      // Maintenance specific
      maintenance: {
        specialties: [String], // ["electrical", "plumbing", "hvac"]
        tools: [String], // ["multimeter", "wrench_set", "drill"]
        vehicleAssigned: String,
      },
      // Kitchen specific
      kitchen: {
        specialties: [String], // ["pastry", "grill", "sauces"]
        foodSafetyCertified: { type: Boolean, default: false },
        allergens: [String], // ["nuts", "dairy", "gluten"]
        kitchenStation: String, // ["main_kitchen", "pastry", "room_service"]
      },
      // Service specific
      service: {
        languages: [String], // ["english", "spanish", "french"]
        serviceAreas: [String], // ["concierge", "room_service", "events"]
        uniformSize: String,
        customerServiceRating: { type: Number, min: 1, max: 5 },
      },
      // Housekeeping specific
      housekeeping: {
        cleaningSpecialties: [String], // ["deep_cleaning", "laundry", "restocking"]
        assignedFloor: String,
        cleaningSupplies: [String],
        inspectionCertified: { type: Boolean, default: false },
      },
    },
    isActive: { type: Boolean, default: true },
    lastActive: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// Indexes for better query performance
staffProfileSchema.index({ department: 1, isActive: 1 });
staffProfileSchema.index({ "availability.isAvailable": 1, department: 1 });
staffProfileSchema.index({ "performance.rating": -1 });

const StaffProfile = mongoose.model("StaffProfile", staffProfileSchema);
export default StaffProfile;
