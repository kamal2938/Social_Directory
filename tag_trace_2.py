import re

def check_tags(filename):
    with open(filename, 'r') as f:
        lines = f.readlines()
        
    stack = []
    
    for i, line in enumerate(lines):
        if i >= 240 and i <= 1035:
            line_no_comments = re.sub(r'\{/\*.*?\*/\}', '', line)
            
            opens = [m.start() for m in re.finditer(r'<div\b', line_no_comments)]
            closes = [m.start() for m in re.finditer(r'</div\b', line_no_comments)]
            
            events = []
            for pos in opens: events.append((pos, 'open'))
            for pos in closes: events.append((pos, 'close'))
            events.sort()
            
            for pos, kind in events:
                if kind == 'open':
                    stack.append(i + 1)
                else:
                    if stack:
                        stack.pop()
                        
            if i + 1 == 782:
                print(f"Stack at line 782 (end of Overview): {stack}")
            if i + 1 == 1007:
                print(f"Stack at line 1007 (end of Interactions): {stack}")

check_tags('src/components/PersonDetailModal.tsx')
