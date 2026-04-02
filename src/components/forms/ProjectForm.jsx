import React, { useState, useEffect } from "react";
import Select from "react-select";
import DatePicker from "react-datepicker";
import { FiX } from "react-icons/fi";
import { getMembers } from "../../services/memberService";
import "react-datepicker/dist/react-datepicker.css";
import "./ProjectForm.css";

// Constants
const STATUS_OPTIONS = [
  { value: "Planning", label: "Planning" },
  { value: "In Progress", label: "In Progress" },
  { value: "On Hold", label: "On Hold" },
  { value: "Completed", label: "Completed" },
  { value: "Cancelled", label: "Cancelled" }
];

const PRIORITY_OPTIONS = [
  { value: "Low", label: "Low" },
  { value: "Medium", label: "Medium" },
  { value: "High", label: "High" },
  { value: "Critical", label: "Critical" }
];

function ProjectForm({
  form,
  setForm,
  handleSubmit,
  loading,
  editingId,
  handleClear,
  handleClose
}) {
  const [members, setMembers] = useState([]);
  const [membersLoading, setMembersLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // State for date picker
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  // Convert string date to Date object for date picker
  const parseDateFromString = (dateString) => {
    if (!dateString) return null;
    const [year, month, day] = dateString.split("-");
    if (!year || !month || !day) return null;
    return new Date(year, month - 1, day);
  };

  // Convert Date object to YYYY-MM-DD string for storage
  const formatDateForStorage = (date) => {
    if (!date) return "";
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  // Handle start date change
  const handleStartDateChange = (date) => {
    setStartDate(date);
    setForm({ ...form, startDate: formatDateForStorage(date) });
  };

  // Handle end date change
  const handleEndDateChange = (date) => {
    setEndDate(date);
    setForm({ ...form, endDate: formatDateForStorage(date) });
  };

  // Initialize date pickers when form dates change from props
  useEffect(() => {
    if (form.startDate) {
      setStartDate(parseDateFromString(form.startDate));
    } else {
      setStartDate(null);
    }
    
    if (form.endDate) {
      setEndDate(parseDateFromString(form.endDate));
    } else {
      setEndDate(null);
    }
  }, [form.startDate, form.endDate]);

  // Fetch members for project manager dropdown
  useEffect(() => {
    const fetchMembers = async () => {
      setMembersLoading(true);
      setError(null);
      try {
        const response = await getMembers();
        if (response?.data) {
          const memberOptions = response.data.map(member => ({
            value: member._id,
            label: `${member.name} (${member.memberId || 'No ID'}) - ${member.role}`,
            name: member.name,
            role: member.role
          }));
          setMembers(memberOptions);
        }
      } catch (err) {
        console.error("Error fetching members:", err);
        setError("Failed to load members. Please try again.");
      } finally {
        setMembersLoading(false);
      }
    };
    
    fetchMembers();
  }, []);

  const selectedManager = members.find(m => m.value === form.projectManager);

  // Custom styles for react-select to ensure dropdown appears
  const customSelectStyles = {
    menuPortal: (base) => ({ ...base, zIndex: 9999 }),
    menu: (base) => ({ ...base, zIndex: 9999 })
  };

  return (
    <div className="project-form-container">
      <div className="form-header">
        <h3>{editingId ? 'Edit Project' : 'Create New Project'}</h3>
        <button className="form-close-btn" onClick={handleClose} aria-label="Close form">
          <FiX size={20} />
        </button>
      </div>

      <div className="form-section">
        {/* Project Name */}
        <div className="form-field full-width">
          <label className="required">Project Name</label>
          <input
            type="text"
            value={form.name || ""}
            onChange={(e) => setForm({...form, name: e.target.value})}
            placeholder="Enter project name"
            required
          />
        </div>

        {/* Status Select */}
        <div className="form-field">
          <label>Status</label>
          <Select
            className="react-select-container"
            classNamePrefix="react-select"
            options={STATUS_OPTIONS}
            value={STATUS_OPTIONS.find(s => s.value === form.status)}
            onChange={(selected) => setForm({...form, status: selected?.value || "Planning"})}
            placeholder="Select status"
            styles={customSelectStyles}
          />
        </div>

        {/* Priority Select */}
        <div className="form-field">
          <label>Priority</label>
          <Select
            className="react-select-container"
            classNamePrefix="react-select"
            options={PRIORITY_OPTIONS}
            value={PRIORITY_OPTIONS.find(p => p.value === form.priority)}
            onChange={(selected) => setForm({...form, priority: selected?.value || "Medium"})}
            placeholder="Select priority"
            styles={customSelectStyles}
          />
        </div>

        {/* Start Date with DatePicker */}
        <div className="form-field">
          <label>Start Date</label>
          <div className="date-picker-container">
            <DatePicker
              selected={startDate}
              onChange={handleStartDateChange}
              dateFormat="dd/MM/yyyy"
              placeholderText="DD/MM/YYYY"
              className="date-picker-input"
              popperClassName="date-picker-popper"
              popperPlacement="bottom-start"
              showMonthDropdown
              showYearDropdown
              dropdownMode="select"
              isClearable
            />
          </div>
        </div>

        {/* End Date with DatePicker */}
        <div className="form-field">
          <label>End Date</label>
          <div className="date-picker-container">
            <DatePicker
              selected={endDate}
              onChange={handleEndDateChange}
              dateFormat="dd/MM/yyyy"
              placeholderText="DD/MM/YYYY"
              className="date-picker-input"
              popperClassName="date-picker-popper"
              popperPlacement="bottom-start"
              showMonthDropdown
              showYearDropdown
              dropdownMode="select"
              isClearable
              minDate={startDate || null}
            />
          </div>
        </div>

        {/* Project Manager - Member Select */}
        <div className="form-field full-width">
          <label>Project Manager</label>
          {error ? (
            <div className="error-message">{error}</div>
          ) : (
            <Select
              className="react-select-container"
              classNamePrefix="react-select"
              options={members}
              value={selectedManager}
              onChange={(selected) => setForm({...form, projectManager: selected?.value || ""})}
              placeholder={membersLoading ? "Loading members..." : "Select project manager"}
              isClearable
              isLoading={membersLoading}
              styles={customSelectStyles}
            />
          )}
        </div>

        {/* Description */}
        <div className="form-field full-width">
          <label>Description</label>
          <textarea
            value={form.description || ""}
            onChange={(e) => setForm({...form, description: e.target.value})}
            placeholder="Enter project description"
            rows="3"
          />
        </div>

        {/* Form Buttons */}
        <div className="form-buttons">
          <button type="button" className="clear-btn" onClick={handleClear}>
            Clear
          </button>
          <button
            type="button"
            className="primary-btn"
            onClick={handleSubmit}
            disabled={loading || !form.name}
          >
            {loading ? "Saving..." : (editingId ? "Update Project" : "Create Project")}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ProjectForm;