"use client";

import Link from "next/link";

export default function FooterVehicleFitmentLink({ className, children }) {
  function handleClick(event) {
    if (typeof window === "undefined") {
      return;
    }

    const vehicleFinderExists = document.querySelector("[data-vehicle-finder-root]");
    if (!vehicleFinderExists) {
      return;
    }

    event.preventDefault();
    window.dispatchEvent(new CustomEvent("jpspare:open-vehicle-fitment"));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <Link href="/?vehicleFitment=1" onClick={handleClick} className={className}>
      {children}
    </Link>
  );
}
