
import React, { useState, useEffect } from 'react';
import { Person } from '../types';
import { api } from '../lib/api';
import { Network, Users } from 'lucide-react';

export function FamilyTreeTab({ person }: { person: Person }) {
  const [family, setFamily] = useState<Person[]>([]);

  useEffect(() => {
    api.getPeople({ limit: 50 }).then(res => {
      const people = res.items;
      // Very basic approximation for demo: people sharing same circle or relationship type
      const relatives = people.filter(p => 
        p.id !== person.id && 
        (p.relationshipType === 'Family Contact' || (p.tags || []).includes('Family'))
      );
      setFamily(relatives);
    });
  }, [person.id]);

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm text-center">
        <Network className="w-12 h-12 text-blue-500 mx-auto mb-4" />
        <h3 className="text-xl font-bold mb-2">Relationship Map</h3>
        <p className="text-gray-500 mb-6">Visualizing connections for {person.name}</p>
        
        <div className="relative border-t-2 border-gray-200 mt-8 pt-8 flex justify-center gap-8">
          {/* Main Person */}
          <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-white px-4">
            <div className="bg-blue-100 border-2 border-blue-500 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-1">
              {person.photo ? <img src={person.photo} className="w-full h-full rounded-full object-cover"/> : <span className="text-blue-700 font-bold">{person.name.charAt(0)}</span>}
            </div>
            <span className="font-bold text-sm">{person.name}</span>
          </div>

          {/* Relatives */}
          {family.length === 0 ? (
            <p className="text-gray-400 italic">No family members identified in your network yet.</p>
          ) : (
            family.map((f, i) => (
              <div key={f.id} className="relative flex flex-col items-center">
                <div className="w-px h-8 bg-gray-200 absolute -top-8"></div>
                <div className="bg-gray-100 border border-gray-300 rounded-full w-10 h-10 flex items-center justify-center mb-1">
                  {f.photo ? <img src={f.photo} className="w-full h-full rounded-full object-cover"/> : <span className="text-gray-600 font-bold">{f.name.charAt(0)}</span>}
                </div>
                <span className="text-xs font-medium">{f.name}</span>
                <span className="text-[10px] text-gray-500">{f.relationshipType}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
