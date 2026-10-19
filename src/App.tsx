import React, { useState, useEffect } from 'react';
import { signInWithPopup, onAuthStateChanged, signOut, User as FirebaseUser } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db, googleProvider, handleFirestoreError, OperationType } from './firebase';
import { AppUser } from './types';
import { speakKurdishSorani, prefetchWelcomeVoice, stopKurdishSpeech } from './utils/speech';
import { PhoneAuthModal } from './components/PhoneAuthModal';
import { WelcomeScreen } from './components/WelcomeScreen';
import {
  Sparkles,
  Smartphone,
  Crown,
  Volume2,
  VolumeX,
  Shield,
  Radio
} from 'lucide-react';

export default function App() {
  const [currentUser, setCurrentUser] = useState<AppUser | null>(null);
  const [isAuthChecking, setIsAuthChecking] = useState(true);
  const [isPhoneModalOpen, setIsPhoneModalOpen] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [hasSpokenInitially, setHasSpokenInitially] = useState(false);
  const [isVoicePlaying, setIsVoicePlaying] = useState(false);

  // Spoken message in Kurdish Sorani
  const welcomeKurdishSpeech =
    'بەخێربێن، خۆشحاڵین بە هاتنتان. دەتوانیت لە ڕێگەی گۆگڵەوە خۆت تۆمار بکەیت، وە ئەگەر گۆگڵت نییە بە ژمارەی مۆبایل بچۆرە ژوورەوە.';

  // Trigger speech playback
  const playKurdishVoice = () => {
    setHasSpokenInitially(true);
    speakKurdishSorani(
      welcomeKurdishSpeech,
      'welcome',
      () => setIsVoicePlaying(true),
      () => setIsVoicePlaying(false)
    );
  };

  // Prefetch voice on load
  useEffect(() => {
    prefetchWelcomeVoice();
  }, []);

  // Firebase auth state listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        try {
          const userDocRef = doc(db, 'users', firebaseUser.uid);
          const userSnap = await getDoc(userDocRef);

          if (userSnap.exists()) {
            const data = userSnap.data();
            setCurrentUser({
              uid: firebaseUser.uid,
              displayName: data.displayName || firebaseUser.displayName || 'بەکارهێنەری زێڕین',
              email: data.email || firebaseUser.email,
              phoneNumber: data.phoneNumber || firebaseUser.phoneNumber,
              photoURL: data.photoURL || firebaseUser.photoURL,
              authProvider: data.authProvider || 'google.com',
              createdAt: data.createdAt,
              lastLoginAt: data.lastLoginAt,
            });
          } else {
            const newUserData: AppUser = {
              uid: firebaseUser.uid,
              displayName: firebaseUser.displayName || 'بەکارهێنەری زێڕین',
              email: firebaseUser.email,
              phoneNumber: firebaseUser.phoneNumber,
              photoURL: firebaseUser.photoURL,
              authProvider: firebaseUser.phoneNumber ? 'phone' : 'google.com',
              createdAt: new Date().toISOString(),
              lastLoginAt: new Date().toISOString(),
            };
            try {
              await setDoc(userDocRef, newUserData, { merge: true });
            } catch (err) {
              console.warn('User profile initial write error:', err);
            }
            setCurrentUser(newUserData);
          }
        } catch (err) {
          console.error('Error fetching user profile:', err);
          setCurrentUser({
            uid: firebaseUser.uid,
            displayName: firebaseUser.displayName || 'بەکارهێنەری زێڕین',
            email: firebaseUser.email,
            phoneNumber: firebaseUser.phoneNumber,
            photoURL: firebaseUser.photoURL,
            authProvider: firebaseUser.phoneNumber ? 'phone' : 'google.com',
          });
        }
      } else {
        setCurrentUser(null);
      }
      setIsAuthChecking(false);
    });

    return () => unsubscribe();
  }, []);

  // Kurdish voice on initial user interaction/click
  useEffect(() => {
    const handleFirstTouch = () => {
      if (!hasSpokenInitially && !currentUser) {
        playKurdishVoice();
      }
      window.removeEventListener('click', handleFirstTouch);
      window.removeEventListener('touchstart', handleFirstTouch);
    };

    window.addEventListener('click', handleFirstTouch, { once: true });
    window.addEventListener('touchstart', handleFirstTouch, { once: true });

    // Also attempt autoplay after brief delay
    const timer = setTimeout(() => {
      if (!hasSpokenInitially && !currentUser) {
        playKurdishVoice();
      }
    }, 800);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('click', handleFirstTouch);
      window.removeEventListener('touchstart', handleFirstTouch);
    };
  }, [hasSpokenInitially, currentUser]);

  // Google Sign-In with Firebase
  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    setErrorMessage(null);
    stopKurdishSpeech();

    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      const userData: AppUser = {
        uid: user.uid,
        displayName: user.displayName || 'بەکارهێنەری گووگڵ',
        email: user.email,
        phoneNumber: user.phoneNumber,
        photoURL: user.photoURL,
        authProvider: 'google.com',
        createdAt: new Date().toISOString(),
        lastLoginAt: new Date().toISOString(),
      };

      try {
        await setDoc(doc(db, 'users', user.uid), userData, { merge: true });
      } catch (dbErr) {
        console.warn('Firestore user save warning:', dbErr);
        handleFirestoreError(dbErr, OperationType.WRITE, `users/${user.uid}`);
      }

      setCurrentUser(userData);
    } catch (err: unknown) {
      console.error('Google Sign-in failed:', err);
      const msg = err instanceof Error ? err.message : 'کێشەیەک لە چوونەژوورەوەی گووگڵ ڕوویدا';
      if (!msg.includes('closed-by-user') && !msg.includes('cancelled')) {
        setErrorMessage('نەتوانرا لە ڕێگەی گووگڵەوە پەیوەندی دروست بکرێت. دەتوانیت بە ژمارەی مۆبایل تاقی بکەیتەوە.');
      }
    } finally {
      setIsGoogleLoading(false);
    }
  };

  // Sign out
  const handleSignOut = async () => {
    try {
      stopKurdishSpeech();
      await signOut(auth);
      setCurrentUser(null);
    } catch (err) {
      console.error('Sign out error:', err);
    }
  };

  if (isAuthChecking) {
    return (
      <div className="min-h-screen bg-neutral-950 flex flex-col items-center justify-center p-4">
        <div className="w-16 h-16 rounded-3xl bg-amber-500/10 border border-amber-500/40 flex items-center justify-center animate-pulse">
          <Crown className="w-8 h-8 text-amber-400" />
        </div>
        <p className="mt-4 text-xs font-medium text-amber-300">چاوەڕێبە...</p>
      </div>
    );
  }

  // If user is authenticated, open the Welcome screen
  if (currentUser) {
    return <WelcomeScreen user={currentUser} onSignOut={handleSignOut} />;
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-white relative flex flex-col justify-between overflow-x-hidden selection:bg-amber-500 selection:text-black">
      {/* Background Golden Glow Orbs */}
      <div className="fixed -top-24 left-1/2 -translate-x-1/2 w-[700px] h-[450px] bg-amber-500/15 blur-[150px] rounded-full pointer-events-none -z-10" />
      <div className="fixed bottom-0 left-0 w-[400px] h-[400px] bg-amber-600/10 blur-[120px] rounded-full pointer-events-none -z-10" />
      <div className="fixed top-1/2 right-0 w-[350px] h-[350px] bg-yellow-500/10 blur-[110px] rounded-full pointer-events-none -z-10" />

      {/* Top Bar */}
      <header className="px-6 py-5 flex items-center justify-between max-w-5xl mx-auto w-full">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-amber-600 via-amber-400 to-amber-200 p-0.5 shadow-lg shadow-amber-500/20">
            <div className="w-full h-full bg-neutral-950 rounded-[14px] flex items-center justify-center">
              <Crown className="w-6 h-6 text-amber-400" />
            </div>
          </div>
          <div>
            <h1 className="text-lg font-black gold-text-shimmer tracking-wide">
              پلاتفۆرمی زێڕین
            </h1>
            <p className="text-[11px] text-amber-200/70">دەنگی کوردی سۆرانی • شووشەی شفاف</p>
          </div>
        </div>

        {/* Dedicated Kurdish Voice Play button */}
        <button
          onClick={playKurdishVoice}
          className={`px-4 py-2 rounded-2xl text-xs font-bold border flex items-center gap-2.5 transition-all cursor-pointer ${
            isVoicePlaying
              ? 'bg-amber-500/30 border-amber-400 text-amber-200 shadow-lg shadow-amber-500/30 ring-2 ring-amber-400/40'
              : 'bg-neutral-900/90 border-amber-500/40 text-amber-200 hover:border-amber-300 hover:bg-neutral-800'
          }`}
          title="لێدانی دەنگی ئافرەت بە کوردی سۆرانی"
        >
          {isVoicePlaying ? (
            <>
              <Radio className="w-4 h-4 text-amber-400 animate-pulse" />
              <span>قسەدەکات بە کوردی سۆرانی...</span>
            </>
          ) : (
            <>
              <Volume2 className="w-4 h-4 text-amber-400" />
              <span>گوێگرتن لە دەنگی ئافرەت (سۆرانی)</span>
            </>
          )}
        </button>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-8 max-w-lg mx-auto w-full">
        {/* Kurdish Voice Subtitle / Action Prompt */}
        <div
          onClick={playKurdishVoice}
          className="mb-6 cursor-pointer group flex items-center gap-3 px-5 py-2.5 rounded-full bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 transition-all text-xs text-amber-200 shadow-lg shadow-amber-500/10 text-center"
        >
          <div className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping shrink-0" />
          <Volume2 className="w-4 h-4 text-amber-400 shrink-0" />
          <span className="font-semibold leading-relaxed">
            «بەخێربێن، دەتوانیت لە ڕێگەی گۆگڵ یان بە ژمارەی مۆبایل خۆت تۆمار بکەیت»
          </span>
        </div>

        {/* Glass Card Container */}
        <div className="w-full gold-glass-card rounded-3xl p-6 sm:p-9 border border-amber-500/40 shadow-2xl relative overflow-hidden text-center">
          {/* Subtle gold specular beam */}
          <div className="absolute -top-24 -left-24 w-48 h-48 bg-amber-400/20 rounded-full blur-2xl pointer-events-none" />

          {/* Heading */}
          <h2 className="text-2xl sm:text-3xl font-extrabold gold-text-shimmer mb-2">
            خۆت تۆمار بکە
          </h2>
          <p className="text-xs sm:text-sm text-neutral-300 mb-8 max-w-sm mx-auto leading-relaxed">
            لە ڕێگای <span className="text-amber-300 font-semibold">گووگڵ</span> یان بە{' '}
            <span className="text-amber-300 font-semibold">ژمارەی مۆبایل</span> لەگەڵ کۆدی فایربیس بچۆرە ژوورەوە.
          </p>

          {/* Error Message */}
          {errorMessage && (
            <div className="mb-6 p-3 rounded-2xl bg-red-950/70 border border-red-500/40 text-red-200 text-xs text-center">
              {errorMessage}
            </div>
          )}

          {/* Registration Options */}
          <div className="space-y-4">
            {/* 1. Google Auth Button */}
            <button
              onClick={handleGoogleSignIn}
              disabled={isGoogleLoading}
              className="w-full py-4 px-5 rounded-2xl bg-white hover:bg-neutral-100 text-neutral-900 font-bold text-sm flex items-center justify-center gap-3 shadow-lg shadow-white/10 hover:shadow-amber-400/20 transition-all border border-neutral-200 cursor-pointer disabled:opacity-50"
            >
              {isGoogleLoading ? (
                <div className="w-5 h-5 border-2 border-neutral-900 border-t-transparent rounded-full animate-spin" />
              ) : (
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
              )}
              <span>خۆتۆمارکردن بە هەژماری گووگڵ (Google)</span>
            </button>

            {/* Divider */}
            <div className="flex items-center my-4">
              <div className="flex-1 border-t border-amber-500/20"></div>
              <span className="px-3 text-xs text-amber-200/60 font-medium">یان ئەگەر گووگڵت نییە</span>
              <div className="flex-1 border-t border-amber-500/20"></div>
            </div>

            {/* 2. Phone OTP Button */}
            <button
              onClick={() => {
                stopKurdishSpeech();
                setIsPhoneModalOpen(true);
              }}
              className="w-full py-4 px-5 rounded-2xl gold-glow-button text-neutral-950 font-bold text-sm flex items-center justify-center gap-3 transition-all cursor-pointer"
            >
              <Smartphone className="w-5 h-5 text-neutral-900" />
              <span>چوونەژوورەوە بە ژمارەی مۆبایل و OTP</span>
            </button>
          </div>

          {/* Secure Firebase Badge */}
          <div className="mt-8 pt-5 border-t border-amber-500/20 flex items-center justify-center gap-2 text-neutral-400 text-xs">
            <Shield className="w-4 h-4 text-amber-400" />
            <span>پشتڕاستکراوە بە فایربیس (Firebase Auth & Firestore)</span>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center py-4 px-4 text-xs text-neutral-500 border-t border-amber-500/15">
        <p>پلاتفۆرمی زێڕین • بە زمانی کوردی سۆرانی • شووشەی شفاف</p>
      </footer>

      {/* Phone OTP Modal */}
      <PhoneAuthModal
        isOpen={isPhoneModalOpen}
        onClose={() => setIsPhoneModalOpen(false)}
        onSuccess={(user) => {
          setCurrentUser(user);
        }}
      />
    </div>
  );
}
