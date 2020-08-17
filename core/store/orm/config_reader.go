package orm

import (
	"math/big"
	"net/url"
	"time"

	"chainlink/core/assets"

	"github.com/ethereum/go-ethereum/common"
	"github.com/gin-gonic/contrib/sessions"
	"go.uber.org/zap"
)

// ConfigReader represents just the read side of the config
type ConfigReader interface {
	AllowOrigins() string
	BridgeResponseURL() *url.URL
	ChainID() *big.Int
	ClientNodeURL() string
	DatabaseTimeout() time.Duration
	DatabaseURL() string
	DefaultMaxHTTPAttempts() uint
	DefaultHTTPLimit() int64
	DefaultHTTPTimeout() time.Duration
	Dev() bool
	FeatureExternalInitiators() bool
	FeatureFluxMonitor() bool
	MaximumServiceDuration() time.Duration
	MinimumServiceDuration() time.Duration
	EnableExperimentalAdapters() bool
	EthGasBumpPercent() uint16
	EthGasBumpThreshold() uint64
	EthGasBumpWei() *big.Int
	EthGasLimitDefault() uint64
	EthGasPriceDefault() *big.Int
	EthMaxGasPriceWei() *big.Int
	SetEthGasPriceDefault(value *big.Int) error
	EthereumURL() string
	GasUpdaterBlockDelay() uint16
	GasUpdaterBlockHistorySize() uint16
	GasUpdaterTransactionPercentile() uint16
	JSONConsole() bool
	LinkContractAddress() string
	ExplorerURL() *url.URL
	ExplorerAccessKey() string
	ExplorerSecret() string
	OracleContractAddress() *common.Address
	LogLevel() LogLevel
	LogToDisk() bool
	LogSQLStatements() bool
	MinIncomingConfirmations() uint32
	MinOutgoingConfirmations() uint64
	MinimumContractPayment() *assets.Link
	MinimumRequestExpiration() uint64
	Port() uint16
	ReaperExpiration() time.Duration
	RootDir() string
	SecureCookies() bool
	SessionTimeout() time.Duration
	TLSCertPath() string
	TLSHost() string
	TLSKeyPath() string
	TLSPort() uint16
	TLSRedirect() bool
	TxAttemptLimit() uint16
	KeysDir() string
	tlsDir() string
	KeyFile() string
	CertFile() string
	CreateProductionLogger() *zap.Logger
	SessionSecret() ([]byte, error)
	SessionOptions() sessions.Options
}
