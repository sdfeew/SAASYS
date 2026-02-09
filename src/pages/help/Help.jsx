import React, { useState, useMemo } from 'react';
import { HelpCircle, Search, Book, AlertCircle, Star, MessageSquare, Video, FileText, ExternalLink, Send, Eye, Mail } from 'lucide-react';
import { useToast } from '../../contexts/ToastContext';
import { PageContainer, PageCard, PageSection } from '../../components/layout/PageComponents';
import AdminSidebar from '../../components/ui/AdminSidebar';
import Icon from '../../components/AppIcon';

const HelpPage = () => {
  const toast = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [ratings, setRatings] = useState({});
  const [contactForm, setContactForm] = useState({ name: '', email: '', category: '', message: '' });
  const [showContactForm, setShowContactForm] = useState(false);
  const [expandedArticle, setExpandedArticle] = useState(null);

  const categories = [
    { id: 'all', label: 'All Topics', icon: 'HelpCircle' },
    { id: 'dashboards', label: 'Dashboards', icon: 'BarChart3' },
    { id: 'modules', label: 'Modules', icon: 'Package' },
    { id: 'users', label: 'User Management', icon: 'Users' },
    { id: 'data', label: 'Data & Backup', icon: 'Database' },
    { id: 'general', label: 'General', icon: 'HelpCircle' }
  ];

  const articles = [
    {
      id: 1,
      title: 'How do I create a new dashboard?',
      category: 'dashboards',
      content: 'Go to Dashboard Builder from the sidebar, click "Create Dashboard" and follow the wizard to set up your dashboard. You can customize the layout, add widgets, and configure data sources. Dashboard supports multiple chart types including bar, line, pie, and area charts.',
      views: 1250,
      rating: 4.8,
      type: 'article',
      readTime: '5 min'
    },
    {
      id: 2,
      title: 'Adding and configuring widgets',
      category: 'dashboards',
      content: 'In Dashboard Builder, use the right panel to select chart types, choose your data source, and configure the widget. Widget data updates automatically when source data changes. You can set refresh rates and export widget data.',
      views: 890,
      rating: 4.6,
      type: 'video',
      readTime: '8 min'
    },
    {
      id: 3,
      title: 'Sharing dashboards with team',
      category: 'dashboards',
      content: 'Use the Share button in Dashboard Management to generate a shareable link or invite specific users. You can control permission levels for each shared dashboard. Set expiration dates for temporary access links.',
      views: 756,
      rating: 4.7,
      type: 'article',
      readTime: '4 min'
    },
    {
      id: 4,
      title: 'Managing user permissions',
      category: 'users',
      content: 'Go to User Management Console to create users, assign roles, and manage access permissions for different modules. Roles include Admin, Manager, User, and Viewer. Control granular access at module and field levels.',
      views: 2150,
      rating: 4.9,
      type: 'article',
      readTime: '6 min'
    },
    {
      id: 5,
      title: 'User roles and permissions explained',
      category: 'users',
      content: 'Admin: Full access to all modules. Manager: Can create and manage content. User: Can view and edit assigned content. Viewer: Read-only access to dashboards and reports.',
      views: 1890,
      rating: 4.8,
      type: 'video',
      readTime: '7 min'
    },
    {
      id: 6,
      title: 'Creating custom modules',
      category: 'modules',
      content: 'Use Schema Builder to design custom modules with fields of various types including text, numbers, and references. Define relationships between modules for a connected data structure. Set up validation rules automatically.',
      views: 945,
      rating: 4.5,
      type: 'article',
      readTime: '9 min'
    },
    {
      id: 7,
      title: 'Database backup and recovery',
      category: 'data',
      content: 'Use the Backups page to create automatic or manual backups of your database and configurations. Schedule regular backups for data protection. Restore from any backup point with one click.',
      views: 1567,
      rating: 4.9,
      type: 'article',
      readTime: '5 min'
    },
    {
      id: 8,
      title: 'Data migration from legacy systems',
      category: 'data',
      content: 'Import data using CSV or JSON formats. Use the import wizard for data mapping and validation before importing into your modules. Batch operations for large datasets.',
      views: 678,
      rating: 4.4,
      type: 'video',
      readTime: '12 min'
    },
    {
      id: 9,
      title: 'Getting started with TenantFlow',
      category: 'general',
      content: 'Welcome to TenantFlow! This guide covers basic navigation, creating your first dashboard, and inviting team members to collaborate. Step-by-step walkthrough of core features.',
      views: 3420,
      rating: 4.8,
      type: 'video',
      readTime: '10 min'
    },
    {
      id: 10,
      title: 'API documentation and integration',
      category: 'general',
      content: 'Access our REST API documentation to integrate TenantFlow with external applications. Include API keys in request headers. Full webhook support for real-time events.',
      views: 1245,
      rating: 4.7,
      type: 'article',
      readTime: '15 min'
    }
  ];

  const filteredArticles = useMemo(() => {
    return articles.filter(article => {
      const matchesCategory = selectedCategory === 'all' || article.category === selectedCategory;
      const matchesSearch = article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           article.content.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [searchTerm, selectedCategory]);

  const handleRating = (articleId, rating) => {
    setRatings(prev => ({
      ...prev,
      [articleId]: rating
    }));
    toast.success(`Rated ${rating} stars!`);
  };

  const handleContactSubmit = (e) => {
    e.preventDefault();
    if (!contactForm.name || !contactForm.email || !contactForm.message) {
      toast.warning('Please fill all fields');
      return;
    }
    toast.success('Support ticket created! We\'ll contact you soon.');
    setContactForm({ name: '', email: '', category: '', message: '' });
    setShowContactForm(false);
  };

  const stats = [
    { label: 'Total Articles', value: articles.length, icon: 'FileText', color: 'blue' },
    { label: 'Total Views', value: articles.reduce((sum, a) => sum + a.views, 0).toLocaleString(), icon: 'Eye', color: 'green' },
    { label: 'Avg Rating', value: (articles.reduce((sum, a) => sum + a.rating, 0) / articles.length).toFixed(1), icon: 'Star', color: 'yellow' }
  ];

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <AdminSidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="sticky top-0 z-30 bg-card border-b border-border shadow-elevation-1">
          <div className="px-4 md:px-6 lg:px-8 py-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <HelpCircle className="text-primary" size={20} />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-heading font-semibold text-foreground">Help & Documentation</h1>
                <p className="text-sm text-muted-foreground">Find answers and learn how to use TenantFlow</p>
              </div>
            </div>

            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
              <input
                type="text"
                placeholder="Search articles, FAQs, tutorials..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-muted border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-auto">
          <PageContainer>
            {/* Stats */}
            <PageSection>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6">
                {stats.map((stat, idx) => (
                  <PageCard key={idx}>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">{stat.label}</p>
                        <p className="text-3xl font-heading font-bold text-foreground">{stat.value}</p>
                      </div>
                      <div className={`w-12 h-12 rounded-lg bg-${stat.color}-50 flex items-center justify-center`}>
                        <Icon name={stat.icon} size={24} />
                      </div>
                    </div>
                  </PageCard>
                ))}
              </div>
            </PageSection>

            {/* Categories */}
            <PageSection title="Browse by Category">
              <div className="flex gap-2 md:gap-3 overflow-x-auto pb-2">
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap transition-smooth ${
                      selectedCategory === cat.id
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-foreground hover:bg-muted/80'
                    }`}
                  >
                    <Icon name={cat.icon} size={16} />
                    {cat.label}
                  </button>
                ))}
              </div>
            </PageSection>

            {/* Articles */}
            <PageSection title={`${filteredArticles.length} Articles Found`}>
              <div className="space-y-4">
                {filteredArticles.length > 0 ? (
                  filteredArticles.map((article) => (
                    <PageCard
                      key={article.id}
                      className="hover:shadow-elevation-2 transition-all cursor-pointer"
                      onClick={() => setExpandedArticle(expandedArticle === article.id ? null : article.id)}
                    >
                      <div className="space-y-3">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2">
                              {article.type === 'video' ? (
                                <Video size={16} className="text-accent flex-shrink-0" />
                              ) : (
                                <FileText size={16} className="text-primary flex-shrink-0" />
                              )}
                              <span className="text-xs font-medium text-muted-foreground uppercase">
                                {article.readTime}
                              </span>
                            </div>
                            <h3 className="text-base md:text-lg font-semibold text-foreground break-words">
                              {article.title}
                            </h3>
                          </div>
                          <ExternalLink size={18} className="text-muted-foreground flex-shrink-0 mt-1" />
                        </div>

                        <p className={`text-sm text-muted-foreground ${expandedArticle === article.id ? '' : 'line-clamp-2'}`}>
                          {article.content}
                        </p>

                        {expandedArticle === article.id && (
                          <div className="pt-3 border-t border-border">
                            <button className="text-sm text-primary hover:text-primary/80 font-medium flex items-center gap-2">
                              <ExternalLink size={14} />
                              Read Full Article
                            </button>
                          </div>
                        )}

                        <div className="flex items-center justify-between pt-2 border-t border-border">
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Eye size={14} />
                              {article.views.toLocaleString()}
                            </div>
                            <div className="flex items-center gap-1">
                              <Star size={14} className="fill-yellow-500 text-yellow-500" />
                              {article.rating}
                            </div>
                          </div>

                          <div className="flex items-center gap-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <button
                                key={star}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleRating(article.id, star);
                                }}
                                className="transition-transform hover:scale-125"
                              >
                                <Star
                                  size={16}
                                  className={star <= (ratings[article.id] || 0) ? 'fill-primary text-primary' : 'text-muted-foreground'}
                                />
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </PageCard>
                  ))
                ) : (
                  <div className="text-center py-12">
                    <AlertCircle size={32} className="mx-auto mb-2 text-muted-foreground" />
                    <p className="text-muted-foreground">No articles found matching your search</p>
                  </div>
                )}
              </div>
            </PageSection>

            {/* Contact Support */}
            <PageSection>
              <PageCard>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-foreground mb-1">Still need help?</h3>
                      <p className="text-sm text-muted-foreground">Can't find what you're looking for? Contact our support team</p>
                    </div>
                    {!showContactForm && (
                      <button
                        onClick={() => setShowContactForm(true)}
                        className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-smooth text-sm font-medium whitespace-nowrap"
                      >
                        <MessageSquare size={16} className="inline mr-2" />
                        Contact Support
                      </button>
                    )}
                  </div>

                  {showContactForm && (
                    <form onSubmit={handleContactSubmit} className="space-y-3 mt-4 pt-4 border-t border-border">
                      <input
                        type="text"
                        placeholder="Your name"
                        value={contactForm.name}
                        onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                        className="w-full px-3 py-2 bg-muted border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                      />
                      <input
                        type="email"
                        placeholder="Your email"
                        value={contactForm.email}
                        onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                        className="w-full px-3 py-2 bg-muted border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                      />
                      <select
                        value={contactForm.category}
                        onChange={(e) => setContactForm({ ...contactForm, category: e.target.value })}
                        className="w-full px-3 py-2 bg-muted border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                      >
                        <option value="">Select category</option>
                        <option value="technical">Technical Issue</option>
                        <option value="feature">Feature Request</option>
                        <option value="feedback">Feedback</option>
                        <option value="other">Other</option>
                      </select>
                      <textarea
                        placeholder="Describe your issue..."
                        value={contactForm.message}
                        onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                        className="w-full px-3 py-2 bg-muted border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none h-24"
                      />
                      <div className="flex gap-2 justify-end">
                        <button
                          type="button"
                          onClick={() => setShowContactForm(false)}
                          className="px-4 py-2 text-foreground hover:bg-muted rounded-lg transition-smooth"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-smooth flex items-center gap-2"
                        >
                          <Send size={16} />
                          Send
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              </PageCard>
            </PageSection>

            {/* Quick Links */}
            <PageSection title="Quick Resources">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <PageCard>
                  <div className="flex items-start gap-3">
                    <Mail size={20} className="text-primary mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-foreground mb-1">Email Support</h4>
                      <p className="text-sm text-muted-foreground">support@tenantflow.app</p>
                    </div>
                  </div>
                </PageCard>

                <PageCard>
                  <div className="flex items-start gap-3">
                    <Book size={20} className="text-accent mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-foreground mb-1">Full Documentation</h4>
                      <p className="text-sm text-muted-foreground">Comprehensive guides and API docs</p>
                    </div>
                  </div>
                </PageCard>

                <PageCard>
                  <div className="flex items-start gap-3">
                    <AlertCircle size={20} className="text-warning mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-foreground mb-1">Report Issue</h4>
                      <p className="text-sm text-muted-foreground">Let us know about bugs or problems</p>
                    </div>
                  </div>
                </PageCard>
              </div>
            </PageSection>
          </PageContainer>
        </main>
      </div>
    </div>
  );
};

export default HelpPage;
