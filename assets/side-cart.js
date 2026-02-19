document.addEventListener("DOMContentLoaded", () => {
  fetchCart();
  const myOffcanvas = document.getElementById('side-cart');

  if (myOffcanvas) {
    // Fix for mobile: ensure side cart appears from bottom on mobile
    function fixMobileSideCart() {
      if (window.innerWidth <= 576) {
        // Override Bootstrap's inline transform style for mobile
        const observer = new MutationObserver(() => {
          if (myOffcanvas.classList.contains('show') || myOffcanvas.classList.contains('showing')) {
            myOffcanvas.style.transform = 'translateY(0)';
          } else if (myOffcanvas.classList.contains('hiding')) {
            myOffcanvas.style.transform = 'translateY(100%)';
          }
        });
        observer.observe(myOffcanvas, { attributes: true, attributeFilter: ['class', 'style'] });
      }
    }

    fixMobileSideCart();
    window.addEventListener('resize', fixMobileSideCart);

    myOffcanvas.addEventListener('hidden.bs.offcanvas', () => {
      $('.item-inside-cart').html('');
      $('.loading-cart').removeClass('d-none');
      $('.footer-side-cart').addClass('d-none');
    });

    myOffcanvas.addEventListener('show.bs.offcanvas', () => {
      $('.loading-cart').addClass('d-none');
      fetchCart();
    });
  }
});

function productCartAddToCart(elm, product_id) {
  const $elm = $(elm);

  // تحقق من وجود loader أو spinner
  if ($elm.find('.add-to-cart-progress').length > 0 && !$elm.find('.add-to-cart-progress').hasClass('d-none')) return;

  $('.loading-cart').removeClass('d-none');

  // إخفاء الأيقونة فقط وإظهار البروجرس
  $elm.find('svg').addClass('d-none');
  $elm.find('.add-to-cart-progress').removeClass('d-none');

  // إذا لم يوجد عنصر بروجرس، أضف spinner-border
  if ($elm.find('.add-to-cart-progress').length === 0) {
    $elm.prepend(`<div class="spinner-border" role="status"><span class="visually-hidden">Loading...</span></div>`);
  }

  addToCart(product_id, 1, () => {
    // إخفاء البروجرس وإظهار الأيقونة فقط
    $elm.find('.add-to-cart-progress, .spinner-border').addClass('d-none');
    $elm.find('svg').removeClass('d-none');
  });
}

function addToCart(product_id, quantity, onCompleted) {

  zid.cart
    .addProduct({
      product_id: product_id,
      quantity: quantity
    }, { showErrorNotification: true })
    .then(function (response) {

      if (response) {
        if (typeof window.loadToasterScriptIfNotLoaded === 'function') {
          window.loadToasterScriptIfNotLoaded(function () {
            toastr.success("تم إضافة المنتج إلى السلة بنجاح");
          });
        }

        const sideCart = document.getElementById('side-cart');
        if (sideCart) {
          new bootstrap.Offcanvas(sideCart).show();
        }

        // تحديث السلة والعداد
        setCartTotalAndBadge(response);
        fetchCart();

        if (typeof showCartPopupAfterAdd === 'function') {
          showCartPopupAfterAdd();
        }

        if (onCompleted) {
          onCompleted();
        }
      }
    })
    .catch(err => {
      if (onCompleted) onCompleted();
    });
}

function setCartTotalAndBadge(cart) {
  // التعامل مع البنيتين: القديمة (response.data.cart) والجديدة (response مباشرة) أو (response.data)
  const actualCart = cart?.data?.cart || cart?.data || cart;

  if (actualCart && actualCart.products_count !== undefined) {
    setCartBadge(actualCart.products_count);
  }

  const cartTotal = getCartTotal(actualCart);
  if (cartTotal) {
    setCartIconTotal(cartTotal);
  }
}

function setCartIconTotal(total) {
  $('.cart-price').html(total).removeClass('d-none');
  $('.cart-header-total').html(total).removeClass('d-none');
}

function setCartBadge(badge) {
  $('.cart-badge').html(badge);
  $('.cart-count').html(badge);
}

function displayActivePaymentSessionBar(cart) {
  if (cart && cart.is_reserved !== undefined) {
    $('.payment-session-bar').toggleClass('d-none', !cart.is_reserved);
  }
}

