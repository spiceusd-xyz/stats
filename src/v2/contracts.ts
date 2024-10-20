import type { Provider } from "@ethersproject/abstract-provider";
import type { BigNumber } from "@ethersproject/bignumber";
import { type CallOverrides, Contract } from "@ethersproject/contracts";

export interface LiquityV2Addresses {
  boldToken: string;
  branches: LiquityV2BranchAddresses[];
}

export interface LiquityV2BranchAddresses {
  activePool: string;
  collToken: string;
  defaultPool: string;
  priceFeed: string;
  stabilityPool: string;
}

const erc20Abi = [
  "function symbol() view returns (string)",
  "function totalSupply() view returns (uint256)"
];

export interface ERC20 {
  symbol(overrides?: CallOverrides): Promise<string>;
  totalSupply(overrides?: CallOverrides): Promise<BigNumber>;
}

const activePoolAbi = [
  "function getCollBalance() view returns (uint256)",
  "function aggRecordedDebt() view returns (uint256)",
  "function aggWeightedDebtSum() view returns (uint256)",
  "function aggBatchManagementFees() view returns (uint256)",
  "function calcPendingAggInterest() view returns (uint256)",
  "function calcPendingAggBatchManagementFee() view returns (uint256)"
];

export interface ActivePool {
  getCollBalance(overrides?: CallOverrides): Promise<BigNumber>;
  aggRecordedDebt(overrides?: CallOverrides): Promise<BigNumber>;
  aggWeightedDebtSum(overrides?: CallOverrides): Promise<BigNumber>;
  aggBatchManagementFees(overrides?: CallOverrides): Promise<BigNumber>;
  calcPendingAggInterest(overrides?: CallOverrides): Promise<BigNumber>;
  calcPendingAggBatchManagementFee(overrides?: CallOverrides): Promise<BigNumber>;
}

const defaultPoolAbi = ["function getCollBalance() view returns (uint256)"];

export interface DefaultPool {
  getCollBalance(overrides?: CallOverrides): Promise<BigNumber>;
}

const priceFeedAbi = ["function fetchPrice() returns (uint256, bool)"];

export interface PriceFeed {
  callStatic: {
    fetchPrice(overrides?: CallOverrides): Promise<[BigNumber, boolean]>;
  };
}

const stabilityPoolAbi = ["function getTotalBoldDeposits() view returns (uint256)"];

export interface StabilityPool {
  getTotalBoldDeposits(overrides?: CallOverrides): Promise<BigNumber>;
}

export const getContracts = (provider: Provider, addresses: LiquityV2Addresses) => ({
  boldToken: new Contract(addresses.boldToken, erc20Abi, provider) as unknown as ERC20,
  branches: addresses.branches.map(branch => ({
    activePool: new Contract(branch.activePool, activePoolAbi, provider) as unknown as ActivePool,
    collToken: new Contract(branch.collToken, erc20Abi, provider) as unknown as ERC20,
    defaultPool: new Contract(
      branch.defaultPool,
      defaultPoolAbi,
      provider
    ) as unknown as DefaultPool,
    priceFeed: new Contract(branch.priceFeed, priceFeedAbi, provider) as unknown as PriceFeed,
    stabilityPool: new Contract(
      branch.stabilityPool,
      stabilityPoolAbi,
      provider
    ) as unknown as StabilityPool
  }))
});
