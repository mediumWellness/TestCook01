import { useState } from 'react';

const defaultFormState = {
  deviceId: '',
  name: '',
  status: 'active',
  cpuUsagePercent: '',
  memoryUsagePercent: '',
  thermalStatus: '',
  powerUsageWatts: '',
};

export default function DQProPage() {
  const [formData, setFormData] = useState(defaultFormState);
  const [savedProfiles, setSavedProfiles] = useState([]);
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  async function loadProfiles() {
    try {
      setLoading(true);
      setError('');
      const res = await fetch('/api/dqpro');
      if (!res.ok) throw new Error('Failed to load profiles');
      const profiles = await res.json();
      setSavedProfiles(profiles);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function saveProfile(e) {
    e.preventDefault();
    setSaving(true);
    try {
      setError('');
      setSuccess('');

      if (!formData.deviceId.trim() || !formData.name.trim()) {
        setError('Device ID and Name are required');
        return;
      }

      const payload = {
        deviceId: formData.deviceId.trim(),
        name: formData.name.trim(),
        status: formData.status || 'active',
        cpuUsagePercent: formData.cpuUsagePercent ? parseFloat(formData.cpuUsagePercent) : null,
        memoryUsagePercent: formData.memoryUsagePercent ? parseFloat(formData.memoryUsagePercent) : null,
        thermalStatus: formData.thermalStatus.trim() || null,
        powerUsageWatts: formData.powerUsageWatts ? parseFloat(formData.powerUsageWatts) : null,
      };

      // If a profile is selected, use PUT to update; otherwise POST to create
      if (selectedProfile) {
        const res = await fetch(`/api/dqpro/${selectedProfile.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error || err.errors?.[0] || 'Failed to update profile');
        }

        const updated = await res.json();
        setSavedProfiles(savedProfiles.map(p => p.id === updated.id ? updated : p));
        setFormData(defaultFormState);
        setSelectedProfile(null);
        setSuccess('Profile updated successfully!');
        setTimeout(() => setSuccess(''), 3000);
      } else {
        const res = await fetch('/api/dqpro', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error || err.errors?.[0] || 'Failed to save profile');
        }

        const saved = await res.json();
        setSavedProfiles([saved, ...savedProfiles]);
        setFormData(defaultFormState);
        setSuccess('Profile saved successfully!');
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  function loadProfile(profile) {
    setSelectedProfile(profile);
    setFormData({
      deviceId: profile.deviceId,
      name: profile.name,
      status: profile.status,
      cpuUsagePercent: profile.cpuUsagePercent ?? '',
      memoryUsagePercent: profile.memoryUsagePercent ?? '',
      thermalStatus: profile.thermalStatus ?? '',
      powerUsageWatts: profile.powerUsageWatts ?? '',
    });
    setError('');
    setSuccess('');
  }

  function clearForm() {
    setFormData(defaultFormState);
    setSelectedProfile(null);
    setError('');
    setSuccess('');
  }

  return (
    <div className="persona-page">
      <div className="page-header persona-page-header">
        <div>
          <h1>DQ-Pro Optimization</h1>
          <p className="persona-intro">
            Create and manage device optimization profiles. Track device context, performance metrics, and optimization status.
            Focus on measurement-based, reversible changes with comprehensive rollback plans.
          </p>
        </div>
      </div>

      <div className="persona-layout">
        <form className="persona-form recipe-form" onSubmit={saveProfile}>
          <h2>Optimization Profile Builder</h2>

          {error && (
            <div role="alert" style={{ color: '#c93a3a', fontWeight: 600, marginBottom: '1rem', padding: '0.5rem', background: '#ffe6e6', borderRadius: '4px' }}>
              {error}
            </div>
          )}

          {success && (
            <div role="status" aria-live="polite" style={{ color: '#2a7d2a', fontWeight: 600, marginBottom: '1rem', padding: '0.5rem', background: '#e6ffe6', borderRadius: '4px' }}>
              {success}
            </div>
          )}

          <label>
            Device ID <span style={{ color: '#c93a3a' }}>*</span>
            <input
              name="deviceId"
              value={formData.deviceId}
              onChange={(e) => setFormData({ ...formData, deviceId: e.target.value })}
              placeholder="e.g., dq-pro-001"
              required
            />
          </label>

          <label>
            Device Name <span style={{ color: '#c93a3a' }}>*</span>
            <input
              name="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., DQ-Pro Device 1"
              required
            />
          </label>

          <label>
            Status
            <select
              name="status"
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="optimization">Optimization In Progress</option>
              <option value="testing">Testing</option>
            </select>
          </label>

          <label>
            CPU Usage (%)
            <input
              name="cpuUsagePercent"
              type="number"
              min="0"
              max="100"
              step="0.1"
              value={formData.cpuUsagePercent}
              onChange={(e) => setFormData({ ...formData, cpuUsagePercent: e.target.value })}
              placeholder="0-100"
            />
          </label>

          <label>
            Memory Usage (%)
            <input
              name="memoryUsagePercent"
              type="number"
              min="0"
              max="100"
              step="0.1"
              value={formData.memoryUsagePercent}
              onChange={(e) => setFormData({ ...formData, memoryUsagePercent: e.target.value })}
              placeholder="0-100"
            />
          </label>

          <label>
            Thermal Status
            <input
              name="thermalStatus"
              value={formData.thermalStatus}
              onChange={(e) => setFormData({ ...formData, thermalStatus: e.target.value })}
              placeholder="e.g., normal, warm, hot, critical"
            />
          </label>

          <label>
            Power Usage (Watts)
            <input
              name="powerUsageWatts"
              type="number"
              min="0"
              step="0.1"
              value={formData.powerUsageWatts}
              onChange={(e) => setFormData({ ...formData, powerUsageWatts: e.target.value })}
              placeholder="Power consumption in watts"
            />
          </label>

          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
            <button type="submit" disabled={saving}>
              {saving ? 'Saving...' : selectedProfile ? 'Update Profile' : 'Save Profile'}
            </button>
            <button type="button" onClick={clearForm} style={{ background: '#999' }}>
              Clear
            </button>
          </div>
        </form>

        <section className="persona-plan" aria-labelledby="dqpro-profiles-heading">
          <div className="persona-plan-header">
            <h2 id="dqpro-profiles-heading">Saved Profiles</h2>
            <p>View, manage, and load your device optimization profiles.</p>
          </div>

          <button
            onClick={loadProfiles}
            style={{ marginBottom: '1rem', background: '#666' }}
            disabled={loading}
          >
            {loading ? 'Loading...' : 'Refresh Profiles'}
          </button>

          {savedProfiles.length === 0 ? (
            <p style={{ color: '#777', fontStyle: 'italic' }}>
              {loading ? 'Loading profiles...' : 'No profiles saved yet. Create one to get started.'}
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {savedProfiles.map((profile) => (
                <button
                  key={profile.id}
                  style={{
                    border: selectedProfile?.id === profile.id ? '2px solid #d4a574' : '1px solid #ccc',
                    borderRadius: '6px',
                    padding: '1rem',
                    background: selectedProfile?.id === profile.id ? '#fff9e6' : '#fff',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    textAlign: 'left',
                  }}
                  onClick={() => loadProfile(profile)}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                    <div>
                      <strong style={{ fontSize: '1.1rem' }}>{profile.name}</strong>
                      <br />
                      <span style={{ color: '#666', fontSize: '0.9rem' }}>Device ID: {profile.deviceId}</span>
                      <br />
                      <div style={{ marginTop: '0.5rem', fontSize: '0.9rem', color: '#555' }}>
                        <strong>Metrics:</strong> CPU {profile.cpuUsagePercent ?? '—'}% | Memory {profile.memoryUsagePercent ?? '—'}% |
                        Thermal: {profile.thermalStatus || '—'} | Power: {profile.powerUsageWatts ?? '—'}W
                      </div>
                    </div>
                    <span
                      style={{
                        padding: '0.25rem 0.5rem',
                        background: '#e8e8e8',
                        borderRadius: '4px',
                        fontSize: '0.85rem',
                        textTransform: 'capitalize',
                      }}
                    >
                      {profile.status}
                    </span>
                  </div>
                  <div style={{ marginTop: '0.5rem', fontSize: '0.8rem', color: '#999' }}>
                    Created: {new Date(profile.createdAt).toLocaleString()} |
                    Optimizations: {profile.optimizationCount}
                  </div>
                </button>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
