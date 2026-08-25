import type {
  ProductCategory,
  Service,
  ServiceGroup,
} from "@/types/content";

/**
 * Services offered by Smart Channels.
 *
 * Source: the service list confirmed by the client as actively provided.
 * English titles have been cleaned up where the supplied wording read as
 * machine translation. Business meaning has not been changed anywhere; only
 * phrasing.
 *
 * EXCEPTION: "Computer Applications & Fiber Optic Solutions" is reproduced
 * verbatim from the brief and is awaiting the client's confirmation of the
 * official wording. It must not be reinterpreted until then — see the note on
 * that entry.
 *
 * `capabilities` expands each service into concrete, checkable deliverables.
 * These describe what the service covers, never how much of it has been done —
 * no volumes, no client counts, no track-record claims.
 *
 * To add or edit a service, change this file only. The Solutions section, the
 * contact form's service dropdown and the company page's capability list all
 * read from here.
 */

export const serviceGroups: readonly ServiceGroup[] = [
  {
    id: "it-services",
    title: {
      en: "Information Technology Services",
      ar: "خدمات تقنية المعلومات",
    },
    description: {
      en: "Systems, servers, data protection and the software environments your teams work in every day.",
      ar: "الأنظمة والخوادم وحماية البيانات وبيئات العمل البرمجية التي تعتمد عليها فرقكم يوميًا.",
    },
  },
  {
    id: "networks",
    title: {
      en: "Networks",
      ar: "الشبكات",
    },
    description: {
      en: "Connectivity and communications infrastructure — wired, wireless and everything that runs across it.",
      ar: "بنية الاتصال والاتصالات — السلكية واللاسلكية وكل ما يعمل عبرها.",
    },
  },
  {
    id: "products",
    title: {
      en: "Security & Specialised Systems",
      ar: "الأمن والأنظمة المتخصصة",
    },
    description: {
      en: "Protective systems and the integrated infrastructure that supports them.",
      ar: "أنظمة الحماية والبنية التحتية المتكاملة الداعمة لها.",
    },
  },
];

