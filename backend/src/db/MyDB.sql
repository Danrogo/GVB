-- =============================================
-- Beauty Salon Management System - Database Schema
-- MSSQL / SQL Server
-- Last updated: 2025
-- =============================================

CREATE DATABASE GoodVibesBeauty;
GO

USE GoodVibesBeauty;
GO

-- =============================================
-- 1. Users & Roles
-- =============================================

CREATE TABLE Roles
(
    RoleId      INT IDENTITY(1,1) PRIMARY KEY,
    Name        NVARCHAR(50) NOT NULL UNIQUE,
    Description NVARCHAR(200) NULL,
    CreatedAt   DATETIME2 DEFAULT GETUTCDATE(),
    UpdatedAt   DATETIME2 NULL
);

CREATE TABLE Users
(
    UserId          INT IDENTITY(1,1) PRIMARY KEY,
    RoleId          INT NOT NULL,
    FirstName       NVARCHAR(60) NOT NULL,
    LastName        NVARCHAR(60) NOT NULL,
    Phone           NVARCHAR(20) NULL,
    Email           NVARCHAR(120) NOT NULL UNIQUE,
    PasswordHash    NVARCHAR(256) NOT NULL,
    IsActive        BIT DEFAULT 1,
    IsDeleted       BIT DEFAULT 0,
    ProfilePicture  NVARCHAR(500) NULL,
    CreatedAt       DATETIME2 DEFAULT GETUTCDATE(),
    UpdatedAt       DATETIME2 NULL,
    LastLogin       DATETIME2 NULL,

    CONSTRAINT FK_Users_Roles FOREIGN KEY (RoleId) 
        REFERENCES Roles(RoleId)
);

CREATE INDEX IX_Users_Email ON Users(Email);
CREATE INDEX IX_Users_RoleId ON Users(RoleId);
CREATE INDEX IX_Users_IsActive ON Users(IsActive);

-- =============================================
-- 2. Services (Catalog)
-- =============================================

CREATE TABLE ServiceCategories
(
    CategoryId    INT IDENTITY(1,1) PRIMARY KEY,
    Name          NVARCHAR(80) NOT NULL,
    Description   NVARCHAR(300) NULL,
    DisplayOrder  INT DEFAULT 0,
    IsActive      BIT DEFAULT 1
);

CREATE TABLE Services
(
    ServiceId       INT IDENTITY(1,1) PRIMARY KEY,
    CategoryId      INT NOT NULL,
    Name            NVARCHAR(120) NOT NULL,
    Description     NVARCHAR(1000) NULL,
    DurationMinutes INT NOT NULL,
    Price           DECIMAL(12,2) NOT NULL,
    DepositAmount   DECIMAL(12,2) NULL,
    IsActive        BIT DEFAULT 1,
    IsDeleted       BIT DEFAULT 0,
    ImageUrl        NVARCHAR(500) NULL,

    CONSTRAINT FK_Services_Categories FOREIGN KEY (CategoryId) 
        REFERENCES ServiceCategories(CategoryId)
);

CREATE INDEX IX_Services_CategoryId ON Services(CategoryId);
CREATE INDEX IX_Services_IsActive ON Services(IsActive);

-- =============================================
-- 3. Staff - Services they can perform
-- =============================================

CREATE TABLE StaffServices
(
    StaffId     INT NOT NULL,
    ServiceId   INT NOT NULL,
    CreatedAt   DATETIME2 DEFAULT GETUTCDATE(),

    CONSTRAINT PK_StaffServices PRIMARY KEY (StaffId, ServiceId),
    CONSTRAINT FK_StaffServices_Users FOREIGN KEY (StaffId) 
        REFERENCES Users(UserId),
    CONSTRAINT FK_StaffServices_Services FOREIGN KEY (ServiceId) 
        REFERENCES Services(ServiceId)
);

-- =============================================
-- 4. Staff Availability / Working Hours
-- =============================================

CREATE TABLE StaffAvailability
(
    AvailabilityId  INT IDENTITY(1,1) PRIMARY KEY,
    StaffId         INT NOT NULL,
    DayOfWeek       INT NOT NULL,                    -- 0=Sunday, 1=Monday, ..., 6=Saturday
    StartTime       TIME NOT NULL,
    EndTime         TIME NOT NULL,
    IsAvailable     BIT DEFAULT 1,
    EffectiveFrom   DATE NULL,                       -- for future schedule changes
    EffectiveTo     DATE NULL,

    CONSTRAINT FK_Availability_Staff FOREIGN KEY (StaffId) 
        REFERENCES Users(UserId)
);

CREATE INDEX IX_Availability_StaffId ON StaffAvailability(StaffId);
CREATE INDEX IX_Availability_DayOfWeek ON StaffAvailability(DayOfWeek);

-- Staff time off / exceptions
CREATE TABLE StaffTimeOff
(
    TimeOffId       INT IDENTITY(1,1) PRIMARY KEY,
    StaffId         INT NOT NULL,
    StartDate       DATE NOT NULL,
    EndDate         DATE NOT NULL,
    Reason          NVARCHAR(200) NULL,
    IsApproved      BIT DEFAULT 0,
    CreatedAt       DATETIME2 DEFAULT GETUTCDATE(),

    CONSTRAINT FK_TimeOff_Staff FOREIGN KEY (StaffId) 
        REFERENCES Users(UserId)
);

