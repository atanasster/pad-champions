import { initializeApp } from 'firebase/app';
import { getFunctions, connectFunctionsEmulator } from 'firebase/functions';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: 'AIzaSyAyTRv2TNevuNGi_mHc8bVPRyxa2HoiwXs',
  authDomain: 'pad-champions.firebaseapp.com',
  projectId: 'pad-champions',
  storageBucket: 'pad-champions.firebasestorage.app',
  messagingSenderId: '822563401210',
  appId: '1:822563401210:web:da93437766a526c6e80843',
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);

// Initialize Functions and connect to emulator in dev mode
export const functions = getFunctions(app);

if (import.meta.env.DEV) {
  console.log('🔌 Connecting to Functions Emulator');
  connectFunctionsEmulator(functions, 'localhost', 5001);
}
