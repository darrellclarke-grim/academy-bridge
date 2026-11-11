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
 * Dispatches a push notification to all staff, parents, and players linked to a squad
 */
export async function dispatchTeamMatchNotification({ teamId, senderUserId, title, body, data = {} }) {
  if (!teamId) return;

  try {
    const targetUserIds = new Set();

    // 1. Fetch Staff User IDs (Coaches, Admins, Assistants)
    const { data: staffRows } = await supabase
      .from('team_staff')
      .select('user_id')
      .eq('team_id', teamId);

    (staffRows || []).forEach((s) => {
      if (s.user_id) targetUserIds.add(s.user_id);
    });

    // 2. Fetch Parent User IDs (Linked to any player on this team)
    const { data: playerRows } = await supabase
      .from('players')
      .select('id, user_id')
      .eq('team_id', teamId);

    const playerIds = (playerRows || []).map((p) => p.id);

    // Also notify dedicated player accounts
    (playerRows || []).forEach((p) => {
      if (p.user_id) targetUserIds.add(p.user_id);
    });

    if (playerIds.length > 0) {
      const { data: parentRows } = await supabase
        .from('parent_players')
        .select('parent_id')
        .in('player_id', playerIds);

      (parentRows || []).forEach((pr) => {
        if (pr.parent_id) targetUserIds.add(pr.parent_id);
      });
    }

    // 3. Exclude the sender so they don't get an alert for their own tap
    if (senderUserId) {
      targetUserIds.delete(senderUserId);
    }

    const uniqueUserIds = Array.from(targetUserIds);
    if (uniqueUserIds.length === 0) return;

    // 4. Query all active push tokens for these target users
    const { data: tokenRows, error: tokenErr } = await supabase
      .from('user_push_tokens')
      .select('expo_push_token')
      .in('user_id', uniqueUserIds);

    if (tokenErr || !tokenRows || tokenRows.length === 0) return;

    const pushTokens = Array.from(new Set(tokenRows.map((r) => r.expo_push_token).filter(Boolean)));
    if (pushTokens.length === 0) return;

    // 5. Build Expo Push API payloads
    const messages = pushTokens.map((token) => ({
      to: token,
      sound: 'default',
      title,
      body,
      priority: 'high',
      channelId: 'match-alerts',
      data: { ...data, teamId },
    }));

    // 6. Dispatch to Expo Push Service (Chunks of 100)
    const chunkSize = 100;
    for (let i = 0; i < messages.length; i += chunkSize) {
      const chunk = messages.slice(i, i + chunkSize);
      await fetch('https://exp.host/--/api/v2/push/send', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Accept-Encoding': 'gzip, deflate',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(chunk),
      });
    }
  } catch (err) {
    console.warn("Failed to dispatch match push notification:", err);
  }
}