// ─── Domain Types (mirror backend types.ts) ────────────────────────────────

export interface User {
    UserId: number;
    RoleId: number;
    FirstName: string;
    LastName: string;
    Phone: string | null;
    Email: string;
    IsActive: boolean;
    IsDeleted: boolean;
    ProfilePicture: string | null;
    CreatedAt: string;
    UpdatedAt: string | null;
    LastLogin: string | null;
    RoleName?: string;
}

export interface Service {
    ServiceId: number;
    CategoryId: number;
    Name: string;
    Description: string | null;
    DurationMinutes: number;
    Price: number;
    DepositAmount: number | null;
    IsActive: boolean;
    IsDeleted: boolean;
    ImageUrl: string | null;
}

export interface Booking {
    BookingId: number;
    CustomerId: number;
    ServiceId: number;
    StaffId: number | null;
    StatusId: number;
    BookingDate: string;
    StartTime: string;
    EndTime: string;
    Notes: string | null;
    TotalPrice: number;
    DepositPaid: number;
    CreatedAt: string;
    UpdatedAt: string | null;
    CancelledAt: string | null;
    CancellationReason: string | null;
}



export interface Payment {
    PaymentId: number;
    BookingId: number;
    Amount: number;
    MethodId: number;
    StatusId: number;
    TransactionRef: string | null;
    PaidAt: string | null;
    RefundedAt: string | null;
    RefundAmount: number | null;
    Notes: string | null;
    CreatedAt: string;
}

export interface Review {
    ReviewId: number;
    BookingId: number;
    CustomerId: number;
    StaffId: number | null;
    ServiceId: number;
    Rating: number;
    Comment: string | null;
    IsApproved: boolean;
    IsDeleted: boolean;
    CreatedAt: string;
    UpdatedAt: string | null;
}

export interface Notification {
    NotificationId: number;
    UserId: number;
    TypeId: number;
    Title: string;
    Message: string;
    IsRead: boolean;
    IsSent: boolean;
    SentAt: string | null;
    Channel: string;
    RelatedEntityId: number | null;
    RelatedEntityType: string | null;
    CreatedAt: string;
}

export interface SupportTicket {
    TicketId: number;
    CustomerId: number;
    Subject: string;
    Description: string;
    StatusId: number;
    Priority: string;
    AssignedToId: number | null;
    CreatedAt: string;
    UpdatedAt: string | null;
    ClosedAt: string | null;
}

export interface StaffAvailability {
    AvailabilityId: number;
    StaffId: number;
    DayOfWeek: number;
    StartTime: string;
    EndTime: string;
    IsAvailable: boolean;
    EffectiveFrom: string | null;
    EffectiveTo: string | null;
}

// ─── Auth Types ─────────────────────────────────────────────────────────────

export interface AuthState {
    user: AuthUser | null;
    token: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
}

export interface AuthUser {
    userId: number;
    email: string;
    firstName: string;
    lastName: string;
    roleId: number;
    roleName?: string;
}

export interface LoginCredentials {
    email: string;
    password: string;
}

export interface RegisterData {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    phone?: string;
}

export interface LoginResponse {
    message: string;
    token: string;
    user: User;  
}

// ─── API Types ───────────────────────────────────────────────────────────────

export interface ApiResponse<T> {
    data?: T;
    message?: string;
    error?: string;
}

export interface CreateBookingData {
    customerId: number;
    serviceId: number;
    staffId?: number | null;
    bookingDate: string;
    startTime: string;
    endTime: string;
    notes?: string | null;
    totalPrice: number;
    depositPaid?: number;
}
export interface CreatePaymentData {
    bookingId: number;
    amount: number;
    methodId: number;
}

export interface CreateReviewData {
    bookingId: number;
    serviceId: number;
    staffId?: number;
    rating: number;
    comment?: string;
}

export interface CreateTicketData {
    subject: string;
    description: string;
    priority?: string;
}

// ─── UI Types ────────────────────────────────────────────────────────────────

export type Theme = 'light' | 'dark';

export type UserRole = 'Admin' | 'Manager' | 'Staff' | 'Customer';

export const ROLE_IDS: Record<number, UserRole> = {
    1: 'Admin',
    2: 'Manager',
    3: 'Staff',
    6: 'Customer',
};

export const BOOKING_STATUS: Record<number, string> = {
    1: 'Pending',
    2: 'Confirmed',
    3: 'Completed',
    4: 'Cancelled',
    5: 'No Show',
};

export const PAYMENT_STATUS: Record<number, string> = {
    1: 'Pending',
    2: 'Paid',
    3: 'Refunded',
    4: 'Failed',
};
