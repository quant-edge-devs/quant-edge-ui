import { Formik, Form, Field, ErrorMessage } from 'formik';
import emailjs from 'emailjs-com';
import { useState } from 'react';

export const ContactUs = () => {
  const contactEmail = 'admin@quantedgecorp.com';
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#1a0820] px-4">
      <div className="w-full max-w-lg rounded-2xl bg-[#231133] p-8 shadow-xl">
        <h2 className="mb-6 text-center text-3xl font-bold text-white">
          Contact Us
        </h2>
        <p className="mb-6 text-center text-purple-200">
          Email us at{' '}
          <a
            href={`mailto:${contactEmail}`}
            className="text-fuchsia-400 underline hover:text-fuchsia-300"
          >
            {contactEmail}
          </a>
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
            console.log(values.email);
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
            <Form className="flex flex-col gap-4">
              <div>
                <Field
                  className="w-full rounded-md bg-[#2d1840] p-3 text-white placeholder-slate-400 focus:ring-2 focus:ring-fuchsia-400 focus:outline-none"
                  type="text"
                  name="name"
                  placeholder="Your Name"
                />
                <ErrorMessage
                  name="name"
                  component="div"
                  className="mt-1 text-sm text-red-400"
                />
              </div>
              <div>
                <Field
                  className="w-full rounded-md bg-[#2d1840] p-3 text-white placeholder-slate-400 focus:ring-2 focus:ring-fuchsia-400 focus:outline-none"
                  type="email"
                  name="email"
                  placeholder="Your Email"
                />
                <ErrorMessage
                  name="email"
                  component="div"
                  className="mt-1 text-sm text-red-400"
                />
              </div>
              <div>
                <Field
                  as="textarea"
                  className="w-full rounded-md bg-[#2d1840] p-3 text-white placeholder-slate-400 focus:ring-2 focus:ring-fuchsia-400 focus:outline-none"
                  name="message"
                  placeholder="Your Message"
                  rows={5}
                />
                <ErrorMessage
                  name="message"
                  component="div"
                  className="mt-1 text-sm text-red-400"
                />
              </div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="mt-2 cursor-pointer rounded-lg bg-gradient-to-r from-fuchsia-500 to-purple-500 px-6 py-3 text-lg font-semibold text-white transition hover:from-fuchsia-600 hover:to-purple-600"
              >
                {isSubmitting ? 'Sending...' : 'Send Message'}
              </button>
              {sent && (
                <div className="mt-2 text-center text-green-400">
                  Thank you! Your message has been sent.
                </div>
              )}
              {error && (
                <div className="mt-2 text-center text-red-400">{error}</div>
              )}
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
};
