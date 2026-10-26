import re

with open('recovered_models.py', 'r', encoding='utf-8') as f:
    lines = f.readlines()

clean_lines = []
for line in lines:
    # remove the line number prefix like "123: "
    match = re.match(r'^\d+:\s(.*)$', line)
    if match:
        clean_lines.append(match.group(1) + '\n')

# Deduplicate the end
text = "".join(clean_lines)
text = text.replace("    max_price      = models.PositiveBigIntegerField(null=True, blank=True)\n    min_area       = models.PositiveSmallIntegerField(null=True, blank=True)\n    is_active      = models.BooleanField(default=True)\n    last_notified  = models.DateTimeField(null=True, blank=True)\n    created_at     = models.DateTimeField(auto_now_add=True)\n\n    class Meta:\n        db_table = 'piolo_search_alerts'\n        ordering = ['-created_at']\n\n    def __str__(self):\n        return f\"{self.title} — {self.user}\"\n\n    def matches(self, property_obj):\n        \"\"\"Vérifie si un bien correspond à cette alerte.\"\"\"\n        if self.city and self.city.lower() not in property_obj.city.lower():\n            return False\n        if self.property_type and self.property_type != property_obj.property_type:\n            return False\n        if self.transaction_type and self.transaction_type != property_obj.transaction_type:\n            return False\n        if self.min_price and property_obj.price < self.min_price:\n            return False\n        if self.max_price and property_obj.price > self.max_price:\n            return False\n        if self.min_area and property_obj.area < self.min_area:\n            return False\n        return True\n", "")

with open('apps/properties/models.py', 'w', encoding='utf-8') as f:
    f.write(text)

