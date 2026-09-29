// Every UI string, grouped by feature (docs/folder-structure.md "messages/").
// v1 is Arabic-only: components import `ar` directly. An English storefront
// later is an `en.ts` with the same shape plus a locale switch.

export const ar = {
  brand: {
    name: "كنترول سيف زون",
    tagline: "قطع إلكترونيات السيارات",
  },

  nav: {
    home: "الرئيسية",
    ics: "آي سيهات",
    controllers: "كنترولات",
    programmers: "أجهزة برمجة",
    pinouts: "بن أوت",
    support: "الدعم",
    about: "من نحن",
    menu: "القائمة",
    signIn: "تسجيل الدخول",
    signUp: "إنشاء حساب",
    admin: "لوحة التحكم",
    backToStore: "العودة للمتجر",
  },

  auth: {
    signInTitle: "تسجيل الدخول",
    signUpTitle: "إنشاء حساب",
    subtitle: "لفنيي إلكترونيات السيارات في مصر",
  },

  authCallback: {
    metaTitle: "جاري تسجيل الدخول",
    loadingTitle: "جاري تجهيز حسابك",
    loadingDescription: "لحظات ونحوّلك تلقائيًا…",
    successTitle: "تم تسجيل الدخول",
    successDescription: "جاري التحويل…",
    errorTitle: "تعذّر تجهيز حسابك",
    retry: "حاول مرة أخرى",
    home: "العودة للرئيسية",
  },

  landing: {
    eyebrow: "آي سيهات · كنترولات · أجهزة برمجة · بن أوت",
    title: "ابحث برقم القطعة، واستلمها في ورشتك",
    description:
      "كل ما يحتاجه فني الكنترول في مكان واحد — مخزون حقيقي، أسعار بالجنيه، الدفع عند الاستلام، وشحن لكل محافظات مصر.",
    searchPlaceholder: "رقم القطعة، الماركينج، أو رقم الهاردوير…",
    searchButton: "بحث",
    popular: "الأكثر بحثًا:",
    categoriesTitle: "تسوّق حسب القسم",
    categories: {
      ics: {
        title: "آي سيهات",
        description: "معالجات، إيبروم، فلاش ودرايفرات — ابحث بالماركينج المطبوع على الشريحة.",
      },
      controllers: {
        title: "كنترولات",
        description: "كنترولات جديدة ومستعملة ومجددة وفيرجن، برقم الهاردوير والسوفتوير.",
      },
      programmers: {
        title: "أجهزة برمجة",
        description: "اعرف أي جهاز يدعم الكنترول بتاعك — OBD أو Boot أو Bench.",
      },
      pinouts: {
        title: "بن أوت",
        description: "مخططات توصيل واضحة بصيغة PDF لكل كنترول.",
      },
    },
    browse: "تصفّح",
    trustTitle: "ليه كنترول سيف زون؟",
    trust: {
      stock: { title: "مخزون حقيقي", description: "المتاح على الموقع موجود على الرف فعلًا." },
      cod: { title: "الدفع عند الاستلام", description: "أو ادفع أونلاين بالكارت أو المحفظة." },
      shipping: { title: "شحن لكل المحافظات", description: "من القاهرة لأسوان — الرسوم حسب المحافظة." },
      support: { title: "دعم على واتساب", description: "اسأل عن التوافق قبل ما تطلب." },
    },
    ctaTitle: "جاهز تطلب أول قطعة؟",
    ctaDescription: "أنشئ حسابك في دقيقة واحفظ عنوان ورشتك لطلبات أسرع.",
    ctaSignedIn: "ابدأ البحث",
  },

  footer: {
    rights: "جميع الحقوق محفوظة.",
  },

  admin: {
    metaTitle: "لوحة التحكم",
    welcome: "أهلًا،",
    description: "هذه لوحة تحكم مبدئية — الأرقام تظهر هنا مع بناء الطلبات والمخزون.",
    stats: {
      orders: "طلبات اليوم",
      pendingCod: "في انتظار التأكيد",
      lowStock: "مخزون منخفض",
      customers: "العملاء",
    },

    shell: {
      title: "لوحة التحكم",
      sidebarLabel: "القائمة الجانبية",
      toggleSidebar: "إظهار/إخفاء القائمة",
      backToStore: "العودة للمتجر",
    },

    groups: {
      overview: "نظرة عامة",
      catalog: "الكتالوج",
      // Brands and controller platforms: lookup data every catalog item links to.
      reference: "البيانات المرجعية",
      sales: "المبيعات",
      system: "النظام",
    },

    // Collapsible parents in the sidebar — not pages themselves.
    folders: {
      hardware: "الهاردوير",
    },

    // Breadcrumb tails for sub-pages: … › الماركات › إضافة
    crumbs: {
      new: "إضافة",
      edit: "تعديل",
    },

    placeholder: {
      badge: "قيد الإنشاء",
      title: "هذه الصفحة قيد الإنشاء",
      planned: "ما سيكون هنا:",
      milestone: "المرحلة",
    },

    // One entry per /admin section — sidebar label, page title and the
    // placeholder's "what will be here" list (docs/business-analysis.md
    // "Administration").
    sections: {
      dashboard: {
        title: "لوحة التحكم",
        description: "نظرة سريعة على المبيعات والطلبات والمخزون.",
        planned: ["مبيعات اليوم والشهر", "الطلبات حسب الحالة", "منتجات بمخزون منخفض"],
      },
      // ── الهاردوير ── one page per sold type, plus pinouts.
      // No brackets around Latin runs below: they mirror and split when a line wraps.
      programmers: {
        title: "المبرمجات",
        description: "أجهزة البرمجة — KESS و Autotuner و PCMflash… بالسعر والمخزون.",
        planned: [
          "إضافة وتعديل الجهاز والإصدار ومحتويات العلبة",
          "المنصات المدعومة وطريقة الدعم — OBD · Boot · Bench",
          "السعر والمخزون وحد التنبيه",
        ],
      },
      controllers: {
        title: "الكنترولات",
        description: "وحدات الكنترول — رقم الهاردوير والسوفتوير والحالة.",
        planned: [
          "رقم الهاردوير والسوفتوير ورقم القطعة",
          "الحالة: جديد · مستعمل · مجدد، وعلامة فيرجن",
          "المنصة والسيارات المتوافقة",
          "السعر والمخزون والصور",
        ],
      },
      ics: {
        title: "الآي سيهات",
        description: "الشرائح — رقم القطعة والماركينج والباكدج.",
        planned: [
          "رقم القطعة وكل الماركينج المطبوع على الشريحة",
          "النوع — MCU · EEPROM · FLASH · DRIVER · POWER",
          "الباكدج وعدد الأرجل ورابط الداتاشيت",
          "المنصات التي تستخدم الشريحة",
          "السعر والمخزون وحد التنبيه",
        ],
      },
      pinouts: {
        title: "البن أوت",
        description: "مخططات التوصيل — صورة معاينة وملف PDF.",
        planned: ["رفع الصورة وملف الـ PDF", "الربط بمنصة الكنترول", "تحديد من يمكنه التحميل"],
      },
      brands: {
        title: "الماركات",
        description: "ماركات السيارات وموديلاتها — للتصفح حسب الماركة.",
        planned: ["إضافة وتعديل الماركات والشعارات", "موديلات كل ماركة وسنوات الإنتاج"],
      },
      platforms: {
        title: "منصات الكنترول",
        // Arabic first: a sentence that opens with a Latin run reads in a confusing order in RTL.
        description: "البيانات المرجعية لكل الأقسام — مثل Bosch EDC17C46 و MED17.5 و SIMOS.",
        planned: ["إضافة وتعديل المنصات والشركة المصنعة", "ما يرتبط بكل منصة: كنترولات، آي سيهات، أجهزة، بن أوت"],
      },
      orders: {
        title: "الطلبات",
        description: "قائمة الطلبات وتغيير حالتها حتى التوصيل.",
        planned: [
          "تأكيد طلبات الدفع عند الاستلام",
          "تغيير الحالة: تأكيد، تجهيز، شحن، توصيل",
          "رقم الشحنة وشركة الشحن",
          "الإلغاء والمرتجعات مع إرجاع المخزون",
        ],
      },
      customers: {
        title: "العملاء",
        description: "حسابات العملاء وطلباتهم.",
        planned: ["البحث بالاسم أو رقم الموبايل", "سجل طلبات كل عميل", "صلاحيات المشرفين"],
      },
      shippingZones: {
        title: "مناطق الشحن",
        description: "المحافظات الـ 27 ورسوم الشحن لكل محافظة.",
        planned: ["رسوم الشحن ومدة التوصيل", "إتاحة الدفع عند الاستلام لكل محافظة", "ترتيب المحافظات وتفعيلها"],
      },
      settings: {
        title: "الإعدادات",
        description: "إعدادات المتجر العامة.",
        planned: ["بيانات المتجر ورقم واتساب", "حدود ورسوم الدفع عند الاستلام", "بادئة رقم الطلب"],
      },
    },
  },

  // Admin › الماركات — brands-feature.md
  brands: {
    list: {
      add: "إضافة ماركة",
      searchPlaceholder: "ابحث بالاسم أو الـ slug…",
      count: (n: number) => `${n} ماركة`,
      columns: {
        logo: "الشعار",
        name: "الماركة",
        slug: "الرابط",
        models: "الموديلات",
        status: "الحالة",
        actions: "إجراءات",
      },
      active: "مفعّلة",
      inactive: "معطّلة",
      edit: "تعديل",
      delete: "حذف",
      actionsFor: (name: string) => `إجراءات ${name}`,
      emptyTitle: "لا توجد ماركات بعد",
      emptyDescription: "أضف أول ماركة سيارات ليظهر التصفح حسب الماركة في المتجر.",
      noResults: "لا توجد ماركات تطابق البحث.",
      loadError: "تعذّر تحميل الماركات.",
      retry: "إعادة المحاولة",
    },
    form: {
      createTitle: "إضافة ماركة",
      createDescription: "ماركة سيارات جديدة — تظهر في التصفح حسب الماركة.",
      editTitle: "تعديل الماركة",
      detailsTitle: "بيانات الماركة",
      name: "الاسم (إنجليزي)",
      nameHint: "كما تُكتب الماركة عالميًا — Toyota، Volkswagen.",
      nameAr: "الاسم بالعربي",
      nameArHint: "اختياري — تويوتا، فولكس فاجن.",
      slug: "الرابط (slug)",
      // The URL itself is rendered after this, inside <Ltr> — a leading "/" in
      // Arabic text flips to the wrong end.
      slugHint: "يُملأ تلقائيًا من الاسم. رابط الصفحة:",
      logo: "الشعار",
      logoHint: "PNG أو JPG أو WEBP — حتى 2 ميجابايت. يفضَّل خلفية شفافة.",
      isActive: "مفعّلة",
      isActiveHint: "الماركة المعطّلة لا تظهر في المتجر، وتبقى بياناتها كما هي.",
      create: "إضافة الماركة",
      save: "حفظ التعديلات",
      cancel: "إلغاء",
    },
    dropzone: {
      prompt: "اسحب الصورة هنا أو اضغط للاختيار",
      uploading: "جاري الرفع…",
      replace: "تغيير",
      remove: "إزالة",
      invalidType: "نوع الملف غير مدعوم — PNG أو JPG أو WEBP فقط.",
      tooLarge: "حجم الصورة أكبر من 2 ميجابايت.",
    },
    delete: {
      title: "حذف الماركة؟",
      description: (name: string) =>
        `سيتم حذف «${name}» وشعارها نهائيًا. لا يمكن التراجع عن هذا الإجراء.`,
      confirm: "حذف الماركة",
      cancel: "إلغاء",
    },
    toasts: {
      created: "تمت إضافة الماركة",
      updated: "تم حفظ التعديلات",
      deleted: "تم حذف الماركة",
    },
    errors: {
      notFound: "الماركة غير موجودة — ربما حُذفت.",
      nameTaken: "يوجد ماركة بنفس الاسم.",
      slugTaken: "هذا الرابط مستخدم لماركة أخرى.",
      hasModels: (n: number) =>
        `لا يمكن حذف ماركة لها ${n} موديل. عطّلها بدلًا من الحذف، أو احذف موديلاتها أولًا.`,
    },
    validation: {
      nameMin: "الاسم قصير جدًا.",
      nameMax: "الاسم أطول من 60 حرفًا.",
      nameArMax: "الاسم العربي أطول من 60 حرفًا.",
      slugMin: "الرابط قصير جدًا.",
      slugMax: "الرابط أطول من 80 حرفًا.",
      slugFormat: "حروف إنجليزية صغيرة وأرقام وشرطات فقط — مثل land-rover.",
      logoInvalid: "رابط الشعار غير صالح — ارفع الصورة من جديد.",
      id: "معرّف غير صالح.",
    },
  },

  // Admin › منصات الكنترول — controller-platforms-feature.md
  platforms: {
    list: {
      add: "إضافة منصة",
      searchPlaceholder: "ابحث بالاسم أو الشركة المصنعة…",
      count: (n: number) => `${n} منصة`,
      columns: {
        name: "المنصة",
        slug: "الرابط",
        controllers: "كنترولات",
        ics: "آي سيهات",
        programmers: "أجهزة",
        pinouts: "بن أوت",
        status: "الحالة",
        actions: "إجراءات",
      },
      active: "مفعّلة",
      inactive: "معطّلة",
      edit: "تعديل",
      delete: "حذف",
      actionsFor: (name: string) => `إجراءات ${name}`,
      emptyTitle: "لا توجد منصات بعد",
      emptyDescription:
        "المنصات هي البيانات المرجعية التي تربط الكنترولات والآي سيهات وأجهزة البرمجة والبن أوت — ابدأ بإضافة أول منصة.",
      noResults: "لا توجد منصات تطابق البحث.",
      loadError: "تعذّر تحميل المنصات.",
      retry: "إعادة المحاولة",
    },
    form: {
      createTitle: "إضافة منصة",
      createDescription: "منصة كنترول جديدة — مثل Bosch EDC17C46 أو Continental SIMOS 18.1.",
      editTitle: "تعديل المنصة",
      detailsTitle: "بيانات المنصة",
      manufacturer: "الشركة المصنعة",
      manufacturerHint: "مُصنّع الكنترول، لا ماركة السيارة — Bosch، Continental، Delphi، Denso.",
      name: "اسم المنصة",
      nameHint: "كما يُكتب على الكنترول — EDC17C46، MED17.5، SIMOS 18.1.",
      slugLabel: "الرابط (slug)",
      // The URL is rendered after this, inside <Ltr> — a leading "/" flips in Arabic text.
      slugHint: "يُملأ تلقائيًا من الشركة والاسم. رابط الصفحة:",
      description: "الوصف",
      descriptionHint: "اختياري — ملاحظات للفنيين: السيارات الشائعة، طريقة القراءة…",
      isActive: "مفعّلة",
      isActiveHint: "المنصة المعطّلة لا تظهر في المتجر، وتبقى ارتباطاتها كما هي.",
      create: "إضافة المنصة",
      save: "حفظ التعديلات",
      cancel: "إلغاء",
    },
    delete: {
      title: "حذف المنصة؟",
      description: (name: string) => `سيتم حذف «${name}» نهائيًا. لا يمكن التراجع عن هذا الإجراء.`,
      confirm: "حذف المنصة",
      cancel: "إلغاء",
    },
    toasts: {
      created: "تمت إضافة المنصة",
      updated: "تم حفظ التعديلات",
      deleted: "تم حذف المنصة",
    },
    errors: {
      notFound: "المنصة غير موجودة — ربما حُذفت.",
      nameTaken: "توجد منصة بنفس الاسم.",
      slugTaken: "هذا الرابط مستخدم لمنصة أخرى.",
      // "12 كنترول، 3 آي سي" — built by the service from the non-zero counts.
      inUse: (links: string) =>
        `لا يمكن حذف منصة مرتبطة بـ ${links}. عطّلها بدلًا من الحذف، أو أزل الارتباطات أولًا.`,
      linkLabels: {
        controllers: "كنترول",
        ics: "آي سي",
        programmers: "جهاز برمجة",
        pinouts: "بن أوت",
      },
    },
    validation: {
      manufacturerMin: "اسم الشركة قصير جدًا.",
      manufacturerMax: "اسم الشركة أطول من 40 حرفًا.",
      nameMin: "اسم المنصة قصير جدًا.",
      nameMax: "اسم المنصة أطول من 40 حرفًا.",
      slugMin: "الرابط قصير جدًا.",
      slugMax: "الرابط أطول من 80 حرفًا.",
      slugFormat: "حروف إنجليزية صغيرة وأرقام وشرطات فقط — مثل bosch-edc17c46.",
      descriptionMax: "الوصف أطول من 500 حرف.",
      id: "معرّف غير صالح.",
    },
  },

  notFound: {
    title: "الصفحة غير موجودة",
    description: "ممكن يكون الرابط غلط، أو الصفحة لسه تحت الإنشاء.",
    home: "العودة للرئيسية",
  },

  errors: {
    unauthenticated: "يجب تسجيل الدخول أولًا.",
    forbidden: "هذا الإجراء متاح للمشرفين فقط.",
    invalidInput: "البيانات غير صالحة — راجع الحقول المظلّلة.",
    unexpected: "حدث خطأ غير متوقع. حاول مرة أخرى.",
    upload: {
      missing: "لم يتم اختيار ملف.",
      invalidType: "نوع الملف غير مدعوم — PNG أو JPG أو WEBP فقط.",
      tooLarge: "حجم الصورة أكبر من 2 ميجابايت.",
      failed: "تعذّر رفع الصورة. حاول مرة أخرى.",
    },
    noVerifiedEmail: "لا يوجد بريد إلكتروني مؤكَّد على حسابك.",
    syncFailed: "حدث خطأ أثناء تجهيز حسابك. حاول مرة أخرى.",
  },
} as const
