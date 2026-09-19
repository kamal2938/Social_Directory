import re

def check_tags(filename):
    with open(filename, 'r') as f:
        lines = f.readlines()
        
    stack = []
    
    for i, line in enumerate(lines):
        if i >= 240 and i <= 1035:
            # strip comments roughly
            line_no_comments = re.sub(r'\{/\*.*?\*/\}', '', line)
            
            # find all opens and closes
            opens = [m.start() for m in re.finditer(r'<div\b', line_no_comments)]
            closes = [m.start() for m in re.finditer(r'</div\b', line_no_comments)]
            
            # weave them in order
            events = []
            for pos in opens:
                events.append((pos, 'open'))
            for pos in closes:
                events.append((pos, 'close'))
            
            events.sort()
            
            for pos, kind in events:
                if kind == 'open':
                    stack.append(i + 1)
                else:
                    if stack:
                        stack.pop()
                    else:
                        print(f"Error: unmatched </div at line {i+1}")
                        
    print(f"Unclosed divs opened at lines: {stack}")

check_tags('src/components/PersonDetailModal.tsx')
