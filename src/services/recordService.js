import { supabase } from '../lib/supabase';
import { calculateRecordFields } from '../utils/FormulaEngine';
import { errorHandler } from '../utils/errorHandler';

export const recordService = {
  async getAll(subModuleId = null, tenantId = null) {
    try {
      console.log('[recordService] getAll called with subModuleId:', subModuleId);
      
      let query = supabase
        ?.from('sub_module_records')
        ?.select('*')
        ?.order('created_at', { ascending: false });
      
      if (subModuleId) {
        query = query?.eq('sub_module_id', subModuleId);
      }
      
      // Filter by tenant if provided (SECURITY)
      if (tenantId) {
        query = query?.eq('tenant_id', tenantId);
      }
      
      const { data, error } = await query;
      
      console.log('[recordService] Query result:', { count: data?.length, error });
      
      if (error) {
        errorHandler.logError('recordService.getAll', error, { subModuleId, tenantId });
        throw error;
      }
      
      console.log('[recordService] Returning data:', data);
      return data;
    } catch (error) {
      errorHandler.logError('recordService.getAll', error);
      throw error;
    }
  },

  async getById(id) {
    try {
      const { data, error } = await supabase
        ?.from('sub_module_records')
        ?.select('*')
        ?.eq('id', id)
        ?.single();
      
      if (error) {
        if (errorHandler.isNotFoundError(error)) {
          console.warn('[recordService] Record not found:', id);
          return null;
        }
        throw error;
      }
      
      return data;
    } catch (error) {
      errorHandler.logError('recordService.getById', error, { id });
      throw error;
    }
  },

  async create(record, fields = []) {
    try {
      const { data: { user } } = await supabase?.auth?.getUser();
      if (!user) throw new Error('Not authenticated');
      
      if (!record?.tenantId) {
        throw new Error('Tenant ID is required to create a record');
      }
      if (!record?.subModuleId) {
        throw new Error('Sub-module ID is required to create a record');
      }

      // Calculate auto-calculated fields
      let recordData = record?.data;
      if (fields && fields.length > 0) {
        recordData = calculateRecordFields(recordData, fields, []);
      }

      // Validate required fields
      const validation = this.validateRecord(recordData, fields);
      if (!validation.isValid) {
        throw new Error(`Validation error: ${JSON.stringify(validation.errors)}`);
      }

      const { data, error } = await supabase
        ?.from('sub_module_records')
        ?.insert({
          id: record?.id,
          tenant_id: record?.tenantId,
          sub_module_id: record?.subModuleId,
          data: recordData,
          status: 'active',
          created_by: user?.id
        })
        ?.select()
        ?.single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      errorHandler.logError('recordService.create', error, { record });
      throw error;
    }
  },

  async update(id, record, fields = []) {
    try {
      console.log('[recordService] update called with id:', id);
      
      // Calculate auto-calculated fields
      let recordData = record?.data;
      if (fields && fields.length > 0) {
        recordData = calculateRecordFields(recordData, fields, []);
      }
      
      // Validate required fields
      const validation = this.validateRecord(recordData, fields);
      if (!validation.isValid) {
        throw new Error(`Validation error: ${JSON.stringify(validation.errors)}`);
      }
      
      const { data, error } = await supabase?.from('sub_module_records')?.update({
          data: recordData,
          updated_at: new Date()?.toISOString()
        })?.eq('id', id)?.select()?.single();
      
      console.log('[recordService] Update result:', { error });
      
      if (error) throw error;
      return data;
    } catch (error) {
      errorHandler.logError('recordService.update', error, { id });
      throw error;
    }
  },

  async delete(id) {
    try {
      console.log('[recordService] delete called with id:', id);
      const { error } = await supabase?.from('sub_module_records')?.delete()?.eq('id', id);
      console.log('[recordService] Delete result:', { error });
      
      if (error) throw error;
    } catch (error) {
      errorHandler.logError('recordService.delete', error, { id });
      throw error;
    }
  },

  async bulkDelete(ids) {
    try {
      console.log('[recordService] bulkDelete called with ids count:', ids?.length);
      const { error } = await supabase?.from('sub_module_records')?.delete()?.in('id', ids);
      console.log('[recordService] BulkDelete result:', { error });
      
      if (error) throw error;
    } catch (error) {
      errorHandler.logError('recordService.bulkDelete', error, { idsCount: ids?.length });
      throw error;
    }
  },

  async bulkUpdate(ids, updateData) {
    console.log('[recordService] bulkUpdate called with ids count:', ids?.length);
    const { error } = await supabase
      ?.from('sub_module_records')
      ?.update(updateData)
      ?.in('id', ids);
    console.log('[recordService] BulkUpdate result:', { error });
    
    if (error) throw error;
  },

  async updateStatus(id, status) {
    const { data, error } = await supabase
      ?.from('sub_module_records')
      ?.update({ status })
      ?.eq('id', id)
      ?.select()
      ?.single();
    
    if (error) throw error;
    return data;
  },

  async bulkUpdateStatus(ids, status) {
    const { error } = await supabase
      ?.from('sub_module_records')
      ?.update({ status })
      ?.in('id', ids);
    
    if (error) throw error;
  },

  // Validation helper
  validateRecord(data, fields = []) {
    const errors = {};
    
    fields?.forEach(field => {
      if (field?.required && (!data?.[field?.name] || String(data?.[field?.name])?.trim() === '')) {
        errors[field?.name] = `${field?.label || field?.name} is required`;
      }
    });
    
    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }
};