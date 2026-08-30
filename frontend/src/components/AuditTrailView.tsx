import React, { useEffect, useState } from 'react';
import { Search, RefreshCw } from 'lucide-react';
import { getApiUrl } from '../services/apiConfig';

interface AuditLogEntry {
  id: string;
  timestamp: string;
  action: string;
  entity: string;
  reason: string;
  before_state: string;
  after_state: string;
  source: string;
  status: string;
}

export const AuditTrailView: React.FC = () => {
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSource, setSelectedSource] = useState<string>('ALL');

  const fetchLogs = () => {
    setLoading(true);
    fetch(getApiUrl('/api/audit/logs?limit=100'))
      .then(res => res.json())
      .then(d => {
        setLogs(Array.isArray(d) ? d : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const filteredLogs = logs.filter(log => {
    const matchesSearch =
      log.entity.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.reason.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.id.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesSource = selectedSource === 'ALL' || log.source === selectedSource;
    return matchesSearch && matchesSource;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      
      {/* Header */}
      <div style={{
        background: 'var(--bg-surface)', border: '1px solid var(--border-color)',
        borderRadius: 16, padding: '20px 24px', display: 'flex', justifyContent: 'space-between',
        alignItems: 'center', flexWrap: 'wrap', gap: 16
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <span style={{
              fontSize: 10, fontWeight: 800, padding: '2px 8px', borderRadius: 100,
              background: 'var(--emerald-green-bg)', color: 'var(--emerald-green)', border: '1px solid var(--emerald-green-border)'
            }}>
              IMMUTABLE AUDIT LOG
            </span>
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
              ACID Compliant State Ledger
            </span>
          </div>
          <h2 style={{ fontSize: 24, fontWeight: 800, margin: '2px 0 4px', color: 'var(--text-main)' }}>
            System Operations & Decision Audit Trail
          </h2>
          <div style={{ fontSize: 13, color: 'var(--text-sub)' }}>
            Complete historical record of all POS sales, price changes, markdowns, AI recommendations, and recovery action executions.
          </div>
        </div>

        <button
          onClick={fetchLogs}
          className="btn-copilot btn-copilot-secondary"
          style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
        >
          <RefreshCw size={13} />
          <span>Refresh Audit Stream</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 260 }}>
          <Search size={15} color="var(--text-muted)" style={{ position: 'absolute', left: 12, top: 12 }} />
          <input
            type="text"
            placeholder="Search audit trail by entity, action, ID, or reason..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%', padding: '9px 12px 9px 36px', borderRadius: 10,
              border: '1px solid var(--border-color)', background: 'var(--bg-surface)',
              color: 'var(--text-main)', fontSize: 13
            }}
          />
        </div>

        <select
          value={selectedSource}
          onChange={(e) => setSelectedSource(e.target.value)}
          style={{
            padding: '9px 14px', borderRadius: 10, border: '1px solid var(--border-color)',
            background: 'var(--bg-surface)', color: 'var(--text-main)', fontSize: 13, fontWeight: 600
          }}
        >
          <option value="ALL">All Event Sources</option>
          <option value="POS_TERMINAL">POS Terminal</option>
          <option value="AI_ENGINE">AI Decision Engine</option>
          <option value="MERCHANT_EXECUTION">Merchant Execution</option>
          <option value="SYSTEM">System Engine</option>
        </select>
      </div>

      {/* Audit Log Table */}
      <div className="desktop-table-view" style={{ overflowX: 'auto' }}>
        <table className="inventory-table">
          <thead>
            <tr>
              <th>AUDIT ID</th>
              <th>TIMESTAMP</th>
              <th>ACTION</th>
              <th>ENTITY</th>
              <th>BEFORE STATE</th>
              <th>AFTER STATE</th>
              <th>SOURCE</th>
              <th>STATUS</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={8} style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>
                  Loading audit log stream...
                </td>
              </tr>
            ) : filteredLogs.length === 0 ? (
              <tr>
                <td colSpan={8} style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>
                  No audit log entries matched your filter criteria.
                </td>
              </tr>
            ) : (
              filteredLogs.map(log => (
                <tr key={log.id}>
                  <td style={{ fontFamily: 'monospace', fontWeight: 700, color: 'var(--accent-purple)', fontSize: 12 }}>
                    {log.id}
                  </td>
                  <td style={{ fontSize: 12, color: 'var(--text-sub)', whiteSpace: 'nowrap' }}>
                    {log.timestamp ? new Date(log.timestamp).toLocaleTimeString() : 'Just now'}
                  </td>
                  <td>
                    <strong style={{ color: 'var(--text-main)', fontSize: 12 }}>{log.action}</strong>
                    <div style={{ fontSize: 11, color: 'var(--text-sub)', marginTop: 2 }}>{log.reason}</div>
                  </td>
                  <td style={{ fontWeight: 600, fontSize: 12 }}>{log.entity}</td>
                  <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>{log.before_state || 'N/A'}</td>
                  <td style={{ fontSize: 12, color: 'var(--emerald-green)', fontWeight: 600 }}>{log.after_state || 'N/A'}</td>
                  <td>
                    <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--accent-purple)' }}>
                      {log.source}
                    </span>
                  </td>
                  <td>
                    <span className="badge-pill" style={{
                      background: log.status === 'SUCCESS' ? 'var(--emerald-green-bg)' : 'var(--accent-purple-bg)',
                      color: log.status === 'SUCCESS' ? 'var(--emerald-green)' : 'var(--accent-purple)',
                      border: `1px solid ${log.status === 'SUCCESS' ? 'var(--emerald-green-border)' : 'var(--accent-purple-border)'}`
                    }}>
                      {log.status}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

    </div>
  );
};
