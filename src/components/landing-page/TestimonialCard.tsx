import React from 'react';
import { Star } from 'lucide-react';

interface TestimonialCardProps {
  name: string;
  company: string;
  text: string;
}

export default function TestimonialCard({ name, company, text }: TestimonialCardProps) {
  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 flex flex-col items-center text-center border border-blue-100">
      <Star className="w-8 h-8 text-yellow-400 mb-2" />
      <p className="text-gray-700 mb-4">“{text}”</p>
      <div className="font-bold text-blue-900">{name}</div>
      <div className="text-blue-600 text-sm">{company}</div>
    </div>
  );
}