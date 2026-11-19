import type { MetadataRoute } from "next";
import { getSiteUrl, robotsRules } from "@/features/seo/seo";

export default function robots(): MetadataRoute.Robots {
  return robotsRules(getSiteUrl());
}
