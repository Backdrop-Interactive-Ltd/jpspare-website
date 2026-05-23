"use client";

import { useEffect, useState } from "react";

const vehicleMakes = [
  "Alfa Romeo",
  "Audi",
  "Bentley",
  "Bmw",
  "Honda",
  "Lexus",
  "Maserati",
  "Mazda",
  "Mercedes Benz",
  "Mitsubishi",
  "Nissan",
  "Porsche",
  "Range Rover",
  "Rolls Royce",
  "Toyota",
];

const vehicleModels = ["GHIBLI", "Levante", "Quattroporte", "GranTurismo"];
const vehicleYears = ["2020", "2021", "2022", "2023", "2024"];
const searchPlaceholders = [
  "Search for authentic parts...",
  "Search for accessories...",
  "Search for lubricant...",
  "Search for tyres...",
  "Search for rims...",
  "Search for car care products...",
  "Search for suspension parts...",
  "Search for brake pads...",
  "Search for engine oil...",
  "Search for detailing products...",
];
const popularSearches = ["Brake Pads", "Oil Filters", "Spark Plugs", "Headlights", "Car Batteries", "Air Filters"];
const recentSearches = ["Air Filters"];
const quickCategories = [
  { label: "Engine", icon: "🔧", tone: "bg-[#dbeafe] text-[#2563eb]" },
  { label: "Brakes", icon: "🛑", tone: "bg-[#fee2e2] text-[#dc2626]" },
  { label: "Electrical", icon: "⚡", tone: "bg-[#ffe4e6] text-[#e11d48]" },
  { label: "Suspension", icon: "🚗", tone: "bg-[#dcfce7] text-[#16a34a]" },
];
const searchProducts = [
  { name: "AUTOGYM CAR CARE KIT", price: "৳10,500.00", tag: "Product", image: "/accessory-hard-wax.jpeg" },
  { name: "Carall Eldran Rizer Car Perfume 200ML", price: "৳1,950.00", tag: "Product", image: "/accessory-luxe-air-freshener.jpeg" },
  { name: "Flamingo AC Pro Air Conditioner Cleaner", price: "৳650.00", tag: "Product", image: "/accessory-ac-pro.jpeg" },
  { name: "Kangaroo Car Shampoo 650ml", price: "৳720.00", tag: "Product", image: "/accessory-car-shampoo.jpeg" },
  { name: "Premium Ceramic Brake Pad Set Toyota", price: "৳4,850.00", tag: "Product", image: "/accessory-wide-angle-holder.jpeg" },
  { name: "Liqui Moly Engine Flush Plus - 300mL", price: "৳850.00", tag: "Product", image: "/accessory-windshield-washer.jpeg" },
];

function useTypewriterPlaceholder(texts) {
  const [textIndex, setTextIndex] = useState(0);
  const [characterIndex, setCharacterIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showCursor, setShowCursor] = useState(true);

  useEffect(() => {
    const cursorTimer = window.setInterval(() => {
      setShowCursor((current) => !current);
    }, 520);

    return () => window.clearInterval(cursorTimer);
  }, []);

  useEffect(() => {
    const currentText = texts[textIndex] || texts[0] || "";
    const isComplete = characterIndex === currentText.length;
    const isEmpty = characterIndex === 0;
    const delay = isComplete && !isDeleting ? 1450 : isEmpty && isDeleting ? 360 : isDeleting ? 34 : 58;

    const timer = window.setTimeout(() => {
      if (!isDeleting && isComplete) {
        setIsDeleting(true);
        return;
      }

      if (isDeleting && isEmpty) {
        setIsDeleting(false);
        setTextIndex((current) => (current + 1) % texts.length);
        return;
      }

      setCharacterIndex((current) => current + (isDeleting ? -1 : 1));
    }, delay);

    return () => window.clearTimeout(timer);
  }, [characterIndex, isDeleting, textIndex, texts]);

  const typedText = (texts[textIndex] || texts[0] || "").slice(0, characterIndex);

  return `${typedText}${showCursor ? " |" : ""}`;
}

