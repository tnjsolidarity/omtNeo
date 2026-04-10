import React, { useState, useEffect } from "react";
import Select from "react-select";
import DatePicker from "react-datepicker";
import { FiX, FiUpload, FiUser } from "react-icons/fi";
import "react-datepicker/dist/react-datepicker.css";
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
  const [dob, setDob] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [photoFile, setPhotoFile] = useState(null);

  // Parse date function
  const parseDateFromString = (dateString) => {
    if (!dateString) return null;
    const [year, month, day] = dateString.split("-");
    if (!year || !month || !day) return null;
    return new Date(year, month - 1, day);
  };

  const formatDateForStorage = (date) => {
    if (!date) return "";
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const handleDateChange = (date) => {
    setDob(date);
    setForm({ ...form, dateOfBirth: formatDateForStorage(date) });
  };

  useEffect(() => {
    if (form.dateOfBirth) {
      setDob(parseDateFromString(form.dateOfBirth));
    } else {
      setDob(null);
    }
  }, [form.dateOfBirth]);

  // Handle photo upload
  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert("Photo size should be less than 5MB");
        return;
      }
      
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        alert("Only JPG, PNG, GIF, and WEBP formats are allowed");
        return;
      }
      
      setPhotoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result);
      };
      reader.readAsDataURL(file);
      
      // Update form with file
      setForm({ ...form, photoFile: file });
    }
  };

  // Initialize photo preview when editing
  useEffect(() => {
    if (form.photoUrl && !photoPreview) {
      setPhotoPreview(form.photoUrl);
    }
  }, [form.photoUrl]);

  const handlePassedOutYearChange = (selected) => {
    setForm({ 
      ...form, 
      passedOutYear: selected ? selected.value : null 
    });
  };

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

  const getMaxDate = () => {
    return new Date();
  };

  const getMinDate = () => {
    const date = new Date();
    date.setFullYear(date.getFullYear() - 100);
    return date;
  };

  return (
    <div className="member-form-container">
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
        {/* Photo Upload Field */}
        <div className="form-field photo-upload-field">
          <label>Profile Photo</label>
          <div className="photo-upload-container">
            <div className="photo-preview">
              {photoPreview ? (
                <img src={photoPreview} alt="Preview" className="photo-preview-img" />
              ) : (
                <div className="photo-placeholder">
                  <FiUser size={40} />
                  <span>No Photo</span>
                </div>
              )}
            </div>
            <div className="photo-upload-controls">
              <label className="photo-upload-btn">
                <FiUpload size={16} />
                {photoPreview ? "Change Photo" : "Upload Photo"}
                <input
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                  onChange={handlePhotoChange}
                  style={{ display: 'none' }}
                />
              </label>
              {photoPreview && (
                <button
                  type="button"
                  className="photo-remove-btn"
                  onClick={() => {
                    setPhotoPreview(null);
                    setPhotoFile(null);
                    setForm({ ...form, photoFile: null, photoUrl: null });
                  }}
                >
                  Remove
                </button>
              )}
            </div>
          </div>
          <small className="photo-hint">Supported formats: JPG, PNG, GIF, WEBP (Max 5MB)</small>
        </div>

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
        
        {/* Date of Birth field */}
        <div className="form-field">
          <label className="required">Date of Birth</label>
          <div className="dob-field-container">
            <DatePicker
              selected={dob}
              onChange={handleDateChange}
              dateFormat="dd/MM/yyyy"
              placeholderText="DD/MM/YYYY"
              className="dob-input"
              popperClassName="date-picker-popper"
              popperPlacement="bottom-start"
              showMonthDropdown
              showYearDropdown
              dropdownMode="select"
              isClearable
              maxDate={getMaxDate()}
              minDate={getMinDate()}
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