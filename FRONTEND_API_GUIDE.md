# Fluxio API - Frontend Integration Guide

## Overview

Fluxio is a personal finance management API built on the 50/30/20 budgeting philosophy (50% Needs, 30% Wants, 20% Savings). This guide provides complete documentation for frontend integration using React Query and Zod.

**API Version:** 1.0  
**Base URL:** `http://localhost:8080`  
**API Base Path:** `/api/v1`

### What is Fluxio?

Fluxio is a comprehensive personal finance management system that helps users:
- **Track Expenses** - Record and categorize expenses into needs, wants, and savings
- **Manage Income** - Track all income sources with dates and bank accounts
- **Manage Bank Accounts** - Track multiple bank accounts and their balances
  - New computed fields in responses: `committed_fixed_expenses_month` and `real_balance`
- **Set Financial Goals** - Create savings goals and track progress
- **Track Fixed Expenses** - Manage recurring bills and subscriptions with automatic processing
- **Set Reminders** - Get notifications for bills, goals, and budget reviews
- **View History** - Track financial changes over time

### Key Features

1. **Automatic Balance Tracking**
   - Expenses automatically deduct from bank account balances
   - Income automatically adds to bank account balances
   - Fixed expenses automatically process on due dates

2. **Expense Categories**
   - Categories organized into needs, wants, and savings
   - Flexible categorization system

3. **Soft Delete System**
   - Most resources support soft delete (status changes to 'deleted')
   - Deleted items can be restored
   - Query parameters allow including deleted items

4. **Status Management**
   - All major entities have status field
   - Supported statuses: active, deleted, suspended, archived, pending, locked
   - Status change history is tracked

5. **Authentication**
   - JWT-based authentication
   - Refresh token system for session management
   - Logout from single device or all devices

6. **Comprehensive Query Options**
   - Date range filtering
   - Category and account filtering
   - Include/exclude deleted items
   - Pagination support (where applicable)

## Authentication

### Authentication Flow

The API uses JWT (JSON Web Token) bearer authentication. All protected endpoints require the `Authorization` header:

```
Authorization: Bearer <your_jwt_token>
```

### Public Endpoints (No Auth Required)
- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/register` - User registration  
- `POST /api/v1/auth/refresh` - Refresh access token
- `POST /api/v1/setup/initialize` - System initialization
- `POST /api/v1/setup/user` - New user setup
- `GET /api/v1/setup/overview` - System overview

### Protected Endpoints
All other endpoints require authentication via Bearer token.

---

## Core Concepts

### Status System
All major entities support status management with these values:
- `active` - Record is active and in use
- `deleted` - Soft deleted by user (restorable)
- `suspended` - Temporarily disabled
- `archived` - Historical, not active
- `pending` - Awaiting validation
- `locked` - Locked due to security/dispute

### Expense Types (50/30/20 Philosophy)
Categories are organized into three fixed expense types:
- `needs` - 50% of budget (essential expenses)
- `wants` - 30% of budget (non-essential expenses)  
- `savings` - 20% of budget (savings and investments)

### UUID Format
All IDs use UUID v4 format: `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`

### Date Format
- Dates are in ISO 8601 format: `YYYY-MM-DD` for date-only fields
- Timestamps include time: `YYYY-MM-DDTHH:mm:ss.sssZ`

---

## Zod Schemas

### Base Schemas

```typescript
import { z } from 'zod';

// UUID schema
const uuidSchema = z.string().uuid();

// Status enum
const statusSchema = z.enum(['active', 'deleted', 'suspended', 'archived', 'pending', 'locked']);

// Expense type enum
const expenseTypeSchema = z.enum(['needs', 'wants', 'savings']);

// Date schemas
const dateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);
const timestampSchema = z.string().datetime();

// Currency amount (positive number with 2 decimals)
const amountSchema = z.number().positive().multipleOf(0.01);
```

### User Schema

```typescript
const userSchema = z.object({
  id: uuidSchema,
  email: z.string().email(),
  name: z.string().min(1),
  monthly_income: z.number().positive().nullable(),
  status: statusSchema,
  last_login: timestampSchema.nullable(),
  created_at: timestampSchema,
  updated_at: timestampSchema,
});

type User = z.infer<typeof userSchema>;
```

### Bank Account Schema

```typescript
const bankAccountSchema = z.object({
  id: uuidSchema,
  user_id: uuidSchema,
  account_name: z.string().min(1),
  balance: z.number(),
  status: statusSchema,
  status_changed_at: timestampSchema.nullable(),
  created_at: timestampSchema,
  updated_at: timestampSchema,
});

type BankAccount = z.infer<typeof bankAccountSchema>;

// Create/Update schemas
const createBankAccountSchema = z.object({
  account_name: z.string().min(1),
  balance: z.number().default(0),
});

const updateBankAccountSchema = createBankAccountSchema.partial();
```

#### Bank Account Full Response (API)

```typescript
export const bankAccountFullResponseSchema = z.object({
  id: uuidSchema,
  account_name: z.string(),
  balance: z.number(),
  committed_fixed_expenses_month: z.number(),
  real_balance: z.number(),
  status: statusSchema,
  status_changed_at: timestampSchema.optional(),
  created_at: timestampSchema,
  updated_at: timestampSchema,
});
```

### Category Schema

```typescript
const categorySchema = z.object({
  id: uuidSchema,
  user_id: uuidSchema,
  name: z.string().min(1),
  expense_type: expenseTypeSchema,
  status: statusSchema,
  status_changed_at: timestampSchema.nullable(),
  created_at: timestampSchema,
  updated_at: timestampSchema,
});

type Category = z.infer<typeof categorySchema>;

const createCategorySchema = z.object({
  name: z.string().min(1),
  expense_type: expenseTypeSchema,
});
```

### Expense Schema

```typescript
const expenseSchema = z.object({
  id: uuidSchema,
  user_id: uuidSchema,
  category_id: uuidSchema,
  amount: amountSchema,
  date: dateSchema,
  bank_account_id: uuidSchema,
  description: z.string().nullable(),
  status: statusSchema,
  status_changed_at: timestampSchema.nullable(),
  created_at: timestampSchema,
  updated_at: timestampSchema,
  // Relations
  category: categorySchema.optional(),
  bank_account: bankAccountSchema.optional(),
});

type Expense = z.infer<typeof expenseSchema>;

const createExpenseSchema = z.object({
  category_id: uuidSchema,
  amount: amountSchema,
  date: dateSchema,
  bank_account_id: uuidSchema,
  description: z.string().optional(),
});

