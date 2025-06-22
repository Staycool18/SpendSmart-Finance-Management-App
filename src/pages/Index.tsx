
import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import { BarChart4, CreditCard, ShieldCheck, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

const Index = () => {
  const navigate = useNavigate();
  const featuresRef = useRef<HTMLDivElement>(null);
  
  const scrollToFeatures = () => {
    featuresRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const features = [
    {
      icon: <CreditCard className="h-6 w-6 text-blue-500" />,
      title: "Account Integration",
      description: "Connect your bank accounts securely with Plaid for automatic transaction tracking.",
    },
    {
      icon: <BarChart4 className="h-6 w-6 text-blue-500" />,
      title: "Visual Analytics",
      description: "See your financial data come to life with beautiful, interactive charts and graphs.",
    },
    {
      icon: <TrendingUp className="h-6 w-6 text-blue-500" />,
      title: "Expense Forecasting",
      description: "Predict future expenses using advanced machine learning algorithms.",
    },
    {
      icon: <ShieldCheck className="h-6 w-6 text-blue-500" />,
      title: "Bank-Level Security",
      description: "Your financial data is protected with the highest level of encryption and security.",
    },
  ];

  // Intersection Observer for animations
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("animate-fade-in");
            entry.target.classList.remove("opacity-0");
          }
        });
      },
      { threshold: 0.1 }
    );

    const animatedElements = document.querySelectorAll(".animate-on-scroll");
    animatedElements.forEach((el) => observer.observe(el));

    return () => {
      animatedElements.forEach((el) => observer.unobserve(el));
    };
  }, []);

  return (
    <>
      <Navbar />
      <main className="flex min-h-screen flex-col">
        {/* Hero Section */}
        <section className="relative pt-28 pb-20 lg:pt-36 lg:pb-28 px-6">
          <div className="absolute inset-0 -z-10 background-gradient overflow-hidden">
            <div className="absolute -top-[40%] -right-[40%] w-[80%] h-[80%] rounded-full bg-blue-400/20 blur-[120px]" />
            <div className="absolute -bottom-[20%] -left-[20%] w-[50%] h-[50%] rounded-full bg-purple-400/20 blur-[100px]" />
          </div>
          
          <div className="max-w-7xl mx-auto">
            <div className="text-center max-w-3xl mx-auto relative">
              <div className="mb-6 inline-block">
                <span className="inline-flex animate-fade-in items-center rounded-full bg-blue-50 px-3 py-1 text-sm font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">
                  Introducing SpendSmart
                </span>
              </div>
              <h1 className="text-5xl md:text-6xl font-bold text-gray-900 tracking-tight mb-6 animate-fade-in">
                Take Control of Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-blue-400">Financial Future</span>
              </h1>
              <p className="text-lg md:text-xl text-gray-600 mb-8 animate-fade-in opacity-90">
                Connect your accounts, visualize your spending patterns, and make smarter financial decisions with powerful analytics.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in">
                <Button 
                  onClick={() => navigate("/register")}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-8 py-6 rounded-lg"
                  size="lg"
                >
                  Get Started
                </Button>
                <Button 
                  variant="outline" 
                  onClick={scrollToFeatures}
                  className="border-gray-300 text-gray-700 font-medium px-8 py-6 rounded-lg"
                  size="lg"
                >
                  Learn More
                </Button>
              </div>
            </div>

            <div className="mt-16 sm:mt-20 animate-on-scroll opacity-0 transition-all duration-700 delay-300">
              <div className="relative mx-auto max-w-5xl rounded-xl bg-gray-900/5 p-3 shadow-2xl shadow-gray-500/10">
                <div className="glass rounded-lg overflow-hidden">
                  <img
                    src="https://placehold.co/1200x700/e6f4ff/0072f5?text=Dashboard+Preview"
                    alt="Dashboard Preview"
                    className="w-full"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section ref={featuresRef} className="py-20 px-6 bg-gradient-to-b from-white to-gray-50">
          <div className="max-w-7xl mx-auto">
            <div className="text-center max-w-3xl mx-auto mb-16 animate-on-scroll opacity-0 transition-all duration-700">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Powerful Features</h2>
              <p className="text-lg text-gray-600">
                Everything you need to manage your finances in one place.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {features.map((feature, index) => (
                <div 
                  key={index}
                  className={cn(
                    "p-6 rounded-xl transition-all duration-300 animate-on-scroll opacity-0",
                    "hover:shadow-md hover:-translate-y-1 bg-white border border-gray-100"
                  )}
                  style={{ transitionDelay: `${index * 100}ms` }}
                >
                  <div className="h-12 w-12 rounded-full bg-blue-50 flex items-center justify-center mb-4">
                    {feature.icon}
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 px-6 bg-gray-900 text-white">
          <div className="max-w-7xl mx-auto text-center animate-on-scroll opacity-0 transition-all duration-700">
            <h2 className="text-3xl font-bold mb-6">Ready to Transform Your Finances?</h2>
            <p className="text-lg text-gray-300 mb-8 max-w-2xl mx-auto">
              Join thousands of users who have taken control of their financial future with SpendSmart.
            </p>
            <Button 
              onClick={() => navigate("/register")}
              className="bg-blue-600 hover:bg-blue-500 text-white font-medium px-8 py-6"
              size="lg"
            >
              Create Free Account
            </Button>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-12 px-6 bg-gray-950 text-gray-400">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="mb-6 md:mb-0">
                <span className="text-2xl font-semibold text-white">SpendSmart</span>
                <p className="mt-2 text-sm">Your finances, simplified.</p>
              </div>
              <div className="flex space-x-6">
                <a href="#" className="hover:text-white transition-colors">Terms</a>
                <a href="#" className="hover:text-white transition-colors">Privacy</a>
                <a href="#" className="hover:text-white transition-colors">Contact</a>
              </div>
            </div>
            <div className="mt-8 pt-8 border-t border-gray-800 text-sm text-center">
              &copy; {new Date().getFullYear()} SpendSmart. All rights reserved.
            </div>
          </div>
        </footer>
      </main>
    </>
  );
};

export default Index;
