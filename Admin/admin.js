$(function () {
  /* ---------- Demo data (replace with your backend / API) ---------- */
  var ADMIN = { email: 'admin@sanjose.gov.ph', password: 'admin123' }; // demo only: real auth must happen on a server

  var stages = [
    { t: 'Submitted',        d: '',                                                   next: 'Start review' },
    { t: 'Under review',     d: 'Resident details are being verified.',               next: 'Approve' },
    { t: 'Approved',         d: 'Approved by barangay personnel.',                    next: 'Mark ready' },
    { t: 'Ready for pickup', d: 'Signed document is ready at the release window.',    next: 'Mark released' },
    { t: 'Released',         d: 'Document released to the resident.',                 next: null }
  ];

  var residents = [
    { id: 1, name: 'Juan Dela Cruz',   precinct: '0142-A', address: '124 Mabini Street',   email: 'juan.delacruz@email.com',  verified: true },
    { id: 2, name: 'Maria Santos',     precinct: '0142-B', address: '58 Rizal Avenue',     email: 'maria.santos@email.com',   verified: true },
    { id: 3, name: 'Pedro Reyes',      precinct: '0143-A', address: '9 Bonifacio Street',  email: 'pedro.reyes@email.com',    verified: false },
    { id: 4, name: 'Ana Villanueva',   precinct: '0143-C', address: '77 Luna Street',      email: 'ana.villanueva@email.com', verified: true },
    { id: 5, name: 'Jose Ramirez',     precinct: '0144-A', address: '302 Mabini Street',   email: 'jose.ramirez@email.com',   verified: false },
    { id: 6, name: 'Liza Fernandez',   precinct: '0144-B', address: '15 Aguinaldo Road',   email: 'liza.fernandez@email.com', verified: true },
    { id: 7, name: 'Carlo Mendoza',    precinct: '0145-A', address: '44 Del Pilar Street', email: 'carlo.mendoza@email.com',  verified: true },
    { id: 8, name: 'Grace Bautista',   precinct: '0145-C', address: '210 Quezon Avenue',   email: 'grace.bautista@email.com', verified: false }
  ];

  var requests = [
    { id: 'LL-2026-10482', rid: 1, service: 'Barangay Clearance',          purpose: 'Government ID application', date: '2026-06-18T09:42', stage: 2 },
    { id: 'LL-2026-10479', rid: 2, service: 'Certificate of Residency',    purpose: 'School or scholarship',     date: '2026-06-18T08:15', stage: 1 },
    { id: 'LL-2026-10470', rid: 4, service: 'Certificate of Indigency',    purpose: 'Medical assistance',        date: '2026-06-17T15:30', stage: 3 },
    { id: 'LL-2026-10461', rid: 6, service: 'First Time Job Seeker',       purpose: 'Private employment',        date: '2026-06-17T11:05', stage: 4 },
    { id: 'LL-2026-10455', rid: 7, service: 'Business Clearance',          purpose: 'New business permit',       date: '2026-06-16T14:20', stage: 2 },
    { id: 'LL-2026-10440', rid: 3, service: 'Certificate of Cohabitation', purpose: 'Insurance or benefits',     date: '2026-06-16T09:10', stage: 1 },
    { id: 'LL-2026-10311', rid: 5, service: 'Certificate of Residency',    purpose: 'Local employment',          date: '2026-06-12T14:15', stage: 4 },
    { id: 'LL-2026-10205', rid: 8, service: 'Barangay Clearance',          purpose: 'Other legal purpose',       date: '2026-06-08T10:40', stage: 5 },
    { id: 'LL-2026-10090', rid: 1, service: 'Certificate of Indigency',    purpose: 'DSWD assistance',           date: '2026-06-03T10:05', stage: 5 },
    { id: 'LL-2026-10012', rid: 2, service: 'Business Clearance',          purpose: 'Business renewal',          date: '2026-06-01T13:50', stage: 5 }
  ];

  var serviceNames = ['Barangay Clearance', 'Certificate of Residency', 'Certificate of Indigency',
                      'First Time Job Seeker', 'Certificate of Cohabitation', 'Business Clearance'];

  /* ---------- Helpers ---------- */
  function esc(v) { return $('<div>').text(v).html(); }
  function resident(id) { return $.grep(residents, function (r) { return r.id === id; })[0]; }
  function request(id) { return $.grep(requests, function (r) { return r.id === id; })[0]; }
  function fmt(iso) {
    var d = new Date(iso);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) + ' · ' +
           d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  }
  function chip(stage) {
    var cls = stage >= 4 ? ' ok' : (stage === 3 ? ' info' : '');
    return '<span class="chip' + cls + '">' + stages[stage - 1].t + '</span>';
  }
  var toastTimer;
  function toast(msg) {
    var $t = $('#toast').text(msg).addClass('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { $t.removeClass('show'); }, 2400);
  }

  /* ---------- Sign in / out ---------- */
  function showApp(on) {
    $('#adLogin').prop('hidden', on);
    $('#adApp').prop('hidden', !on);
    if (on) renderAll();
  }
  try { if (sessionStorage.getItem('lokalink_admin') === '1') showApp(true); } catch (e) {}

  $('#adLoginForm').on('submit', function (e) {
    e.preventDefault();
    var email = $.trim($('#adEmail').val()).toLowerCase(), pass = $('#adPass').val();
    if (!/^\S+@\S+\.\S+$/.test(email)) return $('#adErr').text('Enter a valid email address.');
    if (!pass) return $('#adErr').text('Enter your password.');
    if (email !== ADMIN.email || pass !== ADMIN.password) return $('#adErr').text('Incorrect email or password.');
    $('#adErr').text('');
    try { sessionStorage.setItem('lokalink_admin', '1'); } catch (err) {}
    this.reset();
    showApp(true);
  });
  $('.ad-logout').on('click', function () {
    try { sessionStorage.removeItem('lokalink_admin'); } catch (e) {}
    closeOvl();
    setView('dashboard');
    showApp(false);
    toast('You have been logged out.');
  });

  /* ---------- Views ---------- */
  var titles = {
    dashboard: ['Dashboard', 'Overview of resident requests and activity.'],
    requests:  ['Requests', 'Review requests and move them through each step.'],
    residents: ['Residents', 'Registered residents and their verification status.']
  };
  function setView(v) {
    $('.ad-nav button').removeClass('on').filter('[data-view="' + v + '"]').addClass('on');
    $('.ad-view').removeClass('on');
    $('#view-' + v).addClass('on');
    $('#adTitle').text(titles[v][0]);
    $('#adSub').text(titles[v][1]);
    $('html, body').scrollTop(0);
  }
  $('.ad-nav button').on('click', function () { setView($(this).data('view')); });
  $(document).on('click', '[data-goto]', function () { setView($(this).data('goto')); });
  $('#adDate').text(new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }));

  /* ---------- Render ---------- */
  function renderStats() {
    var pending = $.grep(requests, function (r) { return r.stage <= 2; }).length;
    var ready = $.grep(requests, function (r) { return r.stage === 4; }).length;
    var released = $.grep(requests, function (r) { return r.stage === 5; }).length;
    var cards = [
      { l: 'Total requests',   n: requests.length, cls: 'c-green',  i: '<path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5"/>' },
      { l: 'Pending review',   n: pending,         cls: 'c-yellow', i: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>' },
      { l: 'Ready for pickup', n: ready,           cls: 'c-teal',   i: '<path d="M21 8 12 3 3 8v8l9 5 9-5z"/><path d="m3 8 9 5 9-5M12 13v8"/>' },
      { l: 'Released',         n: released,        cls: 'c-lime',   i: '<path d="m5 12 5 5L20 7"/>' }
    ];
    var html = '';
    $.each(cards, function (_, c) {
      html += '<div class="ad-stat"><div><small>' + c.l + '</small><strong>' + c.n + '</strong></div>' +
              '<span class="ico ' + c.cls + '"><svg viewBox="0 0 24 24">' + c.i + '</svg></span></div>';
    });
    $('#adStats').html(html);
  }

  function sorted() {
    return requests.slice().sort(function (a, b) { return new Date(b.date) - new Date(a.date); });
  }

  function renderRecent() {
    var html = '';
    $.each(sorted().slice(0, 5), function (_, r) {
      html += '<tr><td class="ref">' + r.id + '</td><td>' + esc(resident(r.rid).name) + '</td><td class="muted">' +
              esc(r.service) + '</td><td>' + chip(r.stage) + '</td></tr>';
    });
    $('#adRecent').html(html);
  }

  function renderBars() {
    var max = 1, counts = {}, html = '';
    $.each(serviceNames, function (_, n) { counts[n] = 0; });
    $.each(requests, function (_, r) { counts[r.service]++; });
    $.each(counts, function (_, c) { if (c > max) max = c; });
    $.each(serviceNames, function (_, n) {
      html += '<div class="ad-bar-row"><div><span>' + n + '</span><span>' + counts[n] + '</span></div>' +
              '<div class="ad-track"><i style="width:' + (counts[n] / max * 100) + '%"></i></div></div>';
    });
    $('#adBars').html(html);
  }

  function renderRequests() {
    var q = $.trim($('#rqSearch').val()).toLowerCase(), st = $('#rqStatus').val(), html = '';
    $.each(sorted(), function (_, r) {
      var res = resident(r.rid);
      if (st && String(r.stage) !== st) return;
      if (q && (r.id + ' ' + res.name).toLowerCase().indexOf(q) === -1) return;
      var next = stages[r.stage - 1].next;
      html += '<tr><td class="ref">' + r.id + '</td><td>' + esc(res.name) + '</td><td class="muted">' + esc(r.service) +
              '</td><td class="muted">' + fmt(r.date) + '</td><td>' + chip(r.stage) + '</td><td class="act">' +
              '<button class="ad-btn ghost" data-view-req="' + r.id + '">View</button> ' +
              '<button class="ad-btn" data-advance="' + r.id + '"' + (next ? '' : ' disabled') + '>' + (next || 'Completed') + '</button></td></tr>';
    });
    $('#adRequests').html(html || '<tr><td colspan="6" class="ad-empty">No requests match your search.</td></tr>');
  }

  function renderResidents() {
    var q = $.trim($('#rsSearch').val()).toLowerCase(), html = '';
    $.each(residents, function (_, r) {
      if (q && (r.name + ' ' + r.precinct + ' ' + r.email).toLowerCase().indexOf(q) === -1) return;
      html += '<tr><td><b>' + esc(r.name) + '</b></td><td>' + esc(r.precinct) + '</td><td class="muted">' + esc(r.address) +
              '</td><td class="muted">' + esc(r.email) + '</td><td><span class="chip' + (r.verified ? ' ok' : '') + '">' +
              (r.verified ? 'Verified' : 'Pending') + '</span></td><td class="act">' +
              (r.verified ? '' : '<button class="ad-btn" data-verify="' + r.id + '">Verify</button>') + '</td></tr>';
    });
    $('#adResidents').html(html || '<tr><td colspan="6" class="ad-empty">No residents match your search.</td></tr>');
  }

  function renderBanner() {
    var pending = $.grep(requests, function (r) { return r.stage <= 2; }).length;
    $('#adBanner').html(
      '<div><span class="pill">WELCOME BACK</span><h2>' +
      (pending ? pending + ' request' + (pending > 1 ? 's' : '') + ' waiting for your review.' : 'You are all caught up.') +
      '</h2><p>Keep every resident request moving, from submission to release.</p></div>' +
      '<button class="ad-btn" data-goto="requests">Review requests</button>'
    );
  }

  function renderAll() {
    var opts = '<option value="">All statuses</option>';
    $.each(stages, function (i, s) { opts += '<option value="' + (i + 1) + '">' + s.t + '</option>'; });
    if (!$('#rqStatus').children().length) $('#rqStatus').html(opts);
    renderBanner(); renderStats(); renderRecent(); renderBars(); renderRequests(); renderResidents();
  }

  $('#rqSearch').on('input', renderRequests);
  $('#rqStatus').on('change', renderRequests);
  $('#rsSearch').on('input', renderResidents);

  /* ---------- Actions ---------- */
  function advance(id) {
    var r = request(id);
    if (!r || r.stage >= 5) return;
    r.stage++;
    toast(r.id + ' → ' + stages[r.stage - 1].t);
    renderAll();
    if ($('#adModal').hasClass('open')) openDetail(id);
  }
  $(document).on('click', '[data-advance]', function () { advance($(this).data('advance')); });
  $(document).on('click', '[data-verify]', function () {
    var r = resident(+$(this).data('verify'));
    r.verified = true;
    toast(r.name + ' is now verified');
    renderResidents();
  });

  /* ---------- Request details popup ---------- */
  function openOvl() { $('#adModal').addClass('open').attr('aria-hidden', 'false'); $('body').css('overflow', 'hidden'); }
  function closeOvl() { $('#adModal').removeClass('open').attr('aria-hidden', 'true'); $('body').css('overflow', ''); }

  function openDetail(id) {
    var r = request(id), res = resident(r.rid);
    var html = '<div class="ad-modal-grid"><div><div class="summary" style="margin-top:0">' +
      '<div><b>Resident</b>' + esc(res.name) + '</div>' +
      '<div><b>Precinct</b>' + esc(res.precinct) + '</div>' +
      '<div><b>Address</b>' + esc(res.address) + '</div>' +
      '<div><b>Service</b>' + esc(r.service) + '</div>' +
      '<div><b>Purpose</b>' + esc(r.purpose) + '</div>' +
      '<div><b>Fee</b>FREE</div>' +
      '<div><b>Status</b>' + chip(r.stage) + '</div></div></div><div class="tl">';
    $.each(stages, function (i, s) {
      var n = i + 1, cls = n < r.stage ? 'done' : (n === r.stage ? 'cur' : 'pend');
      var desc = n === 1 ? 'Received on ' + fmt(r.date) : (n <= r.stage ? s.d : 'Waiting for the previous step.');
      html += '<div class="tl-i ' + cls + '"><div class="dot">' +
        (cls === 'done' ? '<svg viewBox="0 0 24 24"><path d="m5 12 5 5L20 7"/></svg>' : n) +
        '</div><div><h5>' + s.t + '</h5><p>' + esc(desc) + '</p></div></div>';
    });
    var next = stages[r.stage - 1].next;
    html += '</div></div><div class="ad-detail-foot"><button class="ad-btn ghost" id="adClose">Close</button>' +
            '<button class="ad-btn" data-advance="' + r.id + '"' + (next ? '' : ' disabled') + '>' + (next || 'Completed') + '</button></div>';
    $('#adMRef').text(r.id);
    $('#adMTitle').text(r.service);
    $('#adMBody').html(html);
    openOvl();
  }
  $(document).on('click', '[data-view-req]', function () { openDetail($(this).data('view-req')); });
  $(document).on('click', '#adClose, .ovl-close', closeOvl);
  $('#adModal').on('mousedown', function (e) { if (e.target === this) closeOvl(); });
  $(document).on('keydown', function (e) { if (e.key === 'Escape') closeOvl(); });
});
