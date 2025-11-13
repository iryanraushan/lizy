import { COMMON_OPTIONS } from "../constants/property";

export function formatName(name, type = "capitalize") {
  let formatted = name.replace(/_/g, " ");

  switch (type) {
    case "uppercase":
      return formatted.toUpperCase();

    case "lowercase":
      return formatted.toLowerCase();

    case "capitalize":
      formatted = formatted.toLowerCase();
      return formatted.charAt(0).toUpperCase() + formatted.slice(1);

    default:
      return formatted;
  }
}

export const convertToISODate = (dateString) => {
  if (!dateString) return null;
  if (dateString.includes("-")) return dateString;
  const [day, month, year] = dateString.split("/");
  return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
};

export const formatDate = (date) => {
  if (!date) return 'Not available';
  
  try {
    const d = new Date(date);
    if (isNaN(d.getTime())) {
      return 'Invalid date';
    }
    
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Invalid date';
  }
};

export const formatMemberSince = (date) => {
  if (!date) return 'Not available';
  
  try {
    const d = new Date(date);
    if (isNaN(d.getTime())) {
      return 'Invalid date';
    }
    
    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    
    const month = monthNames[d.getMonth()];
    const year = d.getFullYear();
    return `${month} ${year}`;
  } catch (error) {
    console.error('Error formatting member since date:', error);
    return 'Invalid date';
  }
};

const statusColors = {
  Available: "#10b981",
  Occupied: "#f59e0b",
  Maintenance: "#ef4444",
  Coming_Soon: "#6b7280",
};

export const getStatusColor = (status) => {
  return statusColors[status] || "#6b7280";
};

export const getStatusLabel = (status) => {
  const option = COMMON_OPTIONS.AVAILABILITY.find(
    (opt) => opt.value === status
  );
  return option ? option.label : status;
};
