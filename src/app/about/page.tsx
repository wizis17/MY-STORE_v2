export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-6">About Flux Store</h1>
        
        <div className="bg-white rounded-lg shadow-sm p-8 space-y-6">
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Welcome to Our Store</h2>
            <p className="text-gray-600 leading-relaxed">
              Flux is your premier destination for quality clothing in Cambodia. We specialize in 
              comfortable T-shirts and stylish pants that blend modern fashion with everyday practicality.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Our Mission</h2>
            <p className="text-gray-600 leading-relaxed">
              We believe that great fashion should be accessible to everyone. Our mission is to provide 
              high-quality clothing at affordable prices, with fast delivery throughout Cambodia.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Quality & Comfort</h2>
            <p className="text-gray-600 leading-relaxed">
              Every product in our collection is carefully selected for quality, comfort, and style. 
              We work with trusted suppliers to ensure you get the best value for your money.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Contact Us</h2>
            <div className="text-gray-600 space-y-2">
              <p><strong>Phone:</strong> +855 123 456 789</p>
              <p><strong>Email:</strong> support@fluxstore.com</p>
              <p><strong>Location:</strong> Phnom Penh, Cambodia</p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
