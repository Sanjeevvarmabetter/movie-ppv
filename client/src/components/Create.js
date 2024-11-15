import { useState } from 'react';
  import { ethers } from 'ethers';
  import { Row, Form, Button } from 'react-bootstrap';
  import { ToastContainer, toast } from 'react-toastify';  
  import 'react-toastify/dist/ReactToastify.css'; 
  
  import axios from 'axios';
  
  const Create = ({ mergedContract }) => {
    const [video, setVideo] = useState('');
    const [price, setPrice] = useState('');
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const pinataApiKey = "20a1ac93e10b67f081c5";
    const pinataSecretApiKey = "2b3680b650e07a507c4df5a9649b9b6438d7f8e4c3cc0cfab22a73bb968d02d7";
    // Function to upload video to Pinata
    const uploadToPinata = async (event, type) => {
      event.preventDefault();
      const file = event.target.files[0];
      if (file) {
        const formData = new FormData();
        formData.append('file', file);
        try {
          const response = await axios.post('https://api.pinata.cloud/pinning/pinFileToIPFS', formData, {
            maxBodyLength: 'Infinity',
            headers: {
              'Content-Type': 'multipart/form-data',
              pinata_api_key: pinataApiKey,
              pinata_secret_api_key: pinataSecretApiKey,
            },
          });
          const fileUrl = `https://gateway.pinata.cloud/ipfs/${response.data.IpfsHash}`;
          if (type === "video") {
            setVideo(fileUrl);
            toast.success('Video uploaded successfully!');
          }
        } catch (error) {
          console.log("Pinata upload error: ", error);
          toast.error('Video upload failed, please try again!');
        }
      }
    };
  
    const createNFT = async () => {
      if (!video || !price || !name || !description) {
        toast.error('Please fill in all fields!');
        return;
      }
  
      try {
        const metadata = {
          video,
          name,
          description,
        };
  
        // Upload metadata to Pinata
        const response = await axios.post('https://api.pinata.cloud/pinning/pinJSONToIPFS', metadata, {
          headers: {
            'Content-Type': 'application/json',
            pinata_api_key: pinataApiKey,
            pinata_secret_api_key: pinataSecretApiKey,
          },
        });
  
        const metadataUri = `https://gateway.pinata.cloud/ipfs/${response.data.IpfsHash}`;
        // Mint and list NFT
        await mintThenList(metadataUri);
      } catch (error) {
        console.log("Pinata metadata upload error: ", error);
        toast.error('Metadata upload failed, please try again!');
      }
    };
  
    const mintThenList = async (metadataUri) => {
      try {
        const tx = await mergedContract.mint(metadataUri, ethers.utils.parseEther(price.toString()));
        const receipt = await tx.wait();
        const tokenId = receipt.events[0].args.tokenId.toNumber();
        toast.success(`NFT minted and listed, Token ID: ${tokenId}`);
      } catch (error) {
        console.error("Error in minting or listing NFT: ", error);
        toast.error('An error occurred while minting or listing the NFT');
      }
    };
  
    return (
      <div className="container-fluid mt-5">
        <div className="row">
          <main role="main" className="col-lg-12 mx-auto" style={{ maxWidth: '1000px' }}>
            <div className="content mx-auto">
              <Row className="g-4">
                <Form.Control
                  type="file"
                  required
                  name="video"
                  accept="video/mp4"
                  onChange={(e) => uploadToPinata(e, "video")}
                />
                <Form.Control
                  onChange={(e) => setName(e.target.value)}
                  size="lg"
                  required
                  type="text"
                  placeholder="Name"
                />
                <Form.Control
                  onChange={(e) => setDescription(e.target.value)}
                  size="lg"
                  required
                  as="textarea"
                  placeholder="Description"
                />
                <Form.Control
                  onChange={(e) => setPrice(e.target.value)}
                  size="lg"
                  required
                  type="number"
                  placeholder="Price in ETH"
                />
                <div className="d-grid px-0">
                  <Button onClick={createNFT} variant="primary" size="lg">
                    Create & List NFT!
                  </Button>
                </div>
              </Row>
            </div>
          </main>
        </div>
        <ToastContainer /> 
      </div>
    );
  };
  
  export default Create;
  