(function () {
  "use strict";

  var GROUPS = [
    {
      label: "Site",
      items: [
        { href: "/", label: "Homepage", id: "home" },
        { href: "/projects/", label: "All projects", id: "hub" }
      ]
    },
    {
      label: "Survey",
      items: [
        { href: "/projects/Awesome-LCLM/", label: "Awesome-LCLM", id: "awesome-lclm" }
      ]
    },
    {
      label: "Projects",
      items: [
        { href: "/projects/ResAdapt/", label: "ResAdapt", id: "resadapt" },
        { href: "/projects/IAG/", label: "IAG", id: "iag" },
        { href: "/projects/TAGI/", label: "TAGI", id: "tagi" },
        { href: "https://quantaalpha.com/Distill-Yourself/", label: "Distill Yourself", id: "distill-yourself" }
      ]
    },
    {
      label: "Collaborations",
      items: [
        { href: "https://trae1oung.github.io/DyPRAG/", label: "DyPRAG", id: "dyprag" },
        { href: "https://wengsyx.github.io/LMTuner/", label: "LMTuner", id: "lmtuner" }
      ]
    }
  ];

  function goToProject(select) {
    var url = select && select.value;
    if (url) window.location.href = url;
  }

  function fillSelect(select) {
    var current = (select.getAttribute("data-current") || "").toLowerCase();
    select.innerHTML = "";

    var placeholder = document.createElement("option");
    placeholder.value = "";
    placeholder.disabled = true;
    placeholder.textContent = "Navigate";
    select.appendChild(placeholder);

    GROUPS.forEach(function (group) {
      var og = document.createElement("optgroup");
      og.label = group.label;
      group.items.forEach(function (item) {
        var opt = document.createElement("option");
        opt.value = item.href;
        opt.textContent = item.label;
        if (item.id === current) opt.selected = true;
        og.appendChild(opt);
      });
      select.appendChild(og);
    });

    select.addEventListener("change", function () {
      goToProject(select);
    });
  }

  document.querySelectorAll("select.project-select").forEach(fillSelect);

  function copyText(text, btn) {
    var original = btn.getAttribute("data-label") || btn.innerHTML;
    btn.setAttribute("data-label", original);
    function ok() {
      btn.innerHTML = '<i class="fas fa-check"></i> Copied!';
      window.setTimeout(function () {
        btn.innerHTML = original;
      }, 2000);
    }
    function fallback() {
      var ta = document.createElement("textarea");
      ta.value = text;
      ta.setAttribute("readonly", "");
      ta.style.position = "fixed";
      ta.style.left = "-9999px";
      document.body.appendChild(ta);
      ta.select();
      try {
        if (document.execCommand("copy")) ok();
      } catch (err) { /* ignore */ }
      document.body.removeChild(ta);
    }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(ok).catch(fallback);
    } else {
      fallback();
    }
  }

  document.querySelectorAll(".copy-btn").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var card = btn.closest(".bibtex-card") || btn.parentElement;
      var code = card && card.querySelector("pre");
      var text = code ? code.textContent.trim() : "";
      if (text) copyText(text, btn);
    });
  });

  var reveals = document.querySelectorAll(".reveal");
  if (reveals.length) {
    var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      reveals.forEach(function (el) {
        el.classList.add("active");
      });
    } else {
      var observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("active");
            observer.unobserve(entry.target);
          }
        });
      }, { threshold: 0.1, rootMargin: "0px 0px -50px 0px" });
      reveals.forEach(function (el) {
        observer.observe(el);
      });
    }
  }
})();
