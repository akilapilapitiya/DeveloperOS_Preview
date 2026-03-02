import React from 'react';
import { useAuth } from '../context/auth.context';

const UserProfile: React.FC = () => {
  const { userProfile, logout, manageAccount, authenticated, roles } = useAuth();

  if (!authenticated || !userProfile) return null;

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column',
      padding: '15px', 
      background: '#1a1a1a', 
      color: '#fff',
      borderRadius: '8px',
      marginBottom: '20px',
      border: '1px solid #333'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ fontWeight: 'bold', fontSize: '1.1em' }}>{userProfile.firstName} {userProfile.lastName}</div>
          <div style={{ fontSize: '0.85em', opacity: 0.6 }}>{userProfile.email}</div>
          
          {userProfile.githubUsername && (
            <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center', gap: '8px', padding: '4px 8px', background: '#333', borderRadius: '4px', border: '1px solid #444' }}>
              <img src={userProfile.githubAvatarUrl} alt="GH" style={{ width: '16px', height: '16px', borderRadius: '8px' }} />
              <span style={{ fontSize: '0.75em', fontWeight: 'bold', color: '#ccc' }}>@{userProfile.githubUsername}</span>
              <span style={{ fontSize: '0.6em', color: '#888', marginLeft: 'auto' }}>GITHUB CONNECTED</span>
            </div>
          )}
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button 
            onClick={manageAccount}
            style={{ background: '#333', color: '#fff', border: '1px solid #444', padding: '6px 12px', cursor: 'pointer', borderRadius: '4px', fontSize: '0.9em' }}
          >
            Security & Account
          </button>
          <button 
            onClick={logout}
            style={{ background: '#722', color: '#fff', border: 'none', padding: '6px 12px', cursor: 'pointer', borderRadius: '4px', fontSize: '0.9em' }}
          >
            Logout
          </button>
        </div>
      </div>
      
      <div style={{ marginTop: '10px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        {roles.filter(r => !r.startsWith('default-roles')).map(role => (
          <span key={role} style={{ 
            background: role === 'admin' ? '#d97706' : '#2563eb', 
            fontSize: '0.7em', 
            padding: '2px 8px', 
            borderRadius: '12px',
            textTransform: 'uppercase',
            fontWeight: 'bold'
          }}>
            {role}
          </span>
        ))}
      </div>
    </div>
  );
};

export default UserProfile;
