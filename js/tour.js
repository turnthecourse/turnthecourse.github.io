// ── Bandsintown Events ─────────────────────────────────────────────────────
// Artist name as registered on Bandsintown (URL-encoded automatically below)
var BIT_ARTIST = 'Turn The Course'
var BIT_APP_ID = '036c2a5a1a80d59020c4125651b4a54e'

var BIT_BASE = 'https://rest.bandsintown.com/artists/'

// Locale used for date formatting
var LOCALE = 'de-DE'

// ── Helpers ────────────────────────────────────────────────────────────────
function formatDate(dateStr) {
  // Bandsintown returns ISO-8601: "2025-09-27T19:00:00"
  var d = new Date(dateStr)
  if (isNaN(d)) return dateStr
  return d.toLocaleDateString(LOCALE, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })
}

function formatTime(dateStr) {
  var d = new Date(dateStr)
  if (isNaN(d)) return ''
  var h = d.getHours()
  var m = d.getMinutes()
  if (h === 0 && m === 0) return '' // midnight = no time set
  return d.toLocaleTimeString(LOCALE, { hour: '2-digit', minute: '2-digit' })
}

function locationText(venue) {
  var parts = []
  if (venue.city) parts.push(venue.city)
  if (venue.region) parts.push(venue.region)
  if (venue.country && venue.country !== 'Germany') parts.push('(' + venue.country + ')')
  return parts.join(', ')
}

// ── Row builders ───────────────────────────────────────────────────────────
function buildUpcomingRow(ev) {
  var tr = document.createElement('tr')

  // Date cell
  var tdDate = document.createElement('td')
  tdDate.className = 'bit-col-date'
  var dateText = formatDate(ev.datetime)
  var timeText = formatTime(ev.datetime)
  tdDate.innerHTML =
    '<span class="bit-date-day">' +
    dateText +
    '</span>' +
    (timeText ? '<span class="bit-date-time">' + timeText + '</span>' : '')
  tr.appendChild(tdDate)

  // Venue cell
  var tdVenue = document.createElement('td')
  tdVenue.className = 'bit-col-venue'
  tdVenue.textContent = ev.venue ? ev.venue.name : ''
  tr.appendChild(tdVenue)

  // Location cell
  var tdLoc = document.createElement('td')
  tdLoc.className = 'bit-col-location'
  tdLoc.textContent = ev.venue ? locationText(ev.venue) : ''
  tr.appendChild(tdLoc)

  // Actions cell
  var tdActions = document.createElement('td')
  tdActions.className = 'bit-col-actions'

  // Ticket links (only show if offers array has actual ticket/streaming links)
  var hasTickets =
    ev.offers &&
    ev.offers.some(function (o) {
      return o.type === 'Tickets' && o.url
    })

  if (hasTickets) {
    ev.offers.forEach(function (offer) {
      if (offer.type === 'Tickets' && offer.url) {
        var a = document.createElement('a')
        a.href = offer.url
        a.target = '_blank'
        a.rel = 'noopener noreferrer'
        a.className = 'bit-btn bit-btn--tickets'
        a.textContent = 'TICKETS'
        tdActions.appendChild(a)
      }
    })
  } else {
    // Show RSVP / Notify Me via Bandsintown
    var rsvpUrlObj = new URL(ev.url)
    rsvpUrlObj.searchParams.set('trigger', 'rsvp_going')
    var rsvpUrl = rsvpUrlObj.toString()
    var a = document.createElement('a')
    a.href = rsvpUrl
    a.target = '_blank'
    a.rel = 'noopener noreferrer'
    a.className = 'bit-btn bit-btn--rsvp'
    a.textContent = 'RSVP'
    tdActions.appendChild(a)
  }

  tr.appendChild(tdActions)
  return tr
}

function buildPastRow(ev) {
  var tr = document.createElement('tr')
  tr.className = 'bit-row--past'

  var tdDate = document.createElement('td')
  tdDate.className = 'bit-col-date'
  tdDate.textContent = formatDate(ev.datetime)
  tr.appendChild(tdDate)

  var tdVenue = document.createElement('td')
  tdVenue.className = 'bit-col-venue'
  tdVenue.textContent = ev.venue ? ev.venue.name : ''
  tr.appendChild(tdVenue)

  var tdLoc = document.createElement('td')
  tdLoc.className = 'bit-col-location'
  tdLoc.textContent = ev.venue ? locationText(ev.venue) : ''
  tr.appendChild(tdLoc)

  return tr
}

// ── Render functions ───────────────────────────────────────────────────────
function renderUpcoming(events) {
  var loading = document.getElementById('bit-upcoming-loading')
  var none = document.getElementById('bit-upcoming-none')
  var table = document.getElementById('bit-upcoming-table')
  var tbody = document.getElementById('bit-upcoming-body')

  if (!loading || !none || !table || !tbody) return

  loading.style.display = 'none'

  if (!events || events.length === 0) {
    none.style.display = 'block'
    return
  }

  // Sort ascending
  events.sort(function (a, b) {
    return new Date(a.datetime) - new Date(b.datetime)
  })

  events.forEach(function (ev) {
    tbody.appendChild(buildUpcomingRow(ev))
  })

  table.style.display = 'table'
}

function renderPast(events) {
  var loading = document.getElementById('bit-past-loading')
  var none = document.getElementById('bit-past-none')
  var table = document.getElementById('bit-past-table')
  var tbody = document.getElementById('bit-past-body')

  if (!loading || !none || !table || !tbody) return

  loading.style.display = 'none'

  if (!events || events.length === 0) {
    none.style.display = 'block'
    return
  }

  // Sort descending (most recent first)
  events.sort(function (a, b) {
    return new Date(b.datetime) - new Date(a.datetime)
  })

  events.forEach(function (ev) {
    tbody.appendChild(buildPastRow(ev))
  })

  table.style.display = 'table'
}

function showError(section) {
  var loading = document.getElementById('bit-' + section + '-loading')
  var error = document.getElementById('bit-' + section + '-error')
  if (!loading || !error) return
  loading.style.display = 'none'
  error.style.display = 'block'
}

// ── Fetch from Bandsintown ─────────────────────────────────────────────────
function loadEvents() {
  var encodedArtist = encodeURIComponent(BIT_ARTIST)
  var baseUrl = BIT_BASE + encodedArtist + '/events?app_id=' + BIT_APP_ID

  // --- Upcoming ---
  fetch(baseUrl + '&date=upcoming')
    .then(function (res) {
      if (!res.ok) throw new Error('HTTP ' + res.status)
      return res.json()
    })
    .then(function (data) {
      // BIT returns { warn: "..." } when artist not found
      if (!Array.isArray(data)) {
        renderUpcoming([])
        return
      }
      renderUpcoming(data)
    })
    .catch(function () {
      showError('upcoming')
    })

  // --- Past ---
  fetch(baseUrl + '&date=past')
    .then(function (res) {
      if (!res.ok) throw new Error('HTTP ' + res.status)
      return res.json()
    })
    .then(function (data) {
      if (!Array.isArray(data)) {
        renderPast([])
        return
      }
      renderPast(data)
    })
    .catch(function () {
      showError('past')
    })
}

document.addEventListener('DOMContentLoaded', loadEvents)
