with open('src/components/PersonDetailModal.tsx', 'r') as f:
    code = f.read()

code = code.replace(
"""                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      </div>""",
"""                ))}
              </div>
            </div>
            </AccordionSection>
            </>
          )}
        </div>
      </div>
    </div>"""
)

with open('src/components/PersonDetailModal.tsx', 'w') as f:
    f.write(code)