export const services: readonly Service[] = [
  /* ---- Security & specialised systems ----------------------------------- */
  {
    id: "utm-firewall",
    group: "products",
    title: {
      en: "Unified Threat Management & Firewall Security",
      ar: "الإدارة الموحّدة للتهديدات وأمن الجدار الناري",
    },
    summary: {
      en: "Perimeter and gateway protection consolidated into a single managed layer, so policy is enforced consistently rather than device by device.",
      ar: "حماية للمحيط والبوابة ضمن طبقة واحدة مُدارة، بحيث تُطبَّق السياسات باتساق بدلًا من إدارتها جهازًا جهازًا.",
    },
    capabilities: {
      en: [
        "Next-generation firewall deployment and configuration",
        "Unified threat management policy design",
        "Content and application filtering",
        "Intrusion detection and prevention",
        "Ongoing rule review and tuning",
      ],
      ar: [
        "تركيب وتهيئة الجدران النارية من الجيل التالي",
        "تصميم سياسات الإدارة الموحّدة للتهديدات",
        "تصفية المحتوى والتطبيقات",
        "كشف الاختراقات ومنعها",
        "مراجعة القواعد وضبطها بشكل مستمر",
      ],
    },
    icon: "shield-check",
    image: {
      src: "/images/solutions/security.webp",
      width: 1200,
      height: 800,
      alt: {
        en: "Network security equipment installed in a server rack.",
        ar: "أجهزة أمن الشبكات مركّبة داخل خزانة خوادم.",
      },
    },
  },
  {
    id: "advanced-security",
    group: "products",
    title: {
      en: "Advanced Security Solutions",
      ar: "حلول الأمن المتقدّمة",
    },
    summary: {
      en: "Surveillance, access control and identity systems specified around the site and the risk, then integrated with the wider network.",
      ar: "أنظمة المراقبة والتحكم في الدخول والهوية، تُحدَّد وفق الموقع ومستوى المخاطر ثم تُدمج مع الشبكة الأوسع.",
    },
    capabilities: {
      en: [
        "CCTV and IP surveillance systems",
        "Access control systems",
        "Biometric and fingerprint identification",
        "Alarm and intrusion systems",
        "Integration with existing network infrastructure",
      ],
      ar: [
        "أنظمة المراقبة التلفزيونية و IP",
        "أنظمة التحكم في الدخول",
        "التعرّف الحيوي والبصمة",
        "أنظمة الإنذار وكشف التسلل",
        "التكامل مع بنية الشبكة القائمة",
      ],
    },
    icon: "scan-eye",
    image: {
      src: "/images/solutions/surveillance.webp",
      width: 1200,
      height: 1800,
      alt: {
        en: "Surveillance camera mounted on a building exterior.",
        ar: "كاميرا مراقبة مثبّتة على واجهة مبنى.",
      },
    },
  },
  {
    id: "integrated-infrastructure",
    group: "products",
    title: {
      en: "Integrated Infrastructure & Specialised Systems",
      ar: "البنية التحتية المتكاملة والأنظمة المتخصصة",
    },
    // The client's supplied title was a comma list too long for a card. The
    // full scope is preserved in the summary and capabilities below.
    summary: {
      en: "Infrastructure, network security, video, audio, data and specialised systems planned and delivered together as one coordinated build.",
      ar: "البنية التحتية وأمن الشبكات والفيديو والصوت والبيانات والأنظمة المتخصصة، تُخطَّط وتُنفَّذ معًا كمنظومة واحدة منسّقة.",
    },
    capabilities: {
      en: [
        "Site infrastructure design and build",
        "Network security integration",
        "Video, audio and data systems",
        "Specialised low-current systems",
        "Coordination across multiple system vendors",
      ],
      ar: [
        "تصميم وتنفيذ البنية التحتية للموقع",
        "تكامل أمن الشبكات",
        "أنظمة الفيديو والصوت والبيانات",
        "أنظمة التيار الخفيف المتخصصة",
        "التنسيق بين موردي الأنظمة المتعددين",
      ],
    },
    icon: "building-2",
    image: {
      src: "/images/solutions/specialised-systems.webp",
      width: 1200,
      height: 1800,
      alt: {
        en: "Structured data and specialised systems installation.",
        ar: "تركيب أنظمة البيانات المهيكلة والأنظمة المتخصصة.",
      },
    },
  },

  /* ---- Networks ---------------------------------------------------------- */
  {
    id: "wireless-wifi",
    group: "networks",
    title: {
      en: "Wireless Connectivity & Wi-Fi Solutions",
      ar: "حلول الاتصال اللاسلكي وشبكات Wi-Fi",
    },
    summary: {
      en: "Wireless coverage designed against the actual floor plan and user density, not assumed from access-point count.",
      ar: "تغطية لاسلكية مصمَّمة وفق المخطّط الفعلي وكثافة المستخدمين، لا بناءً على عدد نقاط الوصول فحسب.",
    },
    capabilities: {
      en: [
        "Wireless site surveys and coverage design",
        "Enterprise access point deployment",
        "Guest and segmented network provisioning",
        "Wireless controller configuration",
        "Interference and performance troubleshooting",
      ],
      ar: [
        "المسح الميداني وتصميم التغطية اللاسلكية",
        "تركيب نقاط وصول للمؤسسات",
        "تهيئة شبكات الزوار والشبكات المعزولة",
        "تهيئة وحدات التحكم اللاسلكية",
        "معالجة التداخل ومشكلات الأداء",
      ],
    },
    icon: "wifi",
    image: {
      src: "/images/solutions/wifi.webp",
      width: 1200,
      height: 900,
      alt: {
        en: "Enterprise wireless access point installed on a ceiling.",
        ar: "نقطة وصول لاسلكية للمؤسسات مركّبة في السقف.",
      },
    },
  },
  {
    id: "network-cabling",
    group: "networks",
    title: {
      en: "Network Communications & Cabling Management",
      ar: "اتصالات الشبكات وإدارة الكابلات",
    },
    summary: {
      en: "Structured cabling and communications rooms built to be labelled, documented and maintainable years after handover.",
      ar: "كابلات مهيكلة وغرف اتصالات مُنفَّذة لتكون مُعلَّمة وموثّقة وقابلة للصيانة بعد سنوات من التسليم.",
    },
    capabilities: {
      en: [
        "Structured cabling design and installation",
        "Communications and network rooms",
        "Patch panel and rack organisation",
        "Cable labelling and as-built documentation",
        "Testing and certification of installed links",
      ],
      ar: [
        "تصميم وتركيب الكابلات المهيكلة",
        "غرف الاتصالات والشبكات",
        "تنظيم لوحات التوصيل والخزائن",
        "ترقيم الكابلات وتوثيق المخططات التنفيذية",
        "اختبار واعتماد الوصلات المركّبة",
      ],
    },
    icon: "cable",
    image: {
      src: "/images/solutions/network-cabling.webp",
      width: 1200,
      height: 798,
      alt: {
        en: "Structured network cabling organised in a patch panel.",
        ar: "كابلات شبكة مهيكلة منظّمة في لوحة توصيل.",
      },
    },
  },
  {
    id: "audio-video-conferencing",
    group: "networks",
    title: {
      en: "Audio, Video & Conferencing Solutions",
      ar: "حلول الصوت والفيديو والمؤتمرات",
    },
    summary: {
      en: "Meeting rooms, halls and event spaces where the audio is intelligible, the video is legible and the network behind them is managed.",
      ar: "قاعات الاجتماعات والصالات ومساحات الفعاليات، بصوت واضح وصورة مقروءة وشبكة مُدارة خلفهما.",
    },
    capabilities: {
      en: [
        "Audio and video system design",
        "Conferencing and meeting room systems",
        "Event and hall audio-visual installations",
        "Display, projection and signage systems",
        "Network management for AV traffic",
      ],
      ar: [
        "تصميم أنظمة الصوت والفيديو",
        "أنظمة المؤتمرات وقاعات الاجتماعات",
        "تركيبات الصوت والصورة للفعاليات والقاعات",
        "أنظمة الشاشات والعرض واللوحات الرقمية",
        "إدارة الشبكة لحركة بيانات الصوت والصورة",
      ],
    },
    icon: "video",
    image: {
      src: "/images/solutions/audio-video.webp",
      width: 1200,
      height: 675,
      alt: {
        en: "Audio and video equipment set up for an event.",
        ar: "معدات صوت وفيديو مجهّزة لفعالية.",
      },
    },
  },

  /* ---- Information technology services ----------------------------------- */
  {
    id: "server-antivirus",
    group: "it-services",
    title: {
      en: "Server Management & Anti-Virus Solutions",
      ar: "إدارة الخوادم وحلول مكافحة الفيروسات",
    },
    summary: {
      en: "Server estates kept patched, monitored and protected, with anti-virus managed centrally instead of left to each machine.",
      ar: "إدارة الخوادم بالتحديث والمراقبة والحماية، مع إدارة مركزية لمكافحة الفيروسات بدلًا من تركها لكل جهاز.",
    },
    capabilities: {
      en: [
        "Server installation and configuration",
        "Operating system patching and updates",
        "Centrally managed anti-virus deployment",
        "Performance monitoring and capacity review",
        "Virtualisation and consolidation",
      ],
      ar: [
        "تركيب الخوادم وتهيئتها",
        "تحديث أنظمة التشغيل وإدارة الترقيعات الأمنية",
        "نشر برامج مكافحة الفيروسات بإدارة مركزية",
        "مراقبة الأداء ومراجعة السعة",
        "الأنظمة الافتراضية ودمج الخوادم",
      ],
    },
    icon: "server",
    image: {
      src: "/images/solutions/servers.webp",
      width: 1200,
      height: 801,
      alt: {
        en: "Rack-mounted servers in a data room.",
        ar: "خوادم مركّبة في خزائن داخل غرفة بيانات.",
      },
    },
  },
  {
    id: "backup-recovery-vpn",
    group: "it-services",
    title: {
      en: "Backup, Data Recovery & VPN Solutions",
      ar: "النسخ الاحتياطي واستعادة البيانات وحلول VPN",
    },
    summary: {
      en: "Backups that are tested rather than assumed, and remote access that does not widen the attack surface to provide it.",
      ar: "نسخ احتياطي مُختبَر لا مفترَض، ووصول عن بُعد لا يوسّع سطح الهجوم مقابل توفيره.",
    },
    capabilities: {
      en: [
        "Backup strategy and scheduling",
        "On-site and off-site backup deployment",
        "Data recovery and restore testing",
        "Site-to-site and remote-access VPN",
        "Business continuity planning support",
      ],
      ar: [
        "استراتيجية النسخ الاحتياطي وجدولته",
        "تنفيذ النسخ الاحتياطي داخل الموقع وخارجه",
        "استعادة البيانات واختبار الاسترجاع",
        "شبكات VPN بين المواقع وللوصول عن بُعد",
        "دعم تخطيط استمرارية الأعمال",
      ],
    },
    icon: "database-backup",
    image: {
      src: "/images/solutions/management-devices.webp",
      width: 1200,
      height: 795,
      alt: {
        en: "Data management and backup devices in a network cabinet.",
        ar: "أجهزة إدارة البيانات والنسخ الاحتياطي داخل خزانة شبكة.",
      },
    },
  },
  {
    id: "computer-fibre",
    group: "it-services",
    /**
     * WORDING PENDING CLIENT CONFIRMATION — do not reinterpret.
     *
     * The previous site rendered this as "Download PC applications and fiber
     * optic solutions", which reads as a translation artefact. The client has
     * asked that the official wording be confirmed before any rewrite, so the
     * title below is reproduced EXACTLY as supplied in the brief — including
     * the US "Fiber" spelling, which differs from the British spelling used
     * elsewhere on the site. That inconsistency is intentional and temporary:
     * it is preserved rather than silently normalised so the string stays
     * verifiably identical to what the client provided.
     *
     * Once the official wording is confirmed, update the title here and remove
     * this note. Nothing else needs to change.
     */
    title: {
      en: "Computer Applications & Fiber Optic Solutions",
      ar: "تطبيقات الحاسب وحلول الألياف البصرية",
    },
    summary: {
      en: "End-user computing environments, and the fibre backbone that carries the traffic between them across sites.",
      ar: "بيئات الحوسبة للمستخدمين، والعمود الفقري من الألياف البصرية الذي ينقل حركة البيانات بينها عبر المواقع.",
    },
    capabilities: {
      en: [
        "Workstation and end-user computing setup",
        "Business application installation and support",
        "Fiber optic backbone design",
        "Fiber splicing, termination and testing",
        "Inter-building and campus connectivity",
      ],
      ar: [
        "تجهيز محطات العمل وبيئات المستخدمين",
        "تركيب تطبيقات الأعمال ودعمها",
        "تصميم العمود الفقري للألياف البصرية",
        "لحام وإنهاء واختبار الألياف البصرية",
        "الربط بين المباني وداخل المجمّعات",
      ],
    },
    icon: "network",
    image: {
      src: "/images/solutions/computers.webp",
      width: 1200,
      height: 800,
      alt: {
        en: "Desktop computer workstations configured for an office.",
        ar: "محطات عمل مكتبية مجهّزة لبيئة مكتبية.",
      },
    },
  },
];

