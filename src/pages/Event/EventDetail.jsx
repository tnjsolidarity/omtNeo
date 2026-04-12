import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FiArrowLeft, FiPlus, FiEdit2, FiTrash2, FiCalendar, FiUser, FiFlag, FiBarChart2, FiClock, FiCheckCircle, FiLoader, FiUsers, FiXCircle, FiAlertCircle } from "react-icons/fi";
import { getEvent, updateEvent, deleteEvent } from "../../services/eventService";
import { getTasks, createTask, updateTask, deleteTask, getTaskStats } from "../../services/taskService";
import { getAttendancesForEvent, createAttendanceForEvent, updateAttendanceForEvent, deleteAttendanceForEvent } from "../../services/attendanceService";
import EventForm from "../../components/forms/EventForm";
import TaskForm from "../../components/forms/TaskForm";
import TaskCard from "../../components/cards/TaskCard";
import AttendanceForm from "../../components/forms/AttendanceForm";
import AttendanceCard from "../../components/cards/AttendanceCard";
import "../../styles/EventDetail.css";

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

const INITIAL_TASK_FORM = {
  name: "",
  description: "",
  priority: "Medium",
  status: "Not Started",
  startDate: "",
  endDate: "",
  assignedTo: "",
  dependencies: []
};

function EventDetail() {
  const { projectId, activityId, eventId } = useParams();
  const navigate = useNavigate();
  
  const [event, setEvent] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [taskStats, setTaskStats] = useState(null);
  const [attendances, setAttendances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editEventOpen, setEditEventOpen] = useState(false);
  const [taskFormOpen, setTaskFormOpen] = useState(false);
  const [attendanceFormOpen, setAttendanceFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [editingAttendance, setEditingAttendance] = useState(null);
  const [showAttendances, setShowAttendances] = useState(true);
  
  const [eventForm, setEventForm] = useState(INITIAL_EVENT_FORM);
  const [taskForm, setTaskForm] = useState(INITIAL_TASK_FORM);

  useEffect(() => {
    if (!projectId || !activityId || !eventId) {
      navigate(`/projects/${projectId}`);
    }
  }, [projectId, activityId, eventId, navigate]);

  const fetchEvent = async () => {
    try {
      const res = await getEvent(projectId, activityId, eventId);
      setEvent(res.data);
      setEventForm({
        name: res.data.name || "",
        description: res.data.description || "",
        priority: res.data.priority || "Medium",
        status: res.data.status || "Planning",
        place: res.data.place || "",
        startDate: res.data.startDate ? res.data.startDate.split("T")[0] : "",
        endDate: res.data.endDate ? res.data.endDate.split("T")[0] : "",
        assignedTo: res.data.assignedTo?._id || res.data.assignedTo || ""
      });
    } catch (err) {
      console.error("Error fetching event:", err);
      alert("Failed to load event details");
      navigate(`/projects/${projectId}/activities/${activityId}`);
    }
  };

  const fetchTasks = async () => {
    try {
      const res = await getTasks(projectId, activityId, eventId);
      setTasks(res.data.tasks || []);
      setTaskStats(res.data.stats);
    } catch (err) {
      console.error("Error fetching tasks:", err);
    }
  };

  const fetchAttendances = async () => {
    try {
      const res = await getAttendancesForEvent(projectId, activityId, eventId);
      const attendanceList = res.data || [];
      setAttendances(attendanceList);
    } catch (err) {
      console.error("Error fetching attendances:", err);
      setAttendances([]);
    }
  };

  useEffect(() => {
    if (projectId && activityId && eventId) {
      Promise.all([fetchEvent(), fetchTasks(), fetchAttendances()]).finally(() => setLoading(false));
    }
  }, [projectId, activityId, eventId]);

  const handleUpdateEvent = async () => {
    setLoading(true);
    try {
      await updateEvent(projectId, activityId, eventId, eventForm);
      await fetchEvent();
      setEditEventOpen(false);
    } catch (err) {
      console.error("Error updating event:", err);
      alert("Failed to update event");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteEvent = async () => {
    if (!window.confirm("Are you sure you want to delete this event and all its tasks and attendances?")) return;
    
    setLoading(true);
    try {
      await deleteEvent(projectId, activityId, eventId);
      navigate(`/projects/${projectId}/activities/${activityId}`);
    } catch (err) {
      console.error("Error deleting event:", err);
      alert("Failed to delete event");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTask = async () => {
    setLoading(true);
    try {
      if (editingTask) {
        await updateTask(projectId, activityId, eventId, editingTask._id, taskForm);
      } else {
        await createTask(projectId, activityId, eventId, taskForm);
      }
      await fetchTasks();
      handleCloseTaskForm();
    } catch (err) {
      console.error("Error saving task:", err);
      alert(err.response?.data?.error || "Failed to save task");
    } finally {
      setLoading(false);
    }
  };

  const handleEditTask = (task) => {
    setEditingTask(task);
    setTaskForm({
      name: task.name || "",
      description: task.description || "",
      priority: task.priority || "Medium",
      status: task.status || "Not Started",
      startDate: task.startDate ? task.startDate.split("T")[0] : "",
      endDate: task.endDate ? task.endDate.split("T")[0] : "",
      assignedTo: task.assignedTo?._id || task.assignedTo || "",
      estimatedHours: task.estimatedHours || 0,
      actualHours: task.actualHours || 0,
      dependencies: task.dependencies?.map(d => d._id || d) || []
    });
    setTaskFormOpen(true);
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm("Are you sure you want to delete this task?")) return;
    
    try {
      await deleteTask(projectId, activityId, eventId, taskId);
      await fetchTasks();
    } catch (err) {
      console.error("Error deleting task:", err);
      alert("Failed to delete task");
    }
  };

  const handleCloseTaskForm = () => {
    setTaskFormOpen(false);
    setEditingTask(null);
    setTaskForm(INITIAL_TASK_FORM);
  };

  // Attendance Handlers
  const handleCreateAttendance = async (attendanceData) => {
    setLoading(true);
    try {
      await createAttendanceForEvent(projectId, activityId, eventId, attendanceData);
      await fetchAttendances();
      setAttendanceFormOpen(false);
    } catch (err) {
      console.error("Error creating attendance:", err);
      alert(err.response?.data?.error || "Failed to create attendance");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateAttendance = async (attendanceId, attendanceData) => {
    setLoading(true);
    try {
      await updateAttendanceForEvent(projectId, activityId, eventId, attendanceId, attendanceData);
      await fetchAttendances();
      setAttendanceFormOpen(false);
      setEditingAttendance(null);
    } catch (err) {
      console.error("Error updating attendance:", err);
      alert(err.response?.data?.error || "Failed to update attendance");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAttendance = async (attendanceId) => {
    if (!window.confirm("Are you sure you want to delete this attendance record?")) return;
    
    setLoading(true);
    try {
      await deleteAttendanceForEvent(projectId, activityId, eventId, attendanceId);
      await fetchAttendances();
    } catch (err) {
      console.error("Error deleting attendance:", err);
      alert("Failed to delete attendance");
    } finally {
      setLoading(false);
    }
  };

  const handleEditAttendance = (attendance) => {
    setEditingAttendance(attendance);
    setAttendanceFormOpen(true);
  };

  const handleCloseAttendanceForm = () => {
    setAttendanceFormOpen(false);
    setEditingAttendance(null);
    fetchAttendances();
  };

  const handleAttendanceSubmit = (attendanceData) => {
    if (editingAttendance) {
      handleUpdateAttendance(editingAttendance._id, attendanceData);
    } else {
      handleCreateAttendance(attendanceData);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Not set";
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading && !event) {
    return (
      <div className="event-detail-loading">
        <div className="loading-spinner"></div>
        <p>Loading event details...</p>
      </div>
    );
  }

  return (
    <div className="event-detail-container">
      {/* Header */}
      <div className="event-detail-header">
        <button className="back-btn" onClick={() => navigate(`/projects/${projectId}/activities/${activityId}`)}>
          <FiArrowLeft size={18} />
          Back to Activity
        </button>
        <div className="event-actions-header">
          <button className="edit-event-btn" onClick={() => setEditEventOpen(true)}>
            <FiEdit2 size={16} />
            Edit Event
          </button>
          <button className="delete-event-btn" onClick={handleDeleteEvent}>
            <FiTrash2 size={16} />
            Delete Event
          </button>
        </div>
      </div>

      {/* Event Details Card */}
      <div className={`event-detail-card priority-${event?.priority?.toLowerCase()}`}>
        <div className="event-detail-header-section">
          <div className="event-title-section">
            <h1>{event?.name}</h1>
            {event?.eventId && (
              <span className="event-id-badge-large">{event.eventId}</span>
            )}
          </div>
          <div className="event-status-badges">
            <span className={`status-badge-large status-${event?.status?.toLowerCase().replace(/\s+/g, '')}`}>
              {event?.status}
            </span>
            <span className={`priority-badge-large priority-${event?.priority?.toLowerCase()}`}>
              <FiFlag size={12} />
              {event?.priority}
            </span>
          </div>
        </div>

        {event?.description && (
          <p className="event-description-large">{event.description}</p>
        )}

        <div className="event-info-grid">
          {event?.place && (
            <div className="info-item">
              <label>Place</label>
              <span>{event.place}</span>
            </div>
          )}
          {event?.assignedTo && (
            <div className="info-item">
              <label>Assigned To</label>
              <span><FiUser size={14} /> {typeof event.assignedTo === 'object' ? event.assignedTo.name : event.assignedTo}</span>
            </div>
          )}
          <div className="info-item">
            <label>Timeline</label>
            <span>
              <FiCalendar size={14} />
              {formatDate(event?.startDate)} → {formatDate(event?.endDate)}
            </span>
          </div>
        </div>
      </div>

      {/* Attendance Section */}
      <div className="attendance-section">
        <div className="attendance-header">
          <div className="attendance-header-left">
            <h2>
              <FiUsers size={20} />
              Attendance Records ({attendances.length})
            </h2>
          </div>
          <div className="attendance-header-actions">
            <button 
              className="toggle-attendance-btn" 
              onClick={() => setShowAttendances(!showAttendances)}
            >
              {showAttendances ? "Hide Attendances" : "Show Attendances"}
            </button>
            <button className="add-attendance-btn" onClick={() => setAttendanceFormOpen(true)}>
              <FiPlus size={18} />
              Add Attendance
            </button>
          </div>
        </div>

        {showAttendances && (
          <div className="attendances-grid">
            {attendances.length === 0 ? (
              <div className="no-attendances">
                <p>No attendance records yet. Click 'Add Attendance' to create your first attendance record!</p>
              </div>
            ) : (
              attendances.map((attendance) => (
                <AttendanceCard
                  key={attendance._id}
                  attendance={attendance}
                  onEdit={handleEditAttendance}
                  onDelete={handleDeleteAttendance}
                />
              ))
            )}
          </div>
        )}
      </div>

      {/* Tasks Section */}
      <div className="tasks-section">
        <div className="tasks-header">
          <div className="tasks-header-left">
            <h2>
              <FiBarChart2 size={20} />
              Tasks ({tasks.length})
            </h2>
            {taskStats && taskStats.total > 0 && (
              <div className="task-progress-summary">
                <div className="progress-bar">
                  <div 
                    className="progress-fill" 
                    style={{ width: `${taskStats.progress}%` }}
                  />
                </div>
                <span className="progress-text">{taskStats.progress}% Complete</span>
              </div>
            )}
          </div>
          <button className="add-task-btn" onClick={() => setTaskFormOpen(true)}>
            <FiPlus size={18} />
            Add Task
          </button>
        </div>

        {/* Task Stats Cards */}
        {taskStats && taskStats.total > 0 && (
          <div className="task-stats-grid">
            <div className="task-stat-card">
              <div className="task-stat-value">{taskStats.byStatus?.['Not Started'] || 0}</div>
              <div className="task-stat-label">Not Started</div>
            </div>
            <div className="task-stat-card">
              <div className="task-stat-value">{taskStats.byStatus?.['In Progress'] || 0}</div>
              <div className="task-stat-label">In Progress</div>
            </div>
            <div className="task-stat-card">
              <div className="task-stat-value">{taskStats.byStatus?.Review || 0}</div>
              <div className="task-stat-label">Review</div>
            </div>
            <div className="task-stat-card completed">
              <div className="task-stat-value">{taskStats.completed || 0}</div>
              <div className="task-stat-label">Completed</div>
            </div>
            <div className="task-stat-card">
              <div className="task-stat-value">{taskStats.byStatus?.Cancelled || 0}</div>
              <div className="task-stat-label">Cancelled</div>
            </div>
          </div>
        )}

        {/* Hours Summary */}
        {taskStats && (taskStats.totalEstimatedHours > 0 || taskStats.totalActualHours > 0) && (
          <div className="task-hours-summary">
            <div className="hours-item">
              <FiClock size={14} />
              <span>Estimated: {taskStats.totalEstimatedHours}h</span>
            </div>
            <div className="hours-item">
              <FiCheckCircle size={14} />
              <span>Actual: {taskStats.totalActualHours}h</span>
            </div>
          </div>
        )}

        <div className="tasks-grid">
          {tasks.length === 0 ? (
            <div className="no-tasks">
              <p>No tasks yet. Click 'Add Task' to create your first task!</p>
            </div>
          ) : (
            tasks.map((task) => (
              <TaskCard
                key={task._id}
                task={task}
                onEdit={handleEditTask}
                onDelete={handleDeleteTask}
              />
            ))
          )}
        </div>
      </div>

      {/* Edit Event Modal */}
      {editEventOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <EventForm
              form={eventForm}
              setForm={setEventForm}
              handleSubmit={handleUpdateEvent}
              loading={loading}
              editingId={eventId}
              handleClear={() => setEditEventOpen(false)}
              handleClose={() => setEditEventOpen(false)}
            />
          </div>
        </div>
      )}

      {/* Task Form Modal */}
      {taskFormOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <TaskForm
              form={taskForm}
              setForm={setTaskForm}
              handleSubmit={handleCreateTask}
              loading={loading}
              editingId={editingTask?._id}
              handleClear={handleCloseTaskForm}
              handleClose={handleCloseTaskForm}
              projectId={projectId}
              activityId={activityId}
              eventId={eventId}
            />
          </div>
        </div>
      )}

      {/* Attendance Form Modal */}
      {attendanceFormOpen && (
        <div className="modal-overlay">
          <div className="modal-content attendance-modal-content">
            <AttendanceForm
              onSuccess={handleCloseAttendanceForm}
              onCancel={handleCloseAttendanceForm}
              editData={editingAttendance}
              projectId={projectId}
              activityId={activityId}
              eventId={eventId}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default EventDetail;