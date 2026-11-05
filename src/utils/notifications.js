import Constants from 'expo-constants';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { supabase } from '../supabase';

// Configure how notifications behave when the app is in foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

/**
 * Registers device for push notifications and stores token in Supabase
 */
export async function registerForPushNotificationsAsync(userId) {
  if (!userId) return null;

  if (!Device.isDevice) {
    console.log("ℹ️ Push notifications require a physical device.");
    return null;
  }

  try {
    // 1. Android Notification Channel Setup
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('match-alerts', {
        name: 'Live Match Alerts',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#39FF14',
        sound: 'default',
      });
    }

    // 2. Permission Check
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.log("⚠️ Push notification permission not granted.");
      return null;
    }

    // 3. Obtain Expo Push Token using EAS Project ID
    const projectId = Constants?.expoConfig?.extra?.eas?.projectId ?? Constants?.easConfig?.projectId;
    const tokenData = await Notifications.getExpoPushTokenAsync({ projectId });
    const pushToken = tokenData.data;

    // 4. Upsert into Supabase user_push_tokens
    await supabase.from('user_push_tokens').upsert(
      [
        {
          user_id: userId,
          expo_push_token: pushToken,
          device_platform: Platform.OS,
          updated_at: new Date().toISOString(),
        },
      ],
      { onConflict: 'user_id,expo_push_token' }
    );

    return pushToken;
  } catch (error) {
    console.warn("Error registering for push notifications:", error);
    return null;
  }
}

/**
 * Dispatches a push notification to all followers/parents of a specific squad
 */
export async function dispatchTeamMatchNotification({ teamId, senderUserId, title, body, data = {} }) {
  if (!teamId) return;

  try {
    // 1. Query target follower tokens from Supabase RPC
    const { data: tokenRows, error } = await supabase.rpc('get_team_push_tokens', {
      target_team_id: teamId,
      sender_user_id: senderUserId || null,
    });

    if (error || !tokenRows || tokenRows.length === 0) return;

    const pushTokens = tokenRows.map((r) => r.expo_push_token).filter(Boolean);
    if (pushTokens.length === 0) return;

    // 2. Build Expo Push API payloads (High priority, background wake-up)
    const messages = pushTokens.map((token) => ({
      to: token,
      sound: 'default',
      title,
      body,
      priority: 'high',
      channelId: 'match-alerts',
      data: { ...data, teamId },
    }));

    // 3. Dispatch to Expo Push Service
    await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Accept-Encoding': 'gzip, deflate',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(messages),
    });
  } catch (err) {
    console.warn("Failed to dispatch match push notification:", err);
  }
}