import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { notificationsApi } from '../services/notifications.api';
import LoadingSpinner from '../components/LoadingSpinner';

const NotificationsPage = () => {
    const queryClient = useQueryClient();

    const { data: notifications, isLoading } = useQuery({
        queryKey: ['notifications'],
        queryFn: notificationsApi.getAll,
    });

    const markReadMutation = useMutation({
        mutationFn: notificationsApi.markRead,
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
        onError: (e: Error) => toast.error(e.message),
    });

    const unreadCount = notifications?.filter((n) => !n.IsRead).length ?? 0;

    return (
        <div className="min-h-screen bg-base-200 pt-24 pb-12 px-4">
            <div className="max-w-2xl mx-auto animate-fade-in">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="font-display text-3xl font-bold text-base-content">Notifications</h1>
                        {unreadCount > 0 && (
                            <span className="badge badge-primary mt-1">{unreadCount} unread</span>
                        )}
                    </div>
                </div>

                {isLoading ? (
                    <LoadingSpinner />
                ) : !notifications || notifications.length === 0 ? (
                    <div className="card bg-base-100 shadow rounded-3xl border border-base-200">
                        <div className="card-body items-center text-center py-16">
                            <p className="text-5xl mb-4">🔔</p>
                            <p className="text-base-content/50 font-medium">No notifications yet.</p>
                            <p className="text-base-content/30 text-sm mt-1">We'll let you know about your bookings here.</p>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {notifications.map((n) => (
                            <div
                                key={n.NotificationId}
                                className={`card shadow-sm rounded-2xl border transition-all ${n.IsRead ? 'bg-base-100 border-base-200 opacity-70' : 'bg-base-100 border-primary/30 shadow-md'
                                    }`}
                            >
                                <div className="card-body p-5">
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex items-start gap-3 flex-1 min-w-0">
                                            <div className={`w-2 h-2 rounded-full mt-2 shrink-0 ${n.IsRead ? 'bg-base-300' : 'bg-primary'}`} />
                                            <div className="flex-1 min-w-0">
                                                <p className="font-semibold text-base-content">{n.Title}</p>
                                                <p className="text-base-content/60 text-sm mt-1 leading-relaxed">{n.Message}</p>
                                                <p className="text-base-content/30 text-xs mt-2">
                                                    {new Date(n.CreatedAt).toLocaleString('en-KE', {
                                                        day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
                                                    })}
                                                    {' · '}{n.Channel}
                                                </p>
                                            </div>
                                        </div>
                                        {!n.IsRead && (
                                            <button
                                                onClick={() => markReadMutation.mutate(n.NotificationId)}
                                                disabled={markReadMutation.isPending}
                                                className="btn btn-ghost btn-xs rounded-xl text-primary shrink-0"
                                            >
                                                Mark read
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default NotificationsPage;
