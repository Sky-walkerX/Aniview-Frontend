export const CTA = () => {
  return (
    <section className="py-20">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-4xl font-bold text-primary mb-4">Stay Updated</h2>
        <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
          Get notified about new anime releases, exclusive content, and special
          features before anyone else.
        </p>
        <div className="max-w-md mx-auto flex gap-4">
          <input
            type="email"
            placeholder="Enter your email"
            className="flex-1 px-4 py-3 rounded-lg bg-input border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-primary ring-offset-2 ring-offset-background"
          />
          <button className="bg-primary text-primary-foreground px-6 py-3 rounded-lg font-semibold hover:bg-secondary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ring-offset-2 ring-offset-background">
            Subscribe
          </button>
        </div>
      </div>
    </section>
  );
};
