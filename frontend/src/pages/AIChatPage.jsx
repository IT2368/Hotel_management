import React from 'react';
import AIChatBox from '../components/AIChatbox.jsx';

export default function AIChatPage() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#f8fafc',
      padding: 24,
    }}>
      <AIChatBox forceOpen hideFloatingButton />
    </div>
  );
} 