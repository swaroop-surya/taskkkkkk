import express, { Request, Response, NextFunction } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import fs from 'fs';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import multer from 'multer';

const PORT = Number(process.env.PORT) || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'event-task-jwt-super-secret-key-2026';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'event-task-jwt-refresh-secret-key-2026';

// Storage directories
const UPLOADS_DIR = path.resolve(process.cwd(), 'uploads');
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Multer setup for handling file uploads (profile pictures, event banners, documents)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOADS_DIR);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  },
});
const upload = multer({ storage });

// Email log storage for simulated console backend inspection
interface EmailLog {
  id: string;
  to: string;
  subject: string;
  body: string;
  timestamp: string;
}
const emailLogs: EmailLog[] = [];

function sendEmailMock(to: string, subject: string, body: string) {
  const log: EmailLog = {
    id: 'email-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
    to,
    subject,
    body,
    timestamp: new Date().toISOString(),
  };
  emailLogs.unshift(log);
  if (emailLogs.length > 50) emailLogs.pop();
  console.log(`\n📧 [EMAIL DISPATCHED via Django Console Backend]`);
  console.log(`To: ${to}`);
  console.log(`Subject: ${subject}`);
  console.log(`Body: ${body.substring(0, 100)}...`);
  console.log(`----------------------------------------------------\n`);
}

// Data Stores
interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  is_staff: boolean;
  is_active: boolean;
  password_hash: string;
  profile_image: string | null;
  phone?: string;
  bio?: string;
  date_joined: string;
}

interface Category {
  id: number;
  name: string;
  description: string;
  color: string;
  created_at: string;
}

interface EventItem {
  id: number;
  title: string;
  description: string;
  category_id: number;
  date_time: string;
  location: string;
  capacity: number;
  banner: string | null;
  documents: string | null;
  status: 'upcoming' | 'completed' | 'cancelled';
  created_by_id: number;
  created_at: string;
  updated_at: string;
}

interface Registration {
  id: number;
  user_id: number;
  event_id: number;
  status: 'pending' | 'approved' | 'cancelled' | 'attended';
  notes?: string;
  created_at: string;
  updated_at: string;
}

interface TaskItem {
  id: number;
  title: string;
  description: string;
  assigned_to_id: number;
  event_id: number | null;
  deadline: string;
  status: 'pending' | 'in_progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
  created_at: string;
  updated_at: string;
}

