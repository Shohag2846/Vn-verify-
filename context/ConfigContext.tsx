
import React, { createContext, useContext, useState, useEffect } from 'react';
import { AppConfig, Application, AuditLog, OfficialRecord, DocType, PaymentMethod, DeviceInfo, SiteRule, InfoEntry } from '../types';
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
    { id: 'bank_vn', name: 'Vietcombank', type: 'Bank', details: 'Acc: 0011004455667 | Name: VN_PORTAL', enabled: true },
    { id: 'binance', name: 'Binance (USDT)', type: 'Binance', details: 'Wallet: 0x71C7656EC7ab88b098defB751B7401B5f6d8976F', enabled: true }
  ],
  theme: { primaryColor: '#da251d', textColor: '#1a1a1a', backgroundColor: '#ffffff' }
};

interface ConfigContextType {
  config: AppConfig;
  applications: Application[];
  records: OfficialRecord[];
  devices: DeviceInfo[];
  rules: SiteRule[];
  infoEntries: InfoEntry[];
  logs: AuditLog[];
  isLoading: boolean;
  refreshAllData: () => Promise<void>;
  wipeAllData: () => Promise<void>;
  updateConfig: (newConfig: AppConfig) => Promise<void>;
  addPaymentMethod: (method: PaymentMethod) => Promise<void>;
  updatePaymentMethod: (id: string, updates: Partial<PaymentMethod>) => Promise<void>;
  deletePaymentMethod: (id: string) => Promise<void>;
  addRecord: (record: OfficialRecord) => Promise<void>;
  updateRecord: (id: string, updates: Partial<OfficialRecord>) => Promise<void>;
  deleteRecord: (id: string) => Promise<void>;
  addApplication: (application: Application) => Promise<void>;
  updateApplication: (id: string, updates: Partial<Application>) => Promise<void>;
  deleteApplication: (id: string) => Promise<void>;
  addInfoEntry: (entry: InfoEntry) => Promise<void>;
  updateInfoEntry: (id: string, updates: Partial<InfoEntry>) => Promise<void>;
  deleteInfoEntry: (id: string) => Promise<void>;
  addRule: (rule: SiteRule) => Promise<void>;
  deleteRule: (id: string) => Promise<void>;
  updateDevice: (id: string, status: DeviceInfo['status']) => Promise<void>;
  removeDevice: (id: string) => Promise<void>;
  addLog: (user: string, action: string, details: string) => Promise<void>;
  registerCurrentDevice: () => Promise<DeviceInfo | null>;
  checkDeviceStatus: (ip: string) => Promise<DeviceInfo | null>;
}

const ConfigContext = createContext<ConfigContextType | undefined>(undefined);

