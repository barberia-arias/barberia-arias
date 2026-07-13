import Navbar from '../components/shared/Navbar';
import Footer from '../components/shared/Footer';
import Hero from '../components/landing/Hero';
import Services from '../components/landing/Services';
import QuienesSomos from '../components/landing/QuienesSomos';
import Barbers from '../components/landing/Barbers';
import WhyUs from '../components/landing/WhyUs';
import BookingCTA from '../components/landing/BookingCTA';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-dark">
      <Navbar />
      <main>
        <Hero />
        <Services />
        <QuienesSomos />
        <Barbers />
        <WhyUs />
        <BookingCTA />
      </main>
      <Footer />
    </div>
  );
}
