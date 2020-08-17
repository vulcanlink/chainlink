import {
  Column,
  Entity,
  EntityManager,
  getConnection,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm'
import { ChainlinkNode } from './ChainlinkNode'
import { TaskRun } from './TaskRun'

@Entity()
export class JobRun {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column()
  chainlinkNodeId: number

  @Column()
  runId: string

  @Column()
  jobId: string

  @Column()
  status: string

  @Column()
  type: string

  @Column({ nullable: true })
  requestId: string

  @Column({ nullable: true })
  txHash: string

  @Column({ nullable: true })
  requester: string

  @Column({ nullable: true })
  error: string

  @Column()
  createdAt: Date

  @Column({ nullable: true })
  finishedAt: Date

  @OneToMany(
    () => TaskRun,
    taskRun => taskRun.jobRun,
    {
      eager: true,
      onDelete: 'CASCADE',
    },
  )
  taskRuns: Array<TaskRun>

  @ManyToOne(
    () => ChainlinkNode,
    ChainlinkNode => ChainlinkNode.jobRuns,
    {
      eager: true,
    },
  )
  chainlinkNode: ChainlinkNode
}

export const fromJSONObject = (json: any): JobRun => {
  const jr = new JobRun()
  jr.runId = json.runId
  jr.jobId = json.jobId
  jr.status = json.status
  jr.createdAt = new Date(json.createdAt)
  jr.finishedAt = json.finishedAt && new Date(json.finishedAt)

  jr.type = json.initiator.type
  jr.requestId = json.initiator.requestId
  jr.txHash = json.initiator.txHash
  jr.requester = json.initiator.requester

  jr.taskRuns = json.tasks.map((trstr: any, index: number) => {
    const tr = new TaskRun()
    tr.index = index
    tr.type = trstr.type
    tr.status = trstr.status
    tr.error = trstr.error
    tr.minimumConfirmations = trstr.minimumConfirmations
    tr.confirmations = trstr.confirmations

    if (trstr.result) {
      const { result } = trstr
      tr.transactionHash = result.transactionHash
      tr.transactionStatus = result.transactionStatus
      tr.timestamp = result.timestamp && new Date(result.timestamp)
      tr.blockHeight =
        result.blockHeight && BigInt(result.blockHeight).toString(10)
      tr.blockHash = result.blockHash
    }

    return tr
  })

  return jr
}

export const fromString = (str: string): JobRun => {
  const json = JSON.parse(str)
  return fromJSONObject(json)
}

export const saveJobRunTree = async (jobRun: JobRun) => {
  await getConnection().transaction(async (manager: EntityManager) => {
    let builder = manager.createQueryBuilder()

    await builder
      .insert()
      .into(JobRun)
      .values(jobRun)
      .onConflict(
        `("runId", "chainlinkNodeId") DO UPDATE SET
        "status" = :status
        ,"error" = :error
        ,"finishedAt" = :finishedAt
      `,
      )
      .setParameter('status', jobRun.status)
      .setParameter('error', jobRun.error)
      .setParameter('finishedAt', jobRun.finishedAt)
      .execute()

    await Promise.all(
      jobRun.taskRuns.map(tr => {
        // new builder since execute stmnt above seems to mutate.
        builder = manager.createQueryBuilder()
        tr.jobRun = jobRun

        return builder
          .insert()
          .into(TaskRun)
          .values(tr)
          .onConflict(
            `("index", "jobRunId") DO UPDATE SET
              "status" = :status
              ,"error" = :error
              ,"transactionHash" = :transactionHash
              ,"transactionStatus" = :transactionStatus
              ,"timestamp" = :timestamp
              ,"blockHeight" = :blockHeight
              ,"blockHash" = :blockHash
              ,"confirmations_new1562419039813" = :confirmations
              ,"minimumConfirmations_new1562419039813" = :minimumConfirmations
              `,
          )
          .setParameter('status', tr.status)
          .setParameter('error', tr.error)
          .setParameter('transactionHash', tr.transactionHash)
          .setParameter('transactionStatus', tr.transactionStatus)
          .setParameter('confirmations', tr.confirmations)
          .setParameter('minimumConfirmations', tr.minimumConfirmations)
          .setParameter('timestamp', tr.timestamp)
          .setParameter('blockHeight', tr.blockHeight)
          .setParameter('blockHash', tr.blockHash)
          .execute()
      }),
    )
  })
}
