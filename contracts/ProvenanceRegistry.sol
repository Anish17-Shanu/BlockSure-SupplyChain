// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract ProvenanceRegistry {
    struct AssetRecord {
        string sku;
        string batchId;
        string currentCustodian;
        string geoHash;
        uint256 temperatureCenti;
        uint256 updatedAt;
        bool recalled;
    }

    mapping(bytes32 => AssetRecord) public assets;

    event AssetRegistered(bytes32 indexed assetId, string sku, string batchId, string custodian);
    event CustodyTransferred(bytes32 indexed assetId, string fromCustodian, string toCustodian, string geoHash);
    event ComplianceUpdated(bytes32 indexed assetId, uint256 temperatureCenti, bool recalled);

    function registerAsset(bytes32 assetId, string calldata sku, string calldata batchId, string calldata custodian, string calldata geoHash) external {
        require(assets[assetId].updatedAt == 0, "asset already exists");
        assets[assetId] = AssetRecord({
            sku: sku,
            batchId: batchId,
            currentCustodian: custodian,
            geoHash: geoHash,
            temperatureCenti: 0,
            updatedAt: block.timestamp,
            recalled: false
        });
        emit AssetRegistered(assetId, sku, batchId, custodian);
    }

    function transferCustody(bytes32 assetId, string calldata nextCustodian, string calldata geoHash) external {
        AssetRecord storage asset = assets[assetId];
        require(asset.updatedAt != 0, "asset not found");
        string memory previous = asset.currentCustodian;
        asset.currentCustodian = nextCustodian;
        asset.geoHash = geoHash;
        asset.updatedAt = block.timestamp;
        emit CustodyTransferred(assetId, previous, nextCustodian, geoHash);
    }

    function updateCompliance(bytes32 assetId, uint256 temperatureCenti, bool recalled) external {
        AssetRecord storage asset = assets[assetId];
        require(asset.updatedAt != 0, "asset not found");
        asset.temperatureCenti = temperatureCenti;
        asset.recalled = recalled;
        asset.updatedAt = block.timestamp;
        emit ComplianceUpdated(assetId, temperatureCenti, recalled);
    }
}
