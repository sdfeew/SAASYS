import { supabase } from '../lib/supabase';

export const fieldService = {
  async getAllFields(subModuleId) {
    const { data, error } = await supabase
      ?.from('sub_module_fields')
      ?.select('*')
      ?.eq('sub_module_id', subModuleId)
      ?.eq('status', 'active')
      ?.order('order_index');
    
    if (error) throw error;
    return data;
  },

  async getFieldById(id) {
    const { data, error } = await supabase
      ?.from('sub_module_fields')
      ?.select('*')
      ?.eq('id', id)
      ?.single();
    
    if (error) throw error;
    return data;
  },

  async createField(tenantId, subModuleId, field) {
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
  },

  async updateField(id, field) {
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
  },

  async deleteField(id) {
    const { error } = await supabase
      ?.from('sub_module_fields')
      ?.delete()
      ?.eq('id', id);
    
    if (error) throw error;
  },

  async reorderFields(fields) {
    const updates = fields.map((field, index) => ({
      id: field.id,
      order_index: index
    }));

    const { error } = await supabase
      ?.from('sub_module_fields')
      ?.upsert(updates);
    
    if (error) throw error;
  },

  // Get fields with their relations configured
  async getFieldsWithRelations(subModuleId) {
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
  }
};
