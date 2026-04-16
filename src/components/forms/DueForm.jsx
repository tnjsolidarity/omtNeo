// DueForm.jsx - Updated with member selection for "Due Sent To"
import { useEffect, useState } from "react";
import Select from "react-select";
import DatePicker from "react-datepicker";
import { getMembers } from "../../services/memberService";
import { getProjects } from "../../services/projectService";
import { FiX } from "react-icons/fi";
import "react-datepicker/dist/react-datepicker.css";
import "./DueForm.css";

function DueForm({ onSubmit, isLoading, initialData = null, onClose }) {
  const [dueType, setDueType] = useState("General");
  const [members, setMembers] = useState([]);
  const [projects, setProjects] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [useExistingMember, setUseExistingMember] = useState(true);
  const [useExistingSentTo, setUseExistingSentTo] = useState(true); // NEW: For Due Sent To
  const [form, setForm] = useState({
    dueName: "",
    dueAmount: "",
    date: "",
    description: "",
    dueTransferMode: "",
    dueTransferId: "",
    sentTo: "",
    sentToMemberId: null, // NEW: For selected member
    sentToNonMemberInfo: {
      name: "",
      contactNumber: "",
      description: ""
    },
    memberId: null,
    nonMemberInfo: {
      name: "",
      contactNumber: "",
      description: ""
    },
    projectId: null,
    activityId: null,
    eventId: null,
    taskId: null
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [membersRes, projectsRes] = await Promise.all([
          getMembers(),
          getProjects()
        ]);
        setMembers(membersRes.data);
        setProjects(projectsRes.data);
      } catch (err) {
        console.error("Error fetching data:", err);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (initialData) {
      setDueType(initialData.dueType || "General");
      setUseExistingMember(!!initialData.memberId);
      setUseExistingSentTo(!!initialData.sentToMemberId); // NEW: Check if sentToMemberId exists
      setForm({
        dueName: initialData.dueName || "",
        dueAmount: initialData.dueAmount || "",
        date: initialData.date ? initialData.date.split("T")[0] : "",
        description: initialData.description || "",
        dueTransferMode: initialData.dueTransferMode || "",
        dueTransferId: initialData.dueTransferId || "",
        sentTo: initialData.sentTo || "",
        sentToMemberId: initialData.sentToMemberId?._id 
          ? { value: initialData.sentToMemberId._id, label: initialData.sentToMemberId.name } 
          : null,
        sentToNonMemberInfo: initialData.sentToNonMemberInfo || {
          name: "",
          contactNumber: "",
          description: ""
        },
        memberId: initialData.memberId?._id 
          ? { value: initialData.memberId._id, label: initialData.memberId.name } 
          : null,
        nonMemberInfo: initialData.nonMemberInfo || {
          name: "",
          contactNumber: "",
          description: ""
        },
        projectId: initialData.projectId?._id 
          ? { value: initialData.projectId._id, label: initialData.projectId.name } 
          : null,
        activityId: initialData.activityId || null,
        eventId: initialData.eventId || null,
        taskId: initialData.taskId || null
      });
    }
  }, [initialData]);

  const formatDateToISO = (date) => {
    if (!date) return "";
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${year}-${month}-${day}`;
  };

  const parseDateFromISO = (dateString) => {
    if (!dateString) return null;
    const [year, month, day] = dateString.split("-");
    return new Date(year, month - 1, day);
  };

  const handleDateChange = (date) => {
    setSelectedDate(date);
    if (date) {
      const isoDate = formatDateToISO(date);
      setForm(prev => ({ ...prev, date: isoDate }));
    } else {
      setForm(prev => ({ ...prev, date: "" }));
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleNonMemberChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({
      ...prev,
      nonMemberInfo: {
        ...prev.nonMemberInfo,
        [name]: value
      }
    }));
  };

  const handleMemberSelect = (selected) => {
    setForm(prev => ({
      ...prev,
      memberId: selected
    }));
  };

  // NEW: Handler for Due Sent To member selection
  const handleSentToMemberSelect = (selected) => {
    setForm(prev => ({
      ...prev,
      sentToMemberId: selected,
      sentTo: selected?.label || ""
    }));
  };

  const handleSentToNonMemberChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({
      ...prev,
      sentToNonMemberInfo: {
        ...prev.sentToNonMemberInfo,
        [name]: value
      }
    }));
  };

  const handleProjectSelect = (selected) => {
    setForm(prev => ({
      ...prev,
      projectId: selected,
      activityId: null,
      eventId: null,
      taskId: null
    }));
  };

  const handleClear = () => {
    setDueType("General");
    setUseExistingMember(true);
    setUseExistingSentTo(true); // NEW: Reset sentTo toggle
    setForm({
      dueName: "",
      dueAmount: "",
      date: "",
      description: "",
      dueTransferMode: "",
      dueTransferId: "",
      sentTo: "",
      sentToMemberId: null, // NEW: Reset sentTo member
      sentToNonMemberInfo: {
        name: "",
        contactNumber: "",
        description: ""
      },
      memberId: null,
      nonMemberInfo: {
        name: "",
        contactNumber: "",
        description: ""
      },
      projectId: null,
      activityId: null,
      eventId: null,
      taskId: null
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validation
    if (!form.dueName) {
      alert("Please enter due name");
      return;
    }
    if (!form.dueAmount) {
      alert("Please enter due amount");
      return;
    }
    if (!form.date) {
      alert("Please select date");
      return;
    }
    if (useExistingMember && !form.memberId) {
      alert("Please select a member");
      return;
    }
    if (!useExistingMember && !form.nonMemberInfo.name) {
      alert("Please enter non-member name");
      return;
    }
    if (dueType === 'Project' && !form.projectId) {
      alert("Please select a project");
      return;
    }

    const formData = {
      dueType,
      dueName: form.dueName,
      dueAmount: parseFloat(form.dueAmount),
      date: form.date,
      description: form.description,
      dueTransferMode: form.dueTransferMode,
      dueTransferId: form.dueTransferId,
      sentTo: form.sentTo,
      sentToMemberId: useExistingSentTo ? form.sentToMemberId?.value : null, // NEW: Include sentToMemberId
      sentToNonMemberInfo: !useExistingSentTo ? form.sentToNonMemberInfo : {}, // NEW: Include sentToNonMemberInfo
      memberId: useExistingMember ? form.memberId?.value : null,
      nonMemberInfo: !useExistingMember ? form.nonMemberInfo : {}
    };

    if (dueType === 'Project') {
      formData.projectId = form.projectId?.value;
      formData.activityId = form.activityId?.value || null;
      formData.eventId = form.eventId?.value || null;
      formData.taskId = form.taskId?.value || null;
    }

    onSubmit(formData);
  };

  const memberOptions = members.map(m => ({ value: m._id, label: m.name }));
  const projectOptions = projects.map(p => ({ value: p._id, label: p.name }));
  const dueTransferModeOptions = [
    { value: "Cash", label: "Cash" },
    { value: "Check", label: "Check" },
    { value: "Bank Transfer", label: "Bank Transfer" },
    { value: "Online", label: "Online" },
    { value: "Card", label: "Card" },
    { value: "Other", label: "Other" }
  ];

  return (
    <div className="due-form-container">
      <div className="form-header">
        <h3>{initialData ? 'Edit Due' : 'Add New Due'}</h3>
        {onClose && (
          <button 
            className="form-close-btn"
            onClick={onClose}
            type="button"
            aria-label="Close"
          >
            <FiX size={20} />
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="form-section">
        {/* Due Type */}
        <div className="form-field">
          <label className="required">Due Type</label>
          <select
            value={dueType}
            onChange={(e) => setDueType(e.target.value)}
            required
          >
            <option value="General">General</option>
            <option value="Project">Project</option>
          </select>
        </div>

        {/* Due Name */}
        <div className="form-field">
          <label className="required">Due Name</label>
          <input
            type="text"
            name="dueName"
            value={form.dueName}
            onChange={handleChange}
            required
            placeholder="Enter due name"
          />
        </div>

        {/* Due Amount */}
        <div className="form-field">
          <label className="required">Due Amount (₹)</label>
          <input
            type="number"
            name="dueAmount"
            value={form.dueAmount}
            onChange={handleChange}
            required
            step="0.01"
            min="0"
            placeholder="Enter amount"
          />
        </div>

        {/* Date */}
        <div className="form-field">
          <label className="required">Date</label>
          <DatePicker
            selected={selectedDate || parseDateFromISO(form.date)}
            onChange={handleDateChange}
            dateFormat="dd/MM/yyyy"
            placeholderText="DD/MM/YYYY"
            className="date-input"
            popperClassName="date-picker-popper"
            popperPlacement="bottom-start"
            showMonthDropdown
            showYearDropdown
            dropdownMode="select"
            isClearable
            maxDate={new Date()}
          />
        </div>

        {/* Description */}
        <div className="form-field">
          <label>Description</label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            rows="3"
            placeholder="Optional description"
          />
        </div>

        {/* Project Details (conditional) */}
        {dueType === 'Project' && (
          <div className="form-field">
            <label className="required">Select Project</label>
            <Select
              options={projectOptions}
              value={form.projectId}
              onChange={handleProjectSelect}
              placeholder="Select a project..."
              menuPortalTarget={document.body}
              className="react-select-container"
              classNamePrefix="react-select"
              styles={{
                menuPortal: (base) => ({ ...base, zIndex: 9999 }),
                control: (base) => ({ ...base, minHeight: '40px' })
              }}
            />
          </div>
        )}

        {/* Member / Non-member toggle for Due Concerned Member */}
        <div className="form-field">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={useExistingMember}
              onChange={(e) => setUseExistingMember(e.target.checked)}
            />
            Select from existing members
          </label>
        </div>

        {useExistingMember ? (
          <div className="form-field">
            <label className="required">Due Concerned Member</label>
            <Select
              options={memberOptions}
              value={form.memberId}
              onChange={handleMemberSelect}
              placeholder="Select a member..."
              menuPortalTarget={document.body}
              className="react-select-container"
              classNamePrefix="react-select"
              styles={{
                menuPortal: (base) => ({ ...base, zIndex: 9999 }),
                control: (base) => ({ ...base, minHeight: '40px' })
              }}
            />
          </div>
        ) : (
          <>
            <div className="form-field">
              <label className="required">Non-Member Name</label>
              <input
                type="text"
                name="name"
                value={form.nonMemberInfo.name}
                onChange={handleNonMemberChange}
                placeholder="Full name"
                required={!useExistingMember}
              />
            </div>
            <div className="form-field">
              <label>Contact Number</label>
              <input
                type="tel"
                name="contactNumber"
                value={form.nonMemberInfo.contactNumber}
                onChange={handleNonMemberChange}
                placeholder="Phone number"
              />
            </div>
            <div className="form-field">
              <label>Description</label>
              <textarea
                name="description"
                value={form.nonMemberInfo.description}
                onChange={handleNonMemberChange}
                rows="2"
                placeholder="Additional info"
              />
            </div>
          </>
        )}

        {/* NEW: Member / Non-member toggle for Due Sent To */}
        <div className="form-field">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={useExistingSentTo}
              onChange={(e) => {
                const checked = e.target.checked;
                setUseExistingSentTo(checked);
                if (!checked) {
                  setForm(prev => ({ ...prev, sentToMemberId: null, sentTo: "" }));
                } else {
                  setForm(prev => ({ ...prev, sentTo: "" }));
                }
              }}
            />
            Select payment recipient from existing members
          </label>
        </div>

        {useExistingSentTo ? (
          <div className="form-field">
            <label className="required">Due Sent To</label>
            <Select
              options={memberOptions}
              value={form.sentToMemberId}
              onChange={handleSentToMemberSelect}
              placeholder="Select a member..."
              menuPortalTarget={document.body}
              className="react-select-container"
              classNamePrefix="react-select"
              styles={{
                menuPortal: (base) => ({ ...base, zIndex: 9999 }),
                control: (base) => ({ ...base, minHeight: '40px' })
              }}
            />
          </div>
        ) : (
          <>
            <div className="form-field">
              <label className="required">Recipient Name</label>
              <input
                type="text"
                name="name"
                value={form.sentToNonMemberInfo?.name || ""}
                onChange={handleSentToNonMemberChange}
                placeholder="Full name"
              />
            </div>
            <div className="form-field">
              <label>Recipient Contact</label>
              <input
                type="tel"
                name="contactNumber"
                value={form.sentToNonMemberInfo?.contactNumber || ""}
                onChange={handleSentToNonMemberChange}
                placeholder="Phone number"
              />
            </div>
            <div className="form-field">
              <label>Recipient Description</label>
              <textarea
                name="description"
                value={form.sentToNonMemberInfo?.description || ""}
                onChange={handleSentToNonMemberChange}
                rows="2"
                placeholder="Additional info"
              />
            </div>
          </>
        )}

        {/* Transfer Details */}
        <div className="form-field">
          <label>Transfer Mode</label>
          <Select
            options={dueTransferModeOptions}
            value={dueTransferModeOptions.find(opt => opt.value === form.dueTransferMode) || null}
            onChange={(selected) => setForm(prev => ({ ...prev, dueTransferMode: selected?.value }))}
            placeholder="Select transfer mode..."
            isClearable
            menuPortalTarget={document.body}
            className="react-select-container"
            classNamePrefix="react-select"
            styles={{
              menuPortal: (base) => ({ ...base, zIndex: 9999 }),
              control: (base) => ({ ...base, minHeight: '40px' })
            }}
          />
        </div>

        <div className="form-field">
          <label>Transfer ID / Reference</label>
          <input
            type="text"
            name="dueTransferId"
            value={form.dueTransferId}
            onChange={handleChange}
            placeholder="Cheque number, transaction ID, etc."
          />
        </div>

        {/* Buttons */}
        <div className="form-buttons">
          <button
            type="submit"
            className="primary-btn"
            disabled={isLoading}
          >
            {isLoading ? "Processing..." : initialData ? "Update Due" : "Add Due"}
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
}

export default DueForm;