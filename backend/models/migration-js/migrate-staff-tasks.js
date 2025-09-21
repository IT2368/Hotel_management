// 📁 backend/models/migration-js/migrate-staff-tasks.js
import mongoose from "mongoose";
import { connectDB, closeDBConnection } from "../../config/database.js";
import StaffTask from "../../models/StaffTask.js";
import Room from "../../models/Room.js";

// Run as dry run by default; pass --apply to write changes
const APPLY_CHANGES = process.argv.includes("--apply");

const mapTypeToDepartment = (type, workflowDept) => {
  const t = (type || "").toLowerCase();
  const w = (workflowDept || "").toLowerCase();
  if (t.includes("clean")) return "cleaning";
  if (t.includes("maint")) return "maintenance";
  if (t.includes("kitchen")) return "kitchen";
  if (t.includes("service") || t.includes("concierge")) return "service";
  // Try workflow department (e.g., "Housekeeping" -> cleaning)
  if (w.includes("housekeep")) return "cleaning";
  if (w.includes("maint")) return "maintenance";
  if (w.includes("kitchen")) return "kitchen";
  if (w.includes("service")) return "service";
  return undefined; // leave undefined to avoid setting invalid enum
};

const normalizeStatus = (status) => {
  if (!status) return undefined;
  const s = String(status).toLowerCase();
  switch (s) {
    case "pending":
      return "pending";
    case "in progress":
    case "in_progress":
    case "process":
      return "process";
    case "completed":
    case "done":
      return "completed";
    default:
      return undefined; // let it be handled by defaults if unknown
  }
};

const normalizePriority = (priority) => {
  if (!priority) return undefined;
  const p = String(priority).toLowerCase();
  if (["low", "medium", "high", "urgent"].includes(p)) return p;
  if (p === "critical") return "urgent";
  return undefined;
};

const detectCategory = (type, description) => {
  // best-effort: map type words to existing enum values in StaffTask.category
  const t = (type || "").toLowerCase();
  const d = (description || "").toLowerCase();
  if (t.includes("clean") || d.includes("clean")) {
    if (d.includes("deep")) return "deep_cleaning";
    if (d.includes("laundry")) return "laundry";
    if (d.includes("inspect")) return "inspection";
    if (d.includes("restock")) return "restocking";
    return "cleaning";
  }
  if (t.includes("plumb") || d.includes("plumb")) return "plumbing";
  if (t.includes("electric") || d.includes("electric")) return "electrical";
  if (t.includes("hvac") || d.includes("ac") || d.includes("cool")) return "hvac";
  if (t.includes("kitchen") || d.includes("kitchen")) return "cleaning"; // kitchen cleaning default
  if (t.includes("service") || d.includes("service")) return "guest_request";
  return "general"; // default valid category
};

async function resolveRoomNumber(roomId) {
  if (!roomId) return { roomNumber: undefined, location: "other" };
  try {
    const room = await Room.findById(roomId).select("roomNumber");
    if (room) return { roomNumber: room.roomNumber, location: "room" };
  } catch (e) {
    // ignore lookup errors; will fall back to other
  }
  return { roomNumber: undefined, location: "other" };
}

async function migrateStaffTasks() {
  await connectDB();

  // Select candidate documents that look like legacy
  const legacyQuery = {
    $or: [
      { workflow: { $exists: true } },
      { type: { $exists: true } },
      { dueAt: { $exists: true } },
      { createdBy: { $exists: true } },
    ],
  };

  const cursor = StaffTask.collection.find(legacyQuery, { batchSize: 100 });

  let examined = 0;
  let modified = 0;
  const updates = [];

  while (await cursor.hasNext()) {
    const doc = await cursor.next();
    examined++;

    // Compute updates according to current schema
    const department =
      doc.department || mapTypeToDepartment(doc.type, doc.workflow?.[0]?.department);

    const status = normalizeStatus(doc.status) || doc.status || undefined;
    const priority = normalizePriority(doc.priority) || doc.priority || undefined;

    const { roomNumber, location } = await resolveRoomNumber(doc.room);

    const update = { $set: {}, $unset: {} };

    if (department) update.$set.department = department;
    if (!doc.location && location) update.$set.location = location;
    if (roomNumber) update.$set.roomNumber = roomNumber;

    if (status) update.$set.status = status;
    if (priority) update.$set.priority = priority;

    if (!doc.category) update.$set.category = detectCategory(doc.type, doc.description);

    // Map assigned fields
    const assignee = doc.workflow?.[0]?.assignee; // ObjectId
    if (!doc.assignedTo && assignee) update.$set.assignedTo = assignee;
    if (!doc.assignedBy && doc.createdBy) update.$set.assignedBy = doc.createdBy;

    // Dates
    if (!doc.dueDate && doc.dueAt) update.$set.dueDate = new Date(doc.dueAt);

    // Flags
    if (typeof doc.isUrgent === "undefined" && priority === "urgent") {
      update.$set.isUrgent = true;
    }

    // Clean legacy-only fields
    if (doc.room) update.$unset.room = 1;
    if (typeof doc.type !== "undefined") update.$unset.type = 1;
    if (typeof doc.workflow !== "undefined") update.$unset.workflow = 1;
    if (typeof doc.currentStepIndex !== "undefined") update.$unset.currentStepIndex = 1;
    if (typeof doc.dueAt !== "undefined") update.$unset.dueAt = 1;
    if (typeof doc.createdBy !== "undefined") update.$unset.createdBy = 1; // mapped to assignedBy

    // Remove empty operators
    if (Object.keys(update.$set).length === 0) delete update.$set;
    if (Object.keys(update.$unset).length === 0) delete update.$unset;

    if (update.$set || update.$unset) {
      modified++;
      updates.push({ _id: doc._id, update });

      if (APPLY_CHANGES) {
        await StaffTask.updateOne({ _id: doc._id }, update);
      }
    }
  }

  console.log(`Examined ${examined} StaffTask documents.`);
  console.log(`${modified} documents would be updated${APPLY_CHANGES ? " (applied)" : " (dry run)"}.`);

  // Validate a few transformed docs for visibility
  if (updates.length > 0) {
    console.log("Sample updates (first 3):");
    updates.slice(0, 3).forEach((u, idx) => {
      console.log(`#${idx + 1}`, {
        id: u._id.toString(),
        set: u.update.$set || {},
        unset: Object.keys(u.update.$unset || {}),
      });
    });
  }

  await closeDBConnection();
}

migrateStaffTasks()
  .then(() => {
    const note = APPLY_CHANGES
      ? "Migration completed and changes applied."
      : "Dry run completed. Re-run with --apply to make changes.";
    console.log(note);
    return mongoose.disconnect();
  })
  .catch(async (err) => {
    console.error("Migration error:", err);
    try { await closeDBConnection(); } catch {}
    process.exit(1);
  });
