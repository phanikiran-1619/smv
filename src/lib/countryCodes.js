// Comprehensive location data for the entire application

// Country codes with dial codes and currency
export const countryCodes = [
  { id: "IN", country: "India", code: "IN", dialCode: "+91", currency: "INR" },
  { id: "US", country: "United States", code: "US", dialCode: "+1", currency: "USD" },
  { id: "GB", country: "United Kingdom", code: "GB", dialCode: "+44", currency: "GBP" },
  { id: "CA", country: "Canada", code: "CA", dialCode: "+1", currency: "CAD" },
  { id: "AU", country: "Australia", code: "AU", dialCode: "+61", currency: "AUD" },
  { id: "DE", country: "Germany", code: "DE", dialCode: "+49", currency: "EUR" },
  { id: "FR", country: "France", code: "FR", dialCode: "+33", currency: "EUR" },
  { id: "JP", country: "Japan", code: "JP", dialCode: "+81", currency: "JPY" },
  { id: "CN", country: "China", code: "CN", dialCode: "+86", currency: "CNY" },
  { id: "BR", country: "Brazil", code: "BR", dialCode: "+55", currency: "BRL" },
  { id: "MX", country: "Mexico", code: "MX", dialCode: "+52", currency: "MXN" },
  { id: "IT", country: "Italy", code: "IT", dialCode: "+39", currency: "EUR" },
  { id: "ES", country: "Spain", code: "ES", dialCode: "+34", currency: "EUR" },
  { id: "RU", country: "Russia", code: "RU", dialCode: "+7", currency: "RUB" },
  { id: "KR", country: "South Korea", code: "KR", dialCode: "+82", currency: "KRW" },
  { id: "NL", country: "Netherlands", code: "NL", dialCode: "+31", currency: "EUR" },
  { id: "SE", country: "Sweden", code: "SE", dialCode: "+46", currency: "SEK" },
  { id: "NO", country: "Norway", code: "NO", dialCode: "+47", currency: "NOK" },
  { id: "DK", country: "Denmark", code: "DK", dialCode: "+45", currency: "DKK" },
  { id: "FI", country: "Finland", code: "FI", dialCode: "+358", currency: "EUR" },
  { id: "CH", country: "Switzerland", code: "CH", dialCode: "+41", currency: "CHF" },
  { id: "AT", country: "Austria", code: "AT", dialCode: "+43", currency: "EUR" },
  { id: "BE", country: "Belgium", code: "BE", dialCode: "+32", currency: "EUR" },
  { id: "IE", country: "Ireland", code: "IE", dialCode: "+353", currency: "EUR" },
  { id: "PT", country: "Portugal", code: "PT", dialCode: "+351", currency: "EUR" },
  { id: "GR", country: "Greece", code: "GR", dialCode: "+30", currency: "EUR" },
  { id: "PL", country: "Poland", code: "PL", dialCode: "+48", currency: "PLN" },
  { id: "CZ", country: "Czech Republic", code: "CZ", dialCode: "+420", currency: "CZK" },
  { id: "HU", country: "Hungary", code: "HU", dialCode: "+36", currency: "HUF" },
  { id: "RO", country: "Romania", code: "RO", dialCode: "+40", currency: "RON" },
  { id: "BG", country: "Bulgaria", code: "BG", dialCode: "+359", currency: "BGN" },
  { id: "HR", country: "Croatia", code: "HR", dialCode: "+385", currency: "EUR" },
  { id: "SI", country: "Slovenia", code: "SI", dialCode: "+386", currency: "EUR" },
  { id: "SK", country: "Slovakia", code: "SK", dialCode: "+421", currency: "EUR" },
  { id: "LT", country: "Lithuania", code: "LT", dialCode: "+370", currency: "EUR" },
  { id: "LV", country: "Latvia", code: "LV", dialCode: "+371", currency: "EUR" },
  { id: "EE", country: "Estonia", code: "EE", dialCode: "+372", currency: "EUR" },
  { id: "IS", country: "Iceland", code: "IS", dialCode: "+354", currency: "ISK" },
  { id: "MT", country: "Malta", code: "MT", dialCode: "+356", currency: "EUR" },
  { id: "CY", country: "Cyprus", code: "CY", dialCode: "+357", currency: "EUR" },
  { id: "LU", country: "Luxembourg", code: "LU", dialCode: "+352", currency: "EUR" },
  { id: "NZ", country: "New Zealand", code: "NZ", dialCode: "+64", currency: "NZD" },
  { id: "SG", country: "Singapore", code: "SG", dialCode: "+65", currency: "SGD" },
  { id: "MY", country: "Malaysia", code: "MY", dialCode: "+60", currency: "MYR" },
  { id: "TH", country: "Thailand", code: "TH", dialCode: "+66", currency: "THB" },
  { id: "PH", country: "Philippines", code: "PH", dialCode: "+63", currency: "PHP" },
  { id: "ID", country: "Indonesia", code: "ID", dialCode: "+62", currency: "IDR" },
  { id: "VN", country: "Vietnam", code: "VN", dialCode: "+84", currency: "VND" },
  { id: "BD", country: "Bangladesh", code: "BD", dialCode: "+880", currency: "BDT" },
  { id: "PK", country: "Pakistan", code: "PK", dialCode: "+92", currency: "PKR" },
  { id: "LK", country: "Sri Lanka", code: "LK", dialCode: "+94", currency: "LKR" },
  { id: "MM", country: "Myanmar", code: "MM", dialCode: "+95", currency: "MMK" },
  { id: "KH", country: "Cambodia", code: "KH", dialCode: "+855", currency: "KHR" },
  { id: "LA", country: "Laos", code: "LA", dialCode: "+856", currency: "LAK" },
  { id: "BT", country: "Bhutan", code: "BT", dialCode: "+975", currency: "BTN" },
  { id: "MV", country: "Maldives", code: "MV", dialCode: "+960", currency: "MVR" },
  { id: "NP", country: "Nepal", code: "NP", dialCode: "+977", currency: "NPR" },
  { id: "AF", country: "Afghanistan", code: "AF", dialCode: "+93", currency: "AFN" },
  { id: "AE", country: "United Arab Emirates", code: "AE", dialCode: "+971", currency: "AED" },
  { id: "SA", country: "Saudi Arabia", code: "SA", dialCode: "+966", currency: "SAR" },
  { id: "QA", country: "Qatar", code: "QA", dialCode: "+974", currency: "QAR" },
  { id: "KW", country: "Kuwait", code: "KW", dialCode: "+965", currency: "KWD" },
  { id: "BH", country: "Bahrain", code: "BH", dialCode: "+973", currency: "BHD" },
  { id: "OM", country: "Oman", code: "OM", dialCode: "+968", currency: "OMR" },
  { id: "JO", country: "Jordan", code: "JO", dialCode: "+962", currency: "JOD" },
  { id: "IL", country: "Israel", code: "IL", dialCode: "+972", currency: "ILS" },
  { id: "LB", country: "Lebanon", code: "LB", dialCode: "+961", currency: "LBP" },
  { id: "SY", country: "Syria", code: "SY", dialCode: "+963", currency: "SYP" },
  { id: "IQ", country: "Iraq", code: "IQ", dialCode: "+964", currency: "IQD" },
  { id: "IR", country: "Iran", code: "IR", dialCode: "+98", currency: "IRR" },
  { id: "TR", country: "Turkey", code: "TR", dialCode: "+90", currency: "TRY" },
  { id: "EG", country: "Egypt", code: "EG", dialCode: "+20", currency: "EGP" },
  { id: "ZA", country: "South Africa", code: "ZA", dialCode: "+27", currency: "ZAR" },
  { id: "NG", country: "Nigeria", code: "NG", dialCode: "+234", currency: "NGN" },
  { id: "KE", country: "Kenya", code: "KE", dialCode: "+254", currency: "KES" },
  { id: "GH", country: "Ghana", code: "GH", dialCode: "+233", currency: "GHS" },
  { id: "UG", country: "Uganda", code: "UG", dialCode: "+256", currency: "UGX" },
  { id: "TZ", country: "Tanzania", code: "TZ", dialCode: "+255", currency: "TZS" },
  { id: "ET", country: "Ethiopia", code: "ET", dialCode: "+251", currency: "ETB" },
  { id: "MA", country: "Morocco", code: "MA", dialCode: "+212", currency: "MAD" },
  { id: "DZ", country: "Algeria", code: "DZ", dialCode: "+213", currency: "DZD" },
  { id: "TN", country: "Tunisia", code: "TN", dialCode: "+216", currency: "TND" },
  { id: "LY", country: "Libya", code: "LY", dialCode: "+218", currency: "LYD" },
  { id: "SD", country: "Sudan", code: "SD", dialCode: "+249", currency: "SDG" },
  { id: "AR", country: "Argentina", code: "AR", dialCode: "+54", currency: "ARS" },
  { id: "CL", country: "Chile", code: "CL", dialCode: "+56", currency: "CLP" },
  { id: "CO", country: "Colombia", code: "CO", dialCode: "+57", currency: "COP" },
  { id: "PE", country: "Peru", code: "PE", dialCode: "+51", currency: "PEN" },
  { id: "VE", country: "Venezuela", code: "VE", dialCode: "+58", currency: "VED" },
  { id: "EC", country: "Ecuador", code: "EC", dialCode: "+593", currency: "USD" },
  { id: "BO", country: "Bolivia", code: "BO", dialCode: "+591", currency: "BOB" },
  { id: "PY", country: "Paraguay", code: "PY", dialCode: "+595", currency: "PYG" },
  { id: "UY", country: "Uruguay", code: "UY", dialCode: "+598", currency: "UYU" },
  { id: "GY", country: "Guyana", code: "GY", dialCode: "+592", currency: "GYD" },
  { id: "SR", country: "Suriname", code: "SR", dialCode: "+597", currency: "SRD" },
  { id: "GF", country: "French Guiana", code: "GF", dialCode: "+594", currency: "EUR" }
];