function SearchIcon({ name, className = "size-4" }) {
  if (name === "camera") {
    return (
      <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M5 7h3l1.5-2h5L16 7h3a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2Z" />
        <circle cx="12" cy="13.5" r="3.5" />
      </svg>
    );
  }

  if (name === "car") {
    return (
      <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M5 13h14l-1.5-4.5A2 2 0 0 0 15.6 7H8.4a2 2 0 0 0-1.9 1.5L5 13Z" />
        <path d="M4 13v4h2" />
        <path d="M20 13v4h-2" />
        <circle cx="8" cy="17" r="1.5" />
        <circle cx="16" cy="17" r="1.5" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="10.5" cy="10.5" r="6.5" />
      <path d="m16 16 4 4" />
    </svg>
  );
}

export default function HeaderSearch({ vehicleBrands, placeholderTexts }) {
  const [imageName, setImageName] = useState("");
  const [status, setStatus] = useState("");
  const [query, setQuery] = useState("");
  const [suggestionsOpen, setSuggestionsOpen] = useState(false);
  const [remotePlaceholderTexts, setRemotePlaceholderTexts] = useState([]);
  const activePlaceholders =
    Array.isArray(placeholderTexts) && placeholderTexts.length
      ? placeholderTexts
      : remotePlaceholderTexts.length
        ? remotePlaceholderTexts
        : searchPlaceholders;
  const animatedPlaceholder = useTypewriterPlaceholder(activePlaceholders);
  const [vehicleModalOpen, setVehicleModalOpen] = useState(false);
  const [vehicleStep, setVehicleStep] = useState(1);
  const [vehicleSelection, setVehicleSelection] = useState({
    make: "",
    model: "",
    year: "",
  });

  useEffect(() => {
    if (Array.isArray(placeholderTexts) && placeholderTexts.length) return undefined;

    let mounted = true;

    fetch("/api/homepage", { cache: "no-store" })
      .then((response) => (response.ok ? response.json() : null))
      .then((payload) => {
        if (!mounted) return;
        const cmsTexts = payload?.cms?.header?.searchPlaceholders;
        if (Array.isArray(cmsTexts) && cmsTexts.length) setRemotePlaceholderTexts(cmsTexts);
      })
      .catch(() => {});

    return () => {
      mounted = false;
    };
  }, [placeholderTexts]);

  useEffect(() => {
    function openVehicleFinder() {
      setVehicleModalOpen(true);
    }

    window.addEventListener("jpspare:open-vehicle-fitment", openVehicleFinder);

    const params = new URLSearchParams(window.location.search);
    if (params.get("vehicleFitment") === "1") {
      window.setTimeout(openVehicleFinder, 120);
      params.delete("vehicleFitment");
      const nextQuery = params.toString();
      const nextUrl = `${window.location.pathname}${nextQuery ? `?${nextQuery}` : ""}${window.location.hash}`;
      window.history.replaceState({}, "", nextUrl);
    }

    return () => window.removeEventListener("jpspare:open-vehicle-fitment", openVehicleFinder);
  }, []);

  function handleImageChange(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    setImageName(file.name);
    setStatus("Image ready for visual search");
  }

  function handleSubmit(event) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const keyword = String(formData.get("q") || "").trim();
    const vehicle = String(formData.get("vehicle") || "");

    if (imageName) {
      setStatus(`Searching by image: ${imageName}`);
      return;
    }

    if (keyword || vehicle !== "Search By Vehicle") {
      setStatus("Searching demo products");
      return;
    }

    setStatus("Add a keyword or product photo");
  }

  function handleSuggestionSelect(value) {
    setQuery(value);
    setStatus(`Searching demo products for ${value}`);
    setSuggestionsOpen(false);
  }

  function handleVehicleComplete() {
    const { make, model, year } = vehicleSelection;
    setStatus(`Vehicle fitment: ${make} ${model} ${year}`);
    setVehicleModalOpen(false);
  }

  const selectedVehicle = [vehicleSelection.make, vehicleSelection.model, vehicleSelection.year].filter(Boolean).join(" ");
  const normalizedQuery = query.trim().toLowerCase();
  const matchedProducts = normalizedQuery
    ? searchProducts.filter((product) => product.name.toLowerCase().includes(normalizedQuery) || product.tag.toLowerCase().includes(normalizedQuery))
    : [];

  return (
    <>
      <div data-vehicle-finder-root className="header-search-zoom relative order-3 min-w-0 basis-full lg:order-none lg:max-w-[760px] lg:flex-1">
        <form
          action="#parts"
          onSubmit={handleSubmit}
          className={`flex h-12 min-w-0 overflow-hidden rounded-[16px] border bg-white text-[#4b5563] shadow-[0_12px_24px_rgba(0,0,0,0.2)] transition max-sm:h-11 max-sm:rounded-[12px] ${suggestionsOpen ? "border-[#ff6268] ring-2 ring-[#ff6268]/30" : "border-white/70"}`}
          aria-label="Search products by keyword, vehicle, or image"
        >
          <div className="flex min-w-0 flex-1 items-center border-r border-[#edf0f5] max-sm:min-w-[220px]">
            <label className="relative grid h-full w-[58px] shrink-0 place-items-center border-r border-[#d9dee7] bg-[#111827] text-white max-sm:w-[48px]">
              <span className={`grid size-10 cursor-pointer place-items-center rounded-[8px] transition hover:bg-white/10 max-sm:size-9 ${imageName ? "bg-white/10" : ""}`} title="Upload or capture product photo">
                <SearchIcon name="camera" className="size-6 max-sm:size-5" />
              </span>
              <input
                name="productImage"
                type="file"
                accept="image/*"
                capture="environment"
                className="absolute inset-0 cursor-pointer opacity-0"
                onChange={handleImageChange}
                aria-label="Upload product image for visual search"
              />
            </label>
            <input
              name="q"
              type="search"
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                setSuggestionsOpen(true);
              }}
              onFocus={() => setSuggestionsOpen(true)}
              onBlur={() => window.setTimeout(() => setSuggestionsOpen(false), 130)}
              className="min-w-0 flex-1 bg-transparent px-5 text-[16px] tracking-[0.01em] outline-none placeholder:text-[#9ca3af] max-sm:px-3 max-sm:text-[14px]"
              placeholder={imageName ? imageName : animatedPlaceholder}
              autoComplete="off"
            />
            {status ? <span className="hidden max-w-[150px] truncate text-[11px] font-semibold text-[#e11365] lg:block">{status}</span> : null}
          </div>

          <input type="hidden" name="vehicle" value={selectedVehicle || "Search By Vehicle"} />
          <button
            type="button"
            onClick={() => setVehicleModalOpen(true)}
            className="flex w-[224px] shrink-0 items-center gap-2 bg-[#fafbfc] px-3 text-left text-sm font-semibold text-[#4b5563] transition hover:bg-[#fff3f3] hover:text-[#e1272c] max-sm:w-[164px] max-sm:px-2.5 max-sm:text-[12px]"
            aria-label="Search by vehicle"
          >
            <span className="grid size-6 shrink-0 place-items-center rounded-full border border-[#e5e7eb] text-[#111827]">
              <SearchIcon name="car" className="size-3.5" />
            </span>
            <span className="min-w-0 flex-1 truncate">{selectedVehicle || "Search By Vehicle"}</span>
            <span className="text-[#a3a7ae]">⌄</span>
          </button>

          <button
            type="submit"
            className="grid w-16 shrink-0 place-items-center bg-gradient-to-r from-[#ff4247] to-[#ff7417] text-white transition hover:brightness-105 max-sm:w-12"
            aria-label="Search"
          >
            <SearchIcon name="search" className="size-6 max-sm:size-5" />
          </button>
        </form>

        {suggestionsOpen ? (
          <SearchSuggestions
            query={query}
            recentSearches={recentSearches}
            popularSearches={popularSearches}
            quickCategories={quickCategories}
            products={matchedProducts}
            onSelect={handleSuggestionSelect}
          />
        ) : null}
      </div>

      {vehicleModalOpen ? (
        <VehicleFinderModal
          step={vehicleStep}
          selection={vehicleSelection}
          onClose={() => setVehicleModalOpen(false)}
          onComplete={handleVehicleComplete}
          onStartOver={() => {
            setVehicleSelection({ make: "", model: "", year: "" });
            setVehicleStep(1);
          }}
          onChangeStep={setVehicleStep}
          onSelectMake={(make) => {
            setVehicleSelection({ make, model: "", year: "" });
            setVehicleStep(2);
          }}
          onSelectModel={(model) => {
            setVehicleSelection((current) => ({ ...current, model, year: "" }));
            setVehicleStep(3);
          }}
          onSelectYear={(year) => {
            setVehicleSelection((current) => ({ ...current, year }));
            setVehicleStep(4);
          }}
        />
      ) : null}
    </>
  );
}

