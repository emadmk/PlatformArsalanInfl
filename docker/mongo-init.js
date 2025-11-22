// MongoDB initialization script
db = db.getSiblingDB('micro_influencer');

// Create collections with validation
db.createCollection('users', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['email', 'role', 'createdAt'],
      properties: {
        email: {
          bsonType: 'string',
          pattern: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$'
        },
        role: {
          enum: ['influencer', 'business', 'admin']
        }
      }
    }
  }
});

db.createCollection('projects');
db.createCollection('tasks');
db.createCollection('chats');
db.createCollection('messages');
db.createCollection('cms_content');
db.createCollection('notifications');

// Create indexes
db.users.createIndex({ email: 1 }, { unique: true });
db.users.createIndex({ role: 1 });
db.users.createIndex({ 'profile.verified': 1 });
db.users.createIndex({ createdAt: -1 });

db.projects.createIndex({ businessId: 1 });
db.projects.createIndex({ status: 1 });
db.projects.createIndex({ createdAt: -1 });
db.projects.createIndex({ 'category': 1 });

db.tasks.createIndex({ projectId: 1 });
db.tasks.createIndex({ influencerId: 1 });
db.tasks.createIndex({ status: 1 });
db.tasks.createIndex({ deadline: 1 });

db.chats.createIndex({ participants: 1 });
db.chats.createIndex({ lastMessageAt: -1 });

db.messages.createIndex({ chatId: 1, createdAt: -1 });
db.messages.createIndex({ senderId: 1 });

db.cms_content.createIndex({ slug: 1 }, { unique: true });
db.cms_content.createIndex({ type: 1 });

db.notifications.createIndex({ userId: 1, read: 1 });
db.notifications.createIndex({ createdAt: -1 });

print('MongoDB initialized successfully');
