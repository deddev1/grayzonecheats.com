const BUY_URL = "https://zadeyo.com/go/QRH?to=%2Fproducts%2Fgray-zone-warfare";

const nav = document.querySelector("[data-nav]");
if (nav) {
  const toggle = nav.querySelector("[data-nav-toggle]");
  const panel = nav.querySelector("[data-nav-panel]");
  const links = Array.from(nav.querySelectorAll("[data-nav-link]"));
  const sections = Array.from(document.querySelectorAll("[data-nav-section]"));
  const isHome = window.location.pathname === "/" || window.location.pathname.endsWith("/index.html");

  const setOpen = (open) => {
    toggle?.setAttribute("aria-expanded", String(open));
    toggle?.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    nav.classList.toggle("is-open", open);
    document.body.classList.toggle("nav-open", open);
  };

  const setActive = (id) => {
    links.forEach((link) => {
      const match = link.getAttribute("data-section") === id;
      link.classList.toggle("is-active", match);
      link.setAttribute("aria-current", match ? "page" : "false");
    });
  };

  toggle?.addEventListener("click", () => {
    setOpen(toggle.getAttribute("aria-expanded") !== "true");
  });

  panel?.querySelectorAll("a").forEach((a) => {
    a.addEventListener("click", () => setOpen(false));
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && nav.classList.contains("is-open")) setOpen(false);
  });

  const onScroll = () => nav.classList.toggle("is-scrolled", window.scrollY > 8);
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  links.forEach((link) => {
    link.addEventListener("click", (e) => {
      const href = link.getAttribute("href") || "";
      if (!href.startsWith("/#") || !isHome) return;
      e.preventDefault();
      const id = link.getAttribute("data-section") || "";
      const target = document.getElementById(id);
      if (target) {
        target.scrollIntoView({ behavior: "smooth", block: "start" });
        history.replaceState(null, "", `#${id}`);
        setActive(id);
        setOpen(false);
      }
    });
  });

  if (isHome && sections.length) {
    const offset = () => (nav.querySelector(".nav__bar")?.getBoundingClientRect().height ?? 72) + 24;
    const update = () => {
      const y = window.scrollY + offset();
      let current = sections[0]?.id || "home";
      sections.forEach((section) => {
        if (section.offsetTop <= y + 2) current = section.id;
      });
      setActive(current);
    };
    let frame = 0;
    const tick = () => {
      frame ||= window.requestAnimationFrame(() => {
        frame = 0;
        update();
      });
    };
    window.addEventListener("scroll", tick, { passive: true });
    window.addEventListener("resize", tick, { passive: true });
    if (window.location.hash) {
      const id = window.location.hash.replace("#", "");
      if (document.getElementById(id)) setActive(id);
    } else {
      setActive("home");
    }
    update();
  }
}

