"use client"

import type React from "react"
import { v4 as uuidv4 } from "uuid"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { VisuallyHidden } from "@radix-ui/react-visually-hidden"
import {
  Flame,
  Zap,
  CheckCircle,
  ArrowRight,
  TrendingUp,
  Clock,
  X,
  MessageCircle,
  Users,
  ThumbsUp,
  ChevronLeft,
  ChevronRight,
  Menu,
} from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useState, useEffect, useRef } from "react"
import {
  handleTracking,
  trackLastButtonClicked,
  trackPurchaseClick,
  initializeAdvancedTracking,
} from "./tracking" // Importar funções de tracking avançado

export default function FirePowerLanding() {
  const [showInactivityModal, setShowInactivityModal] = useState(false)
  const [showFeedbackModal, setShowFeedbackModal] = useState(false)
  const [showImageModal, setShowImageModal] = useState(false)
  const [selectedImage, setSelectedImage] = useState<{ src: string; alt: string; message: string } | null>(null)
  const [currentSlide, setCurrentSlide] = useState(0)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [inactivityOfferTime, setInactivityOfferTime] = useState({
    minutes: 3,
    seconds: 0,
  })


  const [feedbackData, setFeedbackData] = useState({
    name: "",
    phone: "",
    cep: "",
    city: "",
    state: "",
    reason: "",
    lgpdConsent: false,
    whatsappConsent: false,
  })

  const [timeLeft, setTimeLeft] = useState({
    hours: 23,
    minutes: 47,
    seconds: 32,
  })

  const offerSectionRef = useRef(null) // Ref para a seção de oferta

  // Dados das imagens dos depoimentos
  const testimonialImages = [
    {
      src: "/images/testemunho_0533.jpg",
      alt: "Cliente recebeu Fire Power",
      message: "Show amigo, faça um bom uso",
    },
    {
      src: "/images/testemunho_0353.jpg",
      alt: "Cliente satisfeito com Fire Power",
      message: "Fechou amigo 👍👍",
    },
    {
      src: "/images/testemunho_0370.jpg",
      alt: "Entrega Fire Power",
      message: "Chegou aqui já valeu",
    },
    {
      src: "/images/testemunho_0532.jpg",
      alt: "Cliente recebeu produtos",
      message: "Show amigo, faça bom uso",
    },
    {
      src: "/images/testemunho_0352.jpg",
      alt: "Múltiplos frascos entregues",
      message: "Entrega confirmada 🤝",
    },
    {
      src: "/images/testemunho_0534.jpg",
      alt: "Comprovante e produto",
      message: "Feito amigo, faça bom uso!",
    },
    {
      src: "/images/testemunho_0535.jpg",
      alt: "3 frascos Fire Power",
      message: "Logo vou comprar mais",
    },
  ]

  // Inicialização do tracking avançado e listeners
  useEffect(() => {
    initializeAdvancedTracking();

    // Observer para view_offer_section
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            handleTracking("view_offer_section", { sectionId: "offer" })
            observer.unobserve(entry.target) // Disparar apenas uma vez
          }
        })
      },
      { threshold: 0.5 } // Pelo menos 50% visível
    )

    if (offerSectionRef.current) {
      observer.observe(offerSectionRef.current)
    }

    return () => {
      // Limpeza de listeners já é feita dentro de initializeAdvancedTracking
      if (offerSectionRef.current) {
        observer.unobserve(offerSectionRef.current)
      }
    }
  }, [])

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % Math.ceil(testimonialImages.length / 3))
    handleTracking("click_cta", { buttonId: "next_testimonial_slide", buttonText: "Próximo Depoimento" })
    trackLastButtonClicked("next_testimonial_slide", "Próximo Depoimento")
  }

  const prevSlide = () => {
    setCurrentSlide(
      (prev) => (prev - 1 + Math.ceil(testimonialImages.length / 3)) % Math.ceil(testimonialImages.length / 3),
    )
    handleTracking("click_cta", { buttonId: "prev_testimonial_slide", buttonText: "Depoimento Anterior" })
    trackLastButtonClicked("prev_testimonial_slide", "Depoimento Anterior")
  }

  const openImageModal = (image: { src: string; alt: string; message: string }) => {
    setSelectedImage(image)
    setShowImageModal(true)
    handleTracking("testimonial_image_click", { imageSrc: image.src, imageAlt: image.alt })
    handleTracking("modal_opened", { modalId: "image_modal" })
  }

  const closeImageModal = () => {
    setShowImageModal(false)
    handleTracking("modal_closed", { modalId: "image_modal" })
  }

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId)
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" })
      handleTracking("scroll_to_section", { sectionId })
      setMobileMenuOpen(false)
    }
  }

   // Add this useEffect after the existing countdown timer useEffect
  useEffect(() => {
    if (!showInactivityModal) return

    const timer = setInterval(() => {
      setInactivityOfferTime((prevTime) => {
        let { minutes, seconds } = prevTime

        if (seconds > 0) {
          seconds--
        } else if (minutes > 0) {
          minutes--
          seconds = 59
        } else {
          // Timer chegou a zero, fecha o modal
          setShowInactivityModal(false)
          return { minutes: 3, seconds: 0 } // Reset for next time
        }

        return { minutes, seconds }
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [showInactivityModal])


  // Timer de inatividade
  useEffect(() => {
    let timer: NodeJS.Timeout

    const resetTimer = () => {
      if (timer) clearTimeout(timer)
      timer = setTimeout(() => {
        setShowInactivityModal(true)
        handleTracking("modal_opened", { modalId: "inactivity_modal" })
      }, 30000) // 30 segundos de inatividade
    }

    const events = ["mousedown", "mousemove", "keypress", "scroll", "touchstart"]

    const handleUserActivity = () => {
      if (!showInactivityModal) {
        resetTimer()
      }
    }

    events.forEach((event) => {
      document.addEventListener(event, handleUserActivity, true)
    })

    // Inicia o timer inicial
    resetTimer()

    return () => {
      if (timer) clearTimeout(timer)
      events.forEach((event) => {
        document.removeEventListener(event, handleUserActivity, true)
      })
    }
  }, [showInactivityModal])

  // Timer de contagem regressiva
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prevTime) => {
        let { hours, minutes, seconds } = prevTime

        if (seconds > 0) {
          seconds--
        } else if (minutes > 0) {
          minutes--
          seconds = 59
        } else if (hours > 0) {
          hours--
          minutes = 59
          seconds = 59
        } else {
          // Timer chegou a zero, reinicia
          hours = 23
          minutes = 59
          seconds = 59
        }

        return { hours, minutes, seconds }
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  const handleInactivityModalClose = () => {
    setShowInactivityModal(false)
    handleTracking("modal_closed", { modalId: "inactivity_modal" })
    // Após 10 segundos, mostra o modal de feedback
    setTimeout(() => {
      setShowFeedbackModal(true)
      handleTracking("modal_opened", { modalId: "feedback_modal" })
    }, 10)
  }

  const handleFeedbackModalClose = () => {
    setShowFeedbackModal(false)
    handleTracking("modal_closed", { modalId: "feedback_modal" })
  }

  const handleFeedbackSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (feedbackData.lgpdConsent) {
      handleTracking("feedback_form_submit", { ...feedbackData })
      alert("Obrigado pelo seu feedback! Seus dados foram registrados com segurança.")
      setShowFeedbackModal(false)
      handleTracking("modal_closed", { modalId: "feedback_modal", reason: "submit_success" })
    } else {
      alert("Por favor, aceite os termos de consentimento para continuar.")
      handleTracking("feedback_form_submit_failed", { reason: "lgpd_not_accepted" })
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    const checked = (e.target as HTMLInputElement).checked

    setFeedbackData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }))
  }

  const handleSelectChange = (value: string) => {
    setFeedbackData((prev) => ({
      ...prev,
      reason: value,
    }))
  }

  const handleCheckboxChange = (checked: boolean | "indeterminate", name: string) => {
    setFeedbackData((prev) => ({
      ...prev,
      [name]: checked === true,
    }))
  }

  // Função genérica para rastrear cliques em botões (usando handleTracking)
  const trackButtonClick = (buttonId: string, buttonText: string, additionalData = {}) => {
    handleTracking("click_cta", { buttonId, buttonText, ...additionalData })
    trackLastButtonClicked(buttonId, buttonText)
  }

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-red-900 via-black to-red-800 relative">
      {/* Texturas de fundo premium */}
      <div className="fixed inset-0 opacity-5 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,0,0,0.1),transparent_50%)]"></div>
        <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.02)_25%,rgba(255,255,255,0.02)_50%,transparent_50%,transparent_75%,rgba(255,255,255,0.02)_75%)] bg-[length:20px_20px]"></div>
      </div>

      {/* Header com navegação fixa */}
      <header className="px-4 lg:px-6 h-16 flex items-center border-b border-red-800/50 bg-black/90 backdrop-blur-md sticky top-0 z-50 shadow-lg shadow-red-900/20">
        <Link
          href="/"
          className="flex items-center justify-center gap-2 group"
          onClick={() => trackButtonClick("header_logo_link", "Logo Fire Power")}
        >
          <div className="p-2 bg-gradient-to-r from-red-600 to-red-800 rounded-lg group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-red-600/30">
            <Flame className="h-6 w-6 text-white" />
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-red-400 via-yellow-400 to-red-400 bg-clip-text text-transparent animate_pulse">
            Fire Power
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="ml-auto hidden md:flex gap-6">
          <button
            onClick={() => {
              scrollToSection("benefits")
              trackButtonClick("nav_benefits", "Benefícios")
            }}
            className="text-sm font-medium text-white hover:text-red-400 transition-all duration-300 hover:scale-105 relative group"
          >
            Benefícios
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-red-400 transition-all duration-300 group-hover:w-full"></span>
          </button>
          <button
            onClick={() => {
              scrollToSection("testimonials")
              trackButtonClick("nav_testimonials", "Depoimentos")
            }}
            className="text-sm font-medium text-white hover:text-red-400 transition-all duration-300 hover:scale-105 relative group"
          >
            Depoimentos
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-red-400 transition-all duration-300 group-hover:w-full"></span>
          </button>
          <button
            onClick={() => {
              scrollToSection("offer")
              trackButtonClick("nav_offer", "Oferta")
            }}
            className="text-sm font-medium text-white hover:text-red-400 transition-all duration-300 hover:scale-105 relative group"
          >
            Oferta
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-red-400 transition-all duration-300 group-hover:w-full"></span>
          </button>
        </nav>

        {/* Mobile Menu Button */}
        <button
          className="ml-auto md:hidden p-2 text-white hover:text-red-400 transition-colors"
          onClick={() => {
            setMobileMenuOpen(!mobileMenuOpen)
            trackButtonClick("mobile_menu_toggle", mobileMenuOpen ? "Fechar Menu" : "Abrir Menu")
          }}
        >
          <Menu className="h-6 w-6" />
        </button>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="absolute top-16 left-0 right-0 bg-black/95 backdrop-blur-md border-b border-red-800/50 md:hidden animate-in slide-in-from-top duration-300">
            <nav className="flex flex-col p-4 space-y-4">
              <button
                onClick={() => {
                  scrollToSection("benefits")
                  trackButtonClick("mobile_nav_benefits", "Benefícios (Mobile)")
                }}
                className="text-left text-white hover:text-red-400 transition-colors py-2"
              >
                Benefícios
              </button>
              <button
                onClick={() => {
                  scrollToSection("testimonials")
                  trackButtonClick("mobile_nav_testimonials", "Depoimentos (Mobile)")
                }}
                className="text-left text-white hover:text-red-400 transition-colors py-2"
              >
                Depoimentos
              </button>
              <button
                onClick={() => {
                  scrollToSection("offer")
                  trackButtonClick("mobile_nav_offer", "Oferta (Mobile)")
                }}
                className="text-left text-white hover:text-red-400 transition-colors py-2"
              >
                Oferta
              </button>
            </nav>
          </div>
        )}
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section id="hero" className="w-full py-8 md:py-16 lg:py-24 xl:py-32 relative overflow-hidden">
          {/* Background com texturas premium */}
          <div className="absolute inset-0">
            <div className="absolute inset-0 bg-gradient-to-br from-red-600/30 via-black/80 to-red-800/40"></div>
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,0,0,0.1),transparent_70%)]"></div>
            <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_30%,rgba(255,255,255,0.03)_50%,transparent_70%)] animate-pulse"></div>
          </div>

          <div className="container px-3 sm:px-4 md:px-6 relative z-10">
            <div className="grid gap-4 sm:gap-6 lg:grid-cols-[1fr_400px] lg:gap-8 xl:grid-cols-[1fr_600px] xl:gap-12">
              <div className="flex flex-col justify-center space-y-3 sm:space-y-4 text-center lg:text-left animate-in fade-in slide-in-from-left duration-1000">
                <div className="space-y-2">
                  <Badge className="bg-gradient-to-r from-red-600 to-red-800 text-white border-0 animate-pulse text-xs sm:text-sm shadow-lg shadow-red-600/30 hover:scale-105 transition-transform duration-300">
                    🔥 ATENÇÃO: Últimas 48 Horas!
                  </Badge>
                  <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold tracking-tighter text-white leading-tight drop-shadow-2xl">
                    Desperte o{" "}
                    <span className="bg-gradient-to-r from-red-400 via-yellow-400 to-red-400 bg-clip-text text-transparent animate-pulse">
                      PODER MASCULINO
                    </span>{" "}
                    que existe em você
                  </h1>
                  <p className="max-w-[600px] text-gray-300 text-sm sm:text-base md:text-lg lg:text-xl font-medium mx-auto lg:mx-0 drop-shadow-lg">
                    <strong className="text-red-400">EXCLUSIVO PARA HOMENS:</strong> O estimulante sexual mais potente
                    do Brasil. Resultados em apenas 30 minutos. Satisfação garantida ou seu dinheiro de volta em 7 dias!
                  </p>
                </div>

                {/* Urgência com animação */}
                <div className="bg-gradient-to-r from-red-600/20 to-red-800/20 border border-red-500/50 rounded-lg p-3 sm:p-4 backdrop-blur-sm shadow-xl shadow-red-900/20 hover:scale-105 transition-all duration-300">
                  <div className="flex items-center gap-2 text-red-400 mb-2">
                    <Clock className="h-4 w-4 sm:h-5 sm:w-5 animate-pulse" />
                    <span className="font-bold text-xs sm:text-sm">OFERTA LIMITADA - TERMINA EM:</span>
                  </div>
                  <div className="text-xl sm:text-2xl font-bold text-white font-mono tracking-wider">
                    {String(timeLeft.hours).padStart(2, "0")}:{String(timeLeft.minutes).padStart(2, "0")}:
                    {String(timeLeft.seconds).padStart(2, "0")}
                  </div>
                </div>

                <div className="flex flex-col gap-3 sm:gap-2 sm:flex-row">
                  <Button
                    size="lg"
                    className="bg-gradient-to-r from-red-600 via-red-700 to-red-800 hover:from-red-700 hover:via-red-800 hover:to-red-900 text-white font-bold text-sm sm:text-base lg:text-lg py-4 sm:py-6 w-full sm:flex-1 shadow-xl shadow-red-600/30 hover:shadow-red-600/50 hover:scale-105 transition-all duration-300 animate-pulse"
                    onClick={() => {
                      scrollToSection("offer")
                      trackButtonClick("hero_cta_potencia", "QUERO MINHA POTÊNCIA AGORA!")
                    }}
                  >
                    QUERO MINHA POTÊNCIA AGORA!
                    <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    className="border-red-400 text-red-400 hover:bg-red-900/20 py-4 sm:py-6 text-sm sm:text-base w-full sm:flex-1 backdrop-blur-sm hover:scale-105 transition-all duration-300"
                    onClick={() => {
                      scrollToSection("testimonials")
                      trackButtonClick("hero_cta_depoimentos", "Ver Depoimentos Reais")
                    }}
                  >
                    Ver Depoimentos Reais
                  </Button>
                </div>

                {/* Garantias com animação */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-4 text-xs sm:text-sm text-gray-300">
                  {[
                    { text: "7 DIAS de Garantia", delay: "0ms" },
                    { text: "PAGUE ao Receber", delay: "100ms" },
                    { text: "DISCRETO e Seguro", delay: "200ms" },
                    { text: "RESULTADOS em 30min", delay: "300ms" },
                  ].map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-1 sm:gap-2 animate-in fade-in slide-in-from-bottom duration-500"
                      style={{ animationDelay: item.delay }}
                    >
                      <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 text-green-400 flex-shrink-0 animate-pulse" />
                      <span>
                        <strong>{item.text.split(" ")[0]}</strong> {item.text.split(" ").slice(1).join(" ")}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Produto 3D com efeitos premium */}
              <div className="flex items-center justify-center mt-6 lg:mt-0 animate-in fade-in slide-in-from-right duration-1000 delay-300">
                <div className="relative group">
                  {/* Efeitos de luz 3D */}
                  <div className="absolute inset-0 bg-gradient-to-r from-red-600 to-yellow-500 rounded-full blur-3xl opacity-30 animate-pulse group-hover:opacity-50 transition-opacity duration-500"></div>
                  <div className="absolute inset-0 bg-gradient-to-br from-red-400/20 to-yellow-400/20 rounded-full blur-2xl animate-spin-slow"></div>

                  {/* Produto com efeito 3D */}
                  <div className="relative transform-gpu perspective-1000 group-hover:rotate-y-12 transition-transform duration-700">
                    <Image
                      src="/images/fire-power-product.png"
                      width="300"
                      height="300"
                      alt="Fire Power - Estimulante Sexual Masculino"
                      className="relative drop-shadow-2xl w-[250px] h-[250px] sm:w-[300px] sm:h-[300px] lg:w-[400px] lg:h-[400px] group-hover:scale-110 transition-transform duration-500 filter brightness-110"
                    />

                    {/* Badge "NOVO" com animação */}
                    <div className="absolute -top-2 -right-2 sm:-top-4 sm:-right-4 bg-gradient-to-r from-red-600 to-red-700 text-white px-2 py-1 sm:px-3 sm:py-1 rounded-full text-xs sm:text-sm font-bold animate-bounce shadow-lg shadow-red-600/50">
                      NOVO!
                    </div>

                    {/* Partículas flutuantes */}
                    <div className="absolute inset-0 pointer-events-none">
                      {[...Array(6)].map((_, i) => (
                        <div
                          key={i}
                          className="absolute w-1 h-1 bg-yellow-400 rounded-full animate-float opacity-60"
                          style={{
                            left: `${20 + i * 15}%`,
                            top: `${30 + (i % 3) * 20}%`,
                            animationDelay: `${i * 0.5}s`,
                            animationDuration: `${3 + i * 0.5}s`,
                          }}
                        ></div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section id="benefits" className="w-full py-12 md:py-24 lg:py-32 bg-black/80 backdrop-blur-sm">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12 animate-in fade-in slide-in-from-bottom duration-700">
              <div className="space-y-2">
                <div className="flex items-center justify-center gap-3 mb-4">
                  <Zap className="h-8 w-8 text-yellow-400 animate-pulse" />
                  <Badge className="bg-yellow-500 text-black font-bold text-lg px-4 py-2 shadow-lg shadow-yellow-500/30 hover:scale-105 transition-transform duration-300">
                    BENEFÍCIOS EXCLUSIVOS
                  </Badge>
                </div>
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl text-white drop-shadow-2xl">
                  POR QUE FIRE POWER É O Nº 1 DO BRASIL?
                </h2>
                <p className="max-w-[900px] text-gray-300 md:text-xl/relaxed">
                  Descubra como nossa fórmula exclusiva pode transformar sua vida sexual e sua confiança.
                </p>
              </div>
            </div>
            <div className="mx-auto grid items-start gap-8 sm:max-w-4xl sm:grid-cols-2 md:gap-12 lg:max-w-5xl lg:grid-cols-3">
              {[
                {
                  icon: Flame,
                  title: "Máxima Potência",
                  description: "Ereções mais firmes e duradouras como nunca antes.",
                  delay: "0ms",
                },
                {
                  icon: Clock,
                  title: "Ação Rápida",
                  description: "Sinta os efeitos em apenas 30 minutos após o uso.",
                  delay: "100ms",
                },
                {
                  icon: TrendingUp,
                  title: "Aumento do Desejo",
                  description: "Recupere a libido e o apetite sexual.",
                  delay: "200ms",
                },
                {
                  icon: Zap,
                  title: "Mais Energia",
                  description: "Tenha mais disposição para momentos íntimos prolongados.",
                  delay: "300ms",
                },
                {
                  icon: CheckCircle,
                  title: "Controle Total",
                  description: "Domine o momento e surpreenda na hora H.",
                  delay: "400ms",
                },
                {
                  icon: Users,
                  title: "Confiança Renovada",
                  description: "Sinta-se mais seguro e potente em qualquer situação.",
                  delay: "500ms",
                },
              ].map((benefit, index) => (
                <div
                  key={index}
                  className="grid gap-1 group animate-in fade-in slide-in-from-bottom duration-500"
                  style={{ animationDelay: benefit.delay }}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-gradient-to-r from-red-600 to-red-800 rounded-lg group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-red-600/30">
                      <benefit.icon className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="text-lg font-bold text-white group-hover:text-red-400 transition-colors duration-300">
                      {benefit.title}
                    </h3>
                  </div>
                  <p className="text-sm text-gray-300">{benefit.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Depoimentos Reais do WhatsApp */}
        <section id="testimonials" className="w-full py-12 md:py-24 lg:py-32 bg-black/90 backdrop-blur-sm">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12 animate-in fade-in slide-in-from-bottom duration-700">
              <div className="space-y-2">
                <div className="flex items-center justify-center gap-3 mb-4">
                  <MessageCircle className="h-8 w-8 text-green-400 animate-pulse" />
                  <Badge className="bg-green-600 text-white font-bold text-lg px-4 py-2 shadow-lg shadow-green-600/30 hover:scale-105 transition-transform duration-300">
                    CONVERSAS REAIS DO WHATSAPP
                  </Badge>
                </div>
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl text-white drop-shadow-2xl">
                  VEJA O QUE NOSSOS CLIENTES ESTÃO FALANDO
                </h2>
                <p className="max-w-[900px] text-gray-300 md:text-xl/relaxed">
                  <strong className="text-green-400">100% REAL:</strong> Conversas verdadeiras de homens que
                  transformaram suas vidas com Fire Power
                </p>
              </div>
            </div>

            {/* Depoimentos com Resultados Específicos */}
            <div className="grid gap-8 mb-12">
              <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
                <Card className="border-green-600/50 bg-green-900/10 backdrop-blur-sm hover:shadow-lg hover:shadow-green-500/20 transition-all duration-500 group hover:scale-105 animate-in fade-in slide-in-from-left duration-700">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <ThumbsUp className="h-6 w-6 text-green-400 group-hover:scale-110 transition-transform duration-300" />
                      <h3 className="text-xl font-bold text-green-400">RESULTADO INCRÍVEL!</h3>
                    </div>
                    <Image
                      src="/images/whatsapp_chat.png"
                      width="300"
                      height="600"
                      alt="Depoimento WhatsApp - Resultado incrível"
                      className="rounded-lg border border-green-600/50 mx-auto group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="mt-4 p-4 bg-green-900/20 rounded-lg border border-green-600/50 backdrop-blur-sm">
                      <p className="text-green-300 font-bold text-center">"Antes: 5 minutos | Agora: 20 minutos!"</p>
                      <p className="text-gray-300 text-sm text-center mt-2">
                        ⭐⭐⭐⭐⭐ "Muito bom mesmo" - Cliente real
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-green-600/50 bg-green-900/10 backdrop-blur-sm hover:shadow-lg hover:shadow-green-500/20 transition-all duration-500 group hover:scale-105 animate-in fade-in slide-in-from-right duration-700 delay-200">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <Users className="h-6 w-6 text-green-400 group-hover:scale-110 transition-transform duration-300" />
                      <h3 className="text-xl font-bold text-green-400">EFEITO IMEDIATO!</h3>
                    </div>
                    <Image
                      src="/images/whatsapp_chat_2.png"
                      width="300"
                      height="600"
                      alt="Depoimento WhatsApp - Efeito imediato"
                      className="rounded-lg border border-green-600/50 mx-auto group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="mt-4 p-4 bg-green-900/20 rounded-lg border border-green-600/50 backdrop-blur-sm">
                      <p className="text-green-300 font-bold text-center">"Efeito na primeira hora!"</p>
                      <p className="text-gray-300 text-sm text-center mt-2">
                        "Pênis mais duro que o normal" - Cliente real
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Carrossel de Entregas Reais */}
            <div className="text-center mb-8 animate-in fade-in slide-in-from-bottom duration-700 delay-400">
              <h3 className="text-2xl font-bold text-white mb-4">
                <span className="text-green-400">ENTREGAS REAIS</span> - CLIENTES RECEBENDO EM CASA
              </h3>
              <p className="text-gray-300 mb-6">Veja as fotos que nossos clientes enviam quando recebem o Fire Power</p>
              <p className="text-sm text-green-400 mb-4 animate-pulse">
                👆 Clique nas imagens para ver em tamanho maior
              </p>
            </div>

            <div className="relative max-w-6xl mx-auto">
              {/* Carrossel */}
              <div className="overflow-hidden rounded-lg">
                <div
                  className="flex transition-transform duration-300 ease-in-out"
                  style={{ transform: `translateX(-${currentSlide * 100}%)` }}
                >
                  {Array.from({ length: Math.ceil(testimonialImages.length / 3) }).map((_, slideIndex) => (
                    <div key={slideIndex} className="w-full flex-shrink-0">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 px-4">
                        {testimonialImages.slice(slideIndex * 3, slideIndex * 3 + 3).map((image, index) => (
                          <div
                            key={index}
                            className="relative group cursor-pointer"
                            onClick={() => openImageModal(image)}
                          >
                            <Image
                              src={image.src || "/placeholder.svg"}
                              width="300"
                              height="500"
                              alt={image.alt}
                              className="rounded-lg border border-green-600/50 hover:scale-105 transition-transform duration-300 w-full h-auto shadow-lg shadow-green-600/20"
                            />
                            <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg flex items-center justify-center">
                              <div className="bg-black/80 px-3 py-2 rounded-lg backdrop-blur-sm">
                                <p className="text-white text-sm font-bold text-center">Clique para ampliar</p>
                              </div>
                            </div>
                            <div className="absolute bottom-2 left-2 right-2 bg-black/80 rounded-lg p-2 backdrop-blur-sm">
                              <p className="text-white text-xs text-center font-medium">"{image.message}"</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Botões de navegação */}
              <Button
                variant="outline"
                size="icon"
                className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/80 border-green-600/50 text-green-400 hover:bg-green-900/20 backdrop-blur-sm hover:scale-110 transition-all duration-300"
                onClick={prevSlide}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/80 border-green-600/50 text-green-400 hover:bg-green-900/20 backdrop-blur-sm hover:scale-110 transition-all duration-300"
                onClick={nextSlide}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>

              {/* Indicadores */}
              <div className="flex justify-center mt-6 space-x-2">
                {Array.from({ length: Math.ceil(testimonialImages.length / 3) }).map((_, index) => (
                  <button
                    key={index}
                    className={`w-3 h-3 rounded-full transition-all duration-300 hover:scale-125 ${index === currentSlide ? "bg-green-400 shadow-lg shadow-green-400/50" : "bg-gray-600"
                      }`}
                    onClick={() => {
                      setCurrentSlide(index)
                      trackButtonClick(`testimonial_indicator_${index}`, `Indicador Depoimento ${index + 1}`)
                    }}
                  />
                ))}
              </div>
            </div>

            <div className="text-center mt-12 animate-in fade-in slide-in-from-bottom duration-700 delay-600">
              <div className="bg-green-900/20 border border-green-600/50 rounded-lg p-6 max-w-4xl mx-auto backdrop-blur-sm hover:scale-105 transition-transform duration-300">
                <h4 className="text-xl font-bold text-green-400 mb-3">
                  🔥 ESTES SÃO APENAS ALGUNS DOS MILHARES DE DEPOIMENTOS!
                </h4>
                <p className="text-gray-300 mb-4">
                  Todos os dias recebemos dezenas de mensagens de homens agradecendo pelos resultados incríveis do Fire
                  Power.
                </p>
                <p className="text-white font-bold">
                  <span className="text-red-400">VOCÊ SERÁ O PRÓXIMO?</span> Junte-se aos milhares de homens
                  satisfeitos!
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Seção Pague ao Receber */}
        <section id="pay-on-delivery" className="w-full py-12 bg-gradient-to-r from-green-900/20 to-black border-y border-green-800/50 backdrop-blur-sm">
          <div className="container px-4 md:px-6">
            <div className="text-center space-y-6 animate-in fade-in slide-in-from-bottom duration-700">
              <div className="inline-flex items-center gap-3 bg-green-900/30 border border-green-600/50 rounded-full px-6 py-3 backdrop-blur-sm hover:scale-105 transition-transform duration-300 shadow-lg shadow-green-600/20">
                <CheckCircle className="h-8 w-8 text-green-400 animate-pulse" />
                <span className="text-2xl font-bold text-white">ZERO RISCO PARA VOCÊ!</span>
              </div>
              <h3 className="text-3xl font-bold text-white mb-4 drop-shadow-lg">
                <span className="text-green-400">PAGUE APENAS</span> QUANDO RECEBER EM CASA
              </h3>
              <p className="text-xl text-gray-300 max-w-3xl mx-auto">
                Não precisa pagar nada agora! Você só paga quando o Fire Power chegar na sua casa.
                <strong className="text-green-400"> Sem cartão de crédito, sem PIX antecipado, sem risco!</strong>
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mt-8">
                {[
                  { step: "1", title: "PEÇA AGORA", description: "Faça seu pedido sem pagar nada", delay: "0ms" },
                  { step: "2", title: "RECEBA EM CASA", description: "Entrega discreta e rápida", delay: "200ms" },
                  {
                    step: "3",
                    title: "PAGUE AO RECEBER",
                    description: "Só pague quando estiver com o produto",
                    delay: "400ms",
                  },
                ].map((item, index) => (
                  <div
                    key={index}
                    className="text-center group animate-in fade-in slide-in-from-bottom duration-500"
                    style={{ animationDelay: item.delay }}
                  >
                    <div className="w-16 h-16 bg-gradient-to-r from-green-600 to-green-700 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-green-600/30">
                      <span className="text-2xl font-bold text-white">{item.step}</span>
                    </div>
                    <h4 className="font-bold text-white mb-2 group-hover:text-green-400 transition-colors duration-300">
                      {item.title}
                    </h4>
                    <p className="text-gray-300 text-sm">{item.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Offer Section */}
        <section
          id="offer"
          ref={offerSectionRef} // Adicionar ref aqui
          className="w-full py-12 md:py-24 lg:py-32 bg-gradient-to-r from-red-800/90 to-black backdrop-blur-sm"
        >
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center animate-in fade-in slide-in-from-bottom duration-700">
              <div className="space-y-2">
                <Badge className="bg-yellow-500 text-black font-bold text-lg px-4 py-2 shadow-lg shadow-yellow-500/30 hover:scale-105 transition-transform duration-300 animate-pulse">
                  🔥 OFERTA ESPECIAL - ÚLTIMAS 48 HORAS!
                </Badge>
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl text-white drop-shadow-2xl">
                  ESCOLHA SEU PACOTE E TRANSFORME SUA VIDA
                </h2>
                <p className="max-w-[900px] text-gray-300 md:text-xl/relaxed">
                  Quanto mais você compra, mais você economiza e mais resultados você garante
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl items-start gap-6 py-12 lg:grid-cols-3 lg:gap-12">
              {/* Card 1: Teste Agora */}
              <Card className="border-gray-600/50 bg-black/50 backdrop-blur-sm hover:scale-105 transition-all duration-500 animate-in fade-in slide-in-from-left duration-700">
                <CardContent className="p-6">
                  <div className="text-center space-y-4">
                    <h3 className="text-xl font-bold text-white">TESTE AGORA</h3>
                    <div className="text-3xl font-bold text-white">
                      <span className="line-through text-gray-500 text-lg">R$ 197</span>
                      <br />
                      R$ 97<span className="text-sm font-normal">/frasco</span>
                    </div>
                    <ul className="space-y-2 text-sm text-gray-300 text-left">
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-400 flex-shrink-0" />1 Frasco (30 cápsulas)
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-400 flex-shrink-0" />7 dias de garantia
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-400 flex-shrink-0" />
                        Entrega discreta
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-yellow-400 flex-shrink-0" />
                        <strong className="text-yellow-400">PAGUE AO RECEBER</strong>
                      </li>
                    </ul>
                    <Button
                      variant="outline"
                      className="w-full border-red-400 text-red-400 hover:bg-red-900/20 hover:scale-105 transition-all duration-300"
                      onClick={() => trackPurchaseClick("teste", "buy_teste", "QUERO TESTAR")}
                    >
                      QUERO TESTAR
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Card 2: Potência Total (Mais Vendido) */}
              <Card className="border-yellow-400/70 bg-gradient-to-b from-yellow-500/20 via-black/70 to-black/70 backdrop-blur-sm scale-105 shadow-2xl shadow-yellow-500/30 relative animate-in fade-in slide-in-from-bottom duration-700 delay-200">
                <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-yellow-400 to-yellow-600 text-black font-bold px-4 py-1 rounded-full shadow-lg shadow-yellow-500/40 animate-pulse">
                  MAIS VENDIDO
                </Badge>
                <CardContent className="p-6 pt-10">
                  <div className="text-center space-y-4">
                    <h3 className="text-xl font-bold text-yellow-400">POTÊNCIA TOTAL</h3>
                    <div className="text-3xl font-bold text-white">
                      <span className="line-through text-gray-500 text-lg">R$ 591</span>
                      <br />
                      R$ 197<span className="text-sm font-normal"> (R$ 65/frasco)</span>
                    </div>
                    <ul className="space-y-2 text-sm text-gray-300 text-left">
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-400 flex-shrink-0" />
                        <strong className="text-white">3 Frascos (90 cápsulas)</strong>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-400 flex-shrink-0" />
                        <strong className="text-yellow-400">66% DE DESCONTO</strong>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-400 flex-shrink-0" />7 dias de garantia
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-400 flex-shrink-0" />
                        Entrega discreta
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-yellow-400 flex-shrink-0" />
                        <strong className="text-yellow-400">PAGUE AO RECEBER</strong>
                      </li>
                    </ul>
                  

                      <Button className="w-full bg-gradient-to-r from-red-600 via-red-700 to-red-800 hover:from-red-700 hover:via-red-800 hover:to-red-900 font-bold text-lg py-6 shadow-lg border-2 border-yellow-400/70 text-yellow-100 animate-pulse hover:scale-105 transition-all duration-300" onClick={() => trackPurchaseClick("potencia_total", "buy_potencia_total", "QUERO POTÊNCIA TOTAL")}>
                      🔥 QUERO POTÊNCIA TOTAL! 🔥
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Card 3: Tratamento VIP */}
              <Card className="border-gray-600/50 bg-black/50 backdrop-blur-sm hover:scale-105 transition-all duration-500 animate-in fade-in slide-in-from-right duration-700 delay-400">
                <CardContent className="p-6">
                  <div className="text-center space-y-4">
                    <h3 className="text-xl font-bold text-white">TRATAMENTO VIP</h3>
                    <div className="text-3xl font-bold text-white">
                      <span className="line-through text-gray-500 text-lg">R$ 985</span>
                      <br />
                      R$ 297<span className="text-sm font-normal"> (R$ 59/frasco)</span>
                    </div>
                    <ul className="space-y-2 text-sm text-gray-300 text-left">
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-400 flex-shrink-0" />
                        <strong className="text-white">5 Frascos (150 cápsulas)</strong>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-400 flex-shrink-0" />
                        <strong className="text-yellow-400">70% DE DESCONTO</strong>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-400 flex-shrink-0" />7 dias de garantia
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-400 flex-shrink-0" />
                        Entrega discreta
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-yellow-400 flex-shrink-0" />
                        <strong className="text-yellow-400">PAGUE AO RECEBER</strong>
                      </li>
                    </ul>
                    <Button
                      variant="outline"
                      className="w-full border-red-400 text-red-400 hover:bg-red-900/20 hover:scale-105 transition-all duration-300"
                      onClick={() => trackPurchaseClick("vip", "buy_vip", "QUERO SER VIP")}
                    >
                      QUERO SER VIP
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="w-full py-6 px-4 md:px-6 border-t border-red-800/50 bg-black/90 backdrop-blur-md">
          <div className="container flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-xs text-gray-400">
              &copy; 2024 Fire Power. Todos os direitos reservados. Produto destinado a maiores de 18 anos.
            </p>
            <div className="flex gap-4">
              <Link
                href="/termos"
                className="text-xs text-gray-400 hover:text-red-400 transition-colors"
                onClick={() => trackButtonClick("footer_termos", "Termos de Uso")}
              >
                Termos de Uso
              </Link>
              <Link
                href="/privacidade"
                className="text-xs text-gray-400 hover:text-red-400 transition-colors"
                onClick={() => trackButtonClick("footer_privacidade", "Política de Privacidade")}
              >
                Política de Privacidade
              </Link>
            </div>
          </div>
        </footer>
      </main>

      {/* Modal de Inatividade */}
      <Dialog open={showInactivityModal} onOpenChange={(open) => !open && handleInactivityModalClose()}>
        <DialogContent className="bg-black/95 border-red-600/50 text-white max-w-md backdrop-blur-md">
          <DialogHeader>
            <DialogTitle className="text-red-400 text-xl font-bold">🔥 ESPERA AÍ!</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-gray-300">
              Você está prestes a perder a <strong className="text-red-400">MAIOR OPORTUNIDADE</strong> da sua vida!
            </p>

            {/* Contador de Oferta Limitada */}
            <div className="bg-gradient-to-r from-red-600/30 to-red-800/30 border border-red-500/50 rounded-lg p-4 backdrop-blur-sm">
              <div className="text-center">
                <h4 className="text-yellow-400 font-bold text-lg mb-2 animate-pulse">⏰ OFERTA EXPIRA EM:</h4>
                <div className="text-4xl font-bold text-white font-mono tracking-wider mb-2">
                  {String(inactivityOfferTime.minutes).padStart(2, "0")}:
                  {String(inactivityOfferTime.seconds).padStart(2, "0")}
                </div>
                <p className="text-red-300 text-sm animate-pulse">Esta janela se fechará automaticamente!</p>
              </div>
            </div>

            <div className="bg-red-900/30 border border-red-600 rounded-lg p-4">
              <h3 className="font-bold text-yellow-400 mb-2">OFERTA ESPECIAL PARA VOCÊ:</h3>
              <p className="text-sm text-gray-300 mb-3">
                Leve 3 frascos por apenas <span className="text-2xl font-bold text-white">R$ 147</span>
                <span className="line-through text-gray-500 ml-2">R$ 291</span>
              </p>
              <p className="text-xs text-red-300">💥 50% DE DESCONTO - APENAS AGORA!</p>
            </div>
            <div className="flex gap-2">
              <Button
                className="flex-1 bg-red-600 hover:bg-red-700 hover:scale-105 transition-all duration-300"
                onClick={() => setShowInactivityModal(false)}
              >
                QUERO A OFERTA!
              </Button>
              <Button
                variant="outline"
                className="border-gray-600 text-gray-400 hover:scale-105 transition-all duration-300"
                onClick={() => {
                  setShowInactivityModal(false)
                  setShowFeedbackModal(true)
                }}
              >
                Não, obrigado
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>



      {/* Modal de Feedback */}
      <Dialog open={showFeedbackModal} onOpenChange={handleFeedbackModalClose}>
        <DialogContent className="bg-black/95 border-red-600/50 text-white max-w-lg backdrop-blur-md">
          <DialogHeader>
            <DialogTitle className="text-red-400 text-xl font-bold">Antes de sair...</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleFeedbackSubmit} className="space-y-4">
            <p className="text-gray-300">Nos ajude a melhorar! Preencha os dados abaixo e receba ofertas exclusivas:</p>

            <div className="grid grid-cols-2 gap-4">
              <Input
                placeholder="Nome completo"
                value={feedbackData.name}
                onChange={(e) => setFeedbackData({ ...feedbackData, name: e.target.value })}
                className="bg-gray-900/50 border-gray-600/50 text-white backdrop-blur-sm"
                required
              />
              <Input
                placeholder="WhatsApp"
                value={feedbackData.phone}
                onChange={(e) => setFeedbackData({ ...feedbackData, phone: e.target.value })}
                className="bg-gray-900/50 border-gray-600/50 text-white backdrop-blur-sm"
                required
              />
            </div>

            <div className="grid grid-cols-3 gap-2">
              <Input
                placeholder="CEP"
                value={feedbackData.cep}
                onChange={(e) => setFeedbackData({ ...feedbackData, cep: e.target.value })}
                className="bg-gray-900/50 border-gray-600/50 text-white backdrop-blur-sm"
                required
              />
              <Input
                placeholder="Cidade"
                value={feedbackData.city}
                onChange={(e) => setFeedbackData({ ...feedbackData, city: e.target.value })}
                className="bg-gray-900/50 border-gray-600/50 text-white backdrop-blur-sm"
                required
              />
              <Select onValueChange={(value) => setFeedbackData({ ...feedbackData, state: value })}>
                <SelectTrigger className="bg-gray-900/50 border-gray-600/50 text-white backdrop-blur-sm">
                  <SelectValue placeholder="Estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="AC">Acre (AC)</SelectItem>
                  <SelectItem value="AL">Alagoas (AL)</SelectItem>
                  <SelectItem value="AP">Amapá (AP)</SelectItem>
                  <SelectItem value="AM">Amazonas (AM)</SelectItem>
                  <SelectItem value="BA">Bahia (BA)</SelectItem>
                  <SelectItem value="CE">Ceará (CE)</SelectItem>
                  <SelectItem value="DF">Distrito Federal (DF)</SelectItem>
                  <SelectItem value="ES">Espírito Santo (ES)</SelectItem>
                  <SelectItem value="GO">Goiás (GO)</SelectItem>
                  <SelectItem value="MA">Maranhão (MA)</SelectItem>
                  <SelectItem value="MT">Mato Grosso (MT)</SelectItem>
                  <SelectItem value="MS">Mato Grosso do Sul (MS)</SelectItem>
                  <SelectItem value="MG">Minas Gerais (MG)</SelectItem>
                  <SelectItem value="PA">Pará (PA)</SelectItem>
                  <SelectItem value="PB">Paraíba (PB)</SelectItem>
                  <SelectItem value="PR">Paraná (PR)</SelectItem>
                  <SelectItem value="PE">Pernambuco (PE)</SelectItem>
                  <SelectItem value="PI">Piauí (PI)</SelectItem>
                  <SelectItem value="RJ">Rio de Janeiro (RJ)</SelectItem>
                  <SelectItem value="RN">Rio Grande do Norte (RN)</SelectItem>
                  <SelectItem value="RS">Rio Grande do Sul (RS)</SelectItem>
                  <SelectItem value="RO">Rondônia (RO)</SelectItem>
                  <SelectItem value="RR">Roraima (RR)</SelectItem>
                  <SelectItem value="SC">Santa Catarina (SC)</SelectItem>
                  <SelectItem value="SP">São Paulo (SP)</SelectItem>
                  <SelectItem value="SE">Sergipe (SE)</SelectItem>
                  <SelectItem value="TO">Tocantins (TO)</SelectItem>
                </SelectContent>

              </Select>
            </div>

            <Textarea
              placeholder="Por que está saindo sem comprar?"
              value={feedbackData.reason}
              onChange={(e) => setFeedbackData({ ...feedbackData, reason: e.target.value })}
              className="bg-gray-900/50 border-gray-600/50 text-white backdrop-blur-sm"
              required
            />

            <div className="space-y-3">
              <div className="flex items-start space-x-2">
                <Checkbox
                  id="lgpd"
                  checked={feedbackData.lgpdConsent}
                  onCheckedChange={(checked) => setFeedbackData({ ...feedbackData, lgpdConsent: checked as boolean })}
                  className="border-gray-600/50"
                />
                <label htmlFor="lgpd" className="text-xs text-gray-300 leading-tight">
                  <strong>CONSENTIMENTO LGPD:</strong> Autorizo o armazenamento dos meus dados pessoais em conformidade
                  com a Lei Geral de Proteção de Dados (LGPD). Os dados serão utilizados exclusivamente para contato
                  comercial e não serão compartilhados com terceiros.
                </label>
              </div>

              <div className="flex items-start space-x-2">
                <Checkbox
                  id="whatsapp"
                  checked={feedbackData.whatsappConsent}
                  onCheckedChange={(checked) =>
                    setFeedbackData({ ...feedbackData, whatsappConsent: checked as boolean })
                  }
                  className="border-gray-600/50"
                />
                <label htmlFor="whatsapp" className="text-xs text-gray-300 leading-tight">
                  <strong>COMUNICAÇÃO VIA WHATSAPP:</strong> Autorizo o recebimento de ofertas, promoções e comunicações
                  comerciais via WhatsApp no número informado.
                </label>
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                type="submit"
                className="flex-1 bg-red-600 hover:bg-red-700 hover:scale-105 transition-all duration-300"
                disabled={!feedbackData.lgpdConsent}
              >
                ENVIAR FEEDBACK
              </Button>
              <Button
                type="button"
                variant="outline"
                className="border-gray-600/50 text-gray-400 hover:scale-105 transition-all duration-300"
                onClick={() => setShowFeedbackModal(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal de Imagem do Depoimento */}
      
     <Dialog open={showImageModal} onOpenChange={(open) => !open && closeImageModal()}>
  <DialogContent className="max-w-3xl max-h-[90vh] bg-black/90 border-green-500 text-white backdrop-blur-md p-2 overflow-y-auto">
    <DialogHeader>
      <DialogTitle>
        <span className="sr-only">Imagem do Depoimento</span>
      </DialogTitle>
    </DialogHeader>

    <button
      className="absolute top-3 right-3 p-1 rounded-full hover:bg-gray-700/50 transition-colors z-10"
      onClick={closeImageModal}
    >
      <X className="h-6 w-6 text-gray-300" />
    </button>

    {selectedImage && (
      <div className="flex flex-col items-center mt-4">
        <Image
          src={selectedImage.src}
          width={600}
          height={1000}
          alt={selectedImage.alt}
          className="rounded-lg max-w-full h-auto object-contain"
        />
        <p className="mt-3 text-center text-sm text-gray-300 bg-black/70 px-3 py-1 rounded-md">
          "{selectedImage.message}"
        </p>
      </div>
    )}
  </DialogContent>
</Dialog>


      <style jsx global>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
        
        .animate-spin-slow {
          animation: spin-slow 20s linear infinite;
        }
        
        .perspective-1000 {
          perspective: 1000px;
        }
        
        .rotate-y-12 {
          transform: rotateY(12deg);
        }
        
        .transform-gpu {
          transform: translate3d(0, 0, 0);
        }
      `}</style>
    </div>
  )
}

