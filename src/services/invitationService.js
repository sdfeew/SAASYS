import { supabase } from '../lib/supabase';

export const invitationService = {
  // Generate a unique invitation code
  generateCode: () => {
    return Math.random().toString(36).substring(2, 15) + 
           Math.random().toString(36).substring(2, 15);
  },

  // Send invitation to a new user
  sendInvitation: async (tenantId, email, roleCode = 'user') => {
    try {
      const code = invitationService.generateCode();
      const { data, error } = await supabase
        .from('tenant_invitations')
        .insert({
          tenant_id: tenantId,
          email: email.toLowerCase(),
          code,
          role_code: roleCode || 'user',
          status: 'pending',
          invited_by: (await supabase.auth.getUser())?.data?.user?.id
        })
        .select()
        .single();

      if (error) throw error;

      // Generate invitation URL
      const invitationUrl = `${window.location.origin}/auth/invite?code=${code}&email=${encodeURIComponent(email)}`;

      return {
        success: true,
        data,
        invitationUrl,
        code
      };
    } catch (err) {
      console.error('Error sending invitation:', err);
      return {
        success: false,
        error: err?.message || 'Failed to send invitation'
      };
    }
  },

  // Get pending invitations for a tenant
  getPendingInvitations: async (tenantId) => {
    try {
      const { data, error } = await supabase
        .from('tenant_invitations')
        .select('*')
        .eq('tenant_id', tenantId)
        .in('status', ['pending', 'sent'])
        .gt('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false });

      if (error) throw error;
      return { success: true, data };
    } catch (err) {
      console.error('Error getting invitations:', err);
      return {
        success: false,
        error: err?.message || 'Failed to get invitations',
        data: []
      };
    }
  },

  // Get all invitations for a tenant (including history)
  getAllInvitations: async (tenantId) => {
    try {
      const { data, error } = await supabase
        .from('tenant_invitations')
        .select('*')
        .eq('tenant_id', tenantId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return { success: true, data };
    } catch (err) {
      console.error('Error getting invitations:', err);
      return {
        success: false,
        error: err?.message || 'Failed to get invitations',
        data: []
      };
    }
  },

  // Verify and get invitation details
  verifyInvitation: async (code) => {
    try {
      const { data, error } = await supabase
        .from('tenant_invitations')
        .select(`
          *,
          tenant_id,
          tenants!inner(id, name, logo_url)
        `)
        .eq('code', code)
        .eq('status', 'pending')
        .gt('expires_at', new Date().toISOString())
        .single();

      if (error) throw error;
      return { success: true, data };
    } catch (err) {
      console.error('Error verifying invitation:', err);
      return {
        success: false,
        error: err?.message || 'Invalid or expired invitation',
        data: null
      };
    }
  },

  // Resend invitation
  resendInvitation: async (invitationId) => {
    try {
      // Extend expiration date
      const newExpiresAt = new Date();
      newExpiresAt.setDate(newExpiresAt.getDate() + 7);

      const { data, error } = await supabase
        .from('tenant_invitations')
        .update({
          status: 'sent',
          expires_at: newExpiresAt.toISOString()
        })
        .eq('id', invitationId)
        .select()
        .single();

      if (error) throw error;
      return { success: true, data };
    } catch (err) {
      console.error('Error resending invitation:', err);
      return {
        success: false,
        error: err?.message || 'Failed to resend invitation'
      };
    }
  },

  // Revoke invitation
  revokeInvitation: async (invitationId) => {
    try {
      const { error } = await supabase
        .from('tenant_invitations')
        .update({ status: 'expired' })
        .eq('id', invitationId);

      if (error) throw error;
      return { success: true };
    } catch (err) {
      console.error('Error revoking invitation:', err);
      return {
        success: false,
        error: err?.message || 'Failed to revoke invitation'
      };
    }
  },

  // Accept invitation
  acceptInvitation: async (code, userId) => {
    try {
      const { data: invitation, error: getError } = await supabase
        .from('tenant_invitations')
        .select('*')
        .eq('code', code)
        .eq('status', 'pending')
        .single();

      if (getError || !invitation) throw new Error('Invalid invitation');

      // Mark as accepted
      const { error: updateError } = await supabase
        .from('tenant_invitations')
        .update({
          status: 'accepted',
          accepted_at: new Date().toISOString()
        })
        .eq('id', invitation.id);

      if (updateError) throw updateError;

      return {
        success: true,
        tenantId: invitation.tenant_id,
        roleCode: invitation.role_code
      };
    } catch (err) {
      console.error('Error accepting invitation:', err);
      return {
        success: false,
        error: err?.message || 'Failed to accept invitation'
      };
    }
  }
};
