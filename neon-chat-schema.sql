-- Neon Database Schema for Chat Application
-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create auth_users table to replace Supabase's auth.users
CREATE TABLE IF NOT EXISTS public.auth_users (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  email text NOT NULL UNIQUE,
  created_at timestamp without time zone NOT NULL DEFAULT now(),
  updated_at timestamp without time zone NOT NULL DEFAULT now(),
  CONSTRAINT auth_users_pkey PRIMARY KEY (id)
);

-- Add password_hash column for authentication
ALTER TABLE public.auth_users ADD COLUMN IF NOT EXISTS password_hash TEXT;

-- Create sequences
CREATE SEQUENCE IF NOT EXISTS attachments_id_seq;
CREATE SEQUENCE IF NOT EXISTS blocked_users_id_seq;
CREATE SEQUENCE IF NOT EXISTS bot_id_seq;
CREATE SEQUENCE IF NOT EXISTS bot_chat_id_seq;
CREATE SEQUENCE IF NOT EXISTS messagestatus_id_seq;
CREATE SEQUENCE IF NOT EXISTS messages_id_seq;
CREATE SEQUENCE IF NOT EXISTS room_participants_id_seq;
CREATE SEQUENCE IF NOT EXISTS user_contacts_id_seq;
CREATE SEQUENCE IF NOT EXISTS user_role_id_seq;

-- Create users table (modified to reference local auth_users)
CREATE TABLE public.users (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  email text NOT NULL UNIQUE,
  full_name text,
  user_name text NOT NULL UNIQUE,
  avatar_url text,
  status boolean NOT NULL DEFAULT true,
  CONSTRAINT users_pkey PRIMARY KEY (id),
  CONSTRAINT users_id_fkey FOREIGN KEY (id) REFERENCES public.auth_users(id) ON DELETE CASCADE
);

-- Create chat_rooms table
CREATE TABLE public.chat_rooms (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text,
  is_group boolean NOT NULL DEFAULT false,
  created_at timestamp without time zone NOT NULL DEFAULT now(),
  is_deleted boolean NOT NULL DEFAULT false,
  CONSTRAINT chat_rooms_pkey PRIMARY KEY (id)
);

-- Create messages table
CREATE TABLE public.messages (
  id bigint NOT NULL DEFAULT nextval('messages_id_seq'::regclass),
  room_id uuid,
  sender_id uuid,
  content text NOT NULL,
  message_type text NOT NULL CHECK (message_type = ANY (ARRAY['text'::text, 'image'::text, 'file'::text, 'system'::text])),
  sent_at timestamp without time zone NOT NULL DEFAULT now(),
  is_read boolean NOT NULL DEFAULT false,
  CONSTRAINT messages_pkey PRIMARY KEY (id),
  CONSTRAINT messages_sender_id_fkey FOREIGN KEY (sender_id) REFERENCES public.users(id) ON DELETE SET NULL,
  CONSTRAINT messages_room_id_fkey FOREIGN KEY (room_id) REFERENCES public.chat_rooms(id) ON DELETE CASCADE
);

-- Create attachments table
CREATE TABLE public.attachments (
  id integer NOT NULL DEFAULT nextval('attachments_id_seq'::regclass),
  message_id integer NOT NULL,
  file_url text NOT NULL,
  file_type character varying(50) NOT NULL,
  file_size integer NOT NULL,
  uploaded_at timestamp without time zone NOT NULL DEFAULT now(),
  CONSTRAINT attachments_pkey PRIMARY KEY (id),
  CONSTRAINT attachments_message_id_fkey FOREIGN KEY (message_id) REFERENCES public.messages(id) ON DELETE CASCADE
);

-- Create blocked_users table
CREATE TABLE public.blocked_users (
  id integer NOT NULL DEFAULT nextval('blocked_users_id_seq'::regclass),
  user_id uuid NOT NULL,
  blocked_user_id uuid NOT NULL,
  created_at timestamp without time zone NOT NULL DEFAULT now(),
  CONSTRAINT blocked_users_pkey PRIMARY KEY (id),
  CONSTRAINT blocked_users_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE,
  CONSTRAINT blocked_users_blocked_user_id_fkey FOREIGN KEY (blocked_user_id) REFERENCES public.users(id) ON DELETE CASCADE,
  CONSTRAINT blocked_users_unique UNIQUE (user_id, blocked_user_id)
);

-- Create bot table
CREATE TABLE public.bot (
  id integer NOT NULL DEFAULT nextval('bot_id_seq'::regclass),
  bot_name character varying(100),
  user_id uuid NOT NULL,
  bot_api character varying(255),
  created_at timestamp without time zone NOT NULL DEFAULT now(),
  CONSTRAINT bot_pkey PRIMARY KEY (id),
  CONSTRAINT bot_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE
);

-- Create bot_chat table
CREATE TABLE public.bot_chat (
  id integer NOT NULL DEFAULT nextval('bot_chat_id_seq'::regclass),
  bot_id integer NOT NULL,
  user_id uuid NOT NULL,
  content text,
  status character varying(50) NOT NULL DEFAULT 'pending',
  created_at timestamp without time zone NOT NULL DEFAULT now(),
  CONSTRAINT bot_chat_pkey PRIMARY KEY (id),
  CONSTRAINT bot_chat_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE,
  CONSTRAINT bot_chat_bot_id_fkey FOREIGN KEY (bot_id) REFERENCES public.bot(id) ON DELETE CASCADE
);

