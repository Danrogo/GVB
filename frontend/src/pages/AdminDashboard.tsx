import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { usersApi } from '../services/users.api';
import { bookingsApi } from '../services/bookings.api';
import { paymentsApi } from '../services/payments.api';
import LoadingSpinner from '../components/LoadingSpinner';
import type { User } from '../types';
import { BOOKING_STATUS, PAYMENT_STATUS } from '../types';

type AdminTab = 'users' | 'bookings' | 'payments';

const AdminDashboard = () => {
    const [tab, setTab] = useState<AdminTab>('users');
    const queryClient = useQueryClient();

    const { data: users, isLoading: usersLoading } = useQuery({ queryKey: ['admin-users'], queryFn: usersApi.getAll });
    const { data: bookings, isLoading: bookingsLoading } = useQuery({ queryKey: ['admin-bookings'], queryFn: bookingsApi.getAll });
    const { data: payments, isLoading: paymentsLoading } = useQuery({ queryKey: ['admin-payments'], queryFn: paymentsApi.getAll });

    const deleteUserMutation = useMutation({
        mutationFn: usersApi.delete,
        onSuccess: () => { toast.success('User deleted'); queryClient.invalidateQueries({ queryKey: ['admin-users'] }); },
        onError: (e: Error) => toast.error(e.message),
    });

    const tabs: { key: AdminTab; label: string; icon: string }[] = [
        { key: 'users', label: 'Users', icon: '👥' },
        { key: 'bookings', label: 'Bookings', icon: '📅' },
        { key: 'payments', label: 'Payments', icon: '💳' },
    ];

    return (
        <div className="min-h-screen bg-base-200 pt-24 pb-12 px-4">
            <div className="max-w-7xl mx-auto animate-fade-in">
                {/* Header */}
                <div className="rounded-3xl gvb-gradient p-8 text-white shadow-xl mb-8">
                    <h1 className="font-display text-3xl font-bold">Admin Dashboard</h1>
                    <p className="text-white/70 mt-1">Manage users, bookings, and payments.</p>
                    <div className="flex gap-6 mt-5">
                        {[
                            { label: 'Total Users', value: users?.length ?? '—' },
                            { label: 'Total Bookings', value: bookings?.length ?? '—' },
                            { label: 'Total Payments', value: payments?.length ?? '—' },
                        ].map((s) => (
                            <div key={s.label} className="gvb-glass rounded-2xl px-5 py-3 text-center">
                                <p className="text-2xl font-bold">{s.value}</p>
                                <p className="text-white/60 text-xs mt-0.5">{s.label}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Tab bar */}
                <div className="tabs tabs-boxed bg-base-100 rounded-2xl p-1 mb-6 inline-flex">
                    {tabs.map((t) => (
                        <button
                            key={t.key}
                            className={`tab rounded-xl font-semibold gap-2 px-6 ${tab === t.key ? 'tab-active' : ''}`}
                            onClick={() => setTab(t.key)}
                        >
                            <span>{t.icon}</span> {t.label}
                        </button>
                    ))}
                </div>

                {/* Users Tab */}
                {tab === 'users' && (
                    <div className="card bg-base-100 shadow-md rounded-3xl border border-base-200">
                        <div className="card-body p-6">
                            <h2 className="font-bold text-xl mb-4">All Users</h2>
                            {usersLoading ? <LoadingSpinner /> : (
                                <div className="overflow-x-auto">
                                    <table className="table table-sm">
                                        <thead>
                                            <tr className="text-base-content/50 text-xs uppercase">
                                                <th>ID</th><th>Name</th><th>Email</th><th>Phone</th><th>Role</th><th>Status</th><th>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {users?.map((u: User) => (
                                                <tr key={u.UserId} className="hover:bg-base-200">
                                                    <td className="font-mono text-xs text-base-content/50">#{u.UserId}</td>
                                                    <td className="font-medium">{u.FirstName} {u.LastName}</td>
                                                    <td className="text-sm">{u.Email}</td>
                                                    <td className="text-sm">{u.Phone ?? '—'}</td>
                                                    <td><span className="badge badge-outline text-xs">{u.RoleId}</span></td>
                                                    <td>
                                                        <span className={`badge text-xs ${u.IsActive ? 'badge-success' : 'badge-error'}`}>
                                                            {u.IsActive ? 'Active' : 'Inactive'}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        <button
                                                            onClick={() => {
                                                                if (confirm(`Delete user ${u.FirstName}?`)) deleteUserMutation.mutate(u.UserId);
                                                            }}
                                                            className="btn btn-ghost btn-xs text-error"
                                                        >
                                                            Delete
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Bookings Tab */}
                {tab === 'bookings' && (
                    <div className="card bg-base-100 shadow-md rounded-3xl border border-base-200">
                        <div className="card-body p-6">
                            <h2 className="font-bold text-xl mb-4">All Bookings</h2>
                            {bookingsLoading ? <LoadingSpinner /> : (
                                <div className="overflow-x-auto">
                                    <table className="table table-sm">
                                        <thead>
                                            <tr className="text-base-content/50 text-xs uppercase">
                                                <th>ID</th><th>Customer</th><th>Date</th><th>Price</th><th>Status</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {bookings?.map((b) => (
                                                <tr key={b.BookingId} className="hover:bg-base-200">
                                                    <td className="font-mono text-xs text-base-content/50">#{b.BookingId}</td>
                                                    <td className="font-medium">Customer #{b.CustomerId}</td>
                                                    <td>{new Date(b.BookingDate).toLocaleDateString('en-KE')}</td>
                                                    <td>KES {b.TotalPrice.toLocaleString()}</td>
                                                    <td>
                                                        <span className={`badge text-xs font-semibold ${b.StatusId === 3 ? 'badge-success' :
                                                                b.StatusId === 2 ? 'badge-info' :
                                                                    b.StatusId === 4 ? 'badge-error' : 'badge-warning'
                                                            }`}>
                                                            {BOOKING_STATUS[b.StatusId] ?? 'Unknown'}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Payments Tab */}
                {tab === 'payments' && (
                    <div className="card bg-base-100 shadow-md rounded-3xl border border-base-200">
                        <div className="card-body p-6">
                            <h2 className="font-bold text-xl mb-4">All Payments</h2>
                            {paymentsLoading ? <LoadingSpinner /> : (
                                <div className="overflow-x-auto">
                                    <table className="table table-sm">
                                        <thead>
                                            <tr className="text-base-content/50 text-xs uppercase">
                                                <th>ID</th><th>Booking</th><th>Amount</th><th>Method</th><th>Status</th><th>Paid At</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {payments?.map((p) => (
                                                <tr key={p.PaymentId} className="hover:bg-base-200">
                                                    <td className="font-mono text-xs text-base-content/50">#{p.PaymentId}</td>
                                                    <td>Booking #{p.BookingId}</td>
                                                    <td className="font-semibold">KES {p.Amount.toLocaleString()}</td>
                                                    <td>Method #{p.MethodId}</td>
                                                    <td>
                                                        <span className={`badge text-xs ${p.StatusId === 2 ? 'badge-success' :
                                                                p.StatusId === 3 ? 'badge-info' :
                                                                    p.StatusId === 4 ? 'badge-error' : 'badge-warning'
                                                            }`}>
                                                            {PAYMENT_STATUS[p.StatusId] ?? 'Unknown'}
                                                        </span>
                                                    </td>
                                                    <td className="text-xs text-base-content/50">
                                                        {p.PaidAt ? new Date(p.PaidAt).toLocaleDateString('en-KE') : '—'}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminDashboard;
