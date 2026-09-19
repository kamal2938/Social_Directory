with open('src/index.css', 'r') as f:
    css = f.read()

# Remove everything after /* ===================================================
#    CURVED SLIDING AUTH ANIMATION STYLING
import re
css = re.sub(r'/\* ===================================================\s*CURVED SLIDING AUTH ANIMATION STYLING\s*=================================================== \*/.*', '', css, flags=re.DOTALL)

with open('src/index.css', 'w') as f:
    f.write(css)

