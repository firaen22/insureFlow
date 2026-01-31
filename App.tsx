import React, { useState, useEffect } from 'react';
import { Layout } from './components/Layout';
import { DashboardView } from './components/DashboardView';
import { UploadView } from './components/UploadView';
import { ClientsView } from './components/ClientsView';
import { ProductLibraryView } from './components/ProductLibraryView';
import { ClientDetailsView } from './components/ClientDetailsView';
import { RemindersView } from './components/RemindersView';
import { AppView, Language, Client, PolicyData, Product } from './types';
import { TRANSLATIONS, MOCK_CLIENTS, RECENT_POLICIES, PRODUCT_LIBRARY } from './constants';
import { initGoogleClient, signInToGoogle, fetchPoliciesFromSheet, savePolicyToSheet, syncAllPoliciesToSheet, ensureSheetStructure, createSpreadsheet, listSpreadsheets, DriveFile } from './utils/googleSheets';
import { X, Save, AlertTriangle, LogOut, RefreshCw, Copy, Check, ExternalLink, HelpCircle, ShieldAlert, Cloud, Lock, Link, FilePlus, ChevronRight, Settings, FileSpreadsheet, Loader2, ArrowLeft } from 'lucide-react';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<AppView>(AppView.DASHBOARD);
  const [language, setLanguage] = useState<Language>('en');
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  
  // Lifted State
  const [clients, setClients] = useState<Client[]>(MOCK_CLIENTS);
  const [policies, setPolicies] = useState<PolicyData[]>(RECENT_POLICIES);
  const [products, setProducts] = useState<Product[]>(PRODUCT_LIBRARY);

  // Google Integration State
  const [isDriveConnected, setIsDriveConnected] = useState(false);
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [showSyncOptions, setShowSyncOptions] = useState(false); // New state for connected menu
  const [configForm, setConfigForm] = useState({
      clientId: '',
      apiKey: '',
  });
  
  // Connection Wizard State
  const [connectionStep, setConnectionStep] = useState<1 | 2 | 3>(1); // 1=Keys, 2=Login, 3=Sheet
  const [isGoogleSignedIn, setIsGoogleSignedIn] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [availableSheets, setAvailableSheets] = useState<DriveFile[]>([]);
  const [isLoadingSheets, setIsLoadingSheets] = useState(false);

  const [copied, setCopied] = useState(false);
  
  const t = TRANSLATIONS[language];
  const currentOrigin = typeof window !== 'undefined' ? window.location.origin : '';
  const isLocalhost = currentOrigin.includes('localhost') || currentOrigin.includes('127.0.0.1');

  // Load Config from LocalStorage on mount
  useEffect(() => {
    const savedConfig = localStorage.getItem('insureflow_google_config');
    if (savedConfig) {
        try {
            const parsed = JSON.parse(savedConfig);
            if (parsed.clientId && parsed.apiKey) {
                setConfigForm({ clientId: parsed.clientId, apiKey: parsed.apiKey });
                
                // Auto-init
                initGoogleClient(parsed.clientId, parsed.apiKey, parsed.spreadsheetId)
                    .then(() => {
                        console.log("Google API Initialized from saved config");
                        // Determine status
                        if (parsed.spreadsheetId) {
                            setIsDriveConnected(true);
                        } else {
                            // Keys exist but no sheet, skip to login or selection
                            setConnectionStep(2);
                        }
                    })
                    .catch(err => console.error("Auto-init failed", err));
            }
        } catch (e) {
            console.error("Failed to parse saved config", e);
        }
    }
  }, []);

  // Helper to rebuild client list from policies (when syncing from sheet)
  const rebuildClientsFromPolicies = (policyList: PolicyData[]) => {
      const clientMap = new Map<string, Client>();
      
      policyList.forEach(p => {
          if (!clientMap.has(p.holderName)) {
              clientMap.set(p.holderName, {
                  id: `c-${p.holderName.replace(/\s/g, '')}`,
                  name: p.holderName,
                  email: 'synced@sheet.com',
                  phone: 'Unknown',
                  birthday: p.clientBirthday || '1990-01-01',
                  totalPolicies: 0,
                  lastContact: new Date().toISOString().split('T')[0],
                  status: 'Active',
                  tags: []
              });
          }
          
          const client = clientMap.get(p.holderName)!;
          client.totalPolicies += 1;
          client.tags = [...new Set([...client.tags, ...(p.extractedTags || [])])];
          // Use latest policy birthday
          if (p.clientBirthday) client.birthday = p.clientBirthday;
      });

      setClients(Array.from(clientMap.values()));
  };

  const handleConnectDrive = () => {
    if (isDriveConnected) {
        setShowSyncOptions(true);
        return;
    }
    // Determine start step smart
    if (configForm.clientId && configForm.apiKey) {
        if (isGoogleSignedIn) {
            fetchSheets();
            setConnectionStep(3);
        } else {
            setConnectionStep(2);
        }
    } else {
        setConnectionStep(1);
    }
    setShowConfigModal(true);
  };

  const handleSyncNow = async () => {
    setShowSyncOptions(false);
    try {
        await signInToGoogle(); 
        await ensureSheetStructure();
        const sheetPolicies = await fetchPoliciesFromSheet();
        if (sheetPolicies.length > 0) {
            setPolicies(sheetPolicies);
            rebuildClientsFromPolicies(sheetPolicies);
            alert('Synced successfully from Google Sheets!');
        } else {
            alert('Connected Sheet is empty.');
        }
    } catch (e) {
        console.error(e);
        alert('Failed to sync. Check console for details.');
    }
  };

  const handleDisconnect = () => {
    localStorage.removeItem('insureflow_google_config');
    setIsDriveConnected(false);
    setShowSyncOptions(false);
    setConfigForm({ clientId: '', apiKey: '' });
    setConnectionStep(1);
    setIsGoogleSignedIn(false);
    alert("Disconnected. Configuration cleared.");
  };

  const copyOrigin = () => {
      navigator.clipboard.writeText(currentOrigin);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
  };

  // STEP 1: SAVE API KEYS
  const handleSaveKeys = async () => {
      const cleanClientId = configForm.clientId.trim();
      const cleanApiKey = configForm.apiKey.trim();

      if (!cleanClientId || !cleanApiKey) {
        alert("Please enter both Client ID and API Key");
        return;
      }

      try {
          await initGoogleClient(cleanClientId, cleanApiKey);
          // Save keys partially
          localStorage.setItem('insureflow_google_config', JSON.stringify({
              clientId: cleanClientId,
              apiKey: cleanApiKey,
              spreadsheetId: '' 
          }));
          setConnectionStep(2); // Move to Login
          setConnectionError(null);
      } catch (e: any) {
          console.error("Init failed", e);
          setConnectionError("Invalid Keys or Google Script failed to load.");
      }
  };

  // STEP 2: LOGIN
  const handleGoogleLogin = async () => {
      try {
          await signInToGoogle();
          setIsGoogleSignedIn(true);
          setConnectionStep(3);
          setConnectionError(null);
          fetchSheets(); // Auto-fetch sheets on login
      } catch (error: any) {
          console.error("Login failed", error);
          const msg = error?.result?.error?.message || JSON.stringify(error);
          
          if (msg.includes("referer") || msg.includes("origin_mismatch")) {
              setConnectionError(`Origin Mismatch. Did you add "${currentOrigin}" to your Google Cloud Console?`);
          } else {
              setConnectionError("Login Failed. Check popup or console.");
          }
      }
  };

  // STEP 3 Helper: Fetch Sheets
  const fetchSheets = async () => {
      setIsLoadingSheets(true);
      try {
          const files = await listSpreadsheets();
          setAvailableSheets(files);
      } catch (e) {
          console.error("Failed to list sheets", e);
          setConnectionError("Failed to list files. Ensure 'Drive API' is enabled in Console.");
      } finally {
          setIsLoadingSheets(false);
      }
  };

  // STEP 3A: CREATE NEW SHEET
  const handleCreateSheet = async () => {
      try {
          const newSheetId = await createSpreadsheet("InsureFlow CRM Data");
          finalizeConnection(newSheetId);
      } catch (e) {
          console.error("Create failed", e);
          alert("Failed to create sheet. Ensure you have Google Drive permissions enabled.");
      }
  };

  // STEP 3B: SELECT SHEET
  const handleSelectSheet = async (sheetId: string) => {
      try {
          // Re-init with sheet ID to be safe
          await initGoogleClient(configForm.clientId, configForm.apiKey, sheetId);
          // Try to fetch/ensure structure
          await ensureSheetStructure(); 
          finalizeConnection(sheetId);
      } catch (e) {
          console.error("Link failed", e);
          alert("Could not access sheet. It might be restricted.");
      }
  };

  const finalizeConnection = (sheetId: string) => {
      // Save Full Config
      localStorage.setItem('insureflow_google_config', JSON.stringify({
          clientId: configForm.clientId,
          apiKey: configForm.apiKey,
          spreadsheetId: sheetId
      }));
      
      setIsDriveConnected(true);
      setShowConfigModal(false);
      
      // Auto-sync initial data if needed
      handleSyncNow();
  };


  const handleSavePolicy = async (policy: PolicyData, isNewProduct: boolean) => {
    // 1. Add Policy Locally
    setPolicies(prev => [policy, ...prev]);

    // 2. Add/Update Client Locally
    setClients(prev => {
      const existingClientIndex = prev.findIndex(c => c.name === policy.holderName);
      
      if (existingClientIndex >= 0) {
        const updatedClients = [...prev];
        const client = updatedClients[existingClientIndex];
        updatedClients[existingClientIndex] = {
          ...client,
          totalPolicies: client.totalPolicies + 1,
          lastContact: new Date().toISOString().split('T')[0],
          birthday: policy.clientBirthday || client.birthday,
          tags: [...new Set([...client.tags, ...(policy.extractedTags || [])])]
        };
        return updatedClients;
      } else {
        const newClient: Client = {
          id: `c-${Date.now()}`,
          name: policy.holderName,
          email: 'pending@email.com',
          phone: 'Pending',
          birthday: policy.clientBirthday || '1990-01-01',
          totalPolicies: 1,
          lastContact: new Date().toISOString().split('T')[0],
          status: 'Lead',
          tags: policy.extractedTags || []
        };
        return [newClient, ...prev];
      }
    });

    // 3. Add Product to Library
    if (isNewProduct) {
      const newProduct: Product = {
        name: policy.planName,
        provider: 'Unknown',
        type: policy.type,
        defaultTags: [policy.type]
      };
      if (!products.some(p => p.name === newProduct.name)) {
        setProducts(prev => [...prev, newProduct]);
      }
    }

    // 4. Sync to Google Sheet if connected
    if (isDriveConnected) {
        try {
            await savePolicyToSheet(policy);
        } catch (e) {
            console.error("Failed to save to sheet", e);
            alert("Saved locally, but failed to save to Sheet (Check console).");
        }
    }
  };

  // ... (Rest of existing handlers like handleManualPolicyAdd, etc. remain unchanged)
  const handleManualPolicyAdd = (policy: PolicyData, clientId: string) => {
    handleSavePolicy(policy, false);
  };

  const handleUpdatePolicy = (updatedPolicy: PolicyData) => {
    setPolicies(prev => prev.map(p => p.id === updatedPolicy.id ? updatedPolicy : p));
    if (isDriveConnected) {
        alert("Note: Updates currently save locally. Resyncing will overwrite this unless implemented in full CRUD.");
    }
  };

  const handleDeletePolicy = (policyId: string) => {
    const policy = policies.find(p => p.id === policyId);
    if (!policy) return;

    setPolicies(prev => prev.filter(p => p.id !== policyId));
    setClients(prev => prev.map(client => {
      if (client.name === policy.holderName) {
        return { ...client, totalPolicies: Math.max(0, client.totalPolicies - 1) };
      }
      return client;
    }));
  };

  const handleUpdateClient = (updatedClient: Client) => {
    setClients(prev => prev.map(c => c.id === updatedClient.id ? updatedClient : c));
  };

  const handleAddClient = (newClient: Client) => {
    setClients(prev => [newClient, ...prev]);
  };
  
  const handleViewClientDetails = (client: Client) => {
    setSelectedClientId(client.id);
    setCurrentView(AppView.CLIENT_DETAILS);
  };
  
  const handleBackToClients = () => {
    setSelectedClientId(null);
    setCurrentView(AppView.CLIENTS);
  };

  const handleUpdateProduct = (updatedProduct: Product, originalName: string) => {
    setProducts(prev => prev.map(p => p.name === originalName ? updatedProduct : p));
  };

  const handleAddProduct = (newProduct: Product) => {
     if (products.some(p => p.name === newProduct.name)) {
        alert("A product with this name already exists.");
        return;
     }
     setProducts(prev => [newProduct, ...prev]);
  };

  const selectedClient = clients.find(c => c.id === selectedClientId);
  const selectedClientPolicies = selectedClient 
    ? policies.filter(p => p.holderName === selectedClient.name) 
    : [];

  return (
    <>
    <Layout 
      currentView={currentView} 
      onChangeView={setCurrentView}
      language={language}
      onToggleLanguage={() => setLanguage(prev => prev === 'en' ? 'zh' : 'en')}
      t={t}
      isDriveConnected={isDriveConnected}
      onConnectDrive={handleConnectDrive}
    >
      {currentView === AppView.DASHBOARD && (
        <DashboardView t={t.dashboard} clients={clients} policies={policies} />
      )}
      {currentView === AppView.UPLOAD && (
        <UploadView t={t.upload} products={products} onSave={handleSavePolicy} />
      )}
      {currentView === AppView.CLIENTS && (
        <ClientsView 
          t={t.clients} 
          clients={clients} 
          policies={policies}
          products={products}
          onUpdateClient={handleUpdateClient}
          onAddClient={handleAddClient}
          onAddPolicy={handleManualPolicyAdd}
          onViewDetails={handleViewClientDetails}
        />
      )}
      {currentView === AppView.CLIENT_DETAILS && selectedClient && (
        <ClientDetailsView
          t={t.clientDetails}
          client={selectedClient}
          policies={selectedClientPolicies}
          products={products}
          onUpdatePolicy={handleUpdatePolicy}
          onDeletePolicy={handleDeletePolicy}
          onBack={handleBackToClients}
        />
      )}
      {currentView === AppView.REMINDERS && (
        <RemindersView
          t={t.reminders}
          policies={policies}
          clients={clients}
          onUploadRenewal={() => setCurrentView(AppView.UPLOAD)}
        />
      )}
      {currentView === AppView.PRODUCTS && (
        <ProductLibraryView 
          t={t.products} 
          products={products}
          onUpdateProduct={handleUpdateProduct}
          onAddProduct={handleAddProduct}
        />
      )}
    </Layout>

    {/* Connected Options Modal */}
    {showSyncOptions && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
            <div className="bg-white rounded-xl shadow-xl max-w-sm w-full overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                    <h3 className="font-bold text-slate-800">Connection Settings</h3>
                    <button onClick={() => setShowSyncOptions(false)} className="text-slate-400 hover:text-slate-600">
                        <X className="w-5 h-5" />
                    </button>
                </div>
                <div className="p-4 space-y-3">
                    <button 
                        onClick={handleSyncNow}
                        className="w-full flex items-center justify-between p-3 bg-brand-50 text-brand-700 rounded-lg hover:bg-brand-100 transition-colors"
                    >
                        <span className="font-medium flex items-center gap-2"><RefreshCw className="w-4 h-4" /> Sync Data Now</span>
                    </button>
                    
                    <button 
                        onClick={handleDisconnect}
                        className="w-full flex items-center justify-between p-3 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors"
                    >
                        <span className="font-medium flex items-center gap-2"><LogOut className="w-4 h-4" /> Disconnect Sheet</span>
                    </button>
                </div>
            </div>
        </div>
    )}

    {/* Connection Wizard Modal */}
    {showConfigModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full overflow-hidden animate-in fade-in zoom-in duration-200 flex flex-col max-h-[90vh]">
                
                {/* Header */}
                <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                    <div className="flex items-center gap-3">
                        <div className="bg-white p-2 rounded-lg border border-slate-200 shadow-sm text-green-600">
                           <Cloud className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-800">Connect Google Sheets</h3>
                            <p className="text-xs text-slate-500">
                                {connectionStep === 1 ? 'Project Setup' : 
                                 connectionStep === 2 ? 'Authorization' : 'Select Sheet'}
                            </p>
                        </div>
                    </div>
                    <button onClick={() => setShowConfigModal(false)} className="text-slate-400 hover:text-slate-600">
                        <X className="w-5 h-5" />
                    </button>
                </div>
                
                <div className="p-6 overflow-y-auto space-y-6">
                    {/* Error Message */}
                    {connectionError && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-xs text-red-800 flex items-start gap-2">
                             <ShieldAlert className="w-4 h-4 mt-0.5 flex-shrink-0" />
                             <div>
                                <p className="font-bold">Connection Error</p>
                                <p>{connectionError}</p>
                             </div>
                        </div>
                    )}

                    {/* STEP 1: API KEYS */}
                    {connectionStep === 1 && (
                        <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
                            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 text-sm text-blue-800">
                                <p className="mb-2 font-bold">First Time Setup Required</p>
                                <p className="text-xs mb-2">To connect your Google Drive securely, you need to create your own "App Keys" once. Subsequent logins will be one-click.</p>
                                <div className="flex items-center gap-2 text-xs bg-white p-2 rounded border border-blue-100">
                                     <span className="text-slate-400">Origin:</span>
                                     <code className="select-all font-mono">{currentOrigin}</code>
                                     <button onClick={copyOrigin} className="text-blue-600 hover:underline ml-auto font-medium">{copied ? "Copied" : "Copy"}</button>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">OAuth Client ID</label>
                                <input 
                                    type="text"
                                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 text-slate-900" 
                                    placeholder="...apps.googleusercontent.com"
                                    value={configForm.clientId}
                                    onChange={e => setConfigForm({...configForm, clientId: e.target.value})}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">API Key</label>
                                <input 
                                    type="text"
                                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 text-slate-900" 
                                    placeholder="AIzaSy..."
                                    value={configForm.apiKey}
                                    onChange={e => setConfigForm({...configForm, apiKey: e.target.value})}
                                />
                            </div>
                            <button 
                                onClick={handleSaveKeys}
                                className="w-full bg-slate-800 hover:bg-slate-900 text-white font-medium py-3 rounded-lg shadow-md mt-2 flex justify-center items-center gap-2"
                            >
                                Continue <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    )}

                    {/* STEP 2: LOGIN */}
                    {connectionStep === 2 && (
                         <div className="space-y-6 text-center py-4 animate-in fade-in slide-in-from-right-4">
                             <div className="w-16 h-16 bg-brand-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                 <Lock className="w-8 h-8 text-brand-600" />
                             </div>
                             <div>
                                 <h4 className="font-bold text-slate-800 text-lg">Sign in with Google</h4>
                                 <p className="text-slate-500 text-sm mt-1">Authorize access to your Spreadsheets & Drive Files.</p>
                             </div>
                             
                             <button 
                                onClick={handleGoogleLogin}
                                className="w-full bg-brand-600 hover:bg-brand-700 text-white font-medium py-3 rounded-lg shadow-lg flex justify-center items-center gap-2 transform active:scale-[0.98]"
                            >
                                <Cloud className="w-5 h-5" />
                                Sign In & Connect
                            </button>
                            
                            <button 
                                onClick={() => setConnectionStep(1)}
                                className="text-xs text-slate-400 hover:text-slate-600 flex items-center justify-center gap-1 mx-auto"
                            >
                                <Settings className="w-3 h-3" /> Configure Keys
                            </button>
                         </div>
                    )}

                    {/* STEP 3: SELECT SHEET LIST */}
                    {connectionStep === 3 && (
                        <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
                            <button 
                                onClick={() => setConnectionStep(2)}
                                className="flex items-center text-xs text-slate-400 hover:text-slate-600 mb-2"
                            >
                                <ArrowLeft className="w-3 h-3 mr-1" /> Back
                            </button>

                            <button 
                                onClick={handleCreateSheet}
                                className="w-full p-4 bg-green-50 hover:bg-green-100 border border-green-200 rounded-xl flex items-center gap-4 transition-all group text-left mb-4"
                            >
                                <div className="bg-white p-3 rounded-full shadow-sm text-green-600 group-hover:scale-110 transition-transform">
                                    <FilePlus className="w-6 h-6" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-green-900">Create New Database</h4>
                                    <p className="text-xs text-green-700 mt-1">Auto-generates structure</p>
                                </div>
                                <ChevronRight className="w-5 h-5 text-green-400 ml-auto" />
                            </button>

                            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Select Existing Sheet</h4>
                            
                            {isLoadingSheets ? (
                                <div className="text-center py-8">
                                    <Loader2 className="w-8 h-8 text-brand-500 animate-spin mx-auto mb-2" />
                                    <p className="text-xs text-slate-400">Loading your spreadsheets...</p>
                                </div>
                            ) : availableSheets.length > 0 ? (
                                <div className="space-y-2 max-h-[250px] overflow-y-auto pr-1">
                                    {availableSheets.map(file => (
                                        <button
                                            key={file.id}
                                            onClick={() => handleSelectSheet(file.id)}
                                            className="w-full flex items-center gap-3 p-3 bg-white border border-slate-200 rounded-lg hover:border-brand-300 hover:bg-brand-50/20 transition-all text-left group"
                                        >
                                            <div className="p-2 bg-green-100 text-green-700 rounded-lg">
                                                <FileSpreadsheet className="w-5 h-5" />
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <p className="font-medium text-slate-800 truncate text-sm">{file.name}</p>
                                                <p className="text-[10px] text-slate-400">Edited: {new Date(file.modifiedTime).toLocaleDateString()}</p>
                                            </div>
                                            <div className="w-2 h-2 rounded-full bg-brand-400 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                        </button>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-6 bg-slate-50 rounded-lg border border-dashed border-slate-200">
                                    <p className="text-sm text-slate-500">No spreadsheets found.</p>
                                    <p className="text-xs text-slate-400 mt-1">Ensure "Drive API" is enabled in Cloud Console.</p>
                                </div>
                            )}
                        </div>
                    )}

                </div>
            </div>
        </div>
    )}
    </>
  );
};

export default App;