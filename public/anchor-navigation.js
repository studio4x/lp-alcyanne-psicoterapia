(function () {
  function positionCurrentAnchor() {
    if (!window.location.hash) return;
    var id = decodeURIComponent(window.location.hash.slice(1));
    var target = document.getElementById(id);
    if (target) target.scrollIntoView({ block: "start" });
  }

  window.addEventListener("hashchange", positionCurrentAnchor);
  window.addEventListener("load", function () {
    positionCurrentAnchor();
    window.setTimeout(positionCurrentAnchor, 250);
    window.setTimeout(positionCurrentAnchor, 900);

    if ("ResizeObserver" in window) {
      var observer = new ResizeObserver(positionCurrentAnchor);
      observer.observe(document.body);
      window.setTimeout(function () {
        positionCurrentAnchor();
        observer.disconnect();
      }, 2500);
    }
  });
})();
