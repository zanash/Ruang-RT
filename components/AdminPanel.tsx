
import React, { useState } from 'react';
import type { AdminLists, AdminListCategory } from '../types';
import { ADMIN_LIST_CATEGORIES } from '../constants';
import { TrashIcon } from './icons';

interface AdminPanelProps {
  adminLists: AdminLists;
  setAdminLists: React.Dispatch<React.SetStateAction<AdminLists>>;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ adminLists, setAdminLists }) => {
  const [newItems, setNewItems] = useState<Record<AdminListCategory, string>>(
    ADMIN_LIST_CATEGORIES.reduce((acc, cat) => ({ ...acc, [cat.key]: '' }), {} as Record<AdminListCategory, string>)
  );

  const handleAddItem = (category: AdminListCategory) => {
    const newItem = newItems[category].trim();
    if (newItem && !adminLists[category].includes(newItem)) {
      setAdminLists(prev => ({
        ...prev,
        [category]: [...prev[category], newItem]
      }));
      setNewItems(prev => ({ ...prev, [category]: '' }));
    }
  };
  
  const handleRemoveItem = (category: AdminListCategory, itemToRemove: string) => {
    setAdminLists(prev => ({
      ...prev,
      [category]: prev[category].filter(item => item !== itemToRemove)
    }));
  };

  const handleInputChange = (category: AdminListCategory, value: string) => {
    setNewItems(prev => ({ ...prev, [category]: value }));
  };

  return (
    <div className="space-y-6">
      <p className="text-gray-600">Kelola daftar pilihan yang tersedia di formulir data warga.</p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {ADMIN_LIST_CATEGORIES.map(({ key, label }) => (
          <div key={key} className="bg-gray-50 p-4 rounded-lg border">
            <h3 className="font-semibold text-gray-700 mb-3">{label}</h3>
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={newItems[key]}
                onChange={(e) => handleInputChange(key, e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddItem(key)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                placeholder={`Tambah ${label} baru...`}
              />
              <button
                onClick={() => handleAddItem(key)}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 text-sm font-medium"
              >
                +
              </button>
            </div>
            <ul className="space-y-2 max-h-48 overflow-y-auto">
              {adminLists[key].map((item, index) => (
                <li key={index} className="flex justify-between items-center bg-white p-2 rounded-md border text-sm">
                  <span className="text-gray-800">{item}</span>
                  <button onClick={() => handleRemoveItem(key, item)} className="text-red-500 hover:text-red-700">
                    <TrashIcon />
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminPanel;
