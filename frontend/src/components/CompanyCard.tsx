import { FC } from "react";
import { motion } from "framer-motion";

interface CompanyCardProps {
  icon: React.ReactNode;
  name: string;
  domain: string;
  status: "Open" | "Upcoming";
  packageLPA: number;
  roles: string[];
  eligibility: string;
}

export const CompanyCard: FC<CompanyCardProps> = ({
  icon,
  name,
  domain,
  status,
  packageLPA,
  roles,
  eligibility,
}) => {
  return (
    <motion.div
      className="bg-gradient-to-br from-slate-800/90 via-slate-700/80 to-cyan-900/60 border border-cyan-400/20 shadow-xl rounded-2xl p-6 flex flex-col gap-4 h-full backdrop-blur-md hover:shadow-2xl transition-all duration-300"
      initial={{ opacity: 0, y: 30, scale: 0.97 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      whileHover={{ scale: 1.03 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.5, type: "spring", bounce: 0.18 }}
    >
      <div className="flex items-center gap-3 mb-2">
        <div className="text-3xl">{icon}</div>
        <div>
          <div className="font-semibold text-lg text-white flex items-center gap-2">
            {name}
            {status === "Open" ? (
              <span className="ml-2 badge-modern bg-green-900/30 text-green-400 border-green-400/30">Open</span>
            ) : (
              <span className="ml-2 badge-modern bg-blue-900/30 text-blue-400 border-blue-400/30">Upcoming</span>
            )}
          </div>
          <div className="text-xs text-slate-300 font-medium mt-0.5">{domain}</div>
        </div>
      </div>
      <div className="bg-cyan-900/20 rounded-xl px-4 py-2 flex items-center gap-2 mb-2">
        <span className="text-xs text-slate-300 font-medium">Package</span>
        <span className="text-2xl font-bold text-cyan-400 ml-2">{packageLPA} LPA</span>
      </div>
      <div>
        <div className="font-semibold text-sm mb-1 flex items-center gap-2 text-white">
          <span className="i-lucide-briefcase text-base" /> Available Roles
        </div>
        <div className="flex flex-wrap gap-2">
          {roles.map((role) => (
            <span key={role} className="badge-modern bg-cyan-900/30 text-cyan-300 border-cyan-400/30">
              {role}
            </span>
          ))}
        </div>
      </div>
      <div>
        <div className="font-semibold text-sm mb-1 flex items-center gap-2 text-white">
          <span className="i-lucide-graduation-cap text-base" /> Eligibility
        </div>
        <div className="text-sm text-slate-300 font-medium">{eligibility}</div>
      </div>
    </motion.div>
  );
}; 