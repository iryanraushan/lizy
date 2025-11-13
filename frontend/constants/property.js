const ROOM_CONFIGS = {
  BEDROOM_OPTIONS: [
    { value: "1bed", icon: "home", iconFamily: "Feather", label: "1 Bedroom", count: 1 },
    { value: "2bed", icon: "home", iconFamily: "Feather", label: "2 Bedrooms", count: 2 },
    { value: "3bed", icon: "home", iconFamily: "Feather", label: "3 Bedrooms", count: 3 },
    { value: "4bed", icon: "home", iconFamily: "Feather", label: "4+ Bedrooms", count: 4 },
  ],

  BHK_OPTIONS: [
    { value: "1BHK", icon: "home", iconFamily: "Feather", label: "1 BHK", bedrooms: 1, halls: 1, kitchens: 1 },
    { value: "2BHK", icon: "home", iconFamily: "Feather", label: "2 BHK", bedrooms: 2, halls: 1, kitchens: 1 },
    { value: "3BHK", icon: "home", iconFamily: "Feather", label: "3 BHK", bedrooms: 3, halls: 1, kitchens: 1 },
    { value: "4BHK", icon: "home", iconFamily: "Feather", label: "4+ BHK", bedrooms: 4, halls: 1, kitchens: 1 },
  ],

  PG_ROOM_OPTIONS: [
    { value: "single", icon: "user", iconFamily: "Feather", label: "Single Occupancy", capacity: 1 },
    { value: "double", icon: "users", iconFamily: "Feather", label: "Double Sharing", capacity: 2 },
    { value: "triple", icon: "users", iconFamily: "Feather", label: "Triple Sharing", capacity: 3 },
    { value: "quad", icon: "users", iconFamily: "Feather", label: "4+ Sharing", capacity: 4 },
  ]
};

const LISTING_TYPES = {
  RENT: { value: "rent", label: "For Rent", icon: "key", iconFamily: "Feather" },
  SALE: { value: "sale", label: "For Sale", icon: "tag", iconFamily: "Feather" },
}

