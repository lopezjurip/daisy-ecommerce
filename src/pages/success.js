import React, { useEffect } from "react"
import { SiteContext, ContextProviderComponent } from "../context/mainContext"

function SuccessWithContext(props) {
  return (
    <ContextProviderComponent>
      <SiteContext.Consumer>
        {context => (
          <Success {...props} context={context} />
        )}
      </SiteContext.Consumer>
    </ContextProviderComponent>
  )
}

const Success = ({ context }) => {
  const { clearCart } = context

  useEffect(function onMount() {
    clearCart();
  }, []);

  return (
    <div>
      <h3>Thanks! Your order is processing.</h3>
      <p>
        We are going to send you an email when the payment is confirmed.
      </p>
    </div>
  );
}

export default SuccessWithContext