// All Indian States and Union Territories
export const indianStates = [
  { id: "AP", name: "Andhra Pradesh", code: "AP", type: "state" },
  { id: "AR", name: "Arunachal Pradesh", code: "AR", type: "state" },
  { id: "AS", name: "Assam", code: "AS", type: "state" },
  { id: "BR", name: "Bihar", code: "BR", type: "state" },
  { id: "CG", name: "Chhattisgarh", code: "CG", type: "state" },
  { id: "GA", name: "Goa", code: "GA", type: "state" },
  { id: "GJ", name: "Gujarat", code: "GJ", type: "state" },
  { id: "HR", name: "Haryana", code: "HR", type: "state" },
  { id: "HP", name: "Himachal Pradesh", code: "HP", type: "state" },
  { id: "JH", name: "Jharkhand", code: "JH", type: "state" },
  { id: "KA", name: "Karnataka", code: "KA", type: "state" },
  { id: "KL", name: "Kerala", code: "KL", type: "state" },
  { id: "MP", name: "Madhya Pradesh", code: "MP", type: "state" },
  { id: "MH", name: "Maharashtra", code: "MH", type: "state" },
  { id: "MN", name: "Manipur", code: "MN", type: "state" },
  { id: "ML", name: "Meghalaya", code: "ML", type: "state" },
  { id: "MZ", name: "Mizoram", code: "MZ", type: "state" },
  { id: "NL", name: "Nagaland", code: "NL", type: "state" },
  { id: "OR", name: "Odisha", code: "OR", type: "state" },
  { id: "PB", name: "Punjab", code: "PB", type: "state" },
  { id: "RJ", name: "Rajasthan", code: "RJ", type: "state" },
  { id: "SK", name: "Sikkim", code: "SK", type: "state" },
  { id: "TN", name: "Tamil Nadu", code: "TN", type: "state" },
  { id: "TS", name: "Telangana", code: "TS", type: "state" },
  { id: "TR", name: "Tripura", code: "TR", type: "state" },
  { id: "UK", name: "Uttarakhand", code: "UK", type: "state" },
  { id: "UP", name: "Uttar Pradesh", code: "UP", type: "state" },
  { id: "WB", name: "West Bengal", code: "WB", type: "state" },
  // Union Territories
  { id: "AN", name: "Andaman and Nicobar Islands", code: "AN", type: "ut" },
  { id: "CH", name: "Chandigarh", code: "CH", type: "ut" },
  { id: "DH", name: "Dadra and Nagar Haveli and Daman and Diu", code: "DH", type: "ut" },
  { id: "DL", name: "Delhi", code: "DL", type: "ut" },
  { id: "JK", name: "Jammu and Kashmir", code: "JK", type: "ut" },
  { id: "LA", name: "Ladakh", code: "LA", type: "ut" },
  { id: "LD", name: "Lakshadweep", code: "LD", type: "ut" },
  { id: "PY", name: "Puducherry", code: "PY", type: "ut" }
];

