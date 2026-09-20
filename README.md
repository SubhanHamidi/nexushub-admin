# NexusHub Admin Dashboard

A multi-tenant SaaS admin dashboard built for managing organizations, distinct organization types, member invitations via Supabase Edge Functions, and Row Level Security (RLS) enforcement.

## 🚀 Live Demo URLs
- **Production URL (main):** [https://nexushub-admin.vercel.app](https://nexushub-admin.vercel.app)
- **Preview URL (development):** [https://nexushub-admin-git-development.vercel.app](https://nexushub-admin-git-development.vercel.app)

## 🔑 Seed Test Credentials (Admin Access)
- **Email:** `admin@nexushub.com`
- **Password:** `Admin@123`

---

## 🛠 Tech Stack & Architecture

- **Frontend Framework:** React 18 with TypeScript (Strict Mode)
- **Build Tool:** Vite (SWC)
- **Routing:** React Router v6 (Client-side with protected route guards)
- **Styling:** Tailwind CSS + shadcn/ui components
- **Server State & Caching:** TanStack React Query v5
- **Forms & Validation:** React Hook Form + Zod validation schemas
- **Backend Infrastructure:** Supabase (PostgreSQL with RLS Enabled)
- **Serverless Edge Logic:** Supabase Edge Function (`invite-member` running on Deno)

---

## 🔒 Security & Data Isolation
- Every table (`organizations`, `organization_members`) has **Row Level Security (RLS)** strictly enabled.
- Admins can only view and mutate their own tenant data.
- Member invitations are handled securely via an Edge Function using the Supabase Service Role Key on the server side to prevent client tampering.

---

## 📦 Setup & Installation Instructions

1. **Clone the repository:**
   ```bash
   git clone [https://github.com/SubhanHamidi/nexushub-admin.git](https://github.com/SubhanHamidi/nexushub-admin.git)
   cd nexushub-admin
