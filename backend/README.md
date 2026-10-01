# Event & Task Management System - Backend (Django + DRF)

A robust backend REST API built with **Django 5**, **Django REST Framework (DRF)**, **SimpleJWT**, and **PostgreSQL** (with SQLite fallback for local development).

## Architecture & Directory Structure
```
backend/
├── apps/
│   ├── users/                 # Custom User model (is_staff role), JWT Auth, Profile, CRUD
│   │   ├── models.py
│   │   ├── serializers.py
│   │   ├── views.py
│   │   ├── permissions.py
│   │   └── urls.py
│   ├── events/                # Category, Event, and Registration models, signals & views
│   │   ├── models.py
│   │   ├── serializers.py
│   │   ├── views.py
│   │   ├── permissions.py
│   │   ├── signals.py         # Automated notifications and email dispatches
│   │   └── urls.py
│   ├── tasks/                 # Task model, assignment, status transition, signals
│   │   ├── models.py
│   │   ├── serializers.py
│   │   ├── views.py
│   │   ├── permissions.py
│   │   ├── signals.py
│   │   └── urls.py
│   └── notifications/         # Notification log, unread counters, mark-as-read
│       ├── models.py
│       ├── serializers.py
│       ├── views.py
│       └── urls.py
├── event_task_system/         # Main Django project configuration
│   ├── settings.py
│   ├── urls.py
│   ├── wsgi.py
│   └── asgi.py
├── manage.py
├── requirements.txt
└── seed_data.py
```

## API Endpoints List

### 1. Authentication (`/api/auth/`)
- `POST /api/auth/register/` - Register account (`is_staff=False` by default)
- `POST /api/auth/login/` - Validate credentials, return JWT `access` & `refresh` tokens + user role
- `POST /api/auth/token/refresh/` - Refresh expired access token
- `GET /api/auth/profile/` - Current authenticated user profile
- `PATCH /api/auth/profile/` - Update profile details & profile image
- `POST /api/auth/change-password/` - Update password with old password verification
- `POST /api/auth/forgot-password/` - Request password reset link / instructions

### 2. Users Management (Admin Only) (`/api/auth/users/`)
- `GET /api/auth/users/` - List users (search by username/email, filter by `is_staff`, `is_active`)
- `POST /api/auth/users/` - Create a new user with designated role
- `GET /api/auth/users/:id/` - View user details
- `PATCH /api/auth/users/:id/` - Update user information / role
- `DELETE /api/auth/users/:id/` - Delete user account

### 3. Categories (`/api/categories/`)
- `GET /api/categories/` - List event categories
- `POST /api/categories/` - Create category (Admin)
- `PUT/PATCH /api/categories/:id/` - Update category (Admin)
- `DELETE /api/categories/:id/` - Delete category (Admin)

### 4. Events (`/api/events/`)
- `GET /api/events/` - List events (search, filter by category, status, date)
- `POST /api/events/` - Create event with banner and documents (Admin)
- `GET /api/events/:id/` - Event details + registration status for current user
- `PUT/PATCH /api/events/:id/` - Update event (Admin)
- `DELETE /api/events/:id/` - Delete event (Admin)
- `POST /api/events/:id/register/` - Register authenticated user for the event

### 5. Registrations (`/api/registrations/`)
- `GET /api/registrations/` - List registrations (Admin sees all; Users see their own; filter by event & status)
- `POST /api/registrations/` - Register for event
- `PATCH /api/registrations/:id/` - Admin updates status (approved, pending, attended, cancelled)
- `POST /api/registrations/:id/cancel/` - Cancel user registration

### 6. Tasks (`/api/tasks/`)
- `GET /api/tasks/` - List tasks (Admin sees all; User sees assigned tasks; filter by status, priority, event)
- `POST /api/tasks/` - Create task and assign to user (Admin)
- `GET /api/tasks/:id/` - Task details
- `PUT/PATCH /api/tasks/:id/` - Update task (Admin)
- `DELETE /api/tasks/:id/` - Delete task (Admin)
- `PATCH /api/tasks/:id/update_status/` - Update task status (`pending` -> `in_progress` -> `completed`)

### 7. Notifications (`/api/notifications/`)
- `GET /api/notifications/` - List notifications for current user (or `?all=true` for admin)
- `PATCH /api/notifications/:id/mark_as_read/` - Mark notification as read
- `POST /api/notifications/mark_all_read/` - Mark all notifications as read

### 8. Dashboard Statistics (`/api/dashboard/stats/`)
- `GET /api/dashboard/stats/` - Dynamic metrics:
  - Admin: Total Users, Total Events, Total Tasks, Registrations, Recent Activities
  - User: Total Registered Events, Upcoming Events, Pending Tasks, Completed Tasks, Recent Notifications

## Quick Setup Instructions

1. **Create and activate virtual environment**:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

2. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

3. **Run database migrations**:
   ```bash
   python manage.py makemigrations users events tasks notifications
   python manage.py migrate
   ```

4. **Seed initial demo data (1 Admin, 3 Users, Events, Tasks)**:
   ```bash
   python seed_data.py
   ```

5. **Run the development server**:
   ```bash
   python manage.py runserver 0.0.0.0:8000
   ```
