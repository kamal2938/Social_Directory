const fs = require('fs');
let code = fs.readFileSync('server/storage.ts', 'utf8');

code = code.replace(/isFavorite\?: string;/g, 'favoriteOnly?: boolean;');
code = code.replace(/isArchived\?: string;/g, 'archivedOnly?: boolean;');
code = code.replace(/circle\?: string; organization\?: string; location\?: string;/g, 'circle?: string; organization?: string; location?: string; needsFollowUp?: boolean; upcomingBirthday?: boolean;');

code = code.replace(/if \(params.isFavorite === 'true'\) people = people\.filter\(p => p\.isFavorite\);/g, 'if (params.favoriteOnly) people = people.filter(p => p.isFavorite);');
code = code.replace(/if \(params.isArchived === 'true'\) people = people\.filter\(p => p\.isArchived\);/g, 'if (params.archivedOnly) people = people.filter(p => p.isArchived);');
code = code.replace(/else if \(params.isArchived === 'false'\) people = people\.filter\(p => !p\.isArchived\);/g, 'else if (!params.archivedOnly) people = people.filter(p => !p.isArchived);');

fs.writeFileSync('server/storage.ts', code);
