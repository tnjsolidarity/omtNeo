import React from "react";
import Select from "react-select";
import "./MemberForm.css";

const MemberForm = ({
  form,
  setForm,
  handleSubmit,
  loading,
  editingId,
  handleClear,
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

  return (
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
        styles={{
          menuPortal: (base) => ({ ...base, zIndex: 9999 }),
        }}
      />

      <Select
        isMulti
        name="career"
        options={careerOptions}
        value={form.career || []}
        onChange={(selected) => setForm({ ...form, career: selected || [] })}
        placeholder="Select career"
        menuPortalTarget={document.body}
        styles={{ menuPortal: (base) => ({ ...base, zIndex: 9999 }) }}
      />

      <Select
        isMulti
        name="education"
        options={educationOptions}
        value={form.education || []}
        onChange={(selected) => setForm({ ...form, education: selected || [] })}
        placeholder="Select education"
        menuPortalTarget={document.body}
        styles={{ menuPortal: (base) => ({ ...base, zIndex: 9999 }) }}
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
        styles={{ menuPortal: (base) => ({ ...base, zIndex: 9999 }) }}
      />

      {/* Passed Out Year - FIXED */}
      <Select
        name="passedOutYear"
        options={passedOutYearOptions}
        value={passedOutYearOptions.find(y => y.value === form.passedOutYear) || null}
        onChange={handlePassedOutYearChange}
        placeholder="Select Passed Out Year"
        isClearable
        menuPortalTarget={document.body}
        styles={{ 
          menuPortal: (base) => ({ ...base, zIndex: 9999 }),
          control: (base) => ({ ...base, minHeight: '38px' })
        }}
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
  );
};

export default MemberForm;