export type UserRole = 'CUSTOMER' | 'SELLER';

export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
}

export interface Menu {
  id: number;
  name: string;
  description?: string;
  price: number;
  imageUrl?: string;
  isAvailable: boolean;
  category?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CartItem {
  menu: Menu;
  quantity: number;
}

export type PaymentStatus = 'PENDING' | 'PAID' | 'REJECTED' | 'CANCELLED';

export type OrderStatus =
  | 'WAITING_PAYMENT'
  | 'CONFIRMED'
  | 'PREPARING'
  | 'READY'
  | 'COMPLETED'
  | 'CANCELLED';

export type QueueStatus = 'WAITING' | 'IN_PROGRESS' | 'READY' | 'COMPLETED';

export interface OrderItem {
  id: number;
  orderId: number;
  menuId: number;
  quantity: number;
  priceAtOrder: number;
  subtotal: number;
  menu?: Menu;
}

export interface Payment {
  id: number;
  orderId: number;
  method: string;
  amount: number;
  status: PaymentStatus;
  proofUrl?: string;
  confirmedBy?: number;
  createdAt: string;
  updatedAt?: string;
}

export interface Queue {
  id: number;
  orderId: number;
  queueNumber: string;
  status: QueueStatus;
  createdAt: string;
  order?: Order;
}

export interface Order {
  id: number;
  userId: number;
  orderNumber: string;
  totalAmount: number;
  status: OrderStatus;
  createdAt: string;
  updatedAt?: string;
  items: OrderItem[];
  payment?: Payment;
  queue?: Queue;
  user?: {
    id: number;
    name: string;
    email: string;
  };
}

export interface QueueResponse {
  queues: Queue[];
  currentProcessingNumber: string;
  totalWaiting: number;
  totalInProgress: number;
  totalReady: number;
}
