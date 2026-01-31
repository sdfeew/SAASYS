import { supabase } from '../lib/supabase';

export const relationshipService = {
  // Create a relationship between two records
  async createRelationship(sourceRecordId, targetRecordId, sourceModuleId, targetModuleId, relationshipType, tenantId, createdBy, description = '') {
    try {
      const { data, error } = await supabase
        .from('record_relationships')
        .insert({
          source_record_id: sourceRecordId,
          target_record_id: targetRecordId,
          source_module_id: sourceModuleId,
          target_module_id: targetModuleId,
          relationship_type: relationshipType,
          tenant_id: tenantId,
          created_by: createdBy,
          description
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating relationship:', error);
      throw error;
    }
  },

  // Get related records for a given record
  async getRelatedRecords(recordId, tenantId) {
    try {
      const { data, error } = await supabase
        .from('record_relationships')
        .select(`
          *,
          source_record:source_record_id(id, data),
          target_record:target_record_id(id, data),
          source_module:source_module_id(id, name),
          target_module:target_module_id(id, name)
        `)
        .or(`source_record_id.eq.${recordId},target_record_id.eq.${recordId}`)
        .eq('tenant_id', tenantId);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching related records:', error);
      return [];
    }
  },

  // Get outgoing relationships (source = recordId)
  async getOutgoingRelationships(recordId, tenantId) {
    try {
      const { data, error } = await supabase
        .from('record_relationships')
        .select(`
          *,
          target_record:target_record_id(id, data),
          target_module:target_module_id(id, name),
          created_by_user:created_by(full_name, avatar_url, email)
        `)
        .eq('source_record_id', recordId)
        .eq('tenant_id', tenantId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching outgoing relationships:', error);
      return [];
    }
  },

  // Get incoming relationships (target = recordId)
  async getIncomingRelationships(recordId, tenantId) {
    try {
      const { data, error } = await supabase
        .from('record_relationships')
        .select(`
          *,
          source_record:source_record_id(id, data),
          source_module:source_module_id(id, name),
          created_by_user:created_by(full_name, avatar_url, email)
        `)
        .eq('target_record_id', recordId)
        .eq('tenant_id', tenantId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching incoming relationships:', error);
      return [];
    }
  },

  // Delete a relationship
  async deleteRelationship(relationshipId) {
    try {
      const { error } = await supabase
        .from('record_relationships')
        .delete()
        .eq('id', relationshipId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting relationship:', error);
      throw error;
    }
  },

  // Check if relationship exists
  async relationshipExists(sourceRecordId, targetRecordId, relationshipType, tenantId) {
    try {
      const { data, error } = await supabase
        .from('record_relationships')
        .select('id')
        .eq('source_record_id', sourceRecordId)
        .eq('target_record_id', targetRecordId)
        .eq('relationship_type', relationshipType)
        .eq('tenant_id', tenantId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return !!data;
    } catch (error) {
      console.error('Error checking relationship:', error);
      return false;
    }
  },

  // Get relationship count
  async getCount(recordId, tenantId) {
    try {
      const { count, error } = await supabase
        .from('record_relationships')
        .select('*', { count: 'exact', head: true })
        .or(`source_record_id.eq.${recordId},target_record_id.eq.${recordId}`)
        .eq('tenant_id', tenantId);

      if (error) throw error;
      return count || 0;
    } catch (error) {
      console.error('Error getting relationship count:', error);
      return 0;
    }
  },

  // Search related records
  async searchRelatedRecords(recordId, tenantId, searchTerm) {
    try {
      const { data, error } = await supabase
        .from('record_relationships')
        .select(`
          *,
          source_record:source_record_id(id, data),
          target_record:target_record_id(id, data),
          source_module:source_module_id(id, name),
          target_module:target_module_id(id, name)
        `)
        .or(`source_record_id.eq.${recordId},target_record_id.eq.${recordId}`)
        .eq('tenant_id', tenantId)
        .ilike('relationship_type', `%${searchTerm}%`);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error searching related records:', error);
      return [];
    }
  }
};

export default relationshipService;
