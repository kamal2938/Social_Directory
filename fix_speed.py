with open('src/index.css', 'r') as f:
    css = f.read()

# Replace the fast speeds with a more moderate speed (0.6s)
css = css.replace("0.12s ease", "0.6s ease")
css = css.replace("0.12s ease-in-out", "0.6s ease-in-out")
css = css.replace("0.05s", "0.2s") # Increase delays slightly to match the slower animation

with open('src/index.css', 'w') as f:
    f.write(css)

