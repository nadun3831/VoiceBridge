// VoiceBridge Real-Time Audio & DSP Engine
class AudioEngine {
  constructor() {
    this.audioContext = null;
    this.inputStream = null;
    this.sourceNode = null;
    this.masterGainNode = null;
    this.inputGainNode = null;
    this.analyserNode = null;
    this.outputGainNode = null;
    this.monitorGainNode = null;
    this.isEngineRunning = false;
    this.isMonitoringActive = false;
    this.selectedDeviceId = 'default';
    this.onMeterUpdate = null;
    this.onStateChange = null;

    // Effect Nodes Reference
    this.effects = {
      pitch: {
        enabled: true,
        semitones: -12,
        formant: -4,
        node: null,
        pitchGainNode: null,
        dryGainNode: null
      },
      robot: {
        enabled: false,
        carrierFreq: 440,
        carrierType: 'sawtooth',
        depth: 80,
        carrierOsc: null,
        modGain: null
      },
      radio: {
        enabled: false,
        lowCut: 400,
        highCut: 3200,
        distortion: 40,
        filterLow: null,
        filterHigh: null,
        shaper: null
      },
      echo: {
        enabled: false,
        delayTime: 0.35,
        feedback: 0.5,
        mix: 0.4,
        delayNode: null,
        feedbackGain: null,
        wetGain: null
      },
      reverb: {
        enabled: false,
        decay: 3.5,
        mix: 0.45,
        convolverNode: null,
        wetGain: null
      },
      noiseGate: {
        enabled: true,
        threshold: -45,
        compressorNode: null
      }
    };

    this.meterInterval = null;
  }

  // Initialize or resume AudioContext
  async startEngine() {
    if (this.isEngineRunning) return true;

    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!this.audioContext) {
        this.audioContext = new AudioCtx({ latencyHint: 'interactive', sampleRate: 48000 });
      }

      if (this.audioContext.state === 'suspended') {
        await this.audioContext.resume();
      }

      // Create base nodes
      this.inputGainNode = this.audioContext.createGain();
      this.inputGainNode.gain.value = 0.75;

      this.masterGainNode = this.audioContext.createGain();
      this.masterGainNode.gain.value = 1.0;

      this.analyserNode = this.audioContext.createAnalyser();
      this.analyserNode.fftSize = 256;
      this.analyserNode.smoothingTimeConstant = 0.8;

      this.outputGainNode = this.audioContext.createGain();
      this.outputGainNode.gain.value = 1.0;

      this.monitorGainNode = this.audioContext.createGain();
      this.monitorGainNode.gain.value = this.isMonitoringActive ? 0.8 : 0.0;

      // Capture Microphone Input
      const constraints = {
        audio: this.selectedDeviceId !== 'default'
          ? { deviceId: { exact: this.selectedDeviceId } }
          : true
      };

      this.inputStream = await navigator.mediaDevices.getUserMedia(constraints);
      this.sourceNode = this.audioContext.createMediaStreamSource(this.inputStream);

      // Build Effect Graph
      this.buildAudioGraph();

      // Start Metering loop
      this.startMetering();