-- =============================================
-- 5. Bookings / Appointments
-- =============================================

CREATE TABLE BookingStatuses
(
    StatusId    INT IDENTITY(1,1) PRIMARY KEY,
    Name        NVARCHAR(40) NOT NULL UNIQUE,
    Description NVARCHAR(150) NULL
);

CREATE TABLE Bookings
(
    BookingId       INT IDENTITY(1,1) PRIMARY KEY,
    CustomerId      INT NOT NULL,
    ServiceId       INT NOT NULL,
    StaffId         INT NULL,
    StatusId        INT NOT NULL,
    BookingDate     DATE NOT NULL,
    StartTime       TIME NOT NULL,
    EndTime         TIME NOT NULL,
    Notes           NVARCHAR(1000) NULL,
    TotalPrice      DECIMAL(12,2) NOT NULL,
    DepositPaid     DECIMAL(12,2) DEFAULT 0,
    CreatedAt       DATETIME2 DEFAULT GETUTCDATE(),
    UpdatedAt       DATETIME2 NULL,
    CancelledAt     DATETIME2 NULL,
    CancellationReason NVARCHAR(500) NULL,

    CONSTRAINT FK_Bookings_Customers FOREIGN KEY (CustomerId) 
        REFERENCES Users(UserId),
    CONSTRAINT FK_Bookings_Services FOREIGN KEY (ServiceId) 
        REFERENCES Services(ServiceId),
    CONSTRAINT FK_Bookings_Staff FOREIGN KEY (StaffId) 
        REFERENCES Users(UserId),
    CONSTRAINT FK_Bookings_Statuses FOREIGN KEY (StatusId) 
        REFERENCES BookingStatuses(StatusId)
);

CREATE INDEX IX_Bookings_BookingDate ON Bookings(BookingDate);
CREATE INDEX IX_Bookings_StatusId ON Bookings(StatusId);
CREATE INDEX IX_Bookings_CustomerId ON Bookings(CustomerId);
CREATE INDEX IX_Bookings_StaffId ON Bookings(StaffId);

-- =============================================
-- 6. Payments
-- =============================================

CREATE TABLE PaymentMethods
(
    MethodId    INT IDENTITY(1,1) PRIMARY KEY,
    Name        NVARCHAR(50) NOT NULL UNIQUE,        -- Cash, Card, M-Pesa, Bank Transfer
    IsActive    BIT DEFAULT 1
);

CREATE TABLE PaymentStatuses
(
    StatusId    INT IDENTITY(1,1) PRIMARY KEY,
    Name        NVARCHAR(40) NOT NULL UNIQUE         -- Pending, Completed, Failed, Refunded
);

CREATE TABLE Payments
(
    PaymentId       INT IDENTITY(1,1) PRIMARY KEY,
    BookingId       INT NOT NULL,
    Amount          DECIMAL(12,2) NOT NULL,
    MethodId        INT NOT NULL,
    StatusId        INT NOT NULL,
    TransactionRef  NVARCHAR(100) NULL,              -- external payment reference
    PaidAt          DATETIME2 NULL,
    RefundedAt      DATETIME2 NULL,
    RefundAmount    DECIMAL(12,2) NULL,
    Notes           NVARCHAR(500) NULL,
    CreatedAt       DATETIME2 DEFAULT GETUTCDATE(),

    CONSTRAINT FK_Payments_Bookings FOREIGN KEY (BookingId) 
        REFERENCES Bookings(BookingId),
    CONSTRAINT FK_Payments_Methods FOREIGN KEY (MethodId) 
        REFERENCES PaymentMethods(MethodId),
    CONSTRAINT FK_Payments_Statuses FOREIGN KEY (StatusId) 
        REFERENCES PaymentStatuses(StatusId)
);

CREATE INDEX IX_Payments_BookingId ON Payments(BookingId);
CREATE INDEX IX_Payments_StatusId ON Payments(StatusId);

-- =============================================
-- 7. Reviews & Ratings
-- =============================================

CREATE TABLE Reviews
(
    ReviewId        INT IDENTITY(1,1) PRIMARY KEY,
    BookingId       INT NOT NULL,
    CustomerId      INT NOT NULL,
    StaffId         INT NULL,                        -- optional: rate specific staff
    ServiceId       INT NOT NULL,
    Rating          INT NOT NULL,                    -- 1-5 stars
    Comment         NVARCHAR(1000) NULL,
    IsApproved      BIT DEFAULT 0,                   -- moderation
    IsDeleted       BIT DEFAULT 0,
    CreatedAt       DATETIME2 DEFAULT GETUTCDATE(),
    UpdatedAt       DATETIME2 NULL,

    CONSTRAINT FK_Reviews_Bookings FOREIGN KEY (BookingId) 
        REFERENCES Bookings(BookingId),
    CONSTRAINT FK_Reviews_Customers FOREIGN KEY (CustomerId) 
        REFERENCES Users(UserId),
    CONSTRAINT FK_Reviews_Staff FOREIGN KEY (StaffId) 
        REFERENCES Users(UserId),
    CONSTRAINT FK_Reviews_Services FOREIGN KEY (ServiceId) 
        REFERENCES Services(ServiceId),
    CONSTRAINT CHK_Rating CHECK (Rating BETWEEN 1 AND 5)
);

