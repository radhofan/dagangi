export type Customer = {
  id: string;
  name: string;
  phone?: string | null;
  address?: string | null;
  note?: string | null;
  created_at: string;
  updated_at: string;
};

export type Debt = {
  id: string;
  customer_id: string;
  sale_id?: string | null;
  amount_total: number;
  amount_paid: number;
  status: 'UNPAID' | 'PARTIAL' | 'PAID';
  due_date?: string | null;
  note?: string | null;
  created_at: string;
  updated_at: string;
  customer_name?: string;
};

export type DebtPayment = {
  id: string;
  debt_id: string;
  payment_date: string;
  amount: number;
  note?: string | null;
  created_at: string;
};
