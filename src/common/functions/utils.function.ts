import { join } from 'path';
import * as fs from 'fs';

export async function handleProfilePic(oldProfilePic: string, newProfilePicUrl: string) {
  if (oldProfilePic) {
    const oldProfilePicPath = join(__dirname, '..', '..', 'upload', oldProfilePic);
    try {
      await fs.promises.unlink(oldProfilePicPath);
      console.log(`Successfully deleted old profile picture: ${oldProfilePic}`);
    } catch (err) {
      console.error('Error deleting old profile picture:', err);
    }
  }
}

// Rollback the new profile picture if an error occurs
export async function rollbackProfilePic(profilePicUrl: string) {
  const profilePicPath = join(__dirname, '..', '..', 'upload', profilePicUrl);
  try {
    await fs.promises.unlink(profilePicPath);
    console.log(`Successfully rolled back profile picture: ${profilePicUrl}`);
  } catch (err) {
    console.error('Error rolling back profile picture:', err);
  }
}