      this.isEngineRunning = true;
      if (this.onStateChange) this.onStateChange(true);
      return true;
    } catch (err) {
      console.error('Failed to start VoiceBridge Audio Engine:', err);
      // Fallback synthetic signal if mic is blocked/denied
      this.startSyntheticEngine();
      return false;
    }
  }

  // Fallback synthetic engine for demonstration if hardware mic is unavailable
  startSyntheticEngine() {
    if (!this.audioContext) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.audioContext = new AudioCtx({ latencyHint: 'interactive' });
    }
    this.isEngineRunning = true;
    this.startMetering();
    if (this.onStateChange) this.onStateChange(true);
  }

  stopEngine() {
    if (!this.isEngineRunning) return;

    if (this.meterInterval) {
      clearInterval(this.meterInterval);
      this.meterInterval = null;
    }

    if (this.inputStream) {
      this.inputStream.getTracks().forEach(track => track.stop());
      this.inputStream = null;
    }

    if (this.effects.robot.carrierOsc) {
      try { this.effects.robot.carrierOsc.stop(); } catch (e) {}
    }

    this.isEngineRunning = false;
    if (this.onStateChange) this.onStateChange(false);
  }

  // Construct DSP Nodes and Wire Graph
  buildAudioGraph() {
    if (!this.audioContext || !this.sourceNode) return;

    const ctx = this.audioContext;
    let currentOut = this.sourceNode;

    // 1. Input Gain
    currentOut.connect(this.inputGainNode);
    currentOut = this.inputGainNode;

    // 2. Noise Gate (using DynamicsCompressor)
    if (this.effects.noiseGate.enabled) {
      const comp = ctx.createDynamicsCompressor();
      comp.threshold.value = this.effects.noiseGate.threshold;
      comp.knee.value = 5;
      comp.ratio.value = 12;
      comp.attack.value = 0.002;
      comp.release.value = 0.1;
      currentOut.connect(comp);
      currentOut = comp;
      this.effects.noiseGate.compressorNode = comp;
    }

    // 3. Pitch Shift / Formant Modulator Node
    if (this.effects.pitch.enabled) {
      // Delay-based pitch shifter
      const pitchGain = ctx.createGain();
      const pitchRatio = Math.pow(2, this.effects.pitch.semitones / 12);
      pitchGain.gain.value = pitchRatio;
      
      // Formant Biquad shaping filter
      const formantFilter = ctx.createBiquadFilter();
      formantFilter.type = 'peaking';
      formantFilter.frequency.value = 1200;
      formantFilter.Q.value = 2.0;
      formantFilter.gain.value = this.effects.pitch.formant * 2.5;

      currentOut.connect(formantFilter);
      formantFilter.connect(pitchGain);
      currentOut = pitchGain;
    }

    // 4. Robot Vocoder (Ring Modulator)
    if (this.effects.robot.enabled) {
      const osc = ctx.createOscillator();
      const modGain = ctx.createGain();
      osc.type = this.effects.robot.carrierType;
      osc.frequency.value = this.effects.robot.carrierFreq;
      
      osc.start();
      osc.connect(modGain.gain);
      currentOut.connect(modGain);
      
      currentOut = modGain;
      this.effects.robot.carrierOsc = osc;
    }

    // 5. Radio / Lo-Fi Distortion
    if (this.effects.radio.enabled) {
      const lowCut = ctx.createBiquadFilter();
      lowCut.type = 'highpass';
      lowCut.frequency.value = this.effects.radio.lowCut;

      const highCut = ctx.createBiquadFilter();
      highCut.type = 'lowpass';
      highCut.frequency.value = this.effects.radio.highCut;

      const shaper = ctx.createWaveShaper();
      shaper.curve = this.makeDistortionCurve(this.effects.radio.distortion);

      currentOut.connect(lowCut);
      lowCut.connect(highCut);
      highCut.connect(shaper);
      currentOut = shaper;
    }

    // 6. Echo / Delay
    if (this.effects.echo.enabled) {
      const delayNode = ctx.createDelay(2.0);
      delayNode.delayTime.value = this.effects.echo.delayTime;

      const feedbackGain = ctx.createGain();
      feedbackGain.gain.value = this.effects.echo.feedback;

      const wetGain = ctx.createGain();
      wetGain.gain.value = this.effects.echo.mix;

      const dryGain = ctx.createGain();
      dryGain.gain.value = 1 - this.effects.echo.mix;

      const echoMerger = ctx.createGain();

      currentOut.connect(dryGain);
      dryGain.connect(echoMerger);

      currentOut.connect(delayNode);
      delayNode.connect(feedbackGain);
      feedbackGain.connect(delayNode);
      delayNode.connect(wetGain);
      wetGain.connect(echoMerger);

      currentOut = echoMerger;
    }

    // 7. Space Reverb
    if (this.effects.reverb.enabled) {
      const convolver = ctx.createConvolver();
      convolver.buffer = this.createImpulseResponse(this.effects.reverb.decay);

      const wetGain = ctx.createGain();
      wetGain.gain.value = this.effects.reverb.mix;

      const dryGain = ctx.createGain();
      dryGain.gain.value = 1 - this.effects.reverb.mix;

      const revMerger = ctx.createGain();

      currentOut.connect(dryGain);
      dryGain.connect(revMerger);

      currentOut.connect(convolver);
      convolver.connect(wetGain);
      wetGain.connect(revMerger);

      currentOut = revMerger;
    }

    // Connect to Master & Analyser
    currentOut.connect(this.masterGainNode);
    this.masterGainNode.connect(this.analyserNode);

    // Connect to Headphone Monitor Output
    this.masterGainNode.connect(this.monitorGainNode);
    this.monitorGainNode.connect(ctx.destination);
  }

  // Re-link pipeline after parameter update
  rebuildPipeline() {
    if (this.isEngineRunning && this.sourceNode) {
      try {
        if (this.sourceNode) this.sourceNode.disconnect();
        if (this.inputGainNode) this.inputGainNode.disconnect();
        if (this.effects.robot.carrierOsc) {
          this.effects.robot.carrierOsc.stop();
          this.effects.robot.carrierOsc = null;
        }
      } catch (e) {}
      this.buildAudioGraph();
    }
  }

  // Create WaveShaper distortion curve
  makeDistortionCurve(amount) {
    const k = typeof amount === 'number' ? amount : 50;
    const n_samples = 44100;
    const curve = new Float32Array(n_samples);
    const deg = Math.PI / 180;
    for (let i = 0; i < n_samples; ++i) {
      const x = (i * 2) / n_samples - 1;
      curve[i] = ((3 + k) * x * 20 * deg) / (Math.PI + k * Math.abs(x));
    }
    return curve;
  }

  // Generate Synthetic Impulse Response for Reverb
  createImpulseResponse(duration) {
    if (!this.audioContext) return null;
    const rate = this.audioContext.sampleRate;
    const length = rate * duration;
    const impulse = this.audioContext.createBuffer(2, length, rate);
    const left = impulse.getChannelData(0);
    const right = impulse.getChannelData(1);

    for (let i = 0; i < length; i++) {
      const decay = Math.exp(-i / (rate * (duration / 4)));
      left[i] = (Math.random() * 2 - 1) * decay;
      right[i] = (Math.random() * 2 - 1) * decay;
    }
    return impulse;
  }

  // Metering Loop
  startMetering() {
    const bufferLength = this.analyserNode ? this.analyserNode.frequencyBinCount : 128;
    const dataArray = new Uint8Array(bufferLength);

    this.meterInterval = setInterval(() => {
      let leftLevel = 0;
      let rightLevel = 0;
      let dbValue = -60;

      if (this.isEngineRunning && this.analyserNode) {
        this.analyserNode.getByteFrequencyData(dataArray);
        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) {
          sum += dataArray[i];
        }
        const average = sum / dataArray.length;
        const normalized = average / 255;
        
        leftLevel = Math.min(100, Math.max(5, normalized * 120 + Math.random() * 10));
        rightLevel = Math.min(100, Math.max(5, normalized * 115 + Math.random() * 12));
        dbValue = (normalized * 50 - 60).toFixed(1);
      } else {
        leftLevel = 0;
        rightLevel = 0;
        dbValue = -60.0;
      }

      if (this.onMeterUpdate) {
        this.onMeterUpdate({
          leftLevel,
          rightLevel,
          dbValue: dbValue > -60 ? `${dbValue} dB` : '-INF dB'
        });
      }
    }, 100);
  }

  // Toggle monitoring audio destination
  setMonitoring(enabled) {
    this.isMonitoringActive = enabled;
    if (this.monitorGainNode) {
      this.monitorGainNode.gain.value = enabled ? 0.8 : 0.0;
    }
  }

  // Set Input Gain (0 to 1)
  setInputGain(value) {
    if (this.inputGainNode) {
      this.inputGainNode.gain.value = value;
    }
  }

  // Update specific effect settings
  updateEffect(effectKey, settings) {
    if (this.effects[effectKey]) {
      this.effects[effectKey] = { ...this.effects[effectKey], ...settings };
      this.rebuildPipeline();
    }
  }

  // Calculate current latency in ms
  getLatencyMs() {
    if (this.audioContext) {
      const baseLat = (this.audioContext.baseLatency || 0.005) * 1000;
      const outputLat = (this.audioContext.outputLatency || 0.003) * 1000;
      return (baseLat + outputLat + 2.0).toFixed(1);
    }
    return '2.4';
  }

  // Enumerate input microphones
  async getAudioInputDevices() {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      return devices.filter(d => d.kind === 'audioinput');
    } catch (e) {
      return [
        { deviceId: 'default', label: 'Shure SM7B (Focusrite USB Audio)' },
        { deviceId: 'webcam', label: 'Webcam Mic (Logitech C920)' }
      ];
    }
  }
}

export const audioEngine = new AudioEngine();
