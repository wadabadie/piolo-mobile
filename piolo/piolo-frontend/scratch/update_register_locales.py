import json

with open('src/i18n/locales/fr.json', 'r', encoding='utf-8') as f:
    fr_data = json.load(f)

with open('src/i18n/locales/en.json', 'r', encoding='utf-8') as f:
    en_data = json.load(f)

fr_register_bailleur = {
    "title": "Espace Bailleur — Inscription & Certification",
    "steps": {
        "identity": "Informations personnelles",
        "verification": "Vérification téléphone",
        "documents": "Pièce d'identité",
        "patrimony": "Votre patrimoine",
        "summary": "Récapitulatif & envoi"
    },
    "cni_label": "Carte Nationale d'Identité (CNI)",
    "passport_label": "Passeport biométrique",
    "upload_hint": "Formats : JPG, PNG, PDF · Taille max : 5 Mo, sans reflet ni flou.",
    "code_expiry": "Le code expire après 10 minutes. Saisissez-le rapidement.",
    "code_warning": "Ne partagez jamais ce code avec personne, même un agent Piolo.",
    "network_hint": "Assurez-vous d'avoir une connexion réseau MTN ou Orange active.",
    "success_title": "Dossier soumis avec succès !",
    "success_desc": "Votre dossier de certification bailleur est en cours d'examen par nos équipes.",
    "terms_agree": "J'accepte les Conditions d'utilisation et la Politique de Confidentialité de Piolo.",
    "data_encrypted": "Vos données sont chiffrées et sécurisées."
}

en_register_bailleur = {
    "title": "Landlord Space — Registration & Verification",
    "steps": {
        "identity": "Personal Information",
        "verification": "Phone Verification",
        "documents": "Identity Document",
        "patrimony": "Your Property Portfolio",
        "summary": "Summary & Submission"
    },
    "cni_label": "National ID Card (CNI)",
    "passport_label": "Biometric Passport",
    "upload_hint": "Formats: JPG, PNG, PDF · Max size: 5 MB, sharp and glare-free.",
    "code_expiry": "The code expires in 10 minutes. Enter it promptly.",
    "code_warning": "Never share this code with anyone, even a Piolo agent.",
    "network_hint": "Ensure you have an active MTN or Orange network connection.",
    "success_title": "Application submitted successfully!",
    "success_desc": "Your landlord verification application is currently being reviewed by our team.",
    "terms_agree": "I accept Piolo's Terms of Service and Privacy Policy.",
    "data_encrypted": "Your data is encrypted and secure."
}

fr_property_crud = {
    "create_title": "Déposer une annonce",
    "update_title": "Modifier l'annonce",
    "general_info": "Informations Générales",
    "basic_info": "Informations de base",
    "property_location": "Localisation du bien",
    "property_features": "Caractéristiques du bien",
    "photos_gallery": "Photos & Galerie",
    "add_images_gallery": "Ajouter de nouvelles images à la galerie",
    "main_image_replace": "Image principale (remplacer)",
    "existing_gallery": "Galerie - Images existantes",
    "no_secondary_images": "Aucune image secondaire.",
    "danger_zone": "Zone de danger",
    "archive_listing": "Archiver l'annonce",
    "delete_permanently": "Supprimer définitivement",
    "delete_warning": "La suppression d'une annonce est irréversible. Toutes les données, visites virtuelles et images seront perdues.",
    "click_add_image": "Cliquez pour ajouter une image",
    "loading": "Chargement..."
}

en_property_crud = {
    "create_title": "Create a Listing",
    "update_title": "Edit Listing",
    "general_info": "General Information",
    "basic_info": "Basic Information",
    "property_location": "Property Location",
    "property_features": "Property Features",
    "photos_gallery": "Photos & Gallery",
    "add_images_gallery": "Add new images to gallery",
    "main_image_replace": "Main image (replace)",
    "existing_gallery": "Gallery - Existing images",
    "no_secondary_images": "No secondary images.",
    "danger_zone": "Danger Zone",
    "archive_listing": "Archive listing",
    "delete_permanently": "Delete permanently",
    "delete_warning": "Deleting a listing is irreversible. All data, virtual tours and photos will be permanently removed.",
    "click_add_image": "Click to add an image",
    "loading": "Loading..."
}

fr_data['register_bailleur'] = fr_register_bailleur
fr_data['property_crud'] = fr_property_crud

en_data['register_bailleur'] = en_register_bailleur
en_data['property_crud'] = en_property_crud

with open('src/i18n/locales/fr.json', 'w', encoding='utf-8') as f:
    json.dump(fr_data, f, ensure_ascii=False, indent=2)

with open('src/i18n/locales/en.json', 'w', encoding='utf-8') as f:
    json.dump(en_data, f, ensure_ascii=False, indent=2)

print("Updated fr.json and en.json for register_bailleur and property_crud!")
