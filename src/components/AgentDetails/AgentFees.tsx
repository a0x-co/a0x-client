// React
import { useState, useEffect } from "react";

// http client
import axios from "axios";

interface AgentFeesProps {
  poolAddress: string;
}

export const AgentFees = ({ poolAddress }: AgentFeesProps) => {
  const [fees, setFees] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchFees = async () => {
      try {
        const response = await axios.get(`/api/agent-fees`, {
          params: { poolAddress },
        });
        setFees(response.data.userRewards);
      } catch (error) {
        console.error("Error fetching fees:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (poolAddress) {
      fetchFees();
    }
  }, [poolAddress]);

  if (isLoading) {
    return (
      <div className="flex items-center space-x-2">
        <div className="animate-spin h-4 w-4 border-2 border-white/50 rounded-full border-t-transparent" />
        <p className="text-white/50 text-sm font-mono">Loading...</p>
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-3 mx-3">
      <span className="text-white/70 font-medium text-sm">Total Fees:</span>
      <div className="flex items-center space-x-2">
        <div className="w-2 h-2 rounded-full bg-green-400" />
        <span className="text-white font-mono font-medium">
          {fees !== null ? `$${fees?.toFixed(4)}` : "$0.00"}
        </span>
      </div>
    </div>
  );
};
