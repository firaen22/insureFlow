import React, { useState } from 'react';
import { TRANSLATIONS } from '../constants';
import { Mail, Phone, Calendar, UserPlus, MoreHorizontal, Tag, Filter, Plus, X, Save, ChevronDown, Check, Pencil, FilePlus, Shield, Layers, Trash2, Eye, Search } from 'lucide-react';
import { Client, PolicyData, Rider, Product } from '../types';

interface ClientsViewProps {
  t: typeof TRANSLATIONS['en']['clients'];
  clients: Client[];
  policies: PolicyData[];
  products: Product[];
  onUpdateClient: (client: Client) => void;
  onAddClient: (client: Client) => void;
  onAddPolicy: (policy: PolicyData, clientId: string) => void;
  onViewDetails: (client: Client) => void;
}

// Predefined color palette for tags
const TAG_COLORS = [
  { name: 'Blue', class: 'bg-blue-50 text-blue-700 border-blue-100', dot: 'bg-blue-500' },
  { name: 'Emerald', class: 'bg-emerald-50 text-emerald-700 border-emerald-100', dot: 'bg-emerald-500' },
  { name: 'Amber', class: 'bg-amber-50 text-amber-700 border-amber-100', dot: 'bg-amber-500' },
  { name: 'Rose', class: 'bg-rose-50 text-rose-700 border-rose-100', dot: 'bg-rose-500' },
  { name: 'Purple', class: 'bg-purple-50 text-purple-700 border-purple-100', dot: 'bg-purple-500' },
  { name: 'Slate', class: 'bg-slate-100 text-slate-700 border-slate-200', dot: 'bg-slate-500' },
];