const PROPERTY_TYPES = {
  APARTMENTS: [
    { value: "1BHK", label: "1 BHK Apartment", category: "apartment", roomConfig: ROOM_CONFIGS.BHK_OPTIONS[0], icon: "home", iconFamily: "Feather" },
    { value: "2BHK", label: "2 BHK Apartment", category: "apartment", roomConfig: ROOM_CONFIGS.BHK_OPTIONS[1], icon: "home", iconFamily: "Feather" },
    { value: "3BHK", label: "3 BHK Apartment", category: "apartment", roomConfig: ROOM_CONFIGS.BHK_OPTIONS[2], icon: "home", iconFamily: "Feather" },
    { value: "4BHK", label: "4+ BHK Apartment", category: "apartment", roomConfig: ROOM_CONFIGS.BHK_OPTIONS[3], icon: "home", iconFamily: "Feather" },
    { value: "Studio", label: "Studio Apartment", category: "apartment", roomConfig: { value: "studio", icon: "home", iconFamily: "Feather", label: "Studio", bedrooms: 0, halls: 1, kitchens: 1 }, icon: "square", iconFamily: "Feather" },
  ],

  ROOMS: [
    { value: "SingleRoom", label: "Single Room", category: "room", roomConfig: ROOM_CONFIGS.BEDROOM_OPTIONS[0], icon: "user", iconFamily: "Feather" },
    { value: "DoubleRoom", label: "Double Room", category: "room", roomConfig: ROOM_CONFIGS.BEDROOM_OPTIONS[1], icon: "users", iconFamily: "Feather" },
    { value: "TripleRoom", label: "Triple Room", category: "room", roomConfig: ROOM_CONFIGS.BEDROOM_OPTIONS[2], icon: "users", iconFamily: "FontAwesome" },
  ],

  PG_ACCOMMODATIONS: [
    { value: "PG_Single", label: "PG - Single Room", category: "pg", roomConfig: ROOM_CONFIGS.PG_ROOM_OPTIONS[0], amenities: ["meals", "cleaning", "security"], icon: "user", iconFamily: "Feather" },
    { value: "PG_Double", label: "PG - Double Sharing", category: "pg", roomConfig: ROOM_CONFIGS.PG_ROOM_OPTIONS[1], amenities: ["meals", "cleaning", "security"], icon: "users", iconFamily: "Feather" },
    { value: "PG_Triple", label: "PG - Triple Sharing", category: "pg", roomConfig: ROOM_CONFIGS.PG_ROOM_OPTIONS[2], amenities: ["meals", "cleaning", "security"], icon: "users", iconFamily: "Feather" },
    { value: "PG_Quad", label: "PG - 4+ Sharing", category: "pg", roomConfig: ROOM_CONFIGS.PG_ROOM_OPTIONS[3], amenities: ["meals", "cleaning", "security"], icon: "users", iconFamily: "Feather" },
  ],

  HOUSES: [
    { value: "House", label: "Independent House", category: "house", hasRoomOptions: true, availableRooms: ROOM_CONFIGS.BEDROOM_OPTIONS, icon: "home", iconFamily: "Feather" },
    { value: "Villa", label: "Villa", category: "villa", hasRoomOptions: true, availableRooms: ROOM_CONFIGS.BEDROOM_OPTIONS, icon: "crown", iconFamily: "AntDesign" },
    { value: "Cottage", label: "Cottage House", category: "cottage", hasRoomOptions: true, availableRooms: ROOM_CONFIGS.BEDROOM_OPTIONS, icon: "tree", iconFamily: "MaterialCommunityIcons" },
  ],

  COMMERCIAL: [
    { value: "Office", label: "Office Space", category: "commercial", icon: "briefcase", iconFamily: "Feather" },
    { value: "Shop", label: "Commercial Shop", category: "commercial", icon: "shopping-bag", iconFamily: "Feather" },
    { value: "Warehouse", label: "Warehouse", category: "commercial", icon: "package", iconFamily: "Feather" },
  ],

  OTHERS: [
    { value: "Land", label: "Plot/Land", category: "land", icon: "map", iconFamily: "Feather" },
    { value: "Other", label: "Other", category: "other", icon: "grid", iconFamily: "Feather" },
  ]
};

const ALL_PROPERTY_TYPES = [
  ...PROPERTY_TYPES.APARTMENTS,
  ...PROPERTY_TYPES.ROOMS,
  ...PROPERTY_TYPES.PG_ACCOMMODATIONS,
  ...PROPERTY_TYPES.HOUSES,
  ...PROPERTY_TYPES.COMMERCIAL,
  ...PROPERTY_TYPES.OTHERS
];

const COMMON_OPTIONS = {
  AVAILABILITY: [
    { value: "Available", label: "Available Now", icon: "check-circle", iconFamily: "Feather" },
    { value: "Occupied", label: "Currently Occupied", icon: "user", iconFamily: "Feather" },
    { value: "Maintenance", label: "Under Maintenance", icon: "tool", iconFamily: "Feather" },
    { value: "Coming_Soon", label: "Available Soon", icon: "clock", iconFamily: "Feather" },
  ],
  FURNISHED_STATUS: [
    { value: "Fully", label: "Fully Furnished", icon: "home", iconFamily: "Feather" },
    { value: "Semi", label: "Semi Furnished", icon: "package", iconFamily: "Feather" },
    { value: "Unfurnished", label: "Unfurnished", icon: "square", iconFamily: "Feather" },
  ],
  GENDER_PREFERENCE: [
    { value: "Male", label: "Male Only", icon: "male", iconFamily: "FontAwesome" },
    { value: "Female", label: "Female Only", icon: "female", iconFamily: "FontAwesome" },
    { value: "Unisex", label: "Both Male & Female", icon: "venus-mars", iconFamily: "FontAwesome" },
    { value: "Any", label: "No Preference", icon: "rainbow", iconFamily: "Fontisto" },
  ]
};

