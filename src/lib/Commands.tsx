import pDebounce from "p-debounce";
import {
  createEffect,
  createResource,
  createSignal,
  JSX,
  Match,
  onCleanup,
  onMount,
  Show,
  splitProps,
  Switch,
} from "solid-js";

import { ColorScheme, setScheme } from "./color-scheme";
import {
  CommandCenter,
  CommandCenterDialog,
  CommandCenterTrigger,
  CommandGroup,
  CommandInput,
  CommandItem as CommandCenterItem,
  CommandItemProps as CommandCenterItemProps,
  CommandList,
  useCommandCenterCtx,
} from "./CommandCenter";
import { DialogCloseButton } from "./Dialog";
import { isMac } from "./isMac";
import { Kbd } from "./Kbd";
import { Loading } from "./Loading";
import { parseKeys } from "./parseKeys";
import { Shortcut } from "./Shortcut";

const INPUT_ID = "command-input";

export function isRateLimitExceeded(err: unknown): boolean {
  return (
    typeof err === "object" &&
    err !== null &&
    "response" in err &&
    typeof err["response"] === "object" &&
    err["response"] !== null &&
    "status" in err.response &&
    err.response.status === 429
  );
}

let abortController: AbortController | undefined;
const fetchResults = pDebounce(async (query: string) => {
  type Result = { path: string; score: number; title: string }[];
  if (!query) return [] as Result;

  if (abortController) abortController.abort();
  abortController = new AbortController();

  let res: Response;
  try {
    res = await fetch(`/api/search?q=${query}`, {
      signal: abortController.signal,
    });
    return (await res.json()) as Result;
  } catch (err: any) {
    if (err.name === "AbortError") return [] as Result;
    if (isRateLimitExceeded(err)) {
      throw new Error("OpenAI limit exceeded. Try again later 🙏");
    }
    throw new Error("Something went wrong. Try again later 🙏");
  }
}, 300);

export function Commands({
  hide = false,
  posts,
  talks,
}: {
  hide: boolean;
  posts: { title: string; href: string }[];
  talks: { title: string; href: string }[];
}) {
  const [clientside, setClientside] = createSignal(false);
  onMount(() => setClientside(true)); // workaround for Astro + Solid Hydration issue

  return (
    <CommandCenter inputId={INPUT_ID}>
      <CommandCenterTrigger
        class={`zaduma-hover-before w-12 h-12 -mx-4 rounded-sm dark:text-gray-400 dark:hover:text-gray-300 ${
          hide ? "hidden" : ""
        }`}
      />
      <Show when={clientside()} keyed>
        {() => <CommandsPalette posts={posts} talks={talks} />}
      </Show>
    </CommandCenter>
  );
}

