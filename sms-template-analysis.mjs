// Using the EXACT buildSmartOtpRegexList function from script/f.mjs

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
      format = normalizeToSingleLine(format);
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

      // Handle duplicate named capture groups by using non-named groups for duplicates
      // Count occurrences of otp capture group
      const otpCount = (pattern.match(/\(\?<otp>/g) || []).length;
      if (otpCount > 1) {
        // Replace all but the first occurrence with non-named groups
        let first = true;
        pattern = pattern.replace(/\(\?<otp>/g, (match) => {
          if (first) {
            first = false;
            return "(?<otp>";
          }
          return "(";
        });
      }

      return new RegExp(pattern, "i");
    })
    .filter(Boolean);
}

console.log("=== SMS Template Analysis ===\n");

// User's SMS pattern
const userPattern = "Transaction initiated on Myntra- authorize it using OTP {otp}. Do not speak or share OTP on call -Simpl Pay @{random} #{random}";

// Example SMS from user
const exampleSms = "Transaction initiated on Myntra- authorize it using OTP S655. Do not speak or share OTP on call -Simpl Pay @splitpay.getsimpl.com #S655";

console.log("User's Template:");
console.log(userPattern);
console.log("\nExample SMS:");
console.log(exampleSms);

// Process the template using the exact function from f.mjs
const regexList = buildSmartOtpRegexList(userPattern);

console.log("\nGenerated Regex Pattern:");
console.log(regexList[0]);

// Test against the example SMS
const cleanMessage = normalizeToSingleLine(exampleSms);
console.log("\nCleaned Message:");
console.log(cleanMessage);

let otpFound = null;

for (const regex of regexList) {
  const match = regex.exec(cleanMessage);
  if (match) {
    otpFound = match.groups?.otp || match[1] || match[0];
    console.log(`\n✅ OTP Found: ${otpFound}`);
    console.log("Full match:", match[0]);
    if (match.groups) {
      console.log("Named groups:", match.groups);
    }
    console.log("All captures:", match);
    break;
  }
}

if (!otpFound) {
  console.log("\n❌ No OTP found with this template");
  console.log("\nLet's debug what's happening:");
  
  // Let's manually check what the pattern looks like
  console.log("Pattern analysis:");
  const testPattern = "Transaction initiated on Myntra- authorize it using OTP (?<otp>[A-Za-z0-9\\-]{3,12}).* Do not speak or share OTP on call -Simpl Pay @[A-Za-z0-9]{3,15} #[A-Za-z0-9]{3,15}";
  console.log("Testing pattern:", testPattern);
  
  const testRegex = new RegExp(testPattern, "i");
  const testMatch = testRegex.exec(cleanMessage);
  if (testMatch) {
    console.log("Manual test match:", testMatch);
  } else {
    console.log("Manual test: No match found");
    
    // Let's check if it's a dot matching issue
    console.log("\nChecking if it's a dot matching issue:");
    console.log("Message length:", cleanMessage.length);
    console.log("Does message contain 'Do not speak'?", cleanMessage.includes("Do not speak"));
  }
}

// Let's also test a simpler approach
console.log("\n=== Testing Simpler Template ===");
const simpleTemplate = "authorize it using OTP {otp}";

console.log("Simple Template:");
console.log(simpleTemplate);

const simpleRegexList = buildSmartOtpRegexList(simpleTemplate);
console.log("Generated Regex:", simpleRegexList[0]);

const simpleMatch = simpleRegexList[0].exec(cleanMessage);
if (simpleMatch) {
  const otp = simpleMatch.groups?.otp || simpleMatch[1];
  console.log(`✅ OTP Found: ${otp}`);
} else {
  console.log("❌ No match found");
}

// Test with a modified template that fixes the dot issue
console.log("\n=== Testing Modified Template ===");
const modifiedTemplate = "Transaction initiated on Myntra- authorize it using OTP {otp}\\. Do not speak or share OTP on call -Simpl Pay @{random} #{random}";

console.log("Modified Template (with escaped dots):");
console.log(modifiedTemplate);

const modifiedRegexList = buildSmartOtpRegexList(modifiedTemplate);
console.log("Generated Regex:", modifiedRegexList[0]);

const modifiedMatch = modifiedRegexList[0].exec(cleanMessage);
if (modifiedMatch) {
  const otp = modifiedMatch.groups?.otp || modifiedMatch[1];
  console.log(`✅ OTP Found: ${otp}`);
} else {
  console.log("❌ No match found");
}

console.log("\n=== Recommendations ===");
console.log("1. For maximum compatibility with the current system, use:");
console.log('   "authorize it using OTP {otp}"');
console.log("   This is simple and focuses on the key phrase that contains the OTP.");

console.log("\n2. The issue with your original template is that the regex builder converts dots (.) to .* patterns,");
console.log("   which can cause the pattern to be too broad and not match correctly.");

console.log("\n3. The current regex builder in f.mjs works but has some limitations with complex patterns.");
console.log("   The simpler template approach is more reliable.");
