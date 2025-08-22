'use client';

import { useScreenSize } from "@/lib/screenSize"
import MobileView from "@/components/Mobile/Dashboard/OverviewCard"
import TabletView from "@/components/Tablet/Dashboard/OverviewCard"
import DesktopView from "@/components/Desktop/Dashboard/OverviewCard"

export default function OverviewCardWrapper() {
  const screen = useScreenSize()

  if (screen === "mobile") return <MobileView />
  if (screen === "tablet") return <TabletView />
  return <DesktopView />
}
