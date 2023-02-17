import React from 'react';
import Index from 'payload/dist/admin'
import Banner from 'payload/dist/admin/components/elements/Banner'

const PayloadAdmin = () => {
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, []);

  if (!mounted) return null;

  return (
    <div className="wrap">
      <Index />
      <Banner />
    </div>
  )
}

export default PayloadAdmin;