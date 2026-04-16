import React from "react";
import { FiTrash2, FiEdit2, FiCalendar, FiUser, FiCreditCard, FiHash } from "react-icons/fi";
import "./AccountsCard.css";

function AccountsCard({ item, type, onEdit, onDelete, isDeleting }) {
  const formatDate = (dateString) => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Type and amount mapping
  const getAmount = () => {
    if (type === 'income') {
      return item.incomeType === 'Service' ? item.serviceValue : item.donatingAmount;
    }
    if (type === 'expense') {
      return item.expenseType === 'Due' ? item.duePaymentAmount : item.expenseAmount;
    }
    if (type === 'due') {
      return item.totalDueAmount;
    }
    return 0;
  };

  const getPendingAmount = () => {
    if (type === 'due') {
      return item.totalDueAmount - (item.settledAmount || 0);
    }
    return 0;
  };

  const amount = getAmount();
  const pendingAmount = getPendingAmount();

  // Type-specific class names
  const getCardTypeClass = () => {
    switch(type) {
      case 'income': return 'card-income';
      case 'expense': return 'card-expense';
      case 'due': return 'card-due';
      default: return '';
    }
  };

  // Status mapping for due
  const getStatusClass = (status) => {
    const statusMap = {
      'Pending': 'status-pending',
      'PartiallySettled': 'status-partially',
      'FullySettled': 'status-fully',
      'Overdue': 'status-overdue'
    };
    return statusMap[status] || 'status-pending';
  };

  // Get color for amount based on type
  const getAmountColor = () => {
    switch(type) {
      case 'income': return '#10b981';
      case 'expense': return '#ef4444';
      case 'due': return '#f59e0b';
      default: return '#3b82f6';
    }
  };

  const handleCardClick = (e) => {
    if (e.target.closest('.edit-btn') || e.target.closest('.delete-btn')) {
      return;
    }
    // You can add navigation or other click handlers here
  };

  const getInchargeOrMember = () => {
    if (type === 'income') {
      return item.memberId?.name || item.nonMemberInfo?.name || 'N/A';
    }
    if (type === 'expense') {
      return item.memberId?.name || item.nonMemberInfo?.name || 'N/A';
    }
    if (type === 'due') {
      return item.memberId?.name || item.nonMemberInfo?.name || 'N/A';
    }
    return 'N/A';
  };

  const getSecondaryInfo = () => {
    if (type === 'income' && item.incomeType === 'Service') {
      return {
        label: 'Sent To:',
        value: item.sentToMemberId?.name || item.sentToNonMemberInfo?.name || item.sentTo || 'N/A'
      };
    }
    if (type === 'expense') {
      if (item.expenseType === 'Due' && item.dueId) {
        return {
          label: 'Due:',
          value: item.dueId.dueName || item.dueId
        };
      }
      if (item.expenseType === 'Project' && item.projectId) {
        return {
          label: 'Project:',
          value: item.projectId.name
        };
      }
      // Add this to show payment recipient for General expenses
      if (item.expenseType === 'General' && (item.paymentSentToMemberId?.name || item.paymentSentTo)) {
        return {
          label: 'Paid To:',
          value: item.paymentSentToMemberId?.name || item.paymentSentTo
        };
      }
    }
    if (type === 'due' && item.dueType === 'Project' && item.projectId) {
      return {
        label: 'Project:',
        value: item.projectId.name
      };
    }
    return null;
  };

  const secondaryInfo = getSecondaryInfo();

  return (
    <div 
      className={`accounts-card ${getCardTypeClass()}`}
      onClick={handleCardClick}
      role="button"
      tabIndex={0}
      onKeyPress={(e) => e.key === 'Enter' && handleCardClick(e)}
    >
      <div className="accounts-card-header">
        <div className="accounts-title-section">
          <div className="accounts-type-badge-group">
            <span className={`accounts-type-badge ${type}-badge`}>
              {type === 'income' && item.incomeType}
              {type === 'expense' && item.expenseType}
              {type === 'due' && item.dueType}
            </span>
            {item[`${type}Id`] && (
              <span className="accounts-id-badge">
                <FiHash size={10} />
                {item[`${type}Id`]}
              </span>
            )}
          </div>
          <h3 className="accounts-name">
            {type === 'income' 
              ? (item.incomeType === 'Service' ? item.serviceName : item.incomeName)
              : type === 'expense' 
                ? item.expenseName
                : item.dueName
            }
          </h3>
        </div>
        <div className="accounts-amount-section">
          <span className="accounts-amount" style={{ color: getAmountColor() }}>
            ₹{amount.toLocaleString()}
          </span>
        </div>
      </div>

      <div className="accounts-details">
        <div className="accounts-detail">
          <span className="detail-label">
            <FiCalendar size={12} />
            Date:
          </span>
          <span className="detail-value">{formatDate(item.date)}</span>
        </div>

        <div className="accounts-detail">
          <span className="detail-label">
            <FiUser size={12} />
            {type === 'income' ? 'From:' : type === 'expense' ? 'By:' : 'Member:'}
          </span>
          <span className="detail-value">{getInchargeOrMember()}</span>
        </div>

        {secondaryInfo && (
          <div className="accounts-detail">
            <span className="detail-label">
              <FiCreditCard size={12} />
              {secondaryInfo.label}
            </span>
            <span className="detail-value">{secondaryInfo.value}</span>
          </div>
        )}

        {type !== 'due' && (
          <div className="accounts-detail">
            <span className="detail-label">
              <FiCreditCard size={12} />
              Payment Mode:
            </span>
            <span className="detail-value">{item.paymentMode || 'N/A'}</span>
          </div>
        )}

        {type === 'income' && item.incomeType !== 'Service' && (
          <div className="accounts-detail">
            <span className="detail-label">
              <FiHash size={12} />
              Payment ID:
            </span>
            <span className="detail-value">{item.paymentId || 'N/A'}</span>
          </div>
        )}

        {type === 'due' && (
          <>
            <div className="accounts-detail">
              <span className="detail-label">Status:</span>
              <span className={`accounts-status-badge ${getStatusClass(item.dueStatus)}`}>
                {
                  item.dueStatus === 'PartiallySettled' ? 'Partially Settled' :
                  item.dueStatus === 'FullySettled' ? 'Fully Settled' :
                  item.dueStatus
                }
              </span>
            </div>

            {/* Progress Bar for Due */}
            <div className="accounts-progress">
              <div className="progress-header">
                <span className="progress-label">Settlement Progress</span>
                <span className="progress-percentage">
                  {((item.settledAmount || 0) / item.totalDueAmount * 100).toFixed(0)}%
                </span>
              </div>
              <div className="progress-bar-container">
                <div 
                  className="progress-bar-fill"
                  style={{ 
                    width: `${(item.settledAmount || 0) / item.totalDueAmount * 100}%`,
                    backgroundColor: '#10b981'
                  }}
                />
              </div>
              <div className="due-breakdown-simple">
                <div className="due-item">
                  <span>Settled:</span>
                  <span className="settled-amount">₹{(item.settledAmount || 0).toLocaleString()}</span>
                </div>
                <div className="due-item">
                  <span>Pending:</span>
                  <span className="pending-amount">₹{pendingAmount.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {item.description && (
        <p className="accounts-description">{item.description}</p>
      )}

      <div className="accounts-card-actions">
        <button 
          className="edit-btn" 
          onClick={(e) => {
            e.stopPropagation();
            onEdit(item);
          }}
          aria-label="Edit item"
        >
          <FiEdit2 size={16} />
          Edit
        </button>
        <button 
          className="delete-btn" 
          onClick={(e) => {
            e.stopPropagation();
            onDelete(item._id);
          }}
          disabled={isDeleting}
          aria-label="Delete item"
        >
          <FiTrash2 size={16} />
          {isDeleting ? 'Deleting...' : 'Delete'}
        </button>
      </div>
    </div>
  );
}

export default AccountsCard;