CREATE INDEX IX_Reviews_ServiceId ON Reviews(ServiceId);
CREATE INDEX IX_Reviews_StaffId ON Reviews(StaffId);
CREATE INDEX IX_Reviews_IsApproved ON Reviews(IsApproved);

-- =============================================
-- 8. Notifications
-- =============================================

CREATE TABLE NotificationTypes
(
    TypeId      INT IDENTITY(1,1) PRIMARY KEY,
    Name        NVARCHAR(50) NOT NULL UNIQUE,        -- BookingConfirmed, BookingReminder, BookingCancelled, PaymentReceived
    Template    NVARCHAR(500) NULL                   -- message template
);

CREATE TABLE Notifications
(
    NotificationId  INT IDENTITY(1,1) PRIMARY KEY,
    UserId          INT NOT NULL,
    TypeId          INT NOT NULL,
    Title           NVARCHAR(150) NOT NULL,
    Message         NVARCHAR(1000) NOT NULL,
    IsRead          BIT DEFAULT 0,
    IsSent          BIT DEFAULT 0,
    SentAt          DATETIME2 NULL,
    Channel         NVARCHAR(20) DEFAULT 'InApp',    -- InApp, Email, SMS
    RelatedEntityId INT NULL,                        -- BookingId, PaymentId, etc.
    RelatedEntityType NVARCHAR(50) NULL,             -- Booking, Payment, Ticket
    CreatedAt       DATETIME2 DEFAULT GETUTCDATE(),

    CONSTRAINT FK_Notifications_Users FOREIGN KEY (UserId) 
        REFERENCES Users(UserId),
    CONSTRAINT FK_Notifications_Types FOREIGN KEY (TypeId) 
        REFERENCES NotificationTypes(TypeId)
);

CREATE INDEX IX_Notifications_UserId ON Notifications(UserId);
CREATE INDEX IX_Notifications_IsRead ON Notifications(IsRead);
CREATE INDEX IX_Notifications_IsSent ON Notifications(IsSent);

-- =============================================
-- 9. Customer Support Tickets
-- =============================================

CREATE TABLE TicketStatuses
(
    StatusId    INT IDENTITY(1,1) PRIMARY KEY,
    Name        NVARCHAR(50) NOT NULL UNIQUE
);

CREATE TABLE SupportTickets
(
    TicketId        INT IDENTITY(1,1) PRIMARY KEY,
    CustomerId      INT NOT NULL,
    Subject         NVARCHAR(200) NOT NULL,
    Description     NVARCHAR(MAX) NOT NULL,
    StatusId        INT NOT NULL DEFAULT 1,
    Priority        NVARCHAR(20) DEFAULT 'Medium',
    AssignedToId    INT NULL,
    CreatedAt       DATETIME2 DEFAULT GETUTCDATE(),
    UpdatedAt       DATETIME2 NULL,
    ClosedAt        DATETIME2 NULL,

    CONSTRAINT FK_Tickets_Customers FOREIGN KEY (CustomerId) 
        REFERENCES Users(UserId),
    CONSTRAINT FK_Tickets_AssignedTo FOREIGN KEY (AssignedToId) 
        REFERENCES Users(UserId),
    CONSTRAINT FK_Tickets_Statuses FOREIGN KEY (StatusId) 
        REFERENCES TicketStatuses(StatusId)
);

CREATE INDEX IX_Tickets_CustomerId ON SupportTickets(CustomerId);
CREATE INDEX IX_Tickets_StatusId ON SupportTickets(StatusId);
CREATE INDEX IX_Tickets_AssignedToId ON SupportTickets(AssignedToId);

CREATE TABLE TicketMessages
(
    MessageId   INT IDENTITY(1,1) PRIMARY KEY,
    TicketId    INT NOT NULL,
    SenderId    INT NOT NULL,
    Message     NVARCHAR(MAX) NOT NULL,
    IsInternal  BIT DEFAULT 0,
    CreatedAt   DATETIME2 DEFAULT GETUTCDATE(),

    CONSTRAINT FK_TicketMessages_Tickets FOREIGN KEY (TicketId) 
        REFERENCES SupportTickets(TicketId),
    CONSTRAINT FK_TicketMessages_Sender FOREIGN KEY (SenderId) 
        REFERENCES Users(UserId)
);

-- =============================================
-- SEED DATA FOR TESTING
-- =============================================

-- 1. Roles
INSERT INTO Roles (Name, Description) VALUES
('Admin', 'Full system access'),
('Manager', 'Can manage bookings & staff'),
('Stylist', 'Hair services specialist'),
('Therapist', 'Massage & spa services specialist'),
('NailTech', 'Manicure & pedicure specialist'),
('Customer', 'Regular salon client');

