const links = [...document.querySelectorAll(".toc__link")];
const sections = links
  .map((link) => document.querySelector(link.getAttribute("href")))
  .filter(Boolean);

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
