import { Input, Field, Label } from '@headlessui/react';
import { Form, Formik } from 'formik';
import { Button } from '@headlessui/react';
import { useAuth } from '../../contexts/AuthContext';
import * as Yup from 'yup';
import { Link } from 'react-router';

export const Recover = () => {
  const { resetPassword, currentUser } = useAuth();

  return (
    <div className="mt-10 flex items-center justify-center">
      <h1>Password reset</h1>
      <Formik
        initialValues={{ email: '', password: '' }}
        validationSchema={Yup.object({
          email: Yup.string()
            .matches(/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/, 'Invalid email address')
            .required('Email is required'),
        })}
        onSubmit={async (values, { setSubmitting }) => {
          try {
            await resetPassword(values.email);
          } catch (error) {
          } finally {
            setSubmitting(false);
          }
        }}
      >
        {(formik) => {
          console.log(currentUser?.email);
          return (
            <Form>
              <Field>
                <Label>Email</Label>
                <Input
                  name="email"
                  type="email"
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  value={formik.values.email}
                />
                {formik.errors.email &&
                  formik.touched.email &&
                  formik.errors.email}
              </Field>

              {formik.isSubmitting ? (
                <>Submitting...</>
              ) : (
                <Button type="submit">Reset password</Button>
              )}
            </Form>
          );
        }}
      </Formik>
      <p>
        <Link to="/auth/log-in">Log in?</Link>
      </p>
    </div>
  );
};
