import { Form, Field, Formik } from 'formik';
import { Button } from '@headlessui/react';
import { useAuth } from '../../contexts/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { updateProfile } from 'firebase/auth';

const GoogleIcon = () => (
  <svg className="mr-2 h-6 w-6" viewBox="0 0 24 24">
    <g>
      <path
        fill="#fff"
        d="M21.35 11.1h-9.18v2.98h5.24c-.23 1.22-1.39 3.58-5.24 3.58-3.15 0-5.72-2.61-5.72-5.83s2.57-5.83 5.72-5.83c1.8 0 3.01.77 3.7 1.43l2.53-2.46C17.02 4.6 15.13 3.5 12.17 3.5 6.97 3.5 2.83 7.64 2.83 12.84s4.14 9.34 9.34 9.34c5.39 0 8.96-3.79 8.96-9.13 0-.62-.07-1.23-.18-1.85z"
      />
    </g>
  </svg>
);

export const SignUp = () => {
  const { signup, loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  return (
    <div className="flex min-h-screen">
      {/* Left: Sign up form */}
      <div className="flex w-full flex-col justify-center bg-[#0e1020] px-12 py-16 text-white md:w-1/2">
        <Link
          to="/"
          className="mb-8 flex items-center gap-3 text-2xl font-bold"
        >
          <span className="rounded-xl bg-[#672eeb] p-3">
            <svg width="32" height="32" fill="none" viewBox="0 0 32 32">
              <rect width="32" height="32" rx="12" fill="#672eeb" />
              <path
                d="M10 22V12M16 22V16M22 22V10"
                stroke="#fff"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </span>
          QuantEdge
        </Link>
        <h2 className="mb-2 text-3xl font-bold">Create your account</h2>
        <p className="mb-8 text-lg text-slate-300">
          Sign up to access your analytics dashboard
        </p>
        {error && <div className="mb-4 text-red-400">{error}</div>}
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
              const userCredential = await signup(
                values.email,
                values.password
              );
              // Optionally update displayName using Firebase's updateProfile
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
            <Form className="flex w-full flex-col gap-4">
              <label className="text-sm font-semibold" htmlFor="firstName">
                First Name
              </label>
              <Field
                id="firstName"
                name="firstName"
                type="text"
                placeholder="First Name"
                className="mb-2 w-full rounded-lg border border-slate-700 bg-[#181a2a] px-4 py-3 text-white focus:outline-none"
              />
              {errors.firstName && touched.firstName && (
                <div className="text-xs text-red-400">{errors.firstName}</div>
              )}
              <label className="text-sm font-semibold" htmlFor="lastName">
                Last Name
              </label>
              <Field
                id="lastName"
                name="lastName"
                type="text"
                placeholder="Last Name"
                className="mb-2 w-full rounded-lg border border-slate-700 bg-[#181a2a] px-4 py-3 text-white focus:outline-none"
              />
              {errors.lastName && touched.lastName && (
                <div className="text-xs text-red-400">{errors.lastName}</div>
              )}
              <label className="text-sm font-semibold" htmlFor="email">
                Email
              </label>
              <Field
                id="email"
                name="email"
                type="email"
                placeholder="you@example.com"
                className="mb-2 w-full rounded-lg border border-slate-700 bg-[#181a2a] px-4 py-3 text-white focus:outline-none"
              />
              {errors.email && touched.email && (
                <div className="text-xs text-red-400">{errors.email}</div>
              )}
              <label className="text-sm font-semibold" htmlFor="password">
                Password
              </label>
              <Field
                id="password"
                name="password"
                type="password"
                placeholder="••••••••"
                className="mb-2 w-full rounded-lg border border-slate-700 bg-[#181a2a] px-4 py-3 text-white focus:outline-none"
              />
              {errors.password && touched.password && (
                <div className="text-xs text-red-400">{errors.password}</div>
              )}
              <label
                className="text-sm font-semibold"
                htmlFor="confirmPassword"
              >
                Confirm Password
              </label>
              <Field
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                placeholder="••••••••"
                className="mb-2 w-full rounded-lg border border-slate-700 bg-[#181a2a] px-4 py-3 text-white focus:outline-none"
              />
              {errors.confirmPassword && touched.confirmPassword && (
                <div className="text-xs text-red-400">
                  {errors.confirmPassword}
                </div>
              )}
              <Button
                type="submit"
                disabled={isSubmitting || loading}
                className="mt-2 mb-2 flex w-full cursor-pointer items-center justify-center rounded-lg bg-[#672eeb] py-3 text-lg font-semibold text-white shadow transition hover:bg-[#353967]"
              >
                {loading ? 'Signing Up...' : 'Sign Up'}
              </Button>
              <div className="my-2 flex items-center justify-center gap-2 text-slate-400">
                <span className="h-px w-16 bg-slate-700" />
                <span className="text-sm">or continue with</span>
                <span className="h-px w-16 bg-slate-700" />
              </div>
              <div className="flex items-center justify-center">
                <Button
                  type="button"
                  className="flex w-1/2 items-center justify-center rounded-lg border border-slate-600 bg-[#181a2a] py-3 text-white hover:bg-[#231133]"
                  onClick={loginWithGoogle}
                >
                  <GoogleIcon /> Google
                </Button>
              </div>
              <div className="mt-6 text-center text-sm text-slate-400">
                Already have an account?{' '}
                <Link
                  to="/auth/log-in"
                  className="text-[#672eeb] hover:underline"
                >
                  Sign in
                </Link>
              </div>
            </Form>
          )}
        </Formik>
      </div>
      {/* Right: Marketing panel */}
      <div className="hidden w-1/2 flex-col items-center justify-center bg-gradient-to-br from-[#6d28d9] to-[#0e1020] p-16 text-white md:flex">
        <div className="flex flex-col items-center justify-center">
          <span className="mb-8 rounded-2xl bg-[#0a0a8b] p-8">
            <svg width="64" height="64" fill="none" viewBox="0 0 32 32">
              <rect width="32" height="32" rx="12" fill="#0a0a8b" />
              <path
                d="M10 22V12M16 22V16M22 22V10"
                stroke="#fff"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </span>
          <h2 className="mb-4 text-3xl font-bold">Start analyzing today</h2>
          <p className="max-w-xs text-center text-lg text-slate-200">
            Access powerful financial analytics tools used by institutional
            investors worldwide.
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
