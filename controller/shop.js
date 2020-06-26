const fs = require("fs");
const path = require("path");
const stripe = require('stripe')('sk_test_51Gy1yeHYlbUdlqyZWquLAvh6CGYXFMFl3Q4wXlWeQaeXTygFRpHSWT1avQovHik75tVT04q5DZtQ0NpB1XRx26QM008VY1DcUN')

const PDFDocument = require("pdfkit");

const Product = require("../models/product");
const Order = require("../models/order");

const ITEMS_PER_PAGE = 2;

exports.getProducts = (req, res, next) => {
  // Product.findAll()
  // Product.fetchAll()'
  const page = +req.query.page || 1;
  let totalItems;

  Product.find()
    .countDocuments()
    .then((numProducts) => {
      totalItems = numProducts;
      return Product.find()
        .skip((page - 1) * ITEMS_PER_PAGE)
        .limit(ITEMS_PER_PAGE);
    })
    .then((products) => {
      res.render("shop/product-list", {
        prods: products,
        pageTitle: "Products",
        path: "/products",
        currentPage: page,
        hasNextPage: ITEMS_PER_PAGE * page < totalItems,
        hasPreviousPage: page > 1,
        nextPage: page + 1,
        previousPage: page - 1,
        lastPage: Math.ceil(totalItems / ITEMS_PER_PAGE),
      });
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
  // Product.fetchAll()
  // .then(([rows, fieldData]) => {
  //     res.render('shop/product-list',{
  //         prods: rows,
  //         pageTitle: 'All Product',
  //         path:'/products'
  //     });
  // })
  // .catch(err => console.log(err));
};

exports.getProduct = (req, res, next) => {
  const prodId = req.params.productId;

  /*method when using sql*/
  //     Product.findAll({where: {id: prodId}})
  //     .then(product => {
  //         res.render('shop/product-detail',{
  //             product: product[0],
  //             pageTitle: product[0].title,
  //             path: '/products'
  //     });
  // })
  // .catch(err => console.log(err))
  // Product.findByPk(prodId)

  //mongoose have a build-in findbyid method that function the same way as we use in mongodb
  Product.findById(prodId)
    .then((product) => {
      res.render("shop/product-detail", {
        product: product,
        pageTitle: product.title,
        path: "/products",
      });
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.getIndex = (req, res, next) => {
  const page = +req.query.page || 1;
  let totalItems;

  Product.find()
    .countDocuments()
    .then((numProducts) => {
      totalItems = numProducts;
      return Product.find()
        .skip((page - 1) * ITEMS_PER_PAGE)
        .limit(ITEMS_PER_PAGE);
    })
    .then((products) => {
      res.render("shop/index", {
        prods: products,
        pageTitle: "Shop",
        path: "/",
        currentPage: page,
        hasNextPage: ITEMS_PER_PAGE * page < totalItems,
        hasPreviousPage: page > 1,
        nextPage: page + 1,
        previousPage: page - 1,
        lastPage: Math.ceil(totalItems / ITEMS_PER_PAGE),
      });
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });

  // Product.findAll()
  // Product.fetchAll()

  // Product.fetchAll()
  // .then(([rows, fieldData]) => {

  // })
  // .catch(err => console.log(err));
};

exports.getCart = (req, res, next) => {
  req.user

    /**getCart is the method we create for mongodb */
    // .getCart()

    .populate("cart.items.productId")
    .execPopulate()
    .then((user) => {
      // return cart
      // .getProducts()
      // .then(products => {
      const products = user.cart.items;
      res.render("shop/cart", {
        path: "/cart",
        pageTitle: "Your Cart",
        products: products,
      });
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};
// .catch(err => console.log(err))
// Cart.getCart(cart => {
//     Product.fetchAll(products =>{
//         const cartProducts = [];
//         for (product of products){
//         const cartProductData = cart.products.find(
//             prod => prod.id === product.id
//             );
//         if(cartProductData){
//                 cartProducts.push({productData : product, qty: cartProductData.qty})
//         }
//         }
//         res.render('shop/cart',{
//             path:'/cart',
//             pageTitle: 'Your Cart',
//             products : cartProducts
//             });
// })
// });

exports.postCart = (req, res, next) => {
  const prodId = req.body.productId;
  Product.findById(prodId)
    .then((product) => {
      return req.user.addToCart(product);
    })
    .then((result) => {
      console.log(result);
      res.redirect("/cart");
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });

  /***sequelize pratice on adding cart post action */
  // let fatchedCart;
  // let newQuantity = 1;
  // req.user
  // .getCart()
  // .then(cart =>{
  //     fatchedCart = cart
  //     return cart.getProducts( {where: { id: prodId}});
  // })
  // .then(products => {
  //     let product
  //     if(products.length > 0){
  //         product = products[0]
  //     }

  //     if(product){
  //         const oldQuantity = product.cartItem.quantity;
  //         newQuantity = oldQuantity + 1;
  //         return product;
  //     }
  //     return Product.findByPk(prodId)
  // })
  // .then(product => {
  //     return fatchedCart.addProduct(product,{
  //         through: { quantity : newQuantity}
  //     });
  // })
  // .then(() => {
  //     res.redirect('/cart')
  // })
  // .catch(err => {console.log(err)})

  /**local data add to cart practice */
  // const prodId = req.body.productId;
  // Product.findById(prodId, (product) =>{
  //     Cart.addProduct(prodId, product.price);
  // });
  // res.redirect('/cart');
};

exports.postCartDeleteProduct = (req, res, next) => {
  const prodId = req.body.productId;
  req.user
    /**this is the old sequelize getcart method from cart.js */
    // .getCart()
    //.then(cart => {
    //   return cart.getProducts({ where: { id: prodId } });
    // })
    // .then(products => {
    //   const product = products[0];
    //   return product.cartItem.destroy();
    // })

    /**this deleteItemFromCart is a method for mongodb deleting */
    // .deleteItemFromCart(prodId)

    .removeFromCart(prodId)
    .then((result) => {
      res.redirect("/cart");
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.getCheckout = (req, res, next) => {
  let products;
  let total = 0
  req.user
    .populate("cart.items.productId")
    .execPopulate()
    .then((user) => {
      products = user.cart.items;
      total = 0
      products.forEach( p=> {
        total += p.quantity * p.productId.price
      });

      return stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: products.map(p => {
          return {
            name: p.productId.title,
            description: p.productId.description,
            amount : Math.round(p.productId.price.toFixed(2) * 100),
            currency : 'usd',
            quantity: p.quantity
          };
        }),
        success_url: req.protocol + '://' + req.get('host') + '/checkout/success',
        cancel_url: req.protocol + '://' + req.get('host') + '/checkout/cancel'
      });
    }).then(session => {
      res.render("shop/checkout", {
        path: "/checkout",
        pageTitle: "Checkout",
        products: products,
        totalSum: total,
        sessionId: session.id
      });
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.getCheckoutSuccess = (req, res, next) => {
  req.user
    .populate("cart.items.productId")
    .execPopulate()
    .then((user) => {
      console.log(user.cart.items);
      const products = user.cart.items.map((i) => {
        return { quantity: i.quantity, product: { ...i.productId._doc } };
      });
      const order = new Order({
        user: {
          email: req.user.email,
          userId: req.user,
        },
        products: products,
      });
      return order.save();
    })
    .then((result) => {
      return req.user.clearCart();
    })
    .then(() => {
      res.redirect("/orders");
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
  };

exports.postOrder = (req, res, next) => {
  // let fetchedCart;
  req.user
    .populate("cart.items.productId")
    .execPopulate()
    .then((user) => {
      console.log(user.cart.items);
      const products = user.cart.items.map((i) => {
        return { quantity: i.quantity, product: { ...i.productId._doc } };
      });
      const order = new Order({
        user: {
          email: req.user.email,
          userId: req.user,
        },
        products: products,
      });
      return order.save();
    })
    .then((result) => {
      return req.user.clearCart();
    })
    .then(() => {
      res.redirect("/orders");
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
  };

  /**using cart.js for sequelize pracrice */
  // .getCart()
  // .then(cart => {
  //     fetchedCart = cart;
  //     return cart.getProducts();
  // })
  // .then(products => {
  //     return req.user
  //     .createOrder()
  //     .then(order =>{
  //         order.addProduct(products.map(product =>{
  //             product.orderItem ={ quantity: product.cartItem.quantity}
  //             return product;
  //         })
  //         );
  //     })
  //     .catch(err=>{console.log(err)});
  // }).then(result =>{
  //     return fetchedCart.setProducts(null);
  // })

exports.getOrders = (req, res, next) => {
  //   req.user

  /**this includes is for sequelize */
  // .getOrders({include: ['products']})

  // .getOrders()
  // .then((orders) => {
  //   res.render("shop/orders", {
  //     path: "/orders",
  //     pageTitle: "Your Orders",
  //     orders: orders,
  //   });
  // })
  Order.find({ "user.userId": req.user._id })
    .then((orders) => {
      res.render("shop/orders", {
        path: "/orders",
        pageTitle: "Your Orders",
        orders: orders,
      });
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

// exports.getCheckout = (req,res,next)=>{
//     res.render('shop/checkout',{
//         path:'/checkout',
//         pageTitle: 'Checkout'
//     });
// }

exports.getInvoice = (req, res, next) => {
  const orderId = req.params.orderId;
  Order.findById(orderId)
    .then((order) => {
      if (!order) {
        return next(new Error("No order found!"));
      }
      if (order.user.userId.toString() !== req.user._id.toString()) {
        return next(new Error("Unanuthorized"));
      }
      const invoiceName = "invoice-" + orderId + ".pdf";
      const invoicePath = path.join("data", "invoices", invoiceName);

      const pdfDoc = new PDFDocument();
      res.setHeader("Content-type", "application/pdf");
      res.setHeader(
        "Content-Disposition",
        'inline; filename="' + invoiceName + '"'
      );
      pdfDoc.pipe(fs.createWriteStream(invoicePath));
      pdfDoc.pipe(res);

      pdfDoc.fontSize(26).text("Invoice", {
        underline: true,
      });
      pdfDoc.text("-----------------------------");
      let totalPrice = 0;
      order.products.forEach((prod) => {
        totalPrice += prod.quantity * prod.product.price;
        pdfDoc
          .fontSize(14)
          .text(
            prod.product.title +
              " - " +
              prod.quantity +
              " X " +
              "$" +
              prod.product.price
          );
      });
      pdfDoc.text("-----------------------------");
      pdfDoc.fontSize(20).text("Total Price: $" + totalPrice);

      pdfDoc.end();
      // fs.readFile(invoicePath, (err, data) => {
      //   if (err) {
      //     return next(err);
      //   }
      //   res.setHeader("Content-type", "application/pdf");
      //   res.setHeader(
      //     "Content-Disposition",
      //     'inline; filename="' + invoiceName + '"'
      //   );
      //   res.send(data);
      // });
      // const file = fs.createReadStream(invoicePath);

      //   file.pipe(res)
    })
    .catch((err) => next(err));
};
