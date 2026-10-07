// Rate of Perceived Exertion (RPE) Scale definitions
export const rpeLevels = [
  { id: 'all', label: 'All RPE', range: [1, 10] },
  { id: 'easy', label: 'RPE 2-3 (Easy)', range: [2, 3], color: '#22c55e' },
  { id: 'moderate', label: 'RPE 4-5 (Light/Mod)', range: [4, 5], color: '#3b82f6' },
  { id: 'challenging', label: 'RPE 6-7 (Challenging)', range: [6, 7], color: '#eab308' },
  { id: 'hard', label: 'RPE 8+ (Hard Work)', range: [8, 10], color: '#ef4444' },
];

export const curriculum52Blocks = [
  { block: 1, title: 'Build an Honest Starting Point', weeks: [1, 2, 3, 4], videoUrl: 'https://www.youtube.com/watch?v=nv634_GvXHE' },
  { block: 2, title: 'Improve Your First Touch & Passing', weeks: [5, 6, 7, 8], videoUrl: 'https://www.youtube.com/watch?v=el7QvVnprOk' },
  { block: 3, title: 'Ball Mastery & Usable Weaker Foot', weeks: [9, 10, 11, 12], videoUrl: 'https://www.youtube.com/watch?v=rTdHPcQQMwM' },
  { block: 4, title: 'Receive, Turn & Scan', weeks: [13, 14, 15, 16], videoUrl: 'https://www.youtube.com/watch?v=JlPfNgGNbqw' },
  { block: 5, title: 'Accelerate, Brake & Change Direction', weeks: [17, 18, 19, 20], videoUrl: 'https://www.youtube.com/watch?v=rSlJU8cO9js' },
  { block: 6, title: 'Strength & Power Foundations', weeks: [21, 22, 23, 24], videoUrl: 'https://www.youtube.com/watch?v=SpFdcob5wYY' },
  { block: 7, title: 'Dribble & Solve 1v1 Situations', weeks: [25, 26, 27, 28], videoUrl: 'https://www.youtube.com/watch?v=GtK8pK8Drus' },
  { block: 8, title: 'Finish the Action', weeks: [29, 30, 31, 32], videoUrl: 'https://www.youtube.com/watch?v=ZPZ0B1xK4tQ' },
  { block: 9, title: 'Defend Space & Compete in Duels', weeks: [33, 34, 35, 36], videoUrl: 'https://www.youtube.com/watch?v=MKAP5oHz77A' },
  { block: 10, title: 'Scan, Decide & Keep Possession', weeks: [37, 38, 39, 40], videoUrl: 'https://www.youtube.com/watch?v=mNA7bT3CLQU' },
  { block: 11, title: 'Train Your Position', weeks: [41, 42, 43, 44], videoUrl: 'https://www.youtube.com/watch?v=wLBbwgHm12w' },
  { block: 12, title: 'Football Conditioning & Perform', weeks: [45, 46, 47, 48], videoUrl: 'https://www.youtube.com/watch?v=Ynh_wFGlN9A' },
  { block: 13, title: 'Review, Reset & Plan Again', weeks: [49, 50, 51, 52], videoUrl: 'https://www.youtube.com/watch?v=a9v1eal3GrQ' },
];

