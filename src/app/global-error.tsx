'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';

export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error(error);
    }, [error]);

    return (
        <html lang="ar" dir="rtl">
            <body>
                <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
                    <h2 className="text-2xl font-bold mb-4">حدث خطأ جسيم!</h2>
                    <p className="text-gray-600 mb-6">نعتذر، حدث خطأ غير متوقع في النظام. يرجى تحديث الصفحة.</p>
                    <Button onClick={() => reset()}>تحديث الصفحة</Button>
                </div>
            </body>
        </html>
    );
}
