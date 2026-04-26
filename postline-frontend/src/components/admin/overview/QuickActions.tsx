import { ArrowRight, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";

const QuickActions = () => {
  const navigate = useNavigate();

  return (
    <article className="bg-pine rounded-3xl p-6 text-white shadow-lg">
      <h3 className="text-2xl font-bold">Швидка дія</h3>
      <p className="text-sm text-white/80 mt-2">
        Перейдіть до реєстру або керуйте операторами.
      </p>
      <div className="space-y-2 mt-5">
        <button
          onClick={() => navigate("/admin/shipments")}
          className="w-full bg-white text-pine py-3 rounded-2xl font-bold hover:bg-slate-100 transition-colors flex items-center justify-center gap-2"
        >
          Реєстр відправлень <ArrowRight size={18} />
        </button>
        <button
          onClick={() => navigate("/admin/operators")}
          className="w-full bg-white/20 text-white py-3 rounded-2xl font-bold hover:bg-white/30 transition-colors flex items-center justify-center gap-2"
        >
          Оператори <Users size={18} />
        </button>
      </div>
    </article>
  );
};

export default QuickActions;