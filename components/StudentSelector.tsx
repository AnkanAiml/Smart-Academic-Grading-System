import React from 'react';

interface StudentSelectorProps {
  students: { name: string; rollNo: string }[];
  onSelectStudent: (identifier: string) => void;
}

const StudentSelector: React.FC<StudentSelectorProps> = ({ students, onSelectStudent }) => {
  return (
    <div className="text-center p-10 md:p-16 bg-brand-surface border border-brand-outline rounded-lg shadow-2xl shadow-brand-primary/10 backdrop-blur-lg">
      <h2 className="text-2xl font-semibold text-text-primary">Student Portal</h2>
      <p className="mt-2 text-text-secondary mb-8">Select your name to view your submissions.</p>
      
      <div className="max-w-xs mx-auto">
        <select
          onChange={(e) => onSelectStudent(e.target.value)}
          defaultValue=""
          className="block w-full px-4 py-3 bg-brand-surface border border-brand-outline rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-secondary text-text-primary"
          aria-label="Select a student"
        >
          <option value="" disabled>-- Select your name --</option>
          {students.map(({name, rollNo}) => {
            const identifier = `${name}-${rollNo}`;
            return <option key={identifier} value={identifier}>{name} ({rollNo})</option>
          })}
        </select>
      </div>
    </div>
  );
};

export default StudentSelector;