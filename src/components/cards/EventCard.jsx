import React from "react";
import { FiEdit2, FiTrash2, FiCalendar, FiFlag, FiUser, FiMapPin } from "react-icons/fi";
import "./EventCard.css";

function EventCard({ event, onEdit, onDelete }) {
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

  return (
    <div className={`event-card ${getPriorityClass(event.priority)}`}>
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

      <div className="event-details">
        {/* Place Field - NEW */}
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
          onClick={() => onEdit(event)}
          aria-label="Edit event"
        >
          <FiEdit2 size={16} />
          Edit
        </button>
        <button 
          className="delete-btn" 
          onClick={() => onDelete(event._id)}
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