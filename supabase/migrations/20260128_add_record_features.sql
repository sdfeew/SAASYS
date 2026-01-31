-- Attachments table for storing file metadata and references
CREATE TABLE public.record_attachments (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  record_id uuid NOT NULL REFERENCES public.sub_module_records(id) ON DELETE CASCADE,
  module_id uuid NOT NULL REFERENCES public.sub_modules(id) ON DELETE CASCADE,
  file_name text NOT NULL,
  file_size int NOT NULL,
  file_type text NOT NULL,
  storage_path text NOT NULL UNIQUE,
  uploaded_by uuid NOT NULL REFERENCES auth.users(id),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT valid_file_size CHECK (file_size > 0 AND file_size <= 104857600)
);

-- Comments table for storing comments and replies
CREATE TABLE public.record_comments (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  record_id uuid NOT NULL REFERENCES public.sub_module_records(id) ON DELETE CASCADE,
  module_id uuid NOT NULL REFERENCES public.sub_modules(id) ON DELETE CASCADE,
  comment_text text NOT NULL,
  author_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE SET NULL,
  parent_comment_id uuid REFERENCES public.record_comments(id) ON DELETE CASCADE,
  is_edited boolean DEFAULT false,
  edited_at timestamp with time zone,
  mentions jsonb DEFAULT '[]'::jsonb,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT non_empty_comment CHECK (comment_text ~ '\S')
);

-- Activity log table for tracking all changes
CREATE TABLE public.record_activity (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  record_id uuid NOT NULL REFERENCES public.sub_module_records(id) ON DELETE CASCADE,
  module_id uuid NOT NULL REFERENCES public.sub_modules(id) ON DELETE CASCADE,
  activity_type text NOT NULL CHECK (activity_type IN ('created', 'updated', 'deleted', 'field_changed', 'attachment_added', 'attachment_removed', 'comment_added', 'status_changed', 'related_record_added', 'related_record_removed')),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE SET NULL,
  user_name text NOT NULL,
  user_email text,
  description text NOT NULL,
  changes jsonb DEFAULT '{}'::jsonb,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamp with time zone DEFAULT now()
);

-- Record relationships table for linking records
CREATE TABLE public.record_relationships (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  source_record_id uuid NOT NULL REFERENCES public.sub_module_records(id) ON DELETE CASCADE,
  target_record_id uuid NOT NULL REFERENCES public.sub_module_records(id) ON DELETE CASCADE,
  source_module_id uuid NOT NULL REFERENCES public.sub_modules(id) ON DELETE CASCADE,
  target_module_id uuid NOT NULL REFERENCES public.sub_modules(id) ON DELETE CASCADE,
  relationship_type text NOT NULL,
  description text,
  created_by uuid NOT NULL REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT different_records CHECK (source_record_id != target_record_id),
  UNIQUE(source_record_id, target_record_id, relationship_type)
);

-- User profiles for comment author info
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text,
  avatar_url text,
  email text,
  department text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX idx_attachments_record_id ON public.record_attachments(record_id);
CREATE INDEX idx_attachments_module_id ON public.record_attachments(module_id);
CREATE INDEX idx_attachments_tenant_id ON public.record_attachments(tenant_id);
CREATE INDEX idx_attachments_created_at ON public.record_attachments(created_at DESC);

CREATE INDEX idx_comments_record_id ON public.record_comments(record_id);
CREATE INDEX idx_comments_module_id ON public.record_comments(module_id);
CREATE INDEX idx_comments_parent_id ON public.record_comments(parent_comment_id);
CREATE INDEX idx_comments_author_id ON public.record_comments(author_id);
CREATE INDEX idx_comments_created_at ON public.record_comments(created_at DESC);

CREATE INDEX idx_activity_record_id ON public.record_activity(record_id);
CREATE INDEX idx_activity_module_id ON public.record_activity(module_id);
CREATE INDEX idx_activity_user_id ON public.record_activity(user_id);
CREATE INDEX idx_activity_type ON public.record_activity(activity_type);
CREATE INDEX idx_activity_created_at ON public.record_activity(created_at DESC);

CREATE INDEX idx_relationships_source_id ON public.record_relationships(source_record_id);
CREATE INDEX idx_relationships_target_id ON public.record_relationships(target_record_id);
CREATE INDEX idx_relationships_source_module ON public.record_relationships(source_module_id);
CREATE INDEX idx_relationships_target_module ON public.record_relationships(target_module_id);

-- Enable RLS
ALTER TABLE public.record_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.record_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.record_activity ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.record_relationships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies for attachments
CREATE POLICY "Users can view attachments in their tenant" 
  ON public.record_attachments FOR SELECT 
  USING (tenant_id = auth.uid());

CREATE POLICY "Users can upload attachments in their tenant" 
  ON public.record_attachments FOR INSERT 
  WITH CHECK (tenant_id = auth.uid());

CREATE POLICY "Users can delete their own attachments" 
  ON public.record_attachments FOR DELETE 
  USING (uploaded_by = auth.uid());

-- RLS Policies for comments
CREATE POLICY "Users can view comments in their tenant" 
  ON public.record_comments FOR SELECT 
  USING (tenant_id = auth.uid());

CREATE POLICY "Users can create comments in their tenant" 
  ON public.record_comments FOR INSERT 
  WITH CHECK (tenant_id = auth.uid() AND author_id = auth.uid());

CREATE POLICY "Users can update their own comments" 
  ON public.record_comments FOR UPDATE 
  USING (author_id = auth.uid())
  WITH CHECK (author_id = auth.uid());

CREATE POLICY "Users can delete their own comments" 
  ON public.record_comments FOR DELETE 
  USING (author_id = auth.uid());

-- RLS Policies for activity
CREATE POLICY "Users can view activity in their tenant" 
  ON public.record_activity FOR SELECT 
  USING (tenant_id = auth.uid());

CREATE POLICY "System can insert activity logs" 
  ON public.record_activity FOR INSERT 
  WITH CHECK (true);

-- RLS Policies for relationships
CREATE POLICY "Users can view relationships in their tenant" 
  ON public.record_relationships FOR SELECT 
  USING (tenant_id = auth.uid());

CREATE POLICY "Users can create relationships in their tenant" 
  ON public.record_relationships FOR INSERT 
  WITH CHECK (tenant_id = auth.uid());

CREATE POLICY "Users can delete relationships they created" 
  ON public.record_relationships FOR DELETE 
  USING (created_by = auth.uid());

-- RLS Policies for user profiles
CREATE POLICY "Users can view all user profiles" 
  ON public.user_profiles FOR SELECT 
  USING (true);

CREATE POLICY "Users can update their own profile" 
  ON public.user_profiles FOR UPDATE 
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());
