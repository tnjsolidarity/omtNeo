import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FiArrowLeft, FiPlus, FiEdit2, FiTrash2, FiCalendar, FiUser, FiFlag, FiBarChart2, FiArrowUp, FiArrowDown, FiChevronDown } from "react-icons/fi";
import { getActivity, updateActivity, deleteActivity } from "../../services/activityService";
import { getEvents, createEvent, updateEvent, deleteEvent, getEventStats } from "../../services/eventService";
import ActivityForm from "../../components/forms/ActivityForm";
import EventForm from "../../components/forms/EventForm";
import EventCard from "../../components/cards/EventCard";
import "../../styles/ActivityDetail.css";

// Constants for sorting
const EVENT_STATUS_ORDER = {
  'Planning': 1,
  'In Progress': 2,
  'On Hold': 3,
  'Completed': 4,
  'Cancelled': 5
};

const EVENT_PRIORITY_ORDER = {
  'Critical': 1,
  'High': 2,
  'Medium': 3,
  'Low': 4
};

const EVENT_SORT_OPTIONS = [
  { value: 'name', label: 'Name' },
  { value: 'status', label: 'Status' },
  { value: 'priority', label: 'Priority' },
  { value: 'assignedTo', label: 'Assigned To' },
  { value: 'startDate', label: 'Start Date' },
  { value: 'endDate', label: 'End Date' },
  { value: 'createdAt', label: 'Created Date' },
  { value: 'updatedAt', label: 'Updated Date' }
];

// Initial form states
const INITIAL_ACTIVITY_FORM = {
  name: "",
  description: "",
  priority: "Medium",
  status: "Planning",
  startDate: "",
  endDate: "",
  incharge: ""
};

const INITIAL_EVENT_FORM = {
  name: "",
  description: "",
  priority: "Medium",
  status: "Planning",
  place: "",
  startDate: "",
  endDate: "",
  assignedTo: ""
};

