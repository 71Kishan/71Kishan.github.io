(() => {
  "use strict";

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const sceneCut = document.getElementById("sceneCut");
  const menuToggle = document.getElementById("menuToggle");
  const mobileNav = document.getElementById("mobileNav");

  /* ------------------------------------------------------------------------
     Mobile navigation
  ------------------------------------------------------------------------ */
  function closeMobileNav() {
    mobileNav?.classList.remove("is-open");
    menuToggle?.setAttribute("aria-expanded", "false");

    if (menuToggle) {
      menuToggle.innerHTML =
        '<i class="fa-solid fa-bars"></i><span class="sr-only">Open navigation</span>';
    }
  }

  menuToggle?.addEventListener("click", () => {
    const isOpen = !mobileNav?.classList.contains("is-open");
    mobileNav?.classList.toggle("is-open", isOpen);
    menuToggle.setAttribute("aria-expanded", String(isOpen));
    menuToggle.innerHTML = isOpen
      ? '<i class="fa-solid fa-xmark"></i><span class="sr-only">Close navigation</span>'
      : '<i class="fa-solid fa-bars"></i><span class="sr-only">Open navigation</span>';
  });

  /* ------------------------------------------------------------------------
     Cinematic direct navigation
     Natural scrolling drives the journey. Navigation clicks use a short cut.
  ------------------------------------------------------------------------ */
  let navigationTimer = null;

  function navigateTo(target) {
    const destination = document.querySelector(target);
    if (!destination) return;

    closeMobileNav();

    if (reducedMotion) {
      destination.scrollIntoView({ behavior: "auto", block: "start" });
      return;
    }

    window.clearTimeout(navigationTimer);
    sceneCut?.classList.add("is-active");

    navigationTimer = window.setTimeout(() => {
      destination.scrollIntoView({ behavior: "smooth", block: "start" });

      window.setTimeout(() => {
        sceneCut?.classList.remove("is-active");
      }, 260);
    }, 110);
  }

  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener("click", (event) => {
      const href = link.getAttribute("href");
      if (!href || href === "#") return;

      event.preventDefault();
      navigateTo(href);
    });
  });

  /* ------------------------------------------------------------------------
     Reveal motion
  ------------------------------------------------------------------------ */
  const revealItems = document.querySelectorAll(".reveal");
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("visible");
        revealObserver.unobserve(entry.target);
      });
    },
    { threshold: 0.12 }
  );

  revealItems.forEach((item) => revealObserver.observe(item));

  /* ------------------------------------------------------------------------
     Cinematic journey
  ------------------------------------------------------------------------ */
  const journey = document.getElementById("journey");
  const journeyScenes = [...document.querySelectorAll(".journey-scene")];
  const journeyDots = [...document.querySelectorAll(".journey-dot")];
  const journeyCounter = document.getElementById("journeyCounter");
  const architecturalLayers = {
    network: document.querySelector(".architecture-network"),
    systems: document.querySelector(".architecture-systems"),
    control: document.querySelector(".architecture-control")
  };

  let currentScene = -1;

  function setJourneyScene(index) {
    const safeIndex = Math.max(0, Math.min(journeyScenes.length - 1, index));
    if (safeIndex === currentScene) return;
    currentScene = safeIndex;

    journeyScenes.forEach((scene, sceneIndex) => {
      scene.classList.toggle("active", sceneIndex === safeIndex);
    });

    journeyDots.forEach((dot, dotIndex) => {
      const active = dotIndex === safeIndex;
      dot.classList.toggle("active", active);
      dot.setAttribute("aria-current", active ? "step" : "false");
    });

    if (journeyCounter) {
      journeyCounter.textContent = String(safeIndex + 1).padStart(2, "0");
    }

    architecturalLayers.network?.style.setProperty("opacity", safeIndex === 0 ? "1" : "0");
    architecturalLayers.systems?.style.setProperty("opacity", safeIndex === 1 ? "1" : "0");
    architecturalLayers.control?.style.setProperty("opacity", safeIndex === 2 ? "1" : "0");
  }

  function updateJourney() {
    if (!journey || journeyScenes.length === 0) return;

    const rect = journey.getBoundingClientRect();
    const travel = Math.max(1, journey.offsetHeight - window.innerHeight);
    const progress = Math.min(0.9999, Math.max(0, -rect.top / travel));
    const index = Math.min(journeyScenes.length - 1, Math.floor(progress * journeyScenes.length));

    setJourneyScene(index);
  }

  let journeyFramePending = false;

  function requestJourneyUpdate() {
    if (journeyFramePending) return;

    journeyFramePending = true;
    window.requestAnimationFrame(() => {
      updateJourney();
      journeyFramePending = false;
    });
  }

  window.addEventListener("scroll", requestJourneyUpdate, { passive: true });
  window.addEventListener("resize", requestJourneyUpdate);
  updateJourney();

  journeyDots.forEach((dot, index) => {
    dot.addEventListener("click", () => {
      if (!journey) return;

      const travel = Math.max(1, journey.offsetHeight - window.innerHeight);
      const destination = journey.offsetTop + travel * ((index + 0.5) / journeyScenes.length);

      window.scrollTo({
        top: destination,
        behavior: reducedMotion ? "auto" : "smooth"
      });
    });
  });

  /* ------------------------------------------------------------------------
     Pointer-reactive project cards
  ------------------------------------------------------------------------ */
  const finePointer = window.matchMedia("(pointer: fine)").matches;

  if (finePointer && !reducedMotion) {
    document.querySelectorAll(".project-card").forEach((card) => {
      card.addEventListener("pointermove", (event) => {
        const rect = card.getBoundingClientRect();
        const x = ((event.clientX - rect.left) / rect.width) * 100;
        const y = ((event.clientY - rect.top) / rect.height) * 100;

        card.style.setProperty("--mx", `${x}%`);
        card.style.setProperty("--my", `${y}%`);
      });

      card.addEventListener("pointerleave", () => {
        card.style.setProperty("--mx", "50%");
        card.style.setProperty("--my", "30%");
      });
    });
  }

  /* ------------------------------------------------------------------------
     Ambient infrastructure field
  ------------------------------------------------------------------------ */
  const canvas = document.getElementById("systemCanvas");
  const context = canvas?.getContext("2d");
  const pointer = { x: 0.5, y: 0.5 };
  let points = [];
  let devicePixelRatio = 1;

  function resizeCanvas() {
    if (!canvas || !context) return;

    devicePixelRatio = Math.min(window.devicePixelRatio || 1, 1.5);
    canvas.width = window.innerWidth * devicePixelRatio;
    canvas.height = window.innerHeight * devicePixelRatio;
    canvas.style.width = `${window.innerWidth}px`;
    canvas.style.height = `${window.innerHeight}px`;
    context.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);

    const pointCount =
      window.innerWidth < 700
        ? 18
        : window.innerWidth < 1100
          ? 30
          : 46;

    points = Array.from({ length: pointCount }, (_, index) => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      vx: (Math.random() - 0.5) * 0.045,
      vy: (Math.random() - 0.5) * 0.045,
      radius: index % 9 === 0 ? 1.3 : 0.7
    }));
  }

  function drawAmbientField() {
    if (!canvas || !context) return;

    context.clearRect(0, 0, window.innerWidth, window.innerHeight);

    points.forEach((point) => {
      point.x += point.vx;
      point.y += point.vy;

      if (point.x < -20 || point.x > window.innerWidth + 20) point.vx *= -1;
      if (point.y < -20 || point.y > window.innerHeight + 20) point.vy *= -1;

      const dx = point.x - pointer.x * window.innerWidth;
      const dy = point.y - pointer.y * window.innerHeight;
      const distance = Math.hypot(dx, dy);

      if (distance < 240) {
        point.x += (pointer.x * window.innerWidth - point.x) * 0.00025;
        point.y += (pointer.y * window.innerHeight - point.y) * 0.00025;
      }
    });

    for (let i = 0; i < points.length; i += 1) {
      for (let j = i + 1; j < points.length; j += 1) {
        const first = points[i];
        const second = points[j];
        const distance = Math.hypot(first.x - second.x, first.y - second.y);

        if (distance < 145) {
          const opacity = (1 - distance / 145) * 0.105;
          context.strokeStyle = `rgba(215,255,154,${opacity})`;
          context.lineWidth = 1;
          context.beginPath();
          context.moveTo(first.x, first.y);
          context.lineTo(second.x, second.y);
          context.stroke();
        }
      }
    }

    points.forEach((point) => {
      context.fillStyle =
        point.radius > 1
          ? "rgba(215,255,154,.32)"
          : "rgba(215,255,154,.17)";
      context.beginPath();
      context.arc(point.x, point.y, point.radius, 0, Math.PI * 2);
      context.fill();
    });

    if (!reducedMotion) {
      window.requestAnimationFrame(drawAmbientField);
    }
  }

  window.addEventListener(
    "pointermove",
    (event) => {
      pointer.x = event.clientX / window.innerWidth;
      pointer.y = event.clientY / window.innerHeight;
    },
    { passive: true }
  );

  window.addEventListener("resize", resizeCanvas);
  resizeCanvas();
  drawAmbientField();

  /* ------------------------------------------------------------------------
     Active desktop navigation state
  ------------------------------------------------------------------------ */
  const desktopLinks = [...document.querySelectorAll(".desktop-nav a")];
  const sections = [...document.querySelectorAll("main > section")];

  const sectionObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;

        desktopLinks.forEach((link) => {
          link.classList.toggle(
            "is-active",
            link.getAttribute("href") === `#${entry.target.id}`
          );
        });
      });
    },
    { rootMargin: "-40% 0px -50% 0px" }
  );

  sections.forEach((section) => sectionObserver.observe(section));
})();
