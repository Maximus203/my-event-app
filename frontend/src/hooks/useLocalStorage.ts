import { useCallback, useEffect, useState } from 'react';

interface UseLocalStorageOptions<T> {
  defaultValue: T;
  serializer?: {
    parse: (value: string) => T;
    stringify: (value: T) => string;
  };
}

export const useLocalStorage = <T>(
  key: string,
  options: UseLocalStorageOptions<T>
): [T, (value: T | ((prev: T) => T)) => void, () => void] => {
  const { defaultValue, serializer } = options;
  
  const serialize = serializer?.stringify || JSON.stringify;
  const deserialize = serializer?.parse || JSON.parse;

  const [value, setValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? deserialize(item) : defaultValue;
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
      return defaultValue;
    }
  });

  const setStoredValue = useCallback((newValue: T | ((prev: T) => T)) => {
    try {
      const valueToStore = newValue instanceof Function ? newValue(value) : newValue;
      setValue(valueToStore);
      window.localStorage.setItem(key, serialize(valueToStore));
    } catch (error) {
      console.warn(`Error setting localStorage key "${key}":`, error);
    }
  }, [key, serialize, value]);

  const removeValue = useCallback(() => {
    try {
      window.localStorage.removeItem(key);
      setValue(defaultValue);
    } catch (error) {
      console.warn(`Error removing localStorage key "${key}":`, error);
    }
  }, [key, defaultValue]);

  // Listen for changes in other tabs/windows
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === key && e.newValue !== null) {
        try {
          setValue(deserialize(e.newValue));
        } catch (error) {
          console.warn(`Error parsing localStorage change for key "${key}":`, error);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [key, deserialize]);

  return [value, setStoredValue, removeValue];
};

// Hook spécialisé pour les sessions utilisateur
export const useAuthStorage = () => {
  const [token, setToken, removeToken] = useLocalStorage('auth_token', {
    defaultValue: null as string | null
  });

  const [user, setUser, removeUser] = useLocalStorage('auth_user', {
    defaultValue: null as any
  });

  const login = useCallback((authToken: string, userData: any) => {
    setToken(authToken);
    setUser(userData);
  }, [setToken, setUser]);

  const logout = useCallback(() => {
    removeToken();
    removeUser();
  }, [removeToken, removeUser]);

  const isAuthenticated = Boolean(token && user);

  return {
    token,
    user,
    isAuthenticated,
    login,
    logout,
    setUser
  };
};
