import { supabase } from '../lib/supabase';
import { errorHandler } from '../utils/errorHandler';

/**
 * Workflow and Automation Service
 * Manages workflow definitions, triggers, actions, and execution logs
 */

export const workflowService = {
  // Get all workflows for a module
  async getAllWorkflows(moduleId) {
    try {
      if (!moduleId) throw new Error('Module ID is required');

      const { data, error } = await supabase
        .from('workflows')
        .select('*')
        .eq('module_id', moduleId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      errorHandler.logError('WorkflowService:getAllWorkflows', error);
      throw error;
    }
  },

  // Get workflow by ID
  async getWorkflowById(id) {
    try {
      if (!id) throw new Error('Workflow ID is required');

      const { data, error } = await supabase
        .from('workflows')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      errorHandler.logError('WorkflowService:getWorkflowById', error);
      return null;
    }
  },

  // Create new workflow
  async createWorkflow(workflowData) {
    try {
      if (!workflowData?.module_id) throw new Error('Module ID is required');
      if (!workflowData?.name) throw new Error('Workflow name is required');

      const { data, error } = await supabase
        .from('workflows')
        .insert([{
          ...workflowData,
          status: workflowData.status || 'draft',
          created_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      errorHandler.logError('WorkflowService:createWorkflow', error);
      throw error;
    }
  },

  // Update workflow
  async updateWorkflow(id, updates) {
    try {
      if (!id) throw new Error('Workflow ID is required');

      const { data, error } = await supabase
        .from('workflows')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      errorHandler.logError('WorkflowService:updateWorkflow', error);
      throw error;
    }
  },

  // Delete workflow
  async deleteWorkflow(id) {
    try {
      if (!id) throw new Error('Workflow ID is required');

      const { error } = await supabase
        .from('workflows')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return true;
    } catch (error) {
      errorHandler.logError('WorkflowService:deleteWorkflow', error);
      throw error;
    }
  },

  // Publish workflow
  async publishWorkflow(id) {
    try {
      if (!id) throw new Error('Workflow ID is required');

      return this.updateWorkflow(id, { status: 'active' });
    } catch (error) {
      errorHandler.logError('WorkflowService:publishWorkflow', error);
      throw error;
    }
  },

  // Disable workflow
  async disableWorkflow(id) {
    try {
      if (!id) throw new Error('Workflow ID is required');

      return this.updateWorkflow(id, { status: 'inactive' });
    } catch (error) {
      errorHandler.logError('WorkflowService:disableWorkflow', error);
      throw error;
    }
  },

  // Get workflow triggers
  async getWorkflowTriggers(workflowId) {
    try {
      if (!workflowId) throw new Error('Workflow ID is required');

      const { data, error } = await supabase
        .from('workflow_triggers')
        .select('*')
        .eq('workflow_id', workflowId);

      if (error) throw error;
      return data || [];
    } catch (error) {
      errorHandler.logError('WorkflowService:getWorkflowTriggers', error);
      throw error;
    }
  },

  // Add trigger to workflow
  async addTrigger(workflowId, triggerData) {
    try {
      if (!workflowId) throw new Error('Workflow ID is required');
      if (!triggerData?.type) throw new Error('Trigger type is required');

      const { data, error } = await supabase
        .from('workflow_triggers')
        .insert([{
          workflow_id: workflowId,
          ...triggerData,
          created_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      errorHandler.logError('WorkflowService:addTrigger', error);
      throw error;
    }
  },

  // Get workflow actions
  async getWorkflowActions(workflowId) {
    try {
      if (!workflowId) throw new Error('Workflow ID is required');

      const { data, error } = await supabase
        .from('workflow_actions')
        .select('*')
        .eq('workflow_id', workflowId)
        .order('sequence', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      errorHandler.logError('WorkflowService:getWorkflowActions', error);
      throw error;
    }
  },

  // Add action to workflow
  async addAction(workflowId, actionData) {
    try {
      if (!workflowId) throw new Error('Workflow ID is required');
      if (!actionData?.type) throw new Error('Action type is required');

      const { data, error } = await supabase
        .from('workflow_actions')
        .insert([{
          workflow_id: workflowId,
          ...actionData,
          created_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      errorHandler.logError('WorkflowService:addAction', error);
      throw error;
    }
  },

  // Update action sequence
  async updateActionSequence(workflowId, actions) {
    try {
      if (!workflowId) throw new Error('Workflow ID is required');

      // Update each action's sequence
      for (let i = 0; i < actions.length; i++) {
        const { error } = await supabase
          .from('workflow_actions')
          .update({ sequence: i + 1 })
          .eq('id', actions[i].id);

        if (error) throw error;
      }

      return true;
    } catch (error) {
      errorHandler.logError('WorkflowService:updateActionSequence', error);
      throw error;
    }
  },

  // Delete action
  async deleteAction(actionId) {
    try {
      if (!actionId) throw new Error('Action ID is required');

      const { error } = await supabase
        .from('workflow_actions')
        .delete()
        .eq('id', actionId);

      if (error) throw error;
      return true;
    } catch (error) {
      errorHandler.logError('WorkflowService:deleteAction', error);
      throw error;
    }
  },

  // Execute workflow manually
  async executeWorkflow(workflowId, recordId) {
    try {
      if (!workflowId) throw new Error('Workflow ID is required');
      if (!recordId) throw new Error('Record ID is required');

      const { data, error } = await supabase
        .from('workflow_executions')
        .insert([{
          workflow_id: workflowId,
          record_id: recordId,
          status: 'pending',
          created_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      errorHandler.logError('WorkflowService:executeWorkflow', error);
      throw error;
    }
  },

  // Get workflow execution logs
  async getExecutionLogs(workflowId, limit = 50) {
    try {
      if (!workflowId) throw new Error('Workflow ID is required');

      const { data, error } = await supabase
        .from('workflow_executions')
        .select('*')
        .eq('workflow_id', workflowId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (error) {
      errorHandler.logError('WorkflowService:getExecutionLogs', error);
      throw error;
    }
  },

  // Get execution details
  async getExecutionDetails(executionId) {
    try {
      if (!executionId) throw new Error('Execution ID is required');

      const { data, error } = await supabase
        .from('workflow_executions')
        .select('*')
        .eq('id', executionId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      errorHandler.logError('WorkflowService:getExecutionDetails', error);
      return null;
    }
  }
};

export default workflowService;
