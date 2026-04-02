import React from "react";
import { FiEdit2, FiTrash2, FiCalendar, FiFlag, FiUser, FiArrowRight } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import "./ActivityCard.css";

function ActivityCard({ activity, onEdit, onDelete, projectId }) {
  const navigate = useNavigate();
  
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

  const formatDate = (dateString) => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getInchargeName = () => {
    if (!activity.incharge) return null;
    return typeof activity.incharge === 'object' ? activity.incharge.name : activity.incharge;
  };

  const inchargeName = getInchargeName();

  const handleViewDetails = (e) => {
    e.stopPropagation();
    if (projectId && activity._id) {
      navigate(`/projects/${projectId}/activities/${activity._id}`);
    } else {
      console.error("Missing IDs for navigation:", { projectId, activityId: activity._id });
    }
  };

  const handleCardClick = (e) => {
    if (e.target.closest('.edit-btn') || e.target.closest('.delete-btn') || e.target.closest('.view-btn')) {
      return;
    }
    handleViewDetails(e);
  };

  // Get progress value (default to 0 if not set)
  const progress = activity.progress || 0;

  // Get progress bar color based on percentage
  const getProgressColor = () => {
    if (progress >= 100) return '#10b981';
    if (progress >= 75) return '#3b82f6';
    if (progress >= 50) return '#f59e0b';
    if (progress >= 25) return '#f97316';
    return '#ef4444';
  };

  // Get status text based on progress
  const getProgressStatus = () => {
    if (progress >= 100) return 'Completed';
    if (progress >= 75) return 'Almost Done';
    if (progress >= 50) return 'Half Way';
    if (progress >= 25) return 'In Progress';
    return 'Just Started';
  };

  return (
    <div 
      className={`activity-card ${getPriorityClass(activity.priority)}`}
      onClick={handleCardClick}
      role="button"
      tabIndex={0}
      onKeyPress={(e) => e.key === 'Enter' && handleViewDetails(e)}
    >
      <div className="activity-card-header">
        <div className="activity-title-section">
          <h3 className="activity-name">{activity.name}</h3>
          {activity.activityId && (
            <span className="activity-id-badge">{activity.activityId}</span>
          )}
        </div>
        <div className="activity-badges">
          <span className={`activity-priority ${getPriorityClass(activity.priority)}`}>
            <FiFlag size={12} />
            {activity.priority}
          </span>
          <span className={`activity-status ${getStatusClass(activity.status)}`}>
            {activity.status}
          </span>
        </div>
      </div>

      {activity.description && (
        <p className="activity-description">{activity.description}</p>
      )}

      {/* Progress Bar Section */}
      <div className="activity-progress">
        <div className="progress-header">
          <span className="progress-label">Progress</span>
          <span className="progress-percentage">{progress}%</span>
        </div>
        <div className="progress-bar-container">
          <div 
            className="progress-bar-fill"
            style={{ 
              width: `${progress}%`,
              backgroundColor: getProgressColor()
            }}
          />
        </div>
        {progress > 0 && progress < 100 && (
          <div className="progress-status">
            <span className="progress-status-text">{getProgressStatus()}</span>
          </div>
        )}
        {progress === 100 && (
          <div className="progress-status completed">
            <span className="progress-status-text">✓ Completed</span>
          </div>
        )}
      </div>

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
        <button 
          className="edit-btn" 
          onClick={(e) => {
            e.stopPropagation();
            onEdit(activity);
          }}
          aria-label="Edit activity"
        >
          <FiEdit2 size={16} />
          Edit
        </button>
        <button 
          className="delete-btn" 
          onClick={(e) => {
            e.stopPropagation();
            onDelete(activity._id);
          }}
          aria-label="Delete activity"
        >
          <FiTrash2 size={16} />
          Delete
        </button>
        <button 
          className="view-btn" 
          onClick={handleViewDetails}
          aria-label="View activity details"
        >
          View Details
          <FiArrowRight size={14} />
        </button>
      </div>
    </div>
  );
}

export default ActivityCard;