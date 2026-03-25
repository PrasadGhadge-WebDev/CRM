import React from 'react';
import { Icon } from '../../../layouts/icons.jsx';

export default function Billing() {
  const billingData = [
    { id: 1, customer: 'Acme Corp', amount: '$1,200', status: 'Paid', date: '2026-03-01' },
    { id: 2, customer: 'Global Tech', amount: '$850', status: 'Pending', date: '2026-03-15' },
    { id: 3, customer: 'Innovate LLC', amount: '$2,100', status: 'Overdue', date: '2026-02-20' },
  ];

  return (
    <div className="billingPage">
      <div className="pageHeader">
        <div className="headerLeft">
          <h1 className="pageTitle">BILLING</h1>
          <p className="pageSubtitle">Manage invoices, payments, and financial reports</p>
        </div>
        <div className="headerActions">
          <button className="btn btn-primary">
            <Icon name="plus" /> Create Invoice
          </button>
        </div>
      </div>

      <div className="statsGrid">
        <div className="statCard">
          <div className="statIcon bg-success-soft text-success">
            <Icon name="billing" />
          </div>
          <div className="statInfo">
            <div className="statValue">$4,150</div>
            <div className="statLabel">Total Revenue</div>
          </div>
        </div>
        <div className="statCard">
          <div className="statIcon bg-warning-soft text-warning">
            <Icon name="tasks" />
          </div>
          <div className="statInfo">
            <div className="statValue">$850</div>
            <div className="statLabel">Pending Payments</div>
          </div>
        </div>
        <div className="statCard">
          <div className="statIcon bg-danger-soft text-danger">
            <Icon name="help" />
          </div>
          <div className="statInfo">
            <div className="statValue">$2,100</div>
            <div className="statLabel">Overdue Balance</div>
          </div>
        </div>
      </div>

      <div className="contentCard">
        <div className="cardHeader">
          <h2 className="cardTitle">Recent Invoices</h2>
        </div>
        <div className="tableWrapper">
          <table className="crmTable">
            <thead>
              <tr>
                <th>Invoice ID</th>
                <th>Customer</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {billingData.map((item) => (
                <tr key={item.id}>
                  <td>#INV-00{item.id}</td>
                  <td>{item.customer}</td>
                  <td>{item.amount}</td>
                  <td>
                    <span className={`badge badge-${item.status.toLowerCase()}`}>
                      {item.status}
                    </span>
                  </td>
                  <td>{item.date}</td>
                  <td>
                    <button className="btn btn-icon" title="View">
                      <Icon name="eye" />
                    </button>
                    <button className="btn btn-icon" title="Download">
                      <Icon name="download" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
