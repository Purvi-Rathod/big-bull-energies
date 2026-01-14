"use client";

import { useState } from "react";
import Link from "next/link";
import { Phone, Mail, MapPin, Send } from "lucide-react";
import Footer from "@/components/Footer";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission here
    console.log("Form submitted:", formData);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <main className="min-h-screen w-full overflow-x-hidden" style={{ paddingTop: "156px" }}>
      {/* Hero Section */}
      <section className="relative w-full bg-[#E8F5F0] py-16 md:py-20 lg:py-24">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <div className="flex items-center justify-center gap-3 mb-8">
              <div className="h-px w-12 bg-[#042B19]"></div>
              <span
                className="text-xs font-medium uppercase tracking-wide"
                style={{ color: "#042B19" }}
              >
                CONTACT US
              </span>
            </div>
            <h1
              className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-normal leading-tight mb-6"
              style={{
                color: "#042B19",
                fontFamily: "var(--font-font4), sans-serif",
              }}
            >
              Get in touch with us
            </h1>
            <p
              className="text-base md:text-lg lg:text-xl leading-relaxed"
              style={{
                color: "#042B19",
                fontFamily: "var(--font-font4), sans-serif",
              }}
            >
              We&apos;re here to help. Reach out to us for any questions,
              inquiries, or to learn more about our services.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Information Section */}
      <section className="relative w-full bg-white py-16 md:py-20 lg:py-24">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12 mb-16">
            {/* Phone */}
            <div className="flex flex-col items-center text-center">
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center mb-6 shadow-md"
                style={{ backgroundColor: "#E8F5F0" }}
              >
                <Phone className="w-8 h-8" style={{ color: "#042B19" }} />
              </div>
              <h3
                className="text-xl font-bold mb-3"
                style={{ color: "#042B19" }}
              >
                Phone
              </h3>
              <a
                href="tel:+447452321010"
                className="text-base md:text-lg transition hover:opacity-70"
                style={{ color: "#042B19" }}
              >
                +44 7452321010
              </a>
            </div>

            {/* Email */}
            <div className="flex flex-col items-center text-center">
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center mb-6 shadow-md"
                style={{ backgroundColor: "#E8F5F0" }}
              >
                <Mail className="w-8 h-8" style={{ color: "#042B19" }} />
              </div>
              <h3
                className="text-xl font-bold mb-3"
                style={{ color: "#042B19" }}
              >
                Email
              </h3>
              <a
                href="mailto:crownbankers.com@gmail.com"
                className="text-base md:text-lg transition hover:opacity-70"
                style={{ color: "#042B19" }}
              >
                crownbankers.com@gmail.com
              </a>
            </div>

            {/* Address */}
            <div className="flex flex-col items-center text-center">
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center mb-6 shadow-md"
                style={{ backgroundColor: "#E8F5F0" }}
              >
                <MapPin className="w-8 h-8" style={{ color: "#042B19" }} />
              </div>
              <h3
                className="text-xl font-bold mb-3"
                style={{ color: "#042B19" }}
              >
                Address
              </h3>
              <p
                className="text-base md:text-lg"
                style={{ color: "#042B19" }}
              >
                Crown Bankers Headquarters
                <br />
                United Kingdom
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Form Section */}
      <section className="relative w-full bg-white py-16 md:py-20 lg:py-24">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
              {/* Left Side - Form */}
              <div className="bg-[#E8F5F0] p-8 md:p-10 lg:p-12">
                <h2
                  className="text-3xl md:text-4xl lg:text-5xl font-bold mb-8"
                  style={{ color: "#042B19" }}
                >
                  Send us a message
                </h2>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label
                      htmlFor="name"
                      className="block text-sm font-bold uppercase tracking-wide mb-3"
                      style={{ color: "#042B19" }}
                    >
                      Name *
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      required
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border-2 bg-white transition focus:outline-none focus:ring-2 focus:ring-[#042B19]"
                      style={{
                        borderColor: "#042B19",
                        color: "#042B19",
                      }}
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="email"
                      className="block text-sm font-bold uppercase tracking-wide mb-3"
                      style={{ color: "#042B19" }}
                    >
                      Email *
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border-2 bg-white transition focus:outline-none focus:ring-2 focus:ring-[#042B19]"
                      style={{
                        borderColor: "#042B19",
                        color: "#042B19",
                      }}
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="phone"
                      className="block text-sm font-bold uppercase tracking-wide mb-3"
                      style={{ color: "#042B19" }}
                    >
                      Phone
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border-2 bg-white transition focus:outline-none focus:ring-2 focus:ring-[#042B19]"
                      style={{
                        borderColor: "#042B19",
                        color: "#042B19",
                      }}
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="subject"
                      className="block text-sm font-bold uppercase tracking-wide mb-3"
                      style={{ color: "#042B19" }}
                    >
                      Subject *
                    </label>
                    <select
                      id="subject"
                      name="subject"
                      required
                      value={formData.subject}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border-2 bg-white transition focus:outline-none focus:ring-2 focus:ring-[#042B19]"
                      style={{
                        borderColor: "#042B19",
                        color: "#042B19",
                      }}
                    >
                      <option value="">Select a subject</option>
                      <option value="general">General Inquiry</option>
                      <option value="services">Services</option>
                      <option value="partnership">Partnership</option>
                      <option value="careers">Careers</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label
                      htmlFor="message"
                      className="block text-sm font-bold uppercase tracking-wide mb-3"
                      style={{ color: "#042B19" }}
                    >
                      Message *
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      required
                      rows={6}
                      value={formData.message}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border-2 bg-white resize-none transition focus:outline-none focus:ring-2 focus:ring-[#042B19]"
                      style={{
                        borderColor: "#042B19",
                        color: "#042B19",
                      }}
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-[#ffcf0B] text-gray-900 font-bold px-8 py-4 text-sm uppercase tracking-wide transition hover:opacity-90 flex items-center justify-center gap-2"
                    style={{ borderRadius: "0" }}
                  >
                    <Send className="w-5 h-5" />
                    SEND MESSAGE
                  </button>
                </form>
              </div>

              {/* Right Side - Additional Info */}
              <div className="flex flex-col justify-center">
                <h2
                  className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6"
                  style={{ color: "#042B19" }}
                >
                  We&apos;d love to hear from you
                </h2>
                <p
                  className="text-base md:text-lg lg:text-xl leading-relaxed mb-10"
                  style={{
                    color: "#042B19",
                    fontFamily: "var(--font-font4), sans-serif",
                  }}
                >
                  Whether you have a question about our services, need
                  assistance, or want to explore partnership opportunities,
                  we&apos;re here to help. Our team is ready to respond to your
                  inquiry.
                </p>
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div
                      className="w-14 h-14 rounded-full flex items-center justify-center flex-shrink-0 shadow-md"
                      style={{ backgroundColor: "#E8F5F0" }}
                    >
                      <Phone className="w-7 h-7" style={{ color: "#042B19" }} />
                    </div>
                    <div>
                      <h3
                        className="text-xl font-bold mb-2"
                        style={{ color: "#042B19" }}
                      >
                        Call us
                      </h3>
                      <p
                        className="text-base md:text-lg mb-1"
                        style={{ color: "#042B19" }}
                      >
                        <a
                          href="tel:+447452321010"
                          className="hover:opacity-70 transition"
                        >
                          +44 7452321010
                        </a>
                      </p>
                      <p
                        className="text-sm"
                        style={{ color: "#042B19", opacity: 0.8 }}
                      >
                        Monday - Friday: 9:00 AM - 6:00 PM GMT
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div
                      className="w-14 h-14 rounded-full flex items-center justify-center flex-shrink-0 shadow-md"
                      style={{ backgroundColor: "#E8F5F0" }}
                    >
                      <Mail className="w-7 h-7" style={{ color: "#042B19" }} />
                    </div>
                    <div>
                      <h3
                        className="text-xl font-bold mb-2"
                        style={{ color: "#042B19" }}
                      >
                        Email us
                      </h3>
                      <p
                        className="text-base md:text-lg mb-1"
                        style={{ color: "#042B19" }}
                      >
                        <a
                          href="mailto:crownbankers.com@gmail.com"
                          className="hover:opacity-70 transition"
                        >
                          crownbankers.com@gmail.com
                        </a>
                      </p>
                      <p
                        className="text-sm"
                        style={{ color: "#042B19", opacity: 0.8 }}
                      >
                        We typically respond within 24 hours
                      </p>
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