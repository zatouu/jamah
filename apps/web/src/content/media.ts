import type { StaticImageData } from 'next/image'
import type { Locale } from '@/i18n/config'
import dunes from '@/assets/media/dunes-ajouer-trarza.jpg'
import enseignement from '@/assets/media/enseignement-coran.jpg'
import fatiha from '@/assets/media/fatiha-ecriture-soudanaise.jpg'
import khaima from '@/assets/media/khaima-dunes-ajouer.jpg'
import manuscrit from '@/assets/media/manuscrit-chinguetti.jpg'
import medinaBaye from '@/assets/media/mosquee-medina-baye.jpg'
import tasbih from '@/assets/media/tasbih.jpg'

/**
 * Registre des images. Chaque image porte sa provenance et sa licence.
 * Phase 1 : images libres (Wikimedia Commons) en attendant la photothèque de la Jamah.
 * Ces images illustrent des lieux et objets ; elles ne représentent ni la Jamah ni ses maîtres.
 */
export type MediaEntry = {
  src: StaticImageData
  alt: Record<Locale, string>
  author: string
  license: string
  licenseUrl?: string
  sourceUrl: string
}

export const media = {
  khaima: {
    src: khaima,
    alt: { fr: 'Khaïma (tente) blanche dans les dunes d’Ajouer, Trarza, Mauritanie', ar: 'خيمة بيضاء بين كثبان أجوير، ولاية الترارزة، موريتانيا' },
    author: 'Ji-Elle',
    license: 'CC BY-SA 4.0',
    licenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:Kha%C3%AFma-Dunes_d%27Ajouer.jpg',
  },
  dunes: {
    src: dunes,
    alt: { fr: 'Dunes d’Ajouer dans le Trarza (Mauritanie)', ar: 'كثبان أجوير في ولاية الترارزة (موريتانيا)' },
    author: 'Ji-Elle',
    license: 'Domaine public',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:DunesAjouer.JPG',
  },
  fatiha: {
    src: fatiha,
    alt: { fr: 'Sourate al-Fātiḥa en écriture soudanaise, Afrique de l’Ouest, XIXᵉ siècle', ar: 'سورة الفاتحة بالخط السوداني، غرب إفريقيا، القرن التاسع عشر' },
    author: 'Chester Beatty Library, Is 1598, f. 1b',
    license: 'Domaine public',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:Al-Fatiha_in_the_Sudani_script_(CBL_Is_1598,_f._1b).jpg',
  },
  manuscrit: {
    src: manuscrit,
    alt: { fr: 'Manuscrit ancien de la bibliothèque de Chinguetti (Mauritanie)', ar: 'مخطوط قديم من مكتبة شنقيط (موريتانيا)' },
    author: 'Ji-Elle',
    license: 'CC BY-SA 3.0',
    licenseUrl: 'https://creativecommons.org/licenses/by-sa/3.0',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:Chinguetti-Manuscrit_(2).jpg',
  },
  tasbih: {
    src: tasbih,
    alt: { fr: 'Chapelet (tasbīḥ) en bois', ar: 'سبحة خشبية' },
    author: 'Fauwaz Alhassan',
    license: 'CC0',
    licenseUrl: 'https://creativecommons.org/publicdomain/zero/1.0/',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:Tasbih_or_prayer_beads.jpg',
  },
  enseignement: {
    src: enseignement,
    alt: { fr: 'Un maître indique un passage du Coran ouvert sur un tapis, chapelet à la main', ar: 'معلّم يشير إلى آية في مصحف مفتوح على سجادة، والسبحة في يده' },
    author: 'Pharouqenr',
    license: 'CC BY-SA 4.0',
    licenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:A_Qur%E2%80%99anic_teacher_sits_on_a_carpet_holding_a_tasbih_(prayer_beads)_while_teaching_the_Holy_Qur%E2%80%99an.jpg',
  },
  medinaBaye: {
    src: medinaBaye,
    alt: { fr: 'La grande mosquée de Médina Baye, Kaolack (Sénégal), en 2001', ar: 'المسجد الكبير بمدينة باي، كولخ (السنغال)، سنة 2001' },
    author: 'Joseph Hill (2001)',
    license: 'CC BY-SA 2.5',
    licenseUrl: 'https://creativecommons.org/licenses/by-sa/2.5',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:MedinaBaayMosque.jpg',
  },
} satisfies Record<string, MediaEntry>

export type MediaKey = keyof typeof media
export const mediaEntries: [MediaKey, MediaEntry][] = Object.entries(media) as [MediaKey, MediaEntry][]