const updateExpenseSchema = createExpenseSchema.partial();
```

### Income Schema

```typescript
const incomeSchema = z.object({
  id: uuidSchema,
  user_id: uuidSchema,
  amount: amountSchema,
  bank_account_id: uuidSchema,
  bank_account_name: z.string(),
  date: dateSchema,
  status: statusSchema,
  status_changed_at: timestampSchema.nullable(),
  created_at: timestampSchema,
  updated_at: timestampSchema,
});

type Income = z.infer<typeof incomeSchema>;

const createIncomeSchema = z.object({
  amount: amountSchema,
  bank_account_id: uuidSchema,
  date: dateSchema,
});

const updateIncomeSchema = createIncomeSchema.partial();
```

### Goal Schema

```typescript
const goalSchema = z.object({
  id: uuidSchema,
  user_id: uuidSchema,
  name: z.string().min(1),
  total_amount: amountSchema,
  saved_amount: z.number().min(0),
  progress_percent: z.number().min(0).max(100), // Computed by API
  status: statusSchema,
  status_changed_at: timestampSchema.nullable(),
  created_at: timestampSchema,
  updated_at: timestampSchema,
});

type Goal = z.infer<typeof goalSchema>;

const createGoalSchema = z.object({
  name: z.string().min(1),
  total_amount: amountSchema,
  saved_amount: z.number().min(0).default(0),
});

const updateGoalSchema = createGoalSchema.partial();
```

### Fixed Expense Schema

```typescript
const recurrenceTypeSchema = z.enum(['monthly', 'yearly']);

const fixedExpenseSchema = z.object({
  id: uuidSchema,
  user_id: uuidSchema,
  name: z.string().min(1),
  amount: amountSchema,
  due_date: dateSchema, // Day of month (e.g., "2024-01-15" means day 15)
  category_id: uuidSchema.nullable(),
  bank_account_id: uuidSchema,
  is_recurring: z.boolean().default(true),
  recurrence_type: recurrenceTypeSchema.default('monthly'),
  status: statusSchema,
  created_at: timestampSchema,
  updated_at: timestampSchema,
  last_processed_at: timestampSchema.nullable(),
  next_due_date: dateSchema,
});

type FixedExpense = z.infer<typeof fixedExpenseSchema>;

const createFixedExpenseSchema = z.object({
  name: z.string().min(1),
  amount: amountSchema,
  due_date: dateSchema, // Day of month (e.g., "2024-01-15" = day 15)
  category_id: uuidSchema.optional(), // Optional: categorizes as needs/wants/savings
  bank_account_id: uuidSchema, // Required: bank account to deduct from
  is_recurring: z.boolean().optional().default(true), // Auto-repeats monthly
  recurrence_type: recurrenceTypeSchema.optional().default('monthly'),
});

const updateFixedExpenseSchema = createFixedExpenseSchema.partial();
```

### Reminder Schema

```typescript
const reminderTypeSchema = z.enum(['bill', 'goal', 'budget_review']);

const reminderSchema = z.object({
  id: uuidSchema,
  user_id: uuidSchema,
  title: z.string().min(1),
  description: z.string().nullable(),
  due_date: dateSchema,
  is_completed: z.boolean(),
  reminder_type: reminderTypeSchema,
  status: statusSchema,
  status_changed_at: timestampSchema.nullable(),
  created_at: timestampSchema,
  updated_at: timestampSchema,
});

type Reminder = z.infer<typeof reminderSchema>;

const createReminderSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  due_date: dateSchema,
  reminder_type: reminderTypeSchema,
});

const updateReminderSchema = createReminderSchema.partial();
```

---

## API Endpoints

### Authentication Endpoints

#### POST /api/v1/auth/register
Register a new user account.

**Request Body:**
```typescript
{
  email: string;
  password: string;
  name: string;
}
```

**Response (200):**
```typescript
{
  token: string;
  user: User;
}
```

**React Query Example:**
```typescript
import { useMutation } from '@tanstack/react-query';

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(1),
});

type RegisterInput = z.infer<typeof registerSchema>;