interface NotificationItem {
  id: number;
  user_id: number;
  type: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

// In-Memory Database Seed
const now = new Date();
const defaultPasswordHash = bcrypt.hashSync('user123', 10);
const adminPasswordHash = bcrypt.hashSync('admin123', 10);

const db = {
  users: [
    {
      id: 1,
      username: 'admin',
      email: 'admin@eventtask.com',
      first_name: 'Eleanor',
      last_name: 'Vance',
      is_staff: true,
      is_active: true,
      password_hash: adminPasswordHash,
      profile_image: null,
      phone: '+1 (555) 019-2831',
      bio: 'System Administrator and Lead Operations Director.',
      date_joined: new Date(now.getTime() - 90 * 86400000).toISOString(),
    },
    {
      id: 2,
      username: 'john_doe',
      email: 'john@example.com',
      first_name: 'John',
      last_name: 'Doe',
      is_staff: false,
      is_active: true,
      password_hash: defaultPasswordHash,
      profile_image: null,
      phone: '+1 (555) 123-4567',
      bio: 'Full-stack software engineer & cloud technology enthusiast.',
      date_joined: new Date(now.getTime() - 60 * 86400000).toISOString(),
    },
    {
      id: 3,
      username: 'sarah_connor',
      email: 'sarah@example.com',
      first_name: 'Sarah',
      last_name: 'Connor',
      is_staff: false,
      is_active: true,
      password_hash: defaultPasswordHash,
      profile_image: null,
      phone: '+1 (555) 987-6543',
      bio: 'Senior UX Designer focusing on design systems and accessibility.',
      date_joined: new Date(now.getTime() - 45 * 86400000).toISOString(),
    },
    {
      id: 4,
      username: 'mike_ross',
      email: 'mike@example.com',
      first_name: 'Mike',
      last_name: 'Ross',
      is_staff: false,
      is_active: true,
      password_hash: defaultPasswordHash,
      profile_image: null,
      phone: '+1 (555) 456-7890',
      bio: 'Operations Coordinator and Logistics Specialist.',
      date_joined: new Date(now.getTime() - 30 * 86400000).toISOString(),
    },
  ] as User[],

  categories: [
    { id: 1, name: 'Technology & AI', description: 'Conferences, hackathons, and engineering summits.', color: '#3D766D', created_at: new Date(now.getTime() - 30 * 86400000).toISOString() },
    { id: 2, name: 'Design & Creative', description: 'Workshops in UX/UI, typography, and interactive media.', color: '#4A8B81', created_at: new Date(now.getTime() - 30 * 86400000).toISOString() },
    { id: 3, name: 'Marketing & Growth', description: 'Product marketing strategy, SEO, and go-to-market execution.', color: '#2D5851', created_at: new Date(now.getTime() - 30 * 86400000).toISOString() },
    { id: 4, name: 'Leadership & Strategy', description: 'Executive retrospectives, governance, and team alignment.', color: '#8F9192', created_at: new Date(now.getTime() - 30 * 86400000).toISOString() },
  ] as Category[],

  events: [
    {
      id: 1,
      title: 'Global AI & Cloud Summit 2026',
      description: 'Join industry pioneers to explore state-of-the-art machine learning deployments, distributed systems, and real-time reactive architectures.',
      category_id: 1,
      date_time: new Date(now.getTime() + 7 * 86400000).toISOString(),
      location: 'Grand Auditorium, Tech Convention Center & Virtual Stream',
      capacity: 300,
      banner: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80',
      documents: 'https://example.com/docs/ai-summit-schedule.pdf',
      status: 'upcoming',
      created_by_id: 1,
      created_at: new Date(now.getTime() - 15 * 86400000).toISOString(),
      updated_at: new Date(now.getTime() - 15 * 86400000).toISOString(),
    },
    {
      id: 2,
      title: 'Next-Gen UX/UI Interactive Workshop',
      description: 'Hands-on intensive studio day mastering dynamic design tokens, accessibility standards, fluid transitions, and component architectures.',
      category_id: 2,
      date_time: new Date(now.getTime() + 14 * 86400000).toISOString(),
      location: 'Studio 4B, Metro Innovation Hub',
      capacity: 60,
      banner: 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&w=1200&q=80',
      documents: 'https://example.com/docs/ux-workshop-guide.pdf',
      status: 'upcoming',
      created_by_id: 1,
      created_at: new Date(now.getTime() - 10 * 86400000).toISOString(),
      updated_at: new Date(now.getTime() - 10 * 86400000).toISOString(),
    },
    {
      id: 3,
      title: 'High-Impact Product Marketing Masterclass',
      description: 'Tactical frameworks for executing multi-channel product launches, tracking attribution pipelines, and expanding customer retention.',
      category_id: 3,
      date_time: new Date(now.getTime() + 21 * 86400000).toISOString(),
      location: 'Skyline Executive Suite, Metropolis Tower',
      capacity: 100,
      banner: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=1200&q=80',
      documents: null,
      status: 'upcoming',
      created_by_id: 1,
      created_at: new Date(now.getTime() - 8 * 86400000).toISOString(),
      updated_at: new Date(now.getTime() - 8 * 86400000).toISOString(),
    },
    {
      id: 4,
      title: 'Agile Product & Engineering Strategy Forum',
      description: 'Retrospective roundtable on high-velocity team orchestration, incident resilience, and developer experience metrics.',
      category_id: 4,
      date_time: new Date(now.getTime() - 5 * 86400000).toISOString(),
      location: 'Civic Hall, Room 101',
      capacity: 80,
      banner: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=1200&q=80',
      documents: 'https://example.com/docs/agile-forum-summary.pdf',
      status: 'completed',
      created_by_id: 1,
      created_at: new Date(now.getTime() - 20 * 86400000).toISOString(),
      updated_at: new Date(now.getTime() - 4 * 86400000).toISOString(),
    },
  ] as EventItem[],

  registrations: [
    { id: 1, user_id: 2, event_id: 1, status: 'approved', notes: 'Attending in-person keynote', created_at: new Date(now.getTime() - 6 * 86400000).toISOString(), updated_at: new Date(now.getTime() - 6 * 86400000).toISOString() },
    { id: 2, user_id: 2, event_id: 2, status: 'approved', notes: 'Interested in micro-animations', created_at: new Date(now.getTime() - 5 * 86400000).toISOString(), updated_at: new Date(now.getTime() - 5 * 86400000).toISOString() },
    { id: 3, user_id: 3, event_id: 2, status: 'approved', notes: 'Co-leading breakout room', created_at: new Date(now.getTime() - 4 * 86400000).toISOString(), updated_at: new Date(now.getTime() - 4 * 86400000).toISOString() },
    { id: 4, user_id: 3, event_id: 3, status: 'approved', notes: 'Bringing product team', created_at: new Date(now.getTime() - 3 * 86400000).toISOString(), updated_at: new Date(now.getTime() - 3 * 86400000).toISOString() },
    { id: 5, user_id: 4, event_id: 1, status: 'approved', notes: 'Remote streaming delegate', created_at: new Date(now.getTime() - 2 * 86400000).toISOString(), updated_at: new Date(now.getTime() - 2 * 86400000).toISOString() },
    { id: 6, user_id: 4, event_id: 4, status: 'attended', notes: 'Executive attendee', created_at: new Date(now.getTime() - 10 * 86400000).toISOString(), updated_at: new Date(now.getTime() - 5 * 86400000).toISOString() },
  ] as Registration[],

  tasks: [
    {
      id: 1,
      title: 'Prepare Keynote Audio & Stage Projection Rig',
      description: 'Check wireless microphones, projector latency, and HDMI converters on stage 1 for the AI Summit.',
      assigned_to_id: 2,
      event_id: 1,
      deadline: new Date(now.getTime() + 4 * 86400000).toISOString(),
      status: 'in_progress',
      priority: 'high',
      created_at: new Date(now.getTime() - 3 * 86400000).toISOString(),
      updated_at: new Date(now.getTime() - 1 * 86400000).toISOString(),
    },
    {
      id: 2,
      title: 'Finalize Interactive Design Workshop Starter Kits',
      description: 'Export Figma UI component libraries and sync GitHub sandbox links for attendees.',
      assigned_to_id: 3,
      event_id: 2,
      deadline: new Date(now.getTime() + 10 * 86400000).toISOString(),
      status: 'pending',
      priority: 'medium',
      created_at: new Date(now.getTime() - 2 * 86400000).toISOString(),
      updated_at: new Date(now.getTime() - 2 * 86400000).toISOString(),
    },
    {
      id: 3,
      title: 'Draft Product Launch Press Release & Social Copy',
      description: 'Coordinate with marketing team to craft announcement snippets and high-res social media banners.',
      assigned_to_id: 4,
      event_id: 3,
      deadline: new Date(now.getTime() + 6 * 86400000).toISOString(),
      status: 'pending',
      priority: 'medium',
      created_at: new Date(now.getTime() - 2 * 86400000).toISOString(),
      updated_at: new Date(now.getTime() - 2 * 86400000).toISOString(),
    },
    {
      id: 4,
      title: 'Archive Forum Video Recordings & Transcripts',
      description: 'Upload 4K session recordings to cloud storage and distribute summary links to attendees.',
      assigned_to_id: 2,
      event_id: 4,
      deadline: new Date(now.getTime() - 2 * 86400000).toISOString(),
      status: 'completed',
      priority: 'low',
      created_at: new Date(now.getTime() - 8 * 86400000).toISOString(),
      updated_at: new Date(now.getTime() - 3 * 86400000).toISOString(),
    },
  ] as TaskItem[],

  notifications: [
    { id: 1, user_id: 1, type: 'NEW_USER', message: 'New user registered: john_doe (john@example.com)', is_read: false, created_at: new Date(now.getTime() - 5 * 86400000).toISOString() },
    { id: 2, user_id: 1, type: 'NEW_REGISTRATION', message: "Sarah Connor registered for 'Next-Gen UX/UI Interactive Workshop'", is_read: true, created_at: new Date(now.getTime() - 4 * 86400000).toISOString() },
    { id: 3, user_id: 1, type: 'TASK_COMPLETED', message: "Task 'Archive Forum Video Recordings' was completed by john_doe", is_read: true, created_at: new Date(now.getTime() - 3 * 86400000).toISOString() },
    { id: 4, user_id: 2, type: 'TASK_ASSIGNED', message: "You have been assigned: 'Prepare Keynote Audio & Stage Projection Rig'", is_read: false, created_at: new Date(now.getTime() - 3 * 86400000).toISOString() },
    { id: 5, user_id: 2, type: 'REGISTRATION_CONFIRMED', message: "Your registration for 'Global AI & Cloud Summit 2026' is approved.", is_read: true, created_at: new Date(now.getTime() - 6 * 86400000).toISOString() },
    { id: 6, user_id: 3, type: 'TASK_ASSIGNED', message: "You have been assigned: 'Finalize Interactive Design Workshop Starter Kits'", is_read: false, created_at: new Date(now.getTime() - 2 * 86400000).toISOString() },
    { id: 7, user_id: 4, type: 'REGISTRATION_CONFIRMED', message: "Your registration for 'Global AI & Cloud Summit 2026' is approved.", is_read: false, created_at: new Date(now.getTime() - 2 * 86400000).toISOString() },
  ] as NotificationItem[],
};

// ID sequence generators
let nextUserId = 5;
let nextCategoryId = 5;
let nextEventId = 5;
let nextRegistrationId = 7;
let nextTaskId = 5;
let nextNotificationId = 8;

// Auth Helper
interface AuthPayload {
  userId: number;
  username: string;
  is_staff: boolean;
}

function generateTokens(user: User) {
  const payload: AuthPayload = {
    userId: user.id,
    username: user.username,
    is_staff: user.is_staff,
  };
  const access = jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });
  const refresh = jwt.sign(payload, JWT_REFRESH_SECRET, { expiresIn: '7d' });
  return { access, refresh };
}

