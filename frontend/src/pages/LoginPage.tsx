import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../hooks/useAuth';

const loginSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(1, 'Password is required'),
});

type LoginForm = z.infer<typeof loginSchema>;

const LoginPage = () => {
    const { login } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/dashboard';

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<LoginForm>({ resolver: zodResolver(loginSchema) });

    const onSubmit = async (data: LoginForm) => {
        try {
            await login(data);
            toast.success('Welcome back! 💅');
            navigate(from, { replace: true });
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Login failed';
            toast.error(message);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-base-200 px-4 pt-20">
            <div className="w-full max-w-md animate-fade-in">
                {/* Card */}
                <div className="card bg-base-100 shadow-2xl rounded-3xl border border-base-200">
                    <div className="card-body p-8">
                        {/* Header */}
                        <div className="text-center mb-8">
                            <div className="text-5xl mb-3">💅</div>
                            <h1 className="font-display text-3xl font-bold text-primary">Welcome Back</h1>
                            <p className="text-base-content/60 mt-1 text-sm">Sign in to your Good Vibes account</p>
                        </div>

                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                            {/* Email */}
                            <div className="form-control">
                                <label className="label pb-1">
                                    <span className="label-text font-medium">Email</span>
                                </label>
                                <input
                                    {...register('email')}
                                    type="email"
                                    placeholder="you@example.com"
                                    className={`input input-bordered w-full rounded-xl ${errors.email ? 'input-error' : ''}`}
                                    id="login-email"
                                />
                                {errors.email && (
                                    <label className="label pt-1">
                                        <span className="label-text-alt text-error">{errors.email.message}</span>
                                    </label>
                                )}
                            </div>

                            {/* Password */}
                            <div className="form-control">
                                <label className="label pb-1">
                                    <span className="label-text font-medium">Password</span>
                                </label>
                                <input
                                    {...register('password')}
                                    type="password"
                                    placeholder="••••••••"
                                    className={`input input-bordered w-full rounded-xl ${errors.password ? 'input-error' : ''}`}
                                    id="login-password"
                                />
                                {errors.password && (
                                    <label className="label pt-1">
                                        <span className="label-text-alt text-error">{errors.password.message}</span>
                                    </label>
                                )}
                            </div>

                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="btn btn-primary w-full rounded-xl font-bold mt-2"
                                id="login-submit"
                            >
                                {isSubmitting ? (
                                    <span className="loading loading-spinner loading-sm" />
                                ) : (
                                    'Sign In'
                                )}
                            </button>
                        </form>

                        <div className="divider text-base-content/30 text-xs">OR</div>

                        <p className="text-center text-base-content/60 text-sm">
                            Don't have an account?{' '}
                            <Link to="/register" className="text-primary font-semibold hover:underline">
                                Register here
                            </Link>
                        </p>
                    </div>
                </div>

                <p className="text-center text-base-content/40 text-xs mt-6">
                    © {new Date().getFullYear()} Good Vibes Beauty
                </p>
            </div>
        </div>
    );
};

export default LoginPage;
