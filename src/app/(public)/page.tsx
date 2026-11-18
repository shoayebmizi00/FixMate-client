import { Suspense } from "react";

import Hero from "./components/Hero";
import Category from "./components/Category";
import LatestServices from "./components/LatestServices";
import HowItWorks from "./components/HowItWorks";
import Questions from "./components/Questions";
import CtaBanner from "./components/CtaBanner";

export default function Home() {
  return (
    <div>
      <Hero />
      <Suspense
        fallback={
          <section className="bg-white px-4 py-12 text-center text-sm text-slate-500">
            Loading repair categories…
          </section>
        }
      >
        <Category />
      </Suspense>
      <Suspense
        fallback={
          <section className="bg-[#f6f9fc] px-4 py-12 text-center text-sm text-slate-500">
            Loading approved services…
          </section>
        }
      >
        <LatestServices />
      </Suspense>
      <HowItWorks />
      <Questions />
      <CtaBanner />
    </div>
  );
}
