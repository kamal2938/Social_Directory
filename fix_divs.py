with open('src/components/PersonDetailModal.tsx', 'r') as f:
    content = f.read()

target = """        </div>
      </div>
    </div>
  );

  if (embedded) {"""

new_target = """          </div>
        </div>
      </div>
    </div>
  );

  if (embedded) {"""

content = content.replace(target, new_target)

with open('src/components/PersonDetailModal.tsx', 'w') as f:
    f.write(content)
