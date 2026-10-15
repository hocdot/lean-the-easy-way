// Lean for All: the Auto / Light / Dark switch on Verso's pages. The choice is saved under the
// same key as the React site's, so both remember it. 'auto' follows the system setting.
(function () {
  var KEY = 'theme'
  function get() {
    try { var t = localStorage.getItem(KEY); return t === 'light' || t === 'dark' ? t : 'auto' } catch (e) { return 'auto' }
  }
  function apply(t) {
    if (t === 'auto') document.documentElement.removeAttribute('data-theme')
    else document.documentElement.setAttribute('data-theme', t)
  }
  apply(get())
  function addSwitch() {
    var header = document.querySelector('header')
    if (!header || header.querySelector('.lfa-theme')) return
    var box = document.createElement('div')
    box.className = 'lfa-theme'
    box.setAttribute('role', 'radiogroup')
    box.setAttribute('aria-label', 'Theme')
    ;[['auto', 'Auto', 'Follow the system setting'], ['light', 'Light', 'Always light'], ['dark', 'Dark', 'Always dark']].forEach(function (o) {
      var b = document.createElement('button')
      b.type = 'button'
      b.textContent = o[1]
      b.title = o[2]
      b.setAttribute('role', 'radio')
      b.onclick = function () {
        try { localStorage.setItem(KEY, o[0]) } catch (e) {}
        apply(o[0])
        render()
      }
      b.dataset.value = o[0]
      box.appendChild(b)
    })
    function render() {
      var t = get()
      box.querySelectorAll('button').forEach(function (b) {
        b.classList.toggle('on', b.dataset.value === t)
        b.setAttribute('aria-checked', b.dataset.value === t ? 'true' : 'false')
      })
    }
    render()
    // "Source code" and "Suggest an idea" next to it, as on the React site. Their addresses come
    // from Verso's links at the foot of the table of contents (sourceLink and issueLink in
    // SiteMain.lean), which stay there for phones, where the header has no room.
    var top = document.createElement('div')
    top.className = 'lfa-top'
    var links = document.querySelectorAll('#meta-links a')
    ;[['Source code', 0], ['Suggest an idea', 1]].forEach(function (o) {
      var src = links[o[1]]
      if (!src) return
      src.textContent = o[0]
      var a = document.createElement('a')
      a.className = 'lfa-top-link'
      a.href = src.href
      a.target = '_blank'
      a.rel = 'noopener noreferrer'
      a.textContent = o[0]
      top.appendChild(a)
    })
    top.appendChild(box)
    // Verso's search box (added by its own script, at the header's right end) says what it searches
    function namePlaceholder() {
      var input = document.querySelector('#search-wrapper [role=searchbox]')
      if (input) input.setAttribute('placeholder', 'Search the course')
      return !!input
    }
    if (!namePlaceholder()) {
      var watch = new MutationObserver(function () { if (namePlaceholder()) watch.disconnect() })
      watch.observe(header, { childList: true, subtree: true })
    }
    // before the search box, if there is one
    var search = header.querySelector('.search-wrapper, #search-wrapper, input[type=search], .search')
    var anchor = search && search.closest('header > *')
    if (anchor) header.insertBefore(top, anchor)
    else header.appendChild(top)
  }
  // "Lean the easy way" under the site name, exactly as wide as it (measured once the fonts are
  // in, since the width depends on the font), and the logo as tall as the two lines together
  function fit(title, sub) {
    var r = document.createRange()
    r.selectNodeContents(title)
    var want = r.getBoundingClientRect().width
    sub.style.fontSize = ''
    // the serif's letter shapes change a little with size (optical sizes), so refine a few times
    for (var i = 0; i < 4; i++) {
      r.selectNodeContents(sub)
      var have = r.getBoundingClientRect().width
      if (!want || !have || Math.abs(want - have) < 0.3) break
      sub.style.fontSize = (parseFloat(getComputedStyle(sub).fontSize) * want / have) + 'px'
    }
  }
  window.lfaFit = fit
  function addSubtitle() {
    var h1 = document.querySelector('.header-title h1')
    if (!h1 || h1.querySelector('.lfa-sub')) return
    var title = document.createElement('span')
    title.className = 'lfa-title'
    title.textContent = h1.textContent.trim()
    var sub = document.createElement('span')
    sub.className = 'lfa-sub'
    sub.textContent = 'Lean the easy way'
    h1.replaceChildren(title, sub)
    function size() {
      fit(title, sub)
      var h = h1.getBoundingClientRect().height
      if (h) document.documentElement.style.setProperty('--lfa-logo', h + 'px')
    }
    size()
    if (document.fonts) document.fonts.ready.then(size)
  }
  function start() { addSwitch(); addSubtitle() }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start)
  else start()
})()
