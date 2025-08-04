"use client";

import { connect } from "echarts";
import { Suspense } from "react";
import { BroadcastSessionDetailPage } from "~/features/report/components/pages";

connect("report");

export default function Page() {
  return (
    <Suspense>
      <BroadcastSessionDetailPage />
    </Suspense>
  );
}
