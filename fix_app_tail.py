with open('src/App.tsx', 'r') as f:
    code = f.read()

code = code.replace('    </div>\n  </>\n  );', '    </div>\n  );')

with open('src/App.tsx', 'w') as f:
    f.write(code)
