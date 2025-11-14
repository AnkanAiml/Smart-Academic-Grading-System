import React, { useEffect, useState, useCallback } from "react";
import { getAllReports, updateReport, deleteReport, Report } from "../services/reportService";
import { EditIcon, CheckIcon, CancelIcon, TrashIcon, ReportsIcon, CalculatorIcon, TrendingUpIcon, TrendingDownIcon } from "./icons";
import Spinner from "./Spinner";
import ConfirmationModal from "./ConfirmationModal";

const TeacherDashboard: React.FC = () => {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    avgScore: 0,
    maxScore: 0,
    minScore: 0,
  });

  // State for inline editing
  const [editingReportId, setEditingReportId] = useState<string | null>(null);
  const [newScoreValue, setNewScoreValue] = useState<string>('');
  const [isUpdating, setIsUpdating] = useState<boolean>(false);
  
  // State for deletion modal
  const [reportToDelete, setReportToDelete] = useState<Report | null>(null);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  const fetchReports = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getAllReports();
      setReports(data);
    } catch (error) {
      console.error("Error loading reports:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  // Recalculates stats whenever the reports data changes
  useEffect(() => {
    if (reports.length > 0) {
      const scores = reports.map((r) => r.score);
      const total = reports.length;
      const sum = scores.reduce((a, b) => a + b, 0);
      const avgScore = total > 0 ? sum / total : 0;
      const maxScore = scores.length > 0 ? Math.max(...scores) : 0;
      const minScore = scores.length > 0 ? Math.min(...scores) : 0;
      setStats({ total, avgScore, maxScore, minScore });
    } else {
      setStats({ total: 0, avgScore: 0, maxScore: 0, minScore: 0 });
    }
  }, [reports]);

  const handleStartEditing = (report: Report) => {
    if (report.id) {
        setEditingReportId(report.id);
        setNewScoreValue(report.score.toString());
    }
  };

  const handleCancelEditing = () => {
    setEditingReportId(null);
    setNewScoreValue('');
  };
  
  const handleSaveScore = async (report: Report) => {
    if (!report.id) return;

    const updatedScore = Number(newScoreValue);
    if (isNaN(updatedScore) || updatedScore < 0 || updatedScore > report.maxScore) {
      alert(`❌ Invalid score. Please enter a number between 0 and ${report.maxScore}.`);
      return;
    }
    
    setIsUpdating(true);
    try {
      await updateReport(report.id, { score: updatedScore });
      
      setReports((prevReports) =>
        prevReports.map((rep) =>
          rep.id === report.id ? { ...rep, score: updatedScore } : rep
        )
      );
      
      setEditingReportId(null);
    } catch (err) {
      console.error(err);
      alert("❌ Failed to update marks: " + (err as any).message);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!reportToDelete?.id) return;

    setIsDeleting(reportToDelete.id);
    try {
        await deleteReport(reportToDelete.id);
        setReports((prevReports) => prevReports.filter((rep) => rep.id !== reportToDelete.id));
        setReportToDelete(null);
    } catch (err) {
        console.error(err);
        alert("❌ Failed to delete report: " + (err as any).message);
    } finally {
        setIsDeleting(null);
    }
  };


  if (loading) return (
    <div className="bg-brand-surface p-6 md:p-8 rounded-xl border border-brand-outline">
        <p className="text-text-secondary">Loading dashboard...</p>
    </div>
  );

  return (
    <div className="bg-brand-surface p-6 md:p-8 rounded-xl shadow-2xl shadow-brand-primary/10 border border-brand-outline backdrop-blur-lg">
      <h2 className="text-2xl font-bold text-text-primary mb-6 flex items-center gap-2">
        <ReportsIcon className="w-7 h-7 text-brand-primary" /> Teacher Dashboard
      </h2>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-brand-bg-light/50 p-4 rounded-lg border border-brand-outline">
          <p className="text-sm text-text-secondary flex items-center gap-1.5">
            <ReportsIcon className="w-4 h-4"/>
            Total Reports
          </p>
          <p className="text-2xl font-bold text-text-primary">{stats.total}</p>
        </div>
        <div className="bg-brand-bg-light/50 p-4 rounded-lg border border-brand-outline">
          <p className="text-sm text-text-secondary flex items-center gap-1.5">
            <CalculatorIcon className="w-4 h-4" />
            Average Score
          </p>
          <p className="text-2xl font-bold text-brand-primary">{stats.avgScore.toFixed(2)}</p>
        </div>
        <div className="bg-brand-bg-light/50 p-4 rounded-lg border border-brand-outline">
          <p className="text-sm text-text-secondary flex items-center gap-1.5">
            <TrendingUpIcon className="w-4 h-4" />
            Highest Score
          </p>
          <p className="text-2xl font-bold text-green-400">{stats.maxScore}</p>
        </div>
        <div className="bg-brand-bg-light/50 p-4 rounded-lg border border-brand-outline">
          <p className="text-sm text-text-secondary flex items-center gap-1.5">
            <TrendingDownIcon className="w-4 h-4" />
            Lowest Score
          </p>
          <p className="text-2xl font-bold text-red-400">{stats.minScore}</p>
        </div>
      </div>

      <h3 className="text-xl font-semibold text-text-primary mt-4 mb-4 flex items-center gap-2">
        <ReportsIcon className="w-5 h-5 text-brand-primary" />
        Recent Reports
      </h3>
      {reports.length > 0 ? (
        <ul className="space-y-3">
          {reports.slice(0, 5).map((r) => (
              <li key={r.id} className="flex items-center justify-between p-3 rounded-lg bg-brand-bg-light/50 border border-brand-outline hover:border-brand-primary/50 transition-colors">
                <div className="flex-grow text-sm">
                  <strong className="font-medium text-text-primary">{r.studentName}</strong>
                  <span className="text-text-secondary"> — {r.examId}: </span>
                  {editingReportId === r.id ? (
                     <span className="inline-flex items-center">
                        <input
                            type="number"
                            value={newScoreValue}
                            onChange={(e) => setNewScoreValue(e.target.value)}
                            className="w-16 px-2 py-0.5 mx-1 bg-brand-surface border border-brand-outline rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-secondary text-text-primary"
                            min="0"
                            max={r.maxScore}
                            autoFocus
                        />
                        <span className="text-text-secondary"> / {r.maxScore}</span>
                    </span>
                  ) : (
                    <>
                        <span className="font-semibold text-text-primary">{r.score}</span>
                        <span className="text-text-secondary">/{r.maxScore}</span>
                    </>
                  )}
                </div>
                <div className="flex-shrink-0">
                {editingReportId === r.id ? (
                    <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleSaveScore(r)}
                          disabled={isUpdating}
                          className="p-2 text-green-400 bg-green-900/50 rounded-md hover:bg-green-800/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Save"
                        >
                          <CheckIcon className="w-4 h-4" />
                        </button>
                        <button
                          onClick={handleCancelEditing}
                          disabled={isUpdating}
                          className="p-2 text-red-400 bg-red-900/50 rounded-md hover:bg-red-800/50 transition-colors disabled:opacity-50"
                          title="Cancel"
                        >
                          <CancelIcon className="w-4 h-4" />
                        </button>
                    </div>
                ) : (
                    <div className="flex items-center space-x-2">
                        <button
                            className="flex items-center space-x-2 px-3 py-1 text-xs font-medium text-brand-primary bg-brand-primary/10 rounded-md hover:bg-brand-primary/20 border border-transparent hover:border-brand-primary/50 transition-all duration-300"
                            onClick={() => handleStartEditing(r)}
                        >
                            <EditIcon className="w-3 h-3" />
                            <span>Edit Marks</span>
                        </button>
                        <button
                          onClick={() => setReportToDelete(r)}
                          disabled={!!isDeleting}
                          className="p-2 text-red-400 bg-red-900/50 rounded-md hover:bg-red-800/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Delete Report"
                        >
                          <TrashIcon className="w-4 h-4" />
                        </button>
                    </div>
                )}
                </div>
              </li>
            ))}
        </ul>
      ) : (
         <p className="text-text-secondary italic">No reports found in the database yet.</p>
      )}

      <ConfirmationModal
        isOpen={!!reportToDelete}
        onClose={() => !isDeleting && setReportToDelete(null)}
        onConfirm={handleConfirmDelete}
        isProcessing={!!isDeleting}
        title="Confirm Deletion"
      >
        <p>
            Are you sure you want to permanently delete the report for{' '}
            <strong className="text-text-primary">{reportToDelete?.studentName}</strong> ({reportToDelete?.examId})?
        </p>
        <p className="mt-2 text-sm">This action cannot be undone.</p>
      </ConfirmationModal>
    </div>
  );
};

export default TeacherDashboard;