import nvision from '@nipacloud/nvision';

const objectDetectionService = nvision.objectDetection({
    apiKey: process.env.NEXT_PUBLIC_NIPA_KEY
});

const handleDetectObject = (encodedImage: string) => {
    return objectDetectionService.predict({
        rawData: encodedImage
    })
}

import { NextApiRequest, NextApiResponse } from 'next'

const handler = async (_req: NextApiRequest, res: NextApiResponse) => {
    try {
        if (!_req.body) {
            throw new Error('Cannot find encodedImage')
        }
        await handleDetectObject(_req.body.encodedImage).then(data => res.status(200).json(data));
    } catch (err) {
        res.status(500).json({ statusCode: 500, message: err.message })
    }
}

export default handler