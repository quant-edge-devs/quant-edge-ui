import { useNavigate } from 'react-router';
import { Button } from '@headlessui/react';

export const Landing = () => {
  const navigate = useNavigate();
  return (
    <div className="flex min-h-screen flex-col items-center bg-[#1a0820] px-4 pt-0 pb-8">
      <h2 className="mt-10 text-center text-5xl font-bold text-white sm:text-7xl">
        Welcome to
      </h2>
      <div className="mb-10 bg-gradient-to-r from-fuchsia-400 to-purple-400 bg-clip-text text-center text-6xl leading-tight font-extrabold text-transparent sm:text-8xl">
        QuantEdge
      </div>
      <div className="mb-7 flex w-full justify-center">
        <div className="rounded-md px-4 py-2 text-2xl font-medium text-white sm:text-3xl">
          Bringing institutional-grade analytics to retail investors
        </div>
      </div>
      <p className="mb-20 text-center text-xl text-purple-300 sm:text-2xl">
        Raw Data. Real Stories. Stunning Visuals.
      </p>
      <Button
        className="rounded-lg bg-gradient-to-r from-fuchsia-500 to-purple-500 px-10 py-4 text-xl font-semibold text-white transition hover:from-fuchsia-600 hover:to-purple-600"
        onClick={() => navigate('/start-analyzing')}
      >
        Start Analyzing
      </Button>
    </div>
  );
};
