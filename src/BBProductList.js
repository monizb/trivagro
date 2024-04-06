import React, { useState } from 'react';

function ProductList({ products }) {
  const [selectedVariant, setSelectedVariant] = useState(null);

  const handleVariantChange = (event) => {
    setSelectedVariant(event);
  };

  function extractWeights(string) {
    const regex = /(\d+)\s*(g|Kg|kg|ml|L|pcs|pieces|pc|pack)|(\d+)\s*x\s*(\d+)\s*g/g;
    const matches = [...string.matchAll(regex)];
    const weights = [];
    for (const match of matches) {
      if (match[1] !== undefined) {
        weights.push({ weight: parseInt(match[1]), unit: match[2].toLowerCase() });
      } else {
        weights.push({
          weight: parseInt(match[3]) * parseInt(match[4]),
          unit: "g",
        });
      }
    }
    return weights;
  }

  function getUnitEconomics(selectedVariant, product) {
    console.log(selectedVariant, product);
    //write per gram or per ml or per piece cost
    if(product.children) {
        const selectedProduct = product.children.find(child => child.id === selectedVariant);
        if (selectedProduct) {
            const weights = extractWeights(selectedProduct.w);
            return selectedProduct.pricing.discount.prim_price.sp / (weights[0].unit === "kg" || weights[0].unit === "l" ? weights[0].weight * 1000 : weights[0].weight) + " per " + (weights[0].unit === "kg" ? "g" : weights[0].unit === "l" ? "ml" : weights[0].unit);
        } else {
            const weights = extractWeights(product.w);
        return (product?.pricing.discount?.prim_price?.sp / (weights?.[0]?.unit === "kg" || weights?.[0]?.unit === "l" ? weights?.[0]?.weight * 1000 : weights?.[0]?.weight)) + " per " + (weights?.[0]?.unit === "kg" ? "g" : weights?.[0]?.unit === "l" ? "ml" : weights?.[0]?.unit);
        }
    } else {
        const weights = extractWeights(product.w);
        return product.pricing.discount.prim_price.sp / (weights[0].unit === "kg" || weights[0].unit === "l" ? weights?.[0]?.weight * 1000 : weights?.[0]?.weight) + " per " + (weights[0].unit === "kg" ? "g" : weights[0].unit === "l" ? "ml" : weights[0].unit);
    }
  }

  // Helper function to find the lowest weight
  function findLowestWeightVairantId(product) {
    if(product.children) {
      let lowestWeight = Infinity;
    let lowestWeightVariantId = null;
    product.children.forEach((child) => {
      const weights = extractWeights(child.w);
      if (weights?.[0]?.weight < lowestWeight) {
        lowestWeight = weights?.[0]?.weight;
        lowestWeightVariantId = child.id;
      }
    });
    return lowestWeightVariantId;
    }
  }

  return (
    <div>
      {products.map((product) => (
        <div key={product.id}>
          <h3>{product.desc}</h3>
          <p style={{fontWeight: "bolder", fontSize: 17}}>₹ {selectedVariant ? getProductPrice(selectedVariant, product) : getProductPrice(product.id, product)} <span style={{fontSize: 15, color: "#999999"}}>({selectedVariant ? getUnitEconomics(selectedVariant, product) : getUnitEconomics(product.id, product)})</span></p>
          <img src={selectedVariant ? product.children.find(child => child.id === selectedVariant)?.images?.[0]?.m ?? product?.images?.[0]?.m : product?.images?.[0]?.m} alt={product.desc} width={70} height={70} />
          <p>Quantity: {product.children.length > 0 ? (
            <select defaultValue={findLowestWeightVairantId(product)} value={selectedVariant || product.id} onChange={(e) => handleVariantChange(e.target.value)} style={{marginLeft: 5, border:"none", padding: 5, backgroundColor: "#e1e1e1", borderRadius: 5}}>
              <option value={product.id} key={product.id}>{product.w + " " + product.pack_desc}</option>
              {product.children.map((child) => (
                <option key={child.id} value={child.id}>{child.w + " " + child.pack_desc}</option>
              ))}
            </select>
          ) : <>{product.w + " " + product.pack_desc}</>}</p>
          <hr />
        </div>
      ))}
    </div>
  );
}

function getProductPrice(selectedProductId, product) {
    if (product.children) {
      const selectedProduct = product.children.find(child => child.id === selectedProductId);
      if (selectedProduct && selectedProduct.pricing && selectedProduct.pricing.discount) {
        return selectedProduct.pricing.discount.prim_price.sp;
      } else {
        return product.pricing.discount.prim_price.sp;
      }
    } else {
      if (product.pricing && product.pricing.discount) {
        return product.pricing.discount.prim_price.sp;
      } else {
        return null; // or handle the case where price is not available
      }
    }
  }

export default ProductList;
