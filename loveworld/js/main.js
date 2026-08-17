(() => {
  const START = new Date(2025, 4, 4, 21, 0, 0);
  const HEART_W = 670;
  const HEART_H = 625;

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

  const sky = $("#sky");
  const ctx = sky.getContext("2d");
  const stars = [];
  let shooting = null;
  let garden = null;
  let offsetX = 0;
  let offsetY = 0;
  let heartScale = 1;
  let clockReady = false;

  const resizeSky = () => {
    sky.width = innerWidth;
    sky.height = innerHeight;
    stars.length = 0;
    const count = Math.floor((innerWidth * innerHeight) / 9000);
    for (let i = 0; i < count; i += 1) {
      stars.push({
        x: Math.random() * sky.width,
        y: Math.random() * sky.height,
        r: Math.random() * 1.4 + 0.2,
        a: Math.random(),
        s: Math.random() * 0.02 + 0.005,
        c: Math.random() > 0.5 ? "#e8b4b0" : "#e0c48a",
      });
    }
  };

  const drawSky = () => {
    ctx.clearRect(0, 0, sky.width, sky.height);
    stars.forEach((star) => {
      star.a += star.s;
      ctx.globalAlpha = 0.35 + Math.abs(Math.sin(star.a)) * 0.65;
      ctx.fillStyle = star.c;
      ctx.beginPath();
      ctx.arc(star.x, star.y, star.r, 0, Math.PI * 2);
      ctx.fill();
    });
    if (!shooting && Math.random() < 0.008) {
      shooting = {
        x: Math.random() * sky.width * 0.8,
        y: Math.random() * sky.height * 0.4,
        len: 90,
        life: 0,
      };
    }
    if (shooting) {
      ctx.globalAlpha = 1 - shooting.life;
      ctx.strokeStyle = "#d4a574";
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.moveTo(shooting.x, shooting.y);
      ctx.lineTo(shooting.x + shooting.len, shooting.y + shooting.len * 0.35);
      ctx.stroke();
      shooting.x += 12;
      shooting.y += 4;
      shooting.life += 0.03;
      if (shooting.life >= 1) shooting = null;
    }
    ctx.globalAlpha = 1;
    requestAnimationFrame(drawSky);
  };

  const spawnPetal = () => {
    const petal = document.createElement("i");
    petal.textContent = Math.random() > 0.5 ? "❀" : "♡";
    petal.style.cssText = `
      position:absolute;left:${Math.random() * 100}%;top:-20px;color:#f3b6b2;
      opacity:${0.25 + Math.random() * 0.5};font-size:${12 + Math.random() * 16}px;
      animation:fall ${8 + Math.random() * 8}s linear forwards;
    `;
    $("#petals").appendChild(petal);
    setTimeout(() => petal.remove(), 16000);
  };

  const style = document.createElement("style");
  style.textContent = `
    @keyframes fall {
      to { transform: translateY(110vh) rotate(360deg); opacity: 0; }
    }
  `;
  document.head.appendChild(style);

  const pad = (num) => String(num).padStart(2, "0");

  const updateTimer = () => {
    const clock = $("#elapseClock");
    if (!clock) return;
    const diff = Math.max(0, Date.now() - START.getTime());
    const sec = Math.floor(diff / 1000);
    const days = Math.floor(sec / 86400);
    const hours = Math.floor((sec % 86400) / 3600);
    const mins = Math.floor((sec % 3600) / 60);
    const secs = sec % 60;
    clock.innerHTML =
      `<span class="digit">${days}</span> 天 ` +
      `<span class="digit">${pad(hours)}</span> 时 ` +
      `<span class="digit">${pad(mins)}</span> 分 ` +
      `<span class="digit">${pad(secs)}</span> 秒`;
  };

  const typeHomeLetter = () => {
    const el = $("#code");
    if (!el || el.dataset.done) return;
    const html = el.innerHTML;
    let i = 0;
    el.dataset.done = "1";
    // 锁定最终高度：打字过程中高度不变，爱心就不会跟着上下晃
    el.style.height = `${el.offsetHeight}px`;
    el.innerHTML = "";
    const tick = () => {
      const next = html.substr(i, 1);
      if (next === "<") i = html.indexOf(">", i) + 1;
      else i += 1;
      el.innerHTML = html.substring(0, i) + (i < html.length ? '<span class="caret"></span>' : "");
      if (i < html.length) setTimeout(tick, 28);
    };
    tick();
  };

  const getHeartPoint = (angle) => {
    const t = angle / Math.PI;
    const x = 19.5 * (16 * Math.pow(Math.sin(t), 3)) * heartScale;
    const y = -20 * (13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t)) * heartScale;
    return [offsetX + x, offsetY + y];
  };

  const adjustWords = () => {
    const words = $("#words");
    const canvas = $("#garden");
    if (!words || !canvas) return;
    words.style.top = `${195 * heartScale}px`;
    words.style.left = `${(canvas.width - words.offsetWidth) / 2}px`;
  };

  const startHeartAnimation = () => {
    let angle = 10;
    const points = [];
    const timer = setInterval(() => {
      const point = getHeartPoint(angle);
      const tooClose = points.some((prev) => {
        const dist = Math.hypot(prev[0] - point[0], prev[1] - point[1]);
        return dist < Garden.options.bloomRadius.max * 1.3 * heartScale;
      });
      if (!tooClose) {
        points.push(point);
        garden.createRandomBloom(point[0], point[1]);
      }
      if (angle >= 30) {
        clearInterval(timer);
        $("#messages").style.display = "block";
        setTimeout(() => {
          $("#loveu").style.display = "block";
        }, 1600);
      } else {
        angle += 0.2;
      }
    }, 50);
  };

  const initBigClock = () => {
    const box = $("#loveHeart");
    const canvas = $("#garden");
    if (!box || !canvas || clockReady) return;

    const maxW = Math.min(HEART_W, box.parentElement.clientWidth);
    if (!maxW) {
      requestAnimationFrame(initBigClock);
      return;
    }

    heartScale = maxW / HEART_W;
    box.style.width = `${maxW}px`;
    box.style.height = `${Math.round(HEART_H * heartScale)}px`;
    canvas.width = maxW;
    canvas.height = Math.round(HEART_H * heartScale);
    offsetX = maxW / 2;
    offsetY = canvas.height / 2 - 55 * heartScale;

    const gardenCtx = canvas.getContext("2d");
    gardenCtx.globalCompositeOperation = "lighter";
    Garden.options.color = {
      rmin: 180,
      rmax: 255,
      gmin: 70,
      gmax: 160,
      bmin: 90,
      bmax: 170,
      opacity: 0.14,
    };
    garden = new Garden(gardenCtx, canvas);
    clockReady = true;
    setInterval(() => garden.render(), Garden.options.growSpeed);
    typeHomeLetter();
    adjustWords();
    startHeartAnimation();
  };

  const setupMusic = () => {
    const audio = $("#bgm");
    const btn = $("#music-btn");
    btn.addEventListener("click", async () => {
      if (audio.paused) {
        try {
          await audio.play();
          btn.textContent = "♪";
        } catch {
          btn.textContent = "×";
        }
      } else {
        audio.pause();
        btn.textContent = "♫";
      }
    });
  };

  const setupScrollNav = () => {
    const links = $$(".nav a");
    const map = links.map((link) => $(link.getAttribute("href")));
    const home = $("#home");
    const syncIntroChrome = () => {
      document.body.classList.toggle("home-intro", window.scrollY < home.offsetHeight - 64);
    };
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        links.forEach((link) => {
          link.classList.toggle("active", link.getAttribute("href") === `#${entry.target.id}`);
        });
      });
    }, { threshold: 0.35 });
    map.forEach((sec) => sec && io.observe(sec));
    syncIntroChrome();
    addEventListener("scroll", syncIntroChrome, { passive: true });
    addEventListener("resize", syncIntroChrome);
  };

  document.addEventListener("click", (event) => {
    if (event.target.closest("button, a, input, .photo-card, .lightbox")) return;
    const heart = document.createElement("span");
    heart.textContent = "❤";
    heart.style.cssText = `
      position:fixed;left:${event.clientX}px;top:${event.clientY}px;color:#f3b6b2;
      pointer-events:none;z-index:30;animation:rise 1.1s ease forwards;
    `;
    $(".hearts-layer").appendChild(heart);
    setTimeout(() => heart.remove(), 1100);
  });

  $("#top-btn").addEventListener("click", () => {
    $("#home").scrollIntoView({ behavior: "smooth" });
  });

  const PHOTO_COUNT = 12;
  const loadedPhotos = [];

  const setupGallery = () => {
    const wall = $("#photo-wall");
    const box = $("#lightbox");
    const img = $("#lightbox-img");
    const cap = $("#lightbox-cap");
    if (!wall || !box) return;

    const openAt = (index) => {
      if (!loadedPhotos.length) return;
      const current = (index + loadedPhotos.length) % loadedPhotos.length;
      const item = loadedPhotos[current];
      box.dataset.index = String(current);
      img.src = item.src;
      cap.textContent = item.label;
      box.hidden = false;
      box.classList.remove("hidden");
    };

    const closeBox = () => {
      box.hidden = true;
      box.classList.add("hidden");
      img.removeAttribute("src");
    };

    const exts = ["jpg", "jpeg", "png", "webp", "JPG", "JPEG", "PNG"];

    for (let i = 1; i <= PHOTO_COUNT; i += 1) {
      const id = String(i).padStart(2, "0");
      const card = document.createElement("article");
      card.className = "photo-card";
      card.innerHTML = `
        <div class="photo-slot">
          <span><b>${id}.jpg</b>等一张照片</span>
        </div>
        <span class="photo-tag">${id}</span>
      `;

      const photo = new Image();
      let extIndex = 0;
      photo.alt = `照片 ${i}`;
      photo.addEventListener("error", () => {
        extIndex += 1;
        if (extIndex < exts.length) photo.src = `photos/${id}.${exts[extIndex]}`;
      });
      photo.addEventListener("load", () => {
        card.classList.add("has-photo");
        card.innerHTML = "";
        card.appendChild(photo);
        const tag = document.createElement("span");
        tag.className = "photo-tag";
        tag.textContent = id;
        card.appendChild(tag);
        const item = { src: photo.src, label: `照片 ${id}` };
        loadedPhotos.push(item);
        card.addEventListener("click", () => openAt(loadedPhotos.indexOf(item)));
      });
      photo.src = `photos/${id}.${exts[0]}`;
      wall.appendChild(card);
    }

    $("#lightbox-close").addEventListener("click", closeBox);
    $("#lightbox-prev").addEventListener("click", () => openAt(Number(box.dataset.index) - 1));
    $("#lightbox-next").addEventListener("click", () => openAt(Number(box.dataset.index) + 1));
    box.addEventListener("click", (event) => {
      if (event.target === box) closeBox();
    });
    document.addEventListener("keydown", (event) => {
      if (box.hidden) return;
      if (event.key === "Escape") closeBox();
      if (event.key === "ArrowLeft") openAt(Number(box.dataset.index) - 1);
      if (event.key === "ArrowRight") openAt(Number(box.dataset.index) + 1);
    });
  };

  const setupReveal = () => {
    const targets = $$(".section-title, .panel, .letter, .photo-card");
    targets.forEach((el) => el.classList.add("reveal"));
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("in-view");
        io.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });
    targets.forEach((el) => io.observe(el));
  };

  const spawnAmbientHeart = () => {
    const heart = document.createElement("span");
    const size = 10 + Math.random() * 18;
    heart.textContent = Math.random() > 0.5 ? "❤" : "♡";
    heart.style.cssText = `
      position:absolute;left:${Math.random() * 100}%;bottom:-30px;
      color:rgba(243,182,178,0.55);font-size:${size}px;
      --sway:${(Math.random() * 90 - 45).toFixed(0)}px;
      --a:${(0.25 + Math.random() * 0.35).toFixed(2)};
      animation:floatUp ${9 + Math.random() * 9}s linear forwards;
    `;
    $(".hearts-layer").appendChild(heart);
    setTimeout(() => heart.remove(), 19000);
  };

  const setupEnvelope = () => {
    const stage = $("#envelope-stage");
    const envelope = $("#love-envelope");
    if (!stage || !envelope) return;
    envelope.addEventListener("click", () => {
      if (stage.classList.contains("is-open")) return;
      stage.classList.add("is-open");
      setTimeout(() => stage.classList.add("is-opened"), 560);
    });
  };

  resizeSky();
  drawSky();
  addEventListener("resize", resizeSky);
  setInterval(spawnPetal, 900);
  setInterval(spawnAmbientHeart, 1600);
  updateTimer();
  setInterval(updateTimer, 500);
  setupMusic();
  setupScrollNav();
  setupGallery();
  setupEnvelope();
  setupReveal();
  requestAnimationFrame(() => requestAnimationFrame(initBigClock));
})();
