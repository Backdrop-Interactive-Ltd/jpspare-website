"use client";

function ArrowIcon({ direction = "right" }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={`size-4 ${direction === "left" ? "rotate-180" : ""}`}
      fill="none"
      stroke="currentColor"
      strokeWidth="2.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}

export default function ProductPagination({ currentPage, totalPages = 5, onPageChange }) {
  const pages = Array.from({ length: totalPages }, (_, index) => index + 1);
  const isFirstPage = currentPage === 1;
  const isLastPage = currentPage === totalPages;

  return (
    <nav className="mt-16 flex flex-col items-center gap-9" aria-label="Product pagination">
      <p className="text-[15px] font-medium text-[#374151]">
        Page {currentPage} of <span className="font-black text-[#111827]">{totalPages}</span>
      </p>

      <div className="flex items-center gap-3 rounded-[14px] bg-white px-4 py-3 shadow-[0_18px_36px_rgba(15,23,42,0.10)] ring-1 ring-[#eef1f5] max-sm:w-full max-sm:justify-center max-sm:gap-2 max-sm:overflow-x-auto">
        <button
          type="button"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={isFirstPage}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-[10px] px-5 text-[15px] font-black transition disabled:cursor-not-allowed disabled:bg-[#f4f6f8] disabled:text-[#c5ccd6] enabled:bg-white enabled:text-[#374151] enabled:hover:-translate-y-0.5 enabled:hover:border-[#f7d95f] enabled:hover:bg-[#fffafa] enabled:hover:text-[#df2026] enabled:hover:shadow-[0_12px_24px_rgba(220,38,38,0.12)] max-sm:px-3"
        >
          <ArrowIcon direction="left" />
          Previous
        </button>

        {pages.map((page) => (
          <button
            key={page}
            type="button"
            onClick={() => onPageChange(page)}
            aria-current={currentPage === page ? "page" : undefined}
            className={`grid size-11 place-items-center rounded-[10px] border text-[15px] font-black transition ${
              currentPage === page
                ? "border-transparent bg-gradient-to-r from-[#ff4a4f] to-[#ff4d16] text-white shadow-[0_12px_22px_rgba(220,38,38,0.22)]"
                : "border-[#dfe4ec] bg-white text-[#1f2937] hover:-translate-y-0.5 hover:border-[#f7d95f] hover:bg-[#fffafa] hover:text-[#df2026] hover:shadow-[0_12px_24px_rgba(220,38,38,0.10)]"
            }`}
          >
            {page}
          </button>
        ))}

        <button
          type="button"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={isLastPage}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-[10px] bg-[#ef3338] px-5 text-[15px] font-black text-white shadow-[0_12px_22px_rgba(220,38,38,0.22)] transition hover:-translate-y-0.5 hover:bg-[#d3191d] disabled:cursor-not-allowed disabled:bg-[#f4f6f8] disabled:text-[#c5ccd6] disabled:shadow-none max-sm:px-3"
        >
          Next
          <ArrowIcon />
        </button>
      </div>
    </nav>
  );
}
