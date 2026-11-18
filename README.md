# Campus Stores: a shift at the media desk

## What I did

I worked the Film Society shift in the original app: pickup on Friday at 3:45 pm, the partial return at 7:30 pm and the Saturday 9 am handover. The issuing flow held up well. The Saturday close-out did not. The register let me close the adapter slip without checking which adapter was in my hand. The only record of who had it was a free-text note in another tab. I prototyped one change: the return starts from the unit in hand, and the story of each open item stays on its slip from shift to shift. The behaviour is in `app.js`, written in the app's existing style: plain JS and string-built HTML, with no build step. `styles.css` and `index.html` hold the new states, the Members icon and the visual refresh described under *Assumptions and notes*.

**Run it:** open `index.html` in a browser, or serve the folder:

```sh
python3 -m http.server 8000 --bind 127.0.0.1   # then visit http://localhost:8000
```

Use **Restart sample shift** to start over. Saved state uses a new storage key (`campus-stores.shift.v2`), so an old v1 save is ignored.

## What the product already handles well (and I kept)

**The Fri 3:45 pm issuing guardrails.** Kabir has fifteen minutes before the film starts, and the slip form stops the mistakes a rushed attendant would make:

- I tried to issue **CA-03** (a camera) under **RQ-214**. It was rejected with *"This equipment type is outside the approved request. Choose an approved unit."*
- **PR-06** (in repair, in the workshop) is never offered in "Unit leaving the desk", so I couldn't hand Kabir a broken projector.
- I tried a second speaker (SP-05) after SP-02 was out. It was rejected with *"The approved quantity of this equipment type is already on loan."*

Supporting strengths:

- Confirmations are clear and specific, such as *"Issued PR-04 to Kabir Sen on slip L-402."*
- The Loan register defaults to **Outstanding**, so the open work is what you see first.
- Desk book handover notes are stamped with the shift time.
- The register keeps **one slip per physical unit**. This is the foundation of my change: because each unit has its own slip, a return can be matched to the exact unit.

## The moment I'd change

**Sat 9 am.** Leela walks in and hands over "an adapter".

- In the original register, **Record return** on L-404 closes the slip in one click. Nothing checks that the adapter in hand is **AD-12** (Belkin) and not **AD-15** (Anker). The two look identical and share bin **C4**. If Leela's adapter is really AD-15, or AD-12 is still in her bag, the books now say AD-12 is on the shelf when it isn't.
- "Leela has it" exists only as Kabir's free-text message in the **Desk book**, which is a different tab from the slip. Nothing on L-404 says who holds it now or when it's expected.
- The register shows no overdue flag, although L-404 was due **Fri 8 pm**. It also shows no current holder.
- **Inventory** shows "On loan" but not who has the item, for which club, or on which slip.

The morning attendant has to piece the story together from three tabs and a conversation, and then close a slip on trust.

## The change

**One problem:** an open item's story gets lost between shifts, so the next attendant can close the wrong slip.

Core parts:

- **A. The return starts from the unit in hand.** The Loan register has a **Unit in hand** picker and a **Check in** button. You read the tag and pick the unit. The card then shows its open slip, request, club, who it was issued to, the due time, an **Overdue** badge and any handover, along with a **Confirm return of AD-12** button. A unit with no open slip gets a warning card instead: *"AD-15 has no open slip… Don't close another slip with it."* The card lists the open slips of the same type, so you can compare tags. Row buttons are now **Check in** and **Update holder**, and unit labels include the model (Belkin vs Anker).
- **B. Kit view on Requests.** Each request shows where its kit stands: *Not issued*, *3 of 3 out*, *2 of 3 back · USB-C → HDMI adapter out* or *All back*, with an Overdue badge where it applies. The detail view lists the unit, slip and status of each item.
- **C. Handover is tied to the slip.** After a return, if the same request still has items out, a form asks **Now held by** and **Expected back**, with an optional note. Saving puts the holder and expected time on the slip and adds a Desk book entry headed **Counter handover · L-404**.

Supporting parts:

- **D. Inventory shows who has each item.** Rows read like *"With Leela Das · Film Society · L-404 (issued to Kabir Sen) · due Fri 8 pm"*. Overdue is worked out from desk time.
- **E. Members tab.** A club directory you can search by name, club, role or item held, grouped by club. Searching "adapter" finds whoever holds one. Names elsewhere in the app link here.

## Walkthrough: the same job with the prototype

**Fri 3:45 pm: pickup**

1. Loan register → **New issue slip**. The issue guards work as before: CA-03 is rejected, PR-06 isn't offered and a second speaker is blocked.
2. Issue PR-04, SP-02 and AD-12 (*AD-12 · USB-C → HDMI adapter · Belkin AVC002*) to Kabir Sen, due Fri 8 pm. These are slips L-402 to L-404.
3. Requests shows *Courtyard screening · RQ-214 · Film Society · 3 of 3 out*. Inventory shows *AD-12 … With Kabir Sen · Film Society · L-404*.

**Fri 7:30 pm: partial return**

4. Kabir puts the projector down. Pick **PR-04** in Unit in hand → **Check in**. The card shows *Open slip L-402 · RQ-214 · Film Society*, issued to Kabir Sen. → **Confirm return of PR-04**. The status reads *"…2 still out on RQ-214. Record who has them."* A handover form opens.
5. Check in **SP-02** the same way. The form now reads *Still out: L-404 · AD-12 · USB-C → HDMI adapter · Belkin AVC002*.
6. Set **Now held by: Leela Das** and **Expected back: Sat 9 am** → **Save handover**. L-404 now reads *Held by Leela Das · expected Sat 9 am*. Requests shows *2 of 3 back · USB-C → HDMI adapter out*. The Desk book gets *Counter handover · L-404*.

**Sat 9 am: the next shift**

7. The new attendant opens Requests and sees RQ-214 flagged **Overdue**, with the adapter as the only item out. The register shows L-404 as Overdue and held by Leela Das. L-401 (due Sat 10 am) is not overdue.
8. **Wrong adapter:** Leela hands over a unit tagged **AD-15**. Check in → AD-15. The card warns *"AD-15 has no open slip. It is recorded as on the shelf. Don't close another slip with it."* It lists *L-404 · AD-12 · USB-C → HDMI adapter · Belkin AVC002 · Film Society · with Leela Das*. No return button is offered, so the attendant asks Leela for the Belkin.
9. **Right adapter:** check in **AD-12**. The card shows L-404, the Overdue badge and *Handover: held by Leela Das · expected Sat 9 am*. → **Confirm return of AD-12**. L-404 closes, Requests reads **All back**, and no handover form appears because nothing is left out.

## What I kept

- The four existing tabs, the slip numbering, and the **Outstanding / All slips** toggle.
- All issuing guardrails and their exact wording.
- One slip per physical unit. The change builds on it instead of replacing it.
- The Desk book as the shift log. Handover entries now also carry their slip number.
- The code structure: string-built HTML, the same helpers, localStorage persistence and **Restart sample shift**.

## One observation at a real counter

**At the Saturday morning handover, watch whether the attendant can close the partial-return slip from the register alone.** It helped if they don't open the Desk book and don't ask the borrower or the previous shift "which one was it?". It didn't help if they still go hunting for the note, or close the slip before reading the tag.

Supporting check: at the next shelf audit, count the open slips whose unit is actually on the shelf, and the shelved units that should be out. Fewer mismatches means returns are being matched to the right unit.

## Assumptions and notes

- **Fictional data.** Kabir Sen and Leela Das being Film Society members is my addition; the original lists them only as people. The extra members (Arjun Pillai, Nikhil Bose, Ananya Iyer) are also invented, to make the directory realistic.
- **Time model.** Overdue compares a slip's due time with the current desk time. Both come from a fixed map of the sample's desk times (Fri 3:45 pm, Fri 7:30 pm, Sat 9 am, plus the due options), not a real clock.
- **Theme and layout.** The visual theme follows the Virinchi corporate site (corporate.virinchi.com): Raleway type, a wine shift banner and primary colour, and magenta headings. No logos are copied. All text and colour pairs pass WCAG AA in both light and dark mode. The desk now fills the browser window instead of sitting in a fixed-width card. Raleway loads from Google Fonts. Offline, the app falls back to system fonts and still works.
- **Scope.** Only one handover form shows at a time. When several items are still out, saving one moves the form to the next open slip that has no holder.
- **Verification.** The flow above was checked end to end with a jsdom script (kept outside the repo, so the app stays dependency-free) that covers issue guards, partial return, handover, overdue, the wrong-adapter warning, member search, persistence and HTML escaping.
- **AI tools** were used while building this, as the brief allows.

---

## Original exercise README

### Campus Stores

Campus Stores is a Product Engineer work sample set at a fictional campus media equipment desk. Work through a club’s screening, from equipment pickup to a partial return and the next morning’s handover. Open **Candidate brief** in the app for the assignment.

#### Run the app

Open `index.html` in a modern browser. The app includes its scripts, styles, and icons and can run offline.

To serve it over local HTTP, run this from the repository folder and visit `http://localhost:8000`.

```sh
python3 -m http.server 8000 --bind 127.0.0.1
```

Each browser stores its own sample shift locally when browser storage is available. **Restart sample shift** restores the fictional starting records.

#### Source

- `index.html` contains the desk layout, candidate brief, and bundled icons.
- `app.js` contains the sample records and interactions.
- `styles.css` defines the desktop and mobile layouts.

Icon license notices are in [third-party/lucide-LICENSE.txt](third-party/lucide-LICENSE.txt).

#### Submit your work

1. [Fork Campus Stores](https://github.com/virinchi-healthcare/campus-stores/fork) into your GitHub account. Complete the candidate brief and push your changes to your public fork. In your README, point reviewers to your work and explain the decision you made.
2. In your fork, open **Commits**, select the final commit you want reviewed, and copy the page URL. It should look like `https://github.com/YOUR-USERNAME/campus-stores/commit/COMMIT-SHA`.
3. [Submit your work through the Google Form](https://docs.google.com/forms/d/e/1FAIpQLScvzoh1R4WS-SkiwAVBQbMvniieJYSoOEfLMyVo5CyjOvYUgQ/viewform). Your **roll number**, **email ID**, and **final commit link from your public fork** are required. Enter your roll number and email ID in the form only.