function ActivityDetail() {
  const { projectId, activityId } = useParams();
  const navigate = useNavigate();
  
  // Refs for sorting
  const sortRef = useRef(null);
  
  // State
  const [activity, setActivity] = useState(null);
  const [events, setEvents] = useState([]);
  const [eventStats, setEventStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editActivityOpen, setEditActivityOpen] = useState(false);
  const [eventFormOpen, setEventFormOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [deletingEventId, setDeletingEventId] = useState(null);
  
  // Sorting state
  const [sortOpen, setSortOpen] = useState(false);
  const [sortConfig, setSortConfig] = useState({
    key: 'status',
    direction: 'asc'
  });
  const [searchTerm, setSearchTerm] = useState("");
  
  const [activityForm, setActivityForm] = useState(INITIAL_ACTIVITY_FORM);
  const [eventForm, setEventForm] = useState(INITIAL_EVENT_FORM);

  // Validate params
  useEffect(() => {
    if (!projectId || !activityId) {
      navigate("/projectdashboard");
    }
  }, [projectId, activityId, navigate]);

  // Fetch data
  const fetchActivity = async () => {
    try {
      const res = await getActivity(projectId, activityId);
      setActivity(res.data);
      setActivityForm({
        name: res.data.name || "",
        description: res.data.description || "",
        priority: res.data.priority || "Medium",
        status: res.data.status || "Planning",
        startDate: res.data.startDate ? res.data.startDate.split("T")[0] : "",
        endDate: res.data.endDate ? res.data.endDate.split("T")[0] : "",
        incharge: res.data.incharge?._id || res.data.incharge || ""
      });
    } catch (err) {
      console.error("Error fetching activity:", err);
      alert("Failed to load activity details");
      navigate(`/projects/${projectId}`);
    }
  };

  const fetchEvents = async () => {
    try {
      const res = await getEvents(projectId, activityId);
      setEvents(res.data.events || []);
      setEventStats(res.data.stats);
    } catch (err) {
      console.error("Error fetching events:", err);
    }
  };

  useEffect(() => {
    if (projectId && activityId) {
      Promise.all([fetchActivity(), fetchEvents()]).finally(() => setLoading(false));
    }
  }, [projectId, activityId]);

  // Activity handlers
  const handleUpdateActivity = async () => {
    setLoading(true);
    try {
      await updateActivity(projectId, activityId, activityForm);
      await fetchActivity();
      setEditActivityOpen(false);
    } catch (err) {
      console.error("Error updating activity:", err);
      alert("Failed to update activity");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteActivity = async () => {
    if (!window.confirm("Are you sure you want to delete this activity and all its events?")) return;
    
    setLoading(true);
    try {
      await deleteActivity(projectId, activityId);
      navigate(`/projects/${projectId}`);
    } catch (err) {
      console.error("Error deleting activity:", err);
      alert("Failed to delete activity");
    } finally {
      setLoading(false);
    }
  };

  // Event handlers
  const handleCreateEvent = async () => {
    setLoading(true);
    try {
      if (editingEvent) {
        await updateEvent(projectId, activityId, editingEvent._id, eventForm);
      } else {
        await createEvent(projectId, activityId, eventForm);
      }
      await fetchEvents();
      handleCloseEventForm();
    } catch (err) {
      console.error("Error saving event:", err);
      alert(err.response?.data?.error || "Failed to save event");
    } finally {
      setLoading(false);
    }
  };

  const handleEditEvent = (event) => {
    setEditingEvent(event);
    setEventForm({
      name: event.name || "",
      description: event.description || "",
      priority: event.priority || "Medium",
      status: event.status || "Planning",
      place: event.place || "",
      startDate: event.startDate ? event.startDate.split("T")[0] : "",
      endDate: event.endDate ? event.endDate.split("T")[0] : "",
      assignedTo: event.assignedTo?._id || event.assignedTo || ""
    });
    setEventFormOpen(true);
  };

  const handleDeleteEvent = async (eventId) => {
    if (!window.confirm("Are you sure you want to delete this event?")) return;
    
    setDeletingEventId(eventId);
    try {
      await deleteEvent(projectId, activityId, eventId);
      await fetchEvents();
    } catch (err) {
      console.error("Error deleting event:", err);
      alert("Failed to delete event");
    } finally {
      setDeletingEventId(null);
    }
  };

  const handleCloseEventForm = () => {
    setEventFormOpen(false);
    setEditingEvent(null);
    setEventForm(INITIAL_EVENT_FORM);
  };

  // Sorting functions
  const handleSortToggle = () => {
    setSortOpen(!sortOpen);
    if (!sortOpen) {
      setTimeout(() => {
        sortRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }, 100);
    }
  };

  const handleSort = (key) => {
    setSortConfig({
      key,
      direction: sortConfig.key === key && sortConfig.direction === 'asc' ? 'desc' : 'asc'
    });
  };

  const getSortedEvents = (eventsToSort) => {
    if (!sortConfig.key) return eventsToSort;

    return [...eventsToSort].sort((a, b) => {
      // Status sorting (custom order)
      if (sortConfig.key === 'status') {
        const orderA = EVENT_STATUS_ORDER[a.status] || 999;
        const orderB = EVENT_STATUS_ORDER[b.status] || 999;
        return sortConfig.direction === 'asc' ? orderA - orderB : orderB - orderA;
      }
      
      // Priority sorting (custom order)
      if (sortConfig.key === 'priority') {
        const orderA = EVENT_PRIORITY_ORDER[a.priority] || 999;
        const orderB = EVENT_PRIORITY_ORDER[b.priority] || 999;
        return sortConfig.direction === 'asc' ? orderA - orderB : orderB - orderA;
      }
      
      // Date fields
      if (['startDate', 'endDate', 'createdAt', 'updatedAt'].includes(sortConfig.key)) {
        const dateA = a[sortConfig.key] ? new Date(a[sortConfig.key]).getTime() : 0;
        const dateB = b[sortConfig.key] ? new Date(b[sortConfig.key]).getTime() : 0;
        return sortConfig.direction === 'asc' ? dateA - dateB : dateB - dateA;
      }
      
      // String fields
      if (['name', 'assignedTo'].includes(sortConfig.key)) {
        let valA, valB;
        
        if (sortConfig.key === 'assignedTo') {
          valA = (a.assignedTo?.name || a.assignedTo || '').toString().toLowerCase();
          valB = (b.assignedTo?.name || b.assignedTo || '').toString().toLowerCase();
        } else {
          valA = (a[sortConfig.key] || '').toString().toLowerCase();
          valB = (b[sortConfig.key] || '').toString().toLowerCase();
        }
        
        if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
        if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      }
      
      return 0;
    });
  };

  // Filter and sort events
  const filteredEvents = events.filter((event) => {
    const term = searchTerm.toLowerCase();
    const assignedToName = typeof event.assignedTo === 'object'
      ? event.assignedTo?.name || ''
      : event.assignedTo || '';
    
    return (
      event.name?.toLowerCase().includes(term) ||
      event.description?.toLowerCase().includes(term) ||
      assignedToName.toLowerCase().includes(term)
    );
  });

  const sortedEvents = getSortedEvents(filteredEvents);
  const isSortActive = sortConfig.key !== 'status' || sortConfig.direction !== 'asc';

  // Utilities
  const formatDate = (dateString) => {
    if (!dateString) return "Not set";
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getInchargeDisplay = (incharge) => {
    if (!incharge) return null;
    return typeof incharge === 'object' ? incharge.name : incharge;
  };

  if (loading && !activity) {
    return (
      <div className="activity-detail-loading">
        <div className="loading-spinner"></div>
        <p>Loading activity details...</p>
      </div>
    );
  }

  return (
    <div className="activity-detail-container">
      {/* Header */}
      <div className="activity-detail-header">
        <button className="back-btn" onClick={() => navigate(`/projects/${projectId}`)}>
          <FiArrowLeft size={18} />
          Back to Project
        </button>
        <div className="activity-actions-header">
          <button className="edit-activity-btn" onClick={() => setEditActivityOpen(true)}>
            <FiEdit2 size={16} />
            Edit Activity
          </button>
          <button className="delete-activity-btn" onClick={handleDeleteActivity}>
            <FiTrash2 size={16} />
            Delete Activity
          </button>
        </div>
      </div>

      {/* Activity Details Card */}
      <div className={`activity-detail-card priority-${activity?.priority?.toLowerCase()}`}>
        <div className="activity-header">
          <div className="activity-title-section">
            <h1>{activity?.name}</h1>
            {activity?.activityId && (
              <span className="activity-id-badge-large">{activity.activityId}</span>
            )}
          </div>
          <div className="activity-status-badges">
            <span className={`status-badge-large status-${activity?.status?.toLowerCase().replace(/\s+/g, '')}`}>
              {activity?.status}
            </span>
            <span className={`priority-badge-large priority-${activity?.priority?.toLowerCase()}`}>
              <FiFlag size={12} />
              {activity?.priority}
            </span>
          </div>
        </div>

        {activity?.description && (
          <p className="activity-description-large">{activity.description}</p>
        )}

        <div className="activity-info-grid">
          {activity?.incharge && (
            <div className="info-item">
              <label>Incharge</label>
              <span><FiUser size={14} /> {getInchargeDisplay(activity.incharge)}</span>
            </div>
          )}
          <div className="info-item">
            <label>Timeline</label>
            <span>
              <FiCalendar size={14} />
              {formatDate(activity?.startDate)} → {formatDate(activity?.endDate)}
            </span>
          </div>
        </div>

        <div className="activity-timestamps">
          <div className="timestamp">Created: {new Date(activity?.createdAt).toLocaleDateString()}</div>
          <div className="timestamp">Last Updated: {new Date(activity?.updatedAt).toLocaleDateString()}</div>
        </div>
      </div>

      {/* Events Section */}
      <div className="events-section">
        <div className="events-header">
          <div className="events-header-left">
            <h2>
              <FiBarChart2 size={20} />
              Events ({filteredEvents.length} / {events.length})
            </h2>
            {eventStats && eventStats.total > 0 && (
              <div className="event-progress">
                <div className="progress-bar">
                  <div 
                    className="progress-fill" 
                    style={{ width: `${eventStats.progress}%` }}
                  />
                </div>
                <span className="progress-text">{eventStats.progress}% Complete</span>
              </div>
            )}
          </div>
          <div className="events-actions">
            {/* Search Input */}
            <div className="event-search-wrapper">
              <input
                type="text"
                placeholder="Search events by name, description, or assignee..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="event-search-input"
              />
            </div>
            
            {/* Sort Button */}
            <button
              ref={sortRef}
              className={`event-sort-btn ${sortOpen ? 'active' : ''} ${isSortActive ? 'used' : ''}`}
              onClick={handleSortToggle}
            >
              <span className="sort-text">
                Sort
                {sortConfig.key && sortConfig.key !== 'status' && (
                  <span className="sort-label">
                    : {EVENT_SORT_OPTIONS.find(opt => opt.value === sortConfig.key)?.label}
                  </span>
                )}
              </span>
              {sortConfig.key && sortConfig.key === 'status' && sortConfig.direction === 'asc' ? (
                <FiArrowDown style={{ opacity: 0.5 }} />
              ) : sortConfig.key ? (
                sortConfig.direction === 'asc' ? <FiArrowUp /> : <FiArrowDown />
              ) : null}
              {isSortActive && !sortOpen && <span className="active-indicator"></span>}
            </button>

            <button className="add-event-btn" onClick={() => setEventFormOpen(true)}>
              <FiPlus size={18} />
              Add Event
            </button>
          </div>
        </div>

        {/* Sort Section */}
        <div ref={sortRef} className={`event-sort-section ${sortOpen ? "visible" : ""}`}>
          <div className="event-sort-panel">
            <div className="event-sort-group">
              <label>Sort By</label>
              <div className="event-sort-options-grid">
                {EVENT_SORT_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    className={`event-sort-option-btn ${sortConfig.key === option.value ? 'active' : ''}`}
                    onClick={() => handleSort(option.value)}
                  >
                    {option.label}
                    {sortConfig.key === option.value && (
                      sortConfig.direction === 'asc' ? 
                        <FiArrowUp className="sort-icon" /> : 
                        <FiArrowDown className="sort-icon" />
                    )}
                  </button>
                ))}
              </div>
            </div>
            <button
              className="event-clear-sort-btn"
              onClick={() => {
                setSortConfig({ key: 'status', direction: 'asc' });
                setSortOpen(false);
              }}
            >
              Reset to Default
            </button>
          </div>
        </div>

        {/* Event Stats Cards */}
        {eventStats && eventStats.total > 0 && (
          <div className="event-stats-grid">
            <div className="stat-card">
              <div className="stat-value">{eventStats.byStatus?.Planning || 0}</div>
              <div className="stat-label">Planning</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{eventStats.byStatus?.['In Progress'] || 0}</div>
              <div className="stat-label">In Progress</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{eventStats.byStatus?.['On Hold'] || 0}</div>
              <div className="stat-label">On Hold</div>
            </div>
            <div className="stat-card completed">
              <div className="stat-value">{eventStats.completed || 0}</div>
              <div className="stat-label">Completed</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{eventStats.byStatus?.Cancelled || 0}</div>
              <div className="stat-label">Cancelled</div>
            </div>
          </div>
        )}

        {/* Results Summary */}
        <div className="event-results-summary">
          <span>Showing {sortedEvents.length} of {events.length} events</span>
          {sortConfig.key && (
            <span className="current-sort">
              Sorted by: {EVENT_SORT_OPTIONS.find(opt => opt.value === sortConfig.key)?.label} 
              ({sortConfig.direction === 'asc' ? 'Ascending' : 'Descending'})
            </span>
          )}
        </div>

        <div className="events-grid">
          {sortedEvents.length === 0 ? (
            <div className="no-events">
              <p>{searchTerm ? "No events match your search." : "No events yet. Click 'Add Event' to create your first event!"}</p>
            </div>
          ) : (
            sortedEvents.map((event) => (
              <EventCard
                key={event._id}
                event={event}
                onEdit={handleEditEvent}
                onDelete={handleDeleteEvent}
              />
            ))
          )}
        </div>
      </div>

      {/* Edit Activity Modal */}
      {editActivityOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <ActivityForm
              form={activityForm}
              setForm={setActivityForm}
              handleSubmit={handleUpdateActivity}
              loading={loading}
              editingId={activityId}
              handleClear={() => setEditActivityOpen(false)}
              handleClose={() => setEditActivityOpen(false)}
            />
          </div>
        </div>
      )}

      {/* Event Form Modal */}
      {eventFormOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <EventForm
              form={eventForm}
              setForm={setEventForm}
              handleSubmit={handleCreateEvent}
              loading={loading}
              editingId={editingEvent?._id}
              handleClear={handleCloseEventForm}
              handleClose={handleCloseEventForm}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default ActivityDetail;