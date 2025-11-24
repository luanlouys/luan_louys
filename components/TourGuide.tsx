
import React, { useState } from 'react';
import { X, ChevronRight, Check } from 'lucide-react';

interface TourGuideProps {
  onClose: () => void;
}

const STEPS = [
  {
    title: "Bem-vindo ao Banco Familiar!",
    text: "Aqui você transforma tarefas e comportamento em um jogo divertido de economia.",
    icon: "🎉"
  },
  {
    title: "Cadastre Tarefas",
    text: "Use o botão 'Tarefas & Prêmios' para criar atividades personalizadas com valores em pontos.",
    icon: "📋"
  },
  {
    title: "Conecte os Filhos",
    text: "Compartilhe o Código da Família (no topo da tela) para que seus filhos entrem no app nos dispositivos deles.",
    icon: "🔗"
  },
  {
    title: "Acompanhe e Aprove",
    text: "Veja o saldo, gráficos e aprove solicitações de pontos feitas pelos seus filhos.",
    icon: "✅"
  }
];

const TourGuide: React.FC<TourGuideProps> = ({ onClose }) => {
  const [currentStep, setCurrentStep] = useState(0);

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onClose();
    }
  };

  const step = STEPS[currentStep];

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-6 animate-in fade-in duration-300">
      <div className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl">
        <div className="bg-brand-600 p-8 text-center">
          <div className="text-6xl mb-4 animate-bounce">{step.icon}</div>
          <h2 className="text-2xl font-black text-white">{step.title}</h2>
        </div>
        
        <div className="p-8">
          <p className="text-slate-600 text-lg leading-relaxed text-center mb-8">
            {step.text}
          </p>
          
          <div className="flex items-center justify-between">
            <div className="flex gap-1">
              {STEPS.map((_, idx) => (
                <div 
                  key={idx} 
                  className={`h-2 rounded-full transition-all duration-300 ${idx === currentStep ? 'w-8 bg-brand-600' : 'w-2 bg-slate-200'}`}
                />
              ))}
            </div>

            <button 
              onClick={handleNext}
              className="px-6 py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-all flex items-center gap-2"
            >
              {currentStep === STEPS.length - 1 ? 'Começar' : 'Próximo'}
              {currentStep === STEPS.length - 1 ? <Check size={18}/> : <ChevronRight size={18}/>}
            </button>
          </div>
        </div>

        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 text-white/50 hover:text-white p-2"
        >
          <X size={24} />
        </button>
      </div>
    </div>
  );
};

export default TourGuide;
