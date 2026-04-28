import React from 'react';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import { useAuth } from '../../context/AuthContext';

const PageLayout = ({ children, sidebar = true, fullWidth = false }) => {
  const { isAuthenticated } = useAuth();
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />
      <div style={{ display: 'flex', flex: 1, paddingTop: 64 }}>
        {sidebar && isAuthenticated && (
          <div className="hide-mobile"><Sidebar /></div>
        )}
        <main style={{
          flex: 1,
          padding: fullWidth ? 0 : '32px 28px',
          maxWidth: fullWidth ? '100%' : undefined,
          overflowX: 'hidden'
        }}>
          {children}
        </main>
      </div>
    </div>
  );
};

export default PageLayout;
