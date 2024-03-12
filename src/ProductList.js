import React, { useState } from 'react';

const ProductComponent = ({ productList }) => {
  const [selectedProduct, setSelectedProduct] = useState(productList[0]);

  const handleChange = (e) => {
    const productId = e.target.value;
    const selectedVariant = productList.find(product => product.id === productId);
    setSelectedProduct(selectedVariant);
  };

  const handleChildChange = (e) => {
    const childId = e.target.value;
    const selectedChild = selectedProduct.children.find(child => child.id === childId);
    setSelectedProduct(selectedChild);
  };

  return (
    <div>
      <select onChange={handleChange}>
        {productList.map(product => (
          <option key={product.id} value={product.id}>
            {product.desc} - {product.pack_desc} - {product.pricing?.prim_price?.sp} Rs
          </option>
        ))}
      </select>
      {selectedProduct.children && selectedProduct.children.length > 0 && (
        <select onChange={handleChildChange}>
          {selectedProduct.children.map(child => (
            <option key={child.id} value={child.id}>
              {child.desc} - {child.pack_desc} - {child.pricing?.prim_price?.sp} Rs
            </option>
          ))}
        </select>
      )}
      <div>
        <h2>{selectedProduct.desc}</h2>
        <p>Price: {selectedProduct.pricing?.prim_price?.sp} Rs</p>
        <img src={selectedProduct.images[0]?.m} alt={selectedProduct.desc} />
      </div>
    </div>
  );
};

export default ProductComponent;
