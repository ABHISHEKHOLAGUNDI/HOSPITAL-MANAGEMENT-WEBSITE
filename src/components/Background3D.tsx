import { motion } from 'framer-motion';

const Background3D = () => {
    return (
        <div className="fixed inset-0 -z-50 overflow-hidden bg-slate-50">
            {/* Ambient Gradients - Medical/Teal Theme */}
            <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-teal-400/20 blur-[120px] mix-blend-multiply" />
            <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-cyan-400/20 blur-[120px] mix-blend-multiply" />

            {/* Floating Elements */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.5 }}
                transition={{ duration: 2 }}
                className="absolute inset-0"
            >
                {/* 3D-like Orbs */}
                <motion.div
                    animate={{
                        y: [0, -20, 0],
                        rotate: [0, 5, 0],
                    }}
                    transition={{
                        duration: 8,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                    className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full bg-gradient-to-br from-teal-100/40 to-white/40 backdrop-blur-3xl border border-white/20 shadow-xl"
                />

                <motion.div
                    animate={{
                        y: [0, 30, 0],
                        rotate: [0, -5, 0],
                    }}
                    transition={{
                        duration: 10,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: 1
                    }}
                    className="absolute bottom-1/3 right-1/4 w-96 h-96 rounded-full bg-gradient-to-tr from-cyan-100/40 to-white/40 backdrop-blur-3xl border border-white/20 shadow-xl"
                />
            </motion.div>

            {/* Grid Pattern Overlay */}
            <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" style={{ opacity: 0.1 }} />
        </div>
    );
};

export default Background3D;
