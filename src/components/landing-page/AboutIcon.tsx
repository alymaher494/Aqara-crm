import React from 'react';

interface AboutIconProps {
  icon: React.ReactNode;
  text: string;
}

export default function AboutIcon({ icon, text }: AboutIconProps) {
  return (
    <div className="flex flex-col items-center">
      <div className="bg-blue-50 rounded-full p-3 mb-2 border border-blue-100">{icon}</div>
      <span className="text-blue-900 font-semibold text-base">{text}</span>
    </div>
  );
}