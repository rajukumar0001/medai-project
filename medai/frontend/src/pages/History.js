import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import PageLayout from '../components/common/PageLayout';
import RiskBadge from '../components/common/RiskBadge';
import EmptyState from '../components/common/EmptyState';
import ConfirmModal from '../components/common/ConfirmModal';
import {
  getPredictionHistory,
  deletePrediction
} from '../api/predictions';
import {
  getReports,
  deleteReport,
  downloadReport
} from '../api/reports';
import {
  DISEASE_LABELS,
  DISEASE_ICONS,
  formatDateTime,
  formatBytes
} from '../utils/helpers';
import toast from 'react-hot-toast';

const History = () => {
  const [tab, setTab] = useState('predictions');
  const [predictions, setPredictions] = useState([]);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      if (tab === 'predictions') {
        const res = await getPredictionHistory();
        setPredictions(res.data.predictions || []);
      } else {
        const res = await getReports();
        setReports(res.data.reports || []);
      }
    } catch {
      toast.error('Failed to load history');
    } finally {
      setLoading(false);
    }
  }, [tab]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleDownload = async (id, fileName) => {
    try {
      const res = await downloadReport(id);

      const url = window.URL.createObjectURL(
        new Blob([res.data])
      );

      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName || 'report');
      document.body.appendChild(link);
      link.click();
      link.remove();

      toast.success('Download started');
    } catch {
      toast.error('Download failed');
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;

    try {
      if (deleteTarget.type === 'prediction') {
        await deletePrediction(deleteTarget.id);
        setPredictions((prev) =>
          prev.filter((x) => x._id !== deleteTarget.id)
        );
      } else {
        await deleteReport(deleteTarget.id);
        setReports((prev) =>
          prev.filter((x) => x._id !== deleteTarget.id)
        );
      }

      toast.success('Deleted successfully');
    } catch {
      toast.error('Delete failed');
    } finally {
      setDeleteTarget(null);
    }
  };

  const filteredPredictions = predictions.filter((p) =>
    (DISEASE_LABELS[p?.diseaseType] || '')
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  const filteredReports = reports.filter((r) =>
    (r?.originalName || '')
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  return (
    <PageLayout>
      <h1>📋 History</h1>

      <div style={{ marginBottom: '20px' }}>
        <button onClick={() => setTab('predictions')}>
          Predictions
        </button>

        <button onClick={() => setTab('reports')}>
          Reports
        </button>

        <input
          placeholder="Search..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : tab === 'predictions' ? (
        filteredPredictions.length === 0 ? (
          <EmptyState
            icon="🔬"
            title="No predictions yet"
            description="Run prediction first."
          />
        ) : (
          filteredPredictions.map((pred) => (
            <div key={pred._id}>
              <h3>
                {DISEASE_ICONS[pred.diseaseType]}{' '}
                {DISEASE_LABELS[pred.diseaseType]}
              </h3>

              <p>{formatDateTime(pred.createdAt)}</p>

              <p>
                {pred?.result?.probability || 0}% risk
              </p>

              <RiskBadge risk={pred?.result?.riskLevel} />

              <Link to={`/results/${pred._id}`}>
                View
              </Link>

              <button
                onClick={() =>
                  setDeleteTarget({
                    id: pred._id,
                    type: 'prediction'
                  })
                }
              >
                Delete
              </button>
            </div>
          ))
        )
      ) : filteredReports.length === 0 ? (
        <EmptyState
          icon="📄"
          title="No reports"
          description="Upload reports first."
        />
      ) : (
        filteredReports.map((rep) => (
          <div
            key={rep._id}
            style={{
              background: '#1e293b',
              padding: '15px',
              marginBottom: '15px',
              borderRadius: '12px',
              color: 'white'
            }}
          >
            <h3>{rep.originalName}</h3>

            <p>
              {rep.reportType} •{' '}
              {formatBytes(rep.fileSize)}
            </p>

            <p>Status: {rep.processingStatus}</p>

            <div
              style={{
                display: 'flex',
                gap: '10px',
                marginTop: '10px'
              }}
            >
              <button
                onClick={() =>
                  handleDownload(
                    rep._id,
                    rep.originalName
                  )
                }
              >
                Download
              </button>

              <button
                onClick={() =>
                  setDeleteTarget({
                    id: rep._id,
                    type: 'report'
                  })
                }
              >
                Delete
              </button>
            </div>
          </div>
        ))
      )}

      <ConfirmModal
        open={!!deleteTarget}
        title="Delete Item"
        message="Are you sure?"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        confirmLabel="Delete"
        danger
      />
    </PageLayout>
  );
};

export default History;