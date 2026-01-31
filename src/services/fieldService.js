import { supabase } from '../lib/supabase';
import { errorHandler } from '../utils/errorHandler';

export const fieldService = {
  async getAllFields(subModuleId) {
    try {
      if (!subModuleId) {
        throw new Error('Sub-module ID is required to fetch fields');
      }

      const { data, error } = await supabase
        ?.from('sub_module_fields')
        ?.select('*')
        ?.eq('sub_module_id', subModuleId)
        ?.eq('status', 'active')
        ?.order('order_index');
      
      if (error) throw error;
      return data;
    } catch (error) {
      errorHandler.logError('fieldService.getAllFields', error, { subModuleId });
      throw error;
    }
  },

  async getFieldById(id) {
    try {
      const { data, error } = await supabase
        ?.from('sub_module_fields')
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
      errorHandler.logError('fieldService.getFieldById', error, { id });
      throw error;
    }
  },

  async createField(tenantId, subModuleId, field) {
    try {
      if (!tenantId || !subModuleId) {
        throw new Error('Tenant ID and Sub-module ID are required to create a field');
      }
      if (!field?.name) {
        throw new Error('Field name is required');
      }

      const { data, error } = await supabase
        ?.from('sub_module_fields')
        ?.insert({
          tenant_id: tenantId,
          sub_module_id: subModuleId,
          name: field?.name,
          label: field?.label,
          data_type: field?.dataType,
          required: field?.required || false,
          unique_constraint: field?.uniqueConstraint || false,
          default_value: field?.defaultValue,
          validation_rules: field?.validationRules || [],
          ui_config: field?.uiConfig || {},
          is_filter: field?.isFilter || false,
          is_indexed: field?.isIndexed || false,
          is_visible_in_list: field?.isVisibleInList !== false,
          order_index: field?.orderIndex || 0,
          relation_config: field?.relationConfig || {},
          status: 'active'
        })
        ?.select()
        ?.single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      errorHandler.logError('fieldService.createField', error, { tenantId, subModuleId, field });
      throw error;
    }
  },

  async updateField(id, field) {
    try {
      const { data, error } = await supabase
        ?.from('sub_module_fields')
        ?.update({
          label: field?.label,
          data_type: field?.dataType,
          required: field?.required,
          unique_constraint: field?.uniqueConstraint,
          default_value: field?.defaultValue,
          validation_rules: field?.validationRules,
          ui_config: field?.uiConfig,
          is_filter: field?.isFilter,
          is_indexed: field?.isIndexed,
          is_visible_in_list: field?.isVisibleInList,
          order_index: field?.orderIndex,
          relation_config: field?.relationConfig,
          status: field?.status
        })
        ?.eq('id', id)
        ?.select()
        ?.single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      errorHandler.logError('fieldService.updateField', error, { id, field });
      throw error;
    }
  },

  async deleteField(id) {
    try {
      const { error } = await supabase
        ?.from('sub_module_fields')
        ?.delete()
        ?.eq('id', id);
      
      if (error) throw error;
    } catch (error) {
      errorHandler.logError('fieldService.deleteField', error, { id });
      throw error;
    }
  },

  async reorderFields(fields) {
    try {
      const updates = fields.map((field, index) => ({
        id: field.id,
        order_index: index
      }));

      const { error } = await supabase
        ?.from('sub_module_fields')
        ?.upsert(updates);
      
      if (error) throw error;
    } catch (error) {
      errorHandler.logError('fieldService.reorderFields', error, { fieldsCount: fields?.length });
      throw error;
    }
  },

  // Get fields with their relations configured
  async getFieldsWithRelations(subModuleId) {
    try {
      const { data, error } = await supabase
        ?.from('sub_module_fields')
        ?.select(`
          *,
          referenced_module:relation_config->>'reference_table'
        `)
        ?.eq('sub_module_id', subModuleId)
        ?.eq('status', 'active')
        ?.order('order_index');
      
      if (error) throw error;
      return data;
    } catch (error) {
      errorHandler.logError('fieldService.getFieldsWithRelations', error, { subModuleId });
      throw error;
    }
  }
};