export const ClientsView: React.FC<ClientsViewProps> = ({ t, clients, policies, products, onUpdateClient, onAddClient, onAddPolicy, onViewDetails }) => {
  // State for search
  const [searchTerm, setSearchTerm] = useState('');

  // State for system tags
  const [systemTags, setSystemTags] = useState([
    'Medical', 'Accident', 'Critical Illness', 'Life', 'Home', 'Maid', 
    'Sunlife', 'Prudential', 'AIA'
  ]);

  // State for tag colors (mapping tag name to css class)
  const [tagColors, setTagColors] = useState<Record<string, string>>({
    'Medical': 'bg-emerald-50 text-emerald-700 border-emerald-100',
    'Accident': 'bg-emerald-50 text-emerald-700 border-emerald-100',
    'Critical Illness': 'bg-emerald-50 text-emerald-700 border-emerald-100',
    'Life': 'bg-emerald-50 text-emerald-700 border-emerald-100',
    'Home': 'bg-emerald-50 text-emerald-700 border-emerald-100',
    'Maid': 'bg-emerald-50 text-emerald-700 border-emerald-100',
    'Sunlife': 'bg-blue-50 text-blue-700 border-blue-100',
    'Prudential': 'bg-blue-50 text-blue-700 border-blue-100',
    'AIA': 'bg-blue-50 text-blue-700 border-blue-100',
  });
  
  // State for adding a new system tag
  const [isAddingSystemTag, setIsAddingSystemTag] = useState(false);
  const [newSystemTagValue, setNewSystemTagValue] = useState('');
  const [newSystemTagColor, setNewSystemTagColor] = useState(TAG_COLORS[5].class); // Default to Slate

  // State for editing a system tag
  const [editingTag, setEditingTag] = useState<string | null>(null);
  const [editTagValue, setEditTagValue] = useState('');
  const [editTagColor, setEditTagColor] = useState('');

  const [activeTagFilter, setActiveTagFilter] = useState<string | null>(null);
  
  // State for adding a new tag to an existing client
  const [activeTagInputClient, setActiveTagInputClient] = useState<string | null>(null);

  // State for adding a new client
  const [isAddClientModalOpen, setIsAddClientModalOpen] = useState(false);
  const [newClientForm, setNewClientForm] = useState<Partial<Client>>({
    name: '',
    email: '',
    phone: '',
    birthday: '',
    tags: []
  });
  const [newClientTagInput, setNewClientTagInput] = useState('');

  // State for adding a policy to a client
  const [addingPolicyToClient, setAddingPolicyToClient] = useState<Client | null>(null);
  const [newPolicyForm, setNewPolicyForm] = useState<Partial<PolicyData>>({
    planName: '',
    policyNumber: '',
    type: 'Life',
    premiumAmount: 0,
    policyAnniversaryDate: '',
    paymentMode: 'Yearly',
    status: 'Active',
    riders: []
  });

  // Helper to determine tag color
  const getTagStyle = (tag: string) => {
    return tagColors[tag] || 'bg-slate-100 text-slate-700 border-slate-200';
  };

  const filteredClients = clients.filter(client => {
    // 1. Tag Filter
    if (activeTagFilter && !client.tags.includes(activeTagFilter)) {
      return false;
    }
    // 2. Search Filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      const matchesName = client.name.toLowerCase().includes(term);
      const matchesEmail = client.email.toLowerCase().includes(term);
      const matchesPhone = client.phone.toLowerCase().includes(term);
      const matchesTag = client.tags.some(t => t.toLowerCase().includes(term));
      if (!matchesName && !matchesEmail && !matchesPhone && !matchesTag) {
        return false;
      }
    }
    return true;
  });

  const handleAddSystemTag = () => {
    if (newSystemTagValue.trim() && !systemTags.includes(newSystemTagValue.trim())) {
      const tagName = newSystemTagValue.trim();
      setSystemTags([...systemTags, tagName]);
      setTagColors(prev => ({ ...prev, [tagName]: newSystemTagColor }));
      
      // Reset
      setNewSystemTagValue('');
      setNewSystemTagColor(TAG_COLORS[5].class);
      setIsAddingSystemTag(false);
    }
  };

  const handleStartEditing = (tag: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingTag(tag);
    setEditTagValue(tag);
    setEditTagColor(tagColors[tag] || TAG_COLORS[5].class);
  };

  const handleSaveEdit = () => {
    if (!editingTag || !editTagValue.trim()) return;
    
    const oldTag = editingTag;
    const newTag = editTagValue.trim();
    const newColor = editTagColor;

    // Prevent duplicate if renaming to another existing tag (unless it's the same tag)
    if (newTag !== oldTag && systemTags.includes(newTag)) {
        alert('Tag already exists');
        return;
    }

    // 1. Update System Tags
    setSystemTags(prev => prev.map(t => t === oldTag ? newTag : t));

    // 2. Update Colors
    setTagColors(prev => {
        const next = { ...prev };
        if (newTag !== oldTag) {
            delete next[oldTag];
        }
        next[newTag] = newColor;
        return next;
    });

    // 3. Update Clients (Rename tag in client records)
    if (newTag !== oldTag) {
        clients.forEach(client => {
            if (client.tags.includes(oldTag)) {
                const updatedTags = client.tags.map(t => t === oldTag ? newTag : t);
                onUpdateClient({ ...client, tags: updatedTags });
            }
        });
    }

    // Update active filter if necessary
    if (activeTagFilter === oldTag) {
        setActiveTagFilter(newTag);
    }

    setEditingTag(null);
  };

  const handleAddTagToClient = (client: Client, tag: string) => {
    if (tag && !client.tags.includes(tag)) {
      const updatedTags = [...client.tags, tag];
      onUpdateClient({ ...client, tags: updatedTags });
      setActiveTagInputClient(null);
    }
  };

  const handleCreateClient = () => {
    if (newClientForm.name) {
      const newClient: Client = {
        id: `c-${Date.now()}`,
        name: newClientForm.name || 'Unknown',
        email: newClientForm.email || '',
        phone: newClientForm.phone || '',
        birthday: newClientForm.birthday || new Date().toISOString().split('T')[0],
        totalPolicies: 0,
        lastContact: new Date().toISOString().split('T')[0],
        status: 'Lead',
        tags: newClientForm.tags || []
      };
      onAddClient(newClient);
      setIsAddClientModalOpen(false);
      setNewClientForm({ name: '', email: '', phone: '', birthday: '', tags: [] });
    }
  };

  const handleCreatePolicy = () => {
    if (addingPolicyToClient && newPolicyForm.planName && newPolicyForm.policyNumber) {
        const policy: PolicyData = {
            id: `manual-p-${Date.now()}`,
            holderName: addingPolicyToClient.name,
            planName: newPolicyForm.planName || 'Unknown Plan',
            policyNumber: newPolicyForm.policyNumber || 'N/A',
            type: newPolicyForm.type || 'Life',
            policyAnniversaryDate: newPolicyForm.policyAnniversaryDate || new Date().toLocaleDateString('en-GB', {day: '2-digit', month: '2-digit'}),
            paymentMode: newPolicyForm.paymentMode || 'Yearly',
            premiumAmount: Number(newPolicyForm.premiumAmount) || 0,
            status: newPolicyForm.status || 'Active',
            extractedTags: [newPolicyForm.type || 'Life'],
            riders: newPolicyForm.riders || []
        };
        
        onAddPolicy(policy, addingPolicyToClient.id);
        setAddingPolicyToClient(null);
        setNewPolicyForm({ planName: '', policyNumber: '', type: 'Life', premiumAmount: 0, policyAnniversaryDate: '', paymentMode: 'Yearly', status: 'Active', riders: [] });
    }
  };

  const handleAddRiderToForm = () => {
      setNewPolicyForm(prev => ({
          ...prev,
          riders: [...(prev.riders || []), { name: '', type: prev.type || 'Medical', premiumAmount: 0 }]
      }));
  };

  const handleUpdateRiderInForm = (index: number, field: keyof Rider, value: any) => {
      setNewPolicyForm(prev => {
          const updatedRiders = [...(prev.riders || [])];
          updatedRiders[index] = { ...updatedRiders[index], [field]: value };
          return { ...prev, riders: updatedRiders };
      });
  };

  const handleRemoveRiderFromForm = (index: number) => {
      setNewPolicyForm(prev => ({
          ...prev,
          riders: (prev.riders || []).filter((_, i) => i !== index)
      }));
  };

  return (
    <div className="space-y-6 relative">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
           <h1 className="text-2xl font-bold text-slate-800">{t.title}</h1>
           <p className="text-slate-500 text-sm mt-1">{t.subtitle}</p>
        </div>
        <button 
          onClick={() => setIsAddClientModalOpen(true)}
          className="bg-brand-600 hover:bg-brand-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors shadow-sm w-full md:w-auto justify-center"
        >
          <UserPlus className="w-4 h-4" />
          <span>{t.addClient}</span>
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-4">
        {/* Search Input */}
        <div className="relative">
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
             <input 
               type="text" 
               placeholder={t.searchPlaceholder}
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
               className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white text-slate-900"
             />
        </div>

        {/* Tag Filters */}
        <div>
            <div className="flex items-center space-x-2 mb-3 text-sm font-semibold text-slate-700">
              <Filter className="w-4 h-4 text-brand-500" />
              <span>{t.filterTags}</span>
            </div>
            <div className="flex flex-wrap gap-2 items-center">
              <button 
                onClick={() => setActiveTagFilter(null)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                  activeTagFilter === null 
                    ? 'bg-slate-800 text-white shadow-sm' 
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {t.all}
              </button>
              
              {systemTags.map(tag => {
                if (editingTag === tag) {
                  return (
                    <div key={tag} className="flex items-center gap-2 bg-white border border-brand-300 rounded-lg px-2 py-1.5 shadow-sm animate-in fade-in zoom-in duration-200">
                      <input 
                        autoFocus
                        type="text"
                        value={editTagValue}
                        onChange={(e) => setEditTagValue(e.target.value)}
                        onKeyDown={(e) => {
                          if(e.key === 'Enter') handleSaveEdit();
                          if(e.key === 'Escape') setEditingTag(null);
                        }}
                        className="w-24 bg-transparent text-sm text-slate-700 placeholder-slate-400 focus:outline-none border-b border-transparent focus:border-brand-300 pb-0.5"
                      />
                      <div className="flex gap-1 border-l border-slate-200 pl-2">
                        {TAG_COLORS.map((color) => (
                          <button
                            key={color.name}
                            onClick={() => setEditTagColor(color.class)}
                            className={`w-3 h-3 rounded-full ${color.dot} ${editTagColor === color.class ? 'ring-2 ring-offset-1 ring-slate-400 scale-110' : 'opacity-40 hover:opacity-100'} transition-all`}
                            title={color.name}
                          />
                        ))}
                      </div>
                      <button 
                        onClick={handleSaveEdit} 
                        className="p-1 text-green-600 hover:text-green-700 hover:bg-green-50 rounded-full transition-colors"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                      <button 
                        onClick={() => setEditingTag(null)} 
                        className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-full transition-colors"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                }
                
                return (
                  <div key={tag} className="relative group">
                    <button
                      onClick={() => setActiveTagFilter(activeTagFilter === tag ? null : tag)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all pr-7 ${
                        activeTagFilter === tag
                          ? 'bg-brand-600 text-white border-brand-600 shadow-sm'
                          : getTagStyle(tag) + ' hover:opacity-80'
                      }`}
                    >
                      {tag}
                    </button>
                    <button
                      onClick={(e) => handleStartEditing(tag, e)}
                      className={`absolute right-1 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-black/10 transition-all opacity-0 group-hover:opacity-100 ${
                        activeTagFilter === tag ? 'text-white/80 hover:text-white' : 'text-slate-500 hover:text-slate-800'
                      }`}
                      title="Edit tag"
                    >
                      <Pencil className="w-3 h-3" />
                    </button>
                  </div>
                );
              })}
              
              {/* Add System Tag Button/Input */}
              {isAddingSystemTag ? (
                <div className="flex items-center gap-2 bg-white border border-slate-300 rounded-lg px-2 py-1.5 shadow-sm animate-in fade-in zoom-in duration-200">
                  <input 
                    autoFocus
                    type="text"
                    value={newSystemTagValue}
                    onChange={(e) => setNewSystemTagValue(e.target.value)}
                    onKeyDown={(e) => {
                      if(e.key === 'Enter') handleAddSystemTag();
                      if(e.key === 'Escape') setIsAddingSystemTag(false);
                    }}
                    className="w-24 bg-transparent text-sm text-slate-700 placeholder-slate-400 focus:outline-none border-b border-transparent focus:border-brand-300 pb-0.5"
                    placeholder="New tag..."
                  />
                  
                  {/* Color Picker */}
                  <div className="flex gap-1 border-l border-slate-200 pl-2">
                    {TAG_COLORS.map((color) => (
                      <button
                        key={color.name}
                        onClick={() => setNewSystemTagColor(color.class)}
                        className={`w-3 h-3 rounded-full ${color.dot} ${newSystemTagColor === color.class ? 'ring-2 ring-offset-1 ring-slate-400 scale-110' : 'opacity-40 hover:opacity-100'} transition-all`}
                        title={color.name}
                      />
                    ))}
                  </div>

                  <div className="flex items-center border-l border-slate-200 pl-2 ml-1 gap-1">
                    <button 
                      onClick={handleAddSystemTag}
                      className="p-1 text-green-600 hover:text-green-700 hover:bg-green-50 rounded-full transition-colors"
                    >
                      <Check className="w-3.5 h-3.5" />
                    </button>
                    <button 
                      onClick={() => setIsAddingSystemTag(false)}
                      className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-full transition-colors"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ) : (
                <button 
                  onClick={() => setIsAddingSystemTag(true)}
                  className="px-3 py-1.5 rounded-full text-xs font-medium border border-dashed border-slate-300 text-slate-500 hover:text-brand-600 hover:border-brand-400 flex items-center transition-colors"
                >
                  <Plus className="w-3 h-3 mr-1" />
                  {t.addTag}
                </button>
              )}
            </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden min-h-[400px]">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 w-64">{t.table.name}</th>
                <th className="px-6 py-4">{t.table.tags}</th>
                <th className="px-6 py-4">{t.table.birthday}</th>
                <th className="px-6 py-4">{t.table.policies}</th>
                <th className="px-6 py-4">{t.table.status}</th>
                <th className="px-6 py-4 text-right">{t.table.actions}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredClients.map((client) => (
                <tr key={client.id} className="hover:bg-slate-50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div 
                        className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 font-bold text-sm mr-3 cursor-pointer hover:bg-brand-100 hover:text-brand-600 transition-colors"
                        onClick={() => onViewDetails(client)}
                      >
                        {client.name.charAt(0)}
                      </div>
                      <div>
                        <div 
                            className="font-medium text-slate-900 cursor-pointer hover:text-brand-600 transition-colors"
                            onClick={() => onViewDetails(client)}
                        >
                            {client.name}
                        </div>
                        <div className="text-xs text-slate-500 flex items-center mt-0.5">
                           <Phone className="w-3 h-3 mr-1" /> {client.phone}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1.5 items-center">
                      {client.tags.length > 0 ? (
                        client.tags.map(tag => (
                          <span 
                            key={tag} 
                            className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium border ${getTagStyle(tag)}`}
                          >
                            {tag}
                          </span>
                        ))
                      ) : (
                        <span className="text-slate-400 text-xs italic">{t.table.noTags}</span>
                      )}
                      
                      {/* Add Tag Select Inline */}
                      {activeTagInputClient === client.id ? (
                        <div className="relative">
                          <select 
                            autoFocus
                            onChange={(e) => handleAddTagToClient(client, e.target.value)}
                            onBlur={() => setActiveTagInputClient(null)}
                            className="w-28 pl-1 pr-6 py-0.5 text-xs border border-brand-300 rounded focus:outline-none focus:ring-1 focus:ring-brand-500 appearance-none bg-white text-slate-900"
                            defaultValue=""
                          >
                             <option value="" disabled>Select...</option>
                             {systemTags.filter(t => !client.tags.includes(t)).map(tag => (
                                <option key={tag} value={tag}>{tag}</option>
                             ))}
                          </select>
                           <ChevronDown className="w-3 h-3 text-slate-400 absolute right-1 top-1/2 -translate-y-1/2 pointer-events-none" />
                        </div>
                      ) : (
                        <button 
                          onClick={() => setActiveTagInputClient(client.id)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 rounded-full hover:bg-slate-200 text-slate-400"
                          title="Add Tag"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-600">
                    <div className="flex items-center">
                      <Calendar className="w-3 h-3 mr-2 text-brand-400" />
                      {new Date(client.birthday).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-600">
                    <span className="font-medium">{client.totalPolicies}</span> Policies
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      client.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-slate-100 text-slate-600'
                    }`}>
                      {client.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                        <button 
                            onClick={() => onViewDetails(client)}
                            className="p-2 text-slate-400 hover:text-brand-600 rounded-lg hover:bg-slate-100 transition-colors"
                            title="View Details"
                        >
                            <Eye className="w-5 h-5" />
                        </button>
                        <button 
                            onClick={() => setAddingPolicyToClient(client)}
                            className="p-2 text-slate-400 hover:text-brand-600 rounded-lg hover:bg-slate-100 transition-colors"
                            title="Add Policy"
                        >
                            <FilePlus className="w-5 h-5" />
                        </button>
                        <button className="p-2 text-slate-400 hover:text-brand-600 rounded-lg hover:bg-slate-100 transition-colors">
                            <MoreHorizontal className="w-5 h-5" />
                        </button>
                    </div>
                  </td>
                </tr>
              ))}
              
              {filteredClients.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                    <Tag className="w-12 h-12 mx-auto text-slate-300 mb-3" />
                    <p>{t.table.notFound}</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Client Modal */}
      {isAddClientModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="font-bold text-slate-800">{t.addClient}</h3>
              <button 
                onClick={() => setIsAddClientModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                <input 
                  type="text" 
                  value={newClientForm.name}
                  onChange={e => setNewClientForm({...newClientForm, name: e.target.value})}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white text-slate-900"
                  placeholder="e.g. John Doe"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                <input 
                  type="email" 
                  value={newClientForm.email}
                  onChange={e => setNewClientForm({...newClientForm, email: e.target.value})}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white text-slate-900"
                  placeholder="john@example.com"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                 <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Birthday</label>
                  <input 
                    type="date" 
                    value={newClientForm.birthday}
                    onChange={e => setNewClientForm({...newClientForm, birthday: e.target.value})}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white text-slate-900"
                  />
                </div>
                 <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Phone</label>
                  <input 
                    type="tel" 
                    value={newClientForm.phone}
                    onChange={e => setNewClientForm({...newClientForm, phone: e.target.value})}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white text-slate-900"
                    placeholder="+1 234..."
                  />
                </div>
              </div>
              
              <div>
                 <label className="block text-sm font-medium text-slate-700 mb-1">Tags</label>
                 
                 {/* Tag Selection Dropdown */}
                 <div className="relative mb-2">
                    <select
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 appearance-none bg-white text-slate-700"
                      value=""
                      onChange={e => {
                        const val = e.target.value;
                        if (val && !newClientForm.tags?.includes(val)) {
                            setNewClientForm(prev => ({...prev, tags: [...(prev.tags || []), val]}));
                        }
                      }}
                    >
                        <option value="" disabled>Select a system tag...</option>
                        {systemTags.filter(t => !newClientForm.tags?.includes(t)).map(tag => (
                            <option key={tag} value={tag}>{tag}</option>
                        ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4 pointer-events-none" />
                 </div>

                 {/* Optional Custom Tag Input */}
                 <div className="flex gap-2 mb-3">
                    <input 
                      type="text" 
                      value={newClientTagInput}
                      onChange={e => setNewClientTagInput(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === 'Enter' && newClientTagInput.trim()) {
                            e.preventDefault();
                            setNewClientForm(prev => ({...prev, tags: [...(prev.tags || []), newClientTagInput.trim()]}));
                            setNewClientTagInput('');
                        }
                      }}
                      className="flex-1 px-3 py-1.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 placeholder-slate-400 bg-white text-slate-900"
                      placeholder="Or type custom tag..."
                    />
                    <button 
                      onClick={() => {
                        if (newClientTagInput.trim()) {
                           setNewClientForm(prev => ({...prev, tags: [...(prev.tags || []), newClientTagInput.trim()]}));
                           setNewClientTagInput('');
                        }
                      }}
                      className="px-3 py-1.5 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 text-xs font-medium"
                    >
                      Add
                    </button>
                 </div>

                 {/* Selected Tags Display */}
                 <div className="flex flex-wrap gap-2 min-h-[24px]">
                    {newClientForm.tags?.map((tag, idx) => (
                      <span 
                        key={idx} 
                        className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium shadow-sm border ${getTagStyle(tag)}`}
                      >
                        {tag}
                        <button 
                          onClick={() => setNewClientForm(prev => ({...prev, tags: prev.tags?.filter((_, i) => i !== idx)}))}
                          className="ml-1.5 opacity-60 hover:opacity-100 p-0.5"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                    {newClientForm.tags?.length === 0 && (
                        <span className="text-slate-400 text-xs italic py-1">No tags selected</span>
                    )}
                 </div>
              </div>
            </div>
            <div className="p-5 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
              <button 
                onClick={() => setIsAddClientModalOpen(false)}
                className="px-4 py-2 text-slate-600 font-medium hover:text-slate-800"
              >
                Cancel
              </button>
              <button 
                onClick={handleCreateClient}
                className="px-4 py-2 bg-brand-600 text-white rounded-lg font-medium hover:bg-brand-700 shadow-sm"
              >
                Create Client
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Policy Modal */}
      {addingPolicyToClient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in duration-200 my-8">
            <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <div className="flex items-center gap-3">
                 <div className="w-10 h-10 rounded-full bg-brand-50 flex items-center justify-center text-brand-600">
                    <Shield className="w-5 h-5" />
                 </div>
                 <div>
                    <h3 className="font-bold text-slate-800">Add Policy</h3>
                    <p className="text-xs text-slate-500">for {addingPolicyToClient.name}</p>
                 </div>
              </div>
              <button 
                onClick={() => setAddingPolicyToClient(null)}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
               <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Plan Name (Base)</label>
                <input 
                  list="client-plan-options"
                  type="text" 
                  value={newPolicyForm.planName}
                  onChange={e => {
                    const val = e.target.value;
                    const product = products.find(p => p.name === val);
                    setNewPolicyForm(prev => ({
                        ...prev, 
                        planName: val,
                        type: product ? product.type : prev.type 
                    }));
                  }}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white text-slate-900"
                  placeholder="Select or type plan name..."
                  autoFocus
                />
                <datalist id="client-plan-options">
                    {products.map(p => (
                        <option key={p.name} value={p.name}>{p.provider} - {p.type}</option>
                    ))}
                </datalist>
              </div>

              <div className="grid grid-cols-2 gap-4">
                 <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Policy Number</label>
                    <input 
                    type="text" 
                    value={newPolicyForm.policyNumber}
                    onChange={e => setNewPolicyForm({...newPolicyForm, policyNumber: e.target.value})}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white text-slate-900"
                    placeholder="POL-..."
                    />
                 </div>
                 <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Type</label>
                    <div className="relative">
                        <select 
                        value={newPolicyForm.type}
                        onChange={e => setNewPolicyForm({...newPolicyForm, type: e.target.value as any})}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 appearance-none bg-white text-slate-900"
                        >
                            <option value="Life">Life</option>
                            <option value="Medical">Medical</option>
                            <option value="Auto">Auto</option>
                            <option value="Property">Property</option>
                            <option value="Critical Illness">Critical Illness</option>
                            <option value="Savings">Savings</option>
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4 pointer-events-none" />
                    </div>
                 </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                 <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Base Premium ($)</label>
                    <input 
                    type="number" 
                    value={newPolicyForm.premiumAmount}
                    onChange={e => setNewPolicyForm({...newPolicyForm, premiumAmount: Number(e.target.value)})}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white text-slate-900"
                    />
                 </div>
                 
                 <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Anniversary Date</label>
                    <input 
                    type="text" 
                    value={newPolicyForm.policyAnniversaryDate}
                    onChange={e => setNewPolicyForm({...newPolicyForm, policyAnniversaryDate: e.target.value})}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white text-slate-900"
                    placeholder="DD/MM"
                    />
                 </div>
              </div>

               <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Payment Mode</label>
                    <div className="relative">
                        <select 
                        value={newPolicyForm.paymentMode}
                        onChange={e => setNewPolicyForm({...newPolicyForm, paymentMode: e.target.value as any})}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 appearance-none bg-white text-slate-900"
                        >
                            <option value="Yearly">Yearly</option>
                            <option value="Half-Yearly">Half-Yearly</option>
                            <option value="Quarterly">Quarterly</option>
                            <option value="Monthly">Monthly</option>
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4 pointer-events-none" />
                    </div>
                 </div>

                 {/* Riders Section */}
                 <div className="pt-2 border-t border-slate-200 mt-2">
                    <div className="flex justify-between items-center mb-2">
                        <label className="text-sm font-semibold text-slate-700 flex items-center gap-1">
                            <Layers className="w-4 h-4 text-slate-500" />
                            Riders / Supplementary
                        </label>
                        <button 
                            onClick={handleAddRiderToForm}
                            className="text-xs text-brand-600 font-medium hover:underline flex items-center"
                        >
                            <Plus className="w-3 h-3 mr-1" />
                            Add Rider
                        </button>
                    </div>

                    <div className="space-y-3">
                        {newPolicyForm.riders?.map((rider, idx) => (
                            <div key={idx} className="bg-slate-50 p-3 rounded-lg border border-slate-200 relative">
                                <button 
                                    onClick={() => handleRemoveRiderFromForm(idx)}
                                    className="absolute right-2 top-2 text-slate-400 hover:text-red-500"
                                >
                                    <Trash2 className="w-3 h-3" />
                                </button>
                                <div className="grid grid-cols-1 gap-2">
                                    <input 
                                        type="text" 
                                        value={rider.name}
                                        placeholder="Rider Name"
                                        onChange={(e) => handleUpdateRiderInForm(idx, 'name', e.target.value)}
                                        className="w-full px-2 py-1 text-sm border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-brand-500 bg-white text-slate-900"
                                    />
                                    <div className="flex gap-2">
                                         <div className="flex-1">
                                             <input 
                                                type="number" 
                                                value={rider.premiumAmount}
                                                placeholder="Premium"
                                                onChange={(e) => handleUpdateRiderInForm(idx, 'premiumAmount', parseFloat(e.target.value))}
                                                className="w-full px-2 py-1 text-sm border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-brand-500 bg-white text-slate-900"
                                            />
                                         </div>
                                         <div className="flex-1">
                                              <select 
                                                value={rider.type}
                                                onChange={(e) => handleUpdateRiderInForm(idx, 'type', e.target.value)}
                                                className="w-full px-2 py-1 text-sm border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-brand-500 bg-white text-slate-900"
                                              >
                                                <option value="Medical">Medical</option>
                                                <option value="Accident">Accident</option>
                                                <option value="Life">Life</option>
                                                <option value="Critical Illness">Critical Illness</option>
                                              </select>
                                         </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                        {(!newPolicyForm.riders || newPolicyForm.riders.length === 0) && (
                            <p className="text-xs text-slate-400 italic text-center py-2">No riders added.</p>
                        )}
                    </div>
                 </div>
            </div>

            <div className="p-5 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
              <button 
                onClick={() => setAddingPolicyToClient(null)}
                className="px-4 py-2 text-slate-600 font-medium hover:text-slate-800"
              >
                Cancel
              </button>
              <button 
                onClick={handleCreatePolicy}
                className="px-4 py-2 bg-brand-600 text-white rounded-lg font-medium hover:bg-brand-700 shadow-sm flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                Save Policy
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};