import React, { useState, useCallback, useRef } from 'react';
import { Upload, FileText, CheckCircle, Loader2, AlertCircle, X, ShieldCheck, Pencil, Save, Tag, Sparkles, BookOpen, Cake, Plus, Calendar, Layers, Trash2, Activity, Keyboard } from 'lucide-react';
import { UploadStatus, PolicyData, Product, Rider } from '../types';
import { TRANSLATIONS } from '../constants';

interface UploadViewProps {
  t: typeof TRANSLATIONS['en']['upload'];
  products: Product[];
  onSave: (data: PolicyData, isNewProduct: boolean) => void;
}

export const UploadView: React.FC<UploadViewProps> = ({ t, products, onSave }) => {
  const [status, setStatus] = useState<UploadStatus>(UploadStatus.IDLE);
  const [file, setFile] = useState<File | null>(null);
  const [extractedData, setExtractedData] = useState<PolicyData | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isNewProduct, setIsNewProduct] = useState(false);
  const [newTagInput, setNewTagInput] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Manual Entry Handler
  const startManualEntry = () => {
    setStatus(UploadStatus.COMPLETE);
    setIsEditing(true);
    setFile(null);
    setIsNewProduct(false); // User will define
    setExtractedData({
        id: `manual-${Date.now()}`,
        policyNumber: '',
        planName: '',
        holderName: '',
        clientBirthday: '',
        type: 'Life',
        policyAnniversaryDate: '',
        paymentMode: 'Yearly',
        premiumAmount: 0,
        status: 'Active',
        extractedTags: [],
        riders: [],
        sumInsured: 0
    });
  };

  // Mock Extraction Logic
  const simulateExtraction = (uploadedFile: File) => {
    setStatus(UploadStatus.ANALYZING);
    setIsEditing(false);
    setIsNewProduct(false);
    setNewTagInput('');
    
    // Enhanced Mock Logic: Check for Chinese characters in filename
    const isChineseContext = /[\u4e00-\u9fa5]/.test(uploadedFile.name);
    
    // Simulate API delay
    setTimeout(() => {
      // 1. Determine Plan Name based on context
      const mockPlanName = isChineseContext ? 'CEO Medical Plan' : 'Future Protect Plus';
      
      // 2. Check Product Library
      const libraryMatch = products.find(p => p.name === mockPlanName);
      
      let derivedTags: string[] = [];
      let type = isChineseContext ? 'Medical' : 'Life'; // Default fallbacks
      
      if (libraryMatch) {
        derivedTags = libraryMatch.defaultTags;
        type = libraryMatch.type;
      } else {
        setIsNewProduct(true);
      }

      // Generate a mock birthday
      const mockBirthday = isChineseContext ? '1980-05-20' : '1992-11-15';
      
      // Simulate Riders Detection
      const mockRiders: Rider[] = isChineseContext 
        ? [{ name: 'Dental Supplementary', type: 'Medical', premiumAmount: 1500 }]
        : [{ name: 'Accident Waiver', type: 'Accident', premiumAmount: 150 }, { name: 'Term Rider', type: 'Life', premiumAmount: 200 }];

      // New: Simulate specifics based on type
      let specificFields: Partial<PolicyData> = {};
      if (type === 'Medical') {
          specificFields = {
              medicalPlanType: 'Semi-Private',
              medicalExcess: 2000
          };
      } else if (type === 'Life') {
          specificFields = {
              sumInsured: 1000000,
              policyEndDate: '2045-08-14'
          };
      }

      const mockResult: PolicyData = {
        id: `new-${Date.now()}`,
        policyNumber: isChineseContext ? 'AIA-HK-899201' : 'POL-NEW-8821',
        planName: mockPlanName,
        holderName: isChineseContext ? '陳大文' : 'Robert Fox',
        clientBirthday: mockBirthday,
        type: type as any,
        policyAnniversaryDate: isChineseContext ? '20/05' : '14/08',
        paymentMode: isChineseContext ? 'Yearly' : 'Monthly',
        premiumAmount: isChineseContext ? 12000 : 2500.00,
        status: 'Active',
        extractedTags: derivedTags,
        riders: mockRiders,
        ...specificFields
      };

      setExtractedData(mockResult);
      setStatus(UploadStatus.COMPLETE);
    }, 2500);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      setStatus(UploadStatus.UPLOADING);
      setTimeout(() => simulateExtraction(selectedFile), 1000);
    }
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      setFile(droppedFile);
      setStatus(UploadStatus.UPLOADING);
      setTimeout(() => simulateExtraction(droppedFile), 1000);
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const resetUpload = () => {
    setFile(null);
    setExtractedData(null);
    setStatus(UploadStatus.IDLE);
    setIsEditing(false);
    setIsNewProduct(false);
    setNewTagInput('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleUpdateField = (field: keyof PolicyData, value: any) => {
    if (extractedData) {
      setExtractedData({ ...extractedData, [field]: value });
    }
  };

  const handleUpdateRider = (index: number, field: keyof Rider, value: any) => {
    if (extractedData && extractedData.riders) {
        const updatedRiders = [...extractedData.riders];
        updatedRiders[index] = { ...updatedRiders[index], [field]: value };
        setExtractedData({ ...extractedData, riders: updatedRiders });
    }
  };

  const handleRemoveRider = (index: number) => {
     if (extractedData && extractedData.riders) {
        const updatedRiders = extractedData.riders.filter((_, i) => i !== index);
        setExtractedData({ ...extractedData, riders: updatedRiders });
     }
  };

  const handleAddRider = () => {
      if (extractedData) {
          const newRider: Rider = { name: '', type: 'Medical', premiumAmount: 0 };
          setExtractedData({ ...extractedData, riders: [...(extractedData.riders || []), newRider] });
      }
  };
  
  const handleAddTag = () => {
      if (extractedData && newTagInput.trim()) {
          const updatedTags = [...(extractedData.extractedTags || []), newTagInput.trim()];
          setExtractedData({ ...extractedData, extractedTags: updatedTags });
          setNewTagInput('');
      }
  }

  const handleSave = () => {
    if (extractedData) {
      onSave(extractedData, isNewProduct);
      
      if (isNewProduct) {
          alert(`System: "${extractedData.planName}" has been added to the Product Library.`);
      } else {
          alert("Policy saved to CRM.");
      }
      resetUpload();
    }
  };

  const totalPremium = extractedData ? 
    (extractedData.premiumAmount + (extractedData.riders?.reduce((sum, r) => sum + r.premiumAmount, 0) || 0)) 
    : 0;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">{t.title}</h1>
        <p className="text-slate-500 mt-2">{t.subtitle}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Upload Area */}
        <div className="space-y-4">
          <div 
            className={`border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 flex flex-col items-center justify-center min-h-[300px] ${
              status === UploadStatus.IDLE ? 'border-slate-300 bg-slate-50 hover:border-brand-400 hover:bg-brand-50/30' : 
              status === UploadStatus.COMPLETE ? 'border-green-300 bg-green-50/30' :
              'border-brand-300 bg-brand-50/20'
            }`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
          >
            {status === UploadStatus.IDLE && (
              <>
                <div className="w-16 h-16 bg-white rounded-full shadow-sm flex items-center justify-center mb-4">
                  <Upload className="w-8 h-8 text-brand-500" />
                </div>
                <h3 className="text-lg font-semibold text-slate-700 mb-2">{t.dragDropTitle}</h3>
                <p className="text-slate-500 text-sm mb-6 max-w-xs">{t.dragDropDesc}</p>
                <input 
                  type="file" 
                  ref={fileInputRef}
                  onChange={handleFileChange} 
                  className="hidden" 
                  accept=".pdf,.jpg,.png" 
                />
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="px-6 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-medium rounded-lg shadow-sm transition-colors"
                >
                  {t.selectFile}
                </button>

                <div className="flex items-center gap-3 my-4 w-full max-w-xs">
                    <div className="h-px bg-slate-200 flex-1"></div>
                    <span className="text-xs text-slate-400 font-medium uppercase">{t.or}</span>
                    <div className="h-px bg-slate-200 flex-1"></div>
                </div>

                <button 
                    onClick={startManualEntry}
                    className="flex items-center justify-center gap-2 px-6 py-2.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-medium rounded-lg shadow-sm transition-colors w-full max-w-xs"
                >
                    <Keyboard className="w-4 h-4" />
                    <span>{t.manualEntry}</span>
                </button>
              </>
            )}

            {(status === UploadStatus.UPLOADING || status === UploadStatus.ANALYZING) && (
              <div className="animate-pulse flex flex-col items-center">
                 <div className="w-16 h-16 bg-white rounded-full shadow-sm flex items-center justify-center mb-4 relative">
                  <Loader2 className="w-8 h-8 text-brand-600 animate-spin" />
                </div>
                <h3 className="text-lg font-semibold text-slate-700 mb-1">
                  {status === UploadStatus.UPLOADING ? t.uploading : t.analyzing}
                </h3>
                <p className="text-slate-500 text-sm">{file?.name}</p>
                {status === UploadStatus.ANALYZING && (
                  <div className="flex flex-col items-center mt-2 space-y-1">
                    <p className="text-brand-500 text-xs font-medium">{t.identifying}</p>
                    <p className="text-brand-500 text-xs font-medium">{t.matching}</p>
                  </div>
                )}
              </div>
            )}

            {status === UploadStatus.COMPLETE && (
              <div className="flex flex-col items-center">
                <div className={`w-16 h-16 rounded-full shadow-sm flex items-center justify-center mb-4 ${file ? 'bg-white' : 'bg-slate-100'}`}>
                  {file ? <CheckCircle className="w-8 h-8 text-green-500" /> : <Keyboard className="w-8 h-8 text-slate-500" />}
                </div>
                <h3 className="text-lg font-semibold text-slate-700 mb-2">
                   {file ? t.complete : t.manualMode}
                </h3>
                <p className="text-slate-500 text-sm mb-6">
                    {file ? file.name : t.enterDetails}
                </p>
                <button 
                  onClick={resetUpload}
                  className="px-4 py-2 text-sm text-slate-600 hover:text-slate-900 font-medium underline"
                >
                  {t.uploadAnother}
                </button>
              </div>
            )}
          </div>
          
          {/* Security Badge */}
          <div className="flex items-center space-x-3 p-4 bg-slate-50 rounded-lg border border-slate-200">
            <ShieldCheck className="w-5 h-5 text-slate-400" />
            <div className="text-xs text-slate-500">
              <span className="font-semibold block text-slate-700">{t.privacy}</span>
              {t.privacyDesc}
            </div>
          </div>
        </div>

        {/* Preview Pane */}
        <div className="relative">
          <div className={`bg-white rounded-xl border border-slate-200 shadow-lg h-full transition-opacity duration-500 flex flex-col ${status === UploadStatus.COMPLETE ? 'opacity-100' : 'opacity-50 blur-[1px]'}`}>
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <h3 className="font-bold text-slate-800 flex items-center gap-2">
                <FileText className="w-4 h-4 text-brand-500" />
                {t.previewTitle}
              </h3>
              {status === UploadStatus.COMPLETE && (
                <span className="bg-brand-50 text-brand-700 text-xs px-2 py-1 rounded font-medium border border-brand-100">
                  {t.confidence}: {isEditing ? t.manualEdit : '98%'}
                </span>
              )}
            </div>
            
            <div className="p-6 space-y-6 flex-1 overflow-y-auto">
              {status === UploadStatus.COMPLETE && extractedData ? (
                <>
                  {/* Plan Name & Library Status */}
                  <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 relative overflow-hidden">
                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">{t.fields.planName}</label>
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        {isEditing ? (
                          <>
                            <input 
                                list="plan-options"
                                type="text" 
                                value={extractedData.planName} 
                                onChange={(e) => handleUpdateField('planName', e.target.value)}
                                className="w-full p-2 bg-white border border-brand-400 rounded-md text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-brand-500 shadow-sm"
                            />
                            <datalist id="plan-options">
                                {products.map(p => (
                                    <option key={p.name} value={p.name}>{p.provider} - {p.type}</option>
                                ))}
                            </datalist>
                          </>
                        ) : (
                          <div className="font-bold text-lg text-slate-800">{extractedData.planName}</div>
                        )}
                        
                        {/* Auto-Tags Display */}
                        <div className="flex flex-wrap gap-2 mt-2 items-center">
                           {extractedData.extractedTags && extractedData.extractedTags.length > 0 ? (
                              extractedData.extractedTags.map(tag => (
                                <span key={tag} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-brand-100 text-brand-700 border border-brand-200">
                                  <Sparkles className="w-3 h-3 mr-1" />
                                  {tag}
                                </span>
                              ))
                           ) : (
                             <span className="text-xs text-slate-500 italic">{t.fields.noTags}</span>
                           )}
                           
                           {isEditing && (
                             <div className="flex items-center ml-2">
                                <input 
                                    type="text" 
                                    value={newTagInput}
                                    onChange={(e) => setNewTagInput(e.target.value)}
                                    placeholder="Add tag"
                                    className="w-20 text-xs border border-slate-300 rounded px-1 py-0.5 mr-1"
                                    onKeyDown={(e) => e.key === 'Enter' && handleAddTag()}
                                />
                                <button onClick={handleAddTag} className="text-brand-600 hover:text-brand-700">
                                    <Plus className="w-4 h-4" />
                                </button>
                             </div>
                           )}

                           {isNewProduct && (
                             <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-700 border border-amber-200 ml-2">
                               <BookOpen className="w-3 h-3 mr-1" />
                               {t.fields.newProduct}
                             </span>
                           )}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{t.fields.policyHolder}</label>
                      {isEditing ? (
                        <input 
                          type="text" 
                          value={extractedData.holderName} 
                          onChange={(e) => handleUpdateField('holderName', e.target.value)}
                          className="w-full p-2 bg-white border border-brand-400 rounded-md text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-brand-500 shadow-sm"
                        />
                      ) : (
                        <div className="p-2.5 bg-white border border-slate-200 rounded-md text-slate-900 font-medium">
                          {extractedData.holderName}
                        </div>
                      )}
                    </div>
                    
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{t.fields.clientBirthday}</label>
                      {isEditing ? (
                        <input 
                          type="date" 
                          value={extractedData.clientBirthday} 
                          onChange={(e) => handleUpdateField('clientBirthday', e.target.value)}
                          className="w-full p-2 bg-white border border-brand-400 rounded-md text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-brand-500 shadow-sm"
                        />
                      ) : (
                        <div className="p-2.5 bg-white border border-slate-200 rounded-md text-slate-900 font-medium flex items-center gap-2">
                           <Cake className="w-4 h-4 text-brand-400" />
                           {extractedData.clientBirthday || 'N/A'}
                        </div>
                      )}
                    </div>
                  </div>

                   <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{t.fields.anniversary}</label>
                        <div className="flex justify-between items-center gap-2">
                          {isEditing ? (
                            <input 
                              type="text" 
                              value={extractedData.policyAnniversaryDate} 
                              onChange={(e) => handleUpdateField('policyAnniversaryDate', e.target.value)}
                              placeholder="DD/MM"
                              className="flex-1 p-2 bg-white border border-brand-400 rounded-md text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-brand-500 shadow-sm"
                            />
                          ) : (
                            <div className="flex-1 p-2.5 bg-white border border-slate-200 rounded-md text-slate-900 font-medium flex items-center gap-2">
                               <Calendar className="w-4 h-4 text-brand-400" />
                               {extractedData.policyAnniversaryDate}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{t.fields.paymentMode}</label>
                        {isEditing ? (
                            <select 
                            value={extractedData.paymentMode}
                            onChange={(e) => handleUpdateField('paymentMode', e.target.value)}
                            className="w-full p-2 bg-white border border-brand-400 rounded-md text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-brand-500 shadow-sm"
                            >
                            <option value="Yearly">Yearly</option>
                            <option value="Half-Yearly">Half-Yearly</option>
                            <option value="Quarterly">Quarterly</option>
                            <option value="Monthly">Monthly</option>
                            </select>
                        ) : (
                            <div className="p-2.5 bg-white border border-slate-200 rounded-md text-slate-900 font-medium">
                            {extractedData.paymentMode}
                            </div>
                        )}
                       </div>
                    </div>
                    
                    {/* New Plan Specific Fields Section */}
                    {isEditing && (
                        <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                             <h4 className="text-xs font-bold text-slate-500 uppercase mb-3 flex items-center gap-1">
                                <Activity className="w-3 h-3" />
                                Plan Specifics
                             </h4>
                             <div className="grid grid-cols-2 gap-3">
                                <div className="col-span-2">
                                    <label className="block text-xs font-medium text-slate-600 mb-1">Type</label>
                                    <select 
                                        value={extractedData.type}
                                        onChange={e => handleUpdateField('type', e.target.value)}
                                        className="w-full px-2 py-1.5 text-sm border border-slate-300 rounded"
                                    >
                                        <option value="Life">Life</option>
                                        <option value="Medical">Medical</option>
                                        <option value="Auto">Auto</option>
                                        <option value="Property">Property</option>
                                        <option value="Critical Illness">Critical Illness</option>
                                        <option value="Savings">Savings</option>
                                        <option value="Accident">Accident</option>
                                    </select>
                                </div>

                                {extractedData.type === 'Medical' && (
                                    <>
                                        <div>
                                            <label className="block text-xs font-medium text-slate-600 mb-1">Room</label>
                                            <select 
                                                value={extractedData.medicalPlanType || 'Ward'}
                                                onChange={e => handleUpdateField('medicalPlanType', e.target.value)}
                                                className="w-full px-2 py-1.5 text-sm border border-slate-300 rounded"
                                            >
                                                <option value="Ward">Ward</option>
                                                <option value="Semi-Private">Semi-Private</option>
                                                <option value="Private">Private</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-slate-600 mb-1">Excess ($)</label>
                                            <input 
                                                type="number"
                                                value={extractedData.medicalExcess || ''}
                                                onChange={e => handleUpdateField('medicalExcess', Number(e.target.value))}
                                                className="w-full px-2 py-1.5 text-sm border border-slate-300 rounded"
                                            />
                                        </div>
                                    </>
                                )}

                                {['Life', 'Critical Illness', 'Accident'].includes(extractedData.type) && (
                                    <div>
                                        <label className="block text-xs font-medium text-slate-600 mb-1">Sum Insured ($)</label>
                                        <input 
                                            type="number"
                                            value={extractedData.sumInsured || ''}
                                            onChange={e => handleUpdateField('sumInsured', Number(e.target.value))}
                                            className="w-full px-2 py-1.5 text-sm border border-slate-300 rounded"
                                        />
                                    </div>
                                )}
                                
                                {extractedData.type === 'Critical Illness' && (
                                    <div className="flex items-center gap-2 mt-4">
                                        <input 
                                            type="checkbox"
                                            id="up-multipay"
                                            checked={!!extractedData.isMultipay}
                                            onChange={e => handleUpdateField('isMultipay', e.target.checked)}
                                        />
                                        <label htmlFor="up-multipay" className="text-xs font-medium text-slate-700">Multipay</label>
                                    </div>
                                )}

                                {extractedData.type === 'Life' && (
                                    <div>
                                        <label className="block text-xs font-medium text-slate-600 mb-1">End Date</label>
                                        <input 
                                            type="date"
                                            value={extractedData.policyEndDate || ''}
                                            onChange={e => handleUpdateField('policyEndDate', e.target.value)}
                                            className="w-full px-2 py-1.5 text-sm border border-slate-300 rounded"
                                        />
                                    </div>
                                )}
                             </div>
                        </div>
                    )}

                    {/* Rider Section */}
                    <div className="mt-4 border-t border-slate-200 pt-4">
                        <div className="flex justify-between items-center mb-2">
                            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                                <Layers className="w-3 h-3" />
                                {t.fields.riders}
                            </label>
                            {isEditing && (
                                <button onClick={handleAddRider} className="text-xs text-brand-600 font-medium hover:underline flex items-center">
                                    <Plus className="w-3 h-3 mr-1" />
                                    {t.fields.addRider}
                                </button>
                            )}
                        </div>
                        
                        <div className="space-y-2 bg-slate-50 p-3 rounded-lg border border-slate-200">
                             {/* Base Plan Line Item */}
                            <div className="flex justify-between items-center pb-2 border-b border-slate-200 border-dashed">
                                <div className="text-sm font-medium text-slate-700">{t.fields.planName}</div>
                                {isEditing ? (
                                    <input 
                                    type="number" 
                                    value={extractedData.premiumAmount} 
                                    onChange={(e) => handleUpdateField('premiumAmount', parseFloat(e.target.value))}
                                    className="w-24 p-1 text-right bg-white border border-slate-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-brand-500"
                                    />
                                ) : (
                                    <div className="text-sm font-semibold text-slate-800">${extractedData.premiumAmount.toFixed(2)}</div>
                                )}
                            </div>

                            {/* Riders List */}
                            {extractedData.riders && extractedData.riders.map((rider, idx) => (
                                <div key={idx} className="flex justify-between items-center pl-2 border-l-2 border-brand-200 ml-1">
                                    <div className="flex-1 mr-2">
                                        {isEditing ? (
                                            <input 
                                            type="text" 
                                            value={rider.name} 
                                            placeholder={t.fields.riderName}
                                            onChange={(e) => handleUpdateRider(idx, 'name', e.target.value)}
                                            className="w-full p-1 bg-white border border-slate-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-brand-500"
                                            />
                                        ) : (
                                            <div className="text-xs text-slate-600">{rider.name}</div>
                                        )}
                                    </div>
                                    <div className="flex items-center">
                                        {isEditing ? (
                                            <>
                                            <input 
                                                type="number" 
                                                value={rider.premiumAmount} 
                                                placeholder="0"
                                                onChange={(e) => handleUpdateRider(idx, 'premiumAmount', parseFloat(e.target.value))}
                                                className="w-20 p-1 text-right bg-white border border-slate-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-brand-500"
                                            />
                                            <button onClick={() => handleRemoveRider(idx)} className="ml-2 text-red-400 hover:text-red-600">
                                                <Trash2 className="w-3 h-3" />
                                            </button>
                                            </>
                                        ) : (
                                            <div className="text-xs font-medium text-slate-600">${rider.premiumAmount.toFixed(2)}</div>
                                        )}
                                    </div>
                                </div>
                            ))}

                            {(!extractedData.riders || extractedData.riders.length === 0) && !isEditing && (
                                <div className="text-xs text-slate-400 italic pl-2">None detected</div>
                            )}
                            
                            {/* Total Line */}
                            <div className="flex justify-between items-center pt-2 mt-2 border-t border-slate-200">
                                <div className="text-sm font-bold text-slate-800">{t.fields.totalPremium}</div>
                                <div className="text-sm font-bold text-brand-700">${totalPremium.toFixed(2)}</div>
                            </div>
                        </div>
                    </div>
                </>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-slate-400 py-12">
                   <FileText className="w-12 h-12 mb-3 opacity-20" />
                   <p className="text-sm">{t.fields.emptyState}</p>
                </div>
              )}
            </div>

            {status === UploadStatus.COMPLETE && (
              <div className="p-6 border-t border-slate-100 bg-slate-50 rounded-b-xl flex space-x-3 mt-auto">
                 <button 
                    onClick={handleSave}
                    className="flex-1 bg-brand-600 hover:bg-brand-700 text-white py-2.5 rounded-lg font-medium shadow-sm transition-colors"
                 >
                    {isNewProduct ? t.saveRecord : t.saveCRM}
                 </button>
                 
                 {isEditing ? (
                   <button 
                      onClick={() => setIsEditing(false)}
                      className="px-4 py-2.5 bg-green-600 text-white border border-green-600 rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center gap-2"
                      title={t.saveCRM}
                    >
                      <Save className="w-4 h-4" />
                      <span>{t.done}</span>
                   </button>
                 ) : (
                   <button 
                      onClick={() => setIsEditing(true)}
                      className="px-4 py-2.5 bg-white border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors font-medium flex items-center gap-2"
                      title={t.edit}
                    >
                      <Pencil className="w-4 h-4" />
                      <span>{t.edit}</span>
                   </button>
                 )}
              </div>
            )}
          </div>
          
          {/* Overlay for non-complete status to block interaction */}
          {status !== UploadStatus.COMPLETE && (
            <div className="absolute inset-0 z-10"></div>
          )}
        </div>
      </div>
    </div>
  );
};