import subprocess, re, json, sys

# Fetch the page
result = subprocess.run(['curl', '-sL', 'https://slaythespire2.gg/zh/cards'],
                       capture_output=True, text=True)
html = result.stdout

# Find all card data in the RSC payloads
# Pattern: "name":"卡名","category":"CARD","cardType":"..."
pattern = r'"name":"([^"]{1,20})","category":"CARD","cardType":"([^"]{1,10})"'

matches = re.findall(pattern, html)
cards = {}
for name, card_type in matches:
    cards[name] = card_type

print(f"Found {len(cards)} cards")
for name, ctype in sorted(cards.items()):
    print(f"  {name} ({ctype})")
