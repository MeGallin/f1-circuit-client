# Constructor identity assets — 6 October 2026

`ConstructorLogo` / `ConstructorIdentity` retain API-supplied names and use exact
canonical IDs, never name matching or successor-team aliases. Assets are bundled
locally under `public/images/constructors`; there is no runtime hotlinking. Unknown
IDs, malformed/out-of-range years and image errors show the supplied name only.
Known undated identities use an explicitly configured season-neutral badge;
they never infer the current season. An
image next to a name is decorative (`alt=""`); a standalone image has the supplied
name and falls back to text on error. No sponsor lockups, invented marks or AI
generated brand assets are included.

## Current archive coverage

Read-only API `/search?q=constructor:&kind=constructor` pagination and every
published constructor standing set were audited on 6 October: 40 canonical IDs
across 27 seasons (2000–2026). `fixtures/constructor-catalogue.js` records the
287 observed ID/year pairs, including disjoint Renault/Sauber eras. The manifest
provides explicit identity defaults and dated periods for this scope, not a
claim of coverage for the entire 1950-onwards history. New source/download and
rights details are in [the expanded source register](CONSTRUCTOR-ASSET-SOURCES.md).

Badges are constructor/manufacturer identity aids, not season-exact sponsored
lockups or livery reconstructions. Same-brand manufacturer symbols may identify
multiple seasons; their download/upload dates do not prove first use. Historical
constructor IDs never alias to successor teams. Lotus Racing and Lotus F1,
MF1 and Spyker MF1, Marussia and Manor, Sauber and BMW Sauber remain separate.
Manor 2015/2016 and HRT 2010–2011/2012 use distinct dated artwork. Red Bull's
dated 2005–2012 racing logo is not labelled a 2026 mark, and 2026 artwork is not
backdated. Undated defaults identify their own canonical brand, without making
a dated-period claim. Names always remain the API-supplied names.

The non-production [asset review fixture](../fixtures/constructor-logo-gallery.html)
renders canonical defaults and every dated variant with the same shared component
and Apex tokens. Open `/fixtures/constructor-logo-gallery.html` on the local Vite
server for visual review; it is not a shipped application route.

Ferrari uses the recognisable yellow shield/Prancing Horse. Aston Martin wings
and Cadillac crest replace the tiny wordmarks. The official Red Bull and RB
derivatives retain only existing team artwork, excluding sponsor paths.
Copyrighted downloads are user-authorised but **deployment/commercial-use rights
remain unverified**; Wikipedia non-free rationales do not transfer to this site.

## Initial delivery provenance (historical)

