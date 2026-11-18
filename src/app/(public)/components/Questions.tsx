import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    question: "When exactly do I pay for a repair?",
    answer:
      "You pay only after the technician marks the repair as complete. The final amount is shown before checkout, and every paid job keeps a receipt in your dashboard.",
  },
  {
    question: "Can the final price differ from the starting price?",
    answer:
      "Yes. The starting price covers the standard repair. If the technician finds additional faults, you receive an updated quote to approve before any extra work begins.",
  },
  {
    question: "How do I know a technician is verified?",
    answer:
      "Every technician is registered, identity-checked and reviewed by FixMate before their services go live. Their profile shows completed jobs and customer ratings.",
  },
  {
    question: "Can I cancel a repair request?",
    answer:
      "Yes. You can cancel free of charge before a technician accepts your request. After acceptance, contact the coordinator and we will help you reschedule or cancel.",
  },
  {
    question: "Do technicians come to my home?",
    answer:
      "Home visits are available for most categories and are marked on each service. If a service is shop drop-off only, the service page tells you before you book.",
  },
];

export default function Questions() {
  return (
    <section className="bg-white py-16 lg:py-20">
      <div className="container mx-auto grid gap-10 px-4 sm:px-6 lg:grid-cols-[0.95fr_1.05fr] lg:gap-12 lg:px-8">
        <div>
          <p className="text-[11px] font-semibold tracking-[0.16em] text-blue-600 uppercase">
            Questions
          </p>
          <h2 className="mt-3 text-[36px] leading-[1.2] font-semibold tracking-[-0.01em] text-[#0b1524]">
            Everything you might ask before booking
          </h2>
          <p className="mt-4 text-[16px] leading-relaxed text-slate-500">
            Still unsure about something? Reach out and a FixMate coordinator
            will walk you through the process.
          </p>
        </div>

        <Accordion className="w-full">
          {faqs.map((faq) => (
            <AccordionItem
              key={faq.question}
              value={faq.question}
              className="border-b border-slate-200"
            >
              <AccordionTrigger className="py-4 text-left text-[18px] font-medium text-[#0b1524] hover:no-underline **:data-[slot=accordion-trigger-icon]:text-slate-400">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="pb-5 text-[13.5px] leading-[1.65] text-slate-500">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
