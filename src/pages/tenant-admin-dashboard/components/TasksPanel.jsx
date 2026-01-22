import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import TaskItem from './TaskItem';

const TasksPanel = ({ tasks, onTaskAction }) => {
  const [activeTab, setActiveTab] = useState('pending');

  const tabs = [
    { value: 'pending', label: 'Pending', count: tasks?.filter(t => t?.status === 'pending')?.length },
    { value: 'in-progress', label: 'In Progress', count: tasks?.filter(t => t?.status === 'in-progress')?.length },
    { value: 'completed', label: 'Completed', count: tasks?.filter(t => t?.status === 'completed')?.length },
  ];

  const filteredTasks = tasks?.filter(task => task?.status === activeTab);

  return (
    <div className="bg-card border border-border rounded-lg shadow-elevation-1">
      <div className="p-4 md:p-6 border-b border-border">
        <h3 className="text-lg md:text-xl font-heading font-semibold text-foreground mb-4">
          Tasks & Approvals
        </h3>

        <div className="flex items-center gap-2 overflow-x-auto scrollbar-custom">
          {tabs?.map((tab) => (
            <button
              key={tab?.value}
              onClick={() => setActiveTab(tab?.value)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm whitespace-nowrap transition-smooth flex-shrink-0 ${
                activeTab === tab?.value
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              {tab?.label}
              <span className={`px-1.5 py-0.5 rounded-full text-xs font-medium ${
                activeTab === tab?.value
                  ? 'bg-primary-foreground/20'
                  : 'bg-background'
              }`}>
                {tab?.count}
              </span>
            </button>
          ))}
        </div>
      </div>
      <div className="max-h-96 overflow-y-auto scrollbar-custom">
        {filteredTasks?.length > 0 ? (
          <div className="px-4 md:px-6">
            {filteredTasks?.map((task) => (
              <TaskItem key={task?.id} task={task} onAction={onTaskAction} />
            ))}
          </div>
        ) : (
          <div className="p-8 text-center">
            <Icon name="CheckCircle" size={48} className="text-muted-foreground mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">No {activeTab} tasks</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TasksPanel;