function getCartTotal(cart) {
  if (!cart) return null;

  if (cart.totals && Array.isArray(cart.totals)) {
    const totalItem = cart.totals.find(total => total && total.code === 'total');
    if (totalItem?.value_string) return totalItem.value_string;
  }

  return cart.total_string || cart.products_subtotal_string || (cart.products_subtotal ? `${cart.products_subtotal} ${cart.currency?.cart_currency?.symbol || ''}` : null);
}

function createCartProduct(product) {
  if (!product) return '';

  const priceString = product.price_string || (product.price ? `${product.price} ${product.currency || ''}` : '');
  const priceBeforeString = product.price_before_string || (product.price_before ? `${product.price_before} ${product.currency || ''}` : null);

  const oldPrice = priceBeforeString
    ? `<span class="price-discount"><span class="price">${priceString}</span><del class="old">${priceBeforeString}</del></span>`
    : `<span class="product-price">${priceString}</span>`;

  let imageUrl = '';
  if (product.images && product.images[0] && product.images[0].origin) {
    imageUrl = product.images[0].origin;
  } else if (product.thumbnail) {
    imageUrl = product.thumbnail;
  } else {
    // Fallback placeholder
    imageUrl = 'https://cdn.salla.sa/themes/asset/images/product-placeholder.png';
  }

  return `
    <li id="product_${product.id}">
      <div class="flex-product-box">
        <div class="img-product-box">
          <a href="${product.url}"><img src="${imageUrl}" alt="${product.name}"></a>
        </div>
        <div class="product-info-box">
          <button class="remove" onclick="return removeItem('${product.id}', this)" type="button">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" color="#000000" fill="none">
                <path d="M19.5 5.5L18.8803 15.5251C18.7219 18.0864 18.6428 19.3671 18.0008 20.2879C17.6833 20.7431 17.2747 21.1273 16.8007 21.416C15.8421 22 14.559 22 11.9927 22C9.42312 22 8.1383 22 7.17905 21.4149C6.7048 21.1257 6.296 20.7408 5.97868 20.2848C5.33688 19.3626 5.25945 18.0801 5.10461 15.5152L4.5 5.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"></path>
                <path d="M3 5.5H21M16.0557 5.5L15.3731 4.09173C14.9196 3.15626 14.6928 2.68852 14.3017 2.39681C14.215 2.3321 14.1231 2.27454 14.027 2.2247C13.5939 2 13.0741 2 12.0345 2C10.9688 2 10.436 2 9.99568 2.23412C9.8981 2.28601 9.80498 2.3459 9.71729 2.41317C9.32164 2.7167 9.10063 3.20155 8.65861 4.17126L8.05292 5.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"></path>
                <path d="M9.5 16.5L9.5 10.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"></path>
                <path d="M14.5 16.5L14.5 10.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"></path>
            </svg>
          </button>
          <h4 class="title-product-m">${product.name}</h4>
          <div class="price-old-new">
            <div class="price">${oldPrice}</div>
          </div>
          <div class="block-p-qty">
            <button class="button-plus btn-number" type="button" data-type="plus" data-field="quantity_${product.id}">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" color="#ffffff" fill="none">
                <path d="M12 4V20M20 12H4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
            </button>
            <input type="text" name="quantity_${product.id}" min="1" max="100" class="input-number" value="${product.quantity}" onchange="updateMiniCartProduct('${product.id}', this.value)" readonly>
            <button class="button-minus btn-number" data-type="minus" data-field="quantity_${product.id}" type="button">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" color="#ffffff" fill="none">
                  <path d="M20 12L4 12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </li>`;
}

function createCartProductBundle(item) {
  if (item.product_x && item.product_y) {
    return [...item.product_x, ...item.product_y].map(createCartProduct).join('');
  }
  if (item.bundle_products && Array.isArray(item.bundle_products)) {
    return item.bundle_products.map(createCartProduct).join('');
  }
  return '';
}

