import debounce from "lodash.debounce";
import {
  children,
  createContext,
  createEffect,
  createMemo,
  createResource,
  createSelector,
  createSignal,
  createUniqueId,
  JSX,
  onCleanup,
  Show,
  splitProps,
  useContext,
} from "solid-js";

import { Dialog, DialogProps } from "./Dialog";

const fetchResults = async (query: string) => {
  type Result = {
    path: string;
    score: number;
    title: string;
  }[];
  if (!query) return [] as Result;

  const res = await (await fetch(`api/search?q=${query}`)).json();
  return res as Result;
};

type CommandCenterCtx = {
  listId: string;
  inputId: string;
  setDialogRef: (ref: HTMLDialogElement | undefined) => void;
  open: () => void;
  isSelected: (command: string) => boolean;
  matchesFilter: (command: string) => boolean;
  onInput: (filter: string) => void;
  setSemanticMatches: (matches: { title: string; score: number }[]) => void;
};
const CommandCenterCtx = createContext<CommandCenterCtx>({
  inputId: "",
  listId: "",
  setDialogRef: () => {},
  open: () => {},
  isSelected: () => false,
  matchesFilter: () => true,
  onInput: () => {},
  setSemanticMatches: () => {},
});

const useCtx = () => useContext(CommandCenterCtx);

export interface CommandCenterTriggerProps
  extends JSX.ButtonHTMLAttributes<HTMLButtonElement> {
  onClick?: (event: MouseEvent) => void;
}
export function CommandCenterTrigger(props: CommandCenterTriggerProps) {
  const ctx = useCtx();

  return (
    <button
      {...props}
      onClick={(event) => {
        ctx.open();
        props.onClick?.(event);
      }}
    >
      ⌘
    </button>
  );
}

export interface CommandCenterProps {
  children: JSX.Element;
  inputId?: string;
}

export function CommandCenter(props: CommandCenterProps) {
  const dialogRef = {
    current: undefined as HTMLDialogElement | undefined,
  };
  let inputId = createUniqueId();
  const listId = createUniqueId();

  if (props.inputId) {
    inputId = props.inputId;
  }

  const [inputValue, onInput] = createSignal("");
  const [selectedCommand, selectCommand] = createSignal<string>("");
  const isSelected = createSelector(selectedCommand);

  const [semanticMatches, setSemanticMatches] = createSignal<
    { title: string; score: number }[]
  >([]);

  const [result] = createResource(inputValue, fetchResults);

  createEffect(() => {
    if (result()) {
      setSemanticMatches(result() || []);
    }
  });

  const match = (option: string, pattern: string) => {
    if (semanticMatches().length > 0) {
      return semanticMatches().some((match) =>
        match.title.toLowerCase().includes(option.toLowerCase())
      );
    }
    return option.toLowerCase().includes(pattern.toLowerCase());
  };

  const matchesFilter = createSelector<string, string>(inputValue, match);

  const getOptions = (): HTMLElement[] =>
    Array.from(dialogRef.current?.querySelectorAll('[role="option"]') || []);

  createEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const dialog = dialogRef.current;
      if (!dialog) return;

      let move: -1 | 1;

      switch (event.key) {
        case "ArrowUp":
          move = -1;
          break;

        case "ArrowDown":
          move = 1;
          break;

        default:
          return;
      }

      document.getElementById(inputId)?.focus();

      selectCommand((prev) => {
        const commands = getOptions();
        const current = dialog.querySelector(
          '[aria-selected="true"]'
        ) as HTMLElement;

        if (!current) {
          const next = move === 1 ? commands[0] : commands.at(-1);

          if (!next) return prev;
          return getCommandText(next);
        }

        const index = commands.indexOf(current);
        const nextIndex = (index + move + commands.length) % commands.length;

        return getCommandText(commands[nextIndex]!);
      });
    };

    window.addEventListener("keydown", onKeyDown);
    onCleanup(() => {
      window.removeEventListener("keydown", onKeyDown);
    });
  });

  return (
    <CommandCenterCtx.Provider
      value={{
        listId,
        inputId,
        setDialogRef: (ref) => {
          dialogRef.current = ref;

          ref?.addEventListener("close", () => {
            selectCommand("");
            onInput("");
            (document.getElementById(inputId) as HTMLInputElement).value = "";
          });
        },
        open: () => {
          dialogRef.current?.showModal();
        },
        isSelected,
        matchesFilter,
        setSemanticMatches,
        onInput: (pattern) => {
          onInput(pattern);

          if (!match(selectedCommand(), pattern)) {
            for (const element of getOptions()) {
              const text = getCommandText(element);
              if (match(text, pattern)) {
                selectCommand(text);
                break;
              }
            }
          }
        },
      }}
    >
      {props.children}
    </CommandCenterCtx.Provider>
  );
}

