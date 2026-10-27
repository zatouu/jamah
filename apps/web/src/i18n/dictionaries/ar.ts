import type { Dictionary } from './fr'

// Traduction arabe provisoire — à relire par un arabisant de la Jamah
// (graphies des noms propres notamment : voir docs/recherche/dossier-biographique.md).
export const ar: Dictionary = {
  meta: {
    siteName: 'جماعة سير العبيد',
    title: 'جماعة سير العبيد — الإسلام والطريقة التجانية والفيضة في ضوء المصادر',
    description:
      'منصة تحريرية ووثائقية: القرآن والسنة، الطريقة التجانية، الفيضة الإبراهيمية، إرث الشيخ ولد خيري، وتعاليم الشيخ عثمان امبو.',
  },
  a11y: {
    skip: 'الانتقال إلى المحتوى',
    mainNav: 'القائمة الرئيسية',
    menu: 'القائمة',
    breadcrumb: 'مسار التصفح',
    switchLanguage: 'Lire en français',
  },
  brand: { prefix: 'جماعة', name: 'سير العبيد', mark: 'ج' },
  langLabel: 'Français',
  home: 'الرئيسية',
  sections: {
    jamah: {
      label: 'الجماعة',
      intro: 'التعريف بالجماعة وتاريخها وهويتها الروحية وأنشطتها.',
      children: {
        'histoire-mission': 'التاريخ والرسالة',
        'identite-spirituelle': 'الهوية الروحية والانتساب',
        activites: 'الأنشطة والمشاريع',
        contact: 'اتصل بنا',
      },
    },
    'comprendre-islam': {
      label: 'فهم الإسلام',
      intro: 'الأصول مشروحة خطوة بخطوة انطلاقًا من القرآن والسنة.',
      children: {
        coran: 'القرآن وعلومه',
        'hadith-sunna': 'الحديث والسنة',
        croyance: 'العقيدة',
        jurisprudence: 'الشريعة والفقه',
        spiritualite: 'التزكية وتهذيب النفس',
        ethique: 'الأخلاق والمجتمع والحياة اليومية',
      },
    },
    tijaniyya: {
      label: 'الطريقة التجانية',
      intro: 'الطريق الروحي: مصادره وممارساته وتعاليمه.',
      children: {
        histoire: 'التاريخ والأسس',
        'cheikh-ahmad-tijani': 'الشيخ أحمد التجاني',
        'wird-wazifa': 'الأوراد: الورد والوظيفة',
        adab: 'الآداب والتلقين',
        textes: 'النصوص المرجعية',
        questions: 'أسئلة وأجوبة موثّقة',
      },
    },
    fayda: {
      label: 'الفيضة',
      intro: 'الفيضة الإبراهيمية للشيخ إبراهيم انياس.',
      children: {
        'cheikh-ibrahim-niasse': 'الشيخ إبراهيم انياس',
        histoire: 'تاريخ الفيضة وفهمها',
        themes: 'المعرفة والتوحيد والذكر: دراسات موضوعية',
        oeuvres: 'الكتب والقصائد والرسائل',
      },
    },
    maitres: {
      label: 'المشايخ',
      intro: 'إرث الشيخ ولد خيري وتعاليم الشيخ عثمان امبو.',
      children: {
        'cheikh-ould-khayri': 'الشيخ ولد خيري',
        'cheikh-ousmane-mbow': 'الشيخ عثمان امبو',
      },
    },
    bibliotheque: {
      label: 'المكتبة',
      intro: 'البحث والقراءة في النصوص والترجمات والتفريغات.',
      children: {
        recherche: 'البحث',
        auteurs: 'المؤلفون',
        ouvrages: 'المؤلفات',
        videos: 'المرئيات',
      },
    },
    actualites: {
      label: 'الأخبار',
      intro: 'مقالات وفعاليات ومحاضرات وإعلانات الجماعة.',
      children: {
        articles: 'المقالات',
        evenements: 'الفعاليات',
        conferences: 'المحاضرات',
        telechargements: 'وثائق للتحميل',
      },
    },
  },
  search: {
    label: 'البحث في المكتبة',
    placeholder: 'موضوع، نص، مفهوم…',
    submit: 'بحث',
    suggestionsLabel: 'اقتراحات',
    suggestions: ['التوحيد', 'الذكر', 'الورد', 'المعرفة', 'الأدب'],
  },
  homePage: {
    eyebrow: 'جماعة سير العبيد',
    title: 'فهم الإسلام والطريقة التجانية والفيضة في ضوء المصادر.',
    lead: 'مكتبة حيّة تربط بين القرآن والسنة ومؤلفات المشايخ وشروح الشيخ عثمان امبو — للبحث والقراءة والفهم.',
    paths: {
      title: 'من أين تبدأ؟',
      items: [
        { href: 'comprendre-islam', title: 'اكتشاف الإسلام', body: 'الأصول: القرآن والسنة والعقيدة والعبادة.' },
        { href: 'comprendre-islam/spiritualite', title: 'فهم التصوف', body: 'تزكية النفس والإحسان انطلاقًا من الأدلة.' },
        { href: 'tijaniyya', title: 'الطريقة التجانية', body: 'تاريخها وأورادها وآدابها.' },
        { href: 'fayda', title: 'الفيضة الإبراهيمية', body: 'إرث الشيخ إبراهيم انياس.' },
      ],
    },
    chain: {
      title: 'من الأصول إلى الشروح',
      lead: 'كل تعليم مرتبط بمصدره، وعلى هذا الترتيب بُني الموقع.',
      items: [
        { href: 'comprendre-islam', title: 'القرآن والسنة', body: 'الأصول' },
        { href: 'tijaniyya', title: 'الطريقة التجانية', body: 'الطريق الروحي' },
        { href: 'fayda', title: 'الفيضة الإبراهيمية', body: 'الشيخ إبراهيم انياس' },
        { href: 'maitres/cheikh-ould-khayri', title: 'الشيخ ولد خيري', body: 'الإرث والسند' },
        { href: 'maitres/cheikh-ousmane-mbow', title: 'الشيخ عثمان امبو', body: 'الشرح والاستدلال' },
      ],
    },
    guide: {
      eyebrow: 'شرح المرشد',
      title: 'الشيخ عثمان امبو',
      body: 'يشرح ويستدل ويعرض الأقوال الدينية على المصادر. تُربط هنا مؤلفاته ومرئياته وتعليقاته بالنصوص التي يشرحها.',
      note: 'التعريف المفصّل قيد المراجعة من قبل الجماعة.',
      cta: 'اكتشف تعاليمه',
      links: ['المرئيات', 'المؤلفات', 'تحليلات ومناقشات'],
    },
    library: {
      eyebrow: 'المكتبة',
      title: 'قراءة النصوص دون خلط بينها',
      lead: 'كل طبقة مميَّزة بوضوح: تعرف دائمًا هل تقرأ المصدر أم ترجمته أم شرحه.',
      reference: 'الفاتحة: ١',
      layers: {
        original: 'النص الأصلي',
        transliteration: 'الكتابة الصوتية',
        translation: 'الترجمة',
        commentary: 'التعليق',
      },
      sample: {
        original: 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ',
        transliteration: 'Bismi Llāhi r-Raḥmāni r-Raḥīm',
        translation: 'Au nom de Dieu, le Tout Miséricordieux, le Très Miséricordieux.',
        commentary: 'موضع محجوز: لا يظهر التعليق هنا إلا بعد مراجعته واعتماده.',
      },
      cta: 'تصفّح المكتبة',
    },
    news: { title: 'أحدث المنشورات', empty: 'ستُنشر أولى المواد بعد المراجعة التحريرية.' },
    events: { title: 'الفعاليات القادمة', empty: 'لا توجد فعاليات معلنة حاليًا.' },
    seeAll: 'عرض الكل',
  },
  placeholder: {
    eyebrow: 'قسم قيد الإعداد',
    body: 'هذا المحتوى قيد التحرير والمراجعة، وسيُنشر بعد التحقق من مصادره واعتمادها.',
    subsections: 'في هذا القسم',
    back: 'العودة إلى الرئيسية',
  },
  notFound: { title: 'الصفحة غير موجودة', body: 'هذا العنوان لا يطابق أي صفحة في الموقع.' },
  footer: {
    tagline: 'منصة تحريرية ووثائقية لجماعة سير العبيد.',
    editorial: 'يُنشر كل نص بمراجعه بعد المراجعة التحريرية.',
    explore: 'استكشف',
    rights: 'جميع الحقوق محفوظة.',
  },
}
