import React from "react";
import { FiEdit2, FiTrash2, FiCalendar, FiFlag, FiUser } from "react-icons/fi";
import "./ActivityCard.css";

function ActivityCard({ activity, onEdit, onDelete }) {
  // Priority mapping
  const priorityMap = {
    'Low': 'priority-low',
    'Medium': 'priority-medium',
    'High': 'priority-high',
    'Critical': 'priority-critical'
  };

  const statusMap = {
    'Planning': 'status-planning',
    'In Progress': 'status-progress',
    'On Hold': 'status-hold',
    'Completed': 'status-completed',
    'Cancelled': 'status-cancelled'
  };

  const getStatusClass = (status) => statusMap[status] || 'status-planning';

  const getPriorityClass = (priority) => priorityMap[priority] || 'priority-medium';
  
  const getPriorityIcon = () => <FiFlag className="priority-icon" />;

  const formatDate = (dateString) => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Get incharge name (handles both object and string)
  const getInchargeName = () => {
    if (!activity.incharge) return null;
    return typeof activity.incharge === 'object' ? activity.incharge.name : activity.incharge;
  };

  const inchargeName = getInchargeName();

  return (
    <div className={`activity-card ${getPriorityClass(activity.priority)}`}>
      <div className="activity-card-header">
        <div className="activity-title-section">
          <h3 className="activity-name">{activity.name}</h3>
          {activity.activityId && (
            <span className="activity-id-badge">{activity.activityId}</span>
          )}
        </div>
        <span className={`activity-priority ${getPriorityClass(activity.priority)}`}>
          {getPriorityIcon()}
          {activity.priority}
        </span>
        <span className={`activity-status ${getStatusClass(activity.status)}`}>
          {activity.status}
        </span>
      </div>

      {activity.description && (
        <p className="activity-description">{activity.description}</p>
      )}

      <div className="activity-details">
        {inchargeName && (
          <div className="activity-detail">
            <span className="detail-label">
              <FiUser size={12} />
              Incharge:
            </span>
            <span className="detail-value">{inchargeName}</span>
          </div>
        )}
        
        <div className="activity-detail">
          <span className="detail-label">
            <FiCalendar size={12} />
            Timeline:
          </span>
          <span className="detail-value">
            {formatDate(activity.startDate)} → {formatDate(activity.endDate)}
          </span>
        </div>
      </div>

      <div className="activity-card-actions">
        <button className="edit-btn" onClick={() => onEdit(activity)}>
          <FiEdit2 size={16} />
          Edit
        </button>
        <button className="delete-btn" onClick={() => onDelete(activity._id)}>
          <FiTrash2 size={16} />
          Delete
        </button>
      </div>
    </div>
  );
}

export default ActivityCard;