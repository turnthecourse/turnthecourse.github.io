// Inject shared partials then initialise scripts that depend on them
document.addEventListener('DOMContentLoaded', function () {
  var navbarDone = false
  var footerDone = false

  function onPartialsReady() {
    if (!navbarDone || !footerDone) return
    // Bind scroll handler only after navbar is in the DOM
    window.onscroll = function () {
      myFunction()
    }
  }

  fetch('partials/navbar.html')
    .then(function (res) {
      if (!res.ok) throw new Error('navbar partial returned ' + res.status)
      return res.text()
    })
    .then(function (html) {
      document.getElementById('navbar-placeholder').innerHTML = html
      navbarDone = true
      onPartialsReady()
    })
    .catch(function (err) {
      console.error('Could not load navbar:', err)
      navbarDone = true
      onPartialsReady()
    })

  fetch('partials/footer.html')
    .then(function (res) {
      if (!res.ok) throw new Error('footer partial returned ' + res.status)
      return res.text()
    })
    .then(function (html) {
      document.getElementById('footer-placeholder').innerHTML = html
      footerDone = true
      onPartialsReady()
    })
    .catch(function (err) {
      console.error('Could not load footer:', err)
      footerDone = true
      onPartialsReady()
    })
})

// Modal Image Gallery
function onClick(element) {
  document.getElementById('img01').src = element.src
  document.getElementById('modal01').style.display = 'block'
  var captionText = document.getElementById('caption')
  captionText.innerHTML = element.alt
}

// Change style of navbar on scroll
function myFunction() {
  var navbar = document.getElementById('myNavbar')
  if (
    document.body.scrollTop > 100 ||
    document.documentElement.scrollTop > 100
  ) {
    navbar.className = 'w3-bar' + ' w3-card' + ' w3-animate-top' + ' w3-white'
  } else {
    navbar.className = navbar.className.replace(
      ' w3-card w3-animate-top w3-white',
      ''
    )
  }
}

// Used to toggle the menu on small screens when clicking on the menu button
function toggleFunction() {
  var x = document.getElementById('navDemo')
  if (x.className.indexOf('w3-show') == -1) {
    x.className += ' w3-show'
  } else {
    x.className = x.className.replace(' w3-show', '')
  }
}
