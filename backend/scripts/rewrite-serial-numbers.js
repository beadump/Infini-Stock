require('dotenv').config()
require('reflect-metadata')

const { AppDataSource } = require('../src/config/dataSource')

function generateNumericSerial(existingSerials) {
    let serial = ''
    let attempts = 0

    do {
        serial = String(Math.floor(Math.random() * 90000) + 10000)
        attempts += 1

        if (attempts > 1000) {
            throw new Error('Unable to generate a unique 5-digit serial number')
        }
    } while (existingSerials.has(serial))

    existingSerials.add(serial)
    return serial
}

async function main() {
    await AppDataSource.initialize()

    try {
        const assetRepo = AppDataSource.getRepository('Asset')

        const assetsToRewrite = await assetRepo
            .createQueryBuilder('asset')
            .where('asset.serial_number IS NOT NULL')
            .orderBy('asset.created_at', 'ASC')
            .addOrderBy('asset.id', 'ASC')
            .limit(15)
            .getMany()

        if (assetsToRewrite.length === 0) {
            console.log('No assets with serial numbers were found.')
            return
        }

        const existingSerialRows = await assetRepo
            .createQueryBuilder('asset')
            .select('asset.serial_number', 'serial_number')
            .where('asset.serial_number IS NOT NULL')
            .getRawMany()

        const existingSerials = new Set(
            existingSerialRows
                .map((row) => String(row.serial_number).trim())
                .filter(Boolean),
        )

        await AppDataSource.transaction(async (manager) => {
            const transactionRepo = manager.getRepository('Asset')

            for (const asset of assetsToRewrite) {
                const nextSerial = generateNumericSerial(existingSerials)

                await transactionRepo.update(
                    { id: asset.id },
                    { serial_number: nextSerial },
                )

                console.log(
                    `${asset.qr_code}: ${asset.serial_number || 'empty'} -> ${nextSerial}`,
                )
            }
        })

        console.log(`Updated ${assetsToRewrite.length} asset serial numbers.`)
    } finally {
        if (AppDataSource.isInitialized) {
            await AppDataSource.destroy()
        }
    }
}

main().catch((error) => {
    console.error('Failed to rewrite serial numbers:')
    console.error(error)
    process.exitCode = 1
})