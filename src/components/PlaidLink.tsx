import { useState } from "react";
import { Button } from "@/components/ui/button";
import { CreditCard, Link as LinkIcon } from "lucide-react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { toast } from "sonner";
import { usePlaidLink } from "react-plaid-link";

interface PlaidLinkProps {
  onSuccess: (public_token: string, metadata: {
    institution: {
      name: string;
      institution_id: string;
    };
    accounts: Array<{
      id: string;
      name: string;
      type: string;
      subtype: string;
      mask: string;
    }>;
  }) => void;
  className?: string;
}

const PlaidLink = ({ onSuccess, className }: PlaidLinkProps) => {
  const [isLoading, setIsLoading] = useState(false);

  const { open, ready } = usePlaidLink({
    token: null, // This will be set by the backend
    onSuccess: (public_token, metadata) => {
      setIsLoading(false);
      onSuccess(public_token, metadata);
    },
    onExit: (err, metadata) => {
      setIsLoading(false);
      if (err) {
        toast.error("Failed to connect bank account");
      }
    },
    onEvent: (eventName, metadata) => {
      console.log("Plaid Link Event:", eventName, metadata);
    },
  });

  const handleClick = async () => {
    try {
      setIsLoading(true);
      
      // Get a link token from your backend
      const response = await fetch('/api/plaid/create_link_token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to create link token');
      }

      const { link_token } = await response.json();
      
      // Open Plaid Link with the token
      open();
    } catch (error) {
      console.error('Error creating link token:', error);
      toast.error("Failed to connect bank account");
      setIsLoading(false);
    }
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center">
          <LinkIcon className="mr-2 h-5 w-5 text-primary" />
          Connect Your Bank
        </CardTitle>
        <CardDescription>
          Link your bank accounts to track your finances automatically
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-blue-700 mb-2">How It Works</h3>
            <ul className="text-sm text-blue-600 space-y-1">
              <li className="flex items-start">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-700 text-xs mr-2">1</span>
                <span>Connect your bank accounts securely</span>
              </li>
              <li className="flex items-start">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-700 text-xs mr-2">2</span>
                <span>We'll import your transactions automatically</span>
              </li>
              <li className="flex items-start">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-700 text-xs mr-2">3</span>
                <span>Keep track of your finances in one place</span>
              </li>
            </ul>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 border rounded-lg text-center">
              <CreditCard className="h-8 w-8 mx-auto mb-2 text-primary opacity-80" />
              <p className="text-sm font-medium">Bank Accounts</p>
            </div>
            <div className="p-3 border rounded-lg text-center">
              <CreditCard className="h-8 w-8 mx-auto mb-2 text-primary opacity-80" />
              <p className="text-sm font-medium">Credit Cards</p>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button 
          onClick={handleClick} 
          className="w-full font-medium"
          disabled={isLoading || !ready}
        >
          {isLoading ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Connecting...
            </>
          ) : (
            <>Connect Bank Account</>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default PlaidLink;