export const ConfigProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [config, setConfig] = useState<AppConfig>(DEFAULT_CONFIG);
  const [applications, setApplications] = useState<Application[]>([]);
  const [records, setRecords] = useState<OfficialRecord[]>([]);
  const [devices, setDevices] = useState<DeviceInfo[]>([]);
  const [rules, setRules] = useState<SiteRule[]>([]);
  const [infoEntries, setInfoEntries] = useState<InfoEntry[]>([]);
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const refreshAllData = async () => {
    try {
      const { data: appData } = await supabase.from('applications').select('*').order('submissionDate', { ascending: false });
      const { data: recData } = await supabase.from('records').select('*').order('id', { ascending: false });
      const { data: infoData } = await supabase.from('info_entries').select('*').order('date', { ascending: false });
      const { data: logData } = await supabase.from('logs').select('*').order('timestamp', { ascending: false });
      const { data: cfgData } = await supabase.from('settings').select('value').eq('key', 'site_config').single();
      const { data: devData } = await supabase.from('devices').select('*').order('lastActive', { ascending: false });
      const { data: ruleData } = await supabase.from('rules').select('*');

      if (appData) setApplications(appData);
      if (recData) {
        const mappedRecords: OfficialRecord[] = recData.map(r => ({
          id: r.id,
          fullName: r.full_name || 'UNNAMED',
          passportNumber: r.passport_number || 'N/A',
          dob: r.dob || '',
          company_name: r.company_name || '',
          type: (r.type) as DocType,
          status: r.status || 'Verified',
          issueDate: r.issue_date || '',
          expiryDate: r.expiry_date || '',
          file_url: r.file_url || '',
          pdfUrl: r.file_url || '',
          nationality: r.nationality || '',
          email: r.email || '',
          phone: r.phone || '',
          sponsorCompany: r.company_name,
          jobTitle: r.job_title || '',
          vietnamAddress: r.vietnam_address || ''
        }));
        setRecords(mappedRecords);
      }
      if (infoData) setInfoEntries(infoData);
      if (logData) setLogs(logData);
      if (cfgData) setConfig(cfgData.value);
      if (devData) setDevices(devData);
      if (ruleData) setRules(ruleData);
    } catch (error) {
      console.error('Supabase Sync Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const wipeAllData = async () => {
    setIsLoading(true);
    try {
      await supabase.from('applications').delete().neq('id', '0');
      await supabase.from('records').delete().neq('id', '0');
      await supabase.from('info_entries').delete().neq('id', '0');
      await supabase.from('logs').delete().neq('id', '0');
      await supabase.from('devices').delete().neq('id', '0');
      setApplications([]);
      setRecords([]);
      setInfoEntries([]);
      setLogs([]);
      setDevices([]);
    } catch (error) {
      console.error("Wipe failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshAllData();
  }, []);

  const registerCurrentDevice = async (): Promise<DeviceInfo | null> => {
    let locData = { ip: 'Unknown', country_name: 'Unknown', city: 'Unknown', region: 'Unknown' };
    try {
      const locRes = await fetch('https://ipapi.co/json/').catch(() => null);
      if (locRes && locRes.ok) locData = await locRes.json();
    } catch (e) { console.warn("Location service unavailable"); }

    const ua = navigator.userAgent;
    const deviceType = /Mobile|Android|iPhone/i.test(ua) ? 'Mobile' : /Tablet|iPad/i.test(ua) ? 'Tablet' : 'Desktop';
    const browser = ua.includes('Chrome') ? 'Chrome' : ua.includes('Firefox') ? 'Firefox' : 'Safari';
    const os = ua.includes('Windows') ? 'Windows' : ua.includes('Mac') ? 'MacOS' : 'Linux';

    const deviceId = `dev_${locData.ip.replace(/\./g, '_')}`;
    try {
      const { data: existing } = await supabase.from('devices').select('*').eq('id', deviceId).single();
      const deviceData: DeviceInfo = {
        id: deviceId,
        deviceName: `${deviceType} - ${browser} (${os})`,
        browser, os: os as string, ip: locData.ip,
        country: locData.country_name || 'Unknown',
        city: locData.city || 'Unknown',
        region: locData.region || 'Unknown',
        lastActive: new Date().toISOString(),
        loginTime: existing ? existing.loginTime : new Date().toISOString(),
        status: existing ? existing.status : 'Active',
        deviceType: deviceType as any
      };
      await supabase.from('devices').upsert([deviceData]);
      await refreshAllData();
      return deviceData;
    } catch (err) { return null; }
  };

  const checkDeviceStatus = async (ip: string): Promise<DeviceInfo | null> => {
    try {
      const { data } = await supabase.from('devices').select('*').eq('ip', ip).single();
      return data;
    } catch { return null; }
  };

  const updateDevice = async (id: string, status: DeviceInfo['status']) => {
    const { error } = await supabase.from('devices').update({ status }).eq('id', id);
    if (error) throw error;
    await refreshAllData();
  };

  const removeDevice = async (id: string) => {
    const { error } = await supabase.from('devices').delete().eq('id', id);
    if (error) throw error;
    await refreshAllData();
  };

  const updateConfig = async (newConfig: AppConfig) => {
    const { error } = await supabase.from('settings').upsert({ key: 'site_config', value: newConfig });
    if (error) throw error;
    setConfig(newConfig);
  };

  const addPaymentMethod = async (method: PaymentMethod) => {
    const newConfig = { ...config, paymentMethods: [...config.paymentMethods, method] };
    await updateConfig(newConfig);
  };

  const updatePaymentMethod = async (id: string, updates: Partial<PaymentMethod>) => {
    const newConfig = { ...config, paymentMethods: config.paymentMethods.map(m => m.id === id ? { ...m, ...updates } : m) };
    await updateConfig(newConfig);
  };

  const deletePaymentMethod = async (id: string) => {
    const newConfig = { ...config, paymentMethods: config.paymentMethods.filter(m => m.id !== id) };
    await updateConfig(newConfig);
  };

  const addRecord = async (record: OfficialRecord) => {
    // এখানেও snake_case ব্যবহার করা উচিত যদি আপনি সরাসরি এই ফাংশন ব্যবহার করেন
    const payload = {
      full_name: record.fullName,
      passport_number: record.passportNumber,
      file_url: record.file_url,
      // ... অন্য সব কলাম
    };
    const { error } = await supabase.from('records').insert([payload]);
    if (error) throw error;
    await refreshAllData();
  };

  const updateRecord = async (id: string, updates: Partial<OfficialRecord>) => {
    const { error } = await supabase.from('records').update(updates).eq('id', id);
    if (error) throw error;
    await refreshAllData();
  };

  const deleteRecord = async (id: string) => {
    const { error } = await supabase.from('records').delete().eq('id', id);
    if (error) throw error;
    await refreshAllData();
  };

  const addApplication = async (application: Application) => {
    const { error } = await supabase.from('applications').insert([application]);
    if (error) throw error;
    await refreshAllData();
  };

  const updateApplication = async (id: string, updates: Partial<Application>) => {
    const { error } = await supabase.from('applications').update(updates).eq('id', id);
    if (error) throw error;
    await refreshAllData();
  };

  const deleteApplication = async (id: string) => {
    const { error } = await supabase.from('applications').delete().eq('id', id);
    if (error) throw error;
    await refreshAllData();
  };

  const addInfoEntry = async (entry: InfoEntry) => {
    const { error } = await supabase.from('info_entries').insert([entry]);
    if (error) throw error;
    await refreshAllData();
  };

  const updateInfoEntry = async (id: string, updates: Partial<InfoEntry>) => {
    const { error } = await supabase.from('info_entries').update(updates).eq('id', id);
    if (error) throw error;
    await refreshAllData();
  };

  const deleteInfoEntry = async (id: string) => {
    const { error } = await supabase.from('info_entries').delete().eq('id', id);
    if (error) throw error;
    await refreshAllData();
  };

  const addRule = async (rule: SiteRule) => {
    const { error } = await supabase.from('rules').insert([rule]);
    if (error) throw error;
    await refreshAllData();
  };

  const deleteRule = async (id: string) => {
    const { error } = await supabase.from('rules').delete().eq('id', id);
    if (error) throw error;
    await refreshAllData();
  };

  const addLog = async (user: string, action: string, details: string) => {
    const newLog: AuditLog = { id: `log_${Date.now()}`, timestamp: new Date().toLocaleString(), user, action, details };
    await supabase.from('logs').insert([newLog]);
    await refreshAllData();
  };

  return (
    <ConfigContext.Provider value={{ 
      config, applications, records, devices, rules, infoEntries, logs, isLoading, refreshAllData, wipeAllData,
      updateConfig, addPaymentMethod, updatePaymentMethod, deletePaymentMethod, 
      addRecord, updateRecord, deleteRecord, addApplication, updateApplication, deleteApplication,
      addInfoEntry, updateInfoEntry, deleteInfoEntry,
      addRule, deleteRule, updateDevice, removeDevice, addLog, 
      registerCurrentDevice, checkDeviceStatus
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
