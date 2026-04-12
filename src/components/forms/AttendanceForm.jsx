import React, { useState, useEffect, useRef } from 'react';
import { getProjects } from '../../services/projectService';
import { getActivities } from '../../services/activityService';
import { getEvents } from '../../services/eventService';
import { createAttendance, updateAttendance } from '../../services/attendanceService';
import { Users, Plus, Trash2, UserPlus, CheckCircle, XCircle, Clock, UserX, UserMinus, PhoneOff, AlertCircle, Mail, UserCheck, Search } from 'lucide-react';
import { FiX } from 'react-icons/fi';
import DatePicker from 'react-datepicker';
import axios from 'axios';
import 'react-datepicker/dist/react-datepicker.css';
import './AttendanceForm.css';

// Searchable Select Component
const SearchableSelect = ({ options, value, onChange, placeholder, disabled = false, required = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const wrapperRef = useRef(null);
  const inputRef = useRef(null);
  const listRef = useRef(null);

  const selectedOption = options.find(opt => opt.value === value);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
        setSearchTerm('');
        setHighlightedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && listRef.current && highlightedIndex >= 0) {
      const highlightedElement = listRef.current.children[highlightedIndex];
      if (highlightedElement) {
        highlightedElement.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [highlightedIndex]);

  const filteredOptions = options.filter(option =>
    option.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleKeyDown = (e) => {
    if (!isOpen) {
      if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        setIsOpen(true);
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex(prev => 
          prev < filteredOptions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case 'Enter':
        e.preventDefault();
        if (highlightedIndex >= 0 && filteredOptions[highlightedIndex]) {
          onChange(filteredOptions[highlightedIndex].value);
          setIsOpen(false);
          setSearchTerm('');
          setHighlightedIndex(-1);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setSearchTerm('');
        setHighlightedIndex(-1);
        break;
      case 'Tab':
        setIsOpen(false);
        setSearchTerm('');
        setHighlightedIndex(-1);
        break;
    }
  };

  return (
    <div className="searchable-select" ref={wrapperRef}>
      <div 
        className={`searchable-select-trigger ${disabled ? 'disabled' : ''}`}
        onClick={() => !disabled && setIsOpen(!isOpen)}
      >
        <span className={`select-value ${!selectedOption ? 'placeholder' : ''}`}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <span className="select-arrow">{isOpen ? '▲' : '▼'}</span>
      </div>
      
      {isOpen && !disabled && (
        <div className="searchable-select-dropdown">
          <div className="searchable-select-search">
            <Search size={16} className="search-icon" />
            <input
              ref={inputRef}
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setHighlightedIndex(-1);
              }}
              onKeyDown={handleKeyDown}
              className="search-input"
            />
          </div>
          <div className="searchable-select-options" ref={listRef}>
            {filteredOptions.length === 0 ? (
              <div className="no-options">No options found</div>
            ) : (
              filteredOptions.map((option, index) => (
                <div
                  key={option.value}
                  className={`searchable-select-option ${value === option.value ? 'selected' : ''} ${highlightedIndex === index ? 'highlighted' : ''}`}
                  onClick={() => {
                    onChange(option.value);
                    setIsOpen(false);
                    setSearchTerm('');
                    setHighlightedIndex(-1);
                  }}
                  onMouseEnter={() => setHighlightedIndex(index)}
                >
                  {option.label}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const AttendanceForm = ({ onSuccess, onCancel, editData, projectId: propProjectId, activityId: propActivityId, eventId: propEventId }) => {
  const [formData, setFormData] = useState({
    description: '',
    project: '',
    activity: '',
    event: '',
    date: new Date().toISOString().split('T')[0],
    location: '',
    incharges: []
  });

  const [selectedDate, setSelectedDate] = useState(null);
  const [projects, setProjects] = useState([]);
  const [activities, setActivities] = useState([]);
  const [events, setEvents] = useState([]);
  const [sortedMembers, setSortedMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [loadingEditData, setLoadingEditData] = useState(false);
  const [initialDataLoaded, setInitialDataLoaded] = useState(false);

  // Status options for invitees
  const statusOptions = [
    { value: 'absent', label: 'Absent', icon: XCircle, color: '#ef4444' },
    { value: 'invited', label: 'Invited', icon: Mail, color: '#3b82f6' },
    { value: 'permission', label: 'Permission', icon: AlertCircle, color: '#f59e0b' },
    { value: 'present', label: 'Present', icon: CheckCircle, color: '#10b981' },
    { value: 'not_available', label: 'Not Available', icon: UserX, color: '#6b7280' },
    { value: 'not_invited', label: 'Not Invited', icon: UserMinus, color: '#9ca3af' },
    { value: 'not_reachable', label: 'Not Reachable', icon: PhoneOff, color: '#dc2626' },
    { value: 'not_responded', label: 'Not Responded', icon: Clock, color: '#f97316' }
  ];

  // Helper function to format date as DD-MM-YYYY
  const formatDateToYMD = (date) => {
    if (!date) return '';
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Parse date from YYYY-MM-DD to Date object
  const parseDateFromYMD = (dateString) => {
    if (!dateString) return null;
    const [year, month, day] = dateString.split('-');
    return new Date(year, month - 1, day);
  };

  // Handle date change from DatePicker
  const handleDateChange = (date) => {
    setSelectedDate(date);
    if (date) {
      setFormData(prev => ({ ...prev, date: formatDateToYMD(date) }));
    } else {
      setFormData(prev => ({ ...prev, date: '' }));
    }
    if (errors.date) {
      setErrors(prev => ({ ...prev, date: '' }));
    }
  };

  useEffect(() => {
    fetchProjects();
    fetchMembers();
  }, []);

  // Initialize date when form loads
  useEffect(() => {
    if (formData.date && !selectedDate) {
      const dateObj = parseDateFromYMD(formData.date);
      setSelectedDate(dateObj);
    }
  }, [formData.date]);

  // Auto-fetch data when props are provided (from EventDetail page)
  useEffect(() => {
    if (propProjectId && propActivityId && propEventId && projects.length > 0 && !initialDataLoaded) {
      autoFillFormData();
    }
  }, [propProjectId, propActivityId, propEventId, projects]);

  // Load edit data when editData changes and projects are loaded
  useEffect(() => {
    if (editData && projects.length > 0) {
      loadEditData();
    }
  }, [editData, projects]);

  // Fetch activities when project changes (for manual selection)
  useEffect(() => {
    if (formData.project && !propProjectId) {
      fetchActivities(formData.project);
      setFormData(prev => ({ ...prev, activity: '', event: '' }));
      setEvents([]);
    }
  }, [formData.project]);

  // Fetch events when both project and activity are selected (for manual selection)
  useEffect(() => {
    if (formData.project && formData.activity && !propActivityId) {
      fetchEvents(formData.project, formData.activity);
    }
  }, [formData.project, formData.activity]);

  const fetchProjects = async () => {
    try {
      const response = await getProjects();
      setProjects(response.data);
    } catch (error) {
      console.error('Error fetching projects:', error);
      setProjects([]);
    }
  };

  const fetchActivities = async (projectId) => {
    try {
      const response = await getActivities(projectId);
      setActivities(response.data);
    } catch (error) {
      console.error('Error fetching activities:', error);
      setActivities([]);
    }
  };

  const fetchEvents = async (projectId, activityId) => {
    try {
      const response = await getEvents(projectId, activityId);
      let eventsData = [];
      if (response.data && Array.isArray(response.data)) {
        eventsData = response.data;
      } else if (response.data && response.data.data && Array.isArray(response.data.data)) {
        eventsData = response.data.data;
      } else if (Array.isArray(response.data)) {
        eventsData = response.data;
      } else if (response.data && response.data.events && Array.isArray(response.data.events)) {
        eventsData = response.data.events;
      }
      setEvents(eventsData);
    } catch (error) {
      console.error('Error fetching events:', error);
      setEvents([]);
    }
  };

  const fetchMembers = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/members`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      
      const sorted = [...response.data].sort((a, b) => {
        const nameA = (a.name || '').toLowerCase();
        const nameB = (b.name || '').toLowerCase();
        return nameA.localeCompare(nameB);
      });
      
      setSortedMembers(sorted);
    } catch (error) {
      console.error('Error fetching members:', error);
      setSortedMembers([]);
    }
  };

  const autoFillFormData = async () => {
    setLoadingEditData(true);
    try {
      await fetchActivities(propProjectId);
      await fetchEvents(propProjectId, propActivityId);
      
      setFormData(prev => ({
        ...prev,
        project: propProjectId,
        activity: propActivityId,
        event: propEventId
      }));
      
      setInitialDataLoaded(true);
    } catch (error) {
      console.error('Error auto-filling form data:', error);
    } finally {
      setLoadingEditData(false);
    }
  };

  const loadEditData = async () => {
    setLoadingEditData(true);
    try {
      const projectId = editData.project?._id || editData.project;
      const activityId = editData.activity?._id || editData.activity;
      const eventId = editData.event?._id || editData.event;
      
      setFormData({
        description: editData.description || '',
        project: projectId || '',
        activity: activityId || '',
        event: eventId || '',
        date: editData.date?.split('T')[0] || new Date().toISOString().split('T')[0],
        location: editData.location || '',
        incharges: editData.incharges?.map(incharge => ({
          ...incharge,
          user: incharge.user?._id || incharge.user,
          invitees: incharge.invitees?.map(invitee => ({
            ...invitee,
            user: invitee.user?._id || invitee.user,
            status: invitee.status || 'invited',
            remarks: invitee.remarks || ''
          })) || []
        })) || []
      });

      if (projectId) {
        await fetchActivities(projectId);
        if (activityId) {
          await fetchEvents(projectId, activityId);
        }
      }
    } catch (error) {
      console.error('Error loading edit data:', error);
    } finally {
      setLoadingEditData(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const addIncharge = () => {
    setFormData(prev => ({
      ...prev,
      incharges: [
        ...prev.incharges,
        {
          user: '',
          invitees: [],
          notes: ''
        }
      ]
    }));
  };

  const removeIncharge = (index) => {
    setFormData(prev => ({
      ...prev,
      incharges: prev.incharges.filter((_, i) => i !== index)
    }));
  };

  const updateIncharge = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      incharges: prev.incharges.map((incharge, i) =>
        i === index ? { ...incharge, [field]: value } : incharge
      )
    }));
  };

  const addInviteeToIncharge = (inchargeIndex) => {
    setFormData(prev => ({
      ...prev,
      incharges: prev.incharges.map((incharge, i) => {
        if (i === inchargeIndex) {
          // Create new invitee
          const newInvitee = {
            user: '',
            status: 'invited',
            remarks: ''
          };
          // Add new invitee at the beginning (top) of the array
          return {
            ...incharge,
            invitees: [newInvitee, ...incharge.invitees]
          };
        }
        return incharge;
      })
    }));
  };

  const removeInvitee = (inchargeIndex, inviteeIndex) => {
    setFormData(prev => ({
      ...prev,
      incharges: prev.incharges.map((incharge, i) =>
        i === inchargeIndex
          ? {
              ...incharge,
              invitees: incharge.invitees.filter((_, idx) => idx !== inviteeIndex)
            }
          : incharge
      )
    }));
  };

  const updateInvitee = (inchargeIndex, inviteeIndex, field, value) => {
    setFormData(prev => ({
      ...prev,
      incharges: prev.incharges.map((incharge, i) =>
        i === inchargeIndex
          ? {
              ...incharge,
              invitees: incharge.invitees.map((invitee, idx) =>
                idx === inviteeIndex ? { ...invitee, [field]: value } : invitee
              )
            }
          : incharge
      )
    }));
  };

  const getStatusIcon = (status) => {
    const option = statusOptions.find(opt => opt.value === status);
    if (option) {
      const IconComponent = option.icon;
      return <IconComponent size={14} color={option.color} />;
    }
    return <Mail size={14} color="#3b82f6" />;
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.project) newErrors.project = 'Project is required';
    if (!formData.activity) newErrors.activity = 'Activity is required';
    if (!formData.event) newErrors.event = 'Event is required';
    if (!formData.date) newErrors.date = 'Date is required';
    if (formData.incharges.length === 0) newErrors.incharges = 'At least one incharge is required';
    
    formData.incharges.forEach((incharge, idx) => {
      if (!incharge.user) {
        newErrors[`incharge_${idx}`] = 'Please select an incharge';
      }
      if (incharge.invitees.length === 0) {
        newErrors[`invitees_${idx}`] = 'At least one invitee is required';
      }
    });
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    setLoading(true);
    try {
      const submissionData = {
        ...formData,
        incharges: formData.incharges.map(incharge => ({
          ...incharge,
          user: incharge.user,
          invitees: incharge.invitees.map(invitee => ({
            ...invitee,
            user: invitee.user,
            status: invitee.status || 'invited'
          }))
        }))
      };
      
      if (editData) {
        await updateAttendance(editData._id, submissionData);
      } else {
        await createAttendance(submissionData);
      }
      onSuccess();
    } catch (error) {
      console.error('Error saving attendance:', error);
      setErrors({ submit: error.response?.data?.message || 'Error saving attendance' });
    } finally {
      setLoading(false);
    }
  };

  // Determine if fields should be disabled (when props are provided)
  const isProjectDisabled = !!propProjectId;
  const isActivityDisabled = !!propActivityId;
  const isEventDisabled = !!propEventId;

  // Convert members to options format for searchable select
  const memberOptions = sortedMembers.map(member => ({
    value: member._id,
    label: member.name
  }));

  // Convert projects to options format
  const projectOptions = projects.map(project => ({
    value: project._id,
    label: project.name
  }));

  // Convert activities to options format
  const activityOptions = activities.map(activity => ({
    value: activity._id,
    label: activity.name
  }));

  // Convert events to options format
  const eventOptions = events.map(event => ({
    value: event._id,
    label: event.name
  }));

  if (loadingEditData) {
    return (
      <div className="member-form-container">
        <div className="form-header">
          <h3>Loading Attendance Data</h3>
          <button className="form-close-btn" onClick={onCancel} type="button">
            <FiX size={20} />
          </button>
        </div>
        <div className="form-section" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '200px' }}>
          <div className="loading-container">
            <div className="spinner"></div>
            <p>Loading attendance data...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="member-form-container">
      <div className="form-header">
        <h3>{editData ? 'Edit Attendance' : 'Create New Attendance'}</h3>
        <button className="form-close-btn" onClick={onCancel} type="button">
          <FiX size={20} />
        </button>
      </div>

      <div className="form-section">
        {/* Description */}
        <div className="form-field">
          <label>Description</label>
          <input
            type="text"
            name="description"
            placeholder="Enter description (optional)"
            value={formData.description}
            onChange={handleInputChange}
          />
          {errors.description && <div className="form-error">{errors.description}</div>}
        </div>

        {/* Date Field with DatePicker */}
        <div className="form-field">
          <label className="required">Date</label>
          <DatePicker
            selected={selectedDate}
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
          {errors.date && <div className="form-error">{errors.date}</div>}
        </div>

        {/* Project - Searchable Select */}
        <div className="form-field">
          <label className="required">Project</label>
          <SearchableSelect
            options={projectOptions}
            value={formData.project}
            onChange={(value) => handleInputChange({ target: { name: 'project', value } })}
            placeholder="Select Project"
            disabled={isProjectDisabled}
            required
          />
          {errors.project && <div className="form-error">{errors.project}</div>}
          {isProjectDisabled && (
            <div className="form-hint">Auto-filled from event context</div>
          )}
        </div>

        {/* Activity - Searchable Select */}
        <div className="form-field">
          <label className="required">Activity</label>
          <SearchableSelect
            options={activityOptions}
            value={formData.activity}
            onChange={(value) => handleInputChange({ target: { name: 'activity', value } })}
            placeholder={!formData.project ? "Select Project First" : "Select Activity"}
            disabled={isActivityDisabled || !formData.project}
            required
          />
          {errors.activity && <div className="form-error">{errors.activity}</div>}
          {isActivityDisabled && (
            <div className="form-hint">Auto-filled from event context</div>
          )}
        </div>

        {/* Event - Searchable Select */}
        <div className="form-field">
          <label className="required">Event</label>
          <SearchableSelect
            options={eventOptions}
            value={formData.event}
            onChange={(value) => handleInputChange({ target: { name: 'event', value } })}
            placeholder={!formData.activity ? "Select Activity First" : events.length === 0 ? "No events found" : "Select Event"}
            disabled={isEventDisabled || !formData.activity || events.length === 0}
            required
          />
          {errors.event && <div className="form-error">{errors.event}</div>}
          {isEventDisabled && (
            <div className="form-hint">Auto-filled from event context</div>
          )}
          {formData.activity && events.length === 0 && !loading && (
            <div className="form-error">No events found for this activity</div>
          )}
        </div>

        {/* Location */}
        <div className="form-field">
          <label>Location</label>
          <input
            type="text"
            name="location"
            placeholder="Venue or location"
            value={formData.location}
            onChange={handleInputChange}
          />
        </div>

        {/* Incharges Section */}
        <div className="form-field" style={{ gridColumn: 'span 2' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <label style={{ margin: 0 }}>Incharges & Invitees</label>
            <button
              type="button"
              onClick={addIncharge}
              className="add-incharge-btn"
            >
              <Plus size={16} />
              Add Incharge
            </button>
          </div>
          
          {errors.incharges && <div className="form-error" style={{ marginBottom: '16px' }}>{errors.incharges}</div>}
          
          {formData.incharges.length === 0 ? (
            <div className="empty-state-container">
              <UserPlus size={48} style={{ marginBottom: '12px', opacity: 0.5, color: '#999' }} />
              <p>No incharges added yet. Click "Add Incharge" to get started.</p>
            </div>
          ) : (
            formData.incharges.map((incharge, inchargeIndex) => (
              <div key={inchargeIndex} className="incharge-card">
                <div className="incharge-card-header">
                  <h4>Incharge {inchargeIndex + 1}</h4>
                  <button
                    type="button"
                    onClick={() => removeIncharge(inchargeIndex)}
                    className="remove-incharge-btn"
                  >
                    <Trash2 size={16} />
                    Remove
                  </button>
                </div>
                
                <div className="form-field">
                  <label className="required">Select Incharge</label>
                  <SearchableSelect
                    options={memberOptions}
                    value={incharge.user}
                    onChange={(value) => updateIncharge(inchargeIndex, 'user', value)}
                    placeholder="Select Member"
                    required
                  />
                  {errors[`incharge_${inchargeIndex}`] && <div className="form-error">{errors[`incharge_${inchargeIndex}`]}</div>}
                </div>
                
                <div className="invitee-section">
                  <div className="invitee-section-header">
                    <label>Invitees & Status</label>
                    <button
                      type="button"
                      onClick={() => addInviteeToIncharge(inchargeIndex)}
                      className="add-invitee-btn"
                    >
                      <Plus size={14} />
                      Add Invitee
                    </button>
                  </div>
                  
                  {errors[`invitees_${inchargeIndex}`] && <div className="form-error" style={{ marginBottom: '8px' }}>{errors[`invitees_${inchargeIndex}`]}</div>}
                  
                  {incharge.invitees.length === 0 ? (
                    <div className="empty-invitee-state">
                      <p>No invitees added. Click "Add Invitee" to add members.</p>
                    </div>
                  ) : (
                    incharge.invitees.map((invitee, inviteeIndex) => (
                      <div key={inviteeIndex} className="invitee-card">
                        <div className="invitee-row">
                          <div className="invitee-select-wrapper">
                            <SearchableSelect
                              options={memberOptions}
                              value={invitee.user}
                              onChange={(value) => updateInvitee(inchargeIndex, inviteeIndex, 'user', value)}
                              placeholder="Select Invitee"
                              required
                            />
                          </div>
                          
                          <div className="status-wrapper">
                            <select
                              value={invitee.status || 'invited'}
                              onChange={(e) => updateInvitee(inchargeIndex, inviteeIndex, 'status', e.target.value)}
                              className={`status-select status-${invitee.status || 'invited'}`}
                            >
                              {statusOptions.map(option => (
                                <option key={option.value} value={option.value}>
                                  {option.label}
                                </option>
                              ))}
                            </select>
                            <span className="status-icon">
                              {getStatusIcon(invitee.status || 'invited')}
                            </span>
                          </div>
                          
                          <button
                            type="button"
                            onClick={() => removeInvitee(inchargeIndex, inviteeIndex)}
                            className="remove-invitee-btn"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                        
                        <input
                          type="text"
                          value={invitee.remarks || ''}
                          onChange={(e) => updateInvitee(inchargeIndex, inviteeIndex, 'remarks', e.target.value)}
                          className="remarks-input"
                          placeholder="Remarks (optional)"
                        />
                      </div>
                    ))
                  )}
                </div>
                
                <div className="form-field">
                  <label>Notes (Optional)</label>
                  <textarea
                    value={incharge.notes || ''}
                    onChange={(e) => updateIncharge(inchargeIndex, 'notes', e.target.value)}
                    rows="2"
                    placeholder="Additional notes for this incharge"
                  />
                </div>
              </div>
            ))
          )}
        </div>

        {/* Form Buttons */}
        <div className="form-buttons" style={{ gridColumn: 'span 2' }}>
          <button
            type="button"
            className="clear-btn"
            onClick={onCancel}
          >
            Cancel
          </button>
          <button
            className="primary-btn"
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? "Saving..." : editData ? "Update Attendance" : "Create Attendance"}
          </button>
        </div>
        
        {errors.submit && (
          <div className="error-alert" style={{ gridColumn: 'span 2' }}>
            {errors.submit}
          </div>
        )}
      </div>
    </div>
  );
};

export default AttendanceForm;