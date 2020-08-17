import {
  Column,
  Connection,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  UpdateResult,
} from 'typeorm'
import { ChainlinkNode } from './ChainlinkNode'

@Entity()
export class Session {
  @Column()
  public chainlinkNodeId: number

  @Column({ nullable: true })
  public finishedAt: Date

  @PrimaryGeneratedColumn('uuid')
  public id: string

  @CreateDateColumn()
  // @ts-ignore
  private createdAt: Date

  @UpdateDateColumn()
  // @ts-ignore
  private updatedAt: Date
}

export async function createSession(
  db: Connection,
  node: ChainlinkNode,
): Promise<Session> {
  await db.manager
    .createQueryBuilder()
    .update(Session)
    .set({ finishedAt: () => 'now()' })
    .where({ chainlinkNodeId: node.id, finishedAt: null })
    .execute()
  const session = new Session()
  session.chainlinkNodeId = node.id
  return db.manager.save(session)
}

export async function retireSessions(db: Connection): Promise<UpdateResult> {
  return db.manager
    .createQueryBuilder()
    .update(Session)
    .set({ finishedAt: new Date() })
    .where({ finishedAt: null })
    .execute()
}

export async function closeSession(
  db: Connection,
  session: Session,
): Promise<UpdateResult> {
  return db.manager
    .createQueryBuilder()
    .update(Session)
    .set({ finishedAt: () => 'now()' })
    .where({ sessionId: session.id })
    .execute()
}
