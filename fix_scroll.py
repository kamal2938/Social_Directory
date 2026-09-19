with open('src/components/PersonDetailModal.tsx', 'r') as f:
    content = f.read()

# We want to move `<div className="flex-1 min-h-0 overflow-y-auto bg-slate-100 dark:bg-slate-950 sm:p-2">`
# to encompass the Header Area as well.

# Currently it looks like:
#     <div className={...}>
#       {/* Header Area (FB Style) */}
#       <div className="bg-white dark:bg-slate-900 flex-shrink-0 relative">
#         ...
#       </div>
#
#       <div className="flex-1 min-h-0 overflow-y-auto bg-slate-100 dark:bg-slate-950 sm:p-2">
#         <div className="px-0 sm:px-4 space-y-3">
#           ...

# Let's replace the structure.

target_header_start = "{/* Header Area (FB Style) */}"
target_scroll_start = """      <div className="flex-1 min-h-0 overflow-y-auto bg-slate-100 dark:bg-slate-950 sm:p-2">
      <div className="px-0 sm:px-4 space-y-3">"""

if target_header_start in content and target_scroll_start in content:
    # Wrap header inside a new scrollable div, and change the old scrollable div to just a wrapper.
    
    new_header_start = """      <div className="flex-1 min-h-0 overflow-y-auto w-full flex flex-col">
      {/* Header Area (FB Style) */}"""
      
    new_scroll_start = """      <div className="bg-slate-100 dark:bg-slate-950 sm:p-2 flex-1">
      <div className="px-0 sm:px-4 space-y-3 pt-3">"""
      
    # Do string replacements carefully
    content = content.replace(target_header_start, new_header_start)
    content = content.replace(target_scroll_start, new_scroll_start)
    
    # We also need to add a closing div at the very end of `modalInner`
    target_end = """        </div>
      </div>
    </div>
  );"""
  
    new_end = """        </div>
      </div>
      </div>
    </div>
  );"""
  
    content = content.replace(target_end, new_end)
    
    with open('src/components/PersonDetailModal.tsx', 'w') as f:
        f.write(content)
    print("Patched scroll layout")
else:
    print("Could not find targets")

