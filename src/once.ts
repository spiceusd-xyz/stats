import fs from "fs";
import path from "path";
import util from "util";

import v2MainnetDeployment from "../bold/contracts/addresses/1.json";
import v2SepoliaDeployment from "../bold/contracts/addresses/11155111.json";
import v2BlastDeployment from "../deployments/spice-usd.json";
import { getProvider } from "./connection";
import { fetchV2Stats } from "./v2/fetchV2Stats";

import {
  OUTPUT_DIR_V2
} from "./constants";

// const panic = <T>(message: string): T => {
//   throw new Error(message);
// };

const alchemyApiKey = process.env.ALCHEMY_API_KEY || `XUo53wEfZzTMPqzRq_BgmJSSdpoe6UO2`
const duneApiKey: string = process.env.DUNE_API_KEY || `ijpIRHyogAJDmqRu35KXQ3mzOUApwXTG`;
const mainnetProvider = getProvider("mainnet", { alchemyApiKey });
const sepoliaProvider = getProvider("sepolia", { alchemyApiKey });
const blastProvider = getProvider({
  chainId: 81457,
  name: "blast"
}, { alchemyApiKey });
type Tree = Record<string, string | Tree>

const writeTree = (parentDir: string, tree: Tree) => {
  if (!fs.existsSync(parentDir)) fs.mkdirSync(parentDir);

  for (const [k, v] of Object.entries(tree)) {
    const prefix = path.join(parentDir, k);

    if (typeof v === "string") {
      fs.writeFileSync(`${prefix}.txt`, v);
    } else {
      writeTree(prefix, v);
    }
  }
};

(async () => {
  const [v2MainnetStats, v2SepoliaStats, v2BlastStats] = await Promise.all(
    [
      fetchV2Stats({
        network: "mainnet",
        deployment: v2MainnetDeployment,
        duneApiKey,
        provider: mainnetProvider
      }),
      fetchV2Stats({
        network: "sepolia",
        deployment: v2SepoliaDeployment,
        provider: sepoliaProvider,
        duneApiKey
      }),
      fetchV2Stats({
        network: "blast",
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        deployment: v2BlastDeployment,
        provider: blastProvider,
        duneApiKey
      })
    ]
  );

  const v2Stats = {
    mainnet: {
      ...v2MainnetStats
    },
    sepolia: {
      ...v2SepoliaStats
    },
    blast: {
      ...v2BlastStats
    }
  };

  writeTree(OUTPUT_DIR_V2, v2Stats);
  fs.writeFileSync(
    path.join(OUTPUT_DIR_V2, "mainnet.json"),
    JSON.stringify(v2MainnetStats, null, 2)
  );
  fs.writeFileSync(
    path.join(OUTPUT_DIR_V2, "testnet", "sepolia.json"),
    JSON.stringify(v2SepoliaStats, null, 2)
  );
  fs.writeFileSync(
    path.join(OUTPUT_DIR_V2, "blast.json"),
    JSON.stringify(v2BlastStats, null, 2)
  );
  console.log("v2 stats:", util.inspect(v2Stats, { colors: true, depth: null }));
})()