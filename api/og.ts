import { ImageResponse } from "@vercel/og";
import type * as React from "react";

const author = {
  name: "Yours Truly",
  avatarSrc: "https://i.pravatar.cc/256?u=30",
};

type Author = typeof author;

export const config = { runtime: "edge" };

// Note: `vercel dev` doesn't run `.tsx` endpoints
//        and it can't run @vercel/og because of
//        > Invalid URL: ../vendor/noto-sans-v27-latin-regular.ttf
//        The only way to work with this file is repeatedly pushing and checking
//        the result on Vercel Preview Deployments.

/**
 * TODO:
 * - [x] Use Inter font
 * - [x] Update all libraries related to Vercel OG
 * - [x] White footer avatar of the author, their handle, date and reading time of the post
 * - [x] Very bold (weight 900) white title on top of the gradient
 * - [x] Secure the endpoint https://vercel.com/docs/concepts/functions/edge-functions/og-image-examples#encrypting-parameters
 * - [ ] Grain Overlay — mix-blend-mode is not supported, so I'll need to combine grain.svg with the image / generated gradient
 *  - [ ] Random Gradient or an illustration in the background
 *  - use Vercel OG playground to build it and manually rewrite JSX
 * - [ ] Text with the color contrasting with gradient
 */

const interRegular = fetchFont(
  new URL("../assets/og/Inter-Regular.ttf", import.meta.url)
);
const interBlack = fetchFont(
  new URL("../assets/og/Inter-Black.ttf", import.meta.url)
);

const width = 1200;
const height = 600;

export default async function og(req: Request) {
  try {
    const url = new URL(req.url);
    const { post, stringifiedPost, token } = parseSearchParams(
      url.searchParams
    );

    await assertTokenIsValid(stringifiedPost, token);

    return new ImageResponse(
      h(
        "div",
        {
          tw: `
            w-full h-full
            font-Inter
            flex flex-col
          `,
        },
        h(
          Illustration,
          { imageHref: post.img },
          h(Title, { title: post.title })
        ),
        h(Footer, { author, post })
      ),
      {
        width,
        height,
        fonts: [
          {
            name: "Inter",
            data: await interRegular,
            weight: 400,
            style: "normal",
          },
          {
            name: "Inter",
            data: await interBlack,
            weight: 900,
            style: "normal",
          },
        ],
      }
    );
  } catch (err: unknown) {
    console.error(err);

    const error = err instanceof Error ? err : new Error(String(err));

    return new Response(JSON.stringify({ message: error.message }), {
      status: 500,
    });
  }
}

function Illustration({
  children,
  imageHref,
}: {
  children?: React.ReactNode[];
  imageHref: string | undefined;
}) {
  imageHref = imageHref
    ? "https://og-images--zaduma.vercel.app" + imageHref
    : "";

  return h(
    "div",
    {
      tw: `
          flex flex-1 justify-start items-end w-full pt-4 pb-2 px-4 relative
          bg-[rgb(23,23,23)]
        `,
    },
    h("img", {
      tw: `absolute inset-0 object-cover`,
      src: imageHref,
      width,
      height: height - 112,
    }),
    ...(children || [])
  );
}

function Title({ title }: { title: string }) {
  return h(
    "h1",
    {
      tw: `
        text-white text-9xl font-black z-10
      `,
    },
    title
  );
}

function Footer({ author, post }: { author: Author; post: Post }) {
  return h(
    "footer",
    {
      tw: `
      h-28 w-full px-4 py-2.5
      bg-white
      text-4xl
      flex flex-row justify-center items-center
    `,
    },
    h("img", {
      width: 92,
      height: 92,
      src: author.avatarSrc,
      tw: `rounded-full`,
    }),
    h("span", { tw: `ml-4` }, author.name),
    h("div", { tw: `flex-1` }),
    h(
      "span",
      {},
      [
        post.date.toLocaleDateString("sv-SE"),
        post.readingTimeMinutes > 1 && `${post.readingTimeMinutes} min`,
      ]
        .filter(Boolean)
        .join(" · ")
    )
  );
}

function h<T extends React.ElementType<any>>(
  type: T,
  props: React.ComponentPropsWithRef<T>,
  ...children: React.ReactNode[]
) {
  return {
    type,
    key: "key" in props ? props.key : null,
    props: {
      ...props,
      children: children && children.length ? children : props.children,
    },
  };
}

function fetchFont(url: URL) {
  return fetch(url).then((res) => res.arrayBuffer());
}

type Post = {
  date: Date;
  title: string;
  readingTimeMinutes: number;
  img: string;
};

const SEPARATOR = "\t";
type SEPARATOR = typeof SEPARATOR;

// prettier-ignore
export type StringifiedPost = `${
  number /* timestamp */
}${SEPARATOR}${
  number /* reading time */
}${SEPARATOR}${
  string /* title */
}${SEPARATOR}${
  string /* picture */
}`;

export type OgFunctionSearchParams = {
  post: StringifiedPost;
  token?: string;
};

function parseSearchParams(searchParams: URLSearchParams) {
  const stringifiedPost = decodeURIComponent(
    searchParams.get("post") || ""
  ) as StringifiedPost;

  const postArray = stringifiedPost.split(SEPARATOR);

  if (postArray.length !== 4) {
    throw new HttpError("Missing required search params.", 400);
  }

  const post: Post = {
    date: new Date(Number(postArray[0])),
    readingTimeMinutes: Math.round(Number(postArray[1])),
    title: postArray[2]!,
    img: postArray[3]!,
  };

  return {
    post,
    stringifiedPost,
    token: searchParams.get("token") || "",
  };
}

class HttpError extends Error {
  constructor(message: string, public readonly status: number) {
    super(message);
  }
}

/**
 * @see https://vercel.com/docs/concepts/functions/edge-functions/og-image-examples#encrypting-parameters
 */
async function assertTokenIsValid(
  post: StringifiedPost,
  receivedToken: string
): Promise<void> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(process.env.OG_IMAGE_SECRET),
    { name: "HMAC", hash: { name: "SHA-256" } },
    false,
    ["sign"]
  );

  const arrayBuffer = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(post)
  );

  const token = Array.prototype.map
    .call(new Uint8Array(arrayBuffer), (n: number) =>
      n.toString(16).padStart(2, "0")
    )
    .join("");

  if (receivedToken !== token) {
    throw new HttpError("Invalid token.", 401);
  }
}
