import { Formik, Form, Field, ErrorMessage } from 'formik';
import emailjs from 'emailjs-com';
import { useState } from 'react';
import { Link } from 'react-router-dom';

export const ContactUs = () => {
  const contactEmail = 'admin@quantedgecorp.com';
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  return (
    <div className="font-inter flex min-h-screen w-full items-center justify-center bg-[radial-gradient(ellipse_at_center,_#1E1B4B_30%,_#0F172A_100%)] px-4 text-white">
      {/* Logo and home link at top left */}
      <Link
        to="/"
        className="fixed top-8 left-8 z-50 flex items-center gap-4"
        style={{ textDecoration: 'none' }}
      >
        <span className="rounded-xl bg-[#672eeb] p-2">
          <svg width="40" height="40" fill="none" viewBox="0 0 32 32">
            <rect width="32" height="32" rx="12" fill="#672eeb" />
            <path
              d="M10 22V12M16 22V16M22 22V10"
              stroke="#fff"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </span>
        <span className="ml-2 text-3xl font-bold text-white">QuantEdge</span>
      </Link>
      <div className="w-full max-w-lg rounded-2xl border border-[#672eeb] bg-[#181a2a] p-10 shadow-2xl">
        <h2 className="mb-4 text-center text-3xl font-extrabold text-white">
          Contact Us
        </h2>
        <p className="mb-6 text-center text-lg text-purple-200">
          Email us at{' '}
          <a
            href={`mailto:${contactEmail}`}
            className="text-fuchsia-400 underline hover:text-fuchsia-300"
          ></a>
        </p>

        <Formik
          initialValues={{ name: '', email: '', message: '' }}
          validate={(values) => {
            const errors: { name?: string; email?: string; message?: string } =
              {};
            if (!values.name) errors.name = 'Required';
            if (!values.email) {
              errors.email = 'Required';
            } else if (
              !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(values.email)
            ) {
              errors.email = 'Invalid email address';
            }
            if (!values.message) errors.message = 'Required';
            return errors;
          }}
          onSubmit={(values, { setSubmitting, resetForm }) => {
            setError('');
            setSent(false);
            emailjs
              .send(
                import.meta.env.VITE_EMAILJS_SERVICE_ID,
                import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
                {
                  from_name: values.name,
                  from_email: values.email,
                  to_email: values.email,
                  message: values.message,
                },
                import.meta.env.VITE_EMAILJS_USER_ID
              )
              .then(
                () => {
                  setSent(true);
                  resetForm();
                  setSubmitting(false);
                },
                () => {
                  setError('Failed to send message. Please try again.');
                  setSubmitting(false);
                }
              );
          }}
        >
          {({ isSubmitting }) => (
            <Form className="flex flex-col gap-5">
              <div>
                <label className="mb-1 block text-xs text-purple-200">
                  Name
                </label>
                <Field
                  className="w-full rounded-md border border-[#672eeb] bg-[#23203a] p-3 text-white placeholder-purple-200 focus:ring-1 focus:ring-[#672eeb] focus:outline-none"
                  type="text"
                  name="name"
                  placeholder="Your Name"
                />
                <ErrorMessage
                  name="name"
                  component="div"
                  className="mt-1 text-sm text-pink-400"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs text-purple-200">
                  Email
                </label>
                <Field
                  className="w-full rounded-md border border-[#672eeb] bg-[#23203a] p-3 text-white placeholder-purple-200 focus:ring-1 focus:ring-[#672eeb] focus:outline-none"
                  type="email"
                  name="email"
                  placeholder="Your Email"
                />
                <ErrorMessage
                  name="email"
                  component="div"
                  className="mt-1 text-sm text-pink-400"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs text-purple-200">
                  Message
                </label>
                <Field
                  as="textarea"
                  className="w-full rounded-md border border-[#672eeb] bg-[#23203a] p-3 text-white placeholder-purple-200 focus:ring-1 focus:ring-[#672eeb] focus:outline-none"
                  name="message"
                  placeholder="Your Message"
                  rows={5}
                />
                <ErrorMessage
                  name="message"
                  component="div"
                  className="mt-1 text-sm text-pink-400"
                />
              </div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="mt-2 cursor-pointer rounded-lg bg-[#672eeb] px-6 py-3 text-lg font-semibold text-white shadow transition hover:from-fuchsia-600 hover:to-purple-600"
              >
                {isSubmitting ? 'Sending...' : 'Send Message'}
              </button>
              {sent && (
                <div className="mt-2 text-center text-green-400">
                  Thank you! Your message has been sent.
                </div>
              )}
              {error && (
                <div className="mt-2 text-center text-pink-400">{error}</div>
              )}
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
};
