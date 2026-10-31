(() => {
  const disclosure = document.querySelector(".vpp-disclosure");
  const toggle = document.querySelector(".vpp-disclosure-toggle");
  const panel = document.getElementById("vpp-disclosure-panel");
  if (!disclosure || !toggle || !panel) return;

  const query = window.matchMedia("(max-width: 860px)");
  let mobileOpen = false;
  let wasMobile = query.matches;

  function setOpen(open) {
    disclosure.classList.toggle("vpp-open", open);
    disclosure.classList.toggle("vpp-collapsed", !open);
    toggle.setAttribute("aria-expanded", String(open));
    toggle.textContent = open ? "收起 VPP 控制台" : "展开 VPP 控制台";
    panel.hidden = query.matches && !open;
  }

  function syncDisclosure(redirectFocus = false) {
    const isMobile = query.matches;

    if (isMobile) {
      const previousFocus = document.activeElement;
      const needsFocusRedirect = redirectFocus && !wasMobile && !mobileOpen &&
        panel.contains(previousFocus) && previousFocus !== toggle;

      if (needsFocusRedirect) disclosure.classList.add("vpp-focus-redirect");
      setOpen(mobileOpen);
      if (needsFocusRedirect) {
        toggle.focus({ preventScroll: true });
        disclosure.classList.remove("vpp-focus-redirect");
      }
    } else {
      panel.hidden = false;
      disclosure.classList.add("vpp-open");
      disclosure.classList.remove("vpp-collapsed");
      toggle.setAttribute("aria-expanded", "true");
      toggle.textContent = "收起 VPP 控制台";
    }

    wasMobile = isMobile;
  }

  toggle.addEventListener("click", () => {
    mobileOpen = !mobileOpen;
    setOpen(mobileOpen);
  });

  if (query.addEventListener) {
    query.addEventListener("change", () => syncDisclosure(true));
  } else if (query.addListener) {
    query.addListener(() => syncDisclosure(true));
  }

  syncDisclosure();
  disclosure.classList.add("vpp-ready");
})();
