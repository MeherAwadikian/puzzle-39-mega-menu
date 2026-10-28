// Mega menu: hover-persistent + keyboard accessible.
//
// The hard part is "hover-persistent": a naive `:hover`-only menu closes the
// instant the cursor crosses the gap between the trigger and the panel, or
// when it moves diagonally and briefly exits both. We solve it with:
//   1. A CSS "bridge" pseudo-element covering the gap (see styles.css).
//   2. A JS close-delay: leaving the item schedules a close ~180ms later, and
//      re-entering (trigger OR panel) cancels it — so brief exits don't close.
//   3. Only one menu open at a time; opening one cancels others' pending close.
// Plus full keyboard support: Enter/Space/ArrowDown open, Escape closes, and
// focus leaving the item closes it. aria-expanded is kept in sync.

(function () {
  const CLOSE_DELAY = 180;
  const items = Array.from(document.querySelectorAll('.nav-item[data-menu]'));
  const status = document.getElementById('status');
  let closeTimer = null;
  let openItem = null;

  function setStatus(msg) {
    if (status) status.textContent = 'menu: ' + msg;
  }

  function open(item) {
    if (openItem && openItem !== item) close(openItem, true);
    clearTimeout(closeTimer);
    closeTimer = null;
    item.classList.add('open');
    const trigger = item.querySelector('.nav-trigger');
    if (trigger) trigger.setAttribute('aria-expanded', 'true');
    openItem = item;
    setStatus('open (' + item.dataset.menu + ')');
  }

  function close(item, immediate) {
    const doClose = () => {
      item.classList.remove('open');
      const trigger = item.querySelector('.nav-trigger');
      if (trigger) trigger.setAttribute('aria-expanded', 'false');
      if (openItem === item) openItem = null;
      setStatus('idle');
    };
    if (immediate) {
      clearTimeout(closeTimer);
      doClose();
    } else {
      clearTimeout(closeTimer);
      closeTimer = setTimeout(doClose, CLOSE_DELAY);
    }
  }

  items.forEach((item) => {
    const trigger = item.querySelector('.nav-trigger');

    // Pointer: open on enter, schedule close on leave (cancelled by re-enter).
    item.addEventListener('pointerenter', () => open(item));
    item.addEventListener('pointerleave', () => close(item, false));

    // Keyboard on the trigger.
    trigger.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') {
        e.preventDefault();
        if (item.classList.contains('open')) {
          // move focus into first panel link
          const first = item.querySelector('.mega-panel a');
          if (first) first.focus();
        } else {
          open(item);
        }
      } else if (e.key === 'Escape') {
        close(item, true);
        trigger.focus();
      }
    });

    // Escape anywhere inside the panel closes + returns focus to the trigger.
    item.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        close(item, true);
        trigger.focus();
      }
    });

    // Close when focus leaves the whole item (tabbing out).
    item.addEventListener('focusout', (e) => {
      if (!item.contains(e.relatedTarget)) close(item, false);
    });
    // Opening via keyboard focus on the trigger.
    trigger.addEventListener('focus', () => {
      // don't auto-open on focus; wait for key — but cancel any pending close
      clearTimeout(closeTimer);
    });
  });

  // Click outside closes any open menu.
  document.addEventListener('pointerdown', (e) => {
    if (openItem && !openItem.contains(e.target)) close(openItem, true);
  });
})();
