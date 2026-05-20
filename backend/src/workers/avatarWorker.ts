import { Queue, Worker } from 'bullmq'
import { redis } from '../config/redis'
import prisma from '../config/db'

export const avatarQueue = new Queue('avatar-processing', { connection: redis })

// 5 pre-built MetaHumans — rotate assignment
const METAHUMAN_POOL = ['BP_Avatar_01','BP_Avatar_02','BP_Avatar_03','BP_Avatar_04','BP_Avatar_05']
let poolIndex = 0

new Worker('avatar-processing', async (job) => {
  const { avatarId } = job.data
  console.log(`🔄 Processing avatar job: ${avatarId}`)

  await prisma.avatar.update({ where: { id: avatarId }, data: { status: 'PROCESSING' } })

  // MOCK: simulate 3D generation (replace with real pipeline call)
  await new Promise(r => setTimeout(r, 3000 + Math.random() * 2000))

  const metahuman_id = METAHUMAN_POOL[poolIndex % METAHUMAN_POOL.length]
  poolIndex++

  await prisma.avatar.update({
    where: { id: avatarId },
    data: { status: 'READY', metahuman_id }
  })

  console.log(`✅ Avatar ${avatarId} ready → ${metahuman_id}`)
}, { connection: redis })
