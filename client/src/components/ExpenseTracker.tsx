import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { addDoc, collection, onSnapshot, orderBy, query, serverTimestamp, writeBatch, getDocs, doc, updateDoc, deleteDoc } from 'firebase/firestore'
import { db } from '../firebase/firebase'
import { useAppStore } from '../store/useAppStore'
import { Search, SlidersHorizontal, Utensils, Car, Smile, ShoppingBag, Trash2, Edit, X, Check, Target, Plus } from 'lucide-react'
import { ResponsiveContainer, PieChart, Pie, Cell, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts'

// Define a type for our expense items
interface Expense {
  id: string;
  title: string;
  amount: number;
  category: string;
  timestamp: any; // Firestore Timestamp
  user: string;
  type: 'income' | 'expense';
}

function computePairId(a: string, b: string) {
  return [a, b].sort().join('_')
}

const allCategories = ['General', 'Food', 'Travel', 'Fun', 'Shopping', 'Housing', 'Transportation', 'Vehicle', 'Life & Entertainment', 'Communication, PC', 'Financial expenses', 'Investments', 'Others', 'Unknown'];

const categoryIcons: { [key: string]: ReactNode } = {
  'Food': <Utensils size={18} />,
  'Travel': <Car size={18} />,
  'Fun': <Smile size={18} />,
  'General': <ShoppingBag size={18} />,
  'Shopping': <ShoppingBag size={18} />,
}

const COLORS = ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40'];

const AddExpenseForm = ({ pairId, user, onAdd }: { pairId: string | null, user: any, onAdd: () => void }) => {
  const [title, setTitle] = useState('')
  const [amount, setAmount] = useState('')
  const [category, setCategory] = useState('General')
  const [type, setType] = useState<'income' | 'expense'>('expense')
  const [error, setError] = useState('')

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!pairId || !user) return
    if (!title || !amount) {
      setError('Please fill in all fields.')
      return
    }
    const ref = collection(db, 'pairs', pairId, 'expenses')
    await addDoc(ref, {
      title,
      amount: parseFloat(amount),
      category,
      timestamp: serverTimestamp(),
      user: user.uid,
      type,
    })
    setTitle('')
    setAmount('')
    setCategory('General')
    setError('')
    onAdd()
  }

  return (
    <form onSubmit={handleAdd} className="p-4 bg-black/20 rounded-xl space-y-4">
      <h3 className="font-semibold text-lg">Add New Transaction</h3>
      {error && <div className="text-red-500 text-sm">{error}</div>}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <select value={type} onChange={e => setType(e.target.value as 'income' | 'expense')} className="input bg-white/5">
          <option value="expense">Expense</option>
          <option value="income">Income</option>
        </select>
        <input type="text" placeholder="Title" value={title} onChange={e => setTitle(e.target.value)} className="input w-full bg-white/5" />
        <input type="number" placeholder="Amount" value={amount} onChange={e => setAmount(e.target.value)} className="input w-full bg-white/5" />
        <select value={category} onChange={e => setCategory(e.target.value)} className="input bg-white/5">
          {allCategories.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>
      <button type="submit" className="btn btn-primary w-full">Add Transaction</button>
    </form>
  )
}

