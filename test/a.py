import re

def detect_service_name(sms):
    services = [
        {
            "name": "UniPin",
            "pattern": r"Your OTP for UniPin is \d{4,6}\. It will expire on \d{2}-\d{2}-\d{4} \d{2}:\d{2}:\d{2}"
        },
        {
            "name": "ROOTER",
            "pattern": r"Your OTP for login at ROOTER is: \d{4,6}"
        }
    ]

    for service in services:
        if re.search(service["pattern"], sms):
            return service["name"]

    return "Not found"

# Test cases
sms1 = "Your OTP for UniPin is 448808. It will expire on 03-08-2025 15:22:15."
sms2 = "Your OTP for login at ROOTER is: 52"
sms3 = "Your OTP for login at ROOTER is: 5274"
sms4 = "Random message"

print(detect_service_name(sms1))  # UniPin
print(detect_service_name(sms2))  # Not found
print(detect_service_name(sms3))  # ROOTER
print(detect_service_name(sms4))  # Not found
