<div align="center">

# 🍛 Pro Mess

**A full-stack mess (shared-meal) management platform for students living in Bangladeshi messes and dorms.**
Track meals, bazar (grocery) spending, deposits and fixed costs. Pro Mess calculates the meal rate and each member's balance automatically.

![Next.js](https://img.shields.io/badge/Next.js_16-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)
![React](https://img.shields.io/badge/React_19-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-3FCF8E?style=for-the-badge&logo=supabase&logoColor=white)
![Tailwind](https://img.shields.io/badge/Tailwind_4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)

</div>

## ✨ Features

| Module | What it does |
|---|---|
| 📊 **Dashboard** | Mess overview, personal overview, month progress, member balances, highlights and recent activity |
| 🍽️ **Meals** | Daily meal counts per member |
| 🛒 **Bazar** | Grocery spending entries plus a **bazar rotation** schedule showing whose turn it is |
| 💰 **Deposits** | Monthly deposits per member |
| 🏠 **Fixed costs** | Rent, gas, electricity, internet and other costs, with a breakdown by category |
| 👥 **Members** | Admin-managed members, with a forced password change on first login |
| 📜 **Activity log** | An audit trail of every change |

### How the money works
```
meal rate      = total bazar cost / total meals
meal cost      = member's meals × meal rate
net balance    = deposits − meal cost
```

## 🔐 Security
- **Supabase Auth** with two roles: `admin` and `member`
- **Row Level Security** on every table. Everyone in the mess can see the data, members can manage their own meals, and admins manage everything else.
- Server actions handle mutations, and the service-role key is only ever used on the server.

## 🧱 Tech Stack
- **Frontend:** Next.js 16 (App Router), React 19, Tailwind CSS 4, lucide-react
- **Backend:** Supabase (PostgreSQL, Auth, RLS) and Next.js Server Actions
- **Language:** TypeScript

## 📁 Structure
```
src/
├── app/            # routes: dashboard, meals, bazar, deposits, fixed-costs, members, activity…
├── components/     # layout shell + reusable UI (glass cards, modals, stat cards)
├── contexts/       # auth context
└── lib/            # supabase clients, audit logger, types, utils
supabase/
├── schema.sql      # tables, enums, RLS policies
└── seed.sql
```

## 🚀 Getting Started

```bash
git clone https://github.com/Muktaditbf/MESS-PRO.git
cd MESS-PRO
npm install
```

1. Create a project at [supabase.com](https://supabase.com), then run `supabase/schema.sql` (and optionally `seed.sql`) in the SQL editor.
2. Create a `.env.local` file:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your-project-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   ```
3. Start the dev server:
   ```bash
   npm run dev
   ```
   Then open http://localhost:3000.

## 👤 Author
**Muktadi** · CSE @ Southeast University · [GitHub](https://github.com/Muktaditbf) · [LinkedIn](https://www.linkedin.com/in/muktadi-mohammad)
