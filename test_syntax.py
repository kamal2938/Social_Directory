import subprocess

try:
    subprocess.run(["npx", "tsc", "--noEmit"], check=True, capture_output=True, text=True)
    print("TypeScript compiled successfully!")
except subprocess.CalledProcessError as e:
    print(e.stdout)
