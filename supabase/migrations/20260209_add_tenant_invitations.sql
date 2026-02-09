-- ============================================================================
-- Add Tenant Invitations Table - Invitation Links for New Users
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.tenant_invitations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL,
  code VARCHAR(255) UNIQUE NOT NULL,
  role_code VARCHAR(50) DEFAULT 'user', -- admin, owner, editor, viewer, user
  status VARCHAR(50) DEFAULT 'pending', -- pending, sent, accepted, rejected, expired
  invited_by UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP DEFAULT (CURRENT_TIMESTAMP + INTERVAL '7 days'),
  accepted_at TIMESTAMP,
  
  CONSTRAINT valid_role CHECK (role_code IN ('admin', 'owner', 'editor', 'viewer', 'user')),
  CONSTRAINT valid_status CHECK (status IN ('pending', 'sent', 'accepted', 'rejected', 'expired')),
  UNIQUE(tenant_id, email) -- One active invitation per email per tenant
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_tenant_invitations_tenant_id ON public.tenant_invitations(tenant_id);
CREATE INDEX IF NOT EXISTS idx_tenant_invitations_email ON public.tenant_invitations(email);
CREATE INDEX IF NOT EXISTS idx_tenant_invitations_code ON public.tenant_invitations(code);
CREATE INDEX IF NOT EXISTS idx_tenant_invitations_status ON public.tenant_invitations(status);
CREATE INDEX IF NOT EXISTS idx_tenant_invitations_expires_at ON public.tenant_invitations(expires_at);

-- Enable RLS
ALTER TABLE public.tenant_invitations ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "tenant_invitations_select_self" ON public.tenant_invitations FOR SELECT
USING (
  auth.uid() = invited_by OR
  email = (SELECT email FROM public.user_profiles WHERE id = auth.uid())
);

CREATE POLICY "tenant_invitations_insert_by_admin" ON public.tenant_invitations FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_profiles up
    WHERE up.id = auth.uid()
    AND up.tenant_id = tenant_invitations.tenant_id
    AND up.role_code IN ('admin', 'owner')
  )
);

CREATE POLICY "tenant_invitations_update_by_admin" ON public.tenant_invitations FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.user_profiles up
    WHERE up.id = auth.uid()
    AND up.tenant_id = tenant_invitations.tenant_id
    AND up.role_code IN ('admin', 'owner')
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_profiles up
    WHERE up.id = auth.uid()
    AND up.tenant_id = tenant_invitations.tenant_id
    AND up.role_code IN ('admin', 'owner')
  )
);

CREATE POLICY "tenant_invitations_delete_by_admin" ON public.tenant_invitations FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.user_profiles up
    WHERE up.id = auth.uid()
    AND up.tenant_id = tenant_invitations.tenant_id
    AND up.role_code IN ('admin', 'owner')
  )
);

-- Comments
COMMENT ON TABLE public.tenant_invitations IS 'Stores invitation links for users to join tenants';
COMMENT ON COLUMN public.tenant_invitations.code IS 'Unique invitation code for the URL';
COMMENT ON COLUMN public.tenant_invitations.role_code IS 'Role to assign when user accepts invitation';
COMMENT ON COLUMN public.tenant_invitations.status IS 'Current status of the invitation';
COMMENT ON COLUMN public.tenant_invitations.expires_at IS 'When the invitation link expires (default: 7 days)';
