import React, { Suspense } from 'react'
import Dashboard from '../components/Dashboard'

function DashboardPage() {
  return (
    <div>
     <Suspense fallback={<p>Loading..</p>}>
      <Dashboard />
    </Suspense>
    </div>
  )
}

export default DashboardPage