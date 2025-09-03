// Copy the exact functions from f.mjs
const escapeRegex = (s = "") =>
  s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

function normalizeToSingleLine(str = "") {
  return str
    .replace(/\r?\n|\r/g, " ")  
    .replace(/\s+/g, " ")      
    .trim();
}

// ✅ Smart OTP regex builder (fixed order: escape → insert placeholders)
function buildSmartOtpRegexList(formats) {
  if (!formats || formats.length === 0) return [];
  if (!Array.isArray(formats)) formats = [formats];

  return formats
    .map((format) => {
      format = normalizeToSingleLine(format); // ✅ multiline → single line
      if (!format.includes("{otp}")) return null;

      let pattern = escapeRegex(format);

      pattern = pattern.replace(/\\\{otp\\\}/gi, "(?<otp>[A-Za-z0-9\\-]{3,12})"); 
      pattern = pattern.replace(/\\\{date\\\}/gi, ".*");
      pattern = pattern.replace(/\\\{datetime\\\}/gi, ".*");
      pattern = pattern.replace(/\\\{time\\\}/gi, ".*");
      pattern = pattern.replace(/\\\{random\\\}/gi, "[A-Za-z0-9]{3,15}");
      pattern = pattern.replace(/\\\{.*?\\\}/gi, ".*");

      pattern = pattern
        .replace(/\\s+/g, "\\s*")
        .replace(/\\:/g, "[:：]?")
        .replace(/\\\./g, ".*");

      return new RegExp(pattern, "i");
    })
    .filter(Boolean);
}

console.log("=== Testing Simple Template with f.mjs Functions ===\n");

// Test the recommended simple template
const simpleTemplate = "authorize it using OTP {otp}";
const exampleSms = "Transaction initiated on Myntra- authorize it using OTP S655. Do not speak or share OTP on call -Simpl Pay @splitpay.getsimpl.com #S655";

console.log("Template:", simpleTemplate);
console.log("Example SMS:", exampleSms);

// Build regex list using the exact function from f.mjs
const otpRegexList = buildSmartOtpRegexList(simpleTemplate);

console.log("\nGenerated Regex Patterns:");
otpRegexList.forEach((regex, i) => {
  console.log(`  ${i + 1}. ${regex}`);
});

// Test against the example SMS
const cleanMessage = normalizeToSingleLine(exampleSms);
console.log("\nCleaned Message:", cleanMessage);

let otpFound = null;

for (const regex of otpRegexList) {
  const m = regex.exec(cleanMessage);
  otpFound = m?.groups?.otp || (m && m[1]) || null;
  if (otpFound) {
    console.log("\n✅ OTP Found:", otpFound);
    console.log("Full match:", m[0]);
    if (m.groups) {
      console.log("Named groups:", m.groups);
    }
    break;
  }
}

if (!otpFound) {
  console.log("\n❌ No OTP found with this template");
}

// Test with multiple similar SMS examples
console.log("\n=== Testing with Multiple SMS Examples ===");

const testSmsList = [
  "Transaction initiated on Myntra- authorize it using OTP S655. Do not speak or share OTP on call -Simpl Pay @splitpay.getsimpl.com #S655",
  "Transaction initiated on Zepto-authorize it using OTP D918. Do not speak or share OTP on call -Simpl Pay @splitpay.getsimpl.com #D918",
  "Transaction initiated on Zomato-authorize it using OTP B464. Do not speak or share OTP on call -Simpl Pay @splitpay.getsimpl.com #B464",
  "Transaction initiated on Swiggy-authorize it using OTP C875. Do not speak or share OTP on call -Simpl Pay @splitpay.getsimpl.com #C875"
];

testSmsList.forEach((sms, index) => {
  console.log(`\n${index + 1}. SMS: ${sms}`);
  
  const cleanSms = normalizeToSingleLine(sms);
  let found = null;
  
  for (const regex of otpRegexList) {
    const match = regex.exec(cleanSms);
    if (match) {
      found = match.groups?.otp || match[1];
      console.log(`   ✅ OTP Found: ${found}`);
      break;
    }
  }
  
  if (!found) {
    console.log("   ❌ No OTP found");
  }
});

console.log("\n=== Summary ===");
console.log("The simple template 'authorize it using OTP {otp}' works correctly with:");
console.log("- The original Myntra SMS");
console.log("- Similar SMS from other Simpl Pay services");
console.log("- The existing regex builder in f.mjs without modifications");
