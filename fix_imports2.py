with open('src/App.tsx', 'r') as f:
    code = f.read()
if 'react-hot-toast' not in code:
    code = code.replace("import React, { useState, useEffect, useCallback, useMemo } from 'react';", "import React, { useState, useEffect, useCallback, useMemo } from 'react';\nimport { Toaster, toast as hotToast } from 'react-hot-toast';")
with open('src/App.tsx', 'w') as f:
    f.write(code)

with open('src/components/PersonDetailModal.tsx', 'r') as f:
    code = f.read()
if 'ChevronUp' not in code:
    code = code.replace("import {", "import { ChevronUp, ChevronDown, UserCircle, Network, MessageSquarePlus, Activity, Briefcase, Archive, Cake, FileText, Clock, Phone, Mail, MessageCircle, Star, QrCode, Edit, Sparkles, ")
with open('src/components/PersonDetailModal.tsx', 'w') as f:
    f.write(code)
