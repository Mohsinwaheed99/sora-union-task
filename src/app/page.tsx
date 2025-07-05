import React, { Suspense } from 'react'
import Home from './components/Home'

function HomePage() {
  return (
    <div>
      <Suspense fallback={<p>Loading..</p>}>
        <Home />
      </Suspense>
    </div>
  )
}

export default HomePage