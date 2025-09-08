
import React, { useState } from 'react';
import type { IuranConfig, RumahCategory } from '../types';

interface BendaharaSettingsPanelProps {
  iuranConfig: IuranConfig;
  onSave: (newConfig: IuranConfig) => void;
}

const BendaharaSettingsPanel: React.FC<BendaharaSettingsPanelProps> = ({ iuranConfig, onSave }) => {
  const [config, setConfig] = useState<IuranConfig>(iuranConfig);

  const handleChange = (category: RumahCategory, type: 'RT' | 'PKK', value: string) => {
    const amount = parseInt(value, 10) || 0;
    setConfig(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [type]: amount
      }
    }));
  };

  const handleSave = () => {
    onSave(config);
  };
  
  return (
    <div className="space-y-6">
      <p className="text-gray-600">Sesuaikan besaran iuran bulanan untuk setiap kategori rumah.</p>
      <div className="space-y-4">
        {(Object.keys(config) as RumahCategory[]).sort().map(category => {
            return (
                <div key={category} className="bg-gray-50 p-4 rounded-lg border">
                    <h3 className="font-semibold text-gray-700 mb-3">Kategori Rumah {category}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Iuran RT (Rp)</label>
                            <input
                                type="number"
                                value={config[category].RT}
                                onChange={(e) => handleChange(category, 'RT', e.target.value)}
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Iuran PKK (Rp)</label>
                            <input
                                type="number"
                                value={config[category].PKK}
                                onChange={(e) => handleChange(category, 'PKK', e.target.value)}
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                            />
                        </div>
                    </div>
                </div>
            )
        })}
      </div>
       <div className="flex justify-end pt-4">
        <button onClick={handleSave} className="px-4 py-2 bg-indigo-600 text-white rounded-md text-sm font-medium hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
          Simpan Perubahan
        </button>
      </div>
    </div>
  );
};

export default BendaharaSettingsPanel;
