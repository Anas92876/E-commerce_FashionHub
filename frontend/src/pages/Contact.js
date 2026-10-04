import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import axios from 'axios';
import { EnvelopeOpenIcon, MapIcon, TruckIcon, ArrowRightIcon } from '@heroicons/react/24/outline';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import SEO from '../components/SEO';
import PageHeader from '../components/PageHeader';
import useSubmitOnce from '../hooks/useSubmitOnce';
import { API_URL } from '../utils/api';

const EMPTY = { name: '', email: '', phone: '', subject: '', message: '' };
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const validate = (form) => {
  const errors = {};
  if (!form.name.trim()) errors.name = 'Please tell us your name';
  if (!form.email.trim()) errors.email = 'Email is required';
  else if (!EMAIL_RE.test(form.email)) errors.email = 'Please enter a valid email address';
  if (!form.subject.trim()) errors.subject = 'Please add a subject';
  if (!form.message.trim()) errors.message = 'Please write a message';
  return errors;
};

// Only what the store really does (see Benefits on the home page):
// messages land in the admin inbox and are answered by email
const INFO = [
  {
    icon: EnvelopeOpenIcon,
    title: 'Where your message goes',
    text: 'Straight to the ZAYRO team inbox. We reply to the email address you give us.',
  },
  {
    icon: MapIcon,
    title: 'About an order?',
    text: 'You can follow every step of your order in My Orders.',
    link: { to: '/my-orders', label: 'Go to My Orders' },
  },
  {
    icon: TruckIcon,
    title: 'Delivery & payment',
    text: 'Free shipping on every order, and you pay cash on delivery.',
  },
];

const inputClass = (invalid) =>
  `w-full rounded-md border bg-white px-4 text-[15px] text-ink placeholder-stone-400 transition focus:outline-none focus:ring-2 dark:bg-gray-900 dark:text-white dark:placeholder-gray-500 ${
    invalid
      ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20 dark:border-red-400'
      : 'border-stone-300 focus:border-primary-600 focus:ring-primary-600/20 dark:border-gray-700'
  }`;

const Field = ({ id, label, optional, error, children }) => (
  <div>
    <label htmlFor={id} className="flex items-baseline justify-between text-sm font-semibold text-ink dark:text-white">
      {label}
      {optional && <span className="text-xs font-normal text-stone-500 dark:text-gray-400">Optional</span>}
    </label>
    <div className="mt-2">{children}</div>
    {error && (
      <p id={`${id}-error`} className="mt-2 text-sm text-red-600 dark:text-red-400">
        {error}
      </p>
    )}
  </div>
);