export interface CommandGroupProps {
  heading?: JSX.Element;
  children: JSX.Element;
}

export function CommandGroup(props: CommandGroupProps) {
  const headingId = createUniqueId();
  const { matchesFilter } = useCtx();

  const kids = children(() => props.children);
  const allChildrenAreHidden = createMemo(() => {
    const ks = (Array.isArray(kids()) ? kids() : [kids()]) as HTMLElement[];

    return ks.every((element) => !matchesFilter(getCommandText(element)));
  });

  return (
    <>
      <Show when={!!props.heading}>
        <div
          aria-hidden
          id={headingId}
          style={{ display: allChildrenAreHidden() ? "none" : "" }}
        >
          {props.heading}
        </div>
      </Show>
      <div
        role="group"
        {...(props.heading && { "aria-labelledby": headingId })}
      >
        {props.children}
      </div>
    </>
  );
}

export interface CommandItemProps extends JSX.HTMLAttributes<HTMLElement> {
  children: JSX.Element;
  href?: string | undefined;
}

export function CommandItem(props: CommandItemProps) {
  const [own, rest] = splitProps(props, ["href"]);
  const { isSelected, matchesFilter } = useCtx();

  const res = (
    own.href ? (
      <a
        href={own.href}
        role="option"
        aria-selected="false"
        {...(rest as JSX.HTMLAttributes<HTMLAnchorElement>)}
      >
        {props.children}
      </a>
    ) : (
      <button
        type="button"
        role="option"
        aria-selected="false"
        {...(rest as JSX.HTMLAttributes<HTMLButtonElement>)}
      >
        {props.children}
      </button>
    )
  ) as HTMLElement;

  createEffect(() => {
    const text = getCommandText(res);

    const selected = isSelected(text);
    res.ariaSelected = String(selected);
    res.style.display = matchesFilter(text) ? "" : "none";

    if (selected) res.scrollIntoView({ block: "center", behavior: "smooth" });
  });

  return res;
}

export interface CommandInputProps
  extends Omit<JSX.InputHTMLAttributes<HTMLInputElement>, "onChange" | "id"> {
  "aria-label": string;
}

export function CommandInput(props: CommandInputProps) {
  const ctx = useCtx();

  return (
    <input
      autocomplete="off"
      onInput={(event) => {
        ctx.onInput(event.currentTarget.value);
      }}
      {...{
        /**
         * Safari only
         * https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input#autocorrect
         */
        autocorrect: "off",
      }}
      spellcheck={false}
      aria-autocomplete="list"
      role="combobox"
      aria-expanded={true}
      aria-controls={ctx.listId}
      id={ctx.inputId}
      type="text"
      {...props}
    />
  );
}

export interface CommandCenterDialogProps extends DialogProps {
  ref?: (ref: HTMLDialogElement | undefined) => void;
}

export function CommandCenterDialog(props: CommandCenterDialogProps) {
  const ctx = useCtx();

  return (
    <Dialog
      {...props}
      style={{
        margin: "0 auto",
        position: "fixed",
        "max-height": "361px",
        top: "calc(50% - 180px)",
      }}
      ref={(dialog) => {
        ctx.setDialogRef(dialog);
        props.ref?.(dialog);
      }}
    />
  );
}

function getCommandText(element: HTMLElement) {
  return element.textContent || element.innerText;
}

export function CommandList(
  props: Omit<JSX.HTMLAttributes<HTMLDivElement>, "id">
) {
  const { listId } = useCtx();

  return <div id={listId} {...props} />;
}
