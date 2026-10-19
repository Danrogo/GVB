import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { useAuth } from '../hooks/useAuth';
import { usersApi } from '../services/users.api';
import { authApi } from '../services/api';

const profileSchema = z.object({
    firstName: z.string().min(2, 'Too short'),
    lastName: z.string().min(2, 'Too short'),
    phone: z.string().optional(),
});

const passwordSchema = z.object({
    currentPassword: z.string().min(1, 'Required'),
    newPassword: z.string().min(8, 'Min 8 characters'),
    confirmPassword: z.string(),
}).refine((d) => d.newPassword === d.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
});

type ProfileForm = z.infer<typeof profileSchema>;
type PasswordForm = z.infer<typeof passwordSchema>;

const ProfilePage = () => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState<'profile' | 'password'>('profile');
    const queryClient = useQueryClient();

    const { register: regProfile, handleSubmit: handleProfile, formState: { errors: profileErrors } } =
        useForm<ProfileForm>({
            resolver: zodResolver(profileSchema),
            defaultValues: {
                firstName: user?.firstName ?? '',
                lastName: user?.lastName ?? '',
            },
        });

    const { register: regPw, handleSubmit: handlePassword, reset: resetPw, formState: { errors: pwErrors } } =
        useForm<PasswordForm>({ resolver: zodResolver(passwordSchema) });

    const profileMutation = useMutation({
        mutationFn: (data: ProfileForm) => usersApi.update(user!.userId, data),
        onSuccess: () => {
            toast.success('Profile updated!');
            queryClient.invalidateQueries({ queryKey: ['user', user?.userId] });
        },
        onError: (e: Error) => toast.error(e.message),
    });

    const passwordMutation = useMutation({
        mutationFn: (data: PasswordForm) =>
            authApi.logout().then(async () => {
                const res = await fetch('/api/auth/change-password', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('gvb_token')}` },
                    body: JSON.stringify({ userId: user!.userId, currentPassword: data.currentPassword, newPassword: data.newPassword }),
                });
                if (!res.ok) { const d = await res.json(); throw new Error(d.error || 'Failed'); }
            }),
        onSuccess: () => { toast.success('Password changed!'); resetPw(); },
        onError: (e: Error) => toast.error(e.message),
    });

    return (
        <div className="min-h-screen bg-base-200 pt-24 pb-12 px-4">
            <div className="max-w-xl mx-auto animate-fade-in">
                {/* Avatar */}
                <div className="text-center mb-8">
                    <div className="avatar placeholder mb-4">
                        <div className="bg-primary text-primary-content rounded-full w-24 h-24 flex items-center justify-center">
                            <span className="text-3xl font-bold">{user?.firstName?.[0]}{user?.lastName?.[0]}</span>
                        </div>
                    </div>
                    <h1 className="font-display text-3xl font-bold text-base-content">
                        {user?.firstName} {user?.lastName}
                    </h1>
                    <p className="text-base-content/50 text-sm mt-1">{user?.email}</p>
                </div>

                {/* Tabs */}
                <div className="tabs tabs-boxed mb-6 bg-base-100 rounded-2xl p-1">
                    <button
                        className={`tab flex-1 rounded-xl font-medium transition-all ${activeTab === 'profile' ? 'tab-active' : ''}`}
                        onClick={() => setActiveTab('profile')}
                    >
                        Profile
                    </button>
                    <button
                        className={`tab flex-1 rounded-xl font-medium transition-all ${activeTab === 'password' ? 'tab-active' : ''}`}
                        onClick={() => setActiveTab('password')}
                    >
                        Password
                    </button>
                </div>

                <div className="card bg-base-100 shadow-xl rounded-3xl border border-base-200">
                    <div className="card-body p-8">
                        {activeTab === 'profile' ? (
                            <form onSubmit={handleProfile((d) => profileMutation.mutate(d))} className="space-y-5">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="form-control">
                                        <label className="label pb-1"><span className="label-text font-medium">First Name</span></label>
                                        <input {...regProfile('firstName')} className={`input input-bordered rounded-xl ${profileErrors.firstName ? 'input-error' : ''}`} />
                                        {profileErrors.firstName && <label className="label pt-1"><span className="label-text-alt text-error">{profileErrors.firstName.message}</span></label>}
                                    </div>
                                    <div className="form-control">
                                        <label className="label pb-1"><span className="label-text font-medium">Last Name</span></label>
                                        <input {...regProfile('lastName')} className={`input input-bordered rounded-xl ${profileErrors.lastName ? 'input-error' : ''}`} />
                                        {profileErrors.lastName && <label className="label pt-1"><span className="label-text-alt text-error">{profileErrors.lastName.message}</span></label>}
                                    </div>
                                </div>
                                <div className="form-control">
                                    <label className="label pb-1"><span className="label-text font-medium">Phone</span></label>
                                    <input {...regProfile('phone')} type="tel" placeholder="0712 345 678" className="input input-bordered rounded-xl" />
                                </div>
                                <div className="form-control">
                                    <label className="label pb-1"><span className="label-text font-medium">Email</span></label>
                                    <input value={user?.email ?? ''} disabled className="input input-bordered rounded-xl opacity-60" />
                                </div>
                                <button type="submit" disabled={profileMutation.isPending} className="btn btn-primary w-full rounded-xl font-bold">
                                    {profileMutation.isPending ? <span className="loading loading-spinner loading-sm" /> : 'Save Changes'}
                                </button>
                            </form>
                        ) : (
                            <form onSubmit={handlePassword((d) => passwordMutation.mutate(d))} className="space-y-5">
                                {(['currentPassword', 'newPassword', 'confirmPassword'] as const).map((field) => (
                                    <div key={field} className="form-control">
                                        <label className="label pb-1">
                                            <span className="label-text font-medium capitalize">{field.replace(/([A-Z])/g, ' $1')}</span>
                                        </label>
                                        <input
                                            {...regPw(field)}
                                            type="password"
                                            placeholder="••••••••"
                                            className={`input input-bordered rounded-xl ${pwErrors[field] ? 'input-error' : ''}`}
                                        />
                                        {pwErrors[field] && <label className="label pt-1"><span className="label-text-alt text-error">{pwErrors[field]?.message}</span></label>}
                                    </div>
                                ))}
                                <button type="submit" disabled={passwordMutation.isPending} className="btn btn-primary w-full rounded-xl font-bold">
                                    {passwordMutation.isPending ? <span className="loading loading-spinner loading-sm" /> : 'Change Password'}
                                </button>
                            </form>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;
