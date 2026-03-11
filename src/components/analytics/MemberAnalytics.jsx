import React, { useMemo, useState } from "react";
import "../analytics/Analytics.css";
import { FiUsers, FiBriefcase, FiTool, FiChevronDown, FiChevronUp } from "react-icons/fi";

function MemberAnalytics({ members }) {
  const [expandedSections, setExpandedSections] = useState({
    skills: true,
    career: true
  });

  const totalMembers = members.length;

  const { roleCounts, skillCounts, careerCounts, topSkills, topCareers } = useMemo(() => {
    const rCounts = {};
    const sCounts = {};
    const cCounts = {};

    members.forEach((member) => {
      // Role Count
      const role = member.role || "Unknown";
      rCounts[role] = (rCounts[role] || 0) + 1;

      // Skill Count
      if (member.skills && Array.isArray(member.skills)) {
        member.skills.forEach((skill) => {
          const s = String(skill).trim();
          if (s) sCounts[s] = (sCounts[s] || 0) + 1;
        });
      }

      // Career Count
      if (member.career && Array.isArray(member.career)) {
        member.career.forEach((career) => {
          const c = String(career).trim();
          if (c) cCounts[c] = (cCounts[c] || 0) + 1;
        });
      }
    });

    // Sort and get top items
    const sortedSkills = Object.entries(sCounts).sort((a, b) => b[1] - a[1]);
    const sortedCareers = Object.entries(cCounts).sort((a, b) => b[1] - a[1]);

    return { 
      roleCounts: rCounts, 
      skillCounts: sCounts, 
      careerCounts: cCounts,
      topSkills: sortedSkills.slice(0, 5),
      topCareers: sortedCareers.slice(0, 5)
    };
  }, [members]);

  const totalSkillCount = Object.values(skillCounts).reduce((a, b) => a + b, 0);
  const totalCareerCount = Object.values(careerCounts).reduce((a, b) => a + b, 0);

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // Get color based on role
  const getRoleColor = (role) => {
    const colors = {
      'Associate': '#4caf50',
      'Member': '#2196f3',
      'GuestMember': '#9e9e9e',
      'District Secretary': '#673ab7',
      'District President': '#ff9800',
      'State President': '#e53935'
    };
    return colors[role] || '#3f51b5';
  };

  return (
    <div className="analytics-inner-container">
      {/* Summary Cards with Icons */}
      <div className="analytics-cards">
        <div className="analytics-card total-card">
          <div className="card-icon">
            <FiUsers size={24} />
          </div>
          <div className="card-content">
            <h3>Total Members</h3>
            <p className="total-count">{totalMembers}</p>
          </div>
        </div>

        {Object.entries(roleCounts).map(([role, count]) => (
          <div 
            className="analytics-card role-card" 
            key={role}
            style={{ borderLeft: `4px solid ${getRoleColor(role)}` }}
          >
            <div className="card-content">
              <h3>{role}</h3>
              <p className="role-count">{count}</p>
              <span className="role-percentage">
                {((count / totalMembers) * 100).toFixed(1)}%
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Summary Stats */}
      <div className="analytics-summary-stats">
        <div className="stat-item">
          <FiTool className="stat-icon" />
          <span>Total Skills: {totalSkillCount}</span>
        </div>
        <div className="stat-item">
          <FiBriefcase className="stat-icon" />
          <span>Total Careers: {totalCareerCount}</span>
        </div>
      </div>

      {/* Two-Column Lists with Expand/Collapse */}
      <div className="analytics-two-columns">
        {/* Skills List */}
        <div className="analytics-column">
          <div 
            className="column-header" 
            onClick={() => toggleSection('skills')}
          >
            <h3>Skills Distribution</h3>
            {expandedSections.skills ? <FiChevronUp /> : <FiChevronDown />}
          </div>
          
          {/* Top Skills Preview */}
          {!expandedSections.skills && (
            <div className="top-items-preview">
              {topSkills.map(([skill, count]) => (
                <div key={skill} className="preview-item">
                  <span className="preview-label">{skill}</span>
                  <span className="preview-count">{count}</span>
                </div>
              ))}
              {Object.keys(skillCounts).length > 5 && (
                <div className="more-indicator">
                  +{Object.keys(skillCounts).length - 5} more
                </div>
              )}
            </div>
          )}

          {/* Full List */}
          <div className={`expandable-content ${expandedSections.skills ? 'expanded' : ''}`}>
            <ul>
              {Object.entries(skillCounts)
                .sort((a, b) => b[1] - a[1])
                .map(([skill, count]) => {
                  const percentage = ((count / totalSkillCount) * 100).toFixed(1);
                  return (
                    <li key={skill} className="distribution-item">
                      <div className="item-info">
                        <strong>{skill}</strong>
                        <span className="item-count">{count}</span>
                      </div>
                      <div className="progress-bar-container">
                        <div 
                          className="progress-bar" 
                          style={{ width: `${percentage}%` }}
                        ></div>
                        <span className="percentage">{percentage}%</span>
                      </div>
                    </li>
                  );
                })}
            </ul>
          </div>
        </div>

        {/* Career List */}
        <div className="analytics-column">
          <div 
            className="column-header" 
            onClick={() => toggleSection('career')}
          >
            <h3>Career Distribution</h3>
            {expandedSections.career ? <FiChevronUp /> : <FiChevronDown />}
          </div>

          {/* Top Careers Preview */}
          {!expandedSections.career && (
            <div className="top-items-preview">
              {topCareers.map(([career, count]) => (
                <div key={career} className="preview-item">
                  <span className="preview-label">{career}</span>
                  <span className="preview-count">{count}</span>
                </div>
              ))}
              {Object.keys(careerCounts).length > 5 && (
                <div className="more-indicator">
                  +{Object.keys(careerCounts).length - 5} more
                </div>
              )}
            </div>
          )}

          {/* Full List */}
          <div className={`expandable-content ${expandedSections.career ? 'expanded' : ''}`}>
            <ul>
              {Object.entries(careerCounts)
                .sort((a, b) => b[1] - a[1])
                .map(([career, count]) => {
                  const percentage = ((count / totalCareerCount) * 100).toFixed(1);
                  return (
                    <li key={career} className="distribution-item">
                      <div className="item-info">
                        <strong>{career}</strong>
                        <span className="item-count">{count}</span>
                      </div>
                      <div className="progress-bar-container">
                        <div 
                          className="progress-bar" 
                          style={{ width: `${percentage}%` }}
                        ></div>
                        <span className="percentage">{percentage}%</span>
                      </div>
                    </li>
                  );
                })}
            </ul>
          </div>
        </div>
      </div>

      {/* Empty State */}
      {totalMembers === 0 && (
        <div className="analytics-empty-state">
          <p>No members data available for analytics</p>
        </div>
      )}
    </div>
  );
}

export default MemberAnalytics;