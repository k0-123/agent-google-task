import React from 'react'
import { AdminClient } from '@/components/admin/AdminClient'

export default async function AdminMatchPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return <AdminClient matchId={id} />
}
