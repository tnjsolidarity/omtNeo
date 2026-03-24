import React, { useState, useEffect } from "react";
import Select from "react-select";
import { FiX } from "react-icons/fi";
import { getMembers } from "../../services/memberService";
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
  
  // State for formatted date displays
  const [formattedStartDate, setFormattedStartDate] = useState("");
  const [formattedEndDate, setFormattedEndDate] = useState("");

  // Format date from YYYY-MM-DD to DD/MM/YYYY for display
  const formatDateForDisplay = (dateString) => {
    if (!dateString) return "";
    const [year, month, day] = dateString.split("-");
    if (!year || !month || !day) return "";
    return `${day}/${month}/${year}`;
  };

  // Parse date from DD/MM/YYYY to YYYY-MM-DD for storage
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

  // Handle start date change with formatting
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

  // Handle end date change with formatting
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

  // Initialize formatted dates when form dates change from props
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

  // Fetch members for project manager dropdown
  useEffect(() => {
    const fetchMembers = async () => {
      setMembersLoading(true);
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
      } finally {
        setMembersLoading(false);
      }
    };
    
    fetchMembers();
  }, []);

  const selectedManager = members.find(m => m.value === form.projectManager);

  return (
    <div className="project-form-container">
      <div className="form-header">
        <h3>{editingId ? 'Edit Project' : 'Create New Project'}</h3>
        <button className="form-close-btn" onClick={handleClose}>
          <FiX size={20} />
        </button>
      </div>

      <div className="form-section">
        {/* Project Name */}
        <div className="form-field">
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
            menuPortalTarget={document.body}
            menuPosition="fixed"
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
            menuPortalTarget={document.body}
            menuPosition="fixed"
          />
        </div>

        {/* Start Date with DD/MM/YYYY format */}
        <div className="form-field">
          <label>Start Date</label>
          <div className="date-field-container">
            <input
              type="text"
              placeholder="DD/MM/YYYY"
              value={formattedStartDate}
              onChange={handleStartDateChange}
              maxLength={10}
              className="date-input"
            />
          </div>
        </div>

        {/* End Date with DD/MM/YYYY format */}
        <div className="form-field">
          <label>End Date</label>
          <div className="date-field-container">
            <input
              type="text"
              placeholder="DD/MM/YYYY"
              value={formattedEndDate}
              onChange={handleEndDateChange}
              maxLength={10}
              className="date-input"
            />
          </div>
        </div>

        {/* Project Manager - Member Select */}
        <div className="form-field">
          <label>Project Manager</label>
          <Select
            className="react-select-container"
            classNamePrefix="react-select"
            options={members}
            value={selectedManager}
            onChange={(selected) => setForm({...form, projectManager: selected?.value || ""})}
            placeholder={membersLoading ? "Loading members..." : "Select project manager"}
            isClearable
            isLoading={membersLoading}
            menuPortalTarget={document.body}
            menuPosition="fixed"
          />
        </div>

        {/* Description - Full Width */}
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