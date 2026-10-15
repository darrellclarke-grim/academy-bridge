import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

/**
 * Safe wrapper to execute native haptics without throwing errors
 * on unsupported platforms, web, or simulator environments.
 */
const safeHaptic = async (fn) => {
  if (Platform.OS === 'web') return;
  try {
    await fn();
  } catch (err) {
    // Silently fail on devices or simulators without haptic hardware
  }
};

/**
 * ⚽ Goal Event: Double Success Notification Pulse
 */
export const hapticGoal = () =>
  safeHaptic(() =>
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
  );

/**
 * 🟨 / 🟥 Card Event: Sharp Warning Vibration Buzz
 */
export const hapticCard = () =>
  safeHaptic(() =>
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning)
  );

/**
 * 🔄 Substitution Event: Medium Impact Physical Bump
 */
export const hapticSub = () =>
  safeHaptic(() =>
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
  );

/**
 * ⏱️ Whistle Event (Kick-Off, Half-Time, Full-Time): Heavy Impact Vibration
 */
export const hapticWhistle = () =>
  safeHaptic(() =>
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy)
  );

/**
 * 🧤 Goalkeeper Save / Clean Sheet: Light Impact Pulse
 */
export const hapticSave = () =>
  safeHaptic(() =>
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
  );

/**
 * Subtle Button Tap: Selection / Navigation Tick
 */
export const hapticTap = () =>
  safeHaptic(() =>
    Haptics.selectionAsync()
  );