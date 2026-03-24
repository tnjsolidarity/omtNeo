import React, { useState, useEffect } from "react";
import Select from "react-select";
import { FiX } from "react-icons/fi";
import "./MemberForm.css";

const MemberForm = ({
  form,
  setForm,
  handleSubmit,
  loading,
  editingId,
  handleClear,
  handleClose,
  skillOptions,
  careerOptions,
  educationOptions,
  departmentOptions,
  passedOutYearOptions,
}) => {
  // State for formatted date display
  const [formattedDate, setFormattedDate] = useState("");

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
    // Check if it matches DD/MM/YYYY format
    const parts = dateString.split("/");
    if (parts.length === 3) {
      const [day, month, year] = parts;
      // Validate if it's a valid date
      if (day && month && year && day.length === 2 && month.length === 2 && year.length === 4) {
        return `${year}-${month}-${day}`;
      }
    }
    return "";
  };

  // Handle date change with custom formatting
  const handleDateChange = (e) => {
    let inputValue = e.target.value;
    
    // Auto-format as user types
    let cleaned = inputValue.replace(/\D/g, "");
    
    if (cleaned.length >= 3) {
      cleaned = cleaned.slice(0, 2) + "/" + cleaned.slice(2);
    }
    if (cleaned.length >= 6) {
      cleaned = cleaned.slice(0, 5) + "/" + cleaned.slice(5, 9);
    }
    
    // Limit to 10 characters (DD/MM/YYYY)
    if (cleaned.length > 10) {
      cleaned = cleaned.slice(0, 10);
    }
    
    setFormattedDate(cleaned);
    
    // Update form with YYYY-MM-DD format if valid
    if (cleaned.length === 10) {
      const storageDate = parseDateForStorage(cleaned);
      if (storageDate) {
        setForm({ ...form, dateOfBirth: storageDate });
      } else {
        setForm({ ...form, dateOfBirth: "" });
      }
    } else {
      setForm({ ...form, dateOfBirth: "" });
    }
  };

  // Initialize formatted date when form.dateOfBirth changes from props
  useEffect(() => {
    if (form.dateOfBirth) {
      setFormattedDate(formatDateForDisplay(form.dateOfBirth));
    } else {
      setFormattedDate("");
    }
  }, [form.dateOfBirth]);

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
        {/* Name Field */}
        <div className="form-field">
          <label className="required">Full Name</label>
          <input
            type="text"
            placeholder="Enter full name"
            value={form.name || ""}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />
        </div>

        {/* Phone Field */}
        <div className="form-field">
          <label className="required">Phone Number</label>
          <input
            type="tel"
            placeholder="Enter phone number"
            value={form.phone || ""}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            required
          />
        </div>
        
        {/* Date of Birth field with DD/MM/YYYY format */}
        <div className="form-field">
          <label className="required">Date of Birth</label>
          <div className="dob-field-container">
            <input
              type="text"
              placeholder="DD/MM/YYYY"
              value={formattedDate}
              onChange={handleDateChange}
              maxLength={10}
              className="dob-input"
              required
            />
            {form.dateOfBirth && (
              <span className="age-display">
                Age: {calculateAge(form.dateOfBirth)} years
              </span>
            )}
          </div>
        </div>

        {/* Role Field */}
        <div className="form-field">
          <label className="required">Role</label>
          <select
            value={form.role || "Associate"}
            onChange={(e) => setForm({ ...form, role: e.target.value })}
            required
          >
            <option value="Associate">Associate</option>
            <option value="Member">Member</option>
            <option value="GuestMember">Guest Member</option>
            <option value="District Secretary">District Secretary</option>
            <option value="District President">District President</option>
            <option value="State President">State President</option>
          </select>
        </div>

        {/* Skills Field */}
        <div className="form-field">
          <label>Skills</label>
          <Select
            isMulti
            name="skills"
            options={skillOptions}
            value={form.skills || []}
            onChange={(selectedOptions) => setForm({ ...form, skills: selectedOptions || [] })}
            placeholder="Select skills"
            menuPortalTarget={document.body}
            className="react-select-container"
            classNamePrefix="react-select"
          />
        </div>

        {/* Career Field */}
        <div className="form-field">
          <label>Career / Profession</label>
          <Select
            isMulti
            name="career"
            options={careerOptions}
            value={form.career || []}
            onChange={(selected) => setForm({ ...form, career: selected || [] })}
            placeholder="Select career"
            menuPortalTarget={document.body}
            className="react-select-container"
            classNamePrefix="react-select"
          />
        </div>

        {/* Education Field */}
        <div className="form-field">
          <label>Education</label>
          <Select
            isMulti
            name="education"
            options={educationOptions}
            value={form.education || []}
            onChange={(selected) => setForm({ ...form, education: selected || [] })}
            placeholder="Select education"
            menuPortalTarget={document.body}
            className="react-select-container"
            classNamePrefix="react-select"
          />
        </div>

        {/* Educational Department */}
        <div className="form-field">
          <label>Educational Department</label>
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
            className="react-select-container"
            classNamePrefix="react-select"
          />
        </div>

        {/* Passed Out Year */}
        <div className="form-field">
          <label>Passed Out Year</label>
          <Select
            name="passedOutYear"
            options={passedOutYearOptions}
            value={passedOutYearOptions.find(y => y.value === form.passedOutYear) || null}
            onChange={handlePassedOutYearChange}
            placeholder="Select Passed Out Year"
            isClearable
            menuPortalTarget={document.body}
            className="react-select-container"
            classNamePrefix="react-select"
          />
        </div>

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