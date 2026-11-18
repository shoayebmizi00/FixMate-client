import React, { Suspense } from 'react';
import Footer from './components/shared/Footer';
import Navbar from './components/shared/Navbar';

const layout = ({ children } : { children: React.ReactNode }) => {
    return (
        <div>
            <Suspense
                fallback={
                    <div className="h-[73px] border-b border-slate-200 bg-white" />
                }
            >
                <Navbar />
            </Suspense>
            {children}
            <Footer />
        </div>
    );
};

export default layout;