const AMENITIES = {
  BASIC: [
    { value: "WiFi", label: "WiFi Internet" },
    { value: "Parking", label: "Parking Space" },
    { value: "Security", label: "24/7 Security" },
    { value: "Water", label: "Water Supply" },
    { value: "Electricity", label: "Power Backup" },
    { value: "Lift", label: "Elevator/Lift" },
    { value: "CCTV", label: "CCTV Surveillance" },
    { value: "Maintenance", label: "Maintenance Service" },
  ],

  PG_SPECIFIC: [
    { value: "Meals", label: "Meals Included" },
    { value: "Cleaning", label: "Room Cleaning" },
    { value: "Common_Area", label: "Common Area" },
    { value: "Laundry", label: "Laundry Service" },
    { value: "Study_Room", label: "Study Room" },
    { value: "TV_Room", label: "TV/Recreation Room" },
    { value: "Refrigerator", label: "Refrigerator Access" },
    { value: "Microwave", label: "Microwave Access" },
  ],

  APARTMENT_SPECIFIC: [
    { value: "Balcony", label: "Balcony" },
    { value: "Modular_Kitchen", label: "Modular Kitchen" },
    { value: "Wardrobes", label: "Built-in Wardrobes" },
    { value: "Air_Conditioning", label: "Air Conditioning" },
    { value: "Geyser", label: "Water Heater/Geyser" },
    { value: "Intercom", label: "Intercom Facility" },
    { value: "Chimney", label: "Kitchen Chimney" },
    { value: "False_Ceiling", label: "False Ceiling" },
  ],

  HOUSE_SPECIFIC: [
    { value: "Garden", label: "Garden/Lawn" },
    { value: "Terrace", label: "Terrace Access" },
    { value: "Servant_Room", label: "Servant Room" },
    { value: "Store_Room", label: "Store Room" },
    { value: "Car_Parking", label: "Covered Car Parking" },
    { value: "Gate_Security", label: "Gated Community" },
    { value: "Bore_Well", label: "Bore Well" },
    { value: "Solar_Panels", label: "Solar Water Heater" },
  ],

  COMMERCIAL_SPECIFIC: [
    { value: "Reception", label: "Reception Area" },
    { value: "Conference_Room", label: "Conference Room" },
    { value: "Cafeteria", label: "Cafeteria" },
    { value: "Restrooms", label: "Restrooms" },
    { value: "Loading_Dock", label: "Loading Dock" },
    { value: "Storage_Space", label: "Storage Space" },
    { value: "Central_AC", label: "Central Air Conditioning" },
    { value: "Fire_Safety", label: "Fire Safety Equipment" },
  ],

  LUXURY_AMENITIES: [
    { value: "Swimming_Pool", label: "Swimming Pool" },
    { value: "Gym", label: "Gymnasium" },
    { value: "Club_House", label: "Club House" },
    { value: "Spa", label: "Spa/Wellness Center" },
    { value: "Jogging_Track", label: "Jogging Track" },
    { value: "Children_Play", label: "Children's Play Area" },
    { value: "Tennis_Court", label: "Tennis Court" },
    { value: "Basketball_Court", label: "Basketball Court" },
    { value: "Badminton_Court", label: "Badminton Court" },
    { value: "Party_Hall", label: "Party Hall" },
    { value: "Library", label: "Library" },
    { value: "Mini_Theater", label: "Mini Theater" },
  ],

  SAFETY_SECURITY: [
    { value: "Fire_Alarm", label: "Fire Alarm System" },
    { value: "Smoke_Detector", label: "Smoke Detectors" },
    { value: "Emergency_Exit", label: "Emergency Exits" },
    { value: "Security_Guard", label: "Security Guard" },
    { value: "Visitor_Management", label: "Visitor Management" },
    { value: "Access_Control", label: "Access Control System" },
    { value: "Panic_Button", label: "Panic Button" },
  ],

  CONNECTIVITY: [
    { value: "Broadband", label: "High-Speed Broadband" },
    { value: "Cable_TV", label: "Cable TV Connection" },
    { value: "DTH", label: "DTH Connection" },
    { value: "Fiber_Internet", label: "Fiber Internet" },
    { value: "Phone_Line", label: "Landline Connection" },
  ],

  ECO_FRIENDLY: [
    { value: "Rainwater_Harvesting", label: "Rainwater Harvesting" },
    { value: "Waste_Management", label: "Waste Management" },
    { value: "Solar_Power", label: "Solar Power" },
    { value: "Green_Building", label: "Green Building Certified" },
    { value: "EV_Charging", label: "EV Charging Station" },
    { value: "LED_Lighting", label: "LED Lighting" },
  ],

  FURNISHING: [
    { value: "Sofa_Set", label: "Sofa Set" },
    { value: "Dining_Table", label: "Dining Table" },
    { value: "Bed", label: "Bed" },
    { value: "Mattress", label: "Mattress" },
    { value: "Study_Table", label: "Study Table" },
    { value: "Chair", label: "Chairs" },
    { value: "Television", label: "Television" },
    { value: "Washing_Machine", label: "Washing Machine" },
    { value: "Fridge", label: "Refrigerator" },
    { value: "Microwave_Oven", label: "Microwave Oven" },
    { value: "Gas_Stove", label: "Gas Stove" },
    { value: "Curtains", label: "Curtains" },
    { value: "Cupboards", label: "Cupboards" },
  ]
};

