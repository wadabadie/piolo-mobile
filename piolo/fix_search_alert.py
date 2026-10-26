import re

with open('apps/properties/models.py', 'r', encoding='utf-8') as f:
    content = f.read()

replacement = """    min_price      = models.PositiveBigIntegerField(null=True, blank=True)
    max_price      = models.PositiveBigIntegerField(null=True, blank=True)
    min_area       = models.PositiveSmallIntegerField(null=True, blank=True)
    is_active      = models.BooleanField(default=True)
    last_notified  = models.DateTimeField(null=True, blank=True)
    created_at     = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'piolo_search_alerts'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.title} — {self.user}"

    def matches(self, property_obj):
        \"\"\"Vérifie si un bien correspond à cette alerte.\"\"\"
        if self.city and self.city.lower() not in property_obj.city.lower():
            return False
        if self.property_type and self.property_type != property_obj.property_type:
            return False
        if self.transaction_type and self.transaction_type != property_obj.transaction_type:
            return False
        if self.min_price and property_obj.price < self.min_price:
            return False
        if self.max_price and property_obj.price > self.max_price:
            return False
        if self.min_area and property_obj.area < self.min_area:
            return False
        return True"""

content = content.replace("    min_price      = models.PositiveBigIntegerField(null=True, blank=True)", replacement)

with open('apps/properties/models.py', 'w', encoding='utf-8') as f:
    f.write(content)
