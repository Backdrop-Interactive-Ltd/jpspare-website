const requiredFields = ["name", "phone", "addressLine1", "city", "zone"];

function hasValue(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function getPreferredAddress(addresses = []) {
  if (!Array.isArray(addresses) || addresses.length === 0) {
    return null;
  }

  return addresses.find((address) => address?.isDefault) || addresses[0] || null;
}

export function getCustomerProfileCompletion(customer) {
  const missingFields = [];
  const address = getPreferredAddress(customer?.addresses);

  if (!hasValue(customer?.firstName) && !hasValue(customer?.lastName)) {
    missingFields.push("name");
  }

  if (!hasValue(customer?.phone)) {
    missingFields.push("phone");
  }

  if (!address || !hasValue(address.addressLine1)) {
    missingFields.push("addressLine1");
  }

  if (!address || !hasValue(address.city)) {
    missingFields.push("city");
  }

  if (!address || !hasValue(address.zone)) {
    missingFields.push("zone");
  }

  return {
    isComplete: missingFields.length === 0,
    missingFields,
    requiredFields,
  };
}
