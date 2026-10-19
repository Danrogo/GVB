import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { servicesApi } from '../services/services.api';
import { bookingsApi } from '../services/bookings.api';
import { useAuth } from '../hooks/useAuth';
import LoadingSpinner from '../components/LoadingSpinner';

const bookingSchema = z.object({
    serviceId: z.coerce.number().min(1, 'Please select a service'),
    bookingDate: z.string().min(1, 'Please select a date'),
    startTime: z.string().min(1, 'Please select a time'),
    notes: z.string().optional(),
});

type BookingForm = z.infer<typeof bookingSchema>;

const timeSlots = [
    '08:00', '09:00', '10:00', '11:00',
    '12:00', '13:00', '14:00', '15:00', '16:00', '17:00',
];

const BookingPage = () => {
    const { user } = useAuth();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const preselectedServiceId = searchParams.get('serviceId');

    const { data: services, isLoading: servicesLoading } = useQuery({
        queryKey: ['services'],
        queryFn: servicesApi.getAll,
    });

    const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<BookingForm>({
        resolver: zodResolver(bookingSchema),
        defaultValues: {
            serviceId: preselectedServiceId ? Number(preselectedServiceId) : undefined,
        },
    });

    useEffect(() => {
        if (preselectedServiceId) {
            setValue('serviceId', Number(preselectedServiceId));
        }
    }, [preselectedServiceId, setValue]);

    const selectedServiceId = watch('serviceId');
    const selectedService = services?.find((s) => s.ServiceId === Number(selectedServiceId));

    const mutation = useMutation({
        mutationFn: bookingsApi.create,
        onSuccess: () => {
            toast.success('Booking confirmed! See you soon 💅');
            navigate('/dashboard');
        },
        onError: (err: Error) => {
            toast.error(err.message || 'Booking failed. Please try again.');
        },
    });

   const onSubmit = (data: BookingForm) => {
    if (!user) return;
    const service = services?.find((s) => s.ServiceId === Number(data.serviceId));
    
    if (!service) {
        toast.error('Service not found. Please try again.');
        return;
    }

    const durationHrs = service.DurationMinutes / 60;
    const [h, m] = data.startTime.split(':').map(Number);
    const endDate = new Date(0, 0, 0, h + Math.floor(durationHrs), m + ((durationHrs % 1) * 60));
    const endTime = `${String(endDate.getHours()).padStart(2, '0')}:${String(endDate.getMinutes()).padStart(2, '0')}:00`;

    const payload = {
        customerId: user.userId,
        serviceId: data.serviceId,
        bookingDate: data.bookingDate,
        startTime: `${data.startTime}:00`,
        endTime: endTime,
        totalPrice: service.Price,
        notes: data.notes,
    };

    console.log('Booking payload:', payload); 
    console.log('user object:', user);
    mutation.mutate(payload);
};
    const today = new Date().toISOString().split('T')[0];

    return (
        <div className="min-h-screen bg-base-200 pt-24 pb-12 px-4">
            <div className="max-w-2xl mx-auto animate-fade-in">
                <div className="text-center mb-10">
                    <h1 className="font-display text-4xl font-bold text-base-content">
                        Book an <span className="text-primary italic">Appointment</span>
                    </h1>
                    <p className="text-base-content/60 mt-2">Choose your service, date, and time.</p>
                </div>

                <div className="card bg-base-100 shadow-2xl rounded-3xl border border-base-200">
                    <div className="card-body p-8">
                        {servicesLoading ? (
                            <LoadingSpinner />
                        ) : (
                            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                                {/* Service select */}
                                <div className="form-control">
                                    <label className="label pb-1"><span className="label-text font-semibold">Service *</span></label>
                                    <select
                                        {...register('serviceId')}
                                        className={`select select-bordered w-full rounded-xl ${errors.serviceId ? 'select-error' : ''}`}
                                        id="booking-service"
                                    >
                                        <option value="">— Select a service —</option>
                                        {services?.filter((s) => s.IsActive).map((s) => (
                                            <option key={s.ServiceId} value={s.ServiceId}>
                                                {s.Name} — KES {s.Price.toLocaleString()} ({s.DurationMinutes} min)
                                            </option>
                                        ))}
                                    </select>
                                    {errors.serviceId && (
                                        <label className="label pt-1"><span className="label-text-alt text-error">{errors.serviceId.message}</span></label>
                                    )}
                                </div>

                                {/* Service summary pill */}
                                {selectedService && (
                                    <div className="alert alert-info rounded-2xl text-sm">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        <span>
                                            <strong>{selectedService.Name}</strong> — {selectedService.DurationMinutes} min •{' '}
                                            KES {selectedService.Price.toLocaleString()}
                                            {selectedService.DepositAmount ? ` (Deposit: KES ${selectedService.DepositAmount.toLocaleString()})` : ''}
                                        </span>
                                    </div>
                                )}

                                {/* Date */}
                                <div className="form-control">
                                    <label className="label pb-1"><span className="label-text font-semibold">Date *</span></label>
                                    <input
                                        {...register('bookingDate')}
                                        type="date"
                                        min={today}
                                        className={`input input-bordered w-full rounded-xl ${errors.bookingDate ? 'input-error' : ''}`}
                                        id="booking-date"
                                    />
                                    {errors.bookingDate && (
                                        <label className="label pt-1"><span className="label-text-alt text-error">{errors.bookingDate.message}</span></label>
                                    )}
                                </div>

                                {/* Time slots */}
                                <div className="form-control">
                                    <label className="label pb-1"><span className="label-text font-semibold">Time *</span></label>
                                    <div className="grid grid-cols-5 gap-2">
                                        {timeSlots.map((slot) => (
                                            <label key={slot} className="cursor-pointer">
                                                <input
                                                    {...register('startTime')}
                                                    type="radio"
                                                    value={slot}
                                                    className="hidden peer"
                                                    id={`slot-${slot}`}
                                                />
                                                <div className="text-center text-xs font-medium py-2 px-1 rounded-xl border border-base-300 peer-checked:bg-primary peer-checked:text-primary-content peer-checked:border-primary hover:border-primary transition-all">
                                                    {slot}
                                                </div>
                                            </label>
                                        ))}
                                    </div>
                                    {errors.startTime && (
                                        <label className="label pt-1"><span className="label-text-alt text-error">{errors.startTime.message}</span></label>
                                    )}
                                </div>

                                {/* Notes */}
                                <div className="form-control">
                                    <label className="label pb-1">
                                        <span className="label-text font-semibold">Notes <span className="text-base-content/40">(optional)</span></span>
                                    </label>
                                    <textarea
                                        {...register('notes')}
                                        placeholder="Any special requests or nail design ideas..."
                                        className="textarea textarea-bordered w-full rounded-xl h-24 resize-none"
                                        id="booking-notes"
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={mutation.isPending}
                                    className="btn btn-primary w-full rounded-2xl font-bold text-lg py-3 h-auto"
                                    id="booking-submit"
                                >
                                    {mutation.isPending ? (
                                        <span className="loading loading-spinner loading-sm" />
                                    ) : 'Confirm Booking 💅'}
                                </button>
                            </form>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BookingPage;
