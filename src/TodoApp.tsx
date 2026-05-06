import React, { useState, useEffect } from 'react';
import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  onSnapshot, 
  query, 
  where, 
  orderBy,
  serverTimestamp,
  Timestamp,
  getDocFromServer
} from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import { db, auth, handleFirestoreError, OperationType } from './firebase';
import { 
  Plus, 
  Trash2, 
  Edit3, 
  Check, 
  X, 
  LogOut, 
  CheckCircle2, 
  Circle,
  Clock,
  Loader2,
  Calendar,
  Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Todo {
  id: string;
  text: string;
  completed: boolean;
  userId: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export default function TodoApp() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTodo, setNewTodo] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const user = auth.currentUser;
  const firstName = user?.displayName?.split(' ')[0] || user?.email?.split('@')[0] || 'User';

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  useEffect(() => {
    if (!user) return;

    const testConnection = async () => {
      try {
        await getDocFromServer(doc(db, 'test', 'connection'));
      } catch (error) {
        if(error instanceof Error && error.message.includes('the client is offline')) {
          console.error("Please check your Firebase configuration.");
        }
      }
    };
    testConnection();

    const path = 'todos';
    const q = query(
      collection(db, path),
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const todoList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Todo[];
      setTodos(todoList);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, path);
    });

    return () => unsubscribe();
  }, [user]);

  const addTodo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTodo.trim() || !user || submitting) return;

    setSubmitting(true);
    const path = 'todos';
    try {
      await addDoc(collection(db, path), {
        text: newTodo.trim(),
        completed: false,
        userId: user.uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      setNewTodo('');
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    } finally {
      setSubmitting(false);
    }
  };

  const toggleTodo = async (todo: Todo) => {
    const path = `todos/${todo.id}`;
    try {
      await updateDoc(doc(db, 'todos', todo.id), {
        completed: !todo.completed,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    }
  };

  const deleteTodo = async (id: string) => {
    const path = `todos/${id}`;
    try {
      await deleteDoc(doc(db, 'todos', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path);
    }
  };

  const startEdit = (todo: Todo) => {
    setEditingId(todo.id);
    setEditText(todo.text);
  };

  const saveEdit = async (id: string) => {
    if (!editText.trim()) return;
    const path = `todos/${id}`;
    try {
      await updateDoc(doc(db, 'todos', id), {
        text: editText.trim(),
        updatedAt: serverTimestamp()
      });
      setEditingId(null);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    }
  };

  const handleLogout = () => signOut(auth);

  const formatDate = (timestamp: Timestamp) => {
    if (!timestamp) return '';
    const date = timestamp.toDate();
    return date.toLocaleDateString(undefined, { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div id="app-container" className="min-h-screen bg-[#0a0a0a] font-sans text-white pb-20 relative overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute top-[-10%] right-[-5%] w-[50%] h-[50%] bg-blue-600/10 rounded-full blur-[140px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] left-[-5%] w-[50%] h-[50%] bg-purple-600/10 rounded-full blur-[140px] pointer-events-none"></div>

      {/* Header */}
      <header className="px-6 py-6 border-b border-white/5 bg-black/20 backdrop-blur-md sticky top-0 z-20">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-tr from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/10">
              <Sparkles size={24} className="text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">{getGreeting()}, {firstName}</h1>
              <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest">
                Workspace Dashboard
              </p>
            </div>
          </div>
          <button
            id="logout-btn"
            onClick={handleLogout}
            className="w-10 h-10 flex items-center justify-center text-white/60 hover:text-red-400 hover:bg-red-400/10 rounded-xl transition-all"
          >
            <LogOut size={20} />
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 pt-12 relative z-10">
        {/* Input Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/5 border border-white/10 rounded-[32px] p-2 mb-12 flex focus-within:ring-2 focus-within:ring-white/10 transition-all shadow-2xl"
        >
          <form onSubmit={addTodo} className="flex-1 flex gap-2">
            <input
              id="todo-input"
              type="text"
              value={newTodo}
              onChange={(e) => setNewTodo(e.target.value)}
              placeholder="Add a new task..."
              className="flex-1 bg-transparent px-6 py-4 text-lg placeholder:text-white/20 focus:outline-none"
              disabled={submitting}
            />
            <button
              id="add-todo-btn"
              type="submit"
              disabled={submitting || !newTodo.trim()}
              className="px-6 bg-white text-black rounded-[24px] font-bold hover:bg-white/90 active:scale-95 transition-all disabled:opacity-20 flex items-center gap-2"
            >
              <Plus size={20} />
              <span className="hidden sm:inline">Add Task</span>
            </button>
          </form>
        </motion.div>

        {/* Dashboard Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {/* Progress Card */}
          <div className="md:col-span-2 bg-white/5 border border-white/10 rounded-[32px] p-8 backdrop-blur-xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
              <Sparkles size={80} />
            </div>
            <div className="relative z-10">
              <p className="text-xs font-bold text-white/40 uppercase tracking-[0.2em] mb-6">Completion Progress</p>
              <div className="flex items-end gap-4 mb-4">
                <span className="text-6xl font-light tracking-tighter">
                  {todos.length > 0 ? Math.round((todos.filter(t => t.completed).length / todos.length) * 100) : 0}%
                </span>
                <span className="text-white/30 font-medium pb-2 uppercase tracking-widest text-[10px]">efficiency score</span>
              </div>
              <div className="w-full h-3 bg-white/5 rounded-full overflow-hidden border border-white/5">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${todos.length > 0 ? (todos.filter(t => t.completed).length / todos.length) * 100 : 0}%` }}
                  className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 shadow-[0_0_20px_rgba(59,130,246,0.5)]"
                />
              </div>
            </div>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-1 gap-4">
            <div className="bg-white/5 border border-white/10 rounded-[32px] p-6 backdrop-blur-xl flex flex-col justify-center">
              <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest mb-2">Total Tasks</p>
              <p className="text-4xl font-light">{todos.length}</p>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-[32px] p-6 backdrop-blur-xl flex flex-col justify-center border-green-500/10">
              <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest mb-2">Completed</p>
              <p className="text-4xl font-light text-green-400">{todos.filter(t => t.completed).length}</p>
            </div>
          </div>
        </div>

        {/* List Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between px-2 mb-4">
            <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-white/30">Your Tasks</h2>
            <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-24 text-white/20">
              <Loader2 className="animate-spin mb-4" size={40} />
              <p className="text-sm font-bold uppercase tracking-widest">Syncing Tasks</p>
            </div>
          ) : todos.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-24 bg-white/2 rounded-[32px] border-2 border-dashed border-white/5"
            >
              <Sparkles size={40} className="mx-auto mb-4 text-white/10" />
              <p className="text-white/30 text-sm font-semibold tracking-wide">All caught up. Your list is empty.</p>
            </motion.div>
          ) : (
            <AnimatePresence mode="popLayout">
              {todos.map((todo) => (
                <motion.div
                  key={todo.id}
                  layout
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className={`group relative bg-white/5 border border-white/10 rounded-3xl p-5 flex items-center gap-5 transition-all hover:bg-white/[0.08] hover:border-white/20 ${todo.completed ? 'opacity-40' : ''}`}
                >
                  <button
                    id={`toggle-${todo.id}`}
                    onClick={() => toggleTodo(todo)}
                    className={`shrink-0 w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all ${
                      todo.completed ? 'bg-green-500 border-green-500 text-black' : 'border-white/10 hover:border-white/40'
                    }`}
                  >
                    {todo.completed && <Check size={20} strokeWidth={3} />}
                  </button>

                  <div className="flex-1 min-w-0">
                    {editingId === todo.id ? (
                      <div className="flex gap-2">
                        <input
                          id={`edit-${todo.id}`}
                          type="text"
                          autoFocus
                          value={editText}
                          onChange={(e) => setEditText(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && saveEdit(todo.id)}
                          className="w-full bg-white/10 px-4 py-2 rounded-xl text-white focus:outline-none ring-1 ring-white/20"
                        />
                        <button onClick={() => saveEdit(todo.id)} className="p-2 text-green-400 hover:bg-green-400/10 rounded-xl">
                          <Check size={20} />
                        </button>
                        <button onClick={() => setEditingId(null)} className="p-2 text-red-400 hover:bg-red-400/10 rounded-xl">
                          <X size={20} />
                        </button>
                      </div>
                    ) : (
                      <div className="flex flex-col">
                        <p className={`text-lg transition-all ${todo.completed ? 'line-through text-white/30' : 'text-white'}`}>
                          {todo.text}
                        </p>
                        <div className="flex items-center gap-3 mt-2">
                          <span className="flex items-center gap-1.5 text-[10px] font-bold text-white/20 uppercase tracking-widest">
                            <Clock size={12} />
                            {formatDate(todo.createdAt || todo.updatedAt)}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0">
                    {!todo.completed && editingId !== todo.id && (
                      <button
                        id={`edit-btn-${todo.id}`}
                        onClick={() => startEdit(todo)}
                        className="p-3 text-white/40 hover:text-white hover:bg-white/10 rounded-2xl transition-all"
                      >
                        <Edit3 size={18} />
                      </button>
                    )}
                    <button
                      id={`delete-btn-${todo.id}`}
                      onClick={() => deleteTodo(todo.id)}
                      className="p-3 text-white/40 hover:text-red-400 hover:bg-red-400/10 rounded-2xl transition-all"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>
      </main>
    </div>
  );
}
