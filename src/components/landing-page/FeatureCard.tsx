import React from 'react';

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  desc: string;
}

export default function FeatureCard({ icon, title, desc }: FeatureCardProps) {
  return (
    <div className="bg-white rounded-2xl shadow-lg p-8 flex flex-col items-center text-center hover:scale-105 transition-transform border border-blue-100">
      <div className="mb-4">{icon}</div>
      <h3 className="text-xl font-bold text-blue-900 mb-2">{title}</h3>
      <p className="text-gray-600 text-base">{desc}</p>
    </div>
  );
}