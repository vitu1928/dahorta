import React from "react";
import { 
  Leaf, 
  MapPin, 
  Zap, 
  ChefHat, 
  ShieldCheck, 
  ChevronRight, 
  Instagram, 
  Facebook,
  ShoppingCart
} from "lucide-react";
import { useApp } from "../store/AppContext";

// Assets (Utilizando os imports originais do seu template Figma)
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import logoImage from "figma:asset/db23158a97674c4fe48dc9d4281a185fc5cf6a4b.png";
import heroImage from "figma:asset/6a6cb4394cfe8dac99d70ae300042099f5cbd856.png";
import bowl1 from "figma:asset/23fc6610210053a53185bb34cc1b85824cb3e63a.png";
import bowl2 from "figma:asset/a3b2eda0912e4199fbfbe914a3238135156a1f38.png";
import bowl3 from "figma:asset/0736d60c269c3c9d4a52cf8eeee6c6038586b08e.png";

export default function LandingPage() {
  const { cartCount } = useApp();
  const features = [
    {
      icon: <ShieldCheck size={24} />,
      title: "Higiene Rigorosa",
      description: "Processo de sanitização de tripla etapa e ambiente 100% controlado.",
    },
    {
      icon: <ChefHat size={24} />,
      title: "Cortes de Mestre",
      description: "Textura perfeita em cada ingrediente, preservando nutrientes e frescor.",
    },
    {
      icon: <Zap size={24} />,
      title: "Rápido e Fresco",
      description: "Preparo imediato pós-pedido. Do campo ao seu prato em minutos.",
    },
    {
      icon: <Leaf size={24} />,
      title: "100% Orgânico",
      description: "Ingredientes certificados e rastreados de pequenos produtores parceiros.",
    },
  ];

  const favoriteBowls = [
    {
      image: bowl1,
      name: "Bowl Proteico",
      tag: "Mais Vendido",
      price: "R$ 38,90",
      description: "Quinoa, frango grelhado orgânico, abacate, tomate cereja, espinafre e molho tahine.",
    },
    {
      image: bowl2,
      name: "Bowl Vegano Power",
      tag: "Plant-Based",
      price: "R$ 34,90",
      description: "Grão-de-bico, couve massageada, cenoura ralada, beterraba, hummus e sementes de girassol.",
    },
    {
      image: bowl3,
      name: "Bowl Mediterrâneo",
      tag: "Artesanal",
      price: "R$ 42,90",
      description: "Arroz integral, salmão grelhado, pepino, azeitonas, tomate e molho de iogurte.",
    },
  ];

  const handleOrderRedirect = () => {
    // Redirecionamento para a rota /menu conforme solicitado
    window.location.href = '/menu';
  };

  return (
    <div className="min-h-screen bg-[#FFFFFF] text-[#1F1F1F] font-['Outfit',sans-serif]">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-lg border-b border-[#EEF2EE] px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <ImageWithFallback src={logoImage} alt="DaHorta" className="h-10 w-auto object-contain" />
          </div>
          <div className="hidden md:flex items-center gap-8">
            <a href="#menu" className="text-sm font-medium hover:text-[#4C7C59] transition-colors">Cardápio</a>
            <a href="#sobre" className="text-sm font-medium hover:text-[#4C7C59] transition-colors">Qualidade</a>
            <a href="#origem" className="text-sm font-medium hover:text-[#4C7C59] transition-colors">Nossa Origem</a>
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
            <button 
              onClick={() => window.location.href = '/cart'}
              className="relative flex items-center gap-2 border-2 border-[#4C7C59] text-[#4C7C59] px-4 sm:px-6 py-2.5 rounded-full font-bold text-sm hover:bg-[#4C7C59] hover:text-white transition-all cursor-pointer"
            >
              <ShoppingCart size={16} />
              <span className="hidden sm:inline">Ver Carrinho</span>
              {cartCount > 0 && (
                <span className="bg-[#E9C46A] text-[#1F1F1F] text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-bold absolute -top-2 -right-2 shadow-sm border border-white animate-pulse">
                  {cartCount}
                </span>
              )}
            </button>
            <button 
              onClick={handleOrderRedirect}
              className="bg-[#E9C46A] text-[#1F1F1F] px-6 sm:px-8 py-2.5 rounded-full font-bold text-sm hover:bg-[#dfba5c] transition-all shadow-md shadow-[#E9C46A]/20 cursor-pointer"
            >
              Peça Agora
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section v2.0 */}
      <section className="relative pt-40 pb-20 px-6 overflow-hidden bg-[#F7F9F7]">
        {/* Organic Shape Background (Blob) */}
        <div 
          className="absolute -top-[10%] -right-[5%] w-[60%] h-[120%] bg-[#E6F0EA] opacity-50 z-0 pointer-events-none" 
          style={{ clipPath: 'polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%)', borderRadius: '60% 40% 30% 70% / 60% 30% 70% 40%' }}
        />

        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center relative z-10">
          <div>
            <div className="inline-block font-serif italic text-xl text-[#4C7C59] mb-4">
              Rápido. Fresco. Orgânico.
            </div>
            <h1 className="text-6xl lg:text-7xl font-bold mb-8 leading-[1] tracking-tight text-[#1F1F1F]">
              DaHorta para <br />
              <span className="text-[#4C7C59]">o seu Prato.</span>
            </h1>
            <p className="text-lg text-[#5F5F5F] mb-10 max-w-lg leading-relaxed font-medium">
              Culinária viva com ingredientes colhidos hoje. Bowls artesanais preparados com rigor técnico para quem busca performance sem abrir mão do sabor.
            </p>
            <div className="flex flex-col sm:row gap-6">
              <button 
                onClick={handleOrderRedirect}
                className="bg-[#4C7C59] text-white px-10 py-5 rounded-2xl font-bold text-lg hover:bg-[#3E684A] transition-all shadow-xl shadow-[#4C7C59]/20 flex items-center justify-center gap-3 group"
              >
                Explorar Cardápio
                <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </button>
              <div className="flex items-center gap-4 mt-4">
                <div className="flex -space-x-3">
                  {[1,2,3,4].map(i => (
                    <div key={i} className="w-10 h-10 rounded-full border-2 border-white bg-[#EEF2EE] overflow-hidden">
                      <ImageWithFallback src={`https://i.pravatar.cc/150?u=${i+10}`} alt="user" className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
                <div className="text-sm font-medium">
                  <span className="font-extrabold text-[#1F1F1F]">+2.000 pedidos</span> entregues hoje.
                </div>
              </div>
            </div>
          </div>

          <div className="relative">
            {/* Organic Mask for Image */}
            <div 
              className="relative z-10 w-full aspect-square overflow-hidden shadow-2xl"
              style={{ clipPath: 'polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%)', borderRadius: '60% 40% 30% 70% / 60% 30% 70% 40%' }}
            >
              <ImageWithFallback 
                src={heroImage} 
                alt="Ingredientes Frescos DaHorta" 
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Diferenciais Section (Deep Green Background) */}
      <section id="sobre" className="py-24 px-6 bg-[#1A2E1F] text-[#FDFCF8]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-5 text-[#FDFCF8]">A Excelência em cada Bowl.</h2>
            <p className="text-[#FDFCF8]/70 max-w-2xl mx-auto text-lg leading-relaxed">
              Nossa dark kitchen foi projetada para entregar a experiência de um restaurante de alta gastronomia na agilidade do delivery.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-white/5 p-8 rounded-[32px] border border-white/10 hover:bg-white/10 transition-colors"
              >
                <div className="w-14 h-14 rounded-2xl bg-[#4C7C59] text-white flex items-center justify-center mb-6 shadow-lg shadow-[#4C7C59]/20">
                  {feature.icon}
                </div>
                <h4 className="text-xl font-bold mb-3 text-[#FDFCF8]">{feature.title}</h4>
                <p className="text-sm text-[#FDFCF8]/60 leading-relaxed font-medium">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Storytelling Section (Organic Flow) */}
      <section id="origem" className="py-24 px-6 bg-[#FFFFFF]">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          <div className="relative order-2 lg:order-1">
            <div className="relative z-10 rounded-[32px] overflow-hidden shadow-2xl">
              <ImageWithFallback 
                src="https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=800&auto=format&fit=crop" 
                alt="Mercado de orgânicos" 
                className="w-full h-96 lg:h-[500px] object-cover"
              />
            </div>
            <div className="absolute -bottom-8 -right-8 z-20 bg-[#E9C46A] p-8 rounded-[32px] shadow-2xl text-[#1F1F1F]">
              <span className="font-serif italic text-4xl block leading-none mb-1">100%</span>
              <span className="font-bold text-xs uppercase tracking-widest opacity-80">Orgânico e Sustentável</span>
            </div>
          </div>
          <div className="order-1 lg:order-2">
            <span className="font-serif italic text-[#4C7C59] text-xl block mb-4">Nossa Essência</span>
            <h2 className="text-4xl lg:text-5xl font-bold mb-8 leading-[1.1] text-[#1F1F1F]">Do Campo ao Bowl, sem atalhos.</h2>
            <p className="text-lg text-[#5F5F5F] mb-10 leading-relaxed font-medium">
              Acreditamos que a comida de verdade não precisa de pressa no cultivo, apenas no preparo. Trabalhamos com pequenos produtores que respeitam o tempo da terra, garantindo que você receba vitalidade absoluta.
            </p>
            <div className="grid grid-cols-2 gap-8">
              <div>
                <h4 className="text-[#4C7C59] font-bold mb-2">Sem Plástico</h4>
                <p className="text-sm text-[#5F5F5F] font-medium leading-snug">Embalagens biodegradáveis que retornam ao solo.</p>
              </div>
              <div>
                <h4 className="text-[#4C7C59] font-bold mb-2">Higienização Tripla</h4>
                <p className="text-sm text-[#5F5F5F] font-medium leading-snug">Protocolo rigoroso de segurança alimentar.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Favorites Menu Section (Fresco Grid) */}
      <section id="menu" className="py-24 px-6 bg-[#F7F9F7]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-5 text-[#1F1F1F]">Nossos Favoritos</h2>
            <p className="text-[#5F5F5F] max-w-2xl mx-auto text-lg leading-relaxed font-medium">
              Combinações pensadas nutricionalmente para dar energia e leveza ao seu dia.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {favoriteBowls.map((bowl, index) => (
              <div
                key={index}
                className="group bg-white rounded-[40px] overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 border border-[#EEF2EE]"
              >
                <div className="relative aspect-square overflow-hidden bg-[#F7F9F7]">
                  <ImageWithFallback 
                    src={bowl.image} 
                    alt={bowl.name} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 shadow-lg"
                    style={{ clipPath: 'polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%)', borderRadius: '40px' }}
                  />
                  <div className="absolute top-6 left-6 px-4 py-2 rounded-full bg-white/90 backdrop-blur-sm text-[10px] font-extrabold uppercase tracking-widest text-[#4C7C59] shadow-sm">
                    {bowl.tag}
                  </div>
                </div>
                <div className="p-8">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-2xl font-bold text-[#1F1F1F] group-hover:text-[#4C7C59] transition-colors">{bowl.name}</h3>
                    <span className="text-[#4C7C59] font-extrabold text-lg">{bowl.price}</span>
                  </div>
                  <p className="text-[#5F5F5F] mb-8 leading-relaxed font-serif italic text-sm">
                    {bowl.description}
                  </p>
                  <button 
                    onClick={handleOrderRedirect}
                    className="w-full py-4 rounded-2xl border-2 border-[#4C7C59] text-[#4C7C59] font-bold text-sm hover:bg-[#4C7C59] hover:text-white transition-all flex items-center justify-center gap-3"
                  >
                    Adicionar ao pedido
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer (Premium Dark/Creme) */}
      <footer className="py-20 px-6 bg-white border-t border-[#EEF2EE]">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-16 mb-20">
            <div className="col-span-1 md:col-span-1">
              <div className="flex items-center mb-8">
                <ImageWithFallback src={logoImage} alt="DaHorta" className="h-10 w-auto object-contain" />
              </div>
              <p className="text-sm text-[#5F5F5F] leading-relaxed font-medium">
                A revolução da alimentação consciente. Rápido, fresco e transparente. Do campo para sua rotina.
              </p>
              <div className="flex gap-4 mt-8">
                <div className="w-10 h-10 rounded-full bg-[#E6F0EA] flex items-center justify-center text-[#4C7C59] hover:bg-[#4C7C59] hover:text-white transition-all cursor-pointer">
                  <Instagram size={18} />
                </div>
                <div className="w-10 h-10 rounded-full bg-[#E6F0EA] flex items-center justify-center text-[#4C7C59] hover:bg-[#4C7C59] hover:text-white transition-all cursor-pointer">
                  <Facebook size={18} />
                </div>
              </div>
            </div>
            <div>
              <h5 className="font-extrabold text-[10px] uppercase tracking-[0.2em] text-[#A0A0A0] mb-8">Links</h5>
              <ul className="space-y-4 text-sm font-bold text-[#1F1F1F]">
                <li><a href="#menu" className="hover:text-[#4C7C59] transition-colors">Cardápio</a></li>
                <li><a href="#sobre" className="hover:text-[#4C7C59] transition-colors">Qualidade</a></li>
                <li><a href="#origem" className="hover:text-[#4C7C59] transition-colors">Produtores</a></li>
              </ul>
            </div>
            <div>
              <h5 className="font-extrabold text-[10px] uppercase tracking-[0.2em] text-[#A0A0A0] mb-8">Ajuda</h5>
              <ul className="space-y-4 text-sm font-bold text-[#1F1F1F]">
                <li><a href="#" className="hover:text-[#4C7C59] transition-colors">Entregas</a></li>
                <li><a href="#" className="hover:text-[#4C7C59] transition-colors">Contato</a></li>
                <li><a href="#" className="hover:text-[#4C7C59] transition-colors">Privacidade</a></li>
              </ul>
            </div>
            <div>
              <h5 className="font-extrabold text-[10px] uppercase tracking-[0.2em] text-[#A0A0A0] mb-8">Onde Estamos</h5>
              <div className="flex items-start gap-3 mt-4 text-[#1F1F1F]">
                <MapPin size={20} className="text-[#4C7C59] flex-shrink-0" />
                <address className="not-italic text-sm font-medium leading-relaxed">
                  Rua da Horta, 123 <br />
                  Pinheiros, São Paulo - SP <br />
                  CEP 05412-000
                </address>
              </div>
            </div>
          </div>
          <div className="pt-10 border-t border-[#EEF2EE] flex flex-col md:flex-row justify-between items-center gap-6 text-[10px] text-[#A0A0A0] font-extrabold uppercase tracking-[0.15em]">
            <div>© 2024 DAHORTA ORGANIC BOWLS. TODOS OS DIREITOS RESERVADOS.</div>
            <div className="flex gap-10">
              <span className="text-[#1F1F1F]">EDITORIAL DESIGN BY DAHORTA</span>
              <span className="hover:text-[#4C7C59] cursor-pointer transition-colors">SÃO PAULO - BRAZIL</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
