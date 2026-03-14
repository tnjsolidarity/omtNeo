import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { getMembers } from "../services/memberService";
import "../styles/MemberDetail.css"; // We'll create this CSS file

function MemberDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [member, setMember] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMember = async () => {
      try {
        const res = await getMembers();
        const found = res.data.find((m) => m._id === id);
        setMember(found);
      } catch (error) {
        console.error("Error fetching member:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchMember();
  }, [id]);

  // Helper function to calculate age
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

  // Helper function to format date
  const formatDate = (dateString) => {
    if (!dateString) return "Not set";
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="member-detail-loading">
        <div className="loading-spinner"></div>
        <p>Loading member details...</p>
      </div>
    );
  }

  if (!member) {
    return (
      <div className="member-detail-not-found">
        <h2>Member Not Found</h2>
        <p>The member you're looking for doesn't exist or has been removed.</p>
        <button onClick={() => navigate(-1)} className="back-btn">
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="member-detail-container">
      {/* Header with back button */}
      <div className="member-detail-header">
        <button onClick={() => navigate(-1)} className="back-btn">
          ← Back
        </button>
        <h1>Member Profile</h1>
      </div>

      {/* Main content card */}
      <div className={`member-detail-card role-${member.role?.replace(/\s+/g, "") || "Associate"}`}>
        {/* Basic Info Section */}
        <div className="detail-section basic-info">
          <h2>{member.name}</h2>
          <div className="role-badge-large">{member.role}</div>
          
          <div className="info-grid">
            <div className="info-item">
              <label>Member ID</label>
              <span>{member.memberId || "Not assigned"}</span>
            </div>
            
            <div className="info-item">
              <label>Phone</label>
              <span>{member.phone || "Not provided"}</span>
            </div>

            {/* ADDED: Date of Birth and Age */}
            <div className="info-item">
              <label>Date of Birth</label>
              <span>
                {member.dateOfBirth ? (
                  <>
                    {formatDate(member.dateOfBirth)}
                    <span className="age-badge-large">
                      {calculateAge(member.dateOfBirth)} years old
                    </span>
                  </>
                ) : (
                  "Not provided"
                )}
              </span>
            </div>
          </div>
        </div>

        {/* Skills Section */}
        <div className="detail-section">
          <h3>Skills</h3>
          {member.skills?.length > 0 ? (
            <div className="tags-container">
              {member.skills.map((skill, index) => (
                <span key={index} className="tag">{skill}</span>
              ))}
            </div>
          ) : (
            <p className="no-data">No skills listed</p>
          )}
        </div>

        {/* Career Section */}
        <div className="detail-section">
          <h3>Career</h3>
          {member.career?.length > 0 ? (
            <div className="tags-container">
              {member.career.map((career, index) => (
                <span key={index} className="tag">{career}</span>
              ))}
            </div>
          ) : (
            <p className="no-data">No career information</p>
          )}
        </div>

        {/* Education Section */}
        <div className="detail-section">
          <h3>Education</h3>
          {member.education?.length > 0 ? (
            <>
              <div className="tags-container">
                {member.education.map((edu, index) => (
                  <span key={index} className="tag">{edu}</span>
                ))}
              </div>
              
              {/* Educational Details */}
              {(member.educationalDepartment || member.passedOutYear) && (
                <div className="education-details">
                  {member.educationalDepartment && (
                    <p><strong>Department:</strong> {member.educationalDepartment}</p>
                  )}
                  {member.passedOutYear && (
                    <p><strong>Passed Out Year:</strong> {member.passedOutYear}</p>
                  )}
                </div>
              )}
            </>
          ) : (
            <p className="no-data">No education information</p>
          )}
        </div>

        {/* Timestamps */}
        <div className="detail-section timestamps">
          <p className="timestamp">
            <small>Created: {member.createdAt ? new Date(member.createdAt).toLocaleString() : "Unknown"}</small>
          </p>
          <p className="timestamp">
            <small>Last Updated: {member.updatedAt ? new Date(member.updatedAt).toLocaleString() : "Unknown"}</small>
          </p>
        </div>
      </div>
    </div>
  );
}

export default MemberDetail;