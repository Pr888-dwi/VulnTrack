import { useEffect, useState } from "react";
import "./App.css";

const API = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

function App() {
  const [vulnerabilities, setVulnerabilities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [severityFilter, setSeverityFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    title: "",
    description: "",
    severity: "High",
    affected_asset: "",
  });

  async function loadVulnerabilities() {
    try {
      setError("");
      const response = await fetch(`${API}/vulnerabilities`);

      if (!response.ok) {
        throw new Error("Unable to load vulnerabilities.");
      }

      const data = await response.json();
      setVulnerabilities(data);
    } catch (err) {
      setError(
        "Backend connection failed. Make sure FastAPI is running on port 8000."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadVulnerabilities();
  }, []);

  async function createVulnerability(e) {
    e.preventDefault();

    try {
      setSaving(true);
      setError("");

      const response = await fetch(`${API}/vulnerabilities`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(
          data.detail?.[0]?.msg || "Failed to create vulnerability."
        );
      }

      setForm({
        title: "",
        description: "",
        severity: "High",
        affected_asset: "",
      });

      setShowForm(false);
      await loadVulnerabilities();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function updateStatus(id, status) {
    try {
      setError("");

      const response = await fetch(
        `${API}/vulnerabilities/${id}/status`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update vulnerability status.");
      }

      await loadVulnerabilities();
    } catch (err) {
      setError(err.message);
    }
  }

  async function deleteVulnerability(id) {
    if (!window.confirm("Are you sure you want to delete this vulnerability?")) {
      return;
    }

    try {
      setError("");

      const response = await fetch(`${API}/vulnerabilities/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete vulnerability.");
      }

      await loadVulnerabilities();
    } catch (err) {
      setError(err.message);
    }
  }

  const filteredVulnerabilities = vulnerabilities.filter((item) => {
    const query = search.toLowerCase();

    const matchesSearch =
      item.title.toLowerCase().includes(query) ||
      item.description.toLowerCase().includes(query) ||
      item.affected_asset.toLowerCase().includes(query);

    const matchesSeverity =
      severityFilter === "All" || item.severity === severityFilter;

    const matchesStatus =
      statusFilter === "All" || item.status === statusFilter;

    return matchesSearch && matchesSeverity && matchesStatus;
  });

  const criticalCount = vulnerabilities.filter(
    (item) => item.severity === "Critical"
  ).length;

  const openCount = vulnerabilities.filter(
    (item) => item.status === "Open"
  ).length;

  const resolvedCount = vulnerabilities.filter(
    (item) => item.status === "Resolved"
  ).length;

  const highCount = vulnerabilities.filter(
    (item) => item.severity === "High"
  ).length;

  function formatDate(date) {
    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-icon">V</div>
          <div>
            <h2>VulnTrack</h2>
            <span>Security Management</span>
          </div>
        </div>

        <div className="nav-label">WORKSPACE</div>
        <div className="nav-item active">
          <span>▦</span> Dashboard
        </div>
        <div className="nav-item">
          <span>◈</span> Vulnerabilities
        </div>
        <div className="nav-item">
          <span>⌘</span> Assets
        </div>
        <div className="nav-item">
          <span>▤</span> Reports
        </div>

        <div className="sidebar-bottom">
          <div className="connection-dot"></div>
          <div>
            <strong>VulnTrack API</strong>
            <span>Local environment</span>
          </div>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div>
            <p className="eyebrow">SECURITY OPERATIONS</p>
            <h1>Vulnerability Dashboard</h1>
            <p className="subtitle">
              Monitor, manage and remediate security vulnerabilities.
            </p>
          </div>

          <button className="primary-button" onClick={() => setShowForm(!showForm)}>
            <span>＋</span> Add Vulnerability
          </button>
        </header>

        {error && (
          <div className="error-banner">
            <span>{error}</span>
            <button onClick={() => setError("")}>×</button>
          </div>
        )}

        {showForm && (
          <section className="form-card">
            <div className="section-heading">
              <div>
                <h2>Report a Vulnerability</h2>
                <p>Add a security finding to your tracker.</p>
              </div>
              <button
                className="close-button"
                onClick={() => setShowForm(false)}
                type="button"
              >
                ×
              </button>
            </div>

            <form onSubmit={createVulnerability}>
              <div className="form-grid">
                <label>
                  Vulnerability Title
                  <input
                    required
                    minLength={3}
                    maxLength={200}
                    placeholder="e.g. SQL Injection"
                    value={form.title}
                    onChange={(e) =>
                      setForm({ ...form, title: e.target.value })
                    }
                  />
                </label>

                <label>
                  Affected Asset
                  <input
                    required
                    placeholder="e.g. Web Application"
                    value={form.affected_asset}
                    onChange={(e) =>
                      setForm({ ...form, affected_asset: e.target.value })
                    }
                  />
                </label>

                <label>
                  Severity
                  <select
                    value={form.severity}
                    onChange={(e) =>
                      setForm({ ...form, severity: e.target.value })
                    }
                  >
                    <option>Critical</option>
                    <option>High</option>
                    <option>Medium</option>
                    <option>Low</option>
                  </select>
                </label>

                <label className="full-width">
                  Description
                  <textarea
                    required
                    minLength={5}
                    maxLength={2000}
                    rows={3}
                    placeholder="Describe the vulnerability and its potential impact..."
                    value={form.description}
                    onChange={(e) =>
                      setForm({ ...form, description: e.target.value })
                    }
                  />
                </label>
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  className="secondary-button"
                  onClick={() => setShowForm(false)}
                >
                  Cancel
                </button>
                <button className="primary-button" disabled={saving}>
                  {saving ? "Saving..." : "Create Finding"}
                </button>
              </div>
            </form>
          </section>
        )}

        <section className="stats-grid">
          <div className="stat-card">
            <div className="stat-top">
              <span>Total Findings</span>
              <div className="stat-icon purple">▦</div>
            </div>
            <strong>{vulnerabilities.length}</strong>
            <p>All recorded vulnerabilities</p>
          </div>

          <div className="stat-card">
            <div className="stat-top">
              <span>Critical Severity</span>
              <div className="stat-icon red">!</div>
            </div>
            <strong>{criticalCount}</strong>
            <p>Require urgent attention</p>
          </div>

          <div className="stat-card">
            <div className="stat-top">
              <span>Open Findings</span>
              <div className="stat-icon orange">◷</div>
            </div>
            <strong>{openCount}</strong>
            <p>Awaiting remediation</p>
          </div>

          <div className="stat-card">
            <div className="stat-top">
              <span>Resolved</span>
              <div className="stat-icon green">✓</div>
            </div>
            <strong>{resolvedCount}</strong>
            <p>Successfully remediated</p>
          </div>
        </section>

        <section className="overview-grid">
          <div className="panel severity-panel">
            <div className="section-heading">
              <div>
                <h2>Severity Overview</h2>
                <p>Findings grouped by risk level</p>
              </div>
            </div>

            {["Critical", "High", "Medium", "Low"].map((severity) => {
              const count = vulnerabilities.filter(
                (item) => item.severity === severity
              ).length;

              const percentage = vulnerabilities.length
                ? (count / vulnerabilities.length) * 100
                : 0;

              return (
                <div className="severity-row" key={severity}>
                  <div className="severity-label">
                    <span className={`severity-dot ${severity.toLowerCase()}`}></span>
                    <span>{severity}</span>
                    <strong>{count}</strong>
                  </div>
                  <div className="progress-track">
                    <div
                      className={`progress-fill ${severity.toLowerCase()}`}
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}

            <div className="severity-footer">
              <span>High severity findings</span>
              <strong>{highCount}</strong>
            </div>
          </div>

          <div className="panel quick-panel">
            <div className="section-heading">
              <div>
                <h2>Quick Actions</h2>
                <p>Manage your security workflow</p>
              </div>
            </div>

            <button
              className="quick-action"
              onClick={() => setShowForm(true)}
            >
              <span className="quick-icon purple">＋</span>
              <span>
                <strong>Report a finding</strong>
                <small>Record a new vulnerability</small>
              </span>
              <span className="quick-arrow">›</span>
            </button>

            <button
              className="quick-action"
              onClick={() => {
                setSeverityFilter("All");
                setStatusFilter("All");
                setSearch("");
                document.getElementById("findings")?.scrollIntoView({
                  behavior: "smooth",
                });
              }}
            >
              <span className="quick-icon blue">⌕</span>
              <span>
                <strong>View all findings</strong>
                <small>Browse your vulnerability list</small>
              </span>
              <span className="quick-arrow">›</span>
            </button>

            <button
              className="quick-action"
              onClick={loadVulnerabilities}
            >
              <span className="quick-icon green">↻</span>
              <span>
                <strong>Refresh data</strong>
                <small>Fetch the latest API records</small>
              </span>
              <span className="quick-arrow">›</span>
            </button>
          </div>
        </section>

        <section className="panel findings-panel" id="findings">
          <div className="section-heading findings-heading">
            <div>
              <h2>Vulnerability Findings</h2>
              <p>Search, filter and manage detected security issues.</p>
            </div>
            <span className="record-count">
              {filteredVulnerabilities.length} findings
            </span>
          </div>

          <div className="filters">
            <div className="search-box">
              <span>⌕</span>
              <input
                placeholder="Search title, description or asset..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              aria-label="Filter by severity"
            >
              <option value="All">All Severities</option>
              <option value="Critical">Critical</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              aria-label="Filter by status"
            >
              <option value="All">All Statuses</option>
              <option value="Open">Open</option>
              <option value="In Progress">In Progress</option>
              <option value="Resolved">Resolved</option>
            </select>
          </div>

          {loading ? (
            <div className="empty-state">
              <div className="loader"></div>
              <p>Loading vulnerabilities...</p>
            </div>
          ) : filteredVulnerabilities.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">⌕</div>
              <h3>No vulnerabilities found</h3>
              <p>Try changing the filters or add a new finding.</p>
              <button
                className="primary-button"
                onClick={() => setShowForm(true)}
              >
                ＋ Add Vulnerability
              </button>
            </div>
          ) : (
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>VULNERABILITY</th>
                    <th>ASSET</th>
                    <th>SEVERITY</th>
                    <th>STATUS</th>
                    <th>DATE REPORTED</th>
                    <th>ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredVulnerabilities.map((item) => (
                    <tr key={item.id}>
                      <td>
                        <div className="finding-title">{item.title}</div>
                        <div className="finding-description">
                          {item.description}
                        </div>
                      </td>
                      <td>{item.affected_asset}</td>
                      <td>
                        <span
                          className={`badge severity-badge ${item.severity.toLowerCase()}`}
                        >
                          {item.severity}
                        </span>
                      </td>
                      <td>
                        <select
                          className={`status-select ${item.status
                            .toLowerCase()
                            .replace(" ", "-")}`}
                          value={item.status}
                          onChange={(e) =>
                            updateStatus(item.id, e.target.value)
                          }
                          aria-label={`Update status for ${item.title}`}
                        >
                          <option>Open</option>
                          <option>In Progress</option>
                          <option>Resolved</option>
                        </select>
                      </td>
                      <td>{formatDate(item.created_at)}</td>
                      <td>
                        <button
                          className="delete-button"
                          title="Delete vulnerability"
                          aria-label={`Delete ${item.title}`}
                          onClick={() => deleteVulnerability(item.id)}
                        >
                          ×
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <footer className="app-footer">
          <span>VulnTrack · Vulnerability Tracking System</span>
          <span>API: localhost:8000</span>
        </footer>
      </main>
    </div>
  );
}

export default App;