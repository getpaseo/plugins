import { readFileSync, readdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { isIsoDate } from "./dates.ts";

/** One file in plugins/. Humans edit categories and listing; the bot writes the rest. */
export interface PluginRecord {
  id: string;
  package: string;
  /** The reviewed npm version. The published index never points anywhere else. */
  version: string;
  /** Subresource integrity of that version's tarball, as npm reports it. */
  integrity: string;
  repository?: {
    url: string;
    /** Present only when npm provenance proves which commit built the tarball. */
    commit?: string;
  };
  categories: string[];
  submittedAt: string;
  /** GitHub login of whoever opened the submission issue. */
  submittedBy?: string;
  /** Date the pinned version was approved. */
  reviewedAt: string;
  /** Overrides for packages that do not ship paseo-listing.json. */
  listing?: PluginListingOverrides;
}

export interface PluginListingOverrides {
  name?: string;
  icon?: string;
  screenshots?: string[];
}

export const RECORDS_DIR = fileURLToPath(new URL("../../plugins", import.meta.url));

const ID_PATTERN = /^[a-z0-9][a-z0-9-]*[a-z0-9]$/;
const PACKAGE_PATTERN = /^(@[a-z0-9][\w.-]*\/)?[a-z0-9][\w.-]*$/;
const INTEGRITY_PATTERN = /^sha512-[A-Za-z0-9+/]+=*$/;
const COMMIT_PATTERN = /^[0-9a-f]{40}$/;
const RECORD_KEYS = [
  "id",
  "package",
  "version",
  "integrity",
  "repository",
  "categories",
  "submittedAt",
  "submittedBy",
  "reviewedAt",
  "listing",
] as const;

export function parseRecord(raw: unknown, knownCategories: Set<string>): PluginRecord {
  const problems: string[] = [];
  if (typeof raw !== "object" || raw === null || Array.isArray(raw)) {
    throw new Error("record must be a JSON object");
  }
  const value = raw as Record<string, unknown>;
  for (const key of Object.keys(value)) {
    if (!(RECORD_KEYS as readonly string[]).includes(key)) problems.push(`unknown field "${key}"`);
  }
  const str = (key: string, pattern?: RegExp): string | undefined => {
    const field = value[key];
    if (field === undefined) return undefined;
    if (typeof field !== "string" || field.length === 0) {
      problems.push(`${key} must be a non-empty string`);
      return undefined;
    }
    if (pattern && !pattern.test(field)) problems.push(`${key} "${field}" is malformed`);
    return field;
  };
  const required = (key: string, pattern?: RegExp): string => {
    const field = str(key, pattern);
    if (field === undefined && value[key] === undefined) problems.push(`${key} is required`);
    return field ?? "";
  };

  const id = required("id", ID_PATTERN);
  const pkg = required("package", PACKAGE_PATTERN);
  const version = required("version");
  const integrity = required("integrity", INTEGRITY_PATTERN);
  const submittedAt = required("submittedAt");
  const reviewedAt = required("reviewedAt");
  const submittedBy = str("submittedBy");
  if (value.submittedAt !== undefined && !isIsoDate(value.submittedAt)) problems.push("submittedAt must be YYYY-MM-DD");
  if (value.reviewedAt !== undefined && !isIsoDate(value.reviewedAt)) problems.push("reviewedAt must be YYYY-MM-DD");

  let repository: PluginRecord["repository"];
  if (value.repository !== undefined) {
    const repo = value.repository as Record<string, unknown>;
    if (typeof repo !== "object" || repo === null || typeof repo.url !== "string") {
      problems.push("repository must be an object with a url");
    } else {
      if (!/^https:\/\/\S+$/.test(repo.url)) problems.push("repository.url must be an https URL");
      if (repo.commit !== undefined && (typeof repo.commit !== "string" || !COMMIT_PATTERN.test(repo.commit))) {
        problems.push("repository.commit must be a 40-character SHA");
      }
      for (const key of Object.keys(repo)) {
        if (key !== "url" && key !== "commit") problems.push(`unknown field "repository.${key}"`);
      }
      repository = { url: repo.url, ...(typeof repo.commit === "string" ? { commit: repo.commit } : {}) };
    }
  }

  const categories = Array.isArray(value.categories) ? (value.categories as unknown[]) : [];
  if (!Array.isArray(value.categories) || categories.length === 0) problems.push("categories must list at least one category");
  for (const category of categories) {
    if (typeof category !== "string" || !knownCategories.has(category)) problems.push(`unknown category "${String(category)}"`);
  }
  if (new Set(categories).size !== categories.length) problems.push("categories must not repeat");

  let listing: PluginListingOverrides | undefined;
  if (value.listing !== undefined) {
    const raw = value.listing as Record<string, unknown>;
    if (typeof raw !== "object" || raw === null) {
      problems.push("listing must be an object");
    } else {
      listing = {};
      if (raw.name !== undefined) {
        if (typeof raw.name !== "string" || !raw.name.trim()) problems.push("listing.name must be a non-empty string");
        else listing.name = raw.name;
      }
      if (raw.icon !== undefined) {
        if (typeof raw.icon !== "string" || !/^https:\/\/\S+\.png$/i.test(raw.icon)) problems.push("listing.icon must be an https PNG URL");
        else listing.icon = raw.icon;
      }
      if (raw.screenshots !== undefined) {
        if (!Array.isArray(raw.screenshots) || raw.screenshots.some((s) => typeof s !== "string" || !/^https:\/\/\S+$/.test(s))) {
          problems.push("listing.screenshots must be https URLs");
        } else listing.screenshots = raw.screenshots as string[];
      }
      for (const key of Object.keys(raw)) {
        if (!["name", "icon", "screenshots"].includes(key)) problems.push(`unknown field "listing.${key}"`);
      }
    }
  }

  if (problems.length > 0) throw new Error(problems.join("; "));
  return {
    id,
    package: pkg,
    version,
    integrity,
    ...(repository ? { repository } : {}),
    categories: categories as string[],
    submittedAt,
    ...(submittedBy ? { submittedBy } : {}),
    reviewedAt,
    ...(listing ? { listing } : {}),
  };
}

export function recordPath(id: string, dir = RECORDS_DIR): string {
  return join(dir, `${id}.json`);
}

export function readRecords(knownCategories: Set<string>, dir = RECORDS_DIR): PluginRecord[] {
  const files = readdirSync(dir).filter((name) => name.endsWith(".json")).sort();
  const records: PluginRecord[] = [];
  const problems: string[] = [];
  for (const file of files) {
    try {
      const record = parseRecord(JSON.parse(readFileSync(join(dir, file), "utf8")), knownCategories);
      if (`${record.id}.json` !== file) problems.push(`${file}: file name must match id "${record.id}"`);
      records.push(record);
    } catch (error) {
      problems.push(`${file}: ${(error as Error).message}`);
    }
  }
  const ids = new Map<string, number>();
  const packages = new Map<string, number>();
  for (const record of records) {
    ids.set(record.id, (ids.get(record.id) ?? 0) + 1);
    packages.set(record.package, (packages.get(record.package) ?? 0) + 1);
  }
  for (const [id, count] of ids) if (count > 1) problems.push(`id "${id}" is listed ${count} times`);
  for (const [pkg, count] of packages) if (count > 1) problems.push(`package "${pkg}" is listed ${count} times`);
  if (problems.length > 0) throw new Error(problems.join("\n"));
  return records;
}

export function serializeRecord(record: PluginRecord): string {
  const ordered: Record<string, unknown> = {};
  for (const key of RECORD_KEYS) if (record[key] !== undefined) ordered[key] = record[key];
  return `${JSON.stringify(ordered, null, 2)}\n`;
}

export function writeRecord(record: PluginRecord, dir = RECORDS_DIR): string {
  const path = recordPath(record.id, dir);
  writeFileSync(path, serializeRecord(record));
  return path;
}
