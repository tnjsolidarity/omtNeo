import React from "react";
import Select from "react-select";
import { FiX } from "react-icons/fi"; // Import FiX for the close icon
import "./MemberForm.css";

const MemberForm = ({
  form,
  setForm,
  handleSubmit,
  loading,
  editingId,
  handleClear,
  handleClose, // Add this prop
  skillOptions,
  careerOptions,
  educationOptions,
  departmentOptions,
  passedOutYearOptions,
}) => {
  // Handle passedOutYear change safely
  const handlePassedOutYearChange = (selected) => {
    setForm({ 
      ...form, 
      passedOutYear: selected ? selected.value : null 
    });
  };

  // Add this helper function for age calculation display
  const calculateAge = (dob) => {
    if (!dob) return null;
    const birth = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  // Custom styles for React Select
  const selectStyles = {
    menuPortal: (base) => ({ ...base, zIndex: 9999 }),
    control: (base) => ({ 
      ...base, 
      minHeight: '38px',
      height: 'auto',
    }),
    clearIndicator: (base) => ({
      ...base,
      padding: '4px',
      cursor: 'pointer',
      '&:hover': {
        color: '#dc3545',
      }
    }),
    indicatorSeparator: (base) => ({
      ...base,
      display: 'none',
    }),
    dropdownIndicator: (base) => ({
      ...base,
      padding: '4px',
    }),
    valueContainer: (base) => ({
      ...base,
      padding: '2px 8px',
    }),
    multiValue: (base) => ({
      ...base,
      backgroundColor: '#e8f0fe',
      borderRadius: '4px',
    }),
    multiValueLabel: (base) => ({
      ...base,
      color: '#3f51b5',
      fontSize: '13px',
    }),
    multiValueRemove: (base) => ({
      ...base,
      color: '#3f51b5',
      '&:hover': {
        backgroundColor: '#3f51b5',
        color: 'white',
      }
    }),
  };

  return (
    <div className="member-form-container">
      {/* Form Header with Title and Close Button */}
      <div className="form-header">
        <h3>{editingId ? 'Edit Member' : 'Add New Member'}</h3>
        <button 
          className="form-close-btn"
          onClick={handleClose}
          type="button"
          aria-label="Close"
        >
          <FiX size={20} />
        </button>
      </div>

      <div className="form-section">
        <input
          placeholder="Name"
          value={form.name || ""}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />
        <input
          placeholder="Phone"
          value={form.phone || ""}
          onChange={(e) => setForm({ ...form, phone: e.target.value })}
        />
        
        {/* Date of Birth field */}
        <div className="dob-field-container">
          <input
            type="date"
            placeholder="Date of Birth"
            value={form.dateOfBirth || ""}
            onChange={(e) => setForm({ ...form, dateOfBirth: e.target.value })}
            max={new Date().toISOString().split('T')[0]}
            className="dob-input"
          />
          {form.dateOfBirth && (
            <span className="age-display">
              Age: {calculateAge(form.dateOfBirth)} years
            </span>
          )}
        </div>

        <select
          value={form.role || "Associate"}
          onChange={(e) => setForm({ ...form, role: e.target.value })}
        >
          <option value="Associate">Associate</option>
          <option value="Member">Member</option>
          <option value="GuestMember">GuestMember</option>
          <option value="District Secretary">District Secretary</option>
          <option value="District President">District President</option>
          <option value="State President">State President</option>
        </select>

        <Select
          isMulti
          name="skills"
          options={skillOptions}
          value={form.skills || []}
          onChange={(selectedOptions) => setForm({ ...form, skills: selectedOptions || [] })}
          placeholder="Select skills"
          menuPortalTarget={document.body}
          styles={selectStyles}
          className="react-select-container"
          classNamePrefix="react-select"
        />

        <Select
          isMulti
          name="career"
          options={careerOptions}
          value={form.career || []}
          onChange={(selected) => setForm({ ...form, career: selected || [] })}
          placeholder="Select career"
          menuPortalTarget={document.body}
          styles={selectStyles}
          className="react-select-container"
          classNamePrefix="react-select"
        />

        <Select
          isMulti
          name="education"
          options={educationOptions}
          value={form.education || []}
          onChange={(selected) => setForm({ ...form, education: selected || [] })}
          placeholder="Select education"
          menuPortalTarget={document.body}
          styles={selectStyles}
          className="react-select-container"
          classNamePrefix="react-select"
        />

        {/* Educational Department */}
        <Select
          name="educationalDepartment"
          options={departmentOptions}
          value={departmentOptions.find(d => d.value === form.educationalDepartment) || null}
          onChange={(selected) =>
            setForm({ ...form, educationalDepartment: selected ? selected.value : "" })
          }
          placeholder="Select Department"
          isClearable
          menuPortalTarget={document.body}
          styles={selectStyles}
          className="react-select-container"
          classNamePrefix="react-select"
        />

        {/* Passed Out Year */}
        <Select
          name="passedOutYear"
          options={passedOutYearOptions}
          value={passedOutYearOptions.find(y => y.value === form.passedOutYear) || null}
          onChange={handlePassedOutYearChange}
          placeholder="Select Passed Out Year"
          isClearable
          menuPortalTarget={document.body}
          styles={selectStyles}
          className="react-select-container"
          classNamePrefix="react-select"
        />

        <div className="form-buttons">
          <button
            className="primary-btn"
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? "Processing..." : editingId ? "Update Member" : "Add Member"}
          </button>
          <button
            type="button"
            className="clear-btn"
            onClick={handleClear}
          >
            Clear
          </button>
        </div>
      </div>
    </div>
  );
};

export default MemberForm;