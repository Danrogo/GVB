export interface User {
    UserId: number;
    RoleId: number;
    FirstName: string;
    LastName: string;
    Phone: string | null;
    Email: string;
    PasswordHash: string;
    IsActive: boolean;
    IsDeleted: boolean;
    ProfilePicture: string | null;
    CreatedAt: Date;
    UpdatedAt: Date | null;
    LastLogin: Date | null;
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
    BookingDate: Date;
    StartTime: string;
    EndTime: string;
    Notes: string | null;
    TotalPrice: number;
    DepositPaid: number;
    CreatedAt: Date;
    UpdatedAt: Date | null;
    CancelledAt: Date | null;
    CancellationReason: string | null;
}

export interface Payment {
    PaymentId: number;
    BookingId: number;
    Amount: number;
    MethodId: number;
    StatusId: number;
    TransactionRef: string | null;
    PaidAt: Date | null;
    RefundedAt: Date | null;
    RefundAmount: number | null;
    Notes: string | null;
    CreatedAt: Date;
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
    CreatedAt: Date;
    UpdatedAt: Date | null;
}

export interface Notification {
    NotificationId: number;
    UserId: number;
    TypeId: number;
    Title: string;
    Message: string;
    IsRead: boolean;
    IsSent: boolean;
    SentAt: Date | null;
    Channel: string;
    RelatedEntityId: number | null;
    RelatedEntityType: string | null;
    CreatedAt: Date;
}

export interface SupportTicket {
    TicketId: number;
    CustomerId: number;
    Subject: string;
    Description: string;
    StatusId: number;
    Priority: string;
    AssignedToId: number | null;
    CreatedAt: Date;
    UpdatedAt: Date | null;
    ClosedAt: Date | null;
}

export interface StaffAvailability {
    AvailabilityId: number;
    StaffId: number;
    DayOfWeek: number;
    StartTime: string;
    EndTime: string;
    IsAvailable: boolean;
    EffectiveFrom: Date | null;
    EffectiveTo: Date | null;
}