// Major Cities for Andhra Pradesh
export const andhraPreseshCities = [
  { id: "VZG", name: "Visakhapatnam", code: "VZG", state: "AP", population: "2.3M", isCapital: false },
  { id: "VJD", name: "Vijayawada", code: "VJD", state: "AP", population: "1.5M", isCapital: false },
  { id: "GNT", name: "Guntur", code: "GNT", state: "AP", population: "743K", isCapital: false },
  { id: "NLR", name: "Nellore", code: "NLR", state: "AP", population: "558K", isCapital: false },
  { id: "KNL", name: "Kurnool", code: "KNL", state: "AP", population: "484K", isCapital: false },
  { id: "RJM", name: "Rajahmundry", code: "RJM", state: "AP", population: "343K", isCapital: false },
  { id: "KKD", name: "Kakinada", code: "KKD", state: "AP", population: "443K", isCapital: false },
  { id: "TPT", name: "Tirupati", code: "TPT", state: "AP", population: "459K", isCapital: false },
  { id: "ANN", name: "Anantapur", code: "ANN", state: "AP", population: "406K", isCapital: false },
  { id: "CDR", name: "Chittoor", code: "CDR", state: "AP", population: "189K", isCapital: false },
  { id: "ELR", name: "Eluru", code: "ELR", state: "AP", population: "214K", isCapital: false },
  { id: "ONG", name: "Ongole", code: "ONG", state: "AP", population: "170K", isCapital: false },
  { id: "MZP", name: "Machilipatnam", code: "MZP", state: "AP", population: "179K", isCapital: false },
  { id: "PDR", name: "Proddatur", code: "PDR", state: "AP", population: "164K", isCapital: false },
  { id: "AML", name: "Amalapuram", code: "AML", state: "AP", population: "57K", isCapital: false },
  { id: "BZA", name: "Bhimavaram", code: "BZA", state: "AP", population: "142K", isCapital: false },
  { id: "TNL", name: "Tenali", code: "TNL", state: "AP", population: "164K", isCapital: false },
  { id: "NVL", name: "Narasaraopet", code: "NVL", state: "AP", population: "95K", isCapital: false },
  { id: "HNK", name: "Hindupur", code: "HNK", state: "AP", population: "151K", isCapital: false },
  { id: "MDK", name: "Madanapalle", code: "MDK", state: "AP", population: "107K", isCapital: false }
];

