import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { Row, Col, Button, Spinner, Alert } from 'react-bootstrap';

const Home = ({ mergedContract }) => {
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState([]);
  const [error, setError] = useState(null);
  const [purchasing, setPurchasing] = useState(false);
  const [accessGranted, setAccessGranted] = useState({});

  const loadMarketplaceItems = async () => {
    try {
      setLoading(true);
      setError(null);

      const itemCount = await mergedContract.itemCount();
      const itemsPromises = [];

      for (let i = 1; i <= itemCount; i++) {
        itemsPromises.push(mergedContract.items(i));
      }

      const allItems = await Promise.all(itemsPromises);

      const loadedItems = await Promise.all(
        allItems
          .filter((item) => !item.sold)
          .map(async (item) => {
            const uri = await mergedContract.tokenURI(item.tokenId);
            const metadata = await (await fetch(uri)).json();

            return {
              itemId: item.itemId.toString(),
              tokenId: item.tokenId.toString(),
              price: ethers.utils.formatEther(item.price),
              seller: item.seller,
              name: metadata.name,
              description: metadata.description,
              video: metadata.video,
            };
          })
      );

      setItems(loadedItems);

      // Check access for each video
      const accessPromises = loadedItems.map(async (item) => {
        const hasAccess = await mergedContract.hasPurchased(item.tokenId, window.ethereum.selectedAddress);
        setAccessGranted((prev) => ({
          ...prev,
          [item.tokenId]: hasAccess,
        }));
      });

      await Promise.all(accessPromises);
    } catch (err) {
      console.error("Error loading items:", err);
      setError("Failed to load marketplace items. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Handle purchase of an item
  const buyMarketItem = async (item) => {
    try {
      setPurchasing(true);
      setError(null);

      const totalPrice = await mergedContract.getTotalPrice(item.itemId);
      const tx = await mergedContract.purchaseItem(item.itemId, { value: totalPrice });
      await tx.wait();

      // Update accessGranted immediately to allow access to the video
      setAccessGranted((prev) => ({
        ...prev,
        [item.tokenId]: true,
      }));

    } catch (err) {
      console.error("Purchase error:", err);
      setError("Purchase failed. Please check your connection and wallet balance.");
    } finally {
      setPurchasing(false);
    }
  };

  // Prevent video from playing if the user hasn't purchased
  const handleVideoPlay = (e, tokenId) => {
    if (!accessGranted[tokenId]) {
      e.preventDefault(); // Prevent play
      alert("You need to purchase this video to play it.");
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
            <div className="card position-relative">
              {/* Video with overlay if not purchased */}
              <div className="video-container" style={{ position: 'relative', width: '100%', height: '200px' }}>
                <video
                  src={item.video}
                  controls
                  style={{ width: '100%', height: '100%' }}
                  preload="metadata"
                  onPlay={(e) => handleVideoPlay(e, item.tokenId)}
                />
                {/* Display overlay only if the video is not purchased */}
                {!accessGranted[item.tokenId] && (
                  <div
                    className="video-overlay"
                    style={{
                      position: 'absolute',
                      top: '0',
                      left: '0',
                      width: '100%',
                      height: '100%',
                      backgroundColor: 'rgba(0, 0, 0, 0.5)',
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      color: 'white',
                      fontSize: '20px',
                    }}
                  >
                    Locked: Pay to Unlock
                  </div>
                )}
              </div>

              <div className="card-body">
                <h5>{item.name}</h5>
                <p>{item.description}</p>
                <p>Price: {item.price} ETH</p>
                <Button
                  onClick={() => buyMarketItem(item)}
                  disabled={purchasing || accessGranted[item.tokenId]}
                >
                  {purchasing ? <Spinner size="sm" animation="border" /> : accessGranted[item.tokenId] ? "Access Granted" : "Pay For View"}
                </Button>
              </div>
            </div>
          </Col>
        ))}
      </Row>
    </div>
  );
};

export default Home;
