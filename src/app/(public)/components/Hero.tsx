"use client";

import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  HandCoins,
  Lock,
  Search,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

import slide1 from "@/assets/6.png";
import slide2 from "@/assets/7.png";
import slide3 from "@/assets/5.png";
import slide4 from "@/assets/4.png";
import slide5 from "@/assets/3.png";
import slide6 from "@/assets/2.png";
import slide7 from "@/assets/1.png";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

const slides = [
  {
    image: slide1,
    eyebrow: "Same-week appointments",
    title: "Home visits and shop drop-off",
  },
  {
    image: slide2,
    eyebrow: "Certified technicians",
    title: "Phone and tablet repairs",
  },
  {
    image: slide3,
    eyebrow: "Seasonal care",
    title: "AC service and installation",
  },
  {
    image: slide4,
    eyebrow: "Appliance specialists",
    title: "Refrigerator repairs",
  },
  {
    image: slide5,
    eyebrow: "Reliable home service",
    title: "Washing machine repairs",
  },
  {
    image: slide6,
    eyebrow: "Safe installation",
    title: "TV mounting and setup",
  },
  {
    image: slide7,
    eyebrow: "Licensed electricians",
    title: "Home electrical work",
  },
];

const categories = [
  { label: "All categories", value: "all" },
  { label: "Smartphone", value: "smartphone" },
  { label: "Laptop & PC", value: "laptop-pc" },
  { label: "AC", value: "ac" },
  { label: "Refrigerator", value: "refrigerator" },
  { label: "TV", value: "tv" },
  { label: "Washing Machine", value: "washing-machine" },
  { label: "Electrical", value: "electrical" },
];

const guarantees = [
  { icon: ShieldCheck, label: "Transparent pricing" },
  { icon: HandCoins, label: "Pay after completion" },
  { icon: Lock, label: "Secure online payment" },
];