/**
 * Hardware categories Smart Channels supplies and supports.
 *
 * Presented inside the Solutions section rather than as a standalone catalogue:
 * these are the products behind the services above, not a separate business
 * line, and a spec-free product grid adds little for an enterprise buyer.
 */
export const productCategories: readonly ProductCategory[] = [
  { id: "servers", title: { en: "Servers", ar: "الخوادم" }, icon: "server" },
  { id: "workstations", title: { en: "Workstations & PCs", ar: "محطات العمل والحواسيب" }, icon: "monitor" },
  { id: "routers", title: { en: "Routers & Switches", ar: "الموجّهات والمبدّلات" }, icon: "router" },
  { id: "network-cabinets", title: { en: "Network Cabinets", ar: "خزائن الشبكات" }, icon: "server-cog" },
  { id: "cabling", title: { en: "Cabling & Accessories", ar: "الكابلات وملحقاتها" }, icon: "cable" },
  { id: "cctv", title: { en: "Surveillance Cameras", ar: "كاميرات المراقبة" }, icon: "cctv" },
  { id: "access-control", title: { en: "Access Control", ar: "أنظمة التحكم في الدخول" }, icon: "key-round" },
  { id: "biometrics", title: { en: "Biometric Readers", ar: "أجهزة البصمة الحيوية" }, icon: "fingerprint" },
  { id: "pos", title: { en: "Point-of-Sale Devices", ar: "أجهزة نقاط البيع" }, icon: "credit-card" },
  { id: "printers", title: { en: "Printers", ar: "الطابعات" }, icon: "printer" },
  { id: "peripherals", title: { en: "Peripherals", ar: "الملحقات الطرفية" }, icon: "keyboard" },
  { id: "management", title: { en: "Management Devices", ar: "أجهزة الإدارة" }, icon: "settings-2" },
];

/** Services grouped for display, preserving the group order above. */
export function servicesByGroup(): readonly {
  group: ServiceGroup;
  items: readonly Service[];
}[] {
  return serviceGroups.map((group) => ({
    group,
    items: services.filter((service) => service.group === group.id),
  }));
}
