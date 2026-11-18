import Hero from "./components/Hero";
import HowItWorks from "./components/HowItWorks";
import Questions from "./components/Questions";
import CtaBanner from "./components/CtaBanner";

export default function Home() {
  return (
    <div>
      <Hero />
      <HowItWorks />
      <Questions />
      <CtaBanner />
    </div>
  );
}
