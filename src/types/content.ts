import type { Locale } from "@/i18n/config";

/**
 * A value authored in every supported language.
 *
 * Typing it as a full `Record<Locale, T>` rather than a partial map means the
 * compiler rejects any content added in one language but not the other. A
 * missing Arabic string is a build error, not a runtime hole in the page.
 */
export type Localized<T = string> = Record<Locale, T>;

/** Resolve a localized value for the active locale. */
export function pick<T>(value: Localized<T>, locale: Locale): T {
  return value[locale];
}

/**
 * Editorial status of a content collection.
 *
 * `pending` marks a collection whose architecture exists but whose real content
 * has not been supplied yet. Pending collections are never presented to the
 * public as though they were populated — see `shouldRenderCollection`.
 */
export type ContentStatus = "published" | "pending";

export interface ImageAsset {
  /** Path under /public, e.g. "/images/solutions/servers.webp". */
  readonly src: string;
  /** Intrinsic width in px — required so Next/Image can reserve space (no CLS). */
  readonly width: number;
  readonly height: number;
  /**
   * Alternative text, per language. Describes the image's content and purpose;
   * decorative images use an empty string in both languages instead.
   */
  readonly alt: Localized;
  /** Tiny inline placeholder shown while the real image decodes. */
  readonly blurDataURL?: string;
}

export interface Service {
  readonly id: string;
  /** Which top-level capability group this belongs to. */
  readonly group: ServiceGroupId;
  readonly title: Localized;
  readonly summary: Localized;
  /** Concrete capabilities — kept factual, no marketing claims. */
  readonly capabilities: Localized<readonly string[]>;
  readonly icon: ServiceIconName;
  readonly image?: ImageAsset;
}

export type ServiceGroupId = "it-services" | "networks" | "products";

export type ServiceIconName =
  | "shield-check"
  | "wifi"
  | "cable"
  | "server"
  | "database-backup"
  | "scan-eye"
  | "network"
  | "building-2"
  | "video";

export interface ServiceGroup {
  readonly id: ServiceGroupId;
  readonly title: Localized;
  readonly description: Localized;
}

export interface ProductCategory {
  readonly id: string;
  readonly title: Localized;
  readonly icon: string;
}

/**
 * A background image for an industry panel.
 *
 * No `alt` field, deliberately. These are decorative: the industry name sits
 * directly on top of the image as real text, so a screen reader that also
 * announced "photograph of a stadium" next to the word "Stadiums" would just
 * hear the same thing twice. Both the photograph and the fallback render with
 * `alt=""`, which is what WCAG asks for when an image is redundant to adjacent
 * text.
 */
export interface IndustryImage {
  /** Path under /public. */
  readonly src: string;
  readonly width: number;
  readonly height: number;
  /** Tiny inline placeholder shown while a photograph decodes. */
  readonly blurDataURL?: string;
}

export interface Industry {
  readonly id: string;
  readonly title: Localized;
  /** One short line describing the delivery context, not a capability claim. */
  readonly note: Localized;

  /**
   * The intended primary imagery: a real photograph of the environment.
   *
   * Optional only because photography has not been supplied yet. When present
   * it is always used in preference to `art`.
   */
  readonly photo?: IndustryImage;

  /**
   * Brand-generated fallback panel, used only until `photo` exists.
   *
   * This is a placeholder for launch purposes, not the intended final design —
   * see `industryPhotoReadiness()`.
   */
  readonly art: IndustryImage;

  /**
   * Commissioning brief for the photograph this industry needs.
   *
   * Kept in the data rather than in a separate document so the specification
   * travels with the entry it describes and cannot drift out of sync with it.
   */
  readonly shotBrief: string;
}

export interface Project {
  readonly id: string;
  readonly name: Localized;

  /**
   * Where the record came from. Documentation, never rendered.
   *
   * Required, and required as free text rather than an enum, because the whole
   * point is that a reviewer can read it and check it. A project record is a
   * factual claim about work delivered; one that cannot say where it came from
   * should not exist.
   */
  readonly source: string;

  /**
   * A short factual description of the engagement.
   *
   * Optional, and absent means absent — the card renders the project without a
   * description rather than with a plausible-sounding one. Writing copy to fill
   * this space would be inventing project facts, which is the exact failure
   * this type is shaped to prevent.
   */
  readonly description?: Localized;

  /**
   * The approved photograph.
   *
   * Optional because photography has not been supplied. While it is absent the
   * card renders a visibly synthetic placeholder that says so — never stock
   * imagery, and never an unrelated photograph standing in for the work. Adding
   * the real image is this one field.
   */
  readonly image?: ImageAsset;

