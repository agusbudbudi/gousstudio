// Plain JS so the Vercel API functions and the TS frontend share one copy of the quota rule.

/**
 * Revisions included in a package: a number, Infinity when unlimited, null when unknown.
 * @param {{ isrevisionunlimited?: boolean | null, totalrevision?: number | null } | null | undefined} pkg
 * @returns {number | null}
 */
export const getRevisionQuota = (pkg) => {
  if (!pkg) return null;
  if (pkg.isrevisionunlimited) return Infinity;
  return pkg.totalrevision == null ? null : Number(pkg.totalrevision);
};
