// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";

contract MNFT is ERC721URIStorage {
    uint public tokenCount;
    uint public itemCount;

    struct Item {
        uint itemId;
        uint tokenId;
        uint viewFee;  
        address payable seller;
        bool hasPaidForView; 
        address viewer;  
        bool sold; 
    }

    event Offered(
        uint itemId,
        uint tokenId,
        uint viewFee,
        address indexed seller
    );

    event PaidForView(
        uint itemId,
        uint tokenId,
        uint viewFee,
        address indexed viewer
    );

    mapping(uint => Item) public items; 
    mapping(uint => uint) public listedItems; 

    constructor() ERC721("MyNft", "MNFT") {}

    function mint(string memory _tokenURI, uint _viewFee) external returns(uint) {
        tokenCount++; 
        itemCount++; 
        _safeMint(msg.sender, tokenCount); 
        _setTokenURI(tokenCount, _tokenURI); 

        items[itemCount] = Item(
            itemCount,
            tokenCount,
            _viewFee,
            payable(msg.sender),
            false,
            address(0),
            false 
        );

        emit Offered(itemCount, tokenCount, _viewFee, msg.sender);

        listNFT(tokenCount, _viewFee); 
        return tokenCount; 
    }

    function listNFT(uint256 tokenId, uint256 _viewFee) public {
        require(ownerOf(tokenId) == msg.sender, "You do not own this NFT");
        require(_viewFee > 0, "View fee must be greater than 0");

        listedItems[tokenId] = _viewFee; 
        emit Offered(tokenId, tokenId, _viewFee, msg.sender); 
    }

    function payForView(uint _itemId) external payable {
        Item storage item = items[_itemId];
        uint _viewFee = item.viewFee;
        require(msg.value >= _viewFee, "Not enough ether to cover view fee");
        require(msg.sender != item.seller, "Seller cannot pay for their own view");
        require(!item.hasPaidForView, "You have already paid to view this NFT");
        require(!item.sold, "Item has been sold already");

        item.seller.transfer(_viewFee);


        item.hasPaidForView = true;
        item.viewer = msg.sender;

        emit PaidForView(_itemId, item.tokenId, item.viewFee, msg.sender);
    }

    function markAsSold(uint _itemId) external {
        Item storage item = items[_itemId];
        require(msg.sender == item.seller, "Only seller can mark as sold");
        item.sold = true;
    }

    function hasPaidForView(uint _itemId, address _viewer) external view returns(bool) {
        return items[_itemId].viewer == _viewer && items[_itemId].hasPaidForView;
    }
}
