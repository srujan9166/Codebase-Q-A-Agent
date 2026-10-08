import React from 'react';
import Header from './Header';
import Sidebar from './Sidebar';

export default function MainLayout({ children, activeTab, setActiveTab, isIndexed, onSelectQuestion, recentQuestions }) {
  return (
    <div className="app-container">
      <Header activeTab={activeTab} setActiveTab={setActiveTab} isIndexed={isIndexed} />
      <div className="layout-body">
        <Sidebar onSelectQuestion={onSelectQuestion} recentQuestions={recentQuestions} />
        <main className="main-content">
          {children}
        </main>
      </div>
    </div>
  );
}
