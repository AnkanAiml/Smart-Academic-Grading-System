import React, { useState, useEffect, useMemo } from 'react';
import { EvaluationResult } from '../types';
import { PlagiarismIcon, GradeIcon, TextIcon, ResetIcon, EditIcon, PdfIcon, CheckIcon, CancelIcon } from './icons';

interface ResultDisplayProps {
  result: EvaluationResult;
  isStudentView: boolean;
  imagePreview: string | null;
  onReset: () => void;
  onUpdateRecord?: (updatedRecord: EvaluationResult) => void;
  isNewEvaluation?: boolean;
  onConfirmSave?: (result: EvaluationResult) => void;
  onDiscard?: () => void;
}

const ResultDisplay: React.FC<ResultDisplayProps> = ({ 
    result, 
    isStudentView, 
    imagePreview, 
    onReset, 
    onUpdateRecord,
    isNewEvaluation = false,
    onConfirmSave,
    onDiscard
}) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editedResult, setEditedResult] = useState<EvaluationResult>(() => JSON.parse(JSON.stringify(result)));

    useEffect(() => {
        setEditedResult(JSON.parse(JSON.stringify(result)));
        setIsEditing(false);
    }, [result]);

    const { collegeId, studentName, rollNo, subject, extractedText, plagiarismReport, summary } = editedResult;
    const evaluation = editedResult.evaluation;
    
    const handleDownloadPdf = () => {
        window.print();
    };
    
    const highlightedText = useMemo(() => {
        if (!extractedText || !plagiarismReport.matches || plagiarismReport.matches.length === 0) {
            return extractedText;
        }
    
        const sortedMatches = [...plagiarismReport.matches]
            .filter(match => match.studentText)
            .sort((a, b) => extractedText.indexOf(b.studentText) - extractedText.indexOf(a.studentText));
    
        let tempText = extractedText;
        sortedMatches.forEach(match => {
            const index = tempText.indexOf(match.studentText);
            if (index !== -1) {
                const before = tempText.substring(0, index);
                const after = tempText.substring(index + match.studentText.length);
                const highlighted = `<mark class="bg-brand-secondary/40 text-text-primary rounded px-1" title="Possible Source: ${match.source}">${match.studentText}</mark>`;
                tempText = before + highlighted + after;
            }
        });
        return tempText;
    }, [extractedText, plagiarismReport.matches]);
    
    const handleSummaryChange = (field: 'overallFeedback', value: string) => {
        setEditedResult(prev => ({
            ...prev,
            summary: { ...prev.summary, [field]: value }
        }));
    };

    const handleEvaluationItemChange = (index: number, field: 'feedback' | 'studentAnswer', value: string) => {
        const updatedEvaluation = [...evaluation];
        updatedEvaluation[index] = { ...updatedEvaluation[index], [field]: value };
        setEditedResult(prev => ({ ...prev, evaluation: updatedEvaluation }));
    };

    const handleMarksChange = (index: number, newMarks: number) => {
        const updatedEvaluation = [...evaluation];
        const maxMarks = updatedEvaluation[index].maxMarks;
        const clampedMarks = Math.max(0, Math.min(newMarks || 0, maxMarks));

        updatedEvaluation[index] = { ...updatedEvaluation[index], marksAwarded: clampedMarks };
        setEditedResult({ ...editedResult, evaluation: updatedEvaluation });
    };
    
    const calculateGrade = (totalMarksAwarded: number, totalMaxMarks: number): string => {
        if (totalMaxMarks === 0) return 'N/A';
        const percentage = (totalMarksAwarded / totalMaxMarks) * 100;
        if (percentage >= 90) return 'A+';
        if (percentage >= 80) return 'A';
        if (percentage >= 70) return 'B+';
        if (percentage >= 60) return 'B';
        if (percentage >= 50) return 'C+';
        if (percentage >= 40) return 'C';
        if (percentage >= 30) return 'D';
        return 'F';
    };

    const handleSaveNewReport = () => {
        if (onConfirmSave) {
            const newTotalMarks = editedResult.evaluation.reduce((acc, item) => acc + item.marksAwarded, 0);
            const newGrade = calculateGrade(newTotalMarks, editedResult.summary.totalMaxMarks);
            const finalResult: EvaluationResult = {
                ...editedResult,
                summary: { ...editedResult.summary, totalMarksAwarded: newTotalMarks, finalGrade: newGrade }
            };
            onConfirmSave(finalResult);
        }
    };

    const handleSaveChanges = () => {
        const newTotalMarks = editedResult.evaluation.reduce((acc, item) => acc + item.marksAwarded, 0);
        const newGrade = calculateGrade(newTotalMarks, editedResult.summary.totalMaxMarks);
        
        const finalResult: EvaluationResult = {
            ...editedResult,
            summary: { ...editedResult.summary, totalMarksAwarded: newTotalMarks, finalGrade: newGrade }
        };

        if (onUpdateRecord) onUpdateRecord(finalResult);
        setIsEditing(false);
    };

    const handleCancel = () => {
        setEditedResult(JSON.parse(JSON.stringify(result)));
        setIsEditing(false);
    };

    const getGradeColor = (grade: string) => {
        if (['A+', 'A'].includes(grade)) return 'text-green-400';
        if (['B+', 'B'].includes(grade)) return 'text-cyan-400';
        if (['C+', 'C'].includes(grade)) return 'text-yellow-400';
        if (['D'].includes(grade)) return 'text-orange-400';
        return 'text-red-400';
    }
    
    const backButtonText = isStudentView ? 'Back to Submissions' : 'Back to Dashboard';
    
    const scorePercentage = summary.totalMaxMarks > 0 ? (summary.totalMarksAwarded / summary.totalMaxMarks) * 100 : 0;
    const plagiarismClarityPercentage = 100 - (plagiarismReport.plagiarismPercentage || 0); 
    const plagiarismProgressColor = plagiarismReport.plagiarismPercentage > 5 ? 'bg-yellow-400' : 'bg-green-500';

    return (
        <div id="printable-area" className="print-container">
            <div className="bg-brand-surface p-6 md:p-8 rounded-xl shadow-2xl shadow-brand-primary/10 border border-brand-outline backdrop-blur-lg">
                <div className="flex justify-between items-start mb-8 gap-4 print:hidden">
                    <div>
                        <h2 className="text-2xl font-bold text-text-primary">Evaluation Report</h2>
                        <p className="text-text-secondary mt-1">{isEditing ? `Editing record for Submission ID: ${collegeId}` : `${studentName} (${rollNo}) - ${subject}`}</p>
                    </div>
                     <div className="flex items-center space-x-2 flex-shrink-0">
                          <button onClick={onReset} className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-text-secondary bg-brand-bg-light rounded-md hover:text-text-primary border border-brand-outline hover:border-brand-primary transition-colors">
                            <ResetIcon />
                            <span>{backButtonText}</span>
                          </button>
                        {!isStudentView && !isNewEvaluation && (
                             isEditing ? (
                                <>
                                    <button onClick={handleSaveChanges} className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-500 transition-colors"><CheckIcon/><span>Save</span></button>
                                    <button onClick={handleCancel} className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-slate-300 bg-slate-600 rounded-md hover:bg-slate-500"><CancelIcon/><span>Cancel</span></button>
                                </>
                            ) : (
                                <>
                                    <button onClick={() => setIsEditing(true)} className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-brand-primary bg-brand-primary/10 rounded-md hover:bg-brand-primary/20 border border-brand-primary/0 hover:border-brand-primary/50 transition-all">
                                        <EditIcon /><span>Edit</span>
                                    </button>
                                    <button onClick={handleDownloadPdf} className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-brand-secondary bg-brand-secondary/10 rounded-md hover:bg-brand-secondary/20 border border-brand-secondary/0 hover:border-brand-secondary/50 transition-all">
                                        <PdfIcon /><span>PDF</span>
                                    </button>
                                </>
                            )
                        )}
                    </div>
                </div>

                {isNewEvaluation && !isStudentView && (
                    <div className="mb-8 p-4 bg-brand-bg-light/80 border border-brand-primary rounded-lg flex flex-col sm:flex-row justify-between items-center gap-4">
                        <div>
                            <h3 className="font-semibold text-text-primary">New Evaluation Complete</h3>
                            <p className="text-sm text-text-secondary">Do you want to save this report to the database?</p>
                        </div>
                        <div className="flex items-center space-x-3 flex-shrink-0">
                            <button onClick={onDiscard} className="px-4 py-2 text-sm font-medium text-slate-300 bg-slate-600 rounded-md hover:bg-slate-500 transition-colors">Discard</button>
                            <button onClick={handleSaveNewReport} className="px-4 py-2 text-sm font-medium text-white bg-brand-primary rounded-md hover:bg-brand-secondary transition-colors">Save Report</button>
                        </div>
                    </div>
                )}


                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    {[{icon: <GradeIcon />, label: "Final Grade", value: summary.finalGrade, color: getGradeColor(summary.finalGrade)},
                     {icon: <GradeIcon />, label: "Total Score", value: `${summary.totalMarksAwarded} / ${summary.totalMaxMarks}`, progress: scorePercentage, progressColor: 'bg-brand-primary'},
                     {icon: <PlagiarismIcon />, label: "Plagiarism", value: `${plagiarismReport.plagiarismPercentage}% (${plagiarismReport.status})`, color: plagiarismReport.plagiarismPercentage > 5 ? 'text-yellow-400' : 'text-green-400', progress: plagiarismClarityPercentage, progressColor: plagiarismProgressColor}
                    ].map(item => (
                        <div key={item.label} className="bg-brand-bg-light/50 p-4 rounded-lg border border-brand-outline space-y-3">
                            <div className="flex items-center space-x-4"><div className="bg-brand-primary/10 p-3 rounded-full">{item.icon}</div><div><p className="text-sm text-text-secondary">{item.label}</p><p className={`text-2xl font-bold ${item.color || 'text-text-primary'}`}>{item.value}</p></div></div>
                            {item.progress !== undefined && <div className="w-full bg-brand-outline rounded-full h-1.5"><div className={`${item.progressColor} h-1.5 rounded-full`} style={{ width: `${item.progress}%` }}></div></div>}
                        </div>
                    ))}
                </div>
                
                <div className="mb-8"><h3 className="text-lg font-semibold text-text-primary">Overall Feedback</h3>
                    {isEditing ? (
                        <textarea value={summary.overallFeedback} onChange={(e) => handleSummaryChange('overallFeedback', e.target.value)} className="mt-2 w-full p-2 bg-brand-surface border border-brand-outline rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-secondary text-text-secondary" rows={4} />
                    ) : (
                        <p className="text-text-secondary mt-1 p-4 bg-brand-bg-light/30 border-l-4 border-brand-primary rounded-r-lg">{summary.overallFeedback}</p>
                    )}
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="space-y-6">
                         <div>
                            <h3 className="text-lg font-semibold mb-2 flex items-center text-text-primary"><PlagiarismIcon /> <span className="ml-2">Plagiarism Report</span></h3>
                            <div className="p-4 rounded-lg text-sm bg-brand-bg-light/50 border border-brand-outline space-y-3">
                                <p className="font-semibold text-base">{plagiarismReport.status} ({plagiarismReport.plagiarismPercentage}%)</p>
                                <p className="text-text-secondary">{plagiarismReport.summary}</p>
                            </div>
                        </div>
                         { !isStudentView && (
                            <div>
                                <h3 className="text-lg font-semibold mb-2 flex items-center text-text-primary"><TextIcon /> <span className="ml-2">Extracted & Highlighted Text</span></h3>
                                <div className="p-4 bg-brand-bg-light/50 border border-brand-outline rounded-lg text-text-secondary whitespace-pre-wrap text-sm max-h-96 overflow-y-auto" dangerouslySetInnerHTML={{ __html: highlightedText }} />
                            </div>
                        )}
                    </div>

                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold mb-2 text-text-primary">Detailed Grade Breakdown</h3>
                        {evaluation.map((item, index) => (
                            <div key={index} className="p-4 border border-brand-outline rounded-lg bg-brand-bg-light/50">
                                <div className="flex justify-between items-start gap-4">
                                    <h4 className="font-semibold text-text-primary flex-1">{item.question}</h4>
                                    {isEditing ? (
                                        <div className="flex items-center space-x-2"><input type="number" value={item.marksAwarded} onChange={(e) => handleMarksChange(index, e.target.valueAsNumber)} min="0" max={item.maxMarks} className="w-20 px-2 py-1 bg-brand-surface border border-brand-outline rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-secondary text-text-primary" /><span className="font-normal text-text-secondary">/ {item.maxMarks}</span></div>
                                    ) : (
                                        <p className="font-bold text-lg text-brand-primary">{item.marksAwarded}<span className="text-sm font-normal text-text-secondary">/{item.maxMarks}</span></p>
                                    )}
                                </div>
                                <p className="text-sm text-text-secondary mt-2 mb-3"><span className="font-semibold">Student's Answer:</span> "{item.studentAnswer}"</p>
                                {isEditing ? (
                                    <div>
                                        <label className="text-sm font-semibold text-text-primary">Feedback:</label>
                                        <textarea value={item.feedback} onChange={(e) => handleEvaluationItemChange(index, 'feedback', e.target.value)} className="mt-1 w-full p-2 bg-brand-surface border border-brand-outline rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-secondary text-text-secondary" rows={3} />
                                    </div>
                                ) : (
                                    <p className="text-sm p-3 bg-brand-surface rounded-md"><span className="font-semibold text-text-primary">Feedback:</span> <span className="text-text-secondary">{item.feedback}</span></p>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ResultDisplay;
