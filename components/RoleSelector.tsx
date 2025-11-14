import React from 'react';
import { UserRole } from '../types';
import { LogoIcon, TeacherIcon, StudentIcon } from './icons';

interface RoleSelectorProps {
  onSelectRole: (role: UserRole) => void;
}

const RoleSelector: React.FC<RoleSelectorProps> = ({ onSelectRole }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
      <div className="mb-12">
        <LogoIcon className="h-16 w-16 text-brand-primary mx-auto" />
        <h1 className="text-4xl font-bold text-text-primary mt-4 tracking-wide">Welcome to Academic Grading System</h1>
        <p className="text-text-secondary mt-2 max-w-md">The future of intelligent assessment. Please select your role to continue.</p>
      </div>
      
      <div className="flex flex-col md:flex-row gap-8">
        <div
          onClick={() => onSelectRole(UserRole.Teacher)}
          className="group cursor-pointer p-8 bg-brand-surface border border-brand-outline rounded-2xl w-64 h-64 flex flex-col items-center justify-center transition-all duration-300 hover:border-brand-primary hover:shadow-glow-primary hover:-translate-y-2"
        >
          <TeacherIcon className="w-16 h-16 text-text-secondary group-hover:text-brand-primary transition-colors" />
          <h2 className="text-2xl font-bold mt-4 text-text-primary">Teacher</h2>
          <p className="text-text-secondary mt-1 text-sm">Evaluate & manage submissions.</p>
        </div>
        
        <div
          onClick={() => onSelectRole(UserRole.Student)}
          className="group cursor-pointer p-8 bg-brand-surface border border-brand-outline rounded-2xl w-64 h-64 flex flex-col items-center justify-center transition-all duration-300 hover:border-brand-secondary hover:shadow-glow-secondary hover:-translate-y-2"
        >
          <StudentIcon className="w-16 h-16 text-text-secondary group-hover:text-brand-secondary transition-colors" />
          <h2 className="text-2xl font-bold mt-4 text-text-primary">Student</h2>
          <p className="text-text-secondary mt-1 text-sm">View your grades & feedback.</p>
        </div>
      </div>
    </div>
  );
};

export default RoleSelector;