function fetchCart() {
  return new Promise((resolve, reject) => {
    $('.loading-cart').removeClass('d-none');
    $('.cart-rules').addClass('d-none');
    $('#additional-cart').html('');
    $('.side-cart-items').removeClass('d-none');
    const emptyText = $('#side-cart').data('empty') || 'السلة فارغة';

    zid.cart.get().then(response => {
      console.log("fetchCart response:", response);
      if (!response) {
        $('.loading-cart').addClass('d-none');
        reject(new Error("Empty response from API"));
        return;
      }

      // Handle structures: response.data.cart, response.data, and direct response
      const cart = response?.data?.cart || response?.data || response;

      if (!cart) {
        $('.loading-cart').addClass('d-none');
        reject(new Error("Cart data not found in response"));
        return;
      }

      let itemsHtml = '';
      let totalsHtml = '';

      // Update cart count
      const products_count = cart.products_count !== undefined ? cart.products_count : (cart.products ? cart.products.length : 0);
      $('.cart-count').html(products_count);
      $('.cart-badge').html(products_count);

      if (products_count > 0 && cart.products && Array.isArray(cart.products)) {
        cart.products.forEach(product => {
          if (!product) return;
          const html = product.bundle_name ? createCartProductBundle(product) : createCartProduct(product);
          if (html) itemsHtml += html;
        });

        // Calculate total discounts
        let discountTotal = 0;
        cart.products.forEach(product => {
          if (product && product.price_before && product.price_before > product.price) {
            const qty = parseInt(product.quantity || 1);
            if (!isNaN(qty)) {
              discountTotal += (product.price_before - product.price) * qty;
            }
          }
        });

        // Search for coupon or other discounts
        let couponDiscount = 0;
        if (cart.totals && Array.isArray(cart.totals)) {
          cart.totals.forEach(total => {
            if (!total || !total.value_string) return;
            const code = total.code || '';
            const title = (total.title || '').toLowerCase();
            if (
              code === 'coupon' ||
              code === 'discount' ||
              title.includes('خصم') ||
              title.includes('discount')
            ) {
              let cleanValue = parseFloat(total.value_string.replace(/[^\d.-]/g, ''));
              if (!isNaN(cleanValue)) {
                couponDiscount += Math.abs(cleanValue);
              }
            }
          });
        }

        let totalDiscounts = discountTotal + couponDiscount;

        // Build totals HTML
        if (cart.totals && Array.isArray(cart.totals)) {
          cart.totals.forEach(total => {
            if (!total) return;
            if (total.code === 'total' && totalDiscounts > 0) {
              let currency = cart.currency?.cart_currency?.symbol || cart.currency || '';
              totalsHtml += `
                <li id="discount_total" class="d-flex justify-content-between">
                  <span class="title">${rtl_mode ? 'إجمالي الخصومات' : 'Total Discounts'}</span>
                  <span class="number">-${totalDiscounts.toFixed(2)} ${currency}</span>
                </li>`;
            }

            totalsHtml += `
              <li id="${total.code || 'item'}" class="d-flex justify-content-between">
                <span class="title">${total.title || ''}</span>
                <span class="number">${total.value_string || ''}</span>
              </li>`;
          });
        } else {
          // Fallback if cart.totals is missing
          let currency = cart.currency?.cart_currency?.symbol || cart.currency || '';
          if (cart.products_subtotal !== undefined) {
            totalsHtml += `
              <li id="subtotal" class="d-flex justify-content-between">
                <span class="title">${rtl_mode ? 'المجموع الفرعي' : 'Subtotal'}</span>
                <span class="number">${cart.products_subtotal_string || (cart.products_subtotal + ' ' + currency)}</span>
              </li>`;
          }
          if (cart.total !== undefined || cart.total_string) {
            totalsHtml += `
              <li id="total" class="d-flex justify-content-between">
                <span class="title" style="font-weight: bold;">${rtl_mode ? 'الإجمالي' : 'Total'}</span>
                <span class="number" style="font-weight: bold;">${cart.total_string || (cart.total + ' ' + currency)}</span>
              </li>`;
          }
        }

        $('#cart-side-totals').html(totalsHtml);
        $('.side-cart-items').html(itemsHtml).removeClass('d-none');
        $('.footer-side-cart').removeClass('d-none');
      } else {
        // Empty cart
        $('#additional-cart').html(`
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="48" height="48" color="#000000" fill="none">
            <path d="M8 16H15.2632C19.7508 16 20.4333 13.1808 21.261 9.06908C21.4998 7.88311 21.6192 7.29013 21.3321 6.89507C21.045 6.5 20.4947 6.5 19.3941 6.5H6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
            <path d="M8 16L5.37873 3.51493C5.15615 2.62459 4.35618 2 3.43845 2H2.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
            <path d="M8.88 16H8.46857C7.10522 16 6 17.1513 6 18.5714C6 18.8081 6.1842 19 6.41143 19H17.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
            <circle cx="10.5" cy="20.5" r="1.5" stroke="currentColor" stroke-width="1.5" />
            <circle cx="17.5" cy="20.5" r="1.5" stroke="currentColor" stroke-width="1.5" />
          </svg>
          <p>${emptyText}</p>`);
        $('#cart-side-totals').html('');
        $('.side-cart-items').html('').addClass('d-none');
        $('.footer-side-cart').addClass('d-none');
        $('.cart-rules').addClass('d-none');
      }

      setCartTotalAndBadge(cart);

      // Handle free shipping rules
      const couponFreeShipping = cart.coupon && cart.coupon.free_shipping === true;

      if (products_count > 0 && cart.free_shipping_rule && cart.free_shipping_rule.subtotal_condition) {
        let status = cart.free_shipping_rule.subtotal_condition.status || '';
        const subtotal_condition = cart.free_shipping_rule.subtotal_condition || {};
        if (couponFreeShipping) status = 'applied';

        const percentage = Math.min(subtotal_condition.products_subtotal_percentage_from_min || 0, 100);
        const currency = cart.currency?.cart_currency?.symbol || '';
        const remain_value = subtotal_condition.remaining || subtotal_condition.remaining_string || '0';

        $('.cart-rules').removeClass('d-none');

        if (status !== 'applied') {
          $(".cart-rules").html(` 
            <div class="shipping-progress active progress">
                <span class="progress-bar" role="progressbar" style="width: ${percentage}%;" aria-valuenow="${percentage}" aria-valuemin="0" aria-valuemax="100"></span>
                <div class="progress-value" style="right: calc(${percentage}% - 12px);">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512"><path d="M259.3 17.8L194 150.2 47.9 171.5c-26.2 3.8-36.7 36.1-17.7 54.6l105.7 103-25 145.5c-4.5 26.3 23.2 46 46.4 33.7L288 439.6l130.7 68.7c23.2 12.2 50.9-7.4 46.4-33.7l-25-145.5 105.7-103c19-18.5 8.5-50.8-17.7-54.6L382 150.2 316.7 17.8c-11.7-23.6-45.6-23.9-57.4 0z"></path></svg>
                </div>
              </div>
            <div class="shipping-rule-message">
              ${rtl_mode ? "أضف مشتريات بقيمة" : "Add products worth"} <span class="value">${remain_value}</span> <span class="currency">${currency}</span>
              <span class="new-line">${rtl_mode ? "للحصول على شحن مجاني" : "to get Free Shipping"}</span>
            </div>
          `);
        } else {
          $(".cart-rules").html(`
            <div class="shipping-progress active progress">
                <span class="progress-bar" role="progressbar" style="width: ${percentage}%;" aria-valuenow="${percentage}" aria-valuemin="0" aria-valuemax="100"></span>
                <div class="progress-value" style="right: calc(${percentage}% - 12px);">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512"><path d="M259.3 17.8L194 150.2 47.9 171.5c-26.2 3.8-36.7 36.1-17.7 54.6l105.7 103-25 145.5c-4.5 26.3 23.2 46 46.4 33.7L288 439.6l130.7 68.7c23.2 12.2 50.9-7.4 46.4-33.7l-25-145.5 105.7-103c19-18.5 8.5-50.8-17.7-54.6L382 150.2 316.7 17.8c-11.7-23.6-45.6-23.9-57.4 0z"></path></svg>
                </div>
              </div>
            <div class="shipping-rule-message">${rtl_mode ? "حصلت على شحن مجاني" : "Shipping is Free Now"}</div>
          `);
        }
      } else if (couponFreeShipping) {
        $('.cart-rules').removeClass('d-none');
        $(".cart-rules").html(`
          <div class="shipping-progress active progress">
              <span class="progress-bar" role="progressbar" style="width: 100%;" aria-valuenow="100" aria-valuemin="0" aria-valuemax="100"></span>
              <div class="progress-value" style="right: calc(100% - 12px);">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512"><path d="M259.3 17.8L194 150.2 47.9 171.5c-26.2 3.8-36.7 36.1-17.7 54.6l105.7 103-25 145.5c-4.5 26.3 23.2 46 46.4 33.7L288 439.6l130.7 68.7c23.2 12.2 50.9-7.4 46.4-33.7l-25-145.5 105.7-103c19-18.5 8.5-50.8-17.7-54.6L382 150.2 316.7 17.8c-11.7-23.6-45.6-23.9-57.4 0z"></path></svg>
              </div>
            </div>
          <div class="shipping-rule-message">${rtl_mode ? "حصلت على شحن مجاني" : "Shipping is Free Now"}</div>
        `);
      } else {
        // Fallback
        let foundFreeShipping = false;
        if (cart?.discount_rules?.length) {
          let currency = cart.currency?.cart_currency?.symbol || '';
          cart.discount_rules.forEach(rule => {
            if (rule.code === "free_shipping" && rule.enabled && cart.fee_shipping_discount_rules) {
              foundFreeShipping = true;
              $('.cart-rules').removeClass('d-none');
              templateRules(rule, { data: { cart } }, currency, cart.fee_shipping_discount_rules);
            }
          });
        }
        if (!foundFreeShipping) $('.cart-rules').addClass('d-none');
      }

      displayActivePaymentSessionBar(cart);
      resolve(response);
    }).catch(error => {
      console.error("fetchCart error:", error);
      reject(error);
    }).finally(() => {
      $('.loading-cart').addClass('d-none');
    });
  });
}

