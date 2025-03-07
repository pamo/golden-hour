import { GoldenHourChecker } from '@/components/golden-hour-checker';

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-amber-50 to-orange-100 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto px-4 py-8">
        <h1 className="mb-2 text-center text-4xl font-bold text-amber-800 dark:text-amber-400">
          Golden Hour Checker
        </h1>
        <p className="mb-8 text-center text-amber-700 dark:text-amber-300">
          Find the perfect light for your photography
        </p>
        <GoldenHourChecker />
      </div>
    </main>
  );
}
