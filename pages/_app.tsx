import "../styles/global.css";
import "@rainbow-me/rainbowkit/styles.css";
import type { AppProps } from "next/app";
import {
  RainbowKitProvider,
  getDefaultWallets,
  connectorsForWallets,
} from "@rainbow-me/rainbowkit";
import {
  coinbaseWallet,
  walletConnectWallet,
  metaMaskWallet,
} from "@rainbow-me/rainbowkit/wallets";
import { chain, configureChains, createClient, WagmiConfig } from "wagmi";
import { alchemyProvider } from "wagmi/providers/alchemy";
import { publicProvider } from "wagmi/providers/public";
import { SessionProvider } from "next-auth/react";
import {
  RainbowKitSiweNextAuthProvider,
  GetSiweMessageOptions,
} from "@rainbow-me/rainbowkit-siwe-next-auth";
import { Session } from "next-auth";

const { chains, provider, webSocketProvider } = configureChains(
  [
    chain.polygon,
    chain.mainnet,
    ...(process.env.NEXT_PUBLIC_ENABLE_TESTNETS === "true"
      ? [chain.polygonMumbai, chain.hardhat]
      : []),
  ],
  [
    alchemyProvider({
      apiKey: process.env.NEXT_PUBLIC_ALCHEMY_API_KEY,
      priority: 0,
    }),
    publicProvider({ priority: 1 }),
  ]
);

const { wallets } = getDefaultWallets({
  appName: "NFT Marketplace",
  chains,
});

const AppInfo = {
  appName: "NFT Marketplace",
};

const connectors = connectorsForWallets([
  {
    groupName: "Recommended",
    wallets: [
      metaMaskWallet({ chains }),
      coinbaseWallet({ chains, appName: AppInfo.appName }),
      walletConnectWallet({ chains }),
    ],
  },
]);

const wagmiClient = createClient({
  autoConnect: true,
  connectors,
  provider,
  webSocketProvider,
});

const getSiweMessageOptions: GetSiweMessageOptions = () => ({
  statement: "Sign in to the NFT Marketplace",
});

export default function App({
  Component,
  pageProps: { session, ...pageProps },
}: AppProps<{ session: Session }>) {
  return (
    <SessionProvider refetchInterval={0} session={session}>
      <WagmiConfig client={wagmiClient}>
        <RainbowKitSiweNextAuthProvider
          getSiweMessageOptions={getSiweMessageOptions}
        >
          <RainbowKitProvider coolMode appInfo={AppInfo} chains={chains}>
            <Component {...pageProps} />
          </RainbowKitProvider>
        </RainbowKitSiweNextAuthProvider>
      </WagmiConfig>
    </SessionProvider>
  );
}
