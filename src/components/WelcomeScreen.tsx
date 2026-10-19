import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { AppUser, NavigationTab } from '../types';
import { speakKurdishSorani, stopKurdishSpeech } from '../utils/speech';
import {
  Sparkles,
  PlaySquare,
  FileText,
  User,
  Volume2,
  VolumeX,
  LogOut,
  ShieldCheck,
  Calendar,
  Phone,
  Mail,
  Fingerprint,
  Layers,
  Crown
} from 'lucide-react';

interface WelcomeScreenProps {
  user: AppUser;
  onSignOut: () => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ user, onSignOut }) => {
  const [activeTab, setActiveTab] = useState<NavigationTab>('general');
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Trigger celebration confetti and female voice greeting when welcome screen opens
  useEffect(() => {
    // Confetti with gold theme
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#f59e0b', '#fbbf24', '#fef3c7', '#d97706', '#b45309'],
      });
    } catch (e) {
      console.debug('Confetti failed:', e);
    }

    // Kurdish spoken voice greeting
    const welcomeGreeting = `بەخێربێیت ${user.displayName || 'بەڕێز'}، پیرۆزە خۆتۆمارکردنەکەت بەسەرکەوتوویی تەواوبوو لە پلاتفۆرمی زێڕین.`;
    speakKurdishSorani(
      welcomeGreeting,
      'registered',
      () => setIsSpeaking(true),
      () => setIsSpeaking(false)
    );
  }, [user.displayName]);

  const handleVoiceReplay = () => {
    const welcomeGreeting = `بەخێربێیت ${user.displayName || 'هاوڕێی بەڕێز'} بۆ پلاتفۆرمی زێڕین.`;
    speakKurdishSorani(
      welcomeGreeting,
      'registered',
      () => setIsSpeaking(true),
      () => setIsSpeaking(false)
    );
  };

  const handleTabChange = (tab: NavigationTab) => {
    setActiveTab(tab);
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-white relative pb-28 overflow-x-hidden selection:bg-amber-500 selection:text-black">
      {/* Ambient background gold glow orbs */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-amber-500/10 blur-[130px] rounded-full pointer-events-none -z-10" />
      <div className="fixed bottom-10 right-10 w-[300px] h-[300px] bg-amber-600/10 blur-[100px] rounded-full pointer-events-none -z-10" />
      <div className="fixed top-1/3 left-5 w-[250px] h-[250px] bg-yellow-500/5 blur-[90px] rounded-full pointer-events-none -z-10" />

      {/* Top Header Bar */}
      <header className="sticky top-0 z-40 backdrop-blur-xl bg-neutral-950/70 border-b border-amber-500/20 px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-600 to-amber-300 p-0.5 shadow-md shadow-amber-500/20 flex items-center justify-center">
            <div className="w-full h-full bg-neutral-950 rounded-[14px] flex items-center justify-center">
              <Crown className="w-5 h-5 text-amber-400" />
            </div>
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-black tracking-wide gold-text-shimmer">
              پلاتفۆرمی زێڕین
            </h1>
            <p className="text-[11px] text-amber-200/60 font-medium">دیزاینی شووشەی شفاف</p>
          </div>
        </div>

        {/* Audio voice replay control */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleVoiceReplay}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs border transition-all cursor-pointer ${
              isSpeaking
                ? 'bg-amber-500/20 border-amber-400 text-amber-300 shadow-md shadow-amber-500/20 animate-pulse'
                : 'bg-neutral-900/80 border-amber-500/30 text-amber-200 hover:border-amber-400/60'
            }`}
            title="دووبارە لێدانی دەنگی بەخێرهاتن"
          >
            {isSpeaking ? (
              <>
                <Volume2 className="w-3.5 h-3.5 text-amber-400 animate-bounce" />
                <span className="hidden sm:inline font-medium">دەنگەکە دەبیسترێت...</span>
              </>
            ) : (
              <>
                <Volume2 className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden sm:inline font-medium">دەنگی بەخێرهاتن</span>
              </>
            )}
          </button>

          <button
            onClick={onSignOut}
            className="p-2 rounded-full text-neutral-400 hover:text-red-400 hover:bg-red-500/10 border border-neutral-800 transition-colors"
            title="چوونەدەرەوە"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 pt-6 sm:pt-10">
        {/* Banner: "بەخێربێیت" (Welcome Banner as requested) */}
        <section className="gold-glass rounded-3xl p-6 sm:p-8 relative overflow-hidden border border-amber-500/35 shadow-2xl mb-8">
          <div className="absolute top-0 right-0 w-64 h-64 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 flex flex-col sm:flex-row items-center sm:items-start justify-between gap-6 text-center sm:text-right">
            <div className="flex-1">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-semibold mb-3">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>خۆتۆمارکردن بە سەرکەوتوویی تەواوبوو</span>
              </div>
              <h2 className="text-2xl sm:text-4xl font-extrabold gold-text-shimmer mb-2">
                بەخێربێیت، {user.displayName || 'هاوڕێی بەڕێز'}!
              </h2>
              <p className="text-sm sm:text-base text-neutral-300 max-w-xl leading-relaxed">
                بە سەرکەوتوویی لە ڕێگەی فایربیسەوە چوویتە ژوورەوە. هەموو بەشەکانی خوارەوە لە مینیودا ئامادەکراون بە دیزاینی زێڕینی شووشەی شفاف.
              </p>
            </div>

            <div className="flex flex-col items-center justify-center p-4 rounded-2xl bg-neutral-900/60 border border-amber-500/20 min-w-[170px]">
              {user.photoURL ? (
                <img
                  src={user.photoURL}
                  alt={user.displayName || 'User'}
                  className="w-16 h-16 rounded-full border-2 border-amber-400 shadow-md shadow-amber-500/20 mb-2 object-cover"
                />
              ) : (
                <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-amber-600 to-amber-300 p-0.5 mb-2 shadow-md">
                  <div className="w-full h-full bg-neutral-900 rounded-full flex items-center justify-center text-amber-300 font-bold text-xl">
                    {user.displayName ? user.displayName.charAt(0) : 'ب'}
                  </div>
                </div>
              )}
              <span className="text-xs font-semibold text-amber-200 truncate max-w-[150px]">
                {user.displayName || 'بەکارهێنەری زێڕین'}
              </span>
              <span className="text-[11px] text-amber-400/80 mt-0.5">
                {user.authProvider === 'google.com' ? 'هەژماری گووگڵ' : 'ژمارەی مۆبایل'}
              </span>
            </div>
          </div>
        </section>

        {/* Tab Content Display - As requested: "ناوەڕۆکیان بۆدامەنی باجاری بەتاڵ بیت" */}
        <section className="relative">
          {activeTab === 'general' && (
            <div className="gold-glass rounded-3xl p-8 sm:p-14 border border-amber-500/25 text-center flex flex-col items-center justify-center min-h-[360px] animate-fadeIn">
              <div className="w-20 h-20 rounded-3xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mb-5 shadow-lg shadow-amber-500/10">
                <Layers className="w-10 h-10 text-amber-400" />
              </div>
              <h3 className="text-2xl font-bold text-amber-200 mb-2">بەشی گشتی</h3>
              <p className="text-sm text-neutral-400 max-w-md leading-relaxed">
                ئەم بەشە بەپێی داواکارییەکەت لە ئێستادا بەتاڵە و جێگیرکراوە، بۆ ئەوەی لە قۆناغی داهاتوودا ناوەڕۆکی گشتی بۆ دیاری بکرێت.
              </p>
              <div className="mt-6 inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-neutral-900/50 border border-amber-500/20 text-xs text-amber-300/80">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>پلاتفۆرمی زێڕین - شووشەی شفاف</span>
              </div>
            </div>
          )}

          {activeTab === 'video' && (
            <div className="gold-glass rounded-3xl p-8 sm:p-14 border border-amber-500/25 text-center flex flex-col items-center justify-center min-h-[360px] animate-fadeIn">
              <div className="w-20 h-20 rounded-3xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mb-5 shadow-lg shadow-amber-500/10">
                <PlaySquare className="w-10 h-10 text-amber-400" />
              </div>
              <h3 className="text-2xl font-bold text-amber-200 mb-2">بەشی ڤیدیۆ</h3>
              <p className="text-sm text-neutral-400 max-w-md leading-relaxed">
                هیچ ڤیدیۆیەک لەم بەشەدا نییە و جارێ بەتاڵ دانراوە بەپێی داواکارییەکەت.
              </p>
              <div className="mt-6 inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-neutral-900/50 border border-amber-500/20 text-xs text-amber-300/80">
                <PlaySquare className="w-3.5 h-3.5 text-amber-400" />
                <span>ئامادەکراوە بۆ ڤیدیۆکانی ئایندە</span>
              </div>
            </div>
          )}

          {activeTab === 'post' && (
            <div className="gold-glass rounded-3xl p-8 sm:p-14 border border-amber-500/25 text-center flex flex-col items-center justify-center min-h-[360px] animate-fadeIn">
              <div className="w-20 h-20 rounded-3xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mb-5 shadow-lg shadow-amber-500/10">
                <FileText className="w-10 h-10 text-amber-400" />
              </div>
              <h3 className="text-2xl font-bold text-amber-200 mb-2">بەشی پۆست</h3>
              <p className="text-sm text-neutral-400 max-w-md leading-relaxed">
                هیچ پۆست یان بابەتێک لێرەدا نییە و جارێ بەتاڵ هێڵراوەتەوە.
              </p>
              <div className="mt-6 inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-neutral-900/50 border border-amber-500/20 text-xs text-amber-300/80">
                <FileText className="w-3.5 h-3.5 text-amber-400" />
                <span>ئامادەکراوە بۆ بڵاوکراوە و پۆستەکان</span>
              </div>
            </div>
          )}

          {activeTab === 'profile' && (
            <div className="gold-glass rounded-3xl p-6 sm:p-8 border border-amber-500/30 animate-fadeIn">
              <div className="flex items-center gap-4 mb-6 pb-6 border-b border-amber-500/20">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-600 to-amber-300 p-0.5 shadow-lg shadow-amber-500/20">
                  <div className="w-full h-full bg-neutral-900 rounded-[14px] flex items-center justify-center">
                    <User className="w-8 h-8 text-amber-400" />
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-amber-100">پڕۆفایلی بەکارهێنەر</h3>
                  <p className="text-xs text-neutral-400">زانیارییەکانی هەژمار لە فایربیس</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-neutral-900/70 border border-amber-500/20 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-400">
                    <User className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[11px] text-neutral-400 block">ناو:</span>
                    <span className="text-sm font-semibold text-white">
                      {user.displayName || 'دیاری نەکراوە'}
                    </span>
                  </div>
                </div>

                {user.email && (
                  <div className="p-4 rounded-2xl bg-neutral-900/70 border border-amber-500/20 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-400">
                      <Mail className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-[11px] text-neutral-400 block">ئیمەیڵ:</span>
                      <span className="text-sm font-semibold text-white font-mono" dir="ltr">
                        {user.email}
                      </span>
                    </div>
                  </div>
                )}

                {user.phoneNumber && (
                  <div className="p-4 rounded-2xl bg-neutral-900/70 border border-amber-500/20 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-400">
                      <Phone className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-[11px] text-neutral-400 block">ژمارەی مۆبایل:</span>
                      <span className="text-sm font-semibold text-white font-mono" dir="ltr">
                        {user.phoneNumber}
                      </span>
                    </div>
                  </div>
                )}

                <div className="p-4 rounded-2xl bg-neutral-900/70 border border-amber-500/20 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-400">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[11px] text-neutral-400 block">شێوازی چوونەژوورەوە:</span>
                    <span className="text-sm font-semibold text-amber-300">
                      {user.authProvider === 'google.com' ? 'گووگڵ (Google)' : 'ژمارەی مۆبایل (OTP)'}
                    </span>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-neutral-900/70 border border-amber-500/20 flex items-center gap-3 sm:col-span-2">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-400">
                    <Fingerprint className="w-5 h-5" />
                  </div>
                  <div className="overflow-hidden">
                    <span className="text-[11px] text-neutral-400 block">ناسنامەی فایربیس (UID):</span>
                    <span className="text-xs font-mono text-neutral-300 truncate block" dir="ltr">
                      {user.uid}
                    </span>
                  </div>
                </div>
              </div>

              {/* Sign out button */}
              <div className="mt-8 pt-6 border-t border-amber-500/20 flex justify-end">
                <button
                  onClick={onSignOut}
                  className="px-6 py-3 rounded-2xl bg-red-950/40 hover:bg-red-900/50 border border-red-500/30 text-red-300 text-sm font-bold flex items-center gap-2 transition-all cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  <span>چوونەدەرەوە لە هەژمار</span>
                </button>
              </div>
            </div>
          )}
        </section>
      </main>

      {/* Fixed Bottom Navigation Bar - As requested: 
          "مینیوی خوارەوە دانی بەشەکانی: گشتی، ڤیدیۆ، پۆست، پڕۆفایل"
          "دیزاین گۆڵدیکی زێڕین شوشەی شفاف"
      */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 gold-glass-nav py-3 px-6 sm:px-12 flex items-center justify-around max-w-2xl mx-auto rounded-t-3xl border-t border-amber-500/35">
        <button
          onClick={() => handleTabChange('general')}
          className={`flex flex-col items-center gap-1.5 transition-all py-1 px-3 rounded-2xl cursor-pointer ${
            activeTab === 'general'
              ? 'text-amber-400 font-bold scale-105'
              : 'text-neutral-400 hover:text-amber-200'
          }`}
        >
          <div
            className={`p-2 rounded-2xl transition-all ${
              activeTab === 'general'
                ? 'bg-amber-500/25 border border-amber-400/50 shadow-md shadow-amber-500/20'
                : 'hover:bg-amber-500/10'
            }`}
          >
            <Layers className="w-5 h-5" />
          </div>
          <span className="text-xs font-medium">گشتی</span>
        </button>

        <button
          onClick={() => handleTabChange('video')}
          className={`flex flex-col items-center gap-1.5 transition-all py-1 px-3 rounded-2xl cursor-pointer ${
            activeTab === 'video'
              ? 'text-amber-400 font-bold scale-105'
              : 'text-neutral-400 hover:text-amber-200'
          }`}
        >
          <div
            className={`p-2 rounded-2xl transition-all ${
              activeTab === 'video'
                ? 'bg-amber-500/25 border border-amber-400/50 shadow-md shadow-amber-500/20'
                : 'hover:bg-amber-500/10'
            }`}
          >
            <PlaySquare className="w-5 h-5" />
          </div>
          <span className="text-xs font-medium">ڤیدیۆ</span>
        </button>

        <button
          onClick={() => handleTabChange('post')}
          className={`flex flex-col items-center gap-1.5 transition-all py-1 px-3 rounded-2xl cursor-pointer ${
            activeTab === 'post'
              ? 'text-amber-400 font-bold scale-105'
              : 'text-neutral-400 hover:text-amber-200'
          }`}
        >
          <div
            className={`p-2 rounded-2xl transition-all ${
              activeTab === 'post'
                ? 'bg-amber-500/25 border border-amber-400/50 shadow-md shadow-amber-500/20'
                : 'hover:bg-amber-500/10'
            }`}
          >
            <FileText className="w-5 h-5" />
          </div>
          <span className="text-xs font-medium">پۆست</span>
        </button>

        <button
          onClick={() => handleTabChange('profile')}
          className={`flex flex-col items-center gap-1.5 transition-all py-1 px-3 rounded-2xl cursor-pointer ${
            activeTab === 'profile'
              ? 'text-amber-400 font-bold scale-105'
              : 'text-neutral-400 hover:text-amber-200'
          }`}
        >
          <div
            className={`p-2 rounded-2xl transition-all ${
              activeTab === 'profile'
                ? 'bg-amber-500/25 border border-amber-400/50 shadow-md shadow-amber-500/20'
                : 'hover:bg-amber-500/10'
            }`}
          >
            <User className="w-5 h-5" />
          </div>
          <span className="text-xs font-medium">پڕۆفایل</span>
        </button>
      </nav>
    </div>
  );
};