-- 2. Users (Password: "Password123!" - in production use proper hashing)
SET IDENTITY_INSERT Users ON;
INSERT INTO Users (UserId, RoleId, FirstName, LastName, Phone, Email, PasswordHash, IsActive, LastLogin) VALUES
-- Admin & Manager
(1, 1, 'Sarah', 'Johnson', '+254712345001', 'admin@goodvibes.co.ke', '$2a$10$abcdefghijklmnopqrstuvwxyz123456789', 1, '2025-01-14 09:30:00'),
(2, 2, 'Michael', 'Omondi', '+254712345002', 'manager@goodvibes.co.ke', '$2a$10$abcdefghijklmnopqrstuvwxyz123456789', 1, '2025-01-14 08:15:00'),

-- Stylists
(3, 3, 'Grace', 'Wanjiku', '+254712345003', 'grace.w@goodvibes.co.ke', '$2a$10$abcdefghijklmnopqrstuvwxyz123456789', 1, '2025-01-13 10:00:00'),
(4, 3, 'David', 'Kimani', '+254712345004', 'david.k@goodvibes.co.ke', '$2a$10$abcdefghijklmnopqrstuvwxyz123456789', 1, '2025-01-14 07:45:00'),

-- Therapists
(5, 4, 'Amina', 'Hassan', '+254712345005', 'amina.h@goodvibes.co.ke', '$2a$10$abcdefghijklmnopqrstuvwxyz123456789', 1, '2025-01-13 14:20:00'),
(6, 4, 'John', 'Mwangi', '+254712345006', 'john.m@goodvibes.co.ke', '$2a$10$abcdefghijklmnopqrstuvwxyz123456789', 1, '2025-01-14 06:30:00'),

-- Nail Technicians
(7, 5, 'Lucy', 'Achieng', '+254712345007', 'lucy.a@goodvibes.co.ke', '$2a$10$abcdefghijklmnopqrstuvwxyz123456789', 1, '2025-01-13 11:00:00'),
(8, 5, 'Peter', 'Otieno', '+254712345008', 'peter.o@goodvibes.co.ke', '$2a$10$abcdefghijklmnopqrstuvwxyz123456789', 1, '2025-01-14 09:00:00'),

-- Customers
(9, 6, 'Emily', 'Njeri', '+254712345009', 'emily.njeri@gmail.com', '$2a$10$abcdefghijklmnopqrstuvwxyz123456789', 1, '2025-01-13 16:45:00'),
(10, 6, 'James', 'Kipchoge', '+254712345010', 'james.k@yahoo.com', '$2a$10$abcdefghijklmnopqrstuvwxyz123456789', 1, '2025-01-12 13:20:00'),
(11, 6, 'Mary', 'Wambui', '+254712345011', 'mary.wambui@outlook.com', '$2a$10$abcdefghijklmnopqrstuvwxyz123456789', 1, '2025-01-14 10:30:00'),
(12, 6, 'Kevin', 'Odhiambo', '+254712345012', 'kevin.odhi@gmail.com', '$2a$10$abcdefghijklmnopqrstuvwxyz123456789', 1, '2025-01-11 15:10:00'),
(13, 6, 'Ann', 'Chebet', '+254712345013', 'ann.chebet@gmail.com', '$2a$10$abcdefghijklmnopqrstuvwxyz123456789', 1, '2025-01-13 12:00:00'),
(14, 6, 'Brian', 'Mutua', '+254712345014', 'brian.m@hotmail.com', '$2a$10$abcdefghijklmnopqrstuvwxyz123456789', 1, '2025-01-10 09:30:00');
SET IDENTITY_INSERT Users OFF;

-- 3. Service Categories
SET IDENTITY_INSERT ServiceCategories ON;
INSERT INTO ServiceCategories (CategoryId, Name, Description, DisplayOrder, IsActive) VALUES
(1, 'Hair', 'Hair styling, cutting, coloring and treatments', 1, 1),
(2, 'Nails', 'Manicure, pedicure and nail art services', 2, 1),
(3, 'Massage', 'Therapeutic and relaxation massage services', 3, 1),
(4, 'Facial', 'Facial treatments and skincare', 4, 1);
SET IDENTITY_INSERT ServiceCategories OFF;

-- 4. Services
SET IDENTITY_INSERT Services ON;
INSERT INTO Services (ServiceId, CategoryId, Name, Description, DurationMinutes, Price, DepositAmount, IsActive) VALUES
-- Hair Services
(1, 1, 'Women Haircut', 'Professional haircut and styling', 60, 1500.00, NULL, 1),
(2, 1, 'Men Haircut', 'Modern men haircut and grooming', 45, 800.00, NULL, 1),
(3, 1, 'Hair Coloring', 'Full hair coloring service', 120, 3500.00, 1000.00, 1),
(4, 1, 'Hair Treatment', 'Deep conditioning and repair treatment', 90, 2500.00, NULL, 1),
(5, 1, 'Braiding', 'Professional braiding styles', 180, 2000.00, 500.00, 1),

-- Nail Services
(6, 2, 'Basic Manicure', 'Nail shaping, cuticle care and polish', 45, 800.00, NULL, 1),
(7, 2, 'Gel Manicure', 'Long-lasting gel polish manicure', 60, 1500.00, NULL, 1),
(8, 2, 'Basic Pedicure', 'Foot care and polish', 60, 1200.00, NULL, 1),
(9, 2, 'Spa Pedicure', 'Luxury pedicure with massage', 90, 2000.00, NULL, 1),
(10, 2, 'Nail Art', 'Custom nail designs', 30, 500.00, NULL, 1),

