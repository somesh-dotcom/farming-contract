export type UserRole = 'FARMER' | 'BUYER' | 'ADMIN'
export type ContractStatus = 'DRAFT' | 'PENDING' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED'
export type TransactionStatus = 'PENDING' | 'COMPLETED' | 'FAILED'
export type PaymentType = 'ADVANCE' | 'PARTIAL' | 'FINAL' | 'REFUND' | 'OTHER'
export type ProductCategory = 'GRAINS' | 'VEGETABLES' | 'FRUITS' | 'SPICES' | 'PULSES' | 'OTHERS'

export interface User {
  id: string
  email: string
  name: string
  role: UserRole
  phone?: string
  address?: string
  city?: string
  state?: string
  pincode?: string
  createdAt: string
  originalRole?: UserRole | null
}

export interface Product {
  id: string
  name: string
  category: ProductCategory
  description?: string
  unit: string
  createdAt: string
}

export interface Contract {
  id: string
  farmerId: string
  buyerId: string
  productId: string
  quantity: number
  unit: string
  pricePerUnit: number
  totalValue: number
  startDate: string
  deliveryDate: string
  status: ContractStatus
  terms?: string
  location?: string
  createdAt: string
  updatedAt: string
  farmer?: User
  buyer?: User
  product?: Product
  transactions?: Transaction[]
}

export interface MarketPrice {
  id: string
  productId: string
  price: number
  unit: string
  location?: string
  date: string
  createdAt: string
  product?: Product
}

export interface Transaction {
  id: string
  contractId: string
  userId: string
  amount: number
  status: TransactionStatus
  paymentMethod?: string
  paymentType?: PaymentType
  transactionDate: string
  createdAt: string
  contract?: Contract
  user?: User
}

