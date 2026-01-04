-- Hubert Eunuch Chatbot Database Schema
-- Stores visitors, conversations, and messages for the interview-style guestbook

-- Visitors table: Track unique visitors
CREATE TABLE IF NOT EXISTS visitors (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  visitor_id TEXT UNIQUE NOT NULL,
  first_seen_at TEXT NOT NULL,
  last_seen_at TEXT NOT NULL,
  ip_address TEXT,
  user_agent TEXT
);

-- Conversations table: Track conversation sessions
CREATE TABLE IF NOT EXISTS conversations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  conversation_id TEXT UNIQUE NOT NULL,
  visitor_id TEXT NOT NULL,
  started_at TEXT NOT NULL,
  ended_at TEXT,
  summary TEXT,
  FOREIGN KEY (visitor_id) REFERENCES visitors(visitor_id)
);

-- Messages table: Store individual messages
CREATE TABLE IF NOT EXISTS messages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  conversation_id TEXT NOT NULL,
  role TEXT NOT NULL, -- 'user', 'assistant', 'system'
  content TEXT NOT NULL,
  timestamp TEXT NOT NULL,
  FOREIGN KEY (conversation_id) REFERENCES conversations(conversation_id)
);

-- Performance indexes
CREATE INDEX IF NOT EXISTS idx_conversations_visitor ON conversations(visitor_id);
CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(conversation_id);