-- Massage Services
(11, 3, 'Swedish Massage', 'Relaxing full body massage', 60, 3000.00, NULL, 1),
(12, 3, 'Deep Tissue Massage', 'Therapeutic deep tissue work', 75, 3500.00, NULL, 1),
(13, 3, 'Hot Stone Massage', 'Massage with heated stones', 90, 4500.00, 1000.00, 1),
(14, 3, 'Back & Shoulder Massage', 'Targeted upper body massage', 45, 2000.00, NULL, 1),

-- Facial Services
(15, 4, 'Basic Facial', 'Cleansing and moisturizing facial', 60, 2500.00, NULL, 1),
(16, 4, 'Anti-Aging Facial', 'Advanced anti-aging treatment', 90, 4000.00, 1000.00, 1),
(17, 4, 'Acne Treatment', 'Specialized acne facial treatment', 75, 3000.00, NULL, 1);
SET IDENTITY_INSERT Services OFF;

-- 5. Staff Services (what services each staff member can perform)
INSERT INTO StaffServices (StaffId, ServiceId) VALUES
-- Grace (Stylist) - Hair Services
(3, 1), (3, 2), (3, 3), (3, 4), (3, 5),
-- David (Stylist) - Hair Services
(4, 1), (4, 2), (4, 3), (4, 4), (4, 5),
-- Amina (Therapist) - Massage Services
(5, 11), (5, 12), (5, 13), (5, 14),
-- John (Therapist) - Massage & Facial
(6, 11), (6, 12), (6, 14), (6, 15), (6, 17),
-- Lucy (Nail Tech) - Nail Services
(7, 6), (7, 7), (7, 8), (7, 9), (7, 10),
-- Peter (Nail Tech) - Nail Services
(8, 6), (8, 7), (8, 8), (8, 9), (8, 10);

-- 6. Staff Availability (Regular working hours)
INSERT INTO StaffAvailability (StaffId, DayOfWeek, StartTime, EndTime, IsAvailable) VALUES
-- Grace - Monday to Saturday
(3, 1, '09:00', '18:00', 1), (3, 2, '09:00', '18:00', 1), (3, 3, '09:00', '18:00', 1),
(3, 4, '09:00', '18:00', 1), (3, 5, '09:00', '18:00', 1), (3, 6, '09:00', '17:00', 1),
-- David - Tuesday to Saturday
(4, 2, '08:00', '17:00', 1), (4, 3, '08:00', '17:00', 1), (4, 4, '08:00', '17:00', 1),
(4, 5, '08:00', '17:00', 1), (4, 6, '08:00', '16:00', 1),
-- Amina - Monday to Friday
(5, 1, '10:00', '19:00', 1), (5, 2, '10:00', '19:00', 1), (5, 3, '10:00', '19:00', 1),
(5, 4, '10:00', '19:00', 1), (5, 5, '10:00', '19:00', 1),
-- John - Monday to Saturday
(6, 1, '08:00', '17:00', 1), (6, 2, '08:00', '17:00', 1), (6, 3, '08:00', '17:00', 1),
(6, 4, '08:00', '17:00', 1), (6, 5, '08:00', '17:00', 1), (6, 6, '09:00', '15:00', 1),
-- Lucy - Monday to Saturday
(7, 1, '09:00', '18:00', 1), (7, 2, '09:00', '18:00', 1), (7, 3, '09:00', '18:00', 1),
(7, 4, '09:00', '18:00', 1), (7, 5, '09:00', '18:00', 1), (7, 6, '10:00', '16:00', 1),
-- Peter - Tuesday to Saturday
(8, 2, '10:00', '19:00', 1), (8, 3, '10:00', '19:00', 1), (8, 4, '10:00', '19:00', 1),
(8, 5, '10:00', '19:00', 1), (8, 6, '10:00', '18:00', 1);

-- 7. Staff Time Off
INSERT INTO StaffTimeOff (StaffId, StartDate, EndDate, Reason, IsApproved) VALUES
(3, '2025-01-20', '2025-01-22', 'Family event', 1),
(5, '2025-01-25', '2025-01-26', 'Medical appointment', 1);

-- 8. Booking Statuses
SET IDENTITY_INSERT BookingStatuses ON;
INSERT INTO BookingStatuses (StatusId, Name, Description) VALUES
(1, 'Pending', 'Awaiting confirmation'),
(2, 'Confirmed', 'Booking confirmed'),
(3, 'InProgress', 'Service in progress'),
(4, 'Completed', 'Service completed'),
(5, 'Cancelled', 'Booking cancelled'),
(6, 'NoShow', 'Customer did not show up');
SET IDENTITY_INSERT BookingStatuses OFF;