const useRegister = () => {
  return useMutation({
    mutationFn: async (data: RegisterInput) => {
      const validated = registerSchema.parse(data);
      const response = await fetch('http://localhost:8080/api/v1/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(validated),
      });
      
      if (!response.ok) throw new Error('Registration failed');
      
      return response.json();
    },
  });
};
```

#### POST /api/v1/auth/login
Authenticate a user and receive a JWT token.

**Request Body:**
```typescript
{
  email: string;
  password: string;
}
```

**Response (200):**
```typescript
{
  token: string;
  user: User;
}
```

**React Query Example:**
```typescript
const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const useLogin = () => {
  return useMutation({
    mutationFn: async (data: z.infer<typeof loginSchema>) => {
      const validated = loginSchema.parse(data);
      const response = await fetch('http://localhost:8080/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(validated),
      });
      
      if (!response.ok) throw new Error('Login failed');
      
      const result = await response.json();
      // Store token in localStorage or secure storage
      localStorage.setItem('auth_token', result.token);
      return result;
    },
  });
};
```

#### POST /api/v1/auth/refresh
Refresh an expired access token.

**Request Body:**
```typescript
{
  refresh_token: string;
}
```

**Response (200):**
```typescript
{
  token: string;
}
```

#### POST /api/v1/auth/logout
Logout and invalidate current refresh token. **Requires Auth**

**Response (200):**
```typescript
{
  message: string;
}
```

#### POST /api/v1/auth/logout-all
Logout from all devices. **Requires Auth**

#### GET /api/v1/auth/me
Get current authenticated user. **Requires Auth**

**Response (200):** Returns `User` object

---

### Bank Account Endpoints

All bank account endpoints require authentication.

#### GET /api/v1/bank-accounts
Get all user's bank accounts.

**Response:** `BankAccount[]`

**React Query Example:**
```typescript
const useBankAccounts = () => {
  return useQuery({
    queryKey: ['bank-accounts'],
    queryFn: async () => {
      const token = localStorage.getItem('auth_token');
      const response = await fetch('http://localhost:8080/api/v1/bank-accounts', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (!response.ok) throw new Error('Failed to fetch bank accounts');
      
      const data = await response.json();
      return z.array(bankAccountSchema).parse(data);
    },
  });
};
```

#### GET /api/v1/bank-accounts/active
Get only active bank accounts.

**Response:** `BankAccount[]`

#### GET /api/v1/bank-accounts/deleted
Get soft-deleted bank accounts.

**Response:** `BankAccount[]`

#### GET /api/v1/bank-accounts/:id
Get a specific bank account by ID.

**Response:** `BankAccount`

#### POST /api/v1/bank-accounts
Create a new bank account.

**Request Body:**
```typescript
{
  account_name: string;
  balance?: number; // Default: 0
}
```

**Response (201):** `BankAccount`

**React Query Example:**
```typescript
const useCreateBankAccount = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: z.infer<typeof createBankAccountSchema>) => {
      const validated = createBankAccountSchema.parse(data);
      const token = localStorage.getItem('auth_token');
      
      const response = await fetch('http://localhost:8080/api/v1/bank-accounts', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(validated),
      });
      
      if (!response.ok) throw new Error('Failed to create bank account');
      
      const result = await response.json();
      return bankAccountSchema.parse(result);
    },
    onSuccess: () => {
      // Invalidate and refetch bank accounts
      queryClient.invalidateQueries({ queryKey: ['bank-accounts'] });
    },
  });
};
```

#### PATCH /api/v1/bank-accounts/:id
Update a bank account.

**Request Body:** Partial of create schema

**Response (200):** `BankAccount`

#### DELETE /api/v1/bank-accounts/:id
Soft delete a bank account.

**Response (200):** `{ message: string }`

#### POST /api/v1/bank-accounts/:id/restore
Restore a soft-deleted bank account.

**Response (200):** `BankAccount`

#### PATCH /api/v1/bank-accounts/:id/status
Change bank account status.

**Request Body:**
```typescript
{
  status: "active" | "deleted" | "suspended" | "archived" | "pending" | "locked";
}
```

**Response (200):** `BankAccount`

---

### Expense Endpoints

All expense endpoints require authentication.

Balance behavior
- Create: deducts `amount` from the linked `bank_account_id` immediately.
- Patch: adjusts balances if `amount` or `bank_account_id` changes.
- Delete (soft): restores `amount` back to the original account.
- Restore: deducts `amount` again from the original account.

#### GET /api/v1/expenses
Get all user's expenses.

**Response:** `Expense[]`

#### GET /api/v1/expenses/active
Get only active expenses.

**Response:** `Expense[]`

#### GET /api/v1/expenses/deleted
Get soft-deleted expenses.

**Response:** `Expense[]`

#### GET /api/v1/expenses/date-range
Get expenses within a date range.

**Query Parameters:**
- `start_date`: YYYY-MM-DD
- `end_date`: YYYY-MM-DD

**Response:** `Expense[]`

**React Query Example:**
```typescript
const useExpensesByDateRange = (startDate: string, endDate: string) => {
  return useQuery({
    queryKey: ['expenses', 'date-range', startDate, endDate],
    queryFn: async () => {
      const token = localStorage.getItem('auth_token');
      const params = new URLSearchParams({ start_date: startDate, end_date: endDate });
      
      const response = await fetch(
        `http://localhost:8080/api/v1/expenses/date-range?${params}`,
        {
          headers: { 'Authorization': `Bearer ${token}` },
        }
      );
      
      if (!response.ok) throw new Error('Failed to fetch expenses');
      
      const data = await response.json();
      return z.array(expenseSchema).parse(data);
    },
    enabled: !!startDate && !!endDate,
  });
};
```

#### GET /api/v1/expenses/monthly
Get expenses for a specific month.

**Query Parameters:**
- `month`: 1-12
- `year`: YYYY

**Response:** `Expense[]`

#### GET /api/v1/expenses/summary
Get expense summary statistics.

**Query Parameters (optional):**
- `start_date`: YYYY-MM-DD
- `end_date`: YYYY-MM-DD

**Response:**
```typescript
{
  total: number;
  by_category: Record<string, number>;
  by_expense_type: {
    needs: number;
    wants: number;
    savings: number;
  };
}
```

#### GET /api/v1/expenses/category/:categoryId
Get expenses by category.

**Response:** `Expense[]`

#### GET /api/v1/expenses/bank-account/:accountId
Get expenses by bank account.

**Response:** `Expense[]`

#### GET /api/v1/expenses/:id
Get a specific expense by ID.

**Response:** `Expense`

#### POST /api/v1/expenses
Create a new expense.

**Request Body:**
```typescript
{
  category_id: string; // UUID
  amount: number;
  date: string; // YYYY-MM-DD
  bank_account_id: string; // UUID
  description?: string;
}
```

**Response (201):** `Expense`

**React Query Example:**
```typescript
const useCreateExpense = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: z.infer<typeof createExpenseSchema>) => {
      const validated = createExpenseSchema.parse(data);
      const token = localStorage.getItem('auth_token');
      
      const response = await fetch('http://localhost:8080/api/v1/expenses', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(validated),
      });
      
      if (!response.ok) throw new Error('Failed to create expense');
      
      const result = await response.json();
      return expenseSchema.parse(result);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
    },
  });
};
```

#### PATCH /api/v1/expenses/:id
Update an expense.

**Request Body:** Partial of create schema

**Response (200):** `Expense`

#### DELETE /api/v1/expenses/:id
Soft delete an expense.

**Response (200):** `{ message: string }`

#### POST /api/v1/expenses/:id/restore
Restore a soft-deleted expense.

**Response (200):** `Expense`

#### PATCH /api/v1/expenses/:id/status
Change expense status.

**Request Body:**
```typescript
{
  status: "active" | "deleted" | "suspended" | "archived" | "pending" | "locked";
}
```

**Response (200):** `Expense`

---

### Income Endpoints

All income endpoints require authentication.

Balance behavior
- Create: adds `amount` to the linked `bank_account_id` immediately.
- (Future) Patch/Delete/Restore: will mirror expense logic if added; currently only create adjusts balance.

#### GET /api/v1/incomes
Get all user's incomes.

**Response:** `Income[]`

#### GET /api/v1/incomes/active
Get only active incomes.

**Response:** `Income[]`

#### GET /api/v1/incomes/deleted
Get soft-deleted incomes.

**Response:** `Income[]`

#### GET /api/v1/incomes/:id
Get a specific income by ID.

**Response:** `Income`

#### POST /api/v1/incomes
Create a new income.

**Request Body:**
```typescript
{
  amount: number;
  bank_account_id: string; // UUID
  date: string; // YYYY-MM-DD
}
```

**Response (201):** `Income`

#### PATCH /api/v1/incomes/:id
Update an income.

**Request Body:** Partial of create schema

**Response (200):** `Income`

#### DELETE /api/v1/incomes/:id
Soft delete an income.

**Response (200):** `{ message: string }`

#### POST /api/v1/incomes/:id/restore
Restore a soft-deleted income.

**Response (200):** `Income`

#### PATCH /api/v1/incomes/:id/status
Change income status.

---

### Category (User Categories) Endpoints

All category endpoints require authentication.

#### GET /api/v1/user-categories
Get all user's categories.

**Response:** `Category[]`

**React Query Example:**
```typescript
const useCategories = () => {
  return useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const token = localStorage.getItem('auth_token');
      const response = await fetch('http://localhost:8080/api/v1/user-categories', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      
      if (!response.ok) throw new Error('Failed to fetch categories');
      
      const data = await response.json();
      return z.array(categorySchema).parse(data);
    },
  });
};
```

#### GET /api/v1/user-categories/grouped
Get categories grouped by expense type (needs/wants/savings).

**Response:**
```typescript
{
  needs: Category[];
  wants: Category[];
  savings: Category[];
}
```

**React Query Example:**
```typescript
const categoriesGroupedSchema = z.object({
  needs: z.array(categorySchema),
  wants: z.array(categorySchema),
  savings: z.array(categorySchema),
});

