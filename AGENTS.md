<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Scene objects are positioned from the OBJETOS config in src/lib/escena.ts (percent units); edit config, not CSS, to move pieces.
- Object behavior (panel or animation) is mapped by id in ACCIONES in src/lib/escena.ts; taps are detected in the visor's pointer handlers (8 px threshold), keyboard via button click with detail 0.
- No backend: persistence is localStorage only, through src/lib/almacen.ts (try/catch-wrapped).
