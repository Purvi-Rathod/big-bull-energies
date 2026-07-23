"use client";

import { useState } from "react";
import Image from "next/image";
import { Phone, Mail, MapPin, Send, CheckCircle2, Loader2 } from "lucide-react";
import Footer from "@/components/Footer";
import { api } from "@/lib/api";

const FONT_STACK =
  "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";

const SUPPORT_PHONE = "+44 7452 321003";
const SUPPORT_PHONE_TEL = "+447452321003";
const SUPPORT_EMAIL = "bigbullenergies@gmail.com";

const SUBJECT_OPTIONS = [
  { value: "general", label: "General Inquiry" },
  { value: "partnership", label: "Partnership" },
  { value: "services", label: "Services" },
  { value: "investment", label: "Investment" },
  { value: "support", label: "Support" },
  { value: "careers", label: "Careers" },
  { value: "other", label: "Other" },
];

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const scrollToForm = () => {
    const el = document.getElementById("contact-form");
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY - 160;
    window.scrollTo({ top, behavior: "smooth" });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    setSubmitting(true);
    try {
      const subjectLabel =
        SUBJECT_OPTIONS.find((s) => s.value === formData.subject)?.label ||
        formData.subject;
      const res = await api.sendContactMessage({
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim() || undefined,
        subject: subjectLabel,
        message: formData.message.trim(),
      });
      setSuccessMsg(
        res.message ||
          "Your message has been sent. We'll get back to you soon.",
      );
      setFormData({
        name: "",
        email: "",
        phone: "",
        subject: "",
        message: "",
      });
    } catch (err: any) {
      setErrorMsg(
        err?.message ||
          "Unable to send your message. Please try again or email bigbullenergies@gmail.com.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const NAVY = "#0B1F3A";
  const TEAL = "#0F9E97";
  const GOLD = "#F5B300";
  const MINT = "#E8F5F0";

  return (
    <main
      className="min-h-screen w-full overflow-x-hidden bg-white"
      style={{ fontFamily: FONT_STACK }}
    >
      {/* Hero Section */}
      <section className="relative w-full py-6 md:py-10 lg:py-14">
        <div className="relative w-full min-h-[600px] md:min-h-[680px] lg:min-h-[720px] overflow-hidden">
          <Image
            src="/images/hero-contact.png"
            alt="Big Bull Energies headquarters with wind turbines"
            fill
            priority
            className="object-cover object-right"
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(90deg, rgba(235,243,240,0.98) 0%, rgba(235,243,240,0.92) 32%, rgba(235,243,240,0.55) 52%, rgba(235,243,240,0.05) 68%, rgba(235,243,240,0) 80%)",
            }}
          />

          <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 h-full">
            <div className="max-w-7xl mx-auto pt-16 sm:pt-24 md:pt-32 lg:pt-40 pb-28 md:pb-32">
              <div className="flex items-center gap-3 mb-6 md:mb-8">
                <div className="h-px w-10" style={{ backgroundColor: GOLD }} />
                <span
                  className="text-xs font-bold uppercase tracking-widest"
                  style={{ color: TEAL }}
                >
                  Contact Us
                </span>
              </div>

              <h1
                className="text-3xl md:text-4xl lg:text-5xl font-bold leading-[1.1] mb-6 md:mb-8"
                style={{ color: NAVY }}
              >
                Let&apos;s connect
                <br />
                and build a
                <br />
                <span style={{ color: TEAL }}>sustainable</span> future
              </h1>

              <p
                className="text-base md:text-lg leading-relaxed mb-8 md:mb-10 max-w-md"
                style={{ color: NAVY, opacity: 0.75 }}
              >
                We&apos;re here to help. Reach out to us for any questions,
                inquiries, or to learn more about Big Bull Energies.
              </p>

              <button
                type="button"
                onClick={scrollToForm}
                className="inline-flex items-center gap-2 font-bold px-7 py-4 text-sm uppercase tracking-wide rounded-full transition hover:opacity-90"
                style={{ backgroundColor: GOLD, color: NAVY }}
              >
                <Send className="w-4 h-4" />
                Send a Message
              </button>
            </div>
          </div>
        </div>

        {/* Floating contact info card */}
        <div className="relative container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto -mt-16 md:-mt-20 bg-white rounded-2xl shadow-xl py-8 px-8 lg:px-12">
            <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-gray-200">
              <div className="flex items-center gap-5 py-6 md:py-2 md:px-8">
                <div
                  className="w-14 h-14 rounded-full flex items-center justify-center shrink-0"
                  style={{ backgroundColor: "#ECFAF9" }}
                >
                  <Phone className="w-6 h-6" style={{ color: TEAL }} />
                </div>
                <div>
                  <h3
                    className="text-[17px] font-semibold mb-1"
                    style={{ color: NAVY }}
                  >
                    Phone
                  </h3>
                  <a
                    href={`tel:${SUPPORT_PHONE_TEL}`}
                    className="block text-sm font-medium hover:opacity-80"
                    style={{ color: NAVY }}
                  >
                    {SUPPORT_PHONE}
                  </a>
                  <p
                    className="text-xs mt-1"
                    style={{ color: NAVY, opacity: 0.55 }}
                  >
                    Mon–Fri 9:00 AM – 6:00 PM GMT
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-5 py-6 md:py-2 md:px-8">
                <div
                  className="w-14 h-14 rounded-full flex items-center justify-center shrink-0"
                  style={{ backgroundColor: "#ECFAF9" }}
                >
                  <Mail className="w-6 h-6" style={{ color: TEAL }} />
                </div>
                <div>
                  <h3
                    className="text-[17px] font-semibold mb-1"
                    style={{ color: NAVY }}
                  >
                    Email
                  </h3>
                  <a
                    href={`mailto:${SUPPORT_EMAIL}`}
                    className="block text-sm font-medium hover:opacity-80"
                    style={{ color: NAVY }}
                  >
                    {SUPPORT_EMAIL}
                  </a>
                  <p
                    className="text-xs mt-1"
                    style={{ color: NAVY, opacity: 0.55 }}
                  >
                    We typically respond within 24 hours
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-5 py-6 md:py-2 md:px-8">
                <div
                  className="w-14 h-14 rounded-full flex items-center justify-center shrink-0"
                  style={{ backgroundColor: "#ECFAF9" }}
                >
                  <MapPin className="w-6 h-6" style={{ color: TEAL }} />
                </div>
                <div>
                  <h3
                    className="text-[17px] font-semibold mb-1"
                    style={{ color: NAVY }}
                  >
                    Address
                  </h3>
                  <p className="text-sm font-medium" style={{ color: NAVY }}>
                    Big Bull Energies Headquarters,
                  </p>
                  <p
                    className="text-xs mt-1"
                    style={{ color: NAVY, opacity: 0.55 }}
                  >
                    United Kingdom
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Form Section */}
      <section
        id="contact-form"
        className="relative w-full bg-white py-20 sm:py-24 md:py-28 lg:py-32 scroll-mt-40"
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-stretch">
              <div
                className="rounded-2xl p-8 sm:p-10 lg:p-12 flex flex-col"
                style={{ backgroundColor: NAVY }}
              >
                <div className="flex items-center gap-3 mb-8">
                  <div
                    className="w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: TEAL }}
                  >
                    <Send className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl md:text-3xl font-bold text-white">
                      Send us a message
                    </h2>
                    <div
                      className="h-1 w-10 mt-2 rounded-full"
                      style={{ backgroundColor: TEAL }}
                    />
                  </div>
                </div>

                <form
                  onSubmit={handleSubmit}
                  className="space-y-5 flex-1 flex flex-col"
                >
                  <div>
                    <label
                      htmlFor="name"
                      className="block text-xs font-bold uppercase tracking-wide mb-2 text-white/80"
                    >
                      Full Name *
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      required
                      placeholder="Enter your full name"
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-md bg-transparent border border-white/25 text-white placeholder-white/40 transition focus:outline-none focus:ring-2"
                      style={{ ["--tw-ring-color" as string]: TEAL }}
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="email"
                      className="block text-xs font-bold uppercase tracking-wide mb-2 text-white/80"
                    >
                      Email Address *
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      required
                      placeholder="Enter your email address"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-md bg-transparent border border-white/25 text-white placeholder-white/40 transition focus:outline-none focus:ring-2"
                      style={{ ["--tw-ring-color" as string]: TEAL }}
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="phone"
                      className="block text-xs font-bold uppercase tracking-wide mb-2 text-white/80"
                    >
                      Phone
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      placeholder="Enter your phone number"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-md bg-transparent border border-white/25 text-white placeholder-white/40 transition focus:outline-none focus:ring-2"
                      style={{ ["--tw-ring-color" as string]: TEAL }}
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="subject"
                      className="block text-xs font-bold uppercase tracking-wide mb-2 text-white/80"
                    >
                      Subject *
                    </label>
                    <select
                      id="subject"
                      name="subject"
                      required
                      value={formData.subject}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-md bg-transparent border border-white/25 text-white transition focus:outline-none focus:ring-2"
                      style={{ ["--tw-ring-color" as string]: TEAL }}
                    >
                      <option value="" className="text-black">
                        Select a subject
                      </option>
                      {SUBJECT_OPTIONS.map((opt) => (
                        <option
                          key={opt.value}
                          value={opt.value}
                          className="text-black"
                        >
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex-1 flex flex-col">
                    <label
                      htmlFor="message"
                      className="block text-xs font-bold uppercase tracking-wide mb-2 text-white/80"
                    >
                      Message *
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      required
                      rows={5}
                      placeholder="Write your message here..."
                      value={formData.message}
                      onChange={handleChange}
                      className="w-full flex-1 px-4 py-3 rounded-md bg-transparent border border-white/25 text-white placeholder-white/40 resize-none transition focus:outline-none focus:ring-2"
                      style={{ ["--tw-ring-color" as string]: TEAL }}
                    />
                  </div>

                  {successMsg && (
                    <div className="flex items-start gap-2 rounded-lg bg-emerald-500/15 border border-emerald-400/40 px-4 py-3 text-sm text-emerald-200">
                      <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
                      <p>{successMsg}</p>
                    </div>
                  )}
                  {errorMsg && (
                    <div className="rounded-lg bg-red-500/15 border border-red-400/40 px-4 py-3 text-sm text-red-200">
                      {errorMsg}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full font-bold px-8 py-4 text-sm uppercase tracking-wide rounded-full transition hover:opacity-90 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                    style={{ backgroundColor: GOLD, color: NAVY }}
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Sending…
                      </>
                    ) : (
                      <>
                        <Send className="w-5 h-5" />
                        Send Message
                      </>
                    )}
                  </button>
                </form>
              </div>

              <div className="relative rounded-2xl overflow-hidden min-h-[520px] lg:min-h-0">
                <Image
                  src="/images/cta-turbines.png"
                  alt="Wind turbines on rolling hills"
                  fill
                  className="object-cover"
                />
                <div
                  className="absolute inset-0"
                  style={{
                    background:
                      "linear-gradient(180deg, rgba(255,255,255,0.88) 0%, rgba(255,255,255,0.72) 55%, rgba(255,255,255,0.45) 100%)",
                  }}
                />

                <div className="relative h-full flex flex-col p-8 sm:p-10 lg:p-10">
                  <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-2 leading-tight text-black">
                    We&apos;d love to
                    <br />
                    <span style={{ color: TEAL }}>hear from you</span>
                  </h2>
                  <div
                    className="h-1 w-12 mt-3 mb-6 rounded-full"
                    style={{ backgroundColor: TEAL }}
                  />
                  <p className="text-base md:text-lg leading-relaxed mb-8 text-black/80">
                    Whether you have a question about our wind energy solutions,
                    need assistance, or want to explore partnership
                    opportunities, we&apos;re here to help.
                  </p>

                  <div className="space-y-6">
                    <div className="flex items-start gap-4">
                      <div
                        className="w-14 h-14 rounded-full flex items-center justify-center flex-shrink-0 backdrop-blur-sm"
                        style={{ backgroundColor: MINT }}
                      >
                        <Phone className="w-6 h-6 text-black" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold mb-1 text-black">
                          Call us
                        </h3>
                        <a
                          href={`tel:${SUPPORT_PHONE_TEL}`}
                          className="text-base font-medium hover:opacity-70 transition text-black"
                        >
                          {SUPPORT_PHONE}
                        </a>
                        <p className="text-sm mt-1 text-black/70">
                          Mon - Fri: 9:00 AM - 6:00 PM GMT
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <div
                        className="w-14 h-14 rounded-full flex items-center justify-center flex-shrink-0 backdrop-blur-sm"
                        style={{ backgroundColor: MINT }}
                      >
                        <Mail className="w-6 h-6 text-black" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold mb-1 text-black">
                          Email us
                        </h3>
                        <a
                          href={`mailto:${SUPPORT_EMAIL}`}
                          className="text-base font-medium hover:opacity-70 transition text-black break-all"
                        >
                          {SUPPORT_EMAIL}
                        </a>
                        <p className="text-sm mt-1 text-black/70">
                          We typically respond within 24 hours
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