const ALL_AMENITIES = [
  ...AMENITIES.BASIC, 
  ...AMENITIES.PG_SPECIFIC,
  ...AMENITIES.APARTMENT_SPECIFIC,
  ...AMENITIES.HOUSE_SPECIFIC,
  ...AMENITIES.COMMERCIAL_SPECIFIC,
  ...AMENITIES.LUXURY_AMENITIES,
  ...AMENITIES.SAFETY_SECURITY,
  ...AMENITIES.CONNECTIVITY,
  ...AMENITIES.ECO_FRIENDLY,
  ...AMENITIES.FURNISHING
];

const PROPERTY_HELPERS = {
  getPropertyType: (value) => ALL_PROPERTY_TYPES.find((t) => t.value === value),
  getPropertiesByCategory: (category) => ALL_PROPERTY_TYPES.filter((t) => t.category === category),
  getRoomOptions: (propertyTypeValue) => {
    const property = ALL_PROPERTY_TYPES.find((type) => type.value === propertyTypeValue);
    if (!property) return [];
    if (property.hasRoomOptions) return property.availableRooms || [];
    if (property.roomConfig) return [property.roomConfig];
    return [];
  },
  getAmenities: (propertyTypeValue) => {
    const property = ALL_PROPERTY_TYPES.find((type) => type.value === propertyTypeValue);
    if (!property) return ALL_AMENITIES;
    
    let amenities = [...AMENITIES.BASIC, ...AMENITIES.SAFETY_SECURITY, ...AMENITIES.CONNECTIVITY];
    
    switch (property.category) {
      case "pg":
        amenities = [...amenities, ...AMENITIES.PG_SPECIFIC];
        break;
      case "apartment":
        amenities = [...amenities, ...AMENITIES.APARTMENT_SPECIFIC, ...AMENITIES.LUXURY_AMENITIES, ...AMENITIES.FURNISHING];
        break;
      case "house":
      case "villa":
      case "cottage":
        amenities = [...amenities, ...AMENITIES.HOUSE_SPECIFIC, ...AMENITIES.APARTMENT_SPECIFIC, ...AMENITIES.LUXURY_AMENITIES, ...AMENITIES.ECO_FRIENDLY, ...AMENITIES.FURNISHING];
        break;
      case "commercial":
        amenities = [...amenities, ...AMENITIES.COMMERCIAL_SPECIFIC];
        break;
      case "room":
        amenities = [...amenities, ...AMENITIES.FURNISHING];
        break;
      default:
        amenities = [...amenities, ...AMENITIES.ECO_FRIENDLY];
    }
    
    return amenities;
  },
};

const getDropdownOptions = (items = [], labelKey = "label", valueKey = "value") => {
  return items.map((it) => ({ label: it[labelKey] || it[valueKey], value: it[valueKey] }));
};

export {
  ALL_AMENITIES, ALL_PROPERTY_TYPES, AMENITIES, COMMON_OPTIONS, getDropdownOptions, LISTING_TYPES, PROPERTY_HELPERS, PROPERTY_TYPES, ROOM_CONFIGS
};

