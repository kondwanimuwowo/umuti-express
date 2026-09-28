# Online pharmacy prototype Zambia

_Started 2026-08-14 02:49 UTC_

---

## User

i would like to create a prototype for an online pharmacy in zambia (UI RULES FOR PROMPT

	- No emojis.
	- Avoid borders wherever possible.
	- Separate elements with subtle small-to-medium shadows or color contrast instead of borders.
	- Use common, clean sans-serif fonts (e.g. Manrope, Poppins).
	- use image backgrounds for sections where you can
	- use images on cards where you can
	- Use subtle animations only, nothing flashy or attention-grabbing.
	- On large screens, leave generous gutter space on both sides. The main content area should take up only 60-70% of total screen width.
	- Favor generous whitespace throughout. Give elements room to breathe, err on the side of more padding and more space between sections rather than less.
	- Use a pure white background unless a different background is specified.
	- Use full, solid colors on sections, cards, and buttons, no transparency or reduced opacity.
	- Sections should be full-width.
	- Some sections, especially the homepage hero, should use a full-width background image.
	- Headings/titles must be monochrome (one color per line) and must not repeat the same word or phrase twice within a single line.
	- Headings/titles should be large enough to stand out clearly.
	- Do not use eyebrow text (small labels above headings) on sections or headings.
	- Never use em dashes.
	- No gradient fills on cards, buttons, sections, or the hero background. Use solid, opaque colors only.
	- Use solid-style icons (not outline/line icons) from a single consistent icon set, at a consistent weight and size.
	- Do not put icons inside colored circles or badges above feature cards.
	- Use a consistent spacing scale (e.g. 4px/8px increments) for padding and gaps, no arbitrary spacing values.
	- Hero and section imagery should be real or custom photography/illustration, not generic stock-photo-style visuals.
	- Buttons should be fully rounded (pill-shaped) by default, unless the specific design calls for sharp corners.
	- Use one consistent corner-radius value (or a small defined set) across all cards, inputs, and containers, not ad hoc per component.

COPY / TEXT RULES FOR PROMPT

	- Never use em dashes or en dashes anywhere in generated text.
	- No emojis in headings, buttons, or body copy.
	- Write plain, direct copy. No inflated-significance phrasing (avoid "stands as," "a testament to," "plays a vital role," "marks a pivotal moment").
	- No promotional or advertising language (avoid "vibrant," "stunning," "boasts," "nestled," "must-see," "cutting-edge").
	- No vague attributions ("experts say," "many believe," "studies show") without naming a real, specific source.
	- Avoid forcing ideas into groups of three just to sound thorough.
	- Don't pad sentences with "-ing" phrases tacked on for fake depth (e.g. "enhancing the experience, ensuring engagement, fostering trust").
	- Avoid AI-cliche vocabulary: delve, crucial, pivotal, tapestry, landscape (as abstract noun), testament, underscore, foster, showcase, seamless, elevate, unlock, unleash.
	- No filler phrases ("in order to," "due to the fact that," "it is important to note that"). Say it plainly.
	- No sycophantic or overly enthusiastic tone ("Great news!", "You'll love this!").
	- No generic, vague closing lines ("The future looks bright," "Exciting things ahead").
	- Straight quotes only, never curly quotes.
	- Sentence case for headings, not Title Case.
	- Avoid "not only... but also" and other negative-parallelism constructions.
	- Keep copy concise and concrete, no filler, no restating the heading in the first line beneath it.
)

## Assistant



## Assistant

_[tool: read_skill_prompt]_

_[tool: ask_user]_

Waiting on your answers about visual direction, platform, audience, flows, and scope before I start building.

## User

