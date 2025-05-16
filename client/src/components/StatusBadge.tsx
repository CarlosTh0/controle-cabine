import { PreBoxStatus } from "../contexts/TripContext";

interface StatusBadgeProps {
  status: PreBoxStatus;
  value?: string;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status, value }) => {
  const getStatusClass = (status: PreBoxStatus): string => {
    switch(status) {
      case "LIVRE":
        return "bg-green-100 text-green-800";
      case "VIAGEM":
        return "bg-yellow-100 text-yellow-800";
      case "BLOQUEADO":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClass(status)}`}>
      {value ? value : status}
    </span>
  );
};

export default StatusBadge;
