with open('src/components/AddEditPersonModal.tsx', 'r') as f:
    content = f.read()

content = content.replace("  );\n};\n  );\n};\n", "  );\n};\n")
content = content.replace("  );\n};\n};\n", "  );\n};\n")
content = content.replace("        </form>\n      </div>\n    </div>\n  );\n};\n", "        </form>\n      </div>\n    </div>\n  );\n};\n")

# To be sure, just replace everything after `        </form>`
import re
content = re.sub(r'        </form>.*', '        </form>\n      </div>\n    </div>\n  );\n};\n', content, flags=re.DOTALL)

with open('src/components/AddEditPersonModal.tsx', 'w') as f:
    f.write(content)
