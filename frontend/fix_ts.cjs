const fs = require('fs');
let pb = fs.readFileSync('src/pages/ProjectBoard.tsx', 'utf-8');
pb = pb.replace('import React, { useState } from "react";', 'import { useState } from "react";');
pb = pb.replace('DragEndEvent', 'type DragEndEvent');
pb = pb.replace(', arrayMove', '');
pb = pb.replace('Plus, Users, ArrowLeft', 'Plus, ArrowLeft');
pb = pb.replace('const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);', '');
fs.writeFileSync('src/pages/ProjectBoard.tsx', pb);

let app = fs.readFileSync('src/App.tsx', 'utf-8');
app = app.replace('import React from "react";\n', '');
fs.writeFileSync('src/App.tsx', app);

let layout = fs.readFileSync('src/components/Layout.tsx', 'utf-8');
layout = layout.replace('import React from "react";\n', '');
fs.writeFileSync('src/components/Layout.tsx', layout);

let pr = fs.readFileSync('src/components/ProtectedRoute.tsx', 'utf-8');
pr = pr.replace('import React from "react";\n', '');
fs.writeFileSync('src/components/ProtectedRoute.tsx', pr);
console.log('Fixed TS issues');
