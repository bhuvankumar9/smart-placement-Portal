import corporateTraining from '../assets/corporate_training.png';
import networkingGraphic from '../assets/hardwork_networking.png';
import nitsLogo from '../assets/logo.png';

const AboutPortal = () => {
    return (
        <div className="animate-fadeIn">
            <div className="flex flex-col lg:flex-row gap-12">
                {/* Text Content */}
                <div className="flex-1">
                    <h1 className="text-red-600 font-black text-5xl mb-2 tracking-tight">ABOUT NETLEAP</h1>
                    <h2 className="text-slate-900 text-4xl font-semibold mb-6 leading-tight">Innovating Digital Future</h2>

                    <p className="text-gray-600 leading-relaxed mb-6 text-lg">
                        At NetLeap, we are committed to delivering top-notch web solutions,
                        software development, and digital transformation services. With a
                        focus on creativity, technology, and innovation, we empower
                        businesses to leap ahead in the competitive digital landscape.
                    </p>

                    <ul className="space-y-3">
                        {['Cutting-edge Web Development', 'AI & Automation Integration', 'Scalable Cloud Solutions'].map((item) => (
                            <li key={item} className="flex items-center text-slate-800 font-medium text-lg">
                                <span className="w-2 h-2 bg-black rounded-full mr-3"></span>
                                {item}
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Hero Image Section */}
                <div className="flex-1">
                    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-4 md:p-5">
                        <img
                            src={corporateTraining}
                            alt="Corporate Training"
                            className="rounded-xl w-full object-cover h-72 md:h-80"
                        />
                    </div>
                </div>
            </div>

            {/* Secondary Graphics Row */}
            <div className="mt-16 grid grid-cols-1 md:grid-cols-[minmax(0,1.35fr)_minmax(280px,0.9fr)] gap-6 md:gap-8 items-stretch">
                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-4 md:p-6 flex items-center justify-center min-h-[220px] md:min-h-[280px] overflow-hidden">
                    <img
                        src={networkingGraphic}
                        alt="Hardware & Networking"
                        className="w-full max-w-[560px] max-h-[240px] md:max-h-[300px] object-contain"
                    />
                </div>

                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-4 md:p-6 flex items-center justify-center min-h-[220px] md:min-h-[280px] overflow-hidden">
                    <img
                        src={nitsLogo}
                        alt="NITS Training"
                        className="w-full max-w-[420px] max-h-[180px] md:max-h-[220px] object-contain"
                    />
                </div>
            </div>
        </div>
    );
};

export default AboutPortal;
