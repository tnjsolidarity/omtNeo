import { useEffect, useState } from "react";
import Select from "react-select";
import { FiX } from "react-icons/fi";
import DatePicker from "react-datepicker";
import { getMembers } from "../../services/memberService";
import "react-datepicker/dist/react-datepicker.css";
import "./IncomeForm.css";

function IncomeForm({ onSubmit, isLoading, initialData = null, onClose }) {
  const [incomeType, setIncomeType] = useState("Service");
  const [members, setMembers] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [useExistingMember, setUseExistingMember] = useState(true);
  const [useExistingSentTo, setUseExistingSentTo] = useState(true);
  const [useExistingPaymentSentTo, setUseExistingPaymentSentTo] = useState(true);
  const [form, setForm] = useState({
    date: "",
    description: "",
    memberId: null,
    nonMemberInfo: {
      name: "",
      contactNumber: "",
      description: ""
    },
    // Service fields
    serviceName: "",
    serviceValue: "",
    sentTo: "",
    sentToMemberId: null,
    sentToNonMemberInfo: {
      name: "",
      contactNumber: "",
      description: ""
    },
    // Money fields
    incomeName: "",
    donatingAmount: "",
    paymentSentTo: "",
    paymentSentToMemberId: null,
    paymentMode: "",
    paymentId: ""
  });

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const res = await getMembers();
        setMembers(res.data);
      } catch (err) {
        console.error("Error fetching members:", err);
      }
    };
    fetchMembers();
  }, []);

  useEffect(() => {
    if (initialData) {
      setIncomeType(initialData.incomeType || "Service");
      setUseExistingMember(!!initialData.memberId);
      setUseExistingSentTo(!!initialData.sentToMemberId);
      setUseExistingPaymentSentTo(!!initialData.paymentSentToMemberId);
      setForm({
        date: initialData.date ? initialData.date.split("T")[0] : "",
        description: initialData.description || "",
        memberId: initialData.memberId?._id 
          ? { value: initialData.memberId._id, label: initialData.memberId.name } 
          : null,
        nonMemberInfo: initialData.nonMemberInfo || {
          name: "",
          contactNumber: "",
          description: ""
        },
        serviceName: initialData.serviceName || "",
        serviceValue: initialData.serviceValue || "",
        sentTo: initialData.sentTo || "",
        sentToMemberId: initialData.sentToMemberId?._id 
          ? { value: initialData.sentToMemberId._id, label: initialData.sentToMemberId.name } 
          : null,
        sentToNonMemberInfo: initialData.sentToNonMemberInfo || {
          name: "",
          contactNumber: "",
          description: ""
        },
        incomeName: initialData.incomeName || "",
        donatingAmount: initialData.donatingAmount || "",
        paymentSentTo: initialData.paymentSentTo || "",
        paymentSentToMemberId: initialData.paymentSentToMemberId?._id 
          ? { value: initialData.paymentSentToMemberId._id, label: initialData.paymentSentToMemberId.name } 
          : null,
        paymentMode: initialData.paymentMode || "",
        paymentId: initialData.paymentId || ""
      });
    }
  }, [initialData]);

  const formatDateToDisplay = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString + "T00:00:00");
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

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

  const handleSentToMemberSelect = (selected) => {
    setForm(prev => ({
      ...prev,
      sentToMemberId: selected
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

  const handlePaymentSentToSelect = (selected) => {
    setForm(prev => ({
      ...prev,
      paymentSentToMemberId: selected,
      paymentSentTo: selected?.label || ""
    }));
  };

  const handleClear = () => {
    setIncomeType("Service");
    setUseExistingMember(true);
    setUseExistingSentTo(true);
    setUseExistingPaymentSentTo(true);
    setForm({
      date: "",
      description: "",
      memberId: null,
      nonMemberInfo: {
        name: "",
        contactNumber: "",
        description: ""
      },
      serviceName: "",
      serviceValue: "",
      sentTo: "",
      sentToMemberId: null,
      sentToNonMemberInfo: {
        name: "",
        contactNumber: "",
        description: ""
      },
      incomeName: "",
      donatingAmount: "",
      paymentSentTo: "",
      paymentSentToMemberId: null,
      paymentMode: "",
      paymentId: ""
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

    if (incomeType === 'Service') {
      if (!form.serviceName) {
        alert("Please enter service name");
        return;
      }
      if (!form.serviceValue) {
        alert("Please enter service value");
        return;
      }
      if (parseFloat(form.serviceValue) <= 0) {
        alert("Service value must be greater than 0");
        return;
      }
    } else {
      if (!form.incomeName) {
        alert("Please enter income name");
        return;
      }
      if (!form.donatingAmount) {
        alert("Please enter donating amount");
        return;
      }
      if (parseFloat(form.donatingAmount) <= 0) {
        alert("Donating amount must be greater than 0");
        return;
      }
    }

    const formData = {
      incomeType,
      date: form.date,
      description: form.description,
      memberId: useExistingMember ? form.memberId?.value : null,
      nonMemberInfo: !useExistingMember ? form.nonMemberInfo : {}
    };

    if (incomeType === 'Service') {
      formData.serviceName = form.serviceName;
      formData.serviceValue = parseFloat(form.serviceValue);
      formData.sentTo = form.sentTo;
      formData.sentToMemberId = useExistingSentTo ? form.sentToMemberId?.value : null;
      formData.sentToNonMemberInfo = !useExistingSentTo ? form.sentToNonMemberInfo : {};
    } else {
      formData.incomeName = form.incomeName;
      formData.donatingAmount = parseFloat(form.donatingAmount);
      formData.paymentSentTo = form.paymentSentTo;
      formData.paymentSentToMemberId = useExistingPaymentSentTo ? form.paymentSentToMemberId?.value : null;
      formData.paymentMode = form.paymentMode;
      formData.paymentId = form.paymentId;
    }

    onSubmit(formData);
  };

  const memberOptions = members.map(m => ({ value: m._id, label: m.name }));
  const paymentModeOptions = [
    { value: "Cash", label: "Cash" },
    { value: "Check", label: "Check" },
    { value: "Bank Transfer", label: "Bank Transfer" },
    { value: "Online", label: "Online" },
    { value: "Card", label: "Card" },
    { value: "Other", label: "Other" }
  ];

  return (
    <div className="income-form-container">
      <div className="form-header">
        <h3>{initialData ? 'Edit Income' : 'Add New Income'}</h3>
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
        {/* Income Type */}
        <div className="form-field">
          <label className="required">Income Type</label>
          <select
            value={incomeType}
            onChange={(e) => setIncomeType(e.target.value)}
            required
          >
            <option value="Service">Service</option>
            <option value="Money">Money</option>
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
            <label className="required">Income Donor / Provider</label>
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

        {/* Conditional fields based on incomeType */}
        {incomeType === 'Service' ? (
          <>
            <div className="form-field">
              <label className="required">Service Name</label>
              <input
                type="text"
                name="serviceName"
                value={form.serviceName}
                onChange={handleChange}
                required
                placeholder="Enter service name"
              />
            </div>
            <div className="form-field">
              <label className="required">Service Value (₹)</label>
              <input
                type="number"
                name="serviceValue"
                value={form.serviceValue}
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
                  checked={useExistingSentTo}
                  onChange={(e) => setUseExistingSentTo(e.target.checked)}
                />
                Service sent to – select from existing members
              </label>
            </div>

            {useExistingSentTo ? (
              <div className="form-field">
                <label>Service Sent To (Member)</label>
                <Select
                  options={memberOptions}
                  value={form.sentToMemberId}
                  onChange={handleSentToMemberSelect}
                  placeholder="Select a member..."
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
            ) : (
              <>
                <div className="form-field">
                  <label>Recipient Name</label>
                  <input
                    type="text"
                    name="name"
                    value={form.sentToNonMemberInfo.name}
                    onChange={handleSentToNonMemberChange}
                    placeholder="Full name"
                  />
                </div>
                <div className="form-field">
                  <label>Recipient Contact</label>
                  <input
                    type="tel"
                    name="contactNumber"
                    value={form.sentToNonMemberInfo.contactNumber}
                    onChange={handleSentToNonMemberChange}
                    placeholder="Phone number"
                  />
                </div>
                <div className="form-field">
                  <label>Recipient Description</label>
                  <textarea
                    name="description"
                    value={form.sentToNonMemberInfo.description}
                    onChange={handleSentToNonMemberChange}
                    rows="2"
                    placeholder="Additional info"
                  />
                </div>
              </>
            )}
          </>
        ) : (
          <>
            <div className="form-field">
              <label className="required">Income Name</label>
              <input
                type="text"
                name="incomeName"
                value={form.incomeName}
                onChange={handleChange}
                required
                placeholder="Enter income name"
              />
            </div>
            <div className="form-field">
              <label className="required">Donating Amount (₹)</label>
              <input
                type="number"
                name="donatingAmount"
                value={form.donatingAmount}
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
                  onChange={(e) => setUseExistingPaymentSentTo(e.target.checked)}
                />
                Payment sent to – select from existing members
              </label>
            </div>

            {useExistingPaymentSentTo ? (
              <div className="form-field">
                <label>Payment Sent To (Member)</label>
                <Select
                  options={memberOptions}
                  value={form.paymentSentToMemberId}
                  onChange={handlePaymentSentToSelect}
                  placeholder="Select a member..."
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
            ) : (
              <div className="form-field">
                <label>Payment Sent To</label>
                <input
                  type="text"
                  name="paymentSentTo"
                  value={form.paymentSentTo}
                  onChange={handleChange}
                  placeholder="Person or organisation"
                />
              </div>
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
            {isLoading ? "Processing..." : initialData ? "Update Income" : "Add Income"}
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

export default IncomeForm;