import React, { useState, useEffect } from "react";
import Select from "react-select";
import { FiX } from "react-icons/fi";
import { getMembers } from "../../services/memberService";
import { getTasks } from "../../services/taskService";
import "./TaskForm.css";

const PRIORITY_OPTIONS = [
  { value: "Low", label: "Low" },
  { value: "Medium", label: "Medium" },
  { value: "High", label: "High" },
  { value: "Critical", label: "Critical" }
];

const STATUS_OPTIONS = [
  { value: "Assigned", label: "Assigned" },
  { value: "Planning", label: "Planning" },
  { value: "In Progress", label: "In Progress" },
  { value: "On Hold", label: "On Hold" },
  { value: "Completed", label: "Completed" },
  { value: "Cancelled", label: "Cancelled" },
  { value: "Failed", label: "Failed" }
];

function TaskForm({ 
  form, 
  setForm, 
  handleSubmit, 
  loading, 
  editingId, 
  handleClear, 
  handleClose,
  projectId,
  activityId,
  eventId 
}) {
  const [members, setMembers] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [membersLoading, setMembersLoading] = useState(false);
  const [tasksLoading, setTasksLoading] = useState(false);
  const [error, setError] = useState(null);

  // Format date functions
  const formatDateForDisplay = (dateString) => {
    if (!dateString) return "";
    const [year, month, day] = dateString.split("-");
    if (!year || !month || !day) return "";
    return `${day}/${month}/${year}`;
  };

  const parseDateForStorage = (dateString) => {
    if (!dateString) return "";
    const parts = dateString.split("/");
    if (parts.length === 3) {
      const [day, month, year] = parts;
      if (day && month && year && day.length === 2 && month.length === 2 && year.length === 4) {
        return `${year}-${month}-${day}`;
      }
    }
    return "";
  };

  const [formattedStartDate, setFormattedStartDate] = useState("");
  const [formattedEndDate, setFormattedEndDate] = useState("");

  const handleStartDateChange = (e) => {
    let inputValue = e.target.value;
    let cleaned = inputValue.replace(/\D/g, "");
    
    if (cleaned.length >= 3) {
      cleaned = cleaned.slice(0, 2) + "/" + cleaned.slice(2);
    }
    if (cleaned.length >= 6) {
      cleaned = cleaned.slice(0, 5) + "/" + cleaned.slice(5, 9);
    }
    
    if (cleaned.length > 10) {
      cleaned = cleaned.slice(0, 10);
    }
    
    setFormattedStartDate(cleaned);
    
    if (cleaned.length === 10) {
      const storageDate = parseDateForStorage(cleaned);
      if (storageDate) {
        setForm({ ...form, startDate: storageDate });
      } else {
        setForm({ ...form, startDate: "" });
      }
    } else {
      setForm({ ...form, startDate: "" });
    }
  };

  const handleEndDateChange = (e) => {
    let inputValue = e.target.value;
    let cleaned = inputValue.replace(/\D/g, "");
    
    if (cleaned.length >= 3) {
      cleaned = cleaned.slice(0, 2) + "/" + cleaned.slice(2);
    }
    if (cleaned.length >= 6) {
      cleaned = cleaned.slice(0, 5) + "/" + cleaned.slice(5, 9);
    }
    
    if (cleaned.length > 10) {
      cleaned = cleaned.slice(0, 10);
    }
    
    setFormattedEndDate(cleaned);
    
    if (cleaned.length === 10) {
      const storageDate = parseDateForStorage(cleaned);
      if (storageDate) {
        setForm({ ...form, endDate: storageDate });
      } else {
        setForm({ ...form, endDate: "" });
      }
    } else {
      setForm({ ...form, endDate: "" });
    }
  };

  useEffect(() => {
    if (form.startDate) {
      setFormattedStartDate(formatDateForDisplay(form.startDate));
    } else {
      setFormattedStartDate("");
    }
    
    if (form.endDate) {
      setFormattedEndDate(formatDateForDisplay(form.endDate));
    } else {
      setFormattedEndDate("");
    }
  }, [form.startDate, form.endDate]);

  // Fetch members
  useEffect(() => {
    const fetchMembers = async () => {
      setMembersLoading(true);
      try {
        const response = await getMembers();
        if (response?.data) {
          const memberOptions = response.data.map(member => ({
            value: member._id,
            label: `${member.name} (${member.memberId || 'No ID'}) - ${member.role}`,
            name: member.name
          }));
          setMembers(memberOptions);
        }
      } catch (err) {
        console.error("Error fetching members:", err);
        setError("Failed to load members");
      } finally {
        setMembersLoading(false);
      }
    };
    
    fetchMembers();
  }, []);

  // Fetch existing tasks for dependencies
  useEffect(() => {
    const fetchTasks = async () => {
      if (!projectId || !activityId || !eventId) return;
      setTasksLoading(true);
      try {
        const response = await getTasks(projectId, activityId, eventId);
        if (response?.data?.tasks) {
          const taskOptions = response.data.tasks
            .filter(t => t._id !== editingId) // Don't allow self-dependency
            .map(task => ({
              value: task._id,
              label: `${task.taskId || task.name} - ${task.name}`,
              status: task.status
            }));
          setTasks(taskOptions);
        }
      } catch (err) {
        console.error("Error fetching tasks:", err);
      } finally {
        setTasksLoading(false);
      }
    };
    
    fetchTasks();
  }, [projectId, activityId, eventId, editingId]);

  const selectedAssignedTo = members.find(m => m.value === form.assignedTo);
  const selectedDependencies = tasks.filter(t => form.dependencies?.includes(t.value));

  const customSelectStyles = {
    menuPortal: (base) => ({ ...base, zIndex: 9999 }),
    menu: (base) => ({ ...base, zIndex: 9999 })
  };

  return (
    <div className="task-form-container">
      <div className="task-form-header">
        <h3>{editingId ? 'Edit Task' : 'Create New Task'}</h3>
        <button className="task-form-close-btn" onClick={handleClose}>
          <FiX size={20} />
        </button>
      </div>

      <div className="task-form-section">
        {/* Task Name */}
        <div className="task-form-field full-width">
          <label className="required">Task Name</label>
          <input
            type="text"
            value={form.name || ""}
            onChange={(e) => setForm({...form, name: e.target.value})}
            placeholder="Enter task name"
            required
          />
        </div>

        {/* Priority and Status */}
        <div className="task-form-field">
          <label>Priority</label>
          <Select
            options={PRIORITY_OPTIONS}
            value={PRIORITY_OPTIONS.find(p => p.value === form.priority)}
            onChange={(selected) => setForm({...form, priority: selected?.value || "Medium"})}
            styles={customSelectStyles}
          />
        </div>

        <div className="task-form-field">
          <label>Status</label>
          <Select
            options={STATUS_OPTIONS}
            value={STATUS_OPTIONS.find(s => s.value === form.status)}
            onChange={(selected) => setForm({...form, status: selected?.value || "Assigned"})}
            styles={customSelectStyles}
          />
        </div>

        {/* Dates */}
        <div className="task-form-field">
          <label>Start Date</label>
          <input
            type="text"
            placeholder="DD/MM/YYYY"
            value={formattedStartDate}
            onChange={handleStartDateChange}
            maxLength={10}
          />
        </div>

        <div className="task-form-field">
          <label>End Date</label>
          <input
            type="text"
            placeholder="DD/MM/YYYY"
            value={formattedEndDate}
            onChange={handleEndDateChange}
            maxLength={10}
          />
        </div>

        {/* Assigned To */}
        <div className="task-form-field full-width">
          <label>Assigned To</label>
          {error ? (
            <div className="error-message">{error}</div>
          ) : (
            <Select
              options={members}
              value={selectedAssignedTo}
              onChange={(selected) => setForm({...form, assignedTo: selected?.value || ""})}
              placeholder={membersLoading ? "Loading members..." : "Select assignee"}
              isClearable
              isLoading={membersLoading}
              styles={customSelectStyles}
            />
          )}
        </div>

        {/* Dependencies */}
        <div className="task-form-field full-width">
          <label>Dependencies (Tasks that must be completed before this one)</label>
          <Select
            options={tasks}
            value={selectedDependencies}
            onChange={(selected) => setForm({...form, dependencies: selected.map(s => s.value)})}
            placeholder={tasksLoading ? "Loading tasks..." : "Select dependencies"}
            isMulti
            isLoading={tasksLoading}
            styles={customSelectStyles}
          />
        </div>

        {/* Description */}
        <div className="task-form-field full-width">
          <label>Description</label>
          <textarea
            value={form.description || ""}
            onChange={(e) => setForm({...form, description: e.target.value})}
            placeholder="Enter task description"
            rows="3"
          />
        </div>

        {/* Form Buttons */}
        <div className="task-form-buttons">
          <button type="button" className="task-clear-btn" onClick={handleClear}>
            Clear
          </button>
          <button
            type="button"
            className="task-primary-btn"
            onClick={handleSubmit}
            disabled={loading || !form.name}
          >
            {loading ? "Saving..." : (editingId ? "Update Task" : "Create Task")}
          </button>
        </div>
      </div>
    </div>
  );
}

export default TaskForm;