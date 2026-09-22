
import React, { useState, useEffect } from 'react';
import { Person, PersonalDocument } from '../types';
import { getDocuments, addDocument, deleteDocument } from '../lib/api';
import { Shield, Plus, Trash2, FileText, Download } from 'lucide-react';
import { uploadToCloudinary } from '../lib/cloudinary';

export function VaultTab({ person }: { person: Person }) {
  const [docs, setDocs] = useState<PersonalDocument[]>([]);
  const [uploading, setUploading] = useState(false);
  
  useEffect(() => { loadData(); }, [person.id]);
  const loadData = async () => setDocs(await getDocuments(person.id));

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) return alert('File too large. Max 10MB.');
    
    setUploading(true);
    try {
      const url = await uploadToCloudinary(file);
      await addDocument(person.id, {
        title: file.name, category: 'General', fileData: url, visibility: 'Only Me'
      });
      loadData();
    } catch (err) {
      alert('Upload failed: ' + (err as Error).message);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try { await deleteDocument(id); loadData(); } catch(e) {}
  };

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Shield className="w-5 h-5 text-indigo-500" /> Document Vault
          </h3>
          <label className="text-xs sm:text-sm bg-indigo-600 hover:bg-indigo-700 text-white px-3.5 py-1.5 rounded-lg flex items-center gap-1.5 font-semibold cursor-pointer transition-colors shadow-xs">
            <Plus className="w-4 h-4"/> {uploading ? 'Uploading...' : 'Upload File'}
            <input type="file" className="hidden" accept=".pdf,.jpg,.png" onChange={handleFileUpload} disabled={uploading}/>
          </label>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">Secure, private document storage. Files are encrypted in transit.</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {docs.map(d => (
            <div key={d.id} className="p-3.5 border border-slate-200 dark:border-slate-800 rounded-xl flex items-center justify-between bg-slate-50 dark:bg-slate-800/40">
              <div className="flex items-center gap-3 overflow-hidden">
                <FileText className="text-indigo-500 w-8 h-8 flex-shrink-0" />
                <div className="truncate">
                  <p className="font-bold text-slate-900 dark:text-white text-sm truncate">{d.title}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{new Date(d.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
              <div className="flex gap-1.5">
                <a 
                  href={d.fileData} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  download={d.title} 
                  className="text-primary-600 dark:text-primary-400 p-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-2xs hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors" 
                  title="Download / View"
                >
                  <Download className="w-4 h-4"/>
                </a>
                <button 
                  onClick={() => handleDelete(d.id)} 
                  className="text-rose-500 p-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-2xs hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors cursor-pointer"
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4"/>
                </button>
              </div>
            </div>
          ))}
          {docs.length === 0 && (
            <p className="text-xs text-slate-500 dark:text-slate-400 italic py-6 col-span-2 text-center">
              No documents uploaded yet.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
