import React, { useState } from 'react';
import { Search, ChevronDown, BookOpen, Lightbulb, HelpCircle, FileText } from 'lucide-react';
import Accordion from '../../components/ui/Accordion';

const HelpPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('getting-started');

  const categories = {
    'getting-started': {
      title: 'Getting Started',
      icon: BookOpen,
      articles: [
        {
          id: 1,
          title: 'Create Your First Module',
          content: `Modules are the core building blocks of your SaaS. Here's how to create one:
1. Go to Schema Builder
2. Click "New Module"
3. Enter module name and description
4. Add fields using the field builder
5. Configure permissions and settings
6. Save and publish`
        },
        {
          id: 2,
          title: 'Add Records to Your Module',
          content: `Once you have a module, add records:
1. Navigate to the module
2. Click "New Record"
3. Fill in all required fields
4. Attach files if needed
5. Add comments and tags
6. Save the record`
        },
        {
          id: 3,
          title: 'Create Your First Dashboard',
          content: `Visualize your data with dashboards:
1. Go to Dashboard Builder
2. Click "New Dashboard"
3. Add widgets by clicking "Add Widget"
4. Configure each widget's data source
5. Customize charts and tables
6. Save and publish the dashboard`
        }
      ]
    },
    'features': {
      title: 'Features & How To',
      icon: Lightbulb,
      articles: [
        {
          id: 1,
          title: 'Using Workflows',
          content: `Automate your processes with workflows:
1. Define triggers (record created, field changed, etc.)
2. Set up actions (send email, update record, etc.)
3. Configure conditions and logic
4. Test the workflow
5. Activate when ready`
        },
        {
          id: 2,
          title: 'Import & Export Data',
          content: `Move data in and out of your system:
1. For import: Go to module > Import
2. Choose CSV or JSON file
3. Map fields to columns
4. Review preview
5. Confirm import
6. For export: Use the export button to download data`
        },
        {
          id: 3,
          title: 'Collaborate with Comments',
          content: `Team collaboration features:
1. Open any record
2. Go to Comments tab
3. Type your comment
4. Mention team members with @name
5. Attach files to comments
6. Resolve conversations`
        },
        {
          id: 4,
          title: 'Advanced Filtering',
          content: `Filter records with power and precision:
1. Click the Filter button
2. Add filter conditions
3. Choose operators (equals, contains, etc.)
4. Set values
5. Combine multiple filters with AND/OR
6. Save filter as preset`
        },
        {
          id: 5,
          title: 'Real-time Collaboration',
          content: `See updates instantly:
1. Multiple users can edit simultaneously
2. Changes appear in real-time
3. Activity log shows all changes
4. Notifications for important updates
5. Conflict resolution for simultaneous edits`
        }
      ]
    },
    'admin': {
      title: 'Administration',
      icon: HelpCircle,
      articles: [
        {
          id: 1,
          title: 'User Management',
          content: `Manage team members:
1. Go to User Management
2. Click "Add User"
3. Enter email address
4. Select role (Admin, Manager, User)
5. Configure permissions
6. Send invitation`
        },
        {
          id: 2,
          title: 'Tenant Settings',
          content: `Configure your workspace:
1. Go to Tenant Settings
2. Update company name and logo
3. Configure default permissions
4. Set up custom fields
5. Configure integrations
6. Save changes`
        },
        {
          id: 3,
          title: 'Role-Based Access Control',
          content: `Control what users can do:
1. Define custom roles
2. Assign permissions per role
3. Configure module-level access
4. Set field-level visibility
5. Create custom workflows for roles
6. Apply roles to users`
        },
        {
          id: 4,
          title: 'Backup & Recovery',
          content: `Protect your data:
1. Automatic daily backups
2. Manual backup available
3. 30-day retention policy
4. One-click restore
5. Point-in-time recovery
6. Export full database`
        }
      ]
    },
    'best-practices': {
      title: 'Best Practices',
      icon: FileText,
      articles: [
        {
          id: 1,
          title: 'Data Organization',
          content: `Keep your data clean and organized:
1. Use consistent naming conventions
2. Define clear field requirements
3. Validate data at entry point
4. Regular data audits
5. Archive old records
6. Document custom fields`
        },
        {
          id: 2,
          title: 'Performance Tips',
          content: `Optimize your system:
1. Use filters instead of loading all records
2. Archive completed projects
3. Remove unused fields
4. Optimize dashboard queries
5. Use pagination for large datasets
6. Cache frequently accessed data`
        },
        {
          id: 3,
          title: 'Security Best Practices',
          content: `Keep your system secure:
1. Use strong passwords
2. Enable two-factor authentication
3. Review user permissions regularly
4. Use HTTPS for all connections
5. Regular security audits
6. Keep backups encrypted`
        },
        {
          id: 4,
          title: 'Team Collaboration',
          content: `Work effectively with your team:
1. Use clear commenting
2. Follow naming conventions
3. Document processes
4. Regular team meetings
5. Share dashboards and reports
6. Use @mentions for visibility`
        }
      ]
    }
  };

  const allArticles = Object.values(categories).flatMap(cat =>
    cat.articles.map(article => ({
      ...article,
      category: cat.title
    }))
  );

  const filteredArticles = searchQuery
    ? allArticles.filter(article =>
      article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.content.toLowerCase().includes(searchQuery.toLowerCase())
    )
    : null;

  const displayArticles = filteredArticles || categories[activeCategory]?.articles || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <h1 className="text-4xl font-bold text-gray-900 flex items-center">
            <HelpCircle className="mr-3" size={32} />
            Help & Documentation
          </h1>
          <p className="text-gray-600 mt-2">Find answers and learn how to use our platform</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Search */}
        <div className="mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-3 text-gray-400" size={20} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for help..."
              className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Categories */}
        {!searchQuery && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            {Object.entries(categories).map(([key, category]) => {
              const Icon = category.icon;
              return (
                <button
                  key={key}
                  onClick={() => setActiveCategory(key)}
                  className={`p-6 rounded-lg border-2 transition-all text-left ${
                    activeCategory === key
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                >
                  <Icon className={`mb-3 ${activeCategory === key ? 'text-blue-500' : 'text-gray-500'}`} size={24} />
                  <h3 className="font-semibold text-gray-900">{category.title}</h3>
                  <p className="text-sm text-gray-600 mt-1">{category.articles.length} articles</p>
                </button>
              );
            })}
          </div>
        )}

        {/* Articles */}
        <div className="space-y-4">
          {displayArticles.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-8 text-center">
              <Search size={48} className="mx-auto text-gray-300 mb-4" />
              <p className="text-gray-600">No articles found matching your search</p>
            </div>
          ) : (
            displayArticles.map(article => (
              <Accordion
                key={article.id}
                title={article.title}
                subtitle={searchQuery ? article.category : undefined}
              >
                <div className="text-gray-700 whitespace-pre-wrap">{article.content}</div>
              </Accordion>
            ))
          )}
        </div>

        {/* FAQ Section */}
        <div className="mt-12 bg-white rounded-lg shadow p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Frequently Asked Questions</h2>
          
          <div className="space-y-4">
            <Accordion title="How do I reset my password?">
              <p className="text-gray-700">
                Click "Forgot Password" on the login page, enter your email, and follow the instructions sent to your inbox.
              </p>
            </Accordion>

            <Accordion title="Can I have multiple workspaces?">
              <p className="text-gray-700">
                Yes! You can create or join multiple tenants. Use the tenant selector to switch between them.
              </p>
            </Accordion>

            <Accordion title="How is my data backed up?">
              <p className="text-gray-700">
                All data is automatically backed up daily. You can also perform manual backups from settings.
              </p>
            </Accordion>

            <Accordion title="Can I export my data?">
              <p className="text-gray-700">
                Yes! Use the export feature in any module to download data as CSV or JSON files.
              </p>
            </Accordion>

            <Accordion title="How do I invite team members?">
              <p className="text-gray-700">
                Go to User Management and click "Add User". Enter their email and select their role.
              </p>
            </Accordion>
          </div>
        </div>

        {/* Contact Section */}
        <div className="mt-8 bg-blue-50 rounded-lg border border-blue-200 p-6 text-center">
          <h3 className="text-xl font-bold text-gray-900 mb-2">Still need help?</h3>
          <p className="text-gray-600 mb-4">Contact our support team for personalized assistance</p>
          <button className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
            Contact Support
          </button>
        </div>
      </div>
    </div>
  );
};

export default HelpPage;