export function CommandsPalette({
  posts,
  talks,
}: {
  posts: { title: string; href: string }[];
  talks: { title: string; href: string }[];
}) {
  const { getInputValue } = useCommandCenterCtx();

  const [getSemanticSearchResult] = createResource(getInputValue, fetchResults);

  type CommandsPage = "posts" | "theme" | undefined;
  const [page, setPage] = createSignal<CommandsPage>();
  let dialog: HTMLDialogElement | undefined;

  const setColorScheme = (scheme: ColorScheme) => {
    if (page() !== "theme") return;
    setScheme(scheme);
    dialog?.close();
  };

  const getSelected = () =>
    dialog?.querySelector('[aria-selected="true"]') as HTMLElement | null;

  const keybindings = new Map<string, () => void>([
    [
      "escape",
      () => {
        setPage(undefined);
      },
    ],
    [
      "backspace",
      () => {
        if (!getInputValue()) setPage(undefined);
      },
    ],
    [
      "enter",
      () => {
        if (document.activeElement?.id === INPUT_ID) {
          (getSelected() as any)?.click();
        }
      },
    ],
    [
      "alt+t",
      () => {
        if (dialog && !dialog.open) dialog.showModal();
        setPage("theme");
      },
    ],
    [
      "cmd+k",
      () => {
        if (dialog) {
          if (dialog.open) dialog.close();
          else dialog.showModal();
        }
      },
    ],
    ["1", () => setColorScheme("light")],
    ["2", () => setColorScheme("dark")],
    ["3", () => setColorScheme(null)],
    [
      "alt+slash",
      () => {
        if (dialog && !dialog.open) dialog.showModal();
        document.getElementById(INPUT_ID)?.focus();
        setPage("posts");
      },
    ],
  ]);

  createEffect(() => {
    const onKeydown = (event: KeyboardEvent) => {
      console.log("onKeydown", event.key);

      const cmdKey = isMac() ? event.metaKey : event.ctrlKey;
      const { shiftKey, altKey } = event;

      const modifiers = [cmdKey && "cmd", shiftKey && "shift", altKey && "alt"];

      const { code, key } = parseKeys(event);

      console.log({ code, key });

      const found =
        keybindings.get(plus(...modifiers, code)) ||
        keybindings.get(plus(...modifiers, key));

      if (found) {
        if (cmdKey || altKey) event.preventDefault();
        found();
      }
    };

    window.addEventListener("keydown", onKeydown);

    onCleanup(() => window.removeEventListener("keydown", onKeydown));
  });

  const handleShortcut = (shortcut: string) => keybindings.get(shortcut)?.();

  return (
    <CommandCenterDialog
      onClose={(event) => {
        event.preventDefault();
        setPage(undefined);
      }}
      ref={(ref) => (dialog = ref)}
      class={
        "backdrop:bg-white backdrop:bg-opacity-30" +
        " dark:backdrop:bg-black dark:backdrop:bg-opacity-30" +
        " mx-auto transform rounded-xl bg-white" +
        " overflow-hidden shadow-2xl ring-1 ring-black ring-opacity-5" +
        " transition-all [&[open]]:flex flex-col" +
        " relative p-0 bg-white dark:bg-gray-900 w-96 max-w-full"
      }
    >
      <div class="flex justify-end">
        <DialogCloseButton
          class="p-2 cursor-pointer group focus:outline-none"
          onClick={() => setPage(undefined)}
        >
          <Kbd aria-hidden>esc</Kbd>
          <span class="sr-only">Close</span>
        </DialogCloseButton>
      </div>
      <CommandInput
        aria-label="Commands"
        class={
          "p-2 indent-2 w-full focus:outline-none border-b" +
          " dark:border-gray-700 bg-transparent"
        }
        placeholder="What do you need?"
        autofocus
      />
      <CommandList class="p-2 overflow-scroll">
        <Switch
          fallback={
            <>
              <CommandItem shortcut="alt+t" onClick={handleShortcut}>
                Set Theme
              </CommandItem>
              <CommandGroup heading={<GroupHeading>Search</GroupHeading>}>
                <CommandItem shortcut="alt+slash" onClick={handleShortcut}>
                  Search
                </CommandItem>
              </CommandGroup>
              <CommandGroup heading={<GroupHeading>Links</GroupHeading>}>
                <CommandItem href="https://twitter.com/aleksandrasays">
                  Twitter
                </CommandItem>
                <CommandItem href="https://github.com/beerose">
                  GitHub
                </CommandItem>
                <CommandItem href="/rss.xml">RSS</CommandItem>
                <CommandItem href="https://github.com/beerose/aleksandra.codes">
                  Edit this website on GitHub
                </CommandItem>
              </CommandGroup>
            </>
          }
        >
          <Match when={page() === "theme"}>
            <CommandItem shortcut="1" onClick={handleShortcut}>
              Set Theme to Light
            </CommandItem>
            <CommandItem shortcut="2" onClick={handleShortcut}>
              Set Theme to Dark
            </CommandItem>
            <CommandItem shortcut="3" onClick={handleShortcut}>
              Set Theme to System
            </CommandItem>
          </Match>
          <Match when={page() === "posts"}>
            <CommandGroup
              ignoreMatch
              heading={<GroupHeading>Semantic Search Results</GroupHeading>}
            >
              <Switch>
                <Match when={getSemanticSearchResult.loading}>
                  <CommandItem alwaysVisible>
                    <Loading />
                  </CommandItem>
                </Match>
                <Match when={getSemanticSearchResult.error}>
                  <CommandItem alwaysVisible>
                    {getSemanticSearchResult.error.message}
                  </CommandItem>
                </Match>
                <Match when={getSemanticSearchResult()}>
                  {getSemanticSearchResult()?.map((p) => (
                    <CommandItem alwaysVisible href={p.path}>
                      {p.title}
                    </CommandItem>
                  ))}
                </Match>
                <Match
                  when={
                    !getSemanticSearchResult.loading &&
                    !getSemanticSearchResult()?.length
                  }
                >
                  <CommandItem alwaysVisible href="">
                    No results
                  </CommandItem>
                </Match>
              </Switch>
            </CommandGroup>
            <CommandGroup heading={<GroupHeading>Posts By Title</GroupHeading>}>
              {posts.map((p) => (
                <CommandItem href={p.href}>{p.title}</CommandItem>
              ))}
            </CommandGroup>
            <CommandGroup heading={<GroupHeading>Talks By Title</GroupHeading>}>
              {talks.map((p) => (
                <CommandItem href={p.href}>{p.title}</CommandItem>
              ))}
            </CommandGroup>
          </Match>
        </Switch>
      </CommandList>
    </CommandCenterDialog>
  );
}

interface CommonCommandItemProps
  extends Omit<CommandCenterItemProps, "onClick"> {
  alwaysVisible?: boolean;
}
export type CommandItemProps = CommonCommandItemProps &
  (
    | {
        href?: never;
        shortcut: string;
        onClick: (shortcut: string) => void;
      }
    | { href: string; shortcut?: never; onClick?: never }
    | { href?: never; shortcut?: never; onClick?: never }
  );

function CommandItem(props: CommandItemProps) {
  const [own, rest] = splitProps(props, ["shortcut", "children", "onClick"]);

  const content = (
    <>
      {own.children}
      <Show when={own.shortcut} keyed>
        {(shortcut) => <Shortcut class="ml-1" shortcut={shortcut} />}
      </Show>
    </>
  );

  return (
    <CommandCenterItem
      class={
        "zaduma-hover-before p-2 cursor-pointer w-full focus-visible:outline-black " +
        "flex justify-between text-gray-700 dark:text-gray-300 " +
        "relative"
      }
      tabIndex={-1}
      onClick={() => {
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
        if (own.shortcut) own.onClick!(own.shortcut);
      }}
      {...rest}
    >
      {content}
    </CommandCenterItem>
  );
}

function GroupHeading(props: { children: JSX.Element }) {
  return (
    <span class="text-xs p-2 font-semibold text-gray-400 dark:text-gray-500 uppercase leading-none tracking-wider">
      {props.children}
    </span>
  );
}

function plus(...xs: (string | boolean | undefined | null)[]) {
  return xs.filter(Boolean).join("+");
}
