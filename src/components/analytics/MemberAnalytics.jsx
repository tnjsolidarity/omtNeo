import React, { useMemo } from "react";
import "./MemberAnalytics.css";
import { FiUsers, FiCheckCircle } from "react-icons/fi";
import {
  PieChart, Pie, Cell,
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend
} from 'recharts';

// Custom tooltip for recharts
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="custom-tooltip">
        <p className="label">{label || payload[0].name}</p>
        <p className="value">
          <span
            className="tooltip-dot"
            style={{ backgroundColor: payload[0].color || payload[0].payload.fill }}
          ></span>
          Count: {payload[0].value}
        </p>
      </div>
    );
  }
  return null;
};

const CHART_COLORS = ['#3f51b5', '#00bcd4', '#4caf50', '#ff9800', '#e91e63', '#9c27b0', '#f44336', '#607d8b'];

function MemberAnalytics({ members }) {
  const totalMembers = members.length;

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

  const {
    roleData,
    ageData,
    topSkills,
    topCareers,
    educationData,
    departmentData,
    avgCompletion
  } = useMemo(() => {
    if (totalMembers === 0) return {};

    const roleCounts = {};
    const ageCounts = { "Under 20": 0, "20-30": 0, "31-40": 0, "41-50": 0, "50+": 0 };
    const skillCounts = {};
    const careerCounts = {};
    const eduCounts = {};
    const deptCounts = {};

    let totalCompletion = 0;

    members.forEach((member) => {
      // 1. Role Count
      const role = member.role || "Unknown";
      roleCounts[role] = (roleCounts[role] || 0) + 1;

      // 2. Age Demographics
      if (member.dateOfBirth) {
        const age = calculateAge(member.dateOfBirth);
        if (age < 20) ageCounts["Under 20"]++;
        else if (age <= 30) ageCounts["20-30"]++;
        else if (age <= 40) ageCounts["31-40"]++;
        else if (age <= 50) ageCounts["41-50"]++;
        else ageCounts["50+"]++;
      }

      // 3. Skills & Careers
      if (member.skills && Array.isArray(member.skills)) {
        member.skills.forEach(s => skillCounts[s] = (skillCounts[s] || 0) + 1);
      }
      if (member.career && Array.isArray(member.career)) {
        member.career.forEach(c => careerCounts[c] = (careerCounts[c] || 0) + 1);
      }

      // 4. Education & Department
      if (member.education && Array.isArray(member.education)) {
        member.education.forEach(e => eduCounts[e] = (eduCounts[e] || 0) + 1);
      }
      if (member.educationalDepartment) {
        const dept = member.educationalDepartment;
        deptCounts[dept] = (deptCounts[dept] || 0) + 1;
      }

      // 5. Profile Completion %
      let filledFields = 0;
      const keyFields = [member.photoUrl, member.phone, member.dateOfBirth, member.educationalDepartment];
      keyFields.forEach(f => { if (f) filledFields++; });
      if (member.education?.length) filledFields++;
      if (member.career?.length) filledFields++;

      const memberCompletion = (filledFields / 6) * 100;
      totalCompletion += memberCompletion;
    });

    // Format Data for Recharts
    const formatPieData = (dict) => Object.keys(dict).map(k => ({ name: k, value: dict[k] })).filter(d => d.value > 0);
    const formatBarData = (dict) => Object.keys(dict).map(k => ({ name: k, value: dict[k] })).sort((a, b) => b.value - a.value).slice(0, 5);

    return {
      roleData: formatPieData(roleCounts),
      ageData: Object.keys(ageCounts).map(k => ({ name: k, value: ageCounts[k] })).filter(d => d.value > 0),
      topSkills: formatBarData(skillCounts),
      topCareers: formatBarData(careerCounts),
      educationData: formatPieData(eduCounts),
      departmentData: formatPieData(deptCounts),
      avgCompletion: (totalCompletion / totalMembers).toFixed(0)
    };
  }, [members, totalMembers]);

  if (totalMembers === 0) {
    return (
      <div className="analytics-inner-container">
        <div className="analytics-empty-state">
          <FiUsers size={48} color="#bdc3c7" />
          <p>Not enough members data available for analytics yet.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="analytics-inner-container">
      <div className="bento-grid">

        {/* KPI: Total Members */}
        <div className="bento-item bento-kpi primary-kpi">
          <div className="kpi-wrapper">
            <p className="kpi-value">{totalMembers}</p>
            <div className="kpi-label">
              <FiUsers /> Total Members
            </div>
          </div>
        </div>

        {/* KPI: Profile Completion */}
        <div className="bento-item bento-kpi secondary-kpi">
          <div className="kpi-wrapper">
            <p className="kpi-value">{avgCompletion}%</p>
            <div className="kpi-label">
              <FiCheckCircle /> Avg. Profile Completion
            </div>
          </div>
        </div>

        {/* Chart: Role Distribution */}
        <div className="bento-item bento-chart">
          <div className="bento-header">
            <h3>Role Distribution</h3>
          </div>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={roleData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {roleData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend verticalAlign="bottom" height={36} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart: Age Demographics */}
        <div className="bento-item bento-chart">
          <div className="bento-header">
            <h3>Age Demographics</h3>
          </div>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={ageData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e0e4ea" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(63, 81, 181, 0.05)' }} />
                <Bar dataKey="value" fill="#00bcd4" radius={[4, 4, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart: Top Skills */}
        <div className="bento-item bento-chart">
          <div className="bento-header">
            <h3>Top 5 Skills</h3>
          </div>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={topSkills} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e0e4ea" />
                <XAxis type="number" axisLine={false} tickLine={false} />
                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} width={80} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(63, 81, 181, 0.05)' }} />
                <Bar dataKey="value" fill="#3f51b5" radius={[0, 4, 4, 0]} barSize={24} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart: Top Careers */}
        <div className="bento-item bento-chart">
          <div className="bento-header">
            <h3>Top 5 Careers</h3>
          </div>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={topCareers} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e0e4ea" />
                <XAxis type="number" axisLine={false} tickLine={false} />
                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} width={80} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(63, 81, 181, 0.05)' }} />
                <Bar dataKey="value" fill="#ff9800" radius={[0, 4, 4, 0]} barSize={24} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart: Education Breakdown */}
        <div className="bento-item bento-chart">
          <div className="bento-header">
            <h3>Education Level Breakdown</h3>
          </div>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={educationData}
                  cx="50%"
                  cy="50%"
                  outerRadius={90}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {educationData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={CHART_COLORS[(index + 2) % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart: Education Department */}
        <div className="bento-item bento-chart">
          <div className="bento-header">
            <h3>Educational Departments</h3>
          </div>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={departmentData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {departmentData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={CHART_COLORS[(index + 4) % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend verticalAlign="bottom" height={36} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </div>
  );
}

export default MemberAnalytics;