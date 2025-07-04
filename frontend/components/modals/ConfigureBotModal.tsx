
import React, { useState } from 'react';
import { Bot } from '../../types.ts';

interface ConfigureBotModalProps {
  onClose: () => void;
  onCreate: (bot: Bot) => void;
}

const ConfigureBotModal: React.FC<ConfigureBotModalProps> = ({ onClose, onCreate }) => {
    const [name, setName] = useState('');
    const [model, setModel] = useState('gemini-2.5-flash-preview-04-17');
    const [apiKey, setApiKey] = useState('');
    const [description, setDescription] = useState('');

    const isFormValid = name && model && apiKey;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!isFormValid) return;

        const newBot: Bot = {
            id: `bot-${Date.now()}`,
            name,
            model,
            apiKey,
            description,
            avatar: `https://picsum.photos/seed/${name}/48/48`
        };
        onCreate(newBot);
    };


  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-8 relative m-4" onClick={e => e.stopPropagation()}>
        <h3 className="text-2xl font-bold text-center mb-6 text-brand-pink-500">Configure AI Bot</h3>
        <p className="text-center text-gray-500 mb-8 -mt-4">Set up your AI assistant by selecting the type, providing API credentials, and naming your bot.</p>

        <form onSubmit={handleSubmit} className="space-y-5">
            <div>
                <label className="block text-sm font-medium text-brand-pink-600 mb-1">Bot Name</label>
                <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter bot name..."
                    className="w-full p-3 bg-brand-pink-50 border border-brand-pink-200 text-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-pink-400 transition"
                    required
                />
                 <p className="text-xs text-gray-400 mt-1">Choose a friendly name for your AI assistant.</p>
            </div>
            <div>
                <label className="block text-sm font-medium text-brand-pink-600 mb-1">AI Type</label>
                <select
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                     className="w-full p-3 bg-brand-pink-50 border border-brand-pink-200 text-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-pink-400 transition appearance-none"
                >
                    <option value="gemini-2.5-flash-preview-04-17">Gemini Flash</option>
                </select>
            </div>
             <div>
                <label className="block text-sm font-medium text-brand-pink-600 mb-1">API Key</label>
                <input
                    type="password"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="Enter your API key..."
                    className="w-full p-3 bg-brand-pink-50 border border-brand-pink-200 text-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-pink-400 transition"
                    required
                />
                 <p className="text-xs text-gray-400 mt-1">Your API key will be stored securely and used only for bot communication.</p>
            </div>
             <div>
                <label className="block text-sm font-medium text-brand-pink-600 mb-1">Description (System Instruction)</label>
                <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="e.g., You are a helpful assistant that translates English to French."
                    rows={3}
                    className="w-full p-3 bg-brand-pink-50 border border-brand-pink-200 text-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-pink-400 transition"
                />
            </div>
            <div className="flex justify-end items-center pt-4 space-x-4">
                <button type="button" onClick={onClose} className="px-6 py-2 text-gray-600 font-semibold rounded-lg hover:bg-gray-100 transition">
                    Cancel
                </button>
                <button 
                    type="submit" 
                    disabled={!isFormValid}
                    className="px-6 py-2 bg-gradient-to-r from-pink-500 to-rose-400 text-white font-bold rounded-lg shadow-md hover:shadow-lg transition transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="inline-block h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Configure Bot
                </button>
            </div>
        </form>
      </div>
    </div>
  );
};

export default ConfigureBotModal;
