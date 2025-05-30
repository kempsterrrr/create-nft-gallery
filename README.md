# Create NFT Gallery

A CLI tool to scaffold NFT gallery applications for Arweave Name System (ArNS) domains. This tool helps you quickly set up a gallery to showcase your NFT collection with support for different blockchain platforms.

## TODOs

- [ ] Add wayfinder + image component from original example
- [ ] Add deployment scripts from original repo
- [ ] Add support for ETH and Solana wallets for ArNS and permaweb-deploy

## Installation

```bash
npm install -g create-nft-gallery
```

## Usage

Create a new NFT gallery project:

```bash
create-nft-gallery [project-name] [options]
```

### Options

- `--domain <ar-domain>`: Specify your ArNS domain
- `--variant <variant>`: Choose the variant to use (manifold or metaplex)

### Interactive Mode

If you run the command without arguments, it will guide you through the setup process:

```bash
create-nft-gallery
```

You'll be prompted for:
- Project name
- Variant selection (manifold or metaplex)
- ArNS domain
- NFT contract address (optional)
- RPC endpoint URL (optional)

### Variants

#### Manifold
- Supports Manifold Studio collections
- Fetches metadata from Manifold's API
- Best for Ethereum-based collections

#### Metaplex
- Supports Solana NFT collections
- Fetches metadata using Metaplex's Digital Asset Standard API
- Best for Solana-based collections

## Environment Variables

After creating your project, you'll need to set up your environment variables in the `.env` file:

```env
ARNS_NAME=your_arns_domain
NFT_CONTRACT_ADDRESS=your_collection_address
RPC_ENDPOINT=your_rpc_endpoint
DEPLOY_KEY=your_arweave_wallet_key
```

NB - Solana RPC must support the Digital Asset Standard (DAS) API for metaplex variant, any ethereum RPC will will be fine for manifold

## Available Scripts

Once your project is set up, you can use the following npm scripts:

- `npm run fetch-metadata`: Fetch NFT metadata for your collection (required)
- `npm run create-undernames`: Create and assign undernames for everyone NFT in the colleciton (optional, not tested yet)
- `npm run dev`: Start the development server to see your gallery in the browser

// TODO production builders and arweave uploade
- `npm run build`: Build the project for production
- `npm run preview`: Preview the production build


## Development

To work on the CLI tool itself:

```bash
# Clone the repository
git clone https://github.com/yourusername/create-nft-gallery.git
cd create-nft-gallery

# Install dependencies
npm install

# Run tests
npm test

# Generate a test project
npm run generate

# cd into project director
cd nft-gallery

# fetch NFT metadata
npm run fetch-metadata

# test local build
npm run dev
```

## License

MIT 