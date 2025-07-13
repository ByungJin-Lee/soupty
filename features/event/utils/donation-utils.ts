import { DonationType } from "~/types";

export const getAmountColor = (amount: number) => {
  if (amount >= 10000)
    return "bg-gradient-to-r from-yellow-400 to-orange-500 text-white"; // 1만개 이상
  if (amount >= 1000)
    return "bg-gradient-to-r from-yellow-300 to-orange-400 text-orange-900"; // 1천개 이상
  if (amount >= 100)
    return "bg-gradient-to-r from-yellow-200 to-orange-300 text-orange-800"; // 100개 이상
  return "bg-gradient-to-r from-yellow-100 to-orange-200 text-orange-700"; // 100개 미만
};

export const getDonationTypeIcon = (type: DonationType) => {
  switch (type) {
    case DonationType.Balloon:
      return "🎈";
    case DonationType.ADBalloon:
      return "📺";
    case DonationType.VODBalloon:
      return "📹";
    default:
      return "💝";
  }
};
