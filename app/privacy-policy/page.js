import Link from "next/link";

export const metadata = {
  title: "Privacy Policy | JPSPARE",
  description: "JPSPARE privacy policy covering data collection, security, cookies, and customer rights.",
};

const sections = [
  {
    title: "1. Information We Collect",
    body: "We collect information you provide directly to us, such as when you create an account, make a purchase, submit an inquiry, or contact us for support.",
    bullets: [
      "Personal information including name, email, phone number, and address",
      "Payment information processed securely through trusted payment providers",
      "Order history, vehicle fitment details, and product preferences",
      "Website usage data, search activity, and basic analytics",
    ],
  },
  {
    title: "2. How We Use Your Information",
    body: "We use the information we collect to provide, maintain, and improve our automotive parts shopping experience.",
    bullets: [
      "Process orders, payments, delivery, and returns",
      "Provide customer support and fitment assistance",
      "Send order confirmations, account updates, and shipment notices",
      "Improve our website, product recommendations, and services",
      "Send promotional emails only when permitted by you",
    ],
  },
  {
    title: "3. Information Sharing",
    body: "We do not sell, trade, or otherwise transfer your personal information to third parties except when needed to operate our services or comply with the law.",
    bullets: [
      "With service providers who assist in order processing and delivery",
      "When required by law or to protect our legal rights",
      "In connection with a business transfer, merger, or acquisition",
    ],
  },
  {
    title: "4. Data Security",
    body: "We implement appropriate security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.",
    callout: {
      tone: "green",
      title: "SSL Encryption",
      body: "All data transmission is encrypted using industry-standard SSL technology.",
    },
  },
  {
    title: "5. Cookies and Tracking",
    body: "We use cookies and similar tracking technologies to enhance your browsing experience, remember preferences, analyze website traffic, and improve product discovery.",
  },
  {
    title: "6. Your Rights",
    body: "You have the right to manage how your personal information is used by JPSPARE.",
    bullets: [
      "Access and update your personal information",
      "Request deletion of eligible account or order data",
      "Opt out of marketing communications",
      "Request a copy of your stored data",
    ],
  },
  {
    title: "7. Contact Us",
    body: "If you have any questions about this Privacy Policy, please contact us:",
    contact: true,
  },
];

function Icon({ name, className = "size-6" }) {
  const icons = {
    arrowLeft: "M19 12H5m7-7-7 7 7 7",
    lock: "M6 10V8a6 6 0 1 1 12 0v2M5 10h14v11H5V10Z",
    shield: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z",
    eye: "M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12Zm10 3a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z",
    document: "M7 3h7l5 5v13H7V3Zm7 0v5h5M10 13h6M10 17h4",
  };

  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={icons[name]} />
    </svg>
  );
}

export default function PrivacyPolicyPage() {
  return (
    <main className="min-h-screen bg-white text-[#111827]">
      <section className="mx-auto w-full max-w-[820px] px-4 py-14 sm:px-6 lg:px-8">
        <Link href="/" className="inline-flex items-center gap-2 text-[16px] font-semibold text-[#df171d] transition hover:text-[#111827]">
          <Icon name="arrowLeft" className="size-4" />
          Back to Home
        </Link>

        <div className="mt-10 flex items-center gap-5">
          <span className="grid size-11 place-items-center rounded-full bg-[#fff1f1] text-[#df171d]">
            <Icon name="lock" className="size-8" />
          </span>
          <h1 className="text-[34px] font-black tracking-[-0.04em] text-[#111827]">Privacy Policy</h1>
        </div>

        <p className="mt-10 text-[17px] font-medium text-[#4b5563]">Last updated: 5/20/2026</p>

        <div className="mt-12 rounded-[8px] border border-[#bfdbfe] bg-[#eff6ff] p-7">
          <div className="flex items-start gap-4">
            <span className="mt-1 text-[#2563eb]">
              <Icon name="shield" className="size-6" />
            </span>
            <div>
              <h2 className="text-[17px] font-black text-[#1d4ed8]">Your Privacy Matters</h2>
              <p className="mt-3 text-[15px] font-medium leading-7 text-[#1d4ed8]">
                JPSPARE is committed to protecting your privacy and personal information. This policy explains how we collect, use, and safeguard your data.
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

              {section.callout ? (
                <div className="mt-5 rounded-[8px] border border-[#bbf7d0] bg-[#ecfdf3] p-5">
                  <div className="flex items-start gap-3 text-[#16a34a]">
                    <Icon name="lock" className="mt-0.5 size-5" />
                    <div>
                      <h3 className="text-[15px] font-black">{section.callout.title}</h3>
                      <p className="mt-2 text-[14px] font-semibold leading-6">{section.callout.body}</p>
                    </div>
                  </div>
                </div>
              ) : null}

              {section.contact ? (
                <div className="mt-5 rounded-[8px] bg-[#f8fafc] p-6 text-[15px] font-medium leading-7 text-[#4b5563]">
                  <p className="font-black text-[#111827]">JPSPARE Corp.</p>
                  <p>Privacy Officer</p>
                  <p>Email: privacy@jpspare.com.bd</p>
                  <p>Phone: 01718914582</p>
                </div>
              ) : null}
            </section>
          ))}
        </div>

        <div className="mt-12 rounded-[8px] border border-[#f7d95f] bg-[#fff1f1] p-7">
          <div className="flex items-start gap-4">
            <span className="mt-1 text-[#df171d]">
              <Icon name="eye" className="size-6" />
            </span>
            <div>
              <h2 className="text-[17px] font-black text-[#9f1d20]">Transparency</h2>
              <p className="mt-3 text-[15px] font-medium leading-7 text-[#9f1d20]">
                We believe in transparency. If you have any questions about how we handle your data, reach out to our privacy team.
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
