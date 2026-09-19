with open('src/components/AuthView.tsx', 'r') as f:
    code = f.read()

code = code.replace(
    "const [loginUsername, setLoginUsername] = useState('admin');",
    "const [loginUsername, setLoginUsername] = useState('');"
)
code = code.replace(
    "const [loginPassword, setLoginPassword] = useState('admin123');",
    "const [loginPassword, setLoginPassword] = useState('');"
)

with open('src/components/AuthView.tsx', 'w') as f:
    f.write(code)

with open('src/index.css', 'r') as f:
    css = f.read()

# The curve animation takes 1.8s, which is "slow". Let's speed it up to 0.8s
css = css.replace("transition: 1.8s ease-in-out;", "transition: 0.8s cubic-bezier(0.68, -0.55, 0.265, 1.55);")
css = css.replace("transition: 0.6s ease-in-out 1.2s, visibility 0s 1.2s;", "transition: 0.4s ease-in-out 0.4s, visibility 0s 0.4s;")
css = css.replace("transition: 0.6s ease-in-out;", "transition: 0.4s ease-in-out;")
css = css.replace("transition-delay: 1.2s;", "transition-delay: 0.4s;")

with open('src/index.css', 'w') as f:
    f.write(css)

