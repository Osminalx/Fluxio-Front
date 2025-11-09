# FluxIO - Personal Finance Tracker

FluxIO is a comprehensive personal finance management frontend built with Next.js, React Query, and TypeScript. It follows the 50/30/20 budgeting philosophy (50% Needs, 30% Wants, 20% Savings).

## Getting Started

### Prerequisites

- Node.js 18+ or Bun
- Backend API running on `http://localhost:8080` (see [FRONTEND_API_GUIDE.md](./FRONTEND_API_GUIDE.md))

### Installation

```bash
# Install dependencies
npm install
# or
bun install
```

### Development

```bash
npm run dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

### Environment Variables

Create a `.env.local` file (optional):

```env
NEXT_PUBLIC_API_URL=http://localhost:8080
```

## Features

- **Authentication**: JWT-based login/register with token refresh
- **Bank Accounts**: Manage multiple accounts with balance tracking
- **Expenses**: Track expenses by category (needs/wants/savings)
- **Incomes**: Record income sources and dates
- **Fixed Expenses**: Recurring bills with automatic processing
- **Goals**: Savings goals with progress tracking
- **Reminders**: Bills, goals, and budget review reminders
- **Categories**: Custom expense categories organized by type

## Manual Testing Checklist

### Authentication Flow
- [ ] Register a new user account
- [ ] Login with existing credentials
- [ ] Verify token refresh on 401 errors
- [ ] Logout (single device)
- [ ] Logout all devices

### Bank Accounts
- [ ] Create a new bank account
- [ ] View account list with `real_balance` and `committed_fixed_expenses_month`
- [ ] Edit account name/balance
- [ ] Soft delete an account
- [ ] Restore a deleted account
- [ ] Change account status

### Expenses
- [ ] Create an expense with category and bank account
- [ ] Verify bank account balance decreases automatically
- [ ] View expenses by date range
- [ ] View monthly expenses
- [ ] Filter expenses by category or bank account
- [ ] Edit an expense (verify balance adjustment)
- [ ] Delete an expense (verify balance restoration)
- [ ] View expense summary/analytics

### Incomes
- [ ] Create an income entry
- [ ] Verify bank account balance increases automatically
- [ ] View all incomes
- [ ] Edit an income
- [ ] Delete an income (verify balance adjustment)

### Fixed Expenses
- [ ] Create a recurring fixed expense
- [ ] View fixed expenses calendar for a month
- [ ] Edit fixed expense details
- [ ] Delete a fixed expense
- [ ] Verify `committed_fixed_expenses_month` updates in bank accounts

### Categories
- [ ] View all categories (grouped by needs/wants/savings)
- [ ] Create a new category
- [ ] Create default categories
- [ ] Edit a category
- [ ] Delete a category (soft delete)
- [ ] View category statistics

### Goals
- [ ] Create a savings goal
- [ ] View goals list with progress bars
- [ ] Update goal progress (saved_amount)
- [ ] Verify progress_percent calculation
- [ ] Edit a goal
- [ ] Delete a goal

### Reminders
- [ ] Create a reminder (bill/goal/budget_review)
- [ ] View all reminders
- [ ] View overdue reminders
- [ ] Mark reminder as completed
- [ ] Edit a reminder
- [ ] Delete a reminder
- [ ] View reminder statistics

### Dashboard
- [ ] View financial overview cards
- [ ] View expense chart
- [ ] View recent transactions
- [ ] Verify all data loads correctly

## Project Structure

```
src/
├── app/              # Next.js app router pages
├── components/        # React components
│   ├── auth/         # Authentication components
│   ├── bank-accounts/
│   ├── expenses/
│   ├── incomes/
│   ├── goals/
│   ├── reminders/
│   ├── fixed-expenses/
│   └── ui/           # Reusable UI components
├── lib/              # API clients and queries
│   ├── api.ts        # Base API client
│   ├── auth.ts       # Auth functions
│   ├── *-api.ts      # Resource-specific API functions
│   └── *-queries.ts  # React Query hooks
├── stores/           # Zustand state management
├── types/            # TypeScript types and Zod schemas
└── hooks/            # Custom React hooks
```

## API Integration

See [FRONTEND_API_GUIDE.md](./FRONTEND_API_GUIDE.md) for complete API documentation.

## Scripts

```bash
# Development
npm run dev

# Build
npm run build

# Start production server
npm start

# Linting
npm run lint
npm run lint:fix

# Formatting
npm run format
npm run format:fix

# Check (lint + format)
npm run check
npm run check:fix
```

## Tech Stack

- **Next.js 15** - React framework
- **React Query (TanStack Query)** - Data fetching and caching
- **Zustand** - State management
- **Zod** - Schema validation
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Radix UI** - Accessible component primitives
- **Lucide React** - Icons

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [React Query Documentation](https://tanstack.com/query/latest)
- [Zod Documentation](https://zod.dev)