const useCategoriesGrouped = () => {
  return useQuery({
    queryKey: ['categories', 'grouped'],
    queryFn: async () => {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(
        'http://localhost:8080/api/v1/user-categories/grouped',
        {
          headers: { 'Authorization': `Bearer ${token}` },
        }
      );
      
      if (!response.ok) throw new Error('Failed to fetch grouped categories');
      
      const data = await response.json();
      return categoriesGroupedSchema.parse(data);
    },
  });
};
```

#### POST /api/v1/user-categories/defaults
Create default categories for the user (predefined set).

**Response (201):** `Category[]`

#### GET /api/v1/user-categories/stats
Get statistics about category usage.

**Response:**
```typescript
{
  total_categories: number;
  by_expense_type: {
    needs: number;
    wants: number;
    savings: number;
  };
  most_used: Category;
}
```

#### GET /api/v1/user-categories/expense-type/:expenseType
Get categories by expense type (needs, wants, or savings).

**Response:** `Category[]`

#### GET /api/v1/user-categories/expense-type-name/:expenseTypeName
Get categories by expense type name.

**Response:** `Category[]`

#### GET /api/v1/user-categories/:id
Get a specific category by ID.

**Response:** `Category`

#### POST /api/v1/user-categories
Create a new category.

**Request Body:**
```typescript
{
  name: string;
  expense_type: "needs" | "wants" | "savings";
}
```

**Response (201):** `Category`

**React Query Example:**
```typescript
const useCreateCategory = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: z.infer<typeof createCategorySchema>) => {
      const validated = createCategorySchema.parse(data);
      const token = localStorage.getItem('auth_token');
      
      const response = await fetch('http://localhost:8080/api/v1/user-categories', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(validated),
      });
      
      if (!response.ok) throw new Error('Failed to create category');
      
      const result = await response.json();
      return categorySchema.parse(result);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });
};
```

#### PUT /api/v1/user-categories/:id
Update a category (uses PUT, not PATCH).

**Request Body:** Partial of create schema

**Response (200):** `Category`

#### DELETE /api/v1/user-categories/:id
Soft delete a category.

**Response (200):** `{ message: string }`

#### POST /api/v1/user-categories/:id/restore
Restore a soft-deleted category.

**Response (200):** `Category`

---

### Goal Endpoints

All goal endpoints require authentication.

#### GET /api/v1/goals
Get all user's goals.

**Response:** `Goal[]`

#### GET /api/v1/goals/active
Get only active goals.

**Response:** `Goal[]`

#### GET /api/v1/goals/deleted
Get soft-deleted goals.

**Response:** `Goal[]`

#### GET /api/v1/goals/:id
Get a specific goal by ID.

**Response:** `Goal`

#### POST /api/v1/goals
Create a new goal.

**Request Body:**
```typescript
{
  name: string;
  total_amount: number;
  saved_amount?: number; // Default: 0
}
```

**Response (201):** `Goal`

**React Query Example:**
```typescript
const useCreateGoal = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: z.infer<typeof createGoalSchema>) => {
      const validated = createGoalSchema.parse(data);
      const token = localStorage.getItem('auth_token');
      
      const response = await fetch('http://localhost:8080/api/v1/goals', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(validated),
      });
      
      if (!response.ok) throw new Error('Failed to create goal');
      
      const result = await response.json();
      return goalSchema.parse(result);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] });
    },
  });
};
```

#### PATCH /api/v1/goals/:id
Update a goal.

**Request Body:** Partial of create schema

**Response (200):** `Goal`

#### DELETE /api/v1/goals/:id
Soft delete a goal.

**Response (200):** `{ message: string }`

#### POST /api/v1/goals/:id/restore
Restore a soft-deleted goal.

**Response (200):** `Goal`

#### PATCH /api/v1/goals/:id/status
Change goal status.

---

### Fixed Expense Endpoints

All fixed expense endpoints require authentication.

#### GET /api/v1/fixed-expenses
Get all user's fixed expenses.

**Query Parameters:**
- `include_deleted`: boolean (optional) - Include deleted fixed expenses

**Response:** `FixedExpense[]`

**React Query Example:**
```typescript
const useFixedExpenses = (includeDeleted: boolean = false) => {
  return useQuery({
    queryKey: ['fixed-expenses', includeDeleted],
    queryFn: async () => {
      const token = localStorage.getItem('auth_token');
      const params = new URLSearchParams();
      if (includeDeleted) params.append('include_deleted', 'true');
      
      const response = await fetch(
        `http://localhost:8080/api/v1/fixed-expenses?${params}`,
        {
          headers: { 'Authorization': `Bearer ${token}` },
        }
      );
      
      if (!response.ok) throw new Error('Failed to fetch fixed expenses');
      
      const data = await response.json();
      return z.array(fixedExpenseSchema).parse(data);
    },
  });
};
```

#### GET /api/v1/fixed-expenses/:id
Get a specific fixed expense by ID.

**Response:** `FixedExpense`

#### GET /api/v1/fixed-expenses/calendar
Get fixed expenses for a specific month/year. Returns recurring expenses with calculated due dates for the specified month.

**Query Parameters:**
- `year`: number (required) - Year (e.g., 2024)
- `month`: number (required) - Month (1-12)

**Response:** `FixedExpense[]`

**React Query Example:**
```typescript
const useFixedExpensesCalendar = (year: number, month: number) => {
  return useQuery({
    queryKey: ['fixed-expenses', 'calendar', year, month],
    queryFn: async () => {
      const token = localStorage.getItem('auth_token');
      const params = new URLSearchParams({
        year: year.toString(),
        month: month.toString(),
      });
      
      const response = await fetch(
        `http://localhost:8080/api/v1/fixed-expenses/calendar?${params}`,
        {
          headers: { 'Authorization': `Bearer ${token}` },
        }
      );
      
      if (!response.ok) throw new Error('Failed to fetch fixed expenses');
      
      const data = await response.json();
      return z.array(fixedExpenseSchema).parse(data.fixed_expenses);
    },
  });
};
```

#### POST /api/v1/fixed-expenses
Create a new fixed expense that automatically repeats monthly.

**Request Body:**
```typescript
{
  name: string;
  amount: number;
  due_date: string; // YYYY-MM-DD (day of month, e.g., "2024-01-15" = day 15)
  category_id?: string; // Optional: categorize as needs/wants/savings
  bank_account_id: string; // Required: bank account to deduct from
  is_recurring?: boolean; // Default: true
  recurrence_type?: "monthly" | "yearly"; // Default: "monthly"
}
```

**Response (201):** `FixedExpense`

**Example:**
```json
{
  "name": "Monthly Rent",
  "amount": 1200.00,
  "due_date": "2024-01-15",  // Repeats on the 15th every month
  "category_id": "uuid-here", // Optional: link to a category
  "bank_account_id": "uuid-here", // Required: bank account to deduct from
  "is_recurring": true,
  "recurrence_type": "monthly"
}
```

**React Query Example:**
```typescript
const useCreateFixedExpense = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: z.infer<typeof createFixedExpenseSchema>) => {
      const validated = createFixedExpenseSchema.parse(data);
      const token = localStorage.getItem('auth_token');
      
      const response = await fetch('http://localhost:8080/api/v1/fixed-expenses', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(validated),
      });
      
      if (!response.ok) throw new Error('Failed to create fixed expense');
      
      const result = await response.json();
      return fixedExpenseSchema.parse(result);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fixed-expenses'] });
    },
  });
};
```

#### PATCH /api/v1/fixed-expenses/:id
Update a fixed expense.

**Request Body:** Partial of create schema

**Response (200):** `FixedExpense`

#### DELETE /api/v1/fixed-expenses/:id
Soft delete a fixed expense.

**Response (204):** No Content

#### POST /api/v1/fixed-expenses/process
Process due fixed expenses (scheduled job endpoint).

**Description:** This endpoint processes all fixed expenses that are due today and creates expense records. It should be called by a cron job or scheduled task.

**Response (200):**
```typescript
{
  message: string;
  timestamp: string;
}
```

**Note:** This endpoint is designed for automated processing and should be called by a scheduled job, not manually.

---

### Reminder Endpoints

All reminder endpoints require authentication.

#### GET /api/v1/reminders
Get all user's reminders.

**Response:** `Reminder[]`

#### GET /api/v1/reminders/overdue
Get overdue reminders.

**Response:** `Reminder[]`

#### GET /api/v1/reminders/stats
Get reminder statistics.

**Response:**
```typescript
{
  total: number;
  completed: number;
  overdue: number;
  by_type: Record<string, number>;
}
```

#### GET /api/v1/reminders/:id
Get a specific reminder by ID.

**Response:** `Reminder`

#### POST /api/v1/reminders
Create a new reminder.

**Request Body:**
```typescript
{
  title: string;
  description?: string;
  due_date: string; // YYYY-MM-DD
  reminder_type: "bill" | "goal" | "budget_review";
}
```

**Response (201):** `Reminder`

**React Query Example:**
```typescript
const useCreateReminder = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: z.infer<typeof createReminderSchema>) => {
      const validated = createReminderSchema.parse(data);
      const token = localStorage.getItem('auth_token');
      
      const response = await fetch('http://localhost:8080/api/v1/reminders', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(validated),
      });
      
      if (!response.ok) throw new Error('Failed to create reminder');
      
      const result = await response.json();
      return reminderSchema.parse(result);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reminders'] });
    },
  });
};
```

#### PATCH /api/v1/reminders/:id
Update a reminder.

**Request Body:** Partial of create schema

**Response (200):** `Reminder`

#### POST /api/v1/reminders/:id/complete
Mark a reminder as completed.

**Response (200):** `Reminder`

#### DELETE /api/v1/reminders/:id
Delete a reminder.

**Response (200):** `{ message: string }`

---

### Setup Endpoints

#### POST /api/v1/setup/initialize
Initialize the expense system with default categories. **Public**

**Response (200):**
```typescript
{
  message: string;
  categories: Category[];
}
```

#### POST /api/v1/setup/user
Setup a new user with default data. **Public**

**Request Body:**
```typescript
{
  user_id: string; // UUID
}
```

**Response (201):**
```typescript
{
  message: string;
  categories: Category[];
}
```

#### GET /api/v1/setup/overview
Get system overview. **Public**

**Response (200):**
```typescript
{
  total_users: number;
  total_categories: number;
  system_ready: boolean;
}
```

---

## Error Handling

The API uses standard HTTP status codes:

- `200` OK - Successful GET/PATCH/PUT
- `201` Created - Successful POST
- `400` Bad Request - Invalid input
- `401` Unauthorized - Missing or invalid token
- `403` Forbidden - Valid token but insufficient permissions
- `404` Not Found - Resource doesn't exist
- `409` Conflict - Resource already exists (e.g., duplicate email)
- `500` Internal Server Error - Server error

### Error Response Format

```typescript
{
  error: string;
  message?: string;
}
```

### React Query Error Handling Example

```typescript
const useExpenses = () => {
  return useQuery({
    queryKey: ['expenses'],
    queryFn: async () => {
      const token = localStorage.getItem('auth_token');
      const response = await fetch('http://localhost:8080/api/v1/expenses', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      
      if (response.status === 401) {
        // Handle unauthorized - redirect to login
        throw new Error('Unauthorized - please login');
      }
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.error || 'Failed to fetch expenses');
      }
      
      const data = await response.json();
      return z.array(expenseSchema).parse(data);
    },
    retry: (failureCount, error) => {
      // Don't retry on 401 or 403
      if (error.message.includes('Unauthorized') || error.message.includes('Forbidden')) {
        return false;
      }
      return failureCount < 3;
    },
  });
};
```

---

## Complete React Query Setup Example

### Create an API Client

```typescript
// lib/api-client.ts
import { z } from 'zod';

