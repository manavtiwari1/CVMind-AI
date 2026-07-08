import { useState } from 'react';
import { Mail, Search, MessageSquare, Bug, Lightbulb } from 'lucide-react';
import type { AdminStats } from '../types';

interface SupportProps {
  stats: AdminStats;
  subSection: string;
}

export default function Support({ stats, subSection }: SupportProps) {
  const [active, setActive] = useState(subSection || 'support-leads');
  const [search, setSearch] = useState('');

  const messages = stats.contactMessages || [];
  const filteredMessages = messages.filter(m =>
    !search ||
    m.name.toLowerCase().includes(search.toLowerCase()) ||
    m.email.toLowerCase().includes(search.toLowerCase()) ||
    m.subject.toLowerCase().includes(search.toLowerCase()) ||
    m.message.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="section-animate">
      <div className="tab-bar">
        {[
          { id: 'support-leads', label: 'Contact Leads', icon: <Mail size={12} /> },
          { id: 'support-feedback', label: 'User Feedback', icon: <MessageSquare size={12} /> },
          { id: 'support-bugs', label: 'Bug Reports', icon: <Bug size={12} /> },
          { id: 'support-features', label: 'Feature Requests', icon: <Lightbulb size={12} /> }
        ].map(t => (
          <button key={t.id} className={`tab-btn${active === t.id ? ' active' : ''}`} onClick={() => setActive(t.id)}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {active === 'support-leads' && (
        <div className="section-animate">
          <div className="section-header">
            <div className="section-header-left">
              <h2>Contact Leads</h2>
              <p>Inbound customer queries, support tickets, and potential business leads</p>
            </div>
            <span className="panel-badge blue">{messages.length} leads</span>
          </div>

          <div className="table-controls">
            <div className="table-search">
              <Search size={13} className="table-search-icon" />
              <input
                placeholder="Search name, email or keyword…"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
          </div>

          {filteredMessages.length === 0 ? (
            <div className="empty-state">
              <Mail size={32} />
              <h4>No contact leads found</h4>
              <p>{search ? 'No messages match your search filter.' : 'Your inbox is clear! No messages yet.'}</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {filteredMessages.map(m => (
                <div className="contact-card" key={m.id}>
                  <div className="contact-header">
                    <div>
                      <div className="contact-name">{m.name}</div>
                      <div className="contact-email">{m.email}</div>
                    </div>
                    <span className="mono" style={{ fontSize: '0.73rem', color: 'var(--text-3)' }}>
                      {new Date(m.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <div className="contact-subject">{m.subject}</div>
                  <p className="contact-message">{m.message}</p>
                  <div className="contact-footer">
                    <span className="contact-id">ID: {m.id}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {active === 'support-feedback' && (
        <div className="section-animate">
          <div className="section-header">
            <div className="section-header-left">
              <h2>User Feedback</h2>
              <p>Ratings and reviews submitted by candidates</p>
            </div>
          </div>

          <div className="empty-state">
            <MessageSquare size={32} />
            <h4>No feedback records</h4>
            <p>Mock reviews will display once users submit platform feedback surveys.</p>
          </div>
        </div>
      )}

      {(active === 'support-bugs' || active === 'support-features') && (
        <div className="section-animate">
          <div className="section-header">
            <div className="section-header-left">
              <h2>{active === 'support-bugs' ? 'Bug Reports' : 'Feature Requests'}</h2>
              <p>{active === 'support-bugs' ? 'Reported defects, priority, owner, and resolution state' : 'Customer ideas, voting, priority, and product triage'}</p>
            </div>
            <span className="panel-badge blue">0 open</span>
          </div>

          <div className="empty-state">
            {active === 'support-bugs' ? <Bug size={32} /> : <Lightbulb size={32} />}
            <h4>{active === 'support-bugs' ? 'No bug reports' : 'No feature requests'}</h4>
            <p>This CRM queue is ready for backend records and internal notes.</p>
          </div>
        </div>
      )}
    </div>
  );
}
