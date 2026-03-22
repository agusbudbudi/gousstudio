import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  LayoutDashboard, 
  Plus, 
  LogOut, 
  Search, 
  Filter, 
  Image as ImageIcon, 
  ChevronRight,
  Monitor,
  ShoppingBag,
  FileText,
  Palette,
  Briefcase,
  Megaphone,
  Save
} from 'lucide-react';
import portfolioData from '../../data/portfolio.json';
import PortfolioList from './PortfolioList';
import PortfolioModal from './PortfolioModal';

const CATEGORIES = [
  { id: 'feed', label: 'Social Media Feed', icon: Monitor },
  { id: 'ecommerce', label: 'E-commerce', icon: ShoppingBag },
  { id: 'poster', label: 'Poster & Banner', icon: FileText },
  { id: 'logo', label: 'Logo & Branding', icon: Palette },
  { id: 'management', label: 'Content Management', icon: Briefcase },
  { id: 'ads', label: 'Digital Ads', icon: Megaphone }
];

const CMSContent = ({ onLogout }) => {
  const [activeTab, setActiveTab] = useState('feed');
  const [data, setData] = useState(portfolioData);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const handleAddItem = () => {
    setEditingItem(null);
    setIsModalOpen(true);
  };

  const handleEditItem = (item, index) => {
    setEditingItem({ ...item, index, category: activeTab });
    setIsModalOpen(true);
  };

  const handleDeleteItem = (category, index) => {
    if (window.confirm('Hapus item ini?')) {
      const newData = { ...data };
      newData[category].splice(index, 1);
      setData(newData);
      // Auto-save logic could go here
    }
  };

  const handleSaveItem = (itemData) => {
    const newData = { ...data };
    const { category, index, ...rest } = itemData;

    if (index !== undefined) {
      // Edit existing
      newData[category][index] = rest;
    } else {
      // Add new
      if (!newData[category]) newData[category] = [];
      newData[category].unshift(rest);
    }

    setData(newData);
    setIsModalOpen(false);
  };

  const handleReorder = (category, index, direction) => {
    const newData = { ...data };
    const items = [...newData[category]];
    
    if (direction === 'up' && index > 0) {
      [items[index], items[index - 1]] = [items[index - 1], items[index]];
    } else if (direction === 'down' && index < items.length - 1) {
      [items[index], items[index + 1]] = [items[index + 1], items[index]];
    } else {
      return; // No movement possible
    }

    newData[category] = items;
    setData(newData);
  };

  const persistData = async () => {
    const isLocal = window.location.hostname === 'localhost';
    const endpoint = isLocal ? '/api/save-portfolio-local' : '/api/save-portfolio';
    const password = localStorage.getItem('cms_token');

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data, password })
      });

      if (response.ok) {
        alert('Data berhasil disimpan ke ' + (isLocal ? 'lokal' : 'repository') + '!');
      } else {
        const err = await response.json();
        alert(`Gagal menyimpan: ${err.message}`);
      }
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  };

  return (
    <div className="flex flex-1 overflow-hidden bg-[#F8FAFC]">
      {/* Sidebar */}
      <aside className="w-64 border-r border-slate-200 bg-white flex flex-col shadow-[1px_0_0_rgba(0,0,0,0.02)]">
        <div className="p-6 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-brand-500 rounded-lg flex items-center justify-center shadow-md shadow-brand-500/10">
              <LayoutDashboard className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="font-extrabold text-slate-900 leading-tight text-base">Gous Studio</h2>
              <p className="text-[9px] text-slate-400 uppercase tracking-widest font-bold">CMS PANEL</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto custom-scrollbar">
          <div className="px-3 py-2 text-[9px] text-slate-400 uppercase tracking-widest font-bold">Menu Utama</div>
          <button 
            className="w-full flex items-center gap-2.5 px-4 py-2.5 rounded-lg bg-brand-500 text-white font-bold transition-all shadow-md shadow-brand-500/10 text-xs cursor-pointer"
          >
            <ImageIcon className="w-4 h-4" />
            Manage Portfolio
          </button>

          <div className="mt-6 px-3 py-2 text-[9px] text-slate-400 uppercase tracking-widest font-bold">Kategori</div>
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveTab(cat.id)}
              className={`w-full flex items-center justify-between px-4 py-2.5 rounded-lg transition-all group cursor-pointer ${
                activeTab === cat.id 
                  ? 'bg-slate-100 text-slate-900' 
                  : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <cat.icon className={`w-4 h-4 ${activeTab === cat.id ? 'text-brand-500' : 'text-slate-300 group-hover:text-slate-400'}`} />
                <span className={`text-[11px] font-bold ${activeTab === cat.id ? 'text-slate-900' : ''}`}>{cat.label}</span>
              </div>
              <div className={`px-2 py-0.5 rounded-md text-[9px] font-bold ${
                activeTab === cat.id ? 'bg-white text-brand-500 shadow-sm' : 'bg-slate-50 text-slate-400'
              }`}>
                {(data[cat.id] || []).length}
              </div>
            </button>
          ))}
        </nav>

        <div className="p-5 border-t border-slate-100 space-y-3">
          <button
            onClick={persistData}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-brand-500 hover:bg-brand-600 text-white rounded-lg transition-all font-bold text-xs shadow-md shadow-brand-500/10 active:scale-[0.98] cursor-pointer"
          >
            <Save className="w-3.5 h-3.5" />
            Simpan Perubahan
          </button>
          <button
            onClick={onLogout}
            className="w-full flex items-center justify-center gap-2 text-slate-400 hover:text-red-500 transition-colors text-[9px] font-bold cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto bg-slate-50/20 p-8 custom-scrollbar">
        <header className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <div className="flex items-center gap-1.5 text-brand-500 text-[9px] font-bold mb-1 uppercase tracking-widest">
              <span>Collection</span>
              <ChevronRight className="w-3 h-3" />
              <span>{CATEGORIES.find(c => c.id === activeTab)?.label}</span>
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Portfolio</h1>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative group">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-300 group-focus-within:text-brand-500 transition-colors" />
              <input 
                type="text" 
                placeholder="Cari portfolio..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-lg text-[11px] font-medium focus:outline-none focus:ring-2 focus:ring-brand-500/5 focus:border-brand-500 w-full md:w-56 shadow-sm transition-all placeholder:text-slate-200"
              />
            </div>
            <button
              onClick={handleAddItem}
              className="px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white rounded-lg flex items-center gap-2 transition-all font-bold text-[11px] shadow-md shadow-brand-500/10 active:scale-[0.98] shrink-0 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah</span>
            </button>
          </div>
        </header>

        <PortfolioList 
          items={data[activeTab] || []} 
          category={activeTab}
          searchQuery={searchQuery}
          onEdit={handleEditItem}
          onDelete={handleDeleteItem}
          onReorder={handleReorder}
        />

        <PortfolioModal 
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSaveItem}
          initialData={editingItem}
          categories={CATEGORIES}
          activeTab={activeTab}
        />
      </main>
    </div>
  );
};

export default CMSContent;
