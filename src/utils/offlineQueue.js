import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../supabase';

const OFFLINE_QUEUE_KEY = '@matchday_offline_queue';

/**
 * Fetch all currently queued offline events from local storage.
 */
export const getOfflineQueue = async () => {
  try {
    const rawQueue = await AsyncStorage.getItem(OFFLINE_QUEUE_KEY);
    return rawQueue ? JSON.parse(rawQueue) : [];
  } catch (error) {
    console.error('❌ Failed to read offline queue from AsyncStorage:', error);
    return [];
  }
};

/**
 * Add a failed network event payload to local device storage.
 * @param {Object} item - { table: 'live_ticker' | 'match_history', payload: Object }
 */
export const enqueueOfflineEvent = async (item) => {
  try {
    const queue = await getOfflineQueue();
    const newItem = {
      queueId: `${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      timestamp: new Date().toISOString(),
      ...item
    };
    const updatedQueue = [...queue, newItem];
    await AsyncStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(updatedQueue));
    console.log(`📦 Enqueued event locally [Queue size: ${updatedQueue.length}]`);
    return updatedQueue;
  } catch (error) {
    console.error('❌ Failed to write to offline queue:', error);
    return [];
  }
};

/**
 * Attempt to flush all queued items to Supabase.
 * Retains any items that fail due to persistent network issues.
 */
export const flushOfflineQueue = async () => {
  try {
    const queue = await getOfflineQueue();
    if (queue.length === 0) return { success: true, flushedCount: 0 };

    console.log(`📡 Attempting to flush ${queue.length} offline events to Supabase...`);
    const remainingQueue = [];
    let flushedCount = 0;

    for (const item of queue) {
      const { table, payload } = item;
      const { error } = await supabase.from(table).insert([payload]);

      if (error) {
        console.error(`⚠️ Failed to sync queue item (${item.queueId}):`, error.message);
        remainingQueue.push(item);
      } else {
        flushedCount++;
      }
    }

    await AsyncStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(remainingQueue));
    console.log(`✅ Flushed ${flushedCount} events. ${remainingQueue.length} items remaining in queue.`);
    
    return {
      success: remainingQueue.length === 0,
      flushedCount,
      remainingCount: remainingQueue.length
    };
  } catch (error) {
    console.error('❌ Error during queue flush:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Clear the offline queue entirely (e.g. on season or match reset).
 */
export const clearOfflineQueue = async () => {
  try {
    await AsyncStorage.removeItem(OFFLINE_QUEUE_KEY);
    console.log('🧹 Offline queue cleared.');
  } catch (error) {
    console.error('❌ Failed to clear offline queue:', error);
  }
};