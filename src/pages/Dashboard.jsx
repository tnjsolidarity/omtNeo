import { useEffect, useState, useRef } from "react";
import { FiUserPlus, FiArrowUp, FiArrowDown } from "react-icons/fi";
import Select from "react-select";
import { Link } from "react-router-dom";
import {
  getMembers,
  createMember,
  deleteMember,
  updateMember,
} from "../services/memberService";
import "../styles/Dashboard.css";
import MemberForm from "../components/forms/MemberForm";
import MemberAnalytics from "../components/analytics/MemberAnalytics";

function Dashboard() {
  const formRef = useRef(null);
  const analyticsRef = useRef(null);
  const filterRef = useRef(null);
  const sortRef = useRef(null);
  const searchRef = useRef(null);
  const [members, setMembers] = useState([]);
  const [form, setForm] = useState({
    name: "",
    phone: "",
    role: "Associate",
    dateOfBirth: "",
    skills: [],
    career: [],
    education: [],
    educationalDepartment: "",
    passedOutYear: null,
  });
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [formOpen, setFormOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterOpen, setFilterOpen] = useState(false);
  const [roleFilter, setRoleFilter] = useState("");
  const [skillFilter, setSkillFilter] = useState([]);
  const [analyticsOpen, setAnalyticsOpen] = useState(false);
  
  const [sortConfig, setSortConfig] = useState({
    key: 'name',
    direction: 'asc'
  });
  const [sortOpen, setSortOpen] = useState(false);

  const fetchMembers = async () => {
    try {
      const res = await getMembers();
      setMembers(res.data);
    } catch (err) {
      console.error("Error fetching members:", err);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, []);

  const roleOptions = [
    { value: "Associate", label: "Associate" },
    { value: "Member", label: "Member" },
    { value: "GuestMember", label: "Guest Member" },
    { value: "District Secretary", label: "District Secretary" },
    { value: "District President", label: "District President" },
    { value: "State President", label: "State President" },
  ];

  const skillOptions = [
    { value: "Accounting", label: "Accounting" },
    { value: "Acting", label: "Acting" },
    { value: "Career Guidance", label: "Career Guidance" },
    { value: "Cooking", label: "Cooking" },
    { value: "Construction Engineering", label: "Construction Engineering" },
    { value: "Driving", label: "Driving" },
    { value: "Graphic Design", label: "Graphic Design" },
    { value: "Literature", label: "Literature" },
    { value: "Management", label: "Management" },
    { value: "Mechanical Skills", label: "Mechanical Skills" },
    { value: "Organising", label: "Organising" },
    { value: "IT Skills", label: "IT Skills" },
    { value: "Singing", label: "Singing" },
    { value: "Speech", label: "Speech" },
    { value: "Sports", label: "Sports" },
    { value: "Training", label: "Training" },
    { value: "Video Editing", label: "Video Editing" },
    { value: "Volunteering", label: "Volunteering" },
  ];

  const careerOptions = [
    { value: "Accountant", label: "Accountant" },
    { value: "Building Renovation", label: "Building Renovation" },
    { value: "College Professor", label: "College Professor" },
    { value: "Construction Engineering", label: "Construction Engineering" },
    { value: "Catering", label: "Catering" },
    { value: "Home Automation", label: "Home Automation" },
    { value: "Mobile Shop", label: "Mobile Shop" },
    { value: "Procurement", label: "Procurement" },
    { value: "School Student", label: "School Student" },
    { value: "Site Supervisor", label: "Site Supervisor" },
    { value: "Software Developer", label: "Software Developer" },
    { value: "Software Tester", label: "Software Tester" },
    { value: "Startup Company", label: "Startup Company" },
  ];

  const educationOptions = [
    { value: "BCom", label: "BCom" },
    { value: "BE", label: "BE" },
    { value: "BSc", label: "BSc" },
    { value: "HSC", label: "HSC" },
    { value: "PhD", label: "PhD" },
  ];

  const departmentOptions = [
    { value: "Computer Science", label: "Computer Science" },
    { value: "Corporate Secretaryship", label: "Corporate Secretaryship" },
    { value: "Electronics", label: "Electronics" },
    { value: "Food Technology", label: "Food Technology" },
    { value: "General", label: "General" },
    { value: "Management", label: "Management" },
    { value: "Mechanical", label: "Mechanical" },
  ];

  const currentYear = new Date().getFullYear();
  const passedOutYearOptions = Array.from({ length: 30 }, (_, i) => {
    const year = currentYear - i;
    return { value: year, label: year.toString() };
  });

  const sortOptions = [
    { value: 'name', label: 'Name' },
    { value: 'role', label: 'Role' },
    { value: 'memberId', label: 'Member ID' },
  ];

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const payload = {
        ...form,
        dateOfBirth: form.dateOfBirth || null,
        skills: form.skills?.map((s) => s.value) || [],
        career: form.career?.map((c) => c.value) || [],
        education: form.education?.map((e) => e.value) || [],
        educationalDepartment: form.educationalDepartment || "",
        passedOutYear: form.passedOutYear ? parseInt(form.passedOutYear) : null,
      };

      if (editingId) {
        await updateMember(editingId, payload);
        setEditingId(null);
        setFormOpen(false);
      } else {
        await createMember(payload);
      }

      handleClear();
      await fetchMembers();
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
      phone: "",
      role: "Associate",
      dateOfBirth: "",
      skills: [],
      career: [],
      education: [],
      educationalDepartment: "",
      passedOutYear: null,
    });
    setEditingId(null);
  };

  const handleEdit = (member) => {
    setForm({
      name: member.name || "",
      phone: member.phone || "",
      role: member.role || "Associate",
      dateOfBirth: member.dateOfBirth
        ? member.dateOfBirth.split("T")[0]
        : "",
      skills: member.skills
        ? member.skills.map((skill) => ({ value: skill, label: skill }))
        : [],
      career: member.career
        ? member.career.map((c) => ({ value: c, label: c }))
        : [],
      education: member.education
        ? member.education.map((e) => ({ value: e, label: e }))
        : [],
      educationalDepartment: member.educationalDepartment || "",
      passedOutYear: member.passedOutYear || null,
    });
    setEditingId(member._id);
    setFormOpen(true);

    setTimeout(() => {
      formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this member?")) return;
    setDeletingId(id);
    try {
      await deleteMember(id);
      await fetchMembers();
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
    if (e.target.value) {
      scrollToTop();
    }
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

  const handleAnalyticsToggle = () => {
    setAnalyticsOpen(!analyticsOpen);
    if (!analyticsOpen) {
      setTimeout(() => {
        analyticsRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }, 100);
    } else {
      scrollToTop();
    }
  };

  const handleAddMemberToggle = () => {
    setFormOpen(!formOpen);
    if (!formOpen) {
      setTimeout(() => {
        formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);
    } else {
      scrollToTop();
    }
  };

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const getSortedMembers = (membersToSort) => {
    if (!sortConfig.key) return membersToSort;

    return [...membersToSort].sort((a, b) => {
      let aValue = a[sortConfig.key];
      let bValue = b[sortConfig.key];

      if (aValue === null || aValue === undefined) aValue = '';
      if (bValue === null || bValue === undefined) bValue = '';

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      if (aValue < bValue) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
  };

  const filteredMembers = members.filter((member) => {
    const term = searchTerm.toLowerCase();

    const matchesSearch =
      member.name?.toLowerCase().includes(term) ||
      member.memberId?.toLowerCase().includes(term) ||
      member.career?.some((c) => String(c).toLowerCase().includes(term));

    const matchesRole = roleFilter ? member.role === roleFilter : true;

    const matchesSkills =
      skillFilter.length > 0
        ? skillFilter.every((selectedSkill) =>
            member.skills?.includes(selectedSkill.value)
          )
        : true;

    return matchesSearch && matchesRole && matchesSkills;
  });

  const sortedAndFilteredMembers = getSortedMembers(filteredMembers);

  const isFilterActive = roleFilter !== "" || skillFilter.length > 0;
  const isSortActive = sortConfig.key !== 'name' || sortConfig.direction !== 'asc';
  const isAnalyticsActive = analyticsOpen;
  const isSearchActive = searchTerm !== "";

  // Add this helper function near the top of your component, after the state declarations
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
    <div className="dashboard-fullpage" ref={formRef}>
      <div className="dashboard-container">
        {/* Sticky Header */}
        <div className="dashboard-header-sticky">
          <div className="dashboard-header-content">
            <h2 
              className="dashboard-title"
              onClick={scrollToTop}
            >
              Member Management
            </h2>
            <div className="header-actions">
              <button
                className={`action-btn analytics-btn ${analyticsOpen ? 'active' : ''} ${isAnalyticsActive ? 'used' : ''}`}
                onClick={handleAnalyticsToggle}
              >
                {analyticsOpen ? "Close Analytics" : "Analytics"}
              </button>
              
              <div className="search-wrapper">
                <input
                  ref={searchRef}
                  type="text"
                  placeholder="Search by name, ID, or career..."
                  value={searchTerm}
                  onChange={handleSearchChange}
                  className={`search-input ${isSearchActive ? 'active' : ''}`}
                />
              </div>

              <button
                ref={filterRef}
                className={`action-btn filter-btn ${filterOpen ? 'active' : ''} ${isFilterActive ? 'used' : ''}`}
                onClick={handleFilterToggle}
              >
                {filterOpen ? "Close Filters" : "Filter"}
                {isFilterActive && !filterOpen && <span className="active-indicator"></span>}
              </button>

              <button
                ref={sortRef}
                className={`action-btn sort-btn ${sortOpen ? 'active' : ''} ${isSortActive ? 'used' : ''}`}
                onClick={handleSortToggle}
              >
                Sort 
                {sortConfig.key && (
                  <span className="sort-label">
                    {sortOptions.find(opt => opt.value === sortConfig.key)?.label}
                  </span>
                )}
                {sortConfig.direction === 'asc' ? <FiArrowUp /> : <FiArrowDown />}
                {isSortActive && !sortOpen && <span className="active-indicator"></span>}
              </button>

              <button className="action-btn logout-btn" onClick={handleLogout}>
                Logout
              </button>
              
              <button
                className="action-btn add-btn"
                onClick={handleAddMemberToggle}
              >
                <FiUserPlus size={18} />
                {formOpen ? "Close Form" : "Add Member"}
              </button>
            </div>
          </div>
        </div>

        {/* Scrollable Content Area */}
        <div className="dashboard-content">
          {/* Analytics Section */}
          <div 
            ref={analyticsRef}
            className={`analytics-section ${analyticsOpen ? "visible" : ""}`}
          >
            <div className="analytics-scrollable">
              <MemberAnalytics members={members} />
            </div>
          </div>
          
          {/* Filter Section */}
          <div className={`filter-section ${filterOpen ? "visible" : ""}`}>
            <div className="filter-panel">
              <div className="filter-group">
                <label>Role</label>
                <Select
                  options={roleOptions}
                  value={roleOptions.find((r) => r.value === roleFilter) || null}
                  onChange={(selected) => setRoleFilter(selected ? selected.value : "")}
                  placeholder="Filter by role..."
                  isClearable
                  menuPortalTarget={document.body}
                  menuPosition="fixed"
                  styles={{
                    menuPortal: (base) => ({ ...base, zIndex: 9999 }),
                    control: (base) => ({ ...base, minHeight: '38px' })
                  }}
                />
              </div>

              <div className="filter-group">
                <label>Skills</label>
                <Select
                  options={skillOptions}
                  isMulti
                  value={skillFilter}
                  onChange={(selected) => setSkillFilter(selected || [])}
                  placeholder="Filter by skills..."
                  menuPortalTarget={document.body}
                  menuPosition="fixed"
                  styles={{
                    menuPortal: (base) => ({ ...base, zIndex: 9999 }),
                    control: (base) => ({ ...base, minHeight: '38px' })
                  }}
                />
              </div>

              <button
                className="clear-filters-btn"
                onClick={() => {
                  setRoleFilter("");
                  setSkillFilter([]);
                  setSearchTerm("");
                  scrollToTop();
                }}
              >
                Clear Filters
              </button>
            </div>
          </div>

          {/* Sort Section */}
          <div className={`sort-section ${sortOpen ? "visible" : ""}`}>
            <div className="sort-panel">
              <div className="sort-group">
                <label>Sort By</label>
                <div className="sort-options-grid">
                  {sortOptions.map((option) => (
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
                  setSortConfig({ key: 'name', direction: 'asc' });
                  setSortOpen(false);
                  scrollToTop();
                }}
              >
                Reset to Default
              </button>
            </div>
          </div>

          {/* Form Section */}
          <div className={`form-section-wrapper ${formOpen ? "visible" : ""}`}>
            <MemberForm
              form={form}
              setForm={setForm}
              handleSubmit={handleSubmit}
              loading={loading}
              editingId={editingId}
              handleClear={handleClear}
              skillOptions={skillOptions}
              careerOptions={careerOptions}
              educationOptions={educationOptions}
              departmentOptions={departmentOptions}
              passedOutYearOptions={passedOutYearOptions}
            />
          </div>

          {/* Results Summary */}
          <div className="results-summary">
            <span>Showing {sortedAndFilteredMembers.length} members</span>
            {sortConfig.key && (
              <span className="current-sort">
                Sorted by: {sortOptions.find(opt => opt.value === sortConfig.key)?.label} 
                ({sortConfig.direction === 'asc' ? 'Ascending' : 'Descending'})
              </span>
            )}
          </div>

          {/* Members Grid - SIMPLIFIED to show only role, name, ID, and career */}
          <div className="members-grid-container">
            {sortedAndFilteredMembers.length === 0 ? (
              <div className="no-members">No members found.</div>
            ) : (
              <div className="members-grid">
                {sortedAndFilteredMembers.map((member) => (
                  <Link
                    to={`/members/${member._id}`}
                    className={`member-simple-card role-${member.role?.replace(/\s+/g, "") || "Associate"}`}
                    key={member._id}
                  >
                    <div className="member-simple-content">
                      <div className="member-simple-role">{member.role}</div>
                      <h3 className="member-simple-name">{member.name}</h3>
                      <div className="member-simple-id">ID: {member.memberId || "Not assigned"}</div>
                      
                      {/* Age Display */}
                      {member.dateOfBirth && (
                        <div className="member-simple-age">
                          <span className="age-label">Age: </span>
                          <span className="age-value">{calculateAge(member.dateOfBirth)} years</span>
                        </div>
                      )}
                      
                      <div className="member-simple-career">
                        <span className="career-label">Career:</span>
                        {member.career?.length > 0 ? (
                          <span className="career-value">{member.career.join(", ")}</span>
                        ) : (
                          <span className="career-value none">None</span>
                        )}
                      </div>
                    </div>

                    <div className="member-simple-actions">
                      <button
                        className="edit-btn"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleEdit(member);
                        }}
                      >
                        Edit
                      </button>

                      <button
                        className="delete-btn"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleDelete(member._id);
                        }}
                        disabled={deletingId === member._id}
                      >
                        {deletingId === member._id ? "..." : "Delete"}
                      </button>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;