The initial nine-asset delivery used unchanged originals apart from local filenames; CSS scales them
without recolouring or distorting their aspect ratio. Source descriptions were
checked on 6 October 2026. Commons copyright labels are recorded below, **not a
claim of cleared commercial use**. Trademarks, brand guidelines, jurisdictional
rights and restrictions can still apply, including to public-domain graphics.
There is no affiliation, sponsorship or endorsement. A site operator must assess
their own proposed use; downloading an official asset does not grant permission.
For example, [Haas media terms](https://media.haasf1team.com/) restrict its marks
to valid news reporting. That media library was not used as an unrestricted licence.

| Local asset / canonical ID              | Reviewed display years | Description page / recorded source and author                                                                                                                                         | Copyright label on file page                                    | Exact original download                                                                 |
| --------------------------------------- | ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| `mercedes.svg` / `constructor:mercedes` | 2022–2026              | [Mercedes-Benz Star 2022](https://commons.wikimedia.org/wiki/File:Mercedes-Benz_Star_2022.svg); Mercedes-Benz Group, own work using group.mercedes-benz.com                           | PD-textlogo; explicit trademark warning                         | [SVG](https://upload.wikimedia.org/wikipedia/commons/3/32/Mercedes-Benz_Star_2022.svg)  |
| `mclaren.svg` / `constructor:mclaren`   | 2021–2026              | [McLaren Speedmark](https://commons.wikimedia.org/wiki/File:McLaren_Speedmark.svg); own work, Ved havet                                                                               | PD-textlogo; explicit trademark warning                         | [SVG](https://upload.wikimedia.org/wikipedia/commons/c/cb/McLaren_Speedmark.svg)        |
| `alpine.svg` / `constructor:alpine`     | 2021–2026              | [Alpine F1 Team Logo](https://commons.wikimedia.org/wiki/File:Alpine_F1_Team_Logo.svg); Alpine F1 Team, Renault press kit https://media.renault.ch/__/137158.478dde41.dl              | PD-textlogo; explicit trademark warning                         | [SVG](https://upload.wikimedia.org/wikipedia/commons/7/7e/Alpine_F1_Team_Logo.svg)      |
| `haas.svg` / `constructor:haas`         | 2022–2026              | [Haas F1 Team Logo](https://commons.wikimedia.org/wiki/File:Haas_F1_Team_Logo.svg); source/author Haas F1 Team                                                                        | PD-textlogo; explicit trademark warning                         | [SVG](https://upload.wikimedia.org/wikipedia/commons/5/54/Haas_F1_Team_Logo.svg)        |
| `audi.svg` / `constructor:audi`         | 2026 only              | [Audi-Logo 2016](https://commons.wikimedia.org/wiki/File:Audi-Logo_2016.svg); brandlogos.net/audi-auto-eps-52114.html, Strichpunkt / KMS Team; original upload log also cites audi.de | PD-textlogo; explicit trademark warning                         | [SVG](https://upload.wikimedia.org/wikipedia/commons/9/92/Audi-Logo_2016.svg)           |
| `williams.png` / `constructor:williams` | 2023–2026              | [Williams Racing Monogram](https://commons.wikimedia.org/wiki/File:Williams_Racing_Monogram.png); own work, DJClements; described as official electric-blue monogram                  | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/) | [PNG](https://upload.wikimedia.org/wikipedia/commons/8/87/Williams_Racing_Monogram.png) |

The initial ranges below are historical **review coverage**, not current manifest
coverage or claims that a logo debuted
or was continuously used in those years. Mercedes uses the source's dated 2022
manufacturer symbol; Alpine's press-kit mark, archived in 2021, is limited to the
Alpine ID (its Commons description has no creation date). McLaren/Williams/Aston
Martin source descriptions date the reviewed representations to 2021/2023/2025.
Ferrari/Haas 2018/2022 lower bounds are conservative archive-version cutoffs, not
brand debut dates. Metadata and upload dates alone do not establish historical
team-brand chronology. These are sponsor-free team/manufacturer identity aids,
not season-exact sponsored livery reproductions. Audi/Cadillac are limited to
their distinct 2026 API constructor IDs; neither inherits Sauber branding. The
upper bound is the reviewed current season, not an assumption about future use.
Earlier or future years remain text-only until explicitly reviewed.

Williams credit and licence are also exposed in the application's Sources page.
The original is unmodified, scaled only for display; no licence or endorsement
claim extends beyond the uploader's work and any separately held brand rights.
The initial delivery excluded Ferrari's copyrighted shield; that decision is
superseded by the user's explicit copyrighted-mark download authorisation.
It is now bundled, not labelled public domain. See
[Ferrari logo category warning](https://commons.wikimedia.org/wiki/Category:Ferrari_logos).

### Initial delivery gaps (superseded)

The initial delivery covered nine of eleven current constructor IDs. `constructor:red_bull`
and `constructor:rb` were name-only at that historical checkpoint. Modern Red Bull Racing 2021/2015 Commons files
were [deleted for copyright](https://commons.wikimedia.org/wiki/User_talk:Papertop);
the [remaining category files](https://commons.wikimedia.org/wiki/Category:Red_Bull_Racing_logos)
describe 2005–2012 marks, which are not applied to 2026. No verified sponsor-free
RB current mark was obtained from the [Racing Bulls source category](https://commons.wikimedia.org/wiki/Category:Racing_Bulls).
At that checkpoint no Visa/Cash App lockups or cropped/redrawn substitutes were used.
The current delivery instead extracts unchanged existing team artwork as documented
in the expanded source register; it does not redraw marks.
Sauber, Renault, AlphaTauri, Toro Rosso, BMW Sauber and other historical
identities were then text-only. These gaps are now covered by the expanded manifest;
no modern successor mark is inferred.

## Surface coverage and sizing

- Full constructor standings and driver affiliations; overview championship
  snapshot and race podium; calendar/event-dialog podiums.
- Constructor profile identity; shared constructor links in race/session and
  archive result views (when a season is supplied).
- Analytics constructor snapshot, leader metrics, driver spotlight and recent
  race/podium affiliations. Chart labels and native selects remain text.
- Explore constructor cards use the same identity component; undated search
  records use explicit season-neutral canonical badges, not an inferred year.
- Cross-year comparison headings remain text, since one mark could misrepresent
  a multi-year range. Profile pages with no selected season use canonical defaults.

The neutral tile uses the Apex `logoTile` colour in both themes, with icon size,
spacing and radius tokens. It preserves black McLaren contrast in dark mode.
RB's unchanged pale-grey artwork and HRT's pale-gold 2012 artwork explicitly select the Apex `logoTileDark`
role in either theme; no brand colours are changed. Fresh SVG inspection confirmed
RB fills almost its entire viewBox and Red Bull's original two-bull/disc geometry
fills its reviewed crop, with no unnecessary whitespace or sponsor artwork.
Names wrap rather than being hidden behind a logo. Both narrow embedded standings
tabs are single-column based on actual panel width, not only viewport width;
driver podium hierarchy is retained. `containerBreakpoints.constructorIdentityCompact`
is the source for generated `constructor-media.css`; regenerate with
`node scripts/generate-constructor-media.js`. CSS variables cannot be used inside
container-query conditions. `--apex-radius-control` already aliases the Apex
shape radius.

The constructor generator now emits **both** tile colour roles by explicit theme
key into its own generated extension. It does not regex-patch `apex.tokens.css`
or depend on light/dark selector order; the approved font roles remain untouched.
Invalid token input leaves generated output unchanged, and repeated generation
is byte-idempotent. No existing full token generator was found in this repository
or its original handoff workspace, so this extension remains deliberately scoped.

## Safety and verification

Build/test-time SVG validation rejects declarations/entities, scripts, event
handlers, external href/src and CSS URLs, embedded stylesheets, raster embeds,
foreign objects and animation/link content. Fragment-only gradients are allowed.
SVGs are loaded as `<img>`, never injected as raw markup. PNG signatures and every
manifest asset/year boundary are checked; downloaded assets cannot silently sit
outside the reviewed manifest. This is scoped static-asset validation, not a
general-purpose sanitizer for arbitrary user uploads.

`npm run build` now runs `scripts/check-constructor-assets.js` as its `prebuild`
guard, including the existing deployment build's internal npm build invocation.
It rejects missing/orphan files, invalid raster signatures and unsafe SVGs before
Vite copies public assets. SVG namespace, `xml:base` and escaped CSS attributes
are also checked. This is not full raster decoding or legal clearance.

## Senior implementation review — current follow-up

Fail-before regressions reproduced historical records borrowing the URL season,
undated links borrowing that season for their badge, generator theme-order and
partial-write bugs, SVG namespace/base-URI/CSS-escape gaps, duplicate React keys,
and the missing production-build guard. The focused four-file run passed 92 tests
after corrections; additional build-guard fixtures exercise actual missing,
orphan and active-SVG failures.

Profile history and race classification now supply each result's actual event
year, falling back only to the supplied session context. Regressions cover 2000
Williams and 2010 Red Bull under a 2026 profile URL. Undated constructor links
use explicit canonical identity defaults for their badge, not ambient URL years;
their existing navigation-context behaviour is retained.

Read-only Chromium QA of the published 2010 Bahrain race loaded all 24 constructor
images, including archive Red Bull/Mercedes/Williams assets, with 2010 constructor
links and no page overflow. The table's computed flex identities kept name and
mark together. Proof: `review-race-2010-system.jpg` in the proof folder below.
System appearance was restored; no viewport override was introduced.

Final follow-up `npm run check` passed lint, **296 tests across 28 files**, the
49-asset prebuild guard and production build. The initial full run had 295 passes
and one test-fixture filesystem-URL failure, corrected before this final run.
The existing large-chunk build warning and jsdom `scrollTo` warning remain.
Both repositories passed `git diff --check`; API code/docs were left untouched
by this follow-up. No imports, database writes, commits, pushes or deployments.
Prettier checks passed for new tooling/tests and the shared component/generated
CSS. RaceDetail's changed regions were checked without reformatting its unrelated
pre-existing long-line/layout differences.

The 281-test expanded-delivery result below is historical evidence from before
this follow-up, not the current review's final count.

Expanded coverage regressions failed before implementation (40 of 43 catalogue
tests, plus the known-undated identity case). The new RB contrast-tile regression
and both-tabs narrow-container contract each failed before their respective fixes.
The final catalogue/identity/cascade and physical asset suites contain 140 tests.
At 390px all eleven current badges loaded successfully without horizontal page
overflow, including the Ferrari shield, Aston wings, Cadillac crest and distinct
Red Bull/RB artwork. Dark and System appearance were checked and System/default
viewport restored. Final `npm run check` passed lint, all 281 tests across 25 files
and production build (existing large-chunk warning; jsdom scrollTo warning).
All 49 manifest assets are physically present and included in `dist`; no missing
or orphan assets remain. All 91 gallery instances (40 defaults, 51 dated variants)
loaded in Chromium, and real 2000 standings loaded all eleven badges without
horizontal overflow. An undated Ferrari profile also loaded its explicit shield.
Renault's source SVG embeds raster layers; the complete unchanged artwork is
rendered to a static PNG with Sharp/libvips, retaining strict SVG validation.
No backend changes, live imports, commits, pushes or deployments were performed.

Final browser proof is saved under
`C:/Users/garya/AppData/Local/Temp/f1-constructor-logo-review/`:
`expanded-archive-gallery.png`, `expanded-standings-2000.png`,
`expanded-undated-ferrari-profile.png`, `expanded-standings-390-system.png`,
`expanded-standings-390-dark.png` and `expanded-overview-1001.png`.

Identity tests first failed because the new component was absent, then passed.
The initial delivery's `npm run check` passed lint, 191 tests across 24 files and the production
build. The focused identity/integration/asset-safety/cascade suite passed 50 tests. The
build retains the existing large-chunk warning. `git diff --check` passed.
Read-only browser checks covered the 1001px embedded constructor panel in dark
and light, 390px full standings (all nine local assets loaded), constructor profile
and analytics identities, without horizontal page overflow in the checked views.
Appearance was restored to System and the viewport override reset afterwards.
Parent browser review found the overview's legacy descendant `span` rule changed
podium identities to block layout. A scoped shared design-system selector now
keeps the mark beside the name, using the existing small icon and spacing tokens.
The explicit stylesheet contract failed before this correction; 14 additional
DOM/CSS surface fixtures exercise late route styles. jsdom does not reproduce
Chromium's specificity conflict, so its fixture checks alone are not sufficient
visual proof. Chromium at 1001px subsequently confirmed Mercedes and Ferrari
names on one line beside 16px tiles. `overview-podium-fixed-1001.jpg` supersedes
the earlier overview screenshots for this podium layout.
Browser checks use only published local data; no refresh/import is needed.
Deployment and production verification of this logo change remain pending; no
commit, push or deployment is performed by implementation.
