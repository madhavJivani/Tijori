import prismaClient from '../utils/db.js';

const createCollectionSlug = (collectionName, userId) => {
    return collectionName + ":_:" + userId;
};

export const createCollection = async (req, res) => {
    const { collectionName } = req.body;
    if (!collectionName) {
        return res.status(400).json({ message: 'Collection name is required.' });
    }
    const userId = req.user.userId;

    const collectionSlug = createCollectionSlug(collectionName, userId);

    const existingCollection = await prismaClient.collection.findUnique({
        where: { slug: collectionSlug }
    });

    if (existingCollection) {
        return res.status(409).json({ message: 'Collection with this name already exists.' });
    }

    try {
        const newCollection = await prismaClient.collection.create({
            data: {
                collectionName: collectionName,
                ownerId: userId,
                slug: collectionSlug
            }
        });
        // Because the User : Collection is Many to One relation,
        // we don't need to manually add this collection to user's collections array

        res.status(201).json({ message: 'Collection created successfully', collection: newCollection });
    } catch (error) {
        console.error('Error creating collection:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const getAllCollections = async (req, res) => {
    const userId = req.user.userId;
    const order = req.query.order || 'desc';
    const qty = parseInt(req.query.qty) || 20;
    const page = parseInt(req.query.page) || 1;

    try {
        const collections = await prismaClient.collection.findMany({
            where: { ownerId: userId }
        });
        const sortedCollections = order === 'asc'
            ? collections.sort((a, b) => a.createdAt - b.createdAt)
            : collections.sort((a, b) => b.createdAt - a.createdAt);

        const paginatedCollections = sortedCollections.slice((page - 1) * qty, page * qty);

        res.status(200).json({
            info: {
                page: page,
                qty: qty,
                order: order,
            },
            count: {
                total: collections.length,
                current: paginatedCollections.length,
            },
            collections: paginatedCollections
        });
    } catch (error) {
        console.error('Error fetching collections:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

export const getCollection = async (req, res) => {
    const { collectionId } = req.body;
    const userId = req.user.userId;

    try {
        const collection = await prismaClient.collection.findUnique({
            where: { id: collectionId },
            select: {
                id: true,
                collectionName: true,
                createdAt: true,
                updatedAt: true,
                ownerId: true,
                files: {
                    select: { id: true, fileName: true }
                }
            },
        });

        if (!collection || collection.ownerId !== userId) {
            return res.status(404).json({ message: 'Collection not found or access denied.' });
        }

        const fileCount = collection.files?.length ?? 0;

        res.status(200).json({ collection: { ...collection }, fileCount });
    } catch (error) {
        console.error('Error fetching collection:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};


export const renameCollection = async (req, res) => {
    const { collectionId, newCollectionName } = req.query;
    const userId = req.user.userId;

    if (!collectionId || !newCollectionName) {
        return res.status(400).json({ message: 'Collection ID and new name are required.' });
    }

    try {
        const collection = await prismaClient.collection.findUnique({
            where: { id: collectionId }
        });

        if (!collection || collection.ownerId !== userId) {
            return res.status(404).json({ message: 'Collection not found or access denied.' });
        }
        const newSlug = createCollectionSlug(newCollectionName, userId);

        const existingCollection = await prismaClient.collection.findUnique({
            where: { slug: newSlug }
        });

        if (existingCollection) {
            return res.status(409).json({ message: 'Another collection with this name already exists.' });
        }

        const updatedCollection = await prismaClient.collection.update({
            where: { id: collectionId },
            data: { collectionName: newCollectionName, slug: newSlug }
        });

        res.status(200).json({ message: 'Collection renamed successfully', collection: updatedCollection });
    } catch (error) {
        console.error('Error renaming collection:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const deleteCollection = async (req, res) => {
    const { collectionId } = req.query;
    const userId = req.user.userId;

    try {
        const collection = await prismaClient.collection.findUnique({
            where: { id: collectionId }
        });

        if (!collection || collection.ownerId !== userId) {
            return res.status(404).json({ message: 'Collection not found or access denied.' });
        }

        await prismaClient.collection.delete({
            where: { id: collectionId }
        });
        // No need to delete the collection from user's collections array because of the Many to One relation

        res.status(200).json({ message: 'Collection deleted successfully' });
    } catch (error) {
        console.error('Error deleting collection:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};


// model Collection {
//   id        String   @id @default(uuid())

//   name      String

//   owner     User     @relation(fields: [ownerId], references: [id], onDelete: Cascade)
//   ownerId   String
//   files     File[]
//   fileIds   String[] @default([])

//   createdAt DateTime @default(now())
//   updatedAt DateTime @updatedAt

//   @@index([ownerId])
// }
