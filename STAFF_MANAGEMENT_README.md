# Hotel Management System - Staff Management Module

## Overview

The Staff Management Module is a comprehensive system designed to handle all staff operations across four departments: **Maintenance**, **Kitchen**, **Service**, and **Cleaning**. The system provides a unified platform for task management, notifications, and department-specific workflows.

## Architecture

### Backend Structure

```
backend/
├── models/
│   ├── StaffTask.js              # Task management model
│   ├── StaffNotification.js      # Notification system model
│   └── profiles/
│       └── StaffProfile.js       # Enhanced staff profile model
├── controllers/staff/
│   ├── taskController.js         # Task CRUD operations
│   ├── notificationController.js # Notification management
│   ├── staffController.js        # Staff profile management
│   └── scheduleController.js     # Schedule management
└── routes/
    └── staff.js                  # Staff API routes
```

### Frontend Structure

```
frontend/src/
├── pages/staff/
│   └── StaffDashboardPage.jsx    # Main staff dashboard
├── components/staff/
│   ├── TaskManager.jsx           # Task management component
│   └── NotificationCenter.jsx    # Notification system
└── services/
    └── staffService.js           # API service layer
```

## Features

### 1. Unified Task Management System

**Key Features:**
- **Department-specific task categories** for each staff type
- **Priority levels**: Low, Medium, High, Urgent
- **Status tracking**: Pending, Assigned, In Progress, Completed, Cancelled
- **Location-based tasks**: Room, Kitchen, Lobby, Gym, Pool, Parking, Other
- **Time tracking**: Estimated and actual duration
- **Material requirements**: Tools and supplies needed
- **Notes and attachments**: Rich task documentation

**Department Categories:**

#### Maintenance Staff
- Electrical repairs
- Plumbing issues
- HVAC maintenance
- Appliance repairs
- Structural work
- General maintenance

#### Kitchen Staff
- Food preparation
- Cooking tasks
- Kitchen cleaning
- Inventory management
- Equipment maintenance

#### Service Staff
- Guest requests
- Room service
- Concierge services
- Transportation
- Event coordination

#### Housekeeping Staff
- Room cleaning
- Laundry operations
- Supply restocking
- Quality inspections
- Deep cleaning tasks

### 2. Comprehensive Notification System

**Notification Types:**
- **Task Assigned**: New task notifications
- **Task Updated**: Status change notifications
- **Task Completed**: Completion confirmations
- **Urgent Alerts**: Critical system alerts
- **System Announcements**: General communications
- **Reminders**: Time-sensitive notifications

**Features:**
- **Priority-based filtering**: Urgent, High, Medium, Low
- **Read/Unread status**: Track notification engagement
- **Action required flags**: Highlight actionable items
- **Department-specific targeting**: Send to specific departments (Maintenance, Kitchen, Service, Cleaning)
- **Real-time updates**: Instant notification delivery

### 3. Department-Specific Dashboards

Each department has a customized dashboard with:
- **Department-specific metrics** and KPIs
- **Relevant task categories** and filters
- **Department-specific quick actions**
- **Colleague management** within the department
- **Performance tracking** and reporting

### 4. Enhanced Staff Profiles

**Profile Features:**
- **Department-specific fields** for each staff type
- **Skills and certifications** tracking
- **Performance metrics** and ratings
- **Availability management**
- **Emergency contact information**
- **Shift preferences** and scheduling

**Department-Specific Data:**

#### Maintenance Staff
- Specialties (electrical, plumbing, HVAC)
- Tools and equipment assigned
- Vehicle assignments
- Safety certifications

#### Kitchen Staff
- Culinary specialties
- Food safety certifications
- Allergen awareness
- Kitchen station assignments

#### Service Staff
- Language proficiencies
- Service area expertise
- Customer service ratings
- Uniform sizing

#### Housekeeping Staff
- Cleaning specialties
- Floor assignments
- Supply management
- Inspection certifications

## API Endpoints

### Task Management

```
GET    /staff/tasks              # Get all tasks with filtering
GET    /staff/tasks/my           # Get current user's tasks
POST   /staff/tasks              # Create new task
PUT    /staff/tasks/:id          # Update task
DELETE /staff/tasks/:id          # Delete task
POST   /staff/tasks/:id/notes    # Add note to task
GET    /staff/tasks/stats        # Get task statistics
```

### Notification Management

```
GET    /staff/notifications              # Get user notifications
PUT    /staff/notifications/:id/read     # Mark as read
PUT    /staff/notifications/read-all     # Mark all as read
PUT    /staff/notifications/:id/acknowledge # Acknowledge notification
POST   /staff/notifications/announcement # Create announcement
GET    /staff/notifications/stats        # Get notification stats
DELETE /staff/notifications/:id          # Delete notification
GET    /staff/notifications/urgent       # Get urgent alerts
```

