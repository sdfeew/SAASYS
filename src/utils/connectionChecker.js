/**
 * Connection Checker
 * Validates all service integrations and data flow
 */

import { supabase } from '../lib/supabase';
import { errorHandler } from './errorHandler';

export const connectionChecker = {
  // Test Supabase connection
  async testSupabaseConnection() {
    try {
      const { data, error } = await supabase.from('tenants').select('count(*)', { count: 'exact' });
      
      if (error) {
        throw error;
      }
      
      return {
        status: 'connected',
        message: 'Supabase connection successful'
      };
    } catch (error) {
      errorHandler.logError('connectionChecker.testSupabaseConnection', error);
      return {
        status: 'disconnected',
        message: 'Failed to connect to Supabase',
        error: errorHandler.getErrorMessage(error)
      };
    }
  },

  // Test authentication
  async testAuthentication() {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      
      if (error || !user) {
        return {
          status: 'not-authenticated',
          message: 'No authenticated user'
        };
      }
      
      return {
        status: 'authenticated',
        message: `User authenticated: ${user.email}`,
        userId: user.id
      };
    } catch (error) {
      errorHandler.logError('connectionChecker.testAuthentication', error);
      return {
        status: 'error',
        message: 'Authentication check failed',
        error: errorHandler.getErrorMessage(error)
      };
    }
  },

  // Test user profile loading
  async testUserProfile() {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        return {
          status: 'not-authenticated',
          message: 'User not authenticated'
        };
      }
      
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      if (error) {
        return {
          status: 'missing',
          message: 'User profile not found in database',
          userId: user.id,
          error: errorHandler.getErrorMessage(error)
        };
      }
      
      return {
        status: 'loaded',
        message: 'User profile loaded successfully',
        profile: {
          id: data?.id,
          email: data?.email,
          fullName: data?.full_name,
          tenantId: data?.tenant_id,
          roleCode: data?.role_code
        }
      };
    } catch (error) {
      errorHandler.logError('connectionChecker.testUserProfile', error);
      return {
        status: 'error',
        message: 'Failed to load user profile',
        error: errorHandler.getErrorMessage(error)
      };
    }
  },

  // Test modules loading
  async testModuleLoading(tenantId) {
    try {
      if (!tenantId) {
        return {
          status: 'missing',
          message: 'Tenant ID required'
        };
      }
      
      const { data, error } = await supabase
        .from('sub_modules')
        .select('*')
        .eq('tenant_id', tenantId)
        .limit(1);
      
      if (error) {
        return {
          status: 'error',
          message: 'Failed to load modules',
          error: errorHandler.getErrorMessage(error)
        };
      }
      
      return {
        status: 'success',
        message: `Found ${data?.length || 0} modules`,
        moduleCount: data?.length || 0
      };
    } catch (error) {
      errorHandler.logError('connectionChecker.testModuleLoading', error);
      return {
        status: 'error',
        message: 'Module loading test failed',
        error: errorHandler.getErrorMessage(error)
      };
    }
  },

  // Run all tests
  async runAllTests(tenantId = null) {
    const results = {
      timestamp: new Date().toISOString(),
      tests: {}
    };
    
    results.tests.database = await this.testSupabaseConnection();
    results.tests.authentication = await this.testAuthentication();
    results.tests.userProfile = await this.testUserProfile();
    
    if (tenantId) {
      results.tests.modules = await this.testModuleLoading(tenantId);
    }
    
    return results;
  },

  // Generate diagnostic report
  async generateDiagnosticReport(tenantId = null) {
    const tests = await this.runAllTests(tenantId);
    
    const report = {
      timestamp: tests.timestamp,
      summary: {
        totalTests: Object.keys(tests.tests).length,
        passedTests: Object.values(tests.tests).filter(t => t.status === 'success' || t.status === 'connected' || t.status === 'authenticated').length,
        failedTests: Object.values(tests.tests).filter(t => t.status === 'error' || t.status === 'disconnected' || t.status === 'not-authenticated' || t.status === 'missing').length
      },
      details: tests.tests,
      recommendations: this.generateRecommendations(tests.tests)
    };
    
    return report;
  },

  // Generate recommendations based on test results
  generateRecommendations(tests) {
    const recommendations = [];
    
    if (tests.database?.status === 'disconnected') {
      recommendations.push('Check Supabase URL and API key in environment variables');
    }
    
    if (tests.authentication?.status === 'not-authenticated') {
      recommendations.push('User needs to log in before accessing protected features');
    }
    
    if (tests.userProfile?.status === 'missing') {
      recommendations.push('User profile needs to be created after signup');
    }
    
    if (tests.modules?.status === 'error') {
      recommendations.push('Check RLS policies for sub_modules table');
      recommendations.push('Verify tenant ID is valid');
    }
    
    if (recommendations.length === 0) {
      recommendations.push('All systems operational');
    }
    
    return recommendations;
  }
};

export default connectionChecker;
