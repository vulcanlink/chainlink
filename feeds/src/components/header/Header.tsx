import React from 'react'
import { Link } from 'react-router-dom'
import { Button } from 'antd'
import { withRouter, RouteComponentProps } from 'react-router'
import ReactGA from 'react-ga'
//@ts-ignore
import ChainlinkLogo from '../shared/ChainlinkLogo'
import ElastosLogo from '../../assets/chainlinkXelastos.svg'


interface Props extends RouteComponentProps { }

const REACT_APP_COMMUNITY_TYPEFORM_TITLE = process.env.REACT_APP_COMMUNITY_TYPEFORM_TITLE || 'Integrate with Chainlink'

const Header: React.FC<Props> = ({ location }) => {
  return (
    <header className="header">
      <div className="header__main-nav">
        <Link to="/">
          <div className="header__logotype">
            <img style={{ height: 50 }} src={ElastosLogo} />
            {//<ChainlinkLogo />
            }
            <h1>{process.env.REACT_APP_CHAINLINK_HEADER_TITLE || "Chainlink"}</h1>
          </div>
        </Link>
        {location.pathname !== '/' && (
          <Link to={`/`}>
            <Button type="primary" ghost icon="left">
              Back to listing
            </Button>
          </Link>
        )}
      </div>
      <div className="header__secondary-nav">
        {location.pathname !== '/' && (
          <a
            onClick={() =>
              ReactGA.event({
                category: 'Form Conversion',
                action: 'Click on Button',
                label: REACT_APP_COMMUNITY_TYPEFORM_TITLE
              })
            }
            href={process.env.REACT_APP_COMMUNITY_TYPEFORM || "https://chainlinkcommunity.typeform.com/to/XcgLVP"}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button type="primary" shape="round">
              {REACT_APP_COMMUNITY_TYPEFORM_TITLE}
            </Button>
          </a>
        )}
      </div>
    </header>
  )
}

export default withRouter(Header)
