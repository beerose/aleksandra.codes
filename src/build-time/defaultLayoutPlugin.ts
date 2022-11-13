import type { RemarkPlugin } from "@astrojs/markdown-remark/dist/types";
import { relative } from "node:path";

import type { PostProps } from "../types";

export const defaultLayoutPlugin: RemarkPlugin<[
  {
    postLayoutPath: string,
    talkLayoutPath: string
  }
]> = ({
  postLayoutPath,
  talkLayoutPath
}: {
  postLayoutPath: string,
  talkLayoutPath: string
}) => {
  return (_tree, file) => {
    const data = file.data as { astro: PostProps };

    if (file.dirname?.endsWith("talks")) {
      data.astro.frontmatter.layout = relative(file.dirname!, talkLayoutPath);
      return
    }
    data.astro.frontmatter.layout = relative(file.dirname!, postLayoutPath);
  };
};
