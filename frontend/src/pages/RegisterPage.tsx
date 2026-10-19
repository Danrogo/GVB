import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../hooks/useAuth';

const registerSchema = z.object({
    firstName: z.string().min(2, 'First name must be at least 2 characters'),
    lastName: z.string().min(2, 'Last name must be at least 2 characters'),
    email: z.string().email('Invalid email address'),
    phone: z.string().optional(),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string(),
}).refine((d) => d.password === d.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
});

type RegisterForm = z.infer<typeof registerSchema>;

const RegisterPage = () => {
    const { register: registerUser } = useAuth();
    const navigate = useNavigate();

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<RegisterForm>({ resolver: zodResolver(registerSchema) });

    const onSubmit = async (data: RegisterForm) => {
        try {
            await registerUser({
                firstName: data.firstName,
                lastName: data.lastName,
                email: data.email,
                password: data.password,
                phone: data.phone,
            });
            toast.success('Welcome to Good Vibes Beauty! 💅');
            navigate('/dashboard');
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Registration failed';
            toast.error(message);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-base-200 px-4 pt-20 pb-10">
            <div className="w-full max-w-md animate-fade-in">
                <div className="card bg-base-100 shadow-2xl rounded-3xl border border-base-200">
                    <div className="card-body p-8">
                        <div className="text-center mb-8">
                            <div className="text-5xl mb-3">✨</div>
                            <h1 className="font-display text-3xl font-bold text-primary">Create Account</h1>
                            <p className="text-base-content/60 mt-1 text-sm">Join Good Vibes Beauty today</p>
                        </div>

                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="form-control">
                                    <label className="label pb-1"><span className="label-text font-medium">First Name</span></label>
                                    <input
                                        {...register('firstName')}
                                        type="text"
                                        placeholder="Jane"
                                        className={`input input-bordered rounded-xl ${errors.firstName ? 'input-error' : ''}`}
                                        id="reg-firstname"
                                    />
                                    {errors.firstName && (
                                        <label className="label pt-1"><span className="label-text-alt text-error">{errors.firstName.message}</span></label>
                                    )}
                                </div>
                                <div className="form-control">
                                    <label className="label pb-1"><span className="label-text font-medium">Last Name</span></label>
                                    <input
                                        {...register('lastName')}
                                        type="text"
                                        placeholder="Doe"
                                        className={`input input-bordered rounded-xl ${errors.lastName ? 'input-error' : ''}`}
                                        id="reg-lastname"
                                    />
                                    {errors.lastName && (
                                        <label className="label pt-1"><span className="label-text-alt text-error">{errors.lastName.message}</span></label>
                                    )}
                                </div>
                            </div>

                            <div className="form-control">
                                <label className="label pb-1"><span className="label-text font-medium">Email</span></label>
                                <input
                                    {...register('email')}
                                    type="email"
                                    placeholder="you@example.com"
                                    className={`input input-bordered w-full rounded-xl ${errors.email ? 'input-error' : ''}`}
                                    id="reg-email"
                                />
                                {errors.email && (
                                    <label className="label pt-1"><span className="label-text-alt text-error">{errors.email.message}</span></label>
                                )}
                            </div>

                            <div className="form-control">
                                <label className="label pb-1"><span className="label-text font-medium">Phone <span className="text-base-content/40">(optional)</span></span></label>
                                <input
                                    {...register('phone')}
                                    type="tel"
                                    placeholder="0712 345 678"
                                    className="input input-bordered w-full rounded-xl"
                                    id="reg-phone"
                                />
                            </div>

                            <div className="form-control">
                                <label className="label pb-1"><span className="label-text font-medium">Password</span></label>
                                <input
                                    {...register('password')}
                                    type="password"
                                    placeholder="Min 8 characters"
                                    className={`input input-bordered w-full rounded-xl ${errors.password ? 'input-error' : ''}`}
                                    id="reg-password"
                                />
                                {errors.password && (
                                    <label className="label pt-1"><span className="label-text-alt text-error">{errors.password.message}</span></label>
                                )}
                            </div>

                            <div className="form-control">
                                <label className="label pb-1"><span className="label-text font-medium">Confirm Password</span></label>
                                <input
                                    {...register('confirmPassword')}
                                    type="password"
                                    placeholder="Repeat password"
                                    className={`input input-bordered w-full rounded-xl ${errors.confirmPassword ? 'input-error' : ''}`}
                                    id="reg-confirm-password"
                                />
                                {errors.confirmPassword && (
                                    <label className="label pt-1"><span className="label-text-alt text-error">{errors.confirmPassword.message}</span></label>
                                )}
                            </div>

                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="btn btn-primary w-full rounded-xl font-bold mt-2"
                                id="reg-submit"
                            >
                                {isSubmitting ? <span className="loading loading-spinner loading-sm" /> : 'Create Account'}
                            </button>
                        </form>

                        <div className="divider text-base-content/30 text-xs">OR</div>

                        <p className="text-center text-base-content/60 text-sm">
                            Already have an account?{' '}
                            <Link to="/login" className="text-primary font-semibold hover:underline">Sign in</Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RegisterPage;