const Contact = () => {
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const [handleSubmit, sending] = useSubmitOnce(async () => {
    const found = validate(form);
    setErrors(found);
    if (Object.keys(found).length > 0) {
      toast.error('Please fill in the highlighted fields');
      document.getElementById(Object.keys(found)[0])?.focus();
      return;
    }

    try {
      const { data } = await axios.post(`${API_URL}/contact`, form);
      if (data.success) {
        toast.success(data.message || 'Message sent. We’ll get back to you soon.');
        setForm(EMPTY);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send message. Please try again.');
    }
  });

  // props shared by every input
  const field = (name) => ({
    id: name,
    name,
    value: form[name],
    onChange: handleChange,
    'aria-invalid': Boolean(errors[name]),
    'aria-describedby': errors[name] ? `${name}-error` : undefined,
  });

  return (
    <div className="flex min-h-screen flex-col bg-canvas pt-16 dark:bg-gray-950">
      <SEO title="Contact us" description="Questions about an order or a product? Send the ZAYRO team a message." />
      <Navbar />

      <main className="flex-1">
        {/* Header: title + store photo */}
        <section className="mx-auto grid max-w-7xl items-end gap-10 px-4 pt-12 sm:px-6 sm:pt-16 lg:grid-cols-[1fr_1.1fr] lg:gap-16 lg:px-8">
          <PageHeader
            eyebrow="Contact"
            title="Let’s"
            accent="talk."
            intro="A question about sizing, an order or a piece you love? Send us a message and the team will get back to you by email."
            className="lg:pb-10"
          />
          <div className="relative -mx-4 overflow-hidden bg-stone-200 motion-safe:animate-hero-reveal dark:bg-gray-800 sm:mx-0">
            <img
              src="/images/contact/clothing-rail-960.webp"
              srcSet="/images/contact/clothing-rail-640.webp 640w, /images/contact/clothing-rail-960.webp 960w, /images/contact/clothing-rail-1280.webp 1280w"
              sizes="(min-width: 1024px) 50vw, 100vw"
              alt="Blouses and knitwear in soft neutrals hanging on a simple rail against a white wall"
              width="1280"
              height="853"
              className="aspect-[3/2] w-full object-cover motion-safe:animate-hero-settle"
            />
          </div>
        </section>

        {/* Info + form */}
        <section className="mx-auto grid max-w-7xl gap-12 px-4 py-16 sm:px-6 lg:grid-cols-[1fr_1.4fr] lg:gap-16 lg:px-8 lg:py-20">
          <div>
            <h2 className="text-2xl font-medium text-ink dark:text-white sm:text-3xl">
              Good to <span className="font-serif italic">know</span>
            </h2>
            <ul className="mt-8 divide-y divide-stone-200 border-y border-stone-200 dark:divide-gray-800 dark:border-gray-800">
              {INFO.map(({ icon: Icon, title, text, link }) => (
                <li key={title} className="flex gap-4 py-6">
                  <Icon className="mt-0.5 h-6 w-6 flex-shrink-0 text-ink dark:text-white" aria-hidden="true" />
                  <div>
                    <p className="text-sm font-semibold text-ink dark:text-white">{title}</p>
                    <p className="mt-1 text-sm leading-relaxed text-stone-600 dark:text-gray-400">{text}</p>
                    {link && (
                      <Link
                        to={link.to}
                        className="group mt-2 inline-flex items-center gap-1.5 text-sm font-semibold text-ink underline-offset-4 hover:underline focus:outline-none focus-visible:underline dark:text-white"
                      >
                        {link.label}
                        <ArrowRightIcon className="h-4 w-4 transition-transform group-hover:translate-x-0.5 motion-reduce:transition-none" aria-hidden="true" />
                      </Link>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <form
            onSubmit={handleSubmit}
            noValidate
            aria-labelledby="contact-form-heading"
            className="border border-stone-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900 sm:p-10"
          >
            <h2 id="contact-form-heading" className="text-2xl font-medium text-ink dark:text-white sm:text-3xl">
              Send a <span className="font-serif italic">message</span>
            </h2>

            <div className="mt-8 grid gap-6 sm:grid-cols-2">
              <Field id="name" label="Full name" error={errors.name}>
                <input {...field('name')} autoComplete="name" placeholder="Sara Ahmed" className={`h-12 ${inputClass(errors.name)}`} />
              </Field>
              <Field id="email" label="Email" error={errors.email}>
                <input {...field('email')} type="email" autoComplete="email" placeholder="you@example.com" className={`h-12 ${inputClass(errors.email)}`} />
              </Field>
              <Field id="phone" label="Phone" optional>
                <input {...field('phone')} type="tel" autoComplete="tel" placeholder="+963 9xx xxx xxx" className={`h-12 ${inputClass(false)}`} />
              </Field>
              <Field id="subject" label="Subject" error={errors.subject}>
                <input {...field('subject')} placeholder="How can we help?" className={`h-12 ${inputClass(errors.subject)}`} />
              </Field>
              <div className="sm:col-span-2">
                <Field id="message" label="Message" error={errors.message}>
                  <textarea
                    {...field('message')}
                    rows={6}
                    placeholder="Write your message here…"
                    className={`resize-y py-3 [overflow-wrap:anywhere] ${inputClass(errors.message)}`}
                  />
                </Field>
              </div>
            </div>

            <div className="mt-8 flex flex-col-reverse gap-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs text-stone-500 dark:text-gray-400">We only use your details to reply to you.</p>
              <button
                type="submit"
                disabled={sending}
                className="h-12 rounded-md bg-primary-600 px-8 text-sm font-semibold text-white transition-colors hover:bg-primary-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 dark:focus-visible:ring-offset-gray-900"
              >
                {sending ? 'Sending…' : 'Send message'}
              </button>
            </div>
          </form>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Contact;
