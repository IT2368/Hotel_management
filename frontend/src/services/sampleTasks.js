// src/services/sampleTasks.js

// Normalize department from role/position/typos to canonical set
export function normalizeDepartment(deptOrRole = "") {
  const key = String(deptOrRole || "").toLowerCase().trim();
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

// Generate department-specific sample tasks
export function generateSampleTasks(department, user) {
  const dept = normalizeDepartment(department);
  const baseId = Date.now();

  const taskTemplates = {
    maintenance: [
      {
        title: "Fix AC in Room 205",
        description:
          "Guest reported AC not working properly. Need to check and repair the cooling system.",
        category: "hvac",
        priority: "high",
        status: "pending",
        location: "room",
        roomNumber: "205",
        estimatedDuration: 45,
        isUrgent: false,
      },
      {
        title: "Replace light bulbs in lobby",
        description: "Several light bulbs in the main lobby area need replacement.",
        category: "electrical",
        priority: "medium",
        status: "process",
        location: "lobby",
        estimatedDuration: 30,
        isUrgent: false,
      },
      {
        title: "Fix leaking faucet in Room 312",
        description:
          "Guest reported a leaking bathroom faucet that needs immediate attention.",
        category: "plumbing",
        priority: "urgent",
        status: "pending",
        location: "room",
        roomNumber: "312",
        estimatedDuration: 60,
        isUrgent: true,
      },
      {
        title: "Elevator maintenance check",
        description: "Monthly elevator safety and maintenance inspection.",
        category: "general",
        priority: "medium",
        status: "completed",
        location: "other",
        estimatedDuration: 90,
        isUrgent: false,
      },
      {
        title: "Pool filtration system repair",
        description:
          "Pool filtration system showing error codes, needs diagnostic and repair.",
        category: "general",
        priority: "high",
        status: "pending",
        location: "pool",
        estimatedDuration: 120,
        isUrgent: false,
      },
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
        isUrgent: false,
      },
      {
        title: "Clean and sanitize prep area",
        description: "Deep clean and sanitize all food preparation surfaces and equipment.",
        category: "cleaning",
        priority: "medium",
        status: "process",
        location: "kitchen",
        estimatedDuration: 45,
        isUrgent: false,
      },
      {
        title: "Inventory check - dairy products",
        description: "Check expiration dates and stock levels for all dairy products.",
        category: "inventory",
        priority: "medium",
        status: "pending",
        location: "kitchen",
        estimatedDuration: 30,
        isUrgent: false,
      },
      {
        title: "Fix commercial oven temperature",
        description: "Oven not reaching proper temperature, affecting cooking times.",
        category: "equipment",
        priority: "urgent",
        status: "pending",
        location: "kitchen",
        estimatedDuration: 90,
        isUrgent: true,
      },
      {
        title: "Prepare special dietary meals",
        description:
          "Prepare gluten-free and vegan options for guests with dietary restrictions.",
        category: "cooking",
        priority: "high",
        status: "process",
        location: "kitchen",
        estimatedDuration: 75,
        isUrgent: false,
      },
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
        isUrgent: false,
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
        isUrgent: false,
      },
      {
        title: "Handle guest complaint",
        description:
          "Guest complaint about noise levels, needs immediate attention and resolution.",
        category: "guest_request",
        priority: "urgent",
        status: "pending",
        location: "room",
        roomNumber: "203",
        estimatedDuration: 30,
        isUrgent: true,
      },
      {
        title: "Concierge tour booking",
        description: "Arrange city tour bookings for group of 8 guests.",
        category: "concierge",
        priority: "medium",
        status: "completed",
        location: "lobby",
        estimatedDuration: 25,
        isUrgent: false,
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
        isUrgent: false,
      },
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
        isUrgent: false,
      },
      {
        title: "Laundry - bed linens",
        description: "Process and clean bed linens from checkout rooms.",
        category: "laundry",
        priority: "medium",
        status: "process",
        location: "other",
        estimatedDuration: 120,
        isUrgent: false,
      },
      {
        title: "Restock housekeeping supplies",
        description: "Restock cleaning supplies and amenities on floors 2 and 3.",
        category: "restocking",
        priority: "medium",
        status: "completed",
        location: "other",
        estimatedDuration: 45,
        isUrgent: false,
      },
      {
        title: "Emergency spill cleanup",
        description:
          "Large spill in main corridor needs immediate cleanup and safety measures.",
        category: "cleaning",
        priority: "urgent",
        status: "pending",
        location: "other",
        estimatedDuration: 20,
        isUrgent: true,
      },
      {
        title: "Gym equipment sanitization",
        description: "Daily sanitization of all gym equipment and surfaces.",
        category: "cleaning",
        priority: "high",
        status: "process",
        location: "gym",
        estimatedDuration: 60,
        isUrgent: false,
      },
    ],
  };

  const templates = taskTemplates[dept] || taskTemplates.service;

  return templates.map((template, index) => ({
    ...template,
    _id: `${baseId + index}`,
    assignedTo: {
      id: user?.id || "user1",
      name: user?.name || "Current User",
    },
    createdAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
  }));
}
