import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Clock, Star, Plus, Search, ChevronRight, X, Minus, ShoppingBag, Sparkles, Tag, Percent } from "lucide-react";
import { useApp, getAllergensByProductId } from "../../store/AppContext";
import { Product } from "../../store/mockData";
import { useNavigate } from "react-router";
import { ImageWithFallback } from "../../components/figma/ImageWithFallback";
import heroImg from "figma:asset/6a6cb4394cfe8dac99d70ae300042099f5cbd856.png";

const formatCurrency = (v: number) =>
  v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

// ─── Allergen Icon Component (Direct SVGs) ────────────────────────────────────
const AllergenIcon = ({ type }: { type: string }) => {
  const allergenMap: Record<string, { svg: any, color: string, name: string }> = {
    Gluten: { 
      name: "Contém Glúten",
      color: "#E9C46A",
      svg: <><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-wheat-icon lucide-wheat"><path d="M2 22 16 8"/><path d="M3.47 12.53 5 11l1.53 1.53a3.5 3.5 0 0 1 0 4.94L5 19l-1.53-1.53a3.5 3.5 0 0 1 0-4.94Z"/><path d="M7.47 8.53 9 7l1.53 1.53a3.5 3.5 0 0 1 0 4.94L9 15l-1.53-1.53a3.5 3.5 0 0 1 0-4.94Z"/><path d="M11.47 4.53 13 3l1.53 1.53a3.5 3.5 0 0 1 0 4.94L13 11l-1.53-1.53a3.5 3.5 0 0 1 0-4.94Z"/><path d="M20 2h2v2a4 4 0 0 1-4 4h-2V6a4 4 0 0 1 4-4Z"/><path d="M11.47 17.47 13 19l-1.53 1.53a3.5 3.5 0 0 1-4.94 0L5 19l1.53-1.53a3.5 3.5 0 0 1 4.94 0Z"/><path d="M15.47 13.47 17 15l-1.53 1.53a3.5 3.5 0 0 1-4.94 0L9 15l1.53-1.53a3.5 3.5 0 0 1 4.94 0Z"/><path d="M19.47 9.47 21 11l-1.53 1.53a3.5 3.5 0 0 1-4.94 0L13 11l1.53-1.53a3.5 3.5 0 0 1 4.94 0Z"/></svg></>
    },
    Soja: { 
      name: "Contém Soja",
      color: "#4C7C59",
      svg: <><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-bean-icon lucide-bean"><path d="M10.165 6.598C9.954 7.478 9.64 8.36 9 9c-.64.64-1.521.954-2.402 1.165A6 6 0 0 0 8 22c7.732 0 14-6.268 14-14a6 6 0 0 0-11.835-1.402Z"/><path d="M5.341 10.62a4 4 0 1 0 5.279-5.28"/></svg></>
    },
    Nozes: { 
      name: "Contém Nozes",
      color: "#F4A261",
      svg: <><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-nut-icon lucide-nut"><path d="M12 4V2"/><path d="M5 10v4a7.004 7.004 0 0 0 5.277 6.787c.412.104.802.292 1.102.592L12 22l.621-.621c.3-.3.69-.488 1.102-.592A7.003 7.003 0 0 0 19 14v-4"/><path d="M12 4C8 4 4.5 6 4 8c-.243.97-.919 1.952-2 3 1.31-.082 1.972-.29 3-1 .54.92.982 1.356 2 2 1.452-.647 1.954-1.098 2.5-2 .595.995 1.151 1.427 2.5 2 1.31-.621 1.862-1.058 2.5-2 .629.977 1.162 1.423 2.5 2 1.209-.548 1.68-.967 2-2 1.032.916 1.683 1.157 3 1-1.297-1.036-1.758-2.03-2-3-.5-2-4-4-8-4Z"/></svg></>
    },
    Ovo: { 
      name: "Contém Ovo",
      color: "#F4A261",
      svg: <><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-egg-icon lucide-egg"><path d="M12 2C8 2 4 8 4 14a8 8 0 0 0 16 0c0-6-4-12-8-12"/></svg></>
    },
    Peixe: { 
      name: "Contém Peixe",
      color: "#457B9D",
      svg: <><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-fish-icon lucide-fish"><path d="M6.5 12c.94-3.46 4.94-6 8.5-6 3.56 0 6.06 2.54 7 6-.94 3.47-3.44 6-7 6s-7.56-2.53-8.5-6Z"/><path d="M18 12v.5"/><path d="M16 17.93a9.77 9.77 0 0 1 0-11.86"/><path d="M7 10.67C7 8 5.58 5.97 2.73 5.5c-1 1.5-1 5 .23 6.5-1.24 1.5-1.24 5-.23 6.5C5.58 18.03 7 16 7 13.33"/><path d="M10.46 7.26C10.2 5.88 9.17 4.24 8 3h5.8a2 2 0 0 1 1.98 1.67l.23 1.4"/><path d="m16.01 17.93-.23 1.4A2 2 0 0 1 13.8 21H9.5a5.96 5.96 0 0 0 1.49-3.98"/></svg></>
    },
    Crustáceos: { 
      name: "Contém Crustáceos",
      color: "#E76F51",
      svg: <><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-fish-icon lucide-fish"><path d="M6.5 12c.94-3.46 4.94-6 8.5-6 3.56 0 6.06 2.54 7 6-.94 3.47-3.44 6-7 6s-7.56-2.53-8.5-6Z"/><path d="M18 12v.5"/><path d="M16 17.93a9.77 9.77 0 0 1 0-11.86"/><path d="M7 10.67C7 8 5.58 5.97 2.73 5.5c-1 1.5-1 5 .23 6.5-1.24 1.5-1.24 5-.23 6.5C5.58 18.03 7 16 7 13.33"/><path d="M10.46 7.26C10.2 5.88 9.17 4.24 8 3h5.8a2 2 0 0 1 1.98 1.67l.23 1.4"/><path d="m16.01 17.93-.23 1.4A2 2 0 0 1 13.8 21H9.5a5.96 5.96 0 0 0 1.49-3.98"/></svg></>
    },
    Leite: { 
      name: "Contém Leite",
      color: "#A8DADC",
      svg: <><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-milk-icon lucide-milk"><path d="M8 2h8"/><path d="M9 2v2.789a4 4 0 0 1-.672 2.219l-.656.984A4 4 0 0 0 7 10.212V20a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2v-9.789a4 4 0 0 0-.672-2.219l-.656-.984A4 4 0 0 1 15 4.788V2"/><path d="M7 15a6.472 6.472 0 0 1 5 0 6.47 6.47 0 0 0 5 0"/></svg></>
    },
  };

  const allergen = allergenMap[type];
  if (!allergen) return null;

  return (
    <div 
      className="group relative flex items-center justify-center w-5 h-5 rounded-full border border-border bg-white shadow-sm"
      title={allergen.name}
    >
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={allergen.color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        {allergen.svg}
      </svg>
    </div>
  );
};

// ─── Product Modal ─────────────────────────────────────────────────────────────
interface ProductModalProps {
  product: Product;
  onClose: () => void;
  onAdd: (product: Product, quantity: number, subItems?: any[]) => void;
  quantity: number;
}

function ProductModal({ product, onClose, onAdd, quantity }: ProductModalProps) {
  const { products } = useApp();
  const [adding, setAdding] = useState(false);
  const [selections, setSelections] = useState<Record<string, string>>({});
  const [localQty, setLocalQty] = useState(1);
  const [activeSlotIndex, setActiveSlotIndex] = useState(0);
  const carouselRef = useRef<HTMLDivElement>(null);

  // Pre-fill combo with first items
  useEffect(() => {
    if (product.isCombo && product.comboSlots) {
      const initial: Record<string, string> = {};
      product.comboSlots.forEach(slot => {
        if (slot.products && slot.products.length > 0) {
          initial[slot.id] = slot.products[0];
        }
      });
      setSelections(initial);
      setActiveSlotIndex(0);
    }
  }, [product.id, product.isCombo, product.comboSlots]);

  // Center active slot in carousel
  useEffect(() => {
    if (carouselRef.current) {
      const activeEl = carouselRef.current.children[activeSlotIndex] as HTMLElement;
      if (activeEl) {
        activeEl.scrollIntoView({
          behavior: "smooth",
          block: "nearest",
          inline: "center",
        });
      }
    }
  }, [activeSlotIndex]);

  const handleAdd = () => {
    if (product.isCombo) {
      const allSelected = product.comboSlots?.every(slot => selections[slot.id]);
      if (!allSelected) {
        alert("Por favor, selecione todos os itens do combo.");
        return;
      }
    }

    setAdding(true);
    
    const subItems = product.isCombo ? product.comboSlots?.map(slot => {
      const selectedId = selections[slot.id];
      const p = products.find(prod => prod.id === selectedId);
      return {
        slotName: slot.name,
        productId: selectedId,
        name: p?.name || "Item selecionado"
      };
    }) : undefined;

    onAdd(product, localQty, subItems);
    setTimeout(() => {
      setAdding(false);
      onClose();
    }, 400);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4"
      style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}
      onClick={onClose}
    >
      <motion.div
        className={`w-full ${product.isCombo ? 'max-w-4xl h-[85vh]' : 'max-w-lg'} bg-white rounded-t-3xl sm:rounded-3xl overflow-hidden relative`}
        onClick={(e) => e.stopPropagation()}
        style={{ maxHeight: "90vh", display: "flex", flexDirection: "column" }}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full flex items-center justify-center bg-black/20 text-white backdrop-blur-md border-none cursor-pointer"
        >
          <X size={20} />
        </button>

        <div className={`flex flex-col ${product.isCombo ? 'md:flex-row' : ''} h-full`}>
          <div className={`relative ${product.isCombo ? 'md:w-1/2 h-64 md:h-full' : 'h-64 sm:h-72'} flex-shrink-0`}>
            <ImageWithFallback src={product.image} alt={product.name} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            {product.featured && (
              <div className="absolute top-4 left-4 bg-accent text-accent-foreground text-[10px] font-black uppercase px-2 py-1 rounded-md tracking-wider">
                Destaque DaHorta
              </div>
            )}
          </div>

          <div className={`flex-1 flex flex-col justify-between overflow-y-auto ${product.isCombo ? 'md:max-h-[85vh]' : ''}`}>
            <div className="p-6">
              <div className="flex justify-between items-start gap-4 mb-2">
                <h2 style={{ fontFamily: "'Poppins', sans-serif", fontSize: "24px", fontWeight: 700, color: "var(--text-primary)" }}>
                  {product.name}
                </h2>
                <span style={{ fontSize: "22px", fontWeight: 800, color: "var(--primary)" }}>
                  {formatCurrency(product.price)}
                </span>
              </div>

              <div className="flex items-center gap-4 mb-3">
                <div className="flex items-center gap-1.5 text-muted-foreground text-sm">
                  <Clock size={16} />
                  <span>{product.prepTime} min</span>
                </div>
                <div className="flex items-center gap-1.5 text-accent text-sm font-bold">
                  <Star size={16} fill="currentColor" />
                  <span>4.9</span>
                </div>
              </div>

              {/* Allergens in Modal */}
              <div className="flex gap-1.5 mb-6">
                {getAllergensByProductId(product.id).map((allergen: string) => (
                  <AllergenIcon key={allergen} type={allergen} />
                ))}
              </div>

              <p style={{ color: "var(--text-secondary)", fontSize: "15px", lineHeight: 1.6, marginBottom: "24px" }}>
                {product.description}
              </p>

              {product.isCombo && product.comboSlots && (
                <div className="mt-2 flex flex-col h-full overflow-hidden">
                  <h3 className="text-sm font-bold text-text-primary px-6 mb-2">Escolha seus itens:</h3>
                  
                  {/* Carousel of Slots */}
                  <div 
                    ref={carouselRef}
                    className="flex gap-6 overflow-x-auto px-20 py-8 scrollbar-hide snap-x h-44 items-center no-scrollbar"
                    style={{ scrollSnapType: "x mandatory" }}
                  >
                    {product.comboSlots.map((slot, idx) => {
                      const selectedPid = selections[slot.id];
                      const selectedProduct = products.find(p => p.id === selectedPid);
                      const isActive = activeSlotIndex === idx;
                      
                      return (
                        <motion.div
                          key={slot.id}
                          className="flex-shrink-0 flex flex-col items-center gap-2 cursor-pointer snap-center"
                          animate={{ 
                            scale: isActive ? 1.2 : 0.9,
                            opacity: isActive ? 1 : 0.6
                          }}
                          onClick={() => setActiveSlotIndex(idx)}
                        >
                          <div className={`w-20 h-20 rounded-2xl overflow-hidden border-2 transition-colors ${isActive ? 'border-primary' : 'border-border'}`}>
                             <ImageWithFallback 
                               src={selectedProduct?.image || product.image} 
                               alt={slot.name} 
                               className="w-full h-full object-cover" 
                             />
                          </div>
                          <span className="text-[10px] font-bold uppercase text-muted-foreground text-center line-clamp-1 w-24">
                            {slot.name}
                          </span>
                        </motion.div>
                      );
                    })}
                  </div>

                  {/* Options for Active Slot */}
                  {product.comboSlots[activeSlotIndex] && (
                    <div className="flex-1 bg-background-soft px-6 py-4 rounded-t-[32px] border-t border-border">
                      <p className="text-xs font-bold text-muted-foreground uppercase mb-4">
                        Opções para {product.comboSlots[activeSlotIndex].name}:
                      </p>
                      <div className="grid grid-cols-3 gap-3">
                        {product.comboSlots[activeSlotIndex].products.map(pid => {
                          const p = products.find(prod => prod.id === pid);
                          const currentSlotId = product.comboSlots?.[activeSlotIndex]?.id;
                          const isSelected = currentSlotId ? selections[currentSlotId] === pid : false;
                          if (!p) return null;
                          
                          return (
                            <motion.div
                              key={pid}
                              whileTap={{ scale: 0.95 }}
                              className={`p-2 rounded-2xl border-2 transition-all cursor-pointer bg-white ${isSelected ? 'border-primary' : 'border-transparent'}`}
                              onClick={() => currentSlotId && setSelections({ ...selections, [currentSlotId]: pid })}
                            >
                              <div className="aspect-square rounded-xl overflow-hidden mb-2">
                                <ImageWithFallback src={p.image} alt={p.name} className="w-full h-full object-cover" />
                              </div>
                              <p className="text-[10px] font-bold text-center leading-tight line-clamp-2 h-7">{p.name}</p>
                            </motion.div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="p-6 bg-white border-t border-border mt-auto flex items-center gap-4">
              <div className="flex items-center bg-muted rounded-xl p-1 border border-border">
                <button
                  onClick={() => setLocalQty(Math.max(1, localQty - 1))}
                  className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-background transition-colors border-none cursor-pointer text-muted-foreground"
                >
                  <Minus size={18} />
                </button>
                <div className="w-12 text-center font-bold text-lg select-none">
                  {localQty}
                </div>
                <button
                  onClick={() => setLocalQty(localQty + 1)}
                  className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-background transition-colors border-none cursor-pointer text-muted-foreground"
                >
                  <Plus size={18} />
                </button>
              </div>

              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={handleAdd}
                className="flex-1 h-14 rounded-2xl flex items-center justify-center gap-3 transition-all border-none cursor-pointer"
                style={{ 
                  background: "var(--primary)", 
                  color: "white", 
                  fontWeight: 700,
                  fontSize: "16px",
                  boxShadow: "0 10px 20px -10px var(--primary)"
                }}
              >
                <ShoppingBag size={20} />
                {adding ? "Adicionando..." : `Adicionar • ${formatCurrency(product.price * localQty)}`}
              </motion.button>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Product Card ──────────────────────────────────────────────────────────────
interface ProductCardProps {
  product: Product;
  onClick: (product: Product) => void;
  quantity: number;
  isSpecial?: boolean;
}

function ProductCard({ product, onClick, quantity, isSpecial }: ProductCardProps) {
  const [hovered, setHovered] = useState(false);

  if (!product.available) return null;

  return (
    <motion.div
      whileHover={{ y: -4 }}
      whileTap={{ scale: 0.98 }}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      onClick={() => onClick(product)}
      className="bg-card rounded-2xl overflow-hidden border border-border flex items-center p-3 gap-4 cursor-pointer relative group"
    >
      <div className="w-24 h-24 rounded-xl overflow-hidden flex-shrink-0 relative">
        <ImageWithFallback src={product.image} alt={product.name} className="w-full h-full object-cover grayscale-[0.2] group-hover:grayscale-0 transition-all duration-300" />
        {isSpecial && (
          <div className="absolute top-1 left-1 bg-accent text-[9px] font-black px-1.5 py-0.5 rounded text-white uppercase tracking-tight shadow-sm z-10">
            Destaque
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0 pr-8">
        <div className="flex justify-between items-start mb-0.5">
          <h3 className="font-bold text-base text-text-primary truncate">{product.name}</h3>
        </div>
        <p className="text-[11px] text-muted-foreground line-clamp-2 mb-2 leading-tight">
          {product.description}
        </p>
        <div className="flex items-center gap-2 mb-2">
          {getAllergensByProductId(product.id).slice(0, 3).map((allergen: string) => (
            <AllergenIcon key={allergen} type={allergen} />
          ))}
        </div>
        <div className="flex items-center justify-between">
          <span className="font-black text-primary text-sm">
            {formatCurrency(product.price)}
          </span>
          <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground font-bold">
            <Clock size={12} className="text-muted-foreground/50" />
            <span>{product.prepTime} min</span>
          </div>
        </div>
      </div>

      {quantity > 0 && (
        <div className="absolute top-3 right-3 w-6 h-6 rounded-full bg-primary text-white text-[10px] font-black flex items-center justify-center shadow-lg border-2 border-white">
          {quantity}
        </div>
      )}

      <motion.div
        animate={{ scale: hovered ? 1 : 0.8, opacity: hovered ? 1 : 0 }}
        className="absolute right-4 bottom-4 w-7 h-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center transition-all"
      >
        <Plus size={16} />
      </motion.div>
    </motion.div>
  );
}

function FeaturedCard({
  product,
  onAdd,
  onClick
}: {
  product: Product;
  onAdd: (p: Product) => void;
  onClick: (p: Product) => void;
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <motion.div
      className="relative flex-shrink-0 overflow-hidden cursor-pointer"
      style={{
        width: 180,
        height: 240,
        borderRadius: "20px",
        border: "1px solid var(--border)",
        background: "var(--card)",
        boxShadow: "var(--shadow-default)"
      }}
      whileTap={{ scale: 0.97 }}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      onClick={() => onClick(product)}
    >
      <ImageWithFallback
        src={product.image}
        alt={product.name}
        className="absolute inset-0 w-full h-full object-cover"
        style={{
          transform: hovered ? "scale(1.08)" : "scale(1)",
          transition: "transform 0.6s ease",
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 60%)",
        }}
      />

      <div className="absolute bottom-0 left-0 right-0 p-4">
        <p
          style={{
            color: "#FFFFFF",
            fontSize: 14,
            fontWeight: 700,
            lineHeight: 1.3,
            marginBottom: 2,
            fontFamily: "'Poppins', sans-serif"
          }}
        >
          {product.name}
        </p>
        <p
          style={{
            color: "var(--accent)",
            fontSize: 15,
            fontWeight: 800,
          }}
        >
          {formatCurrency(product.price)}
        </p>
      </div>
    </motion.div>
  );
}

export default function MenuPage() {
  const {
    products,
    categories,
    restaurantOpen,
    cart,
    addToCart,
    cartTotal,
    cartCount,
    plateOfDay,
    coupons,
  } = useApp();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const categoryRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const currentDay = new Date().getDay();
  const plateOfDayId = plateOfDay[currentDay];
  const todaySpecial = products.find(p => p.id === plateOfDayId && p.available);

  const allPlatesOfDayIds = Object.values(plateOfDay);
  
  const filtered = products.filter((p) => {
    const isSpecialForOtherDay = allPlatesOfDayIds.includes(p.id) && p.id !== plateOfDayId;
    const matchSearch = search === "" || p.name.toLowerCase().includes(search.toLowerCase());
    const matchCat = activeCategory === "all" || p.category === activeCategory;
    return matchSearch && matchCat && p.available && !isSpecialForOtherDay;
  });

  const groupedByCategory = categories
    .map((cat) => ({
      category: cat,
      products: filtered.filter((p) => p.category === cat.id),
    }))
    .filter((g) => g.products.length > 0);

  const getCartQuantity = (productId: string) =>
    cart.find((i) => i.productId === productId)?.quantity ?? 0;

  const scrollToCategory = (catId: string) => {
    setActiveCategory(catId);
    categoryRefs.current[catId]?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  const handleProductClick = (product: Product) => {
    setSelectedProduct(product);
  };

  const activeCoupons = coupons.filter(c => c.active).slice(0, 3);

  return (
    <div style={{ color: "var(--foreground)" }}>
      {/* ── Hero Banner ── */}
      <div className="relative overflow-hidden" style={{ minHeight: 180, background: "var(--secondary)", marginTop: -16 }}>
        <ImageWithFallback src={heroImg} alt="Hero Background" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-black/40" />
        <div className="relative z-10 px-6 pt-12 pb-8 max-w-4xl mx-auto flex justify-between items-start">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="flex items-center gap-2 px-3 py-1 rounded-full" style={{ background: restaurantOpen ? "rgba(58,165,93,0.35)" : "rgba(230,57,70,0.35)", border: "1px solid rgba(255,255,255,0.2)", backdropFilter: "blur(8px)" }}>
                <div style={{ width: 6, height: 6, borderRadius: "50%", background: restaurantOpen ? "#4CAF50" : "#D64545" }} />
                <span className="text-white text-[10px] font-black uppercase tracking-wider">{restaurantOpen ? "Aberto" : "Fechado"}</span>
              </div>
              <span className="text-white/80 text-xs font-bold">45–60 min • R$ 5,90 entrega</span>
            </div>
            <h1 style={{ fontSize: "clamp(36px, 10vw, 56px)", color: "#FFFFFF", marginBottom: 4, fontWeight: 900, fontFamily: "'Poppins', sans-serif", letterSpacing: "-0.04em", lineHeight: 0.95 }}>DaHorta</h1>
            <p className="text-white/90 text-sm md:text-base mb-6 font-medium">Bowls orgânicos, frescos e cheios de vida.</p>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-0.5">
                {[1, 2, 3, 4, 5].map((s) => <Star key={s} size={14} color="#E9C46A" fill="#E9C46A" />)}
              </div>
              <span className="text-white font-black text-sm">4.9</span>
              <span className="text-white/60 text-[10px] font-bold uppercase tracking-wider">(1.2k+ avaliações)</span>
            </div>
          </div>
          <motion.button onClick={() => navigate("/cart")} whileTap={{ scale: 0.95 }} className="md:hidden w-12 h-12 rounded-2xl flex items-center justify-center transition-all mt-2 border-none relative" style={{ background: cartCount > 0 ? "var(--primary)" : "rgba(255,255,255,0.2)", border: "1px solid rgba(255,255,255,0.3)", backdropFilter: "blur(12px)", color: "white" }}>
            <ShoppingBag size={20} />
            {cartCount > 0 && <span className="absolute -top-1 -right-1 bg-white text-primary text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center border-2 border-primary">{cartCount}</span>}
          </motion.button>
        </div>
      </div>

      <div className="px-6 py-4 sticky z-30" style={{ top: 0, background: "var(--background)", borderBottom: "1px solid var(--border-light)" }}>
        <div className="relative max-w-4xl mx-auto">
          <Search size={18} color="var(--muted-foreground)" className="absolute left-4 top-1/2 -translate-y-1/2" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="O que vamos comer hoje?" className="w-full pl-12 pr-4 py-3.5 rounded-2xl outline-none" style={{ background: "var(--background-soft)", border: "1px solid var(--border)", color: "var(--text-primary)", fontSize: "15px" }} />
        </div>
      </div>

      <div className="max-w-4xl mx-auto">
        {!search && activeCoupons.length > 0 && (
          <div className="px-6 pt-6 -mb-2">
            <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
              {activeCoupons.map((coupon) => (
                <motion.div key={coupon.id} whileHover={{ y: -2 }} className="flex-shrink-0 bg-white shadow-sm border border-border rounded-xl p-2.5 flex items-center gap-3 min-w-[170px]">
                  <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary"><Tag size={16} /></div>
                  <div>
                    <p className="font-black text-[11px] uppercase tracking-wider mb-0.5 leading-none">{coupon.code}</p>
                    <p className="text-[10px] text-muted-foreground font-semibold leading-none">{coupon.type === 'percentage' ? `${coupon.value}% OFF` : coupon.type === 'shipping' ? 'Frete Grátis' : `R$ ${coupon.value} OFF`}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {!search && (
          <div className="px-6 py-5">
            <div className="flex gap-2.5 overflow-x-auto pb-1 scrollbar-hide">
              <button onClick={() => setActiveCategory("all")} className="flex-shrink-0 px-5 py-2.5 rounded-full text-xs font-bold transition-all border-none" style={{ background: activeCategory === "all" ? "var(--primary)" : "var(--background-soft)", color: activeCategory === "all" ? "white" : "var(--text-secondary)" }}>TUDO</button>
              {categories.filter(c => products.some(p => p.category === c.id && p.available)).map(cat => (
                <button key={cat.id} onClick={() => scrollToCategory(cat.id)} className="flex-shrink-0 px-5 py-2.5 rounded-full text-xs font-bold transition-all flex items-center gap-2 border-none" style={{ background: activeCategory === cat.id ? "var(--primary)" : "var(--background-soft)", color: activeCategory === cat.id ? "white" : "var(--text-secondary)" }}><span>{cat.icon}</span><span>{cat.name.toUpperCase()}</span></button>
              ))}
            </div>
          </div>
        )}

        {!search && todaySpecial && activeCategory === "all" && (
          <div className="px-6 mb-12">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#E9C46A]/20 flex items-center justify-center"><Sparkles size={22} color="#E9C46A" /></div>
                <h2 style={{ fontSize: 24, fontWeight: 900, color: "var(--text-primary)", fontFamily: "'Poppins', sans-serif" }}>Prato do Dia</h2>
              </div>
              <span className="hidden sm:block text-[10px] font-black uppercase tracking-widest text-[#4C7C59] bg-[#E6F0EA] px-3 py-1 rounded-full">Fresco Hoje</span>
            </div>
            <motion.div whileHover={{ y: -4 }} onClick={() => setSelectedProduct(todaySpecial)} className="relative overflow-hidden rounded-[40px] shadow-2xl shadow-[#4C7C59]/10 cursor-pointer group" style={{ background: "#1A2E1F", border: "1px solid rgba(255,255,255,0.05)" }}>
              <div className="flex flex-col lg:flex-row">
                <div className="lg:w-1/2 aspect-square lg:aspect-auto overflow-hidden relative">
                  <ImageWithFallback src={todaySpecial.image} alt={todaySpecial.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#1A2E1F] lg:bg-gradient-to-l lg:from-[#1A2E1F] lg:to-transparent" />
                </div>
                <div className="lg:w-1/2 p-8 lg:p-12 flex flex-col justify-center">
                  <div className="inline-block self-start mb-6 px-4 py-1.5 rounded-full bg-[#E9C46A] text-[#1A2E1F] text-[10px] font-black uppercase tracking-widest">RECOMENDAÇÃO DO CHEF</div>
                  <h3 style={{ fontSize: 32, fontWeight: 900, color: "white", marginBottom: 12, lineHeight: 1.1, fontFamily: "'Poppins', sans-serif" }}>{todaySpecial.name}</h3>
                  <p style={{ color: "rgba(255,255,255,0.7)", fontSize: 16, lineHeight: 1.6, marginBottom: 32, fontWeight: 500 }}>{todaySpecial.description}</p>
                  <div className="flex items-center justify-between mt-auto">
                    <span style={{ fontSize: 24, fontWeight: 900, color: "#E9C46A" }}>{formatCurrency(todaySpecial.price)}</span>
                    <button onClick={(e) => { e.stopPropagation(); addToCart(todaySpecial); }} className="bg-[#4C7C59] text-white px-8 py-4 rounded-2xl font-black text-sm transition-all flex items-center gap-2 border-none cursor-pointer"><ShoppingBag size={18} />Pedir Agora</button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        <div className="px-6 pb-20">
          {search ? (
            <div className="space-y-4">
              {filtered.map(product => <ProductCard key={product.id} product={product} onClick={handleProductClick} quantity={getCartQuantity(product.id)} />)}
            </div>
          ) : (
            groupedByCategory.map(({ category, products: catProducts }) => (
              <div key={category.id} className="mb-10" ref={(el) => (categoryRefs.current[category.id] = el)}>
                <div className="flex items-center gap-3 mb-5 pb-2" style={{ borderBottom: "2px solid var(--secondary)" }}>
                  <span style={{ fontSize: 24 }}>{category.icon}</span>
                  <h2 style={{ fontSize: 22, fontWeight: 800, color: "var(--text-primary)", fontFamily: "'Poppins', sans-serif" }}>{category.name}</h2>
                </div>
                <div className="grid grid-cols-1 gap-4">
                  {catProducts.map(product => <ProductCard key={product.id} product={product} onClick={handleProductClick} quantity={getCartQuantity(product.id)} isSpecial={product.id === plateOfDayId} />)}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <AnimatePresence>
        {cartCount > 0 && !selectedProduct && (
          <div className="fixed bottom-20 md:bottom-8 left-0 right-0 px-6 z-[40]">
            <motion.button initial={{ y: 80, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 80, opacity: 0 }} onClick={() => navigate("/cart")} className="w-full mx-auto flex items-center justify-between px-6 py-4 rounded-2xl border-none cursor-pointer" style={{ maxWidth: 600, background: "var(--primary)", color: "white", boxShadow: "0 20px 40px -10px rgba(76, 124, 89, 0.5)" }}>
              <div className="flex items-center gap-4">
                <div className="w-9 h-9 rounded-lg bg-white/20 flex items-center justify-center font-black">{cartCount}</div>
                <span className="font-bold">Ver Carrinho</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-lg font-black">{formatCurrency(cartTotal)}</span>
                <ChevronRight size={20} />
              </div>
            </motion.button>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {selectedProduct && <ProductModal product={selectedProduct} onClose={() => setSelectedProduct(null)} onAdd={addToCart} quantity={getCartQuantity(selectedProduct.id)} />}
      </AnimatePresence>
    </div>
  );
}
