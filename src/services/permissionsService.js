import { supabase } from '../lib/supabase';
import { errorHandler } from '../utils/errorHandler';

/**
 * Advanced Permissions Management Service
 * Fine-grained access control and permission management
 */

export const permissionsService = {
  // Define permission levels
  PERMISSION_LEVELS: {
    NONE: 0,
    VIEW: 1,
    CREATE: 2,
    EDIT: 3,
    DELETE: 4,
    ADMIN: 5
  },

  // Define resource types
  RESOURCE_TYPES: {
    MODULE: 'module',
    RECORD: 'record',
    FIELD: 'field',
    DASHBOARD: 'dashboard',
    WORKFLOW: 'workflow',
    REPORT: 'report'
  },

  // Create a role
  async createRole(role) {
    try {
      if (!role.name) throw new Error('Role name is required');

      const { data, error } = await supabase
        .from('roles')
        .insert([{
          name: role.name,
          description: role.description || '',
          permissions: role.permissions || [],
          is_system: false,
          created_at: new Date().toISOString()
        }])
        .select();

      if (error) throw error;
      return data[0];
    } catch (error) {
      errorHandler.logError('PermissionsService:createRole', error);
      throw error;
    }
  },

  // Update role permissions
  async updateRolePermissions(roleId, permissions) {
    try {
      if (!roleId) throw new Error('Role ID is required');
      if (!Array.isArray(permissions)) throw new Error('Permissions must be an array');

      const { data, error } = await supabase
        .from('roles')
        .update({ permissions })
        .eq('id', roleId)
        .select();

      if (error) throw error;
      return data[0];
    } catch (error) {
      errorHandler.logError('PermissionsService:updateRolePermissions', error);
      throw error;
    }
  },

  // Assign role to user
  async assignRoleToUser(userId, roleId) {
    try {
      if (!userId) throw new Error('User ID is required');
      if (!roleId) throw new Error('Role ID is required');

      const { data, error } = await supabase
        .from('user_roles')
        .insert([{
          user_id: userId,
          role_id: roleId,
          assigned_at: new Date().toISOString()
        }])
        .select();

      if (error) throw error;
      return data[0];
    } catch (error) {
      errorHandler.logError('PermissionsService:assignRoleToUser', error);
      throw error;
    }
  },

  // Remove role from user
  async removeRoleFromUser(userId, roleId) {
    try {
      if (!userId) throw new Error('User ID is required');
      if (!roleId) throw new Error('Role ID is required');

      const { error } = await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', userId)
        .eq('role_id', roleId);

      if (error) throw error;
      return true;
    } catch (error) {
      errorHandler.logError('PermissionsService:removeRoleFromUser', error);
      throw error;
    }
  },

  // Grant permission to user
  async grantPermission(userId, resourceType, resourceId, permissionLevel) {
    try {
      if (!userId) throw new Error('User ID is required');
      if (!resourceType) throw new Error('Resource type is required');
      if (!resourceId) throw new Error('Resource ID is required');
      if (permissionLevel === undefined) throw new Error('Permission level is required');

      const { data, error } = await supabase
        .from('user_permissions')
        .upsert([{
          user_id: userId,
          resource_type: resourceType,
          resource_id: resourceId,
          permission_level: permissionLevel,
          granted_at: new Date().toISOString()
        }], { onConflict: ['user_id', 'resource_type', 'resource_id'] })
        .select();

      if (error) throw error;
      return data[0];
    } catch (error) {
      errorHandler.logError('PermissionsService:grantPermission', error);
      throw error;
    }
  },

  // Revoke permission from user
  async revokePermission(userId, resourceType, resourceId) {
    try {
      if (!userId) throw new Error('User ID is required');
      if (!resourceType) throw new Error('Resource type is required');
      if (!resourceId) throw new Error('Resource ID is required');

      const { error } = await supabase
        .from('user_permissions')
        .delete()
        .eq('user_id', userId)
        .eq('resource_type', resourceType)
        .eq('resource_id', resourceId);

      if (error) throw error;
      return true;
    } catch (error) {
      errorHandler.logError('PermissionsService:revokePermission', error);
      throw error;
    }
  },

  // Check user permission
  async checkPermission(userId, resourceType, resourceId, requiredLevel) {
    try {
      if (!userId) throw new Error('User ID is required');
      if (!resourceType) throw new Error('Resource type is required');
      if (!resourceId) throw new Error('Resource ID is required');
      if (requiredLevel === undefined) throw new Error('Required level is required');

      // Get user permissions
      const { data: permissions, error } = await supabase
        .from('user_permissions')
        .select('permission_level')
        .eq('user_id', userId)
        .eq('resource_type', resourceType)
        .eq('resource_id', resourceId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      // Get user roles and check their permissions
      const { data: rolePermissions } = await supabase
        .from('user_roles')
        .select('roles(permissions)')
        .eq('user_id', userId);

      const userLevel = permissions?.permission_level || 0;
      const hasRolePermission = rolePermissions?.some(ur =>
        ur.roles?.permissions?.some(p =>
          p.resourceType === resourceType && p.resourceId === resourceId && p.level >= requiredLevel
        )
      ) || false;

      return userLevel >= requiredLevel || hasRolePermission;
    } catch (error) {
      errorHandler.logError('PermissionsService:checkPermission', error);
      throw error;
    }
  },

  // Get user permissions for resource
  async getUserPermissions(userId, resourceType, resourceId) {
    try {
      if (!userId) throw new Error('User ID is required');
      if (!resourceType) throw new Error('Resource type is required');
      if (!resourceId) throw new Error('Resource ID is required');

      const { data, error } = await supabase
        .from('user_permissions')
        .select('*')
        .eq('user_id', userId)
        .eq('resource_type', resourceType)
        .eq('resource_id', resourceId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      return data || {
        userId,
        resourceType,
        resourceId,
        permissionLevel: 0
      };
    } catch (error) {
      errorHandler.logError('PermissionsService:getUserPermissions', error);
      throw error;
    }
  },

  // Get all users with access to resource
  async getResourceUsers(resourceType, resourceId) {
    try {
      if (!resourceType) throw new Error('Resource type is required');
      if (!resourceId) throw new Error('Resource ID is required');

      const { data, error } = await supabase
        .from('user_permissions')
        .select('user_id, permission_level')
        .eq('resource_type', resourceType)
        .eq('resource_id', resourceId);

      if (error) throw error;
      return data || [];
    } catch (error) {
      errorHandler.logError('PermissionsService:getResourceUsers', error);
      throw error;
    }
  },

  // Set field-level permissions
  async setFieldPermissions(userId, moduleId, fieldName, canView, canEdit) {
    try {
      if (!userId) throw new Error('User ID is required');
      if (!moduleId) throw new Error('Module ID is required');
      if (!fieldName) throw new Error('Field name is required');

      const { data, error } = await supabase
        .from('field_permissions')
        .upsert([{
          user_id: userId,
          module_id: moduleId,
          field_name: fieldName,
          can_view: canView,
          can_edit: canEdit,
          set_at: new Date().toISOString()
        }], { onConflict: ['user_id', 'module_id', 'field_name'] })
        .select();

      if (error) throw error;
      return data[0];
    } catch (error) {
      errorHandler.logError('PermissionsService:setFieldPermissions', error);
      throw error;
    }
  },

  // Get field permissions
  async getFieldPermissions(userId, moduleId, fieldName) {
    try {
      if (!userId) throw new Error('User ID is required');
      if (!moduleId) throw new Error('Module ID is required');
      if (!fieldName) throw new Error('Field name is required');

      const { data, error } = await supabase
        .from('field_permissions')
        .select('*')
        .eq('user_id', userId)
        .eq('module_id', moduleId)
        .eq('field_name', fieldName)
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      return data || {
        canView: false,
        canEdit: false
      };
    } catch (error) {
      errorHandler.logError('PermissionsService:getFieldPermissions', error);
      throw error;
    }
  },

  // Create permission template
  async createPermissionTemplate(template) {
    try {
      if (!template.name) throw new Error('Template name is required');
      if (!template.permissions) throw new Error('Permissions are required');

      const { data, error } = await supabase
        .from('permission_templates')
        .insert([{
          name: template.name,
          description: template.description || '',
          permissions: template.permissions,
          created_at: new Date().toISOString()
        }])
        .select();

      if (error) throw error;
      return data[0];
    } catch (error) {
      errorHandler.logError('PermissionsService:createPermissionTemplate', error);
      throw error;
    }
  },

  // Apply permission template to user
  async applyPermissionTemplate(userId, templateId) {
    try {
      if (!userId) throw new Error('User ID is required');
      if (!templateId) throw new Error('Template ID is required');

      // Get template
      const { data: template, error: templateError } = await supabase
        .from('permission_templates')
        .select('permissions')
        .eq('id', templateId)
        .single();

      if (templateError) throw templateError;

      // Apply all permissions
      const permissions = template.permissions.map(perm => ({
        user_id: userId,
        resource_type: perm.resourceType,
        resource_id: perm.resourceId,
        permission_level: perm.level
      }));

      const { data, error } = await supabase
        .from('user_permissions')
        .insert(permissions)
        .select();

      if (error) throw error;
      return data;
    } catch (error) {
      errorHandler.logError('PermissionsService:applyPermissionTemplate', error);
      throw error;
    }
  },

  // Audit permission changes
  async logPermissionChange(userId, action, resourceType, resourceId, details) {
    try {
      if (!userId) throw new Error('User ID is required');
      if (!action) throw new Error('Action is required');

      const { error } = await supabase
        .from('permission_audit_log')
        .insert([{
          user_id: userId,
          action,
          resource_type: resourceType,
          resource_id: resourceId,
          details: details || {},
          timestamp: new Date().toISOString()
        }]);

      if (error) throw error;
      return true;
    } catch (error) {
      errorHandler.logError('PermissionsService:logPermissionChange', error);
      throw error;
    }
  },

  // Get permission audit log
  async getAuditLog(options = {}) {
    try {
      let query = supabase
        .from('permission_audit_log')
        .select('*')
        .order('timestamp', { ascending: false });

      if (options.userId) {
        query = query.eq('user_id', options.userId);
      }

      if (options.limit) {
        query = query.limit(options.limit);
      }

      const { data, error } = await query;
      if (error) throw error;

      return data || [];
    } catch (error) {
      errorHandler.logError('PermissionsService:getAuditLog', error);
      throw error;
    }
  }
};

export default permissionsService;