const API_BASE_URL = 'http://localhost:8080/api/v1';

class ApiClient {
  private getToken(): string | null {
    return localStorage.getItem('auth_token');
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    schema?: z.ZodType<T>
  ): Promise<T> {
    const token = this.getToken();
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (token && !endpoint.includes('/auth/login') && !endpoint.includes('/auth/register')) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(errorData?.error || `HTTP ${response.status}`);
    }

    const data = await response.json();
    
    if (schema) {
      return schema.parse(data);
    }
    
    return data;
  }

  async get<T>(endpoint: string, schema?: z.ZodType<T>): Promise<T> {
    return this.request(endpoint, { method: 'GET' }, schema);
  }

  async post<T>(endpoint: string, body: unknown, schema?: z.ZodType<T>): Promise<T> {
    return this.request(
      endpoint,
      {
        method: 'POST',
        body: JSON.stringify(body),
      },
      schema
    );
  }

  async patch<T>(endpoint: string, body: unknown, schema?: z.ZodType<T>): Promise<T> {
    return this.request(
      endpoint,
      {
        method: 'PATCH',
        body: JSON.stringify(body),
      },
      schema
    );
  }

  async put<T>(endpoint: string, body: unknown, schema?: z.ZodType<T>): Promise<T> {
    return this.request(
      endpoint,
      {
        method: 'PUT',
        body: JSON.stringify(body),
      },
      schema
    );
  }

  async delete<T>(endpoint: string, schema?: z.ZodType<T>): Promise<T> {
    return this.request(endpoint, { method: 'DELETE' }, schema);
  }
}

