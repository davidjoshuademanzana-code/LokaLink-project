$(function () {
  var arrow = '<svg viewBox="0 0 24 24"><path d="M5 12h14M13 6l6 6-6 6"/></svg>';

  var services = [
    { title: 'Barangay Clearance', desc: 'For employment, IDs, banking, and legal transactions.', cls: 'c-green',
      icon: '<path d="M12 3 4 6v6c0 5 3.4 8 8 9 4.6-1 8-4 8-9V6z"/><path d="m9 12 2 2 4-4"/>' },
    { title: 'Certificate of Residency', desc: 'Official proof of residence and good moral character.', cls: 'c-lime',
      icon: '<path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1z"/><path d="M9 21v-6h6v6"/>' },
    { title: 'Certificate of Indigency', desc: 'For medical, DSWD, scholarship, and legal assistance.', cls: 'c-yellow',
      icon: '<path d="M12 21s-8-4.9-8-11a4.5 4.5 0 0 1 8-2.8A4.5 4.5 0 0 1 20 10c0 6.100-8 11-8 11z"/>' },
    { title: 'First Time Job Seeker', desc: 'RA 11261 certificate for first-time employment.', cls: 'c-orange',
      icon: '<rect x="3" y="7" width="18" height="13" rx="2"/><path d="M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2M3 13h18"/>' },
    { title: 'Certificate of Cohabitation', desc: 'Katibayan ng pagsasama for cohabiting partners.', cls: 'c-teal',
      icon: '<circle cx="9" cy="8" r="3.5"/><path d="M2 21c0-3.600 3.100-6 7-6s7 2.400 7 6"/><path d="M16 4.500a3.500 3.500 0 0 1 0 7M18 15c2.400.800 4 2.600 4 6"/>' },
    { title: 'Business Clearance', desc: 'Barangay clearance for new or renewing businesses.', cls: 'c-green',
      icon: '<path d="M4 9 5.500 4h13L20 9z"/><path d="M5 9v11h14V9"/><path d="M10 20v-5h4v5"/>' }
  ];

  var steps = [
    { t: 'Register an account', d: 'Create your verified resident profile using your address and precinct details.' },
    { t: 'Choose & submit', d: 'Select a service, complete your details, and attach the requirements.' },
    { t: 'We verify', d: 'Barangay personnel review your profile, precinct, and submitted details.' },
    { t: 'Pick it up', d: 'Get notified when your signed document is ready at the release window.' }
  ];

  // Render service cards
  $.each(services, function (i, s) {
    var n = ('0' + (i + 1)).slice(-2);
    $('#serviceGrid').append(
      '<article class="card" data-id="' + i + '" data-title="' + s.title + '">' +
        '<span class="num">' + n + '</span>' +
        '<div class="ico ' + s.cls + '"><svg viewBox="0 0 24 24">' + s.icon + '</svg></div>' +
        '<h3>' + s.title + '</h3><p>' + s.desc + '</p>' +
        '<div class="foot"><a href="#" class="apply">Apply ' + arrow + '</a></div>' +
      '</article>'
    );
  });

  // Render steps
  $.each(steps, function (i, s) {
    $('#steps').append(
      '<div class="step"><div class="n">0' + (i + 1) + '</div><h4>' + s.t + '</h4><span>' + s.d + '</span></div>'
    );
  });

  // Toast helper
  var toastTimer;
  function toast(msg) {
    var $t = $('#toast').text(msg).addClass('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { $t.removeClass('show'); }, 2400);
  }

  /* ---------- Request modal (3 steps, all 6 services) ---------- */
  // Same order as the `services` array above
  var meta = [
    { extra: null,
      purposes: ['Local employment', 'Government ID application', 'School or scholarship', 'Medical assistance', 'Other legal purpose'] },
    { extra: null,
      purposes: ['Local employment', 'Government ID application', 'School or scholarship', 'Bank or financial transaction', 'Other legal purpose'] },
    { extra: null,
      purposes: ['Medical assistance', 'DSWD assistance', 'Scholarship application', 'Legal assistance', 'Other legal purpose'] },
    { extra: null,
      purposes: ['Private employment', 'Government employment', 'Government ID application', 'Other (first-time employment)'] },
    { extra: { label: "Partner's full name", placeholder: 'Enter your partner\'s full name' },
      purposes: ['Insurance or benefits', 'School requirement', 'Visa or travel', 'Other legal purpose'] },
    { extra: { label: 'Business name', placeholder: 'Enter your business name' },
      purposes: ['New business permit', 'Business renewal', 'Change of business address', 'Other legal purpose'] }
  ];
  var profile = { name: 'Juan Dela Cruz', precinct: '0142-A', address: '124 Mabini Street, Barangay San Jose' };
  var st = null;

  function esc(v) { return $('<div>').text(v).html(); }

  function openModal(i) {
    st = { step: 1, sel: i, purpose: '', extra: '', agree: false, done: false };
    render();
    $('#modal').addClass('open').attr('aria-hidden', 'false');
    $('body').css('overflow', 'hidden');
  }
  function closeModal() {
    $('#modal').removeClass('open').attr('aria-hidden', 'true');
    $('body').css('overflow', '');
  }

  function canContinue() {
    var m = meta[st.sel];
    if (st.step === 1) return st.sel !== null;
    if (st.step === 2) return !!st.purpose && (!m.extra || $.trim(st.extra) !== '');
    return st.agree;
  }
  function refreshNext() { $('#mNext').prop('disabled', !canContinue()); }

  function render() {
    var m = meta[st.sel], s = services[st.sel], html = '';

    $('#mStep').text(st.done ? 'SUBMITTED' : 'STEP ' + st.step + ' OF 3');
    $('#mProg i').each(function (k) { $(this).toggleClass('on', st.done || k < st.step); });
    $('#mFoot').toggle(!st.done);
    $('#mBack').text(st.step === 1 ? 'Cancel' : 'Back');
    $('#mNext').html((st.step === 3 ? 'Submit request ' : 'Continue ') + arrow);

    if (st.done) {
      html = '<div class="done"><div class="tick"><svg viewBox="0 0 24 24"><path d="m5 12 5 5L20 7"/></svg></div>' +
        '<h4>Request submitted</h4>' +
        '<p>Your request for <b>' + esc(s.title) + '</b> is now with barangay personnel. You can follow its progress with the reference number below.</p>' +
        '<div class="ref">' + st.ref + '</div><br>' +
        '<button class="m-next" id="mTrack" style="margin:26px auto 0">Track my request ' + arrow + '</button></div>';
    } else if (st.step === 1) {
      html = '<h4>Choose a service</h4><p class="sub">All listed barangay documents are free of charge.</p><div class="opts">';
      $.each(services, function (i, sv) {
        html += '<button class="opt' + (i === st.sel ? ' sel' : '') + '" data-i="' + i + '">' +
          '<span class="ico ' + sv.cls + '"><svg viewBox="0 0 24 24">' + sv.icon + '</svg></span>' + sv.title + '</button>';
      });
      html += '</div>';
    } else if (st.step === 2) {
      html = '<h4>Resident &amp; request details</h4><p class="sub">Review your verified profile and tell us what the document is for.</p>' +
        '<div class="row2"><div class="field"><label>Full name</label><input readonly value="' + esc(profile.name) + '"></div>' +
        '<div class="field"><label>Precinct number</label><input readonly value="' + esc(profile.precinct) + '"></div></div>' +
        '<div class="field"><label>Residential address</label><input readonly value="' + esc(profile.address) + '"></div>';
      if (m.extra) {
        html += '<div class="field"><label>' + m.extra.label + '</label><input id="fExtra" placeholder="' + esc(m.extra.placeholder) + '" value="' + esc(st.extra) + '"></div>';
      }
      html += '<div class="field"><label>Purpose of request</label><select id="fPurpose"><option value="">Select a purpose</option>';
      $.each(m.purposes, function (_, p) {
        html += '<option' + (p === st.purpose ? ' selected' : '') + '>' + p + '</option>';
      });
      html += '</select></div>';
    } else {
      html = '<h4>Review your request</h4><p class="sub">Please confirm that these details are correct before submitting.</p><div class="summary">' +
        '<div><b>Document</b>' + esc(s.title) + '</div>' +
        '<div><b>Resident</b>' + esc(profile.name) + '</div>' +
        '<div><b>Precinct</b>' + esc(profile.precinct) + '</div>' +
        '<div><b>Address</b>' + esc(profile.address) + '</div>' +
        (m.extra ? '<div><b>' + m.extra.label.replace("'s full name", '') + '</b>' + esc(st.extra) + '</div>' : '') +
        '<div><b>Purpose</b>' + esc(st.purpose) + '</div>' +
        '<div><b>Fee</b>FREE</div></div>' +
        '<label class="agree"><input type="checkbox" id="fAgree"' + (st.agree ? ' checked' : '') + '> I confirm that the information above is true and may be verified against barangay records.</label>';
    }
    $('#mBody').html(html).scrollTop(0);
    refreshNext();
  }

  // Open from cards, Apply links and the hero button
  $('#serviceGrid').on('click', '.card', function (e) {
    e.preventDefault();
    openModal(+$(this).data('id'));
  });
  $('.open-modal').on('click', function (e) { e.preventDefault(); openModal(0); });

  // Step 1: pick a service
  $('#mBody').on('click', '.opt', function () {
    var i = +$(this).data('i');
    if (i !== st.sel) { st.sel = i; st.purpose = ''; st.extra = ''; }
    $('.opt').removeClass('sel'); $(this).addClass('sel');
    refreshNext();
  });
  // Step 2 / 3 inputs
  $('#mBody').on('change', '#fPurpose', function () { st.purpose = $(this).val(); refreshNext(); });
  $('#mBody').on('input', '#fExtra', function () { st.extra = $(this).val(); refreshNext(); });
  $('#mBody').on('change', '#fAgree', function () { st.agree = this.checked; refreshNext(); });

  // Navigation
  $('#mNext').on('click', function () {
    if (!canContinue()) return;
    if (st.step < 3) { st.step++; render(); return; }
    st.ref = 'LL-2026-' + ('0000' + Math.floor(Math.random() * 100000)).slice(-5);
    var now = new Date();
    records[st.ref] = {
      title: services[st.sel].title, stage: 1,
      date: now.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) + ' · ' +
            now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
    };
    st.done = true; render();
  });
  $('#mBack').on('click', function () {
    if (st.step === 1) closeModal(); else { st.step--; render(); }
  });
  $('#mBody').on('click', '#mTrack', function () {
    closeModal();
    openTrack(st.ref);
  });

  // Close: X button, backdrop click, Esc
  $('#mClose').on('click', closeModal);
  $('#modal').on('mousedown', function (e) { if (e.target === this) closeModal(); });
  $(document).on('keydown', function (e) { if (e.key === 'Escape') closeModal(); });

  /* ---------- Track / Sign in / Register popups ---------- */
  function openOvl(sel) {
    closeOvl();
    $(sel).addClass('open').attr('aria-hidden', 'false');
    $('body').css('overflow', 'hidden');
  }
  function closeOvl() {
    $('.ovl').removeClass('open').attr('aria-hidden', 'true');
    if (!$('#modal').hasClass('open')) $('body').css('overflow', '');
  }
  $('.ovl-close').on('click', closeOvl);
  $('.ovl').on('mousedown', function (e) { if (e.target === this) closeOvl(); });
  $(document).on('keydown', function (e) { if (e.key === 'Escape') closeOvl(); });

  // Openers
  $('.signin, .to-signin').on('click', function (e) { e.preventDefault(); openOvl('#signinModal'); $('#siEmail').focus(); });
  $('.btn-register, .to-register').on('click', function (e) { e.preventDefault(); openOvl('#registerModal'); $('#rgFirst').focus(); });
  $('.open-track').on('click', function (e) { e.preventDefault(); openTrack('LL-2026-10482'); });
  $('#rgBirth').attr('max', new Date().toISOString().split('T')[0]);

  // Tracker
  var stages = [
    { t: 'Submitted', d: '' },
    { t: 'Under review', d: 'Your resident details are being verified.' },
    { t: 'Approved', d: 'Your request was approved by barangay personnel.' },
    { t: 'Ready for pickup', d: 'Your signed document is ready at the release window.' },
    { t: 'Released', d: 'The document was released to the resident.' }
  ];

  function checkStatus() {
    var ref = $.trim($('#trRef').val()).toUpperCase(), r = records[ref], html = '';
    if (!ref) {
      html = '<p class="err">Enter your reference number, for example LL-2026-10482.</p>';
    } else if (!r) {
      html = '<p class="err">No request found for ' + esc(ref) + '. Check the reference number and try again.</p>';
    } else {
      html = '<div class="t-card"><div><small>' + esc(r.title) + '</small><strong>' + esc(ref) + '</strong></div>' +
        '<span class="chip' + (r.stage >= 4 ? ' ok' : '') + '">' + stages[r.stage - 1].t + '</span></div><div class="tl">';
      $.each(stages, function (i, sv) {
        var n = i + 1, cls = n < r.stage ? 'done' : (n === r.stage ? 'cur' : 'pend'), desc;
        if (n === 1) desc = 'Received on ' + r.date;
        else desc = n <= r.stage ? sv.d : 'Waiting for the previous step.';
        html += '<div class="tl-i ' + cls + '"><div class="dot">' +
          (cls === 'done' ? '<svg viewBox="0 0 24 24"><path d="m5 12 5 5L20 7"/></svg>' : n) +
          '</div><div><h5>' + sv.t + '</h5><p>' + esc(desc) + '</p></div></div>';
      });
      html += '</div>';
    }
    $('#trResult').html(html);
  }
  function openTrack(ref) {
    openOvl('#trackModal');
    $('#trRef').val(ref || '');
    checkStatus();
  }
  $('#trackForm').on('submit', function (e) { e.preventDefault(); checkStatus(); });

  /* ---------- Login session, logout, forgot password ---------- */
  var defaultProfile = $.extend({}, profile), accounts = {}, user = null;

  function initials(n) {
    var p = $.trim(n).split(/\s+/);
    return ((p[0] || '').charAt(0) + (p.length > 1 ? p[p.length - 1].charAt(0) : '')).toUpperCase() || 'U';
  }
  function nameFromEmail(e) {
    return e.split('@')[0].replace(/[._-]+/g, ' ').replace(/\b\w/g, function (c) { return c.toUpperCase(); });
  }
  function setUser(u) {
    user = u;
    try {
      if (u) sessionStorage.setItem('lokalink_user', JSON.stringify(u));
      else sessionStorage.removeItem('lokalink_user');
    } catch (err) {}
    $.extend(profile, defaultProfile);            // reset, then apply the signed-in resident
    if (u) {
      profile.name = u.name;
      if (u.precinct) profile.precinct = u.precinct;
      if (u.address) profile.address = u.address;
    }
    $('#header').toggleClass('logged-in', !!u);
    $('#userAv').text(u ? initials(u.name) : '');
    $('#userName').text(u ? u.name.split(' ')[0] : '');
  }
  try {
    var saved = sessionStorage.getItem('lokalink_user');
    if (saved) setUser(JSON.parse(saved));
  } catch (err) {}

  $('#logoutBtn').on('click', function () {
    setUser(null);
    closeModal(); closeOvl();
    toast('You have been logged out.');
  });

  $('.to-forgot').on('click', function (e) {
    e.preventDefault();
    var typed = $('#siEmail').val();
    openOvl('#forgotModal');
    $('#fpEmail').val(typed).focus();
    $('#fpErr, #fpMsg').text('');
  });
  $('#forgotForm').on('submit', function (e) {
    e.preventDefault();
    var email = $.trim($('#fpEmail').val());
    $('#fpMsg').text('');
    if (!/^\S+@\S+\.\S+$/.test(email)) return $('#fpErr').text('Enter a valid email address.');
    $('#fpErr').text('');
    $('#fpMsg').text('If an account exists for ' + email + ', a password reset link has been sent. Please check your inbox.');
  });

  // Sign in
  $('#signinForm').on('submit', function (e) {
    e.preventDefault();
    var email = $.trim($('#siEmail').val()), pass = $('#siPass').val();
    if (!/^\S+@\S+\.\S+$/.test(email)) return $('#siErr').text('Enter a valid email address.');
    if (!pass) return $('#siErr').text('Enter your password.');
    $('#siErr').text('');
    setUser(accounts[email.toLowerCase()] || { name: nameFromEmail(email), email: email });
    this.reset(); closeOvl();
    toast('Welcome back, ' + user.name.split(' ')[0] + '!');
  });

  // Register
  $('#registerForm').on('submit', function (e) {
    e.preventDefault();
    var f = {
      first: $.trim($('#rgFirst').val()), last: $.trim($('#rgLast').val()),
      precinct: $.trim($('#rgPrecinct').val()),
      birth: $('#rgBirth').val(), sex: $('#rgSex').val(), address: $.trim($('#rgAddress').val()),
      email: $.trim($('#rgEmail').val()), pass: $('#rgPass').val()
    }, msg = '';
    if (!f.first || !f.last || !f.precinct || !f.birth || !f.sex || !f.address || !f.email || !f.pass) msg = 'Please fill in every field.';
    else if (!/^\S+@\S+\.\S+$/.test(f.email)) msg = 'Enter a valid email address.';
    else if (f.pass.length < 8) msg = 'Password must be at least 8 characters.';
    $('#rgErr').text(msg);
    if (msg) return;
    // Save the account, sign the new resident in and use their details in the request popup
    accounts[f.email.toLowerCase()] = { name: f.first + ' ' + f.last, email: f.email, precinct: f.precinct, address: f.address };
    setUser(accounts[f.email.toLowerCase()]);
    this.reset(); closeOvl();
    toast('Account created. Welcome, ' + f.first + '!');
  });

  // Sample tracking records (requests submitted in the popup are added here too)
  var records = {
    'LL-2026-10482': { title: 'Barangay Clearance', stage: 2, date: 'June 18, 2026 · 9:42 AM' },
    'LL-2026-10311': { title: 'Certificate of Residency', stage: 4, date: 'June 12, 2026 · 2:15 PM' },
    'LL-2026-10090': { title: 'Certificate of Indigency', stage: 5, date: 'June 3, 2026 · 10:05 AM' }
  };

  // Smooth scroll for in-page links
  $('a[href^="#"]').not('[href="#"]').on('click', function (e) {
    var $target = $($(this).attr('href'));
    if ($target.length) {
      e.preventDefault();
      $('html, body').animate({ scrollTop: $target.offset().top - 77 }, 500);
    }
  });

  // Header shadow + active nav link on scroll
  function onScroll() {
    var y = $(window).scrollTop();
    $('#header').toggleClass('scrolled', y > 10);

    var current = 'home';
    $('#home, #services, #track').each(function () {
      if (y + 140 >= $(this).offset().top) current = this.id;
    });
    $('.nav a').removeClass('active').filter('[data-target="' + current + '"]').addClass('active');
  }
  $(window).on('scroll', onScroll);
  onScroll();
});
