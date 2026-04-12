import React, { useState, useEffect, useRef } from 'react';
import { FiPlus, FiFilter, FiChevronDown, FiArrowUp, FiArrowDown, FiBarChart2, FiUsers, FiUserCheck, FiUserX, FiClock, FiMail, FiPhoneOff, FiAlertCircle, FiX } from 'react-icons/fi';
import { Link, useLocation } from 'react-router-dom';
import { getAllAttendances, deleteAttendance } from '../../services/attendanceService';
import AttendanceForm from '../../components/forms/AttendanceForm';
import AttendanceCard from '../../components/cards/AttendanceCard';
import '../../styles/AttendanceDashboard.css';

const AttendanceDashboard = () => {
  const location = useLocation();
  const [dashboardDropdownOpen, setDashboardDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  
  const [attendances, setAttendances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingAttendance, setEditingAttendance] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [filterOpen, setFilterOpen] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);
  const [statsOpen, setStatsOpen] = useState(false);
  
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: ''
  });
  
  const [sortConfig, setSortConfig] = useState({
    key: 'date',
    direction: 'desc'
  });

  const filterRef = useRef(null);
  const sortRef = useRef(null);
  const statsRef = useRef(null);
  const formRef = useRef(null);

  // Sort options
  const sortOptions = [
    { value: 'date', label: 'Date' },
    { value: 'description', label: 'Description' },
    { value: 'project', label: 'Project Name' },
    { value: 'event', label: 'Event Name' },
    { value: 'totalInvitees', label: 'Total Members' },
    { value: 'totalPresent', label: 'Present Count' },
    { value: 'totalAbsent', label: 'Absent Count' },
    { value: 'totalInvited', label: 'Invited Count' },
    { value: 'totalPermission', label: 'Permission Count' },
    { value: 'totalNotAvailable', label: 'Not Available' },
    { value: 'totalNotInvited', label: 'Not Invited' },
    { value: 'totalNotReachable', label: 'Not Reachable' },
    { value: 'totalNotResponded', label: 'Not Responded' },
    { value: 'createdAt', label: 'Created Date' }
  ];

  useEffect(() => {
    fetchAttendances();
  }, [filters]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDashboardDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchAttendances = async () => {
    setLoading(true);
    try {
      const response = await getAllAttendances(filters);
      let attendanceData = [];
      
      if (response.data && response.data.data && Array.isArray(response.data.data)) {
        attendanceData = response.data.data;
      } else if (response.data && Array.isArray(response.data)) {
        attendanceData = response.data;
      } else if (response.data && response.data.success && Array.isArray(response.data.data)) {
        attendanceData = response.data.data;
      } else if (Array.isArray(response.data)) {
        attendanceData = response.data;
      }
      
      setAttendances(attendanceData);
    } catch (error) {
      console.error('Error fetching attendances:', error);
      setAttendances([]);
    } finally {
      setLoading(false);
    }
  };

  // Calculate comprehensive statistics from attendances
  const calculateStatistics = () => {
    if (!attendances || attendances.length === 0) {
      return {
        totalEvents: 0,
        totalInvitees: 0,
        totalPresent: 0,
        totalAbsent: 0,
        totalInvited: 0,
        totalPermission: 0,
        totalNotAvailable: 0,
        totalNotInvited: 0,
        totalNotReachable: 0,
        totalNotResponded: 0,
        attendanceRate: 0,
        presentRate: 0,
        absentRate: 0,
        invitedRate: 0,
        permissionRate: 0,
        notAvailableRate: 0,
        notInvitedRate: 0,
        notReachableRate: 0,
        notRespondedRate: 0,
        topProjects: [],
        monthlyStats: {},
        statusDistribution: []
      };
    }

    let totalInvitees = 0;
    let totalPresent = 0;
    let totalAbsent = 0;
    let totalInvited = 0;
    let totalPermission = 0;
    let totalNotAvailable = 0;
    let totalNotInvited = 0;
    let totalNotReachable = 0;
    let totalNotResponded = 0;
    
    const projectCount = {};
    const monthlyData = {};

    attendances.forEach(attendance => {
      // Get totals from the attendance record
      const invitees = attendance.totalInvitees || 0;
      const present = attendance.totalPresent || 0;
      const absent = attendance.totalAbsent || 0;
      const invited = attendance.totalInvited || 0;
      const permission = attendance.totalPermission || 0;
      const notAvailable = attendance.totalNotAvailable || 0;
      const notInvited = attendance.totalNotInvited || 0;
      const notReachable = attendance.totalNotReachable || 0;
      const notResponded = attendance.totalNotResponded || 0;
      
      totalInvitees += invitees;
      totalPresent += present;
      totalAbsent += absent;
      totalInvited += invited;
      totalPermission += permission;
      totalNotAvailable += notAvailable;
      totalNotInvited += notInvited;
      totalNotReachable += notReachable;
      totalNotResponded += notResponded;
      
      // Project statistics
      const projectName = attendance.project?.name || 'Unknown Project';
      projectCount[projectName] = (projectCount[projectName] || 0) + 1;
      
      // Monthly statistics
      if (attendance.date) {
        const date = new Date(attendance.date);
        const monthYear = `${date.toLocaleString('default', { month: 'long' })} ${date.getFullYear()}`;
        if (!monthlyData[monthYear]) {
          monthlyData[monthYear] = {
            events: 0,
            invitees: 0,
            present: 0,
            absent: 0
          };
        }
        monthlyData[monthYear].events += 1;
        monthlyData[monthYear].invitees += invitees;
        monthlyData[monthYear].present += present;
        monthlyData[monthYear].absent += absent;
      }
    });
    
    const total = totalInvitees || 1; // Avoid division by zero
    const attendanceRate = totalInvitees > 0 ? ((totalPresent / totalInvitees) * 100).toFixed(1) : 0;
    
    // Get top 5 projects by event count
    const topProjects = Object.entries(projectCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, count]) => ({ name, count }));
    
    // Prepare status distribution for charts
    const statusDistribution = [
      { status: 'Present', count: totalPresent, color: '#10b981', icon: 'FiUserCheck' },
      { status: 'Absent', count: totalAbsent, color: '#ef4444', icon: 'FiUserX' },
      { status: 'Invited', count: totalInvited, color: '#3b82f6', icon: 'FiMail' },
      { status: 'Permission', count: totalPermission, color: '#f59e0b', icon: 'FiAlertCircle' },
      { status: 'Not Available', count: totalNotAvailable, color: '#6b7280', icon: 'FiClock' },
      { status: 'Not Invited', count: totalNotInvited, color: '#9ca3af', icon: 'FiX' },
      { status: 'Not Reachable', count: totalNotReachable, color: '#dc2626', icon: 'FiPhoneOff' },
      { status: 'Not Responded', count: totalNotResponded, color: '#f97316', icon: 'FiClock' }
    ].filter(item => item.count > 0);
    
    return {
      totalEvents: attendances.length,
      totalInvitees,
      totalPresent,
      totalAbsent,
      totalInvited,
      totalPermission,
      totalNotAvailable,
      totalNotInvited,
      totalNotReachable,
      totalNotResponded,
      attendanceRate,
      presentRate: ((totalPresent / total) * 100).toFixed(1),
      absentRate: ((totalAbsent / total) * 100).toFixed(1),
      invitedRate: ((totalInvited / total) * 100).toFixed(1),
      permissionRate: ((totalPermission / total) * 100).toFixed(1),
      notAvailableRate: ((totalNotAvailable / total) * 100).toFixed(1),
      notInvitedRate: ((totalNotInvited / total) * 100).toFixed(1),
      notReachableRate: ((totalNotReachable / total) * 100).toFixed(1),
      notRespondedRate: ((totalNotResponded / total) * 100).toFixed(1),
      topProjects,
      monthlyStats: monthlyData,
      statusDistribution
    };
  };

  const stats = calculateStatistics();

  const handleEdit = (attendance) => {
    setEditingAttendance(attendance);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this attendance record?')) return;
    setDeletingId(id);
    try {
      await deleteAttendance(id);
      await fetchAttendances();
    } catch (error) {
      console.error('Error deleting attendance:', error);
      alert('Failed to delete attendance');
    } finally {
      setDeletingId(null);
    }
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setEditingAttendance(null);
    fetchAttendances();
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setEditingAttendance(null);
  };

  const handleDateFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const clearFilters = () => {
    setFilters({
      startDate: '',
      endDate: ''
    });
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/";
  };

  const scrollToTop = () => {
    document.querySelector('.dashboard-content')?.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleFilterToggle = () => {
    setFilterOpen(!filterOpen);
    if (!filterOpen) {
      setTimeout(() => {
        filterRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }, 100);
    } else {
      scrollToTop();
    }
  };

  const handleSortToggle = () => {
    setSortOpen(!sortOpen);
    if (!sortOpen) {
      setTimeout(() => {
        sortRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }, 100);
    } else {
      scrollToTop();
    }
  };

  const handleStatsToggle = () => {
    setStatsOpen(!statsOpen);
    if (!statsOpen) {
      setTimeout(() => {
        statsRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }, 100);
    } else {
      scrollToTop();
    }
  };

  const handleAddAttendanceToggle = () => {
    setShowForm(!showForm);
    setEditingAttendance(null);
  };

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const getSortedAttendances = (attendancesToSort) => {
    if (!sortConfig.key) return attendancesToSort;

    return [...attendancesToSort].sort((a, b) => {
      if (sortConfig.key === 'date' || sortConfig.key === 'createdAt') {
        const dateA = a[sortConfig.key] ? new Date(a[sortConfig.key]).getTime() : 0;
        const dateB = b[sortConfig.key] ? new Date(b[sortConfig.key]).getTime() : 0;
        return sortConfig.direction === 'asc' ? dateA - dateB : dateB - dateA;
      }
      
      if (sortConfig.key === 'description') {
        const valA = (a.description || a.name || '').toString().toLowerCase();
        const valB = (b.description || b.name || '').toString().toLowerCase();
        
        if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
        if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      }
      
      const numericFields = ['totalInvitees', 'totalPresent', 'totalAbsent', 'totalInvited', 
                            'totalPermission', 'totalNotAvailable', 'totalNotInvited', 
                            'totalNotReachable', 'totalNotResponded'];
      
      if (numericFields.includes(sortConfig.key)) {
        const valA = a[sortConfig.key] || 0;
        const valB = b[sortConfig.key] || 0;
        return sortConfig.direction === 'asc' ? valA - valB : valB - valA;
      }
      
      if (sortConfig.key === 'project') {
        let valA = a.project;
        let valB = b.project;
        
        if (typeof valA === 'object' && valA !== null) valA = valA.name || '';
        if (typeof valB === 'object' && valB !== null) valB = valB.name || '';
        
        valA = (valA || '').toString().toLowerCase();
        valB = (valB || '').toString().toLowerCase();
        
        if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
        if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      }
      
      if (sortConfig.key === 'event') {
        let valA = a.event;
        let valB = b.event;
        
        if (typeof valA === 'object' && valA !== null) valA = valA.name || '';
        if (typeof valB === 'object' && valB !== null) valB = valB.name || '';
        
        valA = (valA || '').toString().toLowerCase();
        valB = (valB || '').toString().toLowerCase();
        
        if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
        if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      }
      
      return 0;
    });
  };

  const isSortActive = sortConfig.key !== 'date' || sortConfig.direction !== 'desc';
  const isFilterActive = filters.startDate !== '' || filters.endDate !== '';
  const hasStats = stats.totalEvents > 0;

  const sortedAttendances = getSortedAttendances(attendances);

  // Helper function to render status icon
  const getStatusIcon = (statusName) => {
    switch(statusName) {
      case 'Present': return <FiUserCheck size={16} />;
      case 'Absent': return <FiUserX size={16} />;
      case 'Invited': return <FiMail size={16} />;
      case 'Permission': return <FiAlertCircle size={16} />;
      case 'Not Available': return <FiClock size={16} />;
      case 'Not Invited': return <FiX size={16} />;
      case 'Not Reachable': return <FiPhoneOff size={16} />;
      case 'Not Responded': return <FiClock size={16} />;
      default: return <FiUsers size={16} />;
    }
  };

  return (
    <div className="dashboard-fullpage" ref={formRef}>
      <div className="dashboard-container">
        {/* Sticky Header */}
        <div className="dashboard-header-sticky">
          <div className="dashboard-header-content">
            <div className="dashboard-header-left">
              <div className="dashboard-custom-dropdown" ref={dropdownRef}>
                <button 
                  className="dashboard-custom-dropdown-toggle"
                  onClick={() => setDashboardDropdownOpen(!dashboardDropdownOpen)}
                >
                  <span className="dashboard-dropdown-label">
                    {location.pathname === '/projectdashboard' ? 'Project Dashboard' : 'Attendance Dashboard'}
                  </span>
                  <FiChevronDown className={`dashboard-dropdown-icon ${dashboardDropdownOpen ? 'open' : ''}`} />
                </button>
                {dashboardDropdownOpen && (
                  <div className="dashboard-custom-dropdown-menu">
                    <Link 
                      to="/memberdashboard"
                      className={`dashboard-dropdown-item ${location.pathname === '/memberdashboard' ? 'active' : ''}`}
                      onClick={() => setDashboardDropdownOpen(false)}
                    >
                      Member Dashboard
                    </Link>
                    <Link 
                      to="/projectdashboard"
                      className={`dashboard-dropdown-item ${location.pathname === '/projectdashboard' ? 'active' : ''}`}
                      onClick={() => setDashboardDropdownOpen(false)}
                    >
                      Project Dashboard
                    </Link>
                  </div>
                )}
              </div>
            </div>
            <div className="dashboard-header-actions">
              <button
                ref={statsRef}
                className={`dashboard-action-btn stats-btn ${statsOpen ? 'active' : ''} ${hasStats ? 'has-stats' : ''}`}
                onClick={handleStatsToggle}
              >
                <FiBarChart2 size={16} />
                Statistics
                {hasStats && !statsOpen && <span className="dashboard-active-indicator"></span>}
              </button>

              <button
                ref={filterRef}
                className={`dashboard-action-btn filter-btn ${filterOpen ? 'active' : ''} ${isFilterActive ? 'used' : ''}`}
                onClick={handleFilterToggle}
              >
                {filterOpen ? "Close Filters" : "Filter"}
                {isFilterActive && !filterOpen && <span className="dashboard-active-indicator"></span>}
              </button>

              <button
                ref={sortRef}
                className={`dashboard-action-btn sort-btn ${sortOpen ? 'active' : ''} ${isSortActive ? 'used' : ''}`}
                onClick={handleSortToggle}
              >
                <span className="dashboard-sort-text">
                  Sort
                  {sortConfig.key && (
                    <span className="dashboard-sort-label">
                      {sortConfig.key === 'date' && sortConfig.direction === 'desc' 
                        ? "" 
                        : `: ${sortOptions.find(opt => opt.value === sortConfig.key)?.label}`
                      }
                    </span>
                  )}
                </span>
                {sortConfig.key && sortConfig.key === 'date' && sortConfig.direction === 'desc' ? (
                  <FiArrowDown style={{ opacity: 0.5 }} />
                ) : sortConfig.key ? (
                  sortConfig.direction === 'asc' ? <FiArrowUp /> : <FiArrowDown />
                ) : null}
                {isSortActive && !sortOpen && <span className="dashboard-active-indicator"></span>}
              </button>

              <button className="dashboard-action-btn dashboard-logout-btn" onClick={handleLogout}>
                Logout
              </button>
              
              <button
                className="dashboard-action-btn dashboard-add-btn"
                onClick={handleAddAttendanceToggle}
              >
                <FiPlus size={18} />
                {showForm ? "Close Form" : "Add Attendance"}
              </button>
            </div>
          </div>
        </div>

        {/* Scrollable Content Area */}
        <div className="dashboard-content">
          {/* Statistics Section */}
          <div className={`dashboard-stats-section ${statsOpen ? "visible" : ""}`}>
            <div className="dashboard-stats-panel">
              {/* Summary Cards */}
              <div className="dashboard-stats-summary-cards">
                <div className="dashboard-stat-card primary">
                  <div className="dashboard-stat-icon">
                    <FiUsers size={24} />
                  </div>
                  <div className="dashboard-stat-info">
                    <h3>{stats.totalEvents}</h3>
                    <p>Total Events</p>
                  </div>
                </div>
                <div className="dashboard-stat-card success">
                  <div className="dashboard-stat-icon">
                    <FiUserCheck size={24} />
                  </div>
                  <div className="dashboard-stat-info">
                    <h3>{stats.totalInvitees.toLocaleString()}</h3>
                    <p>Total Invitees</p>
                  </div>
                </div>
                <div className="dashboard-stat-card warning">
                  <div className="dashboard-stat-icon">
                    <FiUserCheck size={24} />
                  </div>
                  <div className="dashboard-stat-info">
                    <h3>{stats.totalPresent.toLocaleString()}</h3>
                    <p>Total Present</p>
                    <small>{stats.attendanceRate}% attendance rate</small>
                  </div>
                </div>
                <div className="dashboard-stat-card danger">
                  <div className="dashboard-stat-icon">
                    <FiUserX size={24} />
                  </div>
                  <div className="dashboard-stat-info">
                    <h3>{stats.totalAbsent.toLocaleString()}</h3>
                    <p>Total Absent</p>
                  </div>
                </div>
              </div>

              {/* Status Distribution */}
              <div className="dashboard-stats-status-distribution">
                <h4>Status Distribution</h4>
                <div className="dashboard-status-bars">
                  {stats.statusDistribution.map((item, index) => (
                    <div key={index} className="dashboard-status-bar-item">
                      <div className="dashboard-status-bar-label">
                        {getStatusIcon(item.status)}
                        <span>{item.status}</span>
                        <span className="dashboard-status-count">{item.count.toLocaleString()}</span>
                      </div>
                      <div className="dashboard-status-bar-container">
                        <div 
                          className="dashboard-status-bar-fill"
                          style={{
                            width: `${(item.count / stats.totalInvitees) * 100}%`,
                            backgroundColor: item.color
                          }}
                        />
                      </div>
                      <div className="dashboard-status-bar-percentage">
                        {((item.count / stats.totalInvitees) * 100).toFixed(1)}%
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Top Projects */}
              {stats.topProjects.length > 0 && (
                <div className="dashboard-stats-top-projects">
                  <h4>Top Projects by Event Count</h4>
                  <div className="dashboard-projects-list">
                    {stats.topProjects.map((project, index) => (
                      <div key={index} className="dashboard-project-item">
                        <span className="dashboard-project-rank">#{index + 1}</span>
                        <span className="dashboard-project-name">{project.name}</span>
                        <span className="dashboard-project-count">{project.count} events</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Monthly Statistics */}
              {Object.keys(stats.monthlyStats).length > 0 && (
                <div className="dashboard-stats-monthly">
                  <h4>Monthly Overview</h4>
                  <div className="dashboard-monthly-grid">
                    {Object.entries(stats.monthlyStats).map(([month, data]) => (
                      <div key={month} className="dashboard-monthly-card">
                        <div className="dashboard-monthly-header">{month}</div>
                        <div className="dashboard-monthly-stats">
                          <div>Events: {data.events}</div>
                          <div>Invitees: {data.invitees.toLocaleString()}</div>
                          <div>Present: {data.present.toLocaleString()}</div>
                          <div>Absent: {data.absent.toLocaleString()}</div>
                          <div className="dashboard-monthly-rate">
                            Rate: {data.invitees > 0 ? ((data.present / data.invitees) * 100).toFixed(1) : 0}%
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Overall Rates */}
              <div className="dashboard-stats-rates">
                <h4>Overall Attendance Rates</h4>
                <div className="dashboard-rates-grid">
                  <div className="dashboard-rate-item">
                    <div className="dashboard-rate-label">Present</div>
                    <div className="dashboard-rate-bar">
                      <div className="dashboard-rate-fill present" style={{ width: `${stats.presentRate}%` }} />
                    </div>
                    <div className="dashboard-rate-value">{stats.presentRate}%</div>
                  </div>
                  <div className="dashboard-rate-item">
                    <div className="dashboard-rate-label">Absent</div>
                    <div className="dashboard-rate-bar">
                      <div className="dashboard-rate-fill absent" style={{ width: `${stats.absentRate}%` }} />
                    </div>
                    <div className="dashboard-rate-value">{stats.absentRate}%</div>
                  </div>
                  <div className="dashboard-rate-item">
                    <div className="dashboard-rate-label">Invited</div>
                    <div className="dashboard-rate-bar">
                      <div className="dashboard-rate-fill invited" style={{ width: `${stats.invitedRate}%` }} />
                    </div>
                    <div className="dashboard-rate-value">{stats.invitedRate}%</div>
                  </div>
                  <div className="dashboard-rate-item">
                    <div className="dashboard-rate-label">Permission</div>
                    <div className="dashboard-rate-bar">
                      <div className="dashboard-rate-fill permission" style={{ width: `${stats.permissionRate}%` }} />
                    </div>
                    <div className="dashboard-rate-value">{stats.permissionRate}%</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Filter Section */}
          <div className={`dashboard-filter-section ${filterOpen ? "visible" : ""}`}>
            <div className="dashboard-filter-panel">
              <div className="dashboard-filter-group">
                <label>Start Date</label>
                <input
                  type="date"
                  name="startDate"
                  value={filters.startDate}
                  onChange={handleDateFilterChange}
                  className="dashboard-filter-date-input"
                  placeholder="Start Date"
                />
              </div>

              <div className="dashboard-filter-group">
                <label>End Date</label>
                <input
                  type="date"
                  name="endDate"
                  value={filters.endDate}
                  onChange={handleDateFilterChange}
                  className="dashboard-filter-date-input"
                  placeholder="End Date"
                />
              </div>

              <button
                className="dashboard-clear-filters-btn"
                onClick={() => {
                  clearFilters();
                  scrollToTop();
                }}
              >
                Clear Filters
              </button>
            </div>
          </div>

          {/* Sort Section */}
          <div className={`dashboard-sort-section ${sortOpen ? "visible" : ""}`}>
            <div className="dashboard-sort-panel">
              <div className="dashboard-sort-group">
                <label>Sort By</label>
                <div className="dashboard-sort-options-grid">
                  {sortOptions.map((option) => (
                    <button
                      key={option.value}
                      className={`dashboard-sort-option-btn ${sortConfig.key === option.value ? 'active' : ''}`}
                      onClick={() => handleSort(option.value)}
                    >
                      {option.label}
                      {sortConfig.key === option.value && (
                        sortConfig.direction === 'asc' ? 
                          <FiArrowUp className="dashboard-sort-icon" /> : 
                          <FiArrowDown className="dashboard-sort-icon" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
              <button
                className="dashboard-clear-sort-btn"
                onClick={() => {
                  setSortConfig({ key: 'date', direction: 'desc' });
                  setSortOpen(false);
                  scrollToTop();
                }}
              >
                Reset to Default
              </button>
            </div>
          </div>

          {/* Form Modal */}
          {showForm && (
            <div className="dashboard-modal-overlay">
              <div className="dashboard-modal-content">
                <AttendanceForm
                  onSuccess={handleFormSuccess}
                  onCancel={handleFormCancel}
                  editData={editingAttendance}
                />
              </div>
            </div>
          )}

          {/* Results Summary */}
          <div className="dashboard-results-summary">
            <span>Showing {sortedAttendances.length} attendance records</span>
            {sortConfig.key && (
              <span className="dashboard-current-sort">
                Sorted by: {sortOptions.find(opt => opt.value === sortConfig.key)?.label} 
                ({sortConfig.direction === 'asc' ? 'Ascending' : 'Descending'})
              </span>
            )}
          </div>

          {/* Attendance Grid */}
          <div className="dashboard-members-grid-container">
            {loading ? (
              <div className="dashboard-loading-spinner">
                <div className="dashboard-spinner"></div>
              </div>
            ) : sortedAttendances.length === 0 ? (
              <div className="dashboard-no-members">No attendance records found.</div>
            ) : (
              <div className="dashboard-members-grid">
                {sortedAttendances.map((attendance) => (
                  <AttendanceCard
                    key={attendance._id || attendance.id}
                    attendance={attendance}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AttendanceDashboard;