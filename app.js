const links = [...document.querySelectorAll(".toc__link")];
const sections = links
  .map((link) => document.querySelector(link.getAttribute("href")))
  .filter(Boolean);
const protocolEntries = [...document.querySelectorAll(".protocol-entry")];

const setActiveLink = (id) => {
  for (const link of links) {
    link.classList.toggle("is-active", link.getAttribute("href") === `#${id}`);
  }
};

const observer = new IntersectionObserver(
  (entries) => {
    const visible = entries
      .filter((entry) => entry.isIntersecting)
      .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

    if (visible?.target?.id) {
      setActiveLink(visible.target.id);
    }
  },
  {
    rootMargin: "-25% 0px -55% 0px",
    threshold: [0.15, 0.4, 0.7]
  }
);

for (const section of sections) {
  observer.observe(section);
}

const accordionState = new WeakMap();

const getAccordionState = (entry) => {
  if (!accordionState.has(entry)) {
    accordionState.set(entry, { animation: null, isClosing: false, isExpanding: false });
  }

  return accordionState.get(entry);
};

const shrinkEntry = (entry) =>
  new Promise((resolve) => {
    const state = getAccordionState(entry);
    const summary = entry.querySelector(".protocol-entry__summary");
    const body = entry.querySelector(".protocol-entry__body");

    if (!summary || !body || !entry.open) {
      resolve();
      return;
    }

    state.isClosing = true;
    state.isExpanding = false;

    if (state.animation) {
      state.animation.cancel();
    }

    const startHeight = `${entry.offsetHeight}px`;
    const endHeight = `${summary.offsetHeight}px`;
    body.style.opacity = "0";

    state.animation = entry.animate(
      {
        height: [startHeight, endHeight]
      },
      {
        duration: 220,
        easing: "ease"
      }
    );

    state.animation.onfinish = () => {
      state.isClosing = false;
      state.animation = null;
      entry.open = false;
      entry.style.height = "";
      body.style.opacity = "";
      resolve();
    };

    state.animation.oncancel = () => {
      state.isClosing = false;
      state.animation = null;
      resolve();
    };
  });

const expandEntry = (entry) =>
  new Promise((resolve) => {
    const state = getAccordionState(entry);
    const body = entry.querySelector(".protocol-entry__body");

    if (!body) {
      resolve();
      return;
    }

    state.isClosing = false;
    state.isExpanding = true;

    if (state.animation) {
      state.animation.cancel();
    }

    entry.style.height = `${entry.offsetHeight}px`;
    entry.open = true;
    const endHeight = `${entry.scrollHeight}px`;
    body.style.opacity = "0";

    state.animation = entry.animate(
      {
        height: [entry.style.height, endHeight]
      },
      {
        duration: 240,
        easing: "ease"
      }
    );

    requestAnimationFrame(() => {
      body.style.opacity = "1";
    });

    state.animation.onfinish = () => {
      state.isExpanding = false;
      state.animation = null;
      entry.style.height = "";
      body.style.opacity = "";
      resolve();
    };

    state.animation.oncancel = () => {
      state.isExpanding = false;
      state.animation = null;
      resolve();
    };
  });

for (const entry of protocolEntries) {
  const summary = entry.querySelector(".protocol-entry__summary");

  if (!summary) {
    continue;
  }

  summary.addEventListener("click", async (event) => {
    event.preventDefault();

    const state = getAccordionState(entry);

    if (state.isClosing || state.isExpanding) {
      return;
    }

    if (entry.open) {
      await shrinkEntry(entry);
      return;
    }

    for (const otherEntry of protocolEntries) {
      if (otherEntry !== entry && otherEntry.open) {
        await shrinkEntry(otherEntry);
      }
    }

    await expandEntry(entry);
  });
}