function VehicleFinderModal({
  step,
  selection,
  onClose,
  onComplete,
  onStartOver,
  onChangeStep,
  onSelectMake,
  onSelectModel,
  onSelectYear,
}) {
  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/65 px-4 py-6 backdrop-blur-[5px]">
      <div className="w-full max-w-[768px] overflow-hidden rounded-[10px] border border-white/80 border-t-[#ff4247] bg-white shadow-[0_28px_70px_rgba(0,0,0,0.45)]">
        <div className="flex min-h-[118px] items-center justify-between bg-[#111827] px-6 text-white max-sm:min-h-[96px] max-sm:px-4">
          <div className="flex items-center gap-3">
            <span className="grid size-9 place-items-center rounded-[8px] bg-gradient-to-br from-[#ff6268] to-[#ed252b] text-[#111827]">
              <SearchIcon name="car" className="size-5" />
            </span>
            <div>
              <h3 className="text-[20px] font-extrabold leading-tight max-sm:text-[18px]">Vehicle Parts Finder</h3>
              <p className="mt-6 text-[15px] text-white/85 max-sm:mt-3 max-sm:text-[13px]">
                <span className="text-[#ff6268]">✣</span> Find compatible parts
              </p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="grid size-10 place-items-center rounded-full text-3xl font-light text-white/90 transition hover:bg-white/10" aria-label="Close vehicle finder">
            ×
          </button>
        </div>

        <div className="max-h-[calc(100vh-154px)] overflow-y-auto px-6 py-7 max-sm:px-4">
          <StepDots step={step} />

          {step > 1 ? <SelectionPanel selection={selection} /> : null}

          <VehicleSectionHeader
            icon="car"
            title="Vehicle Make"
            showChange={step > 1}
            onChange={() => onChangeStep(1)}
          />

          {step === 1 ? (
            <div className="mt-8 grid grid-cols-5 gap-3 max-md:grid-cols-3 max-sm:grid-cols-2">
              {vehicleMakes.map((make) => (
                <VehicleMakeCard key={make} make={make} selected={selection.make === make} onClick={() => onSelectMake(make)} />
              ))}
            </div>
          ) : (
            <SelectedBox label={`${selection.make} Selected`} />
          )}

          {step >= 2 ? (
            <>
              <VehicleSectionHeader
                icon="gear"
                title="Vehicle Model"
                showChange={step > 2}
                onChange={() => onChangeStep(2)}
              />
              {step === 2 ? (
                <div className="mt-8 flex flex-wrap gap-3">
                  {vehicleModels.map((model) => (
                    <ChoiceCard key={model} selected={selection.model === model} onClick={() => onSelectModel(model)}>
                      {model}
                    </ChoiceCard>
                  ))}
                </div>
              ) : (
                <SelectedBox label={`${selection.model} SELECTED`} />
              )}
            </>
          ) : null}

          {step >= 3 ? (
            <>
              <VehicleSectionHeader
                icon="calendar"
                title="Manufacturing Year"
                showChange={step > 3}
                onChange={() => onChangeStep(3)}
              />
              {step === 3 ? (
                <div className="mt-8 flex flex-wrap gap-3">
                  {vehicleYears.map((year) => (
                    <ChoiceCard key={year} selected={selection.year === year} onClick={() => onSelectYear(year)}>
                      {year}
                    </ChoiceCard>
                  ))}
                </div>
              ) : (
                <SelectedBox label={`${selection.year} Selected`} />
              )}
            </>
          ) : null}

          {step === 4 ? (
            <div className="mt-6 rounded-[10px] border border-[#f2d943] bg-[#fff1f1] px-6 py-7 text-center max-sm:px-4">
              <h4 className="text-[20px] font-extrabold text-[#111827]">Ready to Find Parts!</h4>
              <p className="mt-4 text-[15px] text-[#4b5563]">Search for parts compatible with your {selection.make} {selection.model} ({selection.year})</p>
              <div className="mt-5 flex items-center justify-center gap-3 max-sm:flex-col">
                <button type="button" onClick={onComplete} className="inline-flex h-12 items-center justify-center gap-3 rounded-[8px] bg-[#ef3439] px-7 text-[16px] font-extrabold text-white shadow-[0_12px_24px_rgba(239,52,57,0.25)] transition hover:bg-[#d3191d] max-sm:w-full">
                  <SearchIcon name="search" className="size-5" />
                  Find Compatible Parts
                  <span>→</span>
                </button>
                <button type="button" onClick={onStartOver} className="inline-flex h-12 items-center justify-center gap-2 rounded-[8px] border border-[#cfd6e0] bg-white px-5 text-[14px] font-extrabold text-[#111827] transition hover:border-[#ef3439] hover:text-[#ef3439] max-sm:w-full">
                  ↻ Start Over
                </button>
              </div>
            </div>
          ) : null}

          {step > 1 ? <AdvancedOptions /> : null}
        </div>
      </div>
    </div>
  );
}

