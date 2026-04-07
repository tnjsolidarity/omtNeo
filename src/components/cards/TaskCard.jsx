import React, { useState } from "react";
import { FiEdit2, FiTrash2, FiCalendar, FiFlag, FiUser, FiClock, FiCheckCircle, FiAlertCircle, FiLoader, FiMessageSquare, FiPaperclip, FiTrendingUp } from "react-icons/fi";
import "./TaskCard.css";

function TaskCard({ task, onEdit, onDelete, onClick }) {
  const priorityMap = {
    'Low': 'priority-low',
    'Medium': 'priority-medium',
    'High': 'priority-high',
    'Critical': 'priority-critical'
  };

  const statusMap = {
    'Assigned': 'status-assigned',
    'Planning': 'status-planning',
    'In Progress': 'status-progress',
    'On Hold': 'status-hold',
    'Completed': 'status-completed',
    'Cancelled': 'status-cancelled',
    'Failed': 'status-failed'
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'Assigned': return <FiUser size={14} />;
      case 'Planning': return <FiClock size={14} />;
      case 'In Progress': return <FiLoader size={14} />;
      case 'On Hold': return <FiMessageSquare size={14} />;
      case 'Completed': return <FiCheckCircle size={14} />;
      case 'Cancelled': return <FiAlertCircle size={14} />;
      case 'Failed': return <FiAlertCircle size={14} />;
      default: return <FiClock size={14} />;
    }
  };

  // Calculate progress based on status
  const getProgressByStatus = (status) => {
    switch(status) {
      case 'Assigned': return 10;
      case 'Planning': return 25;
      case 'In Progress': return 50;
      case 'On Hold': return 50;
      case 'Completed': return 100;
      case 'Cancelled': return 100;
      case 'Failed': return 100;
      default: return 0;
    }
  };

  const progress = getProgressByStatus(task.status);

  const formatDate = (dateString) => {
    if (!dateString) return null;
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  const getAssigneeName = () => {
    if (!task.assignedTo) return null;
    return typeof task.assignedTo === 'object' ? task.assignedTo.name : task.assignedTo;
  };

  const assigneeName = getAssigneeName();
  const startDate = formatDate(task.startDate);
  const endDate = formatDate(task.endDate);
  const hasComments = task.comments?.length > 0;
  const hasAttachments = task.attachments?.length > 0;

  // Get progress bar color based on progress percentage
  const getProgressBarColor = () => {
    if (progress === 100) return 'completed';
    if (progress >= 66) return 'high';
    if (progress >= 33) return 'medium';
    return 'low';
  };

  return (
    <div className={`task-card ${priorityMap[task.priority]}`} onClick={onClick}>
      <div className="task-card-header">
        <div className="task-title-section">
          <h4 className="task-name">{task.name}</h4>
          {task.taskId && (
            <span className="task-id-badge">{task.taskId}</span>
          )}
        </div>
        <div className="task-badges">
          <span className={`task-priority ${priorityMap[task.priority]}`}>
            <FiFlag size={12} />
            {task.priority}
          </span>
          <span className={`task-status ${statusMap[task.status]}`}>
            {getStatusIcon(task.status)}
            {task.status}
          </span>
        </div>
      </div>

      {task.description && (
        <p className="task-description">{task.description}</p>
      )}

      {/* Progress Bar Section */}
      <div className="task-progress-section">
        <div className="task-progress-header">
          <FiTrendingUp size={12} />
          <span>Progress</span>
          <span className="task-progress-percentage">{progress}%</span>
        </div>
        <div className="task-progress-bar-container">
          <div 
            className={`task-progress-bar-fill ${getProgressBarColor()}`}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="task-details">
        {assigneeName && (
          <div className="task-detail-item">
            <FiUser size={12} />
            <span>{assigneeName}</span>
          </div>
        )}
        
        {(startDate || endDate) && (
          <div className="task-detail-item">
            <FiCalendar size={12} />
            <span>
              {startDate && endDate ? `${startDate} → ${endDate}` : (startDate || endDate)}
            </span>
          </div>
        )}
      </div>

      <div className="task-meta">
        {hasComments && (
          <span className="task-meta-badge">
            <FiMessageSquare size={12} />
            {task.comments.length}
          </span>
        )}
        {hasAttachments && (
          <span className="task-meta-badge">
            <FiPaperclip size={12} />
            {task.attachments.length}
          </span>
        )}
        {task.dependencies?.length > 0 && (
          <span className="task-meta-badge depends">
            Depends: {task.dependencies.length}
          </span>
        )}
      </div>

      <div className="task-card-actions">
        <button 
          className="edit-task-btn" 
          onClick={(e) => { e.stopPropagation(); onEdit(task); }}
          aria-label="Edit task"
        >
          <FiEdit2 size={14} />
          Edit
        </button>
        <button 
          className="delete-task-btn" 
          onClick={(e) => { e.stopPropagation(); onDelete(task._id); }}
          aria-label="Delete task"
        >
          <FiTrash2 size={14} />
          Delete
        </button>
      </div>
    </div>
  );
}

export default TaskCard;