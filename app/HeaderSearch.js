"use client";

import { useEffect, useRef, useState } from "react";
import { getHomepageClientData } from "@/lib/homepage/client-cache";
import { fetchSearchCatalog, searchCatalog } from "../lib/searchCatalog";
import { formatPriceDisplay } from "./price-format";

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
const vehicleSteps = ["Make", "Model", "Year", "Finish"];
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
const popularSearchSignals = [
  { label: "Brake Pads", searches: 98, purchases: 72 },
  { label: "Oil Filters", searches: 92, purchases: 68 },
  { label: "Spark Plugs", searches: 86, purchases: 61 },
  { label: "Headlights", searches: 82, purchases: 54 },
  { label: "Car Batteries", searches: 78, purchases: 58 },
  { label: "Air Filters", searches: 74, purchases: 52 },
  { label: "Engine Oil", searches: 72, purchases: 63 },
  { label: "Brake Shoes", searches: 66, purchases: 49 },
  { label: "Wiper Blades", searches: 63, purchases: 44 },
  { label: "AC Filter", searches: 59, purchases: 47 },
  { label: "Shock Absorber", searches: 57, purchases: 41 },
  { label: "Car Perfume", searches: 54, purchases: 46 },
  { label: "Tyres", searches: 52, purchases: 39 },
  { label: "Car Shampoo", searches: 49, purchases: 42 },
  { label: "Fuel Cleaner", searches: 46, purchases: 37 },
  { label: "LED Bulbs", searches: 43, purchases: 34 },
];
const recentSearchStorageKey = "jpspare:recent-searches";
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

