/* eslint-disable @typescript-eslint/no-namespace */
// import { getApiDocs } from '@/lib/swagger';
// import SwaggerDoc from '@/components/SwaggerDoc';
// import Link from 'next/link';
// import { ArrowLeft } from 'lucide-react';

// export default async function DocsPage() {
//     const spec = await getApiDocs();

//     return (
//         <div className="min-h-screen p-6">
//             <div className="container mx-auto">
//                 <Link href="/" className="inline-flex items-center text-white hover:text-purple-400 transition-colors mb-6">
//                     <ArrowLeft className="w-6 h-6 mr-2" />
//                     Back to Home
//                 </Link>
//                 <h1 className="text-3xl font-bold mb-4">API Documentation</h1>
//                 <SwaggerDoc spec={spec} />
//             </div>
//         </div>
//     );
// }


// app/docs/page.tsx or wherever you want
"use client";

import SwaggerUI from "swagger-ui-react";
import "swagger-ui-react/swagger-ui.css";

export default function SwaggerDocsPage() {
    return (
        <div className="min-h-screen p-6">
            <div className="container mx-auto">
                <h1 className="text-3xl font-bold mb-4">API Docs</h1>
                <SwaggerUI url="/api/docs/swagger" />
            </div>
        </div>
    );
}

