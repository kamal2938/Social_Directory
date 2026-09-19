with open('src/components/PersonDetailModal.tsx', 'r') as f:
    content = f.read()

# I need to insert a </div> right before {/* Tab Navigation */}
content = content.replace("          {/* Tab Navigation */}", "      </div>\n          {/* Tab Navigation */}")

with open('src/components/PersonDetailModal.tsx', 'w') as f:
    f.write(content)
