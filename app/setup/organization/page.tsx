'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowRight, BarChart3, Building2, Loader2, Users } from 'lucide-react';
import { ApiError } from '@/lib/api/client';
import { organizationApi } from '@/lib/api/organization';
import { useAuth } from '@/contexts/AuthContext';

const schema = z.object({
  name: z.string().min(2, 'Organization name is required'),
  slug: z
    .string()
    .min(2, 'Workspace URL is required')
    .regex(/^[a-z0-9-]+$/, 'Use lowercase letters, numbers, and hyphens only'),
});

type FormValues = z.infer<typeof schema>;

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-{2,}/g, '-');
}

export default function OrganizationSetupPage() {
  const router = useRouter();
  const { user, setOrganization } = useAuth();
  const [serverError, setServerError] = useState<string | null>(null);
  const [slugEdited, setSlugEdited] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: '',
      slug: '',
    },
  });

  const orgName = watch('name');
  const emailDomainHint = useMemo(() => {
    if (!user?.email?.includes('@')) return 'your-team';
    return slugify(user.email.split('@')[1].split('.')[0] ?? 'your-team') || 'your-team';
  }, [user?.email]);

  const onSubmit = async (values: FormValues) => {
    setServerError(null);
    try {
      const response = await organizationApi.create(values);
      setOrganization(response.orgUuid);
      router.push('/integrations');
    } catch (error) {
      if (error instanceof ApiError) {
        setServerError(error.message);
      } else {
        setServerError('Unable to create your organization right now.');
      }
    }
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.18),_transparent_35%),linear-gradient(180deg,_#f7fbf9_0%,_#edf7f2_100%)] px-4 py-8">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-5xl items-center">
        <div className="grid w-full gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <section className="rounded-[28px] border border-emerald-100/80 bg-white/90 p-8 shadow-[0_24px_80px_rgba(15,23,42,0.08)] backdrop-blur lg:p-10">
            <div className="mb-8 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500 text-white shadow-lg shadow-emerald-500/25">
                <BarChart3 className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-medium uppercase tracking-[0.24em] text-emerald-600">
                  Founder Setup
                </p>
                <h1 className="text-3xl font-semibold tracking-tight text-slate-950">
                  Create your analytics workspace
                </h1>
              </div>
            </div>

            <div className="mb-8 grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
                <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
                  1
                </div>
                <p className="text-sm font-medium text-slate-900">Admin account</p>
                <p className="mt-1 text-xs text-slate-600">Created already for {user?.email ?? 'you'}.</p>
              </div>
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
                <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500 text-white">
                  2
                </div>
                <p className="text-sm font-medium text-slate-900">Workspace</p>
                <p className="mt-1 text-xs text-slate-600">Set the organization your team will use.</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
                <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900 text-white">
                  3
                </div>
                <p className="text-sm font-medium text-slate-900">Connect Shopify</p>
                <p className="mt-1 text-xs text-slate-600">Import store data after setup.</p>
              </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              {serverError && (
                <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {serverError}
                </div>
              )}

              <div className="space-y-2">
                <label htmlFor="name" className="text-sm font-medium text-slate-900">
                  Organization name
                </label>
                <input
                  id="name"
                  type="text"
                  placeholder="Northstar Commerce"
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-950 outline-none transition focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100"
                  {...register('name', {
                    onChange: (event) => {
                      if (!slugEdited) {
                        setValue('slug', slugify(event.target.value), { shouldValidate: true });
                      }
                    },
                  })}
                />
                {errors.name && <p className="text-xs text-red-600">{errors.name.message}</p>}
              </div>

              <div className="space-y-2">
                <label htmlFor="slug" className="text-sm font-medium text-slate-900">
                  Workspace URL
                </label>
                <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 focus-within:border-emerald-400 focus-within:ring-4 focus-within:ring-emerald-100">
                  <span className="text-sm text-slate-500">oplytics.ai/</span>
                  <input
                    id="slug"
                    type="text"
                    placeholder={emailDomainHint}
                    className="ml-1 w-[calc(100%-7rem)] bg-transparent text-sm text-slate-950 outline-none"
                    {...register('slug', {
                      onChange: (event) => {
                        setSlugEdited(true);
                        setValue('slug', slugify(event.target.value), { shouldValidate: true });
                      },
                    })}
                  />
                </div>
                {errors.slug && <p className="text-xs text-red-600">{errors.slug.message}</p>}
                <p className="text-xs text-slate-500">
                  Use a short company or brand slug so teammates can recognize it quickly.
                </p>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Building2 className="h-4 w-4" />}
                {isSubmitting ? 'Creating workspace…' : 'Create workspace'}
              </button>
            </form>
          </section>

          <aside className="flex flex-col justify-between rounded-[28px] bg-slate-950 p-8 text-white shadow-[0_24px_80px_rgba(15,23,42,0.14)] lg:p-10">
            <div>
              <p className="text-sm uppercase tracking-[0.22em] text-emerald-300">Recommended flow</p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight">
                Keep the first-run path focused.
              </h2>
              <div className="mt-8 space-y-4">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="mb-2 flex items-center gap-2 text-emerald-300">
                    <Users className="h-4 w-4" />
                    <span className="text-sm font-medium">Invite members after data is live</span>
                  </div>
                  <p className="text-sm text-slate-300">
                    Founders usually want one thing first: connect Shopify and see the first dashboard.
                  </p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="mb-2 flex items-center gap-2 text-emerald-300">
                    <ArrowRight className="h-4 w-4" />
                    <span className="text-sm font-medium">After this screen</span>
                  </div>
                  <p className="text-sm text-slate-300">
                    You’ll land on integrations next, where Shopify can be connected right away.
                  </p>
                </div>
              </div>
            </div>
            <p className="mt-10 text-sm text-slate-400">
              Best practice for analytics SaaS: account first, workspace second, data connection third, team invites fourth.
            </p>
          </aside>
        </div>
      </div>
    </div>
  );
}
