export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  full_name: string;
  is_staff: boolean;
  is_active: boolean;
  profile_image: string | null;
  phone?: string;
  bio?: string;
  date_joined: string;
}

export interface Category {
  id: number;
  name: string;
  description: string;
  color: string;
  events_count?: number;
  created_at: string;
}

export interface EventItem {
  id: number;
  title: string;
  description: string;
  category: number;
  category_details: Category | null;
  date_time: string;
  location: string;
  capacity: number;
  banner: string | null;
  documents: string | null;
  status: 'upcoming' | 'completed' | 'cancelled';
  created_by: number;
  created_by_details?: User | null;
  registered_count: number;
  is_registered?: boolean;
  user_registration_status?: string | null;
  user_registration_id?: number | null;
  created_at: string;
  updated_at: string;
}

export interface Registration {
  id: number;
  user: number;
  user_details?: User | null;
  event: number;
  event_title: string;
  event_date: string;
  event_location: string;
  event_status: string;
  event_category: string;
  status: 'pending' | 'approved' | 'cancelled' | 'attended';
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface TaskItem {
  id: number;
  title: string;
  description: string;
  assigned_to: number;
  assigned_to_details?: User | null;
  event: number | null;
  event_details?: EventItem | null;
  deadline: string;
  status: 'pending' | 'in_progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
  is_overdue: boolean;
  created_at: string;
  updated_at: string;
}

export interface NotificationItem {
  id: number;
  user_id?: number;
  username?: string;
  type: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

export interface AdminStats {
  total_users: number;
  total_events: number;
  total_tasks: number;
  total_registrations: number;
}

export interface UserStats {
  total_registered_events: number;
  upcoming_events: number;
  pending_tasks: number;
  completed_tasks: number;
}

export interface DashboardResponse {
  is_admin: boolean;
  stats: AdminStats | UserStats;
  recent_activities?: NotificationItem[];
  recent_notifications?: NotificationItem[];
}

export interface EmailLog {
  id: string;
  to: string;
  subject: string;
  body: string;
  timestamp: string;
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}
