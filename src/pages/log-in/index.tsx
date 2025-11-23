import { Form, Formik } from 'formik';
import { Button } from '@headlessui/react';
import { useAuth } from '../../contexts/AuthContext';
import { Link } from 'react-router';

// SVG icons for Google and Apple
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

export const Login = () => {
  const { loginWithGoogle } = useAuth();

  return (
    <div className="flex justify-center bg-[#1a0820]">
      <div className="mt-16 flex w-full max-w-md flex-col items-center rounded-2xl bg-[#231133] p-8 shadow-xl">
        <h2 className="text-silver-100 mb-8 text-center text-3xl font-bold text-white">
          Sign in to QuantEdge
        </h2>
        <Formik initialValues={{}} onSubmit={() => {}}>
          {() => (
            <Form className="flex w-full flex-col gap-6">
              <Button
                type="button"
                className="mb-4 flex w-full cursor-pointer items-center justify-center rounded-lg bg-gradient-to-r from-slate-200 to-slate-400 py-3 text-lg font-semibold text-[#1a0820] shadow transition hover:from-slate-300 hover:to-slate-500"
                onClick={loginWithGoogle}
              >
                <GoogleIcon />
                Sign in with Google
              </Button>

              <div className="text-silver-100 mt-8 text-center text-white">
                Don't have an account?{' '}
                <Link
                  to="/sign-up"
                  className="text-purple-300 underline transition hover:text-fuchsia-400"
                >
                  Create one
                </Link>
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
};
