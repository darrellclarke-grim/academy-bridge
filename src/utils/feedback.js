import * as Haptics from 'expo-haptics';
import { Platform, Vibration } from 'react-native';

let createAudioPlayer = null;
let setAudioModeAsync = null;

try {
  const expoAudio = require('expo-audio');
  createAudioPlayer = expoAudio.createAudioPlayer;
  setAudioModeAsync = expoAudio.setAudioModeAsync;
} catch (e) {
  console.warn('[Audio Engine] expo-audio native module not detected:', e?.message);
}

const SOUND_ASSETS = {
  kickoff_whistle: require('../../assets/sounds/kickoff_whistle.m4a'),
  fulltime_whistle: require('../../assets/sounds/fulltime_whistle.m4a'),
  goal_cheer: require('../../assets/sounds/goal_cheer.m4a'),
  opponent_goal: require('../../assets/sounds/opponent_goal.m4a'),
  card_ref: require('../../assets/sounds/card_ref.m4a'),
  card_really_ref: require('../../assets/sounds/card_really_ref.m4a'),
  sub_voice: require('../../assets/sounds/sub_voice.m4a'),
};

// Player registry
const activePlayers = {};

/**
 * Configure audio mode to bypass hardware mute switch on matchdays
 */
export const initAudioSession = async () => {
  if (Platform.OS === 'web') return;
  try {
    if (setAudioModeAsync) {
      await setAudioModeAsync({
        playsInSilentMode: true,
      });
      console.log('✅ [Audio Engine] Silent mode bypass active.');
    }
  } catch (err) {
    console.warn('⚠️ [Audio Engine] Session config error:', err?.message);
  }
};

/**
 * Sound trigger: releases previous instance and plays fresh from 0.00s
 */
const playBundledSound = (soundKey) => {
  if (Platform.OS === 'web') return;
  const asset = SOUND_ASSETS[soundKey];
  if (!asset) {
    console.warn(`⚠️ [Audio Engine] Asset not found for key: ${soundKey}`);
    return;
  }

  try {
    if (createAudioPlayer) {
      // 1. Cleanly release previous instance of this sound
      if (activePlayers[soundKey]) {
        try {
          activePlayers[soundKey].pause();
          activePlayers[soundKey].release();
        } catch (_) {}
      }

      // 2. Fresh player instance (always starts at 0.00s)
      const player = createAudioPlayer(asset);
      activePlayers[soundKey] = player;

      // 3. Auto-release memory once clip finishes
      player.addListener('playbackStatusUpdate', (status) => {
        if (status.didJustFinish) {
          try {
            player.release();
          } catch (_) {}
          if (activePlayers[soundKey] === player) {
            delete activePlayers[soundKey];
          }
        }
      });

      player.play();
      console.log(`🔊 [Audio Engine] Playing: ${soundKey}`);
    }
  } catch (err) {
    console.warn(`❌ [Audio Engine] Error playing (${soundKey}):`, err?.message);
  }
};

// ==========================================
// AUDIO-TACTILE MATCHDAY TRIGGERS
// ==========================================

export const feedbackKickoffWhistle = () => {
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
  Vibration.vibrate(350);
  playBundledSound('kickoff_whistle');
};

export const feedbackFulltimeWhistle = () => {
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
  if (Platform.OS === 'android') {
    Vibration.vibrate([0, 150, 80, 150, 80, 450]);
  } else {
    Vibration.vibrate(600);
  }
  playBundledSound('fulltime_whistle');
};

export const feedbackOurGoal = () => {
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  if (Platform.OS === 'android') {
    Vibration.vibrate([0, 180, 80, 350]);
  } else {
    Vibration.vibrate(450);
  }
  playBundledSound('goal_cheer');
};

export const feedbackOpponentGoal = () => {
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
  Vibration.vibrate(250);
  playBundledSound('opponent_goal');
};

export const feedbackOpponentCard = () => {
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
  if (Platform.OS === 'android') {
    Vibration.vibrate([0, 120, 60, 120]);
  } else {
    Vibration.vibrate(250);
  }
  playBundledSound('card_ref');
};

export const feedbackOurCard = () => {
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
  if (Platform.OS === 'android') {
    Vibration.vibrate([0, 120, 60, 120]);
  } else {
    Vibration.vibrate(250);
  }
  playBundledSound('card_really_ref');
};

export const feedbackSubstitution = () => {
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  Vibration.vibrate(120);
  playBundledSound('sub_voice');
};