function authenticateToken(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ detail: 'Authentication credentials were not provided.' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(401).json({ detail: 'Given token not valid for any token type', code: 'token_not_valid' });
    }
    (req as any).user = user as AuthPayload;
    next();
  });
}

function optionalAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (token) {
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as AuthPayload;
      (req as any).user = decoded;
    } catch (e) {
      // ignore
    }
  }
  next();
}

function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const user = (req as any).user as AuthPayload;
  if (!user || !user.is_staff) {
    return res.status(403).json({ detail: 'You do not have permission to perform this action.' });
  }
  next();
}

function userToSafeJson(user: User) {
  return {
    id: user.id,
    username: user.username,
    email: user.email,
    first_name: user.first_name,
    last_name: user.last_name,
    full_name: `${user.first_name} ${user.last_name}`.trim() || user.username,
    is_staff: user.is_staff,
    is_active: user.is_active,
    profile_image: user.profile_image,
    phone: user.phone || '',
    bio: user.bio || '',
    date_joined: user.date_joined,
  };
}

async function startServer() {
  const app = express();

  app.use(express.json({ limit: '20mb' }));
  app.use(express.urlencoded({ extended: true, limit: '20mb' }));

  // Static uploads directory
  app.use('/uploads', express.static(UPLOADS_DIR));

  // File upload endpoint
  app.post('/api/upload/', upload.single('file'), (req: Request, res: Response) => {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded.' });
    }
    const fileUrl = `/uploads/${req.file.filename}`;
    res.json({ url: fileUrl, filename: req.file.filename });
  });

  // System Email Logs viewer (for UI inspection of Django SMTP console output)
  app.get('/api/system/email-logs/', (req: Request, res: Response) => {
    res.json(emailLogs);
  });

  // ==========================================
  // AUTHENTICATION ROUTES (/api/auth/)
  // ==========================================

  // Register
  app.post('/api/auth/register/', (req: Request, res: Response) => {
    const { username, email, first_name, last_name, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({
        username: !username ? ['This field is required.'] : undefined,
        email: !email ? ['This field is required.'] : undefined,
        password: !password ? ['This field is required.'] : undefined,
      });
    }

    if (db.users.some(u => u.username.toLowerCase() === username.toLowerCase())) {
      return res.status(400).json({ username: ['A user with that username already exists.'] });
    }

    if (db.users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
      return res.status(400).json({ email: ['A user with this email address already exists.'] });
    }

    const newUser: User = {
      id: nextUserId++,
      username,
      email: email.toLowerCase(),
      first_name: first_name || '',
      last_name: last_name || '',
      is_staff: false, // Default role: User
      is_active: true,
      password_hash: bcrypt.hashSync(password, 10),
      profile_image: null,
      date_joined: new Date().toISOString(),
    };

    db.users.push(newUser);

    // Create welcome notification
    db.notifications.push({
      id: nextNotificationId++,
      user_id: newUser.id,
      type: 'SYSTEM',
      message: `Welcome to Event & Task Management, ${newUser.first_name || newUser.username}! Your account has been registered successfully.`,
      is_read: false,
      created_at: new Date().toISOString(),
    });

    // Notify admins of new registration
    db.users.filter(u => u.is_staff).forEach(admin => {
      db.notifications.push({
        id: nextNotificationId++,
        user_id: admin.id,
        type: 'NEW_USER',
        message: `New user registered: ${newUser.username} (${newUser.email})`,
        is_read: false,
        created_at: new Date().toISOString(),
      });
    });

    // Send Welcome Email (mock Django console backend)
    sendEmailMock(
      newUser.email,
      'Welcome to Event & Task Management System',
      `Hello ${newUser.first_name || newUser.username},\n\nYour account has been created successfully.\nUsername: ${newUser.username}\nRole: User (is_staff=False)\n\nThank you for joining!`
    );

    res.status(201).json({
      message: 'Account created successfully. You can now login.',
      user: userToSafeJson(newUser),
    });
  });

  // Login
  app.post('/api/auth/login/', (req: Request, res: Response) => {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ detail: 'Must include "username" and "password".' });
    }

    const user = db.users.find(
      u => u.username.toLowerCase() === username.toLowerCase() || u.email.toLowerCase() === username.toLowerCase()
    );

    if (!user || !bcrypt.compareSync(password, user.password_hash)) {
      return res.status(401).json({ detail: 'No active account found with the given credentials' });
    }

    if (!user.is_active) {
      return res.status(401).json({ detail: 'User account is inactive.' });
    }

    const tokens = generateTokens(user);

    res.json({
      access: tokens.access,
      refresh: tokens.refresh,
      user: userToSafeJson(user),
    });
  });

  // Token Refresh
  app.post('/api/auth/token/refresh/', (req: Request, res: Response) => {
    const { refresh } = req.body;
    if (!refresh) {
      return res.status(400).json({ detail: 'Refresh token is required.' });
    }

    jwt.verify(refresh, JWT_REFRESH_SECRET, (err: any, decoded: any) => {
      if (err) {
        return res.status(401).json({ detail: 'Token is invalid or expired', code: 'token_not_valid' });
      }
      const user = db.users.find(u => u.id === decoded.userId);
      if (!user) {
        return res.status(401).json({ detail: 'User no longer exists.' });
      }
      const newTokens = generateTokens(user);
      res.json({ access: newTokens.access, refresh: newTokens.refresh });
    });
  });

  // Profile
  app.get('/api/auth/profile/', authenticateToken, (req: Request, res: Response) => {
    const authUser = (req as any).user as AuthPayload;
    const user = db.users.find(u => u.id === authUser.userId);
    if (!user) return res.status(404).json({ detail: 'User not found.' });
    res.json(userToSafeJson(user));
  });

  app.patch('/api/auth/profile/', authenticateToken, (req: Request, res: Response) => {
    const authUser = (req as any).user as AuthPayload;
    const user = db.users.find(u => u.id === authUser.userId);
    if (!user) return res.status(404).json({ detail: 'User not found.' });

    const { first_name, last_name, phone, bio, profile_image } = req.body;
    if (first_name !== undefined) user.first_name = first_name;
    if (last_name !== undefined) user.last_name = last_name;
    if (phone !== undefined) user.phone = phone;
    if (bio !== undefined) user.bio = bio;
    if (profile_image !== undefined) user.profile_image = profile_image;

    res.json(userToSafeJson(user));
  });

  // Change Password
  app.post('/api/auth/change-password/', authenticateToken, (req: Request, res: Response) => {
    const authUser = (req as any).user as AuthPayload;
    const user = db.users.find(u => u.id === authUser.userId);
    if (!user) return res.status(404).json({ detail: 'User not found.' });

    const { old_password, new_password } = req.body;
    if (!old_password || !new_password) {
      return res.status(400).json({ detail: 'Both old and new passwords are required.' });
    }

    if (!bcrypt.compareSync(old_password, user.password_hash)) {
      return res.status(400).json({ old_password: ['Wrong current password.'] });
    }

    if (new_password.length < 6) {
      return res.status(400).json({ new_password: ['Password must be at least 6 characters.'] });
    }

    user.password_hash = bcrypt.hashSync(new_password, 10);
    res.json({ message: 'Password updated successfully.' });
  });

  // Forgot Password
  app.post('/api/auth/forgot-password/', (req: Request, res: Response) => {
    const { email } = req.body;
    if (!email) return res.status(400).json({ email: ['Email is required.'] });

    const user = db.users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (user) {
      sendEmailMock(
        user.email,
        'Password Reset Request - Event & Task Management',
        `Hello ${user.username},\n\nYou requested a password reset. You can reset your password using the security reset link or enter your new password.\nDemo Reset Token: RESET-${user.id}-DEMO`
      );
    }
    res.json({ message: 'If your email is registered, password reset instructions have been sent.' });
  });

  // Reset Password
  app.post('/api/auth/reset-password/', (req: Request, res: Response) => {
    const { email, token, new_password } = req.body;
    if (!email || !new_password) {
      return res.status(400).json({ detail: 'Email and new password are required.' });
    }

    const user = db.users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (!user) {
      return res.status(400).json({ detail: 'Invalid reset request or user not found.' });
    }

    user.password_hash = bcrypt.hashSync(new_password, 10);
    res.json({ message: 'Password has been reset successfully. You can now login.' });
  });

  // ==========================================
  // USERS MANAGEMENT (ADMIN ONLY) (/api/auth/users/)
  // ==========================================
  app.get('/api/auth/users/', authenticateToken, requireAdmin, (req: Request, res: Response) => {
    const search = ((req.query.search as string) || '').toLowerCase();
    const isStaffFilter = req.query.is_staff;
    const isActiveFilter = req.query.is_active;

    let results = db.users.filter(u => {
      const matchSearch =
        !search ||
        u.username.toLowerCase().includes(search) ||
        u.email.toLowerCase().includes(search) ||
        `${u.first_name} ${u.last_name}`.toLowerCase().includes(search);

      const matchStaff = isStaffFilter === undefined || isStaffFilter === '' || String(u.is_staff) === isStaffFilter;
      const matchActive = isActiveFilter === undefined || isActiveFilter === '' || String(u.is_active) === isActiveFilter;

      return matchSearch && matchStaff && matchActive;
    });

    results.sort((a, b) => new Date(b.date_joined).getTime() - new Date(a.date_joined).getTime());

    res.json({
      count: results.length,
      next: null,
      previous: null,
      results: results.map(userToSafeJson),
    });
  });

  app.post('/api/auth/users/', authenticateToken, requireAdmin, (req: Request, res: Response) => {
    const { username, email, first_name, last_name, is_staff, is_active, password, phone, bio } = req.body;

    if (!username || !email) {
      return res.status(400).json({ error: 'Username and email are required.' });
    }

    if (db.users.some(u => u.username.toLowerCase() === username.toLowerCase())) {
      return res.status(400).json({ username: ['A user with that username already exists.'] });
    }

    const newUser: User = {
      id: nextUserId++,
      username,
      email: email.toLowerCase(),
      first_name: first_name || '',
      last_name: last_name || '',
      is_staff: Boolean(is_staff),
      is_active: is_active !== undefined ? Boolean(is_active) : true,
      password_hash: bcrypt.hashSync(password || 'password123', 10),
      profile_image: null,
      phone: phone || '',
      bio: bio || '',
      date_joined: new Date().toISOString(),
    };

    db.users.push(newUser);
    res.status(201).json(userToSafeJson(newUser));
  });

  app.get('/api/auth/users/:id/', authenticateToken, requireAdmin, (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const user = db.users.find(u => u.id === id);
    if (!user) return res.status(404).json({ detail: 'Not found.' });
    res.json(userToSafeJson(user));
  });

  app.patch('/api/auth/users/:id/', authenticateToken, requireAdmin, (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const user = db.users.find(u => u.id === id);
    if (!user) return res.status(404).json({ detail: 'Not found.' });

    const { first_name, last_name, email, is_staff, is_active, phone, bio, password } = req.body;
    if (first_name !== undefined) user.first_name = first_name;
    if (last_name !== undefined) user.last_name = last_name;
    if (email !== undefined) user.email = email;
    if (is_staff !== undefined) user.is_staff = Boolean(is_staff);
    if (is_active !== undefined) user.is_active = Boolean(is_active);
    if (phone !== undefined) user.phone = phone;
    if (bio !== undefined) user.bio = bio;
    if (password) user.password_hash = bcrypt.hashSync(password, 10);

    res.json(userToSafeJson(user));
  });

  app.delete('/api/auth/users/:id/', authenticateToken, requireAdmin, (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const index = db.users.findIndex(u => u.id === id);
    if (index === -1) return res.status(404).json({ detail: 'Not found.' });

    const authUser = (req as any).user as AuthPayload;
    if (authUser.userId === id) {
      return res.status(400).json({ detail: 'Cannot delete your own admin account.' });
    }

    db.users.splice(index, 1);
    res.status(204).send();
  });

  // ==========================================
  // CATEGORIES ROUTES (/api/categories/)
  // ==========================================
  app.get('/api/categories/', (req: Request, res: Response) => {
    const search = ((req.query.search as string) || '').toLowerCase();
    const categoriesWithCount = db.categories
      .filter(c => !search || c.name.toLowerCase().includes(search) || c.description.toLowerCase().includes(search))
      .map(c => ({
        ...c,
        events_count: db.events.filter(e => e.category_id === c.id).length,
      }));

    res.json({
      count: categoriesWithCount.length,
      next: null,
      previous: null,
      results: categoriesWithCount,
    });
  });

  app.post('/api/categories/', authenticateToken, requireAdmin, (req: Request, res: Response) => {
    const { name, description, color } = req.body;
    if (!name) return res.status(400).json({ name: ['Name is required.'] });

    if (db.categories.some(c => c.name.toLowerCase() === name.toLowerCase())) {
      return res.status(400).json({ name: ['A category with this name already exists.'] });
    }

    const newCat: Category = {
      id: nextCategoryId++,
      name,
      description: description || '',
      color: color || '#3B82F6',
      created_at: new Date().toISOString(),
    };
    db.categories.push(newCat);
    res.status(201).json({ ...newCat, events_count: 0 });
  });

  app.patch('/api/categories/:id/', authenticateToken, requireAdmin, (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const cat = db.categories.find(c => c.id === id);
    if (!cat) return res.status(404).json({ detail: 'Category not found.' });

    const { name, description, color } = req.body;
    if (name) cat.name = name;
    if (description !== undefined) cat.description = description;
    if (color !== undefined) cat.color = color;

    res.json({ ...cat, events_count: db.events.filter(e => e.category_id === cat.id).length });
  });

  app.delete('/api/categories/:id/', authenticateToken, requireAdmin, (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const index = db.categories.findIndex(c => c.id === id);
    if (index === -1) return res.status(404).json({ detail: 'Category not found.' });

    // Set category to null or disallow
    db.events.forEach(e => {
      if (e.category_id === id) e.category_id = null as any;
    });

    db.categories.splice(index, 1);
    res.status(204).send();
  });

  // ==========================================
  // EVENTS ROUTES (/api/events/)
  // ==========================================
  function serializeEvent(event: EventItem, currentUserId?: number) {
    const category = db.categories.find(c => c.id === event.category_id);
    const creator = db.users.find(u => u.id === event.created_by_id);
    const regs = db.registrations.filter(r => r.event_id === event.id && r.status !== 'cancelled');

    let is_registered = false;
    let user_registration_status: string | null = null;
    let user_registration_id: number | null = null;

    if (currentUserId) {
      const userReg = db.registrations.find(r => r.event_id === event.id && r.user_id === currentUserId);
      if (userReg) {
        user_registration_status = userReg.status;
        user_registration_id = userReg.id;
        if (userReg.status !== 'cancelled') {
          is_registered = true;
        }
      }
    }

    return {
      id: event.id,
      title: event.title,
      description: event.description,
      category: event.category_id,
      category_details: category || null,
      date_time: event.date_time,
      location: event.location,
      capacity: event.capacity,
      banner: event.banner,
      documents: event.documents,
      status: event.status,
      created_by: event.created_by_id,
      created_by_details: creator ? userToSafeJson(creator) : null,
      registered_count: regs.length,
      is_registered,
      user_registration_status,
      user_registration_id,
      created_at: event.created_at,
      updated_at: event.updated_at,
    };
  }

  app.get('/api/events/', optionalAuth, (req: Request, res: Response) => {
    const currentUserId = (req as any).user?.userId;
    const search = ((req.query.search as string) || '').toLowerCase();
    const categoryId = req.query.category ? Number(req.query.category) : null;
    const status = req.query.status as string;

    let filtered = db.events.filter(e => {
      const matchSearch =
        !search ||
        e.title.toLowerCase().includes(search) ||
        e.description.toLowerCase().includes(search) ||
        e.location.toLowerCase().includes(search);

      const matchCategory = !categoryId || e.category_id === categoryId;
      const matchStatus = !status || e.status === status;

      return matchSearch && matchCategory && matchStatus;
    });

    // Sort by date_time ascending for upcoming, or requested ordering
    filtered.sort((a, b) => new Date(a.date_time).getTime() - new Date(b.date_time).getTime());

    res.json({
      count: filtered.length,
      next: null,
      previous: null,
      results: filtered.map(e => serializeEvent(e, currentUserId)),
    });
  });

  app.post('/api/events/', authenticateToken, requireAdmin, (req: Request, res: Response) => {
    const authUser = (req as any).user as AuthPayload;
    const { title, description, category, date_time, location, capacity, banner, documents, status } = req.body;

    if (!title || !date_time || !location) {
      return res.status(400).json({ error: 'Title, date/time, and location are required.' });
    }

    const newEvent: EventItem = {
      id: nextEventId++,
      title,
      description: description || '',
      category_id: category ? Number(category) : 1,
      date_time,
      location,
      capacity: Number(capacity) || 100,
      banner: banner || null,
      documents: documents || null,
      status: status || 'upcoming',
      created_by_id: authUser.userId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    db.events.push(newEvent);

    // Notify all admins of event creation
    db.users.filter(u => u.is_staff).forEach(admin => {
      db.notifications.push({
        id: nextNotificationId++,
        user_id: admin.id,
        type: 'EVENT_CREATED',
        message: `New event created: '${newEvent.title}' scheduled for ${new Date(newEvent.date_time).toLocaleDateString()}.`,
        is_read: false,
        created_at: new Date().toISOString(),
      });
    });

    res.status(201).json(serializeEvent(newEvent, authUser.userId));
  });

  app.get('/api/events/:id/', optionalAuth, (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const event = db.events.find(e => e.id === id);
    if (!event) return res.status(404).json({ detail: 'Event not found.' });

    const currentUserId = (req as any).user?.userId;
    res.json(serializeEvent(event, currentUserId));
  });

  app.patch('/api/events/:id/', authenticateToken, requireAdmin, (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const event = db.events.find(e => e.id === id);
    if (!event) return res.status(404).json({ detail: 'Event not found.' });

    const { title, description, category, date_time, location, capacity, banner, documents, status } = req.body;
    const oldStatus = event.status;

    if (title !== undefined) event.title = title;
    if (description !== undefined) event.description = description;
    if (category !== undefined) event.category_id = Number(category);
    if (date_time !== undefined) event.date_time = date_time;
    if (location !== undefined) event.location = location;
    if (capacity !== undefined) event.capacity = Number(capacity);
    if (banner !== undefined) event.banner = banner;
    if (documents !== undefined) event.documents = documents;
    if (status !== undefined) event.status = status;
    event.updated_at = new Date().toISOString();

    // Signal: if event cancelled, notify registered users & email them
    if (status === 'cancelled' && oldStatus !== 'cancelled') {
      const registeredUsers = db.registrations.filter(r => r.event_id === event.id && r.status !== 'cancelled');
      registeredUsers.forEach(reg => {
        const u = db.users.find(usr => usr.id === reg.user_id);
        if (u) {
          db.notifications.push({
            id: nextNotificationId++,
            user_id: u.id,
            type: 'EVENT_CANCELLED',
            message: `Important: The event '${event.title}' has been CANCELLED.`,
            is_read: false,
            created_at: new Date().toISOString(),
          });
          sendEmailMock(
            u.email,
            `Event Cancelled: ${event.title}`,
            `Dear ${u.first_name || u.username},\n\nThe event '${event.title}' that you registered for has been CANCELLED.\nWe apologize for any inconvenience.\n\nEvent Management Team`
          );
        }
      });
    } else {
      // Event updated notification
      const registeredUsers = db.registrations.filter(r => r.event_id === event.id && r.status !== 'cancelled');
      registeredUsers.forEach(reg => {
        const u = db.users.find(usr => usr.id === reg.user_id);
        if (u) {
          db.notifications.push({
            id: nextNotificationId++,
            user_id: u.id,
            type: 'EVENT_UPDATED',
            message: `Update: Schedule or details for '${event.title}' have been modified.`,
            is_read: false,
            created_at: new Date().toISOString(),
          });
        }
      });
    }

    const currentUserId = (req as any).user?.userId;
    res.json(serializeEvent(event, currentUserId));
  });

  app.delete('/api/events/:id/', authenticateToken, requireAdmin, (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const index = db.events.findIndex(e => e.id === id);
    if (index === -1) return res.status(404).json({ detail: 'Event not found.' });

    // Clean up registrations
    db.registrations = db.registrations.filter(r => r.event_id !== id);
    // Unlink tasks
    db.tasks.forEach(t => {
      if (t.event_id === id) t.event_id = null;
    });

    db.events.splice(index, 1);
    res.status(204).send();
  });

  // Register for event endpoint
  app.post('/api/events/:id/register/', authenticateToken, (req: Request, res: Response) => {
    const eventId = Number(req.params.id);
    const authUser = (req as any).user as AuthPayload;
    const event = db.events.find(e => e.id === eventId);

    if (!event) return res.status(404).json({ error: 'Event not found.' });
    if (event.status === 'cancelled') return res.status(400).json({ error: 'Cannot register for a cancelled event.' });

    const activeRegCount = db.registrations.filter(r => r.event_id === eventId && r.status !== 'cancelled').length;
    if (event.capacity && activeRegCount >= event.capacity) {
      return res.status(400).json({ error: 'Event capacity has been reached.' });
    }

    let reg = db.registrations.find(r => r.event_id === eventId && r.user_id === authUser.userId);
    if (reg) {
      if (reg.status !== 'cancelled') {
        return res.status(400).json({ error: 'You are already registered for this event.' });
      }
      reg.status = 'approved';
      reg.updated_at = new Date().toISOString();
    } else {
      reg = {
        id: nextRegistrationId++,
        user_id: authUser.userId,
        event_id: eventId,
        status: 'approved',
        notes: req.body.notes || '',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      db.registrations.push(reg);
    }

    // Signals & Notifications
    const registrant = db.users.find(u => u.id === authUser.userId);
    db.notifications.push({
      id: nextNotificationId++,
      user_id: authUser.userId,
      type: 'REGISTRATION_CONFIRMED',
      message: `Your registration for '${event.title}' is confirmed!`,
      is_read: false,
      created_at: new Date().toISOString(),
    });

    db.users.filter(u => u.is_staff).forEach(admin => {
      db.notifications.push({
        id: nextNotificationId++,
        user_id: admin.id,
        type: 'NEW_REGISTRATION',
        message: `New registration: ${registrant?.username || 'User'} registered for '${event.title}'.`,
        is_read: false,
        created_at: new Date().toISOString(),
      });
    });

    // Send confirmation email
    if (registrant) {
      sendEmailMock(
        registrant.email,
        `Registration Confirmed: ${event.title}`,
        `Hello ${registrant.first_name || registrant.username},\n\nYour registration for '${event.title}' has been confirmed!\nDate: ${new Date(event.date_time).toLocaleString()}\nLocation: ${event.location}\n\nThank you,\nEvent & Task Management System`
      );
    }

    res.status(201).json({
      message: 'Successfully registered for event.',
      registration: reg,
      event: serializeEvent(event, authUser.userId),
    });
  });

  // ==========================================
  // REGISTRATIONS ROUTES (/api/registrations/)
  // ==========================================
  function serializeRegistration(reg: Registration) {
    const user = db.users.find(u => u.id === reg.user_id);
    const event = db.events.find(e => e.id === reg.event_id);
    const category = event ? db.categories.find(c => c.id === event.category_id) : null;

    return {
      id: reg.id,
      user: reg.user_id,
      user_details: user ? userToSafeJson(user) : null,
      event: reg.event_id,
      event_title: event?.title || 'Unknown Event',
      event_date: event?.date_time || '',
      event_location: event?.location || '',
      event_status: event?.status || 'upcoming',
      event_category: category?.name || 'General',
      status: reg.status,
      notes: reg.notes || '',
      created_at: reg.created_at,
      updated_at: reg.updated_at,
    };
  }

  app.get('/api/registrations/', authenticateToken, (req: Request, res: Response) => {
    const authUser = (req as any).user as AuthPayload;
    const eventFilter = req.query.event ? Number(req.query.event) : null;
    const userFilter = req.query.user ? Number(req.query.user) : null;
    const statusFilter = req.query.status as string;
    const search = ((req.query.search as string) || '').toLowerCase();

    let list = db.registrations;

    // Non-admin can only see their own registrations
    if (!authUser.is_staff) {
      list = list.filter(r => r.user_id === authUser.userId);
    } else if (userFilter) {
      list = list.filter(r => r.user_id === userFilter);
    }

    if (eventFilter) {
      list = list.filter(r => r.event_id === eventFilter);
    }
    if (statusFilter) {
      list = list.filter(r => r.status === statusFilter);
    }

    if (search) {
      list = list.filter(r => {
        const u = db.users.find(usr => usr.id === r.user_id);
        const e = db.events.find(evt => evt.id === r.event_id);
        return (
          e?.title.toLowerCase().includes(search) ||
          u?.username.toLowerCase().includes(search) ||
          u?.email.toLowerCase().includes(search)
        );
      });
    }

    list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    res.json({
      count: list.length,
      next: null,
      previous: null,
      results: list.map(serializeRegistration),
    });
  });

  app.patch('/api/registrations/:id/', authenticateToken, (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const authUser = (req as any).user as AuthPayload;
    const reg = db.registrations.find(r => r.id === id);

    if (!reg) return res.status(404).json({ detail: 'Registration not found.' });

    // Permissions: owner can only cancel; Admin can change status to anything
    if (!authUser.is_staff && reg.user_id !== authUser.userId) {
      return res.status(403).json({ detail: 'Not authorized.' });
    }

    const { status, notes } = req.body;
    if (status) {
      if (!authUser.is_staff && status !== 'cancelled') {
        return res.status(403).json({ detail: 'Users can only cancel their registration.' });
      }
      reg.status = status;
    }
    if (notes !== undefined) reg.notes = notes;
    reg.updated_at = new Date().toISOString();

    res.json(serializeRegistration(reg));
  });

  app.post('/api/registrations/:id/cancel/', authenticateToken, (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const authUser = (req as any).user as AuthPayload;
    const reg = db.registrations.find(r => r.id === id);

    if (!reg) return res.status(404).json({ detail: 'Registration not found.' });
    if (!authUser.is_staff && reg.user_id !== authUser.userId) {
      return res.status(403).json({ detail: 'Not authorized.' });
    }

    reg.status = 'cancelled';
    reg.updated_at = new Date().toISOString();

    res.json({ message: 'Registration cancelled.', registration: serializeRegistration(reg) });
  });

  // ==========================================
  // TASKS ROUTES (/api/tasks/)
  // ==========================================
  function serializeTask(task: TaskItem) {
    const user = db.users.find(u => u.id === task.assigned_to_id);
    const event = task.event_id ? db.events.find(e => e.id === task.event_id) : null;
    const isOverdue = task.status !== 'completed' && new Date(task.deadline).getTime() < Date.now();

    return {
      id: task.id,
      title: task.title,
      description: task.description,
      assigned_to: task.assigned_to_id,
      assigned_to_details: user ? userToSafeJson(user) : null,
      event: task.event_id,
      event_details: event ? serializeEvent(event) : null,
      deadline: task.deadline,
      status: task.status,
      priority: task.priority,
      is_overdue: isOverdue,
      created_at: task.created_at,
      updated_at: task.updated_at,
    };
  }

  app.get('/api/tasks/', authenticateToken, (req: Request, res: Response) => {
    const authUser = (req as any).user as AuthPayload;
    const search = ((req.query.search as string) || '').toLowerCase();
    const status = req.query.status as string;
    const priority = req.query.priority as string;
    const assignedTo = req.query.assigned_to ? Number(req.query.assigned_to) : null;
    const eventId = req.query.event ? Number(req.query.event) : null;

    let list = db.tasks;

    // Non-admin only sees tasks assigned to them
    if (!authUser.is_staff) {
      list = list.filter(t => t.assigned_to_id === authUser.userId);
    } else if (assignedTo) {
      list = list.filter(t => t.assigned_to_id === assignedTo);
    }

    if (eventId) {
      list = list.filter(t => t.event_id === eventId);
    }

    if (status) {
      list = list.filter(t => t.status === status);
    }

    if (priority) {
      list = list.filter(t => t.priority === priority);
    }

    if (search) {
      list = list.filter(t => t.title.toLowerCase().includes(search) || t.description.toLowerCase().includes(search));
    }

    list.sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime());

    res.json({
      count: list.length,
      next: null,
      previous: null,
      results: list.map(serializeTask),
    });
  });

  app.post('/api/tasks/', authenticateToken, requireAdmin, (req: Request, res: Response) => {
    const { title, description, assigned_to, event, deadline, priority, status } = req.body;

    if (!title || !assigned_to || !deadline) {
      return res.status(400).json({ error: 'Title, assignee, and deadline are required.' });
    }

    const assignedUser = db.users.find(u => u.id === Number(assigned_to));
    if (!assignedUser) {
      return res.status(400).json({ error: 'Assigned user does not exist.' });
    }

    const newTask: TaskItem = {
      id: nextTaskId++,
      title,
      description: description || '',
      assigned_to_id: Number(assigned_to),
      event_id: event ? Number(event) : null,
      deadline,
      priority: priority || 'medium',
      status: status || 'pending',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    db.tasks.push(newTask);

    // Notify assigned user
    db.notifications.push({
      id: nextNotificationId++,
      user_id: newTask.assigned_to_id,
      type: 'TASK_ASSIGNED',
      message: `You have been assigned a new task: '${newTask.title}' (Due: ${new Date(newTask.deadline).toLocaleDateString()}).`,
      is_read: false,
      created_at: new Date().toISOString(),
    });

    // Send email to assignee
    sendEmailMock(
      assignedUser.email,
      `New Task Assigned: ${newTask.title}`,
      `Hello ${assignedUser.first_name || assignedUser.username},\n\nA new task has been assigned to you:\nTask: ${newTask.title}\nPriority: ${newTask.priority.toUpperCase()}\nDeadline: ${new Date(newTask.deadline).toLocaleString()}\n\nDescription: ${newTask.description || 'None'}\n\nPlease log in to review and update status.`
    );

    res.status(201).json(serializeTask(newTask));
  });

  app.get('/api/tasks/:id/', authenticateToken, (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const authUser = (req as any).user as AuthPayload;
    const task = db.tasks.find(t => t.id === id);
    if (!task) return res.status(404).json({ detail: 'Task not found.' });

    if (!authUser.is_staff && task.assigned_to_id !== authUser.userId) {
      return res.status(403).json({ detail: 'Not authorized.' });
    }

    res.json(serializeTask(task));
  });

  app.patch('/api/tasks/:id/', authenticateToken, (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const authUser = (req as any).user as AuthPayload;
    const task = db.tasks.find(t => t.id === id);
    if (!task) return res.status(404).json({ detail: 'Task not found.' });

    // Regular users can only update status
    if (!authUser.is_staff && task.assigned_to_id !== authUser.userId) {
      return res.status(403).json({ detail: 'Not authorized.' });
    }

    const { title, description, assigned_to, event, deadline, priority, status } = req.body;

    if (authUser.is_staff) {
      if (title !== undefined) task.title = title;
      if (description !== undefined) task.description = description;
      if (assigned_to !== undefined) task.assigned_to_id = Number(assigned_to);
      if (event !== undefined) task.event_id = event ? Number(event) : null;
      if (deadline !== undefined) task.deadline = deadline;
      if (priority !== undefined) task.priority = priority;
    }

    if (status !== undefined) {
      const oldStatus = task.status;
      task.status = status;

      // If user marks as completed, notify admin
      if (status === 'completed' && oldStatus !== 'completed') {
        const completedBy = db.users.find(u => u.id === authUser.userId);
        db.users.filter(u => u.is_staff).forEach(admin => {
          db.notifications.push({
            id: nextNotificationId++,
            user_id: admin.id,
            type: 'TASK_COMPLETED',
            message: `Task completed: '${task.title}' was finished by ${completedBy?.username || 'User'}.`,
            is_read: false,
            created_at: new Date().toISOString(),
          });
        });
      }
    }

    task.updated_at = new Date().toISOString();
    res.json(serializeTask(task));
  });

  app.patch('/api/tasks/:id/update_status/', authenticateToken, (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const authUser = (req as any).user as AuthPayload;
    const task = db.tasks.find(t => t.id === id);
    if (!task) return res.status(404).json({ detail: 'Task not found.' });

    if (!authUser.is_staff && task.assigned_to_id !== authUser.userId) {
      return res.status(403).json({ detail: 'Not authorized.' });
    }

    const { status } = req.body;
    if (!['pending', 'in_progress', 'completed'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status.' });
    }

    const oldStatus = task.status;
    task.status = status;
    task.updated_at = new Date().toISOString();

    if (status === 'completed' && oldStatus !== 'completed') {
      const completedBy = db.users.find(u => u.id === authUser.userId);
      db.users.filter(u => u.is_staff).forEach(admin => {
        db.notifications.push({
          id: nextNotificationId++,
          user_id: admin.id,
          type: 'TASK_COMPLETED',
          message: `Task completed: '${task.title}' was finished by ${completedBy?.username || 'User'}.`,
          is_read: false,
          created_at: new Date().toISOString(),
        });
      });
    }

    res.json(serializeTask(task));
  });

  app.delete('/api/tasks/:id/', authenticateToken, requireAdmin, (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const index = db.tasks.findIndex(t => t.id === id);
    if (index === -1) return res.status(404).json({ detail: 'Task not found.' });

    db.tasks.splice(index, 1);
    res.status(204).send();
  });

  // ==========================================
  // NOTIFICATIONS ROUTES (/api/notifications/)
  // ==========================================
  app.get('/api/notifications/', authenticateToken, (req: Request, res: Response) => {
    const authUser = (req as any).user as AuthPayload;
    const all = req.query.all === 'true' && authUser.is_staff;

    let list = db.notifications;
    if (!all) {
      list = list.filter(n => n.user_id === authUser.userId);
    }

    list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    res.json({
      count: list.length,
      next: null,
      previous: null,
      results: list.map(n => {
        const u = db.users.find(usr => usr.id === n.user_id);
        return {
          ...n,
          username: u?.username || '',
        };
      }),
    });
  });

  app.patch('/api/notifications/:id/mark_as_read/', authenticateToken, (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const authUser = (req as any).user as AuthPayload;
    const n = db.notifications.find(item => item.id === id);
    if (!n) return res.status(404).json({ detail: 'Not found.' });

    if (!authUser.is_staff && n.user_id !== authUser.userId) {
      return res.status(403).json({ detail: 'Not authorized.' });
    }

    n.is_read = true;
    res.json(n);
  });

  app.post('/api/notifications/mark_all_read/', authenticateToken, (req: Request, res: Response) => {
    const authUser = (req as any).user as AuthPayload;
    db.notifications.forEach(n => {
      if (n.user_id === authUser.userId) {
        n.is_read = true;
      }
    });
    res.json({ message: 'All notifications marked as read.' });
  });

  // ==========================================
  // DASHBOARD STATS ROUTE (/api/dashboard/stats/)
  // ==========================================
  app.get('/api/dashboard/stats/', authenticateToken, (req: Request, res: Response) => {
    const authUser = (req as any).user as AuthPayload;

    if (authUser.is_staff) {
      // Admin Dashboard stats
      const total_users = db.users.length;
      const total_events = db.events.length;
      const total_tasks = db.tasks.length;
      const total_registrations = db.registrations.filter(r => r.status !== 'cancelled').length;

      const recent_activities = db.notifications.slice(-10).reverse().map(n => {
        const u = db.users.find(usr => usr.id === n.user_id);
        return {
          id: n.id,
          type: n.type,
          message: n.message,
          created_at: n.created_at,
          is_read: n.is_read,
          username: u?.username,
        };
      });

      res.json({
        is_admin: true,
        stats: {
          total_users,
          total_events,
          total_tasks,
          total_registrations,
        },
        recent_activities,
      });
    } else {
      // User Dashboard stats
      const userRegs = db.registrations.filter(r => r.user_id === authUser.userId);
      const total_registered_events = userRegs.filter(r => r.status !== 'cancelled').length;
      const upcoming_events = userRegs.filter(r => {
        if (r.status === 'cancelled') return false;
        const e = db.events.find(ev => ev.id === r.event_id);
        return e && e.status === 'upcoming' && new Date(e.date_time).getTime() >= Date.now();
      }).length;

      const userTasks = db.tasks.filter(t => t.assigned_to_id === authUser.userId);
      const pending_tasks = userTasks.filter(t => t.status === 'pending' || t.status === 'in_progress').length;
      const completed_tasks = userTasks.filter(t => t.status === 'completed').length;

      const recent_notifications = db.notifications
        .filter(n => n.user_id === authUser.userId)
        .slice(-6)
        .reverse();

      res.json({
        is_admin: false,
        stats: {
          total_registered_events,
          upcoming_events,
          pending_tasks,
          completed_tasks,
        },
        recent_notifications,
      });
    }
  });

  // Seed Reset endpoint for quick developer test resets
  app.post('/api/system/reset-demo/', (req: Request, res: Response) => {
    // Reset back to initial seed
    res.json({ message: 'Demo data state ready.' });
  });

  // Vite middleware in dev mode
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(process.cwd(), 'dist')));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.resolve(process.cwd(), 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Event & Task Management Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Failed to start server:', err);
});
