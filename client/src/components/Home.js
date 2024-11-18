import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { Row, Col, Button, Spinner, Alert } from 'react-bootstrap';

const Home = ({ mergedContract }) => {
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState([]);
  const [error, setError] = useState(null);

  const loadMarketplaceItems = async () => {
    try {
      setLoading(true);
      setError(null);

      const itemCount = await mergedContract.itemCount();
      const loadedItems = [];

      for (let i = 1; i <= itemCount; i++) {
        const item = await mergedContract.items(i);
        if (!item.sold) {
          const uri = await mergedContract.tokenURI(item.tokenId);
          const metadata = await (await fetch(uri)).json();
          loadedItems.push({
            itemId: item.itemId,
            tokenId: item.tokenId,
            price: ethers.utils.formatEther(item.price),
            seller: item.seller,
            name: metadata.name,
            description: metadata.description,
            video: metadata.video,
          });
        }
      }

      setItems(loadedItems);
    } catch (err) {
      console.error("Error loading items:", err);
      setError("Failed to load items.");
    } finally {
      setLoading(false);
    }
  };

  const buyMarketItem = async (item) => {
    try {
      const totalPrice = await mergedContract.getTotalPrice(item.itemId);
      const tx = await mergedContract.purchaseItem(item.itemId, { value: totalPrice });
      await tx.wait();
      loadMarketplaceItems();
    } catch (err) {
      console.error("Purchase error:", err);
      setError("Purchase failed.");
    }
  };

  useEffect(() => {
    loadMarketplaceItems();
  }, []);

  if (loading) return <Spinner animation="border" />;
  if (error) return <Alert variant="danger">{error}</Alert>;

  return (
    <div className="container mt-5">
      <Row xs={1} md={2} lg={3} className="g-4">
        {items.map((item) => (
          <Col key={item.itemId}>
            <div className="card">
              <video src={item.video} controls style={{ width: '100%' }} />
              <div className="card-body">
                <h5>{item.name}</h5>
                <p>{item.description}</p>
                <p>Price: {item.price} ETH</p>
                <Button onClick={() => buyMarketItem(item)}>Buy NFT</Button>
              </div>
            </div>
          </Col>
        ))}
      </Row>
    </div>
  );
};

export default Home;
