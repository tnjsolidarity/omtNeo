import { useEffect, useState, useRef } from "react";
import { FiPlus, FiArrowUp, FiArrowDown, FiChevronDown } from "react-icons/fi";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  getProjects,
  createProject,
  deleteProject,
  updateProject,
} from "../../services/projectService";
import ProjectForm from "../../components/forms/ProjectForm";
import "../../styles/ProjectDashboard.css";

// Constants
const STATUS_ORDER = {
  'In Progress': 1,
  'On Hold': 2,
  'Planning': 3,
  'Completed': 4,
  'Cancelled': 5
};

const PRIORITY_ORDER = {
  'Critical': 1,
  'High': 2,
  'Medium': 3,
  'Low': 4
};

const STATUS_COLOR_MAP = {
  'Planning': 'status-planning',
  'In Progress': 'status-progress',
  'On Hold': 'status-hold',
  'Completed': 'status-completed',
  'Cancelled': 'status-cancelled'
};

const PRIORITY_COLOR_MAP = {
  'Low': 'priority-low',
  'Medium': 'priority-medium',
  'High': 'priority-high',
  'Critical': 'priority-critical'
};

const SORT_OPTIONS = [
  { value: 'name', label: 'Name' },
  { value: 'status', label: 'Status' },
  { value: 'priority', label: 'Priority' },
  { value: 'projectId', label: 'Project ID' },
  { value: 'projectManager', label: 'Manager' },
  { value: 'startDate', label: 'Start Date' },
  { value: 'endDate', label: 'End Date' },
  { value: 'createdAt', label: 'Created Date' },
  { value: 'updatedAt', label: 'Updated Date' },
  { value: 'description', label: 'Description' }
];

function ProjectDashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Refs
  const dropdownRef = useRef(null);
  const sortRef = useRef(null);
  
  // State
  const [dashboardDropdownOpen, setDashboardDropdownOpen] = useState(false);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [formOpen, setFormOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOpen, setSortOpen] = useState(false);
  const [sortConfig, setSortConfig] = useState({
    key: 'status',
    direction: 'asc'
  });
  const [form, setForm] = useState({
    name: "",
    description: "",
    status: "Planning",
    startDate: "",
    endDate: "",
    projectManager: "",
    priority: "Medium"
  });
  const [editingId, setEditingId] = useState(null);

  // Handle click outside dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDashboardDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch projects on mount
  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const res = await getProjects();
      setProjects(res.data);
    } catch (err) {
      console.error("Error fetching projects:", err);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      if (editingId) {
        await updateProject(editingId, form);
        setEditingId(null);
      } else {
        await createProject(form);
      }

      handleClear();
      setFormOpen(false);
      await fetchProjects();
    } catch (err) {
      console.error(err);
      alert("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setForm({
      name: "",
      description: "",
      status: "Planning",
      startDate: "",
      endDate: "",
      projectManager: "",
      priority: "Medium"
    });
    setEditingId(null);
  };

  const handleEdit = (project) => {
    setForm({
      name: project.name || "",
      description: project.description || "",
      status: project.status || "Planning",
      startDate: project.startDate ? project.startDate.split("T")[0] : "",
      endDate: project.endDate ? project.endDate.split("T")[0] : "",
      projectManager: typeof project.projectManager === 'object' 
        ? project.projectManager._id 
        : project.projectManager || "",
      priority: project.priority || "Medium"
    });
    setEditingId(project._id);
    setFormOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this project?")) return;
    setDeletingId(id);
    try {
      await deleteProject(id);
      await fetchProjects();
    } catch (err) {
      console.error(err);
      alert("Delete failed");
    } finally {
      setDeletingId(null);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/";
  };

  const scrollToTop = () => {
    document.querySelector('.dashboard-content')?.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    if (e.target.value) scrollToTop();
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

  const handleSort = (key) => {
    setSortConfig({
      key,
      direction: sortConfig.key === key && sortConfig.direction === 'asc' ? 'desc' : 'asc'
    });
  };

  const getSortedProjects = (projectsToSort) => {
    if (!sortConfig.key) return projectsToSort;

    return [...projectsToSort].sort((a, b) => {
      // Status sorting (custom order)
      if (sortConfig.key === 'status') {
        const orderA = STATUS_ORDER[a.status] || 999;
        const orderB = STATUS_ORDER[b.status] || 999;
        return sortConfig.direction === 'asc' ? orderA - orderB : orderB - orderA;
      }
      
      // Priority sorting (custom order)
      if (sortConfig.key === 'priority') {
        const orderA = PRIORITY_ORDER[a.priority] || 999;
        const orderB = PRIORITY_ORDER[b.priority] || 999;
        return sortConfig.direction === 'asc' ? orderA - orderB : orderB - orderA;
      }
      
      // Date fields
      if (['startDate', 'endDate', 'createdAt', 'updatedAt'].includes(sortConfig.key)) {
        const dateA = a[sortConfig.key] ? new Date(a[sortConfig.key]).getTime() : 0;
        const dateB = b[sortConfig.key] ? new Date(b[sortConfig.key]).getTime() : 0;
        return sortConfig.direction === 'asc' ? dateA - dateB : dateB - dateA;
      }
      
      // String fields
      if (['name', 'projectManager', 'projectId', 'description'].includes(sortConfig.key)) {
        const valA = (a[sortConfig.key] || '').toString().toLowerCase();
        const valB = (b[sortConfig.key] || '').toString().toLowerCase();
        
        if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
        if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      }
      
      return 0;
    });
  };

  const filteredProjects = projects.filter((project) => {
    const term = searchTerm.toLowerCase();
    const managerName = typeof project.projectManager === 'object'
      ? project.projectManager?.name || ''
      : project.projectManager || '';
    
    return (
      project.projectId?.toLowerCase().includes(term) ||
      project.name?.toLowerCase().includes(term) ||
      project.description?.toLowerCase().includes(term) ||
      managerName.toLowerCase().includes(term)
    );
  });

  const sortedProjects = getSortedProjects(filteredProjects);
  const isSortActive = sortConfig.key !== 'status' || sortConfig.direction !== 'asc';
  const isSearchActive = searchTerm !== "";

  const getStatusClass = (status) => STATUS_COLOR_MAP[status] || 'status-planning';
  const getPriorityClass = (priority) => PRIORITY_COLOR_MAP[priority] || 'priority-medium';

  const formatDate = (dateString) => {
    if (!dateString) return null;
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getManagerDisplay = (manager) => {
    if (!manager) return null;
    return typeof manager === 'object' ? manager.name : manager;
  };

  return (
    <div className="dashboard-fullpage">
      <div className="dashboard-container">
        {/* Sticky Header */}
        <div className="dashboard-header-sticky">
          <div className="dashboard-header-content">
            <div className="header-left">
              <div className="custom-dropdown" ref={dropdownRef}>
                <button 
                  className="custom-dropdown-toggle"
                  onClick={() => setDashboardDropdownOpen(!dashboardDropdownOpen)}
                >
                  <span className="dropdown-label">
                    {location.pathname === '/memberdashboard' ? 'Member Dashboard' : 'Project Dashboard'}
                  </span>
                  <FiChevronDown className={`dropdown-icon ${dashboardDropdownOpen ? 'open' : ''}`} />
                </button>
                {dashboardDropdownOpen && (
                  <div className="custom-dropdown-menu">
                    <Link 
                      to="/memberdashboard"
                      className={`dropdown-item ${location.pathname === '/memberdashboard' ? 'active' : ''}`}
                      onClick={() => setDashboardDropdownOpen(false)}
                    >
                      Member Dashboard
                    </Link>
                    <Link 
                      to="/projectdashboard"
                      className={`dropdown-item ${location.pathname === '/projectdashboard' ? 'active' : ''}`}
                      onClick={() => setDashboardDropdownOpen(false)}
                    >
                      Project Dashboard
                    </Link>
                  </div>
                )}
              </div>
            </div>
            <div className="header-actions">
              <div className="search-wrapper">
                <input
                  type="text"
                  placeholder="Search projects by ID, name, description, or manager..."
                  value={searchTerm}
                  onChange={handleSearchChange}
                  className={`search-input ${isSearchActive ? 'active' : ''}`}
                />
              </div>

              <button
                ref={sortRef}
                className={`action-btn sort-btn ${sortOpen ? 'active' : ''} ${isSortActive ? 'used' : ''}`}
                onClick={handleSortToggle}
              >
                <span className="sort-text">
                  Sort
                  {sortConfig.key && sortConfig.key !== 'status' && (
                    <span className="sort-label">
                      : {SORT_OPTIONS.find(opt => opt.value === sortConfig.key)?.label}
                    </span>
                  )}
                </span>
                {sortConfig.key && sortConfig.key === 'status' && sortConfig.direction === 'asc' ? (
                  <FiArrowDown style={{ opacity: 0.5 }} />
                ) : sortConfig.key ? (
                  sortConfig.direction === 'asc' ? <FiArrowUp /> : <FiArrowDown />
                ) : null}
                {isSortActive && !sortOpen && <span className="active-indicator"></span>}
              </button>

              <button className="action-btn logout-btn" onClick={handleLogout}>
                Logout
              </button>
              
              <button className="action-btn add-btn" onClick={() => setFormOpen(!formOpen)}>
                <FiPlus size={18} />
                {formOpen ? "Close Form" : "New Project"}
              </button>
            </div>
          </div>
        </div>

        {/* Scrollable Content Area */}
        <div className="dashboard-content">
          {/* Form Modal */}
          {formOpen && (
            <div className="modal-overlay">
              <div className="modal-content project-form-modal">
                <ProjectForm
                  form={form}
                  setForm={setForm}
                  handleSubmit={handleSubmit}
                  loading={loading}
                  editingId={editingId}
                  handleClear={handleClear}
                  handleClose={() => setFormOpen(false)}
                />
              </div>
            </div>
          )}

          {/* Sort Section */}
          <div ref={sortRef} className={`sort-section ${sortOpen ? "visible" : ""}`}>
            <div className="sort-panel">
              <div className="sort-group">
                <label>Sort By</label>
                <div className="sort-options-grid">
                  {SORT_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      className={`sort-option-btn ${sortConfig.key === option.value ? 'active' : ''}`}
                      onClick={() => handleSort(option.value)}
                    >
                      {option.label}
                      {sortConfig.key === option.value && (
                        sortConfig.direction === 'asc' ? 
                          <FiArrowUp className="sort-icon" /> : 
                          <FiArrowDown className="sort-icon" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
              <button
                className="clear-sort-btn"
                onClick={() => {
                  setSortConfig({ key: 'status', direction: 'asc' });
                  setSortOpen(false);
                  scrollToTop();
                }}
              >
                Reset to Default
              </button>
            </div>
          </div>

          {/* Results Summary */}
          <div className="results-summary">
            <span>Showing {sortedProjects.length} projects</span>
            {sortConfig.key && (
              <span className="current-sort">
                Sorted by: {SORT_OPTIONS.find(opt => opt.value === sortConfig.key)?.label} 
                ({sortConfig.direction === 'asc' ? 'Ascending' : 'Descending'})
              </span>
            )}
          </div>

          {/* Projects Grid */}
          <div className="projects-grid">
            {sortedProjects.length === 0 ? (
              <div className="no-projects">No projects found. Create your first project!</div>
            ) : (
              sortedProjects.map((project) => (
                <Link to={`/projects/${project._id}`} className="project-card" key={project._id}>
                  <div className="project-card-header">
                    <div className="project-title-section">
                      <h3 className="project-name">{project.name}</h3>
                      {project.projectId && (
                        <span className="project-id-badge">{project.projectId}</span>
                      )}
                    </div>
                    <div className="project-badges">
                      <span className={`project-status ${getStatusClass(project.status)}`}>
                        {project.status}
                      </span>
                      <span className={`project-priority ${getPriorityClass(project.priority)}`}>
                        {project.priority}
                      </span>
                    </div>
                  </div>

                  <div className="project-progress">
                    <div className="progress-bar">
                      <div
                        className="progress-fill"
                        style={{ width: `${project.progress || 0}%` }}
                      ></div>
                    </div>
                    <span className="progress-text">
                      {project.progress || 0}% Completed
                    </span>
                  </div>
                  
                  <p className="project-description">
                    {project.description || "No description provided"}
                  </p>

                  <div className="project-details">
                    {project.projectManager && (
                      <div className="project-detail">
                        <span className="detail-label">Manager:</span>
                        <span className="detail-value">{getManagerDisplay(project.projectManager)}</span>
                      </div>
                    )}
                    
                    {project.startDate && (
                      <div className="project-detail">
                        <span className="detail-label">Start:</span>
                        <span className="detail-value">{formatDate(project.startDate)}</span>
                      </div>
                    )}

                    {project.endDate && (
                      <div className="project-detail">
                        <span className="detail-label">End:</span>
                        <span className="detail-value">{formatDate(project.endDate)}</span>
                      </div>
                    )}
                  </div>

                  <div className="project-card-actions">
                    <button
                      className="edit-btn"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleEdit(project);
                      }}
                    >
                      Edit
                    </button>
                    <button
                      className="delete-btn"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleDelete(project._id);
                      }}
                      disabled={deletingId === project._id}
                    >
                      {deletingId === project._id ? "..." : "Delete"}
                    </button>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProjectDashboard;