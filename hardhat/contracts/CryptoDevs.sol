// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.4;
 
 import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./Iwhitelist.sol";

contract  CryptoDevs is  ERC721Enumerable , Ownable {
    
    string _basetokenuri;

uint256 public _price = 0.1 ether; //price of one crypto devs nft
    
    bool public _paused; // to pause the contract in case of an emergency
    
    uint256 public maxtokenids = 20; // max number of crypto devs
    
    uint256 public tokenids; // total number of token ids minted
    
    Iwhitelist whitelist ;// whitelist contract instance

    bool public presalestarted; //to keep track of presale

    uint256 public presaleEnded; //timestamp for presale to end

    modifier onlywhennotpaused {
        require( !_paused , "contract currently paused ");
        _;
        }
 

 constructor ( string memory baseURI , address whitelistcontract) ERC721 ( "CryptoDevs" , "CD"){

    _basetokenuri = baseURI;
    whitelist = Iwhitelist(whitelistcontract);
 }
    function startPresale() public onlyOwner {
        presalestarted = true;
        
        presaleEnded = block.timestamp + 5 minutes;
    }

    function presalemint() public  payable onlywhennotpaused{

     require(presalestarted && block.timestamp < presaleEnded, "Presale is not running");
        require(whitelist.whitelistAddresses(msg.sender), "You are not whitelisted");
        require(tokenids < maxtokenids, "Exceeded maximum Crypto Devs supply");
        require(msg.value >= _price, "Ether sent is not correct");
        tokenids += 1;
       
        _safeMint(msg.sender, tokenids);

    }

    function mint() public payable onlywhennotpaused {

        require(presalestarted && block.timestamp >= presaleEnded , "presale has not ended");
        require(tokenids<maxtokenids,"exceeded maximum Crypto Devs supply");
        require(msg.value >=_price ,"Ether sent is not correct");
        tokenids +=1;

        _safeMint(msg.sender , tokenids);
    }


function _baseURI() internal view virtual override returns (string memory){
    return _basetokenuri;
}

function setbool(bool val) public onlyOwner{
    _paused = val;


}
   function withdraw() public onlyOwner  {
        address _owner = owner();
        uint256 amount = address(this).balance;
        (bool sent, ) =  _owner.call{value: amount}("");
        require(sent, "Failed to send Ether");
   }
receive() external payable{}

fallback() external payable{}


}