// Major Cities for Karnataka
export const karnatakaCities = [
  { id: "BNG", name: "Bengaluru", code: "BNG", state: "KA", population: "12.3M", isCapital: true },
  { id: "MYS", name: "Mysuru", code: "MYS", state: "KA", population: "920K", isCapital: false },
  { id: "HBL", name: "Hubballi", code: "HBL", state: "KA", population: "1.0M", isCapital: false },
  { id: "MNG", name: "Mangaluru", code: "MNG", state: "KA", population: "488K", isCapital: false },
  { id: "BLG", name: "Belagavi", code: "BLG", state: "KA", population: "610K", isCapital: false },
  { id: "GBG", name: "Gulbarga", code: "GBG", state: "KA", population: "532K", isCapital: false },
  { id: "DWD", name: "Davanagere", code: "DWD", state: "KA", population: "435K", isCapital: false },
  { id: "BDR", name: "Ballari", code: "BDR", state: "KA", population: "410K", isCapital: false },
  { id: "BJR", name: "Bijapur", code: "BJR", state: "KA", population: "327K", isCapital: false },
  { id: "SHM", name: "Shivamogga", code: "SHM", state: "KA", population: "322K", isCapital: false },
  { id: "TUM", name: "Tumakuru", code: "TUM", state: "KA", population: "305K", isCapital: false },
  { id: "RCR", name: "Raichur", code: "RCR", state: "KA", population: "234K", isCapital: false },
  { id: "BDG", name: "Bidar", code: "BDG", state: "KA", population: "172K", isCapital: false },
  { id: "HSN", name: "Hassan", code: "HSN", state: "KA", population: "133K", isCapital: false },
  { id: "UDI", name: "Udupi", code: "UDI", state: "KA", population: "125K", isCapital: false },
  { id: "CHK", name: "Chickmagalur", code: "CHK", state: "KA", population: "121K", isCapital: false },
  { id: "KPT", name: "Koppal", code: "KPT", state: "KA", population: "65K", isCapital: false },
  { id: "GDG", name: "Gadag", code: "GDG", state: "KA", population: "154K", isCapital: false },
  { id: "CHT", name: "Chitradurga", code: "CHT", state: "KA", population: "122K", isCapital: false },
  { id: "MDY", name: "Mandya", code: "MDY", state: "KA", population: "137K", isCapital: false }
];

