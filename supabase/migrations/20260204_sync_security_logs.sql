-- ARCHITECTURAL SYNC: security_logs
-- Issue: Missing user_id column causing 42703 (Undefined Column)
-- Fix: Add user_id as UUID, FK to auth.users, and Index

DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'security_logs' AND column_name = 'user_id') THEN
        ALTER TABLE security_logs 
        ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;
    END IF;
END $$;

-- Optimize Query Performance for User-Centric Logs
CREATE INDEX IF NOT EXISTS idx_security_logs_user_id ON security_logs(user_id);
