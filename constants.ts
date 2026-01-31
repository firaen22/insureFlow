import { Client, PolicyData, Product, Language } from './types';

// Product Library System
export const PRODUCT_LIBRARY: Product[] = [
  { 
    name: 'CEO Medical Plan', 
    provider: 'AIA', 
    type: 'Medical', 
    defaultTags: ['AIA', 'Medical', 'High-End', 'Global Cover'] 
  },
  { 
    name: 'Crisis Cover Prudential', 
    provider: 'Prudential', 
    type: 'Critical Illness', 
    defaultTags: ['Prudential', 'Critical Illness', 'Lump Sum'] 
  },
  { 
    name: 'SunLife Wealth Builder', 
    provider: 'Sunlife', 
    type: 'Savings', 
    defaultTags: ['Sunlife', 'Savings', 'Dividend'] 
  },
  { 
    name: 'Home Protect Plus', 
    provider: 'AIG', 
    type: 'Property', 
    defaultTags: ['AIG', 'Home', 'Fire'] 
  }
];

export const TRANSLATIONS = {
  en: {
    nav: {
      brand: 'InsureFlow',
      dashboard: 'Dashboard',
      upload: 'Policy Upload',
      clients: 'Clients',
      products: 'Product Library',
      reminders: 'Reminders',
      settings: 'Settings'
    },
    header: {
      driveConnected: 'Drive Connected'
    },
    dashboard: {
      title: 'Dashboard Overview',
      subtitle: 'Last updated: Just now',
      totalClients: 'Total Clients',
      activePolicies: 'Active Policies',
      premiumRevenue: 'Premium Revenue',
      monthly: 'Monthly',
      reminders: 'Reminders',
      attentionNeeded: 'Attention Needed',
      policyDist: 'Policy Distribution',
      recentUpdates: 'Recent Policy Updates',
      upcomingReminders: 'Upcoming Reminders',
      premiumsDue: 'Premiums Due',
      birthdays: 'Birthdays',
      noPremiums: 'No premiums due soon.',
      noBirthdays: 'No upcoming birthdays.',
      sendWish: 'Send Wish',
      viewCalendar: 'View Calendar',
      table: {
        policyNo: 'Policy No.',
        holder: 'Holder',
        type: 'Type',
        anniversary: 'Anniversary',
        mode: 'Mode',
        status: 'Status'
      }
    },
    upload: {
      title: 'New Policy Processing',
      subtitle: 'Upload PDF documents to automatically extract policy details using AI.',
      dragDropTitle: 'Drag & Drop Policy PDF',
      dragDropDesc: 'Supported formats: PDF, JPG, PNG. Max file size: 10MB.',
      selectFile: 'Select File',
      uploading: 'Uploading...',
      analyzing: 'AI Analyzing...',
      detecting: 'Detecting languages (Chinese/English)...',
      identifying: 'Identifying Plan Name & Riders...',
      matching: 'Matching with Product Library...',
      complete: 'Analysis Complete',
      uploadAnother: 'Upload Another',
      privacy: 'Client Privacy Protected',
      privacyDesc: 'Local encryption enabled before cloud sync.',
      previewTitle: 'Extracted Data Preview',
      confidence: 'Confidence',
      manualEdit: 'Manual Edit',
      saveCRM: 'Save to CRM',
      saveRecord: 'Save & Record Product',
      done: 'Done',
      edit: 'Edit',
      manualEntry: 'Enter Details Manually',
      or: 'OR',
      manualMode: 'Manual Entry Mode',
      enterDetails: 'Enter policy details in the form.',
      fields: {
        planName: 'Main Plan (Base)',
        policyHolder: 'Policy Holder',
        clientBirthday: 'Client Birthday',
        policyNumber: 'Policy Number',
        type: 'Type',
        premium: 'Base Premium ($)',
        totalPremium: 'Total Premium',
        anniversary: 'Anniversary (DD/MM)',
        paymentMode: 'Payment Mode',
        riders: 'Riders / Supplementary Benefits',
        addRider: 'Add Rider',
        riderName: 'Rider Name',
        riderPrem: 'Prem ($)',
        expiresSoon: 'Due Soon',
        newProduct: 'New Product',
        newProductDesc: 'This plan is not in the library. Saving this policy will record it for future auto-tagging.',
        noTags: 'No library tags found.',
        emptyState: 'Upload a document to see extracted details here.'
      }
    },
    clients: {
      title: 'Client Management',
      subtitle: 'Manage client records, tags, and contact details.',
      addClient: 'Add New Client',
      searchPlaceholder: 'Search by name, email, phone, or tags...',
      filterTags: 'Filter by System Tags:',
      all: 'All',
      addTag: 'Add Tag',
      table: {
        name: 'Client Name',
        tags: 'Tags',
        birthday: 'Birthday',
        policies: 'Policies',
        status: 'Status',
        actions: 'Actions',
        noTags: 'No tags',
        notFound: 'No clients found matching your search.'
      }
    },
    clientDetails: {
      backToClients: 'Back to Clients',
      contactInfo: 'Contact Information',
      policiesHeld: 'Policies Held',
      totalAnnualPremium: 'Total Annual Premium',
      totalPolicies: 'Total Policies',
      noPolicies: 'No policies found for this client.',
      email: 'Email',
      phone: 'Phone',
      birthday: 'Birthday',
      lastContact: 'Last Contact',
      editPolicy: 'Edit Policy',
      deletePolicy: 'Delete Policy',
      deleteConfirm: 'Are you sure you want to delete this policy?',
      saveChanges: 'Save Changes',
      cancel: 'Cancel',
      policyCard: {
          basePlan: 'Base Plan',
          policyNo: 'Policy No.',
          status: 'Status',
          anniversary: 'Anniversary',
          paymentMode: 'Payment Mode',
          premium: 'Premium',
          riders: 'Riders & Supplementary',
          type: 'Type',
          // Specifics
          roomType: 'Room Type',
          excess: 'Medical Excess',
          sumInsured: 'Sum Insured',
          multipay: 'Multipay Feature',
          endDate: 'Policy End Date',
          capital: 'Capital Invested',
          accidentLimit: 'Accident Medical Limit',
          sectionLimit: 'Section Limit',
          physio: 'Physio Visits/Year'
      }
    },
    products: {
      title: 'Product Library',
      subtitle: 'Centralized repository of insurance plans and extraction rules.',
      addProduct: 'Add Product',
      editProduct: 'Edit Product',
      save: 'Save Changes',
      cancel: 'Cancel',
      searchPlaceholder: 'Search products...',
      table: {
        name: 'Product Name',
        provider: 'Provider',
        type: 'Category',
        tags: 'Auto-Tags',
        actions: 'Actions',
        noProducts: 'No products found.'
      },
      form: {
          name: 'Product Name',
          provider: 'Provider',
          type: 'Category',
          tags: 'Tags',
          addTag: 'Add Tag'
      }
    },
    reminders: {
      title: 'Renewal & Reviews',
      subtitle: 'Monitor policies approaching their anniversary date for client reviews and document refreshes.',
      daysRemaining: 'Days Remaining',
      policyDetails: 'Policy Details',
      anniversary: 'Anniversary',
      status: 'Status',
      actions: 'Actions',
      uploadRenewal: 'Upload Renewal',
      contact: 'Contact',
      noReminders: 'No upcoming policy reviews in the next 60 days.',
      urgent: 'Urgent',
      upcoming: 'Upcoming',
      filterAll: 'All Upcoming',
      filterUrgent: 'Urgent (<30 Days)'
    }
  },
  zh: {
    nav: {
      brand: 'InsureFlow 保險通',
      dashboard: '儀表板',
      upload: '保單上傳',
      clients: '客戶管理',
      products: '產品資料庫',
      reminders: '提醒事項',
      settings: '設定'
    },
    header: {
      driveConnected: '雲端已連線'
    },
    dashboard: {
      title: '儀表板總覽',
      subtitle: '最後更新：剛剛',
      totalClients: '客戶總數',
      activePolicies: '有效保單',
      premiumRevenue: '保費收入',
      monthly: '每月',
      reminders: '提醒事項',
      attentionNeeded: '需要關注',
      policyDist: '保單分佈',
      recentUpdates: '近期保單更新',
      upcomingReminders: '即將到期提醒',
      premiumsDue: '保費到期',
      birthdays: '生日提醒',
      noPremiums: '近期無到期保費。',
      noBirthdays: '近期無客戶生日。',
      sendWish: '發送祝福',
      viewCalendar: '查看行事曆',
      table: {
        policyNo: '保單號碼',
        holder: '持有人',
        type: '類型',
        anniversary: '週年日',
        mode: '繳費模式',
        status: '狀態'
      }
    },
    upload: {
      title: '新保單處理',
      subtitle: '上傳 PDF 文件，利用 AI 自動提取保單詳情。',
      dragDropTitle: '拖放保單 PDF',
      dragDropDesc: '支援格式：PDF, JPG, PNG。最大檔案：10MB。',
      selectFile: '選擇檔案',
      uploading: '上傳中...',
      analyzing: 'AI 分析中...',
      detecting: '偵測語言 (中文/英文)...',
      identifying: '識別計劃名稱及附約...',
      matching: '正在比對產品庫...',
      complete: '分析完成',
      uploadAnother: '上傳另一個',
      privacy: '客戶隱私受保護',
      privacyDesc: '雲端同步前已啟用本地加密。',
      previewTitle: '提取資料預覽',
      confidence: '信心指數',
      manualEdit: '手動編輯',
      saveCRM: '儲存至 CRM',
      saveRecord: '儲存並記錄產品',
      done: '完成',
      edit: '編輯',
      manualEntry: '手動輸入詳情',
      or: '或',
      manualMode: '手動輸入模式',
      enterDetails: '請在表格中輸入保單詳情。',
      fields: {
        planName: '主計劃 (基本)',
        policyHolder: '保單持有人',
        clientBirthday: '客戶生日',
        policyNumber: '保單號碼',
        type: '類型',
        premium: '基本保費 ($)',
        totalPremium: '總保費',
        anniversary: '保單週年日 (日/月)',
        paymentMode: '繳費模式',
        riders: '附約 / 附加利益',
        addRider: '新增附約',
        riderName: '附約名稱',
        riderPrem: '保費 ($)',
        expiresSoon: '即將到期',
        newProduct: '新產品',
        newProductDesc: '此計劃不在產品庫中。儲存此保單將記錄以供未來自動標記。',
        noTags: '未找到產品庫標籤。',
        emptyState: '上傳文件以在此處查看提取詳情。'
      }
    },
    clients: {
      title: '客戶管理',
      subtitle: '管理客戶記錄、標籤和聯絡詳情。',
      addClient: '新增客戶',
      searchPlaceholder: '搜尋姓名、電郵、電話或標籤...',
      filterTags: '依系統標籤篩選：',
      all: '全部',
      addTag: '新增標籤',
      table: {
        name: '客戶名稱',
        tags: '標籤',
        birthday: '生日',
        policies: '保單數量',
        status: '狀態',
        actions: '操作',
        noTags: '無標籤',
        notFound: '未找到符合搜尋條件的客戶。'
      }
    },
    clientDetails: {
      backToClients: '返回客戶列表',
      contactInfo: '聯絡資訊',
      policiesHeld: '持有保單',
      totalAnnualPremium: '年度總保費',
      totalPolicies: '保單總數',
      noPolicies: '此客戶尚無保單。',
      email: '電子郵件',
      phone: '電話',
      birthday: '生日',
      lastContact: '最後聯絡',
      editPolicy: '編輯保單',
      deletePolicy: '刪除保單',
      deleteConfirm: '您確定要刪除此保單嗎？',
      saveChanges: '儲存變更',
      cancel: '取消',
      policyCard: {
          basePlan: '基本計劃',
          policyNo: '保單號碼',
          status: '狀態',
          anniversary: '週年日',
          paymentMode: '繳費模式',
          premium: '保費',
          riders: '附約及附加利益',
          type: '類型',
          // Specifics
          roomType: '病房級別',
          excess: '醫療自負額',
          sumInsured: '保額',
          multipay: '多重保障',
          endDate: '保單終止日',
          capital: '投資本金',
          accidentLimit: '意外醫療限額',
          sectionLimit: '分項限額',
          physio: '物理治療次數/年'
      }
    },
    products: {
      title: '產品資料庫',
      subtitle: '集中管理保險計劃及提取規則。',
      addProduct: '新增產品',
      editProduct: '編輯產品',
      save: '儲存變更',
      cancel: '取消',
      searchPlaceholder: '搜尋產品...',
      table: {
        name: '產品名稱',
        provider: '供應商',
        type: '類別',
        tags: '自動標籤',
        actions: '操作',
        noProducts: '未找到產品。'
      },
      form: {
          name: '產品名稱',
          provider: '供應商',
          type: '類別',
          tags: '標籤',
          addTag: '新增標籤'
      }
    },
    reminders: {
      title: '續保與審查',
      subtitle: '監控即將到週年日的保單，以進行客戶審查或更新文件。',
      daysRemaining: '剩餘天數',
      policyDetails: '保單詳情',
      anniversary: '週年日',
      status: '狀態',
      actions: '操作',
      uploadRenewal: '上傳續保文件',
      contact: '聯絡',
      noReminders: '未來60天內無即將到期的保單審查。',
      urgent: '緊急',
      upcoming: '即將到來',
      filterAll: '全部',
      filterUrgent: '緊急 (<30 天)'
    }
  }
};

