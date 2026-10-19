import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { ticketsApi } from '../services/tickets.api';
import { useAuth } from '../hooks/useAuth';
import LoadingSpinner from '../components/LoadingSpinner';

const ticketSchema = z.object({
    subject: z.string().min(5, 'Subject too short'),
    description: z.string().min(10, 'Please describe your issue in more detail'),
    priority: z.enum(['Low', 'Medium', 'High']).default('Medium'),
});

type TicketForm = z.infer<typeof ticketSchema>;

const priorityBadge: Record<string, string> = {
    Low: 'badge-success',
    Medium: 'badge-warning',
    High: 'badge-error',
};

const TICKET_STATUS: Record<number, string> = {
    1: 'Open',
    2: 'In Progress',
    3: 'Resolved',
    4: 'Closed',
};

const TicketsPage = () => {
    const { user } = useAuth();
    const queryClient = useQueryClient();
    const [showModal, setShowModal] = useState(false);

    const { data: tickets, isLoading } = useQuery({
        queryKey: ['tickets', 'customer', user?.userId],
        queryFn: () => ticketsApi.getByCustomer(user!.userId),
        enabled: !!user,
    });

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting },
    } = useForm<TicketForm>({
        resolver: zodResolver(ticketSchema),
        defaultValues: {
            priority: 'Medium',
        },
    });

    const createMutation = useMutation({
        mutationFn: ticketsApi.create,
        onSuccess: () => {
            toast.success('Ticket submitted!');
            queryClient.invalidateQueries({ queryKey: ['tickets', 'customer', user?.userId] });
            reset();
            setShowModal(false);
        },
        onError: (e: Error) => toast.error(e.message),
    });

    const onSubmit = (data: TicketForm) => {
        if (!user) return;
        createMutation.mutate({
            subject: data.subject,
            description: data.description,
            priority: data.priority as 'Low' | 'Medium' | 'High',
            customerId: user.userId,
        });
    };

    return (
        <div className="min-h-screen bg-base-200 pt-24 pb-12 px-4">
            <div className="max-w-3xl mx-auto animate-fade-in">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="font-display text-3xl font-bold text-base-content">Support Tickets</h1>
                        <p className="text-base-content/50 text-sm mt-1">Need help? Open a support ticket.</p>
                    </div>
                    <button
                        onClick={() => setShowModal(true)}
                        className="btn btn-primary rounded-2xl font-semibold"
                        id="new-ticket-btn"
                    >
                        + New Ticket
                    </button>
                </div>

                {isLoading ? (
                    <LoadingSpinner />
                ) : !tickets || tickets.length === 0 ? (
                    <div className="card bg-base-100 shadow rounded-3xl border border-base-200">
                        <div className="card-body items-center text-center py-16">
                            <p className="text-5xl mb-4">🎫</p>
                            <p className="text-base-content/50 font-medium">No tickets yet.</p>
                            <button onClick={() => setShowModal(true)} className="btn btn-primary btn-sm rounded-xl mt-4">
                                Open a Ticket
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {tickets.map((t) => (
                            <div key={t.TicketId} className="card bg-base-100 shadow-md rounded-2xl border border-base-200 gvb-card-hover">
                                <div className="card-body p-5">
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <span className="font-semibold text-base-content">{t.Subject}</span>
                                                <span className={`badge text-xs ${priorityBadge[t.Priority] ?? 'badge-neutral'}`}>
                                                    {t.Priority}
                                                </span>
                                                <span className="badge badge-outline text-xs">
                                                    {TICKET_STATUS[t.StatusId] ?? 'Open'}
                                                </span>
                                            </div>
                                            <p className="text-base-content/60 text-sm mt-2 line-clamp-2">{t.Description}</p>
                                            <p className="text-base-content/30 text-xs mt-2">
                                                #{t.TicketId} · {new Date(t.CreatedAt).toLocaleDateString('en-KE', {
                                                    day: 'numeric', month: 'short', year: 'numeric',
                                                })}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Create Ticket Modal */}
            {showModal && (
                <dialog className="modal modal-open">
                    <div className="modal-box rounded-3xl max-w-lg">
                        <button
                            onClick={() => setShowModal(false)}
                            className="btn btn-ghost btn-circle btn-sm absolute top-4 right-4"
                        >✕</button>
                        <h2 className="font-display font-bold text-2xl mb-6">Open Support Ticket</h2>
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                            <div className="form-control">
                                <label className="label pb-1"><span className="label-text font-medium">Subject *</span></label>
                                <input
                                    {...register('subject')}
                                    placeholder="Brief summary of your issue"
                                    className={`input input-bordered rounded-xl ${errors.subject ? 'input-error' : ''}`}
                                    id="ticket-subject"
                                />
                                {errors.subject && <label className="label pt-1"><span className="label-text-alt text-error">{errors.subject.message}</span></label>}
                            </div>
                            <div className="form-control">
                                <label className="label pb-1"><span className="label-text font-medium">Priority</span></label>
                                <select {...register('priority')} className="select select-bordered rounded-xl" id="ticket-priority">
                                    <option value="Low">Low</option>
                                    <option value="Medium">Medium</option>
                                    <option value="High">High</option>
                                </select>
                            </div>
                            <div className="form-control">
                                <label className="label pb-1"><span className="label-text font-medium">Description *</span></label>
                                <textarea
                                    {...register('description')}
                                    placeholder="Describe your issue in detail..."
                                    className={`textarea textarea-bordered rounded-xl h-28 resize-none ${errors.description ? 'textarea-error' : ''}`}
                                    id="ticket-description"
                                />
                                {errors.description && <label className="label pt-1"><span className="label-text-alt text-error">{errors.description.message}</span></label>}
                            </div>
                            <button type="submit" disabled={isSubmitting || createMutation.isPending} className="btn btn-primary w-full rounded-xl font-bold">
                                {createMutation.isPending ? <span className="loading loading-spinner loading-sm" /> : 'Submit Ticket'}
                            </button>
                        </form>
                    </div>
                    <div className="modal-backdrop" onClick={() => setShowModal(false)} />
                </dialog>
            )}
        </div>
    );
};

export default TicketsPage;