export const curriculum52Weeks = {
  1: {
    block: 1, theme: 'Establish Your Baseline', check: 'Save all your scores.',
    s1: { rpe: 'RPE 4-6', rpeVal: 5, text: 'Complete 3x45 seconds of close touches. Perform the wall-pass test.' },
    s2: { rpe: 'RPE 5-7', rpeVal: 6, text: 'Complete four 10-meter sprints and two strength rounds.' },
    s3: { rpe: 'RPE 5-7', rpeVal: 6, text: 'Complete the five-cone dribble and 20 target passes.' }
  },
  2: {
    block: 1, theme: 'Make Control Repeatable', check: 'Count your clean repetitions.',
    s1: { rpe: 'RPE 4-6', rpeVal: 5, text: 'Complete 4x60 seconds of close control and 5x8 passes per foot.' },
    s2: { rpe: 'RPE 5-7', rpeVal: 6, text: 'Complete six 10-meter runs and two strength rounds.' },
    s3: { rpe: 'RPE 5-7', rpeVal: 6, text: 'Complete 6x60 seconds of receive-turn-pass actions.' }
  },
  3: {
    block: 1, theme: 'Add Speed', check: 'Film your final set.',
    s1: { rpe: 'RPE 4-6', rpeVal: 5, text: 'Complete 3x12 two-touch passes and 4x30 seconds of one-touch passing.' },
    s2: { rpe: 'RPE 5-7', rpeVal: 6, text: 'Complete six accelerations with controlled stops.' },
    s3: { rpe: 'RPE 5-7', rpeVal: 6, text: 'Complete 3x4 pass-turn-dribble-finish actions.' }
  },
  4: {
    block: 1, theme: 'Review and Retest', check: 'Choose one priority for the next block.',
    s1: { rpe: 'RPE 3-5', rpeVal: 4, text: 'Repeat the wall-pass test.' },
    s2: { rpe: 'RPE 4-5', rpeVal: 4, text: 'Complete four smooth 10-meter runs and one strength round.' },
    s3: { rpe: 'RPE 4-6', rpeVal: 5, text: 'Repeat the dribble and target tests.' }
  },

  5: {
    block: 2, theme: 'Receive Across Your Body', check: 'Check the direction of your first touch.',
    s1: { rpe: 'RPE 4-6', rpeVal: 5, text: 'Complete 4x8 back-foot receives per side.' },
    s2: { rpe: 'RPE 5-7', rpeVal: 6, text: 'Complete 3x8 firm passes per foot and two strength rounds.' },
    s3: { rpe: 'RPE 5-7', rpeVal: 6, text: 'Complete 3x6 receive-exit-pass actions per side.' }
  },
  6: {
    block: 2, theme: 'Use One or Two Touches', check: 'Compare your one-touch and two-touch accuracy.',
    s1: { rpe: 'RPE 4-6', rpeVal: 5, text: 'Complete 3x10 two-touch passes and 4x8 one-touch passes.' },
    s2: { rpe: 'RPE 5-7', rpeVal: 6, text: 'Complete 3x6 pass-move-receive actions in each direction.' },
    s3: { rpe: 'RPE 5-7', rpeVal: 6, text: 'Complete 4x3-minute combination blocks.' }
  },
  7: {
    block: 2, theme: 'Pass While Moving', check: 'Check whether you arrive balanced.',
    s1: { rpe: 'RPE 4-6', rpeVal: 5, text: 'Complete 4x90 seconds of moving wall passes.' },
    s2: { rpe: 'RPE 5-7', rpeVal: 6, text: 'Complete six shuffle-to-sprint actions and two strength rounds.' },
    s3: { rpe: 'RPE 5-7', rpeVal: 6, text: 'Complete 3x6 triangle actions in each direction.' }
  },
  8: {
    block: 2, theme: 'Review Your Passing', check: 'Select your weakest passing skill.',
    s1: { rpe: 'RPE 3-5', rpeVal: 4, text: 'Repeat the wall-pass test.' },
    s2: { rpe: 'RPE 4-5', rpeVal: 4, text: 'Complete four smooth sprints and one light strength round.' },
    s3: { rpe: 'RPE 4-6', rpeVal: 5, text: 'Complete 20 back-foot, 20 weaker-foot, 20 one-touch, 20 moving, & 20 free passes.' }
  },

  9: {
    block: 3, theme: 'Improve Weaker-Foot Contact', check: 'Record why your unsuccessful actions failed.',
    s1: { rpe: 'RPE 4-6', rpeVal: 5, text: 'Complete 5x10 passes and 3x30 seconds of weaker-foot touches.' },
    s2: { rpe: 'RPE 5-7', rpeVal: 6, text: 'Complete three single-leg strength rounds.' },
    s3: { rpe: 'RPE 5-7', rpeVal: 6, text: 'Complete 4x6 weaker-foot receive-turn-pass actions.' }
  },
  10: {
    block: 3, theme: 'Turn in Tight Spaces', check: 'Keep your eyes up as you exit.',
    s1: { rpe: 'RPE 4-6', rpeVal: 5, text: 'Complete 3x6 inside, outside and sole turns.' },
    s2: { rpe: 'RPE 5-7', rpeVal: 6, text: 'Complete six brake-turn-accelerate actions.' },
    s3: { rpe: 'RPE 5-7', rpeVal: 6, text: 'Complete 6x45 seconds of escape-the-square work.' }
  },
  11: {
    block: 3, theme: 'Carry Ball with Head Up', check: 'Count how often you scan early.',
    s1: { rpe: 'RPE 4-6', rpeVal: 5, text: 'Complete 6x45 seconds of touch-and-scan work.' },
    s2: { rpe: 'RPE 5-7', rpeVal: 6, text: 'Complete six head-up carries using a visual or verbal cue.' },
    s3: { rpe: 'RPE 5-7', rpeVal: 6, text: 'Complete 3x6 dribbles towards a called gate.' }
  },
  12: {
    block: 3, theme: 'Review Your Ball Control', check: 'Use the same testing setup.',
    s1: { rpe: 'RPE 3-5', rpeVal: 4, text: 'Repeat the weaker-foot passing test.' },
    s2: { rpe: 'RPE 4-5', rpeVal: 4, text: 'Complete two light turning rounds.' },
    s3: { rpe: 'RPE 4-6', rpeVal: 5, text: 'Repeat the dribble test with a visual cue.' }
  },

  13: {
    block: 4, theme: 'Direct Your First Touch', check: 'First touch creates next action.',
    s1: { rpe: 'RPE 4-6', rpeVal: 5, text: 'Complete 4x8 first touches through a marked gate.' },
    s2: { rpe: 'RPE 5-7', rpeVal: 6, text: 'Complete six first-step accelerations after receiving.' },
    s3: { rpe: 'RPE 5-7', rpeVal: 6, text: 'Complete 3x6 scan-receive-exit actions.' }
  },
  14: {
    block: 4, theme: 'Receive on the Half-Turn', check: 'Open your body before receiving.',
    s1: { rpe: 'RPE 4-6', rpeVal: 5, text: 'Complete 4x8 half-turn receptions.' },
    s2: { rpe: 'RPE 5-7', rpeVal: 6, text: 'Complete six turn-and-carry actions over 10 meters.' },
    s3: { rpe: 'RPE 5-7', rpeVal: 6, text: 'Complete 4x2-minute forward, set or protect choices.' }
  },
  15: {
    block: 4, theme: 'Control Difficult Balls', check: 'Keep the ball inside a playable area.',
    s1: { rpe: 'RPE 4-6', rpeVal: 5, text: 'Complete 4x8 cushioned controls from a bouncing ball.' },
    s2: { rpe: 'RPE 5-7', rpeVal: 6, text: 'Complete six move-under-the-ball actions.' },
    s3: { rpe: 'RPE 5-7', rpeVal: 6, text: 'Complete 3x6 control-then-pass actions.' }
  },
  16: {
    block: 4, theme: 'Review Your Receiving', check: 'Check whether you selected correct option.',
    s1: { rpe: 'RPE 3-5', rpeVal: 4, text: 'Repeat the receiving-gate test.' },
    s2: { rpe: 'RPE 4-5', rpeVal: 4, text: 'Complete four smooth accelerations.' },
    s3: { rpe: 'RPE 4-6', rpeVal: 5, text: 'Use a cue to choose whether to play forward, set or protect.' }
  },

  17: {
    block: 5, theme: 'Win the First Meters', check: 'Watch the quality of your first three steps.',
    s1: { rpe: 'RPE 4-6', rpeVal: 5, text: 'Complete three quick-touch rounds and four progressive runs.' },
    s2: { rpe: 'RPE 5-7', rpeVal: 6, text: 'Complete six 10-meter sprints with full recovery.' },
    s3: { rpe: 'RPE 5-7', rpeVal: 6, text: 'Complete six receive-sprint-pass actions.' }
  },
  18: {
    block: 5, theme: 'Learn to Slow Down', check: 'Finish every action balanced.',
    s1: { rpe: 'RPE 4-6', rpeVal: 5, text: 'Complete six ball carries into controlled stops.' },
    s2: { rpe: 'RPE 5-7', rpeVal: 6, text: 'Complete six 10-meter runs and stop within three meters.' },
    s3: { rpe: 'RPE 5-7', rpeVal: 6, text: 'Complete 3x6 stop-scan-pass actions.' }
  },
  19: {
    block: 5, theme: 'React & Change Direction', check: 'Do not guess the direction too early.',
    s1: { rpe: 'RPE 4-6', rpeVal: 5, text: 'Complete 3x6 cuts in each direction.' },
    s2: { rpe: 'RPE 5-7', rpeVal: 6, text: 'Complete six cue-led direction changes.' },
    s3: { rpe: 'RPE 5-7', rpeVal: 6, text: 'Complete 6x45 seconds of react-carry-pass work.' }
  },
  20: {
    block: 5, theme: 'Review Your Speed', check: 'Record only clean and controlled scores.',
    s1: { rpe: 'RPE 3-5', rpeVal: 4, text: 'Complete two light ball-speed rounds.' },
    s2: { rpe: 'RPE 4-5', rpeVal: 4, text: 'Repeat the 10-meter test while fresh.' },
    s3: { rpe: 'RPE 4-6', rpeVal: 5, text: 'Complete four speed-to-action repetitions.' }
  },

  21: {
    block: 6, theme: 'Own Basic Strength Patterns', check: 'Keep two good repetitions available.',
    s1: { rpe: 'RPE 4-6', rpeVal: 5, text: 'Complete 3x60 seconds of touch-and-pass work.' },
    s2: { rpe: 'RPE 5-7', rpeVal: 6, text: 'Complete three split squat, hinge, calf and plank rounds.' },
    s3: { rpe: 'RPE 5-7', rpeVal: 6, text: 'Complete six strength-to-10-meter carry actions.' }
  },
  22: {
    block: 6, theme: 'Single-Leg Control', check: 'Compare your control on both sides.',
    s1: { rpe: 'RPE 4-6', rpeVal: 5, text: 'Complete 3x6 balanced receives per side.' },
    s2: { rpe: 'RPE 5-7', rpeVal: 6, text: 'Complete three lunge, single-leg hinge, and calf rounds.' },
    s3: { rpe: 'RPE 5-7', rpeVal: 6, text: 'Complete 3x6 protect-turn-pass actions.' }
  },
  23: {
    block: 6, theme: 'Express Strength Quickly', check: 'Keep every landing quiet and controlled.',
    s1: { rpe: 'RPE 4-6', rpeVal: 5, text: 'Complete 4x30 seconds of fast-contact ball work.' },
    s2: { rpe: 'RPE 5-7', rpeVal: 6, text: 'Complete 3x4 jumps and four 10-meter sprints.' },
    s3: { rpe: 'RPE 5-7', rpeVal: 6, text: 'Complete six first-touch burst actions.' }
  },
  24: {
    block: 6, theme: 'Review Movement Quality', check: 'Prioritize control instead of load.',
    s1: { rpe: 'RPE 3-5', rpeVal: 4, text: 'Complete two light technical rounds.' },
    s2: { rpe: 'RPE 4-5', rpeVal: 4, text: 'Repeat the movement-quality check.' },
    s3: { rpe: 'RPE 4-6', rpeVal: 5, text: 'Complete four jumps and four short sprints.' }
  },

  25: {
    block: 7, theme: 'Change Direction with Purpose', check: 'Check the quality of your exit touch.',
    s1: { rpe: 'RPE 4-6', rpeVal: 5, text: 'Complete 3x6 inside and outside cuts.' },
    s2: { rpe: 'RPE 5-7', rpeVal: 6, text: 'Complete six cut-then-accelerate actions.' },
    s3: { rpe: 'RPE 5-7', rpeVal: 6, text: 'Complete 6x45 seconds of beat-the-line work.' }
  },
  26: {
    block: 7, theme: 'Change Speed in Dribbling', check: 'Show a clear change of speed.',
    s1: { rpe: 'RPE 4-6', rpeVal: 5, text: 'Complete 6x45 seconds of slow-fast dribbling.' },
    s2: { rpe: 'RPE 5-7', rpeVal: 6, text: 'Complete six re-accelerations with full recovery.' },
    s3: { rpe: 'RPE 5-7', rpeVal: 6, text: 'Complete 3x6 pause-commit-escape actions.' }
  },
  27: {
    block: 7, theme: 'Protect & Escape', check: 'Escape after protecting the ball.',
    s1: { rpe: 'RPE 4-6', rpeVal: 5, text: 'Complete 3x6 shield-turn actions per side.' },
    s2: { rpe: 'RPE 5-7', rpeVal: 6, text: 'Complete three bodyweight strength rounds.' },
    s3: { rpe: 'RPE 5-7', rpeVal: 6, text: 'Complete 4x2-minute keep, set, or turn choices.' }
  },
  28: {
    block: 7, theme: 'Review 1v1 Decisions', check: 'Make sure action creates useful outcome.',
    s1: { rpe: 'RPE 3-5', rpeVal: 4, text: 'Complete two light direction and speed rounds.' },
    s2: { rpe: 'RPE 4-5', rpeVal: 4, text: 'Complete four smooth sprints.' },
    s3: { rpe: 'RPE 4-6', rpeVal: 5, text: 'Use a cue to choose whether to dribble, pass or protect.' }
  },

  29: {
    block: 8, theme: 'Build Clean Contact', check: 'Count your target hits.',
    s1: { rpe: 'RPE 4-6', rpeVal: 5, text: 'Complete 5x6 set-ball shots or target passes.' },
    s2: { rpe: 'RPE 5-7', rpeVal: 6, text: 'Complete six approach-and-strike actions per foot.' },
    s3: { rpe: 'RPE 5-7', rpeVal: 6, text: 'Complete 4x6 final actions from four different zones.' }
  },
  30: {
    block: 8, theme: 'Receive and Finish', check: 'First touch creates shooting line.',
    s1: { rpe: 'RPE 4-6', rpeVal: 5, text: 'Complete 4x6 first-touch-to-strike actions.' },
    s2: { rpe: 'RPE 5-7', rpeVal: 6, text: 'Complete 3x6 turn-and-finish actions per side.' },
    s3: { rpe: 'RPE 5-7', rpeVal: 6, text: 'Complete 4x5 finishes from different services.' }
  },
  31: {
    block: 8, theme: 'Finish After a Run', check: 'Protect accuracy as session gets harder.',
    s1: { rpe: 'RPE 4-6', rpeVal: 5, text: 'Complete 4x6 weaker-foot final actions.' },
    s2: { rpe: 'RPE 5-7', rpeVal: 6, text: 'Complete six run-recover-finish actions.' },
    s3: { rpe: 'RPE 5-7', rpeVal: 6, text: 'Complete four six-action finishing circuits.' }
  },
  32: {
    block: 8, theme: 'Review Your Finishing', check: 'Identify two most reliable finishing zones.',
    s1: { rpe: 'RPE 3-5', rpeVal: 4, text: 'Repeat the target-accuracy test.' },
    s2: { rpe: 'RPE 4-5', rpeVal: 4, text: 'Complete four sharp runs with full recovery.' },
    s3: { rpe: 'RPE 4-6', rpeVal: 5, text: 'Record 20 shots or passes from different zones.' }
  },

  33: {
    block: 9, theme: 'Control Your Approach', check: 'Avoid diving into the challenge.',
    s1: { rpe: 'RPE 4-6', rpeVal: 5, text: 'Complete 6x30 seconds of jockey footwork.' },
    s2: { rpe: 'RPE 5-7', rpeVal: 6, text: 'Complete six approach-and-brake actions.' },
    s3: { rpe: 'RPE 5-7', rpeVal: 6, text: 'Complete six channel duels or cone-cue repetitions.' }
  },
  34: {
    block: 9, theme: 'Improve Recovery Runs', check: 'Recover towards dangerous space first.',
    s1: { rpe: 'RPE 4-6', rpeVal: 5, text: 'Complete six curved recovery runs.' },
    s2: { rpe: 'RPE 5-7', rpeVal: 6, text: 'Complete six 15-meter recovery sprints.' },
    s3: { rpe: 'RPE 5-7', rpeVal: 6, text: 'Complete 3x6 recover-delay-regain actions.' }
  },
  35: {
    block: 9, theme: 'Make the 1v1 Decision', check: 'Decide whether to delay, show or win ball.',
    s1: { rpe: 'RPE 4-6', rpeVal: 5, text: 'Complete 4x6 visual-cue reads.' },
    s2: { rpe: 'RPE 5-7', rpeVal: 6, text: 'Complete six reactive direction changes.' },
    s3: { rpe: 'RPE 5-7', rpeVal: 6, text: 'Complete six short partner duels.' }
  },
  36: {
    block: 9, theme: 'Play After the Regain', check: 'Check your first pass after winning ball.',
    s1: { rpe: 'RPE 3-5', rpeVal: 4, text: 'Complete 3x6 intercept-and-pass actions.' },
    s2: { rpe: 'RPE 4-5', rpeVal: 4, text: 'Complete four light defensive approaches.' },
    s3: { rpe: 'RPE 4-6', rpeVal: 5, text: 'Review 10 defensive actions from training/matches.' }
  },

  37: {
    block: 10, theme: 'Scan Before Receiving', check: 'Scan before making contact with the ball.',
    s1: { rpe: 'RPE 4-6', rpeVal: 5, text: 'Complete 4x8 scan-before-receive actions.' },
    s2: { rpe: 'RPE 5-7', rpeVal: 6, text: 'Complete six move-scan-accelerate actions.' },
    s3: { rpe: 'RPE 5-7', rpeVal: 6, text: 'Complete 6x60 seconds using color or number cues.' }
  },
  38: {
    block: 10, theme: 'Use Helpful Touch Limits', check: 'Choose number of touches instead of rushing.',
    s1: { rpe: 'RPE 4-6', rpeVal: 5, text: 'Complete 3x10 two-touch passes and 4x8 one-touch passes.' },
    s2: { rpe: 'RPE 5-7', rpeVal: 6, text: 'Complete 3x6 pass-and-arrive actions in each direction.' },
    s3: { rpe: 'RPE 5-7', rpeVal: 6, text: 'Complete 4x3-minute touch-limit blocks.' }
  },
  39: {
    block: 10, theme: 'Support the Next Pass', check: 'Create a clear passing angle.',
    s1: { rpe: 'RPE 4-6', rpeVal: 5, text: 'Complete 4x8 pass-move-receive actions.' },
    s2: { rpe: 'RPE 5-7', rpeVal: 6, text: 'Complete six repeated support runs.' },
    s3: { rpe: 'RPE 5-7', rpeVal: 6, text: 'Complete 4x3-minute wall or partner combinations.' }
  },
  40: {
    block: 10, theme: 'React to Transitions', check: 'Judge response during first 3 seconds.',
    s1: { rpe: 'RPE 3-5', rpeVal: 4, text: 'Complete 3x6 regain-or-loss responses.' },
    s2: { rpe: 'RPE 4-5', rpeVal: 4, text: 'Complete four light transition sprints.' },
    s3: { rpe: 'RPE 4-6', rpeVal: 5, text: 'Review 10 transition actions from matches or video.' }
  },

  41: {
    block: 11, theme: 'Build Your Position Profile', check: 'Keep only two main priorities.',
    s1: { rpe: 'RPE 4-6', rpeVal: 5, text: 'Observe 10 match actions and select two priorities.' },
    s2: { rpe: 'RPE 5-7', rpeVal: 6, text: 'Repeat main position-specific movement six times.' },
    s3: { rpe: 'RPE 5-7', rpeVal: 6, text: 'Complete 3x6 position-action chains.' }
  },
  42: {
    block: 11, theme: 'Repeat Key Match Actions', check: 'Reach a realistic match speed.',
    s1: { rpe: 'RPE 4-6', rpeVal: 5, text: 'Complete 4x6 technical-priority actions.' },
    s2: { rpe: 'RPE 5-7', rpeVal: 6, text: 'Complete six role-specific physical actions.' },
    s3: { rpe: 'RPE 5-7', rpeVal: 6, text: 'Repeat actions with a partner or decision cue.' }
  },
  43: {
    block: 11, theme: 'Work Away from the Ball', check: 'Communicate before action develops.',
    s1: { rpe: 'RPE 4-6', rpeVal: 5, text: 'Complete 3x6 off-ball starting actions.' },
    s2: { rpe: 'RPE 5-7', rpeVal: 6, text: 'Complete six repeat-and-recover movements.' },
    s3: { rpe: 'RPE 5-7', rpeVal: 6, text: 'Complete 4x2-minute call-scan-move rounds.' }
  },
  44: {
    block: 11, theme: 'Review a Real Match', check: 'Set one new position-specific target.',
    s1: { rpe: 'RPE 3-5', rpeVal: 4, text: 'Complete 20 minutes of light technical work.' },
    s2: { rpe: 'RPE 4-5', rpeVal: 4, text: 'Complete four sharp position-specific movements.' },
    s3: { rpe: 'RPE 4-6', rpeVal: 5, text: 'Review 10 actions from your position.' }
  },

  45: {
    block: 12, theme: 'Controlled Intervals', check: 'Check technical quality during final interval.',
    s1: { rpe: 'RPE 4-5', rpeVal: 4, text: 'Complete 4x3 minute technical rhythm blocks.' },
    s2: { rpe: 'RPE 7', rpeVal: 7, text: 'Complete 6x2-minute football circuits with 1min rest.' },
    s3: { rpe: 'RPE 6-8', rpeVal: 7, text: 'Complete 4x4-minute small games or solo circuits.' }
  },
  46: {
    block: 12, theme: 'Repeat Sprints Well', check: 'Stop if your speed drops clearly.',
    s1: { rpe: 'RPE 4-5', rpeVal: 4, text: 'Complete 4x60 seconds of fast passing and carrying.' },
    s2: { rpe: 'RPE 7-8', rpeVal: 8, text: 'Complete two sets of four 20-meter sprints.' },
    s3: { rpe: 'RPE 6-7', rpeVal: 7, text: 'Complete six sprint-to-shot or sprint-to-pass actions.' }
  },
  47: {
    block: 12, theme: 'Prepare for Trial / Performance', check: 'Play and communicate clearly.',
    s1: { rpe: 'RPE 5-6', rpeVal: 5, text: 'Complete 3x6 of your strongest technical actions.' },
    s2: { rpe: 'RPE 5-6', rpeVal: 5, text: 'Complete four 10-meter runs and four sharp ball actions.' },
    s3: { rpe: 'RPE 5-6', rpeVal: 5, text: 'Complete two eight-minute trial-rehearsal blocks.' }
  },
  48: {
    block: 12, theme: 'Taper and Retest', check: 'Finish the block with energy.',
    s1: { rpe: 'RPE 3-5', rpeVal: 4, text: 'Complete 20 minutes of confident technical work.' },
    s2: { rpe: 'RPE 4-5', rpeVal: 4, text: 'Repeat four 10-meter runs while fresh.' },
    s3: { rpe: 'RPE 4-6', rpeVal: 5, text: 'Retest wall passes, dribbling and target accuracy.' }
  },

  49: {
    block: 13, theme: 'Unload & Active Recovery', check: 'Finish the week feeling better.',
    s1: { rpe: 'RPE 2-4', rpeVal: 3, text: 'Complete 25 minutes of free ball work.' },
    s2: { rpe: 'RPE 2-3', rpeVal: 2, text: 'Complete 25 minutes of mobility and easy movement.' },
    s3: { rpe: 'RPE 3-5', rpeVal: 4, text: 'Play 30 minutes of optional social football.' }
  },
  50: {
    block: 13, theme: 'Fix One Weakness', check: 'Work on one specific weakness only.',
    s1: { rpe: 'RPE 4-5', rpeVal: 4, text: 'Complete 4x6 slow technical solutions.' },
    s2: { rpe: 'RPE 5-6', rpeVal: 5, text: 'Complete six physical actions connected to weakness.' },
    s3: { rpe: 'RPE 5-6', rpeVal: 5, text: 'Complete 3x6 cue-led football actions.' }
  },
  51: {
    block: 13, theme: 'Build Your Own Week', check: 'Keep the week balanced.',
    s1: { rpe: 'RPE 4-6', rpeVal: 5, text: 'Complete 40 minutes on your technical priority.' },
    s2: { rpe: 'RPE 5-7', rpeVal: 6, text: 'Complete 35 minutes on your physical priority.' },
    s3: { rpe: 'RPE 5-7', rpeVal: 6, text: 'Complete 45 minutes on your match-action priority.' }
  },
  52: {
    block: 13, theme: 'Complete the Year', check: 'Compare results using the same setup.',
    s1: { rpe: 'RPE 3-5', rpeVal: 4, text: 'Repeat your final technical tests.' },
    s2: { rpe: 'RPE 4-5', rpeVal: 4, text: 'Repeat the 10-meter and movement-quality checks.' },
    s3: { rpe: 'RPE 4-6', rpeVal: 5, text: 'Write your next 12-week training plan.' }
  }
};