# Championship exchanges

This study records how championship kickboxers build a round out of exchanges: how much of it is fighting, how combinations are composed, how defence turns into attack, how feints and patterns work, which answers meet which attacks and what each pairing can produce, and the targets a composed round must meet. Single techniques (the punch, the round and push kick, the knee, the guard, footwork steps and the defences) are performed by the installed `punch`, `kick`, `knee`, `guard`, `step` and `defend` actions, which carry their own studies, so this study does not restudy their body mechanics. Each observation carries its kind as the [index](../index.md#observation-kinds) defines it, and every source id is in the [index](../index.md#sources).

## Activity structure {#activity}

- [reported] In 17 GLORY World Series middleweight bouts (85 kg, 2019), fighters spent on average 234.6 s in high- and low-intensity activity against 36.0 s of pauses, an effort-to-pause ratio of about 1.8:1; winners performed "more attacks, effective attacks, and attacks in sequence" (`CALABRESE-2024`, abstract; the full text, with per-action durations, was not accessible).
- [reported] In 45 amateur WAKO full-contact bouts of three two-minute rounds, a high-intensity action lasted 2.2 ± 1.2 s, the low-intensity activity between them 2.2 ± 0.7 s (the abstract prints 2.3 ± 0.8), and consecutive high-intensity actions were 3.4 ± 1.2 s apart; rounds held 27.1 ± 7.1, 25.1 ± 6.6 and 24.9 ± 6.1 high-intensity actions (`OUERGUI-2014`, Table 2, Table 4, pp. 3539–3540). The authors state a 1:1 fighting ratio, but their own figures give about 40% fighting and 60% not (p. 3541).
- [reported] Ouergui codes steps, slides, bounces, turns and feints as low-intensity activity and blocks, parries, slips and rolls as high-intensity (Table 1, p. 3539); a high-intensity action starts "when 1 foot or hand moved to initiate the attack" (p. 3538).
- [reported] The authors read round one as observation-heavy, fighters studying "the opponent's movements before initiating attacks" (p. 3542).

Translation [inference]: Ouergui's bouts allow no low kicks and run two-minute rounds, so his durations describe the rhythm of an exchange, not GLORY's volume. A GLORY round keeps that rhythm, an exchange of about two seconds and a gap of about two, with exchanges starting about every three to four seconds, while GLORY's higher effort-to-pause ratio means the gaps are filled with footwork and feints rather than pauses.

## Output {#output}

- [reported] GLORY's statistics count strikes landed per minute of GLORY fight time: Giorgio Petrosyan 8.22 at 48.74% accuracy over four GLORY fights (`GLORY-PETROSYAN`); Rico Verhoeven 10.26 at 52.73% (`MMAPLUS-VERHOEVEN`, archived copy); Alex Pereira 9.57 over his last nine GLORY fights (`FIGHTFORECAST-PEREIRA`).
- [reported] In GLORY's official count of Cro Cop against Bonjasky, two veteran heavyweights, each man threw between 18 and 39 strikes per three-minute round (`GLORY-CROCOP-BONJASKY`).
- [reported] In 39 WAKO semi-final and final K1 bouts, a fighter threw 114.27 ± 32.72 strikes per bout, kicks making up 49.2 ± 12.4% of them (`ROMANENKO-2025`, Table 1, p. 69); the bout length is not stated.

Law [inference]: landed rate divided by accuracy puts elite GLORY output at about 16 to 19 strikes thrown per minute of fight time; the veteran heavyweights threw 6 to 13. A championship-level 80 kg fighter in a first round therefore throws about 10 to 19 strikes a minute, feints not counted.

## Combinations {#combinations}

- [reported] In WAKO K1 about half of all strikes are thrown in series (52.7 ± 14.9%, `ROMANENKO-2025` p. 70); "the dominance of short two-strike combinations in all disciplines"; series "were mainly performed with punches, while kicks served a preparatory or finishing role in combinations"; single strikes are mostly kicks, at about two single kicks to every single punch (pp. 70–72, abstract). Longer series of three or four punches, or three punches and a kick, are "rare" (p. 72).
- [reported] Dutch-style coaching finishes punch combinations with a kick: "it doesn't matter if we set up the kick with one punch or four punches, as long as I am finishing with a kick" (`DS-HOOST`, "Connecting Our strikes"); the Dutch style used low kicks "as finishers to combos" (`EVOLVE-DUTCH`).
- [reported] Fight breakdowns: Rob Kaman "closes the distance with a right cross and finishes with a left hook and a right low kick. The left hook is very important in landing the right low kick. In order to block the left hook, opponents have to put weight on the left foot and this makes it difficult to shin-block the incoming kick" (`BE-DUTCH`, Kaman #1). Peter Aerts would "hide [his right high kick] behind punches or pushes" (`BE-DUTCH`, Aerts #2).
- [reported] The low kick is timed to weight on the target leg: "after a series of punches to finish off the combination", or "when your opponent comes forward with a jab", because "most of his weight is on his front leg" (`GLORY-LOW-KICKS`); a hook pushes the opponent "laterally onto their lead leg" (`EVOLVE-LOW-KICK-COMBOS`, combo 3); the time to kick low "is any time weight is being shifted heavily onto one leg" (`MTG-LEG-KICKS`).

Law [inference from the passages above]: an exchange is one fighter's single strike or combination and the other's answers. Most combinations are two strikes; a championship fighter also throws three- to five-strike combinations, rarely, and his longest is an event. Punches lead and a kick stands last, or first as a single. A hook to the body or head before a rear low kick loads the receiver's lead leg, so a low kick that follows a hook lands unless the receiver was already standing on one leg to check.

## Defence that attacks {#defence}

- [reported] The check: "lift your lead leg while keeping your guard high … angle the shin outward slightly"; "a late check is still a failed check. The shin must meet the incoming kick before it reaches its target"; "the rebound from a well-timed check creates a natural window for an immediate right cross, low kick, or teep", fired "while the opponent is still recovering their kicking leg"; "the key is not to pause after the check" (`EVOLVE-CHECK`, How To Check, Key Takeaways, FAQ).
- [reported] "You must counter immediately after checking the kick, failure to do so will just allow your opponent time to attack with another kick or combination" (`DIESEL-LOW-KICKS`, archived copy, a class by GLORY veteran Daniel Sam).
- [reported] "By coming forward and throwing strikes at his opponent's guard, Petrosyan knows that he can counter their return strikes" (`MMASUCKA-PETROSYAN`); the article describes a southpaw, so for two orthodox men the pattern is mirrored.
- [reported] Elite defence: checking "virtually every kick without conscious thought" and a "seamless and automatic" transition from defence to offence (`EVOLVE-CHECK`).

Law [inference]: a defender meets each strike of a combination with the answer its line calls for, changing answers through the combination instead of holding one cover, and counters from the answer's end: from the replanted foot after a check, from the outside position after a slip, from the rising body after a roll. The installed `defend` action performs each answer and decides its timing as in time, late or failed.

## Feints {#feints}

- [reported] A feint "plays out identically to the first portion of a legitimate strike"; the shoulder feint is "a slight change of levels combined with a small forward step", "just the first 30% of jabbing for real", and the hip feint makes "the opponent [react] to the threat of the rear leg kick" (`FP-ADESANYA`).
- [reported] "If I start turning my shoulder, his hands will come up"; a level change goes "two first to the body" and then high (`ARENA-FEINTS`, transcript).
- [reported] "Pivot your rear foot to feint a rear low kick with your rear arm down to draw your opponent's guard down …, and immediately throw a non-fully committed kick aka the fake body kick causing them to drop their hand down, leaving their head and face open. This allows you to go for a high strike (like a powerful cross, jab, or hook)" (`EVOLVE-20-SETUPS`, set-up 5).
- [reported] Pattern then feint: a repeated jab-then-low-kick "causes his opponent to think that the jab will always set up the low kick and they will become likely to check after you throw a jab", after which a hip feint draws the check (`DS-MAININI`; its elbow and grab follow-ups are GLORY fouls and are not used). Kaman liked "feinting kicks and attacking the defending leg" (`BE-DUTCH`, Kaman #2).
- [reported] A feint "is designed to draw a reaction from an opponent, which a fighter will be hoping to exploit" (`EVOLVEVAC-FEINTS`).

Law [inference]: a feint shows the first part of a real technique, about its first third, and returns along the same path. The receiver who reads it starts that technique's answer, and the attack that follows goes at what the answer has left open: a low-kick feint lifts the check and the cross comes while he stands on one leg; a body-kick feint drops the near arm and a punch to the head goes over it. The follow-up's outcome is then decided by its own answer, under the [outcome table](#outcomes): with no answer it lands, with a late one it glances, and a receiver who covers it in time blocks it. A feint that draws no answer is ignored and costs nothing. The answer it draws is always shown on the receiver's body.

## Patterns and habits {#habits}

- [reported] Superbon against Petrosyan (ONE, 2021): "Superbon moved backward and hammered out yet another right body kick. In a flash, he threw another, followed by a left hook", and when Petrosyan countered "he exposed his left side … and Superbon streamlined another right high kick" (`ONEFC-SUPERBON`); "the first two kicks that he sent to Petrosyan's body were telegraphed. That prompted [him] to respond" (`TBT-SUPERBON`); Superbon: "Because I knew that, I changed to hook then followed by a jumping head kick" (`SK-SUPERBON`).
- [reported] "If they aren't reacting to the punches but are overreacting to the body kicks, then you'll know they aren't defending their head" (`MTG-HEAD-KICKS`, strategy 2).
- [reported] The counter-warning: "never throw the same combination repeatedly … because the opponent will see what is happening and easily counter us" (`DS-HOOST`).
- [reported] No retained source states that repeated body kicks teach an opponent to lower the near arm specifically; this was searched for and not found.

Law [choice, built on the passages above]: a habit is a trigger-to-response rule a fighter acquires in the fight. Once an attack the receiver has seen repeated lands on him, he starts that attack's answer at its earliest visible sign, before he can tell what follows. For this bout: after a right body kick lands on his left ribs, the receiver brings his left elbow down over those ribs at every rising right knee of that kicker. The drop answers every rising right knee of that kicker, whatever technique the knee leads, and it is added to the answer the technique's line calls for, under [defence that attacks](#defence), not put in its place: when the knee turns over into a low kick the receiver still answers it as he would without the drop, checking it when his weight allows, his dropped elbow closing down toward his raised knee, so the low kick is checked or lands exactly as the outcome table, the combinations law and the counters after a check would have it without the habit; a knee driven in the clinch meets the dropped elbow; a body kick meets the same elbow block it taught. What the habit opens is therefore only the receiver's head on the side of the dropped arm. The attacker who sees the habit can exploit it, as the Superbon finish and the fake-body-kick set-up show, with a feint that draws the answer and a strike over it. Repeating the pattern also tells a receiver what is coming, which is why the attacker varies what follows the knee.

## Outcome table {#outcomes}

An outcome follows from the attack, the answer and the answer's timing, decided before the bodies realize it. The timing classes are the installed `defend` action's: in time, late, or none (no answer, or an answer to another attack). A pairing absent from the table is not a legal composition [choice, from the laws above and the defence kinds of the installed vocabulary].

| Attack | Answer | Timing | Outcome | Contact |
| --- | --- | --- | --- | --- |
| Jab, cross | Parry | In time | Parried | Glove on the parrying glove |
| Jab, cross | Cover | In time | Blocked | Glove on glove or forearm |
| Jab, cross | Slip, sway | In time | Evaded | None; the glove passes the head |
| Hook, uppercut | Cover | In time | Blocked | Glove on glove or forearm |
| Hook | Roll | In time | Evaded | None; the glove passes over the head |
| Body punch | Elbow block | In time | Blocked | Glove on elbow or forearm |
| Body kick, switch kick | Elbow block | In time | Blocked | Shin on forearm and elbow |
| High kick | High block | In time | Blocked | Shin on forearm beside the head |
| Low kick | Check | In time | Checked | Shin on shin |
| Teep | Parry | In time | Parried | Sole on forearm |
| Any strike | Its answer | Late | Glancing | The strike lands through or past the answer with part of its force |
| High kick | None | — | Glancing | The shin skids off the moving head and shoulder; no high kick lands clean before the finish |
| Any other strike | None | — | Landed | The weapon on the target |
| Clinch knee | Elbow block | In time | Blocked | Knee on elbow and forearm |
| Clinch knee | None or late elbow block | — | Landed or glancing | Knee on stomach or ribs |
| Feint | The answer its shown technique draws | — | Read | None; the answer opens its region |
| Feint | None | — | Ignored | None |
| Brazilian kick | Elbow block started at the body-kick chamber | — | Landed | Instep and lower shin coming down over the lowered arm onto the side of the neck behind the ear, as in the [Brazilian kick](brazilian-kick.md#law) |

Consequences [choice, within the commission's ruling that contacts before the finish cost breath and guard without knockdowns]:

- A landed or glancing body punch, body kick or knee empties the receiver's breath with an audible grunt, folds his near elbow toward the struck ribs and costs him a step of ground or the next beat of attack.
- A landed or glancing low kick moves the receiver's weight off the struck leg; repeated, it leaves the leg slow to bear weight for a moment after each one.
- A landed or glancing punch to the head turns the head with it and opens the guard for a moment; the receiver resets his guard and gives ground.
- A high kick before the finish never lands clean. It is blocked on the forearm beside the head; or, when the block is late, it glances off the cover; or, when nothing answers it, it skids off the receiver's moving head and shoulder. Either glance knocks his head aside, with his covering arm when there is one, and breaks his balance for a step; he covers up and gives ground, and he does not go down.
- A landed teep stops the receiver's forward movement and pushes him back a step or two with an emptied breath; a parried teep turns him slightly off his line.
- A blocked, checked or parried strike stops at the defending limb and costs the defender nothing but position; a check costs the kicker his balance on the checked leg.
- Only the Brazilian kick drops a fighter in this bout, under the [knockout study](knockout.md#fall).

## What marks the level {#level}

- [reported] Winners in GLORY perform more attacks in sequence (`CALABRESE-2024`); kickboxers use "combined actions … rather than using single techniques … to create uncertainty for the opponent" (`OUERGUI-2014` p. 3542).
- [reported] Beginners "throw their strikes separately, and when they try to mix, it doesn't look smooth as they are stopping after each strike" (`DS-HOOST`).
- [reported] Elite checking is automatic and the turn from defence to attack "seamless" (`EVOLVE-CHECK`); elite opponents "have solid defensive skills" that single strikes rarely beat (`EVOLVE-20-SETUPS`).
- [reported] Well-matched technicians can fall into "a turn-based exchange of combinations", the "'your turn, my turn' rhythm", which feints and distance break (`FP-ADESANYA`).
- [reported] "In elite-level boxing and Muay Thai, fighters are typically matched with little to separate them in terms of skill" (`EVOLVEVAC-FEINTS`).

Markers [inference]: at this level strikes flow in combinations without a stop between them, every defence leads into a counter, feints are answered and used, the same combination is not repeated unchanged, and neither man waits his turn.

## Measurable targets {#targets}

Each target is measured on the composed film's schedule; the kind of each is marked.

- [inference] Exchanges start on average every 2.2 to 4.6 s of fighting time, Ouergui's 3.4 ± 1.2 s, and each lasts about one to three seconds.
- [inference] Each fighter throws 10 to 19 strikes per minute of fighting time, feints excluded, from the [output](#output) band.
- [inference] At least half of each fighter's strikes are thrown in combinations of two or more, at or above Romanenko's 48 to 53%; most combinations are two or three strikes.
- [choice] Every kick other than a check, the teep and the clinch knee prepares or finishes a combination or is a single kick; no combination ends in a punch after a kick of the same fighter more than twice in the round.
- [choice] Each fighter leads at least a third of the exchanges, and initiative changes hands within every minute.
- [choice] A clinch lasts one knee and its release, under the [rules](rules.md#legal-actions).
