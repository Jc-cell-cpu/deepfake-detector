/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import dynamic from 'next/dynamic';

const RedocStandalone = dynamic(
    async () => {
        const mod = await import('redoc');
        return mod.RedocStandalone;
    },
    { ssr: false } // Disable server-side rendering
);

export default function SwaggerDoc({ spec }: { spec: any }) {
    return (
        <RedocStandalone
            spec={spec}
            options={{
                theme: { colors: { primary: { main: '#7c3aed' } } },
                hideDownloadButton: true,
            }}
        />
    );
}
