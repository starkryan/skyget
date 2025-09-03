// Demonstrating how your existing system handles undefined placeholders

function normalizeToSingleLine(str = "") {
  return str
    .replace(/\r?\n|\r/g, " ")  
    .replace(/\s+/g, " ")      
    .trim();
}

const escapeRegex = (s = "") =>
  s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

function buildSmartOtpRegexList(formats) {
  if (!formats || formats.length === 0) return [];
  if (!Array.isArray(formats)) formats = [formats];

  return formats
    .map((format) => {
      format = normalizeToSingleLine(format); // ✅ multiline → single line
      if (!format.includes("{otp}")) return null;

      let pattern = escapeRegex(format);

      // This is how your system handles specific placeholders:
      pattern = pattern.replace(/\\\{otp\\\}/gi, "(?<otp>[A-Za-z0-9\\-]{3,12})"); 
      pattern = pattern.replace(/\\\{date\\\}/gi, ".*");
      pattern = pattern.replace(/\\\{datetime\\\}/gi, ".*");
      pattern = pattern.replace(/\\\{time\\\}/gi, ".*");
      pattern = pattern.replace(/\\\{random\\\}/gi, "[A-Za-z0-9]{3,15}");
      
      // THIS IS THE KEY LINE that handles ALL other placeholders:
      pattern = pattern.replace(/\\\{.*?\\\}/gi, ".*");

      pattern = pattern
        .replace(/\\s+/g, "\\s*")
        .replace(/\\:/g, "[:：]?")
        .replace(/\\\./g, ".*");

      return new RegExp(pattern, "i");
    })
    .filter(Boolean);
}

// Your exact SMS
const fullSms = "Lakshay Garg welcomes you to Oriflame. Visit https://1kx.in/ORIIND/UE9FZa8ip65 to activate your account. Code: 698823. Login with Member No.: 11556973";

// Flexible template with undefined placeholders
const flexibleFormat = "{name} welcomes you to Oriflame. Visit {url} to activate your account. Code: {otp}. Login with Member No.: {memberNo}";

console.log("=== How Your System Handles Undefined Placeholders ===\n");
console.log("Flexible Format Template:");
console.log(flexibleFormat);

// Step-by-step transformation
console.log("\n=== Step-by-Step Transformation ===");

let format = normalizeToSingleLine(flexibleFormat);
console.log("1. Normalized to single line:");
console.log("   " + format);

let pattern = escapeRegex(format);
console.log("\n2. After escaping regex special chars:");
console.log("   " + pattern);

// Process each replacement step
pattern = pattern.replace(/\\\{otp\\\}/gi, "(?<otp>[A-Za-z0-9\\-]{3,12})");
console.log("\n3. After replacing {otp}:");
console.log("   " + pattern);

pattern = pattern.replace(/\\\{date\\\}/gi, ".*");
pattern = pattern.replace(/\\\{datetime\\\}/gi, ".*");
pattern = pattern.replace(/\\\{time\\\}/gi, ".*");
pattern = pattern.replace(/\\\{random\\\}/gi, "[A-Za-z0-9]{3,15}");
console.log("\n4. After replacing defined placeholders (date, datetime, time, random):");
console.log("   " + pattern);

// THIS IS THE CRITICAL STEP:
pattern = pattern.replace(/\\\{.*?\\\}/gi, ".*");
console.log("\n5. AFTER THE KEY REPLACEMENT - all other placeholders become .* :");
console.log("   " + pattern);

pattern = pattern
  .replace(/\\s+/g, "\\s*")
  .replace(/\\:/g, "[:：]?")
  .replace(/\\\./g, ".*");

console.log("\n6. After final formatting adjustments:");
console.log("   " + pattern);

const finalRegex = new RegExp(pattern, "i");
console.log("\n7. Final Regex Pattern:");
console.log("   " + finalRegex);

// Test the final regex
console.log("\n=== Testing Against Your SMS ===");
console.log("SMS: " + fullSms);

const cleanMessage = normalizeToSingleLine(fullSms);
const match = finalRegex.exec(cleanMessage);

if (match) {
  const otpFound = match.groups?.otp || match[1] || match[0];
  console.log("\n✅ MATCH FOUND!");
  console.log("Extracted OTP: " + otpFound);
  console.log("Full match: " + match[0]);
} else {
  console.log("\n❌ No match found");
}

console.log("\n=== Explanation ===");
console.log("Your system handles undefined placeholders through this line:");
console.log("pattern = pattern.replace(/\\\\\\{.*?\\\\\\}/gi, \".*\");");
console.log("");
console.log("This means:");
console.log("- {name} becomes .* (matches any characters)");
console.log("- {url} becomes .* (matches any characters)");
console.log("- {memberNo} becomes .* (matches any characters)");
console.log("- Only {otp} gets the special capture group (?<otp>[A-Za-z0-9\\-]{3,12})");
console.log("");
console.log("So your flexible template works perfectly with your existing codebase!");
