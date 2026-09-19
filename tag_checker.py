import re
import sys

def check_tags(filename):
    with open(filename, 'r') as f:
        lines = f.readlines()
        
    stack = []
    
    # very naive scanner
    # just counting <div and </div
    # but ignoring if they are in comments
    
    for i, line in enumerate(lines):
        if i > 240 and i < 1035:
            # this is inside modalInner roughly
            # strip comments roughly
            line_no_comments = re.sub(r'\{/\*.*?\*/\}', '', line)
            
            div_opens = len(re.findall(r'<div\b', line_no_comments))
            div_closes = len(re.findall(r'</div\b', line_no_comments))
            
            for _ in range(div_opens):
                stack.append(i + 1)
            for _ in range(div_closes):
                if stack:
                    stack.pop()
                else:
                    print(f"Error: unmatched </div at line {i+1}")
                    
    print(f"Unclosed divs opened at lines: {stack}")

check_tags('src/components/PersonDetailModal.tsx')
