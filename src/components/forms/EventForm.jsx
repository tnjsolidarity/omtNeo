import React, { useState, useEffect } from "react";
import Select from "react-select";
import { FiX } from "react-icons/fi";
import { getMembers } from "../../services/memberService";
import "./EventForm.css";

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

// Place options - you can customize these or fetch from API
const PLACE_OPTIONS = [
  { value: "People Welfare Center", label: "People Welfare Center" },
  { value: "MRG Engineering", label: "MRG Engineering" },
  { value: "Makka Masjid - Eeswari Nagar", label: "Makka Masjid - Eeswari Nagar" },
  { value: "Attar Mohalla Masjid", label: "Attar Mohalla Masjid" },
  { value: "Kuppatheru Masjid", label: "Kuppatheru Masjid" },
  { value: "Royal School", label: "Royal School" },
  { value: "Sri Besant Lodge", label: "Sri Besant Lodge" },
  { value: "Aringar Anna Marriage Hall", label: "Aringar Anna Marriage Hall" },
  { value: "Jupiter Theater Main Road", label: "(Jupiter Theater-Burma Bazar-Anna Road) Meeting Point" },
  { value: "Sai Veni Sports Academy", label: "Sai Veni Sports Academy" },
  { value: "ALMS Jamia Masjid - Athirambattinam", label: "ALMS Jamia Masjid - Athirambattinam" },
  { value: "JIH Office - Perambur", label: "JIH Office - Perambur" },
];

function EventForm({
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

  // Fetch members for assignedTo dropdown
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

  const selectedAssignedTo = members.find(m => m.value === form.assignedTo);
  const selectedPlace = PLACE_OPTIONS.find(p => p.value === form.place);

  // Custom styles for react-select to ensure dropdown appears
  const customSelectStyles = {
    menuPortal: (base) => ({ ...base, zIndex: 9999 }),
    menu: (base) => ({ ...base, zIndex: 9999 })
  };

  return (
    <div className="event-form-container">
      <div className="form-header">
        <h3>{editingId ? 'Edit Event' : 'Create New Event'}</h3>
        <button className="form-close-btn" onClick={handleClose} aria-label="Close form">
          <FiX size={20} />
        </button>
      </div>

      <div className="form-section">
        {/* Event Name */}
        <div className="form-field full-width">
          <label className="required">Event Name</label>
          <input
            type="text"
            value={form.name || ""}
            onChange={(e) => setForm({...form, name: e.target.value})}
            placeholder="Enter event name"
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
            onChange={(selected) => setForm({...form, priority: selected?.value || "Medium"})}
            placeholder="Select priority"
            styles={customSelectStyles}
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

        {/* Place Select - NEW DROPDOWN */}
        <div className="form-field">
          <label>Place</label>
          <Select
            className="react-select-container"
            classNamePrefix="react-select"
            options={PLACE_OPTIONS}
            value={selectedPlace}
            onChange={(selected) => setForm({...form, place: selected?.value || ""})}
            placeholder="Select or search place"
            isClearable
            styles={customSelectStyles}
          />
        </div>

        {/* Start Date */}
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

        {/* End Date */}
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

        {/* Assigned To - Member Select */}
        <div className="form-field full-width">
          <label>Assigned To</label>
          {error ? (
            <div className="error-message">{error}</div>
          ) : (
            <Select
              className="react-select-container"
              classNamePrefix="react-select"
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

        {/* Description */}
        <div className="form-field full-width">
          <label>Description</label>
          <textarea
            value={form.description || ""}
            onChange={(e) => setForm({...form, description: e.target.value})}
            placeholder="Enter event description"
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
            {loading ? "Saving..." : (editingId ? "Update Event" : "Create Event")}
          </button>
        </div>
      </div>
    </div>
  );
}

export default EventForm;