// Major Cities for Tamil Nadu
export const tamilNaduCities = [
  { id: "MAA", name: "Chennai", code: "MAA", state: "TN", population: "10.9M", isCapital: true },
  { id: "CJB", name: "Coimbatore", code: "CJB", state: "TN", population: "2.2M", isCapital: false },
  { id: "MDU", name: "Madurai", code: "MDU", state: "TN", population: "1.4M", isCapital: false },
  { id: "TCY", name: "Tiruchirappalli", code: "TCY", state: "TN", population: "1.0M", isCapital: false },
  { id: "SLM", name: "Salem", code: "SLM", state: "TN", population: "997K", isCapital: false },
  { id: "TUV", name: "Tirunelveli", code: "TUV", state: "TN", population: "474K", isCapital: false },
  { id: "ERD", name: "Erode", code: "ERD", state: "TN", population: "499K", isCapital: false },
  { id: "VLR", name: "Vellore", code: "VLR", state: "TN", population: "423K", isCapital: false },
  { id: "TUP", name: "Tiruppur", code: "TUP", state: "TN", population: "444K", isCapital: false },
  { id: "THJ", name: "Thanjavur", code: "THJ", state: "TN", population: "290K", isCapital: false },
  { id: "DGL", name: "Dindigul", code: "DGL", state: "TN", population: "207K", isCapital: false },
  { id: "KKL", name: "Kanchipuram", code: "KKL", state: "TN", population: "164K", isCapital: false },
  { id: "KRR", name: "Karur", code: "KRR", state: "TN", population: "106K", isCapital: false },
  { id: "UDG", name: "Udhagamandalam", code: "UDG", state: "TN", population: "88K", isCapital: false },
  { id: "NGL", name: "Nagapattinam", code: "NGL", state: "TN", population: "102K", isCapital: false },
  { id: "NMK", name: "Namakkal", code: "NMK", state: "TN", population: "53K", isCapital: false },
  { id: "RMD", name: "Ramanathapuram", code: "RMD", state: "TN", population: "57K", isCapital: false },
  { id: "TVP", name: "Tiruvannamalai", code: "TVP", state: "TN", population: "145K", isCapital: false },
  { id: "VRD", name: "Virudhunagar", code: "VRD", state: "TN", population: "74K", isCapital: false },
  { id: "TVL", name: "Tiruvarur", code: "TVL", state: "TN", population: "58K", isCapital: false },
  { id: "CDL", name: "Cuddalore", code: "CDL", state: "TN", population: "173K", isCapital: false },
  { id: "VDL", name: "Villupuram", code: "VDL", state: "TN", population: "63K", isCapital: false },
  { id: "KNY", name: "Kanyakumari", code: "KNY", state: "TN", population: "19K", isCapital: false },
  { id: "PUD", name: "Pudukkottai", code: "PUD", state: "TN", population: "116K", isCapital: false },
  { id: "ARM", name: "Ariyalur", code: "ARM", state: "TN", population: "22K", isCapital: false }
];