-- 9. Bookings
SET IDENTITY_INSERT Bookings ON;
INSERT INTO Bookings (BookingId, CustomerId, ServiceId, StaffId, StatusId, BookingDate, StartTime, EndTime, TotalPrice, DepositPaid, Notes, CreatedAt) VALUES
-- Completed bookings
(1, 9, 1, 3, 4, '2025-01-10', '10:00', '11:00', 1500.00, 0, 'First time customer', '2025-01-08 14:30:00'),
(2, 10, 11, 5, 4, '2025-01-11', '14:00', '15:00', 3000.00, 0, 'Prefers firm pressure', '2025-01-09 09:15:00'),
(3, 11, 7, 7, 4, '2025-01-12', '11:00', '12:00', 1500.00, 0, NULL, '2025-01-10 16:20:00'),
(4, 12, 3, 4, 4, '2025-01-13', '09:00', '11:00', 3500.00, 1000.00, 'Blonde highlights', '2025-01-11 10:45:00'),

-- Confirmed upcoming bookings
(5, 13, 9, 8, 2, '2025-01-16', '15:00', '16:30', 2000.00, 0, NULL, '2025-01-14 08:00:00'),
(6, 9, 15, 6, 2, '2025-01-17', '10:00', '11:00', 2500.00, 0, 'Sensitive skin', '2025-01-14 11:30:00'),
(7, 14, 12, 5, 2, '2025-01-18', '16:00', '17:15', 3500.00, 0, 'Lower back pain', '2025-01-13 15:00:00'),
(8, 10, 2, 4, 2, '2025-01-19', '13:00', '13:45', 800.00, 0, NULL, '2025-01-14 09:45:00'),

-- Pending bookings
(9, 11, 5, 3, 1, '2025-01-20', '09:00', '12:00', 2000.00, 500.00, 'Box braids preferred', '2025-01-14 12:00:00'),
(10, 12, 13, 5, 1, '2025-01-22', '11:00', '12:30', 4500.00, 1000.00, NULL, '2025-01-14 13:15:00'),

-- Cancelled booking
(11, 13, 6, 7, 5, '2025-01-15', '14:00', '14:45', 800.00, 0, NULL, '2025-01-12 10:00:00');
SET IDENTITY_INSERT Bookings OFF;

UPDATE Bookings SET CancelledAt = '2025-01-14 16:30:00', CancellationReason = 'Customer requested reschedule' WHERE BookingId = 11;

-- 10. Payment Methods & Statuses
SET IDENTITY_INSERT PaymentMethods ON;
INSERT INTO PaymentMethods (MethodId, Name, IsActive) VALUES
(1, 'Cash', 1),
(2, 'Card', 1),
(3, 'M-Pesa', 1),
(4, 'Bank Transfer', 1);
SET IDENTITY_INSERT PaymentMethods OFF;

SET IDENTITY_INSERT PaymentStatuses ON;
INSERT INTO PaymentStatuses (StatusId, Name) VALUES
(1, 'Pending'),
(2, 'Completed'),
(3, 'Failed'),
(4, 'Refunded');
SET IDENTITY_INSERT PaymentStatuses OFF;

-- 11. Payments
SET IDENTITY_INSERT Payments ON;
INSERT INTO Payments (PaymentId, BookingId, Amount, MethodId, StatusId, TransactionRef, PaidAt, CreatedAt) VALUES
(1, 1, 1500.00, 3, 2, 'MPX123456789', '2025-01-10 11:05:00', '2025-01-10 11:05:00'),
(2, 2, 3000.00, 1, 2, NULL, '2025-01-11 15:10:00', '2025-01-11 15:10:00'),
(3, 3, 1500.00, 2, 2, 'CARD987654321', '2025-01-12 12:05:00', '2025-01-12 12:05:00'),
(4, 4, 1000.00, 3, 2, 'MPX987123456', '2025-01-11 08:00:00', '2025-01-11 08:00:00'),
(5, 4, 2500.00, 3, 2, 'MPX987123457', '2025-01-13 11:10:00', '2025-01-13 11:10:00'),
(6, 5, 2000.00, 2, 1, NULL, NULL, '2025-01-14 08:00:00'),
(7, 6, 2500.00, 3, 1, NULL, NULL, '2025-01-14 11:30:00'),
(8, 7, 3500.00, 1, 1, NULL, NULL, '2025-01-13 15:00:00'),
(9, 8, 800.00, 2, 1, NULL, NULL, '2025-01-14 09:45:00'),
(10, 9, 500.00, 3, 2, 'MPX456789123', '2025-01-14 12:05:00', '2025-01-14 12:05:00'),
(11, 10, 1000.00, 2, 2, 'CARD456789123', '2025-01-14 13:20:00', '2025-01-14 13:20:00');
SET IDENTITY_INSERT Payments OFF;

