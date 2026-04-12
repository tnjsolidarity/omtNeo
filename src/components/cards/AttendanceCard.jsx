import React from 'react';
import { format } from 'date-fns';
import { FiEdit2, FiTrash2, FiArrowRight, FiCalendar, FiMapPin } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import './AttendanceCard.css';

const AttendanceCard = ({ attendance, onEdit, onDelete, projectId, activityId }) => {
  const navigate = useNavigate();

  const totalInvitees = attendance.totalInvitees || 0;
  const presentCount = attendance.totalPresent || 0;
  const totalOtherCount = 
    (attendance.totalAbsent || 0) +
    (attendance.totalInvited || 0) +
    (attendance.totalPermission || 0) +
    (attendance.totalNotAvailable || 0) +
    (attendance.totalNotInvited || 0) +
    (attendance.totalNotReachable || 0) +
    (attendance.totalNotResponded || 0);

  const attendanceRate = totalInvitees > 0 ? Math.round((presentCount / totalInvitees) * 100) : 0;

  const getStatusClass = () => {
    if (totalInvitees === 0) return 'status-empty';
    if (presentCount === totalInvitees) return 'status-all-present';
    if (presentCount === 0) return 'status-all-absent';
    return presentCount >= totalOtherCount ? 'status-mostly-present' : 'status-mostly-absent';
  };

  const getProgressColor = () => {
    if (attendanceRate >= 90) return '#10b981';
    if (attendanceRate >= 75) return '#3b82f6';
    if (attendanceRate >= 50) return '#f59e0b';
    return '#ef4444';
  };

  const formatDate = (date) => date ? format(new Date(date), 'dd MMM yyyy') : 'Not set';

  const handleViewDetails = (e) => {
    e.stopPropagation();
    if (projectId && activityId && attendance._id) {
      navigate(`/projects/${projectId}/activities/${activityId}/attendance/${attendance._id}`);
    }
  };

  const handleCardClick = (e) => {
    if (e.target.closest('button')) return;
    handleViewDetails(e);
  };

  return (
    <div
      className={`attendance-card ${getStatusClass()}`}
      onClick={handleCardClick}
      role="button"
      tabIndex={0}
      onKeyPress={(e) => e.key === 'Enter' && handleViewDetails(e)}
    >
      {/* Header */}
      <div className="attendance-card-header">
        <div>
          <h3 className="attendance-name">{attendance.description || 'No Description'}</h3>
          {attendance.attendanceId && (
            <span className="attendance-id-badge">{attendance.attendanceId}</span>
          )}
        </div>
        <span className={`attendance-status-badge ${getStatusClass()}`}>
          {presentCount}/{totalInvitees}
        </span>
      </div>

      {/* Compact Progress */}
      <div className="attendance-progress">
        <div className="progress-bar-container">
          <div
            className="progress-bar-fill"
            style={{
              width: `${attendanceRate}%`,
              backgroundColor: getProgressColor(),
            }}
          />
        </div>
        <div className="progress-info">
          <span className="progress-percentage">{attendanceRate}%</span>
          <span className="progress-label">Attendance</span>
        </div>
      </div>

      {/* Date + Meta Row */}
      <div className="attendance-meta-row">
        <div className="attendance-date">
          <FiCalendar size={14} />
          <span>{formatDate(attendance.date)}</span>
        </div>

        {attendance.location && (
          <div>
            <FiMapPin size={14} /> {attendance.location}
          </div>
        )}
      </div>

      {/* Compact Details */}
      <div className="attendance-details">
        <div className="detail-item">
          <span className="detail-label">Project:</span>
          <span>{attendance.project?.name || 'N/A'}</span>
        </div>
        <div className="detail-item">
          <span className="detail-label">Activity:</span>
          <span>{attendance.activity?.name || 'N/A'}</span>
        </div>
      </div>

      {/* Stats */}
      <div>
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-number">{totalInvitees}</div>
            <div className="stat-label">Invitees</div>
          </div>
          <div className="stat-card">
            <div className="stat-number present">{presentCount}</div>
            <div className="stat-label">Present</div>
          </div>
          <div className="stat-card">
            <div className="stat-number other">{totalOtherCount}</div>
            <div className="stat-label">Others</div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div>
        <div className="attendance-card-actions">
          <button className="edit-btn" onClick={(e) => { e.stopPropagation(); onEdit(attendance); }}>
            <FiEdit2 size={16} /> Edit
          </button>
          <button className="delete-btn" onClick={(e) => { e.stopPropagation(); onDelete(attendance._id); }}>
            <FiTrash2 size={16} /> Delete
          </button>
          <button className="view-btn" onClick={handleViewDetails}>
            View <FiArrowRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AttendanceCard;