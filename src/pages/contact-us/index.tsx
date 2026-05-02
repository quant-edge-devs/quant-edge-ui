import { Formik, Form, Field, ErrorMessage } from 'formik';
import emailjs from 'emailjs-com';
import { useState } from 'react';
import { Link } from 'react-router';

export const ContactUs = () => {
  const contactEmail = 'admin@quantedgecorp.com';
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#06050f] px-4 py-12 text-white">

      {/* Ambient orbs */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 h-[600px] w-[600px] rounded-full bg-purple-600/10 blur-[120px]" />
        <div className="absolute -bottom-32 -right-32 h-[500px] w-[500px] rounded-full bg-indigo-600/8 blur-[100px]" />
      </div>

      <div className="relative z-10 w-full max-w-md animate-fade-up">
        {/* Logo */}
        <Link to="/" className="mb-8 block">
          <img src="/quantedge-logo.svg" alt="QuantEdge" className="h-8 w-auto" />
        </Link>

        <div className="rounded-2xl border border-white/[0.07] bg-white/[0.03] p-8 backdrop-blur-sm">
          <h1 className="mb-1 text-2xl font-semibold text-white">Get in touch</h1>
          <p className="mb-7 text-sm text-white/45">
            Reach us directly at{' '}
            <a href={`mailto:${contactEmail}`} className="text-purple-400 hover:text-purple-300">
              {contactEmail}
            </a>
          </p>

          <Formik
            initialValues={{ name: '', email: '', message: '' }}
            validate={(values) => {
              const errors: { name?: string; email?: string; message?: string } = {};
              if (!values.name) errors.name = 'Required';
              if (!values.email) {
                errors.email = 'Required';
              } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(values.email)) {
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
                  () => { setSent(true); resetForm(); setSubmitting(false); },
                  () => { setError('Failed to send message. Please try again.'); setSubmitting(false); }
                );
            }}
          >
            {({ isSubmitting }) => (
              <Form className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-white/60" htmlFor="name">Name</label>
                  <Field
                    id="name"
                    name="name"
                    type="text"
                    placeholder="Your name"
                    className="w-full rounded-xl border border-white/[0.08] bg-white/[0.04] px-3.5 py-2.5 text-sm text-white placeholder-white/20 transition focus:border-purple-500/50 focus:bg-white/[0.06] focus:outline-none"
                  />
                  <ErrorMessage name="name" component="div" className="text-[11px] text-red-400" />
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
                  <ErrorMessage name="email" component="div" className="text-[11px] text-red-400" />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-white/60" htmlFor="message">Message</label>
                  <Field
                    as="textarea"
                    id="message"
                    name="message"
                    placeholder="How can we help?"
                    rows={5}
                    className="w-full resize-none rounded-xl border border-white/[0.08] bg-white/[0.04] px-3.5 py-2.5 text-sm text-white placeholder-white/20 transition focus:border-purple-500/50 focus:bg-white/[0.06] focus:outline-none"
                  />
                  <ErrorMessage name="message" component="div" className="text-[11px] text-red-400" />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="mt-1 w-full cursor-pointer rounded-xl bg-purple-600 py-2.5 text-sm font-semibold text-white shadow-lg shadow-purple-900/30 transition hover:bg-purple-500 disabled:opacity-60"
                >
                  {isSubmitting ? 'Sending…' : 'Send message'}
                </button>

                {sent && (
                  <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-3 py-2 text-center text-xs text-emerald-400">
                    Message sent — we'll get back to you shortly.
                  </div>
                )}
                {error && (
                  <div className="rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-center text-xs text-red-400">
                    {error}
                  </div>
                )}
              </Form>
            )}
          </Formik>
        </div>
      </div>
    </div>
  );
};
