import React, { useState } from "react";
import axios from "axios";
import logo from "./logo.jpeg";
import { compareTwoStrings } from "string-similarity";
import ProductComponent from './ProductList';

const api = axios.create({
  baseURL: "http://localhost:3001",
  withCredentials: true,
});

const App = () => {
  const [productName, setProductName] = useState("");
  const [bigBasketProducts, setBigBasketProducts] = useState([]);
  const [zeptoProducts, setZeptoProducts] = useState([]);
  const [blinkitProducts, setBlinkitProducts] = useState([]);
  const [instamartProducts, setInstamartProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedbigBasketProduct, setSelectedbigBasketProduct] = useState({})

  // Helper function to extract weights
  function extractWeights(string) {
    const regex = /(\d+)\s*(g|kg|ml|L|pcs|pieces|pc|pack)|(\d+)\s*x\s*(\d+)\s*g/g;
    const matches = [...string.matchAll(regex)];
    const weights = [];
    for (const match of matches) {
      if (match[1] !== undefined) {
        weights.push({ weight: parseInt(match[1]), unit: match[2] });
      } else {
        weights.push({
          weight: parseInt(match[3]) * parseInt(match[4]),
          unit: "g",
        });
      }
    }
    return weights;
  }

  // Helper function to find the lowest weight
  function findLowestWeight(product) {
    const weights = [...(product.children || []), { w: product.w }].flatMap(
      (item) => extractWeights(item.w + " " + item?.pack_desc)
    );
    const lowestWeight = Math.min(
      ...weights.map((weightObj) => parseInt(weightObj.weight))
    );
    selectedbigBasketProduct[product.id] = lowestWeight
    return lowestWeight;
  }

  function calculateSelectedPrice(product) {
    const selectedWeight = selectedbigBasketProduct[product.id]
    const selectedProduct = product.children.find(child => extractWeights(child.w + " " + child?.pack_desc).some(weightObj => weightObj.weight === selectedWeight))
    return selectedProduct?.pricing?.discount?.prim_price?.sp
  }

  const handleSearch = async () => {
    setIsLoading(true);
    try {
      const [
        bigBasketResponse,
        zeptoResponse,
        blinkitResponse,
        instamartResponse,
      ] = await Promise.all([
        api.get(`/bigbasket?s=${productName}`),
        api.get(`/zepto?s=${productName}`),
        fetch(
          `https://blinkit.com/v6/search/products?start=0&size=20&search_type=7&q=${productName}`,
          {
            headers: {
              accept: "*/*",
              "accept-language": "en-GB,en;q=0.9",
              app_client: "consumer_web",
              app_version: "52434332",
              auth_key:
                "c761ec3633c22afad934fb17a66385c1c06c5472b4898b866b7306186d0bb477",
              "cache-control": "no-cache",
              "content-type": "application/json",
              device_id: "c6b672b8-c336-479c-b3c3-e112272a48a3",
              lat: "13.0308735",
              lon: "77.5353903",
              pragma: "no-cache",
              rn_bundle_version: "1009003012",
              "sec-ch-ua":
                '"Chromium";v="122", "Not(A:Brand";v="24", "Google Chrome";v="122"',
              "sec-ch-ua-mobile": "?0",
              "sec-ch-ua-platform": '"macOS"',
              "sec-fetch-dest": "empty",
              "sec-fetch-mode": "cors",
              "sec-fetch-site": "same-origin",
              session_uuid: "26058ecc-3454-4504-8062-a180c0babb31",
              web_app_version: "1008010016",
            },
            referrer: "https://blinkit.com/s/?q=ginger%20smith",
            referrerPolicy: "strict-origin-when-cross-origin",
            body: null,
            method: "GET",
            mode: "cors",
          }
        ).then((response) => response.json()),
        api.get(`/instamart?s=${productName}`),
      ]);
      setBigBasketProducts(bigBasketResponse.data);
      setZeptoProducts(zeptoResponse.data);
      //sort by most similar product name to the search query
      blinkitResponse.products.sort((a, b) => {
        const aSimilarity = compareTwoStrings(a.group_name, productName);
        const bSimilarity = compareTwoStrings(b.group_name, productName);

        return bSimilarity - aSimilarity;
      });
      setBlinkitProducts(blinkitResponse.products);
      setInstamartProducts(instamartResponse.data);
    } catch (error) {
      console.error("Error fetching products:", error);
    }
    setIsLoading(false);
  };

  return (
    <div style={{ padding: 30 }}>
      <div style={{ display: "flex", alignItems: "center" }}>
        <img src={logo} alt="Logo" width={150} />
        <input
          type="text"
          value={productName}
          onChange={(e) => setProductName(e.target.value)}
          placeholder="Enter product name"
          style={{
            flex: 1,
            marginLeft: 30,
            padding: 12,
            borderTopRightRadius: 0,
            border: "none",
            backgroundColor: "#e1e1e1",
            fontSize: 17,
            borderTopLeftRadius: 5,
            borderBottomLeftRadius: 5,
          }}
        />
        <button
          onClick={handleSearch}
          disabled={isLoading}
          style={{
            padding: 12,
            backgroundColor: "#027fac",
            border: "none",
            color: "white",
            fontSize: 18,
            borderTopRightRadius: 5,
            borderBottomRightRadius: 5,
            cursor: "pointer",
          }}
        >
          {isLoading ? "Loading..." : "Compare"}
        </button>
      </div>
      <div style={{ display: "flex", marginTop: 40 }}>
        <div
          style={{
            flex: 1,
            border: "2px solid #a5cd39",
            borderRadius: 5,
            padding: 10,
          }}
        >
          {bigBasketProducts.length > 0 && (
            <div style={{ alignSelf: "center", flex: 1 }}>
              <img
                src="https://franchiseguru.in/wp-content/uploads/2023/02/Bigbasket-Franchise-Logo.png"
                alt="Blinkit Results:"
                width={100}
              />
            </div>
          )}
          {bigBasketProducts.map((product) => (
            <div key={product.id}>
              {/* <ProductComponent productList={bigBasketProducts} /> */}
              <h3>{product.desc}</h3>
              <p>
                <span style={{ fontWeight: "bolder", fontSize: 17 }}>
                  ₹{product.pricing?.discount?.prim_price?.sp}
                </span>
              </p>
              {/* <p>Brand: {product.brand.name}</p> */}
              <div style={{ display: "flex", alignItems: "center" }}>
                <p>Quantity:</p>
                {product.children.length > 0 ? (
                  <select
                    style={{
                      marginLeft: 10,
                      border: "none",
                      backgroundColor: "#e1e1e1",
                      padding: 4,
                      fontSize: 17,
                      borderRadius: 5,
                    }}
                    defaultValue={findLowestWeight(product)}
                  >
                    <option key={product.w} value={product.w}>
                      {product.w+  " " + product?.pack_desc}
                    </option>
                    {product?.children?.reverse().map((child) => (
                      <option
                        key={child.w}
                        value={extractWeights(child.w)[0]?.weight}
                      >
                        {child.w +  " " + child?.pack_desc}
                      </option>
                    ))}{" "}
                    )
                  </select>
                ) : (
                  <p style={{ marginLeft: 10 }}> {product.w}</p>
                )}
              </div>
              <img
                src={product?.images?.[0]?.m}
                alt={product.desc}
                width={70}
                height={70}
              />
              <hr />
            </div>
          ))}
        </div>
        <div
          style={{
            marginLeft: 20,
            flex: 1,
            border: "2px solid #3a0069",
            borderRadius: 5,
            padding: 10,
          }}
        >
          {zeptoProducts.length > 0 && (
            <img
              src="https://upload.wikimedia.org/wikipedia/en/7/7d/Logo_of_Zepto.png"
              alt="Blinkit Results:"
              width={100}
            />
          )}
          {zeptoProducts.map((product) => (
            <div key={product.id}>
              <h3>{product.product.name}</h3>
              {/* <p>Brand: {product.product.brand}</p> */}
              <p>Price: {product.sellingPrice / 100}</p>
              <p>Quantity: {product.productVariant?.formattedPacksize}</p>
              <img
                src={
                  "https://cdn.zeptonow.com/production///tr:w-200,ar-818-897,pr-true,f-auto,q-80/" +
                  product?.productVariant?.images?.[0]?.path
                }
                alt={product.product.name}
                width={70}
                height={70}
              />
              <hr />
            </div>
          ))}
        </div>
        <div
          style={{
            marginLeft: 20,
            flex: 1,
            border: "2px solid #fec704",
            borderRadius: 5,
            padding: 10,
          }}
        >
          {blinkitProducts.length > 0 && (
            <img
              src="https://clevertap.com/wp-content/uploads/2023/08/blinkit-logo_casestudy.png"
              alt="Blinkit Results:"
              width={100}
            />
          )}
          {blinkitProducts.map((product) => (
            <div key={product.id}>
              <h3>{product.group_name}</h3>
              {/* <p>Brand: {product.brand}</p> */}
              <p>Price: {product.price}</p>
              <p>Quantity: {product.unit}</p>
              <img
                src={product?.large_image_url}
                alt={product.group_name}
                width={70}
                height={70}
              />
              <hr />
            </div>
          ))}
        </div>
        <div
          style={{
            marginLeft: 20,
            flex: 1,
            border: "2px solid #881952",
            borderRadius: 5,
            padding: 10,
          }}
        >
          {instamartProducts.length > 0 && (
            <img
              src="https://res.cloudinary.com/swiggy/image/upload/fl_lossy,f_auto,q_auto,h_150/InstamartMicrosite/Instamartlogo"
              alt="Blinkit Results:"
              width={150}
              style={{ marginBottom: 25 }}
            />
          )}
          {instamartProducts.map((product) => (
            <>
              {product.variations.map((variation) => (
                <div key={product.id}>
                  <h3>{product.display_name}</h3>
                  {/* <p>Brand: {product.brand}</p> */}
                  <p>Price: {variation.price.offer_price}</p>
                  <p>Quantity: {variation.quantity}</p>
                  <img
                    src={
                      "https://instamart-media-assets.swiggy.com/swiggy/image/upload/fl_lossy,f_auto,q_auto,h_272,w_252/" +
                      variation?.images?.[0]
                    }
                    alt={product.display_name}
                    width={70}
                    height={70}
                  />
                  <hr />
                </div>
              ))}
            </>
          ))}
        </div>
      </div>
    </div>
  );
};

export default App;
