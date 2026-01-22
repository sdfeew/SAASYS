import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Icon from '../AppIcon';


const UserProfileDropdown = ({ user = null }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const defaultUser = {
    name: 'Admin User',
    email: 'admin@tenantflow.com',
    tenant: 'Default Tenant',
    role: 'Administrator',
  };

  const currentUser = user || defaultUser;

  const menuItems = [
    { label: 'Profile Settings', icon: 'User', path: '/profile' },
    { label: 'Account Settings', icon: 'Settings', path: '/settings' },
    { label: 'Switch Tenant', icon: 'Building2', action: 'switchTenant' },
    { label: 'Help & Support', icon: 'HelpCircle', path: '/help' },
    { label: 'Sign Out', icon: 'LogOut', action: 'logout', variant: 'destructive' },
  ];

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef?.current && !dropdownRef?.current?.contains(event?.target)) {
        setIsOpen(false);
      }
    };

    const handleEscape = (event) => {
      if (event?.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen]);

  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  const handleMenuClick = (item) => {
    if (item?.action === 'logout') {
      console.log('Logging out...');
    } else if (item?.action === 'switchTenant') {
      console.log('Switching tenant...');
    }
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={handleToggle}
        className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-muted transition-smooth"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
          <Icon name="User" size={20} className="text-primary" />
        </div>
        <div className="hidden md:block text-left">
          <p className="text-sm font-medium text-foreground">{currentUser?.name}</p>
          <p className="caption text-muted-foreground">{currentUser?.role}</p>
        </div>
        <Icon
          name="ChevronDown"
          size={16}
          className={`text-muted-foreground transition-smooth ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-72 bg-popover border border-border rounded-lg shadow-elevation-3 z-50 overflow-hidden">
          <div className="p-4 border-b border-border">
            <p className="text-sm font-medium text-popover-foreground">{currentUser?.name}</p>
            <p className="caption text-muted-foreground">{currentUser?.email}</p>
            <p className="caption text-muted-foreground mt-1">
              <Icon name="Building2" size={12} className="inline mr-1" />
              {currentUser?.tenant}
            </p>
          </div>

          <nav className="py-2">
            {menuItems?.map((item, index) => {
              const isDestructive = item?.variant === 'destructive';
              
              if (item?.path) {
                return (
                  <Link
                    key={index}
                    to={item?.path}
                    onClick={() => setIsOpen(false)}
                    className={`flex items-center gap-3 px-4 py-2.5 text-sm transition-smooth ${
                      isDestructive
                        ? 'text-destructive hover:bg-destructive/10' :'text-popover-foreground hover:bg-muted'
                    }`}
                  >
                    <Icon name={item?.icon} size={16} />
                    <span>{item?.label}</span>
                  </Link>
                );
              }

              return (
                <button
                  key={index}
                  onClick={() => handleMenuClick(item)}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-smooth ${
                    isDestructive
                      ? 'text-destructive hover:bg-destructive/10' :'text-popover-foreground hover:bg-muted'
                  }`}
                >
                  <Icon name={item?.icon} size={16} />
                  <span>{item?.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      )}
    </div>
  );
};

export default UserProfileDropdown;