function calculatePopularSearches(recentSearches) {
  const recentBoosts = new Map();
  recentSearches.forEach((item, index) => {
    recentBoosts.set(item.toLowerCase(), 14 - index * 2);
  });

  return popularSearchSignals
    .map((item) => ({
      label: item.label,
      score: item.searches * 0.58 + item.purchases * 0.42 + (recentBoosts.get(item.label.toLowerCase()) || 0),
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 14)
    .map((item) => item.label);
}

function SearchIcon({ name, className = "size-4" }) {
  if (name === "chevron") {
    return (
      <svg className={className} viewBox="0 0 12 8" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="m1 1.5 5 5 5-5" />
      </svg>
    );
  }

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
      <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6.4 8.6 7.7 5.8c.3-.7 1-1.1 1.8-1.1h5c.8 0 1.5.4 1.8 1.1l1.3 2.8" />
        <path d="M5 10.1c0-1 .8-1.8 1.8-1.8h10.4c1 0 1.8.8 1.8 1.8v5.8c0 .8-.6 1.4-1.4 1.4H6.4c-.8 0-1.4-.6-1.4-1.4v-5.8Z" />
        <path d="M7.4 10.2h9.2" />
        <path d="M8.2 13.6h7.6" />
        <path d="M9.1 15.6h5.8" />
        <path d="M7.1 12.7h2.1" />
        <path d="M14.8 12.7h2.1" />
        <path d="M7 17.3v1.2" />
        <path d="M17 17.3v1.2" />
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
  const [matchedProducts, setMatchedProducts] = useState([]);
  const [matchedCategories, setMatchedCategories] = useState([]);
  const suggestionsCloseTimer = useRef(null);
  const [recentSearches, setRecentSearches] = useState(() => {
    if (typeof window === "undefined") return [];
    try {
      const storedSearches = JSON.parse(window.localStorage.getItem(recentSearchStorageKey) || "[]");
      return Array.isArray(storedSearches) ? storedSearches.filter((item) => typeof item === "string").slice(0, 6) : [];
    } catch {
      return [];
    }
  });
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

  function saveRecentSearch(value) {
    const nextSearch = String(value || "").trim();
    if (!nextSearch) return;

    setRecentSearches((current) => {
      const next = [nextSearch, ...current.filter((item) => item.toLowerCase() !== nextSearch.toLowerCase())].slice(0, 6);
      window.localStorage.setItem(recentSearchStorageKey, JSON.stringify(next));
      return next;
    });
  }

  function clearRecentSearches() {
    setRecentSearches([]);
    window.localStorage.removeItem(recentSearchStorageKey);
  }

  useEffect(() => {
    return () => {
      if (suggestionsCloseTimer.current) window.clearTimeout(suggestionsCloseTimer.current);
    };
  }, []);

  useEffect(() => {
    if (Array.isArray(placeholderTexts) && placeholderTexts.length) return undefined;

    let mounted = true;

    getHomepageClientData()
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
    const normalizedQuery = query.trim();
    const controller = new AbortController();

    if (!normalizedQuery) {
      setMatchedProducts([]);
      setMatchedCategories([]);
      return () => controller.abort();
    }

    setMatchedProducts(searchCatalog(normalizedQuery, 5));
    setMatchedCategories([]);

    const timer = window.setTimeout(() => {
      fetchSearchCatalog(normalizedQuery, { limit: 5, signal: controller.signal })
        .then((results) => {
          if (controller.signal.aborted) return;
          setMatchedProducts(results.products || []);
          setMatchedCategories(results.categories || []);
        })
        .catch(() => {
          if (controller.signal.aborted) return;
          setMatchedProducts(searchCatalog(normalizedQuery, 5));
          setMatchedCategories([]);
        });
    }, 180);

    return () => {
      controller.abort();
      window.clearTimeout(timer);
    };
  }, [query]);

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

  function openSearchSuggestions() {
    if (suggestionsCloseTimer.current) {
      window.clearTimeout(suggestionsCloseTimer.current);
      suggestionsCloseTimer.current = null;
    }
    setSuggestionsOpen(true);
  }

  function closeSearchSuggestionsSoon() {
    if (suggestionsCloseTimer.current) window.clearTimeout(suggestionsCloseTimer.current);
    suggestionsCloseTimer.current = window.setTimeout(() => {
      setSuggestionsOpen(false);
      suggestionsCloseTimer.current = null;
    }, 90);
  }

  function handleSearchInputMouseEnter(event) {
    if (document.activeElement === event.currentTarget) {
      openSearchSuggestions();
    }
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
      if (keyword) saveRecentSearch(keyword);
      if (keyword) {
        window.location.href = `/search?q=${encodeURIComponent(keyword)}`;
      } else {
        setStatus("Searching demo products");
      }
      return;
    }

    setStatus("Add a keyword or product photo");
  }

  function handleSuggestionSelect(value) {
    setQuery(value);
    saveRecentSearch(value);
    setSuggestionsOpen(false);
    window.location.href = `/search?q=${encodeURIComponent(value)}`;
  }

  function handleProductSuggestionSelect(product) {
    saveRecentSearch(product.name);
    setSuggestionsOpen(false);
    window.location.href = `/products/${product.slug}`;
  }

  function handleCategorySuggestionSelect(category) {
    saveRecentSearch(category.name);
    setSuggestionsOpen(false);
    window.location.href = category.href || `/products?category=${encodeURIComponent(category.slug)}`;
  }

  function handleVehicleComplete() {
    const { make, model, year } = vehicleSelection;
    setStatus(`Vehicle fitment: ${make} ${model} ${year}`);
    setVehicleModalOpen(false);
  }

  const selectedVehicle = [vehicleSelection.make, vehicleSelection.model, vehicleSelection.year].filter(Boolean).join(" ");
  const calculatedPopularSearches = calculatePopularSearches(recentSearches);

  return (
    <>
      <div data-vehicle-finder-root className="header-search-zoom relative order-3 min-w-0 basis-full lg:order-none lg:max-w-[840px] lg:flex-1">
        <form
          action="/products"
          onSubmit={handleSubmit}
          className={`flex h-12 min-w-0 overflow-hidden rounded-[16px] border bg-white text-[#4b5563] shadow-[0_12px_24px_rgba(0,0,0,0.2)] transition duration-200 hover:border-[#f7d95f] hover:shadow-[0_0_0_2px_rgba(247,217,95,0.14),0_14px_30px_rgba(0,0,0,0.28)] focus-within:border-[#f7d95f] focus-within:shadow-[0_0_0_2px_rgba(247,217,95,0.14),0_14px_30px_rgba(0,0,0,0.28)] max-sm:h-11 max-sm:rounded-[12px] ${suggestionsOpen ? "border-[#f7d95f] ring-1 ring-[#f7d95f]/20 shadow-[0_0_0_2px_rgba(247,217,95,0.14),0_14px_30px_rgba(0,0,0,0.28)]" : "border-[#ef3338]"}`}
          aria-label="Search products by keyword, vehicle, or image"
        >
          <div
            className="group flex min-w-0 flex-1 items-center border-r border-[#edf0f5] transition hover:bg-[#fff3f3] max-sm:min-w-[220px]"
          >
            <label className="group/camera relative grid h-full w-[58px] shrink-0 place-items-center border-r border-[#d9dee7] bg-[#111827] text-white max-sm:w-[48px]">
              <span className={`grid size-10 cursor-pointer place-items-center transition group-hover/camera:text-[#f7d95f] max-sm:size-9 ${imageName ? "text-[#f7d95f]" : ""}`} title="Upload or capture product photo">
                <span className="grid place-items-center transition duration-300 group-hover/camera:scale-110 group-hover/camera:rotate-[-8deg] group-hover/camera:drop-shadow-[0_0_10px_rgba(247,217,95,0.58)]">
                  <SearchIcon name="camera" className="size-6 max-sm:size-5" />
                </span>
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
                openSearchSuggestions();
              }}
              onFocus={openSearchSuggestions}
              onClick={openSearchSuggestions}
              onMouseEnter={handleSearchInputMouseEnter}
              className="min-w-0 flex-1 origin-left bg-transparent px-5 text-[16px] tracking-[0.01em] outline-none transition duration-300 placeholder:text-[#9ca3af] group-hover:scale-[1.015] group-hover:animate-pulse max-sm:px-3 max-sm:text-[14px]"
              placeholder={imageName ? imageName : animatedPlaceholder}
              autoComplete="off"
            />
            {status ? <span className="hidden max-w-[150px] truncate text-[11px] font-semibold text-[#e11365] lg:block">{status}</span> : null}
          </div>

          <input type="hidden" name="vehicle" value={selectedVehicle || "Search By Vehicle"} />
          <button
            type="button"
            onClick={() => setVehicleModalOpen(true)}
            className="group flex w-[224px] shrink-0 items-center gap-2 bg-[#fafbfc] px-3 text-left text-sm font-semibold text-[#4b5563] transition hover:bg-[#fff3f3] hover:text-[#e1272c] max-sm:w-[164px] max-sm:px-2.5 max-sm:text-[12px]"
            aria-label="Search by vehicle"
          >
            <span className="grid size-6 shrink-0 place-items-center rounded-full border border-[#e5e7eb] text-[#111827]">
              <SearchIcon name="car" className="size-3.5" />
            </span>
            <span className="inline-flex min-w-0 flex-1 origin-left items-center gap-1.5 transition duration-300 group-hover:scale-[1.04] group-hover:animate-pulse">
              <span className="min-w-0 truncate">{selectedVehicle || "Search By Vehicle"}</span>
              <SearchIcon name="chevron" className="size-[11px] shrink-0 translate-y-px text-[#a3a7ae]" />
            </span>
          </button>

          <button
            type="submit"
            className="group grid w-16 shrink-0 place-items-center bg-gradient-to-r from-[#ff4247] to-[#ff7417] text-white transition hover:brightness-105 max-sm:w-12"
            aria-label="Search"
          >
            <span className="grid place-items-center transition duration-300 group-hover:scale-110 group-hover:rotate-[-8deg] group-hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.7)]">
              <SearchIcon name="search" className="size-6 max-sm:size-5" />
            </span>
          </button>
        </form>

        {suggestionsOpen ? (
          <SearchSuggestions
            query={query}
            recentSearches={recentSearches}
            popularSearches={calculatedPopularSearches}
            products={matchedProducts}
            categories={matchedCategories}
            onSelect={handleSuggestionSelect}
            onProductSelect={handleProductSuggestionSelect}
            onCategorySelect={handleCategorySuggestionSelect}
            onClearRecent={clearRecentSearches}
            onMouseEnter={openSearchSuggestions}
            onMouseLeave={closeSearchSuggestionsSoon}
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
  const [advancedOpen, setAdvancedOpen] = useState(false);

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/72 px-4 py-6 backdrop-blur-[7px]">
      <div className="w-full max-w-[780px] overflow-hidden rounded-[18px] border border-white/20 bg-white shadow-[0_32px_90px_rgba(0,0,0,0.52)]">
        <div className="relative flex min-h-[104px] items-center justify-between overflow-hidden bg-[#ef3338] px-7 text-white max-sm:min-h-[92px] max-sm:px-4">
          <span className="pointer-events-none absolute inset-y-0 right-0 w-44 bg-[linear-gradient(120deg,transparent,rgba(0,0,0,0.18))]" />
          <div className="flex items-center gap-3.5">
            <span className="grid size-11 place-items-center rounded-[12px] bg-white text-black shadow-[0_16px_32px_rgba(0,0,0,0.18)]">
              <SearchIcon name="car" className="size-5" />
            </span>
            <div>
              <h3 className="text-[21px] font-black leading-tight tracking-[-0.01em] max-sm:text-[18px]">Vehicle Parts Finder</h3>
              <p className="mt-2 flex items-center gap-2 text-[14px] font-semibold text-white/88 max-sm:text-[13px]">
                <span className="size-1.5 rounded-full bg-black" /> Find compatible parts fast
              </p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="relative grid size-9 place-items-center rounded-full text-2xl font-light leading-none text-black/75 transition hover:bg-white/20 hover:text-black" aria-label="Close vehicle finder">
            ×
          </button>
        </div>

        <div className="max-h-[calc(100vh-140px)] overflow-y-auto bg-[#fafbfc] px-7 py-6 max-sm:px-4">
          <StepDots step={step} onChangeStep={onChangeStep} />

          {step > 1 ? (
            <button
              type="button"
              onClick={() => onChangeStep(step - 1)}
              className="mb-5 inline-flex h-9 items-center gap-2 rounded-full border border-[#111827]/15 bg-white px-4 text-[13px] font-black text-[#111827] transition hover:border-[#ef3338] hover:text-[#ef3338]"
            >
              ← Back
            </button>
          ) : null}

          {step > 1 ? <SelectionPanel selection={selection} /> : null}

          {step === 1 ? (
            <>
              <VehicleSectionHeader
                icon="car"
                title="Vehicle Make"
                showChange={false}
                onChange={() => onChangeStep(1)}
              />
              <div className="mt-6 grid grid-cols-5 gap-3 max-md:grid-cols-3 max-sm:grid-cols-2">
                {vehicleMakes.map((make) => (
                  <VehicleMakeCard key={make} make={make} selected={selection.make === make} onClick={() => onSelectMake(make)} />
                ))}
              </div>
            </>
          ) : null}

          {step === 2 ? (
            <>
              <VehicleSectionHeader
                icon="gear"
                title="Vehicle Model"
                showChange={false}
                onChange={() => onChangeStep(2)}
              />
              <div className="mt-6 flex flex-wrap gap-3">
                {vehicleModels.map((model) => (
                  <ChoiceCard key={model} selected={selection.model === model} onClick={() => onSelectModel(model)}>
                    {model}
                  </ChoiceCard>
                ))}
              </div>
            </>
          ) : null}

          {step === 3 ? (
            <>
              <VehicleSectionHeader
                icon="calendar"
                title="Manufacturing Year"
                showChange={false}
                onChange={() => onChangeStep(3)}
              />
              <div className="mt-6 flex flex-wrap gap-3">
                {vehicleYears.map((year) => (
                  <ChoiceCard key={year} selected={selection.year === year} onClick={() => onSelectYear(year)}>
                    {year}
                  </ChoiceCard>
                ))}
              </div>
            </>
          ) : null}

          {step === 4 ? (
            <div className="mt-6 rounded-[16px] border border-[#111827]/10 bg-white px-6 py-7 text-center shadow-[0_18px_40px_rgba(17,24,39,0.08)] max-sm:px-4">
              <span className="mx-auto grid size-11 place-items-center rounded-[12px] bg-[#111827] text-[#f7d95f]">
                <SearchIcon name="car" className="size-5" />
              </span>
              <h4 className="mt-4 text-[20px] font-black text-[#111827]">Ready to Find Parts</h4>
              <p className="mt-3 text-[15px] font-semibold text-[#647084]">Search for parts compatible with your {selection.make} {selection.model} ({selection.year})</p>
              <div className="mt-6 flex items-center justify-center gap-3 max-sm:flex-col">
                <button type="button" onClick={onComplete} className="inline-flex h-12 items-center justify-center gap-3 rounded-[12px] bg-[#ef3338] px-7 text-[15px] font-black text-white shadow-[0_16px_30px_rgba(239,51,56,0.24)] transition hover:-translate-y-0.5 hover:bg-[#d3191d] max-sm:w-full">
                  <SearchIcon name="search" className="size-5" />
                  Find Compatible Parts
                  <span>→</span>
                </button>
                <button type="button" onClick={onStartOver} className="inline-flex h-12 items-center justify-center gap-2 rounded-[12px] border border-[#111827]/15 bg-white px-5 text-[14px] font-black text-[#111827] transition hover:border-[#ef3338] hover:text-[#ef3338] max-sm:w-full">
                  ↻ Start Over
                </button>
              </div>
            </div>
          ) : null}

          {step > 1 ? <AdvancedOptions open={advancedOpen} onToggle={() => setAdvancedOpen((current) => !current)} /> : null}
        </div>
      </div>
    </div>
  );
}

function SearchSuggestions({ query, recentSearches, popularSearches, products, categories = [], onSelect, onProductSelect, onCategorySelect, onClearRecent, onMouseEnter, onMouseLeave }) {
  const hasQuery = query.trim().length > 0;

  return (
    <div
      className="absolute left-0 top-[calc(100%+10px)] z-[130] max-h-[360px] w-full overflow-y-auto rounded-[12px] border border-[#e4e8ef] bg-white text-[#273246] shadow-[0_22px_46px_rgba(0,0,0,0.22)] max-sm:max-h-[340px]"
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <div className="flex h-11 items-center gap-3 border-b border-[#eef1f5] bg-white px-4 text-[14px] font-semibold">
        <SearchIcon name="search" className="size-4 text-[#94a3b8]" />
        {hasQuery ? <>Search &quot;{query}&quot;</> : "Search JPSPARE"}
      </div>

      {hasQuery ? (
        <div>
          <button
            type="button"
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => onSelect(query)}
            className="flex w-full items-center gap-3 border-b border-[#eef1f5] bg-white px-4 py-3 text-left transition hover:bg-[#fff8f8]"
          >
            <span className="grid size-8 shrink-0 place-items-center rounded-[8px] bg-[#111827] text-[#f7d95f]">
              <SearchIcon name="search" className="size-4" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-[14px] font-black text-[#111827]">Search all products for &quot;{query}&quot;</span>
              <span className="mt-1 block text-[12px] text-[#6b7280]">View matching products</span>
            </span>
            <span className="text-[18px] text-[#ef3338]">→</span>
          </button>

          <div className="divide-y divide-[#eef0f4]">
            {categories.map((category) => (
              <button
                key={category.id || category.slug}
                type="button"
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => onCategorySelect(category)}
                className="flex w-full items-center gap-3 px-4 py-3 text-left transition hover:bg-[#fff8f8]"
              >
                <span className="grid size-12 shrink-0 place-items-center rounded-[8px] bg-[#fff3f3] text-[#ef3338] shadow-[inset_0_0_0_1px_rgba(239,51,56,0.12)]">
                  <SearchIcon name="search" className="size-5" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[14px] font-semibold text-[#111827]">{category.name}</span>
                  <span className="mt-1 block text-[12px] font-black uppercase tracking-[0.04em] text-[#ef3338]">Category</span>
                </span>
                <span className="text-[18px] text-[#ef3338]">→</span>
              </button>
            ))}
            {products.map((product) => (
              <button
                key={product.name}
                type="button"
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => onProductSelect(product)}
                className="flex w-full items-center gap-3 px-4 py-3 text-left transition hover:bg-[#fafbfc]"
              >
                <span
                  className={`block size-12 shrink-0 rounded-[8px] bg-white bg-no-repeat shadow-[inset_0_0_0_1px_rgba(15,23,42,0.08)] ${
                    product.image ? "bg-cover bg-center" : `bg-[url('/products-reference.png')] bg-[length:1920px_900px] ${product.crop}`
                  }`}
                  style={product.image ? { backgroundImage: `url(${product.image})` } : undefined}
                />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[14px] font-semibold text-[#111827]">{product.name}</span>
                  <span className="product-price-display mt-1 block text-[16px] leading-none text-[#ef3338]">{formatPriceDisplay(product.price)}</span>
                </span>
                <span className="text-[18px] text-[#aab2bf]">→</span>
              </button>
            ))}
            {!products.length && !categories.length ? (
              <p className="px-4 py-3 text-[13px] font-semibold text-[#9aa3af]">No product suggestions found</p>
            ) : null}
          </div>
        </div>
      ) : (
        <div>
          <div className="border-b border-[#eef1f5] px-4 py-3">
            <div className="mb-2 flex items-center justify-between text-[13px] font-semibold">
              <span className="flex items-center gap-2 text-[#4b5563]">
                <span className="text-[#94a3b8]">◷</span>
                Recent Searches
              </span>
              {recentSearches.length ? (
                <button
                  type="button"
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={onClearRecent}
                  className="text-[12px] font-semibold text-[#6b7280] transition hover:text-[#ef3338]"
                >
                  Clear
                </button>
              ) : null}
            </div>
            {recentSearches.length ? (
              <div className="flex max-w-full items-center gap-2 overflow-hidden whitespace-nowrap">
                {recentSearches.map((item) => (
                  <button
                    key={item}
                    type="button"
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={() => onSelect(item)}
                    className="inline-flex h-8 max-w-[145px] shrink-0 items-center gap-1.5 rounded-full border border-[#e4e8ef] bg-white px-3 text-[13px] font-semibold text-[#374151] transition hover:border-[#ef3338] hover:text-[#ef3338]"
                  >
                    <span className="text-[#94a3b8]">◷</span>
                    <span className="truncate">{item}</span>
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-[13px] font-medium text-[#9aa3af]">No recent searches</p>
            )}
          </div>

          <div className="px-4 py-4">
            <div className="mb-3 flex items-center justify-between">
              <h4 className="flex items-center gap-2 text-[14px] font-black text-[#273246]">
                <span className="text-[#ef3338]">↗</span>
                Popular Searches
              </h4>
              <span className="rounded-full bg-[#fff3f3] px-2 py-1 text-[11px] font-black text-[#ef3338]">Trending</span>
            </div>
            <div className="flex max-h-[70px] flex-wrap gap-1.5 overflow-hidden py-1">
              {popularSearches.map((item) => (
                <button
                  key={item}
                  type="button"
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => onSelect(item)}
                  className="inline-flex h-7 items-center rounded-full border border-[#e5eaf1] bg-[linear-gradient(180deg,#ffffff_0%,#f8fafc_100%)] px-2.5 text-[12px] font-bold text-[#374151] shadow-[0_6px_14px_rgba(15,23,42,0.04)] transition hover:scale-[1.04] hover:border-[#ef3338] hover:bg-[#fff5f5] hover:text-[#ef3338] hover:shadow-[0_10px_18px_rgba(239,51,56,0.10)]"
                >
                  {item}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StepDots({ step, onChangeStep }) {
  return (
    <div className="mb-7 flex items-center justify-center gap-2">
      {[1, 2, 3, 4].map((number, index) => (
        <div key={number} className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              if (number <= step) onChangeStep(number);
            }}
            disabled={number > step}
            className={`inline-flex h-9 min-w-9 items-center justify-center gap-1.5 rounded-full px-3 text-[12px] font-black transition ${
              number <= step
                ? "bg-[#111827] text-white shadow-[0_12px_26px_rgba(17,24,39,0.18)] hover:-translate-y-0.5 hover:bg-[#ef3338]"
                : "cursor-not-allowed bg-white text-[#9aa3af] ring-1 ring-[#e4e8ef]"
            }`}
            aria-label={`Go to vehicle ${vehicleSteps[number - 1]}`}
          >
            <span className={`grid size-5 place-items-center rounded-full text-[11px] ${number <= step ? "bg-[#ef3338] text-white" : "bg-[#f3f5f8] text-[#9aa3af]"}`}>{number}</span>
            <span className="hidden sm:inline">{vehicleSteps[number - 1]}</span>
          </button>
          {index < 3 ? <span className={`h-px w-6 rounded-full ${number < step ? "bg-[#ef3338]" : "bg-[#dfe3ea]"}`} /> : null}
        </div>
      ))}
    </div>
  );
}

function SelectionPanel({ selection }) {
  return (
    <div className="mb-7 rounded-[14px] border border-[#252b36]/10 bg-white px-4 py-4 shadow-[0_14px_30px_rgba(17,24,39,0.05)]">
      <p className="flex items-center gap-2 text-[12px] font-black uppercase tracking-[0.14em] text-[#ef3338]">
        <span className="h-1.5 w-5 rounded-full bg-[#f7d95f]" /> Your Selection
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        {[selection.make, selection.model, selection.year].filter(Boolean).map((item) => (
          <span key={item} className="rounded-full border border-[#ef3338]/20 bg-[#fff7f7] px-3 py-1 text-sm font-black text-[#111827]">
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}

function VehicleSectionHeader({ icon, title, showChange, onChange }) {
  return (
    <div className="mt-6 flex items-center justify-between">
      <h4 className="flex items-center gap-3 text-[18px] font-black text-[#111827]">
        <span className="grid size-8 place-items-center rounded-[9px] bg-[#111827] text-[#f7d95f] shadow-[0_12px_24px_rgba(17,24,39,0.14)]">
          {icon === "calendar" ? "▣" : icon === "gear" ? "⚙" : <SearchIcon name="car" className="size-4" />}
        </span>
        {title}
      </h4>
      {showChange ? (
        <button type="button" onClick={onChange} className="rounded-full border border-[#ef3338]/25 bg-white px-3 py-1 text-xs font-black text-[#ef3338] transition hover:border-[#ef3338] hover:bg-[#fff3f3]">
          Change
        </button>
      ) : null}
    </div>
  );
}

function VehicleMakeCard({ make, selected, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`group/vehicle relative flex h-[90px] flex-col items-center justify-center gap-2.5 overflow-hidden rounded-[14px] border bg-white px-2 text-center text-[14px] font-bold transition duration-200 hover:-translate-y-0.5 hover:border-[#ef3338] hover:text-[#d3191d] hover:shadow-[0_18px_34px_rgba(17,24,39,0.1)] ${
        selected ? "border-[#ef3338] text-[#d3191d] shadow-[0_18px_34px_rgba(17,24,39,0.1)]" : "border-[#dfe3ea] text-[#111827]"
      }`}
    >
      <span className={`absolute inset-x-0 top-0 h-1 transition ${selected ? "bg-[#ef3338]" : "bg-transparent group-hover/vehicle:bg-[#f7d95f]"}`} />
      <BrandMark make={make} selected={selected} />
      <span>{make}</span>
    </button>
  );
}

function BrandMark({ make, selected }) {
  const initials = make.split(" ").map((word) => word[0]).join("").slice(0, 2);
  if (["Audi", "Bmw", "Honda", "Lexus", "Maserati", "Mazda", "Mitsubishi", "Nissan", "Porsche", "Toyota"].includes(make)) {
    return <span className={`text-[22px] font-black leading-none ${selected ? "text-[#ef3338]" : "text-[#111827]"}`}>{initials}</span>;
  }

  return (
    <span className={`${selected ? "text-[#ef3338]" : "text-[#111827]"}`}>
      <SearchIcon name="car" className="size-5" />
    </span>
  );
}

function ChoiceCard({ selected, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`grid h-[52px] min-w-[128px] place-items-center rounded-[14px] border bg-white px-5 text-[15px] font-black transition hover:-translate-y-0.5 hover:border-[#ef3338] hover:text-[#d3191d] hover:shadow-[0_16px_28px_rgba(17,24,39,0.08)] ${
        selected ? "border-[#ef3338] text-[#d3191d] shadow-[inset_0_3px_0_#ef3338]" : "border-[#dfe3ea] text-[#111827]"
      }`}
    >
      {children}
    </button>
  );
}

function AdvancedOptions({ open, onToggle }) {
  return (
    <div className="mt-6">
      <button
        type="button"
        onClick={onToggle}
        className="flex items-center gap-2 text-[14px] font-black text-[#111827] transition hover:text-[#ef3338]"
        aria-expanded={open}
      >
        <span className="text-[#ef3338]">⌘</span> Advanced Options
        <SearchIcon name="chevron" className={`size-[11px] text-[#ef3338] transition duration-200 ${open ? "rotate-180" : ""}`} />
      </button>

      {open ? (
        <div className="mt-3 rounded-[16px] border border-[#e4e8ef] bg-white p-4 shadow-[0_14px_30px_rgba(17,24,39,0.05)]">
          <p className="mb-4 flex items-center gap-2 text-sm font-black text-[#111827]">
            <span className="h-1.5 w-5 rounded-full bg-[#f7d95f]" /> Advanced Options
          </p>
          <div className="grid grid-cols-2 gap-3 max-sm:grid-cols-1">
            <label className="block text-sm font-black text-[#374151]">
              Chassis Code (Optional)
              <input className="mt-2 h-11 w-full rounded-[12px] border border-[#cfd6e0] bg-[#fafbfc] px-3 outline-none transition hover:border-[#ef3338] focus:border-[#ef3338]" />
            </label>
            <label className="block text-sm font-black text-[#374151]">
              Engine Type (Optional)
              <select className="mt-2 h-11 w-full rounded-[12px] border border-[#cfd6e0] bg-[#fafbfc] px-3 outline-none transition hover:border-[#ef3338] focus:border-[#ef3338]">
                <option></option>
                <option>2000cc</option>
                <option>2500cc</option>
                <option>Hybrid</option>
              </select>
            </label>
          </div>
        </div>
      ) : null}
    </div>
  );
}
