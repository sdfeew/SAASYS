import { supabase } from '../lib/supabase';
import { errorHandler } from '../utils/errorHandler';

export const moduleService = {
  // Main Modules - System-wide (read-only from frontend)
  async getAllMainModules() {
    try {
      const { data, error } = await supabase
        ?.from('main_modules')
        ?.select('*')
        ?.eq('status', 'active')
        ?.order('code');
      
      if (error) throw error;
      return data;
    } catch (error) {
      errorHandler.logError('moduleService.getAllMainModules', error);
      throw error;
    }
  },

  async getMainModuleByCode(code) {
    try {
      const { data, error } = await supabase
        ?.from('main_modules')
        ?.select('*')
        ?.eq('code', code)
        ?.eq('status', 'active')
        ?.single();
      
      if (error) {
        if (errorHandler.isNotFoundError(error)) {
          return null;
        }
        throw error;
      }
      return data;
    } catch (error) {
      errorHandler.logError('moduleService.getMainModuleByCode', error, { code });
      throw error;
    }
  },

  async createMainModule(mainModule) {
    try {
      // Generate code from name if not provided
      let code = mainModule?.code;
      if (!code) {
        // Convert name to code (e.g., "My Module" -> "MY_MODULE")
        code = (mainModule?.name || 'MODULE')
          .toString()
          .toUpperCase()
          .replace(/\s+/g, '_')
          .replace(/[^A-Z0-9_]/g, '');
      }
      
      const { data, error } = await supabase
        ?.from('main_modules')
        ?.insert({
          code: code.toUpperCase(),
          name: mainModule?.name || { en: 'Unnamed', ar: 'بدون اسم' },
          description: mainModule?.description || { en: '', ar: '' },
          icon: mainModule?.icon || 'Folder',
          status: 'active'
        })
        ?.select('*')
        ?.single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      errorHandler.logError('moduleService.createMainModule', error, { mainModule });
      throw error;
    }
  },

  // Sub-modules - Tenant-specific
  async getAllSubModules(tenantId) {
    try {
      console.log('[moduleService] getAllSubModules called with tenantId:', tenantId);
      
      if (!tenantId) {
        throw new Error('Tenant ID is required to fetch sub-modules');
      }
      
      const { data, error } = await supabase
        ?.from('sub_modules')
        ?.select('*')
        ?.eq('tenant_id', tenantId)
        ?.order('order_index');
      
      console.log('[moduleService] Supabase response:', { data, error });
      
      if (error) {
        errorHandler.logError('moduleService.getAllSubModules', error, { tenantId });
        throw error;
      }
      
      console.log('[moduleService] Returning data:', data);
      return data;
    } catch (error) {
      errorHandler.logError('moduleService.getAllSubModules', error, { tenantId });
      throw error;
    }
  },

  async getSubModuleByCode(tenantId, code) {
    try {
      const { data, error } = await supabase
        ?.from('sub_modules')
        ?.select('*')
        ?.eq('tenant_id', tenantId)
        ?.eq('code', code)
        ?.single();
      
      if (error) {
        if (errorHandler.isNotFoundError(error)) {
          return null;
        }
        throw error;
      }
      return data;
    } catch (error) {
      errorHandler.logError('moduleService.getSubModuleByCode', error, { tenantId, code });
      throw error;
    }
  },

  async getSubModuleById(id) {
    try {
      const { data, error } = await supabase
        ?.from('sub_modules')
        ?.select('*')
        ?.eq('id', id)
        ?.single();
      
      if (error) {
        if (errorHandler.isNotFoundError(error)) {
          return null;
        }
        throw error;
      }
      return data;
    } catch (error) {
      errorHandler.logError('moduleService.getSubModuleById', error, { id });
      throw error;
    }
  },

  async createSubModule(tenantId, subModule) {
    try {
      const { data, error } = await supabase
        ?.from('sub_modules')
        ?.insert({
          tenant_id: tenantId,
          main_module_id: subModule?.mainModuleId,
          code: subModule?.code?.toUpperCase(),
          name: subModule?.name,
          description: subModule?.description || {},
          icon: subModule?.icon,
          status: 'active'
        })
        ?.select('*')
        ?.single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      errorHandler.logError('moduleService.createSubModule', error, { tenantId, subModule });
      throw error;
    }
  },

  async updateSubModule(id, subModule) {
    try {
      const { data, error } = await supabase
        ?.from('sub_modules')
        ?.update({
          name: subModule?.name,
          description: subModule?.description,
          icon: subModule?.icon,
          status: subModule?.status
        })
        ?.eq('id', id)
        ?.select('*')
        ?.single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      errorHandler.logError('moduleService.updateSubModule', error, { id, subModule });
      throw error;
    }
  },

  async deleteSubModule(id) {
    try {
      const { error } = await supabase
        ?.from('sub_modules')
        ?.delete()
        ?.eq('id', id);
      
      if (error) throw error;
    } catch (error) {
      errorHandler.logError('moduleService.deleteSubModule', error, { id });
      throw error;
    }
  },

  // Get all sub-modules for a main module
  async getSubModulesByMainModule(tenantId, mainModuleId) {
    try {
      const { data, error } = await supabase
        ?.from('sub_modules')
        ?.select('*')
        ?.eq('tenant_id', tenantId)
        ?.eq('main_module_id', mainModuleId)
        ?.eq('status', 'active')
        ?.order('order_index');
      
      if (error) throw error;
      return data;
    } catch (error) {
      errorHandler.logError('moduleService.getSubModulesByMainModule', error, { tenantId, mainModuleId });
      throw error;
    }
  }
};
