import type { Locale } from '@/i18n/config'

/**
 * Métadonnées des images livrées avec le site (Wikimedia Commons), sans import de fichier :
 * lisibles par `cms/scripts/seed.mjs` pour les verser dans Directus.
 * Aucune représentation figurée du Prophète ﷺ : on utilise une hilye (description calligraphiée).
 */
export type MediaMeta = {
  file: string
  alt: Record<Locale, string>
  author: string
  license: string
  licenseUrl?: string
  sourceUrl: string
  /** Valeur CSS `object-position` (cadrage). */
  position?: string
}

export const mediaCatalog = {
  khaima: {
    file: 'khaima-dunes-ajouer.jpg',
    alt: { fr: 'Khaïma (tente) blanche dans les dunes d’Ajouer, Trarza, Mauritanie', ar: 'خيمة بيضاء بين كثبان أجوير، ولاية الترارزة، موريتانيا' },
    author: 'Ji-Elle',
    license: 'CC BY-SA 4.0',
    licenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:Kha%C3%AFma-Dunes_d%27Ajouer.jpg',
  },
  dunes: {
    file: 'dunes-ajouer-trarza.jpg',
    alt: { fr: 'Dunes d’Ajouer dans le Trarza (Mauritanie)', ar: 'كثبان أجوير في ولاية الترارزة (موريتانيا)' },
    author: 'Ji-Elle',
    license: 'Domaine public',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:DunesAjouer.JPG',
  },
  fatiha: {
    file: 'fatiha-ecriture-soudanaise.jpg',
    alt: { fr: 'Sourate al-Fātiḥa en écriture soudanaise, Afrique de l’Ouest, XIXᵉ siècle', ar: 'سورة الفاتحة بالخط السوداني، غرب إفريقيا، القرن التاسع عشر' },
    author: 'Chester Beatty Library, Is 1598, f. 1b',
    license: 'Domaine public',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:Al-Fatiha_in_the_Sudani_script_(CBL_Is_1598,_f._1b).jpg',
    position: 'top',
  },
  manuscrit: {
    file: 'manuscrit-chinguetti.jpg',
    alt: { fr: 'Manuscrit ancien de la bibliothèque de Chinguetti (Mauritanie)', ar: 'مخطوط قديم من مكتبة شنقيط (موريتانيا)' },
    author: 'Ji-Elle',
    license: 'CC BY-SA 3.0',
    licenseUrl: 'https://creativecommons.org/licenses/by-sa/3.0',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:Chinguetti-Manuscrit_(2).jpg',
  },
  tasbih: {
    file: 'tasbih.jpg',
    alt: { fr: 'Chapelet (tasbīḥ) en bois', ar: 'سبحة خشبية' },
    author: 'Fauwaz Alhassan',
    license: 'CC0',
    licenseUrl: 'https://creativecommons.org/publicdomain/zero/1.0/',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:Tasbih_or_prayer_beads.jpg',
  },
  enseignement: {
    file: 'enseignement-coran.jpg',
    alt: { fr: 'Un maître indique un passage du Coran ouvert sur un tapis, chapelet à la main', ar: 'معلّم يشير إلى آية في مصحف مفتوح على سجادة، والسبحة في يده' },
    author: 'Pharouqenr',
    license: 'CC BY-SA 4.0',
    licenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:A_Qur%E2%80%99anic_teacher_sits_on_a_carpet_holding_a_tasbih_(prayer_beads)_while_teaching_the_Holy_Qur%E2%80%99an.jpg',
  },
  medinaBaye: {
    file: 'mosquee-medina-baye.jpg',
    alt: { fr: 'La grande mosquée de Médina Baye, Kaolack (Sénégal), en 2001', ar: 'المسجد الكبير بمدينة باي، كولخ (السنغال)، سنة 2001' },
    author: 'Joseph Hill (2001)',
    license: 'CC BY-SA 2.5',
    licenseUrl: 'https://creativecommons.org/licenses/by-sa/2.5',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:MedinaBaayMosque.jpg',
  },
  hilye: {
    file: 'hilye-hafiz-osman.jpg',
    alt: { fr: 'Hilye de Hafız Osman (vers 1670) : description calligraphiée du Prophète ﷺ', ar: 'حلية الحافظ عثمان (نحو 1670): وصف النبي ﷺ بالخط' },
    author: 'Hafız Osman, musée Sadberk Hanım',
    license: 'Domaine public',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:Hilye_by_Hafiz_Osman_from_Sadberk_Hanim_Museum.jpg',
  },
  domeVert: {
    file: 'dome-vert-medine.jpg',
    alt: { fr: 'Le Dôme vert de la mosquée du Prophète ﷺ à Médine', ar: 'القبة الخضراء في المسجد النبوي بالمدينة المنورة' },
    author: 'TheHadiRahim',
    license: 'CC0',
    licenseUrl: 'https://creativecommons.org/publicdomain/zero/1.0/',
    sourceUrl: "https://commons.wikimedia.org/wiki/File:Wide_shot_of_the_Green_Dome_at_The_Prophet%27s_Mosque_(Al_Masjid-e-Nabawi).jpg",
  },
  ainMadhi: {
    file: 'ain-madhi.jpg',
    alt: { fr: 'Panneau indiquant Aïn Madhi (Laghouat, Algérie), lieu de naissance de Cheikh Ahmad Tijani', ar: 'لافتة تشير إلى عين ماضي (الأغواط، الجزائر)، مسقط رأس الشيخ أحمد التجاني' },
    author: 'Habib kaki',
    license: 'CC0',
    licenseUrl: 'https://creativecommons.org/publicdomain/zero/1.0/',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:Ain_Madhi_-_Laghouat_%D8%B9%D9%8A%D9%86_%D9%85%D8%A7%D8%B6%D9%8A_-_%D8%A7%D9%84%D8%A7%D8%BA%D9%88%D8%A7%D8%B7.jpg',
  },
  bayeNiasse: {
    file: 'baye-niasse.jpg',
    alt: { fr: 'Cheikh Ibrāhīm Niasse (photographie d’archive)', ar: 'الشيخ إبراهيم انياس (صورة أرشيفية)' },
    author: 'Wallabokk (Wikimedia Commons)',
    license: 'CC BY-SA 4.0',
    licenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:Ibrahim_Niyass.jpg',
    position: '50% 20%',
  },
} satisfies Record<string, MediaMeta>

export type MediaKey = keyof typeof mediaCatalog
