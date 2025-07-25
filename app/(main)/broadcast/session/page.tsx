"use client";

import { connect } from "echarts";
import { BackButton, PrintButton } from "~/common/ui";
import { BroadcastSessionDetailPage } from "~/features/report/components/pages";

connect("report");

export default function Page() {
  return (
    <>
      <div className="flex items-center max-w-4xl mx-auto justify-between w-full py-2 print:!hidden">
        <BackButton />
        <PrintButton />
      </div>
      <BroadcastSessionDetailPage />
    </>
  );
}