const rtl_mode = $("body").hasClass("rtl");

function templateRules(rule, response, currency, fee_shipping_discount_rules) {
  if (!rule.conditions || !rule.conditions[0] || !rule.conditions[0].value) return;

  let min_value = rule.conditions[0].value[0];
  let remain_raw = min_value - response.data.cart.products_subtotal;

  let remain_value = remain_raw > 0
    ? (Number.isInteger(remain_raw) ? remain_raw : remain_raw.toFixed(2))
    : 0;

  let percentage = Math.ceil(
    fee_shipping_discount_rules.conditions_subtotal.status.code !== 'applied'
      ? 100 - ((remain_value * 100) / min_value)
      : 100
  );

  if (fee_shipping_discount_rules.conditions_subtotal.status.code !== 'applied') {
    $(".cart-rules").removeClass('d-none');
    $(".cart-rules").html(` 
      <div class="shipping-progress active progress">
          <span class="progress-bar" role="progressbar"
                style="width: ${percentage}%;" 
                aria-valuenow="${percentage}" aria-valuemin="0" aria-valuemax="100"></span>
          <div class="progress-value" style="right: calc(${percentage}% - 12px);">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512">
              <path d="M259.3 17.8L194 150.2 47.9 171.5c-26.2 3.8-36.7 36.1-17.7 54.6l105.7 103-25 145.5c-4.5 26.3 23.2 46 46.4 33.7L288 439.6l130.7 68.7c23.2 12.2 50.9-7.4 46.4-33.7l-25-145.5 105.7-103c19-18.5 8.5-50.8-17.7-54.6L382 150.2 316.7 17.8c-11.7-23.6-45.6-23.9-57.4 0z"></path>
            </svg>
          </div>
        </div>
      <div class="shipping-rule-message">
        ${rtl_mode ? "أضف مشتريات بقيمة" : "Add products worth"} 
        <span class="value">${remain_value}</span>
        <span class="currency">${currency}</span>
        <span class="new-line">
          ${rtl_mode ? "للحصول على شحن مجاني" : "to get Free Shipping"}
        </span>
      </div>
    `);
  } else {
    $(".cart-rules").html(`
      <div class="shipping-progress active progress">
          <span class="progress-bar" role="progressbar"
                style="width: ${percentage}%;" 
                aria-valuenow="${percentage}" aria-valuemin="0" aria-valuemax="100"></span>
          <div class="progress-value" style="right: calc(${percentage}% - 12px);">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512">
              <path d="M259.3 17.8L194 150.2 47.9 171.5c-26.2 3.8-36.7 36.1-17.7 54.6l105.7 103-25 145.5c-4.5 26.3 23.2 46 46.4 33.7L288 439.6l130.7 68.7c23.2 12.2 50.9-7.4 46.4-33.7l-25-145.5 105.7-103c19-18.5 8.5-50.8-17.7-54.6L382 150.2 316.7 17.8c-11.7-23.6-45.6-23.9-57.4 0z"></path>
            </svg>
          </div>
        </div>
      <div class="shipping-rule-message">                       
        ${rtl_mode ? "حصلت على شحن مجاني" : "Shipping is Free Now"}
      </div>
    `);
  }
}

