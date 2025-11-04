"use client"

import { RemindersPage } from "@/components/reminders/reminders-page"
import { MainLayout } from "@/components/layout/main-layout"

export default function Page() {
  return (
    <MainLayout>
      <RemindersPage />
    </MainLayout>
  )
}

