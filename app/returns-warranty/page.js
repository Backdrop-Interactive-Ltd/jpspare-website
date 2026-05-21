import Link from "next/link";

export const metadata = {
  title: "Returns & Warranty | JPSPARE",
  description: "JPSPARE returns, warranty, shipping, inspection, and support policy.",
};

const sections = [
  {
    title: "1. Return Eligibility",
    body: "Products may be eligible for return when they are unused, unopened, and returned with original packaging, invoice, and all included accessories. Return requests must be made within 7 days of delivery.",
    bullets: [
      "The product must be in resaleable condition",
      "Original invoice or order confirmation is required",
      "Electrical, installed, damaged, or used items are not eligible unless verified as faulty",
      "Special-order items may require additional inspection before approval",
    ],
  },
  {
    title: "2. Warranty Coverage",
    body: "Warranty coverage applies only to eligible products with manufacturer or supplier warranty support. Warranty terms depend on the product category, brand, and inspection result.",
  },
  {
    title: "3. Inspection Process",
    body: "All return and warranty claims are reviewed by our support team. We may request photos, videos, installation details, vehicle information, or physical inspection before approving a replacement or warranty support.",
  },
  {
    title: "4. Replacement and Refunds",
    body: "Approved claims may be resolved through replacement, store credit, or refund depending on stock availability and claim type. Refund processing timelines may vary by payment method.",
  },
  {
    title: "5. Shipping for Returns",
    body: "Customers are responsible for safely packing return items. If a return is caused by wrong shipment or verified product fault, JPSPARE will assist with return logistics according to the approved claim.",
  },
  {
    title: "6. Non-Returnable Items",
    body: "Installed parts, damaged packaging, used fluids, opened lubricants, custom orders, discounted clearance items, and items damaged due to improper installation are not returnable.",
  },
  {
    title: "7. Contact Information",
    body: "For any return or warranty question, contact our support team with your order number, product details, and photos if applicable.",
  },
];

function Icon({ name, className = "size-6" }) {
  const icons = {
    arrowLeft: "M19 12H5m7-7-7 7 7 7",
    shield: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z",
    document: "M7 3h7l5 5v13H7V3Zm7 0v5h5M10 13h6M10 17h4",
    phone: "M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.4 19.4 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.4 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2Z",
    mail: "M4 6h16v12H4zM4 8l8 5 8-5",
  };

  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={icons[name]} />
    </svg>
  );
}

export default function ReturnsWarrantyPage() {
  return (
    <main className="min-h-screen bg-white text-[#111827]">
      <section className="mx-auto w-full max-w-[820px] px-4 py-14 sm:px-6 lg:px-8">
        <Link href="/" className="inline-flex items-center gap-2 text-[16px] font-semibold text-[#df171d] transition hover:text-[#111827]">
          <Icon name="arrowLeft" className="size-4" />
          Back to Home
        </Link>

        <div className="mt-10 flex items-center gap-5">
          <span className="grid size-11 place-items-center rounded-full bg-[#fff1f1] text-[#df171d]">
            <Icon name="shield" className="size-8" />
          </span>
          <h1 className="text-[34px] font-black tracking-[-0.04em] text-[#111827]">Returns & Warranty</h1>
        </div>

        <p className="mt-10 text-[17px] font-medium text-[#4b5563]">Last updated: 5/20/2026</p>

        <div className="mt-12 rounded-[8px] border border-[#f7d95f] bg-[#fff1f1] p-7">
          <div className="flex items-start gap-4">
            <span className="mt-1 text-[#df171d]">
              <Icon name="document" className="size-6" />
            </span>
            <div>
              <h2 className="text-[17px] font-black text-[#7c4a00]">Important Notice</h2>
              <p className="mt-3 text-[15px] font-medium leading-7 text-[#9f1d20]">
                By purchasing from JPSPARE, you agree to our return, warranty, inspection, and support policies. Please review these terms before making a claim.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-10 space-y-9">
          {sections.map((section) => (
            <section key={section.title}>
              <h2 className="text-[23px] font-black tracking-[-0.03em] text-[#111827]">{section.title}</h2>
              <p className="mt-4 text-[16px] font-medium leading-8 text-[#4b5563]">{section.body}</p>
              {section.bullets ? (
                <ul className="mt-4 space-y-3 pl-5 text-[16px] font-medium leading-7 text-[#4b5563]">
                  {section.bullets.map((bullet) => (
                    <li key={bullet} className="list-disc">{bullet}</li>
                  ))}
                </ul>
              ) : null}
            </section>
          ))}
        </div>

        <div className="mt-10 rounded-[8px] bg-[#f8fafc] p-6 text-[15px] font-medium leading-7 text-[#4b5563]">
          <p className="font-black text-[#111827]">JPSPARE Support</p>
          <a href="mailto:info@jpspare.com.bd" className="mt-2 flex items-center gap-2 transition hover:text-[#df171d]">
            <Icon name="mail" className="size-4" />
            info@jpspare.com.bd
          </a>
          <a href="tel:01718914582" className="mt-1 flex items-center gap-2 transition hover:text-[#df171d]">
            <Icon name="phone" className="size-4" />
            01718914582
          </a>
        </div>
      </section>
    </main>
  );
}