const initProductPreview = (productRoot) => {
  const mainImage = productRoot.querySelector("[data-product-main]");
  const videoWrap = productRoot.querySelector("[data-product-video-wrap]");
  const video = productRoot.querySelector("[data-product-video]");
  const videoSource = productRoot.querySelector("[data-product-video-source]");
  const videoPoster = productRoot.querySelector("[data-product-video-poster]");
  const playBtn = productRoot.querySelector("[data-product-play]");
  const videoError = productRoot.querySelector("[data-product-video-error]");
  const videoSrc = productRoot.getAttribute("data-product-video-src") || "";
  const priceEl = productRoot.querySelector("[data-product-price]");
  const buyBtn = productRoot.querySelector("[data-product-buy]");
  const plans = Array.from(productRoot.querySelectorAll("[data-plan]"));
  const thumbs = Array.from(productRoot.querySelectorAll("[data-thumb]"));

  const hideVideoError = () => {
    if (videoError) videoError.hidden = true;
  };

  const showVideoError = () => {
    video?.classList.remove("is-playing");
    videoPoster?.removeAttribute("hidden");
    playBtn?.classList.remove("is-hidden");
    if (videoError) videoError.hidden = false;
  };

  const showVideoPreview = () => {
    if (videoWrap) videoWrap.hidden = false;
    if (mainImage) mainImage.hidden = true;
    if (video) {
      video.pause();
      video.classList.remove("is-playing");
    }
    videoPoster?.removeAttribute("hidden");
    playBtn?.classList.remove("is-hidden");
    hideVideoError();
  };

  const showImagePreview = (src, alt) => {
    if (videoWrap) videoWrap.hidden = true;
    if (mainImage) {
      mainImage.hidden = false;
      if (src) mainImage.src = src;
      mainImage.alt = alt;
    }
    if (video) {
      video.pause();
      video.classList.remove("is-playing");
    }
    videoPoster?.removeAttribute("hidden");
    playBtn?.classList.remove("is-hidden");
    hideVideoError();
  };

  const startVideoPlayback = () => {
    if (!video) return;
    hideVideoError();
    videoPoster?.setAttribute("hidden", "");
    video.classList.add("is-playing");
    playBtn?.classList.add("is-hidden");
    video.play().catch(() => {
      video.classList.remove("is-playing");
      videoPoster?.removeAttribute("hidden");
      showVideoError();
    });
  };

  const ensureVideoSource = () => {
    if (!video || !videoSrc) return false;
    if (videoSource) {
      if (!videoSource.getAttribute("src")) videoSource.setAttribute("src", videoSrc);
      return true;
    }
    if (!video.getAttribute("src")) video.setAttribute("src", videoSrc);
    return true;
  };

  const loadVideoBlob = async () => {
    const response = await fetch(videoSrc);
    if (!response.ok) throw new Error("Video request failed");
    const data = await response.blob();
    const typedBlob = data.type.startsWith("video/")
      ? data
      : new Blob([data], { type: "video/mp4" });
    const blobUrl = URL.createObjectURL(typedBlob);
    videoSource?.removeAttribute("src");
    video.removeAttribute("src");
    video.src = blobUrl;
    video.load();
  };

  const isVideoReady = () =>
    Boolean(video && video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA);

  thumbs.forEach((thumb) => {
    thumb.addEventListener("click", () => {
      thumbs.forEach((t) => t.classList.toggle("is-active", t === thumb));
      if (thumb.hasAttribute("data-thumb-video")) {
        showVideoPreview();
        return;
      }
      const src = thumb.getAttribute("data-src");
      const alt = thumb.getAttribute("data-alt") || "";
      showImagePreview(src, alt);
    });
  });

  playBtn?.addEventListener("click", async () => {
    if (!video || !ensureVideoSource()) return;

    if (isVideoReady()) {
      startVideoPlayback();
      return;
    }

    const onReady = () => {
      video.removeEventListener("loadeddata", onReady);
      video.removeEventListener("canplay", onReady);
      video.removeEventListener("error", onError);
      startVideoPlayback();
    };

    const onError = async () => {
      video.removeEventListener("loadeddata", onReady);
      video.removeEventListener("canplay", onReady);
      video.removeEventListener("error", onError);
      if (video.dataset.blobFallback === "true") {
        showVideoError();
        return;
      }
      try {
        video.dataset.blobFallback = "true";
        await loadVideoBlob();
        startVideoPlayback();
      } catch {
        showVideoError();
      }
    };

    video.addEventListener("loadeddata", onReady, { once: true });
    video.addEventListener("canplay", onReady, { once: true });
    video.addEventListener("error", onError, { once: true });
    video.load();
  });

  video?.addEventListener("error", () => {
    if (videoSource?.getAttribute("src") || video.getAttribute("src")) showVideoError();
  });

  video?.addEventListener("pause", () => {
    if (!video) return;
    if (video.currentTime > 0 && !video.ended) return;
    video.classList.remove("is-playing");
    videoPoster?.removeAttribute("hidden");
    playBtn?.classList.remove("is-hidden");
  });

  video?.addEventListener("ended", () => {
    video.classList.remove("is-playing");
    videoPoster?.removeAttribute("hidden");
    playBtn?.classList.remove("is-hidden");
  });

  const selectPlan = (plan) => {
    plans.forEach((p) => p.classList.toggle("is-active", p === plan));
    const price = plan.getAttribute("data-price") || "";
    const label = plan.getAttribute("data-label") || "";
    if (priceEl) priceEl.textContent = price;
    if (buyBtn) buyBtn.textContent = `Buy Now — ${label}`;
  };

  plans.forEach((plan) => {
    plan.addEventListener("click", () => selectPlan(plan));
  });

  if (buyBtn) {
    buyBtn.href = BUY_URL;
    buyBtn.setAttribute("rel", "noopener noreferrer");
  }
};

document.querySelectorAll("[data-product]").forEach(initProductPreview);

document.querySelectorAll("[data-buy]").forEach((el) => {
  el.href = BUY_URL;
  el.setAttribute("rel", "noopener noreferrer");
});