export const apiClient = new ApiClient();
```

### Hooks for All Resources

```typescript
// hooks/use-expenses.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { expenseSchema, createExpenseSchema } from '@/schemas';
import { z } from 'zod';

export const useExpenses = () => {
  return useQuery({
    queryKey: ['expenses'],
    queryFn: () => apiClient.get('/expenses', z.array(expenseSchema)),
  });
};

export const useCreateExpense = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: z.infer<typeof createExpenseSchema>) =>
      apiClient.post('/expenses', data, expenseSchema),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
    },
  });
};

export const useUpdateExpense = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<z.infer<typeof createExpenseSchema>> }) =>
      apiClient.patch(`/expenses/${id}`, data, expenseSchema),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
    },
  });
};

export const useDeleteExpense = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) =>
      apiClient.delete(`/expenses/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
    },
  });
};
```

---

## CORS Configuration

The API has CORS enabled for:
- `http://localhost:3000`
- `http://172.16.0.2:3000`

If you need to run on a different origin, the backend will need to be updated.

---

## Best Practices

### 1. Token Management
```typescript
// Store token securely
const handleLoginSuccess = (token: string) => {
  localStorage.setItem('auth_token', token);
  // Or use a more secure method like httpOnly cookies
};

// Clear token on logout
const handleLogout = () => {
  localStorage.removeItem('auth_token');
  queryClient.clear(); // Clear all cached data
};
```

### 2. Query Key Management
Use consistent query key patterns:

```typescript
// Good patterns
['expenses'] - All expenses
['expenses', 'active'] - Active expenses
['expenses', expenseId] - Single expense
['expenses', 'date-range', startDate, endDate] - Filtered expenses
['bank-accounts'] - All bank accounts
['categories', 'grouped'] - Grouped categories
```

### 3. Optimistic Updates
```typescript
const useDeleteExpense = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => apiClient.delete(`/expenses/${id}`),
    
    // Optimistic update
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ['expenses'] });
      
      const previousExpenses = queryClient.getQueryData(['expenses']);
      
      queryClient.setQueryData(['expenses'], (old: Expense[]) =>
        old.filter((expense) => expense.id !== id)
      );
      
      return { previousExpenses };
    },
    
    // Rollback on error
    onError: (err, id, context) => {
      queryClient.setQueryData(['expenses'], context?.previousExpenses);
    },
    
    // Always refetch after error or success
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
    },
  });
};
```

### 4. Pagination (Future)
The API doesn't currently support pagination, but when it does:

```typescript
const useExpensesPaginated = (page: number, limit: number) => {
  return useQuery({
    queryKey: ['expenses', 'paginated', page, limit],
    queryFn: () => apiClient.get(`/expenses?page=${page}&limit=${limit}`),
    keepPreviousData: true,
  });
};
```

### 5. Data Validation
Always validate API responses with Zod:

```typescript
// This ensures type safety and catches API changes early
const data = await apiClient.get('/expenses', z.array(expenseSchema));
// TypeScript knows 'data' is Expense[]
```

---

## Common Patterns

### Fetching Related Data

```typescript
// Fetch expenses with full category and bank account details
const useExpenseWithDetails = (expenseId: string) => {
  const expense = useQuery({
    queryKey: ['expenses', expenseId],
    queryFn: () => apiClient.get(`/expenses/${expenseId}`, expenseSchema),
  });
  
  // The API returns nested objects, so you get category and bank_account automatically
  return expense;
};
```

### Dashboard Summary

```typescript
const useDashboardData = () => {
  const expenses = useExpenses();
  const incomes = useIncomes();
  const goals = useGoals();
  
  return {
    isLoading: expenses.isLoading || incomes.isLoading || goals.isLoading,
    data: {
      expenses: expenses.data,
      incomes: incomes.data,
      goals: goals.data,
    },
  };
};
```

---

## Testing

### Mock Data for Testing

```typescript
import { z } from 'zod';

export const mockUser: z.infer<typeof userSchema> = {
  id: '123e4567-e89b-12d3-a456-426614174000',
  email: 'test@example.com',
  name: 'Test User',
  monthly_income: 5000,
  status: 'active',
  last_login: null,
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
};

export const mockBankAccount: z.infer<typeof bankAccountSchema> = {
  id: '223e4567-e89b-12d3-a456-426614174000',
  user_id: mockUser.id,
  account_name: 'Main Account',
  balance: 1000.00,
  status: 'active',
  status_changed_at: null,
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
};
```

### Mocking API Calls with MSW

```typescript
import { rest } from 'msw';

export const handlers = [
  rest.get('http://localhost:8080/api/v1/expenses', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json([mockExpense])
    );
  }),
  
  rest.post('http://localhost:8080/api/v1/expenses', async (req, res, ctx) => {
    const body = await req.json();
    return res(
      ctx.status(201),
      ctx.json({ ...body, id: 'new-id', created_at: new Date().toISOString() })
    );
  }),
];
```

---

## Notes

1. **UUIDs**: All entity IDs are UUIDs, not integers
2. **Soft Deletes**: Most resources use soft deletes (status = 'deleted')
3. **Timestamps**: All entities have `created_at` and `updated_at`
4. **Relations**: The API returns nested objects for foreign key relationships
5. **Date Format**: Always use YYYY-MM-DD for date-only fields
6. **Decimal Precision**: Money values have 2 decimal places
7. **PUT vs PATCH**: Categories use PUT, everything else uses PATCH for updates
8. **Authentication**: Store tokens securely, include in all protected requests

---

## Quick Start Checklist

- [ ] Install dependencies: `@tanstack/react-query`, `zod`
- [ ] Create Zod schemas for all models
- [ ] Set up API client with token management
- [ ] Configure React Query with `QueryClient`
- [ ] Implement login/register flows
- [ ] Create custom hooks for each resource
- [ ] Add error handling and loading states
- [ ] Test with mock data first
- [ ] Implement optimistic updates for better UX
- [ ] Add proper TypeScript types from Zod schemas

---

## Complete Endpoint Reference

### Authentication Endpoints (Public)
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/v1/auth/register` | Register new user | No |
| POST | `/api/v1/auth/login` | Login user | No |
| POST | `/api/v1/auth/refresh` | Refresh access token | No |
| POST | `/api/v1/auth/logout` | Logout from current device | No |
| POST | `/api/v1/auth/logout-all` | Logout from all devices | Yes |
| GET | `/api/v1/auth/me` | Get current user | Yes |

### Bank Account Endpoints
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/v1/bank-accounts` | Get all bank accounts | Yes |
| GET | `/api/v1/bank-accounts/active` | Get active accounts | Yes |
| GET | `/api/v1/bank-accounts/deleted` | Get deleted accounts | Yes |
| GET | `/api/v1/bank-accounts/:id` | Get account by ID | Yes |
| POST | `/api/v1/bank-accounts` | Create account | Yes |
| PATCH | `/api/v1/bank-accounts/:id` | Update account | Yes |
| DELETE | `/api/v1/bank-accounts/:id` | Soft delete account | Yes |
| POST | `/api/v1/bank-accounts/:id/restore` | Restore account | Yes |
| PATCH | `/api/v1/bank-accounts/:id/status` | Change account status | Yes |

### Expense Endpoints
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/v1/expenses` | Get all expenses | Yes |
| GET | `/api/v1/expenses/active` | Get active expenses | Yes |
| GET | `/api/v1/expenses/deleted` | Get deleted expenses | Yes |
| GET | `/api/v1/expenses/date-range` | Get expenses by date range | Yes |
| GET | `/api/v1/expenses/monthly` | Get expenses by month | Yes |
| GET | `/api/v1/expenses/summary` | Get expense summary | Yes |
| GET | `/api/v1/expenses/category/:categoryId` | Get expenses by category | Yes |
| GET | `/api/v1/expenses/bank-account/:accountId` | Get expenses by account | Yes |
| GET | `/api/v1/expenses/:id` | Get expense by ID | Yes |
| POST | `/api/v1/expenses` | Create expense | Yes |
| PATCH | `/api/v1/expenses/:id` | Update expense | Yes |
| DELETE | `/api/v1/expenses/:id` | Soft delete expense | Yes |
| POST | `/api/v1/expenses/:id/restore` | Restore expense | Yes |
| PATCH | `/api/v1/expenses/:id/status` | Change expense status | Yes |

### Income Endpoints
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/v1/incomes` | Get all incomes | Yes |
| GET | `/api/v1/incomes/active` | Get active incomes | Yes |
| GET | `/api/v1/incomes/deleted` | Get deleted incomes | Yes |
| GET | `/api/v1/incomes/:id` | Get income by ID | Yes |
| POST | `/api/v1/incomes` | Create income | Yes |
| PATCH | `/api/v1/incomes/:id` | Update income | Yes |
| DELETE | `/api/v1/incomes/:id` | Soft delete income | Yes |
| POST | `/api/v1/incomes/:id/restore` | Restore income | Yes |
| PATCH | `/api/v1/incomes/:id/status` | Change income status | Yes |

<!-- Budget and Budget History sections removed: functionality deprecated -->

### Category (User Categories) Endpoints
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/v1/user-categories` | Get all categories | Yes |
| GET | `/api/v1/user-categories/grouped` | Get categories grouped by type | Yes |
| POST | `/api/v1/user-categories/defaults` | Create default categories | Yes |
| GET | `/api/v1/user-categories/stats` | Get category statistics | Yes |
| GET | `/api/v1/user-categories/expense-type/:type` | Get categories by type | Yes |
| GET | `/api/v1/user-categories/:id` | Get category by ID | Yes |
| POST | `/api/v1/user-categories` | Create category | Yes |
| PUT | `/api/v1/user-categories/:id` | Update category | Yes |
| DELETE | `/api/v1/user-categories/:id` | Soft delete category | Yes |
| POST | `/api/v1/user-categories/:id/restore` | Restore category | Yes |

### Goal Endpoints
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/v1/goals` | Get all goals | Yes |
| GET | `/api/v1/goals/active` | Get active goals | Yes |
| GET | `/api/v1/goals/deleted` | Get deleted goals | Yes |
| GET | `/api/v1/goals/:id` | Get goal by ID | Yes |
| POST | `/api/v1/goals` | Create goal | Yes |
| PATCH | `/api/v1/goals/:id` | Update goal | Yes |
| DELETE | `/api/v1/goals/:id` | Soft delete goal | Yes |
| POST | `/api/v1/goals/:id/restore` | Restore goal | Yes |
| PATCH | `/api/v1/goals/:id/status` | Change goal status | Yes |

### Fixed Expense Endpoints
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/v1/fixed-expenses` | Get all fixed expenses | Yes |
| GET | `/api/v1/fixed-expenses/calendar` | Get fixed expenses for month | Yes |
| GET | `/api/v1/fixed-expenses/:id` | Get fixed expense by ID | Yes |
| POST | `/api/v1/fixed-expenses` | Create fixed expense | Yes |
| PATCH | `/api/v1/fixed-expenses/:id` | Update fixed expense | Yes |
| DELETE | `/api/v1/fixed-expenses/:id` | Soft delete fixed expense | Yes |

### Reminder Endpoints
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/v1/reminders` | Get all reminders | Yes |
| GET | `/api/v1/reminders/overdue` | Get overdue reminders | Yes |
| GET | `/api/v1/reminders/stats` | Get reminder statistics | Yes |
| GET | `/api/v1/reminders/:id` | Get reminder by ID | Yes |
| POST | `/api/v1/reminders` | Create reminder | Yes |
| PATCH | `/api/v1/reminders/:id` | Update reminder | Yes |
| POST | `/api/v1/reminders/:id/complete` | Mark reminder as complete | Yes |
| DELETE | `/api/v1/reminders/:id` | Delete reminder | Yes |

<!-- Transfer section removed: functionality deprecated -->

### Setup Endpoints (Public)
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/v1/setup/initialize` | Initialize system | No |
| POST | `/api/v1/setup/user` | Setup new user | No |
| GET | `/api/v1/setup/overview` | Get system overview | No |

---

## Model Relationships

Understanding how models relate to each other is crucial for building effective queries:

```
User
├── BankAccounts (1-to-many)
│   └── Used in: Expenses, Incomes, FixedExpenses
├── Categories (1-to-many)
│   └── Used in: Expenses, FixedExpenses
├── Expenses (1-to-many)
│   ├── Belongs to: Category, BankAccount
│   └── Categorized by: expense_type (needs/wants/savings)
├── Incomes (1-to-many)
│   └── Belongs to: BankAccount
├── Goals (1-to-many)
├── FixedExpenses (1-to-many)
│   ├── Belongs to: BankAccount, Category (optional)
│   └── Auto-processes to: Expenses
└── Reminders (1-to-many)
```

### Important Relationships

1. **Expense → Category**: Every expense must have a category
2. **Expense → BankAccount**: Every expense must be linked to a bank account
3. **Income → BankAccount**: Every income must be linked to a bank account
4. **FixedExpense → BankAccount**: Every fixed expense must be linked to a bank account
5. **FixedExpense → Category**: Optional categorization for fixed expenses
6. **Category → ExpenseType**: Categories are grouped by expense type (needs/wants/savings)
7. **FixedExpense → Expense**: Fixed expenses automatically create expense records when processed
8. **Goal**: Standalone entity with progress calculation

---

## Implementation Tips for AI Agents

### 1. Initial Setup Flow
```typescript
// 1. Register/Login
const { token } = await register({ email, password, name });

// 2. Setup user with default categories (optional)
await setupUser();

// 3. Create bank accounts
await createBankAccount({ account_name: 'Main Account', balance: 0 });

// 4. Start tracking expenses and income
await createExpense({
  category_id: needsCategoryId,
  amount: 50,
  date: '2024-01-15',
  bank_account_id: mainAccountId,
  description: 'Groceries'
});

await createIncome({
  amount: 5000,
  bank_account_id: mainAccountId,
  date: '2024-01-01'
});
```

### 2. Dashboard Data Fetching
```typescript
// Parallel fetch all dashboard data
const dashboardData = useQueries({
  queries: [
    { queryKey: ['expenses', 'active'], queryFn: getActiveExpenses },
    { queryKey: ['incomes', 'active'], queryFn: getActiveIncomes },
    { queryKey: ['goals', 'active'], queryFn: getActiveGoals },
    { queryKey: ['reminders', 'overdue'], queryFn: getOverdueReminders },
    { queryKey: ['bank-accounts', 'active'], queryFn: getActiveBankAccounts },
    { queryKey: ['fixed-expenses', 'active'], queryFn: getActiveFixedExpenses },
  ]
});
```

### 3. Expense Tracking Flow
```typescript
// 1. Get categories (grouped by type)
const { needs, wants, savings } = await getCategoriesGrouped();

// 2. Get active bank accounts
const accounts = await getActiveBankAccounts();

// 3. Create expense with selected category and account
await createExpense({
  category_id: selectedCategory.id,
  bank_account_id: selectedAccount.id,
  amount: expenseAmount,
  date: today,
  description: description
});

// 4. Optionally get expense summary for the month
const summary = await getExpenseSummary(startDate, endDate);
```

### 4. Fixed Expense Management Flow
```typescript
// 1. Create fixed expense with bank account
const fixedExpense = await createFixedExpense({
  name: 'Monthly Rent',
  amount: 1200,
  due_date: '2024-01-15',
  bank_account_id: mainAccountId,
  category_id: needsCategoryId,
  is_recurring: true,
  recurrence_type: 'monthly'
});

// 2. Fixed expenses automatically process on due dates
// The system will create expense records and deduct from bank account

// 3. View upcoming fixed expenses
const upcoming = await getUpcomingFixedExpenses(userId, 30); // Next 30 days

// 4. Manual processing (if needed)
await processFixedExpenses(); // Calls the scheduled job endpoint
```

### 5. Goal Progress Tracking
```typescript
// 1. Create goal
const goal = await createGoal({
  name: 'Emergency Fund',
  total_amount: 10000,
  saved_amount: 0
});

// 2. Update progress
await updateGoal(goal.id, {
  saved_amount: 2500
});

// 3. The API automatically calculates progress_percent
// Result: { ..., progress_percent: 25 }
```

### 6. Error Handling Pattern
```typescript
try {
  const expense = await createExpense(data);
} catch (error) {
  if (error.message.includes('not found')) {
    // Category or bank account doesn't exist
    showError('Please select a valid category and account');
  } else if (error.message.includes('not active')) {
    // Account or category is not active
    showError('Cannot use inactive account or category');
  } else {
    showError('Failed to create expense');
  }
}
```

### 7. Soft Delete Pattern
```typescript
// Delete (soft delete)
await deleteExpense(expenseId);
// Status changes to 'deleted', but record remains

// Get all including deleted
const allExpenses = await getExpenses({ includeDeleted: true });

// Restore deleted item
await restoreExpense(expenseId);
// Status changes back to 'active'
```

---

## Support

For API issues or questions, refer to:
- **Swagger/Scalar documentation**: `http://localhost:8080/reference`
- **Health check**: `http://localhost:8080/health`
- **Swagger JSON**: `http://localhost:8080/docs/swagger.json`

---

## Summary

This comprehensive guide provides everything needed to build a complete frontend integration with Fluxio API:

✅ **Complete endpoint documentation** with request/response examples  
✅ **Zod schemas** for all models with TypeScript type safety  
✅ **React Query examples** for all major operations  
✅ **Authentication flow** with JWT and refresh tokens  
✅ **Error handling patterns** for common scenarios  
✅ **Best practices** for querying, caching, and optimistic updates  
✅ **Real-world implementation flows** for common use cases  
✅ **Complete endpoint reference table** for quick lookup  
✅ **Model relationship diagram** for understanding data structure  

The API follows REST principles, uses soft deletes for data safety, and provides comprehensive query options for filtering and pagination. All responses include proper HTTP status codes and error messages for debugging.

