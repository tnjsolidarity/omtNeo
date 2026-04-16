import { useEffect, useState, useRef, useCallback } from "react";
import { FiPlus, FiTrendingDown, FiTrendingUp, FiChevronDown, FiLogOut, FiAlertTriangle } from "react-icons/fi";
import { Link, useLocation } from "react-router-dom";
import {
  getIncomes,
  getExpenses,
  getDues,
  getAccountsSummary,
  createIncome,
  updateIncome,
  deleteIncome,
  createExpense,
  updateExpense,
  deleteExpense,
  createDue,
  updateDue,
  deleteDue,
} from "../../services/accountsService";
import "../../styles/AccountsDashboard.css";
import IncomeForm from "../../components/forms/IncomeForm";
import ExpenseForm from "../../components/forms/ExpenseForm";
import DueForm from "../../components/forms/DueForm";
import AccountsCard from "../../components/cards/AccountsCard";

// ─── nav items shared across dashboards ───────────────────────────────────────
const NAV_ITEMS = [
  { label: "Member Dashboard",     to: "/memberdashboard" },
  { label: "Project Dashboard",    to: "/projectdashboard" },
  { label: "Attendance Dashboard", to: "/attendancedashboard" },
];

function AccountsDashboard() {
  const location = useLocation();

  // ── dropdown ──────────────────────────────────────────────────────────────
  const [navOpen, setNavOpen] = useState(false);
  const dropdownRef = useRef(null);

  // ── data ──────────────────────────────────────────────────────────────────
  const [activeTab, setActiveTab]   = useState("income");
  const [incomes,   setIncomes]     = useState([]);
  const [expenses,  setExpenses]    = useState([]);
  const [dues,      setDues]        = useState([]);
  const [summary,   setSummary]     = useState({
    totalIncome: 0, totalServices: 0,
    totalExpenses: 0, totalDue: 0,
    totalDueSettled: 0, totalDuePending: 0,
  });

  // ── ui state ──────────────────────────────────────────────────────────────
  const [loading,    setLoading]    = useState(false);
  const [formOpen,   setFormOpen]   = useState(false);
  const [editingId,  setEditingId]  = useState(null);

  // ── inline delete confirmation (replaces window.confirm) ──────────────────
  const [confirmDelete, setConfirmDelete] = useState(null); // { id, type }

  // ── scroll ref: scroll the content pane, not window ───────────────────────
  const contentRef = useRef(null);

  // ─────────────────────────────────────────────────────────────────────────
  // Data fetching
  // ─────────────────────────────────────────────────────────────────────────
  const fetchAllData = useCallback(async () => {
    try {
      const [incomesRes, expensesRes, duesRes, summaryRes] = await Promise.all([
        getIncomes(),
        getExpenses(),
        getDues(),
        getAccountsSummary(),
      ]);
      setIncomes(incomesRes.data);
      setExpenses(expensesRes.data);
      setDues(duesRes.data);
      setSummary(summaryRes.data);
    } catch (err) {
      console.error("Error fetching data:", err);
    }
  }, []);

  useEffect(() => { fetchAllData(); }, [fetchAllData]);

  // ─────────────────────────────────────────────────────────────────────────
  // Close nav dropdown on outside click
  // ─────────────────────────────────────────────────────────────────────────
  useEffect(() => {
    function handleOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setNavOpen(false);
      }
    }
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, []);

  // ─────────────────────────────────────────────────────────────────────────
  // CRUD handlers (deduplicated with a type map)
  // ─────────────────────────────────────────────────────────────────────────
  const submitMap = { income: createIncome,  expense: createExpense,  due: createDue  };
  const updateMap = { income: updateIncome,  expense: updateExpense,  due: updateDue  };
  const deleteMap = { income: deleteIncome,  expense: deleteExpense,  due: deleteDue  };

  const handleSubmit = async (formData) => {
    setLoading(true);
    try {
      if (editingId) {
        await updateMap[activeTab](editingId, formData);
      } else {
        await submitMap[activeTab](formData);
      }
      setEditingId(null);
      setFormOpen(false);
      await fetchAllData();
    } catch (err) {
      console.error(err);
      alert("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (item) => {
    setEditingId(item._id);
    setFormOpen(true);
    // scroll the content pane, not window
    contentRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Step 1: card calls this → show inline confirm
  const requestDelete = (id, type) => setConfirmDelete({ id, type });

  // Step 2: user confirms → execute delete
  const executeDelete = async () => {
    if (!confirmDelete) return;
    const { id, type } = confirmDelete;
    setConfirmDelete(null);
    try {
      await deleteMap[type](id);
      await fetchAllData();
    } catch (err) {
      console.error(err);
      alert("Delete failed");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/";
  };

  // ─────────────────────────────────────────────────────────────────────────
  // Derived display values
  // ─────────────────────────────────────────────────────────────────────────
  const currentLabel = NAV_ITEMS.find((n) => n.to === location.pathname)?.label ?? "Accounts Dashboard";

  const tabs = [
    { key: "income",  label: "Income",  Icon: FiTrendingUp,   count: incomes.length  },
    { key: "expense", label: "Expense", Icon: FiTrendingDown, count: expenses.length },
    { key: "due",     label: "Due",     Icon: null, iconText: "₹", count: dues.length     },
  ];

  const recordMap = { income: incomes, expense: expenses, due: dues };
  const activeRecords = recordMap[activeTab];

  const currentBalance = (summary.totalIncome + summary.totalServices + summary.totalDuePending) - summary.totalExpenses;

  const summaryCards = [
    {
      key: "balance",
      label: "Current Balance",
      amount: currentBalance,
      sub: `Income ₹${(summary.totalIncome + summary.totalServices).toLocaleString("en-IN")} · Due ₹${summary.totalDuePending.toLocaleString("en-IN")} · Expense ₹${summary.totalExpenses.toLocaleString("en-IN")}`,
      Icon: null,
      iconText: "₹",
      mod: currentBalance >= 0 ? "income" : "expense",
    },
    {
      key: "income",
      label: "Total Income",
      amount: summary.totalIncome,
      sub: `${incomes.filter((i) => i.incomeType === "Money").length} transactions`,
      Icon: FiTrendingUp,
      mod: "income",
    },
    {
      key: "services",
      label: "Sponsors (Services)",
      amount: summary.totalServices,
      sub: `${incomes.filter((i) => i.incomeType === "Service").length} services`,
      Icon: null,
      iconText: "₹",
      mod: "sponsor",
    },
    {
      key: "expenses",
      label: "Total Expense",
      amount: summary.totalExpenses,
      sub: `${expenses.length} transactions`,
      Icon: FiTrendingDown,
      mod: "expense",
    },
    {
      key: "due",
      label: "Total Due",
      amount: summary.totalDue,
      sub: `Settled ₹${summary.totalDueSettled.toLocaleString("en-IN")} · Pending ₹${summary.totalDuePending.toLocaleString("en-IN")}`,
      Icon: null,
      iconText: "₹",
      mod: "due",
    },
  ];

  // ─────────────────────────────────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="accounts-fullpage">
      <div className="accounts-container">

        {/* ── Sticky header ─────────────────────────────────────────────── */}
        <header className="accounts-header">
          <div className="accounts-header-inner">

            {/* Nav dropdown */}
            <div className="nav-dropdown" ref={dropdownRef}>
              <button
                className="nav-dropdown-toggle"
                onClick={() => setNavOpen((v) => !v)}
                aria-haspopup="listbox"
                aria-expanded={navOpen}
              >
                <span className="nav-dropdown-label">{currentLabel}</span>
                <FiChevronDown className={`nav-dropdown-chevron ${navOpen ? "open" : ""}`} />
              </button>

              {navOpen && (
                <ul className="nav-dropdown-menu" role="listbox">
                  {NAV_ITEMS.map((item) => (
                    <li key={item.to} role="option" aria-selected={location.pathname === item.to}>
                      <Link
                        to={item.to}
                        className={`nav-dropdown-item ${location.pathname === item.to ? "active" : ""}`}
                        onClick={() => setNavOpen(false)}
                      >
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Header actions */}
            <div className="accounts-header-actions">
              <button
                className="btn btn-primary"
                onClick={() => { setFormOpen((v) => !v); setEditingId(null); }}
              >
                <FiPlus size={16} aria-hidden="true" />
                {formOpen
                  ? "Close Form"
                  : `Add ${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}`}
              </button>

              <button className="btn btn-danger" onClick={handleLogout} aria-label="Log out">
                <FiLogOut size={16} aria-hidden="true" />
                Logout
              </button>
            </div>
          </div>
        </header>

        {/* ── Scrollable content ────────────────────────────────────────── */}
        <main className="accounts-content" ref={contentRef}>

          {/* Summary strip */}
          <section className="summary-strip" aria-label="Financial summary">
            {summaryCards.map(({ key, label, amount, sub, Icon, iconText, mod }) => (
              <div key={key} className={`summary-card summary-card--${mod}`}>
                <span className="summary-card__icon" aria-hidden="true">
                  {Icon ? <Icon size={22} /> : <span style={{ fontSize: '24px' }}>{iconText}</span>}
                </span>
                <div className="summary-card__body">
                  <p className="summary-card__label">{label}</p>
                  <p className="summary-card__amount">
                    ₹{amount.toLocaleString("en-IN")}
                  </p>
                  <p className="summary-card__sub">{sub}</p>
                </div>
              </div>
            ))}
          </section>

          {/* Tab bar */}
          <nav className="tab-bar" aria-label="Record type tabs">
            {tabs.map(({ key, label, Icon, iconText, count }) => (
              <button
                key={key}
                role="tab"
                aria-selected={activeTab === key}
                className={`tab-btn ${activeTab === key ? "tab-btn--active" : ""}`}
                onClick={() => { setActiveTab(key); setFormOpen(false); setEditingId(null); }}
              >
                {Icon ? <Icon size={15} aria-hidden="true" /> : <span style={{ fontSize: '16px' }} aria-hidden="true">{iconText}</span>}
                {label}
                <span className="tab-btn__count">{count}</span>
              </button>
            ))}
          </nav>

          {/* Records grid */}
          <section className="records-section">
            <h2 className="records-title">
              {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Records
            </h2>

            {activeRecords.length === 0 ? (
              <div className="empty-state" role="status">
                <p>No {activeTab} records yet — add one using the button above.</p>
              </div>
            ) : (
              <div className="records-grid">
                {activeRecords.map((item) => (
                  <AccountsCard
                    key={item._id}
                    item={item}
                    type={activeTab}
                    onEdit={handleEdit}
                    onDelete={() => requestDelete(item._id, activeTab)}
                    isDeleting={false}
                  />
                ))}
              </div>
            )}
          </section>
        </main>

        {/* ── Form modal (in-flow overlay, no position:fixed) ───────────── */}
        {formOpen && (
            <div
                className="modal-backdrop"
                role="dialog"
                aria-modal="true"
                aria-label={`${editingId ? "Edit" : "Add"} ${activeTab}`}
                onClick={(e) => { 
                if (e.target === e.currentTarget) { 
                    setFormOpen(false); 
                    setEditingId(null); 
                } 
                }}
            >
                <div className="modal-box">
                {activeTab === "income" && (
                    <IncomeForm
                    onSubmit={handleSubmit}
                    isLoading={loading}
                    initialData={editingId ? incomes.find((i) => i._id === editingId) : null}
                    onClose={() => { setFormOpen(false); setEditingId(null); }}
                    />
                )}
                {activeTab === "expense" && (
                    <ExpenseForm
                    onSubmit={handleSubmit}
                    isLoading={loading}
                    initialData={editingId ? expenses.find((e) => e._id === editingId) : null}
                    onClose={() => { setFormOpen(false); setEditingId(null); }}
                    />
                )}
                {activeTab === "due" && (
                    <DueForm
                    onSubmit={handleSubmit}
                    isLoading={loading}
                    initialData={editingId ? dues.find((d) => d._id === editingId) : null}
                    onClose={() => { setFormOpen(false); setEditingId(null); }}
                    />
                )}
                </div>
            </div>
            )}

        {/* ── Inline delete confirmation (replaces window.confirm) ──────── */}
        {confirmDelete && (
          <div
            className="modal-backdrop"
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="confirm-title"
            aria-describedby="confirm-desc"
          >
            <div className="confirm-box">
              <span className="confirm-box__icon" aria-hidden="true">
                <FiAlertTriangle size={28} />
              </span>
              <h3 id="confirm-title" className="confirm-box__title">
                Delete {confirmDelete.type}?
              </h3>
              <p id="confirm-desc" className="confirm-box__desc">
                This action cannot be undone.
              </p>
              <div className="confirm-box__actions">
                <button
                  className="btn btn-ghost"
                  onClick={() => setConfirmDelete(null)}
                >
                  Cancel
                </button>
                <button className="btn btn-danger" onClick={executeDelete}>
                  Yes, delete
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

export default AccountsDashboard;