-- 12. Reviews
SET IDENTITY_INSERT Reviews ON;
INSERT INTO Reviews (ReviewId, BookingId, CustomerId, StaffId, ServiceId, Rating, Comment, IsApproved, CreatedAt) VALUES
(1, 1, 9, 3, 1, 5, 'Grace was amazing! She understood exactly what I wanted. Will definitely come back!', 1, '2025-01-10 12:30:00'),
(2, 2, 10, 5, 11, 5, 'Best massage I have ever had. Amina is very professional and the ambiance was perfect.', 1, '2025-01-11 16:00:00'),
(3, 3, 11, 7, 7, 4, 'Good service, but had to wait 15 minutes past my appointment time. Otherwise satisfied with the gel manicure.', 1, '2025-01-12 13:00:00'),
(4, 4, 12, 4, 3, 5, 'David is a color expert! My highlights turned out perfect. Highly recommend!', 1, '2025-01-13 12:00:00'),
(5, 1, 9, 3, 1, 5, 'Grace is the best stylist in Nairobi. Period.', 1, '2025-01-11 09:00:00'),
(6, 2, 10, 5, 11, 4, 'Very relaxing experience. Would give 5 stars but the room was a bit cold.', 1, '2025-01-12 10:00:00'),
(7, 3, 11, 7, 7, 5, 'Lucy did an excellent job on my nails. They look stunning!', 0, '2025-01-13 08:30:00'),
(8, 4, 12, 4, 3, 4, 'Great results but the process took longer than expected. Still happy with the outcome.', 0, '2025-01-14 10:00:00');
SET IDENTITY_INSERT Reviews OFF;

-- 13. Notification Types
SET IDENTITY_INSERT NotificationTypes ON;
INSERT INTO NotificationTypes (TypeId, Name, Template) VALUES
(1, 'BookingConfirmed', 'Your booking for {ServiceName} on {BookingDate} at {StartTime} has been confirmed.'),
(2, 'BookingReminder', 'Reminder: You have a booking for {ServiceName} tomorrow at {StartTime}.'),
(3, 'BookingCancelled', 'Your booking for {ServiceName} on {BookingDate} has been cancelled.'),
(4, 'PaymentReceived', 'Payment of KES {Amount} received for booking #{BookingId}.'),
(5, 'PaymentPending', 'Payment reminder: KES {Amount} is due for your upcoming booking.'),
(6, 'TicketCreated', 'Your support ticket #{TicketId} has been created. We will respond shortly.'),
(7, 'TicketUpdated', 'Your support ticket #{TicketId} has been updated.'),
(8, 'TicketResolved', 'Your support ticket #{TicketId} has been resolved.');
SET IDENTITY_INSERT NotificationTypes OFF;

-- 14. Notifications
SET IDENTITY_INSERT Notifications ON;
INSERT INTO Notifications (NotificationId, UserId, TypeId, Title, Message, IsRead, IsSent, SentAt, Channel, RelatedEntityId, RelatedEntityType, CreatedAt) VALUES
-- Booking confirmations
(1, 9, 1, 'Booking Confirmed', 'Your booking for Women Haircut on 2025-01-10 at 10:00 has been confirmed with Grace.', 1, 1, '2025-01-08 14:35:00', 'Email', 1, 'Booking', '2025-01-08 14:35:00'),
(2, 10, 1, 'Booking Confirmed', 'Your booking for Swedish Massage on 2025-01-11 at 14:00 has been confirmed with Amina.', 1, 1, '2025-01-09 09:20:00', 'SMS', 2, 'Booking', '2025-01-09 09:20:00'),
(3, 13, 1, 'Booking Confirmed', 'Your booking for Spa Pedicure on 2025-01-16 at 15:00 has been confirmed with Peter.', 0, 1, '2025-01-14 08:05:00', 'InApp', 5, 'Booking', '2025-01-14 08:05:00'),

-- Payment notifications
(4, 9, 4, 'Payment Received', 'Payment of KES 1500.00 received for booking #1. Thank you!', 1, 1, '2025-01-10 11:10:00', 'InApp', 1, 'Payment', '2025-01-10 11:10:00'),
(5, 10, 4, 'Payment Received', 'Payment of KES 3000.00 received for booking #2. Thank you!', 1, 1, '2025-01-11 15:15:00', 'InApp', 2, 'Payment', '2025-01-11 15:15:00'),

-- Booking reminders
(6, 13, 2, 'Appointment Reminder', 'Reminder: You have a booking for Spa Pedicure tomorrow at 15:00 with Peter.', 0, 1, '2025-01-15 09:00:00', 'SMS', 5, 'Booking', '2025-01-15 09:00:00'),
(7, 9, 2, 'Appointment Reminder', 'Reminder: You have a booking for Basic Facial tomorrow at 10:00 with John.', 0, 1, '2025-01-16 09:00:00', 'Email', 6, 'Booking', '2025-01-16 09:00:00'),

-- Cancellation notification
(8, 13, 3, 'Booking Cancelled', 'Your booking for Basic Manicure on 2025-01-15 has been cancelled. Reason: Customer requested reschedule', 1, 1, '2025-01-14 16:35:00', 'Email', 11, 'Booking', '2025-01-14 16:35:00'),

-- Payment pending reminders
(9, 13, 5, 'Payment Due', 'Payment reminder: KES 2000.00 is due for your upcoming booking on 2025-01-16.', 0, 0, NULL, 'InApp', 5, 'Booking', '2025-01-15 10:00:00'),
(10, 14, 5, 'Payment Due', 'Payment reminder: KES 3500.00 is due for your upcoming booking on 2025-01-18.', 0, 0, NULL, 'InApp', 7, 'Booking', '2025-01-17 10:00:00');
SET IDENTITY_INSERT Notifications OFF;

