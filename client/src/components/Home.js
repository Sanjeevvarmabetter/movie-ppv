import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { Row, Col, Button, Alert, Spinner } from "react-bootstrap";

const Home = ({ mergedContract, userAddress }) => {
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState([]);
  const [error, setError] = useState(null);
  const [viewing, setViewing] = useState(false);

  // Fetch items from the smart contract
  useEffect(() => {
    const fetchItems = async () => {
      try {
        if (!mergedContract) throw new Error("Contract not initialized");

        const itemCount = await mergedContract.itemCount();
        const itemList = [];

        for (let i = 1; i <= itemCount; i++) {
          const item = await mergedContract.items(i);
          itemList.push({
            itemId: i,
            name: item.name,
            description: item.description,
            viewFee: ethers.utils.formatEther(item.viewFee), // Convert fee to ETH
            hasPaidForView: item.hasPaidForView,
          });
        }
        setItems(itemList);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchItems();
  }, [mergedContract]);

  // Handle payment for viewing an item
  const handlePayForView = async (itemId) => {
    setViewing(true);
    try {
      if (!mergedContract) throw new Error("Contract not initialized");

      const item = items.find((i) => i.itemId === itemId);
      if (!item) throw new Error("Item not found");

      const viewFeeInWei = ethers.utils.parseEther(item.viewFee);

      // Check user balance
      const balance = await mergedContract.provider.getBalance(userAddress);
      if (balance.lt(viewFeeInWei)) {
        throw new Error("Insufficient funds to complete the transaction.");
      }

      // Execute the transaction
      const tx = await mergedContract.payForView(itemId, {
        value: viewFeeInWei,
        gasLimit: 300000, // Adjust gas limit as needed
      });

      await tx.wait();
      alert(`Successfully paid to view the NFT with ID: ${itemId}`);

      // Update the item's payment status
      setItems((prev) =>
        prev.map((i) =>
          i.itemId === itemId ? { ...i, hasPaidForView: true } : i
        )
      );
    } catch (err) {
      console.error(err);
      alert(`Failed to pay: ${err.message}`);
    } finally {
      setViewing(false);
    }
  };

  // Render the UI
  return (
    <div className="container mt-4">
      {loading ? (
        <Spinner animation="border" role="status" />
      ) : error ? (
        <Alert variant="danger">Error: {error}</Alert>
      ) : (
        <Row>
          {items.map((item) => (
            <Col key={item.itemId} md={4}>
              <div className="card" style={{ width: "18rem" }}>
                <div className="card-body">
                  <h5 className="card-title">{item.name}</h5>
                  <p className="card-text">{item.description}</p>
                  <p>
                    <strong>View Fee:</strong> {item.viewFee} ETH
                  </p>
                  <Button
                    onClick={() => handlePayForView(item.itemId)}
                    disabled={viewing || item.hasPaidForView}
                    variant="primary"
                  >
                    {viewing
                      ? "Processing..."
                      : item.hasPaidForView
                      ? "Already Paid"
                      : "Pay to View"}
                  </Button>
                </div>
              </div>
            </Col>
          ))}
        </Row>
      )}
    </div>
  );
};

export default Home;
