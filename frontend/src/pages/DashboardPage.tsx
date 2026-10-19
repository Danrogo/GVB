import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { bookingsApi } from '../services/bookings.api';
import { notificationsApi } from '../services/notifications.api';
import LoadingSpinner from '../components/LoadingSpinner';
import { BOOKING_STATUS } from '../types';

const statusBadge: Record<string, string> = {
    Pending: 'badge-warning',
    Confirmed: 'badge-info',
    Completed: 'badge-success',
    Cancelled: 'badge-error',
    'No Show': 'badge-ghost',
};

const DashboardPage = () => {
    const { user } = useAuth();

    const { data: bookings, isLoading: bookingsLoading } = useQuery({
        queryKey: ['bookings', 'customer', user?.userId],
        queryFn: () => bookingsApi.getByCustomer(user!.userId),
        enabled: !!user?.userId,
    });

    const { data: notifications } = useQuery({
        queryKey: ['notifications'],
        queryFn: notificationsApi.getAll,
        enabled: !!user,
    });

    const upcoming = bookings?.filter((b) => [1, 2].includes(b.StatusId)) ?? [];
    const past = bookings?.filter((b) => [3, 4, 5].includes(b.StatusId)) ?? [];
    const unread = notifications?.filter((n) => !n.IsRead).length ?? 0;
    const totalSpent = past
        .filter((b) => b.StatusId === 3)
        .reduce((sum, b) => sum + b.TotalPrice, 0);

    return (
        <div className="min-h-screen bg-base-200 pt-24 pb-12 px-4">
            <div className="max-w-6xl mx-auto space-y-8 animate-fade-in">

                {/* Welcome banner */}
                <div className="rounded-3xl gvb-gradient p-8 text-white shadow-xl">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div>
                            <p className="text-white/70 text-sm uppercase tracking-widest mb-1">Good Vibes ✨</p>
                            <h1 className="font-display text-3xl md:text-4xl font-bold">
                                Welcome back, {user?.firstName}!
                            </h1>
                            <p className="text-white/70 mt-1">Manage your nail appointments and more.</p>
                        </div>
                        <Link to="/book" className="btn btn-secondary rounded-2xl font-bold shadow-lg shrink-0">
                            + Book Appointment
                        </Link>
                    </div>
                </div>

                {/* Stats cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                        { label: 'Upcoming', value: upcoming.length, icon: '📅', color: 'text-info' },
                        { label: 'Completed', value: past.filter(b => b.StatusId === 3).length, icon: '✅', color: 'text-success' },
                        { label: 'Total Spent', value: `KES ${totalSpent.toLocaleString()}`, icon: '💳', color: 'text-primary' },
                        { label: 'Unread Alerts', value: unread, icon: '🔔', color: 'text-warning' },
                    ].map((stat) => (
                        <div key={stat.label} className="card bg-base-100 shadow-md rounded-2xl border border-base-200 gvb-card-hover">
                            <div className="card-body p-5">
                                <p className="text-2xl">{stat.icon}</p>
                                <p className={`text-2xl font-bold ${stat.color} mt-1`}>{stat.value}</p>
                                <p className="text-base-content/50 text-xs uppercase tracking-wide">{stat.label}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Upcoming Bookings */}
                <div className="card bg-base-100 shadow-md rounded-3xl border border-base-200">
                    <div className="card-body p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="font-bold text-xl">Upcoming Bookings</h2>
                            <Link to="/book" className="btn btn-sm btn-primary rounded-xl">+ New</Link>
                        </div>
                        {bookingsLoading ? (
                            <LoadingSpinner />
                        ) : upcoming.length === 0 ? (
                            <div className="text-center py-10">
                                <p className="text-4xl mb-3">📅</p>
                                <p className="text-base-content/50">No upcoming bookings.</p>
                                <Link to="/book" className="btn btn-primary btn-sm rounded-xl mt-4">Book Now</Link>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="table table-sm">
                                    <thead>
                                        <tr className="text-base-content/50 text-xs uppercase">
                                            <th>Date</th><th>Time</th><th>Price</th><th>Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {upcoming.map((b) => (
                                            <tr key={b.BookingId} className="hover:bg-base-200 rounded-xl">
                                                <td className="font-medium">{new Date(b.BookingDate).toLocaleDateString('en-KE', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                                                <td>{b.StartTime} – {b.EndTime}</td>
                                                <td>KES {b.TotalPrice.toLocaleString()}</td>
                                                <td>
                                                    <span className={`badge text-xs font-semibold ${statusBadge[BOOKING_STATUS[b.StatusId]] ?? 'badge-neutral'}`}>
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

                {/* Past Bookings */}
                {past.length > 0 && (
                    <div className="card bg-base-100 shadow-md rounded-3xl border border-base-200">
                        <div className="card-body p-6">
                            <h2 className="font-bold text-xl mb-4">Past Bookings</h2>
                            <div className="overflow-x-auto">
                                <table className="table table-sm">
                                    <thead>
                                        <tr className="text-base-content/50 text-xs uppercase">
                                            <th>Date</th><th>Price</th><th>Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {past.map((b) => (
                                            <tr key={b.BookingId} className="hover:bg-base-200">
                                                <td>{new Date(b.BookingDate).toLocaleDateString('en-KE')}</td>
                                                <td>KES {b.TotalPrice.toLocaleString()}</td>
                                                <td>
                                                    <span className={`badge text-xs font-semibold ${statusBadge[BOOKING_STATUS[b.StatusId]] ?? 'badge-neutral'}`}>
                                                        {BOOKING_STATUS[b.StatusId] ?? 'Unknown'}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                {/* Quick Links */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                        { label: 'Services', to: '/services', icon: '💅' },
                        { label: 'Profile', to: '/profile', icon: '👤' },
                        { label: 'Notifications', to: '/notifications', icon: '🔔' },
                        { label: 'Support', to: '/tickets', icon: '🎫' },
                    ].map((item) => (
                        <Link
                            key={item.to}
                            to={item.to}
                            className="card bg-base-100 shadow border border-base-200 rounded-2xl gvb-card-hover"
                        >
                            <div className="card-body p-5 items-center text-center">
                                <span className="text-3xl">{item.icon}</span>
                                <span className="font-semibold text-sm text-base-content/70">{item.label}</span>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default DashboardPage;