function removeItem(product_id, item) {
  $(`.side-cart-items li#product_${product_id} .remove`).html('<i class="cart-spinner"></i>');

  zid.cart.removeProduct({ product_id: product_id }).then(response => {
    if (response) {
      fetchCart();
    }
  }).catch(err => {
    // إرجاع الزر لحالته الأصلية في حالة الخطأ
    $(`.side-cart-items li#product_${product_id} .remove`).html(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" color="#000000" fill="none">
        <path d="M19.5 5.5L18.8803 15.5251C18.7219 18.0864 18.6428 19.3671 18.0008 20.2879C17.6833 20.7431 17.2747 21.1273 16.8007 21.416C15.8421 22 14.559 22 11.9927 22C9.42312 22 8.1383 22 7.17905 21.4149C6.7048 21.1257 6.296 20.7408 5.97868 20.2848C5.33688 19.3626 5.25945 18.0801 5.10461 15.5152L4.5 5.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
        <path d="M3 5.5H21M16.0557 5.5L15.3731 4.09173C14.9196 3.15626 14.6928 2.68852 14.3017 2.39681C14.215 2.3321 14.1231 2.27454 14.027 2.2247C13.5939 2 13.0741 2 12.0345 2C10.9688 2 10.436 2 9.99568 2.23412C9.8981 2.28601 9.80498 2.3459 9.71729 2.41317C9.32164 2.7167 9.10063 3.20155 8.65861 4.17126L8.05292 5.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
        <path d="M9.5 16.5L9.5 10.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
        <path d="M14.5 16.5L14.5 10.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
      </svg>
    `);
  });
}

$(document).on('click', '.btn-number', function (e) {
  e.preventDefault();

  const type = $(this).attr('data-type');
  const fieldName = $(this).attr('data-field');
  const input = $(`input[name='${fieldName}']`);
  let currentVal = parseInt(input.val());
  const minVal = parseInt(input.attr('min')) || 1;
  const maxVal = parseInt(input.attr('max')) || 100;

  if (!isNaN(currentVal)) {
    let newVal = currentVal;

    if (type === 'plus' && currentVal < maxVal) {
      newVal = currentVal + 1;
    } else if (type === 'minus' && currentVal > minVal) {
      newVal = currentVal - 1;
    }

    if (newVal !== currentVal) {
      input.val(newVal);

      // استخراج product_id من fieldName
      const productId = fieldName.replace('quantity_', '');

      // تحديث المنتج مباشرة
      updateMiniCartProduct(productId, newVal);
    }
  }
});

function updateMiniCartProduct(productId, quantity) {
  const cartItems = $('.side-cart-items');
  cartItems.fadeTo('slow', 0.3);

  zid.cart.updateProduct({
    product_id: productId,
    quantity: parseInt(quantity)
  }).then(response => {
    cartItems.fadeTo('slow', 1);

    if (response) {
      fetchCart();
    }
  }).catch(err => {
    cartItems.fadeTo('slow', 1);

    if (typeof $.toast === 'function') {
      $.toast({
        text: err?.response?.data?.message || 'حدث خطأ أثناء تحديث الكمية',
        showHideTransition: 'fade',
        allowToastClose: true,
        hideAfter: 2000,
        position: 'top-right',
        textAlign: 'center',
        bgColor: '#d90000',
        textColor: '#fff',
      });
    } else if (typeof window.loadToasterScriptIfNotLoaded === 'function') {
      window.loadToasterScriptIfNotLoaded(function () {
        toastr.error(err?.response?.data?.message || 'حدث خطأ أثناء تحديث الكمية');
      });
    }
  });
}