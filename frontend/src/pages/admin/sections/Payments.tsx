import { useState } from 'react';
import { CreditCard, Search, TrendingUp, Repeat, Undo2, BadgePercent, Receipt } from 'lucide-react';
import type { AdminStats } from '../types';

interface PaymentsProps {
  stats: AdminStats;
  subSection: string;
}

export default function Payments({ stats, subSection }: PaymentsProps) {
  const [active, setActive] = useState(subSection || 'payments-transactions');
  const [search, setSearch] = useState('');

  const payments = stats.recentPayments || [];
  const filteredPayments = payments.filter(p =>
    !search ||
    p.email.toLowerCase().includes(search.toLowerCase()) ||
    (p.transactionId && p.transactionId.toLowerCase().includes(search.toLowerCase()))
  );

  const totalRevenue = payments.reduce((sum, p) => sum + (p.amount || 0), 0);
  const totalCount = stats.totalPayments || 0;
  const secondaryPages = {
    'payments-subscriptions': {
      title: 'Subscriptions',
      desc: 'Active, expired, cancelled, and renewal-ready subscription records',
      icon: <Repeat size={32} />,
      metric: `${Math.max(0, totalCount)} tracked plans`,
      empty: 'No recurring subscriptions recorded yet.'
    },
    'payments-refunds': {
      title: 'Refunds',
      desc: 'Refund requests, gateway reversals, and approval state',
      icon: <Undo2 size={32} />,
      metric: '0 open refunds',
      empty: 'No refund requests in queue.'
    },
    'payments-coupons': {
      title: 'Coupons',
      desc: 'Promotion codes, redemptions, and discount governance',
      icon: <BadgePercent size={32} />,
      metric: '0 active coupons',
      empty: 'No coupons configured yet.'
    },
    'payments-invoices': {
      title: 'Invoices',
      desc: 'Invoice generation, payment receipts, and export-ready billing records',
      icon: <Receipt size={32} />,
      metric: `${payments.length} recent invoices`,
      empty: 'No invoice records available yet.'
    }
  } as const;

  return (
    <div className="section-animate">
      <div className="tab-bar">
        {[
          { id: 'payments-transactions', label: 'Transactions', icon: <CreditCard size={12} /> },
          { id: 'payments-revenue', label: 'Revenue Summary', icon: <TrendingUp size={12} /> },
          { id: 'payments-subscriptions', label: 'Subscriptions', icon: <Repeat size={12} /> },
          { id: 'payments-refunds', label: 'Refunds', icon: <Undo2 size={12} /> },
          { id: 'payments-coupons', label: 'Coupons', icon: <BadgePercent size={12} /> },
          { id: 'payments-invoices', label: 'Invoices', icon: <Receipt size={12} /> }
        ].map(t => (
          <button key={t.id} className={`tab-btn${active === t.id ? ' active' : ''}`} onClick={() => setActive(t.id)}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {active === 'payments-transactions' && (
        <div className="section-animate">
          <div className="section-header">
            <div className="section-header-left">
              <h2>Transaction Logs</h2>
              <p>Platform payment events and invoice history</p>
            </div>
            <span className="panel-badge green">{totalCount} transactions</span>
          </div>

          <div className="table-controls">
            <div className="table-search">
              <Search size={13} className="table-search-icon" />
              <input
                placeholder="Search transaction or email…"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
          </div>

          {filteredPayments.length === 0 ? (
            <div className="empty-state">
              <CreditCard size={32} />
              <h4>No transactions found</h4>
              <p>{search ? 'No payments match your search criteria.' : 'No transactions recorded yet.'}</p>
            </div>
          ) : (
            <div className="data-table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Transaction ID</th>
                    <th>User Email</th>
                    <th>Amount</th>
                    <th>Method</th>
                    <th>Status</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPayments.map(p => (
                    <tr key={p.id || p.transactionId}>
                      <td className="bold mono">{p.transactionId}</td>
                      <td>{p.email}</td>
                      <td>
                        <span className="badge badge-green">₹{p.amount}</span>
                      </td>
                      <td style={{ textTransform: 'uppercase', fontSize: '0.8rem' }}>{p.paymentMethod}</td>
                      <td>
                        <span className={`badge ${p.status === 'SUCCESS' || p.status === 'succeeded' ? 'badge-green' : 'badge-amber'}`}>
                          {p.status}
                        </span>
                      </td>
                      <td className="mono" style={{ fontSize: '0.78rem' }}>{new Date(p.createdAt).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {active === 'payments-revenue' && (
        <div className="section-animate">
          <div className="section-header">
            <div className="section-header-left">
              <h2>Revenue Summary</h2>
              <p>Monetization metrics and financial highlights</p>
            </div>
          </div>

          <div className="revenue-summary">
            <div className="revenue-card">
              <div className="revenue-card-label">Total Revenue</div>
              <div className="revenue-card-value">₹{totalRevenue.toLocaleString()}</div>
              <div className="revenue-card-sub">All-time earnings</div>
            </div>
            <div className="revenue-card">
              <div className="revenue-card-label">Avg Order Value</div>
              <div className="revenue-card-value">
                ₹{payments.length > 0 ? Math.round(totalRevenue / payments.length).toLocaleString() : '0'}
              </div>
              <div className="revenue-card-sub">Per transaction average</div>
            </div>
            <div className="revenue-card">
              <div className="revenue-card-label">Total Payments</div>
              <div className="revenue-card-value">{totalCount}</div>
              <div className="revenue-card-sub">Completed transactions</div>
            </div>
          </div>

          <div className="glass-panel" style={{ marginTop: 20 }}>
            <div className="panel-header">
              <div className="panel-header-left">
                <TrendingUp size={14} />
                <h3>Monetization Modules</h3>
              </div>
            </div>
            <div className="panel-body">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {[
                  { name: 'Job Finder Access Upgrade', count: totalCount, price: 200, rev: totalRevenue },
                  { name: 'ATS Pro Resume Builder (Mock)', count: 0, price: 499, rev: 0 },
                  { name: 'Enterprise Admin Suite (Mock)', count: 0, price: 1999, rev: 0 }
                ].map((item, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', background: 'var(--surface-3)', borderRadius: 'var(--r-md)' }}>
                    <div>
                      <div style={{ fontWeight: 600, color: 'var(--text-1)' }}>{item.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-3)', marginTop: 2 }}>Unit Price: ₹{item.price} · Total sold: {item.count}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontWeight: 700, color: 'var(--green)' }}>₹{item.rev.toLocaleString()}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-3)' }}>Revenue generated</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {active in secondaryPages && (
        <div className="section-animate">
          <div className="section-header">
            <div className="section-header-left">
              <h2>{secondaryPages[active as keyof typeof secondaryPages].title}</h2>
              <p>{secondaryPages[active as keyof typeof secondaryPages].desc}</p>
            </div>
            <span className="panel-badge blue">{secondaryPages[active as keyof typeof secondaryPages].metric}</span>
          </div>

          <div className="empty-state">
            {secondaryPages[active as keyof typeof secondaryPages].icon}
            <h4>{secondaryPages[active as keyof typeof secondaryPages].empty}</h4>
            <p>This payment module is ready for backend records and export actions.</p>
          </div>
        </div>
      )}
    </div>
  );
}