-- Create message_status table
CREATE TABLE public.message_status (
  id integer NOT NULL DEFAULT nextval('messagestatus_id_seq'::regclass),
  message_id integer NOT NULL,
  receiver_id uuid NOT NULL,
  status character varying(50) NOT NULL DEFAULT 'sent',
  updated_at timestamp without time zone NOT NULL DEFAULT now(),
  CONSTRAINT message_status_pkey PRIMARY KEY (id),
  CONSTRAINT message_status_receiver_id_fkey FOREIGN KEY (receiver_id) REFERENCES public.users(id) ON DELETE CASCADE,
  CONSTRAINT message_status_message_id_fkey FOREIGN KEY (message_id) REFERENCES public.messages(id) ON DELETE CASCADE,
  CONSTRAINT message_status_unique UNIQUE (message_id, receiver_id)
);

-- Create room_participants table
CREATE TABLE public.room_participants (
  id bigint NOT NULL DEFAULT nextval('room_participants_id_seq'::regclass),
  room_id uuid NOT NULL,
  user_id uuid NOT NULL,
  joined_at timestamp without time zone DEFAULT now(),
  CONSTRAINT room_participants_pkey PRIMARY KEY (id),
  CONSTRAINT room_participants_room_id_fkey FOREIGN KEY (room_id) REFERENCES public.chat_rooms(id) ON DELETE CASCADE,
  CONSTRAINT room_participants_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE,
  CONSTRAINT room_participants_unique UNIQUE (room_id, user_id)
);

-- Create user_contacts table
CREATE TABLE public.user_contacts (
  id integer NOT NULL DEFAULT nextval('user_contacts_id_seq'::regclass),
  user_id uuid NOT NULL,
  friend_id uuid NOT NULL,
  created_at timestamp without time zone NOT NULL DEFAULT now(),
  CONSTRAINT user_contacts_pkey PRIMARY KEY (id),
  CONSTRAINT user_contacts_friend_id_fkey FOREIGN KEY (friend_id) REFERENCES public.users(id) ON DELETE CASCADE,
  CONSTRAINT user_contacts_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE,
  CONSTRAINT user_contacts_unique UNIQUE (user_id, friend_id)
);

-- Create user_role table
CREATE TABLE public.user_role (
  id integer NOT NULL DEFAULT nextval('user_role_id_seq'::regclass),
  user_id uuid NOT NULL,
  chat_rooms_id uuid NOT NULL,
  role text NOT NULL DEFAULT 'member',
  CONSTRAINT user_role_pkey PRIMARY KEY (id),
  CONSTRAINT user_role_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE,
  CONSTRAINT user_role_chat_rooms_id_fkey FOREIGN KEY (chat_rooms_id) REFERENCES public.chat_rooms(id) ON DELETE CASCADE,
  CONSTRAINT user_role_unique UNIQUE (user_id, chat_rooms_id)
);

-- Create indexes for better performance
CREATE INDEX idx_messages_room_id ON public.messages(room_id);
CREATE INDEX idx_messages_sender_id ON public.messages(sender_id);
CREATE INDEX idx_messages_sent_at ON public.messages(sent_at DESC);
CREATE INDEX idx_attachments_message_id ON public.attachments(message_id);
CREATE INDEX idx_room_participants_room_id ON public.room_participants(room_id);
CREATE INDEX idx_room_participants_user_id ON public.room_participants(user_id);
CREATE INDEX idx_message_status_message_id ON public.message_status(message_id);
CREATE INDEX idx_message_status_receiver_id ON public.message_status(receiver_id);
CREATE INDEX idx_user_contacts_user_id ON public.user_contacts(user_id);
CREATE INDEX idx_user_contacts_friend_id ON public.user_contacts(friend_id);
CREATE INDEX idx_bot_user_id ON public.bot(user_id);
CREATE INDEX idx_bot_chat_bot_id ON public.bot_chat(bot_id);
CREATE INDEX idx_bot_chat_user_id ON public.bot_chat(user_id);

-- Add comments for documentation
COMMENT ON TABLE public.auth_users IS 'Authentication users table with email and password hash';
COMMENT ON COLUMN public.auth_users.password_hash IS 'Hashed password using bcrypt or similar secure hashing algorithm';
COMMENT ON TABLE public.users IS 'Main users table storing user profiles';
COMMENT ON TABLE public.chat_rooms IS 'Chat rooms for both private and group conversations';
COMMENT ON TABLE public.messages IS 'All messages sent in chat rooms';
COMMENT ON TABLE public.attachments IS 'File attachments for messages';
COMMENT ON TABLE public.room_participants IS 'Users participating in each chat room';
COMMENT ON TABLE public.message_status IS 'Read/delivery status for each message per receiver';
COMMENT ON TABLE public.user_contacts IS 'User contact/friend relationships';
COMMENT ON TABLE public.blocked_users IS 'Users blocked by other users';
COMMENT ON TABLE public.bot IS 'Bot configurations created by users';
COMMENT ON TABLE public.bot_chat IS 'Chat history with bots';
COMMENT ON TABLE public.user_role IS 'User roles within chat rooms (admin, member, etc.)';
