interface Props {
  title?: string;
  subtitle?: string;
  type?: 'cards' | 'list' | 'text' | 'sidebar' | 'jobs' | 'feedback' | 'page';
  step?: number;
  totalSteps?: number;
  card?: boolean;
  className?: string;
}

export default function SkeletonLoader({
  title,
  subtitle,
  type = 'text',
  step,
  totalSteps,
  card = true,
  className = '',
}: Props) {
  const progress = step !== undefined && totalSteps ? ((step + 1) / totalSteps) * 100 : undefined;

  return (
    <div className={`sk-loader${card ? ' glass-card' : ''} ${className}`}>
      <div className="sk-loader-header">
        {title && <p className="sk-loader-title">{title}</p>}
        {subtitle && <p className="sk-loader-subtitle skeleton-pulse">{subtitle}</p>}
        {progress !== undefined && (
          <div className="sk-loader-progress">
            <div className="sk-loader-progress-fill" style={{ width: `${progress}%` }} />
          </div>
        )}
      </div>

      {type === 'cards' && (
        <div className="sk-cards-grid">
          {[1, 2, 3].map(i => (
            <div key={i} className="sk-card">
              <div className="sk-card-icon skeleton-pulse" />
              <div className="sk-line skeleton-pulse" style={{ width: '70%', height: '13px' }} />
              <div className="sk-line skeleton-pulse" style={{ width: '90%', height: '10px' }} />
              <div className="sk-line skeleton-pulse" style={{ width: '80%', height: '10px' }} />
              <div className="sk-line skeleton-pulse" style={{ width: '60%', height: '10px' }} />
            </div>
          ))}
        </div>
      )}

      {type === 'list' && (
        <div className="sk-list">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="sk-list-item">
              <div className="sk-list-badge skeleton-pulse" />
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <div className="sk-line skeleton-pulse" style={{ width: '75%', height: '13px' }} />
                <div className="sk-line skeleton-pulse" style={{ width: '55%', height: '10px' }} />
              </div>
            </div>
          ))}
        </div>
      )}

      {type === 'text' && (
        <div className="sk-text-block">
          {[95, 88, 75, 92, 68, 84, 72, 60].map((w, i) => (
            <div key={i} className="sk-line skeleton-pulse" style={{ width: `${w}%`, height: i === 0 ? '15px' : '11px', marginTop: i === 4 ? '0.7rem' : undefined }} />
          ))}
        </div>
      )}

      {type === 'sidebar' && (
        <div className="sk-sidebar-layout">
          <div className="sk-sidebar">
            {[55, 80, 45, 70, 60].map((w, i) => (
              <div key={i} className="sk-line skeleton-pulse" style={{ width: `${w}%`, height: '12px' }} />
            ))}
          </div>
          <div className="sk-sidebar-main">
            {[95, 85, 78, 92, 65, 88, 73, 80, 60, 70].map((w, i) => (
              <div key={i} className="sk-line skeleton-pulse" style={{ width: `${w}%`, height: i === 0 ? '14px' : '10px', marginTop: i === 4 ? '0.7rem' : undefined }} />
            ))}
          </div>
        </div>
      )}

      {type === 'jobs' && (
        <div className="sk-jobs-list">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="sk-job-card">
              <div className="sk-job-header">
                <div className="sk-job-logo skeleton-pulse" />
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '5px' }}>
                  <div className="sk-line skeleton-pulse" style={{ width: '60%', height: '14px' }} />
                  <div className="sk-line skeleton-pulse" style={{ width: '40%', height: '10px' }} />
                </div>
                <div className="sk-line skeleton-pulse" style={{ width: '50px', height: '24px', borderRadius: '980px' }} />
              </div>
              <div className="sk-job-chips">
                {[65, 55, 75, 48].map((w, j) => (
                  <div key={j} className="sk-job-chip skeleton-pulse" style={{ width: `${w}px` }} />
                ))}
              </div>
              <div className="sk-line skeleton-pulse" style={{ width: '100%', height: '4px', borderRadius: '980px' }} />
            </div>
          ))}
        </div>
      )}

      {type === 'feedback' && (
        <div className="sk-feedback-layout">
          <div className="sk-feedback-scores">
            {[1, 2, 3].map(i => (
              <div key={i} className="sk-feedback-score-item">
                <div className="sk-feedback-circle skeleton-pulse" />
                <div className="sk-line skeleton-pulse" style={{ width: '55px', height: '10px' }} />
              </div>
            ))}
          </div>
          <div className="sk-feedback-lines">
            {[90, 75, 85, 65, 80].map((w, i) => (
              <div key={i} className="sk-line skeleton-pulse" style={{ width: `${w}%`, height: '11px' }} />
            ))}
          </div>
        </div>
      )}

      {type === 'page' && (
        <div className="sk-page-layout">
          <div className="sk-page-hero skeleton-pulse" />
          <div className="sk-page-sections">
            {[1, 2, 3].map(i => (
              <div key={i} className="sk-page-section skeleton-pulse" />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
