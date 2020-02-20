import React, { useState } from "react"
import { FaLongArrowAltLeft } from "react-icons/fa"
import { Link } from "gatsby"
import uuid from "uuid/v4"

import { SiteContext, ContextProviderComponent } from "../context/mainContext"
import { DENOMINATION } from "../../providers/inventoryProvider"
import Image from "../components/Image"

function CheckoutWithContext(props) {
  return (
    <ContextProviderComponent>
      <SiteContext.Consumer>
        {context => (
          <Checkout {...props} context={context} />
        )}
      </SiteContext.Consumer>
    </ContextProviderComponent>
  )
}

const calculateShipping = () => {
  return 0
}

const Input = ({ onChange, value, name, placeholder }) => (
  <input
    onChange={onChange}
    value={value}
    className="mt-2 text-sm shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
    type="text"
    placeholder={placeholder}
    name={name}
  />
)

const Checkout = ({ context }) => {
  const [errorMessage, setErrorMessage] = useState(null)
  const [orderCompleted, setOrderCompleted] = useState(false)
  const [input, setInput] = useState({
    name: "Patricio",
    email: "patricio.juri@consensys.net",
    street: "49 Bogart",
    city: "Brooklyn",
    postal_code: "212121",
    state: "NY",
  })
  const [daisyInvoice, daisyInvoiceSet] = useState(null);
  const [error, setError] = useState(null); // daisy

  const onChange = e => {
    setErrorMessage(null)
    setInput({ ...input, [e.target.name]: e.target.value })
  }

  const handleSubmit = async event => {
    event.preventDefault()
    const { name, email, street, city, postal_code, state } = input
    const { total, cart, clearCart } = context

    // Validate input
    if (!street || !city || !postal_code || !state) {
      setErrorMessage("Please fill in the form!")
      return
    }

    try {
      const data = await fetch("http://localhost:3333/checkout/daisy/", {
        method:"post",
        body: JSON.stringify({ input, cart }),
        headers: {
          'Content-Type': 'application/json'
        }
      }).then(r => {
        if (r.ok) {
          return r.json()
        } else {
          throw new Error("Bad request error", r);
        }
      });
      daisyInvoiceSet(data);
      window.location = data["shareURL"];
    } catch (err) {
      console.error(err);
      daisyInvoiceSet(null);
      setErrorMessage(err.message);
    }

    if (error) {
      setErrorMessage(error.message)
      return
    }

    // setOrderCompleted(true)
    // clearCart()
  }

  const { numberOfItemsInCart, cart, total } = context
  const cartEmpty = numberOfItemsInCart === Number(0)

  if (orderCompleted) {
    return (
      <div>
        <h3>Thanks! Your order has been successfully processed.</h3>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center pb-10">
      <div
        className="
            flex flex-col w-full
            c_large:w-c_large
          "
      >
        <div className="pt-10 pb-8">
          <h1 className="text-5xl font-light">Checkout</h1>
          <Link to="/cart">
            <div className="cursor-pointer flex">
              <FaLongArrowAltLeft className="mr-2 text-gray-600 mt-1" />
              <p className="text-gray-600 text-sm">Edit Cart</p>
            </div>
          </Link>
        </div>

        {cartEmpty ? (
          <h3>No items in cart.</h3>
        ) : (
          <div className="flex flex-col">
            <div className="">
              {cart.map((item, index) => {
                return (
                  <div className="border-b py-10" key={index}>
                    <div className="flex items-center">
                      <Image
                        className="w-32 m-0"
                        src={item.image}
                        alt={item.name}
                      />
                      <p className="m-0 pl-10 text-gray-600 text-sm">
                        {item.name}
                      </p>
                      <div className="flex flex-1 justify-end">
                        <p className="m-0 pl-10 text-gray-900 tracking-tighter font-semibold">
                          {DENOMINATION + item.price}
                        </p>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
            <div className="flex flex-1 flex-col md:flex-row">
              <div className="flex flex-1 pt-8 flex-col">
                <div className="mt-4 border-t pt-10">
                  <form onSubmit={handleSubmit}>
                    {errorMessage ? <span>{errorMessage}</span> : ""}
                    <Input
                      onChange={onChange}
                      value={input.name}
                      name="name"
                      placeholder="Full name"
                    />
                    {/* <CardElement className="mt-2 shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" /> */}
                    <Input
                      onChange={onChange}
                      value={input.email}
                      name="email"
                      placeholder="Email"
                    />
                    <Input
                      onChange={onChange}
                      value={input.street}
                      name="street"
                      placeholder="Street"
                    />
                    <Input
                      onChange={onChange}
                      value={input.city}
                      name="city"
                      placeholder="City"
                    />
                    <Input
                      onChange={onChange}
                      value={input.state}
                      name="state"
                      placeholder="State / province"
                    />
                    <Input
                      onChange={onChange}
                      value={input.postal_code}
                      name="postal_code"
                      placeholder="Postal Code"
                    />
                    <button
                      type="submit"
                      disabled={false}
                      onClick={handleSubmit}
                      className="hidden md:block bg-secondary hover:bg-black text-white font-bold py-2 px-4 mt-4 rounded focus:outline-none focus:shadow-outline"
                      type="button"
                    >
                      Pay with Daisy
                    </button>
                  </form>
                </div>
              </div>
              <div className="md:pt-20">
                <div className="ml-4 pl-2 flex flex-1 justify-end pt-2 md:pt-8 pr-4">
                  <p className="text-sm pr-10">Subtotal</p>
                  <p className="tracking-tighter w-38 flex justify-end">
                    {DENOMINATION + total}
                  </p>
                </div>
                <div className="ml-4 pl-2 flex flex-1 justify-end pr-4">
                  <p className="text-sm pr-10">Shipping</p>
                  <p className="tracking-tighter w-38 flex justify-end">
                    FREE SHIPPING
                  </p>
                </div>
                <div className="md:ml-4 pl-2 flex flex-1 justify-end bg-gray-200 pr-4 pt-6">
                  <p className="text-sm pr-10">Total</p>
                  <p className="font-semibold tracking-tighter w-38 flex justify-end">
                    {DENOMINATION + (total + calculateShipping())}
                  </p>
                </div>
                <button
                  type="submit"
                  disabled={false}
                  onClick={handleSubmit}
                  className="md:hidden bg-secondary hover:bg-black text-white font-bold py-2 px-4 mt-4 rounded focus:outline-none focus:shadow-outline"
                  type="button"
                >
                  Confirm order
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default CheckoutWithContext
