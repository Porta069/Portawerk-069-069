import Navbar from "./components/Navbar";
import HeroSection from "./components/HeroSection";
import JobsPreview from "./components/JobsPreview";
import HowItWorks from "./components/HowItWorks";
import BonusSection from "./components/BonusSection";
import ForBusinesses from "./components/ForBusinesses";
import Footer from "./components/Footer";

export default function Home() {
  return (
    <main>
      <Navbar />
      <HeroSection />
      <JobsPreview />
      <HowItWorks />
      <BonusSection />
      <ForBusinesses />
      <Footer />
    </main>
  );
}
