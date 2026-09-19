with open('src/components/PersonDetailModal.tsx', 'r') as f:
    lines = f.readlines()

# Remove line 1053 (index 1052)
if "</div>" in lines[1052]:
    lines[1052] = ""

# Remove line 1035 (index 1034)
if "</div>" in lines[1034]:
    lines[1034] = ""

# Remove line 1002 (index 1001)
if "</div>" in lines[1001]:
    lines[1001] = ""

with open('src/components/PersonDetailModal.tsx', 'w') as f:
    f.writelines(lines)
