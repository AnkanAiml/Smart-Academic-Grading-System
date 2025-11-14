import React from 'react';
import { EvaluationResult, StudentRecords } from '../types';
import { SearchIcon } from './icons';

interface RecordListProps {
  records: StudentRecords | EvaluationResult[];
  onSelectRecord: (collegeId: string) => void;
  isStudentView?: boolean;
  searchQuery?: string;
  setSearchQuery?: (query: string) => void;
}

const RecordList: React.FC<RecordListProps> = ({ records, onSelectRecord, isStudentView = false, searchQuery, setSearchQuery }) => {
  const recordArray = Array.isArray(records) ? records : Object.values(records);

  const containerClasses = "bg-brand-surface p-6 md:p-8 rounded-xl shadow-2xl shadow-brand-primary/10 border border-brand-outline backdrop-blur-lg";

  if (recordArray.length === 0 && !isStudentView) {
    return (
      <div className={containerClasses}>
        <h2 className="text-2xl font-bold text-text-primary mb-4">Past Evaluations</h2>
        <p className="text-text-secondary">No records found. Evaluate a paper to see the record here.</p>
      </div>
    );
  }

  return (
    <div className={containerClasses}>
      <div className="flex justify-between items-center mb-4">
        {!isStudentView && <h2 className="text-2xl font-bold text-text-primary">Past Evaluations</h2>}
        {!isStudentView && setSearchQuery && (
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <SearchIcon />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, roll no, ID..."
              className="block w-64 pl-10 pr-3 py-2 bg-brand-surface border border-brand-outline rounded-md focus:outline-none focus:ring-2 focus:ring-brand-secondary text-text-primary placeholder:text-text-secondary/70"
            />
          </div>
        )}
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left text-text-secondary">
          <thead className="text-xs text-text-primary uppercase bg-brand-surface/50">
            <tr>
              <th scope="col" className="px-6 py-3">Submission Date</th>
              {!isStudentView && <th scope="col" className="px-6 py-3">Student</th>}
              <th scope="col" className="px-6 py-3">Subject</th>
              <th scope="col" className="px-6 py-3">Score</th>
              <th scope="col" className="px-6 py-3">Plagiarism</th>
              <th scope="col" className="px-6 py-3"><span className="sr-only">View</span></th>
            </tr>
          </thead>
          <tbody>
            {recordArray.map(record => {
              const { collegeId, studentName, rollNo, subject, submissionDate, summary, plagiarismReport } = record;
              const isPlagiarism = plagiarismReport.status === 'Plagiarism Detected';
              const scorePercentage = summary.totalMaxMarks > 0 ? (summary.totalMarksAwarded / summary.totalMaxMarks) * 100 : 0;
              
              return (
                <tr key={collegeId} className="border-b border-brand-outline hover:bg-brand-bg-light/50 transition-colors">
                  <td className="px-6 py-4 font-medium text-text-primary whitespace-nowrap">
                    {new Date(submissionDate).toLocaleDateString()}
                  </td>
                  {!isStudentView && (
                    <td className="px-6 py-4">
                      <div className="text-text-primary font-medium">{studentName}</div>
                      <div className="text-xs">{rollNo}</div>
                    </td>
                  )}
                  <td className="px-6 py-4">{subject}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-between">
                      <span className="text-text-primary">{summary.totalMarksAwarded}/{summary.totalMaxMarks}</span>
                      <span className="font-semibold text-brand-primary">{summary.finalGrade}</span>
                    </div>
                    <div className="w-full bg-brand-outline rounded-full h-1 mt-2">
                        <div className="bg-brand-primary h-1 rounded-full" style={{ width: `${scorePercentage}%` }}></div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${isPlagiarism ? 'bg-yellow-900/50 text-yellow-300' : 'bg-green-900/50 text-green-300'}`}>
                      {plagiarismReport.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button onClick={() => onSelectRecord(collegeId)} className="font-medium text-brand-primary hover:text-brand-secondary">View</button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
         {recordArray.length === 0 && !isStudentView && (
            <div className="text-center py-8 text-text-secondary">
                No results found for your search.
            </div>
        )}
      </div>
    </div>
  );
};

export default RecordList;