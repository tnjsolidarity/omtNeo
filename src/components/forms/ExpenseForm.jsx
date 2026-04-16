import { useEffect, useState } from "react";
import Select from "react-select";
import { FiX } from "react-icons/fi";
import DatePicker from "react-datepicker";
import { getMembers } from "../../services/memberService";
import { getProjects } from "../../services/projectService";
import { getDues } from "../../services/accountsService";
import "react-datepicker/dist/react-datepicker.css";
import "./ExpenseForm.css";

function ExpenseForm({ onSubmit, isLoading, initialData = null, onClose }) {
  const [expenseType, setExpenseType] = useState("General");
  const [members, setMembers] = useState([]);
  const [projects, setProjects] = useState([]);
  const [dues, setDues] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [useExistingMember, setUseExistingMember] = useState(true);
  const [useExistingPaymentSentTo, setUseExistingPaymentSentTo] = useState(true);
  const [form, setForm] = useState({
    date: "",
    description: "",
    paymentSentTo: "",
    paymentSentToMemberId: null,
    paymentSentToNonMemberInfo: {
      name: "",
      contactNumber: "",
      description: ""
    },
    paymentMode: "",
    paymentId: "",
    memberId: null,
    nonMemberInfo: {
      name: "",
      contactNumber: "",
      description: ""
    },
    expenseName: "",
    expenseAmount: "",
    projectId: null,
    activityId: null,
    eventId: null,
    taskId: null,
    dueId: null,
    duePaymentAmount: ""
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [membersRes, projectsRes, duesRes] = await Promise.all([
          getMembers(),
          getProjects(),
          getDues()
        ]);
        setMembers(membersRes.data);
        setProjects(projectsRes.data);
        setDues(duesRes.data);
      } catch (err) {
        console.error("Error fetching data:", err);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (initialData) {
      setExpenseType(initialData.expenseType || "General");
      setUseExistingMember(!!initialData.memberId);
      setUseExistingPaymentSentTo(!!initialData.paymentSentToMemberId);
      setForm({
        date: initialData.date ? initialData.date.split("T")[0] : "",
        description: initialData.description || "",
        paymentSentTo: initialData.paymentSentTo || "",
        paymentSentToMemberId: initialData.paymentSentToMemberId?._id 
          ? { value: initialData.paymentSentToMemberId._id, label: initialData.paymentSentToMemberId.name } 
          : null,
        paymentSentToNonMemberInfo: initialData.paymentSentToNonMemberInfo || {
          name: "",
          contactNumber: "",
          description: ""
        },
        paymentMode: initialData.paymentMode || "",
        paymentId: initialData.paymentId || "",
        memberId: initialData.memberId?._id 
          ? { value: initialData.memberId._id, label: initialData.memberId.name } 
          : null,
        nonMemberInfo: initialData.nonMemberInfo || {
          name: "",
          contactNumber: "",
          description: ""
        },
        expenseName: initialData.expenseName || "",
        expenseAmount: initialData.expenseAmount || "",
        projectId: initialData.projectId?._id 
          ? { value: initialData.projectId._id, label: initialData.projectId.name } 
          : null,
        activityId: initialData.activityId || null,
        eventId: initialData.eventId || null,
        taskId: initialData.taskId || null,
        dueId: initialData.dueId?._id 
          ? { value: initialData.dueId._id, label: initialData.dueId.dueName } 
          : null,
        duePaymentAmount: initialData.duePaymentAmount || ""
      });
    }
  }, [initialData]);

  const [displayDate, setDisplayDate] = useState("");

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

  const handlePaymentSentToSelect = (selected) => {
    setForm(prev => ({
      ...prev,
      paymentSentToMemberId: selected,
      paymentSentTo: selected?.label || ""
    }));
  };

  const handlePaymentSentToNonMemberChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({
      ...prev,
      paymentSentToNonMemberInfo: {
        ...prev.paymentSentToNonMemberInfo,
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

  const handleDueSelect = (selected) => {
    setForm(prev => ({
      ...prev,
      dueId: selected,
      duePaymentAmount: "" // Reset payment amount when due changes
    }));
  };

  const handleClear = () => {
    setExpenseType("General");
    setUseExistingMember(true);
    setForm({
      date: "",
      description: "",
      paymentSentTo: "",
      paymentSentToMemberId: null,
      paymentSentToNonMemberInfo: {
        name: "",
        contactNumber: "",
        description: ""
      },
      paymentMode: "",
      paymentId: "",
      memberId: null,
      nonMemberInfo: {
        name: "",
        contactNumber: "",
        description: ""
      },
      expenseName: "",
      expenseAmount: "",
      projectId: null,
      activityId: null,
      eventId: null,
      taskId: null,
      dueId: null,
      duePaymentAmount: ""
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validation
    if (!form.date) {
      alert("Please select date");
      return;
    }
    
    if (useExistingMember && !form.memberId) {
      alert("Please select a member or uncheck 'Select from existing members'");
      return;
    }
    
    if (!useExistingMember && !form.nonMemberInfo.name) {
      alert("Please enter non-member name");
      return;
    }

    if (expenseType === 'Due') {
      if (!form.dueId) {
        alert("Please select a due");
        return;
      }
      if (!form.duePaymentAmount) {
        alert("Please enter amount to settle");
        return;
      }
      const pendingAmount = getPendingAmount();
      if (parseFloat(form.duePaymentAmount) > pendingAmount) {
        alert(`Payment amount cannot exceed pending amount of ₹${pendingAmount.toLocaleString('en-IN')}`);
        return;
      }
      if (parseFloat(form.duePaymentAmount) <= 0) {
        alert("Payment amount must be greater than 0");
        return;
      }
    } else {
      if (!form.expenseName) {
        alert("Please enter expense name");
        return;
      }
      if (!form.expenseAmount) {
        alert("Please enter expense amount");
        return;
      }
      if (parseFloat(form.expenseAmount) <= 0) {
        alert("Expense amount must be greater than 0");
        return;
      }
      
      if (expenseType === 'Project' && !form.projectId) {
        alert("Please select a project");
        return;
      }
    }

    const formData = {
      expenseType,
      date: form.date,
      description: form.description,
      paymentSentTo: form.paymentSentTo,
      paymentSentToMemberId: useExistingPaymentSentTo ? form.paymentSentToMemberId?.value : null,
      paymentSentToNonMemberInfo: !useExistingPaymentSentTo ? form.paymentSentToNonMemberInfo : {},
      paymentMode: form.paymentMode,
      paymentId: form.paymentId,
      memberId: useExistingMember ? form.memberId?.value : null,
      nonMemberInfo: !useExistingMember ? form.nonMemberInfo : {}
    };

    if (expenseType === 'Due') {
      formData.dueId = form.dueId?.value;
      formData.duePaymentAmount = parseFloat(form.duePaymentAmount);
    } else {
      formData.expenseName = form.expenseName;
      formData.expenseAmount = parseFloat(form.expenseAmount);
      
      if (expenseType === 'Project') {
        formData.projectId = form.projectId?.value;
        formData.activityId = form.activityId?.value || null;
        formData.eventId = form.eventId?.value || null;
        formData.taskId = form.taskId?.value || null;
      }
    }

    onSubmit(formData);
  };

  const getPendingAmount = () => {
    if (!form.dueId) return 0;
    const selectedDue = dues.find(d => d._id === form.dueId.value);
    if (!selectedDue) return 0;
    return (selectedDue.totalDueAmount || 0) - (selectedDue.settledAmount || 0);
  };

  const memberOptions = members.map(m => ({ value: m._id, label: m.name }));
  const projectOptions = projects.map(p => ({ value: p._id, label: p.name }));
  const dueOptions = dues
    .filter(d => d.dueStatus !== 'FullySettled')
    .map(d => ({ 
      value: d._id, 
      label: `${d.dueName} - ₹${((d.totalDueAmount || 0) - (d.settledAmount || 0)).toLocaleString('en-IN')} pending`
    }));
  
  const paymentModeOptions = [
    { value: "Cash", label: "Cash" },
    { value: "Check", label: "Check" },
    { value: "Bank Transfer", label: "Bank Transfer" },
    { value: "Online", label: "Online" },
    { value: "Card", label: "Card" },
    { value: "Other", label: "Other" }
  ];

  const selectedDue = dues.find(d => d._id === form.dueId?.value);
  const pendingAmount = getPendingAmount();

  return (
    <div className="expense-form-container">
      <div className="form-header">
        <h3>{initialData ? 'Edit Expense' : 'Add New Expense'}</h3>
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
        {/* Expense Type */}
        <div className="form-field">
          <label className="required">Expense Type</label>
          <select
            value={expenseType}
            onChange={(e) => setExpenseType(e.target.value)}
            required
          >
            <option value="General">General</option>
            <option value="Project">Project</option>
            <option value="Due">Due</option>
          </select>
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

        {/* Member / Non-member toggle */}
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
            <label className="required">Member Who Did This Expense</label>
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

        {/* Conditional fields based on expenseType */}
        {expenseType === 'Due' ? (
          <>
            <div className="form-field">
              <label className="required">Select Due</label>
              <Select
                options={dueOptions}
                value={form.dueId}
                onChange={handleDueSelect}
                placeholder="Select a due..."
                menuPortalTarget={document.body}
                className="react-select-container"
                classNamePrefix="react-select"
                styles={{
                  menuPortal: (base) => ({ ...base, zIndex: 9999 }),
                  control: (base) => ({ ...base, minHeight: '40px' })
                }}
              />
            </div>
            
            {selectedDue && (
              <>
                <div className="form-field">
                  <div className="due-info-card">
                    <div className="due-info-row">
                      <span>Total Due:</span>
                      <strong>₹{selectedDue.totalDueAmount?.toLocaleString('en-IN') || 0}</strong>
                    </div>
                    <div className="due-info-row">
                      <span>Settled Amount:</span>
                      <strong>₹{selectedDue.settledAmount?.toLocaleString('en-IN') || 0}</strong>
                    </div>
                    <div className="due-info-row">
                      <span>Pending Amount:</span>
                      <strong className="pending-amount">
                        ₹{pendingAmount.toLocaleString('en-IN')}
                      </strong>
                    </div>
                  </div>
                </div>
                
                <div className="form-field">
                  <label className="required">Amount to Settle (₹)</label>
                  <input
                    type="number"
                    name="duePaymentAmount"
                    value={form.duePaymentAmount}
                    onChange={handleChange}
                    required
                    step="0.01"
                    min="0"
                    max={pendingAmount}
                    placeholder={`Max: ₹${pendingAmount.toLocaleString('en-IN')}`}
                  />
                  {pendingAmount > 0 && (
                    <small style={{ color: '#6c757d', marginTop: '4px' }}>
                      Maximum amount: ₹{pendingAmount.toLocaleString('en-IN')}
                    </small>
                  )}
                </div>
              </>
            )}
          </>
        ) : (
          <>
            {expenseType === 'Project' && (
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
            
            <div className="form-field">
              <label className="required">Expense Name</label>
              <input
                type="text"
                name="expenseName"
                value={form.expenseName}
                onChange={handleChange}
                required
                placeholder="Enter expense name"
              />
            </div>
            
            <div className="form-field">
              <label className="required">Expense Amount (₹)</label>
              <input
                type="number"
                name="expenseAmount"
                value={form.expenseAmount}
                onChange={handleChange}
                required
                step="0.01"
                min="0"
                placeholder="Enter amount"
              />
            </div>
            
            <div className="form-field">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={useExistingPaymentSentTo}
                  onChange={(e) => {
                    const checked = e.target.checked;
                    setUseExistingPaymentSentTo(checked);
                    if (!checked) {
                      setForm(prev => ({ ...prev, paymentSentToMemberId: null, paymentSentTo: "" }));
                    } else {
                      setForm(prev => ({ ...prev, paymentSentTo: "" }));
                    }
                  }}
                />
                Select payment recipient from existing members
              </label>
            </div>
            {useExistingPaymentSentTo ? (
              <div className="form-field">
                <label className="required">Payment Sent To</label>
                <Select
                  options={memberOptions}
                  value={form.paymentSentToMemberId}
                  onChange={handlePaymentSentToSelect}
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
                    value={form.paymentSentToNonMemberInfo?.name || ""}
                    onChange={handlePaymentSentToNonMemberChange}
                    placeholder="Full name"
                  />
                </div>
                <div className="form-field">
                  <label>Recipient Contact</label>
                  <input
                    type="tel"
                    name="contactNumber"
                    value={form.paymentSentToNonMemberInfo?.contactNumber || ""}
                    onChange={handlePaymentSentToNonMemberChange}
                    placeholder="Phone number"
                  />
                </div>
                <div className="form-field">
                  <label>Recipient Description</label>
                  <textarea
                    name="description"
                    value={form.paymentSentToNonMemberInfo?.description || ""}
                    onChange={handlePaymentSentToNonMemberChange}
                    rows="2"
                    placeholder="Additional info"
                  />
                </div>
              </>
            )}

            <div className="form-field">
              <label>Payment Mode</label>
              <Select
                options={paymentModeOptions}
                value={paymentModeOptions.find(opt => opt.value === form.paymentMode) || null}
                onChange={(selected) => setForm(prev => ({ ...prev, paymentMode: selected?.value }))}
                placeholder="Select payment mode..."
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
              <label>Payment ID / Reference</label>
              <input
                type="text"
                name="paymentId"
                value={form.paymentId}
                onChange={handleChange}
                placeholder="Cheque number, transaction ID, etc."
              />
            </div>
          </>
        )}

        {/* Buttons */}
        <div className="form-buttons">
          <button
            type="submit"
            className="primary-btn"
            disabled={isLoading}
          >
            {isLoading ? "Processing..." : initialData ? "Update Expense" : "Add Expense"}
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

export default ExpenseForm;