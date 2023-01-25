/// <reference types="@astrojs/image/client" />

declare module "remark-mdx-to-plain-text" {}

interface ImportMetaEnv {
  /**
   * - `https://localhost:3000/` in development
   * - `https://${branch-name}--zaduma.vercel.app/` in preview
   * - `https://zaduma.vercel.app/` in production
   *
   * @see import.meta.env.SITE for the canonical URL
   */
  readonly PUBLIC_URL: string;
}
