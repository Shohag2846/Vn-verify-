
import React, { createContext, useContext, useState, useEffect } from 'react';
import { AppConfig, Application, AuditLog, OfficialRecord, DocType, PaymentMethod, AppStatus, ServiceConfig } from '../types';
import { supabase } from '../lib/supabase';

const DEFAULT_CONFIG: AppConfig = {
  services: {
    [DocType.VISA]: {
      id: 'svc_visa', type: DocType.VISA, title: { en: 'Vietnam Visa', vi: 'Thị thực Việt Nam' },
      fees: { en: '1,500,000 VND', vi: '1.500.000 VNĐ' }, applyEnabled: true
    },
    [DocType.WORK_PERMIT]: {
      id: 'svc_wp', type: DocType.WORK_PERMIT, title: { en: 'Work Permit', vi: 'Giấy phép lao động' },
      fees: { en: '2,500,000 VND', vi: '2.500.000 VNĐ' }, applyEnabled: true
    },
    [DocType.TRC]: {
      id: 'svc_trc', type: DocType.TRC, title: { en: 'Residence Card (TRC)', vi: 'Thẻ tạm trú (TRC)' },
      fees: { en: '3,500,000 VND', vi: '3.500.000 VNĐ' }, applyEnabled: true
    }
  },
  paymentMethods: [
    { id: 'bank_vn', name: 'Vietcombank (National Treasury)', details: 'Account: 0011004455667 | Name: TREASURY DEPT', enabled: true },
    { id: 'binance', name: 'Binance (USDT/Crypto)', details: 'Wallet: 0x71C7656EC7ab88b098defB751B7401B5f6d8976F | Network: BEP20', enabled: true }
  ],
  theme: { primaryColor: '#da251d', textColor: '#1a1a1a', backgroundColor: '#ffffff' }
};

interface ConfigContextType {
  config: AppConfig;
  applications: Application[];
  records: OfficialRecord[];
  logs: AuditLog[];
  isLoading: boolean;
  updateConfig: (newConfig: AppConfig) => Promise<void>;
  updateServiceConfig: (type: DocType, svc: ServiceConfig) => Promise<void>;
  updatePaymentMethod: (id: string, updates: Partial<PaymentMethod>) => Promise<void>;
  addApplication: (app: Application) => Promise<void>;
  updateApplication: (id: string, updates: Partial<Application>) => Promise<void>;
  deleteApplication: (id: string) => Promise<void>;
  addRecord: (record: OfficialRecord) => Promise<void>;
  updateRecord: (id: string, updates: Partial<OfficialRecord>) => Promise<void>;
  deleteRecord: (id: string) => Promise<void>;
  addLog: (user: string, action: string, details: string) => Promise<void>;
}

const ConfigContext = createContext<ConfigContextType | undefined>(undefined);

export const ConfigProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [config, setConfig] = useState<AppConfig>(DEFAULT_CONFIG);
  const [applications, setApplications] = useState<Application[]>([]);
  const [records, setRecords] = useState<OfficialRecord[]>([]);
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Initial Data Fetch
  const refreshAllData = async () => {
    try {
      const { data: appData } = await supabase.from('applications').select('*').order('submissionDate', { ascending: false });
      const { data: recData } = await supabase.from('records').select('*').order('issueDate', { ascending: false });
      const { data: logData } = await supabase.from('logs').select('*').order('timestamp', { ascending: false });
      const { data: cfgData } = await supabase.from('settings').select('value').eq('key', 'site_config').single();

      if (appData) setApplications(appData);
      if (recData) setRecords(recData);
      if (logData) setLogs(logData);
      if (cfgData) setConfig(cfgData.value);
    } catch (error) {
      console.error('Supabase Fetch Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshAllData();

    // REAL-TIME SUBSCRIPTION: দয়া করে লক্ষ্য করুন, এই পার্টটি ডিলিট সমস্যার সমাধান করবে
    const recordsSubscription = supabase
      .channel('public:records')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'records' }, () => {
        refreshAllData(); // যেকোনো পরিবর্তনে ডাটা রিফ্রেশ হবে
      })
      .subscribe();

    const appsSubscription = supabase
      .channel('public:applications')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'applications' }, () => {
        refreshAllData();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(recordsSubscription);
      supabase.removeChannel(appsSubscription);
    };
  }, []);

  const addLog = async (user: string, action: string, details: string) => {
    const newLog: AuditLog = { id: `log_${Date.now()}`, timestamp: new Date().toLocaleString(), user, action, details };
    await supabase.from('logs').insert([newLog]);
  };

  const updateConfig = async (newConfig: AppConfig) => {
    await supabase.from('settings').upsert({ key: 'site_config', value: newConfig });
    await addLog('Admin', 'Update System Config', 'Settings updated globally.');
  };

  const updateServiceConfig = async (type: DocType, svc: ServiceConfig) => {
    const newConfig = { ...config, services: { ...config.services, [type]: svc } };
    await supabase.from('settings').upsert({ key: 'site_config', value: newConfig });
    await addLog('Admin', 'Update Service Protocol', `Metadata for ${type} updated.`);
  };

  const updatePaymentMethod = async (id: string, updates: Partial<PaymentMethod>) => {
    const newConfig = {
      ...config,
      paymentMethods: config.paymentMethods.map(m => m.id === id ? { ...m, ...updates } : m)
    };
    await supabase.from('settings').upsert({ key: 'site_config', value: newConfig });
    await addLog('Admin', 'Update Payment System', `Modified gateway settings for: ${id}`);
  };

  const addApplication = async (app: Application) => {
    await supabase.from('applications').insert([app]);
    await addLog('System', 'New Dossier Filed', `ID: ${app.id} (${app.type})`);
  };

  const updateApplication = async (id: string, updates: Partial<Application>) => {
    const currentApp = applications.find(a => a.id === id);
    if (!currentApp) return;

    const newHistory = [...(currentApp.history || [])];
    if (updates.status && updates.status !== currentApp.status) {
      newHistory.push({ date: new Date().toLocaleString(), action: `Status Changed to ${updates.status}`, by: 'Administrator' });
    }
    
    const updatedPayload = { ...currentApp, ...updates, history: newHistory };
    await supabase.from('applications').update(updatedPayload).eq('id', id);
    await addLog('Admin', 'Update Application', `Dossier ID: ${id}`);
  };

  const deleteApplication = async (id: string) => {
    await supabase.from('applications').delete().eq('id', id);
    await addLog('Admin', 'Delete Application', `Dossier ID: ${id}`);
  };

  const addRecord = async (record: OfficialRecord) => {
    await supabase.from('records').insert([record]);
    await addLog('Admin', 'Issue Official Record', `Reference: ${record.id}`);
  };

  const deleteRecord = async (id: string) => {
    // ডাটাবেস থেকে ডিলিট করা হচ্ছে
    const { error } = await supabase.from('records').delete().eq('id', id);
    if (error) {
      console.error('Delete error:', error);
      throw error;
    }
    await addLog('Admin', 'Delete Official Record', `Reference: ${id}`);
  };

  return (
    <ConfigContext.Provider value={{ 
      config, applications, records, logs, isLoading,
      updateConfig, updateServiceConfig, updatePaymentMethod, addApplication, updateApplication, deleteApplication, 
      addRecord, updateRecord: async () => {}, deleteRecord, addLog 
    }}>
      {children}
    </ConfigContext.Provider>
  );
};

export const useAppConfig = () => {
  const context = useContext(ConfigContext);
  if (!context) throw new Error('useAppConfig must be used within ConfigProvider');
  return context;
};
