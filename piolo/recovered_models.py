1: # apps/properties/models.py
2: import uuid
3: from django.db import models
4: from django.conf import settings
5: from django.utils.text import slugify
6: from apps.accounts.models import CustomUser
7: from django.utils import timezone
8: from django.db import models as db_models
9: 
10: class PropertyStatus(models.TextChoices):
11:     DRAFT = 'DRAFT', 'Brouillon'
12:     PENDING = 'PENDING', 'En attente de validation'
13:     PUBLISHED = 'PUBLISHED', 'Publié'
14:     RENTED = 'RENTED', 'Loué'
15:     ARCHIVED = 'ARCHIVED', 'Archivé'
16: 
17: class TransactionType(models.TextChoices):
18:     LOCATION = 'LOCATION', 'Location'
19:     VENTE = 'VENTE', 'Vente'
20:     COURTE_DUREE = 'COURTE_DUREE', 'Courte durée'
21: 
22: class PropertyType(models.TextChoices):
23:     APPARTEMENT = 'APPARTEMENT', 'Appartement'
24:     VILLA = 'VILLA', 'Villa'
25:     STUDIO = 'STUDIO', 'Studio'
26:     TERRAIN = 'TERRAIN', 'Terrain'
27:     BUREAU = 'BUREAU', 'Bureau'
28:     BOUTIQUE = 'BOUTIQUE', 'Boutique'
29:     IMMEUBLE = 'IMMEUBLE', 'Immeuble'
30: 
31: class Property(models.Model):
32:     """Annonce immobilière publiée par un bailleur."""
33:     
34:     id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
35:     
36:     owner = models.ForeignKey(
37:         CustomUser,
38:         on_delete=models.CASCADE,
39:         related_name='properties',
40:         verbose_name="Bailleur",
41:         limit_choices_to={'role': 'BAILLEUR'}
42:     )
43:     
44:     title = models.CharField(max_length=200, verbose_name="Titre de l'annonce")
45:     slug = models.SlugField(max_length=250, unique=True, blank=True, editable=False)
46:     description = models.TextField(verbose_name="Description détaillée")
47:     
48:     transaction_type = models.CharField(
49:         max_length=20,
50:         choices=TransactionType.choices,
51:         default=TransactionType.LOCATION,
52:         verbose_name="Type de transaction"
53:     )
54:     
55:     property_type = models.CharField(
56:         max_length=20,
57:         choices=PropertyType.choices,
58:         verbose_name="Type de bien"
59:     )
60:     
61:     address = models.CharField(max_length=255, verbose_name="Adresse complète")
62:     city = models.CharField(max_length=100, verbose_name="Ville")
63:     neighborhood = models.CharField(max_length=100, blank=True, verbose_name="Quartier")
64:     
65:     latitude = models.DecimalField(
66:         max_digits=9, decimal_places=6,
67:         null=True, blank=True, verbose_name="Latitude"
68:     )
69:     longitude = models.DecimalField(
70:         max_digits=9, decimal_places=6,
71:         null=True, blank=True, verbose_name="Longitude"
72:     )
73:     
74:     price = models.PositiveBigIntegerField(verbose_name="Prix (FCFA)")
75:     price_negotiable = models.BooleanField(default=False, verbose_name="Prix négociable")
76:     
77:     area = models.PositiveSmallIntegerField(verbose_name="Surface (m²)")
78:     bedrooms = models.PositiveSmallIntegerField(default=0, verbose_name="Chambres")
79:     bathrooms = models.PositiveSmallIntegerField(default=1, verbose_name="Salles de bain")
80:     floors = models.PositiveSmallIntegerField(default=1, verbose_name="Étages")
81:     
82:     furnished = models.BooleanField(default=False, verbose_name="Meublé")
83:     balcony = models.BooleanField(default=False, verbose_name="Balcon/Terrasse")
84:     parking = models.BooleanField(default=False, verbose_name="Parking")
85:     security = models.BooleanField(default=False, verbose_name="Sécurité 24/7")
86:     water = models.BooleanField(default=True, verbose_name="Eau courante")
87:     electricity = models.BooleanField(default=True, verbose_name="Électricité")
88:     
89:     main_image = models.ImageField(
90:         upload_to='properties/main/',
91:         verbose_name="Image principale"
92:     )
93:     
94:     status = models.CharField(
95:         max_length=20,
96:         choices=PropertyStatus.choices,
97:         default=PropertyStatus.DRAFT,
98:         verbose_name="Statut",
99:         db_index=True
100:     )
101:     
102:     is_published = models.BooleanField(default=False, verbose_name="Publié")
103:     published_at = models.DateTimeField(null=True, blank=True, verbose_name="Date de publication")
104:     
105:     views_count = models.PositiveIntegerField(default=0, verbose_name="Vues")
106:     favorites_count = models.PositiveIntegerField(default=0, verbose_name="Favoris")
107:     
108:     created_at = models.DateTimeField(auto_now_add=True)
109:     updated_at = models.DateTimeField(auto_now=True)
110:     
111:     class Meta:
112:         db_table = 'piolo_properties'
113:         verbose_name = 'Annonce immobilière'
114:         verbose_name_plural = 'Annonces immobilières'
115:         ordering = ['-published_at', '-created_at']
116:         indexes = [
117:             models.Index(fields=['city', 'property_type']),
118:             models.Index(fields=['latitude', 'longitude']),
119:         ]
120:     
121:     def __str__(self):
122:         return f"{self.title} — {self.city}"
123:     
124:     def save(self, *args, **kwargs):
125:         if not self.slug:
126:             base_slug = slugify(self.title)
127:             slug = base_slug
128:             counter = 1
129:             while Property.objects.filter(slug=slug).exists():
130:                 slug = f"{base_slug}-{counter}"
131:                 counter += 1
132:             self.slug = slug
133:         super().save(*args, **kwargs)
134:     
135:     @property
136:     def location_string(self):
137:         parts = [self.neighborhood] if self.neighborhood else []
138:         parts.append(self.city)
139:         return ", ".join(filter(None, parts)) or "Localisation non précisée"
140:     
141:     @property
142:     def amenities_list(self):
143:         amenities = []
144:         if self.furnished: amenities.append("Meublé")
145:         if self.balcony: amenities.append("Balcon/Terrasse")
146:         if self.parking: amenities.append("Parking")
147:         if self.security: amenities.append("Sécurité 24/7")
148:         if self.water: amenities.append("Eau courante")
149:         if self.electricity: amenities.append("Électricité")
150:         return amenities
151:     
152: # apps/properties/models.py — ajouter à la suite du modèle Property
153: 
154: class PropertyImage(models.Model):
155:     """Image secondaire d'un bien immobilier (galerie)."""
156:     property = models.ForeignKey(
157:         Property,
158:         on_delete=models.CASCADE,
159:         related_name='images',
160:         verbose_name="Bien"
161:     )
162:     image = models.ImageField(
163:         upload_to='properties/gallery/%Y/%m/',
164:         verbose_name="Image"
165:     )
166:     caption = models.CharField(max_length=150, blank=True, verbose_name="Légende")
167:     order = models.PositiveSmallIntegerField(default=0, verbose_name="Ordre")
168:     created_at = models.DateTimeField(auto_now_add=True)
169: 
170:     class Meta:
171:         db_table = 'piolo_property_images'
172:         verbose_name = 'Image secondaire'
173:         verbose_name_plural = 'Images secondaires'
174:         ordering = ['order', 'created_at']
175: 
176:     def __str__(self):
177:         return f"Image #{self.order} — {self.property.title}"
178:     
179: 
180: 
181: 
182: 
183: 
184: # apps/properties/models.py — ajouter après PropertyImage
185: 
186: class VisitRequest(models.Model):
187:     """Demande de visite d'un bien — coûte 20 pts au locataire."""
188: 
189:     class Status(models.TextChoices):
190:         PENDING   = 'PENDING',   'En attente'
191:         CONFIRMED = 'CONFIRMED', 'Confirmée'
192:         REFUSED   = 'REFUSED',   'Refusée'
193:         CANCELLED = 'CANCELLED', 'Annulée'
194: 
195:     property    = models.ForeignKey(
196:         'Property', on_delete=models.CASCADE,
197:         related_name='visit_requests', verbose_name="Bien"
198:     )
199:     tenant      = models.ForeignKey(
200:         settings.AUTH_USER_MODEL, on_delete=models.CASCADE,
201:         related_name='visit_requests', verbose_name="Locataire"
202:     )
203:     status      = models.CharField(
204:         max_length=20, choices=Status.choices,
205:         default=Status.PENDING, verbose_name="Statut"
206:     )
207:     requested_date  = models.DateField(verbose_name="Date souhaitée")
208:     requested_time  = models.TimeField(null=True, blank=True, verbose_name="Heure souhaitée")
209:     message         = models.TextField(blank=True, verbose_name="Message au bailleur")
210:     
211:     # Réponse du bailleur
212:     bailleur_note   = models.TextField(blank=True, verbose_name="Note du bailleur")
213:     confirmed_date  = models.DateField(null=True, blank=True, verbose_name="Date confirmée")
214:     confirmed_time  = models.TimeField(null=True, blank=True, verbose_name="Heure confirmée")
215: 
216:     # Points
217:     points_deducted = models.BooleanField(default=False, verbose_name="Points déduits")
218: 
219:     created_at  = models.DateTimeField(auto_now_add=True)
220:     updated_at  = models.DateTimeField(auto_now=True)
221: 
222:     class Meta:
223:         db_table = 'piolo_visit_requests'
224:         verbose_name = 'Demande de visite'
225:         verbose_name_plural = 'Demandes de visite'
226:         ordering = ['-created_at']
227: 
228:     def __str__(self):
229:         return f"Visite {self.property.title} — {self.tenant} ({self.status})"
230: 
231:     def confirm(self, confirmed_date=None, confirmed_time=None, note=''):
232:         self.status         = self.Status.CONFIRMED
233:         self.confirmed_date = confirmed_date or self.requested_date
234:         self.confirmed_time = confirmed_time or self.requested_time
235:         self.bailleur_note  = note
236:         self.save(update_fields=['status', 'confirmed_date', 'confirmed_time', 'bailleur_note', 'updated_at'])
237: 
238:     def refuse(self, note=''):
239:         self.status        = self.Status.REFUSED
240:         self.bailleur_note = note
241:         self.save(update_fields=['status', 'bailleur_note', 'updated_at'])
242: 
243:     def cancel(self):
244:         self.status = self.Status.CANCELLED
245:         self.save(update_fields=['status', 'updated_at'])
246: 
247: 
248: class LocationRequest(models.Model):
249:     """
250:     Demande de location — coûte 20 pts au locataire.
251:     Inclut un dossier : CNI, justificatif de revenus, garant.
252:     """
253: 
254:     class Status(models.TextChoices):
255:         PENDING   = 'PENDING',   'En attente'
256:         REVIEWING = 'REVIEWING', 'En cours d\'examen'
257:         ACCEPTED  = 'ACCEPTED',  'Acceptée'
258:         REFUSED   = 'REFUSED',   'Refusée'
259:         CANCELLED = 'CANCELLED', 'Annulée'
260: 
261:     property = models.ForeignKey(
262:         'Property', on_delete=models.CASCADE,
263:         related_name='location_requests', verbose_name="Bien"
264:     )
265:     tenant = models.ForeignKey(
266:         settings.AUTH_USER_MODEL, on_delete=models.CASCADE,
267:         related_name='location_requests', verbose_name="Locataire"
268:     )
269:     status = models.CharField(
270:         max_length=20, choices=Status.choices,
271:         default=Status.PENDING, verbose_name="Statut"
272:     )
273: 
274:     # ── Infos dossier ──────────────────────────────────────────
275:     move_in_date    = models.DateField(verbose_name="Date d'entrée souhaitée")
276:     lease_duration  = models.PositiveSmallIntegerField(
277:         default=12, verbose_name="Durée souhaitée (mois)"
278:     )
279:     tenant_count    = models.PositiveSmallIntegerField(
280:         default=1, verbose_name="Nombre d'occupants"
281:     )
282:     monthly_income  = models.DecimalField(
283:         max_digits=12, decimal_places=0,
284:         null=True, blank=True, verbose_name="Revenus mensuels (FCFA)"
285:     )
286:     profession      = models.CharField(max_length=150, blank=True, verbose_name="Profession")
287:     employer        = models.CharField(max_length=150, blank=True, verbose_name="Employeur")
288:     message         = models.TextField(blank=True, verbose_name="Message de motivation")
289: 
290:     # ── Pièces justificatives ──────────────────────────────────
291:     cni_front       = models.FileField(
292:         upload_to='requests/cni/%Y/%m/', null=True, blank=True,
293:         verbose_name="CNI recto"
294:     )
295:     cni_back        = models.FileField(
296:         upload_to='requests/cni/%Y/%m/', null=True, blank=True,
297:         verbose_name="CNI verso"
298:     )
299:     income_proof    = models.FileField(
300:         upload_to='requests/income/%Y/%m/', null=True, blank=True,
301:         verbose_name="Justificatif de revenus"
302:     )
303: 
304:     # ── Garant ────────────────────────────────────────────────
305:     has_guarantor       = models.BooleanField(default=False, verbose_name="A un garant")
306:     guarantor_name      = models.CharField(max_length=150, blank=True, verbose_name="Nom du garant")
307:     guarantor_phone     = models.CharField(max_length=20, blank=True, verbose_name="Téléphone garant")
308:     guarantor_relation  = models.CharField(max_length=100, blank=True, verbose_name="Lien avec le garant")
309:     guarantor_income    = models.DecimalField(
310:         max_digits=12, decimal_places=0,
311:         null=True, blank=True, verbose_name="Revenus garant (FCFA)"
312:     )
313:     guarantor_cni       = models.FileField(
314:         upload_to='requests/guarantor/%Y/%m/', null=True, blank=True,
315:         verbose_name="CNI garant"
316:     )
317: 
318:     # ── Réponse bailleur ──────────────────────────────────────
319:     bailleur_note   = models.TextField(blank=True, verbose_name="Note du bailleur")
320: 
321:     # ── Points ────────────────────────────────────────────────
322:     points_deducted = models.BooleanField(default=False)
323: 
324:     created_at  = models.DateTimeField(auto_now_add=True)
325:     updated_at  = models.DateTimeField(auto_now=True)
326: 
327:     class Meta:
328:         db_table = 'properties_locationrequest'
329:         verbose_name = 'Demande de location'
330:         verbose_name_plural = 'Demandes de location'
331:         ordering = ['-created_at']
332: 
333:     def __str__(self):
334:         return f"Location {self.property.title} — {self.tenant} ({self.status})"
335: 
336:     def accept(self, note=''):
337:         self.status        = self.Status.ACCEPTED
338:         self.bailleur_note = note
339:         self.save(update_fields=['status', 'bailleur_note', 'updated_at'])
340: 
341:     def refuse(self, note=''):
342:         self.status        = self.Status.REFUSED
343:         self.bailleur_note = note
344:         self.save(update_fields=['status', 'bailleur_note', 'updated_at'])
345: 
346:     def cancel(self):
347:         self.status = self.Status.CANCELLED
348:         self.save(update_fields=['status', 'updated_at'])
349: 
350:     # @property
351:     # def dossier_completion(self):
352:     #     """Retourne le pourcentage de complétude du dossier (0-100)."""
353:     #     fields = [
354:     #         bool(self.cni_front),
355:     #         bool(self.cni_back),
356:     #         bool(self.income_proof),
357:     #         bool(self.monthly_income),
358:     #         bool(self.profession),
359:     #         bool(self.move_in_date),
360:     #     ]
361:     #     return int(sum(fields) / len(fields) * 100)
362:     
363: 
364:     def get_dossier_completion(self):
365:         """Retourne le pourcentage de complétude du dossier (0-100)."""
366:         fields = [
367:             bool(self.cni_front),
368:             bool(self.cni_back),
369:             bool(self.income_proof),
370:             bool(self.monthly_income),
371:             bool(self.profession),
372:             bool(self.move_in_date),
373:         ]
374:         return int(sum(fields) / len(fields) * 100)
375: 
376:     
377: 
378: 
379: # apps/properties/models.py
380: 
381: # ═══════════════════════════════════════════════════════════════════════
382: # VISITES VIRTUELLES 360°
383: # ═══════════════════════════════════════════════════════════════════════
384: 
385: class VirtualTour(models.Model):
386:     """Tour virtuel 360° d'un bien immobilier"""
387:     property = models.ForeignKey(Property, on_delete=models.CASCADE, related_name='virtual_tours')
388:     name = models.CharField(max_length=100, default="Visite virtuelle")
389:     is_active = models.BooleanField(default=True)
390:     created_at = models.DateTimeField(auto_now_add=True)
391:     
392:     class Meta:
393:         verbose_name = "Visite virtuelle"
394:         verbose_name_plural = "Visites virtuelles"
395:         ordering = ['-created_at']
396:     
397:     def __str__(self):
398:         return f"{self.name} - {self.property.title}"
399: 
400: 
401: class PanoramaScene(models.Model):
402:     """Une scène/panorama 360° (une pièce)"""
403:     tour = models.ForeignKey(VirtualTour, on_delete=models.CASCADE, related_name='scenes')
404:     name = models.CharField(max_length=100, help_text="Nom de la pièce (ex: Salon, Cuisine)")
405:     image = models.ImageField(upload_to='panoramas/%Y/%m/%d/')
406:     order = models.IntegerField(default=0, help_text="Ordre d'affichage")
407:     config_data = models.JSONField(blank=True, null=True, help_text="Configuration des hotspots")
408:     
409:     class Meta:
410:         ordering = ['order']
411:         verbose_name = "Scène panorama"
412:         verbose_name_plural = "Scènes panorama"
413:     
414:     def __str__(self):
415:         return f"{self.name} - {self.tour.name}"
416: 
417: 
418: class PanoramaHotspot(models.Model):
419:     """Point de navigation entre les scènes"""
420:     scene = models.ForeignKey(PanoramaScene, on_delete=models.CASCADE, related_name='hotspots')
421:     target_scene = models.ForeignKey(
422:         PanoramaScene, 
423:         on_delete=models.CASCADE, 
424:         related_name='incoming_hotspots',
425:         help_text="Scène vers laquelle ce hotspot mène"
426:     )
427:     yaw = models.FloatField(help_text="Position horizontale (-180 à 180)")
428:     pitch = models.FloatField(help_text="Position verticale (-90 à 90)")
429:     
430:     TYPE_CHOICES = [
431:         ('scene', 'Vers une autre pièce'),
432:         ('info', 'Information'),
433:         ('link', 'Lien externe'),
434:     ]
435:     hotspot_type = models.CharField(max_length=10, choices=TYPE_CHOICES, default='scene')
436:     label = models.CharField(max_length=100, blank=True, help_text="Texte affiché au survol")
437:     
438:     class Meta:
439:         verbose_name = "Hotspot"
440:         verbose_name_plural = "Hotspots"
441:     
442:     def __str__(self):
443:         return f"{self.label} - {self.scene.name} → {self.target_scene.name}"
444:     
445: 
446: class Favorite(models.Model):
447:     """Bien mis en favori par un locataire."""
448:     user     = models.ForeignKey(
449:         settings.AUTH_USER_MODEL, on_delete=models.CASCADE,
450:         related_name='favorites'
451:     )
452:     property = models.ForeignKey(
453:         Property, on_delete=models.CASCADE,
454:         related_name='favorited_by'
455:     )
456:     created_at = models.DateTimeField(auto_now_add=True)
457: 
458:     class Meta:
459:         db_table = 'piolo_favorites'
460:         unique_together = ('user', 'property')
461: 
462:     def __str__(self):
463:         return f"{self.user} ♥ {self.property.title}"
464: 
465: 
466: class SearchAlert(models.Model):
467:     """Alerte de recherche sauvegardée par un locataire."""
468:     user           = models.ForeignKey(
469:         settings.AUTH_USER_MODEL, on_delete=models.CASCADE,
470:         related_name='search_alerts'
471:     )
472:     title          = models.CharField(max_length=100, verbose_name="Nom de l'alerte")
473:     city           = models.CharField(max_length=100, blank=True)
474:     property_type  = models.CharField(max_length=20, blank=True)
475:     transaction_type = models.CharField(max_length=20, blank=True, default='LOCATION')
476:     min_price      = models.PositiveBigIntegerField(null=True, blank=True)
477:     max_price      = models.PositiveBigIntegerField(null=True, blank=True)
478:     min_area       = models.PositiveSmallIntegerField(null=True, blank=True)
479:     is_active      = models.BooleanField(default=True)
480:     last_notified  = models.DateTimeField(null=True, blank=True)
481:     created_at     = models.DateTimeField(auto_now_add=True)
482: 
483:     class Meta:
484:         db_table = 'piolo_search_alerts'
485:         ordering = ['-created_at']
486: 
487:     def __str__(self):
488:         return f"{self.title} — {self.user}"
489: 
490:     def matches(self, property_obj):
491:         """Vérifie si un bien correspond à cette alerte."""
492:         if self.city and self.city.lower() not in property_obj.city.lower():
493:             return False
494:         if self.property_type and self.property_type != property_obj.property_type:
495:             return False
496:         if self.transaction_type and self.transaction_type != property_obj.transaction_type:
497:             return False
498:         if self.min_price and property_obj.price < self.min_price:
499:             return False
500:         if self.max_price and property_obj.price > self.max_price:
501:             return False
502:         if self.min_area and property_obj.area < self.min_area:
503:             return False
504:         return True
505:     max_price      = models.PositiveBigIntegerField(null=True, blank=True)
506:     min_area       = models.PositiveSmallIntegerField(null=True, blank=True)
507:     is_active      = models.BooleanField(default=True)
508:     last_notified  = models.DateTimeField(null=True, blank=True)
509:     created_at     = models.DateTimeField(auto_now_add=True)
510: 
511:     class Meta:
512:         db_table = 'piolo_search_alerts'
513:         ordering = ['-created_at']
514: 
515:     def __str__(self):
516:         return f"{self.title} — {self.user}"
517: 
518:     def matches(self, property_obj):
519:         """Vérifie si un bien correspond à cette alerte."""
520:         if self.city and self.city.lower() not in property_obj.city.lower():
521:             return False
522:         if self.property_type and self.property_type != property_obj.property_type:
523:             return False
524:         if self.transaction_type and self.transaction_type != property_obj.transaction_type:
525:             return False
526:         if self.min_price and property_obj.price < self.min_price:
527:             return False
528:         if self.max_price and property_obj.price > self.max_price:
529:             return False
530:         if self.min_area and property_obj.area < self.min_area:
531:             return False
532:         return True
