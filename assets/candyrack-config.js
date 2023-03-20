CANDYRACK_DOCUMENT_LISTENER = true;
CANDYRACK_CUSTOM_BUTTON_SELECTORS = [".atc-trigger"];

document.addEventListener("click", (e) => {
    if(e.target.classList.contains("cart-drawer__checkout")) {
        e.preventDefault()
        const discount = localStorage.getItem("candyrack-discount-code")
       const isCRAdded = JSON.parse(localStorage.getItem('candyrack-associated-products')) || {}
       if(Object.entries(isCRAdded).length) {
        setTimeout(() => {
            window.location.href = `/checkout?discount=${discount || ''}`
        }, 500)
       }

        
    }
})

const updateDiscount = () => {
  const items = document.querySelectorAll(".cart-drawer__item")
  const {variantId, discount} = JSON.parse(localStorage.getItem("candyrack-discounted-product")) || {}
  const {cart_discount_note} = JSON.parse(localStorage.getItem('candyrack-translations')) || {}
  if(items.length && discount && variantId) {
      items.forEach(i => {
          const href = i.querySelector("a")?.href
          
          const hasCustomNote = document.querySelector(".custom-discount")
          const isCRAdded = JSON.parse(localStorage.getItem('candyrack-associated-products')) || {}
          if(href && href.includes(variantId) && !hasCustomNote && Object.entries(isCRAdded).length) {
            const a = i.querySelector(".cart-drawer__item-content a")
            const message = cart_discount_note || 'Discount AMOUNT will be applied at checkout.'
            a.insertAdjacentHTML(
             'afterend',
             `<div class='custom-discount' style="font-size: 12px;">${message.replace('AMOUNT', discount)}</div>`)
          }
      })
  }
}



setInterval(() => {
  const cart = document.querySelector("[data-section-id='cart-drawer']")

  if(cart.getAttribute("aria-hidden") === "false") {
    const notes = document.querySelectorAll('[candyrack-cart-info]')
    if (notes.length) {
       notes.forEach(n => n.remove())
   }
    updateDiscount();
  }
}, 100)

document.addEventListener("candyrack-offer-removed", (e) => {
    const discount = e?.detail?.offer?.discount_code
console.log(discount)
    if(discount) {
        localStorage.setItem("candyrack-discount-code", "")
        localStorage.removeItem("candyrack-discounted-product")
    }
})