### Staff Profile Management

```
GET    /staff/profile            # Get current user's profile
PUT    /staff/profile            # Update profile
GET    /staff/colleagues         # Get colleagues
GET    /staff/colleagues/:id     # Get specific colleague
```

### Schedule Management

```
GET    /staff/schedule           # Get current schedule
GET    /staff/schedule/week      # Get weekly schedule
PUT    /staff/schedule/availability # Update availability
```

## Database Schema

### StaffTask Model

```javascript
{
  title: String,                    // Task title
  description: String,              // Task description
  department: String,               // maintenance|kitchen|service|housekeeping
  priority: String,                 // low|medium|high|urgent
  status: String,                   // pending|assigned|in_progress|completed|cancelled
  assignedTo: ObjectId,             // Assigned staff member
  assignedBy: ObjectId,             // Task creator
  dueDate: Date,                    // Due date
  completedAt: Date,                // Completion timestamp
  location: String,                 // Task location
  roomNumber: String,               // Room number if applicable
  category: String,                 // Department-specific category
  estimatedDuration: Number,        // Estimated time in minutes
  actualDuration: Number,           // Actual time taken
  materials: [String],              // Required materials/tools
  notes: [{                         // Task notes
    content: String,
    addedBy: ObjectId,
    addedAt: Date
  }],
  attachments: [{                   // File attachments
    filename: String,
    url: String,
    uploadedBy: ObjectId,
    uploadedAt: Date
  }],
  isUrgent: Boolean,                // Urgent flag
  requiresApproval: Boolean,        // Approval required
  approvedBy: ObjectId,             // Approver
  approvedAt: Date,                 // Approval timestamp
  tags: [String]                    // Additional tags
}
```

### StaffNotification Model

```javascript
{
  title: String,                    // Notification title
  message: String,                  // Notification message
  type: String,                     // Notification type
  priority: String,                 // Priority level
  department: String,               // Target department
  recipients: [{                    // Recipients list
    userId: ObjectId,
    readAt: Date,
    acknowledgedAt: Date
  }],
  sender: ObjectId,                 // Sender
  relatedTask: ObjectId,            // Related task
  relatedRoom: String,              // Related room
  actionRequired: Boolean,          // Action required flag
  actionUrl: String,                // Action URL
  expiresAt: Date,                  // Expiration date
  isActive: Boolean,                // Active status
  metadata: {                       // Additional data
    taskId: String,
    roomNumber: String,
    guestName: String,
    estimatedTime: String,
    location: String
  }
}
```

## Usage Examples

### Creating a Task

```javascript
// Create a maintenance task
const taskData = {
  title: "Fix AC in Room 205",
  description: "Guest reported AC not working properly",
  department: "maintenance",
  priority: "high",
  category: "hvac",
  location: "room",
  roomNumber: "205",
  estimatedDuration: 45,
  materials: ["multimeter", "refrigerant", "tools"],
  isUrgent: false
};

const response = await staffService.createTask(taskData);
```

### Sending a Notification

```javascript
// Create an urgent alert
const notificationData = {
  title: "Kitchen Equipment Failure",
  message: "Main oven in kitchen A has malfunctioned",
  type: "urgent_alert",
  priority: "urgent",
  department: "kitchen",
  actionRequired: true
};

const response = await staffService.createAnnouncement(notificationData);
```

### Filtering Tasks

```javascript
// Get high priority maintenance tasks
const params = {
  department: "maintenance",
  priority: "high",
  status: "pending",
  page: 1,
  limit: 20
};

const response = await staffService.getTasks(params);
```

## Security Features

- **Role-based access control**: Different permissions for staff, managers, and admins
- **Department isolation**: Staff can only access their department's data
- **Authentication middleware**: All routes protected
- **Input validation**: Comprehensive data validation
- **Audit trails**: Track all task and notification activities

## Performance Optimizations

- **Database indexing**: Optimized queries for task and notification filtering
- **Pagination**: Efficient data loading for large datasets
- **Caching**: Redis integration for frequently accessed data
- **Real-time updates**: WebSocket support for live notifications

## Future Enhancements

1. **Mobile App Support**: Native mobile applications for staff
2. **Voice Commands**: Voice-activated task creation and updates
3. **AI Integration**: Smart task assignment and optimization
4. **Advanced Analytics**: Predictive maintenance and performance insights
5. **Integration APIs**: Third-party system integrations
6. **Multi-language Support**: Internationalization for global hotels

## Getting Started

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Set up Environment Variables**:
   ```env
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   REDIS_URL=your_redis_connection_string
   ```

3. **Run Database Migrations**:
   ```bash
   npm run migrate
   ```

4. **Start the Application**:
   ```bash
   # Backend
   npm run dev:backend
   
   # Frontend
   npm run dev:frontend
   ```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details. 