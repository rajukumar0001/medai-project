import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import PageLayout from '../components/common/PageLayout';
import RiskBadge from '../components/common/RiskBadge';
import EmptyState from '../components/common/EmptyState';
import ConfirmModal from '../components/common/ConfirmModal';
import { getPredictionHistory, deletePrediction } from '../api/predictions';
import { getReports, deleteReport } from '../api/reports';
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
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchData = useCallback(async () => {
    setLoading(true);

    try {
      if (tab === 'predictions') {
        const res = await getPredictionHistory({ page, limit: 10 });

        const data = res?.data || {};
        const items =
          data.predictions ||
          data.history ||
          data.data ||
          [];

        const pages =
          data.pagination?.totalPages ||
          data.pagination?.total ||
          1;

        setPredictions(Array.isArray(items) ? items : []);
        setTotalPages(pages);
      } else {
        const res = await getReports({ page, limit: 10 });

        const data = res?.data || {};
        const items =
          data.reports ||
          data.data ||
          [];

        const pages =
          data.pagination?.totalPages ||
          data.pagination?.total ||
          1;

        setReports(Array.isArray(items) ? items : []);
        setTotalPages(pages);
      }
    } catch (error) {
      console.error(error);
      toast.error('Failed to load history');
      setPredictions([]);
      setReports([]);
    } finally {
      setLoading(false);
    }
  }, [tab, page]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

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
      .includes(search.toLowerCase()) ||
    (r?.reportType || '')
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  const statusColor = {
    completed: '#10b981',
    processing: '#f59e0b',
    failed: '#f43f5e',
    pending: '#94a3b8'
  };

  return (
    <PageLayout>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ marginBottom: 24 }}
      >
        <h1 style={{ fontSize: '1.8rem' }}>📋 History</h1>
        <p>View and manage all your predictions and reports.</p>
      </motion.div>

      <div style={{ marginBottom: 20 }}>
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
            description="Run your first prediction."
            action={
              <Link to="/predict">
                Start Predicting
              </Link>
            }
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

              <RiskBadge
                risk={pred?.result?.riskLevel}
              />

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
          <div key={rep._id}>
            <h3>{rep.originalName}</h3>

            <p>
              {rep.reportType} •{' '}
              {formatBytes(rep.fileSize)}
            </p>

            <span
              style={{
                color:
                  statusColor[
                    rep.processingStatus
                  ] || '#94a3b8'
              }}
            >
              {rep.processingStatus}
            </span>
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