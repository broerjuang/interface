import { ethers } from "ethers";
import type { FunctionComponent } from "react";
import { tokenBalanceFormatter } from "../../../utils/formatters";
import { Metadata } from "../../../components/v1/MarketMetadata";
import { useCollateralPerLeveragedToken } from "../../../components/v1/swr/useCollateralPerLeveragedToken";
import { useDebtPerLeveragedToken } from "../../../components/v1/swr/useDebtPerLeveragedToken";
import { DEFAULT_CHAIN, useWalletContext } from "../../../components/v1/Wallet";
import InformationCard from "../../../uikit/card/InformationCard";

/**
 * LeveragedTokenBackingCardProps is a React Component properties that passed to React Component LeveragedTokenBackingCard
 */
type LeveragedTokenBackingCardProps = {
    address: string;
};

/**
 * LeveragedTokenBackingCard is just yet another react component
 *
 * @link https://fettblog.eu/typescript-react/components/#functional-components
 */
const LeveragedTokenBackingCard: FunctionComponent<LeveragedTokenBackingCardProps> = ({ address }) => {
    const { chain, provider } = useWalletContext();
    const chainID = chain.unsupported ? DEFAULT_CHAIN.id : chain.chain.id;
    const metadata = Metadata[chainID][address];
    const collateralPerTokenResponse = useCollateralPerLeveragedToken({ token: address, vault: metadata.vaultAddress, provider: provider });
    const debtPerTokenResponse = useDebtPerLeveragedToken({ token: address, vault: metadata.vaultAddress, provider: provider });

    // Data
    const collateral = parseFloat(ethers.utils.formatUnits(collateralPerTokenResponse.data ? collateralPerTokenResponse.data : 0, metadata.collateralDecimals));
    const debt = parseFloat(ethers.utils.formatUnits(debtPerTokenResponse.data ? debtPerTokenResponse.data : 0, metadata.debtDecimals));

    // UI states
    const showLoading = collateralPerTokenResponse.isLoading || debtPerTokenResponse.isLoading ? true : false;
    const showError = collateralPerTokenResponse.error || debtPerTokenResponse.error ? true : false;
    const showData = !showLoading && !showError && collateralPerTokenResponse.data && debtPerTokenResponse.data ? true : false;

    return (
        <InformationCard>
            <div className="pt-4">
                <h2 className="text-base font-bold leading-4 text-gray-light-12 dark:text-gray-dark-12">Backing per {metadata.title}</h2>
            </div>
            <div className="">
                <p className="text-sm leading-6 text-gray-light-10 dark:text-gray-dark-10">{metadata.title} represents collaterized debt position and can be redeemed at any time.</p>
            </div>
            <div className="flex flex-col space-y-6">
                <div className="flex flex-row justify-between">
                    <p className="text-sm leading-4 text-gray-light-10 dark:text-gray-dark-10">Asset</p>
                    <p className="text-sm leading-4 text-gray-light-10 dark:text-gray-dark-10">Allocation</p>
                </div>

                <div className="flex flex-row justify-between">
                    <p className="text-sm font-semibold leading-4 tracking-[-.02em] text-gray-light-12 dark:text-gray-dark-12">{metadata.collateralSymbol}</p>
                    {(showLoading || showError) && <p className="h-[16px] w-[100px] animate-pulse rounded-[8px] bg-gray-light-3 dark:bg-gray-dark-3"></p>}
                    {showData && (
                        <p className="font-ibm text-sm font-semibold leading-4 tracking-[-.02em] text-gray-light-12 dark:text-gray-dark-12">
                            {tokenBalanceFormatter.format(collateral)} {metadata.collateralSymbol}
                        </p>
                    )}
                </div>
                <div className="flex flex-row justify-between">
                    <p className="text-sm font-semibold leading-4 tracking-[-.02em] text-gray-light-12 dark:text-gray-dark-12">{metadata.debtSymbol}</p>
                    {(showLoading || showError) && <p className="h-[16px] w-[100px] animate-pulse rounded-[8px] bg-gray-light-3 dark:bg-gray-dark-3"></p>}
                    {showData && (
                        <p className="font-ibm text-sm font-semibold leading-4 tracking-[-.02em] text-gray-light-12 dark:text-gray-dark-12">
                            -{tokenBalanceFormatter.format(debt)} {metadata.debtSymbol}
                        </p>
                    )}
                </div>
            </div>
        </InformationCard>
    );
};

export default LeveragedTokenBackingCard;
