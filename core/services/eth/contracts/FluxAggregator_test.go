package contracts_test

import (
	"encoding"
	"math/big"
	"testing"

	"chainlink/core/eth"
	"chainlink/core/internal/cltest"
	"chainlink/core/internal/mocks"
	"chainlink/core/services/eth/contracts"
	"chainlink/core/utils"

	"github.com/ethereum/go-ethereum/common"
	"github.com/ethereum/go-ethereum/common/hexutil"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"
	"github.com/stretchr/testify/require"
)

func mustEVMBigInt(t *testing.T, val *big.Int) []byte {
	ret, err := utils.EVMWordBigInt(val)
	require.NoError(t, err, "evm BigInt serialization")
	return ret
}

func makeRoundStateReturnData(roundID uint64, eligible bool, answer, timesOutAt, availableFunds, paymentAmount uint64) string {
	var data []byte
	data = append(data, utils.EVMWordUint64(roundID)...)
	if eligible {
		data = append(data, utils.EVMWordUint64(1)...)
	} else {
		data = append(data, utils.EVMWordUint64(0)...)
	}
	data = append(data, utils.EVMWordUint64(answer)...)
	data = append(data, utils.EVMWordUint64(timesOutAt)...)
	data = append(data, utils.EVMWordUint64(availableFunds)...)
	data = append(data, utils.EVMWordUint64(paymentAmount)...)
	return hexutil.Encode(data)
}

func TestFluxAggregatorClient_RoundState(t *testing.T) {
	aggregatorAddress := cltest.NewAddress()

	const aggregatorRoundState = "c410579e"
	aggregatorRoundStateSelector := eth.HexToFunctionSelector(aggregatorRoundState)

	selector := make([]byte, 16)
	copy(selector, aggregatorRoundStateSelector.Bytes())
	nodeAddr := cltest.NewAddress()
	expectedCallArgs := eth.CallArgs{
		To:   aggregatorAddress,
		Data: append(selector, nodeAddr[:]...),
	}

	rawReturnData := `0x00000000000000000000000000000000000000000000000000000000000000030000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000000f000000000000000000000000000000000000000000000000000000000000000e000000000000000000000000000000000000000000000000000000000000000a0000000000000000000000000000000000000000000000000000000000000100`

	tests := []struct {
		name                   string
		response               string
		expectedRoundID        uint32
		expectedEligible       bool
		expectedAnswer         *big.Int
		expectedTimesOutAt     uint64
		expectedAvailableFunds uint64
		expectedPaymentAmount  uint64
	}{
		{"zero, false", makeRoundStateReturnData(0, false, 0, 0, 0, 0), 0, false, big.NewInt(0), 0, 0, 0},
		{"non-zero, false", makeRoundStateReturnData(1, false, 23, 1234, 36, 72), 1, false, big.NewInt(23), 1234, 36, 72},
		{"zero, true", makeRoundStateReturnData(0, true, 0, 0, 0, 0), 0, true, big.NewInt(0), 0, 0, 0},
		{"non-zero true", makeRoundStateReturnData(12, true, 91, 9876, 45, 999), 12, true, big.NewInt(91), 9876, 45, 999},
		{"real call data", rawReturnData, 3, true, big.NewInt(15), 14, 10, 256},
	}

	for _, test := range tests {
		t.Run(test.name, func(t *testing.T) {
			ethClient := new(mocks.Client)

			ethClient.On("Call", mock.Anything, "eth_call", expectedCallArgs, "latest").Return(nil).
				Run(func(args mock.Arguments) {
					res := args.Get(0)
					err := res.(encoding.TextUnmarshaler).UnmarshalText([]byte(test.response))
					require.NoError(t, err)
				})

			fa, err := contracts.NewFluxAggregator(aggregatorAddress, ethClient, nil)
			require.NoError(t, err)

			roundState, err := fa.RoundState(nodeAddr)
			require.NoError(t, err)
			assert.Equal(t, test.expectedRoundID, roundState.ReportableRoundID)
			assert.Equal(t, test.expectedEligible, roundState.EligibleToSubmit)
			assert.True(t, test.expectedAnswer.Cmp(roundState.LatestAnswer) == 0)
			assert.Equal(t, test.expectedTimesOutAt, roundState.TimesOutAt)
			assert.Equal(t, test.expectedAvailableFunds, roundState.AvailableFunds.Uint64())
			assert.Equal(t, test.expectedPaymentAmount, roundState.PaymentAmount.Uint64())
			ethClient.AssertExpectations(t)
		})
	}
}

func TestFluxAggregatorClient_DecodesLogs(t *testing.T) {
	fa, err := contracts.NewFluxAggregator(common.Address{}, nil, nil)
	require.NoError(t, err)

	newRoundLogRaw := cltest.LogFromFixture(t, "../../testdata/new_round_log.json")
	var newRoundLog contracts.LogNewRound
	err = fa.UnpackLog(&newRoundLog, "NewRound", newRoundLogRaw)
	require.NoError(t, err)
	require.Equal(t, int64(1), newRoundLog.RoundId.Int64())
	require.Equal(t, common.HexToAddress("f17f52151ebef6c7334fad080c5704d77216b732"), newRoundLog.StartedBy)
	require.Equal(t, int64(15), newRoundLog.StartedAt.Int64())

	type BadLogNewRound struct {
		RoundID   *big.Int
		StartedBy common.Address
		StartedAt *big.Int
	}
	var badNewRoundLog BadLogNewRound
	err = fa.UnpackLog(&badNewRoundLog, "NewRound", newRoundLogRaw)
	require.Error(t, err)

	answerUpdatedLogRaw := cltest.LogFromFixture(t, "../../testdata/answer_updated_log.json")
	var answerUpdatedLog contracts.LogAnswerUpdated
	err = fa.UnpackLog(&answerUpdatedLog, "AnswerUpdated", answerUpdatedLogRaw)
	require.NoError(t, err)
	require.Equal(t, int64(1), answerUpdatedLog.Current.Int64())
	require.Equal(t, int64(2), answerUpdatedLog.RoundId.Int64())
	require.Equal(t, int64(3), answerUpdatedLog.Timestamp.Int64())

	type BadLogAnswerUpdated struct {
		Current   *big.Int
		RoundID   *big.Int
		Timestamp *big.Int
	}
	var badAnswerUpdatedLog BadLogAnswerUpdated
	err = fa.UnpackLog(&badAnswerUpdatedLog, "AnswerUpdated", answerUpdatedLogRaw)
	require.Error(t, err)
}
