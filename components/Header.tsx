import React from 'react';
import { UserRole } from '../types';
import { TeacherIcon, StudentIcon, LogoIcon, LogoutIcon } from './icons';

interface HeaderProps {
  userRole: UserRole;
  onLogout: () => void;
}

const Header: React.FC<HeaderProps> = ({ userRole, onLogout }) => {
  const isTeacher = userRole === UserRole.Teacher;

  return (
    <header className="bg-brand-surface/50 border-b border-brand-outline backdrop-blur-lg print:hidden sticky top-0 z-50">
      <div className="container mx-auto px-4 md:px-8 py-4 flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <LogoIcon />
          <h1 className="text-xl md:text-2xl font-bold text-text-primary tracking-wider">
            Academic Grading System
          </h1>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="hidden sm:flex items-center space-x-2 text-text-secondary p-2 bg-brand-bg-light rounded-full border border-brand-outline">
            {isTeacher ? <TeacherIcon /> : <StudentIcon />}
            <span className="text-sm font-medium pr-2">{userRole} Dashboard</span>
          </div>
          
          <button
            onClick={onLogout}
            className="flex items-center space-x-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 bg-brand-bg-light border border-brand-outline text-text-secondary hover:text-brand-secondary hover:border-brand-secondary/80"
            title="Logout"
          >
            <LogoutIcon />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;