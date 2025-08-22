# **App Name**: AyurClinic Digital Office

## Core Features:

- Project Name: Project Name: OPDO – Ayurvedic Clinic Management SAAS Platform (Brand as "OPDO" for user-facing app)
- Project Goal: Develop a scalable, modular, SAAS platform for Ayurveda clinic management, powered by AI assistants for prescriptions, diets, and dosage, with WhatsApp integrations and classical Ayurveda data handling.
- Technology Stack: Technology Stack Recommendation:
Frontend: Next.js (TypeScript), Tailwind CSS + Shadcn/ui, Redux Toolkit, React Hook Form, Recharts, react-to-print or pdf-lib.
Backend: Node.js + Express.js, REST (consider GraphQL optionally), MongoDB (using Mongoose ORM), Firebase Auth (OTP-based mobile login).
AI Logic: AI Service Layer using Python (FastAPI), AI functions (Diet AI, Dosage AI) exposed via REST API, KB & SOP suggestion using vector search (using Pinecone / Weaviate).
Integrations: WhatsApp API: Gupshup / Twilio, PDF generation, Firebase Cloud Messaging (Optional).
DevOps: Docker for containerization, PM2 for Node process management, GitHub CI/CD, Deployment: AWS / DigitalOcean / Firebase Hosting.
- Folder Structure: Modular Folder Structure (OPDO-NEXUS Standard): /src /app (Next.js frontend) /backend (Node.js API server) /ai (Python ML server) /shared (types, constants) /utils (shared utilities) /styles (global Tailwind styles) /components (React components) /hooks (React custom hooks) /public (static assets)
- Development Principles: Development Principles: Strict modular architecture (Single Responsibility). TypeScript everywhere (except AI module). No hardcoding – use ENV files. Comment and document every function. Use reusable, extendable components. RESTful API development. Role-based routing and permissions. Mobile-first UI/UX.
- Design System: Design System: Primary Color: #A2B59F (Soft Olive Green), Background Color: #F5F5DC (Light Beige), Accent Color: #B8860B (Muted Gold), Fonts: Headings: Literata (Serif), Body: PT Sans (Sans-serif), UX: Clean, minimalist interfaces. Subtle transitions and feedback. Ayurveda-themed icons. Clear visual hierarchy.
- Modules: Modules to Develop: 1. User Authentication (Firebase OTP) 2. Doctor Dashboard 3. Reception Dashboard 4. Admin Panel 5. Appointments Module 6. Patient Management 7. Prescription Builder 8. Diet AI Assistant 9. Dosage AI Assistant 10. Billing & Inventory Management 11. Knowledge Base (KB) 12. Case Study Sharing to Medhayu 13. WhatsApp Integration 14. Reports & Analytics 15. Settings & Configurations 16. Notifications
- AI Features: AI Assistant Features: Use FastAPI with Python to serve: Diet AI (based on patient type + prescription), Dosage AI Assistant, Knowledge Base search/suggest. AI model can be fine-tuned separately using Ayurveda datasets, or connect to existing models via API if available.
- Deployment: Deployment Readiness: Build as multi-tenant SAAS, configurable per clinic. Role-based dashboards after login. Mobile-friendly UI, behaving like a mobile app when opened on phones. All PDFs exportable. Backend and AI should be separated as microservices. Use Docker for each part (frontend, backend, AI).

## Style Guidelines:

- Primary Gradient: #0066FF → #00C2FF Deep blue to aqua gradient for primary CTA buttons, headers.
- Accent Gradient: #FF7E5F → #FEB47B Peach-orange gradient for secondary actions or highlights.
- Error / Action Red: #FF4C4C For alerts, errors, destructive actions.
- Success Green: #4CAF50 Success confirmations, statuses.
- Light Background: #FAFAFA Minimalist light theme background.
- Dark Background: #121212 Pure dark mode background.
- Text Color Light: #1C1C1E Dark gray text on light backgrounds.
- Text Color Dark: #EDEDED Off-white text on dark backgrounds.
- Neutral Gray: #B0BEC5 For borders, disabled states, separators.
- Headings: Literata Serif; clean, authoritative.
- Body Text: PT Sans Sans-serif; modern, readable.
- Buttons / Labels: Inter or PT Sans Crisp, clean UI interactions.
- Minimalist Icons: Use outline icons for clarity.
- UX Style Guidelines (Inspired by Apple): Glassmorphism: Optional subtle blurred backgrounds for cards/dialogs. Microinteractions: Smooth, subtle transitions and animations. Hierarchy: Clear section separations with whitespace dominance. Rounded Corners: Medium-rounded buttons (`8px`) and cards (`16px`). Depth: Use shadows for layers (especially in dark mode). Consistency: Strict adherence to component consistency.
- Microinteractions: Smooth, subtle transitions and animations.