/**
 * English UI copy — the source of truth for the dictionary shape.
 *
 * Only interface chrome and section framing lives here. Business content
 * (services, industries, projects, gallery, partners, clients) lives in
 * `src/data/*` so it can be edited in one place per collection without
 * touching translations.
 */
const en = {
  meta: {
    siteName: "Smart Channels",
    legalName: "Smart Channels",
    tagline: "we take you to the future",
    home: {
      title: "Smart Channels — IT, Networking & Security Systems Integration",
      description:
        "Smart Channels is a Saudi technology and systems integration company delivering IT, networking, communications, security and smart infrastructure solutions to organisations across the public and private sectors.",
    },
    company: {
      title: "Company Profile",
      // {year} is interpolated from company.foundedYear at build time. Writing
      // the year literally here would put it back in two places, which is
      // exactly the drift that made an earlier correction easy to half-apply.
      description:
        "Established in {year}, Smart Channels is a Saudi technology and systems integration company. Who we are, how we work, and the capabilities we bring to organisations across Saudi Arabia.",
    },
    notFound: {
      title: "Page not found",
      description: "The page you are looking for does not exist.",
    },
  },

  common: {
    skipToContent: "Skip to main content",
    close: "Close",
    previous: "Previous",
    next: "Next",
    loading: "Loading",
    required: "required",
    optional: "optional",
    openInNewTab: "opens in a new tab",
    backToTop: "Back to top",
    backHome: "Back to home",
    readMore: "Read more",
    slideOf: "Slide {current} of {total}",
    imageOf: "Image {current} of {total}",
    contentPending: "Content pending",
  },

  nav: {
    label: "Main",
    openMenu: "Open menu",
    closeMenu: "Close menu",
    home: "Home",
    about: "About",
    solutions: "Solutions",
    industries: "Industries",
    why: "Why us",
    work: "Our work",
    company: "Company",
    contact: "Contact",
    cta: "Talk to our experts",
    logoAlt: "Smart Channels — home",
  },

  theme: {
    label: "Theme",
    toggle: "Switch theme",
    light: "Light",
    dark: "Dark",
    system: "System",
    switchToLight: "Switch to light theme",
    switchToDark: "Switch to dark theme",
  },

  language: {
    label: "Language",
    switchTo: "التبديل إلى العربية",
  },

  hero: {
    // The brand label that opens the page. Rendered as a tracked wordmark, not
    // as a badge — see Hero.tsx.
    brandLabel: "Smart Channels",
    // The approved tagline, split so the focal word can be set apart. Joined
    // with a single space it is exactly the confirmed line:
    // "We Take You To The Future". Title Case is the confirmed casing.
    taglineLead: "We Take You To The",
    taglineFocus: "Future",
    headline: "Technology infrastructure that organisations depend on",
    body: "Smart Channels designs, delivers and supports IT, networking, communications and security systems for organisations across the public and private sectors in Saudi Arabia.",
    primaryCta: "Talk to our experts",
    secondaryCta: "Explore our solutions",
    scrollHint: "Scroll to explore",
    canvasAlt:
      "Decorative animation of an abstract connected network of nodes in the Smart Channels brand colours.",
  },

  trackRecord: {
    eyebrow: "Track record",
    heading: "Where we stand today",
    // No figure and no publication name is written here. Both are interpolated
    // from content/track-record.json and src/lib/site.ts, so a new profile
    // never means editing a translation file.
    body: "Figures quoted from the {publication}. Nothing here is estimated or inferred.",
    source: "Source: {publication}. Figures to date.",
    stats: {
      projects: { label: "Projects Delivered", note: "Public and private sector" },
      years: { label: "Years of Continuous Delivery", note: "Established in Riyadh, {year}" },
      sectors: { label: "Sectors Served", note: "From healthcare to logistics" },
      venues: { label: "National Venues & Events", note: "Across the Kingdom" },
    },
  },


  featuredProjects: {
    eyebrow: "Selected work",
    heading: "Where the systems have to hold",
    body: "National venues and events where failure is not an option, and the infrastructure has to work the first time and every time.",
    photographyPending: "Photography pending",
    pendingNote: "Project photography is being approved. Names and sectors are shown; images will follow.",
    scrollHint: "Scroll for more",
    projectsRegion: "Selected projects",
  },

  about: {
    eyebrow: "About Smart Channels",
    heading: "A Saudi technology partner, not just a supplier",
    lead: "We focus on our customers, being their trusted partner in IT services and solutions, and we work together on the basis of partnership to help them face the challenges of the modern era.",
    body: [
      "Smart Channels is a Saudi technology and systems integration company delivering IT, networking, communications, security and smart infrastructure solutions to organisations across the public and private sectors.",
      "We work closely with our customers as a trusted technology partner, combining technical expertise, quality and practical solutions to address the challenges of a rapidly evolving digital world.",
      "Our approach is built around partnership, reliability and practical results — from infrastructure and connectivity to security, unified communications and managed technology services.",
    ],
    cta: "Read the company profile",
    facts: {
      // `founded` and `headquarters` carry a label only. Their values are facts,
      // not translated copy, and come from src/lib/site.ts — keeping a second
      // copy here is how a factual correction gets applied to one and missed in
      // the other.
      founded: { label: "Established" },
      headquarters: { label: "Headquarters" },
      focus: { label: "Focus", value: "Systems integration" },
      sectors: { label: "Sectors", value: "Public & private" },
    },
  },

  solutions: {
    eyebrow: "Solutions",
    heading: "What we deliver",
    body: "Nine core capability areas across information technology, networks and supporting hardware — delivered as complete, integrated systems rather than isolated parts.",
    groupLabel: "Capability area",
    capabilitiesLabel: "Includes",
    products: {
      heading: "Products & hardware",
      body: "Supply, configuration and lifecycle support for the equipment behind the solutions we deliver.",
    },
  },

  industries: {
    eyebrow: "Industries",
    heading: "Industries we serve",
    body: "Environments where reliability, security and uptime are not negotiable.",
    swipeHint: "Swipe to see more industries",
    listLabel: "Industries served by Smart Channels",
    indexLabel: "Sectors Smart Channels works in",
  },

  projects: {
    eyebrow: "Featured work",
    heading: "Projects",
    body: "A selection of the systems we have delivered.",
    pending:
      "Project content is prepared and ready to publish. Add entries to src/data/projects.ts to populate this section.",
  },

  gallery: {
    eyebrow: "Our work",
    heading: "Gallery",
    body: "Photography from delivery and installation across our projects.",
    pending:
      "Gallery is ready for images. Drop files into public/images/gallery and register them in src/data/gallery.ts.",
    openImage: "View image",
    lightboxLabel: "Image viewer",
  },

  partners: {
    eyebrow: "Technology partners",
    heading: "The technologies we build on",
    body: "We deliver and support solutions built on established enterprise technology platforms.",
    pending:
      "Partner logos are ready to add. Place files in public/images/partners and register them in src/data/partners.ts.",
    listLabel: "Technology partners",
  },

  clients: {
    eyebrow: "Clients",
    heading: "Organisations we work with",
    pending:
      "Client logos are ready to add, subject to written permission to display each mark. Register them in src/data/clients.ts.",
    listLabel: "Clients",
  },

  why: {
    eyebrow: "Why Smart Channels",
    heading: "How we work",
    body: "The operating principles behind every engagement.",
    items: [
      {
        title: "Partnership, not transactions",
        body: "We work alongside your team as a long-term technology partner, not a one-off supplier. The relationship continues after handover.",
      },
      {
        title: "Integrated by design",
        body: "Networks, security, communications and infrastructure are planned as one system, so the parts work together instead of merely coexisting.",
      },
      {
        title: "Built for uptime",
        body: "We design for the environments we serve — where downtime carries a real operational and reputational cost.",
      },
      {
        title: "Practical over fashionable",
        body: "We recommend technology that solves the problem in front of you at a cost you can justify, not the newest option available.",
      },
      {
        title: "Local presence",
        body: "A Saudi company based in Riyadh, working within local requirements, timelines and expectations.",
      },
      {
        title: "Supported after delivery",
        body: "Managed services, maintenance and technical support keep the systems we deliver running.",
      },
    ],
  },

  certifications: {
    eyebrow: "Credentials",
    heading: "Certifications & memberships",
    pending:
      "Certification content is pending. Register entries in src/data/certifications.ts once documents are confirmed.",
  },

  contact: {
    eyebrow: "Contact",
    heading: "Talk to our experts",
    body: "Tell us what you are planning and we will get back to you. For urgent enquiries, call or message us on WhatsApp.",
    directHeading: "Direct contact",
    phoneLabel: "Phone",
    whatsappLabel: "WhatsApp",
    emailLabel: "Email",
    addressLabel: "Address",
    mapLabel: "Location",
    openMap: "Open in Google Maps",
    mapFrameTitle: "Smart Channels location on Google Maps",
    callAction: "Call",
    whatsappAction: "WhatsApp",
    emailAction: "Email",
    hoursNote: "Sunday to Thursday",

    form: {
      heading: "Send us a message",
      name: "Full name",
      namePlaceholder: "Your name",
      company: "Company",
      companyPlaceholder: "Your organisation",
      email: "Email",
      emailPlaceholder: "you@company.com",
      phone: "Phone",
      phonePlaceholder: "+966 5X XXX XXXX",
      service: "Service of interest",
      servicePlaceholder: "Select a service",
      serviceOther: "Something else",
      message: "Message",
      messagePlaceholder: "Briefly describe what you need",
      submit: "Send message",
      submitting: "Sending…",
      successHeading: "Message sent",
      successBody:
        "Thank you — we have received your message and will reply to the email address you provided.",
      sendAnother: "Send another message",
      errorHeading: "Message not sent",
      errorGeneric:
        "Something went wrong on our side. Please try again, or contact us directly by phone or WhatsApp.",
      errorNetwork:
        "We could not reach the server. Check your connection and try again.",
      errorRateLimit:
        "Too many messages sent from this connection. Please wait a few minutes and try again.",
      errorSummary: "Please correct the following before sending:",
      privacy:
        "We use your details only to respond to this enquiry. We do not share them with third parties.",
      // Honeypot field — visually hidden, never shown to real users.
      honeypotLabel: "Leave this field empty",
    },

    validation: {
      nameRequired: "Enter your full name.",
      nameTooShort: "Your name must be at least 2 characters.",
      nameTooLong: "Your name must be 80 characters or fewer.",
      companyTooLong: "Company name must be 120 characters or fewer.",
      emailRequired: "Enter your email address.",
      emailInvalid: "Enter a valid email address, for example you@company.com.",
      emailTooLong: "Email address must be 160 characters or fewer.",
      phoneRequired: "Enter a phone number we can reach you on.",
      phoneInvalid:
        "Enter a valid phone number, including country code if outside Saudi Arabia.",
      serviceRequired: "Select the service you are interested in.",
      serviceInvalid: "Select a service from the list.",
      messageRequired: "Tell us briefly what you need.",
      messageTooShort: "Your message must be at least 10 characters.",
      messageTooLong: "Your message must be 2000 characters or fewer.",
    },
  },

  footer: {
    about:
      "Saudi technology and systems integration — IT, networking, communications, security and smart infrastructure.",
    navHeading: "Explore",
    contactHeading: "Contact",
    followHeading: "Follow",
    legalHeading: "Legal",
    rights: "All rights reserved.",
    builtIn: "Riyadh, Saudi Arabia",
    socialLabel: "Smart Channels on {network}",
  },

  company: {
    hero: {
      eyebrow: "Company profile",
      heading: "Smart Channels",
      body: "A Saudi technology and systems integration company working with organisations across the public and private sectors.",
    },
    intro: {
      heading: "Who we are",
    },
    vision: {
      heading: "Vision",
      body: "To be the technology partner Saudi organisations rely on when the systems have to work — connecting infrastructure, security and communications into one dependable whole.",
    },
    mission: {
      heading: "Mission",
      body: "To deliver information technology, networking, communications and security systems that meet our customers' real operational needs, with the quality they expect and at a cost they can justify.",
    },
    values: {
      heading: "Values",
      items: [
        {
          title: "Partnership",
          body: "We succeed when our customers do. We work on the basis of a long-term relationship rather than a single transaction.",
        },
        {
          title: "Technical integrity",
          body: "We recommend what the requirement actually calls for, and we say so plainly when a simpler or smaller solution is the right one.",
        },
        {
          title: "Reliability",
          body: "We design and deliver systems intended to run continuously in demanding environments.",
        },
        {
          title: "Accountability",
          body: "We stand behind what we deliver, through commissioning, handover and ongoing support.",
        },
      ],
    },
    capabilities: {
      heading: "Capabilities",
      body: "Our delivery covers the full path from infrastructure design through installation, commissioning and ongoing support.",
    },
    approach: {
      heading: "How we deliver",
      steps: [
        {
          title: "Understand",
          body: "We start with the operational requirement, the site and the constraints — before any product is specified.",
        },
        {
          title: "Design",
          body: "We produce a design covering infrastructure, networking, security and integration as a single coordinated system.",
        },
        {
          title: "Deliver",
          body: "Supply, installation, configuration and commissioning, coordinated around your operational schedule.",
        },
        {
          title: "Support",
          body: "Maintenance, managed services and technical support to keep the system performing after handover.",
        },
      ],
    },
    cta: {
      heading: "Let's discuss your requirement",
      body: "Tell us what you are planning and we will come back to you with a practical next step.",
      action: "Talk to our experts",
    },
  },

  notFound: {
    code: "404",
    heading: "Page not found",
    body: "The page you are looking for does not exist or may have moved.",
  },
};

export default en;

/**
 * The dictionary shape every locale must satisfy.
 *
 * Intentionally derived without `as const`: the contract other locales must
 * meet is the *shape* (which keys exist, and their types), not the literal
 * English strings. Typing `ar` against this makes a missing or misnamed key a
 * compile error while leaving the actual wording free.
 */
export type Dictionary = typeof en;
