import { useState, useRef } from 'react';
import { useAuthStore } from '../../store/authStore';
import { Upload, Image, Save, Building2, Mail, Phone, Globe, Palette } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminSettings() {
  const { user } = useAuthStore();
  const fileInputRef = useRef(null);
  const [logo, setLogo] = useState(localStorage.getItem('companyLogo') || null);
  const [companyName, setCompanyName] = useState(localStorage.getItem('companyName') || 'Facility Management System');
  const [settings, setSettings] = useState({
    companyName: localStorage.getItem('companyName') || 'Facility Management System',
    companyEmail: 'contact@fms.com',
    companyPhone: '+91 99999 99999',
    companyWebsite: 'www.fms.com',
    address: '123 Business Park, Bangalore',
    primaryColor: '#2563eb',
    sidebarColor: '#1e293b',
    timezone: 'Asia/Kolkata',
    dateFormat: 'DD/MM/YYYY',
    currency: 'INR',
    language: 'en',
    emailNotifications: true,
    pushNotifications: true,
    smsNotifications: false,
    autoAssign: true,
    geofenceRadius: 100,
    defaultSLA: 24,
  });

  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      toast.error('Logo must be less than 2MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const logoData = event.target.result;
      setLogo(logoData);
      localStorage.setItem('companyLogo', logoData);
      toast.success('Logo updated successfully');
      // In production, upload to Cloudinary and save URL to backend
    };
    reader.readAsDataURL(file);
  };

  const handleSave = () => {
    localStorage.setItem('companyName', settings.companyName);
    localStorage.setItem('companySettings', JSON.stringify(settings));
    toast.success('Settings saved successfully');
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-500 mt-1">Manage system configuration and branding</p>
      </div>

      {/* Logo & Branding */}
      <div className="card">
        <div className="flex items-center gap-3 mb-6">
          <Palette className="w-5 h-5 text-primary-600" />
          <h3 className="text-lg font-semibold text-gray-900">Branding</h3>
        </div>

        <div className="flex items-center gap-6 mb-6">
          <div className="relative">
            <div className="w-32 h-32 rounded-xl border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden bg-gray-50">
              {logo ? (
                <img src={logo} alt="Company Logo" className="w-full h-full object-contain" />
              ) : (
                <div className="text-center">
                  <Image className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-xs text-gray-500">No logo</p>
                </div>
              )}
            </div>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="absolute -bottom-2 -right-2 p-2 bg-primary-600 text-white rounded-full hover:bg-primary-700 shadow-lg"
            >
              <Upload className="w-4 h-4" />
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleLogoUpload}
              accept="image/*"
              className="hidden"
            />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-700 mb-1">Company Logo</p>
            <p className="text-xs text-gray-500 mb-3">Recommended size: 512x512px, Max 2MB (PNG, JPG, SVG)</p>
            {logo && (
              <button
                onClick={() => { setLogo(null); localStorage.removeItem('companyLogo'); toast.success('Logo removed'); }}
                className="text-sm text-red-600 hover:text-red-700"
              >
                Remove Logo
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
            <div className="relative">
              <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={settings.companyName}
                onChange={(e) => setSettings({ ...settings, companyName: e.target.value })}
                className="input-field pl-10"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Company Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="email"
                value={settings.companyEmail}
                onChange={(e) => setSettings({ ...settings, companyEmail: e.target.value })}
                className="input-field pl-10"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Company Phone</label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="tel"
                value={settings.companyPhone}
                onChange={(e) => setSettings({ ...settings, companyPhone: e.target.value })}
                className="input-field pl-10"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Website</label>
            <div className="relative">
              <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={settings.companyWebsite}
                onChange={(e) => setSettings({ ...settings, companyWebsite: e.target.value })}
                className="input-field pl-10"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Appearance */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Appearance</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Primary Color</label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={settings.primaryColor}
                onChange={(e) => setSettings({ ...settings, primaryColor: e.target.value })}
                className="w-12 h-10 rounded cursor-pointer"
              />
              <input
                type="text"
                value={settings.primaryColor}
                onChange={(e) => setSettings({ ...settings, primaryColor: e.target.value })}
                className="input-field flex-1"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Sidebar Color</label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={settings.sidebarColor}
                onChange={(e) => setSettings({ ...settings, sidebarColor: e.target.value })}
                className="w-12 h-10 rounded cursor-pointer"
              />
              <input
                type="text"
                value={settings.sidebarColor}
                onChange={(e) => setSettings({ ...settings, sidebarColor: e.target.value })}
                className="input-field flex-1"
              />
            </div>
          </div>
        </div>
      </div>

      {/* System Settings */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">System Configuration</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Timezone</label>
            <select
              value={settings.timezone}
              onChange={(e) => setSettings({ ...settings, timezone: e.target.value })}
              className="input-field"
            >
              <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
              <option value="Asia/Dubai">Asia/Dubai (GST)</option>
              <option value="Asia/Singapore">Asia/Singapore (SGT)</option>
              <option value="Europe/London">Europe/London (GMT)</option>
              <option value="America/New_York">America/New_York (EST)</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date Format</label>
            <select
              value={settings.dateFormat}
              onChange={(e) => setSettings({ ...settings, dateFormat: e.target.value })}
              className="input-field"
            >
              <option value="DD/MM/YYYY">DD/MM/YYYY</option>
              <option value="MM/DD/YYYY">MM/DD/YYYY</option>
              <option value="YYYY-MM-DD">YYYY-MM-DD</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Currency</label>
            <select
              value={settings.currency}
              onChange={(e) => setSettings({ ...settings, currency: e.target.value })}
              className="input-field"
            >
              <option value="INR">Indian Rupee (₹)</option>
              <option value="USD">US Dollar ($)</option>
              <option value="EUR">Euro (€)</option>
              <option value="GBP">British Pound (£)</option>
              <option value="AED">UAE Dirham (د.إ)</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Default SLA (Hours)</label>
            <input
              type="number"
              value={settings.defaultSLA}
              onChange={(e) => setSettings({ ...settings, defaultSLA: parseInt(e.target.value) })}
              className="input-field"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Geofence Radius (m)</label>
            <input
              type="number"
              value={settings.geofenceRadius}
              onChange={(e) => setSettings({ ...settings, geofenceRadius: parseInt(e.target.value) })}
              className="input-field"
            />
          </div>
        </div>
      </div>

      {/* Notifications */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Notification Preferences</h3>
        <div className="space-y-3">
          {[
            { key: 'emailNotifications', label: 'Email Notifications', desc: 'Receive updates via email' },
            { key: 'pushNotifications', label: 'Push Notifications', desc: 'Browser push notifications' },
            { key: 'smsNotifications', label: 'SMS Notifications', desc: 'Receive SMS alerts' },
            { key: 'autoAssign', label: 'Auto-Assign Complaints', desc: 'Automatically assign complaints to technicians' },
          ].map((item) => (
            <div key={item.key} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="text-sm font-medium text-gray-900">{item.label}</p>
                <p className="text-xs text-gray-500">{item.desc}</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings[item.key]}
                  onChange={(e) => setSettings({ ...settings, [item.key]: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
              </label>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end">
        <button onClick={handleSave} className="btn-primary flex items-center gap-2 px-8 py-3">
          <Save className="w-4 h-4" />
          Save All Settings
        </button>
      </div>
    </div>
  );
}
