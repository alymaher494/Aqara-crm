'use client';

export default function TestEnvPage() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    return (
        <div className="p-10">
            <h1>Environment Variables Check</h1>
            <p>URL: {url ? 'Present (' + url.substring(0, 10) + '...)' : 'Missing'}</p>
            <p>Key: {key ? 'Present (' + key.substring(0, 5) + '...)' : 'Missing'}</p>
        </div>
    );
}
