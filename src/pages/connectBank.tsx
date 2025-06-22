// src/pages/ConnectBank.tsx
import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../contexts/Authcontext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, Building2, CreditCard, Link as LinkIcon } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface FinancialInstitution {
  id: string;
  name: string;
  logo: string;
  type: 'bank' | 'credit';
  description?: string;
}

const DUMMY_BANKS: FinancialInstitution[] = [
  {
    id: 'icici',
    name: 'ICICI',
    logo: '/bank-logos/icici.png',
    type: 'bank',
    description: 'ICICI Bank - Personal and Business Banking'
  },
  {
    id: 'sbi',
    name: 'SBI',
    logo: '/bank-logos/sbi.png',
    type: 'bank',
    description: 'SBI - Banking, Credit Cards, Loans'
  },
  {
    id: 'hdfc',
    name: 'HDFC',
    logo: '/bank-logos/hdfc.png',
    type: 'bank',
    description: 'HDFC - Personal and Commercial Banking'
  },
  {
    id: 'citi',
    name: 'Citibank',
    logo: '/bank-logos/citi.png',
    type: 'bank',
    description: 'Citibank - Global Banking Services'
  }
];

const DUMMY_CREDIT_CARDS: FinancialInstitution[] = [
  {
    id: 'axis-credit',
    name: 'Axis Neo',
    logo: '/bank-logos/axis.jpg',
    type: 'credit',
    description: 'Axis Freedom, Sapphire, and Business Cards'
  },
  {
    id: 'amex',
    name: 'American Express',
    logo: '/bank-logos/amex.jpg',
    type: 'credit',
    description: 'American Express Personal and Business Cards'
  },
  {
    id: 'mastercard',
    name: 'MasterCard',
    logo: '/bank-logos/mastercard.jpg',
    type: 'credit',
    description: 'MasterCard Credit Cards and Banking'
  },
  {
    id: 'visa',
    name: 'VISA',
    logo: '/bank-logos/visa.jpg',
    type: 'credit',
    description: 'VISA Credit Cards and Banking'
  }
];

const ConnectBank = () => {
  const { user, setBankConnection } = useContext(AuthContext);
  const navigate = useNavigate();
  const { toast } = useToast();
  const [selectedType, setSelectedType] = useState<'bank' | 'credit'>('bank');
  const [selectedInstitution, setSelectedInstitution] = useState<FinancialInstitution | null>(null);

  const handleInstitutionSelect = (institution: FinancialInstitution) => {
    setSelectedInstitution(institution);
  };

  const handleConnect = () => {
    if (!selectedInstitution) {
      toast({
        title: "Please select an institution",
        description: "Choose a bank or credit card to connect",
        variant: "destructive",
      });
      return;
    }

    setBankConnection(true);
    toast({
      title: "Successfully connected!",
      description: `Your ${selectedInstitution.name} account has been connected.`,
    });
    navigate("/dashboard", { state: { bankId: selectedInstitution.id } });
  };

  const handleSkip = () => {
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl text-center">Bank Connections</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center mb-6">
              <p className="text-gray-600">
                Connect your bank account to get started with automatic transaction tracking
              </p>
            </div>

            <div className="mb-8">
              <h2 className="text-lg font-semibold mb-4">How It Works</h2>
              <div className="space-y-3 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <div className="bg-blue-100 rounded-full w-6 h-6 flex items-center justify-center text-blue-600">1</div>
                  <p>Connect your bank accounts securely</p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="bg-blue-100 rounded-full w-6 h-6 flex items-center justify-center text-blue-600">2</div>
                  <p>We'll import your transactions automatically</p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="bg-blue-100 rounded-full w-6 h-6 flex items-center justify-center text-blue-600">3</div>
                  <p>Keep track of your finances in one place</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <Card 
                className={`cursor-pointer transition-all ${selectedType === 'bank' ? 'ring-2 ring-blue-500' : ''}`}
                onClick={() => setSelectedType('bank')}
              >
                <CardContent className="p-4 flex flex-col items-center">
                  <Building2 className="h-8 w-8 text-blue-500 mb-2" />
                  <h3 className="font-medium">Bank Accounts</h3>
                </CardContent>
              </Card>

              <Card 
                className={`cursor-pointer transition-all ${selectedType === 'credit' ? 'ring-2 ring-blue-500' : ''}`}
                onClick={() => setSelectedType('credit')}
              >
                <CardContent className="p-4 flex flex-col items-center">
                  <CreditCard className="h-8 w-8 text-blue-500 mb-2" />
                  <h3 className="font-medium">Credit Cards</h3>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              {(selectedType === 'bank' ? DUMMY_BANKS : DUMMY_CREDIT_CARDS).map((institution) => (
                <Card 
                  key={institution.id}
                  className={`cursor-pointer transition-all ${
                    selectedInstitution?.id === institution.id ? 'ring-2 ring-blue-500' : ''
                  }`}
                  onClick={() => handleInstitutionSelect(institution)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                        <img 
                          src={institution.logo} 
                          alt={institution.name} 
                          className="w-8 h-8 object-contain"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = selectedType === 'bank' ? '/bank-logos/default-bank.png' : '/bank-logos/default-card.png';
                          }}
                        />
                      </div>
                      <div>
                        <h3 className="font-medium">{institution.name}</h3>
                        <p className="text-sm text-gray-500">{institution.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="flex flex-col gap-4">
              <Button 
                onClick={handleConnect}
                className="w-full"
                disabled={!selectedInstitution}
              >
                <LinkIcon className="mr-2 h-4 w-4" />
                Connect Bank Account
              </Button>

              <Button 
                variant="ghost" 
                onClick={handleSkip}
                className="text-gray-600 hover:text-gray-900"
              >
                Back to Dashboard <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ConnectBank;