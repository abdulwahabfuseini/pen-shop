export interface ToastNotificationProps {
  [key: string]: unknown;
}

export interface Variant {
  id: string;
  penId: string;
  inkColor: string;
  tipSize: string;
  stock: number;
  price: number | string; // Allow price to be a number
}

export interface PenData {
  id: string;
  name: string;
  description: string;
  price: number;
  images: string[];
}

// Type for creating a new Pen (omitting the auto-generated ID)
export type CreatePenInput = Omit<PenData, 'id' | 'variants'> & {
  variants?: Omit<Variant, 'id' | 'penId'>[];
};

// Type for updating a Pen (everything is optional except ID)
export type UpdatePenInput = Partial<CreatePenInput>;


export interface OrderItem {
  id: string;
  productName: string;
  productImage: string;
  quantity: number;
  totalPrice: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  orderStatus: "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED";
  paymentStatus: "PAID" | "PENDING" | "FAILED";
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  totalAmount: number;
  country?: string;
  houseAddress?: string;
  streetName?: string;
  town?: string;
  state?: string;
  zipCode?: string;
  createdAt: string;
  items: OrderItem[];
}


export interface IUser {
  id: string;
  username: string | null | undefined;
  lastName?: string | null;
  firstName?: string | null;
  name?: string | null;
  email?: string | null;
  image?: string | null;
  password?: string | null;
  passwordChanged?: boolean;
}