// All cities combined for easy access
export const allIndianCities = [
  ...andhraPreseshCities,
  ...karnatakaCities,
  ...tamilNaduCities
];

// General city codes for international cities
export const internationalCities = [
  // USA
  { id: "NYC", name: "New York City", code: "NYC", country: "US", state: "NY" },
  { id: "LAX", name: "Los Angeles", code: "LAX", country: "US", state: "CA" },
  { id: "CHI", name: "Chicago", code: "CHI", country: "US", state: "IL" },
  { id: "HOU", name: "Houston", code: "HOU", country: "US", state: "TX" },
  { id: "PHX", name: "Phoenix", code: "PHX", country: "US", state: "AZ" },
  { id: "PHI", name: "Philadelphia", code: "PHI", country: "US", state: "PA" },
  { id: "SAN", name: "San Antonio", code: "SAN", country: "US", state: "TX" },
  { id: "DAL", name: "Dallas", code: "DAL", country: "US", state: "TX" },
  { id: "SJO", name: "San Jose", code: "SJO", country: "US", state: "CA" },
  { id: "AUS", name: "Austin", code: "AUS", country: "US", state: "TX" },
  
  // UK
  { id: "LON", name: "London", code: "LON", country: "GB", state: "ENG" },
  { id: "BIR", name: "Birmingham", code: "BIR", country: "GB", state: "ENG" },
  { id: "MAN", name: "Manchester", code: "MAN", country: "GB", state: "ENG" },
  { id: "GLW", name: "Glasgow", code: "GLW", country: "GB", state: "SCO" },
  { id: "LIV", name: "Liverpool", code: "LIV", country: "GB", state: "ENG" },
  
  // Canada
  { id: "TOR", name: "Toronto", code: "TOR", country: "CA", state: "ON" },
  { id: "VAN", name: "Vancouver", code: "VAN", country: "CA", state: "BC" },
  { id: "MON", name: "Montreal", code: "MON", country: "CA", state: "QC" },
  { id: "CAL", name: "Calgary", code: "CAL", country: "CA", state: "AB" },
  { id: "EDM", name: "Edmonton", code: "EDM", country: "CA", state: "AB" },
  
  // Australia
  { id: "SYD", name: "Sydney", code: "SYD", country: "AU", state: "NSW" },
  { id: "MEL", name: "Melbourne", code: "MEL", country: "AU", state: "VIC" },
  { id: "BRI", name: "Brisbane", code: "BRI", country: "AU", state: "QLD" },
  { id: "PER", name: "Perth", code: "PER", country: "AU", state: "WA" },
  { id: "ADE", name: "Adelaide", code: "ADE", country: "AU", state: "SA" }
];

// Combined city codes for all cities
export const cityCodes = [
  ...allIndianCities,
  ...internationalCities
];

// Helper functions
export const getCountryByCode = (code) => {
  return countryCodes.find(country => country.code === code);
};

export const getStateByCode = (code) => {
  return indianStates.find(state => state.code === code);
};

export const getCityByCode = (code) => {
  return cityCodes.find(city => city.code === code);
};

export const getCitiesByState = (stateCode) => {
  return allIndianCities.filter(city => city.state === stateCode);
};

export const getIndianStatesList = () => {
  return indianStates.filter(state => state.type === 'state');
};

export const getIndianUTsList = () => {
  return indianStates.filter(state => state.type === 'ut');
};

export const searchCities = (query, stateCode = null) => {
  const cities = stateCode 
    ? allIndianCities.filter(city => city.state === stateCode)
    : allIndianCities;
    
  return cities.filter(city => 
    city.name.toLowerCase().includes(query.toLowerCase())
  );
};

export const getCapitalCities = () => {
  return allIndianCities.filter(city => city.isCapital);
};