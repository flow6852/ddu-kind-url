import * as fn from "https://deno.land/x/denops_std@v4.0.0/function/mod.ts";
import type { Actions } from "https://deno.land/x/ddu_vim@v2.3.0/types.ts";
import {
  ActionFlags,
  BaseKind,
} from "https://deno.land/x/ddu_vim@v2.3.0/types.ts";

export interface ActionData {
  url: string;
}
type Params = {
  externalOpener: "openbrowser";
};
interface OpenParams {
  command?: string;
}
interface YankParams {
  register?: string;
}

export class Kind extends BaseKind<Params> {
  override actions: Actions<Params> = {
    async browse(args) {
      switch (args.kindParams.externalOpener) {
        case "openbrowser":
          for (const item of args.items) {
            const action = item?.action as ActionData;
            await args.denops.call("openbrowser#open", action.url);
          }
          break;
        default:
          await args.denops.call(
            "ddu#util#print_error",
            "open-browser.vim is not installed",
            "ddu-kind-url",
          );
      }
      return Promise.resolve(ActionFlags.None);
    },

    async open(args) {
      const params = args.actionParams as OpenParams;
      const openCommand = params.command ?? ":edit";
      for (const item of args.items) {
        const action = item?.action as ActionData;
        await args.denops.cmd("silent execute command fnameescape(path)", {
          command: openCommand,
          path: action.url,
        });
      }
      return Promise.resolve(ActionFlags.None);
    },

    async yank(args) {
      const params = args.actionParams as YankParams;
      const register = params.register;
      for (const item of args.items) {
        const action = item?.action as ActionData;
        await fn.setreg(args.denops, '"', action.url);
        if (register) {
          await fn.setreg(args.denops, register, action.url);
        }
        if (await fn.has(args.denops, "clipboard")) {
          await fn.setreg(
            args.denops,
            await args.denops.eval("v:register"),
            action.url,
          );
        }
      }
      return Promise.resolve(ActionFlags.None);
    },
  };

  override params(): Params {
    return {
      externalOpener: "openbrowser",
    };
  }
}