  /** Optional grouping only — never rendered as a factual claim. */
  readonly industryId?: string;
}

/* -------------------------------------------------------------------------- */
/* Gallery                                                                     */
/* -------------------------------------------------------------------------- */

/**
 * What kind of work a gallery photograph shows.
 *
 * A closed union rather than a free string: these drive the filter controls, so
 * a typo in the manifest would otherwise silently create a category of one that
 * nobody ever clicks. Adding a genuinely new category is a deliberate edit
 * here plus a label in both dictionaries — which is the point.
 */
export type GalleryCategory =
  | "infrastructure"
  | "networks"
  | "security"
  | "audio-visual"
  | "communications"
  | "end-user-computing"
  | "specialised-systems";

/**
 * A technology visible in, or central to, the photograph. Also a closed union,
 * for the same reason as GalleryCategory.
 */
export type GalleryTechnology =
  | "structured-cabling"
  | "fibre-optics"
  | "wireless"
  | "surveillance"
  | "access-control"
  | "servers"
  | "storage-backup"
  | "firewall"
  | "unified-communications"
  | "display-systems"
  | "point-of-sale"
  | "printing";

/**
 * One gallery photograph and everything known about it.
 *
 * ---------------------------------------------------------------------------
 * THIS TYPE IS THE CONTRACT WITH content/gallery.json.
 * ---------------------------------------------------------------------------
 * Gallery content is authored in that manifest, never in a component. Adding a
 * photograph is: drop the original in `source-assets/gallery/`, run
 * `npm run gallery:ingest`, fill in the metadata the script stubs out, set
 * `published: true`. No file under src/ is touched, and nothing about the grid,
 * the lightbox, the filters or the ordering has to be told about it.
 *
 * Every field the client asked to be able to record has a home here. The ones
 * that are optional are optional because a real photograph may genuinely not
 * have them — not every shot belongs to a named project, and location is
 * sometimes withheld for a client's own reasons.
 */
export interface GalleryItem {
  /** Stable slug. Also the DOM id and the deep-link fragment. */
  readonly id: string;

  readonly image: ImageAsset;

  /** Which project this belongs to, by `Project["id"]`. */
  readonly project?: string;
  readonly category: GalleryCategory;
  /** Which sector, by `Industry["id"]`. */
  readonly industry?: string;
  readonly technology: readonly GalleryTechnology[];
  /** Free text, both languages — "Riyadh", "الرياض". Omit to withhold. */
  readonly location?: Localized;
  /** ISO 8601 date, `YYYY-MM-DD` or `YYYY-MM`. Sorted and displayed from this. */
  readonly date?: string;

  /**
   * Caption in each language. Required in both: a gallery half-captioned in
   * Arabic reads as an afterthought to an Arabic-speaking visitor, and
   * Localized makes the compiler enforce it rather than a reviewer.
   */
  readonly caption: Localized;

  /** Promoted to the featured strip and to the homepage preview. */
  readonly featured: boolean;

  /**
   * Manual ordering. Lower sorts first; ties fall back to `date` descending and
   * then to `id`, so the order is always total and never depends on the order
   * keys happen to appear in the JSON file.
   */
  readonly sortOrder: number;

  /**
   * Editorial gate. An item is never rendered publicly until this is `true`,
   * so a half-captioned draft can sit in the manifest safely.
   */
  readonly published: boolean;
}

export interface Partner {
  readonly id: string;
  readonly name: string;
  /** Logo file under /public/images/partners. */
  readonly logo: string;
  readonly width: number;
  readonly height: number;
  readonly url?: string;
}

export interface Client {
  readonly id: string;
  readonly name: Localized;
  readonly logo: string;
  readonly width: number;
  readonly height: number;
  /**
   * Explicit confirmation that Smart Channels is authorised to display this
   * client's mark. A client is not rendered unless this is `true` — brand
   * usage rights are a legal matter, not a content-entry detail.
   */
  readonly usageApproved: boolean;
}

export interface Certification {
  readonly id: string;
  readonly name: Localized;
  readonly issuer: Localized;
  readonly logo?: string;
  readonly issuedYear?: number;
}

/**
 * A collection plus its editorial status.
 *
 * Bundling the two means a section component can decide whether to render from
 * the data alone, with no per-section flags scattered through the page.
 */
export interface Collection<T> {
  readonly status: ContentStatus;
  readonly items: readonly T[];
  /** Shown in place of the section while the collection is pending, in dev. */
  readonly pendingNote?: string;
}
