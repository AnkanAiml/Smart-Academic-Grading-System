import React, { useState, useCallback, useRef } from 'react';
import { UploadIcon, DocumentIcon, ChatIcon } from './icons';
import { extractTextFromFile } from '../services/geminiService';
import RulesChatModal from './RulesChatModal';

interface EvaluationInputProps {
  onEvaluate: (collegeId: string, studentName: string, rollNo: string, subject: string, questionPaperText: string, answerSheetText: string, customRules: string) => void;
  isLoading: boolean;
}

const EvaluationInput: React.FC<EvaluationInputProps> = ({ onEvaluate, isLoading }) => {
  const [collegeId, setCollegeId] = useState('');
  const [studentName, setStudentName] = useState('');
  const [rollNo, setRollNo] = useState('');
  const [subject, setSubject] = useState('');
  const [questionPaperFile, setQuestionPaperFile] = useState<File | null>(null);
  const [answerSheetFile, setAnswerSheetFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [customRules, setCustomRules] = useState('');
  const [isChatModalOpen, setIsChatModalOpen] = useState(false);
  
  const answerSheetInputRef = useRef<HTMLInputElement>(null);
  const questionPaperInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>, fileType: 'answer' | 'question') => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type === 'application/pdf') {
        if(fileType === 'answer') setAnswerSheetFile(file);
        else setQuestionPaperFile(file);
        setError(null);
      } else {
        setError('Please upload a valid PDF file.');
        if(fileType === 'answer') setAnswerSheetFile(null);
        else setQuestionPaperFile(null);
      }
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!collegeId || !studentName || !rollNo || !subject || !questionPaperFile || !answerSheetFile) {
      setError('Please fill out all fields and upload both PDF files.');
      return;
    }
    setError(null);
    
    try {
        const questionText = await extractTextFromFile(questionPaperFile);
        const answerText = await extractTextFromFile(answerSheetFile);
        onEvaluate(collegeId, studentName, rollNo, subject, questionText, answerText, customRules);
    } catch (err) {
        console.error(err);
        setError("Failed to process PDF files. Check console for details.");
    }
  };
  
  const handleDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    event.currentTarget.classList.add('border-brand-primary');
  }, []);

  const handleDragLeave = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    event.currentTarget.classList.remove('border-brand-primary');
  }, []);

  const handleDrop = useCallback((event: React.DragEvent<HTMLDivElement>, fileType: 'answer' | 'question') => {
    event.preventDefault();
    event.stopPropagation();
    event.currentTarget.classList.remove('border-brand-primary');
    const file = event.dataTransfer.files?.[0];
    if (file && (file.type === 'application/pdf')) {
        if(fileType === 'answer') setAnswerSheetFile(file);
        else setQuestionPaperFile(file);
        setError(null);
    } else {
        setError('Please drop a valid PDF file.');
    }
  }, []);

  const handleSaveRules = (rules: string) => {
    setCustomRules(rules);
    setIsChatModalOpen(false);
  };

  const FileInput = ({ file, onDrop, onDragOver, onDragLeave, onClick, inputRef, onChange, fileType, title, icon: Icon }) => (
    <div>
        <label className="block text-sm font-medium text-text-secondary mb-2">
            {title}
        </label>
        <div 
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={(e) => onDrop(e, fileType)}
            onClick={onClick}
            className="mt-1 flex justify-center p-6 border-2 border-brand-outline border-dashed rounded-xl cursor-pointer hover:border-brand-primary transition-all duration-300 bg-brand-bg-light/50"
        >
            <div className="space-y-1 text-center">
                <Icon />
                <div className="flex text-sm text-text-secondary">
                    <p className="pl-1 truncate max-w-xs">
                        {file ? file.name : `Upload or drop ${title}`}
                    </p>
                </div>
                <p className="text-xs text-text-secondary/70">PDF only</p>
                <input ref={inputRef} type="file" className="sr-only" onChange={(e) => onChange(e, fileType)} accept="application/pdf"/>
            </div>
        </div>
    </div>
  );

  return (
    <>
      <div className="bg-brand-surface p-6 md:p-8 rounded-xl shadow-2xl shadow-brand-primary/10 border border-brand-outline backdrop-blur-lg">
        <h2 className="text-2xl font-bold text-text-primary mb-6">New Evaluation</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[{id: 'studentName', label: 'Student Name', value: studentName, setter: setStudentName, placeholder: 'e.g., John Doe'},
              {id: 'rollNo', label: 'Roll No.', value: rollNo, setter: setRollNo, placeholder: 'e.g., 101'},
              {id: 'subject', label: 'Subject', value: subject, setter: setSubject, placeholder: 'e.g., Physics'},
              {id: 'collegeId', label: 'Submission ID (Unique)', value: collegeId, setter: setCollegeId, placeholder: 'e.g., PHY-101-2024'}].map(field => (
                  <div key={field.id}>
                      <label htmlFor={field.id} className="block text-sm font-medium text-text-secondary mb-1">
                          {field.label}
                      </label>
                      <input
                          type="text"
                          id={field.id}
                          value={field.value}
                          onChange={(e) => field.setter(e.target.value)}
                          placeholder={field.placeholder}
                          className="block w-full px-3 py-2 bg-brand-surface border border-brand-outline rounded-md shadow-sm placeholder-text-secondary/60 focus:outline-none focus:ring-2 focus:ring-brand-secondary text-text-primary"
                      />
                  </div>
              ))}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FileInput file={questionPaperFile} onDrop={handleDrop} onDragOver={handleDragOver} onDragLeave={handleDragLeave} onClick={() => questionPaperInputRef.current?.click()} inputRef={questionPaperInputRef} onChange={handleFileChange} fileType='question' title='Question Paper' icon={DocumentIcon}/>
              <FileInput file={answerSheetFile} onDrop={handleDrop} onDragOver={handleDragOver} onDragLeave={handleDragLeave} onClick={() => answerSheetInputRef.current?.click()} inputRef={answerSheetInputRef} onChange={handleFileChange} fileType='answer' title='Answer Sheet' icon={UploadIcon}/>
          </div>
          
          <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">Custom Evaluation Rules (Optional)</label>
              <div className="p-4 bg-brand-bg-light/50 border border-brand-outline rounded-xl space-y-3">
                  {customRules ? (
                      <div className="text-sm text-text-secondary whitespace-pre-wrap max-h-40 overflow-y-auto">{customRules}</div>
                  ) : (
                      <p className="text-sm text-text-secondary/70">No custom rules set. The AI will use a general marking scheme.</p>
                  )}
                  <button
                      type="button"
                      onClick={() => setIsChatModalOpen(true)}
                      className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-brand-primary bg-brand-primary/10 rounded-md hover:bg-brand-primary/20 border border-transparent hover:border-brand-primary/50 transition-all"
                  >
                      <ChatIcon className="w-4 h-4" />
                      <span>{customRules ? 'Edit Rules with AI' : 'Set Rules with AI'}</span>
                  </button>
              </div>
          </div>
          
          {error && <p className="text-sm text-red-400">{error}</p>}

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              disabled={isLoading}
              className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-lg text-white bg-brand-primary hover:bg-brand-secondary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary/50 disabled:bg-brand-primary/50 disabled:cursor-not-allowed transition-all duration-300 hover:scale-105 shadow-brand-primary/30 hover:shadow-brand-secondary/40"
            >
              {isLoading ? 'Evaluating...' : 'Evaluate with AI'}
            </button>
          </div>
        </form>
      </div>
      <RulesChatModal 
          isOpen={isChatModalOpen}
          onClose={() => setIsChatModalOpen(false)}
          onSave={handleSaveRules}
          initialRules={customRules}
      />
    </>
  );
};

export default EvaluationInput;