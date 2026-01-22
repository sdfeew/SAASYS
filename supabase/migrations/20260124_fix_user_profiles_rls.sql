-- Fix infinite recursion in user_profiles RLS policies
-- This migration removes the problematic recursive policies and creates a simpler, safer approach

-- Drop the problematic policies that cause infinite recursion
DROP POLICY IF EXISTS "Admins can update any profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Admins can delete profiles" ON public.user_profiles;

-- Create new simplified policies without recursion
CREATE POLICY "Users can insert profiles" ON public.user_profiles 
  FOR INSERT WITH CHECK (true);

-- For DELETE, use a simpler approach that doesn't check role within the table
CREATE POLICY "Users can delete own profile" ON public.user_profiles 
  FOR DELETE USING (auth.uid() = id);
