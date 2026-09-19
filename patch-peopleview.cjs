const fs = require('fs');
let content = fs.readFileSync('src/components/PeopleView.tsx', 'utf8');

content = content.replace(
  /isAdmin\?: boolean;/,
  `isAdmin?: boolean;
  currentUserId?: string;`
);

content = content.replace(
  /isAdmin = true,/,
  `isAdmin = true,
  currentUserId,`
);

// We need to replace `{isAdmin && (` with `{ (isAdmin || person.userId === currentUserId) && (` for action buttons
content = content.replace(/\{isAdmin && \(\s*<button\s+id=\{`card-log-inter/g, '{ (isAdmin || person.userId === currentUserId) && ( <button id={`card-log-inter');
content = content.replace(/\{isAdmin && \(\s*<button\s+id=\{`card-add-note/g, '{ (isAdmin || person.userId === currentUserId) && ( <button id={`card-add-note');
content = content.replace(/\{isAdmin && \(\s*<button\s+id=\{`card-edit/g, '{ (isAdmin || person.userId === currentUserId) && ( <button id={`card-edit');
content = content.replace(/\{isAdmin && \(\s*<button\s+id=\{`tbl-edit/g, '{ (isAdmin || person.userId === currentUserId) && ( <button id={`tbl-edit');

fs.writeFileSync('src/components/PeopleView.tsx', content);
console.log('PeopleView patched');
