import React from "react";
import Select from "react-select";
import { FiX } from "react-icons/fi"; // Add this import for the close icon
import "./ProjectForm.css";

function ProjectForm({
  form,
  setForm,
  handleSubmit,
  loading,
  editingId,
  handleClear,
  handleClose
}) {
  // Status options
  const statusOptions = [
    { value: "Planning", label: "Planning" },
    { value: "In Progress", label: "In Progress" },
    { value: "On Hold", label: "On Hold" },
    { value: "Completed", label: "Completed" },
    { value: "Cancelled", label: "Cancelled" }
  ];

  const priorityOptions = [
    { value: "Low", label: "Low" },
    { value: "Medium", label: "Medium" },
    { value: "High", label: "High" },
    { value: "Critical", label: "Critical" }
  ];

  return (
    <div className="project-form-container">
      {/* Form Header with Title and Close Button - Matching MemberForm */}
      <div className="form-header">
        <h3>{editingId ? 'Edit Project' : 'Create New Project'}</h3>
        <button className="form-close-btn" onClick={handleClose}>
          <FiX size={20} />
        </button>
      </div>

      {/* Form Section - Matching MemberForm layout */}
      <div className="form-section">
        {/* Project Name */}
        <input
          type="text"
          value={form.name}
          onChange={(e) => setForm({...form, name: e.target.value})}
          placeholder="Project Name *"
          required
        />

        {/* Status Select */}
        <Select
          className="react-select-container"
          classNamePrefix="react-select"
          options={statusOptions}
          value={statusOptions.find(s => s.value === form.status)}
          onChange={(selected) => setForm({...form, status: selected.value})}
          placeholder="Select Status"
          menuPortalTarget={document.body}
          menuPosition="fixed"
          styles={{
            menuPortal: (base) => ({ ...base, zIndex: 9999 }),
            control: (base) => ({ 
              ...base, 
              minHeight: '40px',
              borderColor: '#dcdfe6',
              '&:hover': { borderColor: '#3f51b5' }
            })
          }}
        />

        {/* Priority Select */}
        <Select
          className="react-select-container"
          classNamePrefix="react-select"
          options={priorityOptions}
          value={priorityOptions.find(p => p.value === form.priority)}
          onChange={(selected) => setForm({...form, priority: selected.value})}
          placeholder="Select Priority"
          menuPortalTarget={document.body}
          menuPosition="fixed"
          styles={{
            menuPortal: (base) => ({ ...base, zIndex: 9999 }),
            control: (base) => ({ 
              ...base, 
              minHeight: '40px',
              borderColor: '#dcdfe6',
              '&:hover': { borderColor: '#3f51b5' }
            })
          }}
        />

        {/* Start Date */}
        <input
          type="date"
          value={form.startDate}
          onChange={(e) => setForm({...form, startDate: e.target.value})}
          placeholder="Start Date"
        />

        {/* End Date */}
        <input
          type="date"
          value={form.endDate}
          onChange={(e) => setForm({...form, endDate: e.target.value})}
          placeholder="End Date"
        />

        {/* Project Manager */}
        <input
          type="text"
          value={form.projectManager}
          onChange={(e) => setForm({...form, projectManager: e.target.value})}
          placeholder="Project Manager"
        />

        {/* Description - Takes full width */}
        <textarea
          value={form.description}
          onChange={(e) => setForm({...form, description: e.target.value})}
          placeholder="Project Description"
          rows="3"
          style={{ 
            gridColumn: '1 / -1',
            width: '100%',
            padding: '10px 12px',
            fontSize: '14px',
            borderRadius: '6px',
            border: '1px solid #dcdfe6',
            resize: 'vertical',
            minHeight: '80px',
            fontFamily: 'inherit'
          }}
        />

        {/* Form Buttons - Matching MemberForm */}
        <div className="form-buttons">
          <button
            type="button"
            className="clear-btn"
            onClick={handleClear}
          >
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