import React, { useState, useEffect } from "react";
import Select from "react-select";
import { FiX } from "react-icons/fi";
import { getMembers } from "../../services/memberService";
import "./ActivityForm.css";

// Constants
const PRIORITY_OPTIONS = [
  { value: "Low", label: "Low" },
  { value: "Medium", label: "Medium" },
  { value: "High", label: "High" },
  { value: "Critical", label: "Critical" }
];

const STATUS_OPTIONS = [
  { value: "Planning", label: "Planning" },
  { value: "In Progress", label: "In Progress" },
  { value: "On Hold", label: "On Hold" },
  { value: "Completed", label: "Completed" },
  { value: "Cancelled", label: "Cancelled" }
];

// Select styles
const selectStyles = {
  menuPortal: (base) => ({ ...base, zIndex: 9999 }),
  control: (base) => ({ 
    ...base, 
    minHeight: '40px',
    borderColor: '#dcdfe6',
    '&:hover': { borderColor: '#3f51b5' }
  })
};

function ActivityForm({
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

  // Fetch members for incharge dropdown
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

  const selectedIncharge = members.find(m => m.value === form.incharge);

  return (
    <div className="activity-form-container">
      <div className="form-header">
        <h3>{editingId ? 'Edit Activity' : 'Create New Activity'}</h3>
        <button className="form-close-btn" onClick={handleClose}>
          <FiX size={20} />
        </button>
      </div>

      <div className="form-section">
        {/* Activity Name */}
        <div className="form-field">
          <label>Activity Name *</label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => setForm({...form, name: e.target.value})}
            placeholder="Enter activity name"
            required
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
            onChange={(selected) => setForm({...form, priority: selected.value})}
            placeholder="Select priority"
            menuPortalTarget={document.body}
            menuPosition="fixed"
            styles={selectStyles}
          />
        </div>

        <div className="form-field">
          <label>Status</label>
          <Select
            className="react-select-container"
            classNamePrefix="react-select"
            options={STATUS_OPTIONS}
            value={STATUS_OPTIONS.find(s => s.value === form.status)}
            onChange={(selected) => setForm({...form, status: selected.value})}
            placeholder="Select status"
            menuPortalTarget={document.body}
            menuPosition="fixed"
            styles={selectStyles}
          />
        </div>

        {/* Start Date */}
        <div className="form-field">
          <label>Start Date</label>
          <input
            type="date"
            value={form.startDate}
            onChange={(e) => setForm({...form, startDate: e.target.value})}
          />
        </div>

        {/* End Date */}
        <div className="form-field">
          <label>End Date</label>
          <input
            type="date"
            value={form.endDate}
            onChange={(e) => setForm({...form, endDate: e.target.value})}
          />
        </div>

        {/* Incharge - Member Select */}
        <div className="form-field">
          <label>Incharge</label>
          {error ? (
            <div className="error-message">{error}</div>
          ) : (
            <Select
              className="react-select-container"
              classNamePrefix="react-select"
              options={members}
              value={selectedIncharge}
              onChange={(selected) => setForm({...form, incharge: selected?.value || ""})}
              placeholder={membersLoading ? "Loading members..." : "Select incharge"}
              isClearable
              isLoading={membersLoading}
              menuPortalTarget={document.body}
              menuPosition="fixed"
              styles={selectStyles}
            />
          )}
        </div>

        {/* Description - Full Width */}
        <div className="form-field full-width">
          <label>Description</label>
          <textarea
            value={form.description}
            onChange={(e) => setForm({...form, description: e.target.value})}
            placeholder="Enter activity description"
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
            {loading ? "Saving..." : (editingId ? "Update Activity" : "Create Activity")}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ActivityForm;