import React, { useState, useEffect } from "react";
import Select from "react-select";
import { FiX, FiUpload, FiUser } from "react-icons/fi";
import DistrictPlaceSelect from "./commonData/DistrictPlaceSelect";
import "./MemberForm.css";

const roleOptions = [
  { value: "Associate", label: "Associate" },
  { value: "Guest Associate", label: "Guest Associate" },
  { value: "Member", label: "Member" },
  { value: "GuestMember", label: "Guest Member" },
  { value: "District Secretary", label: "District Secretary" },
  { value: "District President", label: "District President" },
  { value: "State President", label: "State President" },
];

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
  members = [],
}) => {
  const [dobText, setDobText] = useState("");
  const [photoPreview, setPhotoPreview] = useState(null);
  const [photoFile, setPhotoFile] = useState(null);

  const isValidDate = (day, month, year) => {
    const d = parseInt(day, 10);
    const m = parseInt(month, 10) - 1; // 0-indexed month
    const y = parseInt(year, 10);
    if (isNaN(d) || isNaN(m) || isNaN(y)) return false;
    const date = new Date(y, m, d);
    return date.getFullYear() === y && date.getMonth() === m && date.getDate() === d;
  };

  const formatDigits = (digits) => {
    let formatted = "";
    let i = 0;

    // 1. Process DD (Day)
    if (i < digits.length) {
      const d1 = digits[i];
      i++;

      if (d1 >= "4" && d1 <= "9") {
        // Single digit day: auto-prepend 0 and add slash
        formatted += `0${d1}/`;
      } else {
        // Could be a 2-digit day (starting with 0, 1, 2, 3)
        if (i < digits.length) {
          const d2 = digits[i];
          i++;
          const dayVal = parseInt(d1 + d2, 10);
          if (dayVal >= 1 && dayVal <= 31) {
            formatted += `${d1}${d2}/`;
          } else {
            // Treat d1 as single digit day (0+d1/) and process d2 next
            formatted += `0${d1}/`;
            i--;
          }
        } else {
          formatted += d1;
        }
      }
    }

    // 2. Process MM (Month)
    if (i < digits.length) {
      const m1 = digits[i];
      i++;

      if (m1 >= "2" && m1 <= "9") {
        // Single digit month: auto-prepend 0 and add slash
        formatted += `0${m1}/`;
      } else {
        // Could be a 2-digit month (starting with 0 or 1)
        if (i < digits.length) {
          const m2 = digits[i];
          i++;
          const monthVal = parseInt(m1 + m2, 10);
          if (monthVal >= 1 && monthVal <= 12) {
            formatted += `${m1}${m2}/`;
          } else {
            // Treat m1 as single digit month (0+m1/) and process m2 next
            formatted += `0${m1}/`;
            i--;
          }
        } else {
          formatted += m1;
        }
      }
    }

    // 3. Process YYYY (Year)
    if (i < digits.length) {
      const yearPart = digits.slice(i, i + 4);
      formatted += yearPart;
    }

    return formatted;
  };

  const formatDobInput = (value, prevValue = "") => {
    const digits = value.replace(/\D/g, "");

    // Handle backspace deleting a slash
    if (value.length < prevValue.length) {
      const prevDigits = prevValue.replace(/\D/g, "");
      if (digits.length === prevDigits.length) {
        return formatDigits(digits.slice(0, -1));
      }
      return formatDigits(digits);
    }

    return formatDigits(digits);
  };

  const handleDobChange = (e) => {
    const input = e.target;
    const rawVal = input.value;
    const cursor = input.selectionStart;
    const formatted = formatDobInput(rawVal, dobText);

    // Calculate cursor position
    let formattedCursor = 0;
    if (cursor === rawVal.length) {
      formattedCursor = formatted.length;
    } else {
      const rawBeforeCursor = rawVal.slice(0, cursor);
      const digitsBeforeCursor = rawBeforeCursor.replace(/\D/g, "").length;

      let digitCount = 0;
      for (let idx = 0; idx < formatted.length; idx++) {
        if (formatted[idx] !== "/") {
          digitCount++;
        }
        if (digitCount === digitsBeforeCursor) {
          formattedCursor = idx + 1;
          break;
        }
      }
      if (digitsBeforeCursor === 0) {
        formattedCursor = 0;
      } else if (digitCount < digitsBeforeCursor) {
        formattedCursor = formatted.length;
      }
    }

    setDobText(formatted);

    // Validation & updating form state
    const parts = formatted.split("/");
    if (parts.length === 3 && parts[2].length === 4) {
      const [day, month, year] = parts;
      if (isValidDate(day, month, year)) {
        const dateStr = `${year}-${month}-${day}`;
        setForm({ ...form, dateOfBirth: dateStr });
        input.setCustomValidity("");
      } else {
        setForm({ ...form, dateOfBirth: "" });
        input.setCustomValidity("Please enter a valid date");
      }
    } else {
      setForm({ ...form, dateOfBirth: "" });
      if (!formatted) {
        input.setCustomValidity("");
      } else {
        input.setCustomValidity("Please enter a complete date (DD/MM/YYYY)");
      }
    }

    setTimeout(() => {
      input.setSelectionRange(formattedCursor, formattedCursor);
    }, 0);
  };

  useEffect(() => {
    let expectedText = "";
    if (form.dateOfBirth) {
      const parts = form.dateOfBirth.split("-");
      if (parts.length === 3) {
        const [year, month, day] = parts;
        expectedText = `${day}/${month}/${year}`;
      }
    }

    let currentMappedDate = "";
    const dobParts = dobText.split("/");
    if (dobParts.length === 3 && dobParts[2].length === 4) {
      const [day, month, year] = dobParts;
      if (isValidDate(day, month, year)) {
        currentMappedDate = `${year}-${month}-${day}`;
      }
    }

    if (form.dateOfBirth !== currentMappedDate) {
      setDobText(expectedText);
    }
  }, [form.dateOfBirth]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        const formContainer = document.querySelector(".member-form-container");
        if (!formContainer) return;

        const activeElement = document.activeElement;
        if (activeElement && formContainer.contains(activeElement) && activeElement !== document.body) {
          activeElement.blur();
          e.preventDefault();
          e.stopPropagation();
        } else {
          handleClose();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleClose]);

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

      <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }} className="form-section">
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
            onChange={(e) => {
              const onlyNums = e.target.value.replace(/\D/g, "");
              setForm({ ...form, phone: onlyNums });
            }}
            required
          />
        </div>

        {/* Date of Birth field */}
        <div className="form-field">
          <label className="required">Date of Birth</label>
          <div className="dob-field-container">
            <input
              type="text"
              value={dobText}
              onChange={handleDobChange}
              placeholder="DD/MM/YYYY"
              className="dob-input"
              maxLength={10}
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
          <Select
            name="role"
            options={roleOptions}
            value={roleOptions.find(o => o.value === (form.role || "Associate")) || null}
            onChange={(selected) => setForm({ ...form, role: selected ? selected.value : "" })}
            placeholder="Select role"
            menuPortalTarget={document.body}
            className="react-select-container"
            classNamePrefix="react-select"
          />
        </div>

        {/* District & Place — shown only for Guest roles */}
        {(form.role === "Guest Associate" || form.role === "GuestMember") && (
          <DistrictPlaceSelect
            districtValue={form.district || ""}
            placeValue={form.place || ""}
            onDistrictChange={(val) => setForm(prev => ({ ...prev, district: val, place: prev.place && prev.place === prev.district ? val : prev.place }))}
            onPlaceChange={(val) => setForm(prev => ({ ...prev, place: val }))}
            members={members}
          />
        )}

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

        {/* Education History Section */}
        <div className="education-history-section">
          <div className="section-header">
            <label>Education History</label>
            <button
              type="button"
              className="add-edu-btn"
              onClick={() => {
                const newEdu = [...(form.education || []), { degree: "", department: "", passedOutYear: null }];
                setForm({ ...form, education: newEdu });
              }}
            >
              + Add Education
            </button>
          </div>

          {(form.education || []).length === 0 ? (
            <p className="no-edu-msg">No education details added yet.</p>
          ) : (
            <div className="edu-list">
              {form.education.map((edu, index) => (
                <div key={index} className="edu-item-card">
                  <div className="edu-item-header">
                    <span>Education #{index + 1}</span>
                    <button
                      type="button"
                      className="remove-edu-btn"
                      onClick={() => {
                        const newEdu = form.education.filter((_, i) => i !== index);
                        setForm({ ...form, education: newEdu });
                      }}
                    >
                      <FiX size={14} /> Remove
                    </button>
                  </div>
                  <div className="edu-item-grid">
                    <div className="edu-field">
                      <label>Degree</label>
                      <Select
                        options={educationOptions}
                        value={educationOptions.find(o => o.value === edu.degree) || null}
                        onChange={(selected) => {
                          const newEdu = [...form.education];
                          newEdu[index].degree = selected ? selected.value : "";
                          setForm({ ...form, education: newEdu });
                        }}
                        placeholder="Select degree"
                        menuPortalTarget={document.body}
                      />
                    </div>
                    <div className="edu-field">
                      <label>Department</label>
                      <Select
                        options={departmentOptions}
                        value={departmentOptions.find(o => o.value === edu.department) || null}
                        onChange={(selected) => {
                          const newEdu = [...form.education];
                          newEdu[index].department = selected ? selected.value : "";
                          setForm({ ...form, education: newEdu });
                        }}
                        placeholder="Select department"
                        menuPortalTarget={document.body}
                      />
                    </div>
                    <div className="edu-field">
                      <label>Year</label>
                      <Select
                        options={passedOutYearOptions}
                        value={passedOutYearOptions.find(o => o.value === edu.passedOutYear) || null}
                        onChange={(selected) => {
                          const newEdu = [...form.education];
                          newEdu[index].passedOutYear = selected ? selected.value : null;
                          setForm({ ...form, education: newEdu });
                        }}
                        placeholder="Year"
                        menuPortalTarget={document.body}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="form-buttons">
          <button
            type="submit"
            className="primary-btn"
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
      </form>
    </div>
  );
};

export default MemberForm;