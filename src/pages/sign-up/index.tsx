import { Form, Field, Formik } from 'formik';
import { Button } from '@headlessui/react';
import { useAuth } from '../../contexts/AuthContext';
import { Link, useNavigate } from 'react-router';
import { useState } from 'react';
import { updateProfile } from 'firebase/auth';

const GoogleIcon = () => (
  <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
    <path
      fill="currentColor"
      d="M21.35 11.1h-9.18v2.98h5.24c-.23 1.22-1.39 3.58-5.24 3.58-3.15 0-5.72-2.61-5.72-5.83s2.57-5.83 5.72-5.83c1.8 0 3.01.77 3.7 1.43l2.53-2.46C17.02 4.6 15.13 3.5 12.17 3.5 6.97 3.5 2.83 7.64 2.83 12.84s4.14 9.34 9.34 9.34c5.39 0 8.96-3.79 8.96-9.13 0-.62-.07-1.23-.18-1.85z"
    />
  </svg>
);


export const SignUp = () => {
  const { signup, loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#06050f] px-4 py-12">
      {/* Ambient orbs */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 h-[600px] w-[600px] rounded-full bg-purple-600/10 blur-[120px]" />
        <div className="absolute -bottom-32 -right-32 h-[500px] w-[500px] rounded-full bg-indigo-600/8 blur-[100px]" />
      </div>

      {/* Card */}
      <div className="relative z-10 w-full max-w-sm animate-fade-up">
        {/* Logo */}
        <Link to="/" className="mb-8 block">
          <img src="/quantedge-logo.svg" alt="QuantEdge" className="h-8 w-auto" />
        </Link>

        <div className="rounded-2xl border border-white/[0.07] bg-white/[0.03] p-8 backdrop-blur-sm">
          <h1 className="mb-1 text-2xl font-semibold text-white">Create your account</h1>
          <p className="mb-7 text-sm text-white/45">Start analyzing markets today</p>

          {error && (
            <div className="mb-4 rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-xs text-red-400">
              {error}
            </div>
          )}

          <Formik
            initialValues={{
              firstName: '',
              lastName: '',
              email: '',
              password: '',
              confirmPassword: '',
            }}
            validate={(values) => {
              const errors: any = {};
              if (!values.firstName) errors.firstName = 'Required';
              if (!values.lastName) errors.lastName = 'Required';
              if (!values.email) errors.email = 'Required';
              if (!values.password) errors.password = 'Required';
              if (values.password !== values.confirmPassword)
                errors.confirmPassword = 'Passwords do not match';
              return errors;
            }}
            onSubmit={async (values, { setSubmitting }) => {
              setError('');
              setLoading(true);
              try {
                const userCredential = await signup(values.email, values.password);
                if (userCredential.user) {
                  await updateProfile(userCredential.user, {
                    displayName: `${values.firstName} ${values.lastName}`,
                  });
                }
                navigate('/charting');
              } catch (err: any) {
                setError(err.message || 'Failed to create account');
              }
              setLoading(false);
              setSubmitting(false);
            }}
          >
            {({ isSubmitting, errors, touched }) => (
              <Form className="flex flex-col gap-4">
                {/* First / Last name row */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-medium text-white/60" htmlFor="firstName">First name</label>
                    <Field
                      id="firstName"
                      name="firstName"
                      type="text"
                      placeholder="Jane"
                      className="w-full rounded-xl border border-white/[0.08] bg-white/[0.04] px-3.5 py-2.5 text-sm text-white placeholder-white/20 transition focus:border-purple-500/50 focus:bg-white/[0.06] focus:outline-none"
                    />
                    {errors.firstName && touched.firstName && (
                      <span className="text-[11px] text-red-400">{errors.firstName}</span>
                    )}
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-medium text-white/60" htmlFor="lastName">Last name</label>
                    <Field
                      id="lastName"
                      name="lastName"
                      type="text"
                      placeholder="Doe"
                      className="w-full rounded-xl border border-white/[0.08] bg-white/[0.04] px-3.5 py-2.5 text-sm text-white placeholder-white/20 transition focus:border-purple-500/50 focus:bg-white/[0.06] focus:outline-none"
                    />
                    {errors.lastName && touched.lastName && (
                      <span className="text-[11px] text-red-400">{errors.lastName}</span>
                    )}
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-white/60" htmlFor="email">Email</label>
                  <Field
                    id="email"
                    name="email"
                    type="email"
                    placeholder="you@example.com"
                    className="w-full rounded-xl border border-white/[0.08] bg-white/[0.04] px-3.5 py-2.5 text-sm text-white placeholder-white/20 transition focus:border-purple-500/50 focus:bg-white/[0.06] focus:outline-none"
                  />
                  {errors.email && touched.email && (
                    <span className="text-[11px] text-red-400">{errors.email}</span>
                  )}
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-white/60" htmlFor="password">Password</label>
                  <Field
                    id="password"
                    name="password"
                    type="password"
                    placeholder="••••••••"
                    className="w-full rounded-xl border border-white/[0.08] bg-white/[0.04] px-3.5 py-2.5 text-sm text-white placeholder-white/20 transition focus:border-purple-500/50 focus:bg-white/[0.06] focus:outline-none"
                  />
                  {errors.password && touched.password && (
                    <span className="text-[11px] text-red-400">{errors.password}</span>
                  )}
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-white/60" htmlFor="confirmPassword">Confirm password</label>
                  <Field
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    placeholder="••••••••"
                    className="w-full rounded-xl border border-white/[0.08] bg-white/[0.04] px-3.5 py-2.5 text-sm text-white placeholder-white/20 transition focus:border-purple-500/50 focus:bg-white/[0.06] focus:outline-none"
                  />
                  {errors.confirmPassword && touched.confirmPassword && (
                    <span className="text-[11px] text-red-400">{errors.confirmPassword}</span>
                  )}
                </div>

                <Button
                  type="submit"
                  disabled={isSubmitting || loading}
                  className="mt-1 w-full cursor-pointer rounded-xl bg-purple-600 py-2.5 text-sm font-semibold text-white shadow-lg shadow-purple-900/30 transition hover:bg-purple-500 disabled:opacity-60"
                >
                  {loading ? 'Creating account…' : 'Create account'}
                </Button>

                <div className="flex items-center gap-3 text-white/20">
                  <span className="h-px flex-1 bg-white/[0.06]" />
                  <span className="text-xs">or</span>
                  <span className="h-px flex-1 bg-white/[0.06]" />
                </div>

                <Button
                  type="button"
                  className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.03] py-2.5 text-sm text-white/70 transition hover:bg-white/[0.06] hover:text-white"
                  onClick={loginWithGoogle}
                >
                  <GoogleIcon />
                  Continue with Google
                </Button>

                <p className="text-center text-xs text-white/35">
                  Already have an account?{' '}
                  <Link to="/auth/log-in" className="text-purple-400 hover:text-purple-300">
                    Sign in
                  </Link>
                </p>
              </Form>
            )}
          </Formik>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
