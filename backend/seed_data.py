import os
import django
from datetime import timedelta
from django.utils import timezone

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'event_task_system.settings')
django.setup()

from django.contrib.auth import get_user_model
from apps.events.models import Category, Event, Registration
from apps.tasks.models import Task
from apps.notifications.models import Notification

User = get_user_model()

def seed_database():
    print("🌱 Seeding Event & Task Management System database...")

    # 1. Create Admin
    admin_user, created = User.objects.get_or_create(
        username='admin',
        defaults={
            'email': 'admin@eventtask.com',
            'first_name': 'Eleanor',
            'last_name': 'Vance (Admin)',
            'is_staff': True,
            'is_superuser': True,
            'bio': 'System Administrator and Lead Event Director.',
            'phone': '+1 (555) 019-2831'
        }
    )
    if created:
        admin_user.set_password('admin123')
        admin_user.save()
        print("  ✓ Admin created: admin / admin123")

    # 2. Create 3 Regular Users
    sample_users = [
        {
            'username': 'john_doe',
            'email': 'john@example.com',
            'first_name': 'John',
            'last_name': 'Doe',
            'bio': 'Full-stack software developer and tech enthusiast.',
            'phone': '+1 (555) 123-4567'
        },
        {
            'username': 'sarah_connor',
            'email': 'sarah@example.com',
            'first_name': 'Sarah',
            'last_name': 'Connor',
            'bio': 'Senior Product Designer and UX Researcher.',
            'phone': '+1 (555) 987-6543'
        },
        {
            'username': 'mike_ross',
            'email': 'mike@example.com',
            'first_name': 'Mike',
            'last_name': 'Ross',
            'bio': 'Growth Strategist & Event Operations Specialist.',
            'phone': '+1 (555) 456-7890'
        }
    ]

    created_users = []
    for udata in sample_users:
        u, u_created = User.objects.get_or_create(
            username=udata['username'],
            defaults={
                'email': udata['email'],
                'first_name': udata['first_name'],
                'last_name': udata['last_name'],
                'is_staff': False,
                'bio': udata['bio'],
                'phone': udata['phone']
            }
        )
        if u_created:
            u.set_password('user123')
            u.save()
            print(f"  ✓ User created: {u.username} / user123")
        created_users.append(u)

    # 3. Create Categories
    categories_data = [
        {'name': 'Technology & AI', 'description': 'Workshops, hackathons, and conferences on software engineering and AI.', 'color': '#3B82F6'},
        {'name': 'Design & Creative', 'description': 'Sessions focused on UX/UI design, interactive prototyping, and brand systems.', 'color': '#EC4899'},
        {'name': 'Marketing & Growth', 'description': 'Product marketing strategies, SEO, audience acquisition, and conversion funnels.', 'color': '#10B981'},
        {'name': 'Leadership & Strategy', 'description': 'Executive management roundtables, agile planning, and team scaling.', 'color': '#F59E0B'},
    ]

    cats = {}
    for cdata in categories_data:
        cat, _ = Category.objects.get_or_create(
            name=cdata['name'],
            defaults={'description': cdata['description'], 'color': cdata['color']}
        )
        cats[cat.name] = cat
    print(f"  ✓ {len(cats)} Categories seeded.")

    # 4. Create Events
    now = timezone.now()
    events_data = [
        {
            'title': 'Global AI & Cloud Summit 2026',
            'description': 'Join world-class engineering leaders to explore modern AI integrations, microservices, and distributed cloud computing systems.',
            'category': cats['Technology & AI'],
            'date_time': now + timedelta(days=7, hours=3),
            'location': 'Grand Auditorium, Tech Convention Center & Virtual Stream',
            'capacity': 250,
            'status': 'upcoming'
        },
        {
            'title': 'Next-Gen UX/UI Interactive Workshop',
            'description': 'A hands-on intensive studio day mastering design systems, fluid responsive interactions, micro-animations, and visual balance.',
            'category': cats['Design & Creative'],
            'date_time': now + timedelta(days=14, hours=5),
            'location': 'Design Lab 4B, Innovation District',
            'capacity': 60,
            'status': 'upcoming'
        },
        {
            'title': 'High-Impact Product Marketing Masterclass',
            'description': 'Frameworks for launching breakthrough products, validating market fit, scaling customer acquisition, and retaining early adopters.',
            'category': cats['Marketing & Growth'],
            'date_time': now + timedelta(days=21, hours=2),
            'location': 'Skyline Executive Suite, Metropolis Tower',
            'capacity': 100,
            'status': 'upcoming'
        },
        {
            'title': 'Agile Product & Engineering Strategy Forum',
            'description': 'Executive retrospective on cross-functional alignment, sprint velocity optimization, and incident response governance.',
            'category': cats['Leadership & Strategy'],
            'date_time': now - timedelta(days=5),
            'location': 'Civic Hall, Room 101',
            'capacity': 80,
            'status': 'completed'
        },
    ]

    created_events = []
    for edata in events_data:
        ev, _ = Event.objects.get_or_create(
            title=edata['title'],
            defaults={
                'description': edata['description'],
                'category': edata['category'],
                'date_time': edata['date_time'],
                'location': edata['location'],
                'capacity': edata['capacity'],
                'status': edata['status'],
                'created_by': admin_user
            }
        )
        created_events.append(ev)
    print(f"  ✓ {len(created_events)} Events seeded.")

    # 5. Create Registrations
    registrations_data = [
        {'user': created_users[0], 'event': created_events[0], 'status': 'approved'},
        {'user': created_users[0], 'event': created_events[1], 'status': 'approved'},
        {'user': created_users[1], 'event': created_events[1], 'status': 'approved'},
        {'user': created_users[1], 'event': created_events[2], 'status': 'approved'},
        {'user': created_users[2], 'event': created_events[0], 'status': 'approved'},
        {'user': created_users[2], 'event': created_events[3], 'status': 'attended'},
    ]

    for rdata in registrations_data:
        Registration.objects.get_or_create(
            user=rdata['user'],
            event=rdata['event'],
            defaults={'status': rdata['status']}
        )
    print("  ✓ Sample Registrations seeded.")

    # 6. Create Tasks
    tasks_data = [
        {
            'title': 'Prepare Keynote Slides & Stage Audio Setup',
            'description': 'Coordinate with the audiovisual team to verify projector resolution and keynote clickers for the AI Summit.',
            'assigned_to': created_users[0],
            'event': created_events[0],
            'deadline': now + timedelta(days=4),
            'status': 'in_progress',
            'priority': 'high'
        },
        {
            'title': 'Finalize Design Workshop Figma Assets',
            'description': 'Package interactive component libraries and distribute starter templates to registered attendees.',
            'assigned_to': created_users[1],
            'event': created_events[1],
            'deadline': now + timedelta(days=10),
            'status': 'pending',
            'priority': 'medium'
        },
        {
            'title': 'Draft Promotional Campaign & Social Copy',
            'description': 'Author LinkedIn announcement copy and design social preview cards for the Product Marketing Masterclass.',
            'assigned_to': created_users[2],
            'event': created_events[2],
            'deadline': now + timedelta(days=6),
            'status': 'pending',
            'priority': 'medium'
        },
        {
            'title': 'Archive Agile Forum Recordings & Transcripts',
            'description': 'Export video recordings and send summary recap email to all executive participants.',
            'assigned_to': created_users[0],
            'event': created_events[3],
            'deadline': now - timedelta(days=2),
            'status': 'completed',
            'priority': 'low'
        },
    ]

    for tdata in tasks_data:
        Task.objects.get_or_create(
            title=tdata['title'],
            defaults={
                'description': tdata['description'],
                'assigned_to': tdata['assigned_to'],
                'event': tdata['event'],
                'deadline': tdata['deadline'],
                'status': tdata['status'],
                'priority': tdata['priority']
            }
        )
    print("  ✓ Sample Tasks seeded.")

    # 7. Create Notifications
    notifications_data = [
        {'user': admin_user, 'type': 'NEW_USER', 'message': 'New user registered: john_doe (john@example.com).'},
        {'user': admin_user, 'type': 'NEW_REGISTRATION', 'message': "Sarah Connor registered for 'Next-Gen UX/UI Interactive Workshop'."},
        {'user': admin_user, 'type': 'TASK_COMPLETED', 'message': "Task 'Archive Agile Forum Recordings & Transcripts' was completed by john_doe."},
        {'user': created_users[0], 'type': 'TASK_ASSIGNED', 'message': "You were assigned to 'Prepare Keynote Slides & Stage Audio Setup'."},
        {'user': created_users[0], 'type': 'REGISTRATION_CONFIRMED', 'message': "Your registration for 'Global AI & Cloud Summit 2026' is approved."},
        {'user': created_users[1], 'type': 'TASK_ASSIGNED', 'message': "You were assigned to 'Finalize Design Workshop Figma Assets'."},
        {'user': created_users[2], 'type': 'REGISTRATION_CONFIRMED', 'message': "Your registration for 'Global AI & Cloud Summit 2026' is approved."},
    ]

    for ndata in notifications_data:
        Notification.objects.get_or_create(
            user=ndata['user'],
            message=ndata['message'],
            defaults={'type': ndata['type']}
        )
    print("  ✓ Sample Notifications seeded.")
    print("✨ Database seed completed successfully!")

if __name__ == '__main__':
    seed_database()