// Assuming current demo date is roughly Oct 1st, 2023 for context

export const MOCK_CLIENTS: Client[] = [
  { 
    id: 'c1', 
    name: 'Alice Johnson', 
    email: 'alice.j@example.com', 
    phone: '+1 (555) 123-4567', 
    birthday: '1985-10-05', 
    totalPolicies: 2, 
    lastContact: '2023-10-15', 
    status: 'Active',
    tags: ['AIA', 'Life', 'Medical'] 
  },
  { 
    id: 'c2', 
    name: 'Michael Chen', 
    email: 'm.chen@techcorp.com', 
    phone: '+1 (555) 987-6543', 
    birthday: '1990-10-12', 
    totalPolicies: 1, 
    lastContact: '2023-10-12', 
    status: 'Lead',
    tags: ['Prudential', 'Accident'] 
  },
  { 
    id: 'c3', 
    name: 'Sarah Connor', 
    email: 's.connor@sky.net', 
    phone: '+1 (555) 456-7890', 
    birthday: '1978-11-20', 
    totalPolicies: 3, 
    lastContact: '2023-09-28', 
    status: 'Active',
    tags: ['Sunlife', 'Home', 'Critical Illness', 'VIP'] 
  },
  { 
    id: 'c4', 
    name: 'James Wright', 
    email: 'j.wright@law.com', 
    phone: '+1 (555) 234-5678', 
    birthday: '1982-05-15', 
    totalPolicies: 1, 
    lastContact: '2023-10-18', 
    status: 'Active',
    tags: ['AIA', 'Maid'] 
  },
];

