import { createContext, useContext, useState, useEffect } from 'react';
import { onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth';
import { auth, googleProvider } from '../services/firebase';

const AuthContext = createContext();

const DEMO_CITIZEN = {
  id: 'usr_cit_101',
  name: 'Rahul Sharma',
  email: 'rahul.citizen@civicfix.org',
  mobile: '+91 98765 43210',
  role: 'citizen',
  city: 'Metro City',
  ward: 'Ward 4 - Metro Station Corridor',
  avatar: 'RS'
};

const DEMO_AUTHORITY = {
  id: 'usr_auth_201',
  name: 'Commissioner Meera Nair',
  email: 'commissioner@municipal.gov.in',
  mobile: '+91 99112 23344',
  role: 'authority',
  department: 'Municipal Operations & Grievance Redressal',
  city: 'Metro City Central Command',
  avatar: 'MN'
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('civicfix_current_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return DEMO_CITIZEN;
      }
    }
    return DEMO_CITIZEN;
  });

  const [notificationCount, setNotificationCount] = useState(2);
  const [authLoading, setAuthLoading] = useState(true);

  // Sync with Firebase Auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setAuthLoading(false);
      if (firebaseUser) {
        const isAuthAuthority =
          firebaseUser.email?.includes('gov') ||
          firebaseUser.email?.includes('admin') ||
          firebaseUser.email === 'sohamnemade0031@gmail.com';

        const enrichedUser = {
          id: firebaseUser.uid,
          name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Civic User',
          email: firebaseUser.email || '',
          photoURL: firebaseUser.photoURL || null,
          role: isAuthAuthority ? 'authority' : 'citizen',
          ward: 'Ward 1 - Central Business District',
          city: 'Metro City',
          avatar: (firebaseUser.displayName || firebaseUser.email || 'CU').substring(0, 2).toUpperCase()
        };
        setUser(enrichedUser);
        localStorage.setItem('civicfix_current_user', JSON.stringify(enrichedUser));
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (user) {
      localStorage.setItem('civicfix_current_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('civicfix_current_user');
    }
  }, [user]);

  const signInWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      return result.user;
    } catch (err) {
      console.error('Firebase Google Sign-In Error:', err);
      throw err;
    }
  };

  const login = (email, password, role = 'citizen') => {
    if (role === 'authority' || email.includes('gov') || email.includes('admin') || email.includes('authority')) {
      const authUser = {
        ...DEMO_AUTHORITY,
        email: email || DEMO_AUTHORITY.email
      };
      setUser(authUser);
      return authUser;
    } else {
      const citizenUser = {
        ...DEMO_CITIZEN,
        email: email || DEMO_CITIZEN.email
      };
      setUser(citizenUser);
      return citizenUser;
    }
  };

  const loginAsDemoCitizen = () => {
    setUser(DEMO_CITIZEN);
    return DEMO_CITIZEN;
  };

  const loginAsDemoAuthority = () => {
    setUser(DEMO_AUTHORITY);
    return DEMO_AUTHORITY;
  };

  const register = (data) => {
    const newUser = {
      id: `usr_cit_${Date.now()}`,
      name: data.fullName,
      email: data.email,
      mobile: data.mobile,
      role: 'citizen',
      city: data.city || 'Metro City',
      ward: data.ward || 'Ward 1 - Central Business District',
      avatar: data.fullName ? data.fullName.substring(0, 2).toUpperCase() : 'CF'
    };
    setUser(newUser);
    return newUser;
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (_) {}
    setUser(null);
  };

  const switchRole = (newRole) => {
    if (newRole === 'authority') {
      setUser(DEMO_AUTHORITY);
    } else {
      setUser(DEMO_CITIZEN);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isAuthority: user?.role === 'authority',
        isCitizen: user?.role === 'citizen',
        login,
        loginAsDemoCitizen,
        loginAsDemoAuthority,
        signInWithGoogle,
        register,
        logout,
        switchRole,
        notificationCount,
        authLoading
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