export default function ExpenseTracker() {
  const user = useAppStore(s => s.user)
  const partnerUid = useAppStore(s => s.partnerUid)
  const [items, setItems] = useState<Expense[]>([])
  const [showFilters, setShowFilters] = useState(false)
  const [showAddForm, setShowAddForm] = useState(false)
  const [activeTab, setActiveTab] = useState('Records')

  // Filter states
  const [searchQuery, setSearchQuery] = useState('')
  const [sortOrder, setSortOrder] = useState('time-desc')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [timePeriod, setTimePeriod] = useState('this-month')

  // Edit state
  const [editingItemId, setEditingItemId] = useState<string | null>(null)
  const [editedItem, setEditedItem] = useState<any>(null)

  const pairId = user?.uid && partnerUid ? computePairId(user.uid, partnerUid) : null
  const ref = useMemo(() => pairId ? collection(db, 'pairs', pairId, 'expenses') : null, [pairId])

  useEffect(() => {
    if (!ref) return
    const q = query(ref, orderBy('timestamp', 'desc'))
    return onSnapshot(q, snap => {
      const fetchedItems = snap.docs.map(d => {
        const data = d.data();
        return {
          id: d.id,
          title: data.title,
          amount: data.amount,
          category: data.category,
          timestamp: data.timestamp,
          user: data.user,
          type: data.type || 'expense',
        } as Expense
      });
      setItems(fetchedItems)
    })
  }, [ref])

  const handleUpdateItem = async () => {
    if (!ref || !editingItemId || !editedItem) return;
    const itemDoc = doc(ref, editingItemId);
    await updateDoc(itemDoc, editedItem);
    setEditingItemId(null);
    setEditedItem(null);
  };

  const handleDeleteItem = async (itemId: string) => {
    if (!ref) return;
    if (window.confirm('Are you sure you want to delete this record?')) {
      const itemDoc = doc(ref, itemId);
      await deleteDoc(itemDoc);
    }
  };

  const handleClearAll = async () => {
    if (!ref) return;
    if (window.confirm('Are you sure you want to delete ALL records? This action cannot be undone.')) {
      const snapshot = await getDocs(ref);
      const batch = writeBatch(db);
      snapshot.docs.forEach(doc => batch.delete(doc.ref));
      await batch.commit();
    }
  };

  const filteredItems = useMemo(() => {
    let filtered = items;

    if (timePeriod === 'this-month') {
      const today = new Date();
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      filtered = filtered.filter(item => item.timestamp && item.timestamp.toDate() >= startOfMonth);
    }

    if (searchQuery) {
      filtered = filtered.filter(item => item.title.toLowerCase().includes(searchQuery.toLowerCase()))
    }
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(item => item.category === selectedCategory)
    }
    if (sortOrder === 'time-asc') {
      filtered.sort((a, b) => a.timestamp?.toMillis() - b.timestamp?.toMillis())
    } else {
      filtered.sort((a, b) => b.timestamp?.toMillis() - a.timestamp?.toMillis())
    }
    return filtered
  }, [items, searchQuery, sortOrder, selectedCategory, timePeriod])

  const totalExpense = useMemo(() => filteredItems.filter(item => item.type === 'expense').reduce((sum, item) => sum + item.amount, 0), [filteredItems]);
  const totalIncome = useMemo(() => filteredItems.filter(item => item.type === 'income').reduce((sum, item) => sum + item.amount, 0), [filteredItems]);
  const balance = useMemo(() => totalIncome - totalExpense, [totalIncome, totalExpense]);

  const groupedItems = useMemo(() => {
    return filteredItems.reduce((acc, item) => {
      if (!item.timestamp) return acc
      const date = item.timestamp.toDate().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
      if (!acc[date]) {
        acc[date] = []
      }
      acc[date].push(item)
      return acc
    }, {} as { [key: string]: Expense[] })
  }, [filteredItems])

  const analyticsByCategory = useMemo(() => {
    return allCategories.map(category => {
      const categoryItems = filteredItems.filter(item => item.category === category && item.type === 'expense');
      const total = categoryItems.reduce((sum, item) => sum + item.amount, 0);
      return { name: category, value: total };
    }).filter(c => c.value > 0);
  }, [filteredItems]);

  const dailyExpenseData = useMemo(() => {
    const dailyData = filteredItems.reduce((acc, item) => {
      const date = item.timestamp.toDate().toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      if (!acc[date]) {
        acc[date] = 0;
      }
      if (item.type === 'expense') {
        acc[date] += item.amount;
      }
      return acc;
    }, {} as { [key: string]: number });

    return Object.entries(dailyData).map(([date, amount]) => ({ date, amount })).reverse();
  }, [filteredItems]);

  const renderFilters = () => (
    <div className="p-4 bg-black/20 rounded-xl space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="relative">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 opacity-50" />
          <input type="text" placeholder="Search" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="input w-full pl-10 bg-white/5" />
        </div>
        <select value={sortOrder} onChange={e => setSortOrder(e.target.value)} className="input bg-white/5">
          <option value="time-desc">Time (newest first)</option>
          <option value="time-asc">Time (oldest first)</option>
        </select>
        <select value={selectedCategory} onChange={e => setSelectedCategory(e.target.value)} className="input bg-white/5">
          <option value="all">All Categories</option>
          {allCategories.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <select className="input bg-white/5 disabled:opacity-50" disabled><option>All Accounts</option></select>
      </div>
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="flex border-b border-white/10">
        {['Records', 'Analytics', 'Target for savings'].map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)} className={`px-4 py-2 text-sm font-medium ${activeTab === tab ? 'border-b-2 border-pink-500 text-white' : 'text-white/60'}`}>
            {tab}
          </button>
        ))}
      </div>

      {activeTab === 'Records' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button onClick={() => setShowAddForm(!showAddForm)} className="flex items-center gap-2 text-sm bg-pink-600/20 text-pink-400 px-3 py-1.5 rounded-lg hover:bg-pink-600/30">
              <Plus size={14} />
              <span>Add Transaction</span>
            </button>
          </div>

          {showAddForm && <AddExpenseForm pairId={pairId} user={user} onAdd={() => setShowAddForm(false)} />}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-blue-600/10 rounded-xl text-center">
              <h4 className="text-sm font-medium text-blue-400/80">Balance</h4>
              <div className="text-2xl font-bold text-blue-400">₹{balance.toFixed(2)}</div>
            </div>
            <div className="p-4 bg-green-600/10 rounded-xl text-center">
              <h4 className="text-sm font-medium text-green-400/80">Total Income</h4>
              <div className="text-2xl font-bold text-green-400">+₹{totalIncome.toFixed(2)}</div>
            </div>
            <div className="p-4 bg-red-600/10 rounded-xl text-center">
              <h4 className="text-sm font-medium text-red-400/80">Total Expense</h4>
              <div className="text-2xl font-bold text-red-400">-₹{totalExpense.toFixed(2)}</div>
            </div>
          </div>

          <div className="flex justify-between items-center">
            <button onClick={() => setShowFilters(!showFilters)} className="flex items-center gap-2 text-sm bg-white/10 px-3 py-1.5 rounded-lg">
              <SlidersHorizontal size={14} />
              <span>My filter</span>
            </button>
            <button onClick={handleClearAll} className="flex items-center gap-2 text-sm bg-red-600/20 text-red-400 px-3 py-1.5 rounded-lg hover:bg-red-600/30">
              <Trash2 size={14} />
              <span>Clear All</span>
            </button>
          </div>
          {showFilters && renderFilters()}
          <div className="text-sm opacity-70">Found {filteredItems.length} records.</div>
          <div className="space-y-4">
            {Object.entries(groupedItems).map(([date, dateItems]) => (
              <div key={date}>
                <div className="flex justify-between items-baseline mb-2">
                  <span className="font-semibold">{new Date(date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                  <span className="text-sm font-bold">-₹{dateItems.reduce((sum, item) => sum + item.amount, 0).toFixed(2)}</span>
                </div>
                <div className="space-y-2">
                  {dateItems.map(item => (
                    <div key={item.id} className="bg-white/5 p-3 rounded-lg">
                      {editingItemId === item.id ? (
                        <div className="space-y-2">
                          <input type="text" value={editedItem.title} onChange={e => setEditedItem((prev: Expense) => ({ ...prev, title: e.target.value }))} className="input bg-white/10 w-full" />
                          <div className="flex gap-2">
                            <input type="number" value={editedItem.amount} onChange={e => setEditedItem((prev: Expense) => ({ ...prev, amount: Number(e.target.value) }))} className="input bg-white/10 w-full" />
                            <select value={editedItem.category} onChange={e => setEditedItem((prev: Expense) => ({ ...prev, category: e.target.value }))} className="input bg-white/10 w-full">
                              {allCategories.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                          </div>
                          <div className="flex justify-end gap-2 mt-2">
                            <button onClick={() => setEditingItemId(null)} className="flex items-center gap-1 text-sm"><X size={14} />Cancel</button>
                            <button onClick={handleUpdateItem} className="flex items-center gap-1 text-sm text-pink-500"><Check size={14} />Save</button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="h-9 w-9 rounded-lg bg-white/10 flex items-center justify-center">{categoryIcons[item.category] || <ShoppingBag size={18} />}</div>
                            <div>
                              <div className="font-medium">{item.title}</div>
                              <div className="text-xs opacity-60">{item.timestamp?.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <div className={`font-bold ${item.type === 'income' ? 'text-green-500' : 'text-red-500'}`}>{item.type === 'income' ? '+' : '-'}₹{item.amount.toFixed(2)}</div>
                              <div className="text-xs opacity-60">Cash</div>
                            </div>
                            <div className="flex gap-2">
                              <button onClick={() => { setEditingItemId(item.id); setEditedItem(item); }} className="text-white/60 hover:text-white"><Edit size={16} /></button>
                              <button onClick={() => handleDeleteItem(item.id)} className="text-white/60 hover:text-red-500"><Trash2 size={16} /></button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'Analytics' && (
        <div className="space-y-4">
          <div className="p-4 bg-red-600/10 rounded-xl text-center">
            <h4 className="text-sm font-medium text-red-400/80">Total Expense</h4>
            <div className="text-2xl font-bold text-red-400">-₹{totalExpense.toFixed(2)}</div>
          </div>
          <div className="flex justify-between items-center">
            <button onClick={() => setShowFilters(!showFilters)} className="flex items-center gap-2 text-sm bg-white/10 px-3 py-1.5 rounded-lg">
              <SlidersHorizontal size={14} />
              <span>My filter</span>
            </button>
            <select value={timePeriod} onChange={e => setTimePeriod(e.target.value)} className="input bg-white/5">
              <option value="this-month">This month</option>
            </select>
          </div>
          {showFilters && renderFilters()}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-black/20 rounded-xl">
              <h4 className="font-semibold mb-2">Expense Breakdown</h4>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie data={analyticsByCategory} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={60} outerRadius={80} fill="#8884d8" paddingAngle={5}>
                    {analyticsByCategory.map((_entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="p-4 bg-black/20 rounded-xl">
              <h4 className="font-semibold mb-2">Daily Expenses</h4>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={dailyExpenseData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip contentStyle={{ backgroundColor: '#222', border: '1px solid #444' }} />
                  <Bar dataKey="amount" fill="#FF6384" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="p-4 bg-black/20 rounded-xl space-y-4">
            <h4 className="font-semibold">Total Expense by Category</h4>
            <div className="space-y-2 pt-2">
              {analyticsByCategory.map(({ name, value }) => (
                <div key={name} className="flex justify-between items-center text-sm">
                  <div className="flex items-center gap-2">
                    {categoryIcons[name] || <ShoppingBag size={16} />}
                    <span>{name}</span>
                  </div>
                  <span>-₹{value.toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'Target for savings' && (
        <div className="card p-4 text-center">
          <h3 className="font-semibold mb-4">Target for Savings</h3>
          <div className="flex justify-center mb-4"><Target size={40} className="text-pink-500" /></div>
          <p className="text-white/60">Set savings goals and track your progress. This feature is coming soon!</p>
        </div>
      )}

      {!pairId && (
        <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm mt-4">
          Go to Profile to connect with a partner and share expenses.
        </div>
      )}
    </div>
  )
}