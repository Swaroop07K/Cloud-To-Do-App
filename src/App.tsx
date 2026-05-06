import React, { useState, useEffect } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from './firebase';
import Auth from './Auth';
import TodoApp from './TodoApp';
import { Loader2 } from 'lucide-react';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setInitializing(false);
    });

    return () => unsubscribe();
  }, []);

  if (initializing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f5f5f5]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="animate-spin text-black" size={40} />
          <p className="text-sm font-medium text-[#9e9e9e] uppercase tracking-widest">
            Initializing Secure Session
          </p>
        </div>
      </div>
    );
  }

  return (
    <div id="root-container">
      {user ? <TodoApp /> : <Auth />}
    </div>
  );
}
