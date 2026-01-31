import { supabase } from '../lib/supabase';

const STORAGE_BUCKET = 'record-attachments';
const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB

export const attachmentService = {
  // Upload a file and create attachment record
  async upload(recordId, moduleId, file, tenantId, userId) {
    try {
      if (file.size > MAX_FILE_SIZE) {
        throw new Error(`File size exceeds maximum limit of 100MB`);
      }

      // Generate unique storage path
      const timestamp = Date.now();
      const randomStr = Math.random().toString(36).substring(7);
      const fileName = `${timestamp}-${randomStr}-${file.name}`;
      const storagePath = `${tenantId}/${moduleId}/${recordId}/${fileName}`;

      // Upload to storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from(STORAGE_BUCKET)
        .upload(storagePath, file);

      if (uploadError) throw uploadError;

      // Create attachment record in database
      const { data, error } = await supabase
        .from('attachments')
        .insert({
          record_id: recordId,
          module_id: moduleId,
          tenant_id: tenantId,
          file_name: file.name,
          file_size: file.size,
          file_type: file.type,
          storage_path: storagePath,
          uploaded_by: userId
        })
        .select()
        .single();

      if (error) throw error;

      return {
        ...data,
        url: this.getPublicUrl(storagePath)
      };
    } catch (error) {
      console.error('Error uploading file:', error);
      throw error;
    }
  },

  // Get public URL for a file
  getPublicUrl(storagePath) {
    const { data } = supabase.storage
      .from(STORAGE_BUCKET)
      .getPublicUrl(storagePath);
    return data?.publicUrl;
  },

  // Get signed URL for download (more secure)
  async getDownloadUrl(storagePath) {
    try {
      const { data, error } = await supabase.storage
        .from(STORAGE_BUCKET)
        .createSignedUrl(storagePath, 3600); // Valid for 1 hour

      if (error) throw error;
      return data?.signedUrl;
    } catch (error) {
      console.error('Error getting download URL:', error);
      throw error;
    }
  },

  // Legacy method for compatibility
  async getByRecord(recordId) {
    const { data, error } = await supabase
      ?.from('attachments')
      ?.select('*')
      ?.eq('record_id', recordId)
      ?.order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  // Get all attachments for a record with user info
  async getByRecordAdvanced(recordId, tenantId) {
    try {
      // Fetch attachments
      const { data, error } = await supabase
        .from('attachments')
        .select('*')
        .eq('record_id', recordId)
        .eq('tenant_id', tenantId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Fetch user profiles for each uploader
      const userIds = [...new Set(data?.map(att => att.uploaded_by) || [])];
      let userProfiles = {};
      
      if (userIds.length > 0) {
        const { data: profiles } = await supabase
          .from('user_profiles')
          .select('id, full_name, avatar_url, email')
          .in('id', userIds);
        
        profiles?.forEach(profile => {
          userProfiles[profile.id] = profile;
        });
      }

      // Add user info and signed URLs
      return Promise.all(data?.map(async (attachment) => ({
        ...attachment,
        uploaded_by_user: userProfiles[attachment.uploaded_by] || { id: attachment.uploaded_by },
        downloadUrl: await this.getDownloadUrl(attachment.storage_path)
      })) || []);
    } catch (error) {
      console.error('Error fetching attachments:', error);
      // Return empty array instead of throwing to prevent page crash
      return [];
    }
  },

  async getById(id) {
    const { data, error } = await supabase
      ?.from('attachments')
      ?.select('*')
      ?.eq('id', id)
      ?.single();
    
    if (error) throw error;
    return data;
  },

  async uploadFile(file, tenantId, subModuleId, recordId) {
    const { data: { user } } = await supabase?.auth?.getUser();
    if (!user) throw new Error('Not authenticated');

    const fileExt = file?.name?.split('.')?.pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
    const storagePath = `${tenantId}/${subModuleId}/${recordId}/${fileName}`;

    // Upload file to Supabase Storage
    const { data: storageData, error: storageError } = await supabase
      ?.storage
      ?.from('attachments')
      ?.upload(storagePath, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (storageError) throw storageError;

    // Create attachment record
    const { data, error } = await supabase
      ?.from('attachments')
      ?.insert({
        tenant_id: tenantId,
        sub_module_id: subModuleId,
        record_id: recordId,
        file_name: file?.name,
        file_type: file?.type,
        file_size_bytes: file?.size,
        storage_path: storagePath,
        uploaded_by: user?.id,
        is_public: false
      })
      ?.select()
      ?.single();
    
    if (error) throw error;
    return data;
  },

  async deleteFile(id) {
    const attachment = await this.getById(id);
    if (!attachment) throw new Error('Attachment not found');

    // Delete from storage
    const { error: storageError } = await supabase
      ?.storage
      ?.from('attachments')
      ?.remove([attachment?.storage_path]);

    if (storageError) throw storageError;

    // Delete attachment record
    const { error } = await supabase
      ?.from('attachments')
      ?.delete()
      ?.eq('id', id);
    
    if (error) throw error;
  },

  async getDownloadUrl(id) {
    const attachment = await this.getById(id);
    if (!attachment) throw new Error('Attachment not found');

    const { data } = await supabase
      ?.storage
      ?.from('attachments')
      ?.createSignedUrl(attachment?.storage_path, 3600); // 1 hour expiry

    return data?.signedUrl;
  },

  async getPublicUrl(id) {
    const attachment = await this.getById(id);
    if (!attachment) throw new Error('Attachment not found');

    const { data } = supabase
      ?.storage
      ?.from('attachments')
      ?.getPublicUrl(attachment?.storage_path);

    return data?.publicUrl;
  },

  async makePublic(id) {
    const { data, error } = await supabase
      ?.from('attachments')
      ?.update({ is_public: true })
      ?.eq('id', id)
      ?.select()
      ?.single();
    
    if (error) throw error;
    return data;
  },

  async makePrivate(id) {
    const { data, error } = await supabase
      ?.from('attachments')
      ?.update({ is_public: false })
      ?.eq('id', id)
      ?.select()
      ?.single();
    
    if (error) throw error;
    return data;
  },

  // Delete an attachment (advanced)
  async delete(attachmentId, storagePath) {
    try {
      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from(STORAGE_BUCKET)
        .remove([storagePath]);

      if (storageError) throw storageError;

      // Delete from database
      const { error: dbError } = await supabase
        .from('record_attachments')
        .delete()
        .eq('id', attachmentId);

      if (dbError) throw dbError;

      return true;
    } catch (error) {
      console.error('Error deleting attachment:', error);
      throw error;
    }
  },

  // Get attachment statistics
  async getStats(recordId, tenantId) {
    try {
      const { data, error } = await supabase
        .from('record_attachments')
        .select('file_size, file_type')
        .eq('record_id', recordId)
        .eq('tenant_id', tenantId);

      if (error) throw error;

      const stats = {
        totalCount: data?.length || 0,
        totalSize: data?.reduce((sum, a) => sum + (a.file_size || 0), 0) || 0,
        byType: {}
      };

      data?.forEach(attachment => {
        const type = attachment.file_type || 'unknown';
        stats.byType[type] = (stats.byType[type] || 0) + 1;
      });

      return stats;
    } catch (error) {
      console.error('Error getting attachment stats:', error);
      throw error;
    }
  }
};

export default attachmentService;
