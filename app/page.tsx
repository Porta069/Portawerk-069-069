import Navbar from "./components/Navbar";
import HeroSection from "./components/HeroSection";
import JobsPreview from "./components/JobsPreview";
import HowItWorks from "./components/HowItWorks";
import BonusSection from "./components/BonusSection";
import ForBusinesses from "./components/ForBusinesses";
import FAQ from "./components/FAQ";
import Footer from "./components/Footer";
import StickyMobileCTA from "./components/StickyMobileCTA";

export default function Home() {
  return (
    <main>
      <Navbar />
      <HeroSection />
      <JobsPreview />
      <HowItWorks />
      <BonusSection />
      <ForBusinesses />
      <FAQ />
      <Footer />
      <StickyMobileCTA />
    </main>
  );
}
