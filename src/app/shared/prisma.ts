import 'dotenv/config'
// import { PrismaClient } from '../generated/prisma/client' // adjust path to your output
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '@prisma/client'
// import { PrismaClient } from '../../../prisma/generated/prisma'

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
})

export const prisma = new PrismaClient({ adapter })













// import { PrismaClient } from "@prisma/client";

// const prisma = new PrismaClient({
//     log: [
//         {
//             emit: 'event',
//             level: 'query',
//         },
//         {
//             emit: 'event',
//             level: 'error',
//         },
//         {
//             emit: 'event',
//             level: 'info',
//         },
//         {
//             emit: 'event',
//             level: 'warn',
//         },
//     ],
// })

// prisma.$on('query', (e) => {
//     // console.log("-------------------------------------------")
//     // console.log('Query: ' + e.query);
//     // console.log("-------------------------------------------")
//     // console.log('Params: ' + e.params)
//     // console.log("-------------------------------------------")
//     // console.log('Duration: ' + e.duration + 'ms')
//     // console.log("-------------------------------------------")
// })


// export default prisma;