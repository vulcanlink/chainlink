import React from 'react'
import { useLocation } from 'react-router-dom'
import { Listing } from 'components/listing'
import { Header } from 'components/header'
import { NodesLogos } from 'components/nodesLogos'
import { SponsorsLogos } from 'components/sponsorsLogos'

function useOffchainQuery(): boolean {
  const query = new URLSearchParams(useLocation().search)
  return query.get('compare-offchain') === 'true'
}

function useHealthQuery(): boolean {
  const query = new URLSearchParams(useLocation().search)
  return query.get('health') === 'true'
}

const Page = () => {
  return (
    <div className="page-wrapper landing-page">
      <div className="page-container">
        <Header />
      </div>
      <div className="head">
        <div className="head__title">
          <h1>
            PRICE <br />
            REFERENCE <br />
            DATA{' '}
          </h1>
          <div className="square"></div>
        </div>
      </div>
      <div className="page-container">
        <section>
          <h3>Decentralized Oracle Networks for Price Reference Data</h3>
          <p>
            The Chainlink Network provides the largest collection of secure and
            decentralized on-chain price reference data available. Composed of
            security reviewed, sybil resistant and fully independent nodes which
            are run by leading blockchain devops and security teams. Creating a
            shared global resource which is sponsored by a growing list of top
            DeFi Dapps.
          </p>
          {/* 
          <p>
            Please feel free to look into the details of each Decentralized
            Oracle Network listed below. You can easily use these oracle
            networks to quickly and securely launch, add more capabilities to
            and/or just greatly improve the security of your smart contracts.
          </p>
          */}
        </section>
        <section>
          <h3>Elastos Sidechains</h3>
          <h4>Ethereum but with DPoS</h4>
          <p>
            A redefined EVM draws on the Elastos DPoS supernodes to replace the slower PoW consensus with blazing fast block confirmation at up to 1,500+ TPS pre-sharding.
          </p>
          <h4>Solidity Smart Contracts</h4>
          <p>
            The Elastos EVM will continually update allowing it to be fully backwards-compatible with Solidity Smart Contracts.
          </p>
          <h4>Dedicated Sidechains</h4>
          <p>
            Dedicated TPS can be allocated to a customized sidechain, which gives developers the freedom to invent their own multi-chain or scaling solution.
          </p>
        </section>
        <section>
          <Listing
            compareOffchain={useOffchainQuery()}
            enableHealth={useHealthQuery()}
          />
        </section>
      </div>

      <SponsorsLogos />
      <NodesLogos />
    </div>
  )
}

export default Page
