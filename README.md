# Puzzle #39 — mega dropdown nav menu (hover-persistent, multi-column)

Brief (Task Forge puzzle tracker): mega dropdown nav menu (hover-persistent, multi-column) — none/generic.

A multi-column mega menu where the hard requirement — **hover-persistent** — is
actually solved, not hand-waved. Three files, no dependencies.

## The real problem: hover-persistence

A naive `:hover`-only mega menu closes the instant the cursor crosses the gap
between the trigger and the panel, or when it moves diagonally and briefly
leaves both. This one stays open, via three mechanisms:

1. **CSS bridge** — an invisible pseudo-element (`.mega-panel::before`) covers
   the 10px gap between trigger and panel so hover never breaks crossing it.
2. **JS close-delay** — leaving an item schedules a close ~180ms later;
   re-entering the trigger *or* the panel cancels it, so brief exits don't
   close the menu.
3. **One-at-a-time** — opening a menu immediately closes any other and cancels
   its pending close.

Plus full keyboard access: Enter/Space/ArrowDown open a menu, Escape closes and
restores focus to the trigger, Tab-out closes, and `aria-expanded` stays in
sync.

## Verified live (automated, in a real browser)

Driven via claude-in-chrome with dispatched pointer/keyboard events — **6/6
pass**:

```
✓ hover opens products
✓ stays open after brief leave+reenter (hover-persistence)   ← the hard one
✓ closes after leave + delay
✓ opening solutions closes products (one at a time)
✓ ArrowDown opens + aria-expanded true
✓ Escape closes + aria-expanded false
```

Also visually confirmed the 3-column panel (Build / Ship / Featured card)
renders correctly with the trigger highlighted and caret flipped.

## Deploy

`wrangler.jsonc` included (static Worker). Public deploy to
`puzzle-39-mega-menu.krikormher.workers.dev` is pending the same one-time
`wrangler login` as puzzle #35 (Cloudflare OAuth expired mid-session).
