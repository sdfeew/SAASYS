/**
 * Tenant filtering utility for services
 * Ensures all queries are filtered by current tenant
 */

export const tenantUtils = {
  /**
   * Add tenant filter to Supabase queries
   * @param {object} query - Supabase query object
   * @param {string} tenantId - Current tenant ID
   * @param {string} tableKey - Key for tenant_id column (default: 'tenant_id')
   * @returns {object} Filtered query
   */
  filterByTenant(query, tenantId, tableKey = 'tenant_id') {
    if (!query || !tenantId) {
      console.warn('⚠️ Tenant filter called without query or tenantId');
      return query;
    }

    // Add is filter for tenant_id
    return query.eq(tableKey, tenantId);
  },

  /**
   * Verify user has access to tenant
   * @param {string} userId - Current user ID
   * @param {string} tenantId - Tenant to verify access for
   * @param {object} supabase - Supabase client
   * @returns {Promise<boolean>}
   */
  async verifyTenantAccess(userId, tenantId, supabase) {
    try {
      const { data, error } = await supabase
        ?.from('user_profiles')
        ?.select('id')
        ?.eq('id', userId)
        ?.eq('tenant_id', tenantId)
        ?.single();

      return !error && !!data;
    } catch (err) {
      console.error('Error verifying tenant access:', err);
      return false;
    }
  },

  /**
   * Get user's tenants
   * @param {string} userId - User ID
   * @param {object} supabase - Supabase client
   * @returns {Promise<Array>} Array of user's tenants
   */
  async getUserTenants(userId, supabase) {
    try {
      const { data, error } = await supabase
        ?.from('user_profiles')
        ?.select('tenant_id, tenants(id, name, code)')
        ?.eq('id', userId);

      if (error) throw error;
      return data?.map(p => p.tenants).filter(Boolean) || [];
    } catch (err) {
      console.error('Error fetching user tenants:', err);
      return [];
    }
  },

  /**
   * Add RLS context headers for Supabase
   * (Note: RLS is enforced server-side, this is for documentation)
   * @param {string} tenantId - Tenant context
   * @returns {object} Headers object
   */
  getRLSHeaders(tenantId) {
    return {
      'X-Tenant-ID': tenantId,
      'X-RLS-Enabled': 'true'
    };
  },

  /**
   * Check if user has role in tenant
   * @param {string} userId - User ID
   * @param {string} tenantId - Tenant ID
   * @param {string|Array} roles - Required role(s)
   * @param {object} supabase - Supabase client
   * @returns {Promise<boolean>}
   */
  async hasRoleInTenant(userId, tenantId, roles, supabase) {
    try {
      const roleArray = Array.isArray(roles) ? roles : [roles];
      const { data, error } = await supabase
        ?.from('user_profiles')
        ?.select('role_code')
        ?.eq('id', userId)
        ?.eq('tenant_id', tenantId)
        ?.in('role_code', roleArray)
        ?.single();

      return !error && !!data;
    } catch (err) {
      console.error('Error checking role:', err);
      return false;
    }
  }
};

export default tenantUtils;
