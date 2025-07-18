
-- First, let's see what roles currently exist and add the missing ones
-- We need to ensure all roles are properly added to the user_role enum

-- Add staff_officer role if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type t JOIN pg_enum e ON t.oid = e.enumtypid WHERE t.typname = 'user_role' AND e.enumlabel = 'staff_officer') THEN
        ALTER TYPE user_role ADD VALUE 'staff_officer';
    END IF;
END
$$;

-- Add sdo role if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type t JOIN pg_enum e ON t.oid = e.enumtypid WHERE t.typname = 'user_role' AND e.enumlabel = 'sdo') THEN
        ALTER TYPE user_role ADD VALUE 'sdo';
    END IF;
END
$$;

-- Add clerk role if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type t JOIN pg_enum e ON t.oid = e.enumtypid WHERE t.typname = 'user_role' AND e.enumlabel = 'clerk') THEN
        ALTER TYPE user_role ADD VALUE 'clerk';
    END IF;
END
$$;

-- Add verification officer roles if they don't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type t JOIN pg_enum e ON t.oid = e.enumtypid WHERE t.typname = 'user_role' AND e.enumlabel = 'verification_officer_1') THEN
        ALTER TYPE user_role ADD VALUE 'verification_officer_1';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_type t JOIN pg_enum e ON t.oid = e.enumtypid WHERE t.typname = 'user_role' AND e.enumlabel = 'verification_officer_2') THEN
        ALTER TYPE user_role ADD VALUE 'verification_officer_2';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_type t JOIN pg_enum e ON t.oid = e.enumtypid WHERE t.typname = 'user_role' AND e.enumlabel = 'verification_officer_3') THEN
        ALTER TYPE user_role ADD VALUE 'verification_officer_3';
    END IF;
END
$$;
