import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import Keycloak from 'keycloak-js';
import { setAuthToken } from '../api/api';
import { profileService } from '../services/profile.service';

interface AuthContextType {
  loading: boolean;
  authenticated: boolean;
  token: string | null;
  userProfile: any | null;
  backendProfile: any | null;
  roles: string[];
  login: () => void;
  logout: () => void;
  register: () => void;
  manageAccount: () => void;
  updateProfile: (updates: any) => Promise<void>;
  hasRole: (role: string) => boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [userProfile, setUserProfile] = useState<any | null>(null);
  const [backendProfile, setBackendProfile] = useState<any | null>(null);
  const [roles, setRoles] = useState<string[]>([]);
  const keycloakRef = useRef<Keycloak | null>(null);
  const isInitialized = useRef(false);

  useEffect(() => {
    if (isInitialized.current) return;
    isInitialized.current = true;

    const keycloak = new Keycloak({
      url: 'http://localhost:8080',
      realm: 'developer-os',
      clientId: 'frontend-client',
    });

    let refreshInterval: number;

    keycloak.init({ 
      onLoad: 'check-sso', 
      checkLoginIframe: false,
      pkceMethod: 'S256'
    })
      .then((auth) => {
        if (auth) {
          const currentToken = keycloak.token || null;
          setToken(currentToken);
          setAuthToken(currentToken);
          
          profileService.syncProfile()
            .then(setBackendProfile)
            .catch(err => {
              console.error('Failed to sync profile:', err);
            });

          setRoles(keycloak.realmAccess?.roles || []);
          keycloak.loadUserProfile().then(setUserProfile);
        }
        setAuthenticated(auth);
        keycloakRef.current = keycloak;
        setLoading(false);

        refreshInterval = window.setInterval(() => {
          keycloak.updateToken(70).then((refreshed) => {
            if (refreshed) {
              const newToken = keycloak.token || null;
              setToken(newToken);
              setAuthToken(newToken);
              setRoles(keycloak.realmAccess?.roles || []);
            }
          }).catch(() => {
            console.error('Failed to refresh token');
          });
        }, 60000);
      })
      .catch(err => {
        console.error('Keycloak init error:', err);
        isInitialized.current = false;
        setLoading(false);
      });

    return () => {
      if (refreshInterval) clearInterval(refreshInterval);
    };
  }, []);

  const login = () => keycloakRef.current?.login();
  const logout = () => keycloakRef.current?.logout();
  const register = () => keycloakRef.current?.register();
  const manageAccount = () => keycloakRef.current?.accountManagement();
  
  const updateProfile = async (updates: any) => {
    try {
      const updated = await profileService.updateProfile(updates);
      setBackendProfile(updated);
    } catch (error) {
      console.error('Failed to update profile:', error);
      throw error;
    }
  };

  const hasRole = (role: string) => roles.includes(role);

  return (
    <AuthContext.Provider value={{ 
      loading, authenticated, token, userProfile, backendProfile, roles, 
      login, logout, register, manageAccount, updateProfile, hasRole 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
