import FredIntegration from '@/components/FredIntegration';
import { TriggerEconomicData } from '@/components/TriggerEconomicData';

const FredDashboard = () => {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">FRED Economic Data</h1>
        <TriggerEconomicData />
      </div>
      <FredIntegration />
    </div>
  );
};

export default FredDashboard;