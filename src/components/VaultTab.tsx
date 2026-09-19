
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
      <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold flex items-center gap-2"><Shield className="w-5 h-5 text-indigo-500" /> Document Vault</h3>
          <label className="text-sm bg-indigo-600 text-white px-3 py-1.5 rounded-lg flex items-center gap-1 cursor-pointer">
            <Plus className="w-4 h-4"/> {uploading ? 'Uploading...' : 'Upload'}
            <input type="file" className="hidden" accept=".pdf,.jpg,.png" onChange={handleFileUpload} disabled={uploading}/>
          </label>
        </div>
        <p className="text-xs text-gray-500 mb-4">Secure, private document storage. Files are encrypted in transit.</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {docs.map(d => (
            <div key={d.id} className="p-3 border rounded-lg flex items-center justify-between bg-gray-50">
              <div className="flex items-center gap-3 overflow-hidden">
                <FileText className="text-indigo-400 w-8 h-8 flex-shrink-0" />
                <div className="truncate">
                  <p className="font-bold text-sm truncate">{d.title}</p>
                  <p className="text-xs text-gray-500">{new Date(d.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <a href={d.fileData} target="_blank" rel="noopener noreferrer" download={d.title} className="text-blue-500 p-1 bg-white rounded shadow-sm hover:bg-blue-50" title="Download / View"><Download className="w-4 h-4"/></a>
                <button onClick={() => handleDelete(d.id)} className="text-red-500 p-1 bg-white rounded shadow-sm hover:bg-red-50"><Trash2 className="w-4 h-4"/></button>
              </div>
            </div>
          ))}
          {docs.length === 0 && <p className="text-sm text-gray-500 italic py-4 col-span-2 text-center">No documents uploaded.</p>}
        </div>
      </div>
    </div>
  );
}
