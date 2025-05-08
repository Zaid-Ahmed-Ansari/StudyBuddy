// app/contact/page.tsx

export default function ContactPage() {
    return (
      <main className="max-w-4xl mx-auto px-4 py-16">
        <h1 className="text-4xl font-bold text-accent text-center mb-4">Contact Us</h1>
        < p className="text-center text-gray-600 mb-10">
          We&apos;d love to hear from you! Fill out the form below and we&apos;ll get back to you soon.
        <br />
        This form doesn&apos;t work
    Contact me at ahmedzaid2627@gmail.com</p>
  
        <form className="space-y-6  shadow-lg rounded-md p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name</label>
              <input
                type="text"
                id="name"
                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="John Doe"
              />
            </div>
  
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
              <input
                type="email"
                id="email"
                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="you@example.com"
              />
            </div>
          </div>
  
          <div>
            <label htmlFor="subject" className="block text-sm font-medium text-gray-700">Subject</label>
            <input
              type="text"
              id="subject"
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="What's this about?"
            />
          </div>
  
          <div>
            <label htmlFor="message" className="block text-sm font-medium text-gray-700">Message</label>
            <textarea
              id="message"
              rows={5}
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Type your message here..."
            ></textarea>
          </div>
  
          <button
            type="submit"
            className="w-full bg-accent text-white py-3 px-6 rounded-md hover:bg-blue-700 transition-all font-semibold"
          >
            Send Message
          </button>
        </form>
      </main>
    );
  }
  