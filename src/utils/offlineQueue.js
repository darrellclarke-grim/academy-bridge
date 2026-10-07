import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../supabase';

const QUEUE_KEY = '@tactical_engine_offline_queue';

/**
 * Retrieves all locally queued offline items from AsyncStorage.
 */
export const getOfflineQueue = async () => {
  try {
    const raw = await AsyncStorage.getItem(QUEUE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error('❌ Error reading offline queue:', e);
    return [];
  }
};

/**
 * Enqueues an offline payload (e.g. live ticker events, stats) when network fails.
 */
export const enqueueOfflineEvent = async (item) => {
  try {
    const currentQueue = await getOfflineQueue();
    const updatedQueue = [...currentQueue, { ...item, enqueuedAt: new Date().toISOString() }];
    await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(updatedQueue));
    return updatedQueue;
  } catch (e) {
    console.error('❌ Error enqueuing offline event:', e);
    return [];
  }
};

/**
 * Clears the entire offline queue from local storage.
 */
export const clearOfflineQueue = async () => {
  try {
    await AsyncStorage.removeItem(QUEUE_KEY);
  } catch (e) {
    console.error('❌ Error clearing offline queue:', e);
  }
};

/**
 * Flushes the queue by attempting to push each item to Supabase in FIFO order.
 * Successfully inserted items are removed; failed ones remain queued.
 */
export const flushOfflineQueue = async () => {
  const queue = await getOfflineQueue();
  if (queue.length === 0) return { flushedCount: 0, remainingCount: 0 };

  const remainingQueue = [];
  let flushedCount = 0;

  for (const item of queue) {
    try {
      const { table, payload } = item;
      if (!table || !payload) continue;

      const { error } = await supabase.from(table).insert([payload]);
      if (error) {
        // Keep in queue if Supabase rejected due to network/server failure
        remainingQueue.push(item);
      } else {
        flushedCount++;
      }
    } catch (e) {
      remainingQueue.push(item);
    }
  }

  try {
    await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(remainingQueue));
  } catch (e) {
    console.error('❌ Error saving remaining queue state:', e);
  }

  return { flushedCount, remainingCount: remainingQueue.length };
};