export default function Hero() {
  const router = useRouter();
  const [api, setApi] = useState<CarouselApi>();
  const [activeSlide, setActiveSlide] = useState(0);
  const [category, setCategory] = useState("all");

  useEffect(() => {
    if (!api) return;

    const onSelect = () => setActiveSlide(api.selectedScrollSnap());
    api.on("select", onSelect);

    return () => {
      api.off("select", onSelect);
    };
  }, [api]);

  function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const query = String(formData.get("q") ?? "").trim();
    const params = new URLSearchParams();

    if (query) params.set("q", query);
    if (category !== "all") params.set("category", category);

    const search = params.toString();

    router.push(search ? `/services?${search}` : "/services");
  }

  return (
    <section className="relative isolate overflow-hidden bg-[#040a17]">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_75%_at_28%_42%,rgba(37,99,235,0.32),transparent_68%)]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(85%_95%_at_32%_30%,rgba(30,64,175,0.22),transparent_72%)]"
      />

      <div className="container relative mx-auto px-4 py-16 sm:px-6 lg:px-8 lg:py-[72px]">
        <div className="grid items-center gap-14 lg:grid-cols-[1.08fr_1fr] lg:gap-14">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-cyan-400/25 bg-cyan-400/10 px-4 py-1.5 text-[11px] font-semibold tracking-[0.18em] text-cyan-300 uppercase">
              <Sparkles className="size-3.5" />
              Verified technicians
            </span>

            <h1 className="mt-6 text-[44px] leading-[1.05] font-semibold tracking-[-0.02em] text-white sm:text-[56px] lg:text-[68px]">
              Broken device? Get it fixed by verified pros.
            </h1>

            <p className="mt-6 max-w-[520px] text-[17px] leading-relaxed text-slate-300">
              Book trusted repair professionals, track every step of the job, and
              pay only after your repair is complete.
            </p>

            <div className="mt-9 flex flex-wrap items-center gap-3.5">
              <Link
                href="/services"
                className={cn(
                  buttonVariants({ size: "lg" }),
                  "h-12 gap-3 rounded-full bg-white px-7 text-[13px] font-semibold tracking-[0.14em] text-slate-900 uppercase hover:bg-slate-100"
                )}
              >
                Explore services
                <ArrowRight className="size-4" />
              </Link>
              <Link
                href="/how-it-works"
                className={cn(
                  buttonVariants({ variant: "outline", size: "lg" }),
                  "h-12 rounded-full border-white/20 bg-transparent px-7 text-[13px] font-semibold tracking-[0.14em] text-white uppercase hover:bg-white/10 hover:text-white dark:border-white/20 dark:bg-transparent dark:hover:bg-white/10"
                )}
              >
                How it works
              </Link>
            </div>

            <form
              onSubmit={handleSearch}
              className="mt-10 flex w-full max-w-[505px] items-center gap-1.5 rounded-2xl border border-white/10 bg-white/[0.045] p-2"
            >
              <label className="flex min-w-0 flex-1 items-center gap-2.5 pl-3">
                <Search className="size-4 shrink-0 text-slate-400" />
                <Input
                  name="q"
                  type="search"
                  autoComplete="off"
                  placeholder="Search a repair, e.g. cracked screen"
                  className="h-9 border-0 bg-transparent px-0 text-[15px] text-white placeholder:text-slate-400 focus-visible:border-0 focus-visible:ring-0 dark:bg-transparent"
                />
              </label>

              <span className="hidden h-8 w-px shrink-0 bg-white/10 sm:block" />

              <div className="hidden shrink-0 sm:block">
                <Select
                  items={categories}
                  value={category}
                  onValueChange={(value) => setCategory(String(value))}
                >
                  <SelectTrigger className="h-10 w-[148px] justify-between gap-2 border-0 bg-transparent px-3 text-[15px] text-slate-200 hover:bg-transparent focus-visible:ring-0 data-[size=default]:h-10 dark:bg-transparent dark:hover:bg-transparent">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent align="end">
                    {categories.map((item) => (
                      <SelectItem key={item.value} value={item.value}>
                        {item.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button
                type="submit"
                className="h-10 shrink-0 rounded-xl bg-cyan-400 px-6 text-sm font-semibold text-slate-900 hover:bg-cyan-300"
              >
                Search
              </Button>
            </form>

            <div className="mt-7 flex flex-wrap items-center gap-x-6 gap-y-2.5">
              {guarantees.map(({ icon: Icon, label }) => (
                <span
                  key={label}
                  className="flex items-center gap-2 text-sm text-slate-400"
                >
                  <Icon className="size-4 text-cyan-400" />
                  {label}
                </span>
              ))}
            </div>
          </div>

          <div className="relative">
            <Carousel opts={{ loop: true }} setApi={setApi} className="w-full">
              <CarouselContent className="-ml-0">
                {slides.map((slide, index) => (
                  <CarouselItem key={slide.title} className="pl-0">
                    <div className="relative aspect-[16/15] w-full overflow-hidden rounded-2xl ring-1 ring-white/10">
                      <Image
                        src={slide.image}
                        alt={slide.title}
                        fill
                        priority={index === 0}
                        sizes="(min-width: 1024px) 50vw, 100vw"
                        className="object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent" />
                      <div className="absolute inset-x-0 bottom-0 p-6 sm:p-7">
                        <p className="text-[11px] font-semibold tracking-[0.2em] text-cyan-300 uppercase">
                          {slide.eyebrow}
                        </p>
                        <p className="mt-1.5 text-xl font-medium text-white sm:text-[22px]">
                          {slide.title}
                        </p>
                      </div>
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>

              <div className="absolute right-5 bottom-[86px] z-10 flex items-center gap-1.5">
                {slides.map((slide, index) => (
                  <button
                    key={slide.title}
                    type="button"
                    aria-label={`Go to slide ${index + 1}`}
                    aria-current={activeSlide === index}
                    onClick={() => api?.scrollTo(index)}
                    className={cn(
                      "h-1.5 rounded-full transition-all duration-300",
                      activeSlide === index
                        ? "w-6 bg-cyan-400"
                        : "w-1.5 bg-white/40 hover:bg-white/70"
                    )}
                  />
                ))}
              </div>
            </Carousel>
          </div>
        </div>
      </div>
    </section>
  );
}