function SearchSuggestions({ query, recentSearches, popularSearches, quickCategories, products, onSelect }) {
  const hasQuery = query.trim().length > 0;

  return (
    <div className="absolute left-0 top-[calc(100%+10px)] z-[130] max-h-[374px] w-full overflow-y-auto rounded-[9px] border border-[#e5e7eb] bg-white text-[#273246] shadow-[0_22px_50px_rgba(0,0,0,0.24)] max-sm:max-h-[360px]">
      <div className="flex h-[52px] items-center gap-3 border-b border-[#e5e7eb] bg-[#f8fafc] px-4 text-[15px] font-medium">
        <SearchIcon name="search" className="size-4 text-[#64748b]" />
        {hasQuery ? <>Search Results for &quot;{query}&quot;</> : "Search JPSPARE"}
      </div>

      {hasQuery ? (
        <div>
          <button
            type="button"
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => onSelect(query)}
            className="flex w-full items-center gap-4 bg-[#fff1f1] px-6 py-5 text-left transition hover:bg-[#ffe8e8]"
          >
            <span className="grid size-10 shrink-0 place-items-center rounded-[8px] bg-[#fff36d] text-[#ef3338]">
              <SearchIcon name="search" className="size-5" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-[15px] font-medium text-[#111827]">Search all products for &quot;{query}&quot;</span>
              <span className="mt-2 block text-[13px] text-[#6b7280]">View all matching results</span>
            </span>
            <span className="text-[24px] text-[#ef3338]">→</span>
          </button>

          <div className="divide-y divide-[#eef0f4]">
            {(products.length ? products : searchProducts.slice(0, 3)).map((product) => (
              <button
                key={product.name}
                type="button"
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => onSelect(product.name)}
                className="flex w-full items-center gap-4 px-6 py-4 text-left transition hover:bg-[#fffafa]"
              >
                <span
                  className="block size-[64px] shrink-0 rounded-[8px] bg-cover bg-center bg-no-repeat shadow-[inset_0_0_0_1px_rgba(15,23,42,0.08)]"
                  style={{ backgroundImage: `url(${product.image})` }}
                />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[15px] font-semibold text-[#111827]">{product.name}</span>
                  <span className="mt-2 block text-[20px] font-black text-[#ef3338]">{product.price}</span>
                  <span className="mt-2 inline-flex rounded-full bg-[#dbeafe] px-2 py-1 text-[12px] font-medium text-[#2563eb]">◇ {product.tag}</span>
                </span>
                <span className="text-[28px] text-[#aab2bf]">→</span>
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div>
          <div className="border-b border-[#e5e7eb] px-4 py-4">
            <div className="mb-4 flex items-center justify-between text-[15px] font-medium">
              <span className="flex items-center gap-2 text-[#374151]">
                <span className="text-[#94a3b8]">◷</span>
                Recent Searches
              </span>
              <button type="button" className="text-[12px] text-[#6b7280] transition hover:text-[#ef3338]">Clear</button>
            </div>
            {recentSearches.map((item) => (
              <button
                key={item}
                type="button"
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => onSelect(item)}
                className="flex h-9 items-center gap-3 rounded-[6px] px-2 text-[15px] font-medium text-[#374151] transition hover:bg-[#fff1f1] hover:text-[#ef3338]"
              >
                <span className="text-[#94a3b8]">◷</span>
                {item}
              </button>
            ))}
          </div>

          <div className="bg-[#fff5f5] px-6 py-5">
            <div className="mb-4 flex items-center justify-between">
              <h4 className="flex items-center gap-2 text-[15px] font-black text-[#273246]">
                <span className="text-[#ef3338]">↗</span>
                Popular Searches
              </h4>
              <span className="text-[13px] text-[#ef3338]">Trending</span>
            </div>
            <div className="grid grid-cols-2 gap-3 max-sm:grid-cols-1">
              {popularSearches.map((item, index) => (
                <button
                  key={item}
                  type="button"
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => onSelect(item)}
                  className={`h-[46px] rounded-[7px] border bg-white px-3 text-left text-[14px] font-medium transition hover:border-[#f7d95f] hover:text-[#ef3338] ${
                    index === 0 ? "border-[#f7d95f] text-[#d3191d] shadow-[0_8px_18px_rgba(220,38,38,0.08)]" : "border-[#dfe3ea] text-[#374151]"
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
            <div className="mt-6 border-t border-[#f7d95f] pt-4">
              <p className="mb-3 text-[12px] font-medium text-[#4b5563]">Quick Categories:</p>
              <div className="flex flex-wrap gap-2">
                {quickCategories.map((item) => (
                  <button
                    key={item.label}
                    type="button"
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={() => onSelect(item.label)}
                    className={`inline-flex h-8 items-center gap-1 rounded-full px-3 text-[13px] font-medium ${item.tone}`}
                  >
                    <span>{item.icon}</span>
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StepDots({ step }) {
  return (
    <div className="mb-7 flex items-center justify-center gap-3">
      {[1, 2, 3, 4].map((number, index) => (
        <div key={number} className="flex items-center gap-3">
          <span className={`grid size-8 place-items-center rounded-full text-sm font-extrabold shadow-sm ${number <= step ? "bg-[#ef3439] text-white" : "bg-[#f1f3f7] text-[#9ca3af]"}`}>
            {number}
          </span>
          {index < 3 ? <span className={`h-[3px] w-8 rounded-full ${number < step ? "bg-[#ef3439]" : "bg-[#dfe3ea]"}`} /> : null}
        </div>
      ))}
    </div>
  );
}

function SelectionPanel({ selection }) {
  return (
    <div className="mb-8 rounded-[10px] border border-[#f2d943] bg-[#fff1f1] px-4 py-4">
      <p className="flex items-center gap-2 text-[14px] font-extrabold text-[#111827]">
        <span className="text-[#ef3439]">◴</span> Your Selection
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        {[selection.make, selection.model, selection.year].filter(Boolean).map((item) => (
          <span key={item} className="rounded-[7px] border border-[#f2d943] bg-white px-3 py-1 text-sm font-medium text-[#111827]">
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}

function VehicleSectionHeader({ icon, title, showChange, onChange }) {
  return (
    <div className="mt-7 flex items-center justify-between">
      <h4 className="flex items-center gap-2 text-[19px] font-extrabold text-[#111827]">
        <span className="text-[#ef3439]">
          {icon === "calendar" ? "▣" : icon === "gear" ? "⚙" : <SearchIcon name="car" className="size-4" />}
        </span>
        {title}
      </h4>
      {showChange ? (
        <button type="button" onClick={onChange} className="text-sm font-medium text-[#e1272c] transition hover:text-[#b91217]">
          Change
        </button>
      ) : null}
    </div>
  );
}

function SelectedBox({ label }) {
  return (
    <div className="mt-8 flex h-16 items-center gap-3 rounded-[7px] border border-[#96f0b8] bg-[#ecfff4] px-4 text-[20px] font-extrabold text-[#145c31] max-sm:text-[16px]">
      <span className="text-2xl text-[#10b35d]">✓</span>
      {label}
    </div>
  );
}

function VehicleMakeCard({ make, selected, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex h-[94px] flex-col items-center justify-center gap-3 rounded-[7px] border bg-white px-2 text-center text-[14px] font-extrabold transition hover:border-[#ff6268] hover:text-[#d3191d] hover:shadow-[0_14px_28px_rgba(239,52,57,0.16)] ${
        selected ? "border-[#ff6268] text-[#d3191d] shadow-[0_14px_28px_rgba(239,52,57,0.16)]" : "border-[#dfe3ea] text-[#111827]"
      }`}
    >
      <BrandMark make={make} selected={selected} />
      <span>{make}</span>
    </button>
  );
}

function BrandMark({ make, selected }) {
  const initials = make.split(" ").map((word) => word[0]).join("").slice(0, 2);
  if (["Audi", "Bmw", "Honda", "Lexus", "Maserati", "Mazda", "Mitsubishi", "Nissan", "Porsche", "Toyota"].includes(make)) {
    return <span className={`text-[24px] font-black leading-none ${selected ? "text-[#ef3439]" : "text-black"}`}>{initials}</span>;
  }

  return (
    <span className={`${selected ? "text-[#ef3439]" : "text-black"}`}>
      <SearchIcon name="car" className="size-6" />
    </span>
  );
}

function ChoiceCard({ selected, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`grid h-[60px] min-w-[134px] place-items-center rounded-[7px] border px-6 text-[15px] font-extrabold transition hover:border-[#ff6268] hover:text-[#d3191d] hover:shadow-[0_14px_28px_rgba(239,52,57,0.16)] ${
        selected ? "border-[#ff6268] text-[#d3191d]" : "border-[#dfe3ea] text-[#111827]"
      }`}
    >
      {children}
    </button>
  );
}

function AdvancedOptions() {
  return (
    <div className="mt-6">
      <button type="button" className="flex items-center gap-2 text-[15px] font-extrabold text-[#ef3439]">
        ⌘ Advanced Options <span>⌃</span>
      </button>
      <div className="mt-3 rounded-[7px] border border-[#dfe3ea] bg-[#fafbfc] p-4">
        <p className="mb-4 flex items-center gap-2 text-sm font-extrabold text-[#111827]">
          <span className="text-[#ef3439]">⌘</span> Advanced Options
        </p>
        <div className="grid grid-cols-2 gap-3 max-sm:grid-cols-1">
          <label className="block text-sm font-extrabold text-[#374151]">
            Chassis Code (Optional)
            <input className="mt-2 h-10 w-full rounded-[7px] border border-[#cfd6e0] bg-white px-3 outline-none transition focus:border-[#ef3439]" />
          </label>
          <label className="block text-sm font-extrabold text-[#374151]">
            Engine Type (Optional)
            <select className="mt-2 h-10 w-full rounded-[7px] border border-[#cfd6e0] bg-white px-3 outline-none transition focus:border-[#ef3439]">
              <option></option>
              <option>2000cc</option>
              <option>2500cc</option>
              <option>Hybrid</option>
            </select>
          </label>
        </div>
      </div>
    </div>
  );
}