export const RECENT_POLICIES: PolicyData[] = [
  { 
    id: 'p1', 
    policyNumber: 'POL-88329', 
    planName: 'CEO Medical Plan', 
    holderName: 'Alice Johnson', 
    type: 'Medical', // Updated to Medical
    policyAnniversaryDate: '25/10', 
    paymentMode: 'Yearly', 
    premiumAmount: 1200, 
    status: 'Active',
    medicalPlanType: 'Private', // High end
    medicalExcess: 5000,
    riders: [
      { name: 'Dental Care Plus', type: 'Medical', premiumAmount: 200 }
    ]
  },
  { 
    id: 'p2', 
    policyNumber: 'POL-99120', 
    planName: 'Accident Safe 360', // Renamed for Context
    holderName: 'Sarah Connor', 
    type: 'Accident', // Changed to Accident
    policyAnniversaryDate: '15/05', 
    paymentMode: 'Half-Yearly', 
    premiumAmount: 850, 
    status: 'Active',
    sumInsured: 1000000, // Death/Critical
    accidentMedicalLimit: 50000,
    accidentPhysioVisits: 15
  },
  { 
    id: 'p3', 
    policyNumber: 'POL-77212', 
    planName: 'Home Protect Plus', 
    holderName: 'James Wright', 
    type: 'Property', 
    policyAnniversaryDate: '01/11', 
    paymentMode: 'Yearly', 
    premiumAmount: 2400, 
    status: 'Pending',
    riders: [
        { name: 'Flood Protection', type: 'Property', premiumAmount: 150 },
        { name: 'Theft Cover', type: 'Property', premiumAmount: 100 }
    ]
  },
  // Added new Mock Policy for CI
  {
      id: 'p4',
      policyNumber: 'POL-CI-2022',
      planName: 'Crisis Cover Multi',
      holderName: 'Alice Johnson',
      type: 'Critical Illness',
      policyAnniversaryDate: '01/02',
      paymentMode: 'Monthly',
      premiumAmount: 300,
      status: 'Active',
      sumInsured: 500000,
      isMultipay: true
  }
];

export const CHART_DATA = [
  { name: 'Life', value: 400 },
  { name: 'Medical', value: 300 },
  { name: 'Auto', value: 300 },
  { name: 'Property', value: 200 },
];