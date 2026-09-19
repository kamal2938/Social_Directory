const fs = require('fs');

let code = fs.readFileSync('server/storage.ts', 'utf8');

code = code.replace(/\{ data: \[\]\, meta: \{ total: 0, page: 1, limit: 10, totalPages: 0 \} \}/g, '{ items: [], total: 0, page: 1, limit: 10, totalPages: 0 }');
code = code.replace(/return \{ data: paginated, meta: \{ total, page, limit, totalPages \} \};/g, 'return { items: paginated, total, page, limit, totalPages };');

fs.writeFileSync('server/storage.ts', code);
