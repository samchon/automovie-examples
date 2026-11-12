# docs/research/kickboxing/exchanges.md

This study gives the brief, the screenplay and any later code what championship kickboxing under GLORY rules looks like when it is built from single movements: how strikes chain, what a feint draws, how a check is answered, which defences the best fighters actually use, how a defensive habit forms and is exploited, how the ring is used and initiative changes hands, what separates this level from a beginner, what landed blows that do not drop a man look like, which outcomes the exchanges can have, and the measurable targets a viewer would see and hear. It does not restudy the single movements the installed motion vocabulary already performs with its own studies: `punch` (straight, hook, uppercut, feint), `kick` (round kick with the shin, push kick, feint; Gavagan and Sayers 2017 timing), `guard`, `step`, `defend` (cover, parry, elbow block, high block, slip, roll, sway, check), `knee`, `clinch`, `knockdown`, `flinch` and `stagger` (`packages/motions/src/HumanActionName.ts`, `packages/motions/src/striking/kick.ts`, `packages/motions/src/striking/defend.ts`). The Brazilian kick, which the vocabulary lacks, has its own study, [brazilian-kick.md](brazilian-kick.md). The retained originals and their hashes are listed in the [research index](../index.md).

Each observation carries one of four marks: **reported** (a measurement, a rule, a coach's instruction or a reporter's account given by the cited source), **observed** (a direct observation by this study), **inferred** (reasoned by this study from reported material, with the reasoning stated) or **chosen** (the production's own choice, within the reported ranges where they exist). No footage was acquired, so nothing in this study is observed; see [Unavailable](#unavailable).

## The depicted level and the disciplines of the sources {#level}

- The bout is fought under the GLORY Rules 2026: three rounds of three minutes with one-minute intervals (section 5.04 A, p. 11), a single legal knee as the only purpose of a clinch, no elbows, throws or sweeps (section 5.07 A.7, A.10, A.11, pp. 16-17). Reported.
- Two 80 kg men fall in GLORY's middleweight class, over 77 kg up to 85 kg (section 2.01, p. 2). Reported. The nearest measured fighters are therefore GLORY welterweights and middleweights. Inferred.
- No source measures GLORY middleweights on every variable this study needs, so each value below keeps its own source's discipline and level and states its translation:
  - GLORY professional bouts: Calabrese et al. 2024 (17 GLORY 2019 matches, 85 kg, publisher abstract only), GLORY's own fighter statistics (13 welterweight and middleweight fighters, retrieved 2026-11-13) and GLORY's CompuStrike count of one heavyweight bout (Filipovic vs Bonjasky, GLORY 14, 2014). Reported.
  - K-1 professional heavyweights: Čular et al. 2026, 96 K-1 World Grand Prix qualifying matches 1995-2012, under K1 rules of three 3-minute rounds (sections 2.1-2.2, p. 2). Reported.
  - WAKO K1 amateur elite: Romanenko 2025 (2022 WAKO Worlds and 2023 Europeans, 39 semifinal and final bouts of middle weight categories, p. 68) and Rydzik et al. 2021 (15 elite athletes in an international K1 league, height 177.1 ± 4.8 cm, mass 79.1 ± 5.6 kg, Table 1, p. 3). Reported. The Rydzik group is the closest body match to two 180 cm, 80 kg men. Inferred.
  - WAKO full-contact world championships (2009, 2011), which forbid low kicks and knees: Ouergui et al. 2014. Reported. Its time structure is used for exchange granularity only, with that difference stated each time.
- WAKO bouts last three rounds of two minutes (Rydzik et al. 2021, p. 2; Ouergui et al. 2014, p. 3538). Reported. A per-bout count from those sources is converted to a per-minute rate over six minutes. Inferred.

## How combinations chain {#chaining}

### What the numbers say about structure

- At WAKO K1 level about half of all strikes are thrown singly: 57.77 ± 16.73 single strikes and 56.50 ± 29.82 strikes inside series per athlete per bout; the share of strikes thrown in series is 52.7 ± 14.9 % (Romanenko 2025, Table 1, p. 69; p. 70). Reported.
- Series are short: 23.85 ± 12.15 series per bout, so a series averages 56.50 / 23.85 ≈ 2.4 strikes. Inferred from the reported table. By composition: two-strike series (two punches 7.85 ± 5.46; punch-kick or kick-punch 8.31 ± 5.60) are about 68 % of series; three-strike series (two punches and a kick 5.27 ± 4.48; three punches 1.31 ± 2.04) about 28 %; four or more strikes (four punches 0.15 ± 0.46; three or more punches and a kick 0.96 ± 1.22) about 5 % (Table 1, p. 69; shares inferred from the reported means).
- Series are mostly hands; kicks open or close them. In K1, strikes inside series are hands 41.96 to kicks 14.54, about 2.9 to 1, while single strikes are kicks 37.92 to hands 18.04 (pp. 70-71). Reported. The author reads kicks as playing "a preparatory or finishing role" in combinations (abstract, p. 67). Reported.
- In GLORY middleweight bouts, winners threw more attacks in the second round and over the match, more three-attack sequences in round 2 and more sequences of over three attacks in round 3 (Calabrese et al. 2024, abstract). Reported.
- Among K-1 heavyweights, each landed rear-hand uppercut to the head, lead-hand hook to the head and rear-leg low kick to the opponent's lead leg raised the odds of winning (odds ratios 1.23, 1.17, 1.12; Čular et al. 2026, Table 3, p. 5). Reported.

### The chaining law

| Link | Why it chains | Source and mark |
| --- | --- | --- |
| Rear straight into lead hook or lead-side middle kick | The rear hand's throw leaves the hips turned and loaded, so the lead-side hook or kick fires from the return | Hoost via Dynamic Striking, article body. Reported |
| Lead hook into rear middle (body) kick; jab into lead middle kick; rear straight into lead middle kick | The punch closes the high line and draws the guard up; the kick goes to the body the guard has left | The combinations: Hoost via Dynamic Striking. Reported. The reason: inferred from the high-and-low alternation Hoost gives (next row) |
| Punch combination finished with a low kick (the Dutch pattern) | A punching combination ends with the outside low kick; the kick lands on a lead leg that carries weight when the opponent jabs forward or plants to punch | de Jong, GLORY "The Art of Low Kicks", outside low kick section. Reported |
| Low kick against a punching attack | A man must plant to throw power punches, so a kick to the planted leg spoils his combination and his balance | de Jong, inside low kick section. Reported |
| High and low alternation | A fighter who defends high opens his lower body and the reverse | Hoost via Dynamic Striking. Reported |
| A long sequence such as right hand, left hook, right low kick, left hook, right hand, left middle kick | Each strike lands from the stance the previous one left; the sequence can run in reverse and kicks can lead punches | Hoost via Dynamic Striking. Reported |
| Kick, then replant, then punch | A round kick's recoil is the longest phase (69 % of execution in a static test); in competition a kicker must return the leg to the ground promptly to keep balance and limit openings, so the next strike starts from the replant | Gavagan and Sayers 2017, pp. 8, 10. Reported; applied to chaining, inferred |

For this production: a combination is written as a chain of the vocabulary's `punch`, `kick` and `step` actions in the order above, each link starting from the stance the previous one leaves. Chosen.

## How a feint works and what it draws {#feints}

- A feint is a half-thrown technique meant not to land but to make the opponent flinch; it only draws a real reaction once the opponent respects the real technique (Evolve MMA, "How to use feints and setups in Muay Thai", article body). Reported.
- Reactions it draws: the guard closes in front of the face; the opponent lifts a leg to block a low kick, standing on one leg; after continued attacks to the lower body, the hands of all but the most disciplined fighters "start to drop a little" when they think the head is safe (same article). Reported. A shoulder feint raises the opponent's hands and makes him compress; repeated down the middle, it centralizes his hands and opens the outside lines; the feinter can switch his feet unseen while the eyes follow the shoulder (Salvador, The Arena, transcript). Reported.
- How a leg-kick feint is made: a small hip snap with the feet planted, or a lift of the kicking foot that becomes a step in (Evolve feints article). Reported. The vocabulary's `punch` and `kick` feints perform the movement; this study supplies only what the feint is for.
- Time-motion analysts class feints as low-intensity activity, alongside footwork (Ouergui et al. 2014, Table 1, p. 3539). Reported. A feint is therefore placed in the gaps between exchanges, not counted as one. Inferred.
- Deception as a tactic: providing "false affordances" that evoke an action the deceiver then exploits (Krabben et al. 2019, p. 1833). Reported.

## The check and its counter {#check-counter}

- The check: as the kick comes, lift the lead leg with the guard high, angle the shin slightly outward, turn the hip a little so the shin meets the kick at a strong angle, then return the leg quickly to the stance (Chaowalit, Evolve, "How to check kicks in Muay Thai"). Reported. Point the knee toward the attacking leg with the toes up so the attacker's lower shin lands on the defender's thicker upper shin; the alternative defence is to pull the leg back so the kick misses (de Jong, GLORY, Defending low kicks). Reported.
- The counter: replant quickly and use the check's rebound to start the counter without a pause; the usual immediate counters are a right cross, which lands while the attacker is still recovering his kicking leg, or an inside low kick to his support leg as his weight shifts (Chaowalit, Evolve). Reported. The vocabulary's `defend` law lets a defence flow into a counter `punch` once the strike has passed (`defend.ts` cancel table); a counter kick after a check is a new `kick` from the replanted stance. Inferred.
- A top-level variant: catch the kick, pull the leg to the centre and throw a hard left hand as the leg drops (Lung, MMA Sucka, on Petrosyan). Reported. Under GLORY a caught leg may be held only to throw one immediate strike, with at most one step, then released (section 5.07 A.12, p. 17). Reported.
- At K-1 heavyweight level the lead-leg check ("low block with lead leg") occurs 1.79 ± 2.98 times per fighter per match (Čular et al. 2026, Table 2, p. 4). Reported.

## Which defences the top fighters actually use {#defences}

| Defence | Frequency per fighter per match (K-1 WGP heavyweights) | Source and mark |
| --- | --- | --- |
| Hand blocks against punches (high guard, cover) | 18.68 ± 22.54, the most frequent defensive structure | Čular et al. 2026, Table 2, p. 4. Reported |
| Hand blocks against leg attacks (arm and elbow on body or head kicks) | 5.31 ± 7.16 | same. Reported |
| Hand blocks against knee strikes | 2.04 ± 4.46 | same. Reported |
| Low block (check) with the lead leg | 1.79 ± 2.98 | same. Reported |
| Right lean or shoulder roll | 1.39 ± 3.18 | same. Reported |
| Slips left and right | coded by the study (V_53, V_54) but not among the structures in its reported table | Table 1, p. 3; Table 2, p. 4. Reported; frequency unavailable |

- Each additional hand block against punches lowered the odds of winning by about 4 % and each hand block against leg attacks by about 10 %; the authors read frequent blocking as a reaction to being under sustained pressure, not as its cause (Table 3, p. 5; Discussion, p. 5). Reported.
- In WAKO full contact the activity classes for defence are block or parry, slip left or right, roll, and foot defence (Ouergui et al. 2014, Table 1, p. 3539). Reported.
- High kicks are blocked by tensing the arm on the kicked side so the hand is not driven into the face, holding it to the head "almost as if you are on the phone", and adding the other arm against a hard kicker (Skarbowsky via Dynamic Striking). Reported.
- Limits of slips, parries and rolls against kicks and knees: a slip or roll moves the head off the line of a punch (the vocabulary's own definitions in `defend.ts`); it does not move the trunk or legs, so it cannot defeat a body kick, a low kick or a knee to the body; it can take the head under or away from a high kick only when it starts early, because a kick's preparation is visible but its path sweeps a wider arc than a fist. Inferred. A parry turns a fist aside with the opposite glove; no source describes parrying a kick at this level. Inferred from the absence of any parry against kicks in the coded structures (Čular et al. 2026, Table 1, p. 3).
- For this production: blocks and covers are the default answer to most strikes; checks answer low and body kicks; slips, parries and rolls answer punches, and each man shows each of them at least once because the commission names them. The frequency ordering stays blocks first. Chosen.

## The immediate knee in the clinch {#clinch-knee}

- Clinching or holding is a foul "other than to immediately attack with a single legal knee strike; after the legal knee strike the Athlete must disengage the clinch immediately" (GLORY Rules section 5.07 A.11, p. 17). Reported. Legal knees include the front knee and the round knee to legal targets (section 5.06 A.3, p. 13). Reported.
- The referee interrupts with the command "Break", steps between the athletes, and each takes a step back before fighting on without a further command; techniques after "Break" are fouls (section 5.05 A.2, p. 12; section 5.07 B.2, p. 17). Reported.
- Among K-1 heavyweights, "outer clinch and holds" occur 7.73 ± 8.55 times per fighter per match, and rear-leg knees to the body land 1.43 ± 3.05 times (Čular et al. 2026, Table 2, p. 4). Reported. Those bouts span 1995-2012 under K-1's own rules, so the hold count is an upper bound for a GLORY bout where a hold is legal only for one knee. Inferred.
- Clinching rises in later rounds, especially by fighters ahead, to block an opponent's attacks (Ouergui et al. 2014, p. 3541). Reported. In GLORY 14, the third round saw Filipovic push Bonjasky backward round the ring and initiate clinches (GLORY CompuStrike article, round three paragraph). Reported.
- For this production: each clinch is entered for one knee and the knee is thrown at once; the men release by themselves, except that at least one grip in the round is slow to open after its knee and the referee breaks it, because the commission names clinch breaks among his duties. The vocabulary's `clinch` and `knee` actions perform the grip and the strike. Chosen.

## How a defensive habit forms and is exploited {#tell}

### What the sources say

- Repeated work on one target changes where the guard goes: continued attacks to the lower body give "a false sense of security when it comes to the head" and the guard starts to relax and drop, and a head kick is set up in stages: leg kicks while glancing at the leg, body shots to lower the guard, a faked leg kick, then the head kick (Evolve feints article). Reported.
- Coaching texts on the question-mark kick name the same conditioning: "a few hard roundhouse kicks to the body" because "it doesn't take much before your opponent starts dropping their hands to protect their body", then, once the opponent starts blocking the body kicks, a knee lift with a pause before the kick goes high (Evolve, "How to throw a question mark kick", body-kick variation); a different kick thrown first "to get your opponent to drop their hands" (Shutts, LowKickMMA, front-leg variation). Reported.
- A champion's account of a read reaction exploited at the top level: Superbon said he studied Petrosyan's fights, learned that after the usual left hook and right cross Petrosyan would "land back and throw a left punch", used his hook to measure, and changed the finish to "hook then followed by a jumping head kick", which knocked Petrosyan out (Superbon quoted by Wheaton, Sportskeeda 2022, article body). Reported. The trap works by keeping the start the opponent has learned and changing the end. Inferred.
- A top fighter reads where a guard goes before he commits: Petrosyan is "constantly touching" the guard of opponents who come forward, then pushes off, pivots or ties them up (Lung, MMA Sucka). Reported.
- No measured study gives how many repetitions it takes to form such a habit in a bout, or the latency of the conditioned arm drop. Unavailable.

### How the tell forms and is proved in this bout

The commission rules that B learns during the round to drop his left arm whenever A's right knee rises, that A proves it with a feint and that the finish starts as the expected right body kick. Both men are orthodox, so A's right round kick to the body lands on B's left ribs and B's left (lead) arm is the arm that covers them. Chosen; the stance is the production's choice, the side follows from it.

| Stage | What is seen | Mark |
| --- | --- | --- |
| 1. A's right body kick lands | A's right knee rises from his rear-leg stance and his shin lands on B's left ribs; B's guard was high, so the contact costs him breath | Chosen; the cost is inferred from the effects section below |
| 2. B adapts | On the next right body kicks B drops his left elbow over his ribs and the kick lands on the arm (an elbow block, `defend` kind `elbowBlock`) | Chosen; the reaction is the one the sources name (hands drop after body work) |
| 3. The habit shows | B's left arm starts down as soon as A's right knee rises, before the kick's line is decided, including when A throws other strikes from the same knee lift; the movement's law is [the learned arm drop](#arm-drop) below | Chosen |
| 4. A proves it | A raises the right knee as for the body kick and does not kick (a `kick` feint); B's left arm drops; A replants the right foot forward and lands his right hand over the arm to the now open left side of B's head | Chosen; the feint mechanism is reported (Evolve feints article). Only A's right-side weapons reach B's left side when both men are orthodox and face each other; a left hook would land on B's right side, which his right glove still covers. Inferred |
| 5. The finish | A's right knee rises the same way; B's left arm drops; the kick turns over and its shin comes down over the arm, landing at 150.000 (see [brazilian-kick.md](brazilian-kick.md)) | Commission ruling; the mechanics are that study's |

- Counts. The sources say "a few" or "a couple" of body kicks; the production translates that into three to five right body kicks that land or are blocked before stage 3, two to three rising-knee moments in which the drop is visible before the proof, and one proving feint, all before 150 s. Chosen.
- Spacing. Under the targets below, each fighter throws roughly 37 to 66 strikes in the 180-second round and about half of WAKO K1 strikes are kicks, so a body-kick plan of five to eight right kicks across 150 s is a small share of A's output. Inferred; the plan size is chosen.

### The learned arm drop {#arm-drop}

The vocabulary's `elbowBlock` brings the elbow down over the ribs with "the glove kept at the jaw" (`defend.ts`), which is the correct block and leaves the head covered. The learned drop is its faulty form, the one the sources name when hands "start to drop" after body work (Evolve feints article; Evolve question mark kick, body-kick variation). Reported for the fault; its law below is the production's, built from the block it corrupts.

| Element | Law | Mark |
| --- | --- | --- |
| Trigger | The visible start of A's right knee rising from the stance, whatever it turns into | Commission ruling |
| Onset | B's left arm starts moving 0.10 to 0.20 s after the knee starts to rise, before the kick's line can be read | Chosen. A learned anticipatory response is placed at or below the 245 to 472 ms manual responses naive viewers gave to kicks on video (Sinnett et al. 2018, p. 6, retained for the sound study), because B answers the knee, not the kick |
| End pose, in B's body frame | Left elbow down against the left lower ribs, forearm near vertical along the flank, left glove lowered from the jaw to the level of the left chest or shoulder, so the left side of the head from jaw to temple is open; trunk turned slightly to the left toward the expected kick; right glove stays at the right jaw | Chosen, as `elbowBlock` with the glove not kept at the jaw |
| Movement into the pose | 0.10 to 0.15 s from onset, so the arm is fully down 0.20 to 0.35 s after the knee starts to rise | Chosen |
| Duration | Held 0.4 to 0.7 s, at least the time the expected body kick would take to arrive, then the glove returns to the jaw in 0.2 to 0.4 s | Chosen to exceed the kick's 0.27 to 0.36 s launch-to-contact, a value derived from the phase shares of Gavagan and Sayers 2017, Table 2, applied to its 1.02 s execution time |
| Timing at the finish and the proof | At the finish the arm is fully down before the shin arrives. The knee starts to rise at the kicking foot's toe-off, 0.06 to 0.09 s after launch ([Brazilian kick study](brazilian-kick.md#law), P1), so the arm is fully down 0.26 to 0.44 s after launch, and the finish's launch comes at least 0.45 s before contact, between 149.50 and 149.55 s, the window that study sets. At the proof the right hand lands while the arm is held: 0.5 to 0.9 s after the knee starts to rise, after the feinting foot has replanted | Chosen, from the onset, movement and hold above |
| Support | Feet planted; no step; weight settles slightly onto the left leg as the trunk turns | Chosen |
| What it costs B | While it is held, the left side of his head has no cover; a strike from A's right side that arrives in that window lands | Inferred |

### Pivots {#pivots}

The commission names pivots; the vocabulary's `step` keeps the stance while moving forward, back or sideways and has no turn about one foot (`packages/motions/src/striking/step.ts`, by its own description in `HumanActionName.ts`). The law:

| Element | Law | Mark |
| --- | --- | --- |
| Pivot foot | The ball of the lead foot (to turn off the line after a kick or out of a corner) or of the rear foot (to turn the opponent as he comes in) | Reported, in paraphrase: a fighter rotates on the lead or the rear foot to change the angle of attack or defence (Evolve, "Strategic footwork"); the uses are inferred |
| Turn | 30 to 90° about the pivot foot in one movement | Chosen |
| Travel | The other foot sweeps an arc and lands back at its stance distance from the pivot foot; the straight-line distance it travels is 2 · d · sin(θ / 2) for a foot separation d and a turn θ, about 0.25 m for d = 0.5 m and θ = 30° up to about 1.25 m for d = 0.9 m and θ = 90° | Inferred by geometry; d is the vocabulary's own stance for the real body, with 0.5 to 0.9 m as the range considered |
| Duration | 0.3 to 0.6 s | Chosen |
| Guard | Both gloves stay at the guard through the turn | Chosen, from the guard markers in the [level markers](#level-markers) |

## Spatial strategy, tempo and initiative {#ring}

### Footwork and ring use

- Cutting off the ring: do not follow; stay directly in front of the opponent and move parallel to him; close the space slowly, because moving too fast lets him counter or escape; once the space is cut, he is trapped and can be attacked (Atlas via Dynamic Striking). Reported.
- Angles and pivots: rotate on the lead or rear foot to change the angle of attack or defence; circle laterally around the opponent to keep distance or to flank him; anticipate his movement to cut off escape routes (Evolve, "Strategic footwork", article body). Reported.
- Ropes and corners: holding the ropes for any reason is a foul, as are techniques against an opponent tied up in the ropes and pushing him backward over them (GLORY Rules section 5.07 B.3-B.5, p. 17). Reported. A man on the ropes can still fight; the ropes only end his retreat. Inferred. A man counts as down when a damaging attack would have put him on the floor if not for the ropes (section 5.05 B.1.a, p. 12). Reported.
- Range management by kicks: against a puncher stay at kicking distance and kick his legs whenever he punches (de Jong, GLORY). Reported.

### Distance

- Body-scaled distances afford different strikes: at near and far distances fighters are relatively safe but unlikely to land; a middle, meta-stable distance affords multiple strikes at higher risk (Krabben et al. 2019, p. 1829, after Hristovski et al. on boxers). Reported. Expert kendo pairs settle at a far and a near stable distance and pass through the unstable distances between them to attack or reposition (p. 1831). Reported.
- Translation to this bout: four distance classes, each defined by which weapon reaches: outside (no strike reaches without a step), kicking range (the shin reaches the thigh, ribs or head), punching range (the gloves reach the head), and clinch (bodies in contact, only knees). The exchange happens in kicking and punching range; low-intensity time is spent at the edge of kicking range. Inferred. The metres of each class are not measured for elite kickboxing. For two 180 cm men, measured as the horizontal distance between the two pelvis centres, the classes are contiguous: clinch under 0.5 m; punching range 0.5 to 0.9 m; kicking range 0.9 to 1.4 m; outside from 1.4 m, with observation at 1.4 to 2.0 m. Inferred: a 180 cm man's arm span of about his height puts a straight punch's fist about 0.75 m beyond the shoulder, which with the trunk's turn reaches a head whose pelvis is about 0.6 to 0.9 m away; a leg of about 0.9 m strikes with the lower shin, about 0.6 to 0.8 m from the hip, and the hip's turn toward the target and the target's own half-width add about 0.2 to 0.4 m, so a round kick lands at about 0.8 to 1.2 m between pelvis centres. The bands are chosen around those points: kicking range is set at 0.9 to 1.4 m to include a kick thrown with a lean or a half step from its far edge, and a kick at 0.8 to 0.9 m lands on the boundary with punching range, where both weapons reach. The motion vocabulary's own reach solve (`kick.ts` contact band and step-up) decides the exact contact for the real bodies, and these bands only classify where the men stand.

### Tempo and initiative across the round

- First rounds hold more low-intensity time and more separate high-intensity actions, with fewer and shorter referee pauses; later rounds hold fewer, longer sequences and more pauses (Ouergui et al. 2014, Tables 2-4, pp. 3539-3540, and p. 3542, where round 1 is read as observation of the opponent before attacking). Reported.
- In GLORY, winners separate themselves by attack volume in the second round and over the match, and by longer sequences late (Calabrese et al. 2024, abstract). Reported.
- Initiative changes between rounds in a single top bout: Bonjasky outstruck Filipovic in round 1 (9 of 22 against 5 of 18), Filipovic won round 2 (13 of 24 against 10 of 31), and in round 3 Filipovic pushed Bonjasky backward and clinched (GLORY CompuStrike article). Reported.
- GLORY judges rank "degree of aggressiveness or ring domination" fourth, after knockdowns, damage and clean strikes, and prioritize attack over defence (section 5.06 C.4, p. 14). Reported.
- For this production's single round: the opening phases are the observation-heavy part (more feints and footwork, single strikes and short series); B leads much of the round with long combinations and low kicks while A answers with body kicks and angles; initiative passes back and forth at least once per 30 seconds, with each fifteen-second phase changing who leads, where in the ring the exchange happens, or what one man has learned; the fight reaches the ropes and corners and returns to the centre by pivots and circling. Chosen, from the reported trends and the commission's progression and whole-ring rulings.

## Markers of championship level against a beginner {#level-markers}

| Marker | Championship value | Beginner or lower value | Source and mark |
| --- | --- | --- | --- |
| Activity-to-rest ratio | 1:1 (international full contact) | 1:2 to 1:5 (amateur and national level) | Slimani et al. 2017, abstract p. 185, pp. 192-193. Reported |
| Kick execution time | 0.254 s for expert taekwondo competitors | 0.317 s for novices | Falco et al., reported by Gavagan and Sayers 2017, p. 10. Reported; from taekwondo, translated as a speed ratio only |
| Kick recoil | Leg returned to the ground promptly to keep balance and limit openings: the kicking foot back on the canvas 0.3 to 0.6 s after contact | A delayed return, like the 0.65 ± 0.17 s recoil experts showed against a static pad | Gavagan and Sayers 2017, p. 10 for the marker and p. 8 for the static value. Reported. The competition range is chosen below the static value, which the authors say exceeds competition |
| Accuracy | 38.4 to 52.4 % of strikes landed among 13 GLORY welterweights and middleweights | No beginner value retained | GLORY fighter statistics pages, career aggregates of a roster whose records range from losing to championship. Reported. Applied as the range for two championship-level men by inference: the roster is GLORY's professional level, the nearest retained to championship; unavailable for beginners |
| Volume and sequences | Winners throw more attacks and longer sequences; in this bout both men stay inside 12 to 22 strikes thrown per minute and the leading man is at the upper half of it | Losers throw fewer | Calabrese et al. 2024, abstract, for the direction; the abstract gives no per-group values. Reported. The range is the [targets](#targets) row; its use is chosen |
| Defence | Blocks dominate; frequent passive blocking marks the man under pressure | No beginner value retained | Čular et al. 2026, Tables 2-3, pp. 4-5. Reported |
| Feints | Respected strikes first, so feints draw real reactions; setups look the same and change the finish | A feint without a respected strike behind it draws nothing | Evolve feints article; Superbon via Sportskeeda. Reported |
| Range sense | Experienced fencers estimate their own maximum striking distance more accurately | Juniors estimate it less accurately | Krabben et al. 2019, p. 1829. Reported from fencing; translated as precise range use |
| Composure under fatigue | Heart rate 178.2 ± 5.5 bpm after round 1 and 185.0 ± 3.4 bpm after round 3, lactate 11.3 ± 1.4 to 14.6 ± 1.9 mmol/L, while technique continues | No beginner value retained | Rydzik et al. 2021, Tables 2-3, pp. 3-4. Reported |

For the screenplay these become visible behaviour: both men keep the gloves home between strikes, return each kick to the stance before the next action, throw two- and three-strike chains with occasional longer ones, block most strikes and slip or roll some punches, and keep fighting while breathing hard. Inferred from the table.

## What landed blows that do not drop a man look like {#non-finishing-contacts}

The commission rules that contacts before 150 s cost breath, guard and balance without a knockdown. Only visible behaviour is recorded here.

- GLORY scores "High Impact Damage (wobble, staggering, or reduced functionality as a result of a legal strike)" above clean strikes (section 5.06 C.2, p. 14). Reported. A referee watches whether a fighter's hands are up, whether his head snaps back from punches and whether his legs are wobbly or sturdy (ABC referee manual, p. 7; boxing, translated to the same visible signals in kickboxing). Reported. Before 150 s every contact stays below those stopping signals: the legs stay sturdy, the hands come back up within 0.5 s, and a glancing blow turns the head by no more than about 30° and lets it return within 0.3 to 0.6 s, where a snap would throw it back or round by 45° or more. Chosen, by the commission's no-early-knockdown ruling; no measurement of head movement under glancing blows was retained.
- Breath: heart rate and lactate climb from round 1 (Rydzik et al. 2021, Tables 2-3). Reported. Both men breathe audibly and the shoulders rise with breath between exchanges; after a landed body kick the struck man takes 40 to 55 breaths a minute for 3 to 6 s, with the shoulders rising 1 to 3 cm on each, against 25 to 40 early in the round, then settles. Chosen; no breathing rate in combat sport was retained, and the rates are the [ring sound study's](../sound/ring-sound.md#targets) choices.
- Guard: hands drop after repeated body work (Evolve feints article). Reported. After a landed body kick the struck man's elbow on that side clamps to the ribs and his glove on that side sits a hand's width lower than before for the next two to four exchanges. Inferred; the depth and span are chosen.
- Balance: a landed low kick throws the man off balance so he cannot punch hard or finish his combination (de Jong, GLORY). Reported. The struck leg unweights and its foot shifts 0.05 to 0.2 m or takes one step within 0.5 s of the contact. Inferred; the values are chosen.
- Reset: in later rounds fighters clinch more to block attacks (Ouergui et al. 2014, p. 3541). Reported. A man who has been hurt moves out of range or ties up. Inferred from that use of the clinch. In this bout the reset is a step back out of kicking range, a pivot off the line, or one clinch knee and release. Chosen.

## Outcome table {#outcomes}

The defender's response is timed by the vocabulary's defence law as in time, late or failed (`defend.ts`, `DefenceOutcome`); the rows below give which outcome class each combination of intents yields.

| Attacker intent | Defender response | Outcome class | What is seen | Source and mark |
| --- | --- | --- | --- | --- |
| Any strike thrown short or at a man who steps back | Steps back, pulls the leg back, or simply out of range | Missed | The weapon reaches full extension in the air; the attacker recovers to stance | de Jong (pull the leg back); Čular et al. 2026 code strikes without contact as feints or tactical executions, Table 2 note. Reported |
| Punch to the head | High guard or cover in time | Blocked | Glove meets glove or forearm; the defender's head stays behind the guard | Čular et al. 2026, V_16, Table 2. Reported |
| Straight punch | Opposite glove meets the fist and turns it aside in time | Parried | The fist passes beside the head | Ouergui et al. 2014, Table 1 (block/parry). Reported |
| Straight or hook to the head | Head moves outside the punching arm in time | Slipped | The fist passes beside the head; the defender is outside the arm, set to counter | Čular et al. 2026, V_53-V_54, Table 1; vocabulary `slip`. Reported |
| Hook to the head | Knees bend and the head drops under the line in time | Rolled under | The hook passes over the head; the defender rises on the other side | Čular et al. 2026, V_55-V_56; vocabulary `roll`. Reported |
| Low or body round kick | Lead leg lifted, shin turned out, in time | Checked | Shin meets shin; the kicker's leg rebounds; the checker replants | de Jong; Chaowalit, Evolve. Reported |
| Body or high round kick | Elbow dropped over the ribs or forearm braced beside the head in time | Blocked (on the arm) | The shin lands on the arm; the defender's trunk takes the push | Čular et al. 2026, V_15; Skarbowsky. Reported |
| Any strike | Defence late or partial | Landed glancing | Contact on the target through or past a partial cover; the head turns or the trunk gives with the blow, legs sturdy | Inferred from the "contact made" coding that pools landed and blocked contacts (Čular et al. 2026, Table 2 note); the class is chosen |
| Any strike | No defence, or defence failed | Landed clean | Full contact on a legal target from the correct distance and position | GLORY Rules section 5.06 A, p. 13 (legitimate scoring technique). Reported |
| Any strike, answered | Check, block, slip or roll, then a strike before the attacker recovers | Countered | The attacker's strike fails and the defender's lands as the attacker returns to stance | Chaowalit (counter after the check); Lung (catch and counter); Superbon via Sportskeeda (expected counter). Reported |
| Clinch entry | Clinch taken; no defence or a hand block against the knee | Clinch knee | One knee to the body or the leg, then release | GLORY Rules section 5.07 A.11, p. 17; Čular et al. 2026, V_17, V_48. Reported |
| Feint (knee or shoulder) | The defender reacts to the feint | Feint drew reaction (no contact), opening the line the reaction leaves | Guard closes, arm drops or leg lifts; the next strike goes to the opened line | Evolve feints article; Salvador. Reported |
| Clean strike with damage | None | Knockdown | Any part of the body other than the feet touches the floor, or the ropes hold the man up, or the referee gives a standing eight count | GLORY Rules section 5.05 B.1, p. 12. Reported. Used only at the finish (commission) |

## Measurable targets {#targets}

Per-fighter targets; a fifteen-second phase is one twelfth of the round. Translations are stated.

| Target | Reported value and level | Method and uncertainty | Translation to this bout | Per fifteen-second phase |
| --- | --- | --- | --- | --- |
| Strikes thrown per minute | GLORY: 12.3 to 22.0, derived as landed per minute divided by accuracy for 13 welterweights and middleweights (SLpM 5.15 to 10.66; accuracy 38.4 to 52.4 %). WAKO K1 elite: 112.3 ± 29 offensive actions per bout (range 53 to 160) (Rydzik et al. 2021, Table 4) and 114.27 ± 32.72 strikes per bout (Romanenko 2025, Table 1). GLORY heavyweight bout: 81 and 89 thrown in nine minutes | GLORY career aggregates of unstated method (CompuStrike for the 2014 bout); WAKO counts from expert video coding; heavyweights are slower | 12 to 22 per minute per fighter; WAKO six-minute bouts give 18.7 ± 4.8 and 19.0 ± 5.5 per minute, inside the GLORY range. Inferred | 3 to 5.5 per fighter, 6 to 11 for both men |
| Strikes landed per minute | GLORY: 5.15 to 10.66 (SLpM, same 13 fighters) | Definition of "landed" not stated on the pages | 5 to 11 per minute | 1.3 to 2.7 per fighter |
| Kick share of strikes | WAKO K1: 49.2 ± 12.4 % (Romanenko 2025, p. 70); GLORY heavyweight bout: 21 % (Filipovic) and 70 % (Bonjasky) | Expert coding; one GLORY bout shows the spread between styles | 35 to 60 % per fighter, the punching-leaning man lower | Chosen within range |
| Strikes per series | WAKO K1: mean about 2.4; two-strike series about 68 %, three-strike about 28 %, four or more about 5 % | Inferred from Romanenko 2025, Table 1 means | Mean 2 to 3; longest series 4 to 6, rare | Chosen within range |
| High-intensity action (exchange) duration | WAKO full contact: 2.2 ± 1.2 s; 3.4 ± 1.2 s between consecutive actions; low-intensity spells 2.2 ± 0.7 s (Ouergui et al. 2014, Table 2) | One trained observer, ICC 0.99 for HIA; no low kicks or knees in that ruleset | Exchanges of 1 to 3.5 s | 2.4 to 4.3 exchanges (27.1 ± 7.1 to 24.9 ± 6.1 per 2-min round, Table 4, scaled to 15 s) |
| High- to low-intensity time | GLORY 85 kg: 234.6 ± 133.9 s high, 97.4 ± 60.1 s low, 36.0 ± 19.9 s pause per match, effort-to-pause about 1.8:1 (Calabrese et al. 2024, abstract). WAKO full contact: about 40 % fighting, 60 % non-fighting (Ouergui et al. 2014, p. 3541) | GLORY: abstract only, coding rules unseen; the two studies define high intensity differently | 40 to 64 % of the round is exchange | 6 to 10 s of exchange |
| Pauses (referee) | WAKO full contact: 5.4 ± 4.5 s each, 2.2 ± 1.8 per 2-min round in round 1 (Tables 2, 4); GLORY 85 kg: 36.0 ± 19.9 s per match, over 38 rounds in 17 matches about 16 s per round | Abstract counts; rounds that ended early are included | 1 to 3 pauses before 150 s, each a "Break" of 1 to 3 s, at least one because the commission names clinch breaks; the other clinches release themselves | Chosen within range |
| Clinch frequency and duration | K-1 heavyweights: outer clinch and holds 7.73 ± 8.55 per fighter per match (Čular et al. 2026, Table 2) | Older K-1 rules, match length not reported; GLORY limits a clinch to one knee | 1 to 3 clinch knees per fighter in the round; each clinch lasts one knee's execution and release | Duration unmeasured; chosen |
| Distance by phase | Body-scaled classes: outside, kicking range, punching range, clinch (Krabben et al. 2019, pp. 1829, 1831) | No metric measurement in elite kickboxing | Exchanges in kicking (0.9 to 1.4 m between pelvis centres) and punching range (0.5 to 0.9 m); observation at 1.4 to 2.0 m; clinch under 0.5 m | Inferred and chosen, as in [distance](#ring) |
| Knockdowns | GLORY fighters' career knockdown ratios from 0:0 to 14:0 landed to absorbed; K-1 WGP: 53 of 96 matches stopped (24 KO, 29 TKO) | Career aggregates; heavyweight sample | None before 150 s; one at 150 | Commission |
| Audible contacts | Equal to landed strikes plus blocked strikes; WAKO K1 coders count about half of attacks as effective (effectiveness 50.3 ± 10.1 %, Rydzik et al. 2021, Table 4) | Inferred: every contact, landed or blocked, is heard | Each landed or blocked strike is a distinct contact sound | 2 to 5 contacts per fighter |

Before 150 s each man throws about 30 to 55 strikes and lands about 13 to 27 under these targets. Inferred from the per-minute ranges over 2.5 minutes.

## Officials and others in the exchange {#officials}

- The referee commands "Break" to interrupt an action, sends a man who scores a knockdown to the farthest neutral corner before counting, and counts at least to eight (GLORY Rules section 5.05 A.2, B.2-B.3, p. 12). Reported. During exchanges this production's referee keeps a side view and moves to stay clear of the fighters; his full conduct, the count and the crowd are another study's subject. Chosen.

## Unavailable {#unavailable}

- Footage of GLORY bouts: not acquired; the environment has no video decoder to sample frames, so no frame was studied and no footage is described.
- Ouergui et al. 2013, "Technical and tactical analysis of high level kickboxing matches" (IJPAS 13: 294-309): paywalled, not obtained.
- Calabrese et al. 2024: full text paywalled; only the publisher's abstract was retained, so its coding rules and per-round tables are unseen.
- Slimani et al. 2017, "The activity profile of elite low-kick kickboxing competition" (IJSPP 12: 182-189), and Belošević et al. 2017, "A novel approach to time-motion analysis of K1 sport": not obtained (paywall; the repository returned 403).
- GLORY's per-bout CompuStrike data beyond the one 2014 article, a GLORY middleweight kick share and any measured clinch duration: not located.
- Measured fighting distances in metres for elite kickboxing, the number of repetitions that forms a defensive habit in a bout, and the latency of a conditioned guard drop: not located.

## Statements not applicable {#statements-not-applicable}

- Depicted practice 1, each technique's law: applies only to the two movements the vocabulary lacks, whose laws are above, [the learned arm drop](#arm-drop) and [pivots](#pivots); every other single movement this study uses (punch, kick, guard, step, defend, knee, clinch, knockdown) is the motion vocabulary's own law with its own study, and the Brazilian kick's law is in [brazilian-kick.md](brazilian-kick.md).
- Depicted practice 6, the conduct of everyone present: only the referee's in-exchange commands apply to the exchanges; the referee's full procedure is in the [referee study](../officiating/referee.md), and the crowd's conduct in the [ring sound study](../sound/ring-sound.md#crowd).
- Depicted practice 8, how the genre is shot: belongs to the production's fight-coverage study; exchanges have no shooting practice of their own.
- Depicted practice 11, an invented action's analogue: no invented action is studied here.
- Traceable sources 1, the observed mark: no direct observation exists because footage is unavailable; every observation is reported, inferred or chosen.
