import React, { useState, useEffect } from 'react';
import { FeeConfiguration, BusStop } from '../types';
import { configService } from '../services/configService';
import { Settings as SettingsIcon, Save, Plus, Edit, Trash2 } from 'lucide-react';

const Settings: React.FC = () => {
  const [feeConfigurations, setFeeConfigurations] = useState<FeeConfiguration[]>([]);
  const [busStops, setBusStops] = useState<BusStop[]>([]);
  const [showAddBusStop, setShowAddBusStop] = useState(false);
  const [editingBusStop, setEditingBusStop] = useState<BusStop | null>(null);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = () => {
    Promise.all([
      configService.getFeeConfigurations(),
      configService.getBusStops()
    ]).then(([configs, stops]) => {
      setFeeConfigurations(configs);
      setBusStops(stops);
    }).catch(console.error);
  };

  const updateFeeConfiguration = (classNumber: number, amount: number) => {
    configService.updateFeeConfiguration(classNumber, amount)
      .then((success) => {
        if (success) {
          loadSettings();
        }
      })
      .catch(console.error);
  };

  const addBusStop = (name: string, amount: number) => {
    configService.addBusStop(name, amount)
      .then((newBusStop) => {
        if (newBusStop) {
          loadSettings();
          setShowAddBusStop(false);
        }
      })
      .catch(console.error);
  };

  const updateBusStop = (id: string, name: string, amount: number) => {
    configService.updateBusStop(id, name, amount)
      .then((success) => {
        if (success) {
          loadSettings();
          setEditingBusStop(null);
        }
      })
      .catch(console.error);
  };

  const deleteBusStop = (id: string) => {
    if (window.confirm('Are you sure you want to delete this bus stop?')) {
      configService.deleteBusStop(id)
        .then((success) => {
          if (success) {
            loadSettings();
          }
        })
        .catch(console.error);
    }
  };

  const BusStopForm: React.FC<{
    busStop?: BusStop;
    onSubmit: (name: string, amount: number) => void;
    onCancel: () => void;
  }> = ({ busStop, onSubmit, onCancel }) => {
    const [name, setName] = useState(busStop?.name || '');
    const [amount, setAmount] = useState(busStop?.amount || 0);

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (name.trim() && amount > 0) {
        onSubmit(name.trim(), amount);
        setName('');
        setAmount(0);
      }
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-md">
          <h3 className="text-lg font-semibold mb-4">
            {busStop ? 'Edit Bus Stop' : 'Add Bus Stop'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Bus Stop Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Amount (₹)
              </label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
                min="0"
              />
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={onCancel}
                className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                {busStop ? 'Update' : 'Add'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Settings</h2>
        <SettingsIcon className="h-6 w-6 text-gray-600" />
      </div>

      {/* Development Fee Configuration */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-semibold mb-4">Development Fee Configuration</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {feeConfigurations.map((config) => (
            <div key={config.id} className="border rounded-lg p-4">
              <div className="flex justify-between items-center mb-2">
                <span className="font-medium">Class {config.class}</span>
                <Save className="h-4 w-4 text-gray-400" />
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">₹</span>
                <input
                  type="number"
                  value={config.developmentFee}
                  onChange={(e) => updateFeeConfiguration(config.class, parseInt(e.target.value) || 0)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="0"
                />
              </div>
              <div className="text-xs text-gray-500 mt-1">
                Updated: {new Date(config.updatedAt).toLocaleDateString()}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bus Stop Configuration */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Bus Stop Configuration</h3>
          <button
            onClick={() => setShowAddBusStop(true)}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Bus Stop
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Bus Stop Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {busStops.map((busStop) => (
                <tr key={busStop.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{busStop.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">₹{busStop.amount}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => setEditingBusStop(busStop)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => deleteBusStop(busStop.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Bus Stop Form */}
      {(showAddBusStop || editingBusStop) && (
        <BusStopForm
          busStop={editingBusStop || undefined}
          onSubmit={editingBusStop ? 
            (name, amount) => updateBusStop(editingBusStop.id, name, amount) : 
            addBusStop
          }
          onCancel={() => {
            setShowAddBusStop(false);
            setEditingBusStop(null);
          }}
        />
      )}
    </div>
  );
};

export default Settings;