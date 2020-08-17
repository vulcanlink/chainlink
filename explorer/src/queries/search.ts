import { Connection, SelectQueryBuilder } from 'typeorm'
import { JobRun } from '../entity/JobRun'
import { PaginationParams } from '../utils/pagination'

export interface SearchParams extends PaginationParams {
  searchQuery?: string
}

const normalizeSearchToken = (id: string): string => {
  const MAX_LEN_UNPREFIXED_REQUESTER_HASH = 40
  const MAX_LEN_UNPREFIXED_REQUEST_TX_HASH = 64
  if (
    id &&
    id.substr(0, 2) !== '0x' &&
    (id.length === MAX_LEN_UNPREFIXED_REQUESTER_HASH ||
      id.length === MAX_LEN_UNPREFIXED_REQUEST_TX_HASH)
  )
    return `0x${id}`
  return id
}

const searchBuilder = (
  db: Connection,
  params: SearchParams,
): SelectQueryBuilder<JobRun> => {
  let query = db.getRepository(JobRun).createQueryBuilder('job_run')

  if (params.searchQuery != null) {
    const searchTokens = params.searchQuery.split(/\s+/)
    const normalizedSearchTokens = searchTokens.map(normalizeSearchToken)
    query = query
      .where('job_run.runId IN(:...searchTokens)', { searchTokens })
      .orWhere('job_run.jobId IN(:...searchTokens)', { searchTokens })
      .orWhere('job_run.requester IN(:...normalizedSearchTokens)', {
        normalizedSearchTokens,
      })
      .orWhere('job_run.requestId IN(:...normalizedSearchTokens)', {
        normalizedSearchTokens,
      })
      .orWhere('job_run.txHash IN(:...normalizedSearchTokens)', {
        normalizedSearchTokens,
      })
  } else {
    query = query.where('true = false')
  }

  if (params.limit != null) {
    query = query.limit(params.limit)
  }

  if (params.page !== undefined) {
    const offset = (params.page - 1) * params.limit
    query = query.offset(offset)
  }

  return query
}

export const search = async (
  db: Connection,
  params: SearchParams,
): Promise<JobRun[]> => {
  return searchBuilder(db, params)
    .leftJoinAndSelect('job_run.chainlinkNode', 'chainlink_node')
    .orderBy('job_run.createdAt', 'DESC')
    .getMany()
}

export const count = async (
  db: Connection,
  params: SearchParams,
): Promise<number> => {
  const result = await searchBuilder(db, params)
    .select('COUNT(*)', 'count')
    .getRawOne()

  return parseInt(result['count'], 10)
}
