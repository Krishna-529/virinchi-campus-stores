(() => {
  const storageKey = "campus-stores.shift.v2";
  const root = document.getElementById("campus-stores");
  const q = (selector) => root.querySelector(selector);
  const requests = [
    {
      id: "RQ-214",
      club: "Film Society",
      event: "Courtyard screening",
      owner: "Isha Rao",
      due: "Fri 8 pm",
      items: ["HDMI projector", "Portable speaker", "USB-C → HDMI adapter"],
      note: "Playback is from a USB-C-only laptop. The host will collect at 4 pm.",
    },
    {
      id: "RQ-209",
      club: "Debate Union",
      event: "Finals rehearsal",
      owner: "Tara Shah",
      due: "Sat 10 am",
      items: ["Wireless microphone"],
      note: "Rehearsal runs into the evening.",
    },
    {
      id: "RQ-217",
      club: "Photo Circle",
      event: "Street portrait walk",
      owner: "Dev Menon",
      due: "Sat noon",
      items: ["Digital camera"],
      note: "Collection on Saturday morning.",
    },
  ];
  const assets = [
    { id: "PR-04", type: "HDMI projector", model: "BenQ MH550", bin: "A2" },
    {
      id: "PR-06",
      type: "HDMI projector",
      model: "Epson EB-X49",
      bin: "Workshop",
      repair: true,
    },
    { id: "SP-02", type: "Portable speaker", model: "JBL Eon One", bin: "B1" },
    { id: "SP-05", type: "Portable speaker", model: "Bose S1", bin: "B2" },
    {
      id: "AD-12",
      type: "USB-C → HDMI adapter",
      model: "Belkin AVC002",
      bin: "C4",
    },
    {
      id: "AD-15",
      type: "USB-C → HDMI adapter",
      model: "Anker A8312",
      bin: "C4",
    },
    { id: "MI-09", type: "Wireless microphone", model: "Shure BLX", bin: "B3" },
    { id: "CA-03", type: "Digital camera", model: "Sony A6400", bin: "D2" },
  ];
  const members = [
    { name: "Isha Rao", club: "Film Society", role: "Organiser" },
    { name: "Kabir Sen", club: "Film Society", role: "Member" },
    { name: "Leela Das", club: "Film Society", role: "Member" },
    { name: "Arjun Pillai", club: "Film Society", role: "Projectionist" },
    { name: "Tara Shah", club: "Debate Union", role: "Organiser" },
    { name: "Nikhil Bose", club: "Debate Union", role: "Member" },
    { name: "Dev Menon", club: "Photo Circle", role: "Organiser" },
    { name: "Ananya Iyer", club: "Photo Circle", role: "Member" },
  ];
  const people = members.map((m) => m.name);
  // Desk times and return deadlines are in minutes from Friday midnight.
  const shifts = [
    {
      time: "Friday · 3:45 pm",
      at: 945,
      title: "Pickup at the counter",
      text: "Kabir is here for the Film Society screening. The film starts at four. Can he leave with everything he needs?",
      next: "Move to return time",
    },
    {
      time: "Friday · 7:30 pm",
      at: 1170,
      title: "The kit comes back in pieces",
      text: "Kabir has brought back the projector and speaker. “Leela still has the adapter. She’ll drop it off tomorrow at nine.” Take the return and hand over to the morning shift.",
      next: "Move to next morning",
    },
    {
      time: "Saturday · 9:00 am",
      at: 1980,
      title: "Morning shift",
      text: "You’ve just taken over. Leela walks in with an adapter. Work out what was outstanding from the screening and close the loan for the right item.",
    },
  ];
  const dueAt = {
    "Fri 8 pm": 1200,
    "Sat 9 am": 1980,
    "Sat 10 am": 2040,
    "Sat noon": 2160,
  };
  const dues = Object.keys(dueAt);
  const pages = [
    ["Requests", "clipboard-list"],
    ["Inventory", "package"],
    ["Loan register", "book-open"],
    ["Desk book", "messages-square"],
    ["Members", "users"],
  ];
  const original = () => ({
    version: 2,
    tab: "Requests",
    phase: 0,
    selected: "",
    filter: "All items",
    loans: [
      {
        num: 401,
        req: "RQ-209",
        asset: "MI-09",
        who: "Tara Shah",
        due: "Sat 10 am",
        back: false,
      },
    ],
    notes: [],
    editing: false,
    onlyOpen: true,
    checkin: "",
    handover: 0,
    memberQuery: "",
    notice: "Sample shift · All records are fictional.",
  });
  let s = original();
  const getAsset = (id) => assets.find((x) => x.id === id);
  const getReq = (id) => requests.find((x) => x.id === id);
  const getLoan = (num) => s.loans.find((l) => l.num === num);
  const out = (id) => s.loans.find((l) => l.asset === id && !l.back);
  const overdue = (l) => !l.back && dueAt[l.due] < shifts[s.phase].at;
  const holderOf = (l) => l.holder || l.who;
  const holding = (name) =>
    s.loans.filter((l) => !l.back && holderOf(l) === name);
  const unitLabel = (a) => a.id + " · " + a.type + " · " + a.model;
  // The latest slip for each approved item, so a re-issue replaces a return.
  const slipFor = (r, type) =>
    s.loans
      .filter((l) => l.req === r.id && getAsset(l.asset).type === type)
      .at(-1);
  const esc = (x) =>
    String(x).replace(
      /[&<>"']/g,
      (c) =>
        ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#39;",
        })[c],
    );
  const opts = (list, value = "") =>
    list
      .map(
        ([v, t]) =>
          '<option value="' +
          esc(v) +
          '"' +
          (v === value ? " selected" : "") +
          ">" +
          esc(t) +
          "</option>",
      )
      .join("");
  const btn = (label, act, val = "", style = "") =>
    '<button type="button" data-action="' +
    act +
    '" data-val="' +
    esc(val) +
    '" class="' +
    style +
    '">' +
    esc(label) +
    "</button>";
  const person = (name) => btn(name, "member", name, "link");
  const head = (title, sub, control = "") =>
    '<div class="sectionhead"><div><h2>' +
    title +
    "</h2><small>" +
    sub +
    "</small></div>" +
    control +
    "</div>";
  const row = (label, sub, right, more = "") =>
    '<div class="row"><div><strong>' +
    esc(label) +
    "</strong><small>" +
    esc(sub) +
    "</small>" +
    more +
    "</div><div>" +
    right +
    "</div></div>";
  const badge = (t, tone = "") =>
    '<span class="tag' + (tone ? " " + tone : "") + '">' + esc(t) + "</span>";
  const select = (label, key, options, value = "") =>
    "<label><span>" +
    label +
    '</span><select name="' +
    key +
    '" required><option value="">Select…</option>' +
    opts(options, value) +
    "</select></label>";
  const heldLine = (l) =>
    l.holder
      ? "Held by " + l.holder + (l.expected ? " · expected " + l.expected : "")
      : "";
  function kitStatus(r) {
    const slips = r.items.map((type) => slipFor(r, type)).filter(Boolean);
    const open = slips.filter((l) => !l.back);
    const back = slips.length - open.length;
    const n = r.items.length;
    if (!slips.length) return "Not issued";
    if (!open.length)
      return back === n ? "All back" : back + " of " + n + " back";
    if (!back) return open.length + " of " + n + " out";
    return (
      back +
      " of " +
      n +
      " back · " +
      open.map((l) => getAsset(l.asset).type).join(", ") +
      " out"
    );
  }
  function requestPage() {
    let html = head(
      "Approved requests",
      "Student Activities Office · 3 approved forms",
    );
    if (s.selected) {
      const r = getReq(s.selected);
      const items = r.items
        .map((type) => {
          const l = slipFor(r, type);
          if (!l)
            return "<li>" + esc(type) + " " + badge("Not issued") + "</li>";
          const a = getAsset(l.asset);
          const state = l.back
            ? badge("Returned", "good")
            : overdue(l)
              ? badge("Overdue", "late")
              : badge("Out");
          return (
            "<li>" +
            esc(type + " · " + a.id + " · " + a.model + " · L-" + l.num) +
            " " +
            state +
            (!l.back && l.holder
              ? "<small>" + esc(heldLine(l)) + "</small>"
              : "") +
            "</li>"
          );
        })
        .join("");
      html +=
        btn("Back to list", "close") +
        '<div class="record"><small>' +
        r.id +
        " · Approved</small><h3>" +
        r.event +
        "</h3><p>" +
        r.club +
        " · Filed by " +
        r.owner +
        "</p><p><b>Return by</b> " +
        r.due +
        "</p><p><b>Kit</b> " +
        esc(kitStatus(r)) +
        '</p><ul class="kit">' +
        items +
        "</ul><p>" +
        r.note +
        "</p></div>";
    } else
      html += requests
        .map((r) =>
          row(
            r.event,
            r.id + " · " + r.club + " · " + kitStatus(r),
            (s.loans.some((l) => l.req === r.id && overdue(l))
              ? badge("Overdue", "late")
              : "") + btn("View form", "request", r.id),
          ),
        )
        .join("");
    return html;
  }
  function inventory() {
    let html = head(
      "Inventory",
      "Physical units · home shelf, availability and who has them",
    );
    html +=
      '<div class="buttons"><label>Show <select data-filter>' +
      opts(
        ["All items", "On shelf", "On loan", "In repair"].map((f) => [f, f]),
      ) +
      "</select></label></div>";
    for (const a of assets) {
      const l = out(a.id);
      const status = a.repair ? "In repair" : l ? "On loan" : "On shelf";
      if (s.filter !== "All items" && s.filter !== status) continue;
      html += row(
        a.id + " · " + a.type,
        a.model + " · " + a.bin,
        l && overdue(l)
          ? badge("Overdue", "late")
          : badge(status, status === "On shelf" ? "good" : ""),
        l
          ? '<small class="who">With ' +
              person(holderOf(l)) +
              esc(
                " · " +
                  getReq(l.req).club +
                  " · L-" +
                  l.num +
                  (l.holder ? " (issued to " + l.who + ")" : "") +
                  " · due " +
                  l.due,
              ) +
              "</small>"
          : "",
      );
    }
    return html;
  }
  function checkinCard(id) {
    const a = getAsset(id);
    const l = out(id);
    const html =
      '<div class="record checkin' +
      (l ? "" : " warn") +
      '"><small>Unit in hand · home shelf ' +
      esc(a.bin) +
      "</small><h3>" +
      esc(unitLabel(a)) +
      "</h3>";
    if (l) {
      const r = getReq(l.req);
      return (
        html +
        "<p><b>Open slip L-" +
        l.num +
        "</b> · " +
        esc(r.id + " · " + r.club + " · " + r.event) +
        "</p><p>Issued to " +
        person(l.who) +
        esc(" · due " + l.due) +
        " " +
        (overdue(l) ? badge("Overdue", "late") : "") +
        "</p>" +
        (l.holder
          ? "<p>Handover: held by " +
            person(l.holder) +
            esc(l.expected ? " · expected " + l.expected : "") +
            "</p>"
          : "") +
        '<div class="buttons">' +
        btn("Confirm return of " + a.id, "return", String(l.num), "primary") +
        btn("Cancel", "uncheck") +
        "</div></div>"
      );
    }
    const same = s.loans.filter(
      (x) => !x.back && getAsset(x.asset).type === a.type,
    );
    return (
      html +
      "<p><b>" +
      esc(a.id) +
      " has no open slip.</b> " +
      (a.repair
        ? "It is booked into the workshop."
        : "It is recorded as on the shelf.") +
      " Don’t close another slip with it.</p>" +
      (same.length
        ? "<p>Open slips for this type. Compare the tag on the unit:</p><ul>" +
          same
            .map(
              (x) =>
                "<li>" +
                esc(
                  "L-" +
                    x.num +
                    " · " +
                    unitLabel(getAsset(x.asset)) +
                    " · " +
                    getReq(x.req).club +
                    " · with " +
                    holderOf(x),
                ) +
                "</li>",
            )
            .join("") +
          "</ul>"
        : "") +
      '<div class="buttons">' +
      btn("Done", "uncheck") +
      "</div></div>"
    );
  }
  function handoverForm(l) {
    const r = getReq(l.req);
    return (
      '<form data-handover class="record warn"><small>Handover · ' +
      esc(r.id + " · " + r.club) +
      "</small><h3>" +
      esc("Still out: L-" + l.num + " · " + unitLabel(getAsset(l.asset))) +
      '</h3><div class="form">' +
      select(
        "Now held by",
        "holder",
        people.map((p) => [p, p]),
        holderOf(l),
      ) +
      select(
        "Expected back",
        "expected",
        dues.map((d) => [d, d]),
        l.expected,
      ) +
      '<label class="full"><span>Note (optional)</span><input name="memo" maxlength="200" /></label></div><input type="hidden" name="num" value="' +
      l.num +
      '" /><div class="buttons"><button type="submit" class="primary">Save handover</button>' +
      btn("Skip", "skip") +
      "</div></form>"
    );
  }
  function register() {
    let html = head(
      "Loan register",
      "One slip per physical unit",
      s.editing
        ? btn("Cancel", "cancel")
        : btn("New issue slip", "new", "", "primary"),
    );
    if (s.editing) {
      const available = assets.filter((a) => !a.repair && !out(a.id));
      return (
        html +
        '<form data-issue><div class="form">' +
        select(
          "Approved request",
          "req",
          requests.map((r) => [r.id, r.id + " · " + r.club]),
        ) +
        select(
          "Unit leaving the desk",
          "asset",
          available.map((a) => [a.id, unitLabel(a)]),
        ) +
        select(
          "Collected by",
          "who",
          people.map((p) => [p, p]),
        ) +
        select(
          "Return by",
          "due",
          dues.map((d) => [d, d]),
        ) +
        '</div><button type="submit" class="primary">Save issue slip</button></form>'
      );
    }
    html +=
      '<form data-checkin class="buttons"><label>Unit in hand <select name="unit" required><option value="">Select…</option>' +
      opts(
        assets.map((a) => [a.id, unitLabel(a)]),
        s.checkin,
      ) +
      '</select></label><button type="submit">Check in</button></form>';
    if (s.checkin) html += checkinCard(s.checkin);
    const pending = getLoan(s.handover);
    if (pending && !pending.back) html += handoverForm(pending);
    html +=
      '<div class="buttons">' +
      ["Outstanding", "All slips"]
        .map(
          (v, i) =>
            '<button type="button" data-action="scope" data-val="' +
            i +
            '" aria-pressed="' +
            (s.onlyOpen === (i === 0)) +
            '">' +
            v +
            "</button>",
        )
        .join("") +
      "</div>";
    const shown = s.loans
      .filter((l) => !s.onlyOpen || !l.back)
      .slice()
      .reverse();
    if (!shown.length) html += "<p>No outstanding slips.</p>";
    for (const l of shown)
      html += row(
        "L-" + l.num + " · " + l.asset + " · " + getAsset(l.asset).model,
        l.req +
          " · " +
          l.who +
          " · Due " +
          l.due +
          (!l.back && l.holder ? " · " + heldLine(l) : ""),
        l.back
          ? badge("Returned")
          : (overdue(l) ? badge("Overdue", "late") : "") +
              btn("Check in", "checkin", l.asset) +
              btn("Update holder", "handover", String(l.num)),
      );
    return html;
  }
  function deskbook() {
    let html = head(
      "Desk book",
      "Messages from clubs and notes for the next shift",
    );
    const entries = [
      [
        "Friday · 3:20 pm",
        "Isha Rao · Film Society",
        "Kabir Sen is picking up our whole screening kit. Please issue it in his name. I’m setting up in the courtyard.",
      ],
      [
        "Friday · 3:30 pm",
        "Tara Shah · Debate Union",
        "Our microphone stays with me overnight. I’ll return it by 10 am Saturday.",
      ],
    ];
    if (s.phase >= 1)
      entries.push([
        "Friday · 7:30 pm",
        "Kabir Sen · Film Society",
        "I brought the projector and speaker. Leela Das has our adapter. She’ll be at the counter at 9 am tomorrow.",
      ]);
    for (const n of s.notes)
      entries.push([
        shifts[n.phase].time,
        "Counter handover" + (n.slip ? " · L-" + n.slip : ""),
        n.text,
      ]);
    for (const [t, author, body] of entries.slice().reverse())
      html +=
        '<article class="record"><small>' +
        esc(t) +
        "</small><h3>" +
        esc(author) +
        "</h3><p>" +
        esc(body) +
        "</p></article>";
    return (
      html +
      '<form data-note><div class="form"><label class="full"><span>Note for the next shift</span><textarea name="note" rows="2" maxlength="400" required></textarea></label></div><button type="submit">Add handover note</button></form>'
    );
  }
  function memberResults() {
    const words = s.memberQuery.toLowerCase().split(/\s+/).filter(Boolean);
    const hits = members.filter((m) => {
      const text = [m.name, m.club, m.role]
        .concat(
          holding(m.name).flatMap((l) => {
            const a = getAsset(l.asset);
            return [a.id, a.type, a.model, "L-" + l.num];
          }),
        )
        .join(" ")
        .toLowerCase();
      return words.every((w) => text.includes(w));
    });
    if (!hits.length)
      return "<p>No members match “" + esc(s.memberQuery) + "”.</p>";
    let html = "";
    for (const club of [...new Set(hits.map((m) => m.club))]) {
      html += '<h3 class="group">' + esc(club) + "</h3>";
      for (const m of hits.filter((x) => x.club === club)) {
        const held = holding(m.name);
        html += row(
          m.name,
          m.role + " · " + m.club,
          held.length
            ? held
                .map((l) =>
                  badge(
                    "L-" +
                      l.num +
                      " · " +
                      l.asset +
                      " " +
                      getAsset(l.asset).type +
                      (overdue(l) ? " · overdue" : ""),
                    overdue(l) ? "late" : "",
                  ),
                )
                .join(" ")
            : badge("Nothing out", "good"),
        );
      }
    }
    return html;
  }
  function membersPage() {
    return (
      head(
        "Members",
        "Club members on file · search by name, club, role or item held",
      ) +
      '<div class="buttons"><label class="search">Search <input type="search" data-member-search value="' +
      esc(s.memberQuery) +
      '" placeholder="e.g. Leela, film, adapter" /></label></div><div data-member-results>' +
      memberResults() +
      "</div>"
    );
  }
  const screens = {
    Requests: requestPage,
    Inventory: inventory,
    "Loan register": register,
    "Desk book": deskbook,
    Members: membersPage,
  };
  function paint() {
    const phase = shifts[s.phase];
    q("[data-clock]").textContent = phase.time;
    q("[data-shift-title]").textContent = phase.title;
    q("[data-shift]").textContent = phase.text;
    const advance = q('[data-action="advance"]');
    advance.hidden = !phase.next;
    advance.textContent = phase.next || "";
    q("[data-nav]").innerHTML = pages
      .map(
        ([n, icon]) =>
          '<button type="button" data-action="tab" data-val="' +
          n +
          '" aria-pressed="' +
          (s.tab === n) +
          '"><svg aria-hidden="true" class="store-icon"><use href="#icon-' +
          icon +
          '"></use></svg>' +
          n +
          "</button>",
      )
      .join("");
    q("[data-page]").innerHTML = screens[s.tab]();
    if (q("[data-filter]")) q("[data-filter]").value = s.filter;
    q("[data-status]").textContent = s.notice;
  }
  function save() {
    try {
      localStorage.setItem(storageKey, JSON.stringify(s));
    } catch {
      q("[data-status]").textContent +=
        " Browser storage is unavailable. Progress lasts for this visit.";
    }
  }
  function commit(msg) {
    if (msg) s.notice = msg;
    paint();
    save();
  }
  root.addEventListener("click", (e) => {
    const b = e.target.closest("[data-action]");
    if (!b) return;
    const v = b.dataset.val;
    switch (b.dataset.action) {
      case "restart":
        s = original();
        break;
      case "advance":
        if (s.phase < 2) s.phase++;
        s.notice = "Shift time updated.";
        break;
      case "tab":
        s.tab = v;
        s.editing = false;
        break;
      case "member":
        s.tab = "Members";
        s.memberQuery = v;
        s.editing = false;
        break;
      case "close":
        s.selected = "";
        break;
      case "request":
        s.selected = v;
        break;
      case "new":
        s.editing = true;
        break;
      case "cancel":
        s.editing = false;
        break;
      case "scope":
        s.onlyOpen = v === "0";
        break;
      case "checkin":
        s.checkin = v;
        break;
      case "uncheck":
        s.checkin = "";
        break;
      case "handover":
        s.handover = Number(v);
        break;
      case "skip":
        s.handover = 0;
        break;
      case "return": {
        const l = getLoan(Number(v));
        if (!l || l.back) return;
        l.back = true;
        s.checkin = "";
        const rest = s.loans.filter((x) => x.req === l.req && !x.back);
        s.handover = rest.length ? rest[0].num : 0;
        s.notice =
          l.asset +
          " returned to stock. Slip L-" +
          l.num +
          " closed." +
          (rest.length
            ? " " +
              rest.length +
              " still out on " +
              l.req +
              ". Record who has " +
              (rest.length > 1 ? "them." : "it.")
            : "");
        break;
      }
    }
    commit();
  });
  root.addEventListener("change", (e) => {
    if (e.target.matches("[data-filter]")) {
      s.filter = e.target.value;
      commit();
    }
  });
  root.addEventListener("input", (e) => {
    if (e.target.matches("[data-member-search]")) {
      s.memberQuery = e.target.value;
      // Repaint only the results so the search box keeps focus.
      q("[data-member-results]").innerHTML = memberResults();
      save();
    }
  });
  root.addEventListener("submit", (e) => {
    e.preventDefault();
    const f = e.target;
    const form = new FormData(f);
    if (f.matches("[data-note]")) {
      const text = String(form.get("note")).trim();
      if (!text) return;
      s.notes.push({ phase: s.phase, text });
      commit("Handover note saved.");
      return;
    }
    if (f.matches("[data-checkin]")) {
      const id = form.get("unit");
      if (!getAsset(id)) return;
      s.checkin = id;
      commit();
      return;
    }
    if (f.matches("[data-handover]")) {
      const l = getLoan(Number(form.get("num")));
      const holder = form.get("holder"),
        expected = form.get("expected"),
        memo = String(form.get("memo")).trim();
      if (!l || l.back || !people.includes(holder) || !(expected in dueAt))
        return;
      l.holder = holder;
      l.expected = expected;
      const m = members.find((x) => x.name === holder);
      s.notes.push({
        phase: s.phase,
        slip: l.num,
        text:
          "L-" +
          l.num +
          " · " +
          unitLabel(getAsset(l.asset)) +
          " is now with " +
          holder +
          " (" +
          m.club +
          "), expected back " +
          expected +
          "." +
          (memo ? " " + memo : ""),
      });
      // Prompt for the next open slip on the same request that has no holder yet.
      const next = s.loans.find(
        (x) => x.req === l.req && !x.back && !x.holder,
      );
      s.handover = next ? next.num : 0;
      commit("Handover saved on slip L-" + l.num + ".");
      return;
    }
    if (!f.matches("[data-issue]")) return;
    const [req, asset, who, due] = ["req", "asset", "who", "due"].map((k) =>
      form.get(k),
    );
    const unit = getAsset(asset),
      r = getReq(req);
    if (!r || !unit || unit.repair || out(asset) || !people.includes(who))
      return;
    if (!r.items.includes(unit.type)) {
      q("[data-status]").textContent =
        "This equipment type is outside the approved request. Choose an approved unit.";
      return;
    }
    if (
      s.loans.some(
        (l) => l.req === req && !l.back && getAsset(l.asset).type === unit.type,
      )
    ) {
      q("[data-status]").textContent =
        "The approved quantity of this equipment type is already on loan.";
      return;
    }
    const num = Math.max(...s.loans.map((l) => l.num)) + 1;
    s.loans.push({ num, req, asset, who, due, back: false });
    s.editing = false;
    commit("Issued " + asset + " to " + who + " on slip L-" + num + ".");
  });
  function restore(d) {
    if (
      !d ||
      d.version !== 2 ||
      !Object.hasOwn(screens, d.tab) ||
      !shifts[d.phase] ||
      (d.selected && !getReq(d.selected)) ||
      !Array.isArray(d.notes) ||
      !d.notes.every(
        (n) => n && shifts[n.phase] && typeof n.text === "string",
      ) ||
      !Array.isArray(d.loans) ||
      !d.loans.length ||
      !d.loans.every(
        (l) =>
          l &&
          getReq(l.req) &&
          getAsset(l.asset) &&
          Number.isInteger(l.num) &&
          (!l.holder || people.includes(l.holder)) &&
          (!l.expected || l.expected in dueAt),
      ) ||
      (d.checkin && !getAsset(d.checkin)) ||
      (d.handover && !d.loans.some((l) => l.num === d.handover)) ||
      typeof (d.memberQuery ?? "") !== "string"
    )
      return;
    s = {
      ...original(),
      ...d,
      loans: d.loans.map((l) => ({ ...l })),
      notes: d.notes.map((n) => ({ ...n })),
    };
    paint();
  }
  paint();
  try {
    restore(JSON.parse(localStorage.getItem(storageKey)));
  } catch {
    // Keep the fresh shift when storage is unavailable or the saved data is invalid.
  }
})();
