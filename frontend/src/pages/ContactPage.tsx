import React, { useState } from 'react'

export default function ContactPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')

  const handleSubmit = (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault()
    alert(`Thank you for reaching out, ${name}! This form is currently a mockup.`)
  }

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        {/* Page Title & Intro text */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">
            Contact Us
          </h1>
          <p className="mt-4 text-lg text-slate-600 max-w-2xl mx-auto">
            Have questions about your extra credit tracking or need assistance with the system? Our
            support team is here to help.
          </p>
        </div>

        {/* Two Column Layout Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
          {/* Left Column: Contact Information Placeholders */}
          <div className="space-y-6 pr-0 md:pr-6 border-b border-slate-100 md:border-b-0 md:border-r border-slate-100 pb-8 md:pb-0">
            <div>
              <h2 className="text-xl font-bold text-slate-900 mb-4">Support Information</h2>
              <p className="text-slate-600 text-sm">
                Reach out to the department directly or visit during administrative office hours.
              </p>
            </div>

            <div className="space-y-4">
              {/* Support Email */}
              <div className="flex items-start space-x-3">
                <div className="text-xl">✉️</div>
                <div>
                  <h3 className="text-sm font-semibold text-slate-900">Support Email</h3>
                  <p className="text-sm text-blue-900 font-medium">support@cecas.edu</p>
                </div>
              </div>

              {/* Department Name */}
              <div className="flex items-start space-x-3">
                <div className="text-xl">🏢</div>
                <div>
                  <h3 className="text-sm font-semibold text-slate-900">Department</h3>
                  <p className="text-sm text-slate-600">
                    Computer Science & Information Technology
                  </p>
                </div>
              </div>

              {/* Office Hours */}
              <div className="flex items-start space-x-3">
                <div className="text-xl">🕒</div>
                <div>
                  <h3 className="text-sm font-semibold text-slate-900">Office Hours</h3>
                  <p className="text-sm text-slate-600">Monday - Friday: 8:00 AM – 5:00 PM CST</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Contact Form Mockup */}
          <div className="pl-0 md:pl-6">
            <h2 className="text-xl font-bold text-slate-900 mb-4">Send a Message</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name Field */}
              <div>
                <label htmlFor="name" className="block text-sm font-semibold text-slate-700 mb-1">
                  Name
                </label>
                <input
                  type="text"
                  id="name"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-900/20 focus:border-blue-900 transition-all"
                  placeholder="Your full name"
                />
              </div>

              {/* Email Field */}
              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-slate-700 mb-1">
                  Email Field
                </label>
                <input
                  type="email"
                  id="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-900/20 focus:border-blue-900 transition-all"
                  placeholder="your.email@example.com"
                />
              </div>

              {/* Message Field */}
              <div>
                <label
                  htmlFor="message"
                  className="block text-sm font-semibold text-slate-700 mb-1"
                >
                  Message Field
                </label>
                <textarea
                  id="message"
                  rows={4}
                  required
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full px-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-900/20 focus:border-blue-900 transition-all resize-none"
                  placeholder="How can we help you?"
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full px-4 py-2.5 text-sm font-bold text-white bg-blue-900 rounded-xl hover:bg-blue-800 shadow-md shadow-blue-900/10 hover:shadow-blue-900/20 transition-all"
              >
                Submit Button
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
