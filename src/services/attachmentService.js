import { supabase } from '../lib/supabase';

export const attachmentService = {
  async getByRecord(recordId) {
    const { data, error } = await supabase
      ?.from('attachments')
      ?.select('*')
      ?.eq('record_id', recordId)
      ?.order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
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
  }
};
