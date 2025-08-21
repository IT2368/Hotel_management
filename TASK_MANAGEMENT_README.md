# 🏨 Valdor Hotel - Task Management System

## Overview
This system allows staff members to view and manage tasks assigned to them and their department. Each staff member can see tasks based on their department (maintenance, kitchen, service, or cleaning).

## 👥 Staff Members & Departments

### 1. **Maintenance Department**
- **Staff**: Mike Johnson (`maintenanceanoji@gmail.com`)
- **Password**: `maintenance123`
- **Tasks**: Equipment repair, plumbing, HVAC, electrical work

### 2. **Kitchen Department**
- **Staff**: Chef Maria Rodriguez (`chefanoji@gmail.com`)
- **Password**: `kitchen123`
- **Tasks**: Food preparation, cooking, kitchen operations

### 3. **Service Department**
- **Staff**: Sarah Wilson (`serviceanoji@gmail.com`)
- **Password**: `service123`
- **Tasks**: Guest services, concierge, transportation, room service

### 4. **Cleaning Department**
- **Staff**: Lisa Brown (`cleaninganoji@gmail.com`)
- **Password**: `cleaning123`
- **Tasks**: Room cleaning, laundry, restocking, deep cleaning

## 📋 Task Categories by Department

### Maintenance Tasks
- Electrical repairs
- Plumbing issues
- HVAC maintenance
- Appliance repairs
- Structural work
- General maintenance

### Kitchen Tasks
- Food preparation
- Cooking
- Kitchen cleaning
- Inventory management
- Equipment maintenance

### Service Tasks
- Guest requests
- Room service
- Concierge services
- Transportation
- Event coordination

### Cleaning Tasks
- Room cleaning
- Laundry services
- Restocking supplies
- Quality inspection
- Deep cleaning

## 🚀 Getting Started

### 1. Create Staff Members
```bash
node create-staff-members.js
```

### 2. Assign Tasks to Staff
```bash
node assign-tasks-to-staff.js
```

### 3. Start the Backend
```bash
cd backend
npm install
npm start
```

### 4. Start the Frontend
```bash
cd frontend
npm install
npm run dev
```

## 🔐 Login Instructions

1. Go to the login page
2. Use one of the staff email addresses above
3. Enter the corresponding password
4. You'll be redirected to the staff dashboard

## 📊 Dashboard Features

### Overview Tab
- **Total Tasks**: Shows all tasks in your department
- **Pending Tasks**: Tasks that need attention
- **Urgent Tasks**: High-priority tasks
- **Completed Tasks**: Finished tasks

### My Tasks Tab
- View only tasks assigned to you
- Update task status
- Add notes and comments
- Mark tasks as completed

### Department Tasks Tab
- View all tasks in your department
- See who is assigned to each task
- Monitor overall department workload

### Quick Actions
- **View My Tasks**: Jump to personal task list
- **View Department Tasks**: See all department tasks
- **Check Notifications**: View alerts and updates
- **View Schedule**: Check your work schedule

## 📝 Task Management

### Task Statuses
- **Pending**: Task is assigned but not started
- **Process**: Task is currently being worked on
- **Completed**: Task is finished
- **Handoff Pending**: Task needs to be transferred to another department
- **Handoff Accepted**: Task handoff has been accepted

### Task Priorities
- **Low**: Routine tasks, no urgency
- **Medium**: Normal priority tasks
- **High**: Important tasks requiring attention
- **Urgent**: Critical tasks needing immediate action

### Updating Tasks
1. Click on the task status dropdown
2. Select the new status
3. For handoffs, provide department and reason
4. Changes are saved automatically

## 🔄 Task Handoff Process

### When to Handoff
- Task requires expertise from another department
- Equipment or materials not available
- Task scope exceeds department capabilities

### Handoff Steps
1. Change task status to "Handoff Pending"
2. Select target department
3. Provide reason for handoff
4. Submit handoff request
5. Target department can accept or reject

## 📱 Mobile Responsiveness

The dashboard is fully responsive and works on:
- Desktop computers
- Tablets
- Mobile phones

## 🛠️ Technical Details

### Backend API Endpoints
- `GET /api/staff/tasks/my` - Get user's assigned tasks
- `GET /api/staff/tasks?department=X` - Get department tasks
- `PUT /api/staff/tasks/:id` - Update task status
- `POST /api/staff/tasks/:id/accept-handoff` - Accept task handoff

### Database Models
- **User**: Basic user information and authentication
- **StaffProfile**: Department, position, skills, contact info
- **StaffTask**: Task details, assignments, status tracking

## 🐛 Troubleshooting

### Common Issues
1. **Tasks not showing**: Check if tasks are properly assigned to staff
2. **Login fails**: Verify email/password and staff account exists
3. **API errors**: Check backend server is running
4. **Task updates not saving**: Verify authentication token is valid

### Support
If you encounter issues:
1. Check the browser console for error messages
2. Verify the backend server is running
3. Check MongoDB connection
4. Ensure all required environment variables are set

## 🎯 Best Practices

### For Staff Members
- Update task status regularly
- Add detailed notes when needed
- Use handoff feature appropriately
- Prioritize urgent tasks

### For Managers
- Monitor department workload
- Review task completion rates
- Identify bottlenecks in task flow
- Ensure proper task distribution

## 🔮 Future Enhancements

- Real-time notifications
- Task time tracking
- Performance analytics
- Mobile app
- Integration with hotel management system
- Automated task assignment
- Task templates and workflows

---

**Happy Task Managing! 🎉** 