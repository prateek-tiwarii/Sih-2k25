'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function Home() {
    const router = useRouter();
    
    useEffect(() => {
        // Redirect to chat page so users can see the sidebar
        router.push('/chat');
    }, [router]);

    return <></>;
}
