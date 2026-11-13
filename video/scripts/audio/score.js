/* global Tone */
/**
 * PRISM AI — original score and sound design, synthesised with Tone.js (MIT)
 * and rendered offline. Runs in a browser page (see scripts/audio.mjs); every
 * event is scheduled from the shared cue sheet (src/data/timeline.json), on a
 * 120 BPM grid, so impacts, cuts and on-screen words land together.
 *
 * Arc: mystery (D minor drone, a heartbeat) → tension (rhythm, warnings, a
 * riser cut to silence) → lift (B♭ → F bloom, the four-note PRISM motif) →
 * confident groove (F – C – Dm – B♭) → uplift → resolution on F with the motif.
 */
;(function () {
  const SR = 48000

  function rng(seed) {
    let a = seed >>> 0
    return () => {
      a = (a + 0x6d2b79f5) >>> 0
      let t = a
      t = Math.imul(t ^ (t >>> 15), t | 1)
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296
    }
  }

  const CHORDS = {
    Dm: ['D3', 'F3', 'A3', 'E4'],
    Bb: ['Bb2', 'D3', 'F3', 'A3'],
    Gm: ['G2', 'Bb2', 'D3', 'F3'],
    A: ['A2', 'C#3', 'E3', 'G3'],
    F: ['F2', 'C3', 'A3', 'G4'],
    C: ['C3', 'E3', 'G3', 'D4'],
    Csus: ['C3', 'F3', 'G3', 'D4'],
    Am: ['A2', 'C3', 'E3', 'G3'],
  }
  const ROOT = { Dm: 'D', Bb: 'Bb', Gm: 'G', A: 'A', F: 'F', C: 'C', Csus: 'C', Am: 'A' }
  const ARP = {
    Dm: ['D4', 'F4', 'A4', 'E5', 'A4', 'F4'],
    Bb: ['Bb3', 'D4', 'F4', 'A4', 'F4', 'D4'],
    Gm: ['G3', 'Bb3', 'D4', 'F4', 'D4', 'Bb3'],
    A: ['A3', 'C#4', 'E4', 'G4', 'E4', 'C#4'],
    F: ['F4', 'A4', 'C5', 'G5', 'C5', 'A4'],
    C: ['C4', 'E4', 'G4', 'D5', 'G4', 'E4'],
    Csus: ['C4', 'F4', 'G4', 'D5', 'G4', 'F4'],
    Am: ['A3', 'C4', 'E4', 'G4', 'E4', 'C4'],
  }
  /** The PRISM motif — four rising notes, heard at the reveal and at the end */
  const MOTIF = ['F5', 'C6', 'A5', 'G6']

  function cues(TL) {
    const mark = (n) => TL.marks[n].t
    const line = (id) => TL.lines.find((l) => l.id === id)
    return { mark, line }
  }

  /* -------------------------------------------------------------- music */

  async function music(TL, duration) {
    const { mark, line } = cues(TL)
    const r = rng(4821)
    const master = new Tone.Gain(1).toDestination()
    const out = new Tone.Gain(1).connect(master)

    // section levels: the bed sits ~13 dB under the voice once ducked, and
    // swells only where the picture has no words (impacts, the reveal, the end)
    const SECTION_DB = { opening: 0, chain: 10, challenges: 6, reveal: -1, product: 3.5, capabilities: 5, value: 3, closing: 0 }
    out.gain.setValueAtTime(1, 0)
    for (const s of TL.scenes) {
      const g = Tone.dbToGain(SECTION_DB[s.id] ?? 0)
      // the chain's lift waits for the opening impact to decay, so its tail never swells
      if (s.id === 'chain') out.gain.setTargetAtTime(g, s.start + 0.8, 0.5)
      else out.gain.setTargetAtTime(g, Math.max(0, s.start - 0.15), 0.12)
    }

    // spaces
    const hall = new Tone.Reverb({ decay: 7, preDelay: 0.03, wet: 1 })
    const room = new Tone.Reverb({ decay: 1.8, preDelay: 0.01, wet: 1 })
    await hall.ready
    await room.ready
    hall.connect(out)
    room.connect(out)
    const send = (node, toHall, toRoom = 0) => {
      if (toHall) node.connect(new Tone.Gain(toHall).connect(hall))
      if (toRoom) node.connect(new Tone.Gain(toRoom).connect(room))
    }

    // sidechain-style pump for the groove (driven by the kick schedule)
    const pump = new Tone.Gain(1).connect(out)
    send(pump, 0.22)

    // instruments
    const padFilter = new Tone.Filter({ frequency: 700, type: 'lowpass', rolloff: -24, Q: 0.6 })
    const chorus = new Tone.Chorus({ frequency: 0.35, delayTime: 4, depth: 0.55, wet: 0.45 }).start()
    const pad = new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: 'fatsawtooth', count: 3, spread: 26 },
      envelope: { attack: 1.4, decay: 0.6, sustain: 0.85, release: 2.8 },
      volume: -27,
    })
    pad.chain(padFilter, chorus, pump)

    const glass = new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: 'fattriangle', count: 2, spread: 14 },
      envelope: { attack: 0.9, decay: 1.2, sustain: 0.7, release: 4 },
      volume: -30,
    })
    const glassPan = new Tone.AutoPanner({ frequency: 0.08, depth: 0.5 }).start()
    glass.chain(glassPan, out)
    send(glass, 0.6)

    const sub = new Tone.Synth({ oscillator: { type: 'sine' }, envelope: { attack: 0.04, decay: 0.2, sustain: 0.95, release: 0.6 }, volume: -11 })
    sub.connect(pump)

    const bass = new Tone.MonoSynth({
      oscillator: { type: 'sawtooth' },
      filter: { Q: 1.6, type: 'lowpass', rolloff: -24 },
      envelope: { attack: 0.004, decay: 0.2, sustain: 0.5, release: 0.12 },
      filterEnvelope: { attack: 0.003, decay: 0.16, sustain: 0.15, release: 0.2, baseFrequency: 110, octaves: 2.6 },
      volume: -19,
    })
    bass.connect(pump)

    const arpDelay = new Tone.FeedbackDelay({ delayTime: 0.375, feedback: 0.3, wet: 0.22 })
    const arpFilter = new Tone.Filter({ frequency: 1800, type: 'lowpass', rolloff: -12 })
    const arp = new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: 'square8' },
      envelope: { attack: 0.002, decay: 0.16, sustain: 0.0, release: 0.12 },
      volume: -31,
    })
    arp.chain(arpFilter, arpDelay, pump)
    send(arpDelay, 0.3)

    const bell = new Tone.PolySynth(Tone.FMSynth, {
      harmonicity: 3.01,
      modulationIndex: 11,
      oscillator: { type: 'sine' },
      envelope: { attack: 0.002, decay: 2.2, sustain: 0, release: 2.2 },
      modulation: { type: 'sine' },
      modulationEnvelope: { attack: 0.002, decay: 0.5, sustain: 0, release: 0.4 },
      volume: -23,
    })
    const bellPan = new Tone.Panner(0.15).connect(out)
    bell.connect(bellPan)
    send(bell, 0.7)

    const stab = new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: 'fatsawtooth', count: 3, spread: 32 },
      envelope: { attack: 0.01, decay: 1.4, sustain: 0.25, release: 3.5 },
      volume: -23,
    })
    const stabFilter = new Tone.Filter({ frequency: 1500, type: 'lowpass', rolloff: -24 })
    stab.chain(stabFilter, out)
    send(stab, 0.55)

    // drums
    const kick = new Tone.MembraneSynth({ pitchDecay: 0.035, octaves: 5.5, oscillator: { type: 'sine' }, envelope: { attack: 0.001, decay: 0.36, sustain: 0, release: 0.1 }, volume: -9 })
    kick.connect(out)
    const boom = new Tone.MembraneSynth({ pitchDecay: 0.45, octaves: 3.2, oscillator: { type: 'sine' }, envelope: { attack: 0.002, decay: 2.8, sustain: 0, release: 1 }, volume: -5 })
    boom.connect(out)
    send(boom, 0.25)
    const thumpFilter = new Tone.Filter({ frequency: 180, type: 'lowpass' }).connect(out)
    const thump = new Tone.MembraneSynth({ pitchDecay: 0.08, octaves: 2.5, envelope: { attack: 0.002, decay: 0.5, sustain: 0, release: 0.2 }, volume: -10 })
    thump.connect(thumpFilter)

    const clapFilter = new Tone.Filter({ frequency: 1700, type: 'bandpass', Q: 0.9 }).connect(out)
    send(clapFilter, 0, 0.35)
    const clap = new Tone.NoiseSynth({ noise: { type: 'white' }, envelope: { attack: 0.001, decay: 0.15, sustain: 0 }, volume: -21 })
    clap.connect(clapFilter)

    const hatFilter = new Tone.Filter({ frequency: 7500, type: 'highpass' })
    const hatPan = new Tone.Panner(0.22)
    hatFilter.chain(hatPan, out)
    const hat = new Tone.NoiseSynth({ noise: { type: 'white' }, envelope: { attack: 0.001, decay: 0.035, sustain: 0 }, volume: -31 })
    hat.connect(hatFilter)
    const ohat = new Tone.NoiseSynth({ noise: { type: 'white' }, envelope: { attack: 0.002, decay: 0.2, sustain: 0 }, volume: -34 })
    ohat.connect(hatFilter)
    const shakerFilter = new Tone.Filter({ frequency: 5500, type: 'bandpass', Q: 1.2 })
    const shakerPan = new Tone.Panner(-0.28)
    shakerFilter.chain(shakerPan, out)
    const shaker = new Tone.NoiseSynth({ noise: { type: 'pink' }, envelope: { attack: 0.004, decay: 0.05, sustain: 0 }, volume: -36 })
    shaker.connect(shakerFilter)

    const crashFilter = new Tone.Filter({ frequency: 4000, type: 'highpass' }).connect(out)
    send(crashFilter, 0.4)
    const crash = new Tone.NoiseSynth({ noise: { type: 'white' }, envelope: { attack: 0.002, decay: 1.6, sustain: 0 }, volume: -30 })
    crash.connect(crashFilter)

    // noise risers and reverse swells
    function riser(start, end, peakDb = -24, from = 300, to = 8000) {
      const n = new Tone.Noise('pink')
      const f = new Tone.Filter({ frequency: from, type: 'bandpass', Q: 1.4 })
      const g = new Tone.Gain(0)
      n.chain(f, g, out)
      send(g, 0.35)
      f.frequency.setValueAtTime(from, start)
      f.frequency.exponentialRampToValueAtTime(to, end)
      g.gain.setValueAtTime(0.0001, start)
      g.gain.exponentialRampToValueAtTime(Tone.dbToGain(peakDb), end - 0.02)
      g.gain.linearRampToValueAtTime(0, end)
      n.start(start).stop(end + 0.01)
    }

    const at = (s) => Math.max(0, s)
    const play = (synth, notes, start, dur, vel = 0.8) => synth.triggerAttackRelease(notes, dur, at(start), vel)

    // ---------------------------------------------------------- 01 opening
    const headline = mark('headline')
    const question = mark('question')
    padFilter.frequency.setValueAtTime(260, 0)
    padFilter.frequency.exponentialRampToValueAtTime(1100, headline - 0.2)
    play(pad, CHORDS.Dm, 0.3, headline - 0.3, 0.55)
    sub.triggerAttackRelease('D1', headline - 0.6, 0.4, 0.5)
    play(glass, ['A4', 'D5'], 1.4, 8, 0.35)
    // heartbeat, growing with the network
    for (let s = 4.0; s < headline - 0.4; s += 1.0) {
      const k = (s - 4) / (headline - 4)
      thump.triggerAttackRelease('D1', 0.4, s, 0.35 + 0.45 * k)
      thump.triggerAttackRelease('D1', 0.3, s + 0.25, 0.15 + 0.25 * k)
    }
    riser(8.4, headline, -22, 400, 6000)
    // "You built the AI." — a soft, low hit; the bed thins
    boom.triggerAttackRelease('D1', 1.4, headline, 0.45)
    play(glass, ['D4', 'A4'], headline, 1.6, 0.4)
    riser(headline + 0.9, question, -26, 300, 3000)
    // "Who's governing it?" — the controlled impact
    boom.triggerAttackRelease('A0', 3, question, 1)
    play(stab, ['D2', 'A2', 'D3', 'F3', 'A3'], question, 1.6, 0.9)
    crash.triggerAttackRelease(1.6, question, 0.45)
    sub.triggerAttackRelease('D1', 2.6, question, 0.8)

    // ----------------------------------------------------- 02 the chain
    const chainStart = TL.scenes.find((s) => s.id === 'chain').start
    const complexity = mark('complexity')
    const s2 = [
      [chainStart, chainStart + 4, 'Dm'],
      [chainStart + 4, chainStart + 8, 'Bb'],
      [chainStart + 8, chainStart + 10.5, 'Gm'],
      [chainStart + 10.5, chainStart + 13, 'A'],
    ]
    padFilter.frequency.setValueAtTime(700, chainStart)
    padFilter.frequency.linearRampToValueAtTime(1600, chainStart + 13)
    for (const [a, b, c] of s2) {
      play(pad, CHORDS[c], a, b - a + 0.2, 0.5)
      for (let s = a; s < b - 0.01; s += 0.5) bass.triggerAttackRelease(ROOT[c] + '1', 0.22, s, s < complexity ? 0.45 : 0.65)
      // quiet arpeggio, the system "thinking"
      const notes = ARP[c]
      let i = 0
      for (let s = a; s < b - 0.01; s += 0.25) {
        const v = 0.25 + 0.35 * Math.min(1, (s - chainStart) / 12)
        arp.triggerAttackRelease(notes[i++ % notes.length], 0.1, s, v)
      }
    }
    arpFilter.frequency.setValueAtTime(900, chainStart)
    arpFilter.frequency.linearRampToValueAtTime(2600, chainStart + 13)
    for (let s = chainStart; s < chainStart + 13; s += 0.125) {
      const accent = Math.round((s - chainStart) / 0.125) % 4 === 2
      hat.triggerAttackRelease(0.03, s, accent ? 0.5 : 0.18 + r() * 0.08)
    }
    for (let s = Math.ceil(complexity * 2) / 2; s < chainStart + 13; s += 1.0) kick.triggerAttackRelease('D1', 0.25, s, 0.5)
    riser(complexity, chainStart + 12.9, -28, 500, 5000)

    // ------------------------------------------------- 03 the challenges
    const chal = TL.scenes.find((s) => s.id === 'challenges').start
    const fragment = mark('fragment')
    const silence = mark('silence')
    const s3 = [
      [chal, chal + 4, 'Dm'],
      [chal + 4, fragment, 'Bb'],
      [fragment, silence, 'A'],
    ]
    for (const [a, b, c] of s3) {
      play(pad, CHORDS[c], a, b - a, c === 'A' ? 0.6 : 0.5)
      for (let s = a; s < b - 0.01; s += 0.5) bass.triggerAttackRelease(ROOT[c] + '1', 0.2, s, 0.6)
    }
    padFilter.frequency.setValueAtTime(1500, chal)
    padFilter.frequency.linearRampToValueAtTime(2400, silence)
    // half-time groove
    for (let s = chal; s < fragment - 0.01; s += 2) {
      kick.triggerAttackRelease('D1', 0.25, s, 0.75)
      kick.triggerAttackRelease('D1', 0.25, s + 0.75, 0.45)
      clap.triggerAttackRelease(0.12, s + 1, 0.5)
    }
    for (let s = chal; s < fragment - 0.01; s += 0.25) hat.triggerAttackRelease(0.03, s, (Math.round((s - chal) * 4) % 2 ? 0.25 : 0.4))
    // each challenge: a restrained low hit
    for (const m of ['challenge1', 'challenge2', 'challenge3', 'challenge4']) thump.triggerAttackRelease('A0', 0.6, mark(m), 0.6)
    // the network breaks: the beat tightens and climbs, then stops
    // (kept under the narration's last line — the climax is the cut to silence)
    for (let s = fragment; s < silence - 0.01; ) {
      const k = (s - fragment) / (silence - fragment)
      kick.triggerAttackRelease('D1', 0.2, s, 0.28 + 0.32 * k)
      s += k < 0.45 ? 0.5 : k < 0.8 ? 0.25 : 0.125
    }
    riser(fragment + 0.5, silence, -25, 300, 9000)
    sub.triggerAttackRelease('A0', silence - fragment, fragment, 0.45)
    // silence — then a reverse swell into the reveal
    const ignite = mark('ignite')
    riser(ignite - 1.1, ignite, -20, 2000, 9000)

    // --------------------------------------------------- 04 the reveal
    boom.triggerAttackRelease('F0', 3.2, ignite, 1)
    crash.triggerAttackRelease(2.2, ignite, 0.6)
    play(glass, ['F4', 'A4', 'C5', 'G5', 'C6'], ignite, 4.5, 0.55)
    const s4 = [
      [ignite, ignite + 4, 'Bb'],
      [ignite + 4, mark('structure'), 'F'],
      [mark('structure'), mark('observe'), 'C'],
    ]
    padFilter.frequency.setValueAtTime(900, ignite)
    padFilter.frequency.linearRampToValueAtTime(2600, mark('observe'))
    for (const [a, b, c] of s4) {
      play(pad, CHORDS[c], a, b - a + 0.3, 0.6)
      sub.triggerAttackRelease(ROOT[c] + '1', b - a, a, 0.55)
    }
    // the PRISM motif with the logo
    MOTIF.forEach((n, i) => bell.triggerAttackRelease(n, 1.6, mark('logo') + i * 0.25, 0.65))
    // crystalline arpeggio grows under the positioning line
    const arpFrom = line('s4-platform').start
    arpFilter.frequency.setValueAtTime(1200, arpFrom)
    arpFilter.frequency.linearRampToValueAtTime(4200, mark('observe'))
    {
      let i = 0
      for (let s = Math.ceil(arpFrom * 4) / 4; s < mark('observe') - 0.01; s += 0.25) {
        const c = s < ignite + 4 ? 'Bb' : s < mark('structure') ? 'F' : 'C'
        arp.triggerAttackRelease(ARP[c][i++ % 6].replace(/\d/, (d) => String(+d + 1)), 0.1, s, 0.25 + 0.4 * ((s - arpFrom) / (mark('observe') - arpFrom)))
      }
    }
    // the structure forms: the pulse returns
    for (let s = mark('structure') + 1.5; s < mark('observe') - 0.01; s += 0.5) {
      kick.triggerAttackRelease('C1', 0.25, s, 0.35 + 0.4 * ((s - mark('structure')) / 3.4))
      hat.triggerAttackRelease(0.03, s + 0.25, 0.3)
    }
    // Observe. Evaluate. Govern. — on the beat
    const pillars = [
      ['observe', 'Bb'],
      ['evaluate', 'C'],
      ['govern', 'F'],
    ]
    for (const [m, c] of pillars) {
      const s = mark(m)
      kick.triggerAttackRelease('C1', 0.3, s, 1)
      clap.triggerAttackRelease(0.15, s, 0.8)
      play(stab, CHORDS[c].map((n) => n.replace(/\d/, (d) => String(+d + 1))), s, 0.9, 0.7)
      sub.triggerAttackRelease(ROOT[c] + '1', 0.9, s, 0.8)
    }
    for (let s = mark('govern') + 0.5; s < mark('groove') - 0.01; s += 0.0625) clap.triggerAttackRelease(0.05, s, 0.15 + 0.5 * ((s - mark('govern')) / 1.5))
    riser(mark('govern') + 0.2, mark('groove'), -22, 600, 9000)

    // --------------------------------------------- 05–07 the groove
    const grooveStart = mark('groove')
    const wheel = mark('wheel')
    const organised = mark('organised')
    const converge = mark('converge')
    const prog = []
    {
      const loop = ['F', 'C', 'Dm', 'Bb']
      let i = 0
      for (let s = grooveStart; s < wheel - 0.01; s += 4) prog.push([s, Math.min(s + 4, wheel), loop[i++ % 4]])
      prog.push([wheel, mark('group1'), 'Dm'], [mark('group1'), mark('group2'), 'Bb'], [mark('group2'), mark('group3'), 'C'], [mark('group3'), mark('wheelComplete'), 'Dm'], [mark('wheelComplete'), organised, 'Bb'])
      prog.push([organised, organised + 2, 'Bb'], [organised + 2, organised + 3.85, 'C'], [organised + 3.85, organised + 5.4, 'Am'], [organised + 5.4, converge, 'Csus'])
    }
    padFilter.frequency.setValueAtTime(2000, grooveStart)
    for (const [a, b, c] of prog) {
      play(pad, CHORDS[c], a, b - a + 0.2, a >= organised ? 0.7 : 0.5)
      // bass: driving eighths, octave lift on the last eighth of each bar
      for (let s = a; s < b - 0.01; s += 0.5) {
        const lift = Math.round((s - grooveStart) / 0.5) % 4 === 3
        bass.triggerAttackRelease(ROOT[c] + (lift ? '2' : '1'), 0.2, s, a >= wheel && a < organised ? 0.45 : 0.62)
      }
      // arpeggio
      let i = 0
      for (let s = a; s < b - 0.01; s += 0.25) arp.triggerAttackRelease(ARP[c][i++ % 6].replace(/\d/, (d) => String(+d + 1)), 0.09, s, a >= wheel ? 0.5 : 0.36)
    }
    arpFilter.frequency.setValueAtTime(2600, grooveStart)
    arpFilter.frequency.linearRampToValueAtTime(3600, wheel)
    arpFilter.frequency.linearRampToValueAtTime(5200, converge)
    // drums + pump
    const chapterEdges = TL.chapters.slice(1).map((c) => c.start)
    for (let s = grooveStart; s < converge - 0.01; s += 0.5) {
      const beat = Math.round((s - grooveStart) / 0.5)
      const inWheel = s >= wheel && s < mark('wheelComplete')
      const breath = chapterEdges.some((e) => s >= e - 0.01 && s < e + 0.49)
      const strong = !inWheel || beat % 2 === 0
      if (strong && !breath) {
        kick.triggerAttackRelease('C1', 0.25, s, s >= organised ? 0.95 : 0.8)
        pump.gain.setValueAtTime(0.5, s)
        pump.gain.exponentialRampToValueAtTime(1, s + 0.24)
      }
      if (beat % 2 === 1 && !inWheel) clap.triggerAttackRelease(0.13, s, 0.55)
      hat.triggerAttackRelease(0.03, s + 0.25, 0.42)
      if (s >= organised) ohat.triggerAttackRelease(0.15, s + 0.25, 0.35)
      for (let q = 0; q < 4; q++) shaker.triggerAttackRelease(0.04, s + q * 0.125, q % 2 ? 0.25 : 0.45)
    }
    // chapter turns: a small lift
    for (const e of chapterEdges) {
      riser(e - 1.0, e, -30, 1500, 7000)
      crash.triggerAttackRelease(0.9, e, 0.25)
    }
    // the wheel completes; the network returns organised
    riser(mark('wheelComplete') + 1.2, organised, -24, 800, 8000)
    crash.triggerAttackRelease(1.8, organised, 0.5)
    boom.triggerAttackRelease('Bb0', 1.5, organised, 0.55)

    // ------------------------------------------------- 08 resolution
    const resolve = mark('resolve')
    play(pad, CHORDS.Bb, converge, resolve - converge + 0.1, 0.6)
    riser(converge, resolve, -18, 400, 10000)
    boom.triggerAttackRelease('F0', 4, resolve, 1)
    crash.triggerAttackRelease(2.6, resolve, 0.5)
    // the final chord holds to the last second and fades with the picture
    play(pad, ['F2', 'C3', 'F3', 'A3', 'G4'], resolve, duration - resolve - 0.9, 0.7)
    play(glass, ['F4', 'A4', 'C5', 'G5', 'C6'], resolve, duration - resolve - 0.9, 0.6)
    sub.triggerAttackRelease('F1', duration - resolve - 1.2, resolve, 0.8)
    MOTIF.forEach((n, i) => bell.triggerAttackRelease(n, 2.4, resolve + 0.1 + i * 0.25, 0.75))
    bell.triggerAttackRelease('C6', 2.6, line('s8-chain').start, 0.35)
    bell.triggerAttackRelease('F6', 3, line('s8-outcome').start, 0.4)
    padFilter.frequency.setValueAtTime(2400, resolve)
    padFilter.frequency.exponentialRampToValueAtTime(900, duration - 0.2)
    // an elegant fade, never a cut
    master.gain.setValueAtTime(1, duration - 2.6)
    master.gain.linearRampToValueAtTime(0, duration - 0.04)
  }

  /* -------------------------------------------------------- sound design */

  async function sfx(TL, duration) {
    const { mark, line } = cues(TL)
    const r = rng(1113)
    const out = new Tone.Gain(1).toDestination()
    const hall = new Tone.Reverb({ decay: 5, preDelay: 0.02, wet: 1 })
    await hall.ready
    hall.connect(out)
    const send = (node, amt) => node.connect(new Tone.Gain(amt).connect(hall))

    // UI click
    // clicks are transients: set by peak, well under the voice (≈ −18 dBFS in the stem)
    const clickTone = new Tone.Synth({ oscillator: { type: 'sine' }, envelope: { attack: 0.001, decay: 0.03, sustain: 0, release: 0.02 }, volume: -33 })
    const clickNoiseF = new Tone.Filter({ frequency: 4500, type: 'highpass' }).connect(out)
    const clickNoise = new Tone.NoiseSynth({ noise: { type: 'white' }, envelope: { attack: 0.001, decay: 0.012, sustain: 0 }, volume: -35 })
    clickTone.connect(out)
    clickNoise.connect(clickNoiseF)
    const click = (t, v = 1) => {
      clickTone.triggerAttackRelease('A6', 0.02, t, 0.6 * v)
      clickNoise.triggerAttackRelease(0.01, t, 0.8 * v)
    }

    // soft data blips / pings
    const pingPan = new Tone.Panner(0).connect(out)
    const ping = new Tone.PolySynth(Tone.Synth, { oscillator: { type: 'sine' }, envelope: { attack: 0.002, decay: 0.25, sustain: 0, release: 0.3 }, volume: -26 })
    ping.connect(pingPan)
    send(ping, 0.5)
    const PENTA = ['D5', 'F5', 'G5', 'A5', 'C6', 'D6', 'F6']

    // glass shimmer (the prism)
    const shimmer = new Tone.PolySynth(Tone.FMSynth, {
      harmonicity: 5.02,
      modulationIndex: 6,
      envelope: { attack: 0.01, decay: 2.4, sustain: 0, release: 2 },
      modulationEnvelope: { attack: 0.01, decay: 1.2, sustain: 0, release: 1 },
      volume: -28,
    })
    shimmer.connect(out)
    send(shimmer, 0.8)

    // warning and error tones — restrained, musical
    const warn = new Tone.Synth({ oscillator: { type: 'triangle' }, envelope: { attack: 0.005, decay: 0.3, sustain: 0.1, release: 0.4 }, volume: -22 })
    warn.connect(out)
    send(warn, 0.35)

    // whooshes
    function whoosh(t, len = 0.9, db = -24, panFrom = -0.6, panTo = 0.6, lo = 400, hi = 6000) {
      const n = new Tone.Noise('pink')
      const f = new Tone.Filter({ frequency: lo, type: 'bandpass', Q: 0.9 })
      const g = new Tone.Gain(0)
      const p = new Tone.Panner(panFrom)
      n.chain(f, g, p, out)
      send(g, 0.25)
      f.frequency.setValueAtTime(lo, t)
      f.frequency.exponentialRampToValueAtTime(hi, t + len * 0.55)
      f.frequency.exponentialRampToValueAtTime(lo * 1.5, t + len)
      g.gain.setValueAtTime(0.0001, t)
      g.gain.exponentialRampToValueAtTime(Tone.dbToGain(db), t + len * 0.55)
      g.gain.exponentialRampToValueAtTime(0.0001, t + len)
      p.pan.setValueAtTime(panFrom, t)
      p.pan.linearRampToValueAtTime(panTo, t + len)
      n.start(t).stop(t + len + 0.02)
    }

    // 01 — first light and the network forming
    shimmer.triggerAttackRelease(['D6', 'A6'], 2, mark('firstLight'), 0.5)
    for (let s = mark('networkForms'); s < 9.5; s += 0.12 + r() * 0.35) {
      pingPan.pan.setValueAtTime(r() * 1.6 - 0.8, s)
      ping.triggerAttackRelease(PENTA[Math.floor(r() * PENTA.length)], 0.08, s, 0.12 + r() * 0.15)
    }
    whoosh(mark('pushIn'), 1.2, -26, 0.4, -0.4, 300, 3500)

    // 02 — the request: typing, send, a ping at each node
    const req = line('s2-chain').start
    // typing finishes before the request is sent (one synth plays clicks in time order)
    for (let i = 0; i < 12; i++) click(mark('promptCard') + 0.08 + i * (req - mark('promptCard') - 0.2) / 12 + r() * 0.012, 0.35)
    click(req, 0.9)
    whoosh(req + 0.05, 3.4, -32, -0.7, 0.7, 600, 2400)
    for (let i = 0; i < 7; i++) {
      const at = req + 0.15 + 3.25 * (0.5 - 0.5 * Math.cos((i / 6) * Math.PI))
      ping.triggerAttackRelease(['D5', 'F5', 'G5', 'A5', 'C6', 'D6', 'F6'][i], 0.2, at, 0.45)
    }
    // complexity: chatter
    for (let s = mark('complexity'); s < mark('q3') + 1; s += 0.06 + r() * 0.12) {
      pingPan.pan.setValueAtTime(r() * 1.8 - 0.9, s)
      ping.triggerAttackRelease(PENTA[Math.floor(r() * PENTA.length)], 0.05, s, 0.08 + r() * 0.1)
    }

    // 03 — the four challenges
    warn.triggerAttackRelease('A5', 0.18, mark('challenge1') + 0.12, 0.6)
    warn.triggerAttackRelease('E5', 0.3, mark('challenge1') + 0.32, 0.5)
    warn.triggerAttackRelease('Bb4', 0.22, mark('challenge2') + 0.12, 0.6)
    warn.triggerAttackRelease('A4', 0.4, mark('challenge2') + 0.34, 0.55)
    for (let i = 0; i < 18; i++) click(mark('challenge3') + 0.2 + i * 0.07, 0.25 + 0.02 * i)
    warn.triggerAttackRelease('D5', 0.5, mark('challenge4') + 0.12, 0.4)
    whoosh(mark('fragment'), 2.6, -30, 0.8, -0.8, 200, 1500)

    // 04 — the prism
    const ignite = mark('ignite')
    shimmer.triggerAttackRelease(['F6', 'C7', 'A6'], 3, ignite, 0.8)
    whoosh(ignite + 0.4, 2.6, -24, -0.8, 0.2, 300, 5000)
    shimmer.triggerAttackRelease(['C6', 'G6'], 2.4, mark('logo'), 0.45)
    // nodes settling into their lanes
    for (let i = 0; i < 16; i++) click(mark('structure') - 1.6 + i * 0.13, 0.22)
    shimmer.triggerAttackRelease(['A6'], 1.6, mark('observe'), 0.35)
    shimmer.triggerAttackRelease(['C7'], 1.6, mark('evaluate'), 0.35)
    shimmer.triggerAttackRelease(['F7'], 2, mark('govern'), 0.4)
    whoosh(mark('refraction'), 1.3, -20, -0.9, 0.9, 500, 9000)
    shimmer.triggerAttackRelease(['F6', 'A6', 'C7'], 2.4, mark('refraction') + 0.3, 0.5)

    // 05 — interface clicks (same frames as the cursor's clicks)
    for (const s of [64.55, 67.95, 69.05, 69.95, 72.0, 76.45, 79.5, 87.5]) click(s, 1)
    for (const c of TL.chapters.slice(1)) whoosh(c.start - 0.15, 0.7, -32, -0.3, 0.3, 800, 4500)
    whoosh(95.4, 1.2, -26, 0.2, -0.2, 300, 2500)

    // 06 — the wheel: one note per capability as it lights
    const groups = [mark('group1'), mark('group2'), mark('group3')]
    const notes = ['F5', 'A5', 'C6', 'D6', 'F6', 'G6', 'A6', 'C7', 'D7']
    for (let i = 0; i < 9; i++) {
      const at = groups[Math.floor(i / 3)] + (i % 3) * (5 / 30)
      ping.triggerAttackRelease(notes[i], 0.3, at, 0.5)
    }
    whoosh(mark('wheel') + 0.2, 1.4, -28, 0, 0, 300, 3000)
    shimmer.triggerAttackRelease(['F6', 'C7'], 2.4, mark('wheelComplete'), 0.5)

    // 07 — outcomes
    whoosh(mark('organised') - 0.3, 1.1, -26, 0.6, -0.6, 300, 4000)
    for (const id of ['s7-faster', 's7-reliability', 's7-costs', 's7-confidence']) ping.triggerAttackRelease('C6', 0.3, line(id).start, 0.3)

    // 08 — converge and resolve
    whoosh(mark('converge'), 1.0, -24, 0.9, 0, 400, 7000)
    shimmer.triggerAttackRelease(['F6', 'A6', 'C7', 'G7'], 4, mark('resolve'), 0.75)

    out.gain.setValueAtTime(1, duration - 1.5)
    out.gain.linearRampToValueAtTime(0, duration - 0.05)
  }

  /* --------------------------------------------------------------- mix */

  const stems = {}

  async function renderStem(name, TL, duration) {
    const fn = name === 'music' ? music : sfx
    const buf = await Tone.Offline(async () => {
      await fn(TL, duration)
    }, duration, 2, SR)
    stems[name] = buf.toArray()
    return peakInfo(stems[name])
  }

  function peakInfo(chs) {
    let p = 0
    for (const c of chs) for (let i = 0; i < c.length; i++) p = Math.max(p, Math.abs(c[i]))
    return { peakDb: 20 * Math.log10(p || 1e-9), length: chs[0].length }
  }

  /** VO lines arrive as 24 kHz mono Float32Arrays (base64) with start times */
  function loadVO(lines) {
    stems.voLines = lines.map((l) => {
      const bin = atob(l.data)
      const bytes = new Uint8Array(bin.length)
      for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i)
      return { start: l.start, end: l.end, sr: l.sr, samples: new Float32Array(bytes.buffer) }
    })
    return stems.voLines.length
  }

  /**
   * mode 'vo'    the narration alone, processed
   * mode 'full'  narration + music (ducked under the voice) + effects, mastered
   * mode 'novo'  music + effects, mastered (for localisation)
   */
  async function renderMix(mode, duration, opts) {
    const buf = await Tone.Offline(async () => {
      const master = new Tone.Gain(Tone.dbToGain(opts.masterDb))
      const comp = new Tone.Compressor({ threshold: -16, ratio: 2.2, attack: 0.02, release: 0.25, knee: 8 })
      const limiter = new Tone.Limiter(-1.2)
      if (mode === 'vo') master.toDestination()
      else master.chain(comp, limiter, Tone.getDestination())

      if (mode !== 'vo') {
        const musicGain = new Tone.Gain(Tone.dbToGain(opts.musicDb)).connect(master)
        const duck = new Tone.Gain(1).connect(musicGain)
        const m = new Tone.Player(Tone.ToneAudioBuffer.fromArray(stems.music)).connect(duck)
        m.start(0)
        if (mode === 'full') {
          // duck under the voice — each line by its own measured depth (opts.lineDucks),
          // staying down through short pauses so the bed never pumps
          duck.gain.setValueAtTime(1, 0)
          const ls = stems.voLines
          for (let i = 0; i < ls.length; i++) {
            const l = ls[i]
            const next = ls[i + 1]
            const d = Tone.dbToGain(opts.lineDucks ? opts.lineDucks[i] : opts.duckDb)
            duck.gain.setTargetAtTime(d, Math.max(0, l.start - 0.12), 0.06)
            if (!next || next.start - l.end > 0.7) duck.gain.setTargetAtTime(1, l.end + 0.1, 0.22)
          }
        }
        const fx = new Tone.Player(Tone.ToneAudioBuffer.fromArray(stems.sfx)).connect(new Tone.Gain(Tone.dbToGain(opts.sfxDb)).connect(master))
        fx.start(0)
      }

      if (mode !== 'novo') {
        // voice chain: clean low end, a touch of presence and air, gentle levelling
        const hp = new Tone.Filter({ frequency: 85, type: 'highpass', rolloff: -24 })
        const eq = new Tone.EQ3({ low: -1.5, mid: 0, high: 2.2, lowFrequency: 260, highFrequency: 4200 })
        const comp = new Tone.Compressor({ threshold: -22, ratio: 3, attack: 0.006, release: 0.14, knee: 6 })
        const voGain = new Tone.Gain(Tone.dbToGain(opts.voDb))
        const roomVerb = new Tone.Reverb({ decay: 1.1, preDelay: 0.008, wet: 1 })
        await roomVerb.ready
        hp.chain(eq, comp, voGain, master)
        voGain.connect(new Tone.Gain(0.06).connect(roomVerb))
        roomVerb.connect(master)
        for (const l of stems.voLines) {
          const ab = new AudioBuffer({ length: l.samples.length, numberOfChannels: 1, sampleRate: l.sr })
          ab.copyToChannel(l.samples, 0)
          const p = new Tone.Player(new Tone.ToneAudioBuffer(ab))
          p.connect(hp)
          p.start(l.start)
        }
      }
    }, duration, 2, SR)
    stems['mix-' + mode] = buf.toArray()
    return peakInfo(stems['mix-' + mode])
  }

  /** Pull a stem out in chunks: base64 of interleaved-by-channel Float32 */
  function chunk(name, ch, from, to) {
    const a = stems[name][ch].subarray(from, to)
    const bytes = new Uint8Array(a.buffer, a.byteOffset, a.byteLength)
    let s = ''
    for (let i = 0; i < bytes.length; i += 0x8000) s += String.fromCharCode.apply(null, bytes.subarray(i, i + 0x8000))
    return btoa(s)
  }

  /** Restore a cached stem */
  function alloc(name, length) {
    stems[name] = [new Float32Array(length), new Float32Array(length)]
  }
  function put(name, ch, from, b64) {
    const bin = atob(b64)
    const bytes = new Uint8Array(bin.length)
    for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i)
    stems[name][ch].set(new Float32Array(bytes.buffer), from)
  }

  window.PRISM_AUDIO = { renderStem, loadVO, renderMix, chunk, alloc, put, stems }
})()
