import { isoDate } from "./dates.ts";
import { type NpmClient, resolveVersion } from "./npm.ts";
import type { PluginRecord } from "./record.ts";
import { browseUrl, githubOwner, parseRepository } from "./repository.ts";

export interface Submission {
  id: string;
  package: string;
  categories: string[];
  submittedBy?: string;
  listing?: PluginRecord["listing"];
}

/** Builds a record pinned to one npm version, reading everything but the submission from npm. */
export async function pinRecord(
  client: NpmClient,
  submission: Submission,
  options: { version?: string; submittedAt?: string; today?: string } = {},
): Promise<PluginRecord> {
  const packument = await client.packument(submission.package);
  const doc = resolveVersion(packument, options.version);
  const manifest = await client.file(doc.name, doc.version, "paseo-plugin.json");
  if (manifest === null) {
    throw new Error(
      `${doc.name}@${doc.version} does not ship paseo-plugin.json, so it is not a Paseo plugin`,
    );
  }
  const provenance = await client.provenance(doc.name, doc.version);
  const source = parseRepository(doc.repository);
  if (provenance && source && !sameRepository(source.url, provenance.repositoryUrl)) {
    throw new Error("Declared repository differs from npm provenance");
  }
  const sourceUrl = provenance?.repositoryUrl ?? source?.url;
  const today = options.today ?? isoDate();

  const repository = sourceUrl
    ? {
        url: browseUrl(source ?? { url: sourceUrl }),
        ...(provenance && sameRepository(sourceUrl, provenance.repositoryUrl)
          ? { commit: provenance.commit }
          : {}),
      }
    : undefined;

  const owner = repository && githubOwner(repository.url)?.toLowerCase();
  if (!owner) throw new Error("A GitHub source repository is required");
  const slug = submission.id.split("/").at(-1);
  if (submission.id.includes("/") && !submission.id.startsWith(`${owner}/`))
    throw new Error("ID owner must match repository owner");
  return {
    id: `${owner}/${slug}`,
    artifact: {
      kind: "npm",
      package: doc.name,
      version: doc.version,
      resolved: doc.dist.tarball,
      integrity: doc.dist.integrity,
    },
    repository: repository!,
    categories: submission.categories,
    submittedAt: options.submittedAt ?? today,
    ...(submission.submittedBy ? { submittedBy: submission.submittedBy } : {}),
    reviewedAt: today,
    ...(submission.listing ? { listing: submission.listing } : {}),
  };
}

/** The same record pinned to a newer version. Submission facts are kept. */
export function repinRecord(
  client: NpmClient,
  record: PluginRecord,
  version: string,
  today?: string,
) {
  if (record.artifact.kind !== "npm") throw new Error("Expected npm artifact");
  return pinRecord(
    client,
    { ...record, package: record.artifact.package },
    { version, submittedAt: record.submittedAt, today },
  );
}

function sameRepository(a: string, b: string): boolean {
  const normalize = (url: string) =>
    url
      .replace(/\.git$/, "")
      .replace(/\/+$/, "")
      .toLowerCase();
  return normalize(a) === normalize(b);
}
