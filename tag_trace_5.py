import re

def check_tags(filename):
    with open(filename, 'r') as f:
        lines = f.readlines()
        
    stack = []
    
    for i, line in enumerate(lines):
        if i >= 504 and i <= 782:
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
                        
            if i + 1 == 580: print("After Card 1:", stack)
            if i + 1 == 619: print("After Card 2:", stack)
            if i + 1 == 673: print("After Card 3:", stack)
            if i + 1 == 736: print("After Card 4:", stack)
            if i + 1 == 780: print("After Card 5:", stack)
            
check_tags('src/components/PersonDetailModal.tsx')
