import AsyncStorage from '@react-native-async-storage/async-storage';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';

const CUSTOM_SOUNDS_KEY = 'custom_sounds';
const SOUNDS_DIR = (FileSystem.documentDirectory || '') + 'sounds/';

export interface CustomSound {
    id: string; // Unique ID (e.g., timestamp)
    name: string; // Display name
    uri: string; // Local file path (file://...)
}

export const CustomSoundService = {
    /**
     * Initializes the sounds directory.
     */
    async init() {
        try {
            const dir = await FileSystem.getInfoAsync(SOUNDS_DIR);
            if (!dir.exists) {
                await FileSystem.makeDirectoryAsync(SOUNDS_DIR, { intermediates: true });
            }
        } catch (error) {
            console.error('Error creating sounds directory:', error);
        }
    },

    /**
     * Opens document picker to select an audio file.
     * Copies it to the app's document directory and saves metadata.
     */
    async pickAndSaveSound(): Promise<CustomSound | null> {
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: 'audio/*',
                copyToCacheDirectory: true, // We will copy it ourselves, but safety first
            });

            if (result.canceled || !result.assets || result.assets.length === 0) {
                return null;
            }

            const asset = result.assets[0];
            await this.init();

            // Sanitize filename to be safe
            const safeName = asset.name.replace(/[^a-zA-Z0-9.-]/g, '_');
            const newFilename = `${Date.now()}-${safeName}`;
            const destination = SOUNDS_DIR + newFilename;

            await FileSystem.copyAsync({
                from: asset.uri,
                to: destination,
            });

            const newSound: CustomSound = {
                id: Date.now().toString(),
                name: asset.name.replace(/\.[^/.]+$/, ""), // Remove extension for display
                uri: destination,
            };

            await this.addSoundToStorage(newSound);
            return newSound;

        } catch (error) {
            console.error('Error picking/saving sound:', error);
            return null;
        }
    },

    /**
     * Retrieves all custom sounds from storage.
     */
    async getCustomSounds(): Promise<CustomSound[]> {
        try {
            const json = await AsyncStorage.getItem(CUSTOM_SOUNDS_KEY);
            return json ? JSON.parse(json) : [];
        } catch (error) {
            console.error('Error fetching custom sounds:', error);
            return [];
        }
    },

    /**
     * Adds a sound to AsyncStorage array.
     */
    async addSoundToStorage(sound: CustomSound) {
        try {
            const current = await this.getCustomSounds();
            current.push(sound);
            await AsyncStorage.setItem(CUSTOM_SOUNDS_KEY, JSON.stringify(current));
        } catch (error) {
            console.error('Error saving custom sound list:', error);
        }
    },

    /**
     * Deletes a sound from storage and filesystem.
     */
    async deleteSound(id: string) {
        try {
            const current = await this.getCustomSounds();
            const sound = current.find(s => s.id === id);

            if (sound) {
                // Delete file
                await FileSystem.deleteAsync(sound.uri, { idempotent: true });

                // Update storage
                const updated = current.filter(s => s.id !== id);
                await AsyncStorage.setItem(CUSTOM_SOUNDS_KEY, JSON.stringify(updated));
            }
        } catch (error) {
            console.error('Error deleting sound:', error);
        }
    }
};