-- 15. Ticket Statuses
SET IDENTITY_INSERT TicketStatuses ON;
INSERT INTO TicketStatuses (StatusId, Name) VALUES
(1, 'Open'),
(2, 'InProgress'),
(3, 'WaitingCustomer'),
(4, 'Resolved'),
(5, 'Closed');
SET IDENTITY_INSERT TicketStatuses OFF;

-- 16. Support Tickets
SET IDENTITY_INSERT SupportTickets ON;
INSERT INTO SupportTickets (TicketId, CustomerId, Subject, Description, StatusId, Priority, AssignedToId, CreatedAt, UpdatedAt) VALUES
(1, 11, 'Request to reschedule appointment', 'Hi, I need to reschedule my appointment on Jan 20th to a different date. Can someone help me with this?', 4, 'Medium', 2, '2025-01-13 14:30:00', '2025-01-13 16:45:00'),
(2, 14, 'Question about hair coloring products', 'I would like to know what brand of hair dye you use. I have sensitive scalp and want to make sure it is safe for me.', 2, 'Low', 2, '2025-01-14 10:15:00', '2025-01-14 11:00:00'),
(3, 9, 'Loyalty program inquiry', 'Do you have a loyalty program for regular customers? I visit almost every month.', 1, 'Low', NULL, '2025-01-14 15:30:00', NULL);
SET IDENTITY_INSERT SupportTickets OFF;

-- 17. Ticket Messages
SET IDENTITY_INSERT TicketMessages ON;
INSERT INTO TicketMessages (MessageId, TicketId, SenderId, Message, IsInternal, CreatedAt) VALUES
-- Ticket 1 conversation
(1, 1, 11, 'Hi, I need to reschedule my appointment on Jan 20th to a different date. Can someone help me with this?', 0, '2025-01-13 14:30:00'),
(2, 1, 2, 'Hello Mary! Of course, I can help you with that. What date would work better for you?', 0, '2025-01-13 15:00:00'),
(3, 1, 11, 'Would Jan 23rd around 2pm work? Same service - braiding with Grace.', 0, '2025-01-13 15:30:00'),
(4, 1, 2, 'Perfect! I have rescheduled your appointment to Jan 23rd at 2:00 PM with Grace. You will receive a confirmation shortly.', 0, '2025-01-13 16:45:00'),
(5, 1, 11, 'Thank you so much!', 0, '2025-01-13 16:50:00'),

-- Ticket 2 conversation
(6, 2, 14, 'I would like to know what brand of hair dye you use. I have sensitive scalp and want to make sure it is safe for me.', 0, '2025-01-14 10:15:00'),
(7, 2, 2, 'Hi Brian! We use professional salon brands including Wella and Schwarzkopf. Both are gentle formulas. However, I recommend booking a patch test 48 hours before your appointment to ensure no allergic reaction.', 0, '2025-01-14 10:45:00'),
(8, 2, 2, 'Note: Customer has sensitive scalp. Recommend patch test before coloring service.', 1, '2025-01-14 10:46:00'),
(9, 2, 14, 'That sounds good. How do I book a patch test?', 0, '2025-01-14 11:00:00'),

-- Ticket 3 conversation
(10, 3, 9, 'Do you have a loyalty program for regular customers? I visit almost every month.', 0, '2025-01-14 15:30:00');
SET IDENTITY_INSERT TicketMessages OFF;

-- Update ticket statuses
UPDATE SupportTickets SET ClosedAt = '2025-01-13 16:45:00' WHERE TicketId = 1;

-- =============================================
-- SUMMARY & VERIFICATION QUERIES
-- =============================================

PRINT '================================================';
PRINT 'Database creation completed successfully!';
PRINT '================================================';
PRINT '';
PRINT 'Summary of inserted data:';
PRINT '- Roles: 6';
PRINT '- Users: 14 (2 admin/manager, 6 staff, 6 customers)';
PRINT '- Service Categories: 4';
PRINT '- Services: 17';
PRINT '- Bookings: 11';
PRINT '- Payments: 11';
PRINT '- Reviews: 8';
PRINT '- Notifications: 10';
PRINT '- Support Tickets: 3';
PRINT '- Ticket Messages: 10';
PRINT '';
PRINT 'Run the following queries to verify data:';
PRINT '';
PRINT '-- View all users by role';
PRINT 'SELECT r.Name as Role, COUNT(u.UserId) as UserCount';
PRINT 'FROM Roles r LEFT JOIN Users u ON r.RoleId = u.RoleId';
PRINT 'GROUP BY r.Name;';
PRINT '';
PRINT '-- View booking statistics';
PRINT 'SELECT bs.Name as Status, COUNT(b.BookingId) as BookingCount';
PRINT 'FROM BookingStatuses bs LEFT JOIN Bookings b ON bs.StatusId = b.StatusId';
PRINT 'GROUP BY bs.Name;';
PRINT '';
PRINT '-- View services by category';
PRINT 'SELECT sc.Name as Category, COUNT(s.ServiceId) as ServiceCount';
PRINT 'FROM ServiceCategories sc LEFT JOIN Services s ON sc.CategoryId = s.CategoryId';
PRINT 'GROUP BY sc.Name;';
PRINT '';
PRINT '================================================';



SELECT * FROM Users