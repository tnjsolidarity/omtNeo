import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FiArrowLeft, FiPlus, FiEdit2, FiTrash2, FiCalendar, FiUser, FiFlag, FiBarChart2 } from "react-icons/fi";
import { getProject, updateProject, deleteProject } from "../../services/projectService";
import { getActivities, createActivity, updateActivity, deleteActivity } from "../../services/activityService";
import ProjectForm from "../../components/forms/ProjectForm";
import ActivityForm from "../../components/forms/ActivityForm";
import ActivityCard from "../../components/activities/ActivityCard";
import "../../styles/ProjectDetail.css";

// Initial form states
const INITIAL_PROJECT_FORM = {
  name: "",
  description: "",
  status: "Planning",
  startDate: "",
  endDate: "",
  projectManager: "",
  priority: "Medium"
};

const INITIAL_ACTIVITY_FORM = {
  name: "",
  description: "",
  priority: "Medium",
  startDate: "",
  endDate: "",
  incharge: ""
};

function ProjectDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  // State
  const [project, setProject] = useState(null);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editProjectOpen, setEditProjectOpen] = useState(false);
  const [activityFormOpen, setActivityFormOpen] = useState(false);
  const [editingActivity, setEditingActivity] = useState(null);
  const [deletingActivityId, setDeletingActivityId] = useState(null);
  
  const [projectForm, setProjectForm] = useState(INITIAL_PROJECT_FORM);
  const [activityForm, setActivityForm] = useState(INITIAL_ACTIVITY_FORM);

  // Fetch data
  const fetchProject = async () => {
    try {
      const res = await getProject(id);
      setProject(res.data);
      setProjectForm({
        name: res.data.name || "",
        description: res.data.description || "",
        status: res.data.status || "Planning",
        startDate: res.data.startDate ? res.data.startDate.split("T")[0] : "",
        endDate: res.data.endDate ? res.data.endDate.split("T")[0] : "",
        projectManager: res.data.projectManager?._id || res.data.projectManager || "",
        priority: res.data.priority || "Medium"
      });
    } catch (err) {
      console.error("Error fetching project:", err);
      navigate("/projectdashboard");
    }
  };

  const fetchActivities = async () => {
    try {
      const res = await getActivities(id);
      setActivities(res.data);
    } catch (err) {
      console.error("Error fetching activities:", err);
    }
  };

  useEffect(() => {
    Promise.all([fetchProject(), fetchActivities()]).finally(() => setLoading(false));
  }, [id]);

  // Project handlers
  const handleUpdateProject = async () => {
    setLoading(true);
    try {
      await updateProject(id, projectForm);
      await fetchProject();
      setEditProjectOpen(false);
    } catch (err) {
      console.error("Error updating project:", err);
      alert("Failed to update project");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProject = async () => {
    if (!window.confirm("Are you sure you want to delete this project and all its activities?")) return;
    
    setLoading(true);
    try {
      await deleteProject(id);
      navigate("/projectdashboard");
    } catch (err) {
      console.error("Error deleting project:", err);
      alert("Failed to delete project");
    } finally {
      setLoading(false);
    }
  };

  // Activity handlers
  const handleCreateActivity = async () => {
    setLoading(true);
    try {
      if (editingActivity) {
        await updateActivity(id, editingActivity._id, activityForm);
      } else {
        await createActivity(id, activityForm);
      }
      await fetchActivities();
      handleCloseActivityForm();
    } catch (err) {
      console.error("Error saving activity:", err);
      alert(err.response?.data?.error || "Failed to save activity");
    } finally {
      setLoading(false);
    }
  };

  const handleEditActivity = (activity) => {
    setEditingActivity(activity);
    setActivityForm({
      name: activity.name || "",
      description: activity.description || "",
      priority: activity.priority || "Medium",
      startDate: activity.startDate ? activity.startDate.split("T")[0] : "",
      endDate: activity.endDate ? activity.endDate.split("T")[0] : "",
      incharge: activity.incharge?._id || activity.incharge || ""
    });
    setActivityFormOpen(true);
  };

  const handleDeleteActivity = async (activityId) => {
    if (!window.confirm("Are you sure you want to delete this activity?")) return;
    
    setDeletingActivityId(activityId);
    try {
      await deleteActivity(id, activityId);
      await fetchActivities();
    } catch (err) {
      console.error("Error deleting activity:", err);
      alert("Failed to delete activity");
    } finally {
      setDeletingActivityId(null);
    }
  };

  const handleCloseActivityForm = () => {
    setActivityFormOpen(false);
    setEditingActivity(null);
    setActivityForm(INITIAL_ACTIVITY_FORM);
  };

  // Utilities
  const formatDate = (dateString) => {
    if (!dateString) return "Not set";
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

  if (loading && !project) {
    return (
      <div className="project-detail-loading">
        <div className="loading-spinner"></div>
        <p>Loading project details...</p>
      </div>
    );
  }

  return (
    <div className="project-detail-container">
      {/* Header */}
      <div className="project-detail-header">
        <button className="back-btn" onClick={() => navigate("/projectdashboard")}>
          <FiArrowLeft size={18} />
          Back to Projects
        </button>
        <div className="project-actions-header">
          <button className="edit-project-btn" onClick={() => setEditProjectOpen(true)}>
            <FiEdit2 size={16} />
            Edit Project
          </button>
          <button className="delete-project-btn" onClick={handleDeleteProject}>
            <FiTrash2 size={16} />
            Delete Project
          </button>
        </div>
      </div>

      {/* Project Details Card */}
      <div className={`project-detail-card priority-${project?.priority?.toLowerCase()}`}>
        <div className="project-header">
          <div className="project-title-section">
            <h1>{project?.name}</h1>
            {project?.projectId && (
              <span className="project-id-badge-large">{project.projectId}</span>
            )}
          </div>
          <div className="project-status-badges">
            <span className={`status-badge-large status-${project?.status?.toLowerCase().replace(/\s+/g, '')}`}>
              {project?.status}
            </span>
            <span className={`priority-badge-large priority-${project?.priority?.toLowerCase()}`}>
              <FiFlag size={12} />
              {project?.priority}
            </span>
          </div>
        </div>

        {project?.description && (
          <p className="project-description-large">{project.description}</p>
        )}

        <div className="project-info-grid">
          {project?.projectManager && (
            <div className="info-item">
              <label>Project Manager</label>
              <span><FiUser size={14} /> {getManagerDisplay(project.projectManager)}</span>
            </div>
          )}
          <div className="info-item">
            <label>Timeline</label>
            <span>
              <FiCalendar size={14} />
              {formatDate(project?.startDate)} → {formatDate(project?.endDate)}
            </span>
          </div>
        </div>

        <div className="project-timestamps">
          <div className="timestamp">Created: {new Date(project?.createdAt).toLocaleDateString()}</div>
          <div className="timestamp">Last Updated: {new Date(project?.updatedAt).toLocaleDateString()}</div>
        </div>
      </div>

      {/* Activities Section */}
      <div className="activities-section">
        <div className="activities-header">
          <h2>
            <FiBarChart2 size={20} />
            Activities ({activities.length})
          </h2>
          <button className="add-activity-btn" onClick={() => setActivityFormOpen(true)}>
            <FiPlus size={18} />
            Add Activity
          </button>
        </div>

        <div className="activities-grid">
          {activities.length === 0 ? (
            <div className="no-activities">
              <p>No activities yet. Click "Add Activity" to create your first activity!</p>
            </div>
          ) : (
            activities.map((activity) => (
              <ActivityCard
                key={activity._id}
                activity={activity}
                onEdit={handleEditActivity}
                onDelete={handleDeleteActivity}
              />
            ))
          )}
        </div>
      </div>

      {/* Edit Project Modal */}
      {editProjectOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <ProjectForm
              form={projectForm}
              setForm={setProjectForm}
              handleSubmit={handleUpdateProject}
              loading={loading}
              editingId={id}
              handleClear={() => setEditProjectOpen(false)}
              handleClose={() => setEditProjectOpen(false)}
            />
          </div>
        </div>
      )}

      {/* Activity Form Modal */}
      {activityFormOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <ActivityForm
              form={activityForm}
              setForm={setActivityForm}
              handleSubmit={handleCreateActivity}
              loading={loading}
              editingId={editingActivity?._id}
              handleClear={handleCloseActivityForm}
              handleClose={handleCloseActivityForm}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default ProjectDetail;