Answered — Asked for follow-up questions; design_system: Design system left to Claude; code_source: kondwanimuwowo/smilefxtraders; platform: Desktop website; audience: General public, all ages, Younger, mobile-first users, Patients with chronic conditions (repeat orders); core_flows: Browse and search medicines, Upload/submit prescription, Cart and checkout, Order tracking and delivery, Pharmacist chat/consultation, Account and order history, Mobile money payment (e.g. MTN/Airtel…; prescription_handling: Upload photo of prescription, pharmacist verifies before shipping; delivery_model: Home d…

## Assistant



## Assistant

_[tool: ask_user]_

Waiting on a few more details: pharmacist chat depth, refill flow, and anything to reuse from your connected repo.

## User

Answered — chat_depth: Simple scripted conversation (demo only); refill_emphasis: Add a one-tap reorder/refill action on account and order history; branding_source: the name can be Umuti Express or Umuti Market, let me know what you are feeling better. you can as well use something else that yu feel can best fit the name. do not use the logo from the repo. but y…; open_questions: 1. the online pharmacy will work in collaboration with the pharmacies around  2. users should be able to search for the nearest pharmacy to them  3. payments will use lenco by broadpay in zambia

## Assistant

_[tool: github_get_tree]_

_[tool: github_search_code]_

_[tool: github_read_files]_

_[tool: copy_starter_component]_

No stock-photo tool available; I'll use plain placeholder slots. Writing the prototype now.

_[tool: dc_write]_

_[tool: tool_search_tool_bm25]_

_[tool: write_file]_

_[tool: ready_for_verification]_

Built "Umuti Express" — an 11-screen desktop prototype covering browse/search, product detail, prescription upload (with pharmacist review simulation), nearby pharmacy pickup search, cart, checkout (delivery/pickup + MTN/Airtel via Lenco by BroadPay), order tracking, account with one-tap reorder, and a scripted pharmacist chat. Green pharmacy palette, Ubuntu/Open Sans typography from your connected repo's tokens. Sending for review now.

## User

on the neaby pharmacies, lets add an openstreet map api and let the pharmacies be pins on the actual map. clicking a pin should popup a preview overview of the phamarcy and a link to open it

## Assistant

_[tool: dc_html_str_replace]_

_[tool: dc_html_str_replace]_

_[tool: dc_js_str_replace]_

_[tool: dc_js_str_replace]_

Now trigger marker refresh whenever filters/selection change.

_[tool: dc_js_str_replace]_

_[tool: ready_for_verification]_

Added a real OpenStreetMap (Leaflet) map on the nearby pharmacies screen with pins at each pharmacy's location — clicking a pin pops up its name, distance, hours, and a "Select for pickup" action.

## User

Found issues — fixing…

## Assistant

_[tool: dc_js_str_replace]_

_[tool: ready_for_verification]_

Fixed — the map ref wasn't wired into renderVals's output.

## User

let the map fill entire width and the the pharmacy column on the left go at the bottom of the map.

## Assistant

_[tool: dc_html_str_replace]_

_[tool: ready_for_verification]_

Done — map now spans full width with the pharmacy list in a two-column grid below it.

## User

there is also delivery when users order. delivery is actually the prefered option by us. since we want to make it easy for users to buy meds

## Assistant

_[tool: read_file]_

_[tool: grep]_

Delivery is already the default choice at checkout and highlighted first. Adding a "Recommended" tag to make that preference visible.

_[tool: str_replace_edit]_

_[tool: dc_js_str_replace]_

_[tool: dc_js_str_replace]_

_[tool: ready_for_verification]_

Delivery was already the default and pre-selected at checkout; added a "Recommended" badge on it to make that preference visible to users.

## User

lets make this highly responsive on mobile with a hamburger on mobile

## Assistant

_[tool: grep]_

_[tool: dc_html_str_replace]_

_[tool: dc_html_str_replace]_

_[tool: dc_html_str_replace]_

_[tool: dc_html_str_replace]_

_[tool: dc_html_str_replace]_

_[tool: dc_html_str_replace]_

_[tool: dc_html_str_replace]_

_[tool: dc_html_str_replace]_

_[tool: dc_html_str_replace]_

_[tool: dc_html_str_replace]_

_[tool: dc_html_str_replace]_

_[tool: dc_html_str_replace]_

_[tool: dc_html_str_replace]_

_[tool: dc_html_str_replace]_

_[tool: dc_html_str_replace]_

_[tool: dc_html_str_replace]_

_[tool: dc_html_str_replace]_

_[tool: dc_html_str_replace]_

_[tool: dc_html_str_replace]_

All template edits applied. Now the logic class: state, resize handling, and new computed values.

_[tool: dc_js_str_replace]_

_[tool: dc_js_str_replace]_

_[tool: dc_js_str_replace]_

_[tool: dc_js_str_replace]_

Now verifying across viewport sizes.

_[tool: ready_for_verification]_

Made the whole prototype responsive: nav collapses to a hamburger menu below ~860px, hero/product/checkout/cart/footer grids stack to single or double columns, gutters shrink, and the map/pharmacy list, sticky checkout summary, and text sizing all adapt to mobile width.

## User

export as a standalone html

## Assistant

_[tool: read_skill_prompt]_

_[tool: str_replace_edit]_

_[tool: super_inline_html]_

_[tool: show_html]_

_[tool: get_webview_logs]_

No errors. Delivering the standalone file.

_[tool: present_fs_item_for_download]_

Standalone export ready for download above.

## User

this page is not mobile responsive

## Assistant

_[tool: grep]_

_[tool: read_file]_

_[tool: show_html]_

_[tool: eval_js]_

_[tool: eval_js]_

_[tool: grep]_

_[tool: dc_html_str_replace]_

_[tool: dc_html_str_replace]_

_[tool: dc_html_str_replace]_

_[tool: dc_html_str_replace]_

_[tool: dc_html_str_replace]_

_[tool: show_html]_

_[tool: eval_js]_

_[tool: eval_js]_

_[tool: grep]_

_[tool: eval_js]_

_[tool: write_file]_

_[tool: show_html]_

_[tool: save_screenshot]_

_[tool: save_screenshot]_

_[tool: eval_js]_

_[tool: eval_js]_

_[tool: eval_js]_

_[tool: eval_js]_

_[tool: eval_js]_

_[tool: eval_js]_

_[tool: delete_file]_

Verified against a real 390px viewport: no horizontal overflow, hamburger menu shows and desktop links hide, and the product detail screen stacks and fits cleanly. The fix was flex items (search/chat inputs, cart/pharmacy row text) missing `min-width:0`, which let long placeholder/content force overflow — now corrected.

_[tool: ready_for_verification]_

Fixed and re-verified for mobile responsiveness.

## User

perfect. export again

## Assistant

_[tool: super_inline_html]_

_[tool: show_html]_

_[tool: get_webview_logs]_

_[tool: present_fs_item_for_download]_

Updated standalone export ready for download above.

## User

in the export will be used for presentation, so the image placeholders should not open an uploader

## Assistant

_[tool: dc_html_str_replace]_

_[tool: super_inline_html]_

Reverting the source so the live editable design still allows dropping images.

_[tool: dc_html_str_replace]_

_[tool: show_html]_

_[tool: get_webview_logs]_

_[tool: present_fs_item_for_download]_

Re-exported with image placeholders now inert (no upload/drag interaction) — the editable version in the project still allows dropping images in.

