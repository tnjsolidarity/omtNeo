import React from "react";
import { useNavigate } from "react-router-dom";
import { FiEdit2, FiTrash2, FiCalendar, FiFlag, FiUser, FiMapPin } from "react-icons/fi";
import "./EventCard.css";

function EventCard({ event, onEdit, onDelete, projectId, activityId }) {
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

  const getAssigneeName = () => {
    if (!event.assignedTo) return null;
    return typeof event.assignedTo === 'object' ? event.assignedTo.name : event.assignedTo;
  };

  const assigneeName = getAssigneeName();

  // Handle card click - navigate to event detail
  const handleCardClick = () => {
    if (projectId && activityId && event._id) {
      navigate(`/projects/${projectId}/activities/${activityId}/events/${event._id}`);
    }
  };

  const handleCardKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleCardClick();
    }
  };

  // Get progress value - use event's own progress if available, otherwise use task progress
  const getProgress = () => {
    if (event.progress !== undefined) return event.progress;
    if (event.taskStats && event.taskStats.progress !== undefined) return event.taskStats.progress;
    return 0;
  };

  const progress = getProgress();

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
      className={`event-card ${getPriorityClass(event.priority)}`}
      onClick={handleCardClick}
      onKeyPress={handleCardKeyPress}
      role="button"
      tabIndex={0}
      style={{ cursor: 'pointer' }}
    >
      <div className="event-card-header">
        <div className="event-title-section">
          <h3 className="event-name">{event.name}</h3>
          {event.eventId && (
            <span className="event-id-badge">{event.eventId}</span>
          )}
        </div>
        <div className="event-badges">
          <span className={`event-priority ${getPriorityClass(event.priority)}`}>
            <FiFlag size={12} />
            {event.priority}
          </span>
          <span className={`event-status ${getStatusClass(event.status)}`}>
            {event.status}
          </span>
        </div>
      </div>

      {event.description && (
        <p className="event-description">{event.description}</p>
      )}

      {/* Progress Bar Section - Same as ActivityCard */}
      <div className="event-progress">
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

      <div className="event-details">
        {/* Place Field */}
        {event.place && (
          <div className="event-detail">
            <span className="detail-label">
              <FiMapPin size={12} />
              Place:
            </span>
            <span className="detail-value">{event.place}</span>
          </div>
        )}
        
        {assigneeName && (
          <div className="event-detail">
            <span className="detail-label">
              <FiUser size={12} />
              Assigned To:
            </span>
            <span className="detail-value">{assigneeName}</span>
          </div>
        )}
        
        <div className="event-detail">
          <span className="detail-label">
            <FiCalendar size={12} />
            Timeline:
          </span>
          <span className="detail-value">
            {formatDate(event.startDate)} → {formatDate(event.endDate)}
          </span>
        </div>
      </div>

      <div className="event-card-actions">
        <button 
          className="edit-btn" 
          onClick={(e) => { 
            e.stopPropagation(); 
            onEdit(event); 
          }}
          aria-label="Edit event"
        >
          <FiEdit2 size={16} />
          Edit
        </button>
        <button 
          className="delete-btn" 
          onClick={(e) => { 
            e.stopPropagation(); 
            onDelete(event._id); 
          }}
          aria-label="Delete event"
        >
          <FiTrash2 size={16} />
          Delete
        </button>
      </div>
    </div>
  );
}

export default EventCard;