const demoRoot = document.querySelector("[data-demo]");
if (demoRoot) {
  const triggers = Array.from(demoRoot.querySelectorAll("[data-demo-trigger]"));
  const stage = demoRoot.querySelector("[data-demo-stage]");
  const visual = demoRoot.querySelector("[data-demo-visual]");
  const video = demoRoot.querySelector("[data-demo-video]");
  const placeholder = demoRoot.querySelector("[data-demo-placeholder]");
  const placeholderText = demoRoot.querySelector("[data-demo-placeholder-text]");
  const titleEl = demoRoot.querySelector(".gallery__demo-title");
  const descriptionEl = demoRoot.querySelector(".gallery__demo-description");
  const captionEl = demoRoot.querySelector("[data-demo-caption]");
  const meta = demoRoot.querySelector(".gallery__demo-meta");
  const FADE_MS = 320;

  const hideAllMedia = () => {
    visual.hidden = true;
    video.hidden = true;
    video.pause();
    placeholder.hidden = true;
  };

  const applyDemo = (btn) => {
    const mediaType = btn.getAttribute("data-demo-media-type") || "image";
    const title = btn.getAttribute("data-demo-title") || "";
    const description = btn.getAttribute("data-demo-description") || "";

    if (titleEl) titleEl.textContent = title;
    if (descriptionEl) descriptionEl.textContent = description;
    if (captionEl) captionEl.textContent = title;

    hideAllMedia();

    if (mediaType === "placeholder") {
      placeholder.hidden = false;
      if (placeholderText) {
        placeholderText.textContent = btn.getAttribute("data-demo-todo") || "Preview coming soon";
      }
      return;
    }

    if (mediaType === "video") {
      const src = btn.getAttribute("data-demo-src") || "";
      if (src) {
        video.hidden = false;
        if (video.getAttribute("src") !== src) video.setAttribute("src", src);
        video.load();
        video.play().catch(() => {});
      }
      return;
    }

    const src = btn.getAttribute("data-demo-src") || "";
    if (!visual) return;

    visual.hidden = false;
    visual.alt = btn.getAttribute("data-demo-alt") || title;
    const demoWidth = btn.getAttribute("data-demo-width") || "1920";
    const demoHeight = btn.getAttribute("data-demo-height") || "1080";
    visual.setAttribute("width", demoWidth);
    visual.setAttribute("height", demoHeight);
    visual.setAttribute("decoding", "async");
    if (!visual.getAttribute("loading")) visual.setAttribute("loading", "lazy");
    if (src) {
      if (visual.getAttribute("src") !== src) {
        visual.setAttribute("src", src);
      } else if (!visual.complete || visual.naturalWidth === 0) {
        visual.setAttribute("src", src);
      }
      if (!visual.getAttribute("loading")) visual.setAttribute("loading", "lazy");
    }
  };

  const selectDemo = (btn) => {
    if (btn.classList.contains("is-active")) return;

    triggers.forEach((trigger) => {
      const active = trigger === btn;
      trigger.classList.toggle("is-active", active);
      trigger.setAttribute("aria-pressed", active ? "true" : "false");
    });

    const list = demoRoot.querySelector(".gallery__highlights");
    if (list && window.matchMedia("(min-width: 901px)").matches) {
      btn.scrollIntoView({ block: "nearest", behavior: "smooth" });
    }

    stage?.classList.add("is-swapping");
    meta?.classList.add("is-swapping");

    window.setTimeout(() => {
      applyDemo(btn);
      stage?.classList.remove("is-swapping");
      meta?.classList.remove("is-swapping");
    }, FADE_MS);
  };

  triggers.forEach((btn) => {
    btn.addEventListener("click", () => selectDemo(btn));
  });
}

const initBuyCorner = () => {
  const dismissKey = "gzw-buy-corner-dismissed";
  if (localStorage.getItem(dismissKey) === "1") return;

  const corner = document.createElement("aside");
  corner.className = "buy-corner";
  corner.setAttribute("data-buy-corner", "");
  corner.setAttribute("aria-label", "Buy Gray Zone Warfare cheats");
  corner.innerHTML = `
    <a href="${BUY_URL}" class="buy-corner__pill" data-buy rel="noopener noreferrer">
      <span class="buy-corner__title">Buy Now</span>
      <span class="buy-corner__price">From $35 / mo</span>
    </a>
    <button type="button" class="buy-corner__dismiss" aria-label="Dismiss buy button" data-buy-corner-dismiss>×</button>
  `;

  document.body.appendChild(corner);

  const dismissBtn = corner.querySelector("[data-buy-corner-dismiss]");
  const buyLink = corner.querySelector("[data-buy]");

  dismissBtn?.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    corner.classList.remove("is-visible");
    corner.classList.add("is-hidden");
    localStorage.setItem(dismissKey, "1");
  });

  buyLink?.setAttribute("rel", "noopener noreferrer");

  const showAfter = 280;
  const updateVisibility = () => {
    if (corner.classList.contains("is-hidden")) return;
    const visible = window.scrollY >= showAfter;
    corner.classList.toggle("is-visible", visible);
  };

  updateVisibility();
  window.addEventListener("scroll", updateVisibility, { passive: